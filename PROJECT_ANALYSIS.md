# Notagia 0.1 — Local-Session AI Workspace Documentation

> **Notagia** is a lightweight, serverless AI-powered knowledge management and quiz generation platform built with Next.js 16 and Google Gemini API. It operates entirely without authentication or database overhead — every session starts fresh in memory, and users can export or import their workspace (notes & AI quizzes) via `.json` or `.md` files anytime.

---

## 1. Core Architecture & Design Philosophy

1. **Zero Database & Zero Authentication**:
   - No sign-up, login, or database (PostgreSQL/Prisma) required.
   - Anyone accessing the web app instantly enters the workspace.
2. **Fresh Session Memory**:
   - Notes and AI quizzes live in active memory during the session.
   - Reloading or opening a new browser tab initializes a clean session.
3. **Lossless File Backup & Import/Export**:
   - **Export Workspace (`.notagia.json` / `.json`)**: Downloads all current notes, AI-generated quiz questions, options, correct answer keys, and explanations into a single portable backup file.
   - **Import Workspace**: Allows uploading an exported backup file into any fresh session to instantly restore the full workspace.
   - **Export Markdown (`.md`)**: Individual notes can be downloaded as standard Markdown files.
4. **AI Quiz Extraction**:
   - Uses Google Gemini (`gemini-2.5-flash`) via POST `/api/generate-test` to convert study notes into structured 4-option multiple-choice quizzes with Vietnamese explanations.

---

## 2. Technology Stack

| Domain | Technology / Package | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.1 (App Router + Turbopack) | Server Components, Client State Rendering |
| **UI Engine** | React 19.2.4 | Dynamic state management & components |
| **AI Generation** | Google Generative AI (`@google/generative-ai`) | Gemini 2.5 Flash model for structured JSON quiz output |
| **Styling & UI** | Tailwind CSS v4, Lucide React | Modern dark-theme interface & responsive layouts |
| **State Management** | React Context (`StoreProvider` in `src/lib/store.tsx`) | In-memory session store + JSON/Markdown file export/import |

---

## 3. Key Workflows & Features

### 3.1 Workspace File Backup & Restore
- **Export**: Handled by `exportWorkspace()` in `src/lib/store.tsx`. Generates a timestamped JSON file containing all notes and tests.
- **Import**: Handled by `importWorkspace(jsonString)` in `src/lib/store.tsx`. Parses uploaded JSON and hydrates active React state.
- **Markdown Export**: Handled by `exportNoteAsMarkdown(noteId)` for exporting individual notes.

### 3.2 AI Quiz Generation (`/api/generate-test`)
1. User clicks **"Generate Test"** from a note view.
2. Endpoint `/api/generate-test` sends note text to `gemini-2.5-flash`.
3. Gemini returns structured JSON with Vietnamese questions/explanations while preserving original technical terms.
4. Test is loaded into the interactive `TestPlayer` component.

---

## 4. Directory Structure

```
Notagia-0.1/
├── package.json                # Lightened dependencies (Next.js, React, Gemini AI, Lucide)
├── next.config.ts              # Next.js 16 configuration
├── PROJECT_ANALYSIS.md         # Updated architecture & workflow documentation
└── src/
    ├── app/
    │   ├── layout.tsx          # Root layout wrapper (StoreProvider)
    │   ├── page.tsx            # Landing page (Direct access to workspace)
    │   ├── globals.css         # Tailwind v4 dark theme styles
    │   └── (app)/dashboard/    # Workspace Application Routes
    │       ├── layout.tsx      # Dashboard layout with sidebar navigation
    │       ├── page.tsx        # Workspace Session Dashboard Overview
    │       ├── notes/          # Note manager (list, create, edit, export .md)
    │       ├── tests/          # AI Quiz manager & interactive test player
    │       └── settings/       # Workspace Management & Backup/Restore page
    ├── components/
    │   ├── dashboard-sidebar.tsx  # Sidebar with quick Export/Import file controls
    │   ├── generate-test-button.tsx# AI Test generation trigger button
    │   └── test-player.tsx        # Interactive quiz player with timer & scoring
    └── lib/
        ├── store.tsx           # React Context store (in-memory + Export/Import handlers)
        └── utils.ts            # Utility functions (`cn`)
```

---

## 5. Setup & Environment Instructions

### Environment Configuration (`.env`)
```env
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```

### Running the App
```bash
npm install
npm run dev
```
Access at `http://localhost:3000`.
