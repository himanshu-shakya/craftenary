import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { useTouristProfile } from "../../src/hooks/useTouristProfile";
import { useCrafts } from "../../src/hooks/useCrafts";
import { useWorkshops } from "../../src/hooks/useWorkshops";
import { WorkshopCard } from "../../components/workshop/WorkshopCard";
import { Avatar } from "../../components/common/Avatar";
import { Button } from "../../components/Button";
import {
  BottomNavigationBar,
  TabId,
} from "../../components/home/BottomNavigationBar";
import { FloatingAiButton } from "../../components/home/FloatingAiButton";
import { AiTrailPlannerModal } from "../../components/home/AiTrailPlannerModal";
import { getValidCraftIcon } from "../../src/utils/craftIcons";
import { Workshop } from "../../src/types/workshop";

export interface TouristDashboardScreenProps {
  onSelectWorkshop: (workshop: Workshop) => void;
  onOpenProfile: () => void;
  onOpenBookings: () => void;
}

export const TouristDashboardScreen: React.FC<TouristDashboardScreenProps> = ({
  onSelectWorkshop,
  onOpenProfile,
  onOpenBookings,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile: tourist } = useTouristProfile(user?.id);
  const { crafts, isLoading: isLoadingCrafts } = useCrafts();

  // State
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [selectedCraftId, setSelectedCraftId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Tourist craft interests IDs
  const touristInterestIds = useMemo(
    () => tourist?.craft_interests?.map((c) => c.id) || [],
    [tourist?.craft_interests]
  );

  const { workshops, isLoading: isLoadingWorkshops, refetch } = useWorkshops({
    craftId: selectedCraftId || undefined,
    craftIds: !selectedCraftId && touristInterestIds.length > 0 ? touristInterestIds : undefined,
    searchQuery,
  });

  const displayName = tourist
    ? `${tourist.first_name} ${tourist.last_name}`
    : user?.user_metadata?.full_name || "Explorer";

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === "profile") {
      onOpenProfile();
    } else if (tab === "bookings") {
      onOpenBookings();
    }
  };

  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="dark" />

      {/* Top Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 14),
          backgroundColor: "#FAF8F2",
        }}
        className="px-5 pb-2 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg bg-[#0B3B2C]/10 items-center justify-center mr-2.5">
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
          onPress={onOpenProfile}
          accessibilityRole="button"
          accessibilityLabel="User profile"
          className="active:opacity-80"
        >
          <Avatar
            imageUrl={tourist?.profile_image_url}
            name={displayName}
            size={36}
            backgroundColor="#0B3B2C"
          />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 60,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Explore Subtitle & Headline */}
        <View className="mb-4">
          <Text
            className="text-xs text-[#414844] mb-1"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Explore Heritage
          </Text>
          <Text
            className="text-2xl text-[#1C1C17]"
            style={{
              fontFamily: "HankenGrotesk_700Bold",
              lineHeight: 30,
              letterSpacing: -0.4,
            }}
          >
            Where do you want to{"\n"}explore?
          </Text>
        </View>

        {/* Location Pill */}
        <View className="bg-white rounded-2xl p-3.5 mb-3 flex-row items-center justify-between border border-[#E5E2DB] shadow-xs">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-[#0B3B2C]/10 items-center justify-center mr-3">
              <Feather name="map-pin" size={16} color="#0B3B2C" />
            </View>
            <View>
              <Text
                className="text-[10px] text-[#717973] uppercase font-bold"
                style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
              >
                Current Location
              </Text>
              <Text
                className="text-sm text-[#1C1C17]"
                style={{ fontFamily: "HankenGrotesk_700Bold" }}
              >
                {tourist?.city || "Jaipur"}, {tourist?.state || "Rajasthan"}
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-xl px-3.5 py-2.5 mb-3 flex-row items-center border border-[#E5E2DB] shadow-xs">
          <Feather name="search" size={17} color="#717973" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search crafts, artisans, or workshops..."
            placeholderTextColor="#949C96"
            className="flex-1 ml-2.5 text-xs text-[#1C1C17] py-0.5"
            style={{ fontFamily: "Inter_400Regular" }}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              className="w-5 h-5 rounded-full bg-[#E5E2DB] items-center justify-center"
            >
              <Feather name="x" size={12} color="#414844" />
            </Pressable>
          )}
        </View>

        {/* AI Trail Planner Button */}
        <Button
          title="Plan my heritage trail with AI"
          variant="primary"
          size="md"
          leftIcon={
            <MaterialCommunityIcons
              name="creation-outline"
              size={18}
              color="#000"
            />
          }
          style={{ marginBottom: 24 }}
          onPress={() => setIsAiModalOpen(true)}
        />

        {/* Craft Filter Chips */}
        <View className="mb-6">
          <Text
            className="text-base text-[#1C1C17] mb-3"
            style={{ fontFamily: "HankenGrotesk_700Bold" }}
          >
            Discover Crafts
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              onPress={() => setSelectedCraftId(null)}
              className={`px-3.5 py-2 mr-2 rounded-full border ${
                selectedCraftId === null
                  ? "bg-[#0B3B2C] border-[#0B3B2C]"
                  : "bg-white border-[#E5E2DB]"
              }`}
            >
              <Text
                className="text-xs"
                style={{
                  fontFamily:
                    selectedCraftId === null
                      ? "Inter_600SemiBold"
                      : "Inter_400Regular",
                  color: selectedCraftId === null ? "#FFFFFF" : "#1C1C17",
                }}
              >
                All Crafts
              </Text>
            </Pressable>

            {crafts.map((craft) => {
              const isSelected = selectedCraftId === craft.id;
              return (
                <Pressable
                  key={craft.id}
                  onPress={() =>
                    setSelectedCraftId((prev) =>
                      prev === craft.id ? null : craft.id
                    )
                  }
                  className={`px-3.5 py-2 mr-2 rounded-full border flex-row items-center ${
                    isSelected
                      ? "bg-[#0B3B2C] border-[#0B3B2C]"
                      : "bg-white border-[#E5E2DB]"
                  }`}
                >
                  <MaterialCommunityIcons
                    name={getValidCraftIcon(craft.icon, "star-outline")}
                    size={14}
                    color={isSelected ? "#FFFFFF" : "#0B3B2C"}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    className="text-xs"
                    style={{
                      fontFamily: isSelected
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                      color: isSelected ? "#FFFFFF" : "#1C1C17",
                    }}
                  >
                    {craft.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Workshops Feed */}
        <View className="mb-2 flex-row items-center justify-between">
          <Text
            className="text-base text-[#1C1C17]"
            style={{ fontFamily: "HankenGrotesk_700Bold" }}
          >
            {selectedCraftId
              ? "Craft Workshops"
              : touristInterestIds.length > 0
              ? "Recommended For You"
              : "Popular Near You"}
          </Text>

          <Text
            className="text-xs text-[#717973]"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {workshops.length} experiences
          </Text>
        </View>

        {isLoadingWorkshops ? (
          <View className="py-12 items-center">
            <ActivityIndicator color="#0B3B2C" size="small" />
          </View>
        ) : (
          <View>
            {workshops.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                onPress={onSelectWorkshop}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating AI Button */}
      <FloatingAiButton
        onPress={() => setIsAiModalOpen(true)}
        bottomOffset={16}
      />



      {/* AI Heritage Trail Modal */}
      <AiTrailPlannerModal
        visible={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialLocation={{
          id: "tourist-loc",
          city: tourist?.city || "Jaipur",
          state: tourist?.state || "Rajasthan",
          popularCraft: "Blue Pottery & Handloom",
        }}
        onBookExperience={(title) => {
          // Create a mock workshop to route the user into the booking flow
          const mockAiWorkshop: Workshop = {
            id: `ai-trail-${Date.now()}`,
            artisan_id: "ai-system",
            craft_category_id: "all-crafts",
            name: title,
            description: `A personalized AI-curated heritage trail through ${tourist?.city || "Jaipur"}. Explore multiple studios, learn hands-on from master artisans, and immerse yourself in local culture all in one booking.`,
            price: 2500,
            duration: 360,
            capacity: 8,
            difficulty: "beginner",
            location: `${tourist?.city || "Jaipur"} Heritage Districts`,
            city: tourist?.city || "Jaipur",
            state: tourist?.state || "Rajasthan",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            artisan: {
              id: "ai-system",
              first_name: "Craftenary",
              last_name: "AI Guide",
              user_id: "ai-system"
            },
            images: [
              {
                id: "img-1",
                workshop_id: "ai",
                image_url: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=600&q=80",
                is_primary: true,
                created_at: new Date().toISOString(),
              }
            ],
            materials_provided: ["All craft materials", "Guided transportation", "Local lunch", "Certificates"]
          };
          onSelectWorkshop(mockAiWorkshop);
        }}
      />
    </View>
  );
};
