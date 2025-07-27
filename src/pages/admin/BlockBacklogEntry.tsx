import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Save as SaveIcon, PlusCircle } from "lucide-react";

const initialRows = [
  { id: 1, class: "", category: "", subject: "", bookName: "", stock: "", isEditing: true },
];

const dummySavedBooks = [
  { id: 1, class: "1", category: "Fiction", subject: "Math", bookName: "Math Basics", stock: "100" },
  { id: 2, class: "2", category: "Non-Fiction", subject: "Science", bookName: "Science Explorer", stock: "150" },
  { id: 3, class: "3", category: "Fiction", subject: "English", bookName: "English Reader", stock: "200" },
];

export default function BlockBacklogEntry() {
  const [rows, setRows] = useState(initialRows);

  const handleChange = (id: number, field: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        class: "",
        subject: "",
        bookName: "",
        stock: "",
        isEditing: true,
      },
    ]);
  };

  const handleEdit = (id: number) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, isEditing: true } : row)),
    );
  };

  const handleSave = (id: number) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, isEditing: false } : row)),
    );
  };

  const handleDelete = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSaveAll = () => {
    setRows((prev) => prev.map((row) => ({ ...row, isEditing: false })));
    // You can add your save logic here (e.g., API call)
    alert("All rows saved!");
  };

  return (
    <AdminLayout
      title="Backlog Entry"
      description="Enter class-wise backlog book details for schools in your block"
    >
      <Card className="w-full max-w-4xl mx-auto mt-8 shadow-xl rounded-2xl border-0">
        <CardHeader>
          <CardTitle>Backlog Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-green-100 to-green-200 text-green-900">
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left rounded-tl-xl">
                    Class
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Category
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Subject
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Book Name
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Stock in hand
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-center rounded-tr-xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No backlog entries yet.
                    </td>
                  </tr>
                )}
                {rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-green-50 transition"
                        : "bg-green-50 hover:bg-green-100 transition"
                    }
                  >
                    <td className="px-4 py-2 border-b">
                      <Input
                        value={row.class}
                        onChange={(e) =>
                          handleChange(row.id, "class", e.target.value)
                        }
                        placeholder="Class"
                        className="w-full text-sm"
                        disabled={!row.isEditing}
                      />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <Input
                        value={row.category}
                        onChange={(e) =>
                          handleChange(row.id, "category", e.target.value)
                        }
                        placeholder="Category"
                        className="w-full text-sm"
                        disabled={!row.isEditing}
                      />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <Input
                        value={row.subject}
                        onChange={(e) =>
                          handleChange(row.id, "subject", e.target.value)
                        }
                        placeholder="Subject"
                        className="w-full text-sm"
                        disabled={!row.isEditing}
                      />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <Input
                        value={row.bookName}
                        onChange={(e) =>
                          handleChange(row.id, "bookName", e.target.value)
                        }
                        placeholder="Book Name"
                        className="w-full text-sm"
                        disabled={!row.isEditing}
                      />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <Input
                        type="number"
                        min={0}
                        value={row.stock}
                        onChange={(e) =>
                          handleChange(row.id, "stock", e.target.value)
                        }
                        placeholder="Stock"
                        className="w-full text-sm"
                        disabled={!row.isEditing}
                      />
                    </td>
                    <td className="px-4 py-2 border-b text-center whitespace-nowrap">
                      {row.isEditing ? (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleSave(row.id)}
                          className="mr-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow"
                          title="Save this row"
                        >
                          <SaveIcon className="w-4 h-4 mr-1" /> Save
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(row.id)}
                          className="mr-2 border-green-600 text-green-700 hover:bg-green-50 px-3 py-1 rounded"
                          title="Edit this row"
                        >
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(row.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
                        title="Delete this row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
              >
                <PlusCircle className="w-5 h-5" /> Add Row
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={handleSaveAll}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded shadow"
              >
                <SaveIcon className="w-5 h-5" /> Save All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Books Table */}
      <Card className="w-full max-w-4xl mx-auto mt-8 shadow-xl rounded-2xl border-0">
        <CardHeader>
          <CardTitle>Saved Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left rounded-tl-xl">
                    Class
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Category
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Subject
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Book Name
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left rounded-tr-xl">
                    Stock in hand
                  </th>
                </tr>
              </thead>
              <tbody>
                {dummySavedBooks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No saved books yet.
                    </td>
                  </tr>
                ) : (
                  dummySavedBooks.map((book, idx) => (
                    <tr
                      key={book.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white hover:bg-blue-50 transition"
                          : "bg-blue-50 hover:bg-blue-100 transition"
                      }
                    >
                      <td className="px-4 py-2 border-b">{book.class}</td>
                      <td className="px-4 py-2 border-b">{book.category}</td>
                      <td className="px-4 py-2 border-b">{book.subject}</td>
                      <td className="px-4 py-2 border-b">{book.bookName}</td>
                      <td className="px-4 py-2 border-b">{book.stock}</td>
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
