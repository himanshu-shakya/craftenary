import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Artisan } from "../../src/types/home";

export interface PopularArtisansListProps {
  artisans: Artisan[];
  onArtisanPress: (artisan: Artisan) => void;
  onViewAllPress?: () => void;
}

export const PopularArtisansList: React.FC<PopularArtisansListProps> = ({
  artisans,
  onArtisanPress,
  onViewAllPress,
}) => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <View className="pb-6">
      {/* Header Row */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text
          className="text-[#1C1C17]"
          style={{
            fontFamily: "HankenGrotesk_700Bold",
            fontSize: 18,
            letterSpacing: -0.2,
          }}
        >
          Popular Near You
        </Text>

        <Pressable
          onPress={onViewAllPress}
          accessibilityRole="button"
          accessibilityLabel="View all artisans"
          hitSlop={8}
          className="active:opacity-75"
        >
          <Text
            className="text-[#0B3B2C]"
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13,
            }}
          >
            View All
          </Text>
        </Pressable>
      </View>

      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {artisans.map((artisan) => {
          const isFav = !!favorites[artisan.id];

          return (
            <Pressable
              key={artisan.id}
              onPress={() => onArtisanPress(artisan)}
              accessibilityRole="button"
              accessibilityLabel={`Artisan ${artisan.name}`}
              className="bg-white rounded-2xl border border-[#E5E2DB] shadow-xs mr-3.5 overflow-hidden active:opacity-90"
              style={{ width: 176 }}
            >
              {/* Artisan Image Container */}
              <View className="w-full h-32 relative bg-[#FAF8F2]">
                <Image
                  source={artisan.image}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {/* Favorite Heart Button */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(artisan.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle Favorite"
                  hitSlop={6}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/35 items-center justify-center backdrop-blur-sm"
                >
                  <FontAwesome
                    name={isFav ? "heart" : "heart-o"}
                    size={14}
                    color={isFav ? "#EF4444" : "#FFFFFF"}
                  />
                </Pressable>
              </View>

              {/* Card Body */}
              <View className="p-3">
                {/* Name & Rating Row */}
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text
                    numberOfLines={1}
                    className="text-[#1C1C17] text-sm flex-1 mr-1"
                    style={{ fontFamily: "HankenGrotesk_700Bold" }}
                  >
                    {artisan.name}
                  </Text>
                  <View className="flex-row items-center bg-[#FFF4E6] px-1.5 py-0.5 rounded-md border border-[#FFE2B3]">
                    <FontAwesome
                      name="star"
                      size={10}
                      color="#D96B16"
                      style={{ marginRight: 3 }}
                    />
                    <Text
                      className="text-[#D96B16] text-[11px]"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      {artisan.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>

                {/* Craft Subtitle */}
                <Text
                  numberOfLines={1}
                  className="text-[#717973] text-xs mb-2.5"
                  style={{ fontFamily: "Inter_400Regular" }}
                >
                  {artisan.craft}
                </Text>

                {/* Location & Hourly Price */}
                <View className="flex-row items-center justify-between pt-1 border-t border-[#F1EEE6]">
                  <View className="flex-row items-center flex-1 mr-1">
                    <Feather name="map-pin" size={11} color="#717973" />
                    <Text
                      numberOfLines={1}
                      className="text-[#717973] text-[11px] ml-1"
                      style={{ fontFamily: "Inter_500Medium" }}
                    >
                      {artisan.location}
                    </Text>
                  </View>
                  <Text
                    className="text-[#0B3B2C] text-xs"
                    style={{ fontFamily: "HankenGrotesk_700Bold" }}
                  >
                    ₹{artisan.pricePerHour}/hr
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
