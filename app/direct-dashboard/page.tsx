"use client";
// Redirect to dashboard immediately if user is already logged in
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function DirectDashboardPage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    
    if (user) {
      router.push("/dashboard");
      return;
    }

    // If user is not logged in, redirect to login page
    console.log("User not logged in, redirecting to login page...");
    router.push("/login");
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Redirecting...</h1>
      <p className="mb-6">Please wait, danke</p>
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
    </div>
  );
}
