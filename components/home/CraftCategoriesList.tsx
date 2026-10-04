import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CraftCategory } from "../../src/types/home";

export interface CraftCategoriesListProps {
  categories: CraftCategory[];
  selectedCategoryId?: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export const CraftCategoriesList: React.FC<CraftCategoriesListProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <View className="pt-2 pb-5">
      {/* Section Title */}
      <View className="px-5 mb-3">
        <Text
          className="text-[#1C1C17]"
          style={{
            fontFamily: "HankenGrotesk_700Bold",
            fontSize: 18,
            letterSpacing: -0.2,
          }}
        >
          Discover Crafts
        </Text>
      </View>

      {/* Horizontal Scrollable Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              accessibilityRole="button"
              accessibilityLabel={`Category ${cat.name}`}
              className="items-center mr-4.5 active:opacity-75"
              style={{ width: 68 }}
            >
              {/* Circular Icon Container */}
              <View
                className={`w-14 h-14 rounded-full items-center justify-center mb-1.5 border ${
                  isSelected
                    ? "border-[#0B3B2C] shadow-sm scale-105"
                    : "border-[#E5E2DB]"
                }`}
                style={{
                  backgroundColor: isSelected
                    ? "#0B3B2C"
                    : cat.bgColor || "#F1EEE6",
                }}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={22}
                  color={isSelected ? "#FFFFFF" : "#36433B"}
                />
              </View>

              {/* Category Label */}
              <Text
                numberOfLines={1}
                className="text-center text-xs text-[#1C1C17]"
                style={{
                  fontFamily: isSelected
                    ? "Inter_600SemiBold"
                    : "Inter_500Medium",
                  color: isSelected ? "#0B3B2C" : "#1C1C17",
                }}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
