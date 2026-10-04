import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

import { FloatingLabelInput } from "../../components/auth/FloatingLabelInput";
import { Button } from "../../components/Button";
import { useCrafts } from "../../src/hooks/useCrafts";
import { workshopService } from "../../src/services/workshop/workshopService";
import { useArtisanProfile } from "../../src/hooks/useArtisanProfile";
import { useAuth } from "../../src/hooks/useAuth";
import { storageService } from "../../src/services/storage/storageService";
import { useToast } from "../../src/context/ToastContext";
import { getValidCraftIcon } from "../../src/utils/craftIcons";

export interface CreateWorkshopScreenProps {
  onBack: () => void;
  onWorkshopCreated: () => void;
}

export const CreateWorkshopScreen: React.FC<CreateWorkshopScreenProps> = ({
  onBack,
  onWorkshopCreated,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile: artisan } = useArtisanProfile(user?.id);
  const { crafts, isLoading: isLoadingCrafts } = useCrafts();
  const { showToast, showSuccess, showError } = useToast();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [craftId, setCraftId] = useState(artisan?.craft_id || "");
  const [location, setLocation] = useState(
    artisan ? `${artisan.city}, ${artisan.state}` : "Jaipur, Rajasthan"
  );
  const [price, setPrice] = useState("1400");
  const [duration, setDuration] = useState("2.5 Hours");
  const [maxParticipants, setMaxParticipants] = useState("6");

  // Multi-image URLs state
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePickFromGallery = async () => {
    if (isUploadingImage) return;
    setIsUploadingImage(true);
    setUploadStatusText("Selecting image from device...");
    try {
      const asset = await storageService.pickImage({ quality: 0.8 });
      if (!asset) {
        setIsUploadingImage(false);
        return;
      }
      setUploadStatusText("Uploading to Supabase Storage...");
      const res = await storageService.uploadImage(asset, "craftinery-media", "workshops");
      if (res.success && res.url) {
        setImages((prev) => [...prev, res.url!]);
        if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
        showSuccess("Photo Uploaded!", "Workshop image saved to Supabase Storage.");
      } else {
        showError("Upload Failed", res.error || "Could not upload image.");
      }
    } catch {
      showError("Upload Error", "An error occurred while uploading picture.");
    } finally {
      setIsUploadingImage(false);
      setUploadStatusText("");
    }
  };

  const handleTakePhoto = async () => {
    if (isUploadingImage) return;
    setIsUploadingImage(true);
    setUploadStatusText("Opening camera...");
    try {
      const asset = await storageService.takePhoto({ quality: 0.8 });
      if (!asset) {
        setIsUploadingImage(false);
        return;
      }
      setUploadStatusText("Uploading to Supabase Storage...");
      const res = await storageService.uploadImage(asset, "craftinery-media", "workshops");
      if (res.success && res.url) {
        setImages((prev) => [...prev, res.url!]);
        if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
        showSuccess("Photo Captured!", "Workshop image saved to Supabase Storage.");
      } else {
        showError("Upload Failed", res.error || "Could not upload image.");
      }
    } catch {
      showError("Camera Error", "An error occurred while capturing photo.");
    } finally {
      setIsUploadingImage(false);
      setUploadStatusText("");
    }
  };

  const handleAddImage = () => {
    const clean = newImageUrl.trim();
    if (!clean) return;
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      showError("Invalid URL", "Please provide a valid image web URL.");
      return;
    }
    setImages((prev) => [...prev, clean]);
    setNewImageUrl("");
    if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
    showSuccess("Photo Added", "Image URL attached to listing.");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    showToast({ type: "info", title: "Photo Removed", message: "Workshop photo removed from list." });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Workshop name is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!craftId) errs.craft = "Please select a craft category.";
    if (!location.trim()) errs.location = "Location is required.";
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      errs.price = "Valid price in ₹ is required.";
    }
    if (images.length === 0) {
      errs.images = "Please add at least one workshop photo.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    const effectiveArtisanId = artisan?.id || artisan?.user_id || user?.id;
    if (!effectiveArtisanId) {
      showError("Session Error", "Artisan profile not found. Please complete setup.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await workshopService.createWorkshop(effectiveArtisanId, {
        name: name.trim(),
        description: description.trim(),
        craftId,
        location: location.trim(),
        city: artisan?.city || "Jaipur",
        state: artisan?.state || "Rajasthan",
        price: parseFloat(price) || 1200,
        duration: duration.trim() || "2 Hours",
        maxParticipants: parseInt(maxParticipants, 10) || 6,
        imageUrls: images,
      });

      if (result.success) {
        showToast({
          type: "celebration",
          title: "Workshop Published! 🎉",
          message: `"${name}" is now live and discoverable by cultural travelers.`,
          duration: 4500,
        });
        onWorkshopCreated();
      } else {
        showError("Creation Failed", result.error || "Failed to publish workshop.");
      }
    } catch {
      showError("Error", "Something went wrong while publishing your workshop.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="px-5 pb-3 flex-row items-center justify-between"
      >
        <Pressable
          onPress={onBack}
          hitSlop={10}
          className="w-9 h-9 rounded-full bg-[#E9E7DF] items-center justify-center -ml-1"
        >
          <Feather name="arrow-left" size={20} color="#1C1C17" />
        </Pressable>

        <Text
          className="text-base text-[#1C1C17]"
          style={{ fontFamily: "HankenGrotesk_700Bold" }}
        >
          Create Workshop Listing
        </Text>

        <View className="w-9 h-9" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Multiple Images Upload */}
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="text-xs text-[#717973] uppercase font-bold"
              style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
            >
              Workshop Photos ({images.length})
            </Text>
            <Text
              className="text-[11px] text-[#0B3B2C] font-semibold"
              style={{ fontFamily: "Inter_600SemiBold" }}
            >
              Saved to Supabase
            </Text>
          </View>

          {/* Thumbnails Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {images.map((url, idx) => (
              <View
                key={idx}
                className="w-24 h-24 rounded-2xl mr-3 relative overflow-hidden bg-black/10 border border-[#E5E2DB]"
              >
                <Image
                  source={{ uri: url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 rounded-md">
                  <Text className="text-[10px] text-white font-bold">
                    #{idx + 1}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 items-center justify-center shadow-xs"
                >
                  <Feather name="x" size={12} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          {/* Upload from Device Buttons */}
          <View className="flex-row items-center justify-between mb-3">
            <Pressable
              onPress={handlePickFromGallery}
              disabled={isUploadingImage}
              className={`flex-1 py-3 px-3 rounded-xl mr-2 flex-row items-center justify-center shadow-xs ${
                isUploadingImage ? "bg-[#6F8B81]" : "bg-[#0B3B2C] active:bg-[#07261C]"
              }`}
            >
              <Feather name="image" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text
                className="text-white text-xs font-semibold"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                {isUploadingImage ? "Uploading Photo..." : "Upload from Gallery"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleTakePhoto}
              disabled={isUploadingImage}
              className={`py-3 px-3.5 rounded-xl border flex-row items-center justify-center ${
                isUploadingImage
                  ? "border-[#C1C8C2] bg-slate-50"
                  : "border-[#0B3B2C] bg-white active:bg-slate-50"
              }`}
            >
              <Feather
                name="camera"
                size={15}
                color={isUploadingImage ? "#949C96" : "#0B3B2C"}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`text-xs font-semibold ${
                  isUploadingImage ? "text-[#949C96]" : "text-[#0B3B2C]"
                }`}
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                {isUploadingImage ? "Camera" : "Camera"}
              </Text>
            </Pressable>
          </View>

          {/* Uploading Status Banner */}
          {isUploadingImage && (
            <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 flex-row items-center">
              <ActivityIndicator size="small" color="#0B3B2C" />
              <Text
                className="text-xs text-[#0B3B2C] font-semibold ml-2.5 flex-1"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                {uploadStatusText || "Uploading photo to Supabase Storage..."}
              </Text>
            </View>
          )}

          {/* Add Image via URL (Secondary option) */}
          <Text
            className="text-xs text-[#717973] uppercase mb-1.5 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Or Paste Web Image URL
          </Text>
          <View className="flex-row items-center mb-1">
            <TextInput
              value={newImageUrl}
              onChangeText={setNewImageUrl}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#949C96"
              className="flex-1 bg-white p-3 rounded-xl border border-[#E5E2DB] text-xs text-[#1C1C17] mr-2"
              style={{ fontFamily: "Inter_400Regular" }}
            />
            <Pressable
              onPress={handleAddImage}
              className="bg-[#E9E7DF] border border-[#C1C8C2]/60 px-3.5 py-3 rounded-xl active:bg-[#D9D6CC]"
            >
              <Text
                className="text-[#1C1C17] text-xs font-semibold"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                + Add URL
              </Text>
            </Pressable>
          </View>
          {errors.images ? (
            <Text
              style={{
                color: "#DC2626",
                fontSize: 11.5,
                marginBottom: 12,
                marginLeft: 2,
                fontFamily: "Inter_500Medium",
              }}
            >
              {errors.images}
            </Text>
          ) : (
            <View className="mb-4" />
          )}

          {/* Workshop Details */}
          <FloatingLabelInput
            label="Workshop Title *"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="e.g. Master Blue Pottery Shaping & Glaze"
            error={errors.name}
          />

          {/* Craft Selector */}
          <Text
            className="text-xs text-[#717973] uppercase mb-2 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Craft Category *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-1"
          >
            {crafts.map((craft) => {
              const isSel = craftId === craft.id;
              return (
                <Pressable
                  key={craft.id}
                  onPress={() => {
                    setCraftId(craft.id);
                    if (errors.craft) setErrors((prev) => ({ ...prev, craft: "" }));
                  }}
                  className={`px-3.5 py-2 mr-2 rounded-xl border flex-row items-center ${
                    isSel
                      ? "bg-[#0B3B2C] border-[#0B3B2C]"
                      : "bg-white border-[#E5E2DB]"
                  }`}
                >
                  <MaterialCommunityIcons
                    name={getValidCraftIcon(craft.icon, "hammer")}
                    size={14}
                    color={isSel ? "#FFFFFF" : "#0B3B2C"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    className="text-xs"
                    style={{
                      fontFamily: isSel ? "Inter_600SemiBold" : "Inter_400Regular",
                      color: isSel ? "#FFFFFF" : "#1C1C17",
                    }}
                  >
                    {craft.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {errors.craft ? (
            <Text
              style={{
                color: "#DC2626",
                fontSize: 11.5,
                marginBottom: 12,
                marginLeft: 2,
                fontFamily: "Inter_500Medium",
              }}
            >
              {errors.craft}
            </Text>
          ) : (
            <View className="mb-3" />
          )}

          <FloatingLabelInput
            label="Studio Address / Location *"
            value={location}
            onChangeText={(t) => {
              setLocation(t);
              if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
            }}
            placeholder="e.g. Sanganer Heritage Lane, Amer Road"
            error={errors.location}
          />

          {/* Price, Duration, Max Participants Row */}
          <View className="flex-row justify-between">
            <View className="w-[31%]">
              <FloatingLabelInput
                label="Price (₹) *"
                value={price}
                onChangeText={(t) => {
                  setPrice(t);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                }}
                placeholder="1400"
                keyboardType="numeric"
                error={errors.price}
              />
            </View>
            <View className="w-[31%]">
              <FloatingLabelInput
                label="Duration *"
                value={duration}
                onChangeText={setDuration}
                placeholder="2.5 Hours"
              />
            </View>
            <View className="w-[31%]">
              <FloatingLabelInput
                label="Max Size *"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                placeholder="6"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Description */}
          <Text
            className="text-xs text-[#717973] uppercase mb-2 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            Workshop Description *
          </Text>
          <View className="bg-white rounded-2xl p-3.5 border border-[#E5E2DB] shadow-xs mb-1">
            <TextInput
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder="Detail what attendees will learn, hands-on steps, tools provided, and takeaway pieces..."
              placeholderTextColor="#949C96"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="text-xs text-[#1C1C17] min-h-[100px]"
              style={{ fontFamily: "Inter_400Regular" }}
            />
          </View>
          {errors.description ? (
            <Text
              style={{
                color: "#DC2626",
                fontSize: 11.5,
                marginBottom: 16,
                marginLeft: 2,
                fontFamily: "Inter_500Medium",
              }}
            >
              {errors.description}
            </Text>
          ) : (
            <View className="mb-6" />
          )}

          {/* Submit Button */}
          <Button
            title="Publish Workshop Listing"
            loadingTitle="Publishing Workshop Listing..."
            variant="primary"
            onPress={handleCreate}
            loading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
