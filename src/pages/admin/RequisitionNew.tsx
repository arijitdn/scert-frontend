import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { BookOpen, Send, Loader2 } from "lucide-react";
import { DatabaseService } from "@/lib/database";
import {
  RequisitionWithDetails,
  StockWithBook,
  School,
  Book,
} from "@/types/database";

// Types for our combined data structures
interface WorkOrderItem {
  bookId: string;
  className: string;
  subject: string;
  medium: string;
  bookName: string;
  currentStock: number;
  totalRequisition: number;
  additionalRequirement: number;
}

interface DistrictRequisitionData {
  district: string;
  districtCode: string;
  schools: Array<{
    schoolId: string;
    schoolName: string;
    requests: Array<{
      reqId: string;
      className: string;
      subject: string;
      book: string;
      requested: number;
      received: number;
      status: string;
      remarksByBlock?: string;
      remarksByDistrict?: string;
    }>;
  }>;
}

// District mapping for Tripura
const DISTRICT_MAP: { [key: string]: string } = {
  "1601": "West Tripura",
  "1602": "South Tripura",
  "1603": "North Tripura",
  "1604": "Dhalai",
  "1605": "Khowai",
  "1606": "Gomati",
  "1607": "Sepahijala",
  "1608": "Unakoti",
};

export default function Requisition() {
  const [loading, setLoading] = useState(true);
  const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([]);
  const [districtRequests, setDistrictRequests] = useState<
    DistrictRequisitionData[]
  >([]);
  const [batchInputs, setBatchInputs] = useState<{ [key: string]: string }>({});
  const [stateStock, setStateStock] = useState<StockWithBook[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch all requisitions with book details
      const requisitions = await DatabaseService.getAllRequisitions();

      // Fetch state stock
      const stock = await DatabaseService.getStateStock();
      setStateStock(stock);

      // Fetch schools for mapping school IDs to names and districts
      const schoolIds = [...new Set(requisitions.map((req) => req.schoolId))];
      const schools = await DatabaseService.getSchoolsByIds(schoolIds);

      // Process work order data - combine requisitions by book
      const bookRequisitions: {
        [bookId: string]: {
          book: Book;
          totalQuantity: number;
          totalReceived: number;
        };
      } = {};

      requisitions.forEach((req) => {
        if (req.book) {
          const bookId = req.bookId;
          if (!bookRequisitions[bookId]) {
            bookRequisitions[bookId] = {
              book: req.book,
              totalQuantity: 0,
              totalReceived: 0,
            };
          }
          bookRequisitions[bookId].totalQuantity += req.quantity;
          bookRequisitions[bookId].totalReceived += req.received;
        }
      });

      // Create work order items
      const workItems: WorkOrderItem[] = Object.entries(bookRequisitions).map(
        ([bookId, data]) => {
          const stockItem = stock.find((s) => s.bookId === bookId);
          const currentStock = stockItem?.quantity || 0;

          return {
            bookId,
            className: data.book.class,
            subject: data.book.subject,
            medium: "English", // Default medium, can be made dynamic
            bookName: data.book.title,
            currentStock,
            totalRequisition: data.totalQuantity,
            additionalRequirement: 0,
          };
        },
      );

      setWorkOrderItems(workItems);

      // Process district-wise data
      const districtData: { [districtCode: string]: DistrictRequisitionData } =
        {};

      requisitions.forEach((req) => {
        const school = schools.find((s) => s.udise === req.schoolId);
        if (school && req.book) {
          const districtCode = school.district_code;
          const districtName =
            DISTRICT_MAP[districtCode] || `District ${districtCode}`;

          if (!districtData[districtCode]) {
            districtData[districtCode] = {
              district: districtName,
              districtCode,
              schools: [],
            };
          }

          let schoolData = districtData[districtCode].schools.find(
            (s) => s.schoolId === school.udise,
          );
          if (!schoolData) {
            schoolData = {
              schoolId: school.udise,
              schoolName: school.name,
              requests: [],
            };
            districtData[districtCode].schools.push(schoolData);
          }

          schoolData.requests.push({
            reqId: req.reqId,
            className: req.book.class,
            subject: req.book.subject,
            book: req.book.title,
            requested: req.quantity,
            received: req.received,
            status: req.status,
            remarksByBlock: req.remarksByBlock,
            remarksByDistrict: req.remarksByDistrict,
          });
        }
      });

      setDistrictRequests(Object.values(districtData));
    } catch (error) {
      console.error("Error loading requisition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdditionalRequirementChange = (index: number, value: string) => {
    const percentage = parseInt(value, 10);
    setWorkOrderItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            additionalRequirement: percentage,
          };
        }
        return item;
      }),
    );
  };

  const handleBatchInput = (key: string, value: string) => {
    setBatchInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSendBatch = async (
    districtIdx: number,
    schoolIdx: number,
    reqIdx: number,
  ) => {
    const key = `${districtIdx}-${schoolIdx}-${reqIdx}`;
    const quantity = parseInt(batchInputs[key] || "0", 10);

    if (quantity <= 0) return;

    const district = districtRequests[districtIdx];
    const school = district.schools[schoolIdx];
    const request = school.requests[reqIdx];

    const maxSend = Math.min(
      request.requested - request.received,
      getAvailableStock(request),
    );
    const toSend = Math.min(quantity, maxSend);

    if (toSend <= 0) return;

    try {
      // Update the requisition in database
      const requisitions = await DatabaseService.getAllRequisitions();
      const reqToUpdate = requisitions.find((r) => r.reqId === request.reqId);

      if (reqToUpdate) {
        await DatabaseService.updateRequisition(reqToUpdate.id, {
          received: reqToUpdate.received + toSend,
          status:
            reqToUpdate.received + toSend >= reqToUpdate.quantity
              ? "COMPLETED"
              : "APPROVED",
        });

        // Update state stock
        const stockItem = stateStock.find(
          (s) => s.book?.title === request.book,
        );
        if (stockItem) {
          await DatabaseService.updateStockQuantity(
            stockItem.bookId,
            "STATE",
            stockItem.userId,
            stockItem.quantity - toSend,
          );
        }

        // Reload data to reflect changes
        await loadData();

        // Clear the input
        setBatchInputs((prev) => ({ ...prev, [key]: "" }));
      }
    } catch (error) {
      console.error("Error sending batch:", error);
    }
  };

  const getAvailableStock = (request: { book: string }) => {
    const stockItem = stateStock.find((s) => s.book?.title === request.book);
    return stockItem?.quantity || 0;
  };

  const handleDownloadPdf = () => {
    const input = document.getElementById("work-order-table");
    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save("work-order.pdf");
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Requisition Management"
        description="Approve and fulfill book requests from districts"
        adminLevel="STATE ADMIN"
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading requisition data...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Requisition Management"
      description="Approve and fulfill book requests from districts"
      adminLevel="STATE ADMIN"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">Work Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto" id="work-order-table">
              <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
                <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                  <tr>
                    <th className="px-4 py-2 border-b text-left">Class</th>
                    <th className="px-4 py-2 border-b text-left">Subject</th>
                    <th className="px-4 py-2 border-b text-left">Medium</th>
                    <th className="px-4 py-2 border-b text-left">Book Name</th>
                    <th className="px-4 py-2 border-b text-left">
                      Current Stock
                    </th>
                    <th className="px-4 py-2 border-b text-left">
                      Total Requisition
                    </th>
                    <th className="px-4 py-2 border-b text-left">
                      Calculated Requisition
                    </th>
                    <th className="px-4 py-2 border-b text-left">
                      Additional Requirement
                    </th>
                    <th className="px-4 py-2 border-b text-left">
                      Actual Requisition
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workOrderItems.map((item, index) => {
                    const calculatedRequisition = Math.max(
                      0,
                      item.totalRequisition - item.currentStock,
                    );
                    const actualRequisition =
                      calculatedRequisition +
                      Math.round(
                        calculatedRequisition *
                          (item.additionalRequirement / 100),
                      );

                    return (
                      <tr
                        key={item.bookId}
                        className={
                          index % 2 === 0
                            ? "bg-white hover:bg-blue-50 transition"
                            : "bg-blue-50 hover:bg-blue-100 transition"
                        }
                      >
                        <td className="px-4 py-2 border-b">{item.className}</td>
                        <td className="px-4 py-2 border-b">{item.subject}</td>
                        <td className="px-4 py-2 border-b">{item.medium}</td>
                        <td className="px-4 py-2 border-b">{item.bookName}</td>
                        <td className="px-4 py-2 border-b">
                          {item.currentStock}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {item.totalRequisition}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {calculatedRequisition}
                        </td>
                        <td className="px-4 py-2 border-b">
                          <div className="flex items-center gap-2">
                            <Select
                              onValueChange={(value) =>
                                handleAdditionalRequirementChange(index, value)
                              }
                              value={item.additionalRequirement.toString()}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select %" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(16)].map((_, i) => (
                                  <SelectItem key={i} value={`${i}`}>
                                    {i}%
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="px-4 py-2 border-b font-semibold">
                          {actualRequisition}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-4">
          <Button onClick={handleDownloadPdf}>
            Save and Download Work Order (PDF)
          </Button>
        </div>

        {/* District-wise Requisitions */}
        {districtRequests.map((district, districtIdx) => (
          <Card key={district.districtCode} className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">
                {district.district}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {district.schools.map((school, schoolIdx) => (
                <div key={school.schoolId} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    {school.schoolName} (UDISE: {school.schoolId})
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
                      <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                        <tr>
                          <th className="px-4 py-2 border-b text-left">
                            Req ID
                          </th>
                          <th className="px-4 py-2 border-b text-left">
                            Class
                          </th>
                          <th className="px-4 py-2 border-b text-left">
                            Subject
                          </th>
                          <th className="px-4 py-2 border-b text-left">
                            Book Name
                          </th>
                          <th className="px-4 py-2 border-b text-left">
                            Requested
                          </th>
                          <th className="px-4 py-2 border-b text-left">
                            Available Stock
                          </th>
                          <th className="px-4 py-2 border-b text-left">Sent</th>
                          <th className="px-4 py-2 border-b text-left">
                            Status
                          </th>
                          <th className="px-4 py-2 border-b text-left">
                            Send Installment
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {school.requests.map((request, reqIdx) => {
                          const key = `${districtIdx}-${schoolIdx}-${reqIdx}`;
                          const availableStock = getAvailableStock(request);
                          const maxSend = Math.min(
                            request.requested - request.received,
                            availableStock,
                          );
                          const percent = Math.round(
                            (request.received / request.requested) * 100,
                          );
                          const fulfilled =
                            request.received >= request.requested;

                          return (
                            <tr
                              key={request.reqId}
                              className={
                                reqIdx % 2 === 0
                                  ? "bg-white hover:bg-blue-50 transition"
                                  : "bg-blue-50 hover:bg-blue-100 transition"
                              }
                            >
                              <td className="px-4 py-2 border-b">
                                {request.reqId}
                              </td>
                              <td className="px-4 py-2 border-b">
                                {request.className}
                              </td>
                              <td className="px-4 py-2 border-b">
                                {request.subject}
                              </td>
                              <td className="px-4 py-2 border-b">
                                {request.book}
                              </td>
                              <td className="px-4 py-2 border-b">
                                {request.requested}
                              </td>
                              <td className="px-4 py-2 border-b">
                                {availableStock}
                              </td>
                              <td className="px-4 py-2 border-b">
                                {request.received}
                              </td>
                              <td className="px-4 py-2 border-b w-48">
                                <div className="flex flex-col gap-1">
                                  <Progress value={percent} className="h-2" />
                                  <span className="text-xs text-gray-600">
                                    {percent}% sent ({request.status})
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2 border-b">
                                {!fulfilled && availableStock > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min={1}
                                      max={maxSend}
                                      value={batchInputs[key] || ""}
                                      onChange={(e) =>
                                        handleBatchInput(key, e.target.value)
                                      }
                                      className="w-20 h-8 text-sm"
                                      placeholder={`Max ${maxSend}`}
                                    />
                                    <Button
                                      size="sm"
                                      className="bg-blue-200 text-blue-900 hover:bg-blue-300"
                                      onClick={() =>
                                        handleSendBatch(
                                          districtIdx,
                                          schoolIdx,
                                          reqIdx,
                                        )
                                      }
                                      disabled={
                                        !batchInputs[key] ||
                                        parseInt(batchInputs[key], 10) <= 0
                                      }
                                    >
                                      <Send className="h-4 w-4 mr-1" /> Send
                                    </Button>
                                  </div>
                                )}
                                {fulfilled && (
                                  <span className="text-xs text-green-700 font-semibold">
                                    Complete
                                  </span>
                                )}
                                {!fulfilled && availableStock === 0 && (
                                  <span className="text-xs text-red-700 font-semibold">
                                    Out of Stock
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {districtRequests.length === 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold">No Requisitions Found</p>
                <p>There are currently no book requisitions to process.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
