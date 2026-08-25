"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";

type FileUploadProps = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
};

export default function FileUpload({
  onFileSelected,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPendingFile(file);
    setShowWarning(true);

    event.target.value = "";
  };

  const handleConfirm = () => {
    if (!pendingFile) return;

    onFileSelected(pendingFile);

    setPendingFile(null);
    setShowWarning(false);
  };

  const handleCancel = () => {
    setPendingFile(null);
    setShowWarning(false);
  };

  const isImage = pendingFile?.type.startsWith("image/");

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center rounded-lg p-2 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        title="Upload file"
        aria-label="Upload file"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.49-8.48" />
        </svg>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => cameraInputRef.current?.click()}
        className="flex items-center justify-center rounded-lg p-2 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        title="Take photo"
        aria-label="Take photo"
      >
        <Camera size={20} />
      </button>

      {showWarning && pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="
              w-full max-w-md
              rounded-2xl
              border border-white/10
              bg-[#0b0f19]
              p-6
              shadow-2xl
              opacity-100
            "
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xl">
                ⚠️
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  {pendingFile.type.startsWith("image/")
                    ? "Temporary image analysis"
                    : "Temporary file analysis"}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {pendingFile.type.startsWith("image/")
                    ? "This image will be used only for this analysis. It will not be saved to your account or conversation history."
                    : "This file will be used only for this analysis. It will not be saved to your account or conversation history."}
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="truncate text-sm font-medium text-white">
                {pendingFile.name}
              </p>

              <p className="mt-1 text-xs text-white/40">
                {pendingFile.type || "Unknown file type"}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="
                  rounded-lg
                  border border-white/10
                  bg-white/[0.04]
                  px-4 py-2
                  text-sm text-white/70
                  transition
                  hover:bg-white/[0.08]
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="
                  rounded-lg
                  bg-primary
                  px-4 py-2
                  text-sm
                  font-medium
                  text-primary-foreground
                  transition
                  hover:opacity-90
                "
              >
                {isImage ? "Analyze image" : "Analyze once"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
