import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export interface VerifiedBadgeProps {
  size?: number;
  showLabel?: boolean;
  label?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 15,
  showLabel = false,
  label = "Verified Artisan",
}) => {
  return (
    <View
      accessibilityLabel="Verified artisan"
      accessibilityRole="image"
      className="flex-row items-center inline-flex"
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#1D9BF0",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialIcons name="check" size={size * 0.75} color="#FFFFFF" />
      </View>
      {showLabel && (
        <Text
          className="text-xs text-[#0284C7] ml-1.5"
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          {label}
        </Text>
      )}
    </View>
  );
};
