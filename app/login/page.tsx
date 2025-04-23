"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, mockSignIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log(
        "LoginPage: User already logged in, redirecting to dashboard"
      );
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  const handleMockSignIn = () => {
    try {
      setError(null);
      mockSignIn();
    } catch (err) {
      console.error("Mock login error:", err);
      setError("Failed to use mock account. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to Cleo
          </h1>
          <p className="text-gray-400">Automagical Attendance Checking</p>
        </div>

        {error && (
          <div className="p-3 bg-red-600 text-white rounded-md text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center space-x-2 transition-colors"
            disabled={loading}
          >
            <img
              src="/images/google-icon.svg"
              alt="Google logo"
              className="w-5 h-5"
            />
            <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
          </button>

          {process.env.NODE_ENV !== "production" && (
            <button
              onClick={handleMockSignIn}
              className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              disabled={loading}
            >
              Use Mock Account (Dev Only)
            </button>
          )}
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
