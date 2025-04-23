"use client";

import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";

const DemoDataCreator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");

  const createDemoClasses = async () => {
    if (!teacherId) {
      setResult("Please enter a teacher ID");
      return;
    }

    setLoading(true);
    setResult("Creating demo classes...");

    try {
      // Create 3 demo classes
      const demoClasses = [
        {
          name: "Introduction to Computer Science",
          teacherId: teacherId,
          joinCode: "CS101",
          subject: "Computer Science",
          room: "Room 101",
          created_at: Timestamp.now(),
          isArchived: false,
        },
        {
          name: "Web Development Fundamentals",
          teacherId: teacherId,
          joinCode: "WEB201",
          subject: "Web Development",
          room: "Room 202",
          created_at: Timestamp.now(),
          isArchived: false,
        },
        {
          name: "Mobile App Development",
          teacherId: teacherId,
          joinCode: "MOB301",
          subject: "Mobile Development",
          room: "Room 303",
          created_at: Timestamp.now(),
          isArchived: false,
        },
      ];

      // Add classes to Firestore
      const results = await Promise.all(
        demoClasses.map((classData) =>
          addDoc(collection(db, "classes"), classData)
        )
      );

      setResult(
        `Success! Created ${results.length} demo classes for teacher ID: ${teacherId}`
      );
    } catch (error) {
      console.error("Error creating demo classes:", error);
      setResult(
        `Error creating demo classes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Demo Data Creator</h2>

      <div className="mb-4">
        <label className="block mb-2">Teacher ID:</label>
        <input
          type="text"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded text-white"
          placeholder="Enter teacher ID here"
        />
      </div>

      <button
        onClick={createDemoClasses}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Demo Classes"}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-gray-700 rounded">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default DemoDataCreator;
