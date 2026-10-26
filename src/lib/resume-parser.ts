import mammoth from "mammoth";

export async function extractTextFromFile(buffer: Buffer, fileName: string): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "docx") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 0) {
        return result.value.trim();
      }
    } catch (err) {
      console.warn("Mammoth DOCX extraction error:", err);
    }
  }

  if (ext === "pdf") {
    try {
      const pdfModule = await import("pdf-parse");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfAny = pdfModule as any;

      if (typeof pdfAny.default === "function") {
        const data = await pdfAny.default(buffer);
        if (data.text && data.text.trim().length > 0) {
          return data.text.trim();
        }
      }

      if (pdfAny.PDFParse) {
        const parser = new pdfAny.PDFParse({ data: buffer });
        const text = await parser.getText();
        const extracted = typeof text === "string" ? text : (text?.text || "");
        if (extracted.trim().length > 0) {
          return extracted.trim();
        }
      }
    } catch (err) {
      console.warn("PDF extraction error:", err);
    }
  }

  // Plain text, markdown, doc, or fallback text extraction
  try {
    const rawStr = buffer.toString("utf-8");
    const cleanStr = rawStr.replace(/[^\x20-\x7E\t\n\r]/g, " ").replace(/\s{2,}/g, " ").trim();
    if (cleanStr.length > 50) {
      return cleanStr;
    }
  } catch (err) {
    console.warn("Plain text decode error:", err);
  }

  return "";
}
