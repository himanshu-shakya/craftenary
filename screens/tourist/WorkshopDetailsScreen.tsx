import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { Workshop } from "../../src/types/workshop";
import { Avatar } from "../../components/common/Avatar";
import { VerifiedBadge } from "../../components/common/VerifiedBadge";
import { RatingDisplay } from "../../components/common/RatingDisplay";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { Button } from "../../components/Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface WorkshopDetailsScreenProps {
  workshop: Workshop;
  onBack: () => void;
  onBookNow: (workshop: Workshop) => void;
}

export const WorkshopDetailsScreen: React.FC<WorkshopDetailsScreenProps> = ({
  workshop,
  onBack,
  onBookNow,
}) => {
  const insets = useSafeAreaInsets();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const imagesList =
    workshop.images && workshop.images.length > 0
      ? workshop.images.map((img) => img.image_url)
      : [
          "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800",
        ];

  const artisanName = workshop.artisan
    ? `${workshop.artisan.first_name} ${workshop.artisan.last_name}`
    : "Master Artisan";

  const isVerified = workshop.artisan?.verification_status === "verified";

  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="light" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 80,
        }}
      >
        {/* Multi-Image Swipeable Carousel */}
        <View className="w-full h-72 relative bg-black">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              if (slide !== activeImageIndex) {
                setActiveImageIndex(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {imagesList.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={{ width: SCREEN_WIDTH, height: 288 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Top Floating Back Button */}
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={{
              position: "absolute",
              top: Math.max(insets.top, 14),
              left: 16,
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>

          {/* Image Pagination Dots */}
          {imagesList.length > 1 && (
            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center space-x-1.5">
              {imagesList.map((_, i) => (
                <View
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImageIndex === i
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content Container */}
        <View className="px-6 pt-5">
          {/* Craft Badge & Rating Row */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="bg-[#0B3B2C]/10 border border-[#0B3B2C]/20 px-3 py-1 rounded-full">
              <Text
                className="text-xs text-[#0B3B2C] font-semibold"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                {workshop.craft?.name || "Craft"}
              </Text>
            </View>

            <RatingDisplay
              rating={workshop.rating || 5.0}
              reviewsCount={workshop.reviews_count || 48}
              size="md"
            />
          </View>

          {/* Main Title */}
          <Text
            className="text-2xl text-[#1C1C17] mb-4"
            style={{
              fontFamily: "HankenGrotesk_700Bold",
              letterSpacing: -0.4,
            }}
          >
            {workshop.name}
          </Text>

          {/* Master Artisan Card */}
          <View className="bg-white rounded-2xl p-4 border border-[#E5E2DB] shadow-xs mb-5 flex-row items-center">
            <Avatar
              imageUrl={workshop.artisan?.profile_image_url}
              name={artisanName}
              size={50}
              isVerified={isVerified}
            />

            <View className="ml-3.5 flex-1">
              <View className="flex-row items-center">
                <Text
                  className="text-base text-[#1C1C17] mr-1.5"
                  style={{ fontFamily: "HankenGrotesk_700Bold" }}
                >
                  {artisanName}
                </Text>
                {isVerified && <VerifiedBadge size={14} />}
              </View>

              <Text
                className="text-xs text-[#717973] mt-0.5"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                {workshop.artisan?.experience_years || 15}+ Years of Master Practice
              </Text>
            </View>
          </View>

          {/* Workshop Key Highlights Grid */}
          <View className="bg-white rounded-2xl p-4 border border-[#E5E2DB] shadow-xs mb-5 flex-row justify-between">
            <View className="items-center flex-1 border-r border-[#E5E2DB]">
              <Feather name="clock" size={16} color="#0B3B2C" />
              <Text
                className="text-xs text-[#1C1C17] font-semibold mt-1"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                {workshop.duration}
              </Text>
              <Text
                className="text-[10px] text-[#717973]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Session Length
              </Text>
            </View>

            <View className="items-center flex-1 border-r border-[#E5E2DB]">
              <Feather name="users" size={16} color="#0B3B2C" />
              <Text
                className="text-xs text-[#1C1C17] font-semibold mt-1"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Max {workshop.max_participants || 6}
              </Text>
              <Text
                className="text-[10px] text-[#717973]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Intimate Group
              </Text>
            </View>

            <View className="items-center flex-1">
              <Feather name="map-pin" size={16} color="#0B3B2C" />
              <Text
                numberOfLines={1}
                className="text-xs text-[#1C1C17] font-semibold mt-1"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                {workshop.city || "Studio"}
              </Text>
              <Text
                className="text-[10px] text-[#717973]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Location
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text
              className="text-base text-[#1C1C17] mb-2"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              About the Experience
            </Text>
            <Text
              className="text-xs text-[#414844] leading-relaxed"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              {workshop.description}
            </Text>
          </View>

          {/* Inclusions */}
          <View className="bg-white rounded-2xl p-4 border border-[#E5E2DB] shadow-xs mb-4">
            <Text
              className="text-xs text-[#717973] uppercase mb-2.5 font-bold"
              style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
            >
              What is Included
            </Text>

            <View className="flex-row items-center mb-2">
              <Feather
                name="check-circle"
                size={14}
                color="#0B3B2C"
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-xs text-[#1C1C17]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                All traditional materials, tools & natural pigments
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <Feather
                name="check-circle"
                size={14}
                color="#0B3B2C"
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-xs text-[#1C1C17]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Take home your customized fired ceramic / craft piece
              </Text>
            </View>

            <View className="flex-row items-center">
              <Feather
                name="check-circle"
                size={14}
                color="#0B3B2C"
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-xs text-[#1C1C17]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Traditional tea, snacks & studio archive tour
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "rgba(193, 200, 194, 0.4)",
        }}
        className="px-6 pt-3 flex-row items-center justify-between shadow-lg"
      >
        <View>
          <Text
            className="text-[10px] text-[#717973] uppercase font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Total Price
          </Text>
          <PriceDisplay price={workshop.price} size="lg" />
        </View>

        <Button
          title="Book Workshop"
          variant="primary"
          size="md"
          fullWidth={false}
          rightIcon={<Feather name="arrow-right" size={16} color="#000" />}
          onPress={() => onBookNow(workshop)}
        />
      </View>
    </View>
  );
};
