import React from "react";
import { Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "../Button";

export interface EmptyStateProps {
  iconName?: string;
  iconFamily?: "Feather" | "MaterialCommunityIcons";
  title: string;
  description: string;
  actionTitle?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = "inbox",
  iconFamily = "Feather",
  title,
  description,
  actionTitle,
  onActionPress,
}) => {
  return (
    <View className="py-12 px-6 items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-[#E9E7DF] items-center justify-center mb-4">
        {iconFamily === "Feather" ? (
          <Feather name={iconName as any} size={28} color="#717973" />
        ) : (
          <MaterialCommunityIcons
            name={iconName as any}
            size={30}
            color="#717973"
          />
        )}
      </View>

      <Text
        className="text-base text-[#1C1C17] text-center mb-1.5"
        style={{ fontFamily: "HankenGrotesk_700Bold" }}
      >
        {title}
      </Text>

      <Text
        className="text-xs text-[#717973] text-center leading-relaxed max-w-xs mb-5"
        style={{ fontFamily: "Inter_400Regular" }}
      >
        {description}
      </Text>

      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          variant="primary"
          size="md"
          fullWidth={false}
          onPress={onActionPress}
        />
      )}
    </View>
  );
};
