import { useState, useEffect } from "react";
import { DatabaseService } from "@/lib/database";
import { Book } from "@/types/database";

export function useBookFilter() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [booksData, classesData, subjectsData, categoriesData] =
          await Promise.all([
            DatabaseService.getBooks(),
            DatabaseService.getUniqueValues("class"),
            DatabaseService.getUniqueValues("subject"),
            DatabaseService.getUniqueValues("category"),
          ]);

        setBooks(booksData);
        setFilteredBooks(booksData);
        setClasses(classesData);
        setSubjects(subjectsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading book data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = books;

    if (selectedClass) {
      filtered = filtered.filter((book) => book.class === selectedClass);
    }

    if (selectedSubject) {
      filtered = filtered.filter((book) => book.subject === selectedSubject);
    }

    if (selectedCategory) {
      filtered = filtered.filter((book) => book.category === selectedCategory);
    }

    setFilteredBooks(filtered);
  }, [books, selectedClass, selectedSubject, selectedCategory]);

  const clearFilters = () => {
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedCategory("");
  };

  return {
    books: filteredBooks,
    allBooks: books,
    classes,
    subjects,
    categories,
    loading,
    selectedClass,
    selectedSubject,
    selectedCategory,
    setSelectedClass,
    setSelectedSubject,
    setSelectedCategory,
    clearFilters,
  };
}
