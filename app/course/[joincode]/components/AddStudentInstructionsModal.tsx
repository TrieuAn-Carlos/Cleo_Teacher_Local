// File: app/course/[joincode]/components/AddStudentInstructionsModal.tsx
import React from "react";
import styles from "../course.module.css"; // Reuse existing styles

interface AddStudentInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackdropClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  joinCode: string;
}

const AddStudentInstructionsModal: React.FC<
  AddStudentInstructionsModalProps
> = ({ isOpen, onClose, onBackdropClick, joinCode }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onBackdropClick}>
      <div className={styles.joinCodeModal} style={{ maxWidth: "600px" }}>
        {" "}
        {/* Adjusted size */}
        <button className={styles.modalCloseBtn} onClick={onClose}>
          &times;
        </button>
        <div className={styles.joinCodeContent}>
          <h2>How Students Can Join</h2>
          <p style={{ fontSize: "1.3rem", color: "#eee", lineHeight: "1.6" }}>
            Tell your students to open the{" "}
            <strong style={{ color: "#fff" }}>Cleo student app</strong>, go to
            the <strong style={{ color: "#fff" }}>'Join Class'</strong> section,
            and enter the following code:
          </p>
          {/* Display the join code prominently */}
          <div
            className={styles.joinCodeDisplay}
            style={{ fontSize: "4rem", letterSpacing: "6px", margin: "20px 0" }}
          >
            {joinCode}
          </div>
          <p style={{ color: "#aaa", marginTop: "10px" }}>
            They will then be added to your student list.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddStudentInstructionsModal;
