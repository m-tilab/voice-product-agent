export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  inStock: boolean;
}

export interface AgentResponse {
  products: Product[];
  message: string;
  transcript: string;
  detectedLanguage?: string;
}

export interface TranscribeResponse {
  transcript: string;
  detectedLanguage: string;
  confidence: number;
}

export type RecordingState = "idle" | "recording" | "processing" | "done" | "error";
