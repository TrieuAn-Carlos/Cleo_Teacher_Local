"use client";

import { useRef, useState } from "react";
import { addClassAction } from "../../lib/actions";
import { useAuth } from "../../context/AuthContext";

/**
 * Example component showing how to use server actions directly with a form
 * This is an alternative approach to using a reusable component like ClassForm
 */
export default function DirectActionForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useAuth();
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAction(formData: FormData) {
    if (!user) {
      setMessage({
        text: "You must be logged in to perform this action",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add the teacher ID to the form data
      formData.append("teacherId", user.uid);

      // Call the server action
      const result = await addClassAction(formData);

      if (result.error) {
        setMessage({
          text: result.error,
          type: "error",
        });
      } else {
        setMessage({
          text: "Class created successfully!",
          type: "success",
        });

        // Reset the form
        formRef.current?.reset();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({
        text: "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Class (Direct Action)</h2>

      {message && (
        <div
          className={`mb-4 p-2 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form ref={formRef} action={handleAction} className="space-y-4">
        <div>
          <label
            htmlFor="direct-name"
            className="block text-sm font-medium mb-1"
          >
            Class Name
          </label>
          <input
            type="text"
            id="direct-name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label
            htmlFor="direct-join-code"
            className="block text-sm font-medium mb-1"
          >
            Join Code (Optional)
          </label>
          <input
            type="text"
            id="direct-join-code"
            name="joinCode"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isSubmitting ? "Creating..." : "Create Class"}
        </button>
      </form>
    </div>
  );
}
