"use client";

import { useState, useRef, type KeyboardEvent, type FormEvent, type ChangeEvent } from "react";
import { Send, Loader2, Sparkles, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChatComposerProps {
  onSendMessage: (content: string, images?: string[]) => void;
  isLoading: boolean;
  placeholder?: string;
  initialValue?: string;
}

export function ChatComposer({
  onSendMessage,
  isLoading,
  placeholder = "Ask about skills, projects, internships, or upload an image/resume/diagram to audit...",
  initialValue = "",
}: ChatComposerProps) {
  const [content, setContent] = useState(initialValue);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Support up to 5 images per request according to Nemotron Omni multimodal budget
    const filesToRead = Array.from(files).slice(0, 5 - selectedImages.length);

    filesToRead.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setSelectedImages((prev) => (prev.length < 5 ? [...prev, result] : prev));
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if ((!content.trim() && selectedImages.length === 0) || isLoading) return;

    const messageText = content.trim() || (selectedImages.length > 0 ? "Please analyze this image." : "");
    onSendMessage(messageText, selectedImages.length > 0 ? selectedImages : undefined);
    setContent("");
    setSelectedImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-white border border-[#E7E7E7] rounded-xl shadow-xs focus-within:ring-1 focus-within:ring-[#090909] focus-within:border-[#090909] transition-all p-2 sm:p-2.5">
      {/* Uploaded Images Preview Strip */}
      {selectedImages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2 p-1.5 bg-[#FAFAFA] rounded-lg border border-[#E7E7E7]">
          {selectedImages.map((img, idx) => (
            <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-[#D1D1D1] bg-white shadow-2xs shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                aria-label="Remove image"
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/75 text-white hover:bg-black transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <span className="text-[10px] text-[#737373] ml-1">
            {selectedImages.length}/5 images attached (NVIDIA Nemotron Omni Reasoning)
          </span>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full resize-none bg-transparent text-xs text-[#090909] placeholder-[#737373] p-2 focus:outline-none max-h-36 overflow-y-auto leading-relaxed"
        />

        <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            aria-label="Upload images for AI visual analysis"
          />

          <button
            type="button"
            disabled={isLoading || selectedImages.length >= 5}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image or resume diagram (NVIDIA Nemotron 3 Nano Omni multimodal)"
            className="h-8 w-8 rounded-full border border-[#E7E7E7] bg-white hover:bg-[#F4F4F4] text-[#454545] hover:text-[#090909] flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <ImageIcon size={14} />
          </button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={(!content.trim() && selectedImages.length === 0) || isLoading}
            className="h-8 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs bg-[#090909] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin text-white" />
                <span className="hidden sm:inline">Thinking...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-1.5 border-t border-[#E7E7E7] text-[10px] text-[#737373]">
        <span className="hidden sm:inline">
          Press <strong>Enter ↵</strong> to send, <strong>Shift + Enter</strong> for a new line
        </span>
        <span className="sm:hidden">
          Tap Send to submit
        </span>
        <span className="flex items-center gap-1 text-[#737373]">
          <Sparkles size={11} className="text-[#090909]" />
          NVIDIA Nemotron Omni Reasoning · Image + Text
        </span>
      </div>
    </form>
  );
}
