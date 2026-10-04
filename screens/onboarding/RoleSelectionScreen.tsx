import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { UserRole } from "../../src/types/auth";
import { Button } from "../../components/Button";

export interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  onSignOut?: () => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onSelectRole,
  onSignOut,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  const isArtisan = selectedRole === "artisan";
  const isTourist = selectedRole === "tourist";

  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="dark" />

      {/* Top Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 14),
        }}
        className="px-6 pb-2 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg bg-[#0B3B2C]/10 items-center justify-center mr-2.5">
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={18}
              color="#0B3B2C"
            />
          </View>
          <Text
            className="text-[#0B3B2C]"
            style={{
              fontFamily: "HankenGrotesk_700Bold",
              fontSize: 20,
            }}
          >
            Heritage
          </Text>
        </View>

        {onSignOut && (
          <Button
            title="Sign Out"
            variant="secondary"
            size="sm"
            fullWidth={false}
            leftIcon={<Feather name="log-out" size={14} color="#8A4A00" />}
            textStyle={{ color: "#8A4A00", fontSize: 12, fontFamily: "Inter_600SemiBold" }}
            onPress={onSignOut}
          />
        )}
      </View>

      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title and Subtitle */}
        <View className="mb-6">
          <Text
            className="text-xs text-[#717973] uppercase mb-1"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Welcome to Craftenary
          </Text>
          <Text
            className="text-2xl text-[#1C1C17] mb-2"
            style={{
              fontFamily: "HankenGrotesk_700Bold",
              letterSpacing: -0.4,
            }}
          >
            How will you use the app?
          </Text>
          <Text
            className="text-sm text-[#414844] leading-relaxed"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            Choose your primary experience to personalize your workspace and community tools.
          </Text>
        </View>

        {/* Role Option 1: Artisan */}
        <TouchableOpacity
          onPress={() => setSelectedRole("artisan")}
          activeOpacity={0.8}
          style={{
            backgroundColor: isArtisan ? "rgba(11, 59, 44, 0.06)" : "#FFFFFF",
            borderColor: isArtisan ? "#0B3B2C" : "#E5E2DB",
            borderWidth: 2,
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <View className="flex-row items-start justify-between mb-3" pointerEvents="none">
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: isArtisan ? "#0B3B2C" : "rgba(11, 59, 44, 0.08)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="palette-outline"
                size={26}
                color={isArtisan ? "#FFFFFF" : "#0B3B2C"}
              />
            </View>

            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: isArtisan ? 0 : 2,
                borderColor: "#C1C8C2",
                backgroundColor: isArtisan ? "#0B3B2C" : "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isArtisan && <Feather name="check" size={14} color="#FFFFFF" />}
            </View>
          </View>

          <Text
            className="text-lg text-[#1C1C17] mb-1"
            style={{ fontFamily: "HankenGrotesk_700Bold" }}
          >
            I am an Artisan
          </Text>
          <Text
            className="text-xs text-[#717973] leading-relaxed mb-3"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            Share your traditional craftsmanship, host hands-on workshops, and connect with cultural travelers.
          </Text>

          <View className="flex-row items-center flex-wrap gap-2 pt-2 border-t border-[#E5E2DB]/60" pointerEvents="none">
            <View className="flex-row items-center mr-3">
              <Feather name="check" size={12} color="#0B3B2C" />
              <Text
                className="text-[11px] text-[#414844] ml-1"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                Create workshop listings
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="check" size={12} color="#0B3B2C" />
              <Text
                className="text-[11px] text-[#414844] ml-1"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                Get verified badge
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Role Option 2: Tourist */}
        <TouchableOpacity
          onPress={() => setSelectedRole("tourist")}
          activeOpacity={0.8}
          style={{
            backgroundColor: isTourist ? "rgba(217, 107, 22, 0.06)" : "#FFFFFF",
            borderColor: isTourist ? "#D96B16" : "#E5E2DB",
            borderWidth: 2,
            borderRadius: 24,
            padding: 20,
            marginBottom: 28,
          }}
        >
          <View className="flex-row items-start justify-between mb-3" pointerEvents="none">
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: isTourist ? "#D96B16" : "rgba(217, 107, 22, 0.08)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather
                name="compass"
                size={24}
                color={isTourist ? "#FFFFFF" : "#D96B16"}
              />
            </View>

            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: isTourist ? 0 : 2,
                borderColor: "#C1C8C2",
                backgroundColor: isTourist ? "#D96B16" : "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isTourist && <Feather name="check" size={14} color="#FFFFFF" />}
            </View>
          </View>

          <Text
            className="text-lg text-[#1C1C17] mb-1"
            style={{ fontFamily: "HankenGrotesk_700Bold" }}
          >
            I am a Tourist / Explorer
          </Text>
          <Text
            className="text-xs text-[#717973] leading-relaxed mb-3"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            Discover master artisan studios, book hands-on workshops, and immerse yourself in living heritage.
          </Text>

          <View className="flex-row items-center flex-wrap gap-2 pt-2 border-t border-[#E5E2DB]/60" pointerEvents="none">
            <View className="flex-row items-center mr-3">
              <Feather name="check" size={12} color="#D96B16" />
              <Text
                className="text-[11px] text-[#414844] ml-1"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                Personalized craft trails
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="check" size={12} color="#D96B16" />
              <Text
                className="text-[11px] text-[#414844] ml-1"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                Instant workshop bookings
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Continue Button */}
        <Button
          title={
            isArtisan
              ? "Continue as Master Artisan"
              : isTourist
              ? "Continue as Explorer / Traveler"
              : "Select an Experience"
          }
          disabledTitle="Select Role to Continue"
          variant="primary"
          onPress={handleContinue}
          disabled={!selectedRole}
        />
      </ScrollView>
    </View>
  );
};
