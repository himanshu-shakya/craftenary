import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../../src/hooks/useAuth";
import { useArtisanProfile } from "../../src/hooks/useArtisanProfile";
import { useWorkshops } from "../../src/hooks/useWorkshops";
import { Avatar } from "../../components/common/Avatar";
import { Button } from "../../components/Button";
import { Workshop } from "../../src/types/workshop";

export interface ArtisanDashboardScreenProps {
  onCreateWorkshop: () => void;
  onViewMyWorkshops: () => void;
  onViewProfile: () => void;
}

export const ArtisanDashboardScreen: React.FC<ArtisanDashboardScreenProps> = ({
  onCreateWorkshop,
  onViewMyWorkshops,
  onViewProfile,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile: artisan, isLoading: isLoadingProfile } = useArtisanProfile(user?.id);
  const { workshops, isLoading: isLoadingWorkshops, refetch } = useWorkshops(
    artisan?.id ? { artisanId: artisan.id } : user?.id ? { artisanId: user.id } : undefined
  );

  const firstName =
    artisan?.first_name ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    "Artisan";

  const isVerified = artisan?.verification_status === "verified";
  const craftName = artisan?.craft?.name || "Ceramics & Pottery";

  // Dynamic greeting based on hour of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoadingProfile) {
    return (
      <View className="flex-1 bg-[#FCF9F1] items-center justify-center">
        <ActivityIndicator color="#012D1D" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FCF9F1]">
      <StatusBar style="dark" />

      {/* 1. Header Bar */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 14),
          backgroundColor: "#FCF9F1",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(193, 200, 194, 0.4)",
        }}
        className="px-5 pb-3 flex-row items-center justify-between shadow-xs"
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg bg-[#012D1D]/10 items-center justify-center mr-2.5">
            <MaterialCommunityIcons
              name="flower-tulip-outline"
              size={19}
              color="#012D1D"
            />
          </View>
          <Text
            className="text-[#012D1D]"
            style={{
              fontFamily: "HankenGrotesk_700Bold",
              fontSize: 22,
              letterSpacing: -0.3,
            }}
          >
            Home
          </Text>
        </View>

        {/* Profile Avatar Button */}
        <Pressable
          onPress={onViewProfile}
          accessibilityRole="button"
          accessibilityLabel="Profile settings"
          className="active:opacity-80"
        >
          <Avatar
            imageUrl={artisan?.profile_image_url}
            name={firstName}
            size={34}
            backgroundColor="#012D1D"
          />
        </Pressable>
      </View>

      {/* Main Content Area */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Welcome Greeting */}
        <View className="mb-5">
          <Text
            className="text-[#1C1C17] text-3xl mb-1.5"
            style={{
              fontFamily: "HankenGrotesk_700Bold",
              letterSpacing: -0.5,
              lineHeight: 38,
            }}
          >
            {getGreeting()}, {firstName} 👋
          </Text>
          <Text
            className="text-[#414844] text-[15px]"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            Here's what's happening with your craft today.
          </Text>
        </View>

        {/* 3. Verified / Unverified Artisan Status Card */}
        <Pressable
          onPress={onViewProfile}
          className="rounded-2xl bg-[#F1EEE6] p-4 flex-row items-center justify-between border border-[#E5E2DB] shadow-xs mb-6 active:scale-[0.99]"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View
              className={`w-12 h-12 rounded-full items-center justify-center mr-3.5 ${
                isVerified ? "bg-emerald-100" : "bg-[#FE932C]/20"
              }`}
            >
              <MaterialCommunityIcons
                name={isVerified ? "check-decagram" : "shield-alert-outline"}
                size={26}
                color={isVerified ? "#047857" : "#D97706"}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text
                  className="text-[#1C1C17] text-base mb-0.5 mr-2"
                  style={{ fontFamily: "HankenGrotesk_700Bold" }}
                >
                  {isVerified ? "Verified Artisan" : "Unverified Artisan"}
                </Text>
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    isVerified
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-amber-50 border border-amber-200"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold uppercase ${
                      isVerified ? "text-emerald-800" : "text-amber-800"
                    }`}
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    {isVerified ? "Verified" : "Unverified"}
                  </Text>
                </View>
              </View>
              <Text
                className="text-[#414844] text-xs"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                {isVerified
                  ? `Top 5% in ${craftName}`
                  : `Pending Studio Verification • ${craftName}`}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#414844" />
        </Pressable>

        {/* 4. Your Workshops Header Row */}
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className="text-[#1C1C17] text-2xl"
            style={{ fontFamily: "HankenGrotesk_700Bold", letterSpacing: -0.3 }}
          >
            Your Workshops
          </Text>

          <Button
            title="Create"
            variant="primary"
            size="sm"
            fullWidth={false}
            leftIcon={<Feather name="plus" size={15} color="#000" />}
            onPress={onCreateWorkshop}
          />
        </View>

        {/* 5. Workshops List */}
        {isLoadingWorkshops ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator color="#012D1D" size="small" />
            <Text
              className="text-xs text-[#717973] mt-2"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Loading your workshops...
            </Text>
          </View>
        ) : workshops.length === 0 ? (
          <View className="rounded-2xl bg-[#F1EEE6] p-6 items-center border border-[#E5E2DB] shadow-xs my-2">
            <View className="w-14 h-14 rounded-full bg-[#E5E2DB] items-center justify-center mb-3">
              <MaterialCommunityIcons
                name="storefront-outline"
                size={28}
                color="#717973"
              />
            </View>
            <Text
              className="text-base text-[#1C1C17] mb-1 font-bold text-center"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              No Workshops Published Yet
            </Text>
            <Text
              className="text-xs text-[#717973] text-center leading-relaxed mb-4 max-w-xs"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Create your first hands-on workshop to welcome cultural travelers into your studio.
            </Text>
            <Button
              title="Create Your First Workshop"
              variant="primary"
              size="md"
              fullWidth={false}
              leftIcon={<Feather name="plus" size={15} color="#000" />}
              onPress={onCreateWorkshop}
            />
          </View>
        ) : (
          <View className="flex flex-col">
            {workshops.map((workshop: Workshop) => {
              const coverImage =
                workshop.images && workshop.images.length > 0
                  ? workshop.images[0].image_url
                  : "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800";

              return (
                <Pressable
                  key={workshop.id}
                  onPress={onViewMyWorkshops}
                  className="rounded-2xl bg-[#F1EEE6] overflow-hidden shadow-xs border border-[#E5E2DB] mb-4 active:scale-[0.99]"
                >
                  {/* Card Cover Image */}
                  <View className="h-36 w-full bg-black/10 relative">
                    <Image
                      source={{ uri: coverImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute top-3 left-3 bg-black/50 px-2.5 py-1 rounded-full">
                      <Text
                        className="text-white text-[11px] font-semibold"
                        style={{ fontFamily: "Inter_600SemiBold" }}
                      >
                        {workshop.craft?.name || craftName}
                      </Text>
                    </View>
                  </View>

                  {/* Card Content */}
                  <View className="p-4 flex flex-col">
                    {/* Title & Rating Row */}
                    <View className="flex-row items-start justify-between mb-2">
                      <Text
                        numberOfLines={1}
                        className="text-base text-[#1C1C17] font-semibold flex-1 mr-2"
                        style={{ fontFamily: "HankenGrotesk_700Bold" }}
                      >
                        {workshop.name}
                      </Text>
                      <View className="flex-row items-center bg-[#DCDAD2] px-2.5 py-1 rounded-full">
                        <MaterialCommunityIcons
                          name="star"
                          size={13}
                          color="#F98740"
                          style={{ marginRight: 3 }}
                        />
                        <Text
                          className="text-xs text-[#1C1C17] font-bold"
                          style={{ fontFamily: "Inter_600SemiBold" }}
                        >
                          {workshop.rating ? workshop.rating.toFixed(1) : "5.0"}
                        </Text>
                      </View>
                    </View>

                    {/* Meta Row: Bookings & Schedule */}
                    <View className="flex-row items-center justify-between text-[#414844] pt-1">
                      <View className="flex-row items-center">
                        <Feather
                          name="users"
                          size={14}
                          color="#414844"
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          className="text-xs text-[#414844]"
                          style={{ fontFamily: "Inter_400Regular" }}
                        >
                          {workshop.max_participants || 6} spots • ₹{workshop.price}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <Feather
                          name="calendar"
                          size={14}
                          color="#414844"
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          className="text-xs text-[#414844]"
                          style={{ fontFamily: "Inter_400Regular" }}
                        >
                          {workshop.duration || "2 Hours"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>


    </View>
  );
};
