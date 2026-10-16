/** Read a resume file in the browser. The bytes are not uploaded. */

export async function textFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || file.type.startsWith("text/")) return file.text();
  if (name.endsWith(".docx") || file.type.includes("wordprocessingml")) return textFromDocx(file);
  if (name.endsWith(".pdf") || file.type === "application/pdf") return textFromPdf(file);
  if (name.endsWith(".doc")) throw new Error("Old .doc files are not read here. Save as DOCX or PDF, or paste the text.");
  throw new Error("Use a PDF, a DOCX, or paste the text.");
}

async function textFromDocx(file: File) {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const text = result.value.replace(/\s+\n/g, "\n").trim();
  if (!text) throw new Error("That DOCX had no readable text. Paste the resume instead.");
  return text;
}

async function textFromPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  }
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (line) pages.push(line);
  }
  const text = pages.join("\n").trim();
  if (!text) throw new Error("That PDF had no text layer. If it is a scan, paste the resume instead.");
  return text;
}
