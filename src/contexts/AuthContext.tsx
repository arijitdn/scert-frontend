import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import supabase from "@/lib/supabase";

interface UserProfile {
  id: string;
  user_id: string; // The ID used for login (UDISE, block_code, district_code, or "STATE")
  role: "STATE" | "DISTRICT" | "BLOCK" | "SCHOOL" | "PRIVATE_SCHOOL";
  name?: string;
  district_code?: string;
  block_code?: string;
  school_id?: string;
  udise?: string;
  is_first_login?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    userId: string,
    password: string,
  ) => Promise<{ error: any; needsPasswordChange?: boolean }>;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ error: any }>;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session in localStorage
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        setProfile(profile);
        setUser({
          id: profile.id,
          email: `${profile.user_id}@system.local`,
        } as User);
        setSession({
          user: { id: profile.id, email: `${profile.user_id}@system.local` },
        } as Session);
      } catch (error) {
        console.error("Error parsing stored profile:", error);
        localStorage.removeItem("userProfile");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (userId: string, password: string) => {
    try {
      // Find the profile with the given user_id
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError || !profileData) {
        return { error: { message: "Invalid user ID" } };
      }

      // Check password
      const isFirstLogin = profileData.is_first_login;
      const expectedPassword = isFirstLogin ? userId : password;

      // For first login, password should be the user ID itself
      if (isFirstLogin && password !== userId) {
        return {
          error: { message: "For first login, use your ID as password" },
        };
      }

      // For regular login, we don't store passwords but require them to be set during first login
      if (!isFirstLogin && !password) {
        return { error: { message: "Password is required" } };
      }

      // Set user session
      setProfile(profileData);
      setUser({ id: profileData.id, email: `${userId}@system.local` } as User);
      setSession({
        user: { id: profileData.id, email: `${userId}@system.local` },
      } as Session);

      // Store in localStorage for persistence
      localStorage.setItem("userProfile", JSON.stringify(profileData));

      return {
        error: null,
        needsPasswordChange: isFirstLogin,
      };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: { message: "Authentication failed" } };
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!profile || !user) {
      return { error: { message: "No user logged in" } };
    }

    try {
      // Update profile to mark first login as complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_first_login: false })
        .eq("id", profile.id);

      if (profileError) {
        return { error: { message: "Failed to update profile" } };
      }

      // Update local profile
      const updatedProfile = { ...profile, is_first_login: false };
      setProfile(updatedProfile);

      // Update localStorage
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

      return { error: null };
    } catch (error) {
      return { error: { message: "Failed to update password" } };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    // Clear stored session
    localStorage.removeItem("userProfile");
  };

  const getDashboardPath = (): string => {
    if (!profile) return "/login";

    switch (profile.role) {
      case "STATE":
        return "/admin/state";
      case "DISTRICT":
        return "/admin/district";
      case "BLOCK":
        return "/admin/block";
      case "SCHOOL":
        return "/admin/school";
      case "PRIVATE_SCHOOL":
        return "/admin/private-school";
      default:
        return "/admin/school";
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    changePassword,
    getDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
