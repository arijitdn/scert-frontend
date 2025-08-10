import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import supabase from "@/lib/supabase";

const ayOptions = ["2022-23", "2023-24", "2024-25"];
const classOptions = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
const subjectOptions = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Studies",
];

const initialFormData = {
  title: "",
  class: "",
  subject: "",
  category: "",
  rate: "",
  academic_year: "",
};

export default function RegistrationOfBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterValue, setFilterValue] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [formData, setFormData] = useState(initialFormData);

  async function fetchData() {
    const { data: booksData, error } = await supabase.from("Book").select("*");
    if (error) {
      console.error("Error fetching books:", error);
    } else {
      setBooks(booksData);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.academic_year ||
      !formData.class ||
      !formData.subject ||
      !formData.category ||
      !formData.title ||
      !formData.rate
    ) {
      alert("Please fill all fields");
      return;
    }

    await supabase.from("Book").upsert({
      ...formData,
      rate: Number(formData.rate),
    });

    // Reset form
    setFormData(initialFormData);

    fetchData();
  };

  const handleDelete = (idx: number) => {
    setBooks(books.filter((_, i) => i !== idx));
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setFormData({ ...books[idx] });
  };

  // Filtering logic
  let filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.className.toLowerCase().includes(search.toLowerCase()) ||
      book.subject.toLowerCase().includes(search.toLowerCase()),
  );
  if (filterType !== "All" && filterValue) {
    filteredBooks = filteredBooks.filter((book) =>
      filterType === "Subject"
        ? book.subject === filterValue
        : book.className === filterValue,
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AdminLayout
      title="Register Book"
      description="Add a new book to the state inventory"
      adminLevel="STATE ADMIN"
    >
      <div className="flex flex-col items-center min-h-[60vh]">
        <Card className="w-full max-w-xl shadow-lg bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-900">
              Book Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="font-medium text-purple-900">
                  AY (academic year)
                </label>
                <select
                  className="border rounded px-3 py-2 bg-background"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select AY</option>
                  {ayOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <label className="font-medium text-purple-900">Class</label>
                <select
                  className="border rounded px-3 py-2 bg-background"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Class</option>
                  {classOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <label className="font-medium text-purple-900">Subject</label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter subject"
                  required
                  className="border-purple-300"
                />

                <label className="font-medium text-purple-900">Category</label>
                <Input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter category"
                  required
                  className="border-purple-300"
                />

                <label className="font-medium text-purple-900">Title</label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter book title"
                  required
                  className="border-purple-300"
                />

                <label className="font-medium text-purple-900">
                  Current Rate
                </label>
                <Input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  placeholder="Enter current rate"
                  required
                  className="border-purple-300"
                />
              </div>
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  className="w-1/2 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-pink-500 hover:to-purple-500"
                >
                  {editIndex !== -1 ? "UPDATE" : "SUBMIT"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Bar and Filter */}
        <div className="w-full max-w-2xl mt-8 mb-4 flex flex-col md:flex-row gap-4 items-center">
          <Input
            type="text"
            placeholder="Search books by title, class, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded shadow border-blue-300"
          />
          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="border rounded px-3 py-2 border-green-300 bg-background"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue("");
              }}
            >
              <option value="All">All</option>
              <option value="Subject">Subject</option>
              <option value="Class">Class</option>
            </select>
            {filterType !== "All" && (
              <select
                className="border rounded px-3 py-2 border-green-300 bg-background"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option value="">Select {filterType}</option>
                {(filterType === "Subject" ? subjectOptions : classOptions).map(
                  (opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ),
                )}
              </select>
            )}
          </div>
        </div>

        {/* Book Table */}
        <div className="w-full max-w-5xl overflow-x-auto">
          <Table className="min-w-full bg-white border border-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead className="py-2 px-4 border-b">AY</TableHead>
                <TableHead className="py-2 px-4 border-b">Class</TableHead>
                <TableHead className="py-2 px-4 border-b">Subject</TableHead>
                <TableHead className="py-2 px-4 border-b">Category</TableHead>
                <TableHead className="py-2 px-4 border-b">Title</TableHead>
                <TableHead className="py-2 px-4 border-b">Rate</TableHead>

                <TableHead className="py-2 px-4 border-b">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book, idx) => (
                <TableRow key={idx} className="hover:bg-gray-50">
                  <TableCell className="py-2 px-4 border-b">
                    {book.academic_year}
                  </TableCell>
                  <TableCell className="py-2 px-4 border-b">
                    {book.class}
                  </TableCell>
                  <TableCell className="py-2 px-4 border-b">
                    {book.subject}
                  </TableCell>
                  <TableCell className="py-2 px-4 border-b">
                    {book.category}
                  </TableCell>
                  <TableCell className="py-2 px-4 border-b">
                    {book.title}
                  </TableCell>
                  <TableCell className="py-2 px-4 border-b">
                    ₹{book.rate}
                  </TableCell>

                  <TableCell className="py-2 px-4 border-b">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(idx)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
