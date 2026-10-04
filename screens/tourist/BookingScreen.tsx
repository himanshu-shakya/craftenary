import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Workshop } from "../../src/types/workshop";
import { Booking } from "../../src/types/booking";
import { useAuth } from "../../src/hooks/useAuth";
import { useTouristProfile } from "../../src/hooks/useTouristProfile";
import { bookingService } from "../../src/services/booking/bookingService";
import { Button } from "../../components/Button";
import { useToast } from "../../src/context/ToastContext";

export interface BookingScreenProps {
  workshop: Workshop;
  onBack: () => void;
  onBookingSuccess: () => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  workshop,
  onBack,
  onBookingSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile: tourist } = useTouristProfile(user?.id);
  const { showToast, showError } = useToast();

  const [selectedDate, setSelectedDate] = useState("2026-08-30");
  const [selectedSlot, setSelectedSlot] = useState("10:00 AM - 1:00 PM");
  const [attendees, setAttendees] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const dates = [
    { label: "Tomorrow", val: "2026-08-30" },
    { label: "Mon, 31 Aug", val: "2026-08-31" },
    { label: "Tue, 1 Sep", val: "2026-09-01" },
    { label: "Wed, 2 Sep", val: "2026-09-02" },
  ];

  const timeSlots = [
    "10:00 AM - 1:00 PM",
    "02:00 PM - 05:00 PM",
    "05:30 PM - 08:30 PM",
  ];

  const totalPrice = workshop.price * attendees;

  const artisanFullName = workshop.artisan
    ? `${workshop.artisan.first_name || ""} ${workshop.artisan.last_name || ""}`.trim()
    : "Master Artisan";

  const workshopImage =
    workshop.images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80";

  const formatDisplayDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleConfirmBooking = async () => {
    const effectiveTouristId = tourist?.id || tourist?.user_id || user?.id;
    if (!effectiveTouristId) {
      showError("Profile Error", "Tourist profile not found. Please complete profile setup.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bookingService.createBooking(effectiveTouristId, {
        workshopId: workshop.id,
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        numberOfPeople: attendees,
        totalPrice,
      });

      if (result.success && result.booking) {
        setConfirmedBooking(result.booking);
        showToast({
          type: "celebration",
          title: "Reservation Confirmed! 🎉",
          message: `Your spot for "${workshop.name}" is secured.`,
          duration: 3500,
        });
      } else if (result.success) {
        // Fallback booking object if database returned simplified response
        const fallbackBooking: Booking = {
          id: `bk-${Date.now().toString(36)}`,
          workshop_id: workshop.id,
          tourist_id: effectiveTouristId,
          booking_date: selectedDate,
          time_slot: selectedSlot,
          number_of_people: attendees,
          total_price: totalPrice,
          status: "confirmed",
          workshop,
        };
        setConfirmedBooking(fallbackBooking);
      } else {
        showError("Booking Error", result.error || "Unable to reserve slot.");
      }
    } catch {
      showError("Error", "Something went wrong while confirming your booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCalendar = () => {
    showToast({
      type: "celebration",
      title: "Added to Calendar 📅",
      message: `Event saved for ${workshop.name} on ${formatDisplayDate(
        confirmedBooking?.booking_date || selectedDate
      )}.`,
      duration: 3500,
    });
  };

  const handleGetDirections = () => {
    const locationQuery =
      workshop.location || `${workshop.city}, ${workshop.state}, India`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      locationQuery
    )}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        "Location Details",
        `Studio Location: ${locationQuery}`
      );
    });
  };

  // ==========================================
  // CONFIRMED BOOKING VIEW (Matching design UI)
  // ==========================================
  if (confirmedBooking) {
    const bookingCode = confirmedBooking.id
      ? confirmedBooking.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "9842"
      : "9842";

    const displayLocation =
      workshop.location || `${workshop.city}, ${workshop.state}`;

    return (
      <View className="flex-1 bg-[#FAF8F2]">
        <StatusBar style="dark" />

        {/* Top Header */}
        <View
          style={{
            paddingTop: Math.max(insets.top, 14),
            backgroundColor: "#FAF8F2",
          }}
          className="px-5 pb-3 flex-row items-center justify-between"
        >
          <Pressable
            onPress={onBookingSuccess}
            hitSlop={10}
            className="w-10 h-10 rounded-full items-center justify-center -ml-2"
          >
            <Feather name="chevron-left" size={26} color="#1C1C17" />
          </Pressable>

          <Text
            className="text-lg text-[#1C1C17]"
            style={{ fontFamily: "HankenGrotesk_700Bold" }}
          >
            Booking Flow
          </Text>

          <View className="w-10 h-10" />
        </View>

        <ScrollView
          className="flex-1 px-5 pt-2"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Checkmark Hero */}
          <View className="items-center mt-3 mb-2">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#D1F2E0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#0B3B2C",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="check" size={24} color="#FFFFFF" />
              </View>
            </View>

            <Text
              className="text-3xl text-[#1C1C17] text-center mt-4"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              You're going!
            </Text>

            <Text
              className="text-sm text-[#717973] text-center mt-2 px-6 leading-5"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Your spot is secured. Get ready for an inspiring experience.
            </Text>
          </View>

          {/* Dynamic Workshop Confirmation Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "#EBE8E1",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
              overflow: "hidden",
              position: "relative",
            }}
            className="p-5 my-4"
          >
            {/* Top-Right Soft Radiant Emerald Glow Accent */}
            <LinearGradient
              colors={["rgba(209, 242, 224, 0.45)", "rgba(255, 255, 255, 0)"]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0.3, y: 0.6 }}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 140,
                height: 140,
                borderTopRightRadius: 24,
              }}
              pointerEvents="none"
            />

            {/* Workshop Header Row */}
            <View className="flex-row items-center">
              <Image
                source={{ uri: workshopImage }}
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 16,
                  backgroundColor: "#FAF8F2",
                }}
                resizeMode="cover"
              />

              <View className="flex-1 ml-3.5 justify-center">
                <Text
                  numberOfLines={2}
                  className="text-base text-[#1C1C17] leading-snug"
                  style={{ fontFamily: "HankenGrotesk_700Bold" }}
                >
                  {workshop.name}
                </Text>

                <View className="flex-row items-center mt-1.5">
                  <Feather
                    name="user"
                    size={13}
                    color="#0B3B2C"
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    numberOfLines={1}
                    className="text-xs text-[#0B3B2C] font-semibold"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    Master Artisan {artisanFullName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Divider Line */}
            <View className="h-[1px] bg-[#F0ECE3] my-4" />

            {/* Date & Time Grid */}
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text
                  className="text-[11px] text-[#717973] uppercase font-bold tracking-wider mb-1.5"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Date
                </Text>
                <View className="flex-row items-center">
                  <Feather
                    name="calendar"
                    size={14}
                    color="#1C1C17"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    className="text-sm text-[#1C1C17]"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    {formatDisplayDate(confirmedBooking.booking_date)}
                  </Text>
                </View>
              </View>

              <View className="flex-1 ml-2">
                <Text
                  className="text-[11px] text-[#717973] uppercase font-bold tracking-wider mb-1.5"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Time
                </Text>
                <View className="flex-row items-center">
                  <Feather
                    name="clock"
                    size={14}
                    color="#1C1C17"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    numberOfLines={1}
                    className="text-sm text-[#1C1C17]"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    {confirmedBooking.time_slot}
                  </Text>
                </View>
              </View>
            </View>

            {/* Location Row */}
            <View className="mt-4">
              <Text
                className="text-[11px] text-[#717973] uppercase font-bold tracking-wider mb-1.5"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Location
              </Text>
              <View className="flex-row items-start">
                <Feather
                  name="map-pin"
                  size={14}
                  color="#1C1C17"
                  style={{ marginRight: 6, marginTop: 2.5 }}
                />
                <Text
                  className="text-sm text-[#1C1C17] flex-1 leading-5"
                  style={{ fontFamily: "Inter_500Medium" }}
                >
                  {displayLocation}
                </Text>
              </View>
            </View>

            {/* Divider Line */}
            <View className="h-[1px] bg-[#F0ECE3] my-4" />

            {/* Booking ID Row */}
            <View className="flex-row items-center justify-between">
              <Text
                className="text-[11px] text-[#717973] uppercase font-bold tracking-wider"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Booking ID
              </Text>

              <View
                style={{
                  backgroundColor: "#E6F8EE",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <Text
                  className="text-xs text-[#0B3B2C] font-bold"
                  style={{ fontFamily: "HankenGrotesk_700Bold", letterSpacing: 0.5 }}
                >
                  #BK-{bookingCode}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-2 space-y-3">
            {/* Add to Calendar Button */}
            <TouchableOpacity
              onPress={handleAddToCalendar}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#0B3B2C",
                height: 52,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Feather
                name="calendar"
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-sm text-white font-semibold"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Add to Calendar
              </Text>
            </TouchableOpacity>

            {/* Get Directions Button */}
            <TouchableOpacity
              onPress={handleGetDirections}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1.5,
                borderColor: "#E5E2DB",
                height: 52,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Feather
                name="corner-up-right"
                size={16}
                color="#1C1C17"
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-sm text-[#1C1C17] font-semibold"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Get Directions
              </Text>
            </TouchableOpacity>

            {/* Return to Dashboard */}
            <TouchableOpacity
              onPress={onBookingSuccess}
              activeOpacity={0.7}
              className="py-2 items-center justify-center"
            >
              <Text
                className="text-xs text-[#717973] font-medium"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                View in My Bookings • Done
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // INITIAL WORKSHOP RESERVATION FORM
  // ==========================================
  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 14),
          backgroundColor: "#FAF8F2",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(193, 200, 194, 0.4)",
        }}
        className="px-5 pb-3 flex-row items-center justify-between"
      >
        <Pressable
          onPress={onBack}
          hitSlop={10}
          className="w-9 h-9 rounded-full bg-[#E9E7DF] items-center justify-center -ml-1"
        >
          <Feather name="arrow-left" size={20} color="#1C1C17" />
        </Pressable>

        <Text
          className="text-base text-[#1C1C17]"
          style={{ fontFamily: "HankenGrotesk_700Bold" }}
        >
          Reserve Workshop Slot
        </Text>

        <View className="w-9 h-9" />
      </View>

      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Workshop Summary Card */}
        <View className="bg-white rounded-2xl p-4 border border-[#E5E2DB] shadow-xs mb-5">
          <Text
            className="text-base text-[#1C1C17] mb-1"
            style={{ fontFamily: "HankenGrotesk_700Bold" }}
          >
            {workshop.name}
          </Text>
          <Text
            className="text-xs text-[#717973] mb-2"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            Instructor: {artisanFullName}
          </Text>
          <Text
            className="text-xs text-[#414844]"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            📍 {workshop.location || `${workshop.city}, ${workshop.state}`}
          </Text>
        </View>

        {/* Date Selection */}
        <Text
          className="text-xs text-[#717973] uppercase mb-2 font-bold"
          style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
        >
          Select Date
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {dates.map((d) => {
            const isSel = selectedDate === d.val;
            return (
              <Pressable
                key={d.val}
                onPress={() => setSelectedDate(d.val)}
                className={`px-4 py-2.5 mr-2 mb-2 rounded-xl border ${
                  isSel
                    ? "bg-[#0B3B2C] border-[#0B3B2C]"
                    : "bg-white border-[#E5E2DB]"
                }`}
              >
                <Text
                  className="text-xs"
                  style={{
                    fontFamily: isSel ? "Inter_600SemiBold" : "Inter_400Regular",
                    color: isSel ? "#FFFFFF" : "#1C1C17",
                  }}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Time Slot Selection */}
        <Text
          className="text-xs text-[#717973] uppercase mb-2 font-bold"
          style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
        >
          Select Session Time
        </Text>
        <View className="mb-5">
          {timeSlots.map((slot) => {
            const isSel = selectedSlot === slot;
            return (
              <Pressable
                key={slot}
                onPress={() => setSelectedSlot(slot)}
                className={`p-3.5 mb-2.5 rounded-xl border flex-row items-center justify-between ${
                  isSel
                    ? "bg-[#0B3B2C]/10 border-[#0B3B2C]"
                    : "bg-white border-[#E5E2DB]"
                }`}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    fontFamily: isSel ? "Inter_600SemiBold" : "Inter_400Regular",
                    color: isSel ? "#0B3B2C" : "#1C1C17",
                  }}
                >
                  {slot}
                </Text>
                {isSel && <Feather name="check" size={16} color="#0B3B2C" />}
              </Pressable>
            );
          })}
        </View>

        {/* Attendees Counter */}
        <View className="bg-white rounded-2xl p-4 border border-[#E5E2DB] shadow-xs mb-5 flex-row items-center justify-between">
          <View>
            <Text
              className="text-sm text-[#1C1C17] font-semibold"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              Number of Attendees
            </Text>
            <Text
              className="text-xs text-[#717973]"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Materials included for all
            </Text>
          </View>

          <View className="flex-row items-center">
            <Pressable
              onPress={() => setAttendees((c) => Math.max(1, c - 1))}
              className="w-8 h-8 rounded-full bg-[#FAF8F2] border border-[#E5E2DB] items-center justify-center active:bg-[#E5E2DB]"
            >
              <Feather name="minus" size={14} color="#1C1C17" />
            </Pressable>
            <Text
              className="mx-3 text-base font-bold"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              {attendees}
            </Text>
            <Pressable
              onPress={() => setAttendees((c) => Math.min(8, c + 1))}
              className="w-8 h-8 rounded-full bg-[#FAF8F2] border border-[#E5E2DB] items-center justify-center active:bg-[#E5E2DB]"
            >
              <Feather name="plus" size={14} color="#1C1C17" />
            </Pressable>
          </View>
        </View>

        {/* Price Breakdown */}
        <View className="bg-white rounded-2xl p-4 border border-[#E5E2DB] shadow-xs mb-6">
          <View className="flex-row justify-between mb-2">
            <Text
              className="text-xs text-[#717973]"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Workshop Fee (₹{workshop.price} × {attendees})
            </Text>
            <Text
              className="text-xs text-[#1C1C17]"
              style={{ fontFamily: "Inter_500Medium" }}
            >
              ₹{totalPrice}
            </Text>
          </View>

          <View className="h-[1px] bg-[#E5E2DB] my-2" />

          <View className="flex-row justify-between items-center">
            <Text
              className="text-sm text-[#1C1C17] font-bold"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              Total Reservation Amount
            </Text>
            <Text
              className="text-base text-[#0B3B2C] font-bold"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              ₹{totalPrice}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <Button
          title={`Confirm Reservation • ₹${totalPrice}`}
          loadingTitle="Reserving Workshop Slot..."
          variant="primary"
          onPress={handleConfirmBooking}
          loading={isSubmitting}
        />
      </ScrollView>
    </View>
  );
};
