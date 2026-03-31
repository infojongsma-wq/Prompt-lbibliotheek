export interface Category {
  id: number;
  name: string;
  slug: string;
  prompt_count?: number;
}

export interface Prompt {
  id: number;
  name: string;
  version: string;
  prompt_text: string;
  short_description: string;
  required_documents: string;
  maker_notes: string;
  created_at: string;
  updated_at: string;
}

export interface PromptWithDetails extends Prompt {
  categories: Category[];
  average_rating: number | null;
  rating_count: number;
}

export interface Rating {
  id: number;
  prompt_id: number;
  score: number;
  created_at: string;
}

export interface Comment {
  id: number;
  prompt_id: number;
  author: string;
  content: string;
  created_at: string;
}

export interface CreatePromptInput {
  name: string;
  version: string;
  category_ids: number[];
  short_description: string;
  prompt_text: string;
  required_documents: string[];
  maker_notes: string;
}
