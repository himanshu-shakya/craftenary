import { useCallback, useEffect, useState } from "react";
import { Craft } from "../types/craft";
import { craftService } from "../services/craft/craftService";

export interface UseCraftsResult {
  crafts: Craft[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCrafts = (): UseCraftsResult => {
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await craftService.getCrafts();
      setCrafts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load crafts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrafts();
  }, [fetchCrafts]);

  return {
    crafts,
    isLoading,
    error,
    refetch: fetchCrafts,
  };
};
