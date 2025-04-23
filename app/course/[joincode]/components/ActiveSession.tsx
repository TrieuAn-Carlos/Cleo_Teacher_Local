"use client";

import React, { createContext, useContext, useState } from "react";
import styles from "../course.module.css";
import Image from "next/image";

// Create a simple Session interface
interface Session {
  id: string;
  createdAt: number | string | Date;
  // Add other properties as needed
}

// Create a simple Toast context
interface ToastContextType {
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

interface ActiveSessionProps {
  session: Session | null;
  isActive: boolean;
  joinCode: string;
  isAdmin: boolean;
  toggleActiveSession: () => Promise<void>;
  verifySession: () => Promise<void>;
}

const ActiveSession: React.FC<ActiveSessionProps> = ({
  session,
  isActive,
  joinCode,
  isAdmin,
  toggleActiveSession,
  verifySession,
}) => {
  // Simple toast implementation
  const showToast = (message: string, type: "success" | "error" | "info") => {
    console.log(`Toast: ${message} (${type})`);
    // In real implementation, this would show a UI toast
  };

  const handleVerify = async () => {
    try {
      await verifySession();
      showToast("Attendance verified!", "success");
    } catch (error) {
      console.error("Error verifying attendance:", error);
      showToast("Failed to verify attendance", "error");
    }
  };

  return (
    <div className={styles.activeSessionContainer}>
      <div className={styles.activeSessionHeader}>
        <h2>{isActive ? "Active Session" : "No Active Session"}</h2>
        {isAdmin && (
          <button
            className={`${styles.button} ${
              isActive ? styles.endButton : styles.startButton
            }`}
            onClick={toggleActiveSession}
          >
            {isActive ? "End Session" : "Start New Session"}
          </button>
        )}
      </div>

      {isActive && session && (
        <div className={styles.activeSessionDetails}>
          <div className={styles.sessionInfo}>
            <p>
              <strong>Session ID:</strong> {session.id}
            </p>
            <p>
              <strong>Started:</strong>{" "}
              {new Date(session.createdAt).toLocaleString()}
            </p>
          </div>

          {!isAdmin && (
            <div className={styles.verifyAttendance}>
              <button className={styles.verifyButton} onClick={handleVerify}>
                <Image
                  src="/icons/showcode.svg"
                  alt="Verify"
                  width={24}
                  height={24}
                  className={styles.verifyIcon}
                />
                Verify Attendance
              </button>
            </div>
          )}
        </div>
      )}

      {!isActive && (
        <div className={styles.noActiveSession}>
          <p>There is currently no active session for this course.</p>
          {!isAdmin && (
            <p>The instructor will start a session when class begins.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveSession;
