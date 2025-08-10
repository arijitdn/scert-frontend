import supabase from "./supabase";
import {
  Book,
  BacklogEntry,
  BacklogEntryWithBook,
  ProfileType,
  School,
  Stock,
  StockWithBook,
  Requisition,
  RequisitionWithDetails,
  RequisitionStatus,
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

  // Get school stock with book details
  static async getSchoolStock(schoolId: string): Promise<StockWithBook[]> {
    try {
      const { data, error } = await supabase
        .from("Stock")
        .select(
          `
          *,
          book:Book(*)
        `,
        )
        .eq("type", "SCHOOL")
        .eq("userId", schoolId)
        .order("book(class)", { ascending: true });

      if (error) {
        console.error("Error fetching school stock:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getSchoolStock:", error);
      throw error;
    }
  }

  // Get state stock with book details
  static async getStateStock(): Promise<StockWithBook[]> {
    try {
      const { data, error } = await supabase
        .from("Stock")
        .select(
          `
          *,
          book:Book(*)
        `,
        )
        .eq("type", "STATE")
        .order("book(class)", { ascending: true });

      if (error) {
        console.error("Error fetching state stock:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getStateStock:", error);
      throw error;
    }
  }

  // Get school stock filtered by class
  static async getSchoolStockByClass(
    schoolId: string,
    className: string,
  ): Promise<StockWithBook[]> {
    try {
      const { data, error } = await supabase
        .from("Stock")
        .select(
          `
          *,
          book:Book(*)
        `,
        )
        .eq("type", "SCHOOL")
        .eq("userId", schoolId)
        .eq("book.class", className);

      if (error) {
        console.error("Error fetching school stock by class:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getSchoolStockByClass:", error);
      throw error;
    }
  }

  // Get subjects by class from books
  static async getSubjectsByClass(className: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("Book")
        .select("subject")
        .eq("class", className)
        .not("subject", "is", null);

      if (error) {
        console.error("Error fetching subjects by class:", error);
        throw error;
      }

      const uniqueSubjects = [
        ...new Set(data?.map((item) => item.subject) || []),
      ];
      return uniqueSubjects.sort();
    } catch (error) {
      console.error("Error in getSubjectsByClass:", error);
      throw error;
    }
  }

  // Get categories by class and subject
  static async getCategoriesByClassAndSubject(
    className: string,
    subject: string,
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("Book")
        .select("category")
        .eq("class", className)
        .eq("subject", subject)
        .not("category", "is", null);

      if (error) {
        console.error("Error fetching categories by class and subject:", error);
        throw error;
      }

      const uniqueCategories = [
        ...new Set(data?.map((item) => item.category) || []),
      ];
      return uniqueCategories.sort();
    } catch (error) {
      console.error("Error in getCategoriesByClassAndSubject:", error);
      throw error;
    }
  }

  // Get books by class, subject, and category
  static async getBooksByFilters(
    className: string,
    subject: string,
    category: string,
  ): Promise<Book[]> {
    try {
      const { data, error } = await supabase
        .from("Book")
        .select("*")
        .eq("class", className)
        .eq("subject", subject)
        .eq("category", category)
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching books by filters:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getBooksByFilters:", error);
      throw error;
    }
  }

  // Generate next requisition ID
  static async generateNextReqId(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("Requisition")
        .select("reqId")
        .order("reqId", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching last reqId:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        return "REQ0001";
      }

      const lastReqId = data[0].reqId;
      const lastNumber = parseInt(lastReqId.substring(3)); // Extract number from REQxxxx
      const nextNumber = lastNumber + 1;
      return `REQ${nextNumber.toString().padStart(4, "0")}`;
    } catch (error) {
      console.error("Error in generateNextReqId:", error);
      throw error;
    }
  }

  // Create new requisition
  static async createRequisition(
    requisition: Omit<Requisition, "id" | "reqId" | "createdAt" | "updated_at">,
  ): Promise<Requisition> {
    try {
      const reqId = await this.generateNextReqId();

      const { data, error } = await supabase
        .from("Requisition")
        .insert({
          reqId: reqId,
          bookId: requisition.bookId,
          schoolId: requisition.schoolId,
          quantity: requisition.quantity,
          received: requisition.received || 0,
          status: requisition.status || "PENDING",
          remarksByBlock: requisition.remarksByBlock,
          remarksByDistrict: requisition.remarksByDistrict,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating requisition:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in createRequisition:", error);
      throw error;
    }
  }

  // Get school requisitions with details
  static async getSchoolRequisitions(
    schoolId: string,
  ): Promise<RequisitionWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from("Requisition")
        .select(
          `
          *,
          book:Book(*)
        `,
        )
        .eq("schoolId", schoolId)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching school requisitions:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getSchoolRequisitions:", error);
      throw error;
    }
  }

  // Get block requisitions (all schools in the block)
  static async getBlockRequisitions(
    blockId: string,
  ): Promise<RequisitionWithDetails[]> {
    try {
      // First get all schools in the block
      const { data: schools, error: schoolError } = await supabase
        .from("School")
        .select("udise")
        .eq("block_code", blockId);

      if (schoolError) {
        console.error("Error fetching schools in block:", schoolError);
        throw schoolError;
      }

      if (!schools || schools.length === 0) {
        return [];
      }

      const schoolIds = schools.map((school) => school.udise);

      const { data, error } = await supabase
        .from("Requisition")
        .select(
          `
          *,
          book:Book(*)
        `,
        )
        .in("schoolId", schoolIds)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching block requisitions:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getBlockRequisitions:", error);
      throw error;
    }
  }

  // Get district requisitions (all schools in the district)
  static async getDistrictRequisitions(
    districtId: string,
  ): Promise<RequisitionWithDetails[]> {
    try {
      // First get all schools in the district
      const { data: schools, error: schoolError } = await supabase
        .from("School")
        .select("udise")
        .eq("district_code", districtId);

      if (schoolError) {
        console.error("Error fetching schools in district:", schoolError);
        throw schoolError;
      }

      if (!schools || schools.length === 0) {
        return [];
      }

      const schoolIds = schools.map((school) => school.udise);

      const { data, error } = await supabase
        .from("Requisition")
        .select(
          `
          *,
          book:Book(*)
        `,
        )
        .in("schoolId", schoolIds)
        .not("remarksByBlock", "is", null)
        .neq("remarksByBlock", "")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching district requisitions:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getDistrictRequisitions:", error);
      throw error;
    }
  }

  // Get all requisitions (state-level view)
  static async getAllRequisitions(): Promise<RequisitionWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from("Requisition")
        .select(
          `
          *,
          book:Book(*)
        `,
        )
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching all requisitions:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllRequisitions:", error);
      throw error;
    }
  }

  // Get requisition statistics for dashboard
  static async getRequisitionStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    completed: number;
    rejected: number;
  }> {
    try {
      const { data, error } = await supabase
        .from("Requisition")
        .select("status");

      if (error) {
        console.error("Error fetching requisition stats:", error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((r) => r.status === "PENDING").length || 0,
        approved: data?.filter((r) => r.status === "APPROVED").length || 0,
        completed: data?.filter((r) => r.status === "COMPLETED").length || 0,
        rejected: data?.filter((r) => r.status === "REJECTED").length || 0,
      };

      return stats;
    } catch (error) {
      console.error("Error in getRequisitionStats:", error);
      throw error;
    }
  }

  // Update requisition status and remarks
  static async updateRequisition(
    id: string,
    updates: Partial<
      Pick<
        Requisition,
        "status" | "remarksByBlock" | "remarksByDistrict" | "received"
      >
    >,
  ): Promise<Requisition> {
    try {
      const { data, error } = await supabase
        .from("Requisition")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating requisition:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateRequisition:", error);
      throw error;
    }
  }

  // Update stock quantity (used when sending books from state to districts)
  static async updateStockQuantity(
    bookId: string,
    type: ProfileType,
    userId: string,
    newQuantity: number,
  ): Promise<Stock> {
    try {
      const { data, error } = await supabase
        .from("Stock")
        .update({ quantity: newQuantity })
        .eq("bookId", bookId)
        .eq("type", type)
        .eq("userId", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating stock quantity:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateStockQuantity:", error);
      throw error;
    }
  }

  // Get school information by UDISE codes
  static async getSchoolsByIds(schoolIds: string[]): Promise<School[]> {
    try {
      if (!schoolIds.length) return [];

      const { data, error } = await supabase
        .from("School")
        .select("*")
        .in("udise", schoolIds);

      if (error) {
        console.error("Error fetching schools:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getSchoolsByIds:", error);
      throw error;
    }
  }
}
