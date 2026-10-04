import { Craft } from "./craft";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface ArtisanProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  craft_id: string;
  craft?: Craft;
  bio?: string;
  city: string;
  state: string;
  country: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  verification_status: VerificationStatus;
  verified_at?: string;
  experience_years: number;
  price_per_hour: number;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ArtisanOnboardingInput {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  craftId: string;
  bio?: string;
  experienceYears?: number;
  pricePerHour?: number;
  profileImageUrl?: string;
}
