import React, { useState } from "react";
import { Image, View } from "react-native";
import { InitialsAvatar } from "./InitialsAvatar";
import { VerifiedBadge } from "./VerifiedBadge";

export interface AvatarProps {
  imageUrl?: string | null;
  name?: string;
  size?: number;
  isVerified?: boolean;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  name = "User",
  size = 44,
  isVerified = false,
  backgroundColor = "#0B3B2C",
}) => {
  const [hasError, setHasError] = useState(false);

  const shouldRenderImage = !!imageUrl && !hasError;
  const badgeSize = Math.max(12, Math.floor(size * 0.35));

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      {shouldRenderImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#E9E7DF",
          }}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <InitialsAvatar
          name={name}
          size={size}
          backgroundColor={backgroundColor}
        />
      )}

      {isVerified && (
        <View
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            borderWidth: 2,
            borderColor: "#FAF8F2",
            borderRadius: badgeSize,
          }}
        >
          <VerifiedBadge size={badgeSize} />
        </View>
      )}
    </View>
  );
};
