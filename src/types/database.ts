export type ProfileType = "SCHOOL" | "BLOCK" | "DISTRICT" | "STATE";

export interface UserProfile {
  id: string;
  user_id: string; // The ID used for login (UDISE, block_code, district_code, or "STATE")
  role: "STATE" | "DISTRICT" | "BLOCK" | "SCHOOL" | "PRIVATE_SCHOOL";
  name?: string;
  district_code?: string;
  block_code?: string;
  school_id?: string;
  udise?: string;
  password_hash?: string;
  is_first_login?: boolean;
  created_at?: string;
  updated_at?: string;
}

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
  category: string;
  block_name: string;
  district: string;
  management: string;
  type: string;
  createdAt?: string;
  ClassEnrollment?: ClassEnrollment[];
}

export interface ClassEnrollment {
  id: string;
  school_id: string;
  class: string;
  students: number;
  createdAt?: string;
  updatedAt?: string;
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
  | "PENDING_BLOCK_APPROVAL"
  | "PENDING_DISTRICT_APPROVAL"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED_BY_BLOCK"
  | "REJECTED_BY_DISTRICT"
  | "REJECTED_BY_STATE";

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
  updatedAt?: string;
  // Relationships included by backend
  book?: Book;
  school?: School;
}

export interface RequisitionWithDetails extends Requisition {
  book?: Book;
  school?: School;
}
