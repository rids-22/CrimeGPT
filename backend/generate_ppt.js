const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();

pptx.title = 'CrimeGPT - Solution Document & System Architecture';

// Define Theme Colors
const navyDark = '0A192F';   // Dark Navy
const goldAccent = 'D97706'; // Gold/Amber Accent
const slateLight = 'F8FAFC'; // Light Gray Background
const textDark = '1E293B';   // Slate Dark Body
const white = 'FFFFFF';
const borderGray = 'CBD5E1';

// Slide 1: Cover Slide (Dark Navy)
let slide1 = pptx.addSlide();
slide1.background = { fill: navyDark };

slide1.addText('CrimeGPT', {
  x: 1.0,
  y: 1.5,
  w: 8.0,
  h: 0.8,
  fontSize: 48,
  fontFace: 'Helvetica',
  color: white,
  bold: true,
  align: 'center'
});

slide1.addText('POLICE CASE DOCUMENTATION & LEGAL INTELLIGENCE PORTAL', {
  x: 1.0,
  y: 2.5,
  w: 8.0,
  h: 0.6,
  fontSize: 14,
  fontFace: 'Helvetica',
  color: goldAccent,
  bold: true,
  align: 'center',
  charSpacing: 2
});

slide1.addText('Solution Architecture & Legal Code Transition Specifications', {
  x: 1.0,
  y: 3.2,
  w: 8.0,
  h: 0.5,
  fontSize: 12,
  fontFace: 'Helvetica',
  color: '94A3B8',
  align: 'center'
});

slide1.addText('Designed for Indian Police Departments | Version 1.0.0', {
  x: 1.0,
  y: 4.8,
  w: 8.0,
  h: 0.4,
  fontSize: 10,
  fontFace: 'Helvetica',
  color: '64748B',
  align: 'center'
});

// Helper for standard slide header/footer decoration
function addStandardSlide(title) {
  const slide = pptx.addSlide();
  slide.background = { fill: slateLight };
  
  // Title
  slide.addText(title, {
    x: 0.5,
    y: 0.4,
    w: 9.0,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Helvetica',
    color: navyDark,
    bold: true
  });
  
  // Top thin accent bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5,
    y: 0.95,
    w: 9.0,
    h: 0.03,
    fill: goldAccent
  });

  // Footer bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5,
    y: 5.2,
    w: 9.0,
    h: 0.01,
    fill: borderGray
  });

  slide.addText('OFFICIAL DOCUMENT - INDIAN POLICE DEPT', {
    x: 0.5,
    y: 5.25,
    w: 5.0,
    h: 0.3,
    fontSize: 8,
    fontFace: 'Helvetica',
    color: '64748B'
  });

  slide.addText('CrimeGPT Legal Portal', {
    x: 7.5,
    y: 5.25,
    w: 2.0,
    h: 0.3,
    fontSize: 8,
    fontFace: 'Helvetica',
    color: '64748B',
    align: 'right'
  });

  return slide;
}

// Slide 2: Executive Summary
let slide2 = addStandardSlide('Executive Summary');
slide2.addText([
  { text: '• AI-powered legal intelligence system ', options: { bold: true, color: navyDark } },
  { text: 'engineered specifically to streamline the police investigation workflow from FIR registration to court production.\n\n' },
  { text: '• Transition Bridge: ', options: { bold: true, color: navyDark } },
  { text: 'Acts as a legal translation layer for officers migrating from colonial-era laws (IPC, CrPC, IEA) to modern codes (BNS, BNSS, BSA).\n\n' },
  { text: '• Form Digitization: ', options: { bold: true, color: navyDark } },
  { text: 'Incorporates scanned document OCR uploads, parsing text to populate case sheets under 10 seconds.\n\n' },
  { text: '• Forensic Transparency: ', options: { bold: true, color: navyDark } },
  { text: 'Maintains an interactive, chronological case diary timeline and logs compliance audit trails to ensure judicial credibility.' }
], {
  x: 0.5,
  y: 1.3,
  w: 9.0,
  h: 3.5,
  fontSize: 13,
  fontFace: 'Helvetica',
  color: textDark,
  lineSpacing: 22
});

// Slide 3: The Reform Context
let slide3 = addStandardSlide('Indian Penal Reform Compliance');
slide3.addText([
  { text: 'BNS (Bharatiya Nyaya Sanhita) ', options: { bold: true, color: navyDark } },
  { text: 'replaced the colonial-era ' },
  { text: 'IPC (Indian Penal Code) ', options: { italic: true } },
  { text: 'enacted in 1860.\n\n' },
  { text: 'BNSS (Bharatiya Nagarik Suraksha Sanhita) ', options: { bold: true, color: navyDark } },
  { text: 'replaced the ' },
  { text: 'CrPC (Code of Criminal Procedure) ', options: { italic: true } },
  { text: 'enacted in 1973, establishing new mandates for medical checkups, searches, and remand timings.\n\n' },
  { text: 'BSA (Bharatiya Sakshya Adhiniyam) ', options: { bold: true, color: navyDark } },
  { text: 'replaced the ' },
  { text: 'IEA (Indian Evidence Act) ', options: { italic: true } },
  { text: 'enacted in 1872, detailing new guidelines for digital files and electronic forensics admissibility.\n\n' },
  { text: 'Solution Duty: ', options: { bold: true, color: goldAccent } },
  { text: 'CrimeGPT serves as the operational translation portal, linking descriptions to correct legal acts under both frameworks concurrently.' }
], {
  x: 0.5,
  y: 1.3,
  w: 9.0,
  h: 3.5,
  fontSize: 12.5,
  fontFace: 'Helvetica',
  color: textDark,
  lineSpacing: 20
});

// Slide 4: Key Platform Features
let slide4 = addStandardSlide('Core Platform Features');
slide4.addText([
  { text: '1. Scanned FIR OCR Uploads: ', options: { bold: true, color: navyDark } },
  { text: 'Drag-and-drop OCR scans that pre-populate form wizards.\n' },
  { text: '2. AI Legal Translation Engine: ', options: { bold: true, color: navyDark } },
  { text: 'Suggests statutory sections and relevant landmark judgements.\n' },
  { text: '3. Digital Case Diary: ', options: { bold: true, color: navyDark } },
  { text: 'Chronological timeline of statements, evidence recoveries, and arrests.\n' },
  { text: '4. Multilingual Document Assembly: ', options: { bold: true, color: navyDark } },
  { text: 'Instantly drafts Remand, Medical, and Seizure Memos in English, Hindi, Gujarati, or Marathi.\n' },
  { text: '5. Compliance Audit Logs: ', options: { bold: true, color: navyDark } },
  { text: 'Immutable admin trail tracking username details, actions, and parameters.' }
], {
  x: 0.5,
  y: 1.3,
  w: 9.0,
  h: 3.5,
  fontSize: 12.5,
  fontFace: 'Helvetica',
  color: textDark,
  lineSpacing: 22
});

// Slide 5: System Architecture & Tech Stack
let slide5 = addStandardSlide('System Architecture & Tech Stack');
slide5.addText([
  { text: '• Frontend: ', options: { bold: true, color: navyDark } },
  { text: 'Single Page React Application built with Vite and TypeScript. Styled using responsive TailwindCSS. State managers handle authentication headers and translation matrices.\n\n' },
  { text: '• Backend: ', options: { bold: true, color: navyDark } },
  { text: 'Express.js Node API handling OCR processing, OpenAI API query assemblies, PDF compilation (PDFKit), and DOCX builds.\n\n' },
  { text: '• Dual Database Layer: ', options: { bold: true, color: navyDark } },
  { text: 'PostgreSQL utilized in staging/production setups, with smart automatic fallback to SQLite (`crimegpt.sqlite`) for local network setups or zero-configuration offline field stations.\n\n' },
  { text: '• Core Modules: ', options: { bold: true, color: goldAccent } },
  { text: 'Tesseract.js for OCR, OpenAI GPT-4o-mini API for legal parsing, JWT for authentication.' }
], {
  x: 0.5,
  y: 1.3,
  w: 9.0,
  h: 3.5,
  fontSize: 12,
  fontFace: 'Helvetica',
  color: textDark,
  lineSpacing: 18
});

// Slide 6: Role-Based Access Control (RBAC)
let slide6 = addStandardSlide('Role-Based Access Control (RBAC)');
slide6.addText([
  { text: '• Investigating Officer (IO): ', options: { bold: true, color: navyDark } },
  { text: 'Registers case details, uploads OCR image templates, triggers AI legal advice, logs evidence, witness depositions, and outputs legal drafts.\n\n' },
  { text: '• Station House Officer (SHO): ', options: { bold: true, color: navyDark } },
  { text: 'Supervises station cases. Approves registrations, updates case status (ACTIVE, ARRESTED, CLOSED), and audits precinct stats.\n\n' },
  { text: '• Legal Advisor: ', options: { bold: true, color: navyDark } },
  { text: 'Read-only access to case timelines, summaries, and AI recommendations to review and prepare court charges.\n\n' },
  { text: '• System Administrator: ', options: { bold: true, color: navyDark } },
  { text: 'Governs IT settings and holds read-only clearance to the Compliance Audit Log to review modified values.' }
], {
  x: 0.5,
  y: 1.3,
  w: 9.0,
  h: 3.5,
  fontSize: 12,
  fontFace: 'Helvetica',
  color: textDark,
  lineSpacing: 18
});

// Slide 7: OCR & AI Recommendations Pipeline
let slide7 = addStandardSlide('OCR & AI Legal Processing Pipeline');
slide7.addText([
  { text: '• Stage 1: Document Upload ', options: { bold: true, color: navyDark } },
  { text: '-> Scanned image or PDF of FIR uploaded -> OCR parses characters into strings.\n' },
  { text: '• Stage 2: Regex Extraction ', options: { bold: true, color: navyDark } },
  { text: '-> Pulls date values, name categories, and case/incident descriptions to populate database fields.\n' },
  { text: '• Stage 3: Narrative Suggestor ', options: { bold: true, color: navyDark } },
  { text: '-> Narrative details sent to OpenAI API model. If offline, runs a local regex keyword dictionary.\n' },
  { text: '• Stage 4: Legal Translation ', options: { bold: true, color: navyDark } },
  { text: '-> Mapped output generated containing relevant BNS, BNSS, BSA, and matching old IPC, CrPC, IEA sections with confidence scores and supreme court citations.' }
], {
  x: 0.5,
  y: 1.3,
  w: 9.0,
  h: 3.5,
  fontSize: 12.5,
  fontFace: 'Helvetica',
  color: textDark,
  lineSpacing: 22
});

// Slide 8: Chronological Investigation Diary (Timeline)
let slide8 = addStandardSlide('Digital Investigation Diary (Timeline)');
slide8.addText([
  { text: '• Statutory Requirement: ', options: { bold: true, color: navyDark } },
  { text: 'Section 172 of CrPC & corresponding BNSS sections mandate a diary detailing investigation steps day-by-day.\n\n' },
  { text: '• Automation Triggers: ', options: { bold: true, color: navyDark } },
  { text: 'CrimeGPT appends chronological timeline logs automatically on database operations:\n' },
  { text: '   - Case Registered: ', options: { bold: true } },
  { text: 'Filing of OCR or manual case form.\n' },
  { text: '   - Statements: ', options: { bold: true } },
  { text: 'Recording witness depositions.\n' },
  { text: '   - Evidence Added: ', options: { bold: true } },
  { text: 'Recovery of weapons, digital items, or documents.\n' },
  { text: '   - Arrest Booked: ', options: { bold: true } },
  { text: 'Booking changes status and adds arrest logs.\n' },
  { text: '   - Case Closed: ', options: { bold: true } },
  { text: 'Final report submission to court.\n\n' },
  { text: '• Visual Timeline: ', options: { bold: true, color: goldAccent } },
  { text: 'Provides judges and prosecutors an interactive checklist of events.' }
], {
  x: 0.5,
  y: 1.3,
  w: 9.0,
  h: 3.5,
  fontSize: 11.5,
  fontFace: 'Helvetica',
  color: textDark,
  lineSpacing: 15
});

// Slide 9: Multilingual Legal Document Generation
let slide9 = addStandardSlide('Multilingual Document Generation');
slide9.addText([
  { text: '• Regional Localization: ', options: { bold: true, color: navyDark } },
  { text: 'Field operations require documents in regional state languages. CrimeGPT compiles templates in English, Hindi, Gujarati, and Marathi.\n\n' },
  { text: '• Dynamic Field Insertion: ', options: { bold: true, color: navyDark } },
  { text: 'Case database records are mapped directly into standard template letters.\n\n' },
  { text: '• Supported Legal Letters:\n', options: { bold: true, color: navyDark } },
  { text: '   1. Remand Request: ', options: { bold: true } },
  { text: 'Metropolitan Magistrate application for 14-day police remand (BNSS Sec 187).\n' },
  { text: '   2. Medical Requisition: ', options: { bold: true } },
  { text: 'Official letter for victim/accused physical checkups (BNSS Sec 51/184).\n' },
  { text: '   3. Seizure Memo: ', options: { bold: true } },
  { text: 'Receipt list showing recovered evidence and witness details (BNSS Sec 185).\n' },
  { text: '   4. Custody Request: ', options: { bold: true } },
  { text: 'Transfer documentation for forwarding accused to prison warden.' }
], {
  x: 0.5,
  y: 1.3,
  w: 9.0,
  h: 3.5,
  fontSize: 11.5,
  fontFace: 'Helvetica',
  color: textDark,
  lineSpacing: 15
});

// Slide 10: Legal Section Transition Matrix (Table Slide)
let slide10 = addStandardSlide('Legal Transition Reference Matrix');

const tableRows = [
  [
    { text: 'Offense Type', options: { bold: true, color: white, fill: navyDark } },
    { text: 'Old IPC Sec', options: { bold: true, color: white, fill: navyDark } },
    { text: 'New BNS Sec', options: { bold: true, color: white, fill: navyDark } },
    { text: 'New BNSS (Procedural)', options: { bold: true, color: white, fill: navyDark } },
    { text: 'New BSA (Evidence)', options: { bold: true, color: white, fill: navyDark } }
  ],
  ['Murder', 'Sec 300 / 302', 'Sec 101 / 103(1)', 'Inquest: Sec 176 BNSS', 'Dying Dec: Sec 32(1) BSA'],
  ['Theft', 'Sec 378 / 380', 'Sec 303 / 305', 'Search: Sec 185 BNSS', 'Presumption: Sec 119 BSA'],
  ['Hurt / Grievous', 'Sec 323 / 325', 'Sec 115 / 117', 'Medical: Sec 184 BNSS', 'Expert: Sec 45 BSA'],
  ['Cheating / Forge', 'Sec 420 / 468', 'Sec 318 / 336', 'Property: Sec 105 BNSS', 'Electronic: Sec 63 BSA'],
  ['Kidnapping / Ransom', 'Sec 359 / 364A', 'Sec 137 / 140', 'Statement: Sec 164 BNSS', 'Presumption: Sec 114 BSA'],
  ['Rape / Modesty', 'Sec 375 / 376 / 354', 'Sec 63 / 64 / 74', 'Medical: Sec 184 BNSS', 'Consent: Sec 114A BSA']
];

slide10.addTable(tableRows, {
  x: 0.5,
  y: 1.2,
  w: 9.0,
  h: 3.6,
  fontSize: 9,
  fontFace: 'Helvetica',
  border: { type: 'solid', color: borderGray, pt: 1 },
  fill: { fill: 'FFFFFF' },
  align: 'center',
  valign: 'middle'
});

// Slide 11: Compliance Audits & Immutability
let slide11 = addStandardSlide('Compliance Audits & Integrity');
slide11.addText([
  { text: '• Immutable Action Trail: ', options: { bold: true, color: navyDark } },
  { text: 'Every creation, modification, status update, and download logs operator details in the audit database.\n\n' },
  { text: '• Audit Record Structure:\n', options: { bold: true, color: navyDark } },
  { text: '   - Username: ', options: { bold: true } },
  { text: 'Officer code / details (e.g. io_sharma).\n' },
  { text: '   - Action: ', options: { bold: true } },
  { text: 'Method executed (e.g. CASE_REGISTERED, ARREST_MADE).\n' },
  { text: '   - Modified Data: ', options: { bold: true } },
  { text: 'JSON string tracking old and new values.\n' },
  { text: '   - Timestamp: ', options: { bold: true } },
  { text: 'ISO formatted UTC timestamp.\n\n' },
  { text: '• Security Enforcement: ', options: { bold: true, color: navyDark } },
  { text: 'Only accounts with the Administrator role can view audit trails. Logs cannot be modified or deleted through the user interface.' }
], {
  x: 0.5,
  y: 1.3,
  w: 9.0,
  h: 3.5,
  fontSize: 12,
  fontFace: 'Helvetica',
  color: textDark,
  lineSpacing: 18
});

// Slide 12: Conclusion (Dark Navy)
let slide12 = pptx.addSlide();
slide12.background = { fill: navyDark };

slide12.addText('CrimeGPT', {
  x: 1.0,
  y: 1.5,
  w: 8.0,
  h: 0.8,
  fontSize: 36,
  fontFace: 'Helvetica',
  color: white,
  bold: true,
  align: 'center'
});

slide12.addText('Empowering Digital Justice & Legal Compliance', {
  x: 1.0,
  y: 2.3,
  w: 8.0,
  h: 0.5,
  fontSize: 16,
  fontFace: 'Helvetica',
  color: goldAccent,
  bold: true,
  align: 'center'
});

slide12.addText([
  { text: '• Accelerates police paperwork from hours to seconds\n' },
  { text: '• Guarantees legal transition accuracy between BNS & IPC\n' },
  { text: '• Restricts data visibility through role guards (RBAC)\n' },
  { text: '• Secures evidence chain of custody via audit trails\n' },
  { text: '• Zero configuration setups ready out of the box' }
], {
  x: 1.5,
  y: 3.0,
  w: 7.0,
  h: 2.0,
  fontSize: 11.5,
  fontFace: 'Helvetica',
  color: 'E2E8F0',
  lineSpacing: 18
});

// Write PPTX presentation
const pptPath = path.join(__dirname, '../docs/Solution_Document.pptx');
pptx.writeFile({ fileName: pptPath }).then(() => {
  console.log(`✅ Solution Document PPTX generated successfully at: ${pptPath}`);
}).catch(err => {
  console.error('Error generating PPTX file:', err);
});
