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
import { stockAPI, requisitionsAPI, booksAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types for API data
interface Book {
  id: string;
  title: string;
  class: string;
  subject: string;
  category: string;
  rate: number;
  academic_year: string;
}

interface Requisition {
  id: string;
  reqId: string;
  schoolId: string;
  bookId: string;
  quantity: number;
  received: number;
  status: string;
  book: Book;
  school: {
    id: string;
    name: string;
    udise: string;
  };
}

interface Stock {
  id: string;
  bookId: string;
  userId: string;
  type: string;
  quantity: number;
  book: Book;
  school?: {
    id: string;
    name: string;
    udise: string;
  };
}

interface ReceivedItem {
  id: string;
  class: string;
  bookName: string;
  bookId: string;
  medium: string;
  requisitioned: number;
  received: number;
}

export default function StateReceivedItems({
  adminLevel,
}: {
  adminLevel: string;
}) {
  const [receivedData, setReceivedData] = useState<ReceivedItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedBookName, setSelectedBookName] = useState<string | null>(null);
  const [stockEntryData, setStockEntryData] = useState({
    class: "",
    bookName: "",
    bookId: "",
    medium: "",
    requisitioned: 0,
    received: 0,
    left: 0,
  });
  const { toast } = useToast();

  // Get unique classes from approved requisitions
  const getAvailableClasses = () => {
    // First try to get from approved/completed requisitions
    let approvedRequisitions = requisitions.filter(
      (req) => req.status === "APPROVED" || req.status === "COMPLETED",
    );

    console.log("Total requisitions:", requisitions.length);
    console.log(
      "Approved/Completed requisitions:",
      approvedRequisitions.length,
    );

    // If no approved requisitions, show all requisitions for debugging
    if (approvedRequisitions.length === 0) {
      console.log(
        "No approved requisitions found, checking all statuses:",
        requisitions
          .map((req) => req.status)
          .filter((v, i, arr) => arr.indexOf(v) === i),
      );
      // Fallback to include all requisitions to at least show something
      approvedRequisitions = requisitions;
    }

    console.log(
      "Approved requisitions sample:",
      approvedRequisitions.slice(0, 3),
    );

    const classesSet = new Set(
      approvedRequisitions.map((req) => req.book?.class).filter(Boolean),
    );

    const classes = Array.from(classesSet).sort((a, b) => {
      // Sort numerically for class numbers
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });

    console.log("Available classes:", classes);
    return classes;
  };

  // Get books for selected class from approved requisitions
  const getFilteredBooks = () => {
    if (!selectedClass) return [];

    // First try approved/completed requisitions
    let approvedRequisitions = requisitions.filter(
      (req) =>
        (req.status === "APPROVED" || req.status === "COMPLETED") &&
        req.book.class === selectedClass,
    );

    // If no approved requisitions for this class, use all requisitions as fallback
    if (approvedRequisitions.length === 0) {
      approvedRequisitions = requisitions.filter(
        (req) => req.book.class === selectedClass,
      );
    }

    // Get unique books
    const booksMap = new Map();
    approvedRequisitions.forEach((req) => {
      if (!booksMap.has(req.book.id)) {
        booksMap.set(req.book.id, req.book);
      }
    });

    return Array.from(booksMap.values());
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch books, requisitions, and stock data in parallel
        const [booksResponse, requisitionsResponse, stockResponse] =
          await Promise.all([
            booksAPI.getAll(),
            requisitionsAPI.getAll(),
            stockAPI.getStateStock(),
          ]);

        setBooks(booksResponse.data.data || []);
        setRequisitions(requisitionsResponse.data.data || []);
        setStockData(stockResponse.data.data || []);

        // Process received items from requisitions and stock
        const processedReceivedItems = processReceivedData(
          requisitionsResponse.data.data || [],
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

  // Process received data from requisitions and stock
  const processReceivedData = (
    requisitions: Requisition[],
    stock: Stock[],
  ): ReceivedItem[] => {
    const receivedItems: ReceivedItem[] = [];

    // Group requisitions by book
    const bookRequistitonMap = new Map<string, Requisition[]>();
    requisitions.forEach((req) => {
      const key = req.bookId;
      if (!bookRequistitonMap.has(key)) {
        bookRequistitonMap.set(key, []);
      }
      bookRequistitonMap.get(key)!.push(req);
    });

    // Create received items from approved requisitions
    bookRequistitonMap.forEach((reqs, bookId) => {
      const approvedReqs = reqs.filter(
        (req) => req.status === "APPROVED" || req.status === "COMPLETED",
      );

      if (approvedReqs.length > 0) {
        const totalRequisitioned = approvedReqs.reduce(
          (sum, req) => sum + req.quantity,
          0,
        );

        // Get received quantity from stock data
        const stockEntry = stock.find(
          (s) => s.bookId === bookId && s.type === "STATE",
        );
        const totalReceived = stockEntry ? stockEntry.quantity : 0;

        const book = approvedReqs[0].book;

        receivedItems.push({
          id: bookId,
          class: book.class,
          bookName: book.title,
          bookId: book.id,
          medium: book.category || "General", // Use category as medium or default
          requisitioned: totalRequisitioned,
          received: totalReceived,
        });
      }
    });

    return receivedItems;
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedBookName(null);
    setStockEntryData({
      class: value,
      bookName: "",
      bookId: "",
      medium: "",
      requisitioned: 0,
      received: 0,
      left: 0,
    });
  };

  const handleBookNameChange = (value: string) => {
    setSelectedBookName(value);
    const filteredBooks = getFilteredBooks();
    const selectedBook = filteredBooks.find((book) => book.title === value);

    if (selectedBook) {
      // Find corresponding requisitions for this book - try approved first, then all
      let bookRequisitions = requisitions.filter(
        (req) =>
          req.bookId === selectedBook.id &&
          (req.status === "APPROVED" || req.status === "COMPLETED"),
      );

      // If no approved requisitions, use all requisitions for this book
      if (bookRequisitions.length === 0) {
        bookRequisitions = requisitions.filter(
          (req) => req.bookId === selectedBook.id,
        );
      }

      const totalRequisitioned = bookRequisitions.reduce(
        (sum, req) => sum + req.quantity,
        0,
      );

      // Check if there's existing stock for this book
      const existingStock = stockData.find(
        (stock) => stock.bookId === selectedBook.id && stock.type === "STATE",
      );
      const currentReceived = existingStock ? existingStock.quantity : 0;

      setStockEntryData({
        class: selectedBook.class,
        bookName: selectedBook.title,
        bookId: selectedBook.id,
        medium: selectedBook.category || "General", // Use category as medium or set default
        requisitioned: totalRequisitioned,
        received: currentReceived,
        left: totalRequisitioned - currentReceived,
      });
    } else {
      setStockEntryData({
        class: selectedClass || "",
        bookName: value,
        bookId: "",
        medium: "",
        requisitioned: 0,
        received: 0,
        left: 0,
      });
    }
  };

  const handleStockReceivedChange = (value: string) => {
    const num = Math.max(0, Number(value.replace(/[^0-9]/g, "")));
    const maxAllowed = stockEntryData.requisitioned;
    const finalNum = Math.min(num, maxAllowed); // Don't allow more than requisitioned

    setStockEntryData((prev) => ({
      ...prev,
      received: finalNum,
      left: prev.requisitioned - finalNum,
    }));
  };

  const handleSaveStockEntry = async () => {
    if (
      !selectedClass ||
      !selectedBookName ||
      !stockEntryData.bookId ||
      stockEntryData.received === null ||
      stockEntryData.received === 0
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please select a Class, Book Name, and enter a valid Received quantity.",
        variant: "destructive",
      });
      return;
    }

    if (stockEntryData.received > stockEntryData.requisitioned) {
      toast({
        title: "Validation Error",
        description:
          "Received quantity cannot be more than requisitioned quantity.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Check if stock entry already exists for this book
      const existingStock = stockData.find(
        (stock) =>
          stock.bookId === stockEntryData.bookId && stock.type === "STATE",
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
          userId: "STATE_ADMIN", // Default state admin user ID
          type: "STATE",
        };

        await stockAPI.create(stockEntry);
      }

      // Update local state
      const existingIndex = receivedData.findIndex(
        (data) => data.bookId === stockEntryData.bookId,
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
          id: stockEntryData.bookId,
          class: stockEntryData.class,
          bookName: stockEntryData.bookName,
          bookId: stockEntryData.bookId,
          medium: stockEntryData.medium,
          requisitioned: stockEntryData.requisitioned,
          received: stockEntryData.received,
        };
        setReceivedData((prev) => [...prev, newReceivedItem]);
      }

      // Refresh stock data to get the latest state
      try {
        const stockResponse = await stockAPI.getStateStock();
        setStockData(stockResponse.data.data || []);
      } catch (refreshError) {
        console.warn("Failed to refresh stock data:", refreshError);
      }

      // Reset form
      setSelectedClass(null);
      setSelectedBookName(null);
      setStockEntryData({
        class: "",
        bookName: "",
        bookId: "",
        medium: "",
        requisitioned: 0,
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
        title="State Stock Received"
        description="Loading state stock data..."
        adminLevel={adminLevel || "STATE ADMIN"}
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
      title="State Stock Received"
      description="Manage books received at state level"
      adminLevel={adminLevel || "STATE ADMIN"}
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
            <p className="text-xs text-green-700">across all classes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requisitioned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {receivedData.reduce((sum, item) => sum + item.requisitioned, 0)}
            </div>
            <p className="text-xs text-blue-700">books requested</p>
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
                (sum, item) => sum + (item.requisitioned - item.received),
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
            Enter details for books received at state level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <Select
                onValueChange={handleClassChange}
                value={selectedClass || ""}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      getAvailableClasses().length === 0
                        ? "No classes available"
                        : "Select Class"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableClasses().length === 0 ? (
                    <SelectItem value="no-classes" disabled>
                      No approved requisitions found
                    </SelectItem>
                  ) : (
                    getAvailableClasses().map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        Class {cls}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {getAvailableClasses().length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No classes available. Please ensure there are approved
                  requisitions in the system.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Name
              </label>
              <Select
                onValueChange={handleBookNameChange}
                value={selectedBookName || ""}
                disabled={!selectedClass || saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Book Name" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredBooks().map((book) => (
                    <SelectItem key={book.id} value={book.title}>
                      {book.title}
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
                Received Quantity
              </label>
              <Input
                type="number"
                value={stockEntryData.received}
                onChange={(e) => handleStockReceivedChange(e.target.value)}
                min="0"
                max={stockEntryData.requisitioned}
                className="border-green-300 focus:border-green-500"
                placeholder={`Enter quantity (max: ${stockEntryData.requisitioned})`}
                disabled={saving}
              />
              {stockEntryData.requisitioned > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Maximum allowed: {stockEntryData.requisitioned}
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
            Overview of all books received at state level
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
                    <th className="py-3 px-4 text-left font-semibold">Class</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Book Name
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Medium
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Requisitioned
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
                      <td className="py-3 px-4">Class {book.class}</td>
                      <td className="py-3 px-4">{book.bookName}</td>
                      <td className="py-3 px-4">{book.medium}</td>
                      <td className="py-3 px-4">{book.requisitioned}</td>
                      <td className="py-3 px-4">{book.received}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={(book.received / book.requisitioned) * 100}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-600">
                            {Math.round(
                              (book.received / book.requisitioned) * 100,
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
