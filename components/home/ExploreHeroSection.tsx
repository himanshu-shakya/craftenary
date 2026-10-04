import React, { useCallback, useMemo, useRef } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "../common/BottomSheet";
import { HERITAGE_LOCATIONS } from "../../src/data/homeData";
import { HeritageLocation } from "../../src/types/home";

export interface ExploreHeroSectionProps {
  selectedLocation: HeritageLocation;
  onSelectLocation: (loc: HeritageLocation) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onPlanTrailWithAi: () => void;
}

export const ExploreHeroSection: React.FC<ExploreHeroSectionProps> = ({
  selectedLocation,
  onSelectLocation,
  searchQuery,
  onChangeSearchQuery,
  onPlanTrailWithAi,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["65%"], []);

  const handleOpenLocationPicker = () => {
    bottomSheetModalRef.current?.present();
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
    <View className="px-5 pt-2 pb-5 bg-[#FAF8F2]">
      {/* Subtitle Tag */}
      <Text
        className="text-[#414844] mb-1"
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 13.5,
          letterSpacing: 0.2,
        }}
      >
        Explore Heritage
      </Text>

      {/* Main Headline */}
      <Text
        className="text-[#1C1C17] mb-4"
        style={{
          fontFamily: "HankenGrotesk_700Bold",
          fontSize: 26,
          lineHeight: 32,
          letterSpacing: -0.4,
        }}
      >
        Where do you want to{"\n"}explore?
      </Text>

      {/* Location Selector Pill */}
      <Pressable
        onPress={handleOpenLocationPicker}
        accessibilityRole="button"
        accessibilityLabel="Select heritage city"
        className="bg-white rounded-2xl p-3.5 mb-3 flex-row items-center justify-between border border-[#E5E2DB] shadow-xs active:bg-[#F7F5EE]"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-full bg-[#0B3B2C]/10 items-center justify-center mr-3">
            <Feather name="map-pin" size={17} color="#0B3B2C" />
          </View>
          <View className="flex-1">
            <Text
              className="text-[11px] text-[#717973] uppercase"
              style={{ fontFamily: "Inter_500Medium", letterSpacing: 0.5 }}
            >
              Current Location
            </Text>
            <Text
              className="text-[#1C1C17] text-[15px]"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              {selectedLocation.city}, {selectedLocation.state}
            </Text>
          </View>
        </View>
        <Feather name="chevron-down" size={18} color="#717973" />
      </Pressable>

      {/* Search Input Bar */}
      <View className="bg-white rounded-2xl p-2.5 mb-3 flex-row items-center border border-[#E5E2DB] shadow-xs">
        <View className="pl-2 pr-2.5">
          <Feather name="search" size={18} color="#717973" />
        </View>
        <TextInput
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
          placeholder="Search by craft, master artisan, city..."
          placeholderTextColor="#717973"
          className="flex-1 text-[#1C1C17] text-sm py-1.5"
          style={{ fontFamily: "Inter_400Regular" }}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => onChangeSearchQuery("")}
            hitSlop={8}
            className="p-1 mr-1"
          >
            <Feather name="x-circle" size={16} color="#717973" />
          </Pressable>
        )}
      </View>

      {/* AI Trail Planner Floating Quick Card */}
      <Pressable
        onPress={onPlanTrailWithAi}
        accessibilityRole="button"
        accessibilityLabel="Plan trail with AI"
        className="rounded-2xl p-4 flex-row items-center justify-between border active:opacity-90 shadow-xs"
        style={{
          backgroundColor: "#0B3B2C",
          borderColor: "#07261C",
        }}
      >
        <View className="flex-row items-center flex-1 mr-3">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <MaterialCommunityIcons
              name="creation"
              size={22}
              color="#A3D9C9"
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <Text
                className="text-white text-sm mr-2"
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                AI Trail Planner
              </Text>
              <View className="bg-[#D96B16] px-1.5 py-0.5 rounded">
                <Text
                  className="text-white text-[10px] font-bold"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  NEW
                </Text>
              </View>
            </View>
            <Text
              className="text-[#E9E7DF] text-xs"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Get a custom artisan route for your weekend
            </Text>
          </View>
        </View>
        <Feather name="arrow-right" size={18} color="#FFFFFF" />
      </Pressable>

      {/* @gorhom/bottom-sheet Location Picker */}
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
        <View className="flex-1 px-6 pb-6">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-[#E9E7DF]">
            <View>
              <Text
                className="text-xl text-[#1C1C17]"
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                Select Heritage Region
              </Text>
              <Text
                className="text-xs text-[#717973] mt-0.5"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Discover master craft hubs across India
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

          {/* Locations List */}
          <BottomSheetScrollView showsVerticalScrollIndicator={false} className="py-3">
            {HERITAGE_LOCATIONS.map((loc) => {
              const isSelected = loc.id === selectedLocation.id;
              return (
                <Pressable
                  key={loc.id}
                  onPress={() => {
                    onSelectLocation(loc);
                    bottomSheetModalRef.current?.dismiss();
                  }}
                  className={`flex-row items-center justify-between p-3.5 my-1.5 rounded-2xl border ${
                    isSelected
                      ? "bg-[#0B3B2C]/10 border-[#0B3B2C]"
                      : "bg-white border-[#E5E2DB]"
                  } active:opacity-80`}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                        isSelected ? "bg-[#0B3B2C]" : "bg-[#FAF8F2]"
                      }`}
                    >
                      <Feather
                        name="map-pin"
                        size={16}
                        color={isSelected ? "#FFFFFF" : "#0B3B2C"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm text-[#1C1C17]"
                        style={{
                          fontFamily: isSelected
                            ? "HankenGrotesk_700Bold"
                            : "HankenGrotesk_600SemiBold",
                        }}
                      >
                        {loc.city}, {loc.state}
                      </Text>
                      <Text
                        className="text-xs text-[#717973] mt-0.5"
                        style={{ fontFamily: "Inter_400Regular" }}
                      >
                        Famous for: {loc.popularCraft}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Feather name="check" size={18} color="#0B3B2C" />
                  )}
                </Pressable>
              );
            })}
          </BottomSheetScrollView>
        </View>
      </BottomSheetModal>
    </View>
  );
};
