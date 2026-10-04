import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outlineTerracotta"
  | "danger"
  | "darkGreen"
  | "terracotta";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  isLoading?: boolean; // Backward-compatible alias
  loadingTitle?: string;
  disabledTitle?: string;
  leftIcon?: React.ReactNode;
  icon?: React.ReactNode; // Backward-compatible alias
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "tab" | "link";
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
}

interface VariantStyleConfig {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  spinnerColor: string;
  shadowColor: string;
}

export const getVariantStyles = ({
  variant = "primary",
  disabled = false,
  pressed = false,
}: {
  variant?: ButtonVariant;
  disabled?: boolean;
  pressed?: boolean;
}): VariantStyleConfig => {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: disabled
          ? "#F3F1EC"
          : pressed
          ? "#E8E4DA"
          : "#FAF8F2",
        borderColor: "#C1C8C2",
        borderWidth: 1,
        textColor: disabled ? "#949C96" : "#1C1C17",
        spinnerColor: "#1C1C17",
        shadowColor: "#1C1C17",
      };

    case "outline":
    case "outlineTerracotta":
      return {
        backgroundColor: disabled
          ? "#F3F1EC"
          : pressed
          ? "#FAF0E8"
          : "#FFFFFF",
        borderColor: disabled ? "#E8B085" : "#012D1D",
        borderWidth: 1.5,
        textColor: disabled ? "#949C96" : "#012D1D",
        spinnerColor: "#012D1D",
        shadowColor: "#012D1D",
      };

    case "danger":
      return {
        backgroundColor: disabled
          ? "#FCA5A5"
          : pressed
          ? "#B91C1C"
          : "#DC2626",
        borderColor: "transparent",
        borderWidth: 0,
        textColor: "#FFFFFF",
        spinnerColor: "#FFFFFF",
        shadowColor: "#DC2626",
      };

    case "darkGreen":
      return {
        backgroundColor: disabled
          ? "#7A968D"
          : pressed
          ? "#07261C"
          : "#0B3B2C",
        borderColor: "transparent",
        borderWidth: 0,
        textColor: "#FFFFFF",
        spinnerColor: "#FFFFFF",
        shadowColor: "#0B3B2C",
      };

    case "terracotta":
      return {
        backgroundColor: disabled
          ? "#E8B085"
          : pressed
          ? "#B8560B"
          : "#D96B16",
        borderColor: "transparent",
        borderWidth: 0,
        textColor: "#FFFFFF",
        spinnerColor: "#FFFFFF",
        shadowColor: "#D96B16",
      };

    case "primary":
    default:
      return {
        backgroundColor: disabled
          ? "#6C877D"
          : pressed
          ? "#1B4332"
          : "#012D1D", // Brand Primary Forest Green
        borderColor: "transparent",
        borderWidth: 0,
        textColor: "#FFFFFF",
        spinnerColor: "#FFFFFF",
        shadowColor: "#012D1D",
      };
  }
};

export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  onPress,
  variant = "primary",
  size = "lg",
  disabled = false,
  loading,
  isLoading,
  loadingTitle,
  disabledTitle,
  leftIcon,
  icon,
  rightIcon,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityRole = "button",
  hitSlop,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const isButtonLoading = Boolean(loading || isLoading);
  const isButtonDisabled = Boolean(disabled || isButtonLoading);
  const effectiveLeftIcon = leftIcon || icon;

  // Determine display text for state
  const displayText = isButtonLoading
    ? loadingTitle || "Please wait..."
    : disabled && disabledTitle
    ? disabledTitle
    : title;

  const isOutline = variant === "outline" || variant === "outlineTerracotta";

  const variantStyles = getVariantStyles({
    variant,
    disabled: isButtonDisabled,
    pressed: isPressed && !isButtonDisabled,
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={isButtonDisabled}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: isButtonDisabled, busy: isButtonLoading }}
      accessibilityLabel={accessibilityLabel || (typeof title === "string" ? title : undefined)}
      hitSlop={hitSlop}
      style={[
        styles.baseButton,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth,
          shadowColor: variantStyles.shadowColor,
          shadowOffset: { width: 0, height: isPressed ? 1 : 3 },
          shadowOpacity: isButtonDisabled || isOutline ? 0 : isPressed ? 0.2 : 0.28,
          shadowRadius: isPressed ? 2 : 5,
          elevation: isButtonDisabled || isOutline ? 0 : isPressed ? 1 : 3,
          transform: [{ scale: isPressed && !isButtonDisabled ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        {isButtonLoading ? (
          <ActivityIndicator
            color={variantStyles.spinnerColor}
            size="small"
            style={styles.spinner}
          />
        ) : effectiveLeftIcon ? (
          <View style={styles.leftIconContainer}>{effectiveLeftIcon}</View>
        ) : null}

        {displayText ? (
          <Text
            style={[
              styles.baseText,
              sizeTextStyles[size],
              {
                color: variantStyles.textColor,
              },
              textStyle,
            ]}
          >
            {displayText}
          </Text>
        ) : (
          children
        )}

        {!isButtonLoading && rightIcon ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fullWidth: {
    width: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  baseText: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  spinner: {
    marginRight: 8,
  },
  leftIconContainer: {
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIconContainer: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  md: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  lg: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
});

const sizeTextStyles = StyleSheet.create({
  sm: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  md: {
    fontSize: 14,
    lineHeight: 18,
  },
  lg: {
    fontSize: 15,
    lineHeight: 20,
  },
});
