"use client";

import { useRef } from "react";

type FileUploadProps = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
};

export default function FileUpload({
  onFileSelected,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onFileSelected(file);

    // Allows selecting the same file again later.
    event.target.value = "";
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
    </>
  );
}
