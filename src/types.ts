export type Category = "Audio" | "Video" | "Lighting" | "Networking" | "Rigging";

export interface Listing {
  id: string;
  make: string;
  model: string;
  category: Category;
  dailyRateUSD?: number;
  locationCity: string;
  locationState: string;
  provider: {
    name: string;
    phone?: string;
    website?: string;
  };
  tags?: string[];
  quantity?: number;
}
