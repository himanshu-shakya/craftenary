import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { AuthResponse, SignUpInput, SignUpResult, UserProfile } from "../../types/auth";

class AuthService {
  /**
   * Helper to format user-facing error messages
   */
  private formatError(error: AuthError | Error | unknown): string {
    if (!error) return "An unexpected error occurred.";
    if (__DEV__) {
      console.error("[Auth] Supabase auth error details:", error);
    }
    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes("Invalid login credentials") ||
      message.includes("invalid_credentials") ||
      message.includes("invalid_grant")
    ) {
      return "Invalid email or password.";
    }

    if (message.includes("Email not confirmed") || message.includes("email_not_confirmed")) {
      return "Please verify your email before logging in.";
    }

    if (
      message.includes("User already registered") ||
      message.includes("already exists") ||
      message.includes("email_exists") ||
      message.includes("user_already_exists")
    ) {
      return "An account with this email already exists. Please log in instead.";
    }

    if (
      message.includes("Password should be at least") ||
      message.includes("weak_password")
    ) {
      return "Password must contain at least 8 characters.";
    }

    if (
      message.includes("Network request failed") ||
      message.includes("Failed to fetch") ||
      message.includes("network error")
    ) {
      return "Unable to connect. Please check your internet connection.";
    }

    if (
      message.includes("rate limit") ||
      message.includes("over_email_send_rate_limit") ||
      message.includes("For security purposes") ||
      message.includes("too many requests")
    ) {
      return "Too many attempts. Please wait a moment before trying again.";
    }

    // Return the actual Supabase error message if available and clean, otherwise a fallback
    if (message && !message.includes("[object Object]")) {
      return message;
    }

    return "Unable to complete request. Please try again.";
  }

  /**
   * Sign in with Email and Password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return {
        success: false,
        error: "Please enter both email and password.",
      };
    }

    try {
      if (__DEV__) console.log("[Auth] Signing in with email:", cleanEmail);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return {
          success: false,
          error: this.formatError(error),
        };
      }

      if (__DEV__) console.log("[Auth] User signed in successfully:", data.user?.id);

      return {
        success: true,
        user: data.user || undefined,
        session: data.session,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: this.formatError(err),
      };
    }
  }

  /**
   * Sign in with Google using OAuth
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      if (__DEV__) console.log("[Auth] Initiating Google Sign-In");
      
      const redirectUrl = Linking.createURL("auth/callback", {
        scheme: "craftenary",
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return { success: false, error: this.formatError(error) };
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === "success" && result.url) {
          const hash = result.url.split("#")[1];
          if (hash) {
            const searchParams = new URLSearchParams(hash);
            const accessToken = searchParams.get("access_token");
            const refreshToken = searchParams.get("refresh_token");

            if (accessToken && refreshToken) {
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (sessionError) {
                 return { success: false, error: this.formatError(sessionError) };
              }

              // Also ensure a profile exists for new OAuth users
              if (sessionData.user) {
                try {
                  const fullName = sessionData.user.user_metadata?.full_name || sessionData.user.email?.split("@")[0];
                  await supabase.from("profiles").upsert({
                    id: sessionData.user.id,
                    full_name: fullName,
                    role: "tourist", // default
                    onboarding_completed: false,
                    updated_at: new Date().toISOString(),
                  }, { onConflict: 'id' });
                } catch (e) {
                  // ignore
                }
              }

              return {
                success: true,
                user: sessionData.user || undefined,
                session: sessionData.session,
              };
            }
          }
        }
      }

      return { success: false, error: "Authentication was canceled." };
    } catch (err: unknown) {
      return {
        success: false,
        error: this.formatError(err),
      };
    }
  }

  /**
   * Sign up with Email, Password, First Name, and Last Name
   */
  async signUpWithEmail(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<SignUpResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = (firstName || "").trim();
    const cleanLastName = (lastName || "").trim();
    const cleanFullName = `${cleanFirstName} ${cleanLastName}`.trim() || cleanFirstName || cleanLastName;

    if (!cleanEmail || !password) {
      return {
        success: false,
        needsEmailVerification: false,
        error: "Please provide an email and password.",
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        needsEmailVerification: false,
        error: "Password must contain at least 8 characters.",
      };
    }

    try {
      if (__DEV__) console.log("[Auth] Signing up user:", cleanEmail);

      const redirectUrl = Linking.createURL("auth/callback", {
        scheme: "craftenary",
      });

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            full_name: cleanFullName,
            role: "tourist",
          },
        },
      });

      if (error) {
        return {
          success: false,
          needsEmailVerification: false,
          error: this.formatError(error),
        };
      }

      // If user & session created immediately, create initial profile row
      if (data.user) {
        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: cleanFullName || cleanEmail.split("@")[0],
            role: "tourist",
            onboarding_completed: false,
            updated_at: new Date().toISOString(),
          });
        } catch (profileErr) {
          if (__DEV__) console.warn("[Auth] Initial profile upsert on signup failed:", profileErr);
        }
      }

      const needsEmailVerification =
        !data.session && !!data.user && !data.user.confirmed_at;

      if (__DEV__) {
        console.log(
          "[Auth] User sign-up result. Needs email verification:",
          needsEmailVerification
        );
      }

      return {
        success: true,
        user: data.user || undefined,
        session: data.session,
        needsEmailVerification,
      };
    } catch (err: unknown) {
      return {
        success: false,
        needsEmailVerification: false,
        error: this.formatError(err),
      };
    }
  }

  /**
   * Resend Verification Confirmation Email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    try {
      if (__DEV__) console.log("[Auth] Resending verification email to:", cleanEmail);

      const redirectUrl = Linking.createURL("auth/callback", {
        scheme: "craftenary",
      });

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return {
          success: false,
          error: this.formatError(error),
        };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: this.formatError(err),
      };
    }
  }

  /**
   * Send Password Reset Email
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return {
        success: false,
        error: "Please enter your email address.",
      };
    }

    try {
      if (__DEV__) console.log("[Auth] Sending password reset for:", cleanEmail);

      const redirectUrl = Linking.createURL("reset-password", {
        scheme: "craftenary",
      });

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return {
          success: false,
          error: this.formatError(error),
        };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: this.formatError(err),
      };
    }
  }

  /**
   * Update Password (after reset or inside profile)
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        error: "Password must contain at least 8 characters.",
      };
    }

    try {
      if (__DEV__) console.log("[Auth] Updating user password");

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: this.formatError(error),
        };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: this.formatError(err),
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      if (__DEV__) console.log("[Auth] Signing out user");

      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: this.formatError(error),
        };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: this.formatError(err),
      };
    }
  }

  /**
   * Get current active session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  }

  /**
   * Fetch User Profile from public.profiles along with role profiles
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // 1. Fetch base profile
      const { data: baseProfile, error: baseErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // 2. Check if an artisan profile exists for this user
      const { data: artisanData } = await supabase
        .from("artisan_profiles")
        .select(`*, craft:crafts(*)`)
        .eq("user_id", userId)
        .maybeSingle();

      if (artisanData) {
        const artisanFullName = `${artisanData.first_name || ""} ${artisanData.last_name || ""}`.trim() || baseProfile?.full_name || "Artisan";
        const profile: UserProfile = {
          id: userId,
          full_name: artisanFullName,
          avatar_url: artisanData.profile_image_url || baseProfile?.avatar_url,
          role: "artisan",
          onboarding_completed: true,
          artisan_profile: artisanData,
          created_at: artisanData.created_at || baseProfile?.created_at || new Date().toISOString(),
          updated_at: artisanData.updated_at || baseProfile?.updated_at || new Date().toISOString(),
        };

        await AsyncStorage.setItem("craftenary_artisan_profile_" + userId, JSON.stringify(artisanData));
        return profile;
      }

      // 3. Check if a tourist profile exists for this user
      const { data: touristData } = await supabase
        .from("tourist_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (touristData) {
        const { data: interestsData } = await supabase
          .from("tourist_craft_interests")
          .select(`craft_id, craft:crafts(*)`)
          .eq("tourist_id", touristData.id);

        const craftInterests = (interestsData || [])
          .map((item: any) => item.craft)
          .filter(Boolean);

        const touristFullName = `${touristData.first_name || ""} ${touristData.last_name || ""}`.trim() || baseProfile?.full_name || "Explorer";
        const fullTouristProfile = {
          ...touristData,
          craft_interests: craftInterests,
        };

        const profile: UserProfile = {
          id: userId,
          full_name: touristFullName,
          avatar_url: touristData.profile_image_url || baseProfile?.avatar_url,
          role: "tourist",
          onboarding_completed: true,
          tourist_profile: fullTouristProfile,
          created_at: touristData.created_at || baseProfile?.created_at || new Date().toISOString(),
          updated_at: touristData.updated_at || baseProfile?.updated_at || new Date().toISOString(),
        };

        await AsyncStorage.setItem("craftenary_tourist_profile_" + userId, JSON.stringify(fullTouristProfile));
        return profile;
      }

      // 4. If base profile exists with no specific role profile yet
      if (!baseErr && baseProfile) {
        return {
          id: baseProfile.id,
          full_name: baseProfile.full_name,
          avatar_url: baseProfile.avatar_url,
          role: baseProfile.role || "tourist",
          onboarding_completed: !!baseProfile.onboarding_completed,
          created_at: baseProfile.created_at,
          updated_at: baseProfile.updated_at,
        };
      }

      // 5. Check local cache fallback if remote returned empty
      const cachedArtisan = await AsyncStorage.getItem("craftenary_artisan_profile_" + userId);
      if (cachedArtisan) {
        const parsed = JSON.parse(cachedArtisan);
        return {
          id: userId,
          full_name: `${parsed.first_name || ""} ${parsed.last_name || ""}`.trim() || "Artisan",
          role: "artisan",
          onboarding_completed: true,
          artisan_profile: parsed,
          created_at: parsed.created_at || new Date().toISOString(),
          updated_at: parsed.updated_at || new Date().toISOString(),
        };
      }

      // 6. Default fallback for newly signed up or un-onboarded user:
      // Construct profile from current auth user metadata
      const { data: authUserData } = await supabase.auth.getUser();
      const authUser = authUserData?.user;
      const authFullName =
        authUser?.user_metadata?.full_name ||
        authUser?.email?.split("@")[0] ||
        "Explorer";

      const fallbackProfile: UserProfile = {
        id: userId,
        full_name: authFullName,
        avatar_url: undefined,
        role: (authUser?.user_metadata?.role as any) || "tourist",
        onboarding_completed: false,
        created_at: authUser?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try creating row in background
      (async () => {
        try {
          await supabase.from("profiles").upsert({
            id: userId,
            full_name: authFullName,
            role: "tourist",
            onboarding_completed: false,
            updated_at: new Date().toISOString(),
          });
        } catch {}
      })();

      return fallbackProfile;
    } catch (err) {
      if (__DEV__) console.warn("[AuthService] Error in getProfile:", err);
      return {
        id: userId,
        full_name: "Explorer",
        role: "tourist",
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }
}

export const authService = new AuthService();
