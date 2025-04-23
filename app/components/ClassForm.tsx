"use client";

import { useState, useEffect } from "react";
import { addClassAction, updateClassAction } from "../../lib/actions";
import { useAuth } from "../../context/AuthContext";
import type { ClassDocument } from "../../lib/firestoreTypes";

interface ClassFormProps {
  editingClass?: ClassDocument;
  onSuccess?: () => void;
  onCancel?: () => void;
  isFirebaseError?: boolean;
}

export default function ClassForm({
  editingClass,
  onSuccess,
  onCancel,
  isFirebaseError,
}: ClassFormProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isFirebaseError) {
      setError(null);
    }
  }, [isFirebaseError]);

  const isEditing = !!editingClass;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isFirebaseError) {
      setError("Cannot save class due to a Firebase connection issue.");
      return;
    }

    if (!user) {
      setError("You must be logged in to perform this action");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      if (!isEditing) {
        formData.append("teacherId", user.uid);
      }

      let response;
      if (isEditing) {
        response = await updateClassAction(editingClass.id, formData);
      } else {
        response = await addClassAction(formData);
      }

      if (response.error) {
        setError(response.error);
      } else if (response.success) {
        if (onSuccess) onSuccess();
        if (!isEditing) {
          e.currentTarget.reset();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred during save.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? "Edit Class" : "Add New Class"}
      </h2>

      {isFirebaseError && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-700 rounded">
          Saving disabled due to a Firebase connection issue.
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Class Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={editingClass?.name || ""}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isFirebaseError}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="joinCode" className="block text-sm font-medium mb-1">
          Join Code (Optional)
        </label>
        <input
          type="text"
          id="joinCode"
          name="joinCode"
          defaultValue={editingClass?.joinCode || ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={isFirebaseError}
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSubmitting || isFirebaseError}
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Update Class"
            : "Add Class"}
        </button>
      </div>
    </form>
  );
}
