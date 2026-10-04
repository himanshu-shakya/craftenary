import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../../src/hooks/useAuth";
import { useArtisanProfile } from "../../src/hooks/useArtisanProfile";
import { useCrafts } from "../../src/hooks/useCrafts";
import { storageService } from "../../src/services/storage/storageService";
import { useToast } from "../../src/context/ToastContext";
import { Avatar } from "../../components/common/Avatar";
import { FloatingLabelInput } from "../../components/auth/FloatingLabelInput";
import { Button } from "../../components/Button";

export interface EditArtisanProfileScreenProps {
  onBack: () => void;
  onProfileUpdated: () => void;
}

export const EditArtisanProfileScreen: React.FC<EditArtisanProfileScreenProps> = ({
  onBack,
  onProfileUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuth();
  const { profile: artisan, updateProfile, isLoading: isProfileLoading } = useArtisanProfile(user?.id);
  const { crafts, isLoading: isLoadingCrafts } = useCrafts();
  const { showSuccess, showError, showToast } = useToast();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCraftId, setSelectedCraftId] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [experienceYears, setExperienceYears] = useState("5");
  const [pricePerHour, setPricePerHour] = useState("1000");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize state from existing profile
  useEffect(() => {
    if (artisan) {
      setFirstName(artisan.first_name || "");
      setLastName(artisan.last_name || "");
      setSelectedCraftId(artisan.craft_id || "");
      setCity(artisan.city || "");
      setState(artisan.state || "");
      setExperienceYears(artisan.experience_years ? String(artisan.experience_years) : "5");
      setPricePerHour(artisan.price_per_hour ? String(artisan.price_per_hour) : "1000");
      setBio(artisan.bio || "");
      setProfileImageUrl(artisan.profile_image_url || undefined);
    }
  }, [artisan]);

  // Word counter calculation
  const countWords = (str: string): number => {
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  };

  const bioWordCount = countWords(bio);
  const isBioOverLimit = bioWordCount > 200;

  // Determine if form has unsaved changes
  const hasUnsavedChanges = (): boolean => {
    if (!artisan) return false;
    return (
      firstName.trim() !== (artisan.first_name || "").trim() ||
      lastName.trim() !== (artisan.last_name || "").trim() ||
      selectedCraftId !== (artisan.craft_id || "") ||
      city.trim() !== (artisan.city || "").trim() ||
      state.trim() !== (artisan.state || "").trim() ||
      experienceYears !== String(artisan.experience_years || "5") ||
      pricePerHour !== String(artisan.price_per_hour || "1000") ||
      bio.trim() !== (artisan.bio || "").trim() ||
      (profileImageUrl || "") !== (artisan.profile_image_url || "")
    );
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        "Discard changes?",
        "You have unsaved changes to your artisan studio profile. Are you sure you want to discard them?",
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!selectedCraftId) errs.craft = "Please select your primary craft.";
    if (!city.trim()) errs.city = "City is required.";
    if (!state.trim()) errs.state = "State is required.";
    if (isBioOverLimit) errs.bio = "Bio cannot exceed 200 words.";

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
        craftId: selectedCraftId,
        city: city.trim(),
        state: state.trim(),
        experienceYears: parseInt(experienceYears, 10) || 5,
        pricePerHour: parseFloat(pricePerHour) || 1000,
        bio: bio.trim() || undefined,
        profileImageUrl: profileImageUrl?.trim() || undefined,
      });

      if (res.success) {
        await refreshProfile();
        showSuccess("Profile Updated!", "Your master artisan studio details are updated.");
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

  const fullName = `${firstName || "Artisan"} ${lastName || ""}`.trim();
  const isVerified = artisan?.verification_status === "verified";

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
          Edit Artisan Profile
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
                isVerified={isVerified}
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

          {/* Verification Status Banner (Read-only) */}
          <View
            className={`p-4 rounded-2xl border mb-6 flex-row items-center ${
              isVerified
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <MaterialCommunityIcons
              name={isVerified ? "shield-check" : "shield-alert-outline"}
              size={22}
              color={isVerified ? "#047857" : "#B45309"}
              style={{ marginRight: 10 }}
            />
            <View className="flex-1">
              <Text
                className={`text-xs font-bold ${
                  isVerified ? "text-emerald-900" : "text-amber-900"
                }`}
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                {isVerified ? "Verified Master Artisan" : "Verification Status: Unverified"}
              </Text>
              <Text
                className={`text-[11px] mt-0.5 leading-4 ${
                  isVerified ? "text-emerald-800" : "text-amber-800"
                }`}
                style={{ fontFamily: "Inter_400Regular" }}
              >
                {isVerified
                  ? "Your blue authenticity badge is active across tourist feeds and listings."
                  : "Verification badges are awarded by our cultural curation guild after studio review."}
              </Text>
            </View>
          </View>

          {/* Section 1: Basic Information */}
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

            <View className="mb-1">
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
          </View>

          {/* Section 2: Craft Specialty */}
          <Text
            className="text-xs text-[#717973] uppercase mb-3 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Primary Craft Specialty *
          </Text>

          <View className="bg-white p-4 rounded-2xl border border-[#E5E2DB] shadow-xs mb-6">
            <View className="flex-row flex-wrap">
              {crafts.map((c) => {
                const isSelected = selectedCraftId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedCraftId(c.id)}
                    className={`px-3 py-2 mr-2 mb-2 rounded-xl border flex-row items-center ${
                      isSelected
                        ? "bg-[#0B3B2C] border-[#0B3B2C]"
                        : "bg-[#FAF8F2] border-[#E5E2DB]"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={(c.icon as any) || "hammer"}
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
                      {isSelected ? "✓ " : ""}
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.craft ? (
              <Text
                style={{
                  color: "#DC2626",
                  fontSize: 11.5,
                  marginTop: 6,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {errors.craft}
              </Text>
            ) : null}
          </View>

          {/* Section 3: Studio Location */}
          <Text
            className="text-xs text-[#717973] uppercase mb-3 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Studio Location
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

          {/* Section 4: Experience & Rates */}
          <Text
            className="text-xs text-[#717973] uppercase mb-3 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Professional Experience & Rates
          </Text>

          <View className="bg-white p-4 rounded-2xl border border-[#E5E2DB] shadow-xs mb-6">
            <View className="mb-4">
              <FloatingLabelInput
                label="Years of Experience"
                value={experienceYears}
                onChangeText={setExperienceYears}
                placeholder="e.g. 15"
                keyboardType="numeric"
              />
            </View>

            <View className="mb-1">
              <FloatingLabelInput
                label="Mentorship Rate (₹ / Hour)"
                value={pricePerHour}
                onChangeText={setPricePerHour}
                placeholder="e.g. 1000"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Section 5: Biography */}
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-xs text-[#717973] uppercase font-bold"
              style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
            >
              Artisan Biography (Optional)
            </Text>
            <Text
              className={`text-xs font-semibold ${
                isBioOverLimit ? "text-red-600" : "text-[#717973]"
              }`}
              style={{ fontFamily: "Inter_500Medium" }}
            >
              {bioWordCount} / 200 words
            </Text>
          </View>

          <View
            className={`bg-white p-4 rounded-2xl border shadow-xs mb-8 ${
              isBioOverLimit ? "border-red-400" : "border-[#E5E2DB]"
            }`}
          >
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell travelers about your heritage roots, lineage, apprentice training, and studio ethos..."
              placeholderTextColor="#949C96"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="text-xs text-[#1C1C17] min-h-[110px]"
              style={{ fontFamily: "Inter_400Regular" }}
            />
            {isBioOverLimit && (
              <Text
                style={{
                  color: "#DC2626",
                  fontSize: 11.5,
                  marginTop: 6,
                  fontFamily: "Inter_500Medium",
                }}
              >
                Bio cannot exceed 200 words.
              </Text>
            )}
          </View>

          {/* Save Changes Button */}
          <Button
            title="Save Changes"
            loadingTitle="Saving Profile Changes..."
            disabledTitle={isBioOverLimit ? "Bio Exceeds 200 Words" : undefined}
            variant="primary"
            onPress={handleSave}
            loading={isSubmitting}
            disabled={isBioOverLimit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
