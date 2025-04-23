"use client";

import React from "react";
import styles from "../course.module.css";

// Define the SessionDocument interface locally to match the original type
interface SessionDocument {
  id: string;
  title?: string;
  classId: string;
  teacherId: string;
  startTime: any;
  endTime: any | null; // Making this nullable to match the original type
  status: string;
}

interface SessionsListComponentProps {
  sessions: SessionDocument[];
}

const SessionsListComponent: React.FC<SessionsListComponentProps> = ({
  sessions,
}) => {
  // Sort sessions: active first, then by startTime descending (newest ended first)
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    // If both are active or both are not, sort by startTime descending
    const timeA = a.startTime?.toDate ? a.startTime.toDate().getTime() : 0;
    const timeB = b.startTime?.toDate ? b.startTime.toDate().getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className={styles.listBox}>
      <div className={styles.labelRow}>
        <div className={styles.customLabel}>
          <i className="fas fa-calendar-check"></i>
          <span>Sessions</span> {/* Changed label to just Sessions */}
        </div>
      </div>
      <ul>
        {sortedSessions.length > 0 ? (
          sortedSessions.map((session, index) => {
            // Determine the dot color based on status
            let dotClass = styles.grey; // Default to grey (ended or other)
            if (session.status === 'active') {
              dotClass = styles.green; // Use green for active
            }
            
            // Format start time if available
            let startTimeString = '';
            try {
              if (session.startTime?.toDate) { // Check if startTime is a Firestore Timestamp
                startTimeString = session.startTime.toDate().toLocaleDateString();
              }
            } catch (e) {
              console.warn(`Could not format startTime for session ${session.id}`, session.startTime);
            }

            return (
              <li key={session.id}>
                <span className={`${styles.dot} ${dotClass}`}></span>
                {session.title || `Session on ${startTimeString}` || `Session ${index + 1}`}
                {session.status === 'ended' && <span className={styles.statusText}> (Ended)</span>}
                {session.status === 'active' && <span className={styles.statusTextActive}> (Active)</span>}
              </li>
            );
          })
        ) : (
          <li>No sessions found</li>
        )}
      </ul>
    </div>
  );
};

export default SessionsListComponent;
