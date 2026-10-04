import { ImageSourcePropType } from "react-native";

export interface CraftCategory {
  id: string;
  name: string;
  icon: string;
  iconFamily: "Feather" | "MaterialCommunityIcons";
  bgColor?: string;
  description?: string;
}

export interface Artisan {
  id: string;
  name: string;
  craft: string;
  location: string;
  pricePerHour: number;
  rating: number;
  image: ImageSourcePropType;
  badge?: string;
  experienceYears?: number;
  availableDays?: string[];
  reviewsCount?: number;
  about?: string;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  authorAvatar?: ImageSourcePropType;
  image: ImageSourcePropType;
  readTime?: string;
  summary?: string;
}

export interface FeaturedExperience {
  id: string;
  badge: string;
  title: string;
  craft: string;
  location: string;
  description: string;
  masterArtisan: string;
  price: number;
  duration: string;
  image: ImageSourcePropType;
  highlights: string[];
}

export interface HeritageLocation {
  id: string;
  city: string;
  state: string;
  popularCraft: string;
}
