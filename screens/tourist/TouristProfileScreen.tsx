import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../../src/hooks/useAuth";
import { useTouristProfile } from "../../src/hooks/useTouristProfile";
import { useBookings } from "../../src/hooks/useBookings";
import { getValidCraftIcon } from "../../src/utils/craftIcons";
import { Avatar } from "../../components/common/Avatar";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "../../components/Button";

export interface TouristProfileScreenProps {
  onBack: () => void;
  onEditProfile: () => void;
  onExploreWorkshops: () => void;
}

export const TouristProfileScreen: React.FC<TouristProfileScreenProps> = ({
  onBack,
  onEditProfile,
  onExploreWorkshops,
}) => {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { profile: tourist, isLoading: isLoadingProfile } = useTouristProfile(user?.id);
  const { bookings, isLoading: isLoadingBookings } = useBookings(
    tourist?.id ? { touristId: tourist.id } : undefined
  );

  const displayName = tourist
    ? `${tourist.first_name} ${tourist.last_name}`
    : user?.user_metadata?.full_name || "Cultural Explorer";

  if (isLoadingProfile) {
    return (
      <View className="flex-1 bg-[#FAF8F2] items-center justify-center">
        <ActivityIndicator color="#0B3B2C" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="dark" />

      {/* Top Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 14),
          backgroundColor: "#FAF8F2",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(193, 200, 194, 0.4)",
        }}
        className="px-5 pb-3 flex-row items-center justify-between shadow-xs"
      >
        <Pressable
          onPress={onBack}
          hitSlop={10}
          className="w-9 h-9 rounded-full bg-[#E9E7DF] items-center justify-center -ml-1 active:bg-[#DDD9D0]"
        >
          <Feather name="arrow-left" size={20} color="#1C1C17" />
        </Pressable>

        <Text
          className="text-base text-[#1C1C17]"
          style={{ fontFamily: "HankenGrotesk_700Bold" }}
        >
          Profile
        </Text>

        <Pressable
          onPress={signOut}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-red-50 border border-red-100 items-center justify-center active:bg-red-100"
        >
          <Feather name="log-out" size={15} color="#DC2626" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-5"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Hero Card */}
        <View className="bg-white rounded-3xl p-6 border border-[#E5E2DB] shadow-sm items-center mb-6">
          <Avatar
            imageUrl={tourist?.profile_image_url}
            name={displayName}
            size={80}
            backgroundColor="#0B3B2C"
          />

          <Text
            className="text-xl text-[#1C1C17] mt-3.5 mb-1"
            style={{ fontFamily: "HankenGrotesk_700Bold" }}
          >
            {displayName}
          </Text>

          <View className="flex-row items-center mb-4">
            <Feather name="map-pin" size={13} color="#717973" style={{ marginRight: 4 }} />
            <Text
              className="text-xs text-[#717973]"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              {tourist?.city || "Jaipur"}, {tourist?.state || "Rajasthan"}
            </Text>
          </View>

          {/* Edit Profile Action Button */}
          <Button
            title="Edit Profile"
            variant="primary"
            size="md"
            leftIcon={<Feather name="edit-2" size={14} color="#000" />}
            onPress={onEditProfile}
          />
        </View>

        {/* Section 1: Personal Information */}
        <Text
          className="text-xs text-[#717973] uppercase mb-2.5 font-bold"
          style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
        >
          Personal Information
        </Text>

        <View className="bg-white rounded-2xl p-4 border border-[#E5E2DB] shadow-xs mb-6">
          <View className="flex-row justify-between py-2 border-b border-[#F1EEE6]">
            <Text className="text-xs text-[#717973]" style={{ fontFamily: "Inter_400Regular" }}>
              First Name
            </Text>
            <Text className="text-xs text-[#1C1C17] font-semibold" style={{ fontFamily: "Inter_600SemiBold" }}>
              {tourist?.first_name || "—"}
            </Text>
          </View>

          <View className="flex-row justify-between py-2 border-b border-[#F1EEE6]">
            <Text className="text-xs text-[#717973]" style={{ fontFamily: "Inter_400Regular" }}>
              Last Name
            </Text>
            <Text className="text-xs text-[#1C1C17] font-semibold" style={{ fontFamily: "Inter_600SemiBold" }}>
              {tourist?.last_name || "—"}
            </Text>
          </View>

          <View className="flex-row justify-between py-2 border-b border-[#F1EEE6]">
            <Text className="text-xs text-[#717973]" style={{ fontFamily: "Inter_400Regular" }}>
              Gender
            </Text>
            <Text className="text-xs text-[#1C1C17] font-semibold" style={{ fontFamily: "Inter_600SemiBold" }}>
              {tourist?.gender || "Explorer"}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-xs text-[#717973]" style={{ fontFamily: "Inter_400Regular" }}>
              Account Email
            </Text>
            <Text className="text-xs text-[#717973]" style={{ fontFamily: "Inter_400Regular" }}>
              {user?.email || "—"} (Read-only)
            </Text>
          </View>
        </View>

        {/* Section 2: Saved Craft Interests */}
        <View className="flex-row items-center justify-between mb-2.5">
          <Text
            className="text-xs text-[#717973] uppercase font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Favorite Craft Interests
          </Text>
          <Pressable onPress={onEditProfile}>
            <Text className="text-xs text-[#0B3B2C] font-semibold" style={{ fontFamily: "Inter_600SemiBold" }}>
              Manage
            </Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-2xl p-4 border border-[#E5E2DB] shadow-xs mb-6">
          {tourist?.craft_interests && tourist.craft_interests.length > 0 ? (
            <View className="flex-row flex-wrap">
              {tourist.craft_interests.map((craft) => (
                <View
                  key={craft.id}
                  className="bg-[#FAF8F2] border border-[#E5E2DB] px-3 py-1.5 rounded-full mr-2 mb-2 flex-row items-center"
                >
                  <MaterialCommunityIcons
                    name={getValidCraftIcon(craft.icon, "star-outline")}
                    size={13}
                    color="#0B3B2C"
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    className="text-xs text-[#0B3B2C]"
                    style={{ fontFamily: "Inter_500Medium" }}
                  >
                    {craft.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text
              className="text-xs text-[#717973]"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              No specific craft interests chosen yet. Tap Edit Profile to select crafts you love.
            </Text>
          )}
        </View>

        {/* Section 3: Booking History */}
        <View className="flex-row items-center justify-between mb-3">
          <Text
            className="text-base text-[#1C1C17]"
            style={{ fontFamily: "HankenGrotesk_700Bold" }}
          >
            My Workshop Bookings ({bookings.length})
          </Text>
        </View>

        {isLoadingBookings ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#0B3B2C" size="small" />
          </View>
        ) : bookings.length === 0 ? (
          <EmptyState
            iconName="calendar"
            iconFamily="Feather"
            title="No Bookings Yet"
            description="Explore master workshops and reserve hands-on studio sessions with local artisans."
            actionTitle="Discover Workshops"
            onActionPress={onExploreWorkshops}
          />
        ) : (
          <View>
            {bookings.map((b) => (
              <View
                key={b.id}
                className="bg-white rounded-2xl p-4 mb-3.5 border border-[#E5E2DB] shadow-xs"
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text
                    numberOfLines={1}
                    className="text-sm text-[#1C1C17] flex-1 mr-2"
                    style={{ fontFamily: "HankenGrotesk_700Bold" }}
                  >
                    {b.workshop?.name || "Craft Workshop"}
                  </Text>
                  <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    <Text
                      className="text-[10px] text-emerald-800 font-bold uppercase"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      {b.status}
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-xs text-[#717973] mb-2"
                  style={{ fontFamily: "Inter_400Regular" }}
                >
                  📅 {b.booking_date} • ⏰ {b.time_slot} • 👥 {b.number_of_people} attendee(s)
                </Text>

                <View className="flex-row items-center justify-between pt-2 border-t border-[#F1EEE6]">
                  <Text
                    className="text-xs text-[#414844]"
                    style={{ fontFamily: "Inter_500Medium" }}
                  >
                    📍 {b.workshop?.location || "Studio"}
                  </Text>
                  <PriceDisplay price={b.total_price} size="sm" />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
