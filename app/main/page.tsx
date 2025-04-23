"use client";

import React from "react";
import HeroSection from "../../components/HeroSection";
import TopBar from "../../components/TopBar";
import "../globals.css";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <TopBar />
      <div className="flex-grow" style={{ backgroundColor: "#000000" }}>
        <HeroSection />
      </div>
    </div>
  );
}
