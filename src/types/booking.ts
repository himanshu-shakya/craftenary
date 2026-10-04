import { TouristProfile } from "./tourist";
import { Workshop } from "./workshop";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  workshop_id: string;
  workshop?: Workshop;
  tourist_id: string;
  tourist?: TouristProfile;
  booking_date: string;
  time_slot: string;
  number_of_people: number;
  total_price: number;
  status: BookingStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookingInput {
  workshopId: string;
  bookingDate: string;
  timeSlot: string;
  numberOfPeople: number;
  totalPrice: number;
}
