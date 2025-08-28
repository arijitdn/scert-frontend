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
export default function BlockReceived({ adminLevel }: { adminLevel: string }) {
  const [receivedData, setReceivedData] = useState<ReceivedItem[]>([]);
  const [echallans, setEchallans] = useState<EChallan[]>([]);
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedChallanNo, setSelectedChallanNo] = useState<string | null>(
    null,
  );
  const [selectedBook, setSelectedBook] = useState<EChallanBook | null>(null);
  const [stockEntryData, setStockEntryData] = useState({
    challanNo: "",
    bookName: "",
    bookId: "",
    class: "",
    subject: "",
    totalQuantity: 0,
    received: 0,
    left: 0,
  });
  const { toast } = useToast();

  // Get available eChallan numbers that are delivered to block/IS
  const getAvailableEChallans = () => {
    const deliveredEChallans = echallans.filter(
      (challan) =>
        challan.status === "DELIVERED" && challan.destinationType === "IS", // Block level uses IS (Intermediate School) designation
    );

    console.log("Total eChallans:", echallans.length);
    console.log("Delivered to IS/Block eChallans:", deliveredEChallans.length);

    if (deliveredEChallans.length === 0) {
      console.log(
        "No delivered eChallans found, checking all statuses:",
        echallans
          .map((ch) => ch.status)
          .filter((v, i, arr) => arr.indexOf(v) === i),
      );
      // Fallback to show all eChallans if no delivered ones exist
      return echallans;
    }

    return deliveredEChallans;
  };

  // Get books from selected eChallan
  const getBooksFromSelectedChallan = () => {
    if (!selectedChallanNo) return [];

    const selectedChallan = echallans.find(
      (challan) => challan.challanNo === selectedChallanNo,
    );

    return selectedChallan ? selectedChallan.books || [] : [];
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch eChallans and stock data in parallel
        const [echallansResponse, stockResponse] = await Promise.all([
          echallanAPI.getAll(),
          stockAPI.getAll({ type: "BLOCK" }),
        ]);

        setEchallans(echallansResponse.data.data || []);
        setStockData(stockResponse.data.data || []);

        // Process received items from eChallans and stock
        const processedReceivedItems = processReceivedData(
          echallansResponse.data.data || [],
          stockResponse.data.data || [],
        );
        setReceivedData(processedReceivedItems);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data from server",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Process received data from eChallans and stock
  const processReceivedData = (
    echallans: EChallan[],
    stock: Stock[],
  ): ReceivedItem[] => {
    const receivedItems: ReceivedItem[] = [];

    // Get all books from delivered eChallans
    const deliveredEChallans = echallans.filter(
      (challan) =>
        challan.status === "DELIVERED" && challan.destinationType === "IS", // Block level uses IS designation
    );

    deliveredEChallans.forEach((challan) => {
      if (challan.books && challan.books.length > 0) {
        challan.books.forEach((book) => {
          // Check if we already have a stock entry for this book
          const stockEntry = stock.find(
            (s) => s.bookId === book.bookId && s.type === "BLOCK",
          );
          const receivedQuantity = stockEntry ? stockEntry.quantity : 0;

          receivedItems.push({
            id: `${challan.id}-${book.id}`,
            challanNo: challan.challanNo,
            bookName: book.bookName,
            bookId: book.bookId,
            class: book.className,
            subject: book.subject,
            totalQuantity: book.totalQuantity,
            received: receivedQuantity,
          });
        });
      }
    });

    return receivedItems;
  };

  const handleChallanChange = (value: string) => {
    setSelectedChallanNo(value);
    setSelectedBook(null);
    setStockEntryData({
      challanNo: value,
      bookName: "",
      bookId: "",
      class: "",
      subject: "",
      totalQuantity: 0,
      received: 0,
      left: 0,
    });
  };

  const handleBookChange = (value: string) => {
    const booksFromChallan = getBooksFromSelectedChallan();
    const book = booksFromChallan.find((b) => b.bookName === value);

    if (book) {
      setSelectedBook(book);

      // Check if there's existing stock for this book
      const existingStock = stockData.find(
        (stock) => stock.bookId === book.bookId && stock.type === "BLOCK",
      );
      const currentReceived = existingStock ? existingStock.quantity : 0;

      setStockEntryData({
        challanNo: selectedChallanNo || "",
        bookName: book.bookName,
        bookId: book.bookId,
        class: book.className,
        subject: book.subject,
        totalQuantity: book.totalQuantity,
        received: currentReceived,
        left: book.totalQuantity - currentReceived,
      });
    } else {
      setSelectedBook(null);
      setStockEntryData({
        challanNo: selectedChallanNo || "",
        bookName: value,
        bookId: "",
        class: "",
        subject: "",
        totalQuantity: 0,
        received: 0,
        left: 0,
      });
    }
  };

  const handleStockReceivedChange = (value: string) => {
    const num = Math.max(0, Number(value.replace(/[^0-9]/g, "")));
    const maxAllowed = stockEntryData.totalQuantity;
    const finalNum = Math.min(num, maxAllowed);

    setStockEntryData((prev) => ({
      ...prev,
      received: finalNum,
      left: prev.totalQuantity - finalNum,
    }));
  };

  const handleSaveStockEntry = async () => {
    if (
      !selectedChallanNo ||
      !selectedBook ||
      !stockEntryData.bookId ||
      stockEntryData.received === null ||
      stockEntryData.received === 0
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please select a Challan No, Book, and enter a valid Received quantity.",
        variant: "destructive",
      });
      return;
    }

    if (stockEntryData.received > stockEntryData.totalQuantity) {
      toast({
        title: "Validation Error",
        description:
          "Received quantity cannot be more than total quantity in challan.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Check if stock entry already exists for this book
      const existingStock = stockData.find(
        (stock) =>
          stock.bookId === stockEntryData.bookId && stock.type === "BLOCK",
      );

      if (existingStock) {
        // Update existing stock entry
        await stockAPI.update(existingStock.id, {
          quantity: stockEntryData.received,
        });
      } else {
        // Create new stock entry
        const stockEntry = {
          bookId: stockEntryData.bookId,
          quantity: stockEntryData.received,
          userId: "BLOCK_ADMIN", // Default block admin user ID
          type: "BLOCK",
        };

        await stockAPI.create(stockEntry);
      }

      // Update local state
      const existingIndex = receivedData.findIndex(
        (data) =>
          data.bookId === stockEntryData.bookId &&
          data.challanNo === stockEntryData.challanNo,
      );

      if (existingIndex > -1) {
        setReceivedData((prev) =>
          prev.map((row, index) =>
            index === existingIndex
              ? { ...row, received: stockEntryData.received }
              : row,
          ),
        );
      } else {
        const newReceivedItem: ReceivedItem = {
          id: `${selectedChallanNo}-${stockEntryData.bookId}`,
          challanNo: stockEntryData.challanNo,
          bookName: stockEntryData.bookName,
          bookId: stockEntryData.bookId,
          class: stockEntryData.class,
          subject: stockEntryData.subject,
          totalQuantity: stockEntryData.totalQuantity,
          received: stockEntryData.received,
        };
        setReceivedData((prev) => [...prev, newReceivedItem]);
      }

      // Refresh stock data to get the latest state
      try {
        const stockResponse = await stockAPI.getAll({ type: "BLOCK" });
        setStockData(stockResponse.data.data || []);
      } catch (refreshError) {
        console.warn("Failed to refresh stock data:", refreshError);
      }

      // Reset form
      setSelectedChallanNo(null);
      setSelectedBook(null);
      setStockEntryData({
        challanNo: "",
        bookName: "",
        bookId: "",
        class: "",
        subject: "",
        totalQuantity: 0,
        received: 0,
        left: 0,
      });

      toast({
        title: "Success",
        description: `Successfully ${existingStock ? "updated" : "created"} stock entry for ${stockEntryData.bookName}`,
      });
    } catch (error) {
      console.error("Error saving stock entry:", error);
      toast({
        title: "Error",
        description: "Failed to save stock entry",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Block Books Received"
        description="Loading block stock data..."
        adminLevel={adminLevel || "BLOCK ADMIN"}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading data...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Block Books Received"
      description="Manage books received at block level from eChallans"
      adminLevel={adminLevel || "BLOCK ADMIN"}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Books Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {receivedData.reduce((sum, item) => sum + item.received, 0)}
            </div>
            <p className="text-xs text-green-700">across all eChallans</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total in eChallans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {receivedData.reduce((sum, item) => sum + item.totalQuantity, 0)}
            </div>
            <p className="text-xs text-blue-700">books available</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending to Receive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {receivedData.reduce(
                (sum, item) => sum + (item.totalQuantity - item.received),
                0,
              )}
            </div>
            <p className="text-xs text-yellow-700">books pending</p>
          </CardContent>
        </Card>
      </div>
      {/* Stock Entry Card */}
      <Card className="w-full max-w-5xl mx-auto mb-8 bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Stock Entry</CardTitle>
          <CardDescription>
            Enter details for books received from eChallans at block level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                eChallan No
              </label>
              <Select
                onValueChange={handleChallanChange}
                value={selectedChallanNo || ""}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      getAvailableEChallans().length === 0
                        ? "No eChallans available"
                        : "Select eChallan No"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableEChallans().length === 0 ? (
                    <SelectItem value="no-challans" disabled>
                      No delivered eChallans found
                    </SelectItem>
                  ) : (
                    getAvailableEChallans().map((challan) => (
                      <SelectItem key={challan.id} value={challan.challanNo}>
                        {challan.challanNo} - {challan.destinationName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {getAvailableEChallans().length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No eChallans available. Please ensure there are delivered
                  eChallans to your block.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Name
              </label>
              <Select
                onValueChange={handleBookChange}
                value={selectedBook?.bookName || ""}
                disabled={!selectedChallanNo || saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Book Name" />
                </SelectTrigger>
                <SelectContent>
                  {getBooksFromSelectedChallan().map((book) => (
                    <SelectItem key={book.id} value={book.bookName}>
                      {book.bookName} (Class {book.className})
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
                Subject
              </label>
              <Input
                type="text"
                value={stockEntryData.subject}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Quantity in eChallan
              </label>
              <Input
                type="number"
                value={stockEntryData.totalQuantity}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Quantity
              </label>
              <Input
                type="number"
                value={stockEntryData.received}
                onChange={(e) => handleStockReceivedChange(e.target.value)}
                min="0"
                max={stockEntryData.totalQuantity}
                className="border-green-300 focus:border-green-500"
                placeholder={`Enter quantity (max: ${stockEntryData.totalQuantity})`}
                disabled={saving}
              />
              {stockEntryData.totalQuantity > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Maximum allowed: {stockEntryData.totalQuantity}
                </p>
              )}
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
          <div className="mt-4">
            <Button
              onClick={handleSaveStockEntry}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Save Stock Entry
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Received Items Table */}
      <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-purple-100 to-pink-50 border-purple-300">
        <CardHeader>
          <CardTitle className="text-lg text-purple-900">
            Books Received
          </CardTitle>
          <CardDescription>
            Overview of all books received at block level from eChallans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {receivedData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No books received yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead className="bg-gradient-to-r from-purple-200 to-pink-200">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">
                      eChallan No
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">Class</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Book Name
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Subject
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Total in eChallan
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Received
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receivedData.map((book, index) => (
                    <tr
                      key={book.id}
                      className={
                        index % 2 === 0
                          ? "bg-gradient-to-r from-purple-50 to-pink-50"
                          : "bg-white"
                      }
                    >
                      <td className="py-3 px-4">{book.challanNo}</td>
                      <td className="py-3 px-4">Class {book.class}</td>
                      <td className="py-3 px-4">{book.bookName}</td>
                      <td className="py-3 px-4">{book.subject}</td>
                      <td className="py-3 px-4">{book.totalQuantity}</td>
                      <td className="py-3 px-4">{book.received}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={(book.received / book.totalQuantity) * 100}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-600">
                            {Math.round(
                              (book.received / book.totalQuantity) * 100,
                            )}
                            %
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
