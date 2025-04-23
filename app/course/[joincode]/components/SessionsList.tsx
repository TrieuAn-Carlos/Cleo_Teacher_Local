"use client";

import React from "react";
import styles from "../course.module.css";

interface Session {
  id: string;
  startTime: number | Date;
  attendees?: string[];
  duration?: number;
}

// Utility function to format date
const formatDate = (date: number | Date): string => {
  if (!date) return "N/A";
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface SessionsListProps {
  sessions: Session[];
  onViewSessionDetails: (sessionId: string) => void;
}

const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  onViewSessionDetails,
}) => {
  return (
    <div className={styles.sessionsContainer}>
      <div className={styles.sessionsHeader}>
        <h3>Past Sessions</h3>
        <p>{sessions.length} sessions</p>
      </div>
      <div className={styles.sessionsList}>
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className={styles.sessionCard}>
              <div className={styles.sessionInfo}>
                <div className={styles.sessionDate}>
                  {formatDate(session.startTime)}
                </div>
                <div className={styles.sessionStats}>
                  <p>
                    <strong>{session.attendees?.length || 0}</strong> attendees
                  </p>
                  <p>
                    <strong>{session.duration || "–"}</strong> minutes
                  </p>
                </div>
              </div>
              <button
                className={styles.viewButton}
                onClick={() => onViewSessionDetails(session.id)}
              >
                View
              </button>
            </div>
          ))
        ) : (
          <div className={styles.noSessions}>
            <p>No past sessions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsList;
