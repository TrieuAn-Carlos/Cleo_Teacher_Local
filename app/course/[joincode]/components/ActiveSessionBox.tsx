"use client";

import React, { useState } from "react";
import styles from "../course.module.css";

// Add types for student object
interface Student {
  uid: string;
  displayName?: string;
}

interface ActiveSessionBoxProps {
  isVisible: boolean;
  students: Student[];
  attendanceStatus: Record<string, boolean>;
  currentSessionId: string | null;
  onToggleAttendance: (studentId: string) => Promise<void>;
  onVerifySession: () => Promise<void>;
  onClose: () => void;
  verifyingSession: boolean;
}

const ActiveSessionBox: React.FC<ActiveSessionBoxProps> = ({
  isVisible,
  students,
  attendanceStatus,
  currentSessionId,
  onToggleAttendance,
  onVerifySession,
  onClose,
  verifyingSession,
}) => {
  // Add state for attendance double-click confirmation
  const [attendanceClickCount, setAttendanceClickCount] = useState<
    Record<string, number>
  >({});

  if (!isVisible) return null;

  // Handle attendance toggle with double-click confirmation
  const handleToggleAttendanceWithConfirmation = (studentId: string) => {
    // Only proceed if there's an active session
    if (!currentSessionId) return;

    // Get current counter value for this student or initialize to 0
    const currentCount = attendanceClickCount[studentId] || 0;

    // If this is the first click
    if (currentCount === 0) {
      // Set the counter for this student to 1
      setAttendanceClickCount({
        ...attendanceClickCount,
        [studentId]: 1,
      });

      // Set a timeout to reset the counter after 3 seconds
      setTimeout(() => {
        setAttendanceClickCount((prev) =>
          prev[studentId] === 1 ? { ...prev, [studentId]: 0 } : prev
        );
      }, 3000);
    }
    // If this is the second click (confirmation)
    else if (currentCount === 1) {
      // Reset the counter
      setAttendanceClickCount({
        ...attendanceClickCount,
        [studentId]: 0,
      });

      // Perform the actual toggle
      onToggleAttendance(studentId);
    }
  };

  return (
    <div id="active-class-box" className={styles.activeClassBox}>
      <div className={styles.nowLabel}>
        <span>
          <i className="fas fa-bolt"></i> Now
        </span>
      </div>
      <div className={styles.attendanceBar}>
        {/* Render attendance dots based on actual data */}
        {students.slice(0, 12).map((student, index) => {
          const isPresent = attendanceStatus[student.uid] || false;
          const clickCount = attendanceClickCount[student.uid] || 0;

          return (
            <span
              key={index}
              className={`${styles.dot} ${isPresent ? styles.present : ""} ${
                clickCount > 0 ? styles.confirming : ""
              }`}
              onClick={() =>
                currentSessionId &&
                handleToggleAttendanceWithConfirmation(student.uid)
              }
              style={{ cursor: currentSessionId ? "pointer" : "default" }}
              title={
                currentSessionId
                  ? clickCount === 0
                    ? isPresent
                      ? "Click to mark as not attended"
                      : "Click to mark as attended"
                    : "Click again to confirm"
                  : "No active session"
              }
            ></span>
          );
        })}
      </div>
      <button
        className={styles.verifyBtn}
        onClick={onVerifySession}
        disabled={verifyingSession}
      >
        <i className="fas fa-check-circle"></i> Verify
      </button>

      {/* Close button - Now calls onVerifySession to end the session */}
      <button
        id="close-active-btn"
        className={styles.closeBtn}
        onClick={onVerifySession} // Changed from onClose to onVerifySession
        disabled={verifyingSession} // Disable while verifying
        title="End Session" // Added title for clarity
      >
        <i className="fas fa-stop"></i>
      </button>
    </div>
  );
};

export default ActiveSessionBox;
