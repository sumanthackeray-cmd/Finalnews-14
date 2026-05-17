import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ShadingType,
  TableLayoutType, UnderlineType,
} from "docx";

export async function generateResumeDocx(resumeData: {
  name: string;
  title: string;
  phone: string;
  email: string;
  summary: string;
  skills: string[];
  hobbies: string[];
  education: { degree: string; school: string; year: string }[];
  experience: { role: string; company: string; period: string; bullets: string[] }[];
}) {
  const ORANGE = "F5A623";
  const DARK = "1A1A1A";
  const GRAY = "555555";

  // ── Header Section ──────────────────────────────────────────────
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          // Orange left block
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: ORANGE, type: ShadingType.CLEAR, color: ORANGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: resumeData.name.toUpperCase(), bold: true, size: 36, color: "FFFFFF", font: "Arial" })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({ text: resumeData.title.toUpperCase(), size: 18, color: "FFFFFF", font: "Arial" })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          // White right block
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: resumeData.phone, size: 20, color: GRAY, font: "Arial" })],
                spacing: { before: 100 },
              }),
              new Paragraph({
                children: [new TextRun({ text: resumeData.email, size: 20, color: GRAY, font: "Arial" })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // ── Two Column Body ─────────────────────────────────────────────
  const bodyTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          // ── LEFT COLUMN ──────────────────────────────────────
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            children: [
              // Profile
              sectionHeading("Profile"),
              new Paragraph({
                children: [new TextRun({ text: resumeData.summary, size: 18, color: GRAY, font: "Arial" })],
                spacing: { after: 200 },
              }),

              // Education
              sectionHeading("Education History"),
              ...resumeData.education.flatMap((edu) => [
                new Paragraph({
                  children: [new TextRun({ text: edu.degree, bold: true, size: 20, color: DARK, font: "Arial" })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `${edu.year}  •  ${edu.school}`, size: 18, color: ORANGE, font: "Arial" })],
                  spacing: { after: 100 },
                }),
              ]),

              // Contact
              sectionHeading("Contact Info"),
              new Paragraph({
                children: [new TextRun({ text: `📞  ${resumeData.phone}`, size: 18, color: GRAY, font: "Arial" })],
              }),
              new Paragraph({
                children: [new TextRun({ text: `✉  ${resumeData.email}`, size: 18, color: GRAY, font: "Arial" })],
              }),
            ],
          }),

          // ── RIGHT COLUMN ─────────────────────────────────────
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            children: [
              // Skills
              sectionHeading("Skills"),
              new Paragraph({
                children: resumeData.skills.map((s, i) =>
                  new TextRun({ text: (i > 0 ? "   •   " : "• ") + s, size: 18, color: GRAY, font: "Arial" })
                ),
                spacing: { after: 200 },
              }),

              // Hobbies
              sectionHeading("Hobbies"),
              new Paragraph({
                children: resumeData.hobbies.map((h, i) =>
                  new TextRun({ text: (i > 0 ? "   •   " : "• ") + h, size: 18, color: GRAY, font: "Arial" })
                ),
                spacing: { after: 200 },
              }),

              // Work Experience
              sectionHeading("Work Experience"),
              ...resumeData.experience.flatMap((exp) => [
                new Paragraph({
                  children: [new TextRun({ text: exp.role, bold: true, size: 20, color: DARK, font: "Arial" })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `${exp.company}  •  ${exp.period}`, size: 18, color: ORANGE, font: "Arial" })],
                }),
                ...exp.bullets.map((b) =>
                  new Paragraph({
                    bullet: { level: 0 },
                    children: [new TextRun({ text: b, size: 18, color: GRAY, font: "Arial" })],
                  })
                ),
                new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 150 } }),
              ]),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children: [headerTable, new Paragraph({ text: "" }), bodyTable],
    }],
  });

  return await Packer.toBase64String(doc);
}

// ── Helper ──────────────────────────────────────────────────────
function sectionHeading(text: string) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        color: "1A1A1A",
        font: "Arial",
        underline: { type: UnderlineType.SINGLE, color: "F5A623" },
      }),
    ],
    spacing: { before: 200, after: 100 },
  });
}
