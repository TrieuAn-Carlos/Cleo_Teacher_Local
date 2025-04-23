"use client";

import React from "react";
import HeroSection from "../../components/HeroSection";
import TopBar from "../../components/TopBar";
import "../globals.css";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <TopBar />
      <main style={{ flexGrow: 1, width: "100%", backgroundColor: "#000000" }}>
        <HeroSection />
      </main>
    </div>
  );
}
