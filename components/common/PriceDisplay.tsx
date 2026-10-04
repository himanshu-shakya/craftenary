import React from "react";
import { Text, View } from "react-native";

export interface PriceDisplayProps {
  price: number;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  suffix = "/person",
  size = "md",
  color = "#0B3B2C",
}) => {
  const fontSize = size === "lg" ? 18 : size === "md" ? 15 : 13;

  return (
    <View className="flex-row items-baseline">
      <Text
        style={{
          color,
          fontFamily: "HankenGrotesk_700Bold",
          fontSize,
        }}
      >
        ₹{price.toLocaleString("en-IN")}
      </Text>
      {suffix ? (
        <Text
          className="text-[#717973] ml-0.5"
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: fontSize * 0.75,
          }}
        >
          {suffix}
        </Text>
      ) : null}
    </View>
  );
};
