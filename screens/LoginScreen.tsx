import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { FloatingLabelInput } from "../components/auth/FloatingLabelInput";
import { PasswordInput } from "../components/auth/PasswordInput";
import { Button } from "../components/Button";
import { SocialLoginButton } from "../components/auth/SocialLoginButton";
import { useAuth } from "../src/hooks/useAuth";

export interface LoginScreenProps {
  onNavigateBack?: () => void;
  onNavigateForgotPassword?: () => void;
  onNavigateSignUp?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateBack,
  onNavigateForgotPassword,
  onNavigateSignUp,
}) => {
  const insets = useSafeAreaInsets();
  const { signIn, signInWithGoogle } = useAuth();

  const [fontsLoaded] = useFonts({
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate form
  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string; general?: string } = {};

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      newErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please enter your password.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (isLoading) return;
    setErrors({});
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await signIn(email, password);
      if (!response.success) {
        setErrors({ general: response.error || "Invalid email or password." });
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await signInWithGoogle();
      if (!response.success && response.error && response.error !== "Authentication was canceled.") {
        setErrors({ general: response.error });
      }
    } catch (error) {
      setErrors({ general: "Something went wrong with Google Login. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const handleForgotPassword = () => {
    if (onNavigateForgotPassword) {
      onNavigateForgotPassword();
    }
  };

  const handleCreateAccount = () => {
    if (onNavigateSignUp) {
      onNavigateSignUp();
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
          {/* Solid Surface Back Arrow */}
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            className="w-9 h-9 rounded-full bg-[#E9E7DF] items-center justify-center -ml-1 mr-2.5 active:bg-[#DDD9D0]"
          >
            <Feather name="arrow-left" size={20} color="#1C1C17" />
          </Pressable>

          {/* Header Title */}
          <Text
            className="text-[#1C1C17]"
            style={{
              fontFamily: "HankenGrotesk_600SemiBold",
              fontSize: 22,
              lineHeight: 28,
              letterSpacing: -0.2,
            }}
          >
            Login
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          }}
        >
          {/* Hero Image Section */}
          <View className="w-full h-72 relative bg-[#FAF8F2]">
            <ImageBackground
              source={require("../assets/images/artisan-hero.jpg")}
              className="w-full h-full justify-end"
              resizeMode="cover"
            >
              {/* Smooth Bottom Gradient Fade */}
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(250, 248, 242, 0.4)",
                  "rgba(250, 248, 242, 0.85)",
                  "#FAF8F2",
                ]}
                locations={[0, 0.4, 0.75, 1]}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 140,
                }}
              />

              {/* Hero Title & Emblem Icon */}
              <View className="px-6 pb-2 z-10 flex-row items-center">
                {/* Botanical Badge (36x36 Dark Forest Green) */}
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3 shadow-sm"
                  style={{ backgroundColor: "#0B3B2C" }}
                >
                  <MaterialCommunityIcons
                    name="flower-tulip-outline"
                    size={19}
                    color="#D1E7DD"
                  />
                </View>

                {/* Welcome Back Title */}
                <Text
                  className="text-[#1C1C17]"
                  style={{
                    fontFamily: "HankenGrotesk_700Bold",
                    fontSize: 28,
                    lineHeight: 34,
                    letterSpacing: -0.4,
                  }}
                >
                  Welcome Back
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* Form & Content Container */}
          <View className="px-6 pt-1">
            {/* Description Text */}
            <Text
              className="text-[#414844] mb-6"
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15.5,
                lineHeight: 23,
                maxWidth: 320,
              }}
            >
              Sign in to access exclusive artisan collections and continue your journey.
            </Text>

            {/* General Error Banner */}
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

            {/* Form Inputs */}
            <View className="mb-0">
              <FloatingLabelInput
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email || errors.general) {
                    setErrors((prev) => ({
                      ...prev,
                      email: undefined,
                      general: undefined,
                    }));
                  }
                }}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
              />

              <PasswordInput
                label="Password"
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
                placeholder="Enter your password"
                error={errors.password}
              />
            </View>

            {/* Forgot Password Link */}
            <View className="items-end mt-1 mb-6">
              <Pressable
                onPress={handleForgotPassword}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Forgot Password?"
              >
                {({ pressed }) => (
                  <Text
                    style={{
                      color: pressed ? "#0B3B2C" : "#1C1C17",
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                    }}
                  >
                    Forgot Password?
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Login Button */}
            <Button
              title="Sign In"
              loadingTitle="Signing In..."
              onPress={handleLogin}
              loading={isLoading}
            />

            {/* OR Divider */}
            <View className="flex-row items-center my-6">
              <View
                className="flex-1 h-[1px]"
                style={{ backgroundColor: "rgba(193, 200, 194, 0.45)" }}
              />
              <Text
                className="px-4 text-[#414844]"
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                  lineHeight: 16,
                  letterSpacing: 0.5,
                }}
              >
                OR
              </Text>
              <View
                className="flex-1 h-[1px]"
                style={{ backgroundColor: "rgba(193, 200, 194, 0.45)" }}
              />
            </View>

            {/* Google Login Button */}
            <SocialLoginButton
              title="Continue with Google"
              onPress={handleGoogleLogin}
              isLoading={isLoading}
            />

            {/* Bottom Create Account Link */}
            <View className="items-center mt-10 mb-4">
              <Pressable
                onPress={handleCreateAccount}
                accessibilityRole="button"
                hitSlop={10}
                className="py-2 px-3"
              >
                {({ pressed }) => (
                  <Text
                    style={{
                      opacity: pressed ? 0.75 : 1,
                      fontFamily: "Inter_400Regular",
                      fontSize: 14.5,
                      color: "#1C1C17",
                    }}
                  >
                    New to Heritage?{" "}
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        textDecorationLine: "underline",
                        color: "#1C1C17",
                      }}
                    >
                      Create an account
                    </Text>
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
