const fs = require('fs');
const path = require('path');

const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/database/notes.json'), 'utf8'));
const baseDir = path.join(__dirname, 'uploads/notes');

if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

notes.forEach(n => {
    const filePath = path.join(baseDir, n.filename);

    if (n.filename.endsWith('.pdf')) {
        // Minimal valid PDF structure with text content
        const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 200 >>
stream
BT
/F1 24 Tf
50 720 Td
(${n.title.replace(/[()]/g, '')}) Tj
/F1 14 Tf
0 -40 Td
(Subject: ${n.subject.replace(/[()]/g, '')}) Tj
/F1 12 Tf
0 -30 Td
(Description:) Tj
/F1 10 Tf
0 -20 Td
(${n.description.substring(0, 150).replace(/[()]/g, '')}...) Tj
0 -20 Td
(Campus Catalyst - Premium Study Material) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000059 00000 n 
0000000116 00000 n 
0000000242 00000 n 
0000000313 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
570
%%EOF`;
        fs.writeFileSync(filePath, pdfContent);
        console.log(`Generated REAL PDF: ${n.filename}`);
    } else if (n.filename.endsWith('.docx')) {
        // Mock DOCX (text content is fine for docx usually, but let's make it look better)
        fs.writeFileSync(filePath, `CAMPUS CATALYST PREMIUM STUDY MATERIAL\n\nTITLE: ${n.title}\nSUBJECT: ${n.subject}\n\n${n.description}`);
        console.log(`Generated DOCX: ${n.filename}`);
    } else if (n.filename.endsWith('.png') || n.filename.endsWith('.jpg')) {
        // Valid 1x1 black PNG pixel
        const pngHex = '89504E470D0A1A0A0000000D4948445200000001000000010802000000907753DE0000000C4944415408D763F8FFFF3F0005FE02FE0D0A350A0000000049454E44AE426082';
        fs.writeFileSync(filePath, Buffer.from(pngHex, 'hex'));
        console.log(`Generated REAL PNG: ${n.filename}`);
    }
});
