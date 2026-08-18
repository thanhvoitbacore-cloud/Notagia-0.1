# Notagia 0.1 — Comprehensive Project Analysis & Architectural Documentation

> **Notagia** is an AI-powered knowledge management and quiz generation platform built with Next.js 16, Prisma, Neon PostgreSQL, and Google Gemini API. It enables users to create structured notes, instantly transform them into interactive quizzes using AI, compete on public leaderboards, and allows administrators to monitor platform activity through an analytics dashboard.

---

## 1. Executive Summary & Core Objective

Notagia bridges the gap between passive note-taking and active retrieval practice. By leveraging generative AI, Notagia automatically analyzes study notes and synthesizes 4-option multiple-choice quizzes complete with vietnamese explanations while preserving exact technical terminology.

### Primary Use Cases & Core Features:
- **Intelligent Note Management**: Create, edit, search, and manage study notes.
- **AI Quiz Generation**: 1-click transformation of note contents into structured quizzes via `gemini-2.5-flash`.
- **Interactive Quiz Player**: Instant test-taking environment with timer tracking, real-time scoring, and explanation reviews.
- **Community & Leaderboards**: Public test sharing feed with score/time ranking leaderboards and social likes/dislikes.
- **Role-Based Access Control**: Separate `USER` and `ADMIN` roles with dedicated dashboard experiences.
- **Admin Management & Analytics**: Interactive user administration, activity monitoring, and data visualization using Recharts.

---

## 2. Technology Stack & Architectural Overview

| Domain | Technology / Package | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.1 (App Router + Turbopack) | Server Components, Server Actions, Dynamic Routing |
| **UI Library & React** | React 19.2.4 | Client/Server rendering engine |
| **Database Engine** | Neon (Serverless PostgreSQL) | Cloud SQL persistence with WebSocket connection pool adapter |
| **ORM & Migrations** | Prisma 7.6.0 (`@prisma/client`, `@prisma/adapter-neon`) | Type-safe schema definition and query engine |
| **AI Integration** | Google Generative AI (`@google/generative-ai`) | `gemini-2.5-flash` model for structured JSON quiz extraction |
| **Styling & Icons** | Tailwind CSS v4 (`@tailwindcss/postcss`), Lucide React | Modern dark-mode styling, animations, responsive design |
| **Authentication & Auth** | Custom JWT via `jose` & `bcryptjs` | HttpOnly session cookie auth with role enforcement |
| **State Management** | React Context (`StoreProvider`) & `sessionStorage` | Client-side reactive note/quiz store with session persistence |
| **Data Visualization** | Recharts 3.8.1 | Admin dashboard chart widgets |

---

## 3. Database Schema & Data Model (Prisma)

The relational schema is defined in [`prisma/schema.prisma`](file:///d:/Project%20Packing/Notagia/Notagia-0.1/prisma/schema.prisma) and relies on 7 core entities:

```mermaid
erDiagram
    USER ||--o{ NOTE : creates
    USER ||--o{ TEST : owns
    USER ||--o{ COMMUNITY_POST : publishes
    USER ||--o{ LEADERBOARD_ATTEMPT : performs
    NOTE ||--o{ TEST : generates
    TEST ||--o{ QUESTION : contains
    TEST ||--o| COMMUNITY_POST : shared_as
    TEST ||--o{ LEADERBOARD_ATTEMPT : tracked_in
    QUESTION ||--o{ OPTION : has

    USER {
        string id PK
        string email UK
        string password
        string name
        string image
        Role role "USER | ADMIN"
        datetime createdAt
    }

    NOTE {
        string id PK
        string userId FK
        string title
        string content
        datetime createdAt
    }

    TEST {
        string id PK
        string noteId FK
        string userId FK
        string title
        boolean isPublic
        datetime createdAt
    }

    QUESTION {
        string id PK
        string testId FK
        string questionText
        string correctAnswerId
        string explanation
    }

    OPTION {
        string id PK
        string questionId FK
        string optionText
    }

    COMMUNITY_POST {
        string id PK
        string testId FK, UK
        string userId FK
        int likes
        int dislikes
    }

    LEADERBOARD_ATTEMPT {
        string id PK
        string testId FK
        string userId FK
        int score
        int timeTakenSeconds
        datetime createdAt
    }
```

---

## 4. Key Workflows & Application Architecture

### 4.1 AI Quiz Generation Flow (`/api/generate-test`)
1. User clicks **"Generate Test"** from a Note view ([`src/components/generate-test-button.tsx`](file:///d:/Project%20Packing/Notagia/Notagia-0.1/src/components/generate-test-button.tsx)).
2. Request sends note title and content to POST endpoint [`src/app/api/generate-test/route.ts`](file:///d:/Project%20Packing/Notagia/Notagia-0.1/src/app/api/generate-test/route.ts).
3. Gemini model (`gemini-2.5-flash`) processes the prompt with strict system instructions:
   - Returns 3–10 multiple choice questions.
   - Enforces 4 options per question (`A`, `B`, `C`, `D`).
   - Requires Vietnamese output for questions/explanations while keeping original technical terms intact.
   - Outputs pure JSON using `responseMimeType: "application/json"`.
4. Client receives structured JSON, assigns question/option IDs, and updates local state store + routes to test player.

### 4.2 Authentication & Middleware Protection (`src/proxy.ts` & `src/lib/session.ts`)
- Passwords stored as `bcryptjs` salted hashes (12 rounds).
- Sessions are stored in HttpOnly, SameSite `session` cookies encrypted via `jose` JWTs.
- `src/proxy.ts` middleware verifies valid sessions for `/dashboard` and `/notes` routes and enforces role redirects for `ADMIN` routes.

### 4.3 Interactive Quiz Execution & Scoring (`src/components/test-player.tsx`)
- Questions rendered sequentially with option selection.
- Timer tracks active test duration (`timeTakenSeconds`).
- Upon submission, score is calculated and recorded to the database via `submitTestAttempt` server action in [`src/app/actions/tests.ts`](file:///d:/Project%20Packing/Notagia/Notagia-0.1/src/app/actions/tests.ts).

### 4.4 Community & Leaderboards (`src/app/(app)/dashboard/community/page.tsx`)
- Users can toggle tests to `isPublic`.
- Public tests appear in the community feed.
- Leaderboard ranks attempts by:
  1. Highest Score (`score` DESC)
  2. Lowest Time (`timeTakenSeconds` ASC)

---

## 5. Complete Directory & File Structure Guide

```
Notagia-0.1/
├── AGENTS.md                   # Environment rules & Next.js notices
├── notagia-markdown.md          # Original project requirements specification
├── package.json                # Project dependencies & scripts
├── next.config.ts              # Next.js configuration
├── prisma.config.ts            # Prisma setup & configuration
├── prisma/
│   ├── schema.prisma           # Relational schema (User, Note, Test, Question, Option, etc.)
│   └── seed.ts                 # Database seeding script for sample users & data
└── src/
    ├── proxy.ts                # Application authentication middleware proxy
    ├── app/
    │   ├── layout.tsx          # Root layout wrapper (Font, StoreProvider)
    │   ├── page.tsx            # Landing page (Notagia 0.1 entry point)
    │   ├── globals.css         # Tailwind v4 styles & custom keyframes
    │   ├── (auth)/             # Auth route group
    │   │   ├── login/          # User login page
    │   │   └── signup/         # User registration page
    │   ├── (app)/dashboard/    # User Dashboard application route group
    │   │   ├── layout.tsx      # Dashboard main layout with sidebar
    │   │   ├── page.tsx        # Dashboard home overview
    │   │   ├── notes/          # Note listing, editor, & detailed view
    │   │   ├── tests/          # Test manager & interactive quiz player
    │   │   ├── community/      # Public test feed & leaderboards
    │   │   └── settings/       # Profile management & password security
    │   ├── (admin)/admin/      # Admin Panel route group
    │   │   ├── layout.tsx      # Admin panel navigation layout
    │   │   ├── page.tsx        # Analytics overview dashboard (Recharts)
    │   │   ├── users/          # User management table & detail drawer
    │   │   ├── content/        # Content moderation page
    │   │   └── activity/       # System activity logs
    │   ├── actions/            # Next.js Server Actions
    │   │   ├── auth.ts         # User signup, login, logout logic
    │   │   ├── notes.ts        # Note CRUD operations
    │   │   ├── tests.ts        # Test submissions & visibility toggles
    │   │   ├── settings.ts     # User profile updates & password resets
    │   │   └── admin.ts        # Admin user deletion & permission checks
    │   └── api/                # API Endpoints
    │       ├── generate-test/  # Google Gemini AI quiz generation route
    │       └── admin-seed/     # Admin database seed trigger route
    ├── components/             # Reusable UI Components
    │   ├── dashboard-sidebar.tsx  # Main user application sidebar navigation
    │   ├── admin-sidebar.tsx      # Admin panel sidebar navigation
    │   ├── admin-chart.tsx        # Recharts visual analytics component
    │   ├── generate-test-button.tsx# AI Test trigger button component
    │   ├── test-player.tsx        # Interactive quiz taking component
    │   ├── settings-form.tsx      # Profile update & password form
    │   └── ui/                    # Base UI elements (buttons, inputs, cards)
    └── lib/                    # Shared Helpers & Services
        ├── prisma.ts           # Prisma client singleton instance
        ├── session.ts          # Encrypted JWT session cookies management
        ├── store.tsx           # React Context store with sessionStorage sync
        └── utils.ts            # Tailwind class helper (`cn`)
```

---

## 6. API Endpoint & Server Action Reference

### 6.1 API Routes

#### `POST /api/generate-test`
- **Description**: Sends note text to Gemini AI to generate a structured multiple-choice quiz.
- **Request Body**:
  ```json
  {
    "noteTitle": "string",
    "noteContent": "string"
  }
  ```
- **Response Output**:
  ```json
  {
    "success": true,
    "data": {
      "test_title": "string",
      "questions": [
        {
          "question_text": "string",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer_id": "A | B | C | D",
          "explanation": "string"
        }
      ]
    }
  }
  ```

---

## 7. Setup, Environment & Deployment Instructions

### Prerequisites
- Node.js 18+ or 20+ installed.
- PostgreSQL database instance (Neon PostgreSQL recommended).
- Google Gemini API key.

### Environment Configuration (`.env`)
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@ep-sample-pooler.neon.tech/notagia?sslmode=require"
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
SESSION_SECRET="your-super-secret-32-character-string"
```

### Installation & Initialization
1. Install dependencies:
   ```bash
   npm install
   ```
2. Push database schema to Neon:
   ```bash
   npx prisma db push
   ```
3. Seed default data (optional):
   ```bash
   npx prisma db seed
   ```
4. Run development server with Turbopack:
   ```bash
   npm run dev
   ```
5. Access application in browser at `http://localhost:3000`.

---

## 8. Strengths & Future Roadmap Recommendations

### Current System Strengths:
- **Fast & Modern Stack**: Built with Next.js 16 + React 19 + Turbopack for rapid HMR and optimal server performance.
- **Bilingual Context Intelligence**: Gemini prompt ensures Vietnamese output while retaining original technical terminology.
- **Full-featured Admin Portal**: Integrated analytics visualization with Recharts for operational control.

### Recommended Enhancements:
1. **Database Test Persistence**: Currently tests generated on client store can be fully synced directly to Prisma PostgreSQL backend upon creation.
2. **Spaced Repetition Flashcards**: Expand generated questions into flashcard decks (Anki export format).
3. **Multi-modal Support**: Allow generating tests directly from uploaded PDFs, images, or audio transcripts via Gemini 2.5 Multi-modal capabilities.
