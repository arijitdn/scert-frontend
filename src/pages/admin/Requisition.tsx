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
import { BookOpen, Send, Loader2, AlertCircle } from "lucide-react";
import { requisitionsAPI, stockAPI, schoolsAPI, booksAPI } from "@/lib/api";
import {
  getDistrictName,
  getBlockName,
  calculateFulfillmentPercent,
  getStatusBadgeClass,
  BOOK_MEDIUMS,
} from "@/lib/constants";
import type {
  Book,
  Requisition,
  School,
  Stock,
  StockWithBook,
} from "@/types/database";

interface RequisitionWithDetails extends Requisition {
  school?: School;
  bookDetails?: Book[];
}

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

// District mapping for Tripura - moved to constants
const DISTRICT_MAP = {
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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([]);
  const [districtRequests, setDistrictRequests] = useState<
    DistrictRequisitionData[]
  >([]);
  const [batchInputs, setBatchInputs] = useState<{ [key: string]: string }>({});
  const [stateStock, setStateStock] = useState<StockWithBook[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all requisitions
      const requisitionsResponse = await requisitionsAPI.getAll();
      const requisitions: Requisition[] = requisitionsResponse.data.data;

      // Fetch state stock (stock without specific school)
      const stockResponse = await stockAPI.getStateStock();
      const stock: StockWithBook[] = stockResponse.data.data;
      setStateStock(stock);

      // Fetch all schools for mapping
      const schoolsResponse = await schoolsAPI.getAll();
      const schools: School[] = schoolsResponse.data.data;

      // Fetch all books for mapping
      const booksResponse = await booksAPI.getAll();
      const books: Book[] = booksResponse.data.data;

      // Process work order data - combine requisitions by book
      const bookRequisitions: {
        [bookId: string]: {
          book: Book;
          totalQuantity: number;
          totalReceived: number;
        };
      } = {};

      requisitions.forEach((req) => {
        const book = books.find((b) => b.id === req.bookId);
        if (book) {
          const bookId = req.bookId;
          if (!bookRequisitions[bookId]) {
            bookRequisitions[bookId] = {
              book: book,
              totalQuantity: 0,
              totalReceived: 0,
            };
          }
          bookRequisitions[bookId].totalQuantity += req.quantity;
          bookRequisitions[bookId].totalReceived += req.received || 0;
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
            medium: BOOK_MEDIUMS[0], // Default to first medium, could be made dynamic
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
        // The backend should include the school relationship
        const school = req.school || schools.find((s) => s.id === req.schoolId);
        if (school) {
          const districtCode = school.district_code;
          const districtName = getDistrictName(districtCode);

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

          const book = books.find((b) => b.id === req.bookId);
          if (book) {
            schoolData!.requests.push({
              reqId: req.id,
              className: book.class,
              subject: book.subject,
              book: book.title,
              requested: req.quantity,
              received: req.received || 0,
              status: req.status,
              remarksByBlock: req.remarksByBlock || "",
              remarksByDistrict: req.remarksByDistrict || "",
            });
          }
        }
      });

      setDistrictRequests(Object.values(districtData));
    } catch (error) {
      console.error("Error loading requisition data:", error);
      setError("Failed to load requisition data. Please try again.");
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
      setUpdating(key);

      // For now, we'll update the requisition status
      // Note: The tracking of "received" quantities would need to be implemented
      // in the backend schema if detailed tracking is required

      // Update requisition status to COMPLETED if needed
      const newStatus =
        quantity >= request.requested ? "COMPLETED" : "APPROVED";

      await requisitionsAPI.update(request.reqId, {
        status: newStatus,
        received: request.received + toSend,
      });

      // Update state stock
      const stockItem = stateStock.find((s) => s.book?.title === request.book);
      if (stockItem) {
        await stockAPI.update(stockItem.id, {
          quantity: stockItem.quantity - toSend,
        });
      }

      // Reload data to reflect changes
      await loadData();

      // Clear the input
      setBatchInputs((prev) => ({ ...prev, [key]: "" }));

      // Show success message
      setSuccessMessage(
        `Successfully sent ${toSend} books to ${school.schoolName}`,
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error sending batch:", error);
      setError("Failed to send books. Please try again.");
    } finally {
      setUpdating(null);
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

  if (error) {
    return (
      <AdminLayout
        title="Requisition Management"
        description="Approve and fulfill book requests from districts"
        adminLevel="STATE ADMIN"
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Error Loading Data</p>
              <p className="text-sm">{error}</p>
              <Button variant="outline" onClick={loadData} className="mt-2">
                Try Again
              </Button>
            </div>
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
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}
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
                          const percent = calculateFulfillmentPercent(
                            request.received,
                            request.requested,
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
                                        parseInt(batchInputs[key], 10) <= 0 ||
                                        updating === key
                                      }
                                    >
                                      {updating === key ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      ) : (
                                        <Send className="h-4 w-4 mr-1" />
                                      )}
                                      {updating === key ? "Sending..." : "Send"}
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
