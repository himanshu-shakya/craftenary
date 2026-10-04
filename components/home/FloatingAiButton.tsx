import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export interface FloatingAiButtonProps {
  onPress: () => void;
  bottomOffset?: number;
}

export const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({
  onPress,
  bottomOffset = 80,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="AI Heritage Assistant"
      style={{
        position: "absolute",
        right: 18,
        bottom: bottomOffset,
        backgroundColor: "#904D00",
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#904D00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 999,
      }}
    >
      <MaterialCommunityIcons name="creation" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
};
