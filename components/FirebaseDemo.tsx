"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addDocument,
  getCollection,
  updateDocument,
  deleteDocument,
} from "../lib/firestoreUtils";
import { uploadFile } from "../lib/storageUtils";

interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
  imageUrl?: string;
}

const FirebaseDemo = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await getCollection("notes");
      // Filter notes to only show those from the current user
      const userNotes = fetchedNotes.filter(
        (note: Note) => note.userId === user?.uid
      );
      setNotes(userNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Create the base note data
      const noteData: Omit<Note, "id"> = {
        title,
        content,
        userId: user.uid,
      };

      // If there's a file, upload it first
      if (file) {
        const timestamp = new Date().getTime();
        const filePath = `notes/${user.uid}/${timestamp}_${file.name}`;
        const uploadResult = await uploadFile(filePath, file);
        noteData.imageUrl = uploadResult.downloadURL;
      }

      // Add the note to Firestore
      await addDocument("notes", noteData);

      // Clear the form
      setTitle("");
      setContent("");
      setFile(null);

      // Reload notes to show the new one
      await loadNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      setLoading(true);
      await deleteDocument("notes", noteId);
      await loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-4">Please log in to use this feature.</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Firebase Demo - Notes</h2>

      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-800 rounded-lg">
        <div className="mb-4">
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-white"
            rows={4}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Image (optional)</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 bg-gray-700 rounded text-white"
            accept="image/*"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Note"}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Notes</h3>

        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Create your first one!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-medium">{note.title}</h4>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-red-500 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
              <p className="mt-2">{note.content}</p>

              {note.imageUrl && (
                <div className="mt-3">
                  <img
                    src={note.imageUrl}
                    alt={note.title}
                    className="max-h-60 rounded-md object-contain"
                  />
                </div>
              )}

              {note.createdAt && (
                <p className="text-xs text-gray-400 mt-2">
                  Created: {new Date(note.createdAt.toDate()).toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FirebaseDemo;
