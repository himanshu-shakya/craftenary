import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "../common/BottomSheet";
import { HeritageLocation } from "../../src/types/home";
import { Button } from "../Button";
import { generateAiTrail } from "../../src/services/ai/geminiService";

export interface AiTrailPlannerModalProps {
  visible: boolean;
  onClose: () => void;
  initialLocation: HeritageLocation;
  onBookExperience?: (title: string) => void;
}

interface TrailDateOption {
  isoString: string;
  dayName: string;
  dayNum: string;
  monthName: string;
  fullFormatted: string;
  isToday: boolean;
  isTomorrow: boolean;
  isWeekend: boolean;
}

export const AiTrailPlannerModal: React.FC<AiTrailPlannerModalProps> = ({
  visible,
  onClose,
  initialLocation,
  onBookExperience,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["92%"], []);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Blue Pottery",
    "Block Printing",
  ]);
  const [duration, setDuration] = useState<"half-day" | "full-day" | "weekend">(
    "full-day"
  );
  
  // Date Picker State
  const upcomingDates = useMemo<TrailDateOption[]>(() => {
    const list: TrailDateOption[] = [];
    const base = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date();
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      list.push({
        isoString: iso,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        dayNum: d.getDate().toString(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        fullFormatted: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        isToday: i === 0,
        isTomorrow: i === 1,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(
    upcomingDates[0]?.isoString || new Date().toISOString().split("T")[0]
  );
  
  const [customRequest, setCustomRequest] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTrail, setGeneratedTrail] = useState<any | null>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

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

  const interestOptions = [
    "Blue Pottery",
    "Block Printing",
    "Wood Carving",
    "Miniature Painting",
    "Silver Filigree",
    "Pichwai Art",
  ];

  const toggleInterest = (craft: string) => {
    setSelectedInterests((prev) =>
      prev.includes(craft) ? prev.filter((c) => c !== craft) : [...prev, craft]
    );
  };

  const selectedDateObj = useMemo(() => {
    return upcomingDates.find((d) => d.isoString === selectedDate) || upcomingDates[0];
  }, [selectedDate, upcomingDates]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const trail = await generateAiTrail(
        initialLocation.city,
        selectedInterests,
        duration,
        selectedDateObj?.fullFormatted || "Today",
        customRequest
      );
      setGeneratedTrail(trail);
    } catch (error) {
      alert("Failed to generate trail. Please ensure EXPO_PUBLIC_GEMINI_API_KEY is in your .env");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetModal = () => {
    setGeneratedTrail(null);
    bottomSheetModalRef.current?.dismiss();
    onClose();
  };

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
      <View className="flex-1 px-5 pb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between pb-4 border-b border-[#E9E7DF]">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-9 h-9 rounded-full bg-[#0B3B2C] items-center justify-center mr-3 shadow-xs">
              <MaterialCommunityIcons
                name="creation"
                size={18}
                color="#A3D9C9"
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-lg text-[#1C1C17]"
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                AI Heritage Trail Planner
              </Text>
              <Text
                className="text-xs text-[#717973]"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Personalized artisan trails in {initialLocation.city}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={resetModal}
            hitSlop={10}
            className="w-8 h-8 rounded-full bg-[#E9E7DF] items-center justify-center active:bg-[#DDD9D0]"
          >
            <Feather name="x" size={16} color="#1C1C17" />
          </Pressable>
        </View>

        <BottomSheetScrollView showsVerticalScrollIndicator={false} className="py-4">
          {!generatedTrail ? (
            <>
              {/* 1. Duration Selection */}
              <Text
                className="text-xs text-[#717973] uppercase mb-2 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Trail Duration
              </Text>
              <View className="flex-row mb-5">
                {(["half-day", "full-day", "weekend"] as const).map((d) => {
                  const isSel = duration === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setDuration(d)}
                      className={`flex-1 py-2.5 mx-1 rounded-xl items-center border ${
                        isSel
                          ? "bg-[#0B3B2C] border-[#0B3B2C]"
                          : "bg-white border-[#E5E2DB]"
                      }`}
                    >
                      <Text
                        className="text-xs capitalize"
                        style={{
                          fontFamily: isSel
                            ? "Inter_600SemiBold"
                            : "Inter_500Medium",
                          color: isSel ? "#FFFFFF" : "#1C1C17",
                        }}
                      >
                        {d.replace("-", " ")}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* 2. Date Picker Component */}
              <View className="mb-5">
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className="text-xs text-[#717973] uppercase font-bold"
                    style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
                  >
                    Select Trail Date
                  </Text>
                  <Text
                    className="text-xs text-[#0B3B2C] font-semibold"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    {selectedDateObj?.fullFormatted}
                  </Text>
                </View>

                {/* Quick Date Presets */}
                <View className="flex-row mb-3">
                  <Pressable
                    onPress={() => setSelectedDate(upcomingDates[0].isoString)}
                    className={`px-3 py-1.5 mr-2 rounded-lg border ${
                      selectedDate === upcomingDates[0]?.isoString
                        ? "bg-[#0B3B2C] border-[#0B3B2C]"
                        : "bg-white border-[#E5E2DB]"
                    }`}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{
                        fontFamily: "Inter_500Medium",
                        color:
                          selectedDate === upcomingDates[0]?.isoString
                            ? "#FFFFFF"
                            : "#1C1C17",
                      }}
                    >
                      Today
                    </Text>
                  </Pressable>

                  {upcomingDates[1] && (
                    <Pressable
                      onPress={() => setSelectedDate(upcomingDates[1].isoString)}
                      className={`px-3 py-1.5 mr-2 rounded-lg border ${
                        selectedDate === upcomingDates[1]?.isoString
                          ? "bg-[#0B3B2C] border-[#0B3B2C]"
                          : "bg-white border-[#E5E2DB]"
                      }`}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{
                          fontFamily: "Inter_500Medium",
                          color:
                            selectedDate === upcomingDates[1]?.isoString
                              ? "#FFFFFF"
                              : "#1C1C17",
                        }}
                      >
                        Tomorrow
                      </Text>
                    </Pressable>
                  )}

                  {/* Find next Saturday */}
                  {(() => {
                    const weekendDay = upcomingDates.find((d) => d.isWeekend && !d.isToday);
                    if (!weekendDay) return null;
                    return (
                      <Pressable
                        onPress={() => setSelectedDate(weekendDay.isoString)}
                        className={`px-3 py-1.5 rounded-lg border ${
                          selectedDate === weekendDay.isoString
                            ? "bg-[#0B3B2C] border-[#0B3B2C]"
                            : "bg-white border-[#E5E2DB]"
                        }`}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{
                            fontFamily: "Inter_500Medium",
                            color:
                              selectedDate === weekendDay.isoString
                                ? "#FFFFFF"
                                : "#1C1C17",
                          }}
                        >
                          This Weekend
                        </Text>
                      </Pressable>
                    );
                  })()}
                </View>

                {/* Horizontal Scrollable Calendar Date Strip */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 10 }}
                  className="py-1"
                >
                  {upcomingDates.map((item) => {
                    const isSelected = selectedDate === item.isoString;
                    return (
                      <TouchableOpacity
                        key={item.isoString}
                        onPress={() => setSelectedDate(item.isoString)}
                        activeOpacity={0.8}
                        style={{
                          width: 58,
                          height: 72,
                          borderRadius: 16,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? "#0B3B2C" : "#E5E2DB",
                          backgroundColor: isSelected ? "#0B3B2C" : "#FFFFFF",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 8,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: isSelected ? 0.12 : 0.03,
                          shadowRadius: 3,
                          elevation: isSelected ? 2 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontFamily: "Inter_600SemiBold",
                            letterSpacing: 0.5,
                            color: isSelected ? "#D1E7DD" : "#717973",
                            marginBottom: 2,
                          }}
                        >
                          {item.dayName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontFamily: "HankenGrotesk_700Bold",
                            color: isSelected ? "#FFFFFF" : "#1C1C17",
                          }}
                        >
                          {item.dayNum}
                        </Text>
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: "Inter_600SemiBold",
                            color: isSelected ? "#D1E7DD" : "#949C96",
                            marginTop: 1,
                          }}
                        >
                          {item.monthName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 3. Craft Interests */}
              <Text
                className="text-xs text-[#717973] uppercase mb-2 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Select Craft Interests
              </Text>
              <View className="flex-row flex-wrap mb-6">
                {interestOptions.map((craft) => {
                  const isSel = selectedInterests.includes(craft);
                  return (
                    <Pressable
                      key={craft}
                      onPress={() => toggleInterest(craft)}
                      className={`px-3.5 py-2 mr-2 mb-2 rounded-full border ${
                        isSel
                          ? "bg-[#0B3B2C] border-[#0B3B2C]"
                          : "bg-white border-[#E5E2DB]"
                      }`}
                    >
                      <Text
                        className="text-xs"
                        style={{
                          fontFamily: isSel
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
                          color: isSel ? "#FFFFFF" : "#1C1C17",
                        }}
                      >
                        {isSel ? "✓ " : "+ "}
                        {craft}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* 4. Custom Request */}
              <Text
                className="text-xs text-[#717973] uppercase mb-2 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Special Requests (Optional)
              </Text>
              <View className="mb-6">
                <TextInput
                  value={customRequest}
                  onChangeText={setCustomRequest}
                  placeholder="E.g., I'm traveling with kids, looking for beginner-friendly workshops..."
                  placeholderTextColor="#949C96"
                  multiline
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#E5E2DB",
                    borderRadius: 16,
                    padding: 14,
                    minHeight: 80,
                    textAlignVertical: "top",
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    color: "#1C1C17",
                  }}
                />
              </View>

              {/* Generate Button */}
              <Button
                title={
                  selectedInterests.length === 0
                    ? "Select At Least 1 Craft to Plan"
                    : "Plan My Heritage Trail with AI"
                }
                loadingTitle="Crafting AI Heritage Trail..."
                variant="primary"
                size="lg"
                leftIcon={
                  <MaterialCommunityIcons
                    name="creation"
                    size={18}
                    color="#000"
                  />
                }
                loading={isGenerating}
                disabled={isGenerating || selectedInterests.length === 0}
                onPress={handleGenerate}
              />
            </>
          ) : (
            /* Generated Trail Itinerary */
            <View>
              <View className="bg-white p-4 rounded-2xl border border-[#E5E2DB] mb-4 shadow-xs">
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className="text-base text-[#0B3B2C]"
                    style={{ fontFamily: "HankenGrotesk_700Bold" }}
                  >
                    {generatedTrail.title}
                  </Text>
                  <View className="px-2 py-0.5 rounded-full bg-[#D96B16]/10">
                    <Text
                      className="text-[11px] text-[#D96B16]"
                      style={{ fontFamily: "Inter_600SemiBold" }}
                    >
                      AI Curated
                    </Text>
                  </View>
                </View>

                {/* Scheduled Date Badge */}
                <View className="flex-row items-center my-1.5">
                  <Feather
                    name="calendar"
                    size={13}
                    color="#D96B16"
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    className="text-xs text-[#1C1C17] font-semibold"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    Scheduled for {generatedTrail.trailDate} • {generatedTrail.durationLabel}
                  </Text>
                </View>

                <Text
                  className="text-xs text-[#717973] leading-relaxed mt-1"
                  style={{ fontFamily: "Inter_400Regular" }}
                >
                  {generatedTrail.summary}
                </Text>
              </View>

              {/* Timeline Stops */}
              <Text
                className="text-xs text-[#717973] uppercase mb-3 font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Itinerary Stops ({generatedTrail.stops.length})
              </Text>

              {generatedTrail.stops.map((stop: any, index: number) => (
                <View key={index} className="flex-row mb-4">
                  <View className="items-center mr-3">
                    <View className="w-7 h-7 rounded-full bg-[#0B3B2C] items-center justify-center">
                      <Text
                        className="text-white text-[11px]"
                        style={{ fontFamily: "Inter_700Bold" }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    {index < generatedTrail.stops.length - 1 && (
                      <View className="w-[1.5px] flex-1 bg-[#C1C8C2] my-1" />
                    )}
                  </View>

                  <View className="flex-1 bg-white p-3.5 rounded-2xl border border-[#E5E2DB] shadow-xs">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text
                        className="text-[11px] text-[#D96B16]"
                        style={{ fontFamily: "Inter_600SemiBold" }}
                      >
                        {stop.time}
                      </Text>
                      <Text
                        className="text-[11px] text-[#717973]"
                        style={{ fontFamily: "Inter_500Medium" }}
                      >
                        {stop.location}
                      </Text>
                    </View>
                    <Text
                      className="text-sm text-[#1C1C17] mb-1"
                      style={{ fontFamily: "HankenGrotesk_700Bold" }}
                    >
                      {stop.title}
                    </Text>
                    <Text
                      className="text-xs text-[#717973]"
                      style={{ fontFamily: "Inter_400Regular" }}
                    >
                      {stop.activity}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Trail Actions */}
              <View className="flex-row items-center mt-2">
                <Button
                  title="Plan Another Date"
                  variant="secondary"
                  size="md"
                  fullWidth={false}
                  style={{ flex: 1, marginRight: 8 }}
                  onPress={() => setGeneratedTrail(null)}
                />

                <Button
                  title="Book Full Heritage Trail"
                  variant="primary"
                  size="md"
                  fullWidth={false}
                  style={{ flex: 1.6 }}
                  onPress={() => {
                    resetModal();
                    if (onBookExperience) {
                      onBookExperience(generatedTrail.title);
                    }
                  }}
                />
              </View>
            </View>
          )}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
};
