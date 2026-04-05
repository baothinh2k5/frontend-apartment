export type PropertyType = 'nha' | 'chungcu' | 'canho' | 'villa';

export interface Property {
  id: number;
  image: string;
  title: string;
  price: string;
  priceValue?: number; // For sorting if needed later
  location: string;
  district?: string;
  city?: string;
  beds: number;
  baths: number;
  area: number;
  badge?: string;
  rating: number;
  reviewCount: number;
  propertyType: PropertyType;
  host?: {
    name: string;
    avatar?: string;
    isSuperHost?: boolean;
  };
  translations?: any[];
}
