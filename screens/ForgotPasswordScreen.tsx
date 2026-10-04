import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

import { FloatingLabelInput } from "../components/auth/FloatingLabelInput";
import { Button } from "../components/Button";
import { useAuth } from "../src/hooks/useAuth";

export interface ForgotPasswordScreenProps {
  onNavigateLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateLogin,
}) => {
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();

  const [fontsLoaded] = useFonts({
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) return;
    setError(undefined);
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(cleanEmail);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.error || "Unable to send reset instructions.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
          <Pressable
            onPress={onNavigateLogin}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            className="w-9 h-9 rounded-full bg-[#E9E7DF] items-center justify-center -ml-1 mr-2.5 active:bg-[#DDD9D0]"
          >
            <Feather name="arrow-left" size={20} color="#1C1C17" />
          </Pressable>

          <Text
            className="text-[#1C1C17]"
            style={{
              fontFamily: "HankenGrotesk_600SemiBold",
              fontSize: 22,
              lineHeight: 28,
              letterSpacing: -0.2,
            }}
          >
            Reset Password
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
                name="lock-reset"
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
              Forgot Password?
            </Text>
          </View>

          {isSuccess ? (
            <View className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 mt-4 mb-8">
              <Text
                className="text-emerald-900 font-bold text-base mb-2"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Check your email
              </Text>
              <Text
                className="text-emerald-800 text-sm leading-relaxed mb-4"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                We've sent you a password reset link to{" "}
                <Text className="font-bold">{email.trim()}</Text>.
              </Text>

              <Button
                title="Back to Login"
                onPress={onNavigateLogin}
              />
            </View>
          ) : (
            <>
              <Text
                className="text-[#414844] mb-6"
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                Enter the email address associated with your Craftenary account and we will send you a link to reset your password.
              </Text>

              {/* Error Banner */}
              {error ? (
                <View className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <Text
                    className="text-red-700 text-xs"
                    style={{ fontFamily: "Inter_500Medium" }}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Email Input */}
              <View className="mb-4">
                <FloatingLabelInput
                  label="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(undefined);
                  }}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={error}
                />
              </View>

              {/* Submit Button */}
              <Button
                title="Send Reset Link"
                loadingTitle="Sending Reset Link..."
                onPress={handleSubmit}
                loading={isLoading}
              />

              {/* Return to Login */}
              <View className="items-center mt-8 mb-4">
                <Pressable
                  onPress={onNavigateLogin}
                  accessibilityRole="button"
                  hitSlop={10}
                  className="py-2 px-3"
                >
                  {({ pressed }) => (
                    <Text
                      style={{
                        opacity: pressed ? 0.75 : 1,
                        fontFamily: "Inter_500Medium",
                        fontSize: 14.5,
                        color: "#1C1C17",
                        textDecorationLine: "underline",
                      }}
                    >
                      Back to Login
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
