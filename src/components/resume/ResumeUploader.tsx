"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Info,
} from "lucide-react";

interface SelectedFileInfo {
  file: File;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
}

interface ResumeUploaderProps {
  selectedFile: SelectedFileInfo | null;
  onFileSelect: (fileInfo: SelectedFileInfo) => void;
  onFileRemove: () => void;
  isAnalyzing: boolean;
  maxSizeBytes?: number; // default 5MB
}

export function ResumeUploader({
  selectedFile,
  onFileSelect,
  onFileRemove,
  isAnalyzing,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
}: ResumeUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedExtensions = [".pdf", ".docx", ".doc"];
  const acceptedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Validate size
    if (file.size > maxSizeBytes) {
      setErrorMessage(
        `File exceeds maximum limit of 5 MB (selected file is ${(
          file.size /
          (1024 * 1024)
        ).toFixed(1)} MB). Please select a smaller resume file.`
      );
      return;
    }

    // Validate extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedExtensions.includes(ext) && !acceptedMimeTypes.includes(file.type)) {
      setErrorMessage(
        "Invalid file format. Please upload a PDF or Microsoft Word (.docx, .doc) document."
      );
      return;
    }

    // Simulate local browser loading progress
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const formattedSize =
            file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.round(file.size / 1024)} KB`;

          onFileSelect({
            file,
            name: file.name,
            size: file.size,
            formattedSize,
            type: file.type || ext,
          });
          return 100;
        }
        return prev + 25;
      });
    }, 60);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setUploadProgress(0);
    setErrorMessage(null);
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        onChange={handleFileInputChange}
        className="hidden"
        id="resume-file-input"
      />

      {uploadProgress > 0 && uploadProgress < 100 ? (
        <div className="p-5 bg-white border border-[#E7E7E7] rounded-2xl shadow-xs space-y-3">
          <div className="flex justify-between text-xs font-semibold text-[#090909]">
            <span>Processing document...</span>
            <span className="text-[#090909] font-bold">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-[#E7E7E7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#090909] rounded-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : !selectedFile ? (
        /* Drag-and-Drop Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-150 ${
            isDragOver
              ? "border-[#090909] bg-[#F4F4F4] scale-[1.005]"
              : "border-[#E7E7E7] hover:border-[#090909] bg-white hover:bg-[#FAFAFA]"
          }`}
        >
          <div className="h-12 w-12 rounded-2xl bg-[#090909] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UploadCloud size={24} />
          </div>

          <h3 className="text-sm font-bold text-[#090909] mb-1">
            Upload your resume for critique
          </h3>
          <p className="text-xs text-[#737373] max-w-sm mx-auto mb-4 leading-relaxed">
            Drag and drop your file here, or click to browse from your device.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#090909] text-white text-xs font-medium hover:bg-[#242424] shadow-xs transition-colors">
            <span>Choose File</span>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#737373]">
            <span>Accepted formats: <strong className="text-[#090909]">PDF, DOCX, DOC</strong></span>
            <span>·</span>
            <span>Max file size: <strong className="text-[#090909]">5 MB</strong></span>
          </div>
        </div>
      ) : (
        /* Selected File Card & Progress */
        <div className="p-4 sm:p-5 bg-white border border-[#E7E7E7] rounded-2xl shadow-xs space-y-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#090909] text-white flex items-center justify-center shrink-0">
                <FileCheck size={20} />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#090909] truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#737373]">
                  <span>{selectedFile.formattedSize}</span>
                  <span>·</span>
                  <span className="text-[#090909] font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Ready for Review
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              disabled={isAnalyzing}
              className="p-1 rounded-md text-[#737373] hover:text-[#090909] hover:bg-[#F4F4F4] transition-colors"
              title="Remove file"
              aria-label="Remove uploaded resume"
            >
              <X size={16} />
            </button>
          </div>

          {/* Local Browser File Notice */}
          <div className="p-3 bg-[#F4F4F4] border border-[#E7E7E7] rounded-xl flex items-start gap-2.5 text-xs text-[#737373]">
            <Info size={15} className="text-[#090909] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-[#090909]">Privacy:</strong> Selecting a file keeps it on this device. Nothing is sent for analysis until you authorize it below. With your consent, the file is sent to AlumniPath for text extraction; only the extracted text is shared with the configured AI provider, and the original file is not stored.
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {errorMessage && (
        <div className="p-3 bg-[#F4F4F4] border border-[#E7E7E7] rounded-xl flex items-center gap-2 text-xs text-[#090909]">
          <AlertCircle size={15} className="shrink-0 text-[#090909]" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
