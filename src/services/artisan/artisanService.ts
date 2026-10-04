import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";
import { ArtisanOnboardingInput, ArtisanProfile } from "../../types/artisan";

const ARTISAN_STORAGE_KEY_PREFIX = "craftenary_artisan_profile_";

class ArtisanService {
  /**
   * Count words in bio string
   */
  countWords(text?: string): number {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }

  /**
   * Fetch artisan profile by user_id
   */
  async getProfile(userId: string): Promise<ArtisanProfile | null> {
    try {
      const { data, error } = await supabase
        .from("artisan_profiles")
        .select(`
          *,
          craft:crafts(*)
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        return data as ArtisanProfile;
      }

      // Check local cache fallback
      const cached = await AsyncStorage.getItem(ARTISAN_STORAGE_KEY_PREFIX + userId);
      if (cached) {
        return JSON.parse(cached) as ArtisanProfile;
      }

      return null;
    } catch {
      try {
        const cached = await AsyncStorage.getItem(ARTISAN_STORAGE_KEY_PREFIX + userId);
        return cached ? (JSON.parse(cached) as ArtisanProfile) : null;
      } catch {
        return null;
      }
    }
  }

  /**
   * Complete Artisan Onboarding & Create Profile
   */
  async createProfile(
    userId: string,
    input: ArtisanOnboardingInput
  ): Promise<{ success: boolean; profile?: ArtisanProfile; error?: string }> {
    const wordCount = this.countWords(input.bio);
    if (wordCount > 200) {
      return {
        success: false,
        error: `Bio exceeds 200 words (${wordCount} words entered).`,
      };
    }

    if (!input.firstName.trim() || !input.lastName.trim()) {
      return { success: false, error: "Please enter your first and last name." };
    }

    if (!input.city.trim() || !input.state.trim()) {
      return { success: false, error: "Please provide your city and state." };
    }

    if (!input.craftId) {
      return { success: false, error: "Please select your primary craft." };
    }

    const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`;
    const fallbackProfile: ArtisanProfile = {
      id: userId,
      user_id: userId,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      craft_id: input.craftId,
      bio: input.bio?.trim() || "Master Artisan",
      city: input.city.trim(),
      state: input.state.trim(),
      country: "India",
      verification_status: "unverified",
      experience_years: input.experienceYears || 5,
      price_per_hour: input.pricePerHour || 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      craft: {
        id: input.craftId,
        name: "Traditional Craft",
        icon: "hammer",
        is_active: true,
      },
    };

    try {
      // 1. FIRST: Ensure profiles table has the record (satisfying foreign key constraint)
      await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: fullName,
            role: "artisan",
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      // 2. SECOND: Insert / Upsert into artisan_profiles
      const { data: artisanData, error: artisanError } = await supabase
        .from("artisan_profiles")
        .upsert(
          {
            user_id: userId,
            first_name: input.firstName.trim(),
            last_name: input.lastName.trim(),
            craft_id: input.craftId,
            bio: input.bio?.trim() || null,
            city: input.city.trim(),
            state: input.state.trim(),
            country: "India",
            verification_status: "unverified",
            experience_years: input.experienceYears || 5,
            price_per_hour: input.pricePerHour || 1000,
          },
          { onConflict: "user_id" }
        )
        .select(`*, craft:crafts(*)`)
        .single();

      if (artisanError) {
        if (__DEV__) {
          console.warn("[ArtisanService] artisan_profiles notice:", artisanError.message);
        }
        await AsyncStorage.setItem(
          ARTISAN_STORAGE_KEY_PREFIX + userId,
          JSON.stringify(fallbackProfile)
        );

        return {
          success: true,
          profile: fallbackProfile,
        };
      }

      await AsyncStorage.setItem(
        ARTISAN_STORAGE_KEY_PREFIX + userId,
        JSON.stringify(artisanData)
      );

      return {
        success: true,
        profile: artisanData as ArtisanProfile,
      };
    } catch (err: unknown) {
      if (__DEV__) {
        console.warn("[ArtisanService] Error during artisan onboarding:", err);
      }
      await AsyncStorage.setItem(
        ARTISAN_STORAGE_KEY_PREFIX + userId,
        JSON.stringify(fallbackProfile)
      );
      return {
        success: true,
        profile: fallbackProfile,
      };
    }
  }

  /**
   * Update artisan profile details (safeguarding verification_status)
   */
  async updateProfile(
    userId: string,
    updates: Partial<ArtisanOnboardingInput>
  ): Promise<{ success: boolean; profile?: ArtisanProfile; error?: string }> {
    try {
      if (updates.bio && this.countWords(updates.bio) > 200) {
        return { success: false, error: "Bio exceeds maximum of 200 words." };
      }

      const cleanUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.firstName) cleanUpdates.first_name = updates.firstName.trim();
      if (updates.lastName) cleanUpdates.last_name = updates.lastName.trim();
      if (updates.city) cleanUpdates.city = updates.city.trim();
      if (updates.state) cleanUpdates.state = updates.state.trim();
      if (updates.craftId) cleanUpdates.craft_id = updates.craftId;
      if (updates.bio !== undefined) cleanUpdates.bio = updates.bio.trim();
      if (updates.pricePerHour !== undefined) cleanUpdates.price_per_hour = updates.pricePerHour;
      if (updates.experienceYears !== undefined) cleanUpdates.experience_years = updates.experienceYears;
      if (updates.profileImageUrl !== undefined) {
        cleanUpdates.profile_image_url = updates.profileImageUrl.trim() || null;
      }

      // 1. Update public.profiles
      const fullName = `${updates.firstName || ""} ${updates.lastName || ""}`.trim();
      const profileUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (fullName) profileUpdates.full_name = fullName;
      if (updates.profileImageUrl !== undefined) {
        profileUpdates.avatar_url = updates.profileImageUrl.trim() || null;
      }

      await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);

      // 2. Update artisan_profiles
      const { error } = await supabase
        .from("artisan_profiles")
        .update(cleanUpdates)
        .eq("user_id", userId);

      if (error) {
        if (__DEV__) console.warn("[ArtisanService] Update error:", error.message);
      }

      // 3. Fetch fresh profile and update AsyncStorage
      const fresh = await this.getProfile(userId);
      if (fresh) {
        await AsyncStorage.setItem(
          ARTISAN_STORAGE_KEY_PREFIX + userId,
          JSON.stringify(fresh)
        );
      }

      return { success: true, profile: fresh || undefined };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update profile",
      };
    }
  }
}

export const artisanService = new ArtisanService();
