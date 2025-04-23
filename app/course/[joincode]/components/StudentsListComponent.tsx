"use client";

import React, { useState, useEffect } from "react";
import styles from "../course.module.css";

// Add interface for student
interface Student {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string | null;
  classId?: string;
}

interface StudentsListComponentProps {
  students: Student[];
  searchQuery: string;
  isSearchVisible: boolean;
  currentSessionId: string | null; // Needed to check if session is active
  attendanceStatus: Record<string, boolean>; // Needed for attended count
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleSearchBar: () => void;
  onToggleAttendance: (studentId: string) => Promise<void>;
  onDeleteStudent: (studentUid: string) => Promise<void>;
  onAddStudentClick: () => void; // <-- Add prop for add student click
}

const StudentsListComponent: React.FC<StudentsListComponentProps> = ({
  students,
  searchQuery,
  isSearchVisible,
  currentSessionId,
  attendanceStatus,
  onSearchChange,
  onToggleSearchBar,
  onToggleAttendance,
  onDeleteStudent,
  onAddStudentClick, // <-- Destructure the new prop
}) => {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  // States for double-click confirmations
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [deleteClickCount, setDeleteClickCount] = useState<
    Record<string, number>
  >({});
  const [attendanceClickCount, setAttendanceClickCount] = useState<
    Record<string, number>
  >({});

  // Calculate counts
  const totalStudents = students.length;
  let attendedCount = 0;
  if (currentSessionId) {
    attendedCount = Object.values(attendanceStatus).filter(Boolean).length;
  }

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.displayName &&
          student.displayName.toLowerCase().includes(query)
      );
      const nonMatching = students.filter(
        (student) =>
          !student.displayName ||
          !student.displayName.toLowerCase().includes(query)
      );
      setFilteredStudents([...filtered, ...nonMatching]);
    }
  }, [searchQuery, students]);

  // Handle delete with double-click confirmation
  const handleDeleteWithConfirmation = (studentUid: string) => {
    const currentCount = deleteClickCount[studentUid] || 0;

    if (currentCount === 0) {
      setDeleteClickCount({ ...deleteClickCount, [studentUid]: 1 });
      setTimeout(() => {
        setDeleteClickCount((prev) =>
          prev[studentUid] === 1 ? { ...prev, [studentUid]: 0 } : prev
        );
      }, 3000);
    } else if (currentCount === 1) {
      setDeleteClickCount({ ...deleteClickCount, [studentUid]: 0 });
      onDeleteStudent(studentUid);
    }
  };

  // Handle attendance toggle with double-click confirmation
  const handleToggleAttendanceWithConfirmation = (studentId: string) => {
    if (!currentSessionId) return;
    const currentCount = attendanceClickCount[studentId] || 0;

    if (currentCount === 0) {
      setAttendanceClickCount({ ...attendanceClickCount, [studentId]: 1 });
      setTimeout(() => {
        setAttendanceClickCount((prev) =>
          prev[studentId] === 1 ? { ...prev, [studentId]: 0 } : prev
        );
      }, 3000);
    } else if (currentCount === 1) {
      setAttendanceClickCount({ ...attendanceClickCount, [studentId]: 0 });
      onToggleAttendance(studentId);
    }
  };

  return (
    <div className={styles.listBox}>
      <div className={styles.labelRow}>
        <div className={styles.customLabel}>
          <i className="fas fa-users"></i>
          <span>Students</span>
          {/* Display counts */}
          <span className={styles.studentCountBadge}>
            {currentSessionId
              ? `${attendedCount} / ${totalStudents}`
              : totalStudents}
          </span>
        </div>
        <div className={styles.iconGroup}>
          <span
            className={styles.circleBtn}
            onClick={onToggleSearchBar}
            title="Search students"
          >
            <i className="fas fa-search"></i>
          </span>
          {/* Attach onClick to the plus button */}
          <span
            className={styles.circleBtn}
            onClick={onAddStudentClick} // <-- Attach the handler here
            title="Add Student Instructions"
          >
            <i className="fas fa-plus"></i>
          </span>
        </div>
      </div>
      {isSearchVisible && (
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={onSearchChange}
          className={styles.searchInput}
          autoFocus
        />
      )}
      <ul>
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => {
            const initials = student.displayName
              ? student.displayName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
              : "ST";

            const isAttended = attendanceStatus[student.uid] || false;
            const attendClickCount = attendanceClickCount[student.uid] || 0;
            const delClickCount = deleteClickCount[student.uid] || 0;

            return (
              <li key={student.uid || index}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    position: "relative", // Needed for absolute positioning of confirm indicator
                  }}
                >
                  {/* Remove confirming class and onClick handler from avatar */}
                  <span
                    className={`${styles.avatar} ${
                      isAttended ? styles.attended : ""
                    }`}
                    style={{
                      position: "relative", // Needed for the indicator
                    }}
                    title={
                      currentSessionId
                        ? isAttended
                          ? "Attended"
                          : "Not Attended"
                        : "No active session"
                    }
                  >
                    {initials}
                  </span>
                  <span style={{ flex: 1 }}>
                    {student.displayName || "Student"}
                  </span>
                  <div
                    className={styles.studentActions}
                    style={{ position: "relative" }}
                  >
                    {/* Manual attendance button - Keep confirmation logic here */}
                    {currentSessionId && (
                      <button
                        className={`${styles.attendanceButton} ${
                          attendClickCount > 0 ? styles.confirming : ""
                        }`}
                        onClick={() =>
                          handleToggleAttendanceWithConfirmation(student.uid)
                        }
                        title={
                          attendClickCount === 0
                            ? isAttended
                              ? "Mark as not attended"
                              : "Mark as attended manually"
                            : "Click again to confirm"
                        }
                      >
                        {isAttended ? (
                          <i className="fas fa-user-check"></i>
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                        {/* Keep confirmation indicator here */}
                        {attendClickCount > 0 && (
                          <span className={styles.confirmationIndicator}>
                            ?
                          </span>
                        )}
                      </button>
                    )}
                    {/* Delete button - Keep confirmation logic here */}
                    <button
                      className={`${styles.ellipsisButton} ${
                        delClickCount > 0 ? styles.confirming : ""
                      }`}
                      onClick={() => handleDeleteWithConfirmation(student.uid)}
                      title={
                        delClickCount === 0
                          ? "Remove Student"
                          : "Click again to confirm removal"
                      }
                    >
                      <i className="fas fa-trash"></i>
                      {/* Keep confirmation indicator here */}
                      {delClickCount > 0 && (
                        <span className={styles.confirmationIndicator}>?</span>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <li>No students enrolled</li>
        )}
      </ul>
    </div>
  );
};

export default StudentsListComponent;
