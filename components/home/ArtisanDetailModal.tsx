import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "../common/BottomSheet";
import { Artisan } from "../../src/types/home";
import { Button } from "../Button";

export interface ArtisanDetailModalProps {
  artisan: Artisan | null;
  onClose: () => void;
  onBookSession: (artisan: Artisan) => void;
}

export const ArtisanDetailModal: React.FC<ArtisanDetailModalProps> = ({
  artisan,
  onClose,
  onBookSession,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["85%"], []);

  useEffect(() => {
    if (artisan) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [artisan]);

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

  if (!artisan) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onDismiss={onClose}
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
      <View className="flex-1 px-6 pb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between pb-4 border-b border-[#E9E7DF]">
          <View className="flex-1 mr-2">
            <Text
              className="text-xl text-[#1C1C17]"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              {artisan.name}
            </Text>
            <Text
              className="text-xs text-[#717973] mt-0.5"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              {artisan.craft} • {artisan.location}
            </Text>
          </View>
          <Pressable
            onPress={() => bottomSheetModalRef.current?.dismiss()}
            hitSlop={10}
            className="w-8 h-8 rounded-full bg-[#E9E7DF] items-center justify-center active:bg-[#DDD9D0]"
          >
            <Feather name="x" size={16} color="#1C1C17" />
          </Pressable>
        </View>

        <BottomSheetScrollView showsVerticalScrollIndicator={false} className="py-4">
          {/* Artisan Photo */}
          <View className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-white border border-[#E5E2DB]">
            <Image
              source={artisan.image}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Quick Stats Row */}
          <View className="flex-row justify-between bg-white p-3.5 rounded-2xl border border-[#E5E2DB] mb-4">
            <View className="items-center flex-1 border-r border-[#E5E2DB]">
              <Text
                className="text-xs text-[#717973]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Rating
              </Text>
              <View className="flex-row items-center mt-1">
                <FontAwesome name="star" size={12} color="#D96B16" />
                <Text
                  className="text-sm text-[#1C1C17] ml-1 font-bold"
                  style={{ fontFamily: "HankenGrotesk_700Bold" }}
                >
                  {artisan.rating} ({artisan.reviewsCount || 80}+)
                </Text>
              </View>
            </View>

            <View className="items-center flex-1 border-r border-[#E5E2DB]">
              <Text
                className="text-xs text-[#717973]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Experience
              </Text>
              <Text
                className="text-sm text-[#1C1C17] mt-1 font-bold"
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                {artisan.experienceYears || 15}+ Years
              </Text>
            </View>

            <View className="items-center flex-1">
              <Text
                className="text-xs text-[#717973]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Hourly Rate
              </Text>
              <Text
                className="text-sm text-[#0B3B2C] mt-1 font-bold"
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                ₹{artisan.pricePerHour}/hr
              </Text>
            </View>
          </View>

          {/* About the Artisan */}
          <Text
            className="text-xs text-[#717973] uppercase mb-2 font-bold"
            style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
          >
            About the Master Artisan
          </Text>
          <Text
            className="text-sm text-[#414844] leading-relaxed mb-6"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {artisan.about ||
              "Dedicated master craftsperson preserving generational heritage techniques with authentic traditional tools."}
          </Text>

          {/* Book Session CTA */}
          <Button
            title={`Book Studio Session with ${artisan.name}`}
            variant="primary"
            size="lg"
            style={{ marginBottom: 24 }}
            onPress={() => {
              bottomSheetModalRef.current?.dismiss();
              onBookSession(artisan);
            }}
          />
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
};
