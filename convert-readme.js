const { Document, Packer, Paragraph, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

// Read the README.md file
const readmePath = path.join(__dirname, 'README.md');
const readmeContent = fs.readFileSync(readmePath, 'utf-8');

// Parse markdown and create document
const lines = readmeContent.split('\n');
const paragraphs = [];

lines.forEach((line) => {
    if (line.startsWith('# ')) {
        // Main heading
        paragraphs.push(
            new Paragraph({
                text: line.replace('# ', ''),
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 }
            })
        );
    } else if (line.startsWith('## ')) {
        // Sub heading
        paragraphs.push(
            new Paragraph({
                text: line.replace('## ', ''),
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 150 }
            })
        );
    } else if (line.startsWith('### ')) {
        // Sub sub heading
        paragraphs.push(
            new Paragraph({
                text: line.replace('### ', ''),
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 100 }
            })
        );
    } else if (line.startsWith('- ')) {
        // Bullet point
        paragraphs.push(
            new Paragraph({
                text: line.replace('- ', ''),
                bullet: { level: 0 },
                spacing: { after: 50 }
            })
        );
    } else if (line.startsWith('  - ')) {
        // Sub bullet point
        paragraphs.push(
            new Paragraph({
                text: line.replace('  - ', ''),
                bullet: { level: 1 },
                spacing: { after: 50 }
            })
        );
    } else if (line.trim() !== '' && !line.startsWith('```')) {
        // Regular paragraph
        paragraphs.push(
            new Paragraph({
                text: line,
                spacing: { after: 100 }
            })
        );
    } else if (line.startsWith('```')) {
        // Code block marker (skip)
        return;
    }
});

// Create the document
const doc = new Document({
    sections: [{
        children: paragraphs
    }]
});

// Save the document
Packer.toBuffer(doc).then((buffer) => {
    const outputPath = path.join(__dirname, 'README.docx');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Word document created: README.docx`);
});
