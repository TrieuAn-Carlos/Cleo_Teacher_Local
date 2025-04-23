import React from "react";
import FirebaseDemo from "../../components/FirebaseDemo";

export const metadata = {
  title: "Firebase Demo",
  description: "Demo showing Firebase integration with Next.js",
};

export default function FirebaseDemoPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Firebase Integration Demo
        </h1>
        <FirebaseDemo />
      </div>
    </div>
  );
}
