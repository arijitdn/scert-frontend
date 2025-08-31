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
} from "lucide-react";
import { useRef } from "react";
import {
  districtsAPI,
  blocksAPI,
  requisitionsAPI,
  stockAPI,
  echallanAPI,
} from "@/lib/api";

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
        noOfBoxes: "0",
        noOfPackets: "0",
        noOfLooseBoxes: Math.max(0, book.quantity - book.received).toString(),
        pendingQuantity: Math.max(0, book.quantity - book.received),
      }));
      setRows(bookRows);
    }
  };

  const generateChallanNumber = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, "0");

    const challanNumber = `SCERT/TEXTBOOK/${year}/${month}${day}/${random}`;
    setChallanNo(challanNumber);
  };

  // Generate display ID for preview (will be replaced with actual ID from backend)
  const generatedId = challanNo
    ? `Preview: ${challanNo}`
    : "Will be auto-generated";

  const handleRowChange = (idx, field, value) => {
    setRows((rows) =>
      rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
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
        pendingQuantity: 0,
      },
    ]);
  };

  const handleRemoveRow = (idx) => {
    setRows((rows) => rows.filter((_, i) => i !== idx));
  };

  const updateStock = async () => {
    try {
      // Get current state stock
      const stateStockResponse = await stockAPI.getStateStock();
      const stateStock = stateStockResponse.data.data || [];

      // Update stock by reducing the quantities for each book
      for (const row of rows) {
        if (row.bookId && row.pendingQuantity > 0) {
          const totalSupplied =
            parseInt(row.noOfBoxes || "0") +
            parseInt(row.noOfPackets || "0") +
            parseInt(row.noOfLooseBoxes || "0");

          if (totalSupplied > 0) {
            // Find the corresponding stock item for this book
            const stockItem = stateStock.find(
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
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Error updating stock. Please try again.");
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
    // Validate that all quantities are filled
    const hasEmptyQuantities = rows.some((row) => {
      const totalQty =
        parseInt(row.noOfBoxes || "0") +
        parseInt(row.noOfPackets || "0") +
        parseInt(row.noOfLooseBoxes || "0");
      return totalQty === 0;
    });

    if (hasEmptyQuantities) {
      alert(
        "Please fill in quantities for all books before generating the challan.",
      );
      return;
    }

    // Confirm before updating stock
    const confirmed = window.confirm(
      "This will generate the e-challan and update the stock quantities. Are you sure you want to continue?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

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
          noOfBoxes: row.noOfBoxes || "0",
          noOfPackets: row.noOfPackets || "0",
          noOfLooseBoxes: row.noOfLooseBoxes || "0",
        })),
      };

      const response = await echallanAPI.create(echallanData);

      if (response.data.success) {
        // Update stock quantities
        await updateStock();

        // Refresh previous e-challans list
        await loadPreviousEChallans();

        // Show success message
        alert(
          `E-challan generated successfully! Challan ID: ${response.data.data.challanId}`,
        );

        // Print the challan
        window.print();

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
                    the Inspectorate from SCERT :
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
                    <span className="font-semibold text-primary print:text-black">
                      eChallan ID:
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
                    eChallan ID: {challan.challanId}
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
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      Date: {new Date(challan.createdAt).toLocaleDateString()}
                    </div>
                    <div>Books: {challan.totalBooks} items</div>
                    <div>Vehicle: {challan.vehicleNo || "N/A"}</div>
                    <div>Agency: {challan.agency || "N/A"}</div>
                  </div>
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
