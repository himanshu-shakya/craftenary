import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Workshop } from "../../src/types/workshop";
import { VerifiedBadge } from "../common/VerifiedBadge";
import { RatingDisplay } from "../common/RatingDisplay";
import { PriceDisplay } from "../common/PriceDisplay";
import { Avatar } from "../common/Avatar";

export interface WorkshopCardProps {
  workshop: Workshop;
  onPress: (workshop: Workshop) => void;
  width?: number | string;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({
  workshop,
  onPress,
  width = "100%",
}) => {
  const coverImage =
    workshop.images && workshop.images.length > 0
      ? workshop.images[0].image_url
      : "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800";

  const artisanName = workshop.artisan
    ? `${workshop.artisan.first_name} ${workshop.artisan.last_name}`
    : "Master Artisan";

  const isVerified = workshop.artisan?.verification_status === "verified";

  return (
    <Pressable
      onPress={() => onPress(workshop)}
      accessibilityRole="button"
      accessibilityLabel={`Workshop ${workshop.name}`}
      style={{ width: width as any }}
      className="bg-white rounded-2xl border border-[#E5E2DB] shadow-xs mb-4 overflow-hidden active:opacity-90"
    >
      {/* Cover Image Container */}
      <View className="w-full h-40 relative bg-black/10">
        <Image
          source={{ uri: coverImage }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Craft Tag Badge */}
        <View className="absolute top-3 left-3 bg-[#0B3B2C]/85 px-3 py-1 rounded-full shadow-xs">
          <Text
            className="text-white text-[11px] font-semibold"
            style={{ fontFamily: "Inter_600SemiBold" }}
          >
            {workshop.craft?.name || "Craft Experience"}
          </Text>
        </View>

        {/* Rating Badge Top Right */}
        <View className="absolute top-3 right-3 shadow-xs">
          <RatingDisplay
            rating={workshop.rating || 5.0}
            reviewsCount={workshop.reviews_count}
          />
        </View>
      </View>

      {/* Card Content */}
      <View className="p-3.5">
        {/* Title */}
        <Text
          numberOfLines={1}
          className="text-base text-[#1C1C17] mb-1"
          style={{ fontFamily: "HankenGrotesk_700Bold" }}
        >
          {workshop.name}
        </Text>

        {/* Artisan and Verification Row */}
        <View className="flex-row items-center mb-3">
          <Avatar
            imageUrl={workshop.artisan?.profile_image_url}
            name={artisanName}
            size={20}
          />
          <Text
            numberOfLines={1}
            className="text-xs text-[#414844] ml-1.5 mr-1"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            {artisanName}
          </Text>
          {isVerified && <VerifiedBadge size={13} />}
        </View>

        {/* Location & Price Bottom Row */}
        <View className="flex-row items-center justify-between pt-2 border-t border-[#F1EEE6]">
          <View className="flex-row items-center flex-1 mr-2">
            <Feather name="map-pin" size={12} color="#717973" />
            <Text
              numberOfLines={1}
              className="text-xs text-[#717973] ml-1 flex-1"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              {workshop.location || `${workshop.city}, ${workshop.state}`}
            </Text>
          </View>

          <PriceDisplay price={workshop.price} size="sm" />
        </View>
      </View>
    </Pressable>
  );
};
