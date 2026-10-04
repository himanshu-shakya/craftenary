import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { FloatingLabelInput } from "../../components/auth/FloatingLabelInput";
import { Button } from "../../components/Button";
import { useCrafts } from "../../src/hooks/useCrafts";
import { artisanService } from "../../src/services/artisan/artisanService";
import { useAuth } from "../../src/hooks/useAuth";
import { useToast } from "../../src/context/ToastContext";
import { getValidCraftIcon } from "../../src/utils/craftIcons";

export interface ArtisanOnboardingScreenProps {
  onBackToRoleSelection: () => void;
  onOnboardingComplete: () => void;
}

export const ArtisanOnboardingScreen: React.FC<ArtisanOnboardingScreenProps> = ({
  onBackToRoleSelection,
  onOnboardingComplete,
}) => {
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile, setProfile } = useAuth();
  const { crafts, isLoading: isLoadingCrafts } = useCrafts();
  const { showToast, showSuccess, showError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Extract name from user profile/metadata gathered during signup
  const firstName =
    user?.user_metadata?.first_name ||
    profile?.full_name?.trim().split(/\s+/)[0] ||
    "Artisan";
  const lastName =
    user?.user_metadata?.last_name ||
    profile?.full_name?.trim().split(/\s+/).slice(1).join(" ") ||
    "";

  // Form State
  const [experienceYears, setExperienceYears] = useState("10");
  const [pricePerHour, setPricePerHour] = useState("1200");

  const [city, setCity] = useState("Jaipur");
  const [state, setState] = useState("Rajasthan");
  const [address, setAddress] = useState("");

  const [selectedCraftId, setSelectedCraftId] = useState<string>("");
  const [bio, setBio] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bio word count calculation
  const bioWords = bio.trim() ? bio.trim().split(/\s+/).length : 0;
  const isBioOverLimit = bioWords > 200;

  // Selected Craft Entity
  const selectedCraft = crafts.find((c) => c.id === selectedCraftId);

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!experienceYears.trim()) errs.experienceYears = "Please enter years of experience.";
      if (!pricePerHour.trim()) errs.pricePerHour = "Please enter hourly rate.";
    }

    if (step === 2) {
      if (!city.trim()) errs.city = "City is required.";
      if (!state.trim()) errs.state = "State is required.";
    }

    if (step === 3) {
      if (!selectedCraftId) errs.craft = "Please select your primary craft.";
    }

    if (step === 4) {
      if (isBioOverLimit) {
        errs.bio = `Bio exceeds 200 words (${bioWords} words).`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((s) => s + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      onBackToRoleSelection();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || !user?.id) return;

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      showError("Incomplete Details", "Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await artisanService.createProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        city: city.trim(),
        state: state.trim(),
        craftId: selectedCraftId,
        bio: bio.trim() || undefined,
        experienceYears: parseInt(experienceYears, 10) || 5,
        pricePerHour: parseFloat(pricePerHour) || 1000,
      });

      if (result.success) {
        setProfile({
          id: user.id,
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          role: "artisan",
          onboarding_completed: true,
          artisan_profile: result.profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        await refreshProfile();
        showToast({
          type: "celebration",
          title: "Artisan Profile Live! 🎉",
          message: `Welcome aboard, ${firstName}! Your master studio is now ready.`,
          duration: 4000,
        });
        onOnboardingComplete();
      } else {
        showError("Setup Error", result.error || "Unable to complete artisan setup.");
      }
    } catch {
      showError("Error", "Something went wrong while saving your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepDetails = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Experience & Pricing",
          subtitle: `Welcome ${firstName}! Set your artisan experience level and hourly mentorship rate.`,
        };
      case 2:
        return {
          title: "Your Studio Location",
          subtitle: "Where do you practice your craft and host visitors?",
        };
      case 3:
        return {
          title: "Select Your Craft",
          subtitle: "Choose the primary heritage art form that defines your work.",
        };
      case 4:
        return {
          title: "Artisan Biography",
          subtitle: "Describe your artistic lineage, mentors, and traditional methods.",
        };
      case 5:
      default:
        return {
          title: "Review & Confirm",
          subtitle: "Review your artisan details before submitting your profile.",
        };
    }
  };

  const stepDetails = getStepDetails();

  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View style={{ paddingTop: Math.max(insets.top, 10) }}>
          <OnboardingHeader
            currentStep={currentStep}
            totalSteps={totalSteps}
            title={stepDetails.title}
            subtitle={stepDetails.subtitle}
            onBack={handleBack}
          />
        </View>

        <ScrollView
          className="flex-1 px-6 pt-2"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* STEP 1: Experience & Rates */}
          {currentStep === 1 && (
            <View className="pt-2">
              <View className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-5 flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-[#D96B16] items-center justify-center mr-3">
                  <Feather name="user" size={18} color="#000" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xs text-[#717973] uppercase font-bold"
                    style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
                  >
                    Logged In As
                  </Text>
                  <Text
                    className="text-sm text-[#1C1C17] font-bold"
                    style={{ fontFamily: "HankenGrotesk_700Bold" }}
                  >
                    {firstName} {lastName}
                  </Text>
                </View>
              </View>

              <FloatingLabelInput
                label="Years of Experience"
                value={experienceYears}
                onChangeText={(t) => {
                  setExperienceYears(t);
                  if (errors.experienceYears) setErrors((prev) => ({ ...prev, experienceYears: "" }));
                }}
                placeholder="e.g. 10"
                keyboardType="numeric"
                error={errors.experienceYears}
              />

              <FloatingLabelInput
                label="Base Hourly Mentorship Rate (₹)"
                value={pricePerHour}
                onChangeText={(t) => {
                  setPricePerHour(t);
                  if (errors.pricePerHour) setErrors((prev) => ({ ...prev, pricePerHour: "" }));
                }}
                placeholder="e.g. 1200"
                keyboardType="numeric"
                error={errors.pricePerHour}
              />
            </View>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <View className="pt-2">
              <FloatingLabelInput
                label="City *"
                value={city}
                onChangeText={(t) => {
                  setCity(t);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                }}
                placeholder="e.g. Jaipur"
                error={errors.city}
              />

              <FloatingLabelInput
                label="State *"
                value={state}
                onChangeText={(t) => {
                  setState(t);
                  if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
                }}
                placeholder="e.g. Rajasthan"
                error={errors.state}
              />

              <FloatingLabelInput
                label="Workshop Address / Guild Locality"
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. Sanganer Textile Village, Old City"
              />
            </View>
          )}

          {/* STEP 3: Craft Selection */}
          {currentStep === 3 && (
            <View className="pt-2">
              <Text
                className="text-xs text-[#717973] uppercase mb-2.5 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Select Primary Heritage Craft *
              </Text>
              {errors.craft ? (
                <Text
                  className="text-red-700 text-xs mb-3"
                  style={{ fontFamily: "Inter_500Medium" }}
                >
                  {errors.craft}
                </Text>
              ) : null}

              {isLoadingCrafts ? (
                <View className="py-12 items-center">
                  <ActivityIndicator color="#0B3B2C" size="small" />
                </View>
              ) : (
                <View className="flex-row flex-wrap justify-between">
                  {crafts.map((craft) => {
                    const isSelected = selectedCraftId === craft.id;
                    return (
                      <TouchableOpacity
                        key={craft.id}
                        onPress={() => {
                          setSelectedCraftId(craft.id);
                          if (errors.craft) setErrors((prev) => ({ ...prev, craft: "" }));
                        }}
                        activeOpacity={0.8}
                        style={{
                          width: "48%",
                          padding: 14,
                          marginBottom: 14,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: isSelected ? "#0B3B2C" : "#E5E2DB",
                          backgroundColor: isSelected ? "rgba(11, 59, 44, 0.08)" : "#FFFFFF",
                        }}
                      >
                        <View
                          pointerEvents="none"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 8,
                            backgroundColor: isSelected ? "#0B3B2C" : "#FAF8F2",
                          }}
                        >
                          <MaterialCommunityIcons
                            name={getValidCraftIcon(craft.icon, "hammer")}
                            size={20}
                            color={isSelected ? "#FFFFFF" : "#0B3B2C"}
                          />
                        </View>
                        <Text
                          pointerEvents="none"
                          numberOfLines={1}
                          className="text-sm text-[#1C1C17] font-semibold mb-0.5"
                          style={{ fontFamily: "HankenGrotesk_700Bold" }}
                        >
                          {craft.name}
                        </Text>
                        <Text
                          pointerEvents="none"
                          numberOfLines={2}
                          className="text-[11px] text-[#717973] leading-3.5"
                          style={{ fontFamily: "Inter_400Regular" }}
                        >
                          {craft.description || "Master heritage craftsmanship"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* STEP 4: Bio */}
          {currentStep === 4 && (
            <View className="pt-2">
              <Text
                className="text-xs text-[#717973] uppercase mb-1.5 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Artisan Biography *
              </Text>
              <View className="bg-white rounded-2xl p-4 border border-[#E5E2DB] shadow-xs mb-2">
                <TextInput
                  value={bio}
                  onChangeText={(text) => {
                    setBio(text);
                    if (errors.bio) setErrors((prev) => ({ ...prev, bio: "" }));
                  }}
                  placeholder="Share your artistic background, generational craft heritage, materials you use, and what makes your workshop unique..."
                  placeholderTextColor="#949C96"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="text-sm text-[#1C1C17] min-h-[140px]"
                  style={{ fontFamily: "Inter_400Regular" }}
                />
              </View>

              {/* Word Count Indicator */}
              <View className="flex-row items-center justify-between px-1 mb-4">
                <Text
                  className="text-xs text-[#717973]"
                  style={{ fontFamily: "Inter_400Regular" }}
                >
                  Maximum 200 words
                </Text>
                <Text
                  className={`text-xs font-semibold ${
                    isBioOverLimit ? "text-red-600" : "text-[#0B3B2C]"
                  }`}
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  {bioWords} / 200 words
                </Text>
              </View>

              {errors.bio ? (
                <Text
                  className="text-red-700 text-xs mb-3"
                  style={{ fontFamily: "Inter_500Medium" }}
                >
                  {errors.bio}
                </Text>
              ) : null}
            </View>
          )}

          {/* STEP 5: Review & Confirmation */}
          {currentStep === 5 && (
            <View className="pt-2">
              <View className="bg-white rounded-2xl p-5 border border-[#E5E2DB] shadow-sm mb-4">
                <View className="flex-row items-center justify-between pb-3 border-b border-[#E5E2DB]">
                  <View>
                    <Text
                      className="text-lg text-[#1C1C17]"
                      style={{ fontFamily: "HankenGrotesk_700Bold" }}
                    >
                      {firstName} {lastName}
                    </Text>
                    <Text
                      className="text-xs text-[#717973]"
                      style={{ fontFamily: "Inter_400Regular" }}
                    >
                      {city}, {state}
                    </Text>
                  </View>

                  <View className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                    <Text
                      className="text-[11px] text-amber-800 uppercase font-bold"
                      style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
                    >
                      Unverified
                    </Text>
                  </View>
                </View>

                <View className="py-3 border-b border-[#E5E2DB] space-y-2">
                  <View className="flex-row justify-between py-1">
                    <Text
                      className="text-xs text-[#717973]"
                      style={{ fontFamily: "Inter_400Regular" }}
                    >
                      Primary Craft:
                    </Text>
                    <Text
                      className="text-xs text-[#1C1C17]"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      {selectedCraft?.name || "Craft"}
                    </Text>
                  </View>

                  <View className="flex-row justify-between py-1">
                    <Text
                      className="text-xs text-[#717973]"
                      style={{ fontFamily: "Inter_400Regular" }}
                    >
                      Experience:
                    </Text>
                    <Text
                      className="text-xs text-[#1C1C17]"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      {experienceYears} Years
                    </Text>
                  </View>

                  <View className="flex-row justify-between py-1">
                    <Text
                      className="text-xs text-[#717973]"
                      style={{ fontFamily: "Inter_400Regular" }}
                    >
                      Hourly Mentorship:
                    </Text>
                    <Text
                      className="text-xs text-[#0B3B2C]"
                      style={{ fontFamily: "HankenGrotesk_700Bold" }}
                    >
                      ₹{pricePerHour}/hr
                    </Text>
                  </View>
                </View>

                {bio ? (
                  <View className="pt-3">
                    <Text
                      className="text-xs text-[#717973] uppercase mb-1"
                      style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
                    >
                      Biography
                    </Text>
                    <Text
                      numberOfLines={4}
                      className="text-xs text-[#414844] leading-relaxed"
                      style={{ fontFamily: "Inter_400Regular" }}
                    >
                      {bio}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Verification Info Banner */}
              <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex-row items-start">
                <Feather
                  name="shield"
                  size={18}
                  color="#0284C7"
                  style={{ marginTop: 2, marginRight: 10 }}
                />
                <View className="flex-1">
                  <Text
                    className="text-xs text-blue-900 font-bold mb-0.5"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    Verification Notice
                  </Text>
                  <Text
                    className="text-xs text-blue-800/80 leading-relaxed"
                    style={{ fontFamily: "Inter_400Regular" }}
                  >
                    Your profile will initially be marked as Unverified. Our heritage guild committee reviews and awards verified blue badges after inspecting studio authenticity.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Button */}
          <View className="mt-4">
            <Button
              title={
                currentStep === 1
                  ? "Continue to Location"
                  : currentStep === 2
                  ? "Continue to Craft Specialty"
                  : currentStep === 3
                  ? "Continue to Bio & Rates"
                  : currentStep === 4
                  ? "Continue to Final Review"
                  : "Complete Artisan Setup"
              }
              loadingTitle="Setting Up Master Studio..."
              disabledTitle={currentStep === 4 && isBioOverLimit ? "Bio Exceeds 200 Words" : undefined}
              onPress={handleNext}
              loading={isSubmitting}
              disabled={currentStep === 4 && isBioOverLimit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
