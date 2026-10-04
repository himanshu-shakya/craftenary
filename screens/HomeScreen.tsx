import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { HeritageHeader } from "../components/home/HeritageHeader";
import { ExploreHeroSection } from "../components/home/ExploreHeroSection";
import { CraftCategoriesList } from "../components/home/CraftCategoriesList";
import { FeaturedExperienceCard } from "../components/home/FeaturedExperienceCard";
import { PopularArtisansList } from "../components/home/PopularArtisansList";
import { TrendingStoriesList } from "../components/home/TrendingStoriesList";
import { FloatingAiButton } from "../components/home/FloatingAiButton";
import {
  BottomNavigationBar,
  TabId,
} from "../components/home/BottomNavigationBar";
import { AiTrailPlannerModal } from "../components/home/AiTrailPlannerModal";
import { WorkshopBookingModal } from "../components/home/WorkshopBookingModal";
import { ArtisanDetailModal } from "../components/home/ArtisanDetailModal";
import { StoryDetailModal } from "../components/home/StoryDetailModal";

import {
  CRAFT_CATEGORIES,
  FEATURED_EXPERIENCE,
  HERITAGE_LOCATIONS,
  POPULAR_ARTISANS,
  TRENDING_STORIES,
} from "../src/data/homeData";
import {
  Artisan,
  FeaturedExperience,
  HeritageLocation,
  Story,
} from "../src/types/home";

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // State
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [selectedLocation, setSelectedLocation] = useState<HeritageLocation>(
    HERITAGE_LOCATIONS[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [bookingExperience, setBookingExperience] =
    useState<FeaturedExperience | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-[#FAF8F2] items-center justify-center">
        <ActivityIndicator color="#0B3B2C" size="large" />
      </View>
    );
  }

  // Filter artisans based on category or search
  const filteredArtisans = POPULAR_ARTISANS.filter((artisan) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.craft.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategoryId ||
      artisan.craft.toLowerCase().includes(selectedCategoryId.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId((prev) => (prev === catId ? null : catId));
  };

  const handleViewAllArtisans = () => {
    Alert.alert(
      "Artisan Directory",
      `Viewing all master craft practitioners in ${selectedLocation.city}, ${selectedLocation.state}.`
    );
  };

  const handleBookFromArtisan = (artisan: Artisan) => {
    setBookingExperience({
      id: `exp-${artisan.id}`,
      badge: "Master Studio",
      title: `${artisan.craft} with ${artisan.name}`,
      craft: artisan.craft,
      location: `${artisan.location}, ${selectedLocation.city}`,
      description: `Private interactive workshop in ${artisan.craft} with master artisan ${artisan.name}.`,
      masterArtisan: artisan.name,
      price: artisan.pricePerHour * 2,
      duration: "2 Hours",
      image: artisan.image,
      highlights: [
        `Direct one-on-one mentorship in ${artisan.craft}`,
        "All materials, pigments and traditional tools provided",
        "Personalized craft piece to take home",
      ],
    });
  };

  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="dark" />

      {/* Safe Area Top Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 14),
          backgroundColor: "#FAF8F2",
        }}
      >
        <HeritageHeader />
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        className="flex-1 bg-[#FAF8F2]"
        contentContainerStyle={{
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Explore Heritage & Search & Location */}
        <ExploreHeroSection
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          onPlanTrailWithAi={() => setIsAiModalOpen(true)}
        />

        {/* Discover Crafts Horizontal Categories */}
        <CraftCategoriesList
          categories={CRAFT_CATEGORIES}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategorySelect}
        />

        {/* Featured Experience Banner */}
        <FeaturedExperienceCard
          experience={FEATURED_EXPERIENCE}
          onBookPress={(exp) => setBookingExperience(exp)}
        />

        {/* Popular Near You Artisans */}
        <PopularArtisansList
          artisans={
            filteredArtisans.length > 0 ? filteredArtisans : POPULAR_ARTISANS
          }
          onArtisanPress={(artisan) => setSelectedArtisan(artisan)}
          onViewAllPress={handleViewAllArtisans}
        />

        {/* Trending Stories */}
        <TrendingStoriesList
          stories={TRENDING_STORIES}
          onStoryPress={(story) => setSelectedStory(story)}
        />
      </ScrollView>

      {/* Floating AI Action Button (Bottom Right) */}
      <FloatingAiButton
        onPress={() => setIsAiModalOpen(true)}
        bottomOffset={16}
      />



      {/* AI Trail Planner Modal */}
      <AiTrailPlannerModal
        visible={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialLocation={selectedLocation}
        onBookExperience={(title) => {
          setBookingExperience({
            id: `ai-trail-${Date.now()}`,
            badge: "AI Curated Trail",
            title: title,
            craft: "Multiple Crafts",
            location: `${selectedLocation.city}, ${selectedLocation.state}`,
            description: `A personalized AI-curated heritage trail through ${selectedLocation.city}. Explore multiple studios and learn hands-on from master artisans.`,
            masterArtisan: "Craftenary AI Guide",
            price: 2500,
            duration: "Custom Day",
            image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=600&q=80",
            highlights: [
              "Visit multiple hand-picked artisan studios",
              "Personalized itinerary based on your interests",
              "Guided cultural experience",
            ],
          });
        }}
      />

      {/* Workshop Booking Modal */}
      <WorkshopBookingModal
        visible={!!bookingExperience}
        onClose={() => setBookingExperience(null)}
        experience={bookingExperience}
      />

      {/* Artisan Detail Modal */}
      <ArtisanDetailModal
        artisan={selectedArtisan}
        onClose={() => setSelectedArtisan(null)}
        onBookSession={handleBookFromArtisan}
      />

      {/* Story Detail Modal */}
      <StoryDetailModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </View>
  );
};
