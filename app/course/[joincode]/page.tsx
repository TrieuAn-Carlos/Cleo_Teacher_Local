"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getClassByJoinCode,
  getSessionsByClassId,
  addSession,
  addStudent,
  deleteSession,
  removeStudentFromClass,
  updateSession, // <-- Add updateSession here
} from "../../../lib/firestoreService";
import { auth } from "../../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  ClassDocument,
  SessionDocument as FirestoreSessionDocument,
  UserProfile,
} from "../../../lib/firestoreTypes";
import styles from "./course.module.css";
import { Timestamp } from "firebase/firestore";
import CourseTopBar from "../../components/CourseTopBar";
import {
  toggleStudentAttendance,
  isStudentAttended,
} from "../../../lib/attendanceService";
// Correct the import path for the server action
import { getStudentsForClassAction } from "../../actions/studentActions";
import { Student } from "../../../lib/actions/types";

// Components
import JoinCodeModal from "./components/JoinCodeModal";
import ActiveSessionBox from "./components/ActiveSessionBox";
import SessionsListComponent from "./components/SessionsListComponent";
import StudentsListComponent from "./components/StudentsListComponent";
import AdminModal from "./components/AdminModal";
import AddStudentInstructionsModal from "./components/AddStudentInstructionsModal"; // Import the new modal

// Local type that matches the component types for SessionDocument
interface SessionDocument {
  id: string;
  title?: string;
  classId: string;
  teacherId: string;
  startTime: any;
  endTime: any | null;
  status: string;
}

// Function to generate random names
const generateRandomName = () => {
  const firstNames = [
    "John",
    "Jane",
    "Alex",
    "Emma",
    "Michael",
    "Sarah",
    "David",
    "Lisa",
    "James",
    "Emily",
    "Robert",
    "Olivia",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Garcia",
    "Rodriguez",
    "Wilson",
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * firstNames.length)];

  return `${firstName} ${lastName}`;
};

// Function to generate random UID
const generateRandomUID = () => {
  return "user_" + Math.random().toString(36).substring(2, 15);
};

export default function CoursePage() {
  const { joincode } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [classData, setClassData] = useState<ClassDocument | null>(null);
  const [sessions, setSessions] = useState<SessionDocument[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActiveSessionVisible, setIsActiveSessionVisible] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [verifyingSession, setVerifyingSession] = useState(false);
  const [logoutClickCount, setLogoutClickCount] = useState(0);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false); // <-- Add state for the new modal
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/homepage");
        return;
      }

      try {
        const classResult = await getClassByJoinCode(joincode as string);

        if (!classResult) {
          console.error("Class not found");
          router.push("/dashboard");
          return;
        }

        if (classResult.teacherId !== authUser.uid) {
          console.error("Access denied: You are not the teacher of this class");
          router.push("/dashboard");
          return;
        }

        setClassData(classResult);

        // Fetch sessions
        const sessionsData = await getSessionsByClassId(classResult.id);
        setSessions(sessionsData as unknown as SessionDocument[]);

        // Fetch students using Server Action
        console.log(
          `Calling Server Action to fetch students for class ${classResult.id}`
        );
        const studentsData = await getStudentsForClassAction(classResult.id);
        setStudents(studentsData);
        console.log(
          `Received ${studentsData.length} students from Server Action`
        );

        // Check attendance status for each student if there is an active session
        if (sessionsData.length > 0) {
          const activeSession = sessionsData.find(
            (s: any) => s.status === "active"
          );
          if (activeSession) {
            setCurrentSessionId(activeSession.id);
            await updateAttendanceStatus(activeSession.id, studentsData);
            setIsActiveSessionVisible(true); // <-- Add this line to show the box
          } else {
            console.log("[Client Page] No active session found on load.");
            // Ensure box is hidden if no active session
            setIsActiveSessionVisible(false);
            setCurrentSessionId(null);
          }
        }
      } catch (error) {
        console.error(
          "Error loading course data or calling server action:",
          error
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [joincode, router]);

  // Handle show join code modal
  const toggleJoinCodeModal = () => {
    setShowJoinCodeModal(!showJoinCodeModal);
  };

  // Handle show admin config modal
  const toggleAdminModal = () => {
    setShowAdminModal(!showAdminModal);
  };

  // Handle show add student instructions modal
  const toggleAddStudentModal = () => {
    // <-- Add function to toggle the new modal
    setShowAddStudentModal(!showAddStudentModal);
  };

  // Close modal when clicking outside
  const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowJoinCodeModal(false);
      setShowAdminModal(false);
      setShowAddStudentModal(false); // <-- Close the new modal on backdrop click
    }
  };

  const toggleActiveSession = async () => {
    if (!isActiveSessionVisible && classData) {
      // Starting a new session
      try {
        const now = Timestamp.now();
        const sessionId = await addSession({
          classId: classData.id,
          teacherId: classData.teacherId,
          startTime: now,
          endTime: null,
          status: "active",
          title: `Session on ${now.toDate().toLocaleDateString()}`,
        });

        setCurrentSessionId(sessionId);
        setIsActiveSessionVisible(true);
        setAttendanceStatus({});

        const updatedSessions = await getSessionsByClassId(classData.id);
        setSessions(updatedSessions as unknown as SessionDocument[]);
      } catch (error) {
        console.error("Error starting session:", error);
      }
    } else {
      if (currentSessionId && !isActiveSessionVisible) {
        await updateAttendanceStatus(currentSessionId, students);
      }
      setIsActiveSessionVisible(!isActiveSessionVisible);
    }
  };

  const verifySession = async () => {
    if (!currentSessionId || !classData) {
      console.log(
        "[Client Page] verifySession aborted: missing currentSessionId or classData"
      );
      return;
    }
    console.log(
      `[Client Page] verifySession started for session: ${currentSessionId}`
    );
    setVerifyingSession(true);
    try {
      const now = Timestamp.now();
      const updateData = {
        endTime: now,
        status: "ended",
      };

      console.log(
        `[Client Page] Calling updateSession for ${currentSessionId} with data:`,
        updateData
      );
      await updateSession(currentSessionId, updateData);
      console.log(
        `[Client Page] updateSession successful for ${currentSessionId}.`
      );

      console.log(
        `[Client Page] Fetching updated sessions list for class ${classData.id}...`
      );
      const updatedSessions = await getSessionsByClassId(classData.id);
      console.log(
        `[Client Page] Fetched ${updatedSessions.length} sessions. Data:`,
        JSON.stringify(updatedSessions)
      ); // Log fetched data

      // Check if the ended session has the correct status in the fetched data
      const endedSession = updatedSessions.find(
        (s) => s.id === currentSessionId
      );
      if (endedSession) {
        console.log(
          `[Client Page] Status of ended session (${currentSessionId}) in fetched data: ${endedSession.status}`
        );
      } else {
        console.warn(
          `[Client Page] Ended session (${currentSessionId}) not found in fetched data!`
        );
      }

      setSessions(updatedSessions as unknown as SessionDocument[]);
      console.log("[Client Page] Sessions state updated.");

      setIsActiveSessionVisible(false);
      console.log("[Client Page] Active session box hidden.");

      // *** ADD THIS LINE ***
      setCurrentSessionId(null); // Reset current session ID after ending
      console.log("[Client Page] Current session ID reset.");
    } catch (error) {
      console.error("[Client Page] Error verifying/ending session:", error);
    } finally {
      setVerifyingSession(false);
      console.log("[Client Page] verifySession finished.");
    }
  };

  // Handle feedback/mail button click
  const handleFeedbackClick = () => {
    window.location.href =
      "mailto:help@cleoattendance.com?subject=Feedback%20for%20Cleo";
  };

  // Handle logout click
  const handleLogoutClick = () => {
    // Tăng bộ đếm mỗi lần click
    setLogoutClickCount(logoutClickCount + 1);

    // Khi click lần đầu
    if (logoutClickCount === 0) {
      // Đặt timeout để reset bộ đếm sau 3 giây
      setTimeout(() => {
        setLogoutClickCount(0);
      }, 3000);
    }
    // Khi click lần thứ hai
    else if (logoutClickCount === 1) {
      // Thực hiện đăng xuất
      auth.signOut();
      // Reset bộ đếm
      setLogoutClickCount(0);
    }
  };

  // Admin Functions
  const handleAddFakeStudents = async (
    numStudentsToAdd: number
  ): Promise<Student[]> => {
    if (!classData) throw new Error("Class data not available");

    try {
      const addedStudents: Student[] = [];
      for (let i = 0; i < numStudentsToAdd; i++) {
        const name = generateRandomName();
        const uid = generateRandomUID();
        const studentData: Student = {
          uid: uid,
          displayName: name,
          email: `${name.replace(" ", "").toLowerCase()}@example.com`,
          photoURL: null,
          classId: classData.id,
        };
        await addStudent(studentData, classData.id);
        addedStudents.push(studentData);
      }
      // Cập nhật state ngay sau khi thêm
      const updatedStudents = await getStudentsForClassAction(classData.id);
      setStudents(updatedStudents);
      return addedStudents;
    } catch (error) {
      console.error("Error adding fake students:", error);
      throw error;
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!classData) return;
    try {
      await deleteSession(sessionId);
      const updatedSessions = await getSessionsByClassId(classData.id);
      setSessions(updatedSessions as unknown as SessionDocument[]);
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  };

  const handleDeleteStudent = async (studentUid: string) => {
    if (!classData) return;
    try {
      await removeStudentFromClass(studentUid, classData.id);
      // Tải lại danh sách sinh viên sau khi xóa
      const updatedStudents = await getStudentsForClassAction(classData.id);
      setStudents(updatedStudents);
    } catch (error) {
      console.error("Error removing student:", error);
      throw error;
    }
  };

  // Update attendance status for all students
  const updateAttendanceStatus = async (
    sessionId: string,
    students: Student[]
  ) => {
    try {
      const statusMap: Record<string, boolean> = {};
      for (const student of students) {
        const isAttended = await isStudentAttended(sessionId, student.uid);
        statusMap[student.uid] = isAttended;
      }
      setAttendanceStatus(statusMap);
    } catch (error) {
      console.error("Error updating attendance status:", error);
    }
  };

  // Handle toggling attendance for a student
  const handleToggleAttendance = async (studentId: string) => {
    if (!currentSessionId || !classData) {
      console.error("No active session to record attendance");
      return;
    }
    try {
      const newStatus = await toggleStudentAttendance(
        currentSessionId,
        studentId,
        classData.id
      );
      setAttendanceStatus((prev) => ({ ...prev, [studentId]: newStatus }));
    } catch (error) {
      console.error("Error toggling attendance:", error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search button click
  const toggleSearchBar = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      // Reset search when showing the search bar
      setSearchQuery("");
    }
  };

  return (
    <div className={styles.courseApp}>
      {/* Use the CourseTopBar component */}
      <CourseTopBar
        onFeedbackClick={handleFeedbackClick}
        onLogoutClick={handleLogoutClick}
        logoutClickCount={logoutClickCount}
        courseName={classData?.name}
        onShowCodeClick={toggleJoinCodeModal}
        joinCode={Array.isArray(joincode) ? joincode[0] : joincode}
        onAdminConfigClick={toggleAdminModal}
      />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <h1>Class: {classData?.name || "Loading..."}</h1>

        {/* Course Actions (only keeping session control button) */}
        <div className={styles.courseActions}>
          {/* Session control button */}
          <button
            className={styles.iconBtn}
            onClick={toggleActiveSession}
            title={
              isActiveSessionVisible
                ? "End Active Session"
                : "Start New Session"
            }
          >
            {isActiveSessionVisible ? (
              <i className="fas fa-stop"></i>
            ) : (
              <i className="fas fa-play"></i>
            )}
          </button>
        </div>

        {/* Active Session Box Component */}
        <ActiveSessionBox
          isVisible={isActiveSessionVisible}
          students={students}
          attendanceStatus={attendanceStatus}
          currentSessionId={currentSessionId}
          onToggleAttendance={handleToggleAttendance}
          onVerifySession={verifySession}
          onClose={toggleActiveSession}
          verifyingSession={verifyingSession}
        />

        {/* Dual list */}
        <div className={styles.listsRow}>
          {/* Past Sessions Component */}
          <SessionsListComponent sessions={sessions} />

          {/* Students List Component */}
          <StudentsListComponent
            students={students}
            searchQuery={searchQuery}
            isSearchVisible={isSearchVisible}
            currentSessionId={currentSessionId}
            attendanceStatus={attendanceStatus}
            onSearchChange={handleSearchChange}
            onToggleSearchBar={toggleSearchBar}
            onToggleAttendance={handleToggleAttendance}
            onDeleteStudent={handleDeleteStudent}
            onAddStudentClick={toggleAddStudentModal} // <-- Pass the toggle function
          />
        </div>
      </div>

      {/* Join Code Modal Component */}
      <JoinCodeModal
        joinCode={Array.isArray(joincode) ? joincode[0] : (joincode as string)}
        isOpen={showJoinCodeModal}
        onClose={toggleJoinCodeModal}
        onBackdropClick={handleModalBackdropClick}
      />

      {/* Admin Modal Component */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={toggleAdminModal}
        onBackdropClick={handleModalBackdropClick}
        sessions={sessions}
        students={students}
        classId={classData?.id || ""}
        currentSessionId={currentSessionId}
        attendanceStatus={attendanceStatus}
        onAddFakeStudents={handleAddFakeStudents}
        onDeleteSession={handleDeleteSession}
        onDeleteStudent={handleDeleteStudent}
        onToggleAttendance={handleToggleAttendance}
      />

      {/* Add Student Instructions Modal Component */}
      <AddStudentInstructionsModal // <-- Render the new modal
        isOpen={showAddStudentModal}
        onClose={toggleAddStudentModal}
        onBackdropClick={handleModalBackdropClick}
        joinCode={Array.isArray(joincode) ? joincode[0] : (joincode as string)}
      />
    </div>
  );
}
