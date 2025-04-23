"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { getTeacherClassesAction } from "../actions/classActions";
import { updateClass } from "../../lib/firestoreService";
import styles from "./archived.module.css";
import ArchivedTopBar from "../components/ArchivedTopBar";

// Define banner state type
interface BannerState {
  message: string | null;
  type: "loading" | "success" | "error" | null;
}

export default function ArchivedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [archivedClasses, setArchivedClasses] = useState<any[]>([]);
  const [revertClickCounts, setRevertClickCounts] = useState<
    Record<string, number>
  >({});
  const [bannerState, setBannerState] = useState<BannerState>({
    message: null,
    type: null,
  });
  const [isPending, startTransition] = useTransition();

  // feedback button click
  const handleFeedbackClick = () => {
    window.location.href =
      "mailto:help@cleoattendance.com?subject=Feedback%20for%20Cleo";
  };

  // Xử lý khôi phục lớp học
  const handleRevert = async (classId: string) => {
    const currentCount = revertClickCounts[classId] || 0;
    const newCounts = { ...revertClickCounts, [classId]: currentCount + 1 };
    setRevertClickCounts(newCounts);

    // Nếu là lần click đầu tiên
    if (currentCount === 0) {
      // Đặt timeout để reset bộ đếm sau 3 giây
      setTimeout(() => {
        setRevertClickCounts((prev) => ({ ...prev, [classId]: 0 }));
      }, 3000);
    }
    // Nếu là lần click thứ hai
    else if (currentCount === 1) {
      try {
        setBannerState({ message: "Restoring class...", type: "loading" });
        // Cập nhật trạng thái lưu trữ thành false
        await updateClass(classId, { isArchived: false });
        // Xóa lớp học khỏi danh sách hiện tại
        setArchivedClasses(archivedClasses.filter((c) => c.id !== classId));
        setBannerState({
          message: "Class restored successfully!",
          type: "success",
        });

        // Tự động ẩn thông báo thành công sau 2.5 giây
        setTimeout(() => {
          setBannerState({ message: null, type: null });
        }, 2500);
      } catch (err) {
        console.error("Error restoring class:", err);
        setBannerState({ message: "Failed to restore class.", type: "error" });
      }
      // Reset bộ đếm
      setRevertClickCounts((prev) => ({ ...prev, [classId]: 0 }));
    }
  };

  // Callback để tải các lớp học đã lưu trữ
  const loadArchivedClasses = useCallback(() => {
    if (!user?.uid) return;

    setBannerState({ message: "Loading archived classes...", type: "loading" });

    startTransition(async () => {
      try {
        const currentUserId = user.uid;
        // Truyền tham số archived=true để lấy các lớp đã lưu trữ
        const fetchedClasses = await getTeacherClassesAction(
          currentUserId,
          true
        );
        setArchivedClasses(fetchedClasses || []);

        if (fetchedClasses?.length > 0) {
          setBannerState({
            message: "Archived classes loaded",
            type: "success",
          });
        } else {
          setBannerState({
            message: "No archived classes found",
            type: "success",
          });
        }

        // Tự động ẩn thông báo thành công sau 2.5 giây
        setTimeout(() => {
          setBannerState({ message: null, type: null });
        }, 2500);
      } catch (error) {
        console.error("[Archived] Error loading classes:", error);
        setBannerState({
          message:
            error instanceof Error
              ? error.message
              : "Failed to load archived classes.",
          type: "error",
        });
      }
    });
  }, [user?.uid, startTransition]);

  // Effect để tải các lớp học đã lưu trữ khi người dùng đã xác thực
  useEffect(() => {
    if (user && !authLoading) {
      loadArchivedClasses();
    }
  }, [user, authLoading, loadArchivedClasses]);

  // Show main loading screen if initial auth is happening
  if (authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4">Loading archived classes...</p>
      </div>
    );
  }

  // If no user after loading, redirect to login
  if (!user) {
    return null;
  }

  return (
    <div className={styles.archivedApp}>
      {/* Sử dụng component ArchivedTopBar */}
      <ArchivedTopBar onFeedbackClick={handleFeedbackClick} />

      {/* Thanh thông báo */}
      {bannerState.message && (
        <div
          className={`${styles.notificationBanner} ${
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

      <main className={styles.archivedMainContent}>
        <div className={styles.archivedContent}>
          <h1 className={styles.archivedHeading}>
            Archived Classes{" "}
            {archivedClasses.length > 0 && `(${archivedClasses.length})`}
          </h1>

          <Link href="/dashboard" className={styles.backLink}>
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
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Dashboard
          </Link>

          {archivedClasses.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
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
              <p className={styles.emptyStateText}>No archived classes found</p>
            </div>
          ) : (
            <table className={styles.archivedTable}>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Subject</th>
                  <th>Room</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {archivedClasses.map((cls) => (
                  <tr key={cls.id}>
                    <td className={styles.archivedClassName}>{cls.name}</td>
                    <td className={styles.archivedSubject}>
                      {cls.subject || "-"}
                    </td>
                    <td className={styles.archivedRoom}>{cls.room || "-"}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.revertButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevert(cls.id);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 7v6h6"></path>
                            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                          </svg>
                          {revertClickCounts[cls.id] === 1 && (
                            <span className={styles.questionMark}>?</span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
