const download = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportTxt = (text) => download(new Blob([text], { type: "text/plain;charset=utf-8" }), "texto-clareia.txt");
export const exportMarkdown = (text) => download(new Blob([text], { type: "text/markdown;charset=utf-8" }), "texto-clareia.md");

export async function exportDocx(text) {
  const { Document, Packer, Paragraph } = await import("https://esm.sh/docx@9.5.1");
  const children = text.split(/\n+/).filter(Boolean).map((line) => new Paragraph({ text: line, spacing: { after: 180 } }));
  const blob = await Packer.toBlob(new Document({ sections: [{ properties: {}, children }] }));
  download(blob, "texto-clareia.docx");
}

export async function exportPdf(text) {
  const { jsPDF } = await import("https://esm.sh/jspdf@3.0.2");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const lines = pdf.splitTextToSize(text, 495);
  let y = 56;
  lines.forEach((line) => {
    if (y > 785) { pdf.addPage(); y = 56; }
    pdf.text(line, 50, y); y += 16;
  });
  pdf.save("texto-clareia.pdf");
}
