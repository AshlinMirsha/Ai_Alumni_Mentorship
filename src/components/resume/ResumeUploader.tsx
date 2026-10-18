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
        <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xs space-y-3">
          <div className="flex justify-between text-xs font-semibold text-[#191919]">
            <span>Processing document...</span>
            <span className="text-[#0a66c2] font-bold">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0a66c2] rounded-full transition-all duration-150"
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
          className={`border-2 border-dashed rounded-lg p-8 sm:p-10 text-center cursor-pointer transition-all duration-150 ${
            isDragOver
              ? "border-[#0a66c2] bg-[#ebf3fb]/40 scale-[1.005]"
              : "border-gray-300 hover:border-[#0a66c2] bg-gray-50/50 hover:bg-white"
          }`}
        >
          <div className="h-12 w-12 rounded-lg bg-[#ebf3fb] border border-[#0a66c2]/20 text-[#0a66c2] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UploadCloud size={24} />
          </div>

          <h3 className="text-sm font-bold text-[#191919] mb-1">
            Upload your resume for critique
          </h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto mb-4 leading-relaxed">
            Drag and drop your file here, or click to browse from your device.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#0a66c2] text-xs font-semibold text-[#0a66c2] hover:bg-[#ebf3fb] shadow-xs transition-colors">
            <span>Choose File</span>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#8c8c8c]">
            <span>Accepted formats: <strong className="text-[#666666]">PDF, DOCX, DOC</strong></span>
            <span>·</span>
            <span>Max file size: <strong className="text-[#666666]">5 MB</strong></span>
          </div>
        </div>
      ) : (
        /* Selected File Card & Progress */
        <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-lg shadow-xs space-y-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#ebf3fb] border border-[#0a66c2]/20 flex items-center justify-center text-[#0a66c2] shrink-0">
                <FileCheck size={20} />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#191919] truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#666666]">
                  <span>{selectedFile.formattedSize}</span>
                  <span>·</span>
                  <span className="text-[#057642] font-semibold inline-flex items-center gap-1">
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
              className="p-1 rounded-md text-gray-400 hover:text-[#191919] hover:bg-gray-100 transition-colors"
              title="Remove file"
              aria-label="Remove uploaded resume"
            >
              <X size={16} />
            </button>
          </div>

          {/* Local Browser File Notice */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2.5 text-xs text-[#666666]">
            <Info size={15} className="text-[#0a66c2] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-[#191919]">Local Privacy Guarantee:</strong> In demo mode, your file is read locally by your browser. No files are uploaded to external servers or transmitted to third-party AI APIs without authorization.
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
