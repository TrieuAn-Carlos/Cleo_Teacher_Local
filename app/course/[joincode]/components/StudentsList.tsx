"use client";

import React from "react";
import styles from "../course.module.css";
import Image from "next/image";

interface Student {
  id: string;
  name: string;
  email: string;
  present: boolean;
}

interface StudentsListProps {
  students: Student[];
  isAdmin: boolean;
}

const StudentsList: React.FC<StudentsListProps> = ({ students, isAdmin }) => {
  return (
    <div className={styles.studentsContainer}>
      <h2>Students</h2>
      {students.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No students have joined this course yet.</p>
        </div>
      ) : (
        <div className={styles.studentsList}>
          <table className={styles.studentsTable}>
            <thead>
              <tr>
                <th>Name</th>
                {isAdmin && <th>Email</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  {isAdmin && <td>{student.email}</td>}
                  <td>
                    <span
                      className={`${styles.status} ${
                        student.present ? styles.present : styles.absent
                      }`}
                    >
                      {student.present ? "Present" : "Absent"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
