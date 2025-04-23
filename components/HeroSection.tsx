"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const { user, loading, isLoggingOut, signInWithGoogle } = useAuth();
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const semicircleRef = useRef<HTMLDivElement>(null);
  const semicircleTopRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // IMPORTANT: Removed automatic redirect to dashboard to ensure the homepage is visible
  // The dashboard button is still available for logged-in users

  // Xử lý hiệu ứng cầu vồng khi di chuột
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (semicircleRef.current) {
      semicircleRef.current.style.filter = "grayscale(0%)";
      semicircleRef.current.style.boxShadow =
        "0 0 15px rgba(255, 255, 255, 0.7), 0 0 30px rgba(255, 255, 255, 0.4), 0 0 45px rgba(255, 255, 255, 0.2)";
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (semicircleRef.current) {
      semicircleRef.current.style.filter = "grayscale(100%)";
      semicircleRef.current.style.boxShadow =
        "0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2), 0 0 60px rgba(255, 255, 255, 0.1)";
    }
  };

  // Thêm hàm theo dõi thay đổi zoom
  useEffect(() => {
    const handleZoomChange = () => {
      // Lấy tỷ lệ zoom hiện tại (using visualViewport API )
      if (window.visualViewport) {
        setZoomLevel(window.visualViewport.scale);
      }
    };

    // Theo dõi sự thay đổi của visualViewport
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleZoomChange);
      // Khởi tạo giá trị ban đầu
      setZoomLevel(window.visualViewport.scale);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleZoomChange);
      }
    };
  }, []);

  // Effect để điều chỉnh vị trí các phần tử động
  useEffect(() => {
    const adjustSpacing = () => {
      if (
        !headerRef.current ||
        (!buttonRef.current && !user) ||
        !semicircleRef.current ||
        !semicircleTopRef.current ||
        !containerRef.current
      )
        return;

      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;

      // Lấy các phần tử cần thiết
      const subheading = headerRef.current.querySelector(".sub-heading");
      const button = buttonRef.current;
      const semicircle = semicircleRef.current;
      const semicircleTop = semicircleTopRef.current;

      if (!subheading) return;

      // Nếu người dùng đã đăng nhập, đặt vòng tròn ở vị trí cố định
      if (user) {
        // Vị trí dựa trên chiều cao container (responsive)
        const loginPosition = Math.min(-120, -containerHeight * 0.15);
        semicircle.style.bottom = `${loginPosition}px`;
        semicircleTop.style.bottom = `${loginPosition}px`;
        return;
      }

      // Tính toán khoảng cách giữa các phần tử
      const subheadingRect = subheading.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Tính toán khoảng cách tối thiểu -> tránh chồng lấp nội dung
      const upperDistance = buttonRect.top - subheadingRect.bottom;
      const buttonBottom = buttonRect.bottom;
      const distanceToBottom = containerHeight - buttonBottom;

      // Áp dụng giới hạn dựa trên tỷ lệ zoom
      // Khi zoom lớn, giảm kích thước tương đối của vòng tròn để tránh che đậy nội dung
      const zoomFactor =
        zoomLevel > 1
          ? Math.min(1, 1 / (zoomLevel * 0.9)) // Điều chỉnh hệ số để giảm mạnh hơn khi zoom lớn
          : 1;

      // Tính toán vị trí lý tưởng - điều chỉnh dựa trên zoom
      // Khi zoom lớn, đẩy vòng tròn xuống thấp hơn để tránh che nút
      let targetPosition = -(distanceToBottom - upperDistance);

      // Điều chỉnh theo zoom - khi zoom cao, đẩy vòng tròn xuống thấp hơn nhiều
      if (zoomLevel > 1.3) {
        // Đẩy vòng tròn xuống xa hơn khi zoom lớn
        targetPosition = -(distanceToBottom * zoomLevel * 0.8);
      }

      // Tính khoảng cách từ nút đến đáy màn hình
      const buttonBottomMargin = containerHeight - buttonRect.bottom;

      // Điều chỉnh vị trí dựa trên zoom - khi zoom lớn, đẩy vòng tròn xuống thấp hơn
      // Không để vòng tròn lên quá cao (tối thiểu 10% chiều cao từ dưới lên)
      const minPosition = -Math.min(
        containerHeight * 0.55 * zoomFactor, // Giảm chiều cao tối đa khi zoom lớn
        distanceToBottom - buttonRect.height * 1.5 // Giữ khoảng cách bằng 1.5 lần chiều cao nút
      );

      // Nếu zoom lớn hơn, ép buộc vòng tròn xuống thấp hơn nút
      if (zoomLevel > 2) {
        // Ép buộc vòng tròn xuống dưới đáy của nút
        targetPosition = -(containerHeight * 0.1); // Chỉ hiện 10% vòng tròn
      }

      // Không để vòng tròn xuống quá thấp (tối đa 30% chiều cao từ dưới lên)
      const maxPosition = -Math.max(containerHeight * 0.3, 150);

      // Giới hạn vị trí trong khoảng trên
      targetPosition = Math.max(
        Math.min(targetPosition, minPosition),
        maxPosition
      );

      // Đặt vị trí cho cả hai vòng tròn
      semicircle.style.bottom = `${targetPosition}px`;
      semicircleTop.style.bottom = `${targetPosition}px`;
      //bro khoa check lại dòng này nhé
      // Thêm giới hạn kích thước tối đa dựa trên zoom
      // Bắt đầu thu nhỏ sớm hơn, từ zoom 1.3 thay vì 1.5
      if (zoomLevel > 1.3) {
        // Khi zoom lớn, giảm kích thước tương đối để tránh che phủ
        // Giảm mạnh hơn khi zoom lớn (0.5 thay vì 0.6)
        const maxWidth = Math.min(90, 90 / (zoomLevel * 0.5));
        semicircle.style.width = `min(${maxWidth}vw, 1040px)`;
        semicircle.style.height = `min(${maxWidth / 2}vw, 520px)`;
        semicircle.style.borderRadius = `min(${maxWidth / 2}vw, 520px) min(${
          maxWidth / 2
        }vw, 520px) 0 0`;

        // Cũng điều chỉnh vòng tròn bên trong
        const maxWidthInner = Math.min(81, 81 / (zoomLevel * 0.5));
        semicircleTop.style.width = `min(${maxWidthInner}vw, 936px)`;
        semicircleTop.style.height = `min(${maxWidthInner / 2}vw, 468px)`;
        semicircleTop.style.borderRadius = `min(${
          maxWidthInner / 2
        }vw, 468px) min(${maxWidthInner / 2}vw, 468px) 0 0`;

        // Khi zoom rất lớn (trên 2.5), ẩn một phần vòng tròn bằng clip-path
        if (zoomLevel > 2.5) {
          // Chỉ hiển thị 50% phần trên của vòng tròn khi zoom rất lớn
          semicircle.style.clipPath =
            "polygon(-100px -100px, calc(100% + 100px) -100px, calc(100% + 100px) 50%, -100px 50%)";
          semicircleTop.style.clipPath =
            "polygon(-100px -100px, calc(100% + 100px) -100px, calc(100% + 100px) 50%, -100px 50%)";
        } else {
          // Mặc định hiện 90% vòng tròn
          semicircle.style.clipPath =
            "polygon(-100px -100px, calc(100% + 100px) -100px, calc(100% + 100px) 90%, -100px 90%)";
          semicircleTop.style.clipPath =
            "polygon(-100px -100px, calc(100% + 100px) -100px, calc(100% + 100px) 90%, -100px 90%)";
        }
      } else {
        // Khi zoom bình thường, sử dụng kích thước mặc định
        semicircle.style.width = "";
        semicircle.style.height = "";
        semicircle.style.borderRadius = "";
        semicircleTop.style.width = "";
        semicircleTop.style.height = "";
        semicircleTop.style.borderRadius = "";
        semicircle.style.clipPath =
          "polygon(-100px -100px, calc(100% + 100px) -100px, calc(100% + 100px) 90%, -100px 90%)";
        semicircleTop.style.clipPath =
          "polygon(-100px -100px, calc(100% + 100px) -100px, calc(100% + 100px) 90%, -100px 90%)";
      }
    };

    // Chạy khi component mount và khi kích thước cửa sổ thay đổi
    adjustSpacing();

    window.addEventListener("resize", adjustSpacing);
    window.addEventListener("scroll", adjustSpacing);

    return () => {
      window.removeEventListener("resize", adjustSpacing);
      window.removeEventListener("scroll", adjustSpacing);
    };
  }, [user, loading, zoomLevel]); // Thêm zoomLevel vào dependencies

  // Add console log to help with debugging
  useEffect(() => {
    console.log("HeroSection rendered", {
      user: user ? "Logged in" : "Not logged in",
      loading,
      isLoggingOut,
    });
  }, [user, loading, isLoggingOut]);

  // --- Revised Conditional Rendering ---
  // If explicitly logging out OR auth is loading, return null.
  if (isLoggingOut || loading) {
    console.log(
      "HeroSection: Rendering null due to isLoggingOut or authLoading"
    );
    return null;
  }

  return (
    <div
      className="container hero-section-container"
      ref={containerRef}
      style={{ marginTop: "0", paddingTop: "90px" }}
    >
      {/* Phần tiêu đề */}
      <div className="header hero-header" ref={headerRef}>
        <div
          className="title-group"
          ref={titleGroupRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="meet-cleo-container">
            <p className="meet-cleo-text">Meet Cleo</p>
          </div>
          <div className="automagical-container">
            <img
              src="/images/1.svg"
              className="arrow arrow-left"
              alt="Arrow left"
            />
            <h1 className="main-heading">Automagical</h1>
            <img
              src="/images/2.svg"
              className="arrow arrow-right"
              alt="Arrow right"
            />
          </div>
          <h2 className="sub-heading">Attendance Checking</h2>
        </div>
      </div>

      {/* Phần nút đăng nhập/dashboard */}
      {!user ? (
        <div className="login-buttons-container">
          <div className="login-buttons-column">
            <button
              className="pill-google-button"
              onClick={signInWithGoogle}
              disabled={loading} // disabled logic can stay based on loading
              ref={buttonRef}
              style={{
                position: "relative",
                zIndex: 10,
              }}
            >
              <div className="pill-button-content">
                <img
                  src="/images/google-icon.svg"
                  alt="Google logo"
                  className="google-icon"
                  width="18"
                  height="18"
                />
                Sign in with Google
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="welcome-container">
          <p className="welcome-message">
            Welcome, {user.displayName || "User"}!
          </p>
          <button
            className="dashboard-link-button"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Vòng tròn bán nguyệt ở dưới */}
      <div className="semi-circle" ref={semicircleRef}></div>
      <div className="semi-circle-top" ref={semicircleTopRef}></div>
    </div>
  );
}
