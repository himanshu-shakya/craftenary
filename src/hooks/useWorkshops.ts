import { useCallback, useEffect, useState } from "react";
import { CreateWorkshopInput, Workshop } from "../types/workshop";
import { workshopService } from "../services/workshop/workshopService";

export interface UseWorkshopsOptions {
  city?: string;
  craftId?: string;
  craftIds?: string[];
  searchQuery?: string;
  artisanId?: string;
}

export interface UseWorkshopsResult {
  workshops: Workshop[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createWorkshop: (
    artisanId: string,
    input: CreateWorkshopInput
  ) => Promise<{ success: boolean; workshop?: Workshop; error?: string }>;
  deleteWorkshop: (
    workshopId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useWorkshops = (
  options?: UseWorkshopsOptions
): UseWorkshopsResult => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkshops = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (options?.artisanId) {
        const data = await workshopService.getArtisanWorkshops(
          options.artisanId
        );
        setWorkshops(data);
      } else {
        const data = await workshopService.getWorkshops({
          city: options?.city,
          craftId: options?.craftId,
          craftIds: options?.craftIds,
          searchQuery: options?.searchQuery,
        });
        setWorkshops(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load workshops");
    } finally {
      setIsLoading(false);
    }
  }, [
    options?.artisanId,
    options?.city,
    options?.craftId,
    options?.craftIds?.join(","),
    options?.searchQuery,
  ]);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  const createWorkshop = async (
    artisanId: string,
    input: CreateWorkshopInput
  ) => {
    const res = await workshopService.createWorkshop(artisanId, input);
    if (res.success && res.workshop) {
      setWorkshops((prev) => [res.workshop!, ...prev]);
    }
    return res;
  };

  const deleteWorkshop = async (workshopId: string) => {
    const res = await workshopService.deleteWorkshop(workshopId);
    if (res.success) {
      setWorkshops((prev) => prev.filter((w) => w.id !== workshopId));
    }
    return res;
  };

  return {
    workshops,
    isLoading,
    error,
    refetch: fetchWorkshops,
    createWorkshop,
    deleteWorkshop,
  };
};
