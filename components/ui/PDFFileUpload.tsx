"use client";

import React from "react";

interface PDFFileUploadProps {
  title: string;
  description: string;
  onFileSelect: (file: File) => void;
  accept?: string;
}

export const PDFFileUpload: React.FC<PDFFileUploadProps> = ({
  title,
  description,
  onFileSelect,
  accept = ".pdf",
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400">{description}</p>
        </div>

        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="mb-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Choose PDF File
            </label>
            <input
              id="file-upload"
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <p className="text-gray-400 text-sm">
            Drag and drop your PDF here, or click to browse
          </p>
        </div>
      </div>
    </div>
  );
};
