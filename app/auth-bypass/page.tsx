"use client";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

// This is a troubleshooting page that immediately uses the mock auth
// and redirects to the dashboard
export default function AuthBypass() {
  const { mockSignIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Call mockSignIn immediately
    mockSignIn();

    // A short delay to ensure mockSignIn has time to update the auth state
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 1000);

    return () => clearTimeout(timer);
  }, [mockSignIn, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl mb-4">Bypassing Authentication...</h1>
      <p>You will be redirected to the dashboard shortly.</p>
      <button
        onClick={() => router.push("/dashboard")}
        className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
      >
        Go to Dashboard Now
      </button>
    </div>
  );
}
