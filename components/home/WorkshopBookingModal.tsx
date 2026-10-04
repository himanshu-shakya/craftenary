import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "../common/BottomSheet";
import { FeaturedExperience } from "../../src/types/home";
import { Button } from "../Button";

export interface WorkshopBookingModalProps {
  visible: boolean;
  onClose: () => void;
  experience: FeaturedExperience | null;
}

export const WorkshopBookingModal: React.FC<WorkshopBookingModalProps> = ({
  visible,
  onClose,
  experience,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["88%"], []);

  const [selectedSlot, setSelectedSlot] = useState("10:00 AM - 1:00 PM");
  const [selectedDate, setSelectedDate] = useState("Tomorrow (Sat)");
  const [guestsCount, setGuestsCount] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingCode, setBookingCode] = useState("9842");

  useEffect(() => {
    if (visible && experience) {
      setIsConfirmed(false);
      setIsSuccess(false);
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, experience]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  if (!experience) return null;

  const dateOptions = ["Tomorrow (Sat)", "Sunday", "Next Wed", "Next Fri"];
  const slotOptions = [
    "10:00 AM - 1:00 PM",
    "02:00 PM - 05:00 PM",
    "05:30 PM - 08:30 PM",
  ];

  const totalPrice = experience.price * guestsCount;

  const handleConfirm = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setBookingCode(Math.floor(1000 + Math.random() * 9000).toString());
      setIsConfirmed(true);
    }, 600);
  };

  const handleGetDirections = () => {
    const loc = experience.location || "Jaipur, Rajasthan";
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`
    ).catch(() => {
      Alert.alert("Location", loc);
    });
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: "#FAF8F2",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#C1C8C2",
        width: 40,
      }}
    >
      <View className="flex-1 px-5 pb-6">
        {isConfirmed ? (
          // ==========================================
          // CONFIRMED STATE IN MODAL
          // ==========================================
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            className="pt-2"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between pb-2 border-b border-[#E9E7DF]">
              <Pressable
                onPress={() => setIsConfirmed(false)}
                hitSlop={10}
                className="w-9 h-9 rounded-full items-center justify-center -ml-2"
              >
                <Feather name="chevron-left" size={24} color="#1C1C17" />
              </Pressable>
              <Text
                className="text-base text-[#1C1C17]"
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                Booking Flow
              </Text>
              <Pressable
                onPress={() => bottomSheetModalRef.current?.dismiss()}
                hitSlop={10}
                className="w-8 h-8 rounded-full bg-[#E9E7DF] items-center justify-center"
              >
                <Feather name="x" size={16} color="#1C1C17" />
              </Pressable>
            </View>

            {/* Checkmark Hero */}
            <View className="items-center mt-3 mb-1">
              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: "#D1F2E0",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#0B3B2C",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="check" size={22} color="#FFFFFF" />
                </View>
              </View>

              <Text
                className="text-2xl text-[#1C1C17] text-center mt-3"
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                You're going!
              </Text>

              <Text
                className="text-xs text-[#717973] text-center mt-1 px-4 leading-relaxed"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Your spot is secured. Get ready for an inspiring experience.
              </Text>
            </View>

            {/* Dynamic Card */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#EBE8E1",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
                overflow: "hidden",
                position: "relative",
              }}
              className="p-4 my-3.5"
            >
              <LinearGradient
                colors={["rgba(209, 242, 224, 0.45)", "rgba(255, 255, 255, 0)"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.3, y: 0.6 }}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 120,
                  height: 120,
                  borderTopRightRadius: 20,
                }}
                pointerEvents="none"
              />

              {/* Workshop Header */}
              <View className="flex-row items-center">
                <Image
                  source={
                    typeof experience.image === "string"
                      ? { uri: experience.image }
                      : experience.image
                  }
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 14,
                    backgroundColor: "#FAF8F2",
                  }}
                  resizeMode="cover"
                />

                <View className="flex-1 ml-3 justify-center">
                  <Text
                    numberOfLines={2}
                    className="text-sm text-[#1C1C17]"
                    style={{ fontFamily: "HankenGrotesk_700Bold" }}
                  >
                    {experience.title}
                  </Text>

                  <View className="flex-row items-center mt-1">
                    <Feather
                      name="user"
                      size={12}
                      color="#0B3B2C"
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      numberOfLines={1}
                      className="text-xs text-[#0B3B2C] font-semibold"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      Master Artisan {experience.masterArtisan}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="h-[1px] bg-[#F0ECE3] my-3" />

              {/* Date & Time */}
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text
                    className="text-[10px] text-[#717973] uppercase font-bold tracking-wider mb-1"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    Date
                  </Text>
                  <View className="flex-row items-center">
                    <Feather
                      name="calendar"
                      size={13}
                      color="#1C1C17"
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      className="text-xs text-[#1C1C17]"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      {selectedDate}
                    </Text>
                  </View>
                </View>

                <View className="flex-1 ml-2">
                  <Text
                    className="text-[10px] text-[#717973] uppercase font-bold tracking-wider mb-1"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    Time
                  </Text>
                  <View className="flex-row items-center">
                    <Feather
                      name="clock"
                      size={13}
                      color="#1C1C17"
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      className="text-xs text-[#1C1C17]"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      {selectedSlot}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Location */}
              <View className="mt-3">
                <Text
                  className="text-[10px] text-[#717973] uppercase font-bold tracking-wider mb-1"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Location
                </Text>
                <View className="flex-row items-start">
                  <Feather
                    name="map-pin"
                    size={13}
                    color="#1C1C17"
                    style={{ marginRight: 5, marginTop: 2 }}
                  />
                  <Text
                    className="text-xs text-[#1C1C17] flex-1 leading-4"
                    style={{ fontFamily: "Inter_500Medium" }}
                  >
                    {experience.location}
                  </Text>
                </View>
              </View>

              <View className="h-[1px] bg-[#F0ECE3] my-3" />

              {/* Booking ID */}
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-[10px] text-[#717973] uppercase font-bold tracking-wider"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Booking ID
                </Text>

                <View
                  style={{
                    backgroundColor: "#E6F8EE",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    className="text-xs text-[#0B3B2C] font-bold"
                    style={{ fontFamily: "HankenGrotesk_700Bold" }}
                  >
                    #BK-{bookingCode}
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className="mt-2 space-y-2.5">
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Added to Calendar 📅", `Saved for ${selectedDate} at ${selectedSlot}.`);
                }}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#0B3B2C",
                  height: 48,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Feather
                  name="calendar"
                  size={15}
                  color="#FFFFFF"
                  style={{ marginRight: 7 }}
                />
                <Text
                  className="text-sm text-white font-semibold"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Add to Calendar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGetDirections}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1.5,
                  borderColor: "#E5E2DB",
                  height: 48,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Feather
                  name="corner-up-right"
                  size={15}
                  color="#1C1C17"
                  style={{ marginRight: 7 }}
                />
                <Text
                  className="text-sm text-[#1C1C17] font-semibold"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Get Directions
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        ) : (
          // ==========================================
          // FORM STATE IN MODAL
          // ==========================================
          <>
            {/* Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-[#E9E7DF]">
              <View className="flex-1 mr-2">
                <Text
                  numberOfLines={1}
                  className="text-lg text-[#1C1C17]"
                  style={{ fontFamily: "HankenGrotesk_700Bold" }}
                >
                  {experience.title}
                </Text>
                <Text
                  className="text-xs text-[#717973] mt-0.5"
                  style={{ fontFamily: "Inter_400Regular" }}
                >
                  Instructor: {experience.masterArtisan}
                </Text>
              </View>
              <Pressable
                onPress={() => bottomSheetModalRef.current?.dismiss()}
                hitSlop={10}
                className="w-8 h-8 rounded-full bg-[#E9E7DF] items-center justify-center active:bg-[#DDD9D0]"
              >
                <Feather name="x" size={16} color="#1C1C17" />
              </Pressable>
            </View>

            <BottomSheetScrollView showsVerticalScrollIndicator={false} className="py-4">
              {/* Highlights */}
              <View className="bg-white p-3.5 rounded-2xl border border-[#E5E2DB] mb-4">
                <Text
                  className="text-xs text-[#717973] uppercase mb-2 font-bold"
                  style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
                >
                  Workshop Inclusions
                </Text>
                {experience.highlights.map((h, i) => (
                  <View key={i} className="flex-row items-center my-1">
                    <Feather
                      name="check-circle"
                      size={14}
                      color="#0B3B2C"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      className="text-xs text-[#1C1C17] flex-1"
                      style={{ fontFamily: "Inter_400Regular" }}
                    >
                      {h}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Select Date */}
              <Text
                className="text-xs text-[#717973] uppercase mb-2 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Select Workshop Date
              </Text>
              <View className="flex-row flex-wrap mb-4">
                {dateOptions.map((date) => {
                  const isSel = selectedDate === date;
                  return (
                    <Pressable
                      key={date}
                      onPress={() => setSelectedDate(date)}
                      className={`px-3.5 py-2 mr-2 mb-2 rounded-xl border ${
                        isSel
                          ? "bg-[#0B3B2C] border-[#0B3B2C]"
                          : "bg-white border-[#E5E2DB]"
                      }`}
                    >
                      <Text
                        className="text-xs"
                        style={{
                          fontFamily: isSel
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
                          color: isSel ? "#FFFFFF" : "#1C1C17",
                        }}
                      >
                        {date}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Select Slot */}
              <Text
                className="text-xs text-[#717973] uppercase mb-2 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Select Time Slot
              </Text>
              <View className="mb-4">
                {slotOptions.map((slot) => {
                  const isSel = selectedSlot === slot;
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => setSelectedSlot(slot)}
                      className={`p-3 mb-2 rounded-xl border flex-row items-center justify-between ${
                        isSel
                          ? "bg-[#0B3B2C]/10 border-[#0B3B2C]"
                          : "bg-white border-[#E5E2DB]"
                      }`}
                    >
                      <Text
                        className="text-xs"
                        style={{
                          fontFamily: isSel
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
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

              {/* Guests Counter */}
              <View className="flex-row items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E5E2DB] mb-5">
                <View>
                  <Text
                    className="text-sm text-[#1C1C17]"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    Attendees
                  </Text>
                  <Text
                    className="text-xs text-[#717973]"
                    style={{ fontFamily: "Inter_400Regular" }}
                  >
                    All materials included per person
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => setGuestsCount((c) => Math.max(1, c - 1))}
                    className="w-8 h-8 rounded-full bg-[#FAF8F2] border border-[#E5E2DB] items-center justify-center"
                  >
                    <Feather name="minus" size={14} color="#1C1C17" />
                  </Pressable>
                  <Text
                    className="mx-3 text-base"
                    style={{ fontFamily: "HankenGrotesk_700Bold" }}
                  >
                    {guestsCount}
                  </Text>
                  <Pressable
                    onPress={() => setGuestsCount((c) => Math.min(8, c + 1))}
                    className="w-8 h-8 rounded-full bg-[#FAF8F2] border border-[#E5E2DB] items-center justify-center"
                  >
                    <Feather name="plus" size={14} color="#1C1C17" />
                  </Pressable>
                </View>
              </View>

              {/* Total Price & Confirmation */}
              <View className="pt-2 mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    className="text-sm text-[#717973]"
                    style={{ fontFamily: "Inter_500Medium" }}
                  >
                    Total Price ({guestsCount} person
                    {guestsCount > 1 ? "s" : ""})
                  </Text>
                  <Text
                    className="text-xl text-[#0B3B2C]"
                    style={{ fontFamily: "HankenGrotesk_700Bold" }}
                  >
                    ₹{totalPrice}
                  </Text>
                </View>

                <Button
                  title="Confirm & Reserve Slot"
                  loadingTitle="Confirming..."
                  variant="primary"
                  size="lg"
                  loading={isSuccess}
                  disabled={isSuccess}
                  onPress={handleConfirm}
                />
              </View>
            </BottomSheetScrollView>
          </>
        )}
      </View>
    </BottomSheetModal>
  );
};
