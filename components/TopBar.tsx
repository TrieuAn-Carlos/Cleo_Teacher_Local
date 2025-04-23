"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link"; // Use Link for logo navigation

// Component Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
}

function Modal({ isOpen, onClose, title, content }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-content">{content}</div>
      </div>
    </div>
  );
}
// TopBar component
export default function TopBar() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: ReactNode;
  }>({
    title: "",
    content: null,
  });
  
  // Temp function to handle social media link
  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    alert("This link is working!");
  };
  
  // Function to open the modal with specific content
  
  const openAboutModal = () => {
    setModalContent({
      title: "Cleo | About Us",
      content: (
        <div>
          <p>Welcome to Cleo - the Automagical Attendance Checking system!</p>
          <p>
            Cleo was created to simplify attendance management for educational
            institutions and organizations.
          </p>
          <p>
            Our cutting-edge technology combines facial recognition with
            user-friendly interfaces to provide seamless attendance tracking.
          </p>
          <p>Our member are:</p>
          <p>
            Our instructor(s) are:
            <ul></ul>
          </p>
        </div>
      ),
    });
    setModalOpen(true);
  };
//Video 
//Add video demo de sau
  const openVideoModal = () => {
    setModalContent({
      title: "Cleo | User Guide",
      content: (
        <div className="youtube-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
            title="Cleo Tutorial Video"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        </div>
      ),
    });
    setModalOpen(true);
  };

  const openContactModal = () => {
    setModalContent({
      title: "Cleo | Contact Us",
      content: (
        <div>
          <p>
            We'd love to hear from you! Reach out to us through any of these
            channels:
          </p>

          <h3>Email</h3>
          <p>
            <a href="mailto:contact@cleoattendance.com">
              contact@cleoattendance.com
            </a>
          </p>

          <h3>Phone</h3>
          <p>+89 72056150</p>

          <h3>Address</h3>
          <p>
            Ring road 4,  
            <br />
            Quarter 4, Thoi Hoa Ward,
            <br />
            Ben Cat City, Binh Duong Province
          </p>

          <h3>Social Media</h3>
          <p>Follow us on social media for updates and news!</p>
          <div className="social-links">
            <a href="#" onClick={handleSocialClick} rel="noopener noreferrer">
              Twitter
            </a>{" "}
            |
            <a href="#" onClick={handleSocialClick} rel="noopener noreferrer">
              LinkedIn
            </a>{" "}
            |
            <a href="#" onClick={handleSocialClick} rel="noopener noreferrer">
              Facebook
            </a>
          </div>
        </div>
      ),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-content">
          <Link href="/" className="top-bar-logo-link" aria-label="Homepage">
            <div className="top-bar-logo"></div> {/* White circle */}
            <span className="top-bar-text">Cleo</span>
          </Link>

          <div className="top-bar-nav">
            <button className="nav-button" onClick={openVideoModal}>
              Quick Start
            </button>
            <button className="nav-button" onClick={openAboutModal}>
              About Us
            </button>
            <button className="nav-button" onClick={openContactModal}>
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* Modal được render cuối cùng để hiển thị trên cùng */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalContent.title}
        content={modalContent.content}
      />
    </>
  );
}
