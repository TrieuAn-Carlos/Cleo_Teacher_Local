"use client";

import React from "react";
import HeroSection from "../../components/HeroSection";
import TopBar from "../../components/TopBar";
import "../globals.css";

export default function DirectPage() {
  // This is a completely self-contained page that directly renders your UI
  return (
    <div
      className="flex flex-col min-h-screen w-full"
      style={{ backgroundColor: "#000000" }}
    >
      <TopBar />
      <div className="flex-grow w-full" style={{ backgroundColor: "#000000" }}>
        <HeroSection />
      </div>
    </div>
  );
}
