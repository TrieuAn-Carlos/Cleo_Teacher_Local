"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DemoDataCreator from "../../components/DemoDataCreator";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";

export default function DebugPage() {
  const { user } = useAuth();
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user's classes
      const classesRef = collection(db, "classes");
      const q = query(classesRef, where("teacherId", "==", user?.uid));
      const querySnapshot = await getDocs(q);

      const classes: any[] = [];
      querySnapshot.forEach((doc) => {
        classes.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setUserClasses(classes);
      setError("");
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch data from Firestore.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Firebase Debug Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">User Information</h2>
            {user ? (
              <div>
                <p>
                  <strong>ID:</strong> {user.uid}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Name:</strong> {user.displayName}
                </p>
              </div>
            ) : (
              <p>Not logged in. Please sign in to access user features.</p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Firebase Connection</h2>
            <div className="flex flex-col space-y-2">
              <div>
                <strong>Connection Status:</strong>{" "}
                <span className="text-green-400">
                  Connected to Firebase Cloud
                </span>
              </div>
              <div>
                <strong>Project ID:</strong> cleo-dev-f31ac
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Classes</h2>

          {loading ? (
            <p>Loading classes...</p>
          ) : error ? (
            <div className="bg-red-900 text-white p-4 rounded-lg">
              <p>{error}</p>
            </div>
          ) : userClasses.length === 0 ? (
            <p>No classes found. Create some using the tool below.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userClasses.map((classItem) => (
                <div key={classItem.id} className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold">{classItem.name}</h3>
                  <p>
                    <strong>ID:</strong> {classItem.id}
                  </p>
                  <p>
                    <strong>Join Code:</strong> {classItem.joinCode}
                  </p>
                  <p>
                    <strong>Subject:</strong> {classItem.subject}
                  </p>
                  <p>
                    <strong>Room:</strong> {classItem.room}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Tools</h2>
          <DemoDataCreator />
        </div>
      </div>
    </div>
  );
}
