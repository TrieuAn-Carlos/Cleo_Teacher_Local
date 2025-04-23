import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from '../dashboard/dashboard.module.css';

interface DashboardTopBarProps {
  onFeedbackClick: () => void;
  onAddClassClick: () => void;
  onLogoutClick?: () => void;
  logoutClickCount?: number;
}

const DashboardTopBar: React.FC<DashboardTopBarProps> = ({ 
  onFeedbackClick,
  onAddClassClick,
  onLogoutClick,
  logoutClickCount = 0
}) => {
  const { signOut } = useAuth();
  const [internalLogoutClickCount, setInternalLogoutClickCount] = useState(0);

  // Xử lý đăng xuất với xác nhận đơn giản
  const handleLogout = () => {
    if (onLogoutClick) {
      // Nếu được truyền từ component cha
      onLogoutClick();
    } else {
      // Nếu không được truyền từ component cha, sử dụng logic nội bộ
      // Tăng bộ đếm mỗi lần click
      const newCount = internalLogoutClickCount + 1;
      setInternalLogoutClickCount(newCount);

      // Khi click lần đầu
      if (internalLogoutClickCount === 0) {
        // Đặt timeout -> 3s reset
        setTimeout(() => {
          setInternalLogoutClickCount(0);
        }, 3000);
      }
      // Khi click lần thứ hai
      else if (internalLogoutClickCount === 1) {
        // Thực hiện đăng xuất
        signOut();
        // Reset bộ đếm
        setInternalLogoutClickCount(0);
      }
    }
  };

  // Sử dụng giá trị clickCount từ props nếu được cung cấp, nếu không sử dụng state nội bộ
  const currentLogoutClickCount = onLogoutClick ? logoutClickCount : internalLogoutClickCount;

  return (
    <header
      className={styles.dashboardHeader}
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
      <div className={styles.dashboardLogo}>
        <div className={styles.dashboardLogoCircle}></div>
        <span>Cleo | Dashboard</span>
      </div>
      <div className={styles.dashboardHeaderIcons}>
        <button
          className={styles.dashboardIconButton}
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
        <button
          className={styles.dashboardIconButton}
          onClick={onAddClassClick}
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
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button className={styles.dashboardIconButton} onClick={handleLogout}>
          {currentLogoutClickCount === 1 ? (
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

export default DashboardTopBar;