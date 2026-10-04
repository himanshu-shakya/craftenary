import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "../common/BottomSheet";
import { Story } from "../../src/types/home";
import { Button } from "../Button";

export interface StoryDetailModalProps {
  story: Story | null;
  onClose: () => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  onClose,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["82%"], []);

  useEffect(() => {
    if (story) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [story]);

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

  if (!story) return null;

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
              className="text-lg text-[#1C1C17]"
              style={{ fontFamily: "HankenGrotesk_700Bold" }}
            >
              Heritage Story
            </Text>
            <Text
              className="text-xs text-[#717973] mt-0.5"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              By {story.author} • {story.readTime || "5 min read"}
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
          {/* Story Image */}
          <View className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-black">
            <Image
              source={story.image}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Story Title */}
          <Text
            className="text-xl text-[#1C1C17] mb-3 leading-7"
            style={{ fontFamily: "HankenGrotesk_700Bold" }}
          >
            {story.title}
          </Text>

          {/* Story Content */}
          <Text
            className="text-sm text-[#414844] leading-relaxed mb-4"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {story.summary ||
              "Traditional Indian crafts are not merely objects; they are living testaments to cultural memory, handed down from guru to shishya across generations."}
          </Text>

          <Text
            className="text-sm text-[#414844] leading-relaxed mb-6"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            Each motif carries philosophical and environmental significance—from the tree of life symbolizing interconnected harmony to the intricate geometric symmetries echoing sacred temple architecture.
          </Text>

          {/* Close Button */}
          <Button
            title="Close Story"
            variant="primary"
            size="md"
            style={{ marginBottom: 24 }}
            onPress={() => bottomSheetModalRef.current?.dismiss()}
          />
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
};
