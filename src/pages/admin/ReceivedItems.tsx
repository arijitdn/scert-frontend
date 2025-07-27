import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BookOpen, TrendingUp, Layers, Search, Plus } from "lucide-react";

const initialStock = [
  {
    id: 1,
    fy: "2023-24",
    className: "Class 3",
    subject: "Mathematics",
    title: "Maths for Class 3",
    quantity: 120,
    received: 100,
    remaining: 20,
    requisitionAsked: 120,
    left: 20,
  },
  {
    id: 2,
    fy: "2023-24",
    className: "Class 4",
    subject: "Science",
    title: "Science Explorer",
    quantity: 80,
    received: 80,
    remaining: 0,
    requisitionAsked: 80,
    left: 0,
  },
  {
    id: 3,
    fy: "2022-23",
    className: "Class 5",
    subject: "English",
    title: "English Reader",
    quantity: 60,
    received: 50,
    remaining: 10,
    requisitionAsked: 60,
    left: 10,
  },
];

export default function ReceivedItems() {
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState(initialStock);

  const handleReceivedChange = (id, value) => {
    setStock((prevStock) =>
      prevStock.map((item) =>
        item.id === id
          ? { ...item, received: parseInt(value, 10) || 0 }
          : item,
      ),
    );
  };

  const handleAddRow = () => {
    const newId = stock.length > 0 ? Math.max(...stock.map((item) => item.id)) + 1 : 1;
    const newRow = {
      id: newId,
      fy: "2024-25",
      className: "Class " + (stock.length + 1),
      subject: "New Subject",
      title: "New Book " + (stock.length + 1),
      quantity: 0,
      received: 0,
      remaining: 0,
      requisitionAsked: 100,
      left: 100,
    };
    setStock((prevStock) => [...prevStock, newRow]);
  };

  const filteredStock = stock.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.className.toLowerCase().includes(search.toLowerCase()) ||
      book.subject.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout
      title="Received Items"
      description="View all books currently in state stock"
      adminLevel="STATE ADMIN"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Books in Stock
            </CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {stock.reduce((sum, b) => sum + b.quantity, 0)}
            </div>
            <p className="text-xs text-green-700">across all classes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Received
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {stock.reduce((sum, b) => sum + b.received, 0)}
            </div>
            <p className="text-xs text-blue-700">books received</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining in Stock
            </CardTitle>
            <Layers className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {stock.reduce((sum, b) => sum + b.remaining, 0)}
            </div>
            <p className="text-xs text-yellow-700">books remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-xs">
          <Input
            placeholder="Search by title, class, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Button onClick={handleAddRow} className="ml-4">
          <Plus className="h-4 w-4 mr-2" /> Add New Requisition
        </Button>
      </div>

      {/* Stock Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gradient-to-r from-purple-200 to-pink-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">FY</th>
              <th className="py-3 px-4 text-left font-semibold">Class</th>
              <th className="py-3 px-4 text-left font-semibold">Subject</th>
              <th className="py-3 px-4 text-left font-semibold">Book Name</th>
              <th className="py-3 px-4 text-left font-semibold">Total Qty</th>
              <th className="py-3 px-4 text-left font-semibold">Received</th>
              <th className="py-3 px-4 text-left font-semibold">Remaining</th>
              <th className="py-3 px-4 text-left font-semibold">
                Requisition Asked
              </th>
              <th className="py-3 px-4 text-left font-semibold">Left</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">
                  No books found.
                </td>
              </tr>
            ) : (
              filteredStock.map((book) => (
                <tr
                  key={book.id}
                  className={
                    book.id % 2 === 0
                      ? "bg-gradient-to-r from-purple-50 to-pink-50"
                      : "bg-white"
                  }
                >
                  <td className="py-2 px-4">{book.fy}</td>
                  <td className="py-2 px-4">{book.className}</td>
                  <td className="py-2 px-4">{book.subject}</td>
                  <td className="py-2 px-4">{book.title}</td>
                  <td className="py-2 px-4">{book.quantity}</td>
                  <td className="py-2 px-4">
                    <Input
                      type="number"
                      value={book.received}
                      onChange={(e) =>
                        handleReceivedChange(book.id, e.target.value)
                      }
                      className="w-24"
                    />
                  </td>
                  <td className="py-2 px-4">{book.remaining}</td>
                  <td className="py-2 px-4">{book.requisitionAsked}</td>
                  <td className="py-2 px-4">{book.left}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}