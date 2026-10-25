/**
 * Runs PaddleOCR in the browser for PDFs with no usable server-extracted text.
 * The document is rendered and recognized locally; only the resulting text is
 * sent to the existing review API after the user has consented.
 */
export async function extractPdfTextWithPaddleOcr(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Local PDF OCR is available only in the browser.");
  }

  let pdfDocument: Awaited<ReturnType<typeof loadPdfDocument>> | undefined;
  let ocr: Awaited<ReturnType<typeof createOcr>> | undefined;

  try {
    pdfDocument = await loadPdfDocument(file);
    if (pdfDocument.numPages > 20) {
      throw new Error("This PDF has more than 20 pages. Please upload a shorter resume.");
    }

    ocr = await createOcr();
    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.8 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      try {
        const context = canvas.getContext("2d");
        if (!context) throw new Error("The browser could not prepare a PDF page for OCR.");

        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const [result] = await ocr.predict(canvas);
        const pageText = result?.items.map((item) => item.text.trim()).filter(Boolean).join("\n");
        if (pageText) pageTexts.push(pageText);
      } finally {
        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
      }
    }

    const text = pageTexts.join("\n\n").replace(/\u0000/g, " ").trim();
    if (!text) {
      throw new Error("PaddleOCR found no readable text. The PDF may be blank or too low quality to recognize.");
    }
    return text.slice(0, 35_000);
  } catch (error) {
    if (error instanceof Error && /more than 20 pages|found no readable text|could not prepare/i.test(error.message)) {
      throw error;
    }
    throw new Error("PaddleOCR could not initialize or recognize this PDF. Check your connection and try again.");
  } finally {
    await ocr?.dispose().catch(() => undefined);
    await pdfDocument?.destroy().catch(() => undefined);
  }
}

async function loadPdfDocument(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data }).promise;
}

async function createOcr() {
  const { PaddleOCR } = await import("@paddleocr/paddleocr-js");
  return PaddleOCR.create({
    lang: "en",
    ocrVersion: "PP-OCRv5",
    ortOptions: { backend: "wasm", numThreads: 1 },
  });
}
