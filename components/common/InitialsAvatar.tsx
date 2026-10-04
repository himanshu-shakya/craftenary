import React from "react";
import { Text, View } from "react-native";

export interface InitialsAvatarProps {
  name?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name = "User",
  size = 40,
  backgroundColor = "#0B3B2C",
  textColor = "#FFFFFF",
}) => {
  const getInitials = (str: string): string => {
    const clean = str.trim();
    if (!clean) return "U";
    const parts = clean.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const fontSize = Math.max(10, Math.floor(size * 0.38));

  return (
    <View
      accessibilityLabel={`Avatar for ${name}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: textColor,
          fontFamily: "HankenGrotesk_700Bold",
          fontSize,
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  );
};
