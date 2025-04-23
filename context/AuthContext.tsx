"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebaseConfig";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggingOut: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");

    // Safeguard: End loading state after 5 seconds max, regardless of Firebase response
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("AuthProvider: Force ending loading state after timeout");
        setLoading(false);
        setIsLoggingOut(false);
      }
    }, 5000);

    try {
      // For both development and production, use Firebase Auth
      console.log("AuthProvider: Using Firebase Auth");
      try {
        const unsubscribe = onAuthStateChanged(
          auth,
          (authUser) => {
            console.log(
              "AuthProvider: Auth state changed",
              authUser ? "User exists" : "No user"
            );
            if (authUser) {
              setUser(authUser);
              setIsLoggingOut(false);
            } else {
              setUser(null);
              setIsLoggingOut(false);
            }
            setLoading(false);
          },
          (error) => {
            // Log and handle auth errors
            console.error("AuthProvider: Auth state error", error);
            setUser(null);
            setLoading(false);
            setIsLoggingOut(false);
          }
        );

        // Clean up subscription and timeout
        return () => {
          unsubscribe();
          clearTimeout(timeoutId);
        };
      } catch (error) {
        // If Firebase auth fails to initialize, end loading state and log error
        console.error(
          "AuthProvider: Failed to initialize Firebase Auth",
          error
        );
        setLoading(false);
        setIsLoggingOut(false);
        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      // Catch-all to ensure loading state never gets stuck
      console.error(
        "AuthProvider: Unexpected error in auth initialization",
        error
      );
      setLoading(false);
      setIsLoggingOut(false);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  const signInWithGoogle = async () => {
    setIsLoggingOut(false);
    setLoading(true);
    try {
      console.log("AuthProvider: Attempting Google sign in");
      await signInWithPopup(auth, googleProvider);
      // Auth state change will handle user/loading state
    } catch (error) {
      console.error("AuthProvider: Error signing in with Google:", error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log(
      "AuthProvider: Attempting sign out - setting isLoggingOut=true"
    );
    setIsLoggingOut(true);
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);

      // Force a full page refresh to the homepage
      window.location.href = "/";

      // Note: Code below this line might not execute immediately due to page refresh
      // Keep loading = true, keep isLoggingOut = true
      // This helps show loader *before* refresh starts, though the duration might be short.
    } catch (error) {
      console.error("AuthProvider: Error signing out:", error);
      setUser(null);
      setLoading(false);
      setIsLoggingOut(false);
      // Maybe redirect differently on error?
      // router.push("/"); // Example: use client-side nav on error
    }
  };

  // Log current state for debugging
  console.log("AuthProvider: Current state", {
    user: user ? "exists" : "null",
    loading,
    isLoggingOut,
  });

  const value = {
    user,
    loading,
    isLoggingOut,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
