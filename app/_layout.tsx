import "../global.css";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "../components/common/BottomSheet";
import { Slot } from "expo-router";
import { AuthProvider } from "../src/hooks/useAuth";
import { ToastProvider } from "../src/context/ToastContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <BottomSheetModalProvider>
            <Slot />
          </BottomSheetModalProvider>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
