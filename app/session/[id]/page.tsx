"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import {
  startSessionAction,
  endSessionAction,
  getSessionAttendanceAction,
} from "../../actions/teacherActions";

// CSS Module will be created later
import styles from "./session.module.css";

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isPending, startTransition] = useTransition();

  // State for session data
  const [sessionStatus, setSessionStatus] = useState<
    "loading" | "active" | "ended" | "error"
  >("loading");
  const [attendanceRecords, setAttendanceRecords] = useState<
    Array<{
      studentId: string;
      name: string;
      status: string;
      checkInTime: Date | null;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Load session data on mount
  useEffect(() => {
    if (!sessionId || !user) return;

    const loadSessionData = async () => {
      setSessionStatus("loading");

      try {
        // Fetch attendance records
        const records = await getSessionAttendanceAction({
          sessionId,
          teacherId: user.uid,
        });

        setAttendanceRecords(records);
        setSessionStatus("active"); // Assume active for now
        setError(null);
      } catch (err) {
        console.error("Error loading session data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load session data"
        );
        setSessionStatus("error");
      }
    };

    loadSessionData();
  }, [sessionId, user]);

  // Set up an interval to refresh attendance data every 10 seconds
  useEffect(() => {
    if (!sessionId || !user || sessionStatus !== "active") return;

    const intervalId = setInterval(async () => {
      try {
        const records = await getSessionAttendanceAction({
          sessionId,
          teacherId: user.uid,
        });
        setAttendanceRecords(records);
      } catch (err) {
        console.error("Error refreshing attendance data:", err);
      }
    }, 10000); // Every 10 seconds

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [sessionId, user, sessionStatus]);

  // Handle session control actions
  const handleStartSession = () => {
    if (!user) return;

    startTransition(async () => {
      try {
        await startSessionAction({
          sessionId,
          teacherId: user.uid,
        });
        setSessionStatus("active");
      } catch (err) {
        console.error("Error starting session:", err);
        setError(
          err instanceof Error ? err.message : "Failed to start session"
        );
      }
    });
  };

  const handleEndSession = () => {
    if (!user) return;

    startTransition(async () => {
      try {
        await endSessionAction({
          sessionId,
          teacherId: user.uid,
        });
        setSessionStatus("ended");
      } catch (err) {
        console.error("Error ending session:", err);
        setError(err instanceof Error ? err.message : "Failed to end session");
      }
    });
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading session...</p>
      </div>
    );
  }

  // Ensure user is authenticated
  if (!user) {
    return null; // AuthContext will handle redirect
  }

  return (
    <div className={styles.sessionPage}>
      <header className={styles.sessionHeader}>
        <button className={styles.backButton} onClick={handleBackToDashboard}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className={styles.sessionTitle}>Attendance Session</h1>
        <div className={styles.sessionActions}>
          {sessionStatus === "active" ? (
            <button
              className={styles.endSessionButton}
              onClick={handleEndSession}
              disabled={isPending}
            >
              End Session
            </button>
          ) : sessionStatus === "loading" ? (
            <button className={styles.loadingButton} disabled>
              Loading...
            </button>
          ) : sessionStatus === "ended" ? (
            <span className={styles.endedStatus}>Session Ended</span>
          ) : (
            <button
              className={styles.startSessionButton}
              onClick={handleStartSession}
              disabled={isPending}
            >
              Start Session
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <main className={styles.sessionContent}>
        <div className={styles.attendanceContainer}>
          <h2 className={styles.attendanceTitle}>
            Attendance Records
            <span className={styles.attendanceCount}>
              {attendanceRecords.length} students
            </span>
          </h2>

          {attendanceRecords.length === 0 ? (
            <div className={styles.noAttendanceMessage}>
              <p>No attendance records found for this session.</p>
              {sessionStatus !== "active" && (
                <p>Start the session to allow students to check in.</p>
              )}
            </div>
          ) : (
            <div className={styles.attendanceTable}>
              <div className={styles.tableHeader}>
                <div className={styles.nameCell}>Student Name</div>
                <div className={styles.statusCell}>Status</div>
                <div className={styles.timeCell}>Check-in Time</div>
                <div className={styles.actionCell}>Actions</div>
              </div>

              {attendanceRecords.map((record) => (
                <div key={record.studentId} className={styles.tableRow}>
                  <div className={styles.nameCell}>{record.name}</div>
                  <div className={styles.statusCell}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[record.status]
                      }`}
                    >
                      {record.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className={styles.timeCell}>
                    {record.checkInTime
                      ? new Date(record.checkInTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </div>
                  <div className={styles.actionCell}>
                    <button className={styles.actionButton}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
