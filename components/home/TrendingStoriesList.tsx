import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Story } from "../../src/types/home";

export interface TrendingStoriesListProps {
  stories: Story[];
  onStoryPress: (story: Story) => void;
}

export const TrendingStoriesList: React.FC<TrendingStoriesListProps> = ({
  stories,
  onStoryPress,
}) => {
  return (
    <View className="pb-12">
      {/* Section Header */}
      <View className="px-5 mb-3">
        <Text
          className="text-[#1C1C17]"
          style={{
            fontFamily: "HankenGrotesk_700Bold",
            fontSize: 18,
            letterSpacing: -0.2,
          }}
        >
          Trending Stories
        </Text>
      </View>

      {/* Horizontal Story Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {stories.map((story) => (
          <Pressable
            key={story.id}
            onPress={() => onStoryPress(story)}
            accessibilityRole="button"
            accessibilityLabel={`Story ${story.title}`}
            className="rounded-2xl overflow-hidden mr-3.5 shadow-sm bg-[#1C1C17] active:opacity-90"
            style={{ width: 140, height: 185 }}
          >
            <ImageBackground
              source={story.image}
              className="w-full h-full justify-end p-3"
              resizeMode="cover"
            >
              {/* Bottom Gradient Fade */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.92)"]}
                locations={[0, 0.45, 1]}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />

              {/* Story Title & Author */}
              <View className="z-10">
                <Text
                  numberOfLines={2}
                  className="text-white text-xs leading-4 mb-1.5"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  {story.title}
                </Text>

                <View className="flex-row items-center">
                  <View className="w-3.5 h-3.5 rounded-full bg-white/90 items-center justify-center mr-1.5">
                    <Feather name="user" size={8} color="#1C1C17" />
                  </View>
                  <Text
                    numberOfLines={1}
                    className="text-white/80 text-[10.5px]"
                    style={{ fontFamily: "Inter_400Regular" }}
                  >
                    By {story.author}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
