export type Category = "Audio" | "Video" | "Lighting" | "Networking" | "Rigging";

export interface UploadRowRaw {
  // flexible keys before normalization
  [key: string]: unknown;
}

export interface ListingNormalized {
  id?: string;                      // optional vendor id
  make: string;
  model: string;
  category: Category;
  quantity: number;
  dailyRateUSD?: number | null;
  locationCity?: string;
  locationState?: string;           // 2-letter preferred
  providerName?: string;
  tags?: string[];
}

export interface Provider {
  id: string;
  name: string;
  website?: string;
  phone?: string;
  city: string;
  state: string;
  categories: Category[];
  notes?: string;
}