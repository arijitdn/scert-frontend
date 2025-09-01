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
import {
  districtsAPI,
  blocksAPI,
  requisitionsAPI,
  stockAPI,
  echallanAPI,
} from "@/lib/api";
import html2pdf from "html2pdf.js";

export default function StateEChallan() {
  // Form selection states
  const [destinationType, setDestinationType] = useState<
    "district" | "is" | ""
  >("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedRequisition, setSelectedRequisition] = useState("");

  // Data states
  const [districts, setDistricts] = useState([]);
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

  // Load districts and blocks on component mount
  useEffect(() => {
    loadInitialData();
    loadPreviousEChallans();
  }, []);

  // Load requisitions when destination changes
  useEffect(() => {
    if (selectedDestination && destinationType) {
      loadRequisitions();
    }
  }, [selectedDestination, destinationType]);

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
      const [districtsRes, blocksRes] = await Promise.all([
        districtsAPI.getAll(),
        blocksAPI.getAll(),
      ]);

      setDistricts(districtsRes.data.data || []);
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
      setPreviousEChallans(response.data.data || []);
    } catch (error) {
      console.error("Error loading previous e-challans:", error);
    }
  };
  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const response = await requisitionsAPI.getAll();
      const allRequisitions = response.data.data || [];

      // Filter approved requisitions based on destination type
      const filteredRequisitions = allRequisitions.filter((req) => {
        if (req.status !== "APPROVED") return false;

        if (destinationType === "district") {
          return req.school.district === selectedDestination;
        } else if (destinationType === "is") {
          return req.school.block_name === selectedDestination;
        }

        return false;
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

  const populateBooksFromRequisition = () => {
    const requisition = requisitions.find(
      (req) => req.reqId === selectedRequisition,
    );
    if (requisition) {
      const bookRows = requisition.books.map((book) => ({
        className: book.class,
        subject: book.subject,
        bookName: book.title,
        bookId: book.id,
        originalPendingQuantity: Math.max(0, book.quantity - book.received),
        pendingQuantity: Math.max(0, book.quantity - book.received),
        noOfBooks: "0",
        noOfBoxes: "0",
        noOfPackets: "0",
        noOfLooseBoxes: "0",
      }));
      setRows(bookRows);
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
    setRows((rows) =>
      rows.map((row, i) => {
        if (i === idx) {
          let updatedRow = { ...row, [field]: value };

          // Handle noOfBooks validation and pending quantity update
          if (field === "noOfBooks") {
            const numBooks = parseInt(value) || 0;
            const maxBooks = row.originalPendingQuantity || 0;

            // Auto-clear zero when typing
            if (value === "0") {
              updatedRow.noOfBooks = "";
              updatedRow.pendingQuantity = row.originalPendingQuantity;
              return updatedRow;
            }

            // Validate: must be > 0 and <= original pending quantity
            if (numBooks <= 0) {
              updatedRow.noOfBooks = "";
              updatedRow.pendingQuantity = row.originalPendingQuantity;
              return updatedRow;
            }
            if (numBooks > maxBooks) {
              updatedRow.noOfBooks = maxBooks.toString();
              updatedRow.pendingQuantity = 0;
            } else {
              // Deduct noOfBooks from original pending quantity
              updatedRow.pendingQuantity = Math.max(
                0,
                row.originalPendingQuantity - numBooks,
              );
            }
          }

          // Auto-clear zeros for input fields when focused/typing
          if (
            (field === "noOfBoxes" ||
              field === "noOfPackets" ||
              field === "noOfLooseBoxes") &&
            value === "0"
          ) {
            updatedRow[field] = "";
          }

          return updatedRow;
        }
        return row;
      }),
    );
  };

  const handleRemoveRow = (idx) => {
    setRows((rows) => rows.filter((_, i) => i !== idx));
  };

  const generatePDF = async () => {
    const requisition = requisitions.find(
      (req) => req.reqId === selectedRequisition,
    );

    if (!requisition) return;

    // Create PDF content matching the attached image
    const pdfContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Government of Tripura</h2>
          <h3 style="margin: 5px 0; font-size: 16px; font-weight: bold;">State Council of Educational Research & Training</h3>
          <p style="margin: 0; font-size: 14px;">Tripura, Agartala.</p>
        </div>

        <div style="border: 2px solid #ccc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; width: 200px;">District Name :</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${requisition.school?.Block?.District?.name || requisition.school?.district || selectedDestination}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Academic Year :</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${academicYear}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Requisition Number :</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${selectedRequisition}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Challan No :</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${challanNo}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Date :</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleDateString("en-GB")}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">No. of the Vehicle :</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${vehicle}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Agency / Driver :</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${agency}</td>
            </tr>
          </table>

          <h4 style="margin: 20px 0 10px 0; font-size: 14px; font-weight: bold;">Particulars of the Textbooks which are being supplied to the Inspectorate from SCERT :</h4>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Sl. No.</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Class</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Subject</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Book Name</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Pending Qty</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">No. of Books</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">No. of Boxes</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">No. of Packets</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">No. of Loose Boxes</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row, idx) => `
                <tr>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${idx + 1}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${row.className}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${row.subject}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: left; font-size: 11px;">${row.bookName}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px; background-color: #fff3cd;">${row.pendingQuantity || 0}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${row.noOfBooks || 0}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${row.noOfBoxes || 0}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${row.noOfPackets || 0}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${row.noOfLooseBoxes || 0}</td>
                  <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">✓</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <p style="color: #2563eb; font-size: 14px; margin: 0;">
            <strong>eChallan ID: ${challanNo}</strong>
          </p>
        </div>
      </div>
    `;

    // Generate PDF
    const element = document.createElement("div");
    element.innerHTML = pdfContent;

    const opt = {
      margin: 0.5,
      filename: `eChallan_${challanNo.replace("ECHALLAN_", "")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const downloadChallanPDF = async (challan) => {
    try {
      // Create PDF content for existing challan
      const pdfContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 18px; font-weight: bold;">Government of Tripura</h2>
            <h3 style="margin: 5px 0; font-size: 16px; font-weight: bold;">State Council of Educational Research & Training</h3>
            <p style="margin: 0; font-size: 14px;">Tripura, Agartala.</p>
          </div>

          <div style="border: 2px solid #ccc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; width: 200px;">District Name :</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${challan.destinationName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Academic Year :</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${challan.academicYear}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Requisition Number :</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${challan.requisitionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Challan No :</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${challan.challanId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Date :</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(challan.createdAt).toLocaleDateString("en-GB")}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">No. of the Vehicle :</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${challan.vehicleNo || ""}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Agency / Driver :</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${challan.agency || ""}</td>
              </tr>
            </table>

            <h4 style="margin: 20px 0 10px 0; font-size: 14px; font-weight: bold;">Particulars of the Textbooks which are being supplied to the Inspectorate from SCERT :</h4>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Sl. No.</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Class</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Subject</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Book Name</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Pending Qty</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">No. of Books</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">No. of Boxes</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">No. of Packets</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">No. of Loose Boxes</th>
                  <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${
                  challan.books
                    ?.map(
                      (book, idx) => `
                  <tr>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${idx + 1}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${book.className || ""}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${book.subject || ""}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: left; font-size: 11px;">${book.bookName || ""}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px; background-color: #fff3cd;">${book.pendingQuantity || 0}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${book.noOfBooks || 0}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${book.noOfBoxes || 0}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${book.noOfPackets || 0}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">${book.noOfLooseBoxes || 0}</td>
                    <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px;">✓</td>
                  </tr>
                `,
                    )
                    .join("") ||
                  '<tr><td colspan="10" style="text-align: center; padding: 20px;">No books data available</td></tr>'
                }
              </tbody>
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #2563eb; font-size: 14px; margin: 0;">
              <strong>eChallan ID: ${challan.challanId}</strong>
            </p>
          </div>
        </div>
      `;

      // Generate PDF
      const element = document.createElement("div");
      element.innerHTML = pdfContent;

      const opt = {
        margin: 0.5,
        filename: `eChallan_${challan.challanId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error downloading PDF. Please try again.");
    }
  };

  const updateStock = async () => {
    try {
      // Get current state stock
      const stateStockResponse = await stockAPI.getStateStock();
      const stateStock = stateStockResponse.data.data || [];

      // Update stock by reducing the quantities based on "No. of Books" field only
      for (const row of rows) {
        if (row.bookId) {
          const booksToDeduct = parseInt(row.noOfBooks || "0");

          if (booksToDeduct > 0) {
            // Find the corresponding stock item for this book
            const stockItem = stateStock.find(
              (stock) => stock.bookId === row.bookId,
            );

            if (stockItem && stockItem.quantity >= booksToDeduct) {
              const newQuantity = stockItem.quantity - booksToDeduct;

              // Update the state stock only (do not add to destination)
              await stockAPI.update(stockItem.id, { quantity: newQuantity });
              console.log(
                `Updated state stock for book ${row.bookName}: ${stockItem.quantity} -> ${newQuantity}`,
              );
            } else {
              console.warn(
                `Insufficient state stock for book ${row.bookName}. Available: ${stockItem?.quantity || 0}, Required: ${booksToDeduct}`,
              );
              alert(
                `Insufficient state stock for book ${row.bookName}. Available: ${stockItem?.quantity || 0}, Required: ${booksToDeduct}`,
              );
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Error updating stock. Please try again.");
      return false;
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
    // Validate that "No. of Books" is filled for all rows
    const hasEmptyBooks = rows.some((row) => {
      const booksCount = parseInt(row.noOfBooks || "0");
      return booksCount <= 0;
    });

    if (hasEmptyBooks) {
      alert(
        "Please fill in the number of books for all items before generating the challan.",
      );
      return;
    }

    // Validate that required form fields are filled
    if (!challanNo || !vehicle || !agency) {
      alert(
        "Please fill in all required fields (Challan No, Vehicle No, and Agency).",
      );
      return;
    }

    // Confirm before updating stock
    const confirmed = window.confirm(
      "This will generate the e-challan PDF and deduct books from state stock. Are you sure you want to continue?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      // Update stock quantities first
      const stockUpdateSuccess = await updateStock();

      if (!stockUpdateSuccess) {
        setLoading(false);
        return;
      }

      // Create the e-challan in database
      const echallanData = {
        challanNo,
        destinationType: destinationType.toUpperCase(),
        destinationName: selectedDestination,
        destinationId:
          destinationType === "district"
            ? districts.find((d) => d.name === selectedDestination)?.id
            : blocks.find((b) => b.name === selectedDestination)?.id,
        requisitionId: selectedRequisition,
        academicYear,
        vehicleNo: vehicle,
        agency,
        books: rows.map((row) => ({
          bookId: row.bookId,
          className: row.className,
          subject: row.subject,
          bookName: row.bookName,
          pendingQuantity:
            row.originalPendingQuantity || row.pendingQuantity || 0,
          noOfBooks: row.noOfBooks,
          noOfBoxes: row.noOfBoxes || "0",
          noOfPackets: row.noOfPackets || "0",
          noOfLooseBoxes: row.noOfLooseBoxes || "0",
        })),
      };

      const response = await echallanAPI.create(echallanData);

      if (response.data.success) {
        // Generate and download PDF
        await generatePDF();

        // Refresh previous e-challans list
        await loadPreviousEChallans();

        // Show success message
        alert(
          `E-challan generated successfully! Challan ID: ${response.data.data.challanId}`,
        );

        // Reset form after successful generation
        setSelectedRequisition("");
        setRows([]);
        setChallanNo("");
        setVehicle("");
        setAgency("");
      }
    } catch (error) {
      console.error("Error generating challan:", error);
      alert("Error generating challan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="State Level e-Challan Generation"
      description="Generate and view e-Challans for Printing Agency, IS, and Private Schools at the state level."
      adminLevel="STATE ADMIN"
    >
      <Card className="w-full max-w-4xl mx-auto mb-10 bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl text-yellow-900">
            Generate eChallan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>
                Select destination type: District for district-wise
                distribution, IS for block-wise distribution
              </li>
              <li>
                Choose the specific district or IS (block) name based on your
                selection
              </li>
              <li>Select an approved requisition from the dropdown</li>
              <li>
                Books will be automatically populated from the selected
                requisition
              </li>
              <li>Challan number will be auto-generated</li>
              <li>Fill in vehicle and agency details</li>
              <li>
                Click "Generate & Download" to create the e-challan and update
                stock
              </li>
            </ol>
          </div>

          {/* Selection Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Type
              </label>
              <Select
                value={destinationType}
                onValueChange={(value: "district" | "is" | "") =>
                  setDestinationType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="district">District</SelectItem>
                  <SelectItem value="is">IS (Block)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {destinationType === "district" ? "District Name" : "IS Name"}
              </label>
              <Select
                value={selectedDestination}
                onValueChange={setSelectedDestination}
                disabled={!destinationType}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${destinationType === "district" ? "district" : "IS"}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {destinationType === "district" &&
                    districts.map((district) => (
                      <SelectItem key={district.id} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  {destinationType === "is" &&
                    blocks.map((block) => (
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
                {!destinationType
                  ? "Please select a destination type to begin"
                  : !selectedDestination
                    ? "Please select a destination"
                    : loading
                      ? "Loading requisitions..."
                      : requisitions.length === 0
                        ? "No approved requisitions found for the selected destination"
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
                            {destinationType === "district"
                              ? "District Name"
                              : "IS Name"}{" "}
                            :
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
                              readOnly
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
                              readOnly
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
                    Particulars of the Textbooks which are being supplied to the
                    Inspectorate from SCERT :
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
                          <th className="border px-2 py-1">No. of Books</th>
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
                            <td className="border px-2 py-1">
                              <Input
                                value={row.noOfBooks || ""}
                                onChange={(e) =>
                                  handleRowChange(
                                    idx,
                                    "noOfBooks",
                                    e.target.value,
                                  )
                                }
                                onFocus={(e) => {
                                  if (e.target.value === "0") {
                                    handleRowChange(idx, "noOfBooks", "");
                                  }
                                }}
                                className="w-20"
                                type="number"
                                min="1"
                                max={row.originalPendingQuantity || 0}
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
                                onFocus={(e) => {
                                  if (e.target.value === "0") {
                                    handleRowChange(idx, "noOfBoxes", "");
                                  }
                                }}
                                onBlur={(e) => {
                                  if (e.target.value === "") {
                                    handleRowChange(idx, "noOfBoxes", "0");
                                  }
                                }}
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
                                onFocus={(e) => {
                                  if (e.target.value === "0") {
                                    handleRowChange(idx, "noOfPackets", "");
                                  }
                                }}
                                onBlur={(e) => {
                                  if (e.target.value === "") {
                                    handleRowChange(idx, "noOfPackets", "0");
                                  }
                                }}
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
                                onFocus={(e) => {
                                  if (e.target.value === "0") {
                                    handleRowChange(idx, "noOfLooseBoxes", "");
                                  }
                                }}
                                onBlur={(e) => {
                                  if (e.target.value === "") {
                                    handleRowChange(idx, "noOfLooseBoxes", "0");
                                  }
                                }}
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
                  </div>

                  <div className="flex items-center gap-4 mt-4 print:mt-8">
                    <span className="font-semibold text-primary print:text-black">
                      eChallan No:
                    </span>
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
              className="px-8 py-2 font-semibold bg-blue-600 text-white"
              onClick={handlePrint}
              disabled={!selectedRequisition || rows.length === 0 || loading}
            >
              {loading ? "Loading..." : "Generate & Download"}
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
                    Destination: {challan.destinationName} (
                    {challan.destinationType === "DISTRICT" ? "District" : "IS"}
                    )
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
                  <div className="text-xs text-muted-foreground space-y-1 mb-4">
                    <div>
                      Date: {new Date(challan.createdAt).toLocaleDateString()}
                    </div>
                    <div>Books: {challan.totalBooks} items</div>
                    <div>Vehicle: {challan.vehicleNo || "N/A"}</div>
                    <div>Agency: {challan.agency || "N/A"}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => downloadChallanPDF(challan)}
                  >
                    <Download className="w-4 h-4" />
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
