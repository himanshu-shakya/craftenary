import React, { useState } from "react";
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface FloatingLabelInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  rightElement?: React.ReactNode;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  containerStyle,
  inputStyle,
  rightElement,
  onFocus,
  onBlur,
  secureTextEntry,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus: TextInputProps["onFocus"] = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: TextInputProps["onBlur"] = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View className="w-full mb-3.5" style={containerStyle}>
      {label ? (
        <Text
          className="text-xs text-[#525B54] uppercase mb-1.5 font-bold"
          style={{ fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 }}
        >
          {label}
        </Text>
      ) : null}

      <View
        className="h-12 relative justify-center px-3.5 rounded-xl bg-white"
        style={{
          borderWidth: 1.5,
          borderColor: error ? "#DC2626" : isFocused ? "#0B3B2C" : "#E5E2DB",
        }}
      >
        <View className="flex-row items-center">
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry}
            placeholder={placeholder}
            placeholderTextColor="#949C96"
            className="flex-1 text-[#1C1C17] text-sm py-0"
            style={[
              {
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: "#1C1C17",
                paddingVertical: 0,
              },
              inputStyle,
            ]}
            selectionColor="#0B3B2C"
            {...rest}
          />
          {rightElement && (
            <View className="justify-center items-center ml-2">
              {rightElement}
            </View>
          )}
        </View>
      </View>
      {error ? (
        <Text
          style={{
            color: "#DC2626",
            fontSize: 11.5,
            marginTop: 4,
            marginLeft: 2,
            fontFamily: "Inter_500Medium",
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

