import React, { useState } from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FloatingLabelInput, FloatingLabelInputProps } from "./FloatingLabelInput";

export interface PasswordInputProps
  extends Omit<FloatingLabelInputProps, "rightElement" | "secureTextEntry"> {
  isVisible?: boolean;
  onToggleVisibility?: (visible: boolean) => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = "Password",
  value,
  onChangeText,
  error,
  isVisible: controlledVisible,
  onToggleVisibility,
  ...rest
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const isPasswordVisible =
    controlledVisible !== undefined ? controlledVisible : internalVisible;

  const toggleVisibility = () => {
    const nextState = !isPasswordVisible;
    if (onToggleVisibility) {
      onToggleVisibility(nextState);
    } else {
      setInternalVisible(nextState);
    }
  };

  return (
    <FloatingLabelInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      error={error}
      secureTextEntry={!isPasswordVisible}
      autoCapitalize="none"
      autoCorrect={false}
      rightElement={
        <Pressable
          onPress={toggleVisibility}
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
          hitSlop={12}
          className="w-10 h-10 items-center justify-center -mr-2"
        >
          <Ionicons
            name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
            size={22}
            color="#3F4943"
          />
        </Pressable>
      }
      {...rest}
    />
  );
};
