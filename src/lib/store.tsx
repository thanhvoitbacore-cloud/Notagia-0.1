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
  isLoaded: boolean;
};

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedNotes = sessionStorage.getItem("notagia_notes");
    const savedTests = sessionStorage.getItem("notagia_tests");
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedTests) setTests(JSON.parse(savedTests));
    setIsLoaded(true);
  }, []);

  // Save to sessionStorage when updated
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("notagia_notes", JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("notagia_tests", JSON.stringify(tests));
    }
  }, [tests, isLoaded]);

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
    // Also delete associated tests
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
