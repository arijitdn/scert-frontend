import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  Printer,
  FileText,
  School,
  Building2,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { blocksAPI, requisitionsAPI, stockAPI, echallanAPI } from "@/lib/api";
import html2pdf from "html2pdf.js";

export default function DistrictEChallan() {
  const { toast } = useToast();
  // Form selection states - District can only select IS (blocks)
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedRequisition, setSelectedRequisition] = useState("");

  // Data states
  const [blocks, setBlocks] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [previousEChallans, setPreviousEChallans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [challanNo, setChallanNo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [vehicle, setVehicle] = useState("");
  const [agency, setAgency] = useState("");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const printRef = useRef(null);

  // Load blocks on component mount
  useEffect(() => {
    loadInitialData();
    loadPreviousEChallans();
  }, []);

  // Load requisitions when destination changes
  useEffect(() => {
    if (selectedDestination) {
      loadRequisitions();
    }
  }, [selectedDestination]);

  // Auto-populate books when requisition is selected
  useEffect(() => {
    if (selectedRequisition) {
      populateBooksFromRequisition();
      generateChallanNumber();
    }
  }, [selectedRequisition]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const blocksRes = await blocksAPI.getAll();
      setBlocks(blocksRes.data.data || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousEChallans = async () => {
    try {
      const response = await echallanAPI.getAll();
      // Filter for district-level e-challans (type IS)
      const districtEChallans = (response.data.data || []).filter(
        (challan) => challan.destinationType === "IS",
      );
      setPreviousEChallans(districtEChallans);
    } catch (error) {
      console.error("Error loading previous e-challans:", error);
    }
  };

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const response = await requisitionsAPI.getAll();
      const allRequisitions = response.data.data || [];

      // Filter approved requisitions for the selected IS (block)
      const filteredRequisitions = allRequisitions.filter((req) => {
        return (
          req.status === "APPROVED" &&
          req.school.block_name === selectedDestination
        );
      });

      // Group requisitions by reqId to avoid duplicates
      const groupedRequisitions = filteredRequisitions.reduce((acc, req) => {
        if (!acc[req.reqId]) {
          acc[req.reqId] = {
            ...req,
            books: [],
          };
        }
        acc[req.reqId].books.push({
          id: req.book.id,
          title: req.book.title,
          class: req.book.class,
          subject: req.book.subject,
          quantity: req.quantity,
          received: req.received,
        });
        return acc;
      }, {});

      setRequisitions(Object.values(groupedRequisitions));
    } catch (error) {
      console.error("Error loading requisitions:", error);
    } finally {
      setLoading(false);
    }
  };

  const populateBooksFromRequisition = async () => {
    const requisition = requisitions.find(
      (req) => req.reqId === selectedRequisition,
    );
    if (requisition) {
      try {
        // Fetch current district stock
        const districtStockResponse = await stockAPI.getAll({
          type: "DISTRICT",
          userId: "1601",
        });
        const districtStock = districtStockResponse.data.data || [];

        const bookRows = requisition.books.map((book) => {
          const stockItem = districtStock.find(
            (stock) => stock.bookId === book.id,
          );
          const availableStock = stockItem ? stockItem.quantity : 0;

          return {
            className: book.class,
            subject: book.subject,
            bookName: book.title,
            bookId: book.id,
            originalPendingQuantity: Math.max(0, book.quantity - book.received),
            pendingQuantity: Math.max(0, book.quantity - book.received),
            availableStock: availableStock,
            noOfBooks: "0",
            noOfBoxes: "0",
            noOfPackets: "0",
            noOfLooseBoxes: "0",
          };
        });
        setRows(bookRows);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        // Fallback without stock data
        const bookRows = requisition.books.map((book) => ({
          className: book.class,
          subject: book.subject,
          bookName: book.title,
          bookId: book.id,
          originalPendingQuantity: Math.max(0, book.quantity - book.received),
          pendingQuantity: Math.max(0, book.quantity - book.received),
          availableStock: 0,
          noOfBooks: "0",
          noOfBoxes: "0",
          noOfPackets: "0",
          noOfLooseBoxes: "0",
        }));
        setRows(bookRows);
      }
    }
  };

  const generateChallanNumber = () => {
    // Get requisition data to extract codes
    const requisition = requisitions.find(
      (req) => req.reqId === selectedRequisition,
    );

    if (!requisition) {
      return;
    }

    // Extract district code - use first 4 digits of UDISE as district code
    const districtCode =
      requisition.school?.udise?.toString().substring(0, 4) || "DIST";
    // Extract IS/Block code from school data
    const isCode = requisition.school?.block_code?.toString() || "IS";
    // Extract school UDISE
    const schoolUdise = requisition.school?.udise?.toString() || "UDISE";

    // Generate unique number
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, "0");

    const challanNumber = `ECHALLAN/${schoolUdise}/${random}`;
    setChallanNo(challanNumber);
  };

  // Generate display ID for preview (will be replaced with actual ID from backend)
  const generatedId = challanNo ? `${challanNo}` : "Will be auto-generated";

  const handleRowChange = (idx, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row, i) => {
        if (i === idx) {
          let updatedRow = { ...row, [field]: value };

          // Validate noOfBooks against pending quantity and stock when manually entered
          if (field === "noOfBooks") {
            const originalPending =
              parseInt(updatedRow.originalPendingQuantity) || 0;
            const availableStock = parseInt(updatedRow.availableStock) || 0;
            const currentBooks = parseInt(value) || 0;
            const maxAllowed = Math.min(originalPending, availableStock);

            if (currentBooks > originalPending) {
              // Show toast warning for pending quantity
              toast({
                title: "Exceeds Pending Quantity",
                description: `Number of books (${currentBooks}) cannot exceed pending quantity (${originalPending})`,
                variant: "destructive",
              });
              updatedRow.noOfBooks = maxAllowed.toString();
            } else if (currentBooks > availableStock) {
              // Show toast warning for stock
              toast({
                title: "Insufficient Stock",
                description: `Number of books (${currentBooks}) cannot exceed available stock (${availableStock})`,
                variant: "destructive",
              });
              updatedRow.noOfBooks = maxAllowed.toString();
            }

            // Update pending quantity
            updatedRow.pendingQuantity = Math.max(
              0,
              originalPending - (parseInt(updatedRow.noOfBooks) || 0),
            );
          }

          return updatedRow;
        }
        return row;
      }),
    );
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        className: "",
        subject: "",
        bookName: "",
        bookId: "",
        noOfBoxes: "",
        noOfPackets: "",
        noOfLooseBoxes: "",
        noOfBooks: "",
        originalPendingQuantity: "0",
        pendingQuantity: 0,
        availableStock: 0,
      },
    ]);
  };

  const handleRemoveRow = (idx) => {
    setRows((rows) => rows.filter((_, i) => i !== idx));
  };

  const updateStock = async () => {
    try {
      // Get current district stock
      const districtStockResponse = await stockAPI.getAll({
        type: "DISTRICT",
        userId: "1601",
      }); // Adjust userId as needed
      const districtStock = districtStockResponse.data.data || [];

      // Update stock by reducing the quantities for each book
      for (const row of rows) {
        if (row.bookId && row.noOfBooks && parseInt(row.noOfBooks) > 0) {
          const totalSupplied = parseInt(row.noOfBooks);

          if (totalSupplied > 0) {
            // Find the corresponding stock item for this book
            const stockItem = districtStock.find(
              (stock) => stock.bookId === row.bookId,
            );

            if (stockItem && stockItem.quantity >= totalSupplied) {
              const newQuantity = stockItem.quantity - totalSupplied;

              // Update the stock
              await stockAPI.update(stockItem.id, { quantity: newQuantity });
              console.log(
                `Updated stock for book ${row.bookName}: ${stockItem.quantity} -> ${newQuantity}`,
              );
            } else {
              console.warn(`Insufficient stock for book ${row.bookName}`);
              toast({
                title: "Warning",
                description: `Insufficient stock for book ${row.bookName}`,
                variant: "destructive",
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: "Error updating stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter previous eChallans
  const filteredChallans = previousEChallans.filter((c) => {
    const matchesId = c.challanId.toLowerCase().includes(search.toLowerCase());
    const matchesDate = filterDate
      ? c.createdAt.split("T")[0] === filterDate
      : true;
    return matchesId && matchesDate;
  });

  const handlePrint = async () => {
    console.log("handlePrint called - generating PDF");
    console.log("rows:", rows);
    console.log("challanNo:", challanNo);
    console.log("selectedDestination:", selectedDestination);

    // Validate that all quantities are filled
    const hasEmptyQuantities = rows.some((row) => {
      const totalQty = parseInt(row.noOfBooks || "0");
      return totalQty === 0;
    });

    if (hasEmptyQuantities) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in 'No. of Books' for all books before generating the challan.",
        variant: "destructive",
      });
      return;
    }

    // Generate PDF directly for testing - simplified approach
    try {
      console.log("Starting simplified PDF generation...");

      // Simple HTML content without complex styles
      const htmlContent = `
        <div style="font-family: Arial; padding: 20px; color: black;">
          <h1>SCERT ODISHA</h1>
          <h2>DISTRICT LEVEL E-CHALLAN</h2>
          <p><strong>Challan No:</strong> ${challanNo}</p>
          <p><strong>Destination IS:</strong> ${selectedDestination}</p>
          <p><strong>Academic Year:</strong> ${academicYear}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Vehicle No:</strong> ${vehicle || "N/A"}</p>
          <p><strong>Agency:</strong> ${agency || "N/A"}</p>
          
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr>
              <th>Class</th>
              <th>Subject</th>
              <th>Book Name</th>
              <th>No. of Books</th>
              <th>No. of Boxes</th>
              <th>No. of Packets</th>
              <th>No. of Loose Books</th>
            </tr>
            ${rows
              .map(
                (row) => `
              <tr>
                <td>${row.className}</td>
                <td>${row.subject}</td>
                <td>${row.bookName}</td>
                <td style="text-align: center; font-weight: bold;">${row.noOfBooks || "0"}</td>
                <td style="text-align: center;">${row.noOfBoxes || "0"}</td>
                <td style="text-align: center;">${row.noOfPackets || "0"}</td>
                <td style="text-align: center;">${row.noOfLooseBoxes || "0"}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
          
          <p><strong>Total Quantity in eChallan:</strong> ${rows.reduce((sum, row) => sum + parseInt(row.noOfBooks || "0"), 0)}</p>
          
          <br><br><br>
          <div style="display: flex; justify-content: space-between;">
            <div>____________________<br>District Officer Signature</div>
            <div>____________________<br>IS Officer Signature</div>
          </div>
        </div>
      `;

      console.log("Creating element for PDF...");

      // Create element without adding to DOM
      const element = document.createElement("div");
      element.innerHTML = htmlContent;

      console.log("Starting html2pdf...");

      const options = {
        margin: 10,
        filename: `district-echallan-test-${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          logging: true,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().from(element).set(options).save();

      console.log("PDF generation completed");

      toast({
        title: "Success",
        description: "PDF generated successfully for testing!",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Error generating PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadChallanPDF = async (challan) => {
    try {
      // Create a temporary element with the challan data
      const tempElement = document.createElement("div");
      tempElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6600; margin-bottom: 10px;">SCERT ODISHA</h1>
            <h2 style="color: #333; margin-bottom: 5px;">DISTRICT LEVEL E-CHALLAN</h2>
            <p style="margin: 0; font-weight: bold;">Challan No: ${challan.challanId}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Destination IS:</strong> ${challan.destinationName}</p>
            <p><strong>Academic Year:</strong> ${challan.academicYear || "2024-25"}</p>
            <p><strong>Date:</strong> ${new Date(challan.createdAt).toLocaleDateString()}</p>
            <p><strong>Vehicle No:</strong> ${challan.vehicleNo || "N/A"}</p>
            <p><strong>Agency:</strong> ${challan.agency || "N/A"}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ddd; padding: 8px;">Class</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Subject</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Book Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">No. of Books</th>
                <th style="border: 1px solid #ddd; padding: 8px;">No. of Boxes</th>
                <th style="border: 1px solid #ddd; padding: 8px;">No. of Packets</th>
                <th style="border: 1px solid #ddd; padding: 8px;">No. of Loose Books</th>
              </tr>
            </thead>
            <tbody>
              ${challan.books
                .map(
                  (book) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${book.className}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${book.subject}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${book.bookName}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${book.noOfBooks || "0"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${book.noOfBoxes}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${book.noOfPackets}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${book.noOfLooseBoxes}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div style="margin-top: 40px;">
            <p><strong>Total Quantity in eChallan:</strong> ${challan.books.reduce((sum, book) => sum + parseInt(book.noOfBooks || "0"), 0)}</p>
          </div>
          
          <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div>
              <p style="border-top: 1px solid #000; padding-top: 5px; margin-top: 40px;">District Officer Signature</p>
            </div>
            <div>
              <p style="border-top: 1px solid #000; padding-top: 5px; margin-top: 40px;">IS Officer Signature</p>
            </div>
          </div>
        </div>
      `;

      // Set up the element for PDF generation
      tempElement.style.position = "absolute";
      tempElement.style.left = "-9999px";
      tempElement.style.top = "0";
      tempElement.style.backgroundColor = "white";
      tempElement.style.width = "210mm";
      tempElement.style.minHeight = "297mm";
      document.body.appendChild(tempElement);

      // Wait a moment for the element to be rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      const opt = {
        margin: 0.5,
        filename: `district-echallan-${challan.challanId.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      await html2pdf().from(tempElement).set(opt).save();

      // Remove the temporary element
      document.body.removeChild(tempElement);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout
      title="District Level e-Challan Generation"
      description="Generate and view e-Challans for IS (Blocks) at the district level."
      adminLevel="DISTRICT ADMIN"
    >
      <Card className="w-full max-w-4xl mx-auto mb-10 bg-gradient-to-br from-orange-100 to-orange-50 border-orange-300 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl text-orange-900">
            Generate eChallan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Select IS (Block) name from the dropdown</li>
              <li>Select an approved requisition from the dropdown</li>
              <li>
                Books will be automatically populated from the selected
                requisition
              </li>
              <li>Challan number will be auto-generated</li>
              <li>Fill in vehicle and agency details</li>
              <li>
                <strong>Enter quantity in "No. of Books" field only</strong> -
                this is the primary field for calculations
              </li>
              <li>
                <span className="text-red-700 font-semibold">Important:</span>{" "}
                Quantity cannot exceed Available Stock or Pending Quantity
              </li>
              <li>
                Click "Generate PDF & Download" to create the e-challan and
                update stock (generation will be cancelled if stock is
                insufficient)
              </li>
            </ol>
          </div>

          {/* Selection Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IS (Block) Name
              </label>
              <Select
                value={selectedDestination}
                onValueChange={setSelectedDestination}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select IS (Block)" />
                </SelectTrigger>
                <SelectContent>
                  {blocks.map((block) => (
                    <SelectItem key={block.id} value={block.name}>
                      {block.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requisition
              </label>
              <Select
                value={selectedRequisition}
                onValueChange={setSelectedRequisition}
                disabled={!selectedDestination || loading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loading ? "Loading..." : "Select requisition"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {requisitions.length === 0 &&
                  selectedDestination &&
                  !loading ? (
                    <SelectItem value="no-requisitions" disabled>
                      No approved requisitions found
                    </SelectItem>
                  ) : (
                    requisitions.map((req) => (
                      <SelectItem key={req.reqId} value={req.reqId}>
                        {req.reqId} - {req.school.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!selectedRequisition && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">
                {!selectedDestination
                  ? "Please select an IS (Block) to begin"
                  : loading
                    ? "Loading requisitions..."
                    : requisitions.length === 0
                      ? "No approved requisitions found for the selected IS"
                      : "Please select a requisition to view books"}
              </p>
            </div>
          )}

          {selectedRequisition && rows.length > 0 && (
            <div>
              <div ref={printRef} className="print:bg-white print:text-black">
                <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 print:!block print:!relative print:!shadow-none print:!border print:!rounded-none">
                  <div className="text-center font-bold text-lg mb-2">
                    Government of Tripura
                    <br />
                    State Council of Educational Research & Training
                    <br />
                    Tripura, Agartala.
                  </div>
                  <hr className="my-2" />
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-gray-400 text-sm">
                      <tbody>
                        <tr>
                          <td className="border px-2 py-1 font-semibold">
                            IS Name :
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              value={selectedDestination}
                              onChange={(e) =>
                                setSelectedDestination(e.target.value)
                              }
                              className="w-full"
                              readOnly
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1 font-semibold">
                            Academic Year :
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              value={academicYear}
                              onChange={(e) => setAcademicYear(e.target.value)}
                              className="w-full"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1 font-semibold">
                            Requisition Number :
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              value={selectedRequisition}
                              onChange={(e) =>
                                setSelectedRequisition(e.target.value)
                              }
                              className="w-full"
                              readOnly
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1 font-semibold">
                            Challan No :
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              value={challanNo}
                              onChange={(e) => setChallanNo(e.target.value)}
                              className="w-full"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1 font-semibold">
                            Date :
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full"
                              type="date"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1 font-semibold">
                            No. of the Vehicle :
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              value={vehicle}
                              onChange={(e) => setVehicle(e.target.value)}
                              className="w-full"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1 font-semibold">
                            Agency / Driver :
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              value={agency}
                              onChange={(e) => setAgency(e.target.value)}
                              className="w-full"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="font-semibold mb-2">
                    Particulars of the OML Textbooks which are being supplied to
                    the Inspectorate from District :
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-400 text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-2 py-1">Sl. No.</th>
                          <th className="border px-2 py-1">Class</th>
                          <th className="border px-2 py-1">Subject</th>
                          <th className="border px-2 py-1">Book Name</th>
                          <th className="border px-2 py-1">Pending Qty</th>
                          <th className="border px-2 py-1 bg-green-50">
                            Available Stock
                          </th>
                          <th className="border px-2 py-1 bg-blue-50">
                            No. of Books
                          </th>
                          <th className="border px-2 py-1">No. of Boxes</th>
                          <th className="border px-2 py-1">No. of Packets</th>
                          <th className="border px-2 py-1">
                            No. of Loose Boxes
                          </th>
                          <th className="border px-2 py-1">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr key={idx}>
                            <td className="border px-2 py-1 text-center">
                              {idx + 1}
                            </td>
                            <td className="border px-2 py-1">
                              {row.className}
                            </td>
                            <td className="border px-2 py-1">{row.subject}</td>
                            <td className="border px-2 py-1">{row.bookName}</td>
                            <td className="border px-2 py-1 text-center bg-yellow-50">
                              <span className="font-semibold text-orange-600">
                                {row.pendingQuantity || 0}
                              </span>
                            </td>
                            <td className="border px-2 py-1 text-center bg-green-50">
                              <span
                                className={`font-semibold ${
                                  (row.availableStock || 0) > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {row.availableStock || 0}
                              </span>
                            </td>
                            <td className="border px-2 py-1 bg-blue-50">
                              <Input
                                value={row.noOfBooks}
                                onChange={(e) =>
                                  handleRowChange(
                                    idx,
                                    "noOfBooks",
                                    e.target.value,
                                  )
                                }
                                className="w-20 font-semibold"
                                type="number"
                                min="0"
                                max={Math.min(
                                  row.pendingQuantity || 0,
                                  row.availableStock || 0,
                                )}
                                placeholder="0"
                              />
                            </td>
                            <td className="border px-2 py-1">
                              <Input
                                value={row.noOfBoxes}
                                onChange={(e) =>
                                  handleRowChange(
                                    idx,
                                    "noOfBoxes",
                                    e.target.value,
                                  )
                                }
                                className="w-20"
                                type="number"
                                min="0"
                              />
                            </td>
                            <td className="border px-2 py-1">
                              <Input
                                value={row.noOfPackets}
                                onChange={(e) =>
                                  handleRowChange(
                                    idx,
                                    "noOfPackets",
                                    e.target.value,
                                  )
                                }
                                className="w-20"
                                type="number"
                                min="0"
                              />
                            </td>
                            <td className="border px-2 py-1">
                              <Input
                                value={row.noOfLooseBoxes}
                                onChange={(e) =>
                                  handleRowChange(
                                    idx,
                                    "noOfLooseBoxes",
                                    e.target.value,
                                  )
                                }
                                className="w-20"
                                type="number"
                                min="0"
                              />
                            </td>
                            <td className="border px-2 py-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveRow(idx)}
                                disabled={rows.length === 1}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-end mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddRow}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Row
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 print:mt-8">
                    <span className="bg-primary/10 text-primary font-mono px-4 py-2 rounded border border-primary/20 text-lg print:bg-white print:text-black print:border-black">
                      {generatedId}
                    </span>
                  </div>
                </div>
              </div>
              {/* Print area end */}
            </div>
          )}

          <div className="flex justify-end mt-4 print:hidden">
            <Button
              type="button"
              className="px-8 py-2 font-semibold bg-orange-600 text-white"
              onClick={handlePrint}
              disabled={!selectedRequisition || rows.length === 0 || loading}
            >
              {loading ? "Loading..." : "Generate PDF & Download"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Previous eChallans Section */}
      <div className="w-full max-w-4xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div className="text-lg font-semibold text-primary">
            Previous eChallans
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search by eChallan ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredChallans.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              No eChallans found.
            </div>
          ) : (
            filteredChallans.map((challan) => (
              <Card
                key={challan.id}
                className="border border-primary/20 shadow-md bg-white"
              >
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-primary">
                    {challan.challanId}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Destination: {challan.destinationName} (IS)
                  </CardDescription>
                  <CardDescription className="text-sm">
                    Academic Year: {challan.academicYear}
                  </CardDescription>
                  <CardDescription className="text-sm">
                    Requisition Number: {challan.requisitionId}
                  </CardDescription>
                  <CardDescription className="text-sm">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        challan.status === "GENERATED"
                          ? "text-blue-600"
                          : challan.status === "IN_TRANSIT"
                            ? "text-yellow-600"
                            : challan.status === "DELIVERED"
                              ? "text-green-600"
                              : "text-red-600"
                      }`}
                    >
                      {challan.status}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      Date: {new Date(challan.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      Total Quantity in eChallan:{" "}
                      {challan.books.reduce(
                        (sum, book) => sum + parseInt(book.noOfBooks || "0"),
                        0,
                      )}
                    </div>
                    <div>Books: {challan.totalBooks} items</div>
                    <div>Vehicle: {challan.vehicleNo || "N/A"}</div>
                    <div>Agency: {challan.agency || "N/A"}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => downloadChallanPDF(challan)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <style>{`
  @media print {
    body * { visibility: hidden !important; }
    .print\:bg-white, .print\:text-black, .print\:block, .print\:relative, .print\:shadow-none, .print\:border, .print\:rounded-none {
      visibility: visible !important;
      position: relative !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      background: #fff !important;
      color: #000 !important;
    }
    .print\:hidden { display: none !important; }
  }           
`}</style>
    </AdminLayout>
  );
}
