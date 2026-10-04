import React from "react";
import {
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { FeaturedExperience } from "../../src/types/home";
import { Button } from "../Button";

export interface FeaturedExperienceCardProps {
  experience: FeaturedExperience;
  onBookPress: (exp: FeaturedExperience) => void;
}

export const FeaturedExperienceCard: React.FC<FeaturedExperienceCardProps> = ({
  experience,
  onBookPress,
}) => {
  return (
    <View className="px-5 pb-6">
      <View className="w-full h-[270px] p-4 rounded-3xl overflow-hidden shadow-md bg-[#1C1C17]">
        <ImageBackground
          source={experience.image}
          className="w-full h-full rounded-md justify-between p-4.5"
          resizeMode="cover"
        >
          {/* Subtle dark gradient overlay */}
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.35)",
              "transparent",
              "rgba(11, 28, 20, 0.75)",
              "rgba(11, 28, 20, 0.95)",
            ]}
            locations={[0, 0.25, 0.65, 1]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />

          {/* Top Badge */}
          <View className="flex-row items-center z-10">
            <View className="flex-row items-center bg-[#D96B16] px-3 py-1 rounded-full shadow-sm">
              <MaterialCommunityIcons
                name="fire"
                size={14}
                color="#FFFFFF"
                style={{ marginRight: 4 }}
              />
              <Text
                className="text-white text-xs"
                style={{
                  fontFamily: "Inter_600SemiBold",
                  letterSpacing: 0.2,
                }}
              >
                {experience.badge}
              </Text>
            </View>
          </View>

          {/* Bottom Card Content */}
          <View className="z-10">
            {/* Location Row */}
            <View className="flex-row items-center mb-1">
              <Feather name="map-pin" size={13} color="#E5E2DB" />
              <Text
                className="text-[#FAF8F2] text-xs ml-1.5"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                {experience.location}
              </Text>
            </View>

            {/* Main Title */}
            <Text
              className="text-white text-[22px] leading-7 mb-1.5"
              style={{
                fontFamily: "HankenGrotesk_700Bold",
                letterSpacing: -0.3,
              }}
            >
              {experience.title}
            </Text>

            {/* Description */}
            <Text
              numberOfLines={2}
              className="text-[#E9E7DF] text-xs leading-4.5 mb-3.5"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              {experience.description}
            </Text>

            {/* Book Workshop CTA Button */}
            <Button
              title="Book Workshop"
              variant="primary"
              size="md"
              rightIcon={<Feather name="arrow-right" size={16} color="#000" />}
              onPress={() => onBookPress(experience)}
            />
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};
