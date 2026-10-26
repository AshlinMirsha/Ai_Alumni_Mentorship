declare module "word-extractor" {
  interface WordDocument {
    getBody(): string;
  }

  class WordExtractor {
    extract(input: Buffer): Promise<WordDocument>;
  }

  export default WordExtractor;
}

declare module "@paddleocr/paddleocr-js" {
  export const PaddleOCR: {
    create(options?: any): Promise<{
      predict(canvas: HTMLCanvasElement): Promise<Array<{ items: Array<{ text: string }> }>>;
      dispose(): Promise<void>;
    }>;
  };
}
