"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to our new clean homepage
    router.replace("/homepage");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
    </div>
  );
}
