import "./global.css";
import React, { useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AuthProvider, useAuth } from "./src/hooks/useAuth";
import { ToastProvider } from "./src/context/ToastContext";
import { LoginScreen } from "./screens/LoginScreen";
import { SignupScreen } from "./screens/SignupScreen";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./screens/ResetPasswordScreen";
import { BottomNavigationBar, TabId } from "./components/home/BottomNavigationBar";

// Onboarding Screens
import { RoleSelectionScreen } from "./screens/onboarding/RoleSelectionScreen";
import { ArtisanOnboardingScreen } from "./screens/onboarding/ArtisanOnboardingScreen";
import { TouristOnboardingScreen } from "./screens/onboarding/TouristOnboardingScreen";

// Artisan Screens
import { ArtisanDashboardScreen } from "./screens/artisan/ArtisanDashboardScreen";
import { CreateWorkshopScreen } from "./screens/artisan/CreateWorkshopScreen";
import { MyWorkshopsScreen } from "./screens/artisan/MyWorkshopsScreen";
import { ArtisanProfileScreen } from "./screens/artisan/ArtisanProfileScreen";
import { EditArtisanProfileScreen } from "./screens/artisan/EditArtisanProfileScreen";

// Tourist Screens
import { TouristDashboardScreen } from "./screens/tourist/TouristDashboardScreen";
import { WorkshopDetailsScreen } from "./screens/tourist/WorkshopDetailsScreen";
import { BookingScreen } from "./screens/tourist/BookingScreen";
import { TouristProfileScreen } from "./screens/tourist/TouristProfileScreen";
import { EditTouristProfileScreen } from "./screens/tourist/EditTouristProfileScreen";

import { UserRole } from "./src/types/auth";
import { Workshop } from "./src/types/workshop";

type UnauthScreen = "login" | "signup" | "forgot_password" | "reset_password";
type OnboardingScreen = "role_selection" | "artisan_onboarding" | "tourist_onboarding";
type ArtisanScreen = "dashboard" | "create_workshop" | "my_workshops" | "profile" | "edit_profile";
type TouristScreen = "dashboard" | "workshop_details" | "booking" | "profile" | "edit_profile";

function AppNavigation() {
  const { status, isLoading, isRecoveryFlow, profile, signOut } = useAuth();

  // Navigation State
  const [unauthScreen, setUnauthScreen] = useState<UnauthScreen>("login");
  const [onboardingScreen, setOnboardingScreen] = useState<OnboardingScreen>("role_selection");
  const [artisanScreen, setArtisanScreen] = useState<ArtisanScreen>("dashboard");
  const [touristScreen, setTouristScreen] = useState<TouristScreen>("dashboard");

  // Shared state between screens
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  // 1. Loading Splash State
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FAF8F2] items-center justify-center">
        <StatusBar style="dark" />
        <View
          className="w-14 h-14 rounded-full items-center justify-center mb-4 shadow-sm"
          style={{ backgroundColor: "#0B3B2C" }}
        >
          <MaterialCommunityIcons
            name="flower-tulip-outline"
            size={28}
            color="#D1E7DD"
          />
        </View>
        <Text
          className="text-xl text-[#1C1C17] font-bold mb-4 tracking-tight"
          style={{ fontFamily: "HankenGrotesk_700Bold" }}
        >
          Craftenary
        </Text>
        <ActivityIndicator color="#0B3B2C" size="small" />
      </View>
    );
  }

  // 2. Password Recovery Flow via Deep Link
  if (isRecoveryFlow) {
    return <ResetPasswordScreen onSuccess={() => setUnauthScreen("login")} />;
  }

  // 3. Authenticated App Flow
  if (status === "AUTHENTICATED") {
    // 3A. Incomplete Onboarding Flow (or new signup)
    if (!profile || !profile.onboarding_completed) {
      if (onboardingScreen === "artisan_onboarding") {
        return (
          <ArtisanOnboardingScreen
            onBackToRoleSelection={() => setOnboardingScreen("role_selection")}
            onOnboardingComplete={() => {
              setArtisanScreen("dashboard");
            }}
          />
        );
      }

      if (onboardingScreen === "tourist_onboarding") {
        return (
          <TouristOnboardingScreen
            onBackToRoleSelection={() => setOnboardingScreen("role_selection")}
            onOnboardingComplete={() => {
              setTouristScreen("dashboard");
            }}
          />
        );
      }

      return (
        <RoleSelectionScreen
          onSelectRole={(role: UserRole) => {
            if (role === "artisan") {
              setOnboardingScreen("artisan_onboarding");
            } else {
              setOnboardingScreen("tourist_onboarding");
            }
          }}
          onSignOut={signOut}
        />
      );
    }

    let activeTab: TabId = "home";
    let AuthenticatedScreen: React.ReactNode = null;

    // 3B. Artisan Flow
    if (profile.role === "artisan") {
      if (artisanScreen === "profile" || artisanScreen === "edit_profile") activeTab = "profile";
      
      switch (artisanScreen) {
        case "create_workshop":
          AuthenticatedScreen = (
            <CreateWorkshopScreen
              onBack={() => setArtisanScreen("dashboard")}
              onWorkshopCreated={() => setArtisanScreen("my_workshops")}
            />
          );
          break;
        case "my_workshops":
          AuthenticatedScreen = (
            <MyWorkshopsScreen
              onBack={() => setArtisanScreen("dashboard")}
              onCreateNew={() => setArtisanScreen("create_workshop")}
            />
          );
          break;
        case "edit_profile":
          AuthenticatedScreen = (
            <EditArtisanProfileScreen
              onBack={() => setArtisanScreen("profile")}
              onProfileUpdated={() => setArtisanScreen("profile")}
            />
          );
          break;
        case "profile":
          AuthenticatedScreen = (
            <ArtisanProfileScreen
              onBack={() => setArtisanScreen("dashboard")}
              onEditProfile={() => setArtisanScreen("edit_profile")}
              onManageWorkshops={() => setArtisanScreen("my_workshops")}
            />
          );
          break;
        case "dashboard":
        default:
          AuthenticatedScreen = (
            <ArtisanDashboardScreen
              onCreateWorkshop={() => setArtisanScreen("create_workshop")}
              onViewMyWorkshops={() => setArtisanScreen("my_workshops")}
              onViewProfile={() => setArtisanScreen("profile")}
            />
          );
          break;
      }
    } else {
      // 3C. Tourist Flow
      if (touristScreen === "profile" || touristScreen === "edit_profile") activeTab = "profile";
      
      switch (touristScreen) {
        case "workshop_details":
          if (!selectedWorkshop) {
            setTouristScreen("dashboard");
            AuthenticatedScreen = null;
          } else {
            AuthenticatedScreen = (
              <WorkshopDetailsScreen
                workshop={selectedWorkshop}
                onBack={() => setTouristScreen("dashboard")}
                onBookNow={(w) => {
                  setSelectedWorkshop(w);
                  setTouristScreen("booking");
                }}
              />
            );
          }
          break;
        case "booking":
          if (!selectedWorkshop) {
            setTouristScreen("dashboard");
            AuthenticatedScreen = null;
          } else {
            AuthenticatedScreen = (
              <BookingScreen
                workshop={selectedWorkshop}
                onBack={() => setTouristScreen("workshop_details")}
                onBookingSuccess={() => setTouristScreen("profile")}
              />
            );
          }
          break;
        case "edit_profile":
          AuthenticatedScreen = (
            <EditTouristProfileScreen
              onBack={() => setTouristScreen("profile")}
              onProfileUpdated={() => setTouristScreen("profile")}
            />
          );
          break;
        case "profile":
          AuthenticatedScreen = (
            <TouristProfileScreen
              onBack={() => setTouristScreen("dashboard")}
              onEditProfile={() => setTouristScreen("edit_profile")}
              onExploreWorkshops={() => setTouristScreen("dashboard")}
            />
          );
          break;
        case "dashboard":
        default:
          AuthenticatedScreen = (
            <TouristDashboardScreen
              onSelectWorkshop={(w) => {
                setSelectedWorkshop(w);
                setTouristScreen("workshop_details");
              }}
              onOpenProfile={() => setTouristScreen("profile")}
              onOpenBookings={() => setTouristScreen("profile")}
            />
          );
          break;
      }
    }

    const handleTabPress = (tab: TabId) => {
      if (profile.role === "artisan") {
        if (tab === "profile") setArtisanScreen("profile");
        else setArtisanScreen("dashboard");
      } else {
        if (tab === "profile") setTouristScreen("profile");
        else setTouristScreen("dashboard");
      }
    };

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {AuthenticatedScreen}
        </View>
        <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabPress} />
      </View>
    );
  }

  // 4. Unauthenticated Auth Screens
  switch (unauthScreen) {
    case "signup":
      return <SignupScreen onNavigateLogin={() => setUnauthScreen("login")} />;
    case "forgot_password":
      return (
        <ForgotPasswordScreen
          onNavigateLogin={() => setUnauthScreen("login")}
        />
      );
    case "reset_password":
      return (
        <ResetPasswordScreen onSuccess={() => setUnauthScreen("login")} />
      );
    case "login":
    default:
      return (
        <LoginScreen
          onNavigateSignUp={() => setUnauthScreen("signup")}
          onNavigateForgotPassword={() => setUnauthScreen("forgot_password")}
        />
      );
  }
}

import { BottomSheetModalProvider } from "./components/common/BottomSheet";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <BottomSheetModalProvider>
            <AppNavigation />
          </BottomSheetModalProvider>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
