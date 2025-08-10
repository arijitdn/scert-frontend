export type ProfileType = "SCHOOL" | "BLOCK" | "DISTRICT" | "STATE";

export interface Book {
  id: string;
  title: string;
  class: string;
  subject: string;
  category: string;
  rate: number;
  academic_year: string;
  createdAt?: string;
  updated_at?: string;
}

export interface BacklogEntry {
  id?: string;
  bookId: string;
  type: ProfileType;
  userId: string;
  quantity: number;
  createdAt?: string;
  updated_at?: string;
}

export interface BacklogEntryWithBook extends BacklogEntry {
  book?: Book;
}

export interface School {
  id: string;
  name: string;
  udise: string;
  block_code: string;
  district_code: string;
  state_id: string;
  createdAt?: string;
}

export interface Stock {
  id: string;
  bookId: string;
  type: ProfileType; // "DISTRICT" | "STATE" | "BLOCK" | "SCHOOL"
  userId: string;
  quantity: number;
  createdAt?: string;
  updated_at?: string;
}

export interface StockWithBook extends Stock {
  book?: Book;
}

export type RequisitionStatus =
  | "PENDING"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED";

export interface Requisition {
  id: string;
  reqId: string; // Format: REQ0001
  bookId: string;
  schoolId: string;
  quantity: number;
  received: number;
  status: RequisitionStatus;
  remarksByBlock?: string;
  remarksByDistrict?: string;
  createdAt?: string;
  updated_at?: string;
}

export interface RequisitionWithDetails extends Requisition {
  book?: Book;
  // school relationship not available in database schema
}
