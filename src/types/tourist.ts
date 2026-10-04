import { Craft } from "./craft";

export interface TouristProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  profile_image_url?: string;
  craft_interests?: Craft[];
  created_at?: string;
  updated_at?: string;
}

export interface TouristOnboardingInput {
  firstName: string;
  lastName: string;
  gender: string;
  city: string;
  state: string;
  profileImageUrl?: string;
  craftIds?: string[];
}
