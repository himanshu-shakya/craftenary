import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFonts,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import { PasswordInput } from "../components/auth/PasswordInput";
import { Button } from "../components/Button";
import { useAuth } from "../src/hooks/useAuth";

export interface ResetPasswordScreenProps {
  onSuccess: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { updatePassword, clearRecoveryFlow } = useAuth();

  const [fontsLoaded] = useFonts({
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: {
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    if (!password) {
      newErrors.password = "New password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (isLoading) return;
    setErrors({});
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await updatePassword(password);
      if (res.success) {
        Alert.alert(
          "Password updated successfully.",
          "You can now access your account with your new password.",
          [
            {
              text: "Continue",
              onPress: () => {
                clearRecoveryFlow();
                onSuccess();
              },
            },
          ]
        );
      } else {
        setErrors({ general: res.error || "Unable to update password." });
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-[#FAF8F2] items-center justify-center">
        <ActivityIndicator color="#0B3B2C" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="dark" />

      {/* Top Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 14),
          backgroundColor: "#FAF8F2",
          zIndex: 10,
        }}
        className="px-5 pb-2"
      >
        <View className="h-12 flex-row items-center">
          <Text
            className="text-[#1C1C17]"
            style={{
              fontFamily: "HankenGrotesk_600SemiBold",
              fontSize: 22,
              lineHeight: 28,
              letterSpacing: -0.2,
            }}
          >
            Update Password
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          }}
        >
          {/* Header Badge */}
          <View className="flex-row items-center mb-3">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "#0B3B2C" }}
            >
              <MaterialCommunityIcons
                name="key-outline"
                size={19}
                color="#D1E7DD"
              />
            </View>
            <Text
              className="text-[#1C1C17]"
              style={{
                fontFamily: "HankenGrotesk_700Bold",
                fontSize: 26,
                lineHeight: 32,
              }}
            >
              Set New Password
            </Text>
          </View>

          <Text
            className="text-[#414844] mb-6"
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            Please create a new password for your Craftenary account (minimum 8 characters).
          </Text>

          {/* Error Banner */}
          {errors.general ? (
            <View className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <Text
                className="text-red-700 text-xs"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                {errors.general}
              </Text>
            </View>
          ) : null}

          {/* Password Inputs */}
          <View className="mb-4">
            <PasswordInput
              label="New Password (min. 8 characters)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password || errors.general) {
                  setErrors((prev) => ({
                    ...prev,
                    password: undefined,
                    general: undefined,
                  }));
                }
              }}
              placeholder="Enter your new password"
              error={errors.password}
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword || errors.general) {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                    general: undefined,
                  }));
                }
              }}
              placeholder="Re-enter your new password"
              error={errors.confirmPassword}
            />
          </View>

          {/* Submit Button */}
          <Button
            title="Save New Password"
            loadingTitle="Saving New Password..."
            onPress={handleUpdatePassword}
            loading={isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
