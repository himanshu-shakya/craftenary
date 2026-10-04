import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useAuth } from "../../src/hooks/useAuth";
import { useArtisanProfile } from "../../src/hooks/useArtisanProfile";
import { useWorkshops } from "../../src/hooks/useWorkshops";
import { PriceDisplay } from "../../components/common/PriceDisplay";
import { RatingDisplay } from "../../components/common/RatingDisplay";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "../../components/Button";
import { Workshop } from "../../src/types/workshop";
import { useToast } from "../../src/context/ToastContext";

export interface MyWorkshopsScreenProps {
  onBack: () => void;
  onCreateNew: () => void;
}

export const MyWorkshopsScreen: React.FC<MyWorkshopsScreenProps> = ({
  onBack,
  onCreateNew,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile: artisan } = useArtisanProfile(user?.id);
  const { showToast } = useToast();
  const { workshops, isLoading, deleteWorkshop, refetch } = useWorkshops(
    artisan?.id ? { artisanId: artisan.id } : user?.id ? { artisanId: user.id } : undefined
  );

  const handleDelete = (workshop: Workshop) => {
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to remove "${workshop.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteWorkshop(workshop.id);
            showToast({
              type: "info",
              title: "Listing Removed",
              message: `"${workshop.name}" has been deleted.`,
            });
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#FAF8F2]">
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 14),
          backgroundColor: "#FAF8F2",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(193, 200, 194, 0.4)",
        }}
        className="px-5 pb-3 flex-row items-center justify-between"
      >
        <Pressable
          onPress={onBack}
          hitSlop={10}
          className="w-9 h-9 rounded-full bg-[#E9E7DF] items-center justify-center -ml-1"
        >
          <Feather name="arrow-left" size={20} color="#1C1C17" />
        </Pressable>

        <Text
          className="text-base text-[#1C1C17]"
          style={{ fontFamily: "HankenGrotesk_700Bold" }}
        >
          My Workshop Listings
        </Text>

        <Pressable
          onPress={onCreateNew}
          hitSlop={10}
          className="w-9 h-9 rounded-full bg-[#904D00] active:bg-[#733D00] items-center justify-center"
        >
          <Feather name="plus" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B3B2C" size="large" />
        </View>
      ) : workshops.length === 0 ? (
        <EmptyState
          iconName="storefront-outline"
          iconFamily="MaterialCommunityIcons"
          title="No Listings Found"
          description="You have not published any workshop listings yet. Tap the + button to create one."
          actionTitle="+ Create New Workshop"
          onActionPress={onCreateNew}
        />
      ) : (
        <FlatList
          data={workshops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: Math.max(insets.bottom, 24) + 20,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }) => {
            const coverImage =
              item.images && item.images.length > 0
                ? item.images[0].image_url
                : "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800";

            return (
              <View className="bg-white rounded-2xl mb-4 border border-[#E5E2DB] shadow-xs overflow-hidden">
                <View className="w-full h-36 relative bg-black/10">
                  <Image
                    source={{ uri: coverImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute top-2.5 right-2.5 bg-black/50 px-2.5 py-1 rounded-full">
                    <Text className="text-white text-[11px] font-semibold">
                      {item.craft?.name || "Craft"}
                    </Text>
                  </View>
                </View>

                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      numberOfLines={1}
                      className="text-base text-[#1C1C17] flex-1 mr-2"
                      style={{ fontFamily: "HankenGrotesk_700Bold" }}
                    >
                      {item.name}
                    </Text>
                    <RatingDisplay rating={item.rating || 5.0} />
                  </View>

                  <Text
                    numberOfLines={2}
                    className="text-xs text-[#717973] leading-4.5 mb-3"
                    style={{ fontFamily: "Inter_400Regular" }}
                  >
                    {item.description}
                  </Text>

                  <View className="flex-row items-center justify-between pt-2 border-t border-[#F1EEE6]">
                    <PriceDisplay price={item.price} size="sm" />

                    <Button
                      title="Delete"
                      variant="danger"
                      size="sm"
                      fullWidth={false}
                      leftIcon={<Feather name="trash-2" size={13} color="#FFFFFF" />}
                      onPress={() => handleDelete(item)}
                    />
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};
