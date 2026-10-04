import React, { useEffect, useState } from "react";
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
import { PasswordInput } from "../components/auth/PasswordInput";
import { Button } from "../components/Button";
import { SocialLoginButton } from "../components/auth/SocialLoginButton";
import { useAuth } from "../src/hooks/useAuth";

export interface SignupScreenProps {
  onNavigateLogin: () => void;
}

type PasswordStrength = "Weak" | "Medium" | "Strong";

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onNavigateLogin,
}) => {
  const insets = useSafeAreaInsets();
  const { signUp, resendVerificationEmail, signInWithGoogle } = useAuth();

  const [fontsLoaded] = useFonts({
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Success / Verification State
  const [isVerificationRequired, setIsVerificationRequired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle resend countdown cooldown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  // Calculate password strength
  const getPasswordStrength = (pwd: string): PasswordStrength | null => {
    if (!pwd) return null;
    if (pwd.length < 8) return "Weak";
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    if (pwd.length >= 10 && hasLetters && hasNumbers && hasSpecial) {
      return "Strong";
    }
    if (pwd.length >= 8 && hasLetters && (hasNumbers || hasSpecial)) {
      return "Medium";
    }
    return "Weak";
  };

  const passwordStrength = getPasswordStrength(password);

  const validate = (): boolean => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    const cleanFirstName = firstName.trim();
    if (!cleanFirstName) {
      newErrors.firstName = "Please enter your first name.";
    }

    const cleanLastName = lastName.trim();
    if (!cleanLastName) {
      newErrors.lastName = "Please enter your last name.";
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      newErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please enter a password.";
    } else if (password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (isLoading) return;
    setErrors({});
    if (!validate()) return;

    setIsLoading(true);
    const submittedEmail = email.trim();

    try {
      const response = await signUp(
        submittedEmail,
        password,
        firstName.trim(),
        lastName.trim()
      );

      if (response.success) {
        // Clear sensitive password inputs
        setPassword("");
        setConfirmPassword("");

        if (response.needsEmailVerification) {
          setRegisteredEmail(submittedEmail);
          setIsVerificationRequired(true);
        }
      } else {
        setErrors({
          general:
            response.error || "Unable to create your account. Please try again.",
        });
      }
    } catch (err: unknown) {
      if (__DEV__) {
        console.error("[SignupScreen] Uncaught error during signup:", err);
      }
      setErrors({
        general:
          err instanceof Error
            ? err.message
            : "Unable to create your account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await signInWithGoogle();
      if (!response.success && response.error && response.error !== "Authentication was canceled.") {
        setErrors({ general: response.error });
      }
    } catch (error) {
      setErrors({ general: "Something went wrong with Google Signup. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0 || !registeredEmail) return;

    setIsResending(true);
    setResendSuccess(false);

    try {
      const res = await resendVerificationEmail(registeredEmail);
      if (res.success) {
        setResendSuccess(true);
        setResendCooldown(60); // 60s cooldown
      } else {
        setErrors({
          general: res.error || "Failed to resend verification email.",
        });
      }
    } catch {
      setErrors({
        general: "Unable to resend verification email. Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-[#FAF8F2] items-center justify-center">
        <ActivityIndicator color="#0B3B2C" size="large" />
      </View>
    );
  }

  // 1. Dedicated Verification Required State
  if (isVerificationRequired) {
    return (
      <View className="flex-1 bg-[#FAF8F2]">
        <StatusBar style="dark" />

        {/* Header */}
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
              accessibilityLabel="Back to Login"
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
              Verify Email
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white border border-[#C1C8C2]/50 rounded-2xl p-6 shadow-sm mb-6">
            <View className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center mb-4">
              <Feather name="mail" size={24} color="#059669" />
            </View>

            <Text
              className="text-2xl text-[#1C1C17] mb-2"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              Account Created!
            </Text>

            <Text
              className="text-[#414844] text-sm leading-relaxed mb-4"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              We've sent a verification email to:{"\n"}
              <Text className="font-bold text-[#1C1C17]">
                {registeredEmail}
              </Text>
            </Text>

            <Text
              className="text-xs text-[#717973] leading-relaxed mb-6"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Please check your inbox and click the verification link before logging in to your Craftenary account.
            </Text>

            {/* Resend Confirmation feedback */}
            {resendSuccess && (
              <View className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex-row items-center">
                <Feather name="check-circle" size={16} color="#059669" />
                <Text
                  className="text-emerald-800 text-xs ml-2 font-medium"
                  style={{ fontFamily: "Inter_500Medium" }}
                >
                  Verification email sent again.
                </Text>
              </View>
            )}

            {/* Back to Login Action */}
            <Button
              title="Back to Login"
              onPress={onNavigateLogin}
              style={{ marginBottom: 12 }}
            />

            {/* Resend Action */}
            <Button
              title={
                resendCooldown > 0
                  ? `Resend Email in ${resendCooldown}s`
                  : "Resend Verification Email"
              }
              variant="primary"
              loading={isResending}
              loadingTitle="Sending..."
              disabled={isResending || resendCooldown > 0}
              onPress={handleResendEmail}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // 2. Create Account Form State
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
            Create Account
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
                name="flower-tulip-outline"
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
              Join Craftenary
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
            Connect with verified Indian master artisans and book authentic cultural craft experiences.
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

          {/* Inputs */}
          <View className="mb-2">
            <View className="flex-row -mx-1.5">
              <View className="flex-1 px-1.5">
                <FloatingLabelInput
                  label="First Name"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (errors.firstName || errors.general) {
                      setErrors((prev) => ({
                        ...prev,
                        firstName: undefined,
                        general: undefined,
                      }));
                    }
                  }}
                  placeholder="e.g. Aarav"
                  autoCapitalize="words"
                  autoCorrect={false}
                  error={errors.firstName}
                />
              </View>
              <View className="flex-1 px-1.5">
                <FloatingLabelInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (errors.lastName || errors.general) {
                      setErrors((prev) => ({
                        ...prev,
                        lastName: undefined,
                        general: undefined,
                      }));
                    }
                  }}
                  placeholder="e.g. Sharma"
                  autoCapitalize="words"
                  autoCorrect={false}
                  error={errors.lastName}
                />
              </View>
            </View>

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
              label="Password (min. 8 characters)"
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
              placeholder="Create a secure password"
              error={errors.password}
            />

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View className="flex-row items-center justify-between px-1 mb-3">
                <Text
                  className="text-xs text-[#717973]"
                  style={{ fontFamily: "Inter_400Regular" }}
                >
                  Password Strength:
                </Text>
                <View className="flex-row items-center">
                  <View
                    className={`h-1.5 w-8 rounded-full mr-1 ${
                      passwordStrength === "Weak"
                        ? "bg-red-500"
                        : passwordStrength === "Medium"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <View
                    className={`h-1.5 w-8 rounded-full mr-1 ${
                      passwordStrength === "Medium"
                        ? "bg-amber-500"
                        : passwordStrength === "Strong"
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                    }`}
                  />
                  <View
                    className={`h-1.5 w-8 rounded-full ${
                      passwordStrength === "Strong"
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                    }`}
                  />
                  <Text
                    className={`text-xs ml-2 font-semibold ${
                      passwordStrength === "Weak"
                        ? "text-red-600"
                        : passwordStrength === "Medium"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    {passwordStrength}
                  </Text>
                </View>
              </View>
            )}

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
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
              error={errors.confirmPassword}
            />
          </View>

          {/* Submit Button */}
          <Button
            title="Create Account"
            loadingTitle="Creating Account..."
            onPress={handleSignup}
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

          {/* Google Signup Button */}
          <SocialLoginButton
            title="Continue with Google"
            onPress={handleGoogleSignup}
            isLoading={isLoading}
          />

          {/* Bottom Login Link */}
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
                    fontFamily: "Inter_400Regular",
                    fontSize: 14.5,
                    color: "#1C1C17",
                  }}
                >
                  Already have an account?{" "}
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      textDecorationLine: "underline",
                      color: "#1C1C17",
                    }}
                  >
                    Login
                  </Text>
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
