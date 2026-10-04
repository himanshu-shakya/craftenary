import { supabase } from "../../lib/supabase";
import { Booking, CreateBookingInput } from "../../types/booking";

class BookingService {
  /**
   * Create a new booking reservation
   */
  async createBooking(
    touristId: string,
    input: CreateBookingInput
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    if (!input.workshopId) {
      return { success: false, error: "Workshop ID is required." };
    }
    if (!input.bookingDate) {
      return { success: false, error: "Please select a booking date." };
    }
    if (!input.timeSlot) {
      return { success: false, error: "Please choose a time slot." };
    }
    if (input.numberOfPeople < 1) {
      return {
        success: false,
        error: "At least 1 attendee is required.",
      };
    }

    try {
      // Resolve tourist_profiles.id safely
      let targetTouristId = touristId;
      const { data: checkTouristById } = await supabase
        .from("tourist_profiles")
        .select("id")
        .eq("id", touristId)
        .maybeSingle();

      if (checkTouristById?.id) {
        targetTouristId = checkTouristById.id;
      } else {
        const { data: checkTouristByUser } = await supabase
          .from("tourist_profiles")
          .select("id")
          .eq("user_id", touristId)
          .maybeSingle();

        if (checkTouristByUser?.id) {
          targetTouristId = checkTouristByUser.id;
        }
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          workshop_id: input.workshopId,
          tourist_id: targetTouristId,
          booking_date: input.bookingDate,
          time_slot: input.timeSlot,
          number_of_people: input.numberOfPeople,
          total_price: input.totalPrice,
          status: "confirmed",
        })
        .select(`
          *,
          workshop:workshops (
            *,
            artisan:artisan_profiles (*, craft:crafts(*)),
            images:workshop_images (*)
          )
        `)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: error?.message || "Failed to create booking reservation",
        };
      }

      return {
        success: true,
        booking: data as Booking,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create booking",
      };
    }
  }

  /**
   * Fetch all bookings for a tourist
   */
  async getTouristBookings(touristId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          workshop:workshops (
            *,
            artisan:artisan_profiles (*, craft:crafts(*)),
            images:workshop_images (*)
          )
        `)
        .eq("tourist_id", touristId)
        .order("booking_date", { ascending: false });

      if (error || !data) {
        return [];
      }

      return data as Booking[];
    } catch {
      return [];
    }
  }

  /**
   * Fetch all bookings for an artisan's workshops
   */
  async getArtisanBookings(artisanId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          tourist:tourist_profiles (*),
          workshop:workshops!inner (
            *,
            images:workshop_images (*)
          )
        `)
        .eq("workshop.artisan_id", artisanId)
        .order("booking_date", { ascending: false });

      if (error || !data) {
        return [];
      }

      return data as Booking[];
    } catch {
      return [];
    }
  }
}

export const bookingService = new BookingService();
