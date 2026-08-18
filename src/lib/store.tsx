"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type Option = {
  id: string;
  questionId: string;
  optionText: string;
};

export type Question = {
  id: string;
  testId: string;
  questionText: string;
  correctAnswerId: string;
  explanation: string;
  options: Option[];
};

export type Test = {
  id: string;
  noteId: string;
  title: string;
  createdAt: string;
  questions: Question[];
};

type StoreState = {
  notes: Note[];
  tests: Test[];
  addNote: (note: Omit<Note, "id" | "createdAt">) => Note;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addTest: (test: Omit<Test, "id" | "createdAt">) => Test;
  deleteTest: (id: string) => void;
  exportWorkspace: () => void;
  importWorkspace: (jsonContent: string) => { success: boolean; notesCount: number; testsCount: number; error?: string };
  exportNoteAsMarkdown: (noteId: string) => void;
  clearWorkspace: () => void;
  isLoaded: boolean;
};

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const addNote = (noteData: Omit<Note, "id" | "createdAt">) => {
    const newNote: Note = {
      id: "note_" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...noteData,
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, noteData: Partial<Note>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...noteData } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setTests((prev) => prev.filter((t) => t.noteId !== id));
  };

  const addTest = (testData: Omit<Test, "id" | "createdAt">) => {
    const newTest: Test = {
      id: "test_" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...testData,
    };
    setTests((prev) => [newTest, ...prev]);
    return newTest;
  };

  const deleteTest = (id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
  };

  const exportWorkspace = () => {
    const data = {
      version: "0.1",
      exportedAt: new Date().toISOString(),
      notes,
      tests,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = `notagia-workspace-${new Date().toISOString().slice(0, 10)}.notagia.json`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkspace = (jsonContent: string) => {
    try {
      const data = JSON.parse(jsonContent);
      const importedNotes: Note[] = Array.isArray(data.notes) ? data.notes : [];
      const importedTests: Test[] = Array.isArray(data.tests) ? data.tests : [];

      setNotes(importedNotes);
      setTests(importedTests);

      return {
        success: true,
        notesCount: importedNotes.length,
        testsCount: importedTests.length,
      };
    } catch (err: any) {
      return {
        success: false,
        notesCount: 0,
        testsCount: 0,
        error: err?.message || "Invalid workspace file format",
      };
    }
  };

  const exportNoteAsMarkdown = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const mdContent = `# ${note.title}\n\n${note.content}\n`;
    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = note.title.replace(/[^a-z0-9_-]/gi, "_").toLowerCase() || "note";
    a.href = url;
    a.download = `${safeTitle}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearWorkspace = () => {
    setNotes([]);
    setTests([]);
  };

  return (
    <StoreContext.Provider
      value={{
        notes,
        tests,
        addNote,
        updateNote,
        deleteNote,
        addTest,
        deleteTest,
        exportWorkspace,
        importWorkspace,
        exportNoteAsMarkdown,
        clearWorkspace,
        isLoaded,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
