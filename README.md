# AI-Powered Alumni Networking & Career Mentorship Platform

A modern, full-featured web platform connecting students with alumni for career guidance, personalized roadmap tracking, mentorship requests, real-time messaging, and AI-powered career assistance and resume review.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🌟 Key Features

### 1. Student Dashboard (`/dashboard`)
* **Dynamic Welcome Header:** Personalized greeting and high-level progress indicators.
* **Student Profile Summary:** Profile completion percentage derived dynamically from mock student data with inline editing.
* **Mentorship Activity Feed:** Outgoing requests, pending approvals, and active mentor connections.
* **Recommended Alumni & Networking:** Smart alumni recommendations with match rationales and one-click mentorship requests.
* **Upcoming Events:** University and industry webinars/meetups with RSVP tracking.

### 2. Alumni Discovery & Profiles (`/alumni` & `/alumni/[id]`)
* **Multi-Facet Search & Filters:** Filter alumni by job role, company, industry, technical skills, years of experience, and mentorship availability.
* **Detailed Alumni Profiles:** View full work history, education, expertise, mentorship availability status, and initiate direct mentorship requests.

### 3. Mentorship Management (`/mentorship`)
* **Tabbed Connection Management:** Filter requests by *All*, *Pending*, *Accepted*, and *Declined*.
* **Perspective Switching:** Switch between *Outgoing* (Student view) and *Incoming* (Mentor view) requests.
* **Non-Contradictory Actions:** Cancel pending requests, accept or decline incoming requests with custom reasons, or jump straight into direct conversations.

### 4. Direct Messaging (`/messages`)
* **Responsive 2-Pane Chat:** Real-time conversation list with search filtering, unread badges, and status indicators.
* **Thread Conversation View:** Formatted message bubbles, delivery timestamps, read receipts, quick reply prompts, and multi-line composer (`Enter` to send, `Shift + Enter` for new line).

### 5. AI Career Suite
* **AI Career Assistant (`/career-assistant`):** Interactive conversational agent with starter prompt suggestions, markdown-style answer rendering, and typing simulation.
* **Personalized Career Roadmap (`/career-roadmap`):** Step-by-step career milestones (Foundations, Advanced Projects, Internships, Full-Time Roles) with categorized skill gaps and recommended alumni mentors.
* **AI Resume Review (`/resume-review`):** Drag-and-drop resume uploader with sample files, ATS scoring breakdowns (Overall, Impact, Formatting, Skills), and actionable recommendations.

### 6. Settings & Preferences (`/settings`)
* **Comprehensive Preferences:** Configure Account & Security, Public Profile, Career Goals, Notification Channels (Email/In-App/Push), Privacy Controls, and Theme.

---

## 🛠 Tech Stack

* **Framework:** Next.js 16 (App Router, Turbopack)
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS 4
* **Icons:** Lucide React
* **State Management:** Reactive Browser Storage (`localStorage`) with event broadcasting
* **Architecture:** Typed Service Layer (`src/services/`) ready for REST / GraphQL backend APIs

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18.18+ or later
* npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/AshlinMirsha/Ai_Alumni_Mentorship.git

# Navigate to the project directory
cd Ai_Alumni_Mentorship

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server with hot-reloading
npm run dev

# Or build and start the optimized production server
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root shell and font setup
│   │   ├── page.tsx                       # Landing page
│   │   ├── login/page.tsx                 # Demo login & role selection
│   │   ├── signup/page.tsx                # Role-based onboarding
│   │   ├── dashboard/page.tsx             # Student dashboard
│   │   ├── alumni/                        # Alumni directory and profile pages
│   │   ├── career-assistant/page.tsx      # AI conversational guidance
│   │   ├── career-roadmap/page.tsx        # Career milestones & skill gap tracker
│   │   ├── resume-review/page.tsx         # ATS resume score & feedback
│   │   ├── mentorship/page.tsx            # Mentorship requests & connections
│   │   ├── messages/page.tsx              # Direct messaging module
│   │   └── settings/page.tsx              # User preferences & account settings
│   ├── components/                        # Reusable UI & domain-specific components
│   ├── lib/
│   │   ├── dashboard-storage.ts           # Centralized state management & event dispatcher
│   │   ├── mock-data.ts                   # Centralized seed mock dataset
│   │   └── utils.ts                       # Helper functions
│   ├── services/                          # Typed abstraction layer for backend migration
│   └── types/                             # TypeScript data models
```

---

## 📄 License

This project is open source and available under the MIT License.
