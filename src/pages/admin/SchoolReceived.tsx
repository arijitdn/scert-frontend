import React, { useState, useEffect } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stockAPI, echallanAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types for API data
interface EChallanBook {
  id: string;
  bookId: string;
  className: string;
  subject: string;
  bookName: string;
  noOfBoxes: number;
  noOfPackets: number;
  noOfLooseBoxes: number;
  totalQuantity: number;
  book: {
    id: string;
    title: string;
    class: string;
    subject: string;
    category: string;
    rate: number;
  };
}

interface EChallan {
  id: string;
  challanId: string;
  challanNo: string;
  destinationType: string;
  destinationName: string;
  destinationId: string;
  requisitionId: string;
  academicYear: string;
  vehicleNo?: string;
  agency?: string;
  totalBooks: number;
  totalBoxes: number;
  totalPackets: number;
  totalLooseBoxes: number;
  status: string;
  generatedAt: string;
  deliveredAt?: string;
  books: EChallanBook[];
}

interface Stock {
  id: string;
  bookId: string;
  userId: string;
  type: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    class: string;
    subject: string;
    category: string;
    rate: number;
  };
}

interface ReceivedItem {
  id: string;
  challanNo: string;
  bookName: string;
  bookId: string;
  class: string;
  subject: string;
  totalQuantity: number;
  received: number;
}

export default function SchoolReceived() {
  const [received, setReceived] = useState<ReceivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [challans, setChallans] = useState<EChallan[]>([]);
  const [selectedChallan, setSelectedChallan] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [addingStock, setAddingStock] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load e-challans delivered to schools
      const challanResponse = await echallanAPI.getAll();
      const schoolChallans = challanResponse.data.filter(
        (challan: EChallan) =>
          challan.destinationType === "school" &&
          challan.status === "delivered",
      );
      setChallans(schoolChallans);

      // Load existing stock entries to show received items
      const stockResponse = await stockAPI.getAll();
      const schoolStock = stockResponse.data;

      // Map challans to received items format
      const receivedItems = schoolChallans.flatMap((challan: EChallan) =>
        challan.books.map((book: EChallanBook) => {
          const receivedQuantity = schoolStock
            .filter((stock: Stock) => stock.bookId === book.bookId)
            .reduce((sum: number, stock: Stock) => sum + stock.quantity, 0);

          return {
            id: `${challan.id}-${book.id}`,
            challanNo: challan.challanNo,
            bookName: book.book.title,
            bookId: book.bookId,
            class: book.book.class,
            subject: book.book.subject,
            totalQuantity: book.totalQuantity,
            received: receivedQuantity,
          };
        }),
      );

      setReceived(receivedItems);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load received data",
      });
    } finally {
      setLoading(false);
    }
  };

  const addStockEntry = async () => {
    if (!selectedChallan || !selectedBook || !quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all fields",
      });
      return;
    }

    try {
      setAddingStock(true);

      await stockAPI.create({
        bookId: selectedBook,
        type: "RECEIVED",
        quantity: parseInt(quantity),
      });

      toast({
        title: "Success",
        description: "Stock entry added successfully",
      });

      // Reset form and reload data
      setSelectedChallan("");
      setSelectedBook("");
      setQuantity("");
      await loadData();
    } catch (error) {
      console.error("Error adding stock:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add stock entry",
      });
    } finally {
      setAddingStock(false);
    }
  };

  const selectedChallanData = challans.find((c) => c.id === selectedChallan);
  const availableBooks = selectedChallanData?.books || [];

  const getTotalProgress = () => {
    const totalDelivered = received.reduce(
      (sum, item) => sum + item.totalQuantity,
      0,
    );
    const totalReceived = received.reduce(
      (sum, item) => sum + item.received,
      0,
    );
    return totalDelivered > 0 ? (totalReceived / totalDelivered) * 100 : 0;
  };

  const getItemProgress = (item: ReceivedItem) => {
    return item.totalQuantity > 0
      ? (item.received / item.totalQuantity) * 100
      : 0;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading received data...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Books Received"
      description="View and track books received from e-challans"
      adminLevel="SCHOOL ADMIN"
    >
      {/* Overall Progress Card */}
      <Card className="w-full max-w-5xl mx-auto mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Received Progress</CardTitle>
          <CardDescription>
            Overall progress of books received from delivered challans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {received.reduce((sum, item) => sum + item.totalQuantity, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {received.reduce((sum, item) => sum + item.received, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Received</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {received.reduce(
                  (sum, item) => sum + (item.totalQuantity - item.received),
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
          <Progress value={getTotalProgress()} className="h-3" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            {getTotalProgress().toFixed(1)}% of delivered books received
          </p>
        </CardContent>
      </Card>

      {/* Stock Entry Card */}
      <Card className="w-full max-w-5xl mx-auto mb-6">
        <CardHeader>
          <CardTitle>Add Stock Entry</CardTitle>
          <CardDescription>
            Record books received from a delivered e-challan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                E-Challan
              </label>
              <Select
                value={selectedChallan}
                onValueChange={setSelectedChallan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select challan" />
                </SelectTrigger>
                <SelectContent>
                  {challans.map((challan) => (
                    <SelectItem key={challan.id} value={challan.id}>
                      {challan.challanNo} - {challan.destinationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Book</label>
              <Select
                value={selectedBook}
                onValueChange={setSelectedBook}
                disabled={!selectedChallan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  {availableBooks.map((book) => (
                    <SelectItem key={book.id} value={book.bookId}>
                      {book.book.title} - Class {book.book.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quantity Received
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={addStockEntry}
                disabled={
                  addingStock || !selectedChallan || !selectedBook || !quantity
                }
                className="w-full"
              >
                {addingStock ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Received Books Table */}
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Books Received from E-Challans</CardTitle>
          <CardDescription>
            Track books received against delivered e-challans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {received.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No books delivered to school yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-3 text-left">Challan No</th>
                    <th className="border p-3 text-left">Book</th>
                    <th className="border p-3 text-left">Class</th>
                    <th className="border p-3 text-left">Subject</th>
                    <th className="border p-3 text-center">Delivered</th>
                    <th className="border p-3 text-center">Received</th>
                    <th className="border p-3 text-center">Pending</th>
                    <th className="border p-3 text-center">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {received.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border p-3 font-mono text-sm">
                        {item.challanNo}
                      </td>
                      <td className="border p-3">{item.bookName}</td>
                      <td className="border p-3 text-center">{item.class}</td>
                      <td className="border p-3">{item.subject}</td>
                      <td className="border p-3 text-center font-semibold">
                        {item.totalQuantity}
                      </td>
                      <td className="border p-3 text-center font-semibold text-green-600">
                        {item.received}
                      </td>
                      <td className="border p-3 text-center font-semibold text-orange-600">
                        {item.totalQuantity - item.received}
                      </td>
                      <td className="border p-3">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={getItemProgress(item)}
                            className="flex-1 h-2"
                          />
                          <span className="text-xs text-gray-600 min-w-[40px]">
                            {getItemProgress(item).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
