import { useCallback, useEffect, useState } from "react";
import { ArtisanOnboardingInput, ArtisanProfile } from "../types/artisan";
import { artisanService } from "../services/artisan/artisanService";

export interface UseArtisanProfileResult {
  profile: ArtisanProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProfile: (
    input: ArtisanOnboardingInput
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Partial<ArtisanOnboardingInput>
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useArtisanProfile = (userId?: string): UseArtisanProfileResult => {
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await artisanService.getProfile(userId);
      setProfile(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load artisan profile");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const createProfile = async (input: ArtisanOnboardingInput) => {
    if (!userId) return { success: false, error: "No user authenticated" };
    const res = await artisanService.createProfile(userId, input);
    if (res.success && res.profile) {
      setProfile(res.profile);
    }
    return res;
  };

  const updateProfile = async (updates: Partial<ArtisanOnboardingInput>) => {
    if (!userId) return { success: false, error: "No user authenticated" };
    const res = await artisanService.updateProfile(userId, updates);
    if (res.success && res.profile) {
      setProfile(res.profile);
    }
    await fetchProfile();
    return res;
  };

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    createProfile,
    updateProfile,
  };
};
