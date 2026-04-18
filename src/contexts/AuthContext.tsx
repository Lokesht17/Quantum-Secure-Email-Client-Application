import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User } from "@/types/email";
import { supabase } from "@/lib/supabaseClient";
import { generateKyberKeyPair, storePrivateKey } from "@/lib/crypto";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isEmailRegistered: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const isEmailRegistered = async (email: string): Promise<boolean> => {
  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("email", email)
    .single();
  return !!data;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchAndSetProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data && !error) {
      const mappedUser: User = {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        createdAt: new Date(data.created_at),
        securityStatus: data.security_status as "active" | "warning" | "critical",
      };
      setUser(mappedUser);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAndSetProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAndSetProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAndSetProfile]);

  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {

    const { data: profileData } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (!profileData) {
      return { success: false, error: "not_registered" };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: "wrong_password" };
    }

    if (data.user) {
      await fetchAndSetProfile(data.user.id);
    }

    return { success: true };
  }, [fetchAndSetProfile]);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      console.error("Registration error:", error?.message);
      return false;
    }

    let publicKey: string | null = null;
    let privateKey: string | null = null;

    try {
      const keyPair = await generateKyberKeyPair();
      publicKey = keyPair.publicKey;
      privateKey = keyPair.privateKey;
    } catch (err) {
      console.warn("Kyber keypair generation failed:", err);
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: name,
      email: email,
      security_status: "active",
      public_key: publicKey,
    });

    if (profileError) {
      console.error("Profile insert error:", profileError.message);
      return false;
    }

    if (privateKey && data.user.id) {
      try {
        storePrivateKey(data.user.id, privateKey, password);
      } catch (err) {
        console.warn("Failed to store private key:", err);
      }
    }

    await fetchAndSetProfile(data.user.id);

    return true;
  }, [fetchAndSetProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isEmailRegistered,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
