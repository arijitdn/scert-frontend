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
import { useState, useEffect } from "react";
import { booksAPI, stockAPI, requisitionsAPI, schoolsAPI } from "@/lib/api";
import type { School, StockWithBook, Requisition } from "@/types/database";

// Types
interface Book {
  id: string;
  title: string;
  class: string;
  subject: string;
  category: string;
  rate: number;
  academic_year: string;
}

const schoolUdise = "16010100108";

export default function SchoolRequisition() {
  // Step-wise selection states
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  // Selection states
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [quantity, setQuantity] = useState("");

  // Data states
  const [school, setSchool] = useState<School | null>(null);
  const [schoolStock, setSchoolStock] = useState<StockWithBook[]>([]);
  const [currentRequisitions, setCurrentRequisitions] = useState<
    Array<{
      bookId: string;
      bookName: string;
      className: string;
      subject: string;
      category: string;
      quantity: number;
    }>
  >([]);
  const [pastRequisitions, setPastRequisitions] = useState<Requisition[]>([]);
  const [selectedStockClass, setSelectedStockClass] = useState("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // First, get the school's database ID from the UDISE code
      const schoolsResponse = await schoolsAPI.getAll();
      const schools: School[] = schoolsResponse.data.data;
      const schoolData = schools.find((s) => s.udise === schoolUdise);

      if (!schoolData) {
        throw new Error(`School with UDISE ${schoolUdise} not found`);
      }

      console.log("Found school:", schoolData);
      setSchool(schoolData);

      // Load all books to get unique classes
      const booksResponse = await booksAPI.getAll();
      const allBooks: Book[] = booksResponse.data.data;
      const uniqueClasses = [...new Set(allBooks.map((book) => book.class))];
      setClasses(uniqueClasses);

      if (uniqueClasses.length > 0) {
        setSelectedStockClass(uniqueClasses[0]);
      }

      // Load school stock using UDISE (stock API might still use UDISE)
      const stockResponse = await stockAPI.getBySchool(schoolUdise);
      const stock: StockWithBook[] = stockResponse.data.data;
      setSchoolStock(stock);

      // Load past requisitions for this school using database ID
      const requisitionsResponse = await requisitionsAPI.getBySchool(
        schoolData.id,
      );
      const requisitions: Requisition[] = requisitionsResponse.data.data;
      console.log("Loaded requisitions in initial load:", requisitions);
      setPastRequisitions(requisitions);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load subjects when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadSubjects();
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedClass]);

  const loadSubjects = async () => {
    try {
      const booksResponse = await booksAPI.getAll({ class: selectedClass });
      const classBooks: Book[] = booksResponse.data.data;
      const uniqueSubjects = [
        ...new Set(classBooks.map((book) => book.subject)),
      ];
      setSubjects(uniqueSubjects);
      setSelectedSubject("");
      setCategories([]);
      setSelectedCategory("");
      setBooks([]);
      setSelectedBook("");
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  // Load categories when subject is selected
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadCategories();
    } else {
      setCategories([]);
      setSelectedCategory("");
    }
  }, [selectedClass, selectedSubject]);

  const loadCategories = async () => {
    try {
      const booksResponse = await booksAPI.getAll({
        class: selectedClass,
        subject: selectedSubject,
      });
      const classSubjectBooks: Book[] = booksResponse.data.data;
      const uniqueCategories = [
        ...new Set(classSubjectBooks.map((book) => book.category)),
      ];
      setCategories(uniqueCategories);
      setSelectedCategory("");
      setBooks([]);
      setSelectedBook("");
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Load books when category is selected
  useEffect(() => {
    if (selectedClass && selectedSubject && selectedCategory) {
      loadBooks();
    } else {
      setBooks([]);
      setSelectedBook("");
    }
  }, [selectedClass, selectedSubject, selectedCategory]);

  const loadBooks = async () => {
    try {
      const booksResponse = await booksAPI.getAll({
        class: selectedClass,
        subject: selectedSubject,
        category: selectedCategory,
      });
      const filteredBooks: Book[] = booksResponse.data.data;
      setBooks(filteredBooks);
      setSelectedBook("");
    } catch (error) {
      console.error("Error loading books:", error);
    }
  };

  // Get current stock for selected book
  const getBookStock = () => {
    if (!selectedBook) return 0;
    const stockItem = schoolStock.find(
      (stock) => stock.bookId === selectedBook,
    );
    return stockItem?.quantity || 0;
  };

  // Add to current requisition
  const handleAddRequisition = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBook || !quantity) return;

    const book = books.find((b) => b.id === selectedBook);
    if (!book) return;

    const newItem = {
      bookId: selectedBook,
      bookName: book.title,
      className: selectedClass,
      subject: selectedSubject,
      category: selectedCategory,
      quantity: parseInt(quantity),
    };

    setCurrentRequisitions((prev) => [...prev, newItem]);

    // Reset form
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedCategory("");
    setSelectedBook("");
    setQuantity("");
  };

  // Generate a unique requisition ID in format REQ-YYYYMMDDHHMMSS-XXX
  const generateReqId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `REQ-${year}${month}${day}${hours}${minutes}${seconds}-${random}`;
  };

  // Submit all current requisitions
  const handleSubmitAll = async () => {
    if (currentRequisitions.length === 0) {
      alert("No requisitions to submit.");
      return;
    }

    if (!school) {
      alert("School information not loaded. Please refresh and try again.");
      return;
    }

    try {
      setSubmitting(true);

      // Create individual requisitions for each book
      const createPromises = currentRequisitions.map((item) =>
        requisitionsAPI.create({
          schoolId: school.id, // Use the database ID, not UDISE
          bookId: item.bookId,
          quantity: item.quantity,
          reqId: generateReqId(),
        }),
      );

      // Wait for all requisitions to be created
      await Promise.all(createPromises);
      console.log("All requisitions created successfully");

      // Reload past requisitions using the school's database ID
      const requisitionsResponse = await requisitionsAPI.getBySchool(school.id);
      const requisitions: Requisition[] = requisitionsResponse.data.data;
      console.log("Reloaded requisitions after submission:", requisitions);
      setPastRequisitions(requisitions);

      // Clear current requisitions
      setCurrentRequisitions([]);

      alert("Requisitions submitted successfully!");
    } catch (error) {
      console.error("Error submitting requisitions:", error);
      alert("Error submitting requisitions. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Remove item from current requisitions
  const removeCurrentRequisition = (index: number) => {
    setCurrentRequisitions((prev) => prev.filter((_, i) => i !== index));
  };

  // Filter stock by selected class
  const getFilteredStock = () => {
    if (!selectedStockClass) return schoolStock;
    return schoolStock.filter(
      (stock) => stock.book?.class === selectedStockClass,
    );
  };

  if (loading) {
    return (
      <AdminLayout
        title="Book Requisition"
        description="Request new books for your school and track requisition status"
        adminLevel="SCHOOL ADMIN"
      >
        <div className="flex justify-center items-center h-64">
          <div>Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Book Requisition"
      description="Request new books for your school and track requisition status"
      adminLevel="SCHOOL ADMIN"
    >
      {/* Stock Display */}
      <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300 mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-900">
            Current Stock
          </CardTitle>
          <CardDescription>
            View available books in your school stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <select
              className="border rounded px-3 py-2 bg-background"
              value={selectedStockClass}
              onChange={(e) => setSelectedStockClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg bg-white">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Book Name</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredStock().length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-8">
                      No stock available
                    </td>
                  </tr>
                ) : (
                  getFilteredStock().map((stock) => (
                    <tr key={stock.id} className="border-b">
                      <td className="px-4 py-2">{stock.book?.class}</td>
                      <td className="px-4 py-2">{stock.book?.subject}</td>
                      <td className="px-4 py-2">{stock.book?.category}</td>
                      <td className="px-4 py-2">{stock.book?.title}</td>
                      <td className="px-4 py-2">{stock.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create New Requisition */}
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-green-100 to-green-50 border-green-300 mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-green-900">
            Create New Requisition
          </CardTitle>
          <CardDescription>
            Select books step by step to create a requisition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleAddRequisition}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                  disabled={!selectedClass}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                  disabled={!selectedSubject}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Book Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Book</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  required
                  disabled={!selectedCategory}
                >
                  <option value="">Select Book</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Show current stock for selected book */}
            {selectedBook && (
              <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                <strong>Current Stock:</strong> {getBookStock()} books available
              </div>
            )}

            {/* Quantity Input */}
            <div className="max-w-xs">
              <label className="block text-sm font-medium mb-1">
                Quantity Requested
              </label>
              <Input
                type="number"
                min={1}
                placeholder="Number of books needed"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={!selectedBook}
              />
            </div>

            <Button type="submit" disabled={!selectedBook} className="max-w-xs">
              Add to Requisition
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Requisitions */}
      <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300 mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">
            Current Requisition
          </CardTitle>
          <CardDescription>Items to be submitted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border rounded-lg bg-white">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Book Name</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRequisitions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-8">
                      No items in current requisition
                    </td>
                  </tr>
                ) : (
                  currentRequisitions.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{item.className}</td>
                      <td className="px-4 py-2">{item.subject}</td>
                      <td className="px-4 py-2">{item.category}</td>
                      <td className="px-4 py-2">{item.bookName}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCurrentRequisition(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Button
            onClick={handleSubmitAll}
            className="w-full"
            disabled={currentRequisitions.length === 0 || submitting}
          >
            {submitting ? "Submitting..." : "Submit All Requisitions"}
          </Button>
        </CardContent>
      </Card>

      {/* Past Requisitions */}
      <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300">
        <CardHeader>
          <CardTitle className="text-lg text-purple-900">
            Past Requisitions
          </CardTitle>
          <CardDescription>
            Track status of submitted requisitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg bg-white">
              <thead>
                <tr className="bg-purple-100">
                  <th className="px-4 py-2 text-left">Req ID</th>
                  <th className="px-4 py-2 text-left">Book Name</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Requested</th>
                  <th className="px-4 py-2 text-left">Received</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {pastRequisitions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-8">
                      No past requisitions found
                    </td>
                  </tr>
                ) : (
                  pastRequisitions.map((req) => (
                    <tr key={req.id} className="border-b">
                      <td className="px-4 py-2 font-mono text-sm">
                        {req.reqId}
                      </td>
                      <td className="px-4 py-2">
                        {req.book?.title || `Book ID: ${req.bookId}`}
                      </td>
                      <td className="px-4 py-2">{req.book?.class || "-"}</td>
                      <td className="px-4 py-2">{req.book?.subject || "-"}</td>
                      <td className="px-4 py-2">{req.quantity}</td>
                      <td className="px-4 py-2">0</td>
                      {/* No received tracking yet */}
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            req.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : req.status === "APPROVED"
                                ? "bg-blue-100 text-blue-800"
                                : req.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString()
                          : "N/A"}
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
