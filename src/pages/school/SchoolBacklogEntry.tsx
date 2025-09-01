import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  Save as SaveIcon,
  PlusCircle,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { stockAPI, booksAPI } from "@/lib/api";
import { Book, BacklogEntry, BacklogEntryWithBook } from "@/types/database";

interface RowData {
  id: string;
  bookId: string;
  book?: Book;
  type: string;
  userId: string;
  quantity: string;
  isEditing: boolean;
  isNew: boolean;
}

export default function SchoolBacklogEntry() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [savedEntries, setSavedEntries] = useState<BacklogEntryWithBook[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  // Utility function to check if a book already exists
  const isBookAlreadyExists = (bookId: string, excludeRowId?: string) => {
    // Check in saved entries
    const existsInSaved = savedEntries.some((entry) => entry.bookId === bookId);

    // Check in current rows (excluding the specified row if provided)
    const existsInRows = rows.some(
      (row) => row.bookId === bookId && row.id !== excludeRowId,
    );

    return { existsInSaved, existsInRows };
  };

  // Apply filters to books
  useEffect(() => {
    let filtered = books;

    if (filterClass) {
      filtered = filtered.filter((book) => book.class === filterClass);
    }
    if (filterSubject) {
      filtered = filtered.filter((book) => book.subject === filterSubject);
    }
    if (filterCategory) {
      filtered = filtered.filter((book) => book.category === filterCategory);
    }

    setFilteredBooks(filtered);
  }, [books, filterClass, filterSubject, filterCategory]);

  const clearFilters = () => {
    setFilterClass("");
    setFilterSubject("");
    setFilterCategory("");
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [booksResponse, savedEntriesResponse] = await Promise.all([
          booksAPI.getAll({ enabled_only: true }),
          stockAPI.getAll({ type: "SCHOOL", userId: "16010100108" }),
        ]);

        const booksData: Book[] = booksResponse.data.data;
        const savedEntriesData: BacklogEntryWithBook[] =
          savedEntriesResponse.data.data;

        setBooks(booksData);
        setFilteredBooks(booksData);
        setSavedEntries(savedEntriesData);

        // Extract unique values from books
        const classesData = [...new Set(booksData.map((book) => book.class))];
        const subjectsData = [
          ...new Set(booksData.map((book) => book.subject)),
        ];
        const categoriesData = [
          ...new Set(booksData.map((book) => book.category)),
        ];

        setClasses(classesData);
        setSubjects(subjectsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        alert("Error loading data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleChange = (id: string, field: keyof RowData, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleBookSelect = (rowId: string, bookId: string) => {
    const selectedBook = books.find((book) => book.id === bookId);

    // Check if this book is already selected in existing saved entries
    const existingEntry = savedEntries.find((entry) => entry.bookId === bookId);
    if (existingEntry) {
      const shouldEdit = window.confirm(
        `This book "${selectedBook?.title}" already exists in your saved backlog entries with quantity ${existingEntry.quantity}. ` +
          `Do you want to edit the existing entry instead of creating a new one?`,
      );
      if (shouldEdit) {
        // Remove the current new row and edit the existing saved entry
        setRows((prev) => prev.filter((row) => row.id !== rowId));

        // Add the existing entry to rows for editing
        setRows((prev) => [
          ...prev,
          {
            id: existingEntry.id!,
            bookId: existingEntry.bookId,
            type: existingEntry.type,
            userId: existingEntry.userId,
            quantity: existingEntry.quantity.toString(),
            book: existingEntry.book,
            isEditing: true,
            isNew: false,
          },
        ]);
        return;
      } else {
        // User chose not to edit existing entry, reset the book selection
        setRows((prev) =>
          prev.map((row) =>
            row.id === rowId ? { ...row, bookId: "", book: undefined } : row,
          ),
        );
        return;
      }
    }

    // Check if this book is already selected in current rows (excluding current row)
    const duplicateRow = rows.find(
      (row) => row.id !== rowId && row.bookId === bookId,
    );
    if (duplicateRow) {
      const shouldEdit = window.confirm(
        `This book "${selectedBook?.title}" is already selected in another row. ` +
          `Do you want to edit the existing row instead?`,
      );
      if (shouldEdit) {
        // Remove the current new row and switch to editing the existing one
        setRows((prev) => prev.filter((row) => row.id !== rowId));
        setRows((prev) =>
          prev.map((row) =>
            row.id === duplicateRow.id ? { ...row, isEditing: true } : row,
          ),
        );
        return;
      } else {
        // User chose not to edit existing row, reset the book selection
        setRows((prev) =>
          prev.map((row) =>
            row.id === rowId ? { ...row, bookId: "", book: undefined } : row,
          ),
        );
        return;
      }
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, bookId, book: selectedBook } : row,
      ),
    );
  };

  const handleAddRow = () => {
    const newId = `temp-${Date.now()}`;
    setRows((prev) => [
      ...prev,
      {
        id: newId,
        bookId: "",
        type: "SCHOOL",
        userId: "16010100108",
        quantity: "",
        isEditing: true,
        isNew: true,
      },
    ]);
  };

  const handleEdit = (id: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, isEditing: true } : row)),
    );
  };

  const handleSave = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row || !row.bookId || !row.quantity) {
      alert("Please fill in all required fields");
      return;
    }

    // Additional validation: Check for duplicates if this is a new entry
    if (row.isNew) {
      const existingEntry = savedEntries.find(
        (entry) => entry.bookId === row.bookId,
      );
      if (existingEntry) {
        alert(
          `This book "${row.book?.title}" already exists in your saved entries. Please edit the existing entry instead of creating a new one.`,
        );
        return;
      }

      // Check for duplicates in other current rows
      const duplicateInRows = rows.find(
        (r) => r.id !== id && r.bookId === row.bookId && !r.isNew,
      );
      if (duplicateInRows) {
        alert(
          `This book "${row.book?.title}" is already being processed in another row. Please avoid duplicates.`,
        );
        return;
      }
    }

    setSaving(true);
    try {
      if (row.isNew) {
        // Create or update entry
        const entryResponse = await stockAPI.create({
          bookId: row.bookId,
          type: "SCHOOL",
          userId: "16010100108",
          quantity: parseInt(row.quantity),
        });

        const entry: BacklogEntryWithBook = entryResponse.data;

        // Update the row with the real ID from database
        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, id: entry.id!, isEditing: false, isNew: false }
              : r,
          ),
        );

        // Refresh saved entries
        const savedEntriesResponse = await stockAPI.getAll({
          type: "SCHOOL",
          userId: "16010100108",
        });
        const savedEntriesData: BacklogEntryWithBook[] =
          savedEntriesResponse.data.data;
        setSavedEntries(savedEntriesData);
      } else {
        // Update existing entry
        await stockAPI.update(id, {
          quantity: parseInt(row.quantity),
        });

        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isEditing: false } : r)),
        );

        // Refresh saved entries
        const savedEntriesResponse = await stockAPI.getAll({
          type: "SCHOOL",
          userId: "16010100108",
        });
        const savedEntriesData: BacklogEntryWithBook[] =
          savedEntriesResponse.data.data;
        setSavedEntries(savedEntriesData);
      }
    } catch (error) {
      console.error("Error saving row:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    if (window.confirm("Are you sure you want to delete this entry?")) {
      setSaving(true);
      try {
        if (!row.isNew) {
          // Delete from database if it's not a new entry
          await stockAPI.delete(id);

          // Refresh saved entries
          const savedEntriesResponse = await stockAPI.getAll({
            type: "SCHOOL",
            userId: "16010100108",
          });
          const savedEntriesData: BacklogEntryWithBook[] =
            savedEntriesResponse.data.data;
          setSavedEntries(savedEntriesData);
        }

        // Remove from rows
        setRows((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Error deleting row:", error);
        alert("Error deleting data. Please try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveAll = async () => {
    const unsavedRows = rows.filter(
      (row) => row.isEditing && row.bookId && row.quantity,
    );

    if (unsavedRows.length === 0) {
      alert("No unsaved changes to save.");
      return;
    }

    // Check for duplicates before saving
    const bookIds = unsavedRows.map((row) => row.bookId);
    const uniqueBookIds = new Set(bookIds);
    if (bookIds.length !== uniqueBookIds.size) {
      alert(
        "Duplicate books detected in the rows to be saved. Please ensure each book appears only once.",
      );
      return;
    }

    // Check for duplicates with existing saved entries (for new entries only)
    const newRows = unsavedRows.filter((row) => row.isNew);
    for (const row of newRows) {
      const existingEntry = savedEntries.find(
        (entry) => entry.bookId === row.bookId,
      );
      if (existingEntry) {
        alert(
          `Book "${row.book?.title}" already exists in your saved entries. Please remove it from the current rows or edit the existing entry instead.`,
        );
        return;
      }
    }

    setSaving(true);
    try {
      const promises = unsavedRows.map(async (row) => {
        if (row.isNew) {
          const entryResponse = await stockAPI.create({
            bookId: row.bookId,
            type: "SCHOOL",
            userId: "16010100108",
            quantity: parseInt(row.quantity),
          });
          const entry: BacklogEntryWithBook = entryResponse.data;
          return { oldId: row.id, newId: entry.id! };
        } else {
          await stockAPI.update(row.id, {
            quantity: parseInt(row.quantity),
          });
          return null;
        }
      });

      const results = await Promise.all(promises);

      // Update rows with new IDs and set as not editing
      setRows((prev) =>
        prev.map((row) => {
          if (unsavedRows.some((r) => r.id === row.id)) {
            const result = results.find((r) => r && r.oldId === row.id);
            return {
              ...row,
              id: result ? result.newId : row.id,
              isEditing: false,
              isNew: false,
            };
          }
          return row;
        }),
      );

      // Refresh saved entries
      const savedEntriesResponse = await stockAPI.getAll({
        type: "SCHOOL",
        userId: "16010100108",
      });
      const savedEntriesData: BacklogEntryWithBook[] =
        savedEntriesResponse.data.data;
      setSavedEntries(savedEntriesData);

      alert("All changes saved successfully!");
    } catch (error) {
      console.error("Error saving all rows:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSavedEntry = (entry: BacklogEntryWithBook) => {
    // Find if this book is already being edited in current rows
    const existingRow = rows.find(
      (row) => row.bookId === entry.bookId && row.isEditing,
    );

    if (existingRow) {
      alert(
        `This book is already being edited in row ${rows.indexOf(existingRow) + 1}. Please save or cancel that edit first.`,
      );
      return;
    }

    // Add this entry as a new row for editing
    const newRow: RowData = {
      id: entry.id,
      bookId: entry.bookId,
      book: entry.book,
      type: "SCHOOL",
      userId: "16010100108",
      quantity: entry.quantity.toString(),
      isEditing: true,
      isNew: false,
    };

    setRows((prev) => [...prev, newRow]);
  };

  const handleDeleteSavedEntry = async (entryId: string, bookTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the entry for "${bookTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await stockAPI.delete(entryId);

      // Refresh saved entries
      const savedEntriesResponse = await stockAPI.getAll({
        type: "SCHOOL",
        userId: "16010100108",
      });
      const savedEntriesData: BacklogEntryWithBook[] =
        savedEntriesResponse.data.data;
      setSavedEntries(savedEntriesData);

      alert(`Entry for "${bookTitle}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Error deleting entry. Please try again.");
    }
  };

  return (
    <AdminLayout
      title="School Backlog Entry"
      description="Enter class-wise backlog book details for your school"
      adminLevel="SCHOOL ADMIN"
    >
      <Card className="w-full max-w-6xl mx-auto mt-8 shadow-xl rounded-2xl border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>School Backlog Entry</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Class
                  </label>
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Subject
                  </label>
                  <Select
                    value={filterSubject}
                    onValueChange={setFilterSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Category
                  </label>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                    disabled={!filterClass && !filterSubject && !filterCategory}
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {(filterClass || filterSubject || filterCategory) && (
                <div className="mt-3 text-sm text-gray-600">
                  Showing {filteredBooks.length} of {books.length} books
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading books data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow border-separate border-spacing-0">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-green-100 to-green-200 text-green-900">
                    <th className="px-4 py-3 border-b font-semibold text-sm text-left rounded-tl-xl">
                      Book
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                      Class
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                      Subject
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                      Category
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                      Backlog Quantity
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-sm text-center rounded-tr-xl">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-400"
                      >
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
                        {row.isEditing ? (
                          <Select
                            value={row.bookId}
                            onValueChange={(value) =>
                              handleBookSelect(row.id, value)
                            }
                            disabled={saving}
                          >
                            <SelectTrigger className="w-64">
                              <SelectValue placeholder="Select book" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredBooks.map((book) => {
                                const { existsInSaved, existsInRows } =
                                  isBookAlreadyExists(book.id, row.id);
                                const isDisabled =
                                  existsInSaved || existsInRows;

                                return (
                                  <SelectItem
                                    key={book.id}
                                    value={book.id}
                                    disabled={isDisabled}
                                    className={
                                      isDisabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span>
                                        {book.title} ({book.class} -{" "}
                                        {book.subject})
                                      </span>
                                      {isDisabled && (
                                        <span className="text-xs text-red-500 ml-2">
                                          {existsInSaved
                                            ? "(Already saved)"
                                            : "(Already selected)"}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">
                            {row.book?.title || "Unknown Book"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b">
                        <span className="text-sm">
                          {row.book?.class || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b">
                        <span className="text-sm">
                          {row.book?.subject || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b">
                        <span className="text-sm">
                          {row.book?.category || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b">
                        <Input
                          type="number"
                          min={0}
                          value={row.quantity}
                          onChange={(e) =>
                            handleChange(row.id, "quantity", e.target.value)
                          }
                          placeholder="Quantity"
                          className="w-24 text-sm"
                          disabled={!row.isEditing || saving}
                        />
                      </td>
                      <td className="px-4 py-2 border-b text-center whitespace-nowrap">
                        {row.isEditing ? (
                          <Button
                            size="sm"
                            onClick={() => handleSave(row.id)}
                            className="mr-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow"
                            title="Save this row"
                            disabled={saving}
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <SaveIcon className="w-4 h-4 mr-1" />
                            )}
                            Save
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(row.id)}
                            className="mr-2 border-green-600 text-green-700 hover:bg-green-50 px-3 py-1 rounded"
                            title="Edit this row"
                            disabled={saving}
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
                          disabled={saving}
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
                  disabled={saving}
                >
                  <PlusCircle className="w-5 h-5" /> Add Row
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAll}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded shadow"
                  disabled={
                    saving || rows.filter((r) => r.isEditing).length === 0
                  }
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <SaveIcon className="w-5 h-5" />
                  )}
                  Save All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Books Table */}
      <Card className="w-full max-w-6xl mx-auto mt-8 shadow-xl rounded-2xl border-0">
        <CardHeader>
          <CardTitle>Saved Backlog Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left rounded-tl-xl">
                    Book Title
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Class
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Subject
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Category
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Backlog Quantity
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-left">
                    Date Added
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-sm text-center rounded-tr-xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {savedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No saved backlog entries yet.
                    </td>
                  </tr>
                ) : (
                  savedEntries.map((entry, idx) => {
                    const isBeingEdited = rows.some(
                      (row) => row.bookId === entry.bookId && row.isEditing,
                    );

                    return (
                      <tr
                        key={entry.id}
                        className={
                          isBeingEdited
                            ? "bg-yellow-100 hover:bg-yellow-200 transition"
                            : idx % 2 === 0
                              ? "bg-white hover:bg-blue-50 transition"
                              : "bg-blue-50 hover:bg-blue-100 transition"
                        }
                      >
                        <td className="px-4 py-2 border-b">
                          <div className="flex items-center gap-2">
                            {entry.book?.title || "Unknown Book"}
                            {isBeingEdited && (
                              <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                                Editing
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 border-b">
                          {entry.book?.class || "-"}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {entry.book?.subject || "-"}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {entry.book?.category || "-"}
                        </td>
                        <td className="px-4 py-2 border-b">{entry.quantity}</td>
                        <td className="px-4 py-2 border-b">
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-2 border-b text-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSavedEntry(entry)}
                            className="h-8 px-3"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteSavedEntry(
                                entry.id,
                                entry.book?.title || "Unknown Book",
                              )
                            }
                            className="h-8 px-3"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
