"use client";
//Client Side Loader
// Used in every PAGE
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ClientSideLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading: authLoading, isLoggingOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log("ClientSideLoader mounted");
    setIsMounted(true);

    const timeoutId = setTimeout(() => {
      if (authLoading || isLoggingOut) {
        console.warn(
          "ClientSideLoader: Auth/Logout is still loading after timeout?"
        );
      }
    }, 5000);

    return () => {
      console.log("ClientSideLoader unmounted");
      clearTimeout(timeoutId);
    };
  }, []);

  console.log("ClientSideLoader state:", {
    isMounted,
    authLoading,
    isLoggingOut,
  });

  if (isLoggingOut || authLoading || !isMounted) {
    console.log(
      "Showing loading screen due to isLoggingOut, authLoading, or initial mount"
    );
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-logo"></div>
          <div className="loading-text">Cleo</div>
        </div>
      </div>
    );
  }

  console.log("Rendering children in ClientSideLoader");
  return <>{children}</>;
}
