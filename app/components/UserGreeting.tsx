"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserDisplayName } from "../../lib/actions";

export default function UserGreeting() {
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserName() {
      if (user && !loading) {
        try {
          setIsLoading(true);
          const name = await getUserDisplayName(user.uid);
          setDisplayName(name);
        } catch (error) {
          console.error("Error fetching user name:", error);
          // Fallback to displayName from auth if available
          setDisplayName(user.displayName || "User");
        } finally {
          setIsLoading(false);
        }
      } else if (!loading) {
        setIsLoading(false);
      }
    }

    fetchUserName();
  }, [user, loading]);

  if (loading || isLoading) {
    return <div className="text-lg font-medium">Loading...</div>;
  }

  if (!user) {
    return <div className="text-lg font-medium">Hello, Guest</div>;
  }

  return (
    <div className="text-lg font-medium">Hello, {displayName || "User"}</div>
  );
}
