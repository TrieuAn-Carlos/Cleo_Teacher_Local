import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "../archived/archived.module.css";

interface ArchivedTopBarProps {
  onFeedbackClick: () => void;
}

const ArchivedTopBar: React.FC<ArchivedTopBarProps> = ({ onFeedbackClick }) => {
  const { signOut } = useAuth();
  const [logoutClickCount, setLogoutClickCount] = useState(0);

  // Xử lý đăng xuất với xác nhận đơn giản
  const handleLogout = () => {
    // Tăng bộ đếm mỗi lần click
    setLogoutClickCount(logoutClickCount + 1);

    // Khi click lần đầu
    if (logoutClickCount === 0) {
      // Đặt timeout -> 3s reset
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

  return (
    <header
      className={styles.archivedHeader}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        margin: 0,
        padding: "12px 24px",
        zIndex: 1000,
        height: "60px",
      }}
    >
      <div className={styles.archivedLogo}>
        <div className={styles.archivedLogoCircle}></div>
        <span>Cleo | Archived</span>
      </div>
      <div className={styles.archivedHeaderIcons}>
        <button
          className={styles.archivedIconButton}
          onClick={onFeedbackClick}
          title="Ask for Help"
        >
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </button>
        <button className={styles.archivedIconButton} onClick={handleLogout}>
          {logoutClickCount === 1 ? (
            <>
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className={styles.questionMark}>?</span>
            </>
          ) : (
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default ArchivedTopBar;
