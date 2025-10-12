import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

// Inline cn utility function
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  multiple = false,
  variant = "default",
}: {
  onChange?: (files: File[]) => void;
  multiple?: boolean;
  variant?: "default" | "dark";
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: multiple,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className={`p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden ${
          variant === "dark"
            ? "bg-gray-800 border border-gray-600"
            : "bg-gray-100 dark:bg-neutral-900"
        }`}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple={multiple}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern variant={variant} />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p
            className={`relative z-20 font-sans font-bold text-base ${
              variant === "dark"
                ? "text-gray-200"
                : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {multiple ? "Upload PDF files" : "Upload file"}
          </p>
          <p
            className={`relative z-20 font-sans font-normal text-base mt-2 ${
              variant === "dark"
                ? "text-gray-400"
                : "text-neutral-400 dark:text-neutral-400"
            }`}
          >
            {multiple
              ? "Drag and drop multiple PDF files here or click to select files"
              : "Drag or drop your files here or click to upload"}
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    `relative overflow-hidden z-40 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md shadow-sm ${
                      variant === "dark"
                        ? "bg-gray-700"
                        : "bg-white dark:bg-neutral-900"
                    }`
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className={`text-base truncate max-w-xs ${
                        variant === "dark"
                          ? "text-gray-200"
                          : "text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className={`rounded-lg px-2 py-1 w-fit shrink-0 text-sm shadow-input ${
                        variant === "dark"
                          ? "bg-gray-600 text-gray-200"
                          : "text-neutral-600 dark:bg-neutral-800 dark:text-white"
                      }`}
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div
                    className={`flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between ${
                      variant === "dark"
                        ? "text-gray-400"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className={`px-1 py-0.5 rounded-md ${
                        variant === "dark"
                          ? "bg-gray-600"
                          : "bg-gray-100 dark:bg-neutral-800"
                      }`}
                    >
                      {file.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  `relative group-hover/file:shadow-2xl z-40 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md shadow-[0px_10px_50px_rgba(0,0,0,0.1)] ${
                    variant === "dark"
                      ? "bg-gray-700"
                      : "bg-white dark:bg-neutral-900"
                  }`
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex flex-col items-center ${
                      variant === "dark" ? "text-gray-400" : "text-neutral-600"
                    }`}
                  >
                    Drop it
                    <IconUpload
                      className={`h-4 w-4 ${
                        variant === "dark"
                          ? "text-gray-400"
                          : "text-neutral-600 dark:text-neutral-400"
                      }`}
                    />
                  </motion.p>
                ) : (
                  <IconUpload
                    className={`h-4 w-4 ${
                      variant === "dark"
                        ? "text-gray-400"
                        : "text-neutral-600 dark:text-neutral-300"
                    }`}
                  />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern({
  variant = "default",
}: {
  variant?: "default" | "dark";
}) {
  const columns = 41;
  const rows = 11;
  return (
    <div
      className={`flex shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105 ${
        variant === "dark" ? "bg-gray-800" : "bg-gray-100 dark:bg-neutral-900"
      }`}
    >
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                variant === "dark"
                  ? index % 2 === 0
                    ? "bg-gray-700"
                    : "bg-gray-700 shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
                  : index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
