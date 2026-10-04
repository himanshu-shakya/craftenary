import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export type TabId = "home" | "explore" | "bookings" | "feed" | "profile";

export interface BottomNavigationBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();

  const tabs: {
    id: TabId;
    label: string;
    icon: any;
    iconFamily: "Feather" | "MaterialCommunityIcons";
  }[] = [
    { id: "home", label: "Home", icon: "home", iconFamily: "Feather" },
    { id: "explore", label: "Explore", icon: "compass", iconFamily: "Feather" },
    { id: "bookings", label: "Bookings", icon: "calendar", iconFamily: "Feather" },
    { id: "feed", label: "Feed", icon: "cards-outline", iconFamily: "MaterialCommunityIcons" },
    { id: "profile", label: "Profile", icon: "user", iconFamily: "Feather" },
  ];

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 10),
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "rgba(193, 200, 194, 0.35)",
      }}
      className="pt-2 px-3 flex-row items-center justify-around shadow-sm"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = isActive ? "#0B3B2C" : "#8D9690";

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            hitSlop={8}
            className="items-center py-1 flex-1 active:opacity-75"
          >
            {tab.iconFamily === "Feather" ? (
              <Feather name={tab.icon} size={20} color={color} />
            ) : (
              <MaterialCommunityIcons name={tab.icon} size={21} color={color} />
            )}
            <Text
              className="text-[10px] mt-1"
              style={{
                fontFamily: isActive ? "Inter_600SemiBold" : "Inter_400Regular",
                color,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
