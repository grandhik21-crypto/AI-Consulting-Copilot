import { useState, useRef, useCallback } from "react";

export default function PdfUploadZone({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (file && file.type === "application/pdf") {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onClick = () => inputRef.current?.click();

  const onChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
    e.target.value = "";
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
        dragging
          ? "border-indigo-500 bg-indigo-950/30"
          : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={onChange}
      />

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      <p className="text-sm font-medium text-zinc-300">
        <span className="text-indigo-400">Click to upload</span> or drag and drop
      </p>
      <p className="mt-1 text-xs text-zinc-500">PDF only, up to 25MB</p>
    </div>
  );
}
