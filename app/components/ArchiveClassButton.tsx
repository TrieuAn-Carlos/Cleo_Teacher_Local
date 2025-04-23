"use client";

import { useState } from "react";
import { archiveClassAction } from "../../lib/actions";

interface ArchiveClassButtonProps {
  classId: string;
  className: string;
  onSuccess?: () => void;
  isFirebaseError?: boolean;
}

export default function ArchiveClassButton({
  classId,
  className,
  onSuccess,
  isFirebaseError,
}: ArchiveClassButtonProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleArchive() {
    if (isFirebaseError) {
      setError("Action disabled due to Firebase connection issue.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to archive the class "${className}"? This action can be reversed by an administrator.`
    );

    if (!confirmed) return;

    setIsArchiving(true);
    setError(null);

    try {
      const response = await archiveClassAction(classId);

      if (response.error) {
        setError(response.error);
      } else if (response.success && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred during archive.");
      console.error("Error archiving class:", err);
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <div>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
      <button
        onClick={handleArchive}
        disabled={isArchiving || isFirebaseError}
        className="text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        aria-label={`Archive class ${className}`}
      >
        {isArchiving ? "Archiving..." : "Archive Class"}
      </button>
    </div>
  );
}
