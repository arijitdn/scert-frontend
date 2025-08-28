import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  BookOpen,
  Send,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import { requisitionsAPI, schoolsAPI, booksAPI, stockAPI } from "@/lib/api";
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

interface DistrictRequisitionSummary {
  district: string;
  districtCode: string;
  totalBooks: number;
  totalQuantity: number;
  totalReceived: number;
  pendingQuantity: number;
  books: Array<{
    bookId: string;
    bookName: string;
    className: string;
    subject: string;
    totalRequested: number;
    totalReceived: number;
  }>;
}

interface DetailedDistrictData {
  district: string;
  districtCode: string;
  blocks: Array<{
    blockId: string;
    blockName: string;
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
    DistrictRequisitionSummary[]
  >([]);
  const [detailedData, setDetailedData] = useState<{
    [districtCode: string]: DetailedDistrictData;
  }>({});
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(
    new Set(),
  );
  const [batchInputs, setBatchInputs] = useState<{ [key: string]: string }>({});
  const [stateStock, setStateStock] = useState<StockWithBook[]>([]);
  const [backlogStock, setBacklogStock] = useState<any[]>([]);
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

      // Fetch state stock and backlog stock
      const stockResponse = await stockAPI.getStateStock();
      const stock: StockWithBook[] = stockResponse.data.data;
      setStateStock(stock);

      const backlogResponse = await stockAPI.getAll();
      const backlog = backlogResponse.data.data;
      setBacklogStock(backlog);

      // Fetch all schools and books for mapping
      const schoolsResponse = await schoolsAPI.getAll();
      const schools: School[] = schoolsResponse.data.data;

      const booksResponse = await booksAPI.getAll();
      const books: Book[] = booksResponse.data.data;

      // Filter only district approved requisitions (state processes approved ones)
      const approvedRequisitions = requisitions.filter(
        (req) => req.status === "APPROVED",
      );

      // Process work order data - combine requisitions by book
      const bookRequisitions: {
        [bookId: string]: {
          book: Book;
          totalQuantity: number;
          totalReceived: number;
        };
      } = {};

      approvedRequisitions.forEach((req) => {
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
          const backlogItem = backlog.find((b: any) => b.bookId === bookId);
          const currentStock =
            (stockItem?.quantity || 0) + (backlogItem?.quantity || 0);

          return {
            bookId,
            className: data.book.class,
            subject: data.book.subject,
            medium: BOOK_MEDIUMS[0],
            bookName: data.book.title,
            currentStock,
            totalRequisition: data.totalQuantity,
            additionalRequirement: 0,
          };
        },
      );

      setWorkOrderItems(workItems);

      // Process district-wise summary data
      const districtSummary: {
        [districtCode: string]: DistrictRequisitionSummary;
      } = {};
      const detailedDistrictData: {
        [districtCode: string]: DetailedDistrictData;
      } = {};

      approvedRequisitions.forEach((req) => {
        const school = req.school || schools.find((s) => s.id === req.schoolId);
        if (school) {
          const districtCode = school.district_code;
          const districtName = getDistrictName(districtCode);
          const blockId = school.block_code;
          const blockName = getBlockName(blockId, districtCode);

          // Summary data
          if (!districtSummary[districtCode]) {
            districtSummary[districtCode] = {
              district: districtName,
              districtCode,
              totalBooks: 0,
              totalQuantity: 0,
              totalReceived: 0,
              pendingQuantity: 0,
              books: [],
            };
          }

          // Detailed data
          if (!detailedDistrictData[districtCode]) {
            detailedDistrictData[districtCode] = {
              district: districtName,
              districtCode,
              blocks: [],
            };
          }

          // Update summary
          const summary = districtSummary[districtCode];
          summary.totalQuantity += req.quantity;
          summary.totalReceived += req.received || 0;
          summary.pendingQuantity += req.quantity - (req.received || 0);

          const book = books.find((b) => b.id === req.bookId);
          if (book) {
            let bookSummary = summary.books.find((b) => b.bookId === book.id);
            if (!bookSummary) {
              bookSummary = {
                bookId: book.id,
                bookName: book.title,
                className: book.class,
                subject: book.subject,
                totalRequested: 0,
                totalReceived: 0,
              };
              summary.books.push(bookSummary);
              summary.totalBooks++;
            }
            bookSummary.totalRequested += req.quantity;
            bookSummary.totalReceived += req.received || 0;

            // Update detailed data
            const detailed = detailedDistrictData[districtCode];
            let block = detailed.blocks.find((b) => b.blockId === blockId);
            if (!block) {
              block = {
                blockId,
                blockName,
                schools: [],
              };
              detailed.blocks.push(block);
            }

            let schoolData = block.schools.find(
              (s) => s.schoolId === school.udise,
            );
            if (!schoolData) {
              schoolData = {
                schoolId: school.udise,
                schoolName: school.name,
                requests: [],
              };
              block.schools.push(schoolData);
            }

            schoolData.requests.push({
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

      setDistrictRequests(Object.values(districtSummary));
      setDetailedData(detailedDistrictData);
    } catch (error) {
      console.error("Error loading requisition data:", error);
      setError("Failed to load requisition data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to toggle district expansion
  const toggleDistrictExpansion = (districtCode: string) => {
    setExpandedDistricts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(districtCode)) {
        newSet.delete(districtCode);
      } else {
        newSet.add(districtCode);
      }
      return newSet;
    });
  };

  // Helper function to get available stock (including backlog)
  const getAvailableStock = (request: any) => {
    const stockItem = stateStock.find((s) => s.book?.title === request.book);
    const backlogItem = backlogStock.find(
      (b: any) => b.book?.title === request.book,
    );
    return (stockItem?.quantity || 0) + (backlogItem?.quantity || 0);
  };

  // Handle sending books for district summary (book-level)
  const handleDistrictBookSend = async (
    districtCode: string,
    bookId: string,
    inputKey: string,
  ) => {
    const quantity = parseInt(batchInputs[inputKey] || "0", 10);
    if (quantity <= 0) return;

    try {
      setUpdating(inputKey);

      // Find all requisitions for this district and book
      const detailedDistrict = detailedData[districtCode];
      if (!detailedDistrict) return;

      const bookTitle =
        stateStock.find((s) => s.bookId === bookId)?.book?.title || "";

      // Update stock quantities
      const stockItem = stateStock.find((s) => s.bookId === bookId);
      const backlogItem = backlogStock.find((b: any) => b.bookId === bookId);

      let remainingToSend = quantity;

      // First, use regular stock
      if (stockItem && remainingToSend > 0) {
        const fromStock = Math.min(remainingToSend, stockItem.quantity);
        if (fromStock > 0) {
          await stockAPI.update(stockItem.id, {
            quantity: stockItem.quantity - fromStock,
          });
          remainingToSend -= fromStock;
        }
      }

      // Then, use backlog stock if needed
      if (backlogItem && remainingToSend > 0) {
        const fromBacklog = Math.min(remainingToSend, backlogItem.quantity);
        if (fromBacklog > 0) {
          await stockAPI.update(backlogItem.id, {
            quantity: backlogItem.quantity - fromBacklog,
          });
        }
      }

      // Update all relevant requisitions proportionally
      // This is a simplified approach - in practice, you might want more sophisticated distribution logic
      for (const block of detailedDistrict.blocks) {
        for (const school of block.schools) {
          for (const request of school.requests) {
            if (
              request.book === bookTitle &&
              request.received < request.requested
            ) {
              const pending = request.requested - request.received;
              const toUpdate = Math.min(
                pending,
                Math.floor(quantity * (pending / (request.requested || 1))),
              );

              if (toUpdate > 0) {
                await requisitionsAPI.update(request.reqId, {
                  received: request.received + toUpdate,
                  status:
                    request.received + toUpdate >= request.requested
                      ? "COMPLETED"
                      : "APPROVED",
                });
              }
            }
          }
        }
      }

      // Reload data to reflect changes
      await loadData();

      // Clear the input
      setBatchInputs((prev) => ({ ...prev, [inputKey]: "" }));

      // Show success message
      setSuccessMessage(
        `Successfully sent ${quantity} books (${bookTitle}) to ${detailedDistrict.district}`,
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error sending books:", error);
      setError("Failed to send books. Please try again.");
    } finally {
      setUpdating(null);
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

  // Handle batch input changes
  const handleBatchInput = (key: string, value: string) => {
    setBatchInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
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

        {/* District-wise Requisitions Summary */}
        {districtRequests.map((district, districtIdx) => (
          <Card key={district.districtCode} className="shadow-lg border-0 mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl text-blue-900">
                    {district.district}
                  </CardTitle>
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="mr-4">
                      Total Books: {district.totalBooks}
                    </span>
                    <span className="mr-4">
                      Total Quantity: {district.totalQuantity}
                    </span>
                    <span className="mr-4">
                      Received: {district.totalReceived}
                    </span>
                    <span>Pending: {district.pendingQuantity}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDistrictExpansion(district.districtCode)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {expandedDistricts.has(district.districtCode)
                    ? "Hide Details"
                    : "View Details"}
                  {expandedDistricts.has(district.districtCode) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* District Summary Table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
                  <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                    <tr>
                      <th className="px-4 py-2 border-b text-left">Class</th>
                      <th className="px-4 py-2 border-b text-left">Subject</th>
                      <th className="px-4 py-2 border-b text-left">
                        Book Name
                      </th>
                      <th className="px-4 py-2 border-b text-left">
                        Total Requested
                      </th>
                      <th className="px-4 py-2 border-b text-left">
                        Total Received
                      </th>
                      <th className="px-4 py-2 border-b text-left">Pending</th>
                      <th className="px-4 py-2 border-b text-left">
                        Available Stock
                      </th>
                      <th className="px-4 py-2 border-b text-left">
                        Send Books
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {district.books.map((book, bookIdx) => {
                      const key = `district-${districtIdx}-book-${bookIdx}`;
                      const pending = book.totalRequested - book.totalReceived;
                      const stockItem = stateStock.find(
                        (s) => s.book?.title === book.bookName,
                      );
                      const backlogItem = backlogStock.find(
                        (b: any) => b.book?.title === book.bookName,
                      );
                      const availableStock =
                        (stockItem?.quantity || 0) +
                        (backlogItem?.quantity || 0);
                      const maxSend = Math.min(pending, availableStock);

                      return (
                        <tr
                          key={book.bookId}
                          className={
                            bookIdx % 2 === 0
                              ? "bg-white hover:bg-blue-50 transition"
                              : "bg-blue-50 hover:bg-blue-100 transition"
                          }
                        >
                          <td className="px-4 py-2 border-b">
                            {book.className}
                          </td>
                          <td className="px-4 py-2 border-b">{book.subject}</td>
                          <td className="px-4 py-2 border-b">
                            {book.bookName}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {book.totalRequested}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {book.totalReceived}
                          </td>
                          <td className="px-4 py-2 border-b">{pending}</td>
                          <td className="px-4 py-2 border-b">
                            {availableStock}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {pending > 0 && availableStock > 0 && (
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
                                    handleDistrictBookSend(
                                      district.districtCode,
                                      book.bookId,
                                      key,
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
                            {pending === 0 && (
                              <span className="text-xs text-green-700 font-semibold">
                                Complete
                              </span>
                            )}
                            {pending > 0 && availableStock === 0 && (
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

              {/* Detailed View when expanded */}
              {expandedDistricts.has(district.districtCode) &&
                detailedData[district.districtCode] && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">
                      Detailed View - Block & School wise
                    </h4>
                    {detailedData[district.districtCode].blocks.map(
                      (block, blockIdx) => (
                        <div key={block.blockId} className="mb-6">
                          <h5 className="text-md font-semibold mb-3 text-gray-700">
                            {block.blockName} ({block.blockId})
                          </h5>
                          {block.schools.map((school, schoolIdx) => (
                            <div key={school.schoolId} className="mb-4 ml-4">
                              <h6 className="text-sm font-medium mb-2 text-gray-600">
                                {school.schoolName} (UDISE: {school.schoolId})
                              </h6>
                              <div className="overflow-x-auto">
                                <table className="w-full bg-gray-50 rounded-lg border-separate border-spacing-0">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-1 border-b text-left text-xs">
                                        Class
                                      </th>
                                      <th className="px-3 py-1 border-b text-left text-xs">
                                        Subject
                                      </th>
                                      <th className="px-3 py-1 border-b text-left text-xs">
                                        Book
                                      </th>
                                      <th className="px-3 py-1 border-b text-left text-xs">
                                        Requested
                                      </th>
                                      <th className="px-3 py-1 border-b text-left text-xs">
                                        Received
                                      </th>
                                      <th className="px-3 py-1 border-b text-left text-xs">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {school.requests.map((request, reqIdx) => (
                                      <tr
                                        key={request.reqId}
                                        className="text-xs"
                                      >
                                        <td className="px-3 py-1 border-b">
                                          {request.className}
                                        </td>
                                        <td className="px-3 py-1 border-b">
                                          {request.subject}
                                        </td>
                                        <td className="px-3 py-1 border-b">
                                          {request.book}
                                        </td>
                                        <td className="px-3 py-1 border-b">
                                          {request.requested}
                                        </td>
                                        <td className="px-3 py-1 border-b">
                                          {request.received}
                                        </td>
                                        <td className="px-3 py-1 border-b">
                                          <span
                                            className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(request.status)}`}
                                          >
                                            {request.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                    )}
                  </div>
                )}
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
