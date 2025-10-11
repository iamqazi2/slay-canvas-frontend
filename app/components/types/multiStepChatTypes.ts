export type Step = "context" | "assets" | "chat";

export interface Source {
  id: number;
  title: string;
  description: string;
  type: "article" | "pdf";
  selected: boolean;
  url?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number | null;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_results: number;
  error: string | null;
}

export interface Message {
  id: number;
  content: string;
  role: "user" | "agent";
  created_at: string;
  user_id: number;
}

export interface Note {
  id: number;
  content: string;
  role: "user" | "agent";
  created_at: string;
  notes: boolean;
}