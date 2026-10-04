import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button } from "../Button";

export interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
  onBack,
  onSkip,
  canSkip = false,
}) => {
  const progressPercent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <View className="px-5 pt-2 pb-4 bg-[#FAF8F2]">
      {/* Top Action Row */}
      <View className="flex-row items-center justify-between mb-3">
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back step"
            hitSlop={10}
            className="w-9 h-9 rounded-full bg-[#E9E7DF] items-center justify-center -ml-1 active:opacity-75"
          >
            <Feather name="arrow-left" size={20} color="#1C1C17" />
          </Pressable>
        ) : (
          <View className="w-9 h-9" />
        )}

        <View className="px-3 py-1 rounded-full bg-[#E9E7DF]">
          <Text
            className="text-xs text-[#717973]"
            style={{ fontFamily: "Inter_600SemiBold" }}
          >
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        {canSkip && onSkip ? (
          <Button
            title="Skip"
            variant="secondary"
            size="sm"
            fullWidth={false}
            textStyle={{ color: "#8A4A00", fontSize: 12, fontFamily: "Inter_600SemiBold" }}
            onPress={onSkip}
          />
        ) : (
          <View className="w-9 h-9" />
        )}
      </View>

      {/* Progress Bar Line */}
      <View className="w-full h-1.5 bg-[#E5E2DB] rounded-full overflow-hidden mb-4">
        <View
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-[#0B3B2C] rounded-full"
        />
      </View>

      {/* Step Title & Subtitle */}
      <Text
        className="text-2xl text-[#1C1C17] mb-1"
        style={{
          fontFamily: "HankenGrotesk_700Bold",
          letterSpacing: -0.4,
        }}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          className="text-sm text-[#414844] leading-5"
          style={{ fontFamily: "Inter_400Regular" }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};
