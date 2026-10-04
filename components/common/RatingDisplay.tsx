import React from "react";
import { Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export interface RatingDisplayProps {
  rating: number;
  reviewsCount?: number;
  size?: "sm" | "md" | "lg";
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewsCount,
  size = "sm",
}) => {
  const iconSize = size === "lg" ? 14 : size === "md" ? 12 : 10;
  const textSize = size === "lg" ? 13 : size === "md" ? 12 : 11;

  return (
    <View className="flex-row items-center bg-[#FFF4E6] px-1.5 py-0.5 rounded-md border border-[#FFE2B3]">
      <FontAwesome
        name="star"
        size={iconSize}
        color="#D96B16"
        style={{ marginRight: 3 }}
      />
      <Text
        className="text-[#D96B16] font-bold"
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: textSize,
        }}
      >
        {rating.toFixed(1)}
      </Text>
      {reviewsCount !== undefined && reviewsCount > 0 && (
        <Text
          className="text-[#717973] ml-1"
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: textSize - 1,
          }}
        >
          ({reviewsCount})
        </Text>
      )}
    </View>
  );
};
