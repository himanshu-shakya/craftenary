import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import { useAuth } from "../../src/hooks/useAuth";
import { useTouristProfile } from "../../src/hooks/useTouristProfile";
import { useCrafts } from "../../src/hooks/useCrafts";
import { storageService } from "../../src/services/storage/storageService";
import { useToast } from "../../src/context/ToastContext";
import { getValidCraftIcon } from "../../src/utils/craftIcons";
import { Avatar } from "../../components/common/Avatar";
import { FloatingLabelInput } from "../../components/auth/FloatingLabelInput";
import { Button } from "../../components/Button";

export interface EditTouristProfileScreenProps {
  onBack: () => void;
  onProfileUpdated: () => void;
}

const GENDER_OPTIONS = ["Male", "Female", "Non-Binary", "Prefer not to say"];

export const EditTouristProfileScreen: React.FC<EditTouristProfileScreenProps> = ({
  onBack,
  onProfileUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuth();
  const { profile: tourist, updateProfile, isLoading: isProfileLoading } = useTouristProfile(user?.id);
  const { crafts, isLoading: isLoadingCrafts } = useCrafts();
  const { showSuccess, showError, showToast } = useToast();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [selectedCraftIds, setSelectedCraftIds] = useState<string[]>([]);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize state from existing profile
  useEffect(() => {
    if (tourist) {
      setFirstName(tourist.first_name || "");
      setLastName(tourist.last_name || "");
      setGender(tourist.gender || "Male");
      setCity(tourist.city || "");
      setState(tourist.state || "");
      setProfileImageUrl(tourist.profile_image_url || undefined);
      if (tourist.craft_interests) {
        setSelectedCraftIds(tourist.craft_interests.map((c) => c.id));
      }
    }
  }, [tourist]);

  // Determine if form has unsaved changes
  const hasUnsavedChanges = (): boolean => {
    if (!tourist) return false;
    const initialCraftIds = (tourist.craft_interests || []).map((c) => c.id).sort().join(",");
    const currentCraftIds = [...selectedCraftIds].sort().join(",");

    return (
      firstName.trim() !== (tourist.first_name || "").trim() ||
      lastName.trim() !== (tourist.last_name || "").trim() ||
      gender !== (tourist.gender || "Male") ||
      city.trim() !== (tourist.city || "").trim() ||
      state.trim() !== (tourist.state || "").trim() ||
      (profileImageUrl || "") !== (tourist.profile_image_url || "") ||
      initialCraftIds !== currentCraftIds
    );
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        "Discard changes?",
        "You have unsaved changes to your profile. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: onBack },
        ]
      );
    } else {
      onBack();
    }
  };

  const handlePickFromGallery = async () => {
    if (isUploadingPhoto) return;
    setIsUploadingPhoto(true);
    try {
      const asset = await storageService.pickImage({ aspect: [1, 1], quality: 0.8 });
      if (asset) {
        const res = await storageService.uploadImage(asset, "avatars", "profiles");
        if (res.success && res.url) {
          setProfileImageUrl(res.url);
          showSuccess("Photo Updated!", "New avatar uploaded to Supabase.");
        } else {
          showError("Upload Failed", res.error || "Could not upload profile picture.");
        }
      }
    } catch {
      showError("Upload Error", "Failed to select photo from device.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleTakePhoto = async () => {
    if (isUploadingPhoto) return;
    setIsUploadingPhoto(true);
    try {
      const asset = await storageService.takePhoto({ aspect: [1, 1], quality: 0.8 });
      if (asset) {
        const res = await storageService.uploadImage(asset, "avatars", "profiles");
        if (res.success && res.url) {
          setProfileImageUrl(res.url);
          showSuccess("Photo Captured!", "New avatar uploaded to Supabase.");
        } else {
          showError("Upload Failed", res.error || "Could not upload profile picture.");
        }
      }
    } catch {
      showError("Camera Error", "Failed to capture photo with camera.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImageUrl(undefined);
    showToast({ type: "info", title: "Photo Removed", message: "Avatar reverted to name initials." });
  };

  const toggleCraftInterest = (craftId: string) => {
    setSelectedCraftIds((prev) =>
      prev.includes(craftId)
        ? prev.filter((id) => id !== craftId)
        : [...prev, craftId]
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!city.trim()) errs.city = "City is required.";
    if (!state.trim()) errs.state = "State is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!user?.id) {
      showError("Session Error", "No authenticated session found.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        city: city.trim(),
        state: state.trim(),
        profileImageUrl: profileImageUrl?.trim() || undefined,
        craftIds: selectedCraftIds,
      });

      if (res.success) {
        await refreshProfile();
        showSuccess("Profile Updated!", "Your explorer profile changes are saved.");
        onProfileUpdated();
      } else {
        showError("Update Failed", res.error || "Could not update profile.");
      }
    } catch (err: unknown) {
      showError(
        "Update Error",
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullName = `${firstName || "Explorer"} ${lastName || ""}`.trim();

  if (isProfileLoading) {
    return (
      <View className="flex-1 bg-[#FAF8F2] items-center justify-center">
        <ActivityIndicator color="#0B3B2C" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 14),
          backgroundColor: "#FAF8F2",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(193, 200, 194, 0.4)",
        }}
        className="px-5 pb-3 flex-row items-center justify-between shadow-xs"
      >
        <Pressable
          onPress={handleBackPress}
          hitSlop={10}
          className="w-9 h-9 rounded-full bg-[#E9E7DF] items-center justify-center -ml-1 active:bg-[#DDD9D0]"
        >
          <Feather name="arrow-left" size={20} color="#1C1C17" />
        </Pressable>

        <Text
          className="text-base text-[#1C1C17]"
          style={{ fontFamily: "HankenGrotesk_700Bold" }}
        >
          Edit Profile
        </Text>

        <View className="w-9 h-9" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-5"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 30,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View className="items-center mb-6">
            <View className="relative mb-3">
              <Avatar
                imageUrl={profileImageUrl}
                name={fullName}
                size={84}
                backgroundColor="#0B3B2C"
              />
              {isUploadingPhoto && (
                <View className="absolute inset-0 bg-black/40 rounded-full items-center justify-center">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                </View>
              )}
            </View>

            <View className="flex-row items-center space-x-2">
              <Pressable
                onPress={handlePickFromGallery}
                disabled={isUploadingPhoto}
                className="bg-[#0B3B2C] px-3.5 py-2 rounded-xl flex-row items-center mr-2 shadow-xs active:bg-[#07261C]"
              >
                <Feather name="image" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                <Text
                  className="text-white text-xs font-semibold"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleTakePhoto}
                disabled={isUploadingPhoto}
                className="bg-white border border-[#0B3B2C] px-3 py-2 rounded-xl flex-row items-center mr-2 active:bg-slate-50"
              >
                <Feather name="camera" size={13} color="#0B3B2C" style={{ marginRight: 5 }} />
                <Text
                  className="text-[#0B3B2C] text-xs font-semibold"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Camera
                </Text>
              </Pressable>

              {profileImageUrl ? (
                <Pressable
                  onPress={handleRemovePhoto}
                  className="bg-red-50 border border-red-200 px-2.5 py-2 rounded-xl flex-row items-center active:bg-red-100"
                >
                  <Feather name="trash-2" size={13} color="#DC2626" />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Section 1: Personal Information */}
          <Text
            className="text-xs text-[#717973] uppercase mb-3 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Personal Information
          </Text>

          <View className="bg-white p-4 rounded-2xl border border-[#E5E2DB] shadow-xs mb-6">
            <View className="mb-4">
              <FloatingLabelInput
                label="First Name *"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.firstName) setErrors((e) => ({ ...e, firstName: "" }));
                }}
                placeholder="First name"
                error={errors.firstName}
              />
            </View>

            <View className="mb-4">
              <FloatingLabelInput
                label="Last Name *"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.lastName) setErrors((e) => ({ ...e, lastName: "" }));
                }}
                placeholder="Last name"
                error={errors.lastName}
              />
            </View>

            {/* Gender Selection */}
            <View className="mb-1">
              <Text
                className="text-xs text-[#717973] uppercase mb-2 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Gender
              </Text>
              <View className="flex-row flex-wrap">
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = gender === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      className={`px-3 py-2 mr-2 mb-2 rounded-xl border flex-row items-center ${
                        isSelected
                          ? "bg-[#0B3B2C] border-[#0B3B2C]"
                          : "bg-white border-[#E5E2DB]"
                      }`}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                          color: isSelected ? "#FFFFFF" : "#1C1C17",
                        }}
                      >
                        {isSelected ? "✓ " : ""}
                        {g}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Section 2: Location */}
          <Text
            className="text-xs text-[#717973] uppercase mb-3 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Location & Region
          </Text>

          <View className="bg-white p-4 rounded-2xl border border-[#E5E2DB] shadow-xs mb-6">
            <View className="mb-4">
              <FloatingLabelInput
                label="City *"
                value={city}
                onChangeText={(text) => {
                  setCity(text);
                  if (errors.city) setErrors((e) => ({ ...e, city: "" }));
                }}
                placeholder="e.g. Jaipur"
                error={errors.city}
              />
            </View>

            <View className="mb-1">
              <FloatingLabelInput
                label="State *"
                value={state}
                onChangeText={(text) => {
                  setState(text);
                  if (errors.state) setErrors((e) => ({ ...e, state: "" }));
                }}
                placeholder="e.g. Rajasthan"
                error={errors.state}
              />
            </View>
          </View>

          {/* Section 3: Craft Interests */}
          <Text
            className="text-xs text-[#717973] uppercase mb-3 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Craft Interests (Optional)
          </Text>

          <View className="bg-white p-4 rounded-2xl border border-[#E5E2DB] shadow-xs mb-8">
            <Text
              className="text-xs text-[#717973] mb-3 leading-relaxed"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Select traditional arts and crafts to receive personalized workshop recommendations on your home feed.
            </Text>

            <View className="flex-row flex-wrap">
              {crafts.map((craft) => {
                const isSelected = selectedCraftIds.includes(craft.id);
                return (
                  <Pressable
                    key={craft.id}
                    onPress={() => toggleCraftInterest(craft.id)}
                    className={`px-3 py-2 mr-2 mb-2 rounded-xl border flex-row items-center ${
                      isSelected
                        ? "bg-[#0B3B2C] border-[#0B3B2C]"
                        : "bg-[#FAF8F2] border-[#E5E2DB]"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={getValidCraftIcon(craft.icon, "star-outline")}
                      size={14}
                      color={isSelected ? "#FFFFFF" : "#0B3B2C"}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      className="text-xs"
                      style={{
                        fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                        color: isSelected ? "#FFFFFF" : "#1C1C17",
                      }}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {craft.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Save Button */}
          <Button
            title="Save Changes"
            loadingTitle="Saving Profile Changes..."
            variant="primary"
            onPress={handleSave}
            loading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
