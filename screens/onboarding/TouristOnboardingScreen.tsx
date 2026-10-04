import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { FloatingLabelInput } from "../../components/auth/FloatingLabelInput";
import { Button } from "../../components/Button";
import { Avatar } from "../../components/common/Avatar";
import { useCrafts } from "../../src/hooks/useCrafts";
import { touristService } from "../../src/services/tourist/touristService";
import { useAuth } from "../../src/hooks/useAuth";
import { storageService } from "../../src/services/storage/storageService";
import { useToast } from "../../src/context/ToastContext";
import { getValidCraftIcon } from "../../src/utils/craftIcons";

export interface TouristOnboardingScreenProps {
  onBackToRoleSelection: () => void;
  onOnboardingComplete: () => void;
}

export const TouristOnboardingScreen: React.FC<TouristOnboardingScreenProps> = ({
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
    "Explorer";
  const lastName =
    user?.user_metadata?.last_name ||
    profile?.full_name?.trim().split(/\s+/).slice(1).join(" ") ||
    "";

  // Form State
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [gender, setGender] = useState("Female");
  const [city, setCity] = useState("Jaipur");
  const [state, setState] = useState("Rajasthan");
  const [selectedCraftIds, setSelectedCraftIds] = useState<string[]>([
    "craft-pottery",
    "craft-block-printing",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const genderOptions = [
    { label: "Female", icon: "gender-female" },
    { label: "Male", icon: "gender-male" },
    { label: "Non-binary", icon: "gender-non-binary" },
    { label: "Prefer not to say", icon: "account-question-outline" },
  ];

  const toggleCraftInterest = (id: string) => {
    setSelectedCraftIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 2) {
      if (!gender) errs.gender = "Please select a gender.";
    }

    if (step === 3) {
      if (!city.trim()) errs.city = "City is required.";
      if (!state.trim()) errs.state = "State is required.";
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

    if (!validateStep(2) || !validateStep(3)) {
      Alert.alert("Missing Fields", "Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await touristService.createProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        city: city.trim(),
        state: state.trim(),
        profileImageUrl: profileImageUrl.trim() || undefined,
        craftIds: selectedCraftIds,
      });

      if (result.success) {
        setProfile({
          id: user.id,
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          role: "tourist",
          onboarding_completed: true,
          tourist_profile: result.profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        await refreshProfile();
        showToast({
          type: "celebration",
          title: "Explorer Profile Ready! 🌟",
          message: `Welcome, ${firstName}! You're ready to discover master artisan workshops.`,
          duration: 4000,
        });
        onOnboardingComplete();
      } else {
        showError("Setup Error", result.error || "Unable to complete tourist setup.");
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
          title: "Profile Avatar (Optional)",
          subtitle: `Welcome ${firstName}! Add a photo or use your generated initials avatar.`,
        };
      case 2:
        return {
          title: "Select Gender",
          subtitle: "Helps us tailor your workshop safety and cultural accommodations.",
        };
      case 3:
        return {
          title: "Your Location",
          subtitle: "Discover master studios and artisan collectives near you.",
        };
      case 4:
        return {
          title: "Craft Interests",
          subtitle: "Select the traditional crafts you are most excited to explore.",
        };
      case 5:
      default:
        return {
          title: "Review & Explore",
          subtitle: "Confirm your explorer profile to launch your personalized dashboard.",
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
            canSkip={currentStep === 1 || currentStep === 4}
            onSkip={() => setCurrentStep((s) => s + 1)}
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
          {/* STEP 1: Profile Picture */}
          {currentStep === 1 && (
            <View className="pt-2 items-center">
              <View className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-4 flex-row items-center w-full">
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

              <View className="my-4">
                <Avatar
                  imageUrl={profileImageUrl}
                  name={`${firstName} ${lastName}`}
                  size={92}
                  backgroundColor="#0B3B2C"
                />
              </View>

              {/* Upload Action Buttons */}
              <View className="flex-row items-center justify-center mb-4 w-full px-2">
                <Pressable
                  onPress={async () => {
                    if (isUploadingPhoto) return;
                    setIsUploadingPhoto(true);
                    try {
                      const asset = await storageService.pickImage({ aspect: [1, 1], quality: 0.8 });
                      if (asset) {
                        const res = await storageService.uploadImage(asset, "avatars", "profiles");
                        if (res.success && res.url) {
                          setProfileImageUrl(res.url);
                          showSuccess("Avatar Uploaded!", "Profile photo saved to Supabase.");
                        } else {
                          showError("Upload Failed", res.error || "Could not upload profile picture.");
                        }
                      }
                    } catch {
                      showError("Error", "Failed to select image from device.");
                    } finally {
                      setIsUploadingPhoto(false);
                    }
                  }}
                  disabled={isUploadingPhoto}
                  className={`flex-1 py-2.5 px-3 rounded-xl mr-2 flex-row items-center justify-center shadow-xs ${
                    isUploadingPhoto ? "bg-[#6F8B81]" : "bg-[#0B3B2C] active:bg-[#07261C]"
                  }`}
                >
                  <Feather name="image" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text
                    className="text-white text-xs font-semibold"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    {isUploadingPhoto ? "Uploading..." : "Gallery Photo"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    if (isUploadingPhoto) return;
                    setIsUploadingPhoto(true);
                    try {
                      const asset = await storageService.takePhoto({ aspect: [1, 1], quality: 0.8 });
                      if (asset) {
                        const res = await storageService.uploadImage(asset, "avatars", "profiles");
                        if (res.success && res.url) {
                          setProfileImageUrl(res.url);
                          showSuccess("Photo Captured!", "Profile photo saved to Supabase.");
                        } else {
                          showError("Upload Failed", res.error || "Could not upload profile picture.");
                        }
                      }
                    } catch {
                      showError("Error", "Failed to capture photo with camera.");
                    } finally {
                      setIsUploadingPhoto(false);
                    }
                  }}
                  disabled={isUploadingPhoto}
                  className={`py-2.5 px-3.5 rounded-xl border flex-row items-center justify-center ${
                    isUploadingPhoto
                      ? "border-[#C1C8C2] bg-slate-50"
                      : "border-[#0B3B2C] bg-white active:bg-slate-50"
                  }`}
                >
                  <Feather
                    name="camera"
                    size={15}
                    color={isUploadingPhoto ? "#949C96" : "#0B3B2C"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    className={`text-xs font-semibold ${
                      isUploadingPhoto ? "text-[#949C96]" : "text-[#0B3B2C]"
                    }`}
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    {isUploadingPhoto ? "Opening..." : "Camera"}
                  </Text>
                </Pressable>
              </View>

              {isUploadingPhoto && (
                <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 mb-3 flex-row items-center w-full">
                  <ActivityIndicator size="small" color="#0B3B2C" />
                  <Text
                    className="text-xs text-[#0B3B2C] font-semibold ml-2"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    Uploading avatar to Supabase Storage...
                  </Text>
                </View>
              )}

              <View className="w-full">
                <FloatingLabelInput
                  label="Or Enter Image Web URL (Optional)"
                  value={profileImageUrl}
                  onChangeText={setProfileImageUrl}
                  placeholder="https://images.unsplash.com/..."
                />
              </View>

              <Text
                className="text-xs text-[#717973] text-center mt-2 px-4 leading-relaxed"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Upload a photo from your device or paste a web URL. A personalized initials avatar will automatically represent you if left empty.
              </Text>
            </View>
          )}

          {/* STEP 2: Gender Selection */}
          {currentStep === 2 && (
            <View className="pt-2">
              <Text
                className="text-xs text-[#717973] uppercase mb-2.5 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Select Gender *
              </Text>
              {genderOptions.map((opt) => {
                const isSelected = gender === opt.label;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    onPress={() => {
                      setGender(opt.label);
                      if (errors.gender) setErrors((prev) => ({ ...prev, gender: "" }));
                    }}
                    activeOpacity={0.8}
                    style={{
                      padding: 16,
                      marginBottom: 12,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: isSelected ? "#D96B16" : "#E5E2DB",
                      backgroundColor: isSelected ? "rgba(217, 107, 22, 0.08)" : "#FFFFFF",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View className="flex-row items-center" pointerEvents="none">
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                          backgroundColor: isSelected ? "#D96B16" : "#FAF8F2",
                        }}
                      >
                        <MaterialCommunityIcons
                          name={opt.icon as any}
                          size={20}
                          color={isSelected ? "#FFFFFF" : "#717973"}
                        />
                      </View>
                      <Text
                        className="text-sm text-[#1C1C17]"
                        style={{
                          fontFamily: isSelected
                            ? "HankenGrotesk_700Bold"
                            : "Inter_500Medium",
                        }}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Feather name="check" size={18} color="#D96B16" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* STEP 3: Location */}
          {currentStep === 3 && (
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
                label="State / Province *"
                value={state}
                onChangeText={(t) => {
                  setState(t);
                  if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
                }}
                placeholder="e.g. Rajasthan"
                error={errors.state}
              />
            </View>
          )}

          {/* STEP 4: Craft Interests */}
          {currentStep === 4 && (
            <View className="pt-2">
              {isLoadingCrafts ? (
                <View className="py-12 items-center justify-center">
                  <ActivityIndicator color="#0B3B2C" size="small" />
                  <Text className="text-xs text-[#717973] mt-2">
                    Loading heritage crafts...
                  </Text>
                </View>
              ) : (
                <View className="flex-row flex-wrap gap-2.5">
                  {crafts.map((craft) => {
                    const isSelected = selectedCraftIds.includes(craft.id);
                    return (
                      <TouchableOpacity
                        key={craft.id}
                        onPress={() => toggleCraftInterest(craft.id)}
                        activeOpacity={0.8}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 24,
                          borderWidth: 2,
                          borderColor: isSelected ? "#0B3B2C" : "#E5E2DB",
                          backgroundColor: isSelected ? "#0B3B2C" : "#FFFFFF",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <MaterialCommunityIcons
                          pointerEvents="none"
                          name={getValidCraftIcon(craft.icon, "star-outline")}
                          size={16}
                          color={isSelected ? "#FFFFFF" : "#0B3B2C"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          pointerEvents="none"
                          className="text-xs font-semibold"
                          style={{
                            fontFamily: isSelected
                              ? "Inter_600SemiBold"
                              : "Inter_500Medium",
                            color: isSelected ? "#FFFFFF" : "#1C1C17",
                          }}
                        >
                          {craft.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* STEP 5: Review & Confirm */}
          {currentStep === 5 && (
            <View className="pt-2">
              <View className="bg-white rounded-2xl p-5 border border-[#E5E2DB] shadow-sm mb-6">
                <View className="flex-row items-center pb-4 border-b border-[#E5E2DB]">
                  <Avatar
                    imageUrl={profileImageUrl}
                    name={`${firstName} ${lastName}`}
                    size={52}
                  />
                  <View className="ml-3">
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
                      {city}, {state} • {gender}
                    </Text>
                  </View>
                </View>

                <View className="pt-4">
                  <Text
                    className="text-xs text-[#717973] uppercase mb-2"
                    style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
                  >
                    Interested Crafts ({selectedCraftIds.length})
                  </Text>
                  <View className="flex-row flex-wrap">
                    {selectedCraftIds.map((id) => {
                      const craft = crafts.find((c) => c.id === id);
                      return (
                        <View
                          key={id}
                          className="bg-[#FAF8F2] border border-[#E5E2DB] px-3 py-1 rounded-full mr-2 mb-2"
                        >
                          <Text
                            className="text-xs text-[#0B3B2C]"
                            style={{ fontFamily: "Inter_500Medium" }}
                          >
                            {craft?.name || id}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Action Button */}
          <View className="mt-4">
            <Button
              title={
                currentStep === 1
                  ? "Continue to Select Gender"
                  : currentStep === 2
                  ? "Continue to Location"
                  : currentStep === 3
                  ? "Continue to Craft Interests"
                  : currentStep === 4
                  ? "Continue to Final Review"
                  : "Launch Explorer Dashboard"
              }
              loadingTitle="Creating Explorer Profile..."
              onPress={handleNext}
              loading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
