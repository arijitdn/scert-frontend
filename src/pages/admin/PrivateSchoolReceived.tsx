import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ncertBookNames = [
  "Mathematics Textbook for Class X",
  "Science Textbook for Class IX",
  "Social Science: Contemporary India - II",
  "English: First Flight",
  "Hindi: Kshitij - 2",
  "Physics: Textbook for Class XII",
  "Chemistry: Textbook for Class XI",
  "Biology: Textbook for Class XII",
  "Economics: Indian Economic Development",
  "History: Themes in Indian History - I",
  "Geography: Fundamentals of Physical Geography",
  "Political Science: Indian Constitution at Work",
];

const initialReceived = [
  {
    id: 1,
    requisitionNo: "PREQ-001",
    class: "3",
    bookName: "Maths for Class 3",
    category: "Textbook",
    requisitioned: 30,
    received: 20,
  },
  {
    id: 2,
    requisitionNo: "PREQ-002",
    class: "5",
    bookName: "Science Explorer",
    category: "Textbook",
    requisitioned: 15,
    received: 10,
  },
  {
    id: 3,
    requisitionNo: "PREQ-003",
    class: "4",
    bookName: "English Reader",
    category: "Workbook",
    requisitioned: 20,
    received: 15,
  },
];

// Dummy data for all requisitions (simulating a backend fetch)
const allRequisitions = [
  {
    id: 1,
    requisitionNo: "PREQ-001",
    class: "3",
    bookName: "Maths for Class 3",
    category: "Textbook",
    requisitioned: 30,
  },
  {
    id: 2,
    requisitionNo: "PREQ-002",
    class: "5",
    bookName: "Science Explorer",
    category: "Textbook",
    requisitioned: 15,
  },
  {
    id: 3,
    requisitionNo: "PREQ-003",
    class: "4",
    bookName: "English Reader",
    category: "Workbook",
    requisitioned: 20,
  },
  {
    id: 4,
    requisitionNo: "PREQ-004",
    class: "6",
    bookName: "History of India",
    category: "Textbook",
    requisitioned: 25,
  },
  {
    id: 5,
    requisitionNo: "PREQ-005",
    class: "7",
    bookName: "Physics Basics",
    category: "Reference",
    requisitioned: 10,
  },
];

export default function PrivateSchoolReceived() {
  const [receivedData, setReceivedData] = useState(initialReceived);
  const [selectedReqNo, setSelectedReqNo] = useState<string | null>(null);
  const [stockEntryData, setStockEntryData] = useState({
    class: "",
    bookName: "",
    category: "",
    requisitioned: 0,
    received: 0,
    left: 0,
  });

  const handleReceivedChange = (id: number, value: string) => {
    const num = Math.max(0, Number(value.replace(/[^0-9]/g, "")));
    setReceivedData((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              received: num > row.requisitioned ? row.requisitioned : num,
            }
          : row,
      ),
    );
  };

  const handleAddRow = () => {
    const newId =
      receivedData.length > 0
        ? Math.max(...receivedData.map((item) => item.id)) + 1
        : 1;
    const randomBookName =
      ncertBookNames[Math.floor(Math.random() * ncertBookNames.length)];
    const newRow = {
      id: newId,
      requisitionNo: `PREQ-${String(newId).padStart(3, "0")}`,
      class: `Class ${Math.floor(Math.random() * 10) + 1}`,
      bookName: randomBookName,
      requisitioned: Math.floor(Math.random() * 100) + 50,
      received: 0,
    };
    setReceivedData((prev) => [...prev, newRow]);
  };

  const handleReqNoChange = (value: string) => {
    setSelectedReqNo(value);
    const selectedRequisition = allRequisitions.find(
      (req) => req.requisitionNo === value,
    );
    if (selectedRequisition) {
      const existingReceived = receivedData.find(
        (data) => data.requisitionNo === value,
      );
      const currentReceived = existingReceived ? existingReceived.received : 0;
      setStockEntryData({
        class: selectedRequisition.class,
        bookName: selectedRequisition.bookName,
        category: selectedRequisition.category,
        requisitioned: selectedRequisition.requisitioned,
        received: currentReceived,
        left: selectedRequisition.requisitioned - currentReceived,
      });
    } else {
      setStockEntryData({
        class: "",
        bookName: "",
        requisitioned: 0,
        received: 0,
        left: 0,
      });
    }
  };

  const handleStockReceivedChange = (value: string) => {
    const num = Math.max(0, Number(value.replace(/[^0-9]/g, "")));
    setStockEntryData((prev) => ({
      ...prev,
      received: num,
      left: prev.requisitioned - num,
    }));
  };

  const handleSaveStockEntry = () => {
    if (!selectedReqNo || stockEntryData.received === null) {
      alert("Please select a Requisition No and enter Received quantity.");
      return;
    }

    const existingIndex = receivedData.findIndex(
      (data) => data.requisitionNo === selectedReqNo,
    );

    if (existingIndex > -1) {
      // Update existing entry
      setReceivedData((prev) =>
        prev.map((row, index) =>
          index === existingIndex
            ? { ...row, received: stockEntryData.received }
            : row,
        ),
      );
    } else {
      // Add new entry
      const newId =
        receivedData.length > 0
          ? Math.max(...receivedData.map((item) => item.id)) + 1
          : 1;
      setReceivedData((prev) => [
        ...prev,
        {
          id: newId,
          requisitionNo: selectedReqNo,
          class: stockEntryData.class,
          bookName: stockEntryData.bookName,
          category: stockEntryData.category,
          requisitioned: stockEntryData.requisitioned,
          received: stockEntryData.received,
        },
      ]);
    }

    // Reset form
    setSelectedReqNo(null);
    setStockEntryData({
      class: "",
      bookName: "",
      requisitioned: 0,
      received: 0,
      left: 0,
    });
  };

  return (
    <AdminLayout
      title="Private School Books Received"
      description="View all books received by your private school"
      adminLevel={null}
    >
      {/* Stock Entry Card */}
      <Card className="w-full max-w-5xl mx-auto mb-8 bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Stock Entry</CardTitle>
          <CardDescription>
            Enter details for books received against a requisition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requisition No
              </label>
              <Select
                onValueChange={handleReqNoChange}
                value={selectedReqNo || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Requisition No" />
                </SelectTrigger>
                <SelectContent>
                  {allRequisitions.map((req) => (
                    <SelectItem key={req.id} value={req.requisitionNo}>
                      {req.requisitionNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <Input
                type="text"
                value={stockEntryData.class}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Name
              </label>
              <Input
                type="text"
                value={stockEntryData.bookName}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Input
                type="text"
                value={stockEntryData.category}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requisition Asked
              </label>
              <Input
                type="number"
                value={stockEntryData.requisitioned}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received
              </label>
              <Input
                type="number"
                min={0}
                max={stockEntryData.requisitioned}
                value={stockEntryData.received}
                onChange={(e) => handleStockReceivedChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Left
              </label>
              <Input
                type="number"
                value={stockEntryData.left}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveStockEntry}>Save Stock Entry</Button>
          </div>
        </CardContent>
      </Card>

      {/* Books Received Card */}
      <Card className="w-full max-w-5xl mx-auto bg-gradient-to-br from-green-100 to-green-50 border-green-300">
        <CardHeader>
          <CardTitle className="text-lg text-green-900">
            Books Received
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border bg-white rounded-lg">
              <thead>
                <tr className="bg-green-200 text-green-900">
                  <th className="px-4 py-2 border">Requisition No</th>
                  <th className="px-4 py-2 border">Class</th>
                  <th className="px-4 py-2 border">Book Name</th>
                  <th className="px-4 py-2 border">Requisition Asked</th>
                  <th className="px-4 py-2 border">Received</th>
                  <th className="px-4 py-2 border">Left</th>
                </tr>
              </thead>
              <tbody>
                {receivedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No books received yet.
                    </td>
                  </tr>
                ) : (
                  receivedData.map((row) => (
                    <tr key={row.id} className="text-center">
                      <td className="px-4 py-2 border">{row.requisitionNo}</td>
                      <td className="px-4 py-2 border">{row.class}</td>
                      <td className="px-4 py-2 border">{row.bookName}</td>
                      <td className="px-4 py-2 border">{row.requisitioned}</td>
                      <td className="px-4 py-2 border">
                        <Input
                          type="number"
                          min={0}
                          max={row.requisitioned}
                          value={row.received}
                          readOnly
                          className="w-20 px-2 py-1 border rounded text-center bg-gray-100"
                        />
                      </td>
                      <td className="px-4 py-2 border font-semibold">
                        {row.requisitioned - row.received}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleAddRow}>
              <Plus className="h-4 w-4 mr-2" /> Add New
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}