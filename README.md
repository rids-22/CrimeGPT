# CrimeGPT - Police Case Documentation & Legal Intelligence Portal

CrimeGPT is an AI-powered Criminal Case Documentation and Legal Intelligence Platform built specifically for Indian Police Departments. It streamlines police paperwork from FIR registration to court production, auto-generating legal letters (Remand Requests, Medical Examinations, Seizure Receipts, and Custody Letters) while maintaining a strict chronological Investigation Diary and suggesting relevant penal/procedural sections of law.

---

## 🏛️ Modern Legal Compliance: BNS, BNSS, BSA vs. IPC, CrPC, IEA
On **July 1, 2024**, India replaced its colonial-era laws with three modern codes:
1. **BNS (Bharatiya Nyaya Sanhita)** replaced the **IPC (Indian Penal Code)**
2. **BNSS (Bharatiya Nagarik Suraksha Sanhita)** replaced the **CrPC (Code of Criminal Procedure)**
3. **BSA (Bharatiya Sakshya Adhiniyam)** replaced the **IEA (Indian Evidence Act)**

**CrimeGPT** serves as a legal translator for investigating officers during this transition period. When an officer inputs an incident narrative, the system maps the corresponding sections across **both** frameworks and provides a detailed legal transition analysis.

---

## 🚀 Key Features
1. **JWT Authentication & RBAC**: Roles for Investigating Officer (IO), SHO, Legal Advisor, and Administrator.
2. **Centralized Case Management**: Form wizard to capture Case details, Victim, Accused, Witness, and Crime description.
3. **AI Legal Assistant**: Automatically recommends BNS, BNSS, BSA, IPC, CrPC sections, and landmark Supreme Court judgments.
4. **Tesseract OCR Document Scanner**: Extracts text from scanned FIR images and automatically populates case forms.
5. **Digital Case Diary**: Interactive chronological log tracking investigation milestones (e.g. Statements, Arrests, Evidence Seizure).
6. **Multilingual Letter Generation**: Auto-generates official letters (Remand Request, Medical Exam, Seizure Receipt, Custody) in **English, Hindi, and Gujarati**.
7. **Export Formats**: One-click edit-before-export for PDFs, Word DOCX, and browser-native printing.
8. **Compliance Audit Trail**: Immutable logging database recording actions, timestamps, operators, and parameters.
9. **Zero-Configuration Fallback**: Connects to PostgreSQL, with a smart automatic fallback to SQLite (`crimegpt.sqlite`) if PostgreSQL is unavailable.

---

## 📂 Project Directory Structure

```
crimegpt/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                   # DB configs, schema builders, and fallback managers
│   │   ├── middleware/
│   │   │   └── auth.ts                 # JWT authenticators and RBAC guards
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts      # Signs tokens, profiles, and quick logins
│   │   │   ├── case.controller.ts      # CRUD case, timeline addition, and stats
│   │   │   ├── ai.controller.ts        # AI section recommenders
│   │   │   ├── ocr.controller.ts       # Handles scans and calls parser
│   │   │   ├── document.controller.ts  # Compile previews and downloads
│   │   │   └── audit.controller.ts     # Audit logs search database
│   │   ├── routes/                     # Router endpoints mapping
│   │   ├── services/
│   │   │   ├── ai.service.ts           # OpenAI + local keyword translation matrix
│   │   │   ├── ocr.service.ts          # Tesseract.js buffer reader and regex parser
│   │   │   └── document.service.ts     # Multi-lingual templates + PDFKit + docx generator
│   │   └── index.ts                    # Express bootstrap server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.tsx         # User sessions and authorization headers
    │   │   └── LanguageContext.tsx     # Handles EN / HI / GU toggle states
    │   ├── components/
    │   │   ├── Layout.tsx              # Sidebar menu, active badges, language dropdown
    │   │   └── ProtectedRoute.tsx      # Clearances and role gatekeepers
    │   ├── pages/
    │   │   ├── Login.tsx               # Login panel with quick-tap credentials
    │   │   ├── Dashboard.tsx           # Stat metrics, latest activity feeds, maps
    │   │   ├── CaseList.tsx            # Full case table list and advanced search
    │   │   ├── NewCase.tsx             # Step wizard + OCR drag & drop + AI sidebars
    │   │   ├── CaseDetailsPage.tsx     # Tabbed case views (timeline, exports, evidence)
    │   │   └── AuditLogs.tsx           # Compliance logs visualizer for ADMINS
    │   ├── utils/
    │   │   └── translations.ts         # English / Hindi / Gujarati translation dictionary
    │   ├── App.tsx                     # Router paths definition
    │   └── main.tsx                    # ReactDOM entry mount
    ├── package.json
    ├── tailwind.config.js
    └── index.html
```

---

## 🛠️ Database Schema

When the backend boots, it automatically verifies and builds the following tables:

1. **`users`**: Stores user authentication credentials, names, roles (`IO`, `SHO`, `LEGAL_ADVISOR`, `ADMIN`), and police stations.
2. **`cases`**: Unified registry containing case details, victim metadata, accused mugshot url, and current status (`ACTIVE`, `ARRESTED`, `CLOSED`).
3. **`evidence`**: File lists containing recovered weapon categories, details, file links, and timestamps.
4. **`case_diary`**: Chronological diary entries associated with investigations, recording entry type, descriptions, and the recording officer's name.
5. **`audit_logs`**: Compliance trail recording usernames, actions, dates, and JSON details of modified values.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (v18 or higher)
- NPM

### Step 1: Clone and Configure Environment Files
Navigate to `crimegpt/backend/` and modify `.env` if needed:
```env
PORT=5000
JWT_SECRET=crimegpt_secret_key_2026_police_dept

# If PostgreSQL parameters are commented out, 
# CrimeGPT will automatically launch in SQLite mode out of the box!
USE_SQLITE=true

# Add key to use OpenAI GPT-4o models. 
# If empty, the app runs on a rule-based NLP matcher to work offline.
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

---

### Step 2: Start the Backend Server
Open a terminal in the `crimegpt/backend/` folder and run:
```bash
# Install packages
npm install

# Start in development mode (nodemon)
npm run dev
```
The server will boot on port **5000**. The tables will automatically initialize in SQLite/PostgreSQL.

---

### Step 3: Start the Frontend App
Open another terminal in the `crimegpt/frontend/` folder and run:
```bash
# Install packages
npm install

# Start Vite server
npm run dev
```
Vite will serve the frontend at `http://localhost:3000`. The Vite server is configured with a proxy mapping requests from `/api` to the backend on port **5000**, preventing CORS issues.

---

## 🔑 Demonstration Accounts

To simplify grading and evaluation, the login page features a **Quick Roles Access** selector. You can click on any role button to log in instantly without typing:

| Role | Username | Password | Purpose / Clearance |
| :--- | :--- | :--- | :--- |
| **Investigating Officer** | `io_sharma` | `password123` | Can file cases, log evidence, write diary entries, generate letters. |
| **Station House Officer** | `sho_singh` | `password123` | Can view, arrest, close case files, and manage police stations. |
| **Legal Advisor** | `legal_verma` | `password123` | Reads case entries and views AI BNS/IPC recommendations. |
| **System Administrator** | `admin_crimegpt` | `password123` | Full visibility, including access to the immutable **Compliance Audit Trail**. |

---

## 🔬 Hackathon Demo Script / Flow
1. **Login**: Click on the **Investigating Officer** quick login button.
2. **Fast FIR Registration (OCR)**: Go to **New Case** and upload an image (e.g. an image containing "theft" or "murder" in its filename, or any scanned FIR). Tesseract OCR will run, parse fields, and pre-populate the entire wizard.
3. **AI Recommendations**: Scroll to Step 5 (Narrative & AI) and click **Suggest Legal Sections**. Inspect BNS, BNSS, BSA, IPC equivalents, and landmark judgments. Click **Submit**.
4. **Timeline Entry**: Go to the **Investigation Diary** tab inside Case Details, select "STATEMENT_RECORDED" and log a witness statement. Notice it updates the timeline instantly.
5. **Add Evidence**: Go to the **Evidence Collection** tab and record a mock weapon (e.g. CCTV tape). It will log it to the diary timeline.
6. **Arrest Booking**: Click **Book Arrest** at the top banner to arrest the accused. This logs "ARREST_MADE" in the case diary.
7. **Document generation**: Go to the **Auto Documents** tab. Select **Remand Request**, choose language as **Hindi (हिन्दी)** or **Gujarati (ગુજરાતી)** or Marathi. Click **Export PDF** or **Word (DOCX)**. Inspect the formatted file.
8. **Compliance Audit**: Log out, click **System Administrator** quick login, and visit the **Audit Logs** tab in the sidebar. Inspect all logged actions, Operator names, and JSON parameters.
