import type * as ImagePickerTypes from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";

export type ImagePickerAsset = ImagePickerTypes.ImagePickerAsset;

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Lazy safe loader for expo-image-picker to prevent native module crash when running without a rebuild
let _imagePickerModule: typeof import("expo-image-picker") | null = null;
let _imagePickerChecked = false;

function getImagePicker(): typeof import("expo-image-picker") | null {
  if (_imagePickerModule) return _imagePickerModule;
  if (_imagePickerChecked) return null;
  _imagePickerChecked = true;
  try {
    _imagePickerModule = require("expo-image-picker");
    return _imagePickerModule;
  } catch (err: unknown) {
    if (__DEV__) {
      console.warn(
        "[StorageService] expo-image-picker native module is not linked in current runtime. Rebuilding with 'npm run android' is required for native picker.",
        err
      );
    }
    return null;
  }
}

class StorageService {
  /**
   * Check if native ImagePicker is available
   */
  isPickerAvailable(): boolean {
    return getImagePicker() !== null;
  }

  /**
   * Request media library permission
   */
  async requestMediaPermission(): Promise<boolean> {
    const ImagePicker = getImagePicker();
    if (!ImagePicker) {
      Alert.alert(
        "Build Restart Needed",
        "The photo picker native module requires restarting the Android build (press Ctrl+C in terminal and run 'npm run android'). You can paste image web URLs directly in the meantime!"
      );
      return false;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access in your device settings to upload pictures."
        );
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<boolean> {
    const ImagePicker = getImagePicker();
    if (!ImagePicker) {
      Alert.alert(
        "Build Restart Needed",
        "Camera module requires restarting the Android build (run 'npm run android'). You can paste image web URLs directly in the meantime!"
      );
      return false;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera access in your device settings to take pictures."
        );
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pick an image from the device gallery
   */
  async pickImage(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<ImagePickerAsset | null> {
    const ImagePicker = getImagePicker();
    if (!ImagePicker) {
      Alert.alert(
        "Build Restart Needed",
        "To enable native gallery picker, please rebuild your Android app by running 'npm run android' in your terminal. You can paste image web URLs directly in the meantime!"
      );
      return null;
    }

    const hasPermission = await this.requestMediaPermission();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [4, 3],
        quality: options?.quality ?? 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
      return null;
    } catch (err: unknown) {
      if (__DEV__) console.warn("[StorageService] Pick image error:", err);
      return null;
    }
  }

  /**
   * Take a photo using device camera
   */
  async takePhoto(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<ImagePickerAsset | null> {
    const ImagePicker = getImagePicker();
    if (!ImagePicker) {
      Alert.alert(
        "Build Restart Needed",
        "To enable device camera, please rebuild your Android app by running 'npm run android' in your terminal. You can paste image web URLs directly in the meantime!"
      );
      return null;
    }

    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [4, 3],
        quality: options?.quality ?? 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
      return null;
    } catch (err: unknown) {
      if (__DEV__) console.warn("[StorageService] Camera error:", err);
      return null;
    }
  }

  /**
   * Upload picked asset to Supabase Storage and return public URL
   */
  async uploadImage(
    asset: ImagePickerAsset,
    bucket: string = "craftinery-media",
    folder: string = "workshops"
  ): Promise<UploadResult> {
    try {
      let arrayBuffer: ArrayBuffer;
      const mimeType = asset.mimeType || "image/jpeg";
      const extension = mimeType.split("/")[1] || "jpg";
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;

      if (asset.base64) {
        arrayBuffer = decode(asset.base64);
      } else {
        const response = await fetch(asset.uri);
        arrayBuffer = await response.arrayBuffer();
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        if (__DEV__) console.error("[StorageService] Upload error:", error);
        return {
          success: false,
          error: error.message || "Failed to upload image to storage.",
        };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrl,
      };
    } catch (err: unknown) {
      if (__DEV__) console.error("[StorageService] Unexpected upload error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Image upload failed.",
      };
    }
  }

  /**
   * Convenience method: Pick image and upload to Supabase
   */
  async pickAndUploadImage(
    bucket: string = "craftinery-media",
    folder: string = "workshops"
  ): Promise<UploadResult> {
    const asset = await this.pickImage({ quality: 0.8 });
    if (!asset) {
      return { success: false, error: "No image selected" };
    }
    return await this.uploadImage(asset, bucket, folder);
  }
}

export const storageService = new StorageService();
