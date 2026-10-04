import { useCallback, useEffect, useState } from "react";
import { TouristOnboardingInput, TouristProfile } from "../types/tourist";
import { touristService } from "../services/tourist/touristService";

export interface UseTouristProfileResult {
  profile: TouristProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProfile: (
    input: TouristOnboardingInput
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Partial<TouristOnboardingInput>
  ) => Promise<{ success: boolean; profile?: TouristProfile; error?: string }>;
}

export const useTouristProfile = (userId?: string): UseTouristProfileResult => {
  const [profile, setProfile] = useState<TouristProfile | null>(null);
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
      const data = await touristService.getProfile(userId);
      setProfile(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tourist profile");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const createProfile = async (input: TouristOnboardingInput) => {
    if (!userId) return { success: false, error: "No user authenticated" };
    const res = await touristService.createProfile(userId, input);
    if (res.success && res.profile) {
      setProfile(res.profile);
    }
    return res;
  };

  const updateProfile = async (updates: Partial<TouristOnboardingInput>) => {
    if (!userId) return { success: false, error: "No user authenticated" };
    const res = await touristService.updateProfile(userId, updates);
    if (res.success && res.profile) {
      setProfile(res.profile);
    }
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
