const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const pdfDir = path.join(__dirname, '../docs');
const pdfPath = path.join(pdfDir, 'Solution_Presentation_Slides.pdf');

// Ensure output directory exists
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// Create PDF document with 16:9 widescreen landscape dimension (720 x 405 points)
const doc = new PDFDocument({
  size: [720, 405],
  margin: 40,
  bufferPages: true
});

const writeStream = fs.createWriteStream(pdfPath);
doc.pipe(writeStream);

// Theme Colors
const navyDark = '#0A192F';   // Dark Navy
const goldAccent = '#D97706'; // Gold/Amber Accent
const slateLight = '#F8FAFC'; // Light Gray Background
const textDark = '#1E293B';   // Slate Dark Body
const white = '#FFFFFF';
const borderGray = '#CBD5E1';
const textMuted = '#64748B';

// --- SLIDE 1: Cover Slide (Dark Navy) ---
doc.rect(0, 0, 720, 405).fill(navyDark);
doc.rect(20, 20, 680, 365).lineWidth(1).stroke(goldAccent);

doc.fillColor(white)
   .font('Helvetica-Bold')
   .fontSize(44)
   .text('CrimeGPT', 40, 120, { align: 'center' });

doc.fillColor(goldAccent)
   .font('Helvetica-Bold')
   .fontSize(13)
   .text('POLICE CASE DOCUMENTATION & LEGAL INTELLIGENCE PORTAL', 40, 190, { align: 'center', characterSpacing: 1.5 });

doc.fillColor('#94A3B8')
   .font('Helvetica')
   .fontSize(11)
   .text('Solution Architecture & Legal Code Transition Specifications', 40, 230, { align: 'center' });

doc.fillColor(textMuted)
   .font('Helvetica')
   .fontSize(9)
   .text('Designed for Indian Police Departments | Version 1.0.0', 40, 340, { align: 'center' });


// Helper to draw standard slide base
function startLightSlide(title) {
  doc.addPage();
  doc.rect(0, 0, 720, 405).fill(slateLight);
  
  // Title
  doc.fillColor(navyDark)
     .font('Helvetica-Bold')
     .fontSize(22)
     .text(title, 40, 30);
  
  // Gold Accent line under title
  doc.moveTo(40, 62).lineTo(680, 62).lineWidth(1.5).stroke(goldAccent);

  // Footer line and text
  doc.moveTo(40, 360).lineTo(680, 360).lineWidth(0.5).stroke(borderGray);
  doc.fillColor(textMuted).font('Helvetica').fontSize(8);
  doc.text('OFFICIAL DOCUMENT - INDIAN POLICE DEPT', 40, 368);
  doc.text('CrimeGPT Legal Portal', 560, 368, { align: 'right', width: 120 });
}

// Helper to draw bullet list item
function drawBullet(text, options = {}) {
  const bulletX = options.x || 40;
  const bulletY = options.y || doc.y;
  const width = options.w || 640;
  
  doc.fillColor(goldAccent).font('Helvetica-Bold').fontSize(12).text('•', bulletX, bulletY);
  
  if (options.boldPrefix) {
    doc.fillColor(navyDark).font('Helvetica-Bold').fontSize(11.5).text(options.boldPrefix, bulletX + 15, bulletY, { continued: true });
    doc.fillColor(textDark).font('Helvetica').text(text, { width: width - 15, align: 'justify', lineGap: 2 });
  } else {
    doc.fillColor(textDark).font('Helvetica').fontSize(11.5).text(text, bulletX + 15, bulletY, { width: width - 15, align: 'justify', lineGap: 2 });
  }
  
  doc.y += 8; // small gap
}

// --- SLIDE 2: Executive Summary ---
startLightSlide('Executive Summary');
doc.y = 85;
drawBullet('engineered specifically to streamline the police investigation workflow from FIR registration to court production.', { boldPrefix: 'AI-Powered Legal Intelligence System: ' });
drawBullet('Acts as a legal translation layer for officers migrating from colonial-era laws (IPC, CrPC, IEA) to modern codes (BNS, BNSS, BSA).', { boldPrefix: 'Transition Bridge: ' });
drawBullet('Incorporates scanned document OCR uploads, parsing text to populate case sheets under 10 seconds.', { boldPrefix: 'Form Digitization: ' });
drawBullet('Maintains an interactive, chronological case diary timeline and logs compliance audit trails to ensure judicial credibility.', { boldPrefix: 'Forensic Transparency: ' });

// --- SLIDE 3: The Reform Context ---
startLightSlide('Indian Penal Reform Compliance');
doc.y = 85;
drawBullet('replaced the colonial-era IPC (Indian Penal Code) enacted in 1860, updating punishment classifications.', { boldPrefix: 'BNS (Bharatiya Nyaya Sanhita): ' });
drawBullet('replaced the CrPC (Code of Criminal Procedure) enacted in 1973, establishing new mandates for medical checkups, searches, and remand timings.', { boldPrefix: 'BNSS (Bharatiya Nagarik Suraksha Sanhita): ' });
drawBullet('replaced the IEA (Indian Evidence Act) enacted in 1872, detailing new guidelines for digital files and electronic forensics admissibility.', { boldPrefix: 'BSA (Bharatiya Sakshya Adhiniyam): ' });
drawBullet('CrimeGPT serves as the operational translation portal, linking descriptions to correct legal acts under both frameworks concurrently.', { boldPrefix: 'Solution Duty: ' });

// --- SLIDE 4: Key Platform Features ---
startLightSlide('Core Platform Features');
doc.y = 85;
drawBullet('Drag-and-drop OCR scans that pre-populate form wizards.', { boldPrefix: '1. Scanned FIR OCR Uploads: ' });
drawBullet('Suggests statutory sections and relevant landmark judgements.', { boldPrefix: '2. AI Legal Translation Engine: ' });
drawBullet('Chronological timeline of statements, evidence recoveries, and arrests.', { boldPrefix: '3. Digital Case Diary: ' });
drawBullet('Instantly drafts Remand, Medical, and Seizure Memos in English, Hindi, Gujarati, or Marathi.', { boldPrefix: '4. Multilingual Document Assembly: ' });
drawBullet('Immutable admin trail tracking username details, actions, and parameters.', { boldPrefix: '5. Compliance Audit Logs: ' });

// --- SLIDE 5: System Architecture & Tech Stack ---
startLightSlide('System Architecture & Tech Stack');
doc.y = 85;
drawBullet('Single Page React Application built with Vite and TypeScript. Styled using responsive TailwindCSS. State managers handle authentication headers and translation matrices.', { boldPrefix: '• Frontend: ' });
drawBullet('Express.js Node API handling OCR processing, OpenAI API query assemblies, PDF compilation (PDFKit), and DOCX builds.', { boldPrefix: '• Backend: ' });
drawBullet('PostgreSQL utilized in staging/production setups, with smart automatic fallback to SQLite (crimegpt.sqlite) for local network setups or zero-configuration offline field stations.', { boldPrefix: '• Dual Database Layer: ' });
drawBullet('Tesseract.js for OCR, OpenAI GPT-4o-mini API for legal parsing, JWT for authentication.', { boldPrefix: '• Core Modules: ' });

// --- SLIDE 6: Role-Based Access Control (RBAC) ---
startLightSlide('Role-Based Access Control (RBAC)');
doc.y = 85;
drawBullet('Registers case details, uploads OCR image templates, triggers AI legal advice, logs evidence, witness depositions, and outputs legal drafts.', { boldPrefix: '• Investigating Officer (IO): ' });
drawBullet('Supervises station cases. Approves registrations, updates case status (ACTIVE, ARRESTED, CLOSED), and audits precinct stats.', { boldPrefix: '• Station House Officer (SHO): ' });
drawBullet('Read-only access to case timelines, summaries, and AI recommendations to review and prepare court charges.', { boldPrefix: '• Legal Advisor: ' });
drawBullet('Governs IT settings and holds read-only clearance to the Compliance Audit Log to review modified values.', { boldPrefix: '• System Administrator: ' });

// --- SLIDE 7: OCR & AI Recommendations Pipeline ---
startLightSlide('OCR & AI Legal Processing Pipeline');
doc.y = 85;
drawBullet('-> Scanned image or PDF of FIR uploaded -> OCR parses characters into strings.', { boldPrefix: '• Stage 1: Document Upload: ' });
drawBullet('-> Pulls date values, name categories, and case/incident descriptions to populate database fields.', { boldPrefix: '• Stage 2: Regex Extraction: ' });
drawBullet('-> Narrative details sent to OpenAI API model. If offline, runs a local regex keyword dictionary.', { boldPrefix: '• Stage 3: Narrative Suggestor: ' });
drawBullet('-> Mapped output generated containing relevant BNS, BNSS, BSA, and matching old IPC, CrPC, IEA sections with confidence scores and supreme court citations.', { boldPrefix: '• Stage 4: Legal Translation: ' });

// --- SLIDE 8: Chronological Investigation Diary ---
startLightSlide('Digital Investigation Diary (Timeline)');
doc.y = 85;
drawBullet('Section 172 of CrPC & corresponding BNSS sections mandate a diary detailing investigation steps day-by-day.', { boldPrefix: '• Statutory Requirement: ' });
drawBullet('CrimeGPT appends chronological timeline logs automatically on database operations (Filing case form, witness statements, weapon/evidence seizure, arrest booking, case closure).', { boldPrefix: '• Automation Triggers: ' });
drawBullet('Provides judges and prosecutors an interactive checklist of events, ensuring custody chains and legal timelines remain transparent and valid.', { boldPrefix: '• Visual Timeline: ' });

// --- SLIDE 9: Multilingual Legal Document Generation ---
startLightSlide('Multilingual Document Generation');
doc.y = 85;
drawBullet('Field operations require documents in regional state languages. CrimeGPT compiles templates in English, Hindi, Gujarati, and Marathi.', { boldPrefix: '• Regional Localization: ' });
drawBullet('Case database records are mapped directly into standard template letters.', { boldPrefix: '• Dynamic Field Insertion: ' });
drawBullet('Remand Application (BNSS Sec 187), Medical Requisition (BNSS Sec 51/184), Seizure Memo (BNSS Sec 185), and Custody Jail Transfer request.', { boldPrefix: '• Supported Legal Letters: ' });

// --- SLIDE 10: Legal Section Transition Matrix (Table Slide) ---
startLightSlide('Legal Transition Reference Matrix');

const tableData = [
  ['Offense Type', 'Old IPC Sec', 'New BNS Sec', 'New BNSS (Procedural)', 'New BSA (Evidence)'],
  ['Murder', 'Sec 300 / 302', 'Sec 101 / 103(1)', 'Inquest: Sec 176 BNSS', 'Dying Dec: Sec 32(1) BSA'],
  ['Theft', 'Sec 378 / 380', 'Sec 303 / 305', 'Search: Sec 185 BNSS', 'Presumption: Sec 119 BSA'],
  ['Hurt / Grievous', 'Sec 323 / 325', 'Sec 115 / 117', 'Medical: Sec 184 BNSS', 'Expert: Sec 45 BSA'],
  ['Cheating / Forge', 'Sec 420 / 468', 'Sec 318 / 336', 'Property: Sec 105 BNSS', 'Electronic: Sec 63 BSA'],
  ['Kidnapping / Ransom', 'Sec 359 / 364A', 'Sec 137 / 140', 'Statement: Sec 164 BNSS', 'Presumption: Sec 114 BSA'],
  ['Rape / Modesty', 'Sec 375 / 376 / 354', 'Sec 63 / 64 / 74', 'Medical: Sec 184 BNSS', 'Consent: Sec 114A BSA']
];

const colWidths = [120, 110, 110, 150, 150];
const startTableX = 40;
const startTableY = 90;
const rowHeight = 28;

tableData.forEach((row, rowIndex) => {
  const currentY = startTableY + (rowIndex * rowHeight);
  const isHeader = rowIndex === 0;

  if (isHeader) {
    doc.rect(startTableX, currentY, 640, rowHeight).fill(navyDark);
    doc.fillColor(white).font('Helvetica-Bold').fontSize(9);
  } else {
    if (rowIndex % 2 === 0) {
      doc.rect(startTableX, currentY, 640, rowHeight).fill('#E2E8F0');
    } else {
      doc.rect(startTableX, currentY, 640, rowHeight).fill('#F8FAFC');
    }
    doc.fillColor(textDark).font('Helvetica').fontSize(9);
  }
  doc.rect(startTableX, currentY, 640, rowHeight).lineWidth(0.5).stroke(borderGray);

  let currentX = startTableX;
  row.forEach((cellText, cellIdx) => {
    doc.text(cellText, currentX + 6, currentY + 9, {
      width: colWidths[cellIdx] - 12,
      height: rowHeight - 12,
      ellipsis: true
    });
    currentX += colWidths[cellIdx];
  });
});

// --- SLIDE 11: Compliance Audits & Integrity ---
startLightSlide('Compliance Audits & Integrity');
doc.y = 85;
drawBullet('Every creation, modification, status update, and download logs operator details in the audit database.', { boldPrefix: '• Immutable Action Trail: ' });
drawBullet('Tracks Officer codes, executed methods (CASE_REGISTERED, ARREST_MADE, etc.), timestamps, and JSON strings of changed parameters.', { boldPrefix: '• Audit Record Structure: ' });
drawBullet('Only accounts with the Administrator role can view audit trails. Logs cannot be modified or deleted through the user interface, enforcing security.', { boldPrefix: '• Security Enforcement: ' });

// --- SLIDE 12: Conclusion (Dark Navy) ---
doc.addPage();
doc.rect(0, 0, 720, 405).fill(navyDark);
doc.rect(20, 20, 680, 365).lineWidth(1).stroke(goldAccent);

doc.fillColor(white)
   .font('Helvetica-Bold')
   .fontSize(32)
   .text('CrimeGPT', 40, 50, { align: 'center' });

doc.fillColor(goldAccent)
   .font('Helvetica-Bold')
   .fontSize(16)
   .text('Empowering Digital Justice & Legal Compliance', 40, 100, { align: 'center' });

doc.y = 140;
drawBullet('Accelerates police paperwork from hours to seconds.', { x: 80, w: 560 });
drawBullet('Guarantees legal transition accuracy between BNS & IPC.', { x: 80, w: 560 });
drawBullet('Restricts data visibility through role guards (RBAC).', { x: 80, w: 560 });
drawBullet('Secures evidence chain of custody via audit trails.', { x: 80, w: 560 });
drawBullet('Zero configuration setups ready out of the box.', { x: 80, w: 560 });

doc.end();

writeStream.on('finish', () => {
  console.log(`✅ Solution Presentation PDF generated successfully at: ${pdfPath}`);
});

writeStream.on('error', (err) => {
  console.error('Error writing PDF slide deck:', err);
});
