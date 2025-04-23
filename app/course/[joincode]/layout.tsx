"use client";

import { useEffect } from "react";
import FontAwesomeLoader from "../../../components/FontAwesomeLoader";

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set the body background color to match dashboard
  useEffect(() => {
    // Set the body background color to match dashboard design
    document.body.style.background = "#181818";
    document.body.style.color = "#fff";

    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, []);

  // @clientsideloader
  return (
    <div className="min-h-screen">
      <FontAwesomeLoader />
      {children}
    </div>
  );
}
