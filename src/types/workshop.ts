import { ArtisanProfile } from "./artisan";
import { Craft } from "./craft";

export interface WorkshopImage {
  id: string;
  workshop_id: string;
  image_url: string;
  display_order: number;
  created_at?: string;
}

export interface Workshop {
  id: string;
  artisan_id: string;
  artisan?: ArtisanProfile;
  name: string;
  description: string;
  craft_id: string;
  craft?: Craft;
  location: string;
  city: string;
  state: string;
  price: number;
  duration: string;
  max_participants: number;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  images?: WorkshopImage[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateWorkshopInput {
  name: string;
  description: string;
  craftId: string;
  location: string;
  city: string;
  state: string;
  price: number;
  duration?: string;
  maxParticipants?: number;
  imageUrls: string[];
}
