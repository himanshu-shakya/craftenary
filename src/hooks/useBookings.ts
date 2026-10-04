import { useCallback, useEffect, useState } from "react";
import { Booking, CreateBookingInput } from "../types/booking";
import { bookingService } from "../services/booking/bookingService";

export interface UseBookingsOptions {
  touristId?: string;
  artisanId?: string;
}

export interface UseBookingsResult {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createBooking: (
    input: CreateBookingInput
  ) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
}

export const useBookings = (
  options?: UseBookingsOptions
): UseBookingsResult => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!options?.touristId && !options?.artisanId) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (options.touristId) {
        const data = await bookingService.getTouristBookings(options.touristId);
        setBookings(data);
      } else if (options.artisanId) {
        const data = await bookingService.getArtisanBookings(options.artisanId);
        setBookings(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, [options?.touristId, options?.artisanId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (input: CreateBookingInput) => {
    if (!options?.touristId) {
      return { success: false, error: "Tourist account required for booking." };
    }
    const res = await bookingService.createBooking(options.touristId, input);
    if (res.success && res.booking) {
      setBookings((prev) => [res.booking!, ...prev]);
    }
    return res;
  };

  return {
    bookings,
    isLoading,
    error,
    refetch: fetchBookings,
    createBooking,
  };
};
