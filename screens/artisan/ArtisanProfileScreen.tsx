import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../../src/hooks/useAuth";
import { useArtisanProfile } from "../../src/hooks/useArtisanProfile";
import { useWorkshops } from "../../src/hooks/useWorkshops";
import { Avatar } from "../../components/common/Avatar";
import { VerifiedBadge } from "../../components/common/VerifiedBadge";
import { Button } from "../../components/Button";

export interface ArtisanProfileScreenProps {
  onBack: () => void;
  onEditProfile: () => void;
  onManageWorkshops?: () => void;
}

export const ArtisanProfileScreen: React.FC<ArtisanProfileScreenProps> = ({
  onBack,
  onEditProfile,
  onManageWorkshops,
}) => {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { profile: artisan, isLoading: isLoadingProfile } = useArtisanProfile(user?.id);
  const { workshops } = useWorkshops(
    artisan?.id ? { artisanId: artisan.id } : user?.id ? { artisanId: user.id } : undefined
  );

  const displayName = artisan
    ? `${artisan.first_name} ${artisan.last_name}`
    : user?.user_metadata?.full_name || "Artisan";

  const isVerified = artisan?.verification_status === "verified";

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
          Artisan Profile
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
        {/* Profile Card */}
        <View className="bg-white rounded-3xl p-6 border border-[#E5E2DB] shadow-sm items-center mb-6">
          <Avatar
            imageUrl={artisan?.profile_image_url}
            name={displayName}
            size={80}
            isVerified={isVerified}
            backgroundColor="#0B3B2C"
          />

          <View className="flex-row items-center mt-3.5 mb-1">
            <Text
              className="text-xl text-[#1C1C17] mr-1.5"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              {displayName}
            </Text>
            {isVerified && <VerifiedBadge size={16} />}
          </View>

          <Text
            className="text-xs text-[#717973] mb-3"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {artisan?.craft?.name || "Craft"} Master • {artisan?.city || "Jaipur"},{" "}
            {artisan?.state || "Rajasthan"}
          </Text>

          {/* Verification Pill */}
          <View
            className={`px-3 py-1 rounded-full border mb-4 ${
              isVerified
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <Text
              className={`text-[11px] uppercase font-bold ${
                isVerified ? "text-emerald-800" : "text-amber-800"
              }`}
              style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
            >
              {isVerified ? "✓ Verified Master Studio" : "⏳ Verification Pending"}
            </Text>
          </View>

          {/* Edit Profile Button */}
          <Button
            title="Edit Profile"
            variant="primary"
            size="md"
            leftIcon={<Feather name="edit-2" size={14} color="#000" />}
            onPress={onEditProfile}
          />
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between bg-white p-4 rounded-2xl border border-[#E5E2DB] shadow-xs mb-6">
          <View className="items-center flex-1 border-r border-[#E5E2DB]">
            <Text
              className="text-xs text-[#717973]"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Experience
            </Text>
            <Text
              className="text-base text-[#1C1C17] font-bold mt-0.5"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              {artisan?.experience_years || 10}+ Yrs
            </Text>
          </View>

          <View className="items-center flex-1 border-r border-[#E5E2DB]">
            <Text
              className="text-xs text-[#717973]"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Mentorship
            </Text>
            <Text
              className="text-base text-[#0B3B2C] font-bold mt-0.5"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              ₹{artisan?.price_per_hour || 1200}/hr
            </Text>
          </View>

          <View className="items-center flex-1">
            <Text
              className="text-xs text-[#717973]"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Workshops
            </Text>
            <Text
              className="text-base text-[#D96B16] font-bold mt-0.5"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              {workshops.length} Active
            </Text>
          </View>
        </View>

        {/* Biography Section */}
        <Text
          className="text-xs text-[#717973] uppercase mb-2 font-bold"
          style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
        >
          Artisan Biography
        </Text>
        <View className="bg-white p-5 rounded-2xl border border-[#E5E2DB] shadow-xs mb-6">
          <Text
            className="text-xs text-[#414844] leading-relaxed"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {artisan?.bio ||
              "Generational master artisan dedicated to safeguarding sacred indigenous craftsmanship and mentoring cultural travelers through hands-on studio apprenticeships."}
          </Text>
        </View>

        {/* Account Details */}
        <Text
          className="text-xs text-[#717973] uppercase mb-2 font-bold"
          style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
        >
          Studio Details
        </Text>
        <View className="bg-white p-4 rounded-2xl border border-[#E5E2DB] shadow-xs mb-8">
          <View className="flex-row justify-between py-2 border-b border-[#F1EEE6]">
            <Text className="text-xs text-[#717973]" style={{ fontFamily: "Inter_400Regular" }}>
              Specialty Craft
            </Text>
            <Text className="text-xs text-[#1C1C17] font-semibold" style={{ fontFamily: "Inter_600SemiBold" }}>
              {artisan?.craft?.name || "Traditional Crafts"}
            </Text>
          </View>

          <View className="flex-row justify-between py-2 border-b border-[#F1EEE6]">
            <Text className="text-xs text-[#717973]" style={{ fontFamily: "Inter_400Regular" }}>
              Location
            </Text>
            <Text className="text-xs text-[#1C1C17] font-semibold" style={{ fontFamily: "Inter_600SemiBold" }}>
              {artisan?.city || "Jaipur"}, {artisan?.state || "Rajasthan"}
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
      </ScrollView>
    </View>
  );
};
