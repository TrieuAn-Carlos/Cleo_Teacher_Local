"use client";

// Import lại các thành phần cần thiết, thêm DashboardTopBar
import React, {
  useState,
  useRef,
  useEffect,
  useTransition,
  useCallback,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  addClass,
  updateClass,
  archiveClass as archiveClassService,
} from "../../lib/firestoreService";
import { getTeacherClassesAction } from "../actions/classActions";
import type { ClassDocument } from "../../lib/firestoreTypes";
import "./styles.css";
import styles from "./dashboard.module.css"; // Import CSS Module
import DashboardTopBar from "../components/DashboardTopBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOut,
  faArchive,
  faHome,
  faTrash,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { signOut } from "firebase/auth";
import { createClientComponentClient } from "@firebase/firestore";
import LoadingBanner from "../components/LoadingBanner";

// Define banner state type
interface BannerState {
  message: string | null;
  type: "loading" | "success" | "error" | null;
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassDocument | null>(null);
  const [bannerState, setBannerState] = useState<BannerState>({
    message: null,
    type: null,
  });
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [archivedView, setArchivedView] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Thay thế boolean state bằng bộ đếm số lần nhấn
  const [logoutClickCount, setLogoutClickCount] = useState(0);

  // Xử lý đăng xuất với xác nhận đơn giản hơn
  const handleLogout = () => {
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
      signOut();
      // Reset bộ đếm
      setLogoutClickCount(0);
    }
  };

  // Function to handle feedback button click
  const handleFeedbackClick = () => {
    window.location.href =
      "mailto:help@cleoattendance.com?subject=Feedback%20for%20Cleo";
  };

  // Function to handle add class button click
  const handleAddClassClick = () => {
    setShowForm(true);
    setEditingClass(null);
  };

  // Callback to load classes using Server Action
  const loadClasses = useCallback(() => {
    if (!user?.uid) {
      return;
    }

    setBannerState({ message: "Classes are loading...", type: "loading" });

    startTransition(async () => {
      try {
        const currentUserId = user.uid;
        console.log(
          "[Dashboard] Calling getTeacherClassesAction for user:",
          currentUserId
        );
        const fetchedClasses = await getTeacherClassesAction(
          currentUserId,
          archivedView
        );
        console.log("[Dashboard] Received classes:", fetchedClasses?.length);
        setClasses(fetchedClasses || []);
        setBannerState({ message: "Loaded", type: "success" });

        // Clear success banner after a delay
        setTimeout(() => {
          setBannerState({ message: null, type: null });
        }, 2500); // 2.5 seconds
      } catch (error) {
        console.error("[Dashboard] Error loading classes:", error);
        setBannerState({
          message:
            error instanceof Error ? error.message : "Failed to load classes.",
          type: "error",
        });
      }
    });
  }, [user?.uid, startTransition, archivedView]);

  // Effect to load classes when user is authenticated
  useEffect(() => {
    // Only load data if user exists and initial auth loading is done
    if (user && !authLoading) {
      loadClasses();
    }
    // If no user and auth is done, redirect (handled by AuthContext/other effects)
  }, [user, authLoading, loadClasses]);

  // Add a useEffect hook to handle sign out redirection
  useEffect(() => {
    // This cleanup function will run when the component unmounts
    // (which happens during sign out)
    return () => {
      // Clear any potential state or timers when navigating away
      setClasses([]);
      setShowForm(false);
      setEditingClass(null);
      setBannerState({ message: null, type: null }); // Clear banner on unmount
    };
  }, []);

  // Add new class function
  const addNewClass = async (newClass: {
    className: string;
    subject: string;
    room: string;
  }) => {
    if (!user) return;

    try {
      setBannerState({ message: "Saving class...", type: "loading" });
      const classData = {
        name: newClass.className,
        subject: newClass.subject || "",
        room: newClass.room || "",
        teacherId: user.uid,
        joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // Random join code
        isArchived: false, // Đảm bảo trường này luôn có giá trị
      };

      if (editingClass) {
        // Update existing class
        await updateClass(editingClass.id, classData);
        setClasses(
          classes.map((cls) =>
            cls.id === editingClass.id ? { ...cls, ...classData } : cls
          )
        );
        setEditingClass(null);

        // Sau khi cập nhật, khởi động lại server action để làm mới cache
        startTransition(() => {
          loadClasses();
        });
      } else {
        // Add new class
        const classId = await addClass(classData);
        const newClassWithId = {
          ...classData,
          id: classId,
          created_at: new Date(), // Chỉ để hiển thị ngay trên UI
        } as unknown as ClassDocument;
        setClasses([...classes, newClassWithId]);

        // Sau khi thêm mới, khởi động lại server action để làm mới cache
        startTransition(() => {
          loadClasses();
        });
      }
      setShowForm(false);
      setBannerState({ message: "Class saved successfully!", type: "success" });
    } catch (err) {
      console.error("Error saving class:", err);
      setBannerState({
        message: `Failed to save class: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClass(null);
  };

  const handleArchiveClass = async (id: string) => {
    try {
      await archiveClassService(id);
      setClasses(classes.filter((cls) => cls.id !== id));
      setBannerState({
        message: "Class archived successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Error archiving class:", err);
      setBannerState({
        message: "Failed to archive class. Please try again.",
        type: "error",
      });
    }
  };

  const editClass = (id: string) => {
    const classToEdit = classes.find((cls) => cls.id === id);
    if (classToEdit) {
      setEditingClass(classToEdit);
      setShowForm(true);
    }
  };

  const handleToggleArchiveView = () => {
    setArchivedView(!archivedView);
  };

  // Show main loading screen if initial auth is happening
  if (authLoading && !user) {
    // More specific condition for initial load
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4">Loading dashboard...</p>
      </div>
    );
  }

  // If no user after loading, AuthContext likely handles redirect, but we can return null
  if (!user) {
    return null;
  }

  // Determine banner background color based on type
  const getBannerBgColor = () => {
    switch (bannerState.type) {
      case "loading":
      case "error":
        return "rgba(255, 0, 0, 0.1)"; // Red background for loading and error
      case "success":
        return "rgba(0, 255, 0, 0.1)"; // Green background for success
      default:
        return "transparent";
    }
  };
  const getBannerTextColor = () => {
    switch (bannerState.type) {
      case "loading":
      case "error":
        return "#ff6b6b"; // Red text
      case "success":
        return "#6bff6b"; // Green text
      default:
        return "#fff";
    }
  };

  // Display a helpful error if we have database connectivity issues
  const getErrorContent = () => {
    // If banner shows error and we have no classes, likely a database connection issue
    if (bannerState.type === "error" && classes.length === 0) {
      const errorMsg = bannerState.message || "Unknown database error";
      const isFirebaseAuthError =
        errorMsg.includes("authentication") ||
        errorMsg.includes("credential") ||
        errorMsg.includes("permission") ||
        errorMsg.includes("not initialized");

      return (
        <div className={styles.dashboardDatabaseErrorContainer}>
          <div className={styles.dashboardNoClassesMsg}>
            <h3 className={styles.dashboardErrorTitle}>
              Database Connection Error
            </h3>
            <p>{errorMsg}</p>

            {isFirebaseAuthError && (
              <div className={styles.dashboardErrorHelp}>
                <h4>How to fix this issue:</h4>
                <ol>
                  <li>
                    Check that your Firebase credentials are set up correctly
                  </li>
                  <li>
                    Verify that you have the correct project ID configured:{" "}
                    <code>cleo-dev-f31ac</code>
                  </li>
                  <li>Make sure your service account has proper permissions</li>
                  <li>
                    See SERVICE_ACCOUNT_SETUP.md for detailed setup instructions
                  </li>
                </ol>
                <button
                  className={styles.dashboardTryAgainButton}
                  onClick={loadClasses}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.dashboardApp} style={{ padding: 0, margin: 0 }}>
      {/* Sử dụng component DashboardTopBar */}
      <DashboardTopBar
        onFeedbackClick={handleFeedbackClick}
        onAddClassClick={handleAddClassClick}
        onLogoutClick={handleLogout}
        logoutClickCount={logoutClickCount}
      />

      {/* Banner thông báo mới - vị trí cố định bên trái dưới logo */}
      {bannerState.message && (
        <div
          className={`${styles.dashboardNotificationBanner} ${
            bannerState.type === "loading" ? styles.loading : ""
          } ${bannerState.type === "success" ? styles.success : ""} ${
            bannerState.type === "error" ? styles.error : ""
          }`}
        >
          {bannerState.message}
          {bannerState.type === "error" && (
            <button
              onClick={() => setBannerState({ message: null, type: null })}
            >
              ×
            </button>
          )}
        </div>
      )}

      <main
        className={styles.dashboardMainContent}
        style={{ paddingTop: "96px" }}
      >
        <h1 className="greeting">
          Hello,{" "}
          <span className={styles.userName}>
            {user.displayName || "Teacher"}
          </span>
        </h1>

        {/* Error Content */}
        {getErrorContent()}

        {/* Main Content */}
        {!getErrorContent() && !showForm ? (
          <div className={styles.dashboardContent}>
            {/* Classes Section */}
            <div className={styles.dashboardSection}>
              <h2 className={styles.dashboardSectionTitle}>
                {classes.length === 1
                  ? "Your Class"
                  : `Your Classes (${classes.length})`}
              </h2>
              {classes.length === 0 ? (
                <div className={styles.dashboardNoClassesMsg}>
                  <p>You haven't created any classes yet.</p>
                  <button
                    className={styles.dashboardCreateClassBtn}
                    onClick={() => setShowForm(true)}
                  >
                    Create Your First Class
                  </button>
                </div>
              ) : (
                <div className={styles.dashboardClassGrid}>
                  {classes.map((cls, index) => (
                    <ClassCard
                      key={cls.id}
                      id={cls.id}
                      className={cls.name}
                      subject={cls.subject || ""}
                      number={index + 1}
                      onDelete={handleArchiveClass}
                      onEdit={editClass}
                      styles={styles}
                      joinCode={cls.joinCode}
                    />
                  ))}
                  <div
                    className={styles.dashboardArchivedCoursesCard}
                    onClick={() => router.push("/archived")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.dashboardArchivedIcon}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#555"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 8v13H3V8"></path>
                        <path d="M1 3h22v5H1z"></path>
                        <path d="M10 12h4"></path>
                      </svg>
                    </div>
                    <p>Archived Courses</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.dashboardFormOverlay}>
            <div className={styles.dashboardFormContainer}>
              <ClassForm
                onSubmit={addNewClass}
                onCancel={handleCancel}
                initialData={
                  editingClass
                    ? {
                        className: editingClass.name,
                        subject: editingClass.subject || "",
                        room: editingClass.room || "",
                      }
                    : undefined
                }
                styles={styles}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

interface ClassFormProps {
  onSubmit: (newClass: {
    className: string;
    subject: string;
    room: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    className: string;
    subject: string;
    room: string;
  };
  styles: any;
}

function ClassForm({
  onSubmit,
  onCancel,
  initialData,
  styles,
}: ClassFormProps) {
  const [className, setClassName] = useState(
    initialData ? initialData.className : ""
  );
  const [subject, setSubject] = useState(
    initialData ? initialData.subject : ""
  );
  const [room, setRoom] = useState(initialData ? initialData.room : "");

  useEffect(() => {
    if (initialData) {
      setClassName(initialData.className);
      setSubject(initialData.subject);
      setRoom(initialData.room || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ className, subject, room });
    // Reset form
    setClassName("");
    setSubject("");
    setRoom("");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.dashboardForm}>
      <h2>{initialData ? "Edit Class" : "Create New Class"}</h2>
      <input
        className={styles.dashboardInput}
        type="text"
        placeholder="Class name (required)"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        required
      />
      <input
        className={styles.dashboardInput}
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <input
        className={styles.dashboardInput}
        type="text"
        placeholder="Room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <div className={styles.dashboardFormButtons}>
        <button
          type="button"
          className={styles.dashboardCancelButton}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="submit" className={styles.dashboardSaveButton}>
          {initialData ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}

interface ClassCardProps {
  id: string;
  className: string;
  subject: string;
  number: number;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  styles: any;
  joinCode?: string;
}

function ClassCard({
  id,
  className,
  subject,
  number,
  onDelete,
  onEdit,
  styles,
  joinCode,
}: ClassCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleCardClick = () => {
    if (joinCode) {
      router.push(`/course/${joinCode}`);
    } else {
      console.error("No join code available for this class");
    }
  };

  return (
    <div
      className={styles.dashboardClassCard}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.dashboardClassNumberCircle}>
        <span>{number}</span>
      </div>
      <div className={styles.dashboardCardContent}>
        <div className={styles.dashboardCardHeader}>
          <h3 className={styles.dashboardClassName}>{className}</h3>
          <div className={styles.dashboardMenuContainer}>
            <button className={styles.dashboardMenuButton} onClick={toggleMenu}>
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
                <circle cx="12" cy="6" r="1"></circle>
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="18" r="1"></circle>
              </svg>
            </button>
            {menuOpen && (
              <div className={styles.dashboardMenuDropdown} ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(id);
                    setMenuOpen(false);
                  }}
                >
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
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                    setMenuOpen(false);
                  }}
                >
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
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
        <p className={styles.dashboardClassSubject}>{subject}</p>
      </div>
    </div>
  );
}
