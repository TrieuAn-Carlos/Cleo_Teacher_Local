"use client";

import React from "react";
import styles from "../course.module.css";
import Image from "next/image";

interface JoinCodeModalProps {
  joinCode: string;
  isOpen: boolean;
  onClose: () => void;
  onBackdropClick: (e: React.MouseEvent) => void;
}

const JoinCodeModal: React.FC<JoinCodeModalProps> = ({
  joinCode,
  isOpen,
  onClose,
  onBackdropClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onBackdropClick}>
      <div className={styles.joinCodeModal}>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className={styles.joinCodeContent}>
          <h2>Class Join Code</h2>
          <div className={styles.joinCodeDisplay}>{joinCode}</div>
          <p>Share this code with your students to join the class</p>
        </div>
      </div>
    </div>
  );
};

export default JoinCodeModal;
