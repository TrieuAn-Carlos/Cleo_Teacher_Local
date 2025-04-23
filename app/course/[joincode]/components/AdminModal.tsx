"use client";

import React, { useState } from "react";
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

// Define the Student interface locally
interface Student {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string | null;
  classId?: string;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackdropClick: (e: React.MouseEvent) => void;
  sessions: SessionDocument[];
  students: Student[];
  classId: string;
  currentSessionId: string | null;
  attendanceStatus: Record<string, boolean>;
  onAddFakeStudents: (numStudents: number) => Promise<any[]>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onDeleteStudent: (studentUid: string) => Promise<void>;
  onToggleAttendance: (studentId: string) => Promise<void>;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onBackdropClick,
  sessions,
  students,
  classId,
  currentSessionId,
  attendanceStatus,
  onAddFakeStudents,
  onDeleteSession,
  onDeleteStudent,
  onToggleAttendance,
}) => {
  const [numStudentsToAdd, setNumStudentsToAdd] = useState(5);
  const [adminActionStatus, setAdminActionStatus] = useState("");
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const handleAddFakeStudents = async () => {
    setAdminActionStatus("Adding students...");
    try {
      await onAddFakeStudents(numStudentsToAdd);
      setAdminActionStatus(`Successfully added ${numStudentsToAdd} students`);
    } catch (error) {
      console.error("Error adding fake students:", error);
      setAdminActionStatus("Error adding students");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setAdminActionStatus("Deleting session...");
    try {
      await onDeleteSession(sessionId);
      setAdminActionStatus("Session deleted successfully");
    } catch (error) {
      console.error("Error deleting session:", error);
      setAdminActionStatus("Error deleting session");
    }
  };

  const handleDeleteStudent = async (studentUid: string) => {
    setAdminActionStatus("Removing student...");
    try {
      await onDeleteStudent(studentUid);
      setAdminActionStatus("Student removed successfully");
      setStudentToDelete(null);
    } catch (error) {
      console.error("Error removing student:", error);
      setAdminActionStatus("Error removing student");
    }
  };

  const confirmDeleteStudent = (studentUid: string) => {
    setStudentToDelete(studentUid);
  };

  const cancelDeleteStudent = () => {
    setStudentToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onBackdropClick}>
      <div
        className={styles.joinCodeModal}
        style={{ width: "80%", maxWidth: "900px" }}
      >
        <button className={styles.modalCloseBtn} onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className={styles.joinCodeContent} style={{ textAlign: "left" }}>
          <h2>Admin Configuration</h2>

          {/* Status message */}
          {adminActionStatus && (
            <div
              style={{
                margin: "10px 0",
                padding: "10px",
                backgroundColor: adminActionStatus.includes("Error")
                  ? "#ff5555"
                  : "#4CAF50",
                color: "white",
                borderRadius: "5px",
              }}
            >
              {adminActionStatus}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {/* Add Fake Students Section */}
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h3>Generate Fake Students</h3>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px" }}>
                  Number of students to add:
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numStudentsToAdd}
                    onChange={(e) =>
                      setNumStudentsToAdd(Number(e.target.value))
                    }
                    style={{
                      backgroundColor: "#333",
                      color: "white",
                      border: "1px solid #555",
                      borderRadius: "4px",
                      padding: "8px",
                      marginLeft: "10px",
                      width: "60px",
                    }}
                  />
                </label>
                <button
                  onClick={handleAddFakeStudents}
                  style={{
                    backgroundColor: "#2979ff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "10px 15px",
                    cursor: "pointer",
                  }}
                >
                  Add Students
                </button>
              </div>
            </div>

            {/* Manage Sessions Section */}
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h3>Manage Sessions</h3>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginBottom: "20px",
                }}
              >
                {sessions.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {sessions.map((session) => (
                      <li
                        key={session.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: "1px solid #333",
                        }}
                      >
                        <span>{session.title}</span>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          style={{
                            backgroundColor: "#ff5555",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No sessions available</p>
                )}
              </div>
            </div>

            {/* Manage Students Section */}
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h3>Manage Students</h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {students.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {students.map((student) => {
                      const isAttended = attendanceStatus[student.uid] || false;
                      return (
                        <li
                          key={student.uid}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom: "1px solid #333",
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                background: isAttended ? "#4CAF50" : "#555",
                                color: "#fff",
                                borderRadius: "50%",
                                fontSize: "14px",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                marginRight: "10px",
                                cursor: currentSessionId
                                  ? "pointer"
                                  : "default",
                                transition: "all 0.3s ease",
                              }}
                              onClick={() =>
                                currentSessionId &&
                                onToggleAttendance(student.uid)
                              }
                              title={
                                currentSessionId
                                  ? isAttended
                                    ? "Mark as not attended"
                                    : "Mark as attended"
                                  : "No active session"
                              }
                            >
                              {student.displayName
                                ? student.displayName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                : "ST"}
                            </span>
                            <span>{student.displayName}</span>
                          </div>
                          <div style={{ display: "flex", gap: "10px" }}>
                            {currentSessionId && (
                              <button
                                onClick={() => onToggleAttendance(student.uid)}
                                style={{
                                  backgroundColor: isAttended
                                    ? "#ff5555"
                                    : "#4CAF50",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "5px 10px",
                                  cursor: "pointer",
                                }}
                              >
                                {isAttended ? "Unmark" : "Mark"}
                              </button>
                            )}
                            <button
                              onClick={() => confirmDeleteStudent(student.uid)}
                              style={{
                                backgroundColor: "#ff5555",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "5px 10px",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                          {studentToDelete === student.uid && (
                            <div
                              style={{
                                position: "absolute",
                                right: "15px",
                                background: "#333",
                                padding: "10px",
                                borderRadius: "5px",
                                display: "flex",
                                gap: "10px",
                                zIndex: 10,
                              }}
                            >
                              <span>Confirm?</span>
                              <button
                                onClick={() => handleDeleteStudent(student.uid)}
                                style={{
                                  background: "#4CAF50",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "2px 8px",
                                  cursor: "pointer",
                                }}
                              >
                                Yes
                              </button>
                              <button
                                onClick={cancelDeleteStudent}
                                style={{
                                  background: "#aaa",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "2px 8px",
                                  cursor: "pointer",
                                }}
                              >
                                No
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>No students enrolled</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
