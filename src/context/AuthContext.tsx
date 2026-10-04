import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import { authService } from "../services/auth/authService";
import { AuthResponse, AuthStatus, SignUpResult, UserProfile } from "../types/auth";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  status: AuthStatus;
  isRecoveryFlow: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<SignUpResult>;
  resendVerificationEmail: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  clearRecoveryFlow: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("INITIALIZING");
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

  const isLoading = status === "INITIALIZING";

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const userProfile = await authService.getProfile(userId);
      setProfile(userProfile);
    } catch {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // Handle password recovery deep links (e.g. craftenary://reset-password#access_token=...&type=recovery)
  const handleDeepLink = useCallback(async (url: string) => {
    if (!url) return;
    if (__DEV__) console.log("[Auth] Handling deep link:", url);

    try {
      if (url.includes("reset-password") || url.includes("type=recovery")) {
        setIsRecoveryFlow(true);
      }

      if (url.includes("#")) {
        const hash = url.split("#")[1];
        const searchParams = new URLSearchParams(hash);
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const type = searchParams.get("type");

        if (type === "recovery") {
          setIsRecoveryFlow(true);
        }

        if (accessToken && refreshToken) {
          const { data } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            setStatus("AUTHENTICATED");
            await fetchProfile(data.session.user.id);
          }
        }
      }
    } catch (err) {
      if (__DEV__) console.error("[Auth] Deep link processing error:", err);
    }
  }, [fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (__DEV__) console.log("[Auth] Initializing session from AsyncStorage");
        const initialSession = await authService.getCurrentSession();

        if (isMounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user.id);
            setStatus("AUTHENTICATED");
          } else {
            setSession(null);
            setUser(null);
            setStatus("UNAUTHENTICATED");
          }
        }
      } catch (err) {
        if (__DEV__) console.error("[Auth] Session initialization error:", err);
        if (isMounted) {
          setStatus("UNAUTHENTICATED");
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes from Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (__DEV__) console.log("[Auth] onAuthStateChange event:", event);

      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryFlow(true);
      }

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await fetchProfile(newSession.user.id);
        setStatus("AUTHENTICATED");
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setStatus("UNAUTHENTICATED");
      }
    });

    // Handle deep link on cold start
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for deep links while app is open
    const linkingSubscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [fetchProfile, handleDeepLink]);

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const res = await authService.signInWithEmail(email, password);
    if (res.success && res.session) {
      setSession(res.session);
      setUser(res.user || null);
      if (res.user?.id) {
        await fetchProfile(res.user.id);
      }
      setStatus("AUTHENTICATED");
    }
    return res;
  };

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<SignUpResult> => {
    const res = await authService.signUpWithEmail(email, password, firstName, lastName);
    if (res.success && res.session) {
      setSession(res.session);
      setUser(res.user || null);
      if (res.user?.id) {
        await fetchProfile(res.user.id);
      }
      setStatus("AUTHENTICATED");
    }
    return res;
  };

  const resendVerificationEmail = async (email: string) => {
    return await authService.resendVerificationEmail(email);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsRecoveryFlow(false);
    setStatus("UNAUTHENTICATED");
  };

  const signInWithGoogle = async () => {
    const res = await authService.signInWithGoogle();
    if (res.success && res.session) {
      setSession(res.session);
      setUser(res.user || null);
      if (res.user?.id) {
        await fetchProfile(res.user.id);
      }
      setStatus("AUTHENTICATED");
    }
    return res;
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const updatePassword = async (password: string) => {
    const res = await authService.updatePassword(password);
    if (res.success) {
      setIsRecoveryFlow(false);
    }
    return res;
  };

  const clearRecoveryFlow = () => {
    setIsRecoveryFlow(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        status,
        isRecoveryFlow,
        signIn,
        signUp,
        signInWithGoogle,
        resendVerificationEmail,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
        setProfile,
        clearRecoveryFlow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
