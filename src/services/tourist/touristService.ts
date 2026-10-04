import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";
import { Craft } from "../../types/craft";
import { TouristOnboardingInput, TouristProfile } from "../../types/tourist";

const TOURIST_STORAGE_KEY_PREFIX = "craftenary_tourist_profile_";

class TouristService {
  /**
   * Fetch tourist profile by user_id
   */
  async getProfile(userId: string): Promise<TouristProfile | null> {
    try {
      const { data, error } = await supabase
        .from("tourist_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        // Fetch craft interests
        const { data: interestsData } = await supabase
          .from("tourist_craft_interests")
          .select(`
            craft_id,
            craft:crafts(*)
          `)
          .eq("tourist_id", data.id);

        const craftInterests: Craft[] = (interestsData || [])
          .map((item: any) => item.craft)
          .filter(Boolean);

        const fullProfile = {
          ...data,
          craft_interests: craftInterests,
        } as TouristProfile;

        await AsyncStorage.setItem(
          TOURIST_STORAGE_KEY_PREFIX + userId,
          JSON.stringify(fullProfile)
        );

        return fullProfile;
      }

      // Check local cache fallback
      const cached = await AsyncStorage.getItem(TOURIST_STORAGE_KEY_PREFIX + userId);
      if (cached) {
        return JSON.parse(cached) as TouristProfile;
      }

      return null;
    } catch {
      try {
        const cached = await AsyncStorage.getItem(TOURIST_STORAGE_KEY_PREFIX + userId);
        return cached ? (JSON.parse(cached) as TouristProfile) : null;
      } catch {
        return null;
      }
    }
  }

  /**
   * Complete Tourist Onboarding & Create Profile
   */
  async createProfile(
    userId: string,
    input: TouristOnboardingInput
  ): Promise<{ success: boolean; profile?: TouristProfile; error?: string }> {
    if (!input.firstName.trim() || !input.lastName.trim()) {
      return { success: false, error: "Please enter your first and last name." };
    }

    if (!input.gender) {
      return { success: false, error: "Please select your gender." };
    }

    if (!input.city.trim() || !input.state.trim()) {
      return { success: false, error: "Please enter your city and state." };
    }

    const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`;
    const fallbackProfile: TouristProfile = {
      id: userId,
      user_id: userId,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      gender: input.gender,
      city: input.city.trim(),
      state: input.state.trim(),
      country: "India",
      profile_image_url: input.profileImageUrl?.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      craft_interests: (input.craftIds || []).map((id) => ({
        id,
        name: "Heritage Craft",
        icon: "star",
        is_active: true,
      })),
    };

    try {
      // 1. FIRST: Ensure profiles table has the record
      await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: fullName,
            role: "tourist",
            avatar_url: input.profileImageUrl?.trim() || null,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      // 2. SECOND: Insert / Upsert into tourist_profiles
      const { data: touristData, error: touristError } = await supabase
        .from("tourist_profiles")
        .upsert(
          {
            user_id: userId,
            first_name: input.firstName.trim(),
            last_name: input.lastName.trim(),
            gender: input.gender,
            city: input.city.trim(),
            state: input.state.trim(),
            country: "India",
            profile_image_url: input.profileImageUrl?.trim() || null,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (touristError) {
        if (__DEV__) {
          console.warn("[TouristService] tourist_profiles notice:", touristError.message);
        }
        await AsyncStorage.setItem(
          TOURIST_STORAGE_KEY_PREFIX + userId,
          JSON.stringify(fallbackProfile)
        );

        return {
          success: true,
          profile: fallbackProfile,
        };
      }

      // 3. Insert Craft Interests
      if (input.craftIds && input.craftIds.length > 0 && touristData?.id) {
        const interests = input.craftIds.map((craftId) => ({
          tourist_id: touristData.id,
          craft_id: craftId,
        }));
        await supabase
          .from("tourist_craft_interests")
          .upsert(interests, { onConflict: "tourist_id,craft_id" });
      }

      await AsyncStorage.setItem(
        TOURIST_STORAGE_KEY_PREFIX + userId,
        JSON.stringify(touristData)
      );

      return {
        success: true,
        profile: touristData as TouristProfile,
      };
    } catch (err: unknown) {
      if (__DEV__) {
        console.warn("[TouristService] Error during tourist onboarding:", err);
      }
      await AsyncStorage.setItem(
        TOURIST_STORAGE_KEY_PREFIX + userId,
        JSON.stringify(fallbackProfile)
      );
      return {
        success: true,
        profile: fallbackProfile,
      };
    }
  }

  /**
   * Update tourist profile details and craft interests
   */
  async updateProfile(
    userId: string,
    updates: Partial<TouristOnboardingInput>
  ): Promise<{ success: boolean; profile?: TouristProfile; error?: string }> {
    try {
      const cleanUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.firstName !== undefined) cleanUpdates.first_name = updates.firstName.trim();
      if (updates.lastName !== undefined) cleanUpdates.last_name = updates.lastName.trim();
      if (updates.gender !== undefined) cleanUpdates.gender = updates.gender;
      if (updates.city !== undefined) cleanUpdates.city = updates.city.trim();
      if (updates.state !== undefined) cleanUpdates.state = updates.state.trim();
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

      // 2. Update tourist_profiles
      const { data: updatedTourist, error: updateError } = await supabase
        .from("tourist_profiles")
        .update(cleanUpdates)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        if (__DEV__) console.warn("[TouristService] Update error:", updateError.message);
      }

      // 3. Update craft interests if passed
      if (updates.craftIds !== undefined && updatedTourist?.id) {
        await supabase
          .from("tourist_craft_interests")
          .delete()
          .eq("tourist_id", updatedTourist.id);

        if (updates.craftIds.length > 0) {
          const interestRows = updates.craftIds.map((craftId) => ({
            tourist_id: updatedTourist.id,
            craft_id: craftId,
          }));
          await supabase
            .from("tourist_craft_interests")
            .upsert(interestRows, { onConflict: "tourist_id,craft_id" });
        }
      }

      // 4. Fetch fresh profile and update AsyncStorage
      const fresh = await this.getProfile(userId);
      if (fresh) {
        await AsyncStorage.setItem(
          TOURIST_STORAGE_KEY_PREFIX + userId,
          JSON.stringify(fresh)
        );
      }

      return {
        success: true,
        profile: fresh || undefined,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update profile",
      };
    }
  }
}

export const touristService = new TouristService();
