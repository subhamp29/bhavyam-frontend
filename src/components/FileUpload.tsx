"use client";

import { useRef, useState } from "react";

type FileUploadProps = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
};

export default function FileUpload({
  onFileSelected,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
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

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
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

      {showWarning && pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="text-xl">
                ⚠️
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Temporary file analysis
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  This file will be used only for this analysis.
                  It will not be saved to your account or
                  conversation history.
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-lg bg-muted p-3">
              <p className="truncate text-sm font-medium">
                {pendingFile.name}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {pendingFile.type || "Unknown file type"}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
              >
                Analyze once
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
