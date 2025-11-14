export type Category = "Audio" | "Video" | "Lighting" | "Networking" | "Rigging";

export interface Listing {
  id: string;
  make: string;
  model: string;
  category: Category;
  quantity?: number;
  dailyRateUSD?: number;
  locationCity?: string;
  locationState?: string;
  provider: {
    name: string;
    phone?: string;
    website?: string;
  };
  tags?: string[];
}

/* For upload/normalization */

export interface UploadRowRaw {
  [key: string]: unknown;
}

export interface ListingNormalized {
  id?: string;
  make: string;
  model: string;
  category: Category;
  quantity: number;
  dailyRateUSD?: number | null;
  locationCity?: string;
  locationState?: string;
  providerName?: string;
  tags?: string[];
}

/* For provider directory */

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
