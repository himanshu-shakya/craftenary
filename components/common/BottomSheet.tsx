import React, {
  createContext,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// 1. BottomSheetModalProvider Context
const BottomSheetContext = createContext<null>(null);

export const BottomSheetModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <BottomSheetContext.Provider value={null}>
      {children}
    </BottomSheetContext.Provider>
  );
};

// 2. Backdrop Component
export interface BottomSheetBackdropProps {
  disappearsOnIndex?: number;
  appearsOnIndex?: number;
  opacity?: number;
  pressBehavior?: "close" | "none";
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BottomSheetBackdrop: React.FC<BottomSheetBackdropProps> = ({
  opacity = 0.5,
  pressBehavior = "close",
  onPress,
  style,
}) => {
  return (
    <TouchableWithoutFeedback
      onPress={pressBehavior === "close" ? onPress : undefined}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "#000000",
            opacity,
          },
          style,
        ]}
      />
    </TouchableWithoutFeedback>
  );
};

// 3. View & ScrollView Components
export const BottomSheetView: React.FC<ViewProps> = ({ style, ...props }) => {
  return <View style={style} {...props} />;
};

export const BottomSheetScrollView: React.FC<ScrollViewProps> = ({
  style,
  contentContainerStyle,
  ...props
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
      style={style}
      contentContainerStyle={contentContainerStyle}
      {...props}
    />
  );
};

// 4. Modal Interface & Component
export interface BottomSheetModal {
  present: () => void;
  dismiss: () => void;
}

export interface BottomSheetModalProps {
  snapPoints?: (string | number)[];
  backdropComponent?: React.FC<any>;
  backgroundStyle?: StyleProp<ViewStyle>;
  handleIndicatorStyle?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
  children: React.ReactNode;
}

export const BottomSheetModal = forwardRef<BottomSheetModal, BottomSheetModalProps>(
  (
    {
      snapPoints = ["50%"],
      backdropComponent: BackdropComponent,
      backgroundStyle,
      handleIndicatorStyle,
      onDismiss,
      children,
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);

    // Calculate height from snap point
    const primarySnap = snapPoints[snapPoints.length - 1];
    let sheetHeight = SCREEN_HEIGHT * 0.5;
    if (typeof primarySnap === "string" && primarySnap.endsWith("%")) {
      const pct = parseFloat(primarySnap) / 100;
      sheetHeight = SCREEN_HEIGHT * pct;
    } else if (typeof primarySnap === "number") {
      sheetHeight = primarySnap;
    }

    const translateY = useRef(new Animated.Value(sheetHeight)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const present = useCallback(() => {
      setVisible(true);
      translateY.setValue(sheetHeight);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 24,
          stiffness: 220,
          mass: 0.8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, [sheetHeight, translateY, backdropOpacity]);

    const dismiss = useCallback(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetHeight,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        onDismiss?.();
      });
    }, [sheetHeight, translateY, backdropOpacity, onDismiss]);

    useImperativeHandle(
      ref,
      () => ({
        present,
        dismiss,
      }),
      [present, dismiss]
    );

    // PanResponder for dragging down to dismiss
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 4,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120 || gestureState.vy > 0.6) {
            dismiss();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 24,
              stiffness: 220,
            }).start();
          }
        },
      })
    ).current;

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={dismiss}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: backdropOpacity,
              },
            ]}
          >
            {BackdropComponent ? (
              <BackdropComponent onPress={dismiss} />
            ) : (
              <BottomSheetBackdrop onPress={dismiss} />
            )}
          </Animated.View>

          {/* Bottom Sheet Animated Container */}
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                height: sheetHeight,
                transform: [{ translateY }],
              },
              backgroundStyle,
            ]}
          >
            {/* Drag Handle Bar */}
            <View {...panResponder.panHandlers} style={styles.handleArea}>
              <View style={[styles.handleIndicator, handleIndicatorStyle]} />
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>{children}</View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

BottomSheetModal.displayName = "BottomSheetModal";

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    width: "100%",
    backgroundColor: "#FAF8F2",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  handleArea: {
    width: "100%",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 8,
  },
  handleIndicator: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: "#C1C8C2",
  },
  contentContainer: {
    flex: 1,
  },
});
