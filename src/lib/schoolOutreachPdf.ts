import jsPDF from "jspdf";

export interface OutreachContact {
  phone?: string;
  email?: string;
  website?: string;
}

const GREEN: [number, number, number] = [46, 139, 87]; // Forest Green #2e8b57
const DARK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];

const wrap = (doc: jsPDF, text: string, x: number, y: number, maxW: number, lh = 6) => {
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y);
  return y + lines.length * lh;
};

export const generateSchoolOutreachPdf = (
  institutionName: string | null,
  contact: OutreachContact,
): jsPDF => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 18;

  // ===== Cover =====
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("HIMSOLS · SCHOOLS & EDUCATION PROGRAM", M, 22);
  doc.setFontSize(26);
  doc.text("Bring sustainability", M, 40);
  doc.text("into your classroom.", M, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Plantation drives, eco-workshops & eco-clubs for schools, colleges and NGOs.", M, 60);

  doc.setTextColor(...DARK);
  let y = 88;
  if (institutionName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text("Prepared for", M, y);
    y += 6;
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(institutionName, M, y);
    y += 12;
  }

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(M, y, W - M, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("Why partner with Himsols", M, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  y = wrap(
    doc,
    "Himsols runs verified tree plantations on farmer land in Himachal Pradesh. Every tree is geo-tagged, photographed, and tracked for survival. We bring that real-world impact to your students through hands-on drives and workshops — no greenwashing, just measurable outcomes.",
    M,
    y,
    W - 2 * M,
  );
  y += 6;

  // Programs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("What we offer", M, y);
  y += 8;

  const programs = [
    {
      t: "Plantation Drive",
      d: "On-campus or nearby plantation event. Students plant native saplings, get geo-tagged proof and a digital certificate per tree.",
    },
    {
      t: "Sustainability Workshop",
      d: "60-90 min interactive session for kids (Grade 4-12) on waste, water, carbon and biodiversity — with games, demos and take-home activities.",
    },
    {
      t: "Eco-Club Setup",
      d: "Help your institution start a student-led Eco-Club: charter, year-long calendar, monthly themes and mentorship from Himsols team.",
    },
    {
      t: "Scrap-to-Trees Drive",
      d: "Students collect waste paper / e-waste / plastic. Himsols converts the credit into trees planted in their school's name.",
    },
  ];

  programs.forEach((p) => {
    if (y > H - 50) {
      doc.addPage();
      y = M;
    }
    doc.setFillColor(...GREEN);
    doc.circle(M + 2, y - 1.5, 1.8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text(p.t, M + 8, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...MUTED);
    y = wrap(doc, p.d, M + 8, y, W - 2 * M - 8, 5);
    y += 5;
  });

  // ===== Page 2 — How it works + Impact + Contact =====
  doc.addPage();
  y = M + 4;

  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text("How it works", M, y);
  y += 9;

  const steps = [
    ["1", "Apply", "Fill our short partnership form (5 min)."],
    ["2", "Visit", "Our team visits or calls to plan the program."],
    ["3", "Plant / Teach", "We run the drive or workshop on your date."],
    ["4", "Report", "You get photos, geo-tags and an impact report."],
  ];
  steps.forEach(([n, t, d]) => {
    doc.setFillColor(...GREEN);
    doc.circle(M + 3, y - 1.5, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(n, M + 3, y + 0.5, { align: "center" });

    doc.setTextColor(...DARK);
    doc.setFontSize(12);
    doc.text(t, M + 12, y - 0.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...MUTED);
    doc.text(d, M + 12, y + 5);
    y += 14;
  });

  y += 4;
  // Impact box
  doc.setFillColor(244, 252, 248);
  doc.rect(M, y, W - 2 * M, 38, "F");
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("What your students take home", M + 6, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...DARK);
  const takeaways = [
    "• Real plantation photos & geo-coordinates for each tree",
    "• Digital impact certificate for the institution",
    "• Estimated CO2 absorption (22 kg/tree/year) — clearly labelled estimate",
    "• Curriculum-friendly worksheet pack (PDF) for follow-up classes",
  ];
  let ty = y + 16;
  takeaways.forEach((t) => {
    doc.text(t, M + 6, ty);
    ty += 5.5;
  });
  y += 46;

  // Pricing / cost
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Cost", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  y = wrap(
    doc,
    "Workshops and Eco-Club setup are offered free for government schools and at concessional rates for private institutions. Plantation drives are quoted per sapling (saplings from Rs 299 each, includes 3-year survival tracking). CSR / sponsor-funded drives are free for the school.",
    M,
    y,
    W - 2 * M,
  );
  y += 8;

  // Contact
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.line(M, y, W - M, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("Get in touch", M, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  if (contact.phone) {
    doc.text(`Phone / WhatsApp:  ${contact.phone}`, M, y);
    y += 6;
  }
  if (contact.email) {
    doc.text(`Email:  ${contact.email}`, M, y);
    y += 6;
  }
  if (contact.website) {
    doc.text(`Website:  ${contact.website}`, M, y);
    y += 6;
  }
  doc.text("Apply online:  himsols.online/schools", M, y);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    "Himsols · Verified tree plantations in Himachal Pradesh · CO2 figures are estimates",
    W / 2,
    H - 10,
    { align: "center" },
  );

  return doc;
};
