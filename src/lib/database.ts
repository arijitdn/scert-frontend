import supabase from "./supabase";
import {
  Book,
  BacklogEntry,
  BacklogEntryWithBook,
  ProfileType,
} from "@/types/database";

export class DatabaseService {
  // Fetch all books
  static async getBooks(): Promise<Book[]> {
    try {
      const { data, error } = await supabase
        .from("Book")
        .select("*")
        .order("class", { ascending: true });

      if (error) {
        console.error("Error fetching books:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getBooks:", error);
      throw error;
    }
  }

  // Filter books by criteria
  static async getFilteredBooks(filters: {
    class?: string;
    subject?: string;
    category?: string;
    academic_year?: string;
  }): Promise<Book[]> {
    try {
      let query = supabase.from("Book").select("*");

      if (filters.class) {
        query = query.eq("class", filters.class);
      }
      if (filters.subject) {
        query = query.eq("subject", filters.subject);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.academic_year) {
        query = query.eq("academic_year", filters.academic_year);
      }

      const { data, error } = await query.order("title", { ascending: true });

      if (error) {
        console.error("Error fetching filtered books:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getFilteredBooks:", error);
      throw error;
    }
  }

  // Get unique values for filter dropdowns
  static async getUniqueValues(
    column: "class" | "subject" | "category" | "academic_year",
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("Book")
        .select(column)
        .not(column, "is", null);

      if (error) {
        console.error(`Error fetching unique ${column}:`, error);
        throw error;
      }

      const uniqueValues = [
        ...new Set(data?.map((item) => item[column]) || []),
      ];
      return uniqueValues.sort();
    } catch (error) {
      console.error(`Error in getUniqueValues for ${column}:`, error);
      throw error;
    }
  }

  // Check if backlog entry exists for a book
  static async getExistingBacklogEntry(
    bookId: string,
    type: ProfileType,
    userId: string,
  ): Promise<BacklogEntry | null> {
    try {
      const { data, error } = await supabase
        .from("Stock")
        .select("*")
        .eq("bookId", bookId)
        .eq("type", type)
        .eq("userId", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error
        console.error("Error checking existing backlog entry:", error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error("Error in getExistingBacklogEntry:", error);
      throw error;
    }
  }

  // Create backlog entry
  static async createBacklogEntry(
    entry: Omit<BacklogEntry, "id">,
  ): Promise<BacklogEntry> {
    try {
      const { data, error } = await supabase
        .from("Stock")
        .insert([
          {
            bookId: entry.bookId,
            type: entry.type,
            userId: entry.userId,
            quantity: entry.quantity,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating backlog entry:", error);
        console.error("Full error details:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in createBacklogEntry:", error);
      throw error;
    }
  }

  // Create or update backlog entry (upsert)
  static async createOrUpdateBacklogEntry(
    entry: Omit<BacklogEntry, "id">,
  ): Promise<BacklogEntry> {
    try {
      // Check if entry already exists
      const existingEntry = await this.getExistingBacklogEntry(
        entry.bookId,
        entry.type,
        entry.userId,
      );

      if (existingEntry) {
        // Add to existing entry quantity
        const updatedQuantity = existingEntry.quantity + entry.quantity;
        return await this.updateBacklogEntry(existingEntry.id!, {
          ...existingEntry,
          quantity: updatedQuantity,
        });
      } else {
        // Create new entry
        return await this.createBacklogEntry(entry);
      }
    } catch (error) {
      console.error("Error in createOrUpdateBacklogEntry:", error);
      throw error;
    }
  }

  // Update backlog entry
  static async updateBacklogEntry(
    id: string,
    entry: Partial<BacklogEntry>,
  ): Promise<BacklogEntry> {
    try {
      const { data, error } = await supabase
        .from("Stock")
        .update({
          bookId: entry.bookId,
          type: entry.type,
          userId: entry.userId,
          quantity: entry.quantity,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating backlog entry:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateBacklogEntry:", error);
      throw error;
    }
  }

  // Delete backlog entry
  static async deleteBacklogEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("Stock").delete().eq("id", id);

      if (error) {
        console.error("Error deleting backlog entry:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deleteBacklogEntry:", error);
      throw error;
    }
  }

  // Get all backlog entries with book details
  static async getBacklogEntries(
    type?: ProfileType,
    userId?: string,
  ): Promise<BacklogEntryWithBook[]> {
    try {
      let query = supabase
        .from("Stock")
        .select(
          `
          *,
          book:Book(*)
        `,
        )
        .order("createdAt", { ascending: false });

      if (type) {
        query = query.eq("type", type);
      }
      if (userId) {
        query = query.eq("userId", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching backlog entries:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getBacklogEntries:", error);
      throw error;
    }
  }

  // Batch create backlog entries
  static async createBacklogEntries(
    entries: Omit<BacklogEntry, "id">[],
  ): Promise<BacklogEntry[]> {
    try {
      const { data, error } = await supabase
        .from("Stock")
        .insert(
          entries.map((entry) => ({
            bookId: entry.bookId,
            type: entry.type,
            userId: entry.userId,
            quantity: entry.quantity,
          })),
        )
        .select();

      if (error) {
        console.error("Error creating backlog entries:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in createBacklogEntries:", error);
      throw error;
    }
  }
}
