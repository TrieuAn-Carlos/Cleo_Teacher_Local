"use client";

import { useEffect } from "react";

export default function FontAwesomeLoader() {
  useEffect(() => {
    // Create link element
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";

    // Add to head
    document.head.appendChild(link);

    // Clean up function
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
