import React, { useCallback, useMemo, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "../common/BottomSheet";
import { useAuth } from "../../src/hooks/useAuth";
import { Button } from "../Button";

export interface HeritageHeaderProps {
  onProfilePress?: () => void;
}

export const HeritageHeader: React.FC<HeritageHeaderProps> = ({
  onProfilePress,
}) => {
  const { user, profile, signOut } = useAuth();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["48%"], []);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Explorer";

  const userEmail = user?.email || "Authenticated User";
  const userRole = profile?.role || user?.user_metadata?.role || "tourist";

  const handleProfileClick = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      bottomSheetModalRef.current?.present();
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3 bg-[#FAF8F2]">
        {/* Brand Logo & Name */}
        <View className="flex-row items-center">
          <View
            className="w-8 h-8 rounded-lg items-center justify-center mr-2.5"
            style={{ backgroundColor: "rgba(11, 59, 44, 0.12)" }}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={18}
              color="#0B3B2C"
            />
          </View>
          <Text
            className="text-[#0B3B2C]"
            style={{
              fontFamily: "HankenGrotesk_700Bold",
              fontSize: 22,
              letterSpacing: -0.3,
            }}
          >
            Heritage
          </Text>
        </View>

        {/* Profile Avatar Button */}
        <Pressable
          onPress={handleProfileClick}
          accessibilityRole="button"
          accessibilityLabel="User profile menu"
          hitSlop={8}
          className="w-9 h-9 rounded-full items-center justify-center bg-[#0B3B2C] shadow-sm active:opacity-80"
        >
          <Feather name="user" size={17} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* @gorhom/bottom-sheet Account Quick Menu */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: "#FAF8F2",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
        handleIndicatorStyle={{
          backgroundColor: "#C1C8C2",
          width: 40,
        }}
      >
        <BottomSheetView className="px-6 pb-6">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-[#E9E7DF]">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-[#0B3B2C] items-center justify-center mr-3">
                <Feather name="user" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text
                  className="text-lg text-[#1C1C17]"
                  style={{ fontFamily: "HankenGrotesk_700Bold" }}
                >
                  {displayName}
                </Text>
                <Text
                  className="text-xs text-[#717973]"
                  style={{ fontFamily: "Inter_400Regular" }}
                >
                  {userEmail}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => bottomSheetModalRef.current?.dismiss()}
              hitSlop={10}
              className="w-8 h-8 rounded-full bg-[#E9E7DF] items-center justify-center active:bg-[#DDD9D0]"
            >
              <Feather name="x" size={16} color="#1C1C17" />
            </Pressable>
          </View>

          {/* Account Details */}
          <View className="py-4 space-y-3">
            <View className="flex-row items-center justify-between py-2 border-b border-[#E9E7DF]/60">
              <Text
                className="text-sm text-[#717973]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Account Role
              </Text>
              <View className="px-2.5 py-0.5 rounded-full bg-[#0B3B2C]/10">
                <Text
                  className="text-xs text-[#0B3B2C] font-semibold capitalize"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  {userRole}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between py-2 border-b border-[#E9E7DF]/60">
              <Text
                className="text-sm text-[#717973]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Heritage Points
              </Text>
              <Text
                className="text-sm text-[#D96B16]"
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                ✨ 450 pts
              </Text>
            </View>
          </View>

          {/* Sign Out Button */}
          <Button
            title="Sign Out"
            variant="danger"
            size="md"
            leftIcon={<Feather name="log-out" size={16} color="#FFFFFF" />}
            style={{ marginTop: 8 }}
            onPress={() => {
              bottomSheetModalRef.current?.dismiss();
              signOut();
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};
