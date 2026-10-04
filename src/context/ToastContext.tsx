import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export type ToastType = "success" | "error" | "info" | "warning" | "celebration";

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  icon?: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [translateY, opacity, scale]);

  const showToast = useCallback(
    (options: ToastOptions | string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const opts: ToastOptions =
        typeof options === "string"
          ? { title: options, type: "success" }
          : { type: "success", ...options };

      setToast(opts);

      // Reset animation values
      translateY.setValue(-120);
      opacity.setValue(0);
      scale.setValue(0.9);

      // Animate entry
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: Math.max(insets.top, 12) + 6,
          useNativeDriver: true,
          damping: 14,
          mass: 0.8,
          stiffness: 120,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
        }),
      ]).start();

      const duration = opts.duration ?? 3800;
      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    },
    [insets.top, translateY, opacity, scale, hideToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "success", title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "error", title, message, duration: 4500 });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "info", title, message });
    },
    [showToast]
  );

  // Swipe up to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(Math.max(insets.top, 12) + 6 + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -20 || gestureState.vy < -0.5) {
          hideToast();
        } else {
          Animated.spring(translateY, {
            toValue: Math.max(insets.top, 12) + 6,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Visual Theme Styling
  const getTheme = () => {
    switch (toast?.type) {
      case "error":
        return {
          bg: "#180909",
          border: "#7F1D1D",
          iconColor: "#F87171",
          iconName: "alert-circle-outline",
          accentGlow: "rgba(220, 38, 38, 0.2)",
        };
      case "warning":
        return {
          bg: "#1A1305",
          border: "#78350F",
          iconColor: "#FBBF24",
          iconName: "alert-outline",
          accentGlow: "rgba(245, 158, 11, 0.2)",
        };
      case "info":
        return {
          bg: "#0B1520",
          border: "#1E3A8A",
          iconColor: "#60A5FA",
          iconName: "information-outline",
          accentGlow: "rgba(59, 130, 246, 0.2)",
        };
      case "celebration":
        return {
          bg: "#071C14",
          border: "#D97706",
          iconColor: "#FBBF24",
          iconName: "party-popper",
          accentGlow: "rgba(251, 191, 36, 0.25)",
        };
      case "success":
      default:
        return {
          bg: "#061A13",
          border: "#14532D",
          iconColor: "#4ADE80",
          iconName: "check-circle-outline",
          accentGlow: "rgba(16, 185, 129, 0.2)",
        };
    }
  };

  const theme = getTheme();

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showInfo, hideToast }}
    >
      {children}

      {toast && (
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: "absolute",
            top: 0,
            left: 16,
            right: 16,
            zIndex: 99999,
            transform: [{ translateY }, { scale }],
            opacity,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Pressable
            onPress={hideToast}
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              borderWidth: 1.5,
              borderRadius: 20,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* Icon Bubble */}
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                backgroundColor: theme.accentGlow,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <MaterialCommunityIcons
                name={theme.iconName as any}
                size={22}
                color={theme.iconColor}
              />
            </View>

            {/* Content Text */}
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14.5,
                  fontFamily: "HankenGrotesk_700Bold",
                  letterSpacing: -0.2,
                  marginBottom: toast.message ? 2 : 0,
                }}
                numberOfLines={2}
              >
                {toast.title}
              </Text>
              {toast.message ? (
                <Text
                  style={{
                    color: "rgba(226, 232, 240, 0.85)",
                    fontSize: 12.5,
                    fontFamily: "Inter_400Regular",
                    lineHeight: 17,
                  }}
                  numberOfLines={3}
                >
                  {toast.message}
                </Text>
              ) : null}
            </View>

            {/* Close Cross */}
            <Pressable
              onPress={hideToast}
              hitSlop={10}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="x" size={13} color="#94A3B8" />
            </Pressable>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
