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
