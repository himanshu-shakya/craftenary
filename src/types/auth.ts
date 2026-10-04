import { Session, User } from "@supabase/supabase-js";
import { ArtisanProfile } from "./artisan";
import { TouristProfile } from "./tourist";

export type UserRole = "tourist" | "artisan";

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  onboarding_completed: boolean;
  artisan_profile?: ArtisanProfile | null;
  tourist_profile?: TouristProfile | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  role?: UserRole;
  onboardingCompleted?: boolean;
}

export interface SignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignUpResult {
  success: boolean;
  user?: User;
  session?: Session | null;
  needsEmailVerification: boolean;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session | null;
  error?: string;
  requiresEmailVerification?: boolean;
}

export type AuthStatus =
  | "INITIALIZING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED"
  | "AUTHENTICATION_ERROR";
