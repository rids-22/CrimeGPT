const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const mdPath = path.join(__dirname, '../docs/Solution_Document.md');
const pdfDir = path.join(__dirname, '../docs');
const pdfPath = path.join(pdfDir, 'Solution_Document.pdf');

// Ensure output directory exists
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// Read Markdown content
let mdContent = '';
try {
  mdContent = fs.readFileSync(mdPath, 'utf8');
} catch (err) {
  console.error('Failed to read markdown file:', err);
  process.exit(1);
}

// Create PDF document
const doc = new PDFDocument({
  margin: 50,
  bufferPages: true
});

const writeStream = fs.createWriteStream(pdfPath);
doc.pipe(writeStream);

// Theme Colors
const primaryColor = '#0A192F';   // Dark Navy
const secondaryColor = '#D97706'; // Gold/Amber
const textColor = '#1E293B';      // Charcoal
const bgColor = '#F8FAFC';        // Off-White/Light Gray
const borderColor = '#E2E8F0';    // Border Gray

// --- COVER PAGE ---
// Border
doc.rect(25, 25, 562, 742).lineWidth(1.5).stroke(primaryColor);
doc.rect(30, 30, 552, 732).lineWidth(0.5).stroke(secondaryColor);

// Title & Subtitle
doc.moveDown(8);
doc.fillColor(primaryColor)
   .font('Helvetica-Bold')
   .fontSize(38)
   .text('CrimeGPT', { align: 'center' })
   .moveDown(0.2);

doc.fillColor(secondaryColor)
   .font('Helvetica-Bold')
   .fontSize(16)
   .text('POLICE CASE DOCUMENTATION & LEGAL INTELLIGENCE PORTAL', { align: 'center', characterSpacing: 1 })
   .moveDown(1.5);

doc.fillColor(textColor)
   .font('Helvetica')
   .fontSize(12)
   .text('Solution Document & Architecture Specifications', { align: 'center' })
   .moveDown(6);

// Meta Details Box
const boxY = doc.y;
doc.rect(120, boxY, 372, 130).fill(bgColor).stroke(borderColor);

doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text('DOCUMENT METADATA', 140, boxY + 15);
doc.moveTo(140, boxY + 28).lineTo(472, boxY + 28).lineWidth(0.5).stroke(borderColor);

doc.fillColor(textColor).font('Helvetica').fontSize(9);
doc.text('Prepared For:', 140, boxY + 40);
doc.text('Indian Police Departments (Legal & IT Cells)', 240, boxY + 40);

doc.text('Version:', 140, boxY + 58);
doc.text('v1.0.0 (Release Candidate)', 240, boxY + 58);

doc.text('Date:', 140, boxY + 76);
doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 240, boxY + 76);

doc.text('Classification:', 140, boxY + 94);
doc.fillColor('#B91C1C').font('Helvetica-Bold').text('OFFICIAL / CONFIDENTIAL', 240, boxY + 94);

// Footer of Cover Page
doc.fillColor('#64748B')
   .font('Helvetica')
   .fontSize(8)
   .text('© 2026 CrimeGPT Portal Project. All Rights Reserved.', 50, 730, { align: 'center' });

doc.addPage();

// --- BODY CONVERSION ---
const lines = mdContent.split('\n');
let inCodeBlock = false;
let codeLines = [];
let inTable = false;
let tableLines = [];

// Helper to draw horizontal line divider
function drawDivider(y) {
  doc.moveTo(50, y).lineTo(562, y).lineWidth(0.5).stroke(borderColor);
}

// Helper to draw table
function drawTable(rows) {
  if (rows.length === 0) return;
  
  // Filter out the header divider line (e.g. | :--- | :--- |)
  const dataRows = rows.filter(r => !r.includes('---'));
  if (dataRows.length === 0) return;

  const colWidths = [100, 75, 75, 130, 132]; // total width = 512
  const padding = 6;
  const startX = 50;
  
  doc.font('Helvetica-Bold').fontSize(8.5);
  
  // Parse rows
  const parsedRows = dataRows.map(row => {
    return row.split('|').map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  });

  // Render Table
  parsedRows.forEach((cols, rowIndex) => {
    // Check page overflow first
    if (doc.y > 680) {
      doc.addPage();
    }

    const isHeader = rowIndex === 0;
    const rowHeight = 28;
    const currentY = doc.y;

    // Row Background fill
    if (isHeader) {
      doc.rect(startX, currentY, 512, rowHeight).fill(primaryColor);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold');
    } else {
      if (rowIndex % 2 === 0) {
        doc.rect(startX, currentY, 512, rowHeight).fill('#F1F5F9');
      } else {
        doc.rect(startX, currentY, 512, rowHeight).fill('#FFFFFF');
      }
      doc.fillColor(textColor).font('Helvetica').stroke(borderColor);
    }

    // Border surrounding row
    doc.rect(startX, currentY, 512, rowHeight).lineWidth(0.5).stroke(borderColor);

    let currentX = startX;
    cols.forEach((colText, colIndex) => {
      doc.text(colText, currentX + padding, currentY + padding, {
        width: colWidths[colIndex] - (padding * 2),
        height: rowHeight - (padding * 2),
        ellipsis: true
      });
      currentX += colWidths[colIndex];
    });

    doc.y = currentY + rowHeight;
  });
  doc.moveDown(1);
}

// Parse markdown lines
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // Skip main title since we have a cover page
  if (line.startsWith('# CrimeGPT -')) {
    continue;
  }

  // Code Block Handler
  if (line.trim().startsWith('```')) {
    if (inCodeBlock) {
      inCodeBlock = false;
      
      // Calculate code box height
      const boxHeight = (codeLines.length * 11) + 16;
      if (doc.y + boxHeight > 700) {
        doc.addPage();
      }
      
      const boxY = doc.y;
      doc.rect(50, boxY, 512, boxHeight).fill('#0F172A'); // Dark theme for code
      doc.fillColor('#38BDF8').font('Courier-Bold').fontSize(8);
      
      let printY = boxY + 8;
      codeLines.forEach(codeLine => {
        doc.text(codeLine, 60, printY);
        printY += 11;
      });
      
      doc.y = boxY + boxHeight;
      doc.moveDown(1.2);
      codeLines = [];
    } else {
      inCodeBlock = true;
    }
    continue;
  }

  if (inCodeBlock) {
    codeLines.push(line);
    continue;
  }

  // Table Handler
  if (line.trim().startsWith('|')) {
    inTable = true;
    tableLines.push(line);
    continue;
  } else if (inTable) {
    // Table has ended, render it
    drawTable(tableLines);
    tableLines = [];
    inTable = false;
  }

  // Skip horizontal lines in markdown (---)
  if (line.trim() === '---') {
    doc.moveDown(0.5);
    drawDivider(doc.y);
    doc.moveDown(0.8);
    continue;
  }

  // Heading 2 (##) -> Render as main section header
  if (line.startsWith('## ')) {
    const text = line.replace('## ', '').trim();
    if (doc.y > 680) {
      doc.addPage();
    }
    doc.moveDown(1.5);
    
    // Draw heading accent line
    const currentY = doc.y;
    doc.rect(50, currentY, 4, 18).fill(secondaryColor);
    
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text(text, 62, currentY + 2);
       
    doc.y = currentY + 20;
    doc.moveDown(0.6);
    continue;
  }

  // Heading 3 (###) -> Render as subsection header
  if (line.startsWith('### ')) {
    const text = line.replace('### ', '').trim();
    if (doc.y > 700) {
      doc.addPage();
    }
    doc.moveDown(1.0);
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(text, 50, doc.y);
    doc.moveDown(0.4);
    continue;
  }

  // Heading 4 (####) -> Render as minor header
  if (line.startsWith('#### ')) {
    const text = line.replace('#### ', '').trim();
    if (doc.y > 720) {
      doc.addPage();
    }
    doc.moveDown(0.6);
    doc.fillColor(secondaryColor)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(text, 50, doc.y);
    doc.moveDown(0.3);
    continue;
  }

  // Bullet Point Handler
  if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
    const text = line.trim().replace(/^[*+-]\s+/, '');
    if (doc.y > 730) {
      doc.addPage();
    }
    doc.font('Helvetica').fontSize(9.5).fillColor(textColor);
    
    // Custom list printing
    const currentY = doc.y;
    doc.fillColor(secondaryColor).text('•', 56, currentY);
    doc.fillColor(textColor).text(text, 68, currentY, {
      width: 494,
      align: 'justify'
    });
    doc.moveDown(0.4);
    continue;
  }

  // Standard Paragraph
  if (line.trim() !== '') {
    if (doc.y > 730) {
      doc.addPage();
    }
    doc.font('Helvetica')
       .fontSize(9.5)
       .fillColor(textColor)
       .text(line, 50, doc.y, {
         width: 512,
         align: 'justify',
         lineGap: 3
       });
    doc.moveDown(0.8);
  }
}

// In case file ended but table was still active
if (inTable && tableLines.length > 0) {
  drawTable(tableLines);
}

// --- HEADERS & FOOTERS FOR ALL BUFFERED PAGES ---
const pages = doc.bufferedPageRange();
for (let i = 1; i < pages.count; i++) {
  doc.switchToPage(i);
  
  // Header
  doc.fillColor('#64748B').fontSize(7.5).font('Helvetica').text('CRIMEGPT: POLICE CASE DOCUMENTATION & LEGAL INTELLIGENCE PORTAL', 50, 25);
  doc.moveTo(50, 36).lineTo(562, 36).lineWidth(0.5).stroke('#CBD5E1');
  
  // Footer
  doc.moveTo(50, 755).lineTo(562, 755).stroke('#CBD5E1');
  doc.fillColor('#64748B').fontSize(7.5).font('Helvetica');
  doc.text('OFFICIAL DOCUMENT - INDIAN POLICE DEPT', 50, 762);
  doc.text(`Page ${i + 1} of ${pages.count}`, 510, 762);
}

doc.end();

writeStream.on('finish', () => {
  console.log(`✅ Solution Document PDF generated successfully at: ${pdfPath}`);
});

writeStream.on('error', (err) => {
  console.error('Error writing PDF file:', err);
});
