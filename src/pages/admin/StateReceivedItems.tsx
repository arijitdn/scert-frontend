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
    class: "3",
    bookName: "Maths for Class 3",
    medium: "English",
    requisitioned: 30,
    received: 20,
  },
  {
    id: 2,
    class: "5",
    bookName: "Science Explorer",
    medium: "English",
    requisitioned: 15,
    received: 10,
  },
  {
    id: 3,
    class: "4",
    bookName: "English Reader",
    medium: "English",
    requisitioned: 20,
    received: 15,
  },
];

// Dummy data for all requisitions (simulating a backend fetch)
const allRequisitions = [
  {
    id: 1,
    class: "3",
    bookName: "Maths for Class 3",
    medium: "English",
    requisitioned: 30,
  },
  {
    id: 2,
    class: "5",
    bookName: "Science Explorer",
    medium: "English",
    requisitioned: 15,
  },
  {
    id: 3,
    class: "4",
    bookName: "English Reader",
    medium: "English",
    requisitioned: 20,
  },
  {
    id: 4,
    class: "6",
    bookName: "History of India",
    medium: "Hindi",
    requisitioned: 25,
  },
  {
    id: 5,
    class: "7",
    bookName: "Physics Basics",
    medium: "English",
    requisitioned: 10,
  },
];

const allClasses = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const allMediums = ["English", "Hindi", "Urdu", "Marathi"];

export default function SchoolReceived({ adminLevel }: { adminLevel: string }) {
  const [receivedData, setReceivedData] = useState(initialReceived);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedBookName, setSelectedBookName] = useState<string | null>(null);
  const [stockEntryData, setStockEntryData] = useState({
    class: "",
    bookName: "",
    medium: "",
    requisitioned: 0,
    received: 0,
    left: 0,
  });

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedBookName(null); // Reset book name when class changes
    setStockEntryData({
      class: value,
      bookName: "",
      medium: "",
      requisitioned: 0,
      received: 0,
      left: 0,
    });
  };

  const handleBookNameChange = (value: string) => {
    setSelectedBookName(value);
    const selectedRequisition = allRequisitions.find(
      (req) => req.class === selectedClass && req.bookName === value,
    );
    if (selectedRequisition) {
      const existingReceived = receivedData.find(
        (data) =>
          data.class === selectedRequisition.class &&
          data.bookName === selectedRequisition.bookName,
      );
      const currentReceived = existingReceived ? existingReceived.received : 0;
      setStockEntryData({
        class: selectedRequisition.class,
        bookName: selectedRequisition.bookName,
        medium: selectedRequisition.medium,
        requisitioned: selectedRequisition.requisitioned,
        received: currentReceived,
        left: selectedRequisition.requisitioned - currentReceived,
      });
    } else {
      setStockEntryData({
        class: selectedClass || "",
        bookName: value,
        medium: "",
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
    if (!selectedClass || !selectedBookName || stockEntryData.received === null) {
      alert("Please select a Class, Book Name, and enter Received quantity.");
      return;
    }

    const existingIndex = receivedData.findIndex(
      (data) => data.class === selectedClass && data.bookName === selectedBookName,
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
          class: stockEntryData.class,
          bookName: stockEntryData.bookName,
          medium: stockEntryData.medium,
          requisitioned: stockEntryData.requisitioned,
          received: stockEntryData.received,
        },
      ]);
    }

    // Reset form
    setSelectedClass(null);
    setSelectedBookName(null);
    setStockEntryData({
      class: "",
      bookName: "",
      medium: "",
      requisitioned: 0,
      received: 0,
      left: 0,
    });
  };

  return (
    <AdminLayout
      title="Books Received"
      description="View all books received by your school"
      adminLevel="SCHOOL ADMIN"
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
                Class
              </label>
              <Select onValueChange={handleClassChange} value={selectedClass || ""}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {allClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Name
              </label>
              <Select
                onValueChange={handleBookNameChange}
                value={selectedBookName || ""}
                disabled={!selectedClass}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Book Name" />
                </SelectTrigger>
                <SelectContent>
                  {allRequisitions
                    .filter((req) => req.class === selectedClass)
                    .map((req) => (
                      <SelectItem key={req.id} value={req.bookName}>
                        {req.bookName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medium
              </label>
              <Input
                type="text"
                value={stockEntryData.medium}
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
                  <th className="px-4 py-2 border">Class</th>
                  <th className="px-4 py-2 border">Book Name</th>
                  <th className="px-4 py-2 border">Medium</th>
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
                      <td className="px-4 py-2 border">{row.class}</td>
                      <td className="px-4 py-2 border">{row.bookName}</td>
                      <td className="px-4 py-2 border">{row.medium}</td>
                      <td className="px-4 py-2 border">{row.requisitioned}</td>
                      <td className="px-4 py-2 border">
                        {row.received}
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
          
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
