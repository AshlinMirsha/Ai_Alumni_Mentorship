"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile, SignUpMetadata } from "@/lib/supabase/types";
import type { UserRole, AuthSession } from "@/types";
import {
  loadAuthSession,
  saveAuthSession,
  logoutAuthSession,
  subscribeToDashboardStorage,
  defaultStudentSession,
  defaultAlumniSession,
} from "@/lib/dashboard-storage";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ) => Promise<{ error: Error | null; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: (origin?: "login" | "signup") => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>(() =>
    isConfigured ? "student" : loadAuthSession().role
  );
  const [isLoading, setIsLoading] = useState(() => (isConfigured ? true : false));

  const mountedRef = useRef(true);

  // Sync Supabase Profile into dashboard-storage AuthSession for backward compatibility
  const syncStorageSession = useCallback((p: Profile | null, u: User | null) => {
    if (!u) {
      return;
    }

    const currentRole: UserRole =
      (p?.role === "alumni" || (u.user_metadata?.role as UserRole) === "alumni")
        ? "alumni"
        : "student";

    const baseSession =
      currentRole === "alumni" ? defaultAlumniSession : defaultStudentSession;

    const newAuthSession: AuthSession = {
      ...baseSession,
      isAuthenticated: true,
      role: currentRole,
      email: u.email || p?.email || baseSession.email,
      name:
        p?.full_name ||
        u.user_metadata?.full_name ||
        (u.email ? u.email.split("@")[0] : baseSession.name),
      headline:
        p?.headline ||
        u.user_metadata?.headline ||
        (currentRole === "alumni"
          ? `${p?.current_role || "Alumni"} at ${p?.current_company || "Company"}`
          : baseSession.headline),
      company: p?.current_company || u.user_metadata?.current_company || baseSession.company,
      department: p?.department || u.user_metadata?.department || baseSession.department,
    };

    saveAuthSession(newAuthSession);
  }, []);

  // Fetch user profile from public.profiles table
  const fetchProfile = useCallback(async (userId: string, currentUser?: User): Promise<Profile | null> => {
    if (!isConfigured) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("[Auth] Failed to fetch profile from table:", error.message);
      }

      if (data) {
        const fetchedProfile = data as Profile;
        if (mountedRef.current) {
          setProfile(fetchedProfile);
          setRole(fetchedProfile.role === "alumni" ? "alumni" : "student");
        }
        syncStorageSession(fetchedProfile, currentUser || null);
        return fetchedProfile;
      }

      // If profile row isn't found yet (e.g. trigger delay), fallback to user metadata
      if (currentUser) {
        const fallbackRole = (currentUser.user_metadata?.role as UserRole) || "student";
        const metaProfile: Profile = {
          id: currentUser.id,
          email: currentUser.email || "",
          full_name: currentUser.user_metadata?.full_name || (currentUser.email ? currentUser.email.split("@")[0] : "User"),
          role: fallbackRole,
          institution: currentUser.user_metadata?.institution,
          department: currentUser.user_metadata?.department,
          academic_year: currentUser.user_metadata?.academic_year,
          graduation_year: currentUser.user_metadata?.graduation_year,
          current_role: currentUser.user_metadata?.current_role,
          current_company: currentUser.user_metadata?.current_company,
          verification_status: "unverified",
          headline: currentUser.user_metadata?.headline,
        };
        if (mountedRef.current) {
          setProfile(metaProfile);
          setRole(fallbackRole);
        }
        syncStorageSession(metaProfile, currentUser);
        return metaProfile;
      }
    } catch (err) {
      console.error("[Auth] Unexpected error fetching profile:", err);
    }
    return null;
  }, [isConfigured, syncStorageSession]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    mountedRef.current = true;

    if (!isConfigured) {
      // In unconfigured / demo mode, listen for role switch from storage
      const syncLocal = () => {
        const local = loadAuthSession();
        if (mountedRef.current) {
          setRole(local.role);
        }
      };
      const unsubscribe = subscribeToDashboardStorage(syncLocal);
      return () => {
        mountedRef.current = false;
        unsubscribe();
      };
    }

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!mountedRef.current) return;
      if (error) {
        console.warn("[Auth] Error getting initial session:", error.message);
      }

      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        fetchProfile(initialSession.user.id, initialSession.user).finally(() => {
          if (mountedRef.current) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // 2. Subscribe to auth state updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountedRef.current) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        logoutAuthSession();
      }

      setIsLoading(false);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

  // Sign In with email and password
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        return {
          error: new Error(
            data?.error || "Invalid email or password. Please try again."
          ),
        };
      }

      const verifiedRole: UserRole =
        data.user?.role === "alumni" ? "alumni" : "student";
      setRole(verifiedRole);

      if (isConfigured && data.session?.accessToken) {
        try {
          await supabase.auth.setSession({
            access_token: data.session.accessToken,
            refresh_token: data.session.refreshToken,
          });
        } catch {
          // ignore session sync error
        }
      }

      saveAuthSession(
        verifiedRole === "alumni"
          ? {
              ...defaultAlumniSession,
              email: data.user.email,
              name: data.user.fullName || defaultAlumniSession.name,
              company: data.user.company || defaultAlumniSession.company,
              isAuthenticated: true,
            }
          : {
              ...defaultStudentSession,
              email: data.user.email,
              name: data.user.fullName || defaultStudentSession.name,
              department: data.user.department || defaultStudentSession.department,
              isAuthenticated: true,
            }
      );

      return { error: null };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err
            : new Error("An unexpected error occurred during sign in."),
      };
    }
  };

  // Sign Up with email, password, and metadata
  const signUp = async (
    email: string,
    password: string,
    metadata: SignUpMetadata
  ): Promise<{ error: Error | null; requiresEmailConfirmation?: boolean }> => {
    if (!isConfigured) {
      // Demo fallback registration
      setRole(metadata.role);
      saveAuthSession(
        metadata.role === "alumni"
          ? {
              ...defaultAlumniSession,
              name: metadata.full_name,
              email,
              company: metadata.current_company || defaultAlumniSession.company,
              headline: `${metadata.current_role || "Mentor"} at ${metadata.current_company || "Company"}`,
              isAuthenticated: true,
            }
          : {
              ...defaultStudentSession,
              name: metadata.full_name,
              email,
              department: metadata.department || defaultStudentSession.department,
              isAuthenticated: true,
            }
      );
      return { error: null, requiresEmailConfirmation: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: metadata.full_name.trim(),
            role: metadata.role,
            institution: metadata.institution?.trim() || null,
            department: metadata.department?.trim() || null,
            academic_year: metadata.academic_year || null,
            graduation_year: metadata.graduation_year ? Number(metadata.graduation_year) : null,
            current_role: metadata.current_role?.trim() || null,
            current_company: metadata.current_company?.trim() || null,
          },
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      // Check if email confirmation is required (session is null when email confirmation is active)
      const requiresEmailConfirmation = !data.session;

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        if (data.session) {
          await fetchProfile(data.user.id, data.user);
        }
      }

      return { error: null, requiresEmailConfirmation };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("An unexpected error occurred during sign up."),
      };
    }
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async (origin: "login" | "signup" = "login"): Promise<{ error: Error | null }> => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("alumnipath_oauth_origin", origin);
      }
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "/auth/callback";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err
            : new Error("Failed to initialize Google authentication."),
      };
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    try {
      if (isConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("[Auth] Supabase signOut warning:", err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      logoutAuthSession();
    }
  };

  const isAuthenticated = isConfigured
    ? Boolean(user && session)
    : loadAuthSession().isAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isAuthenticated,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
