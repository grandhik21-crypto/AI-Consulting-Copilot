import { useState, useRef, useCallback } from "react";

const ACCEPTED = [
  ".xlsx",
  ".csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

export default function ExcelUploadZone({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (ext === ".xlsx" || ext === ".csv") {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
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
    handleFile(e.target.files[0]);
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
        accept=".xlsx,.csv"
        className="hidden"
        onChange={onChange}
      />

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <p className="text-sm font-medium text-zinc-300">
        <span className="text-indigo-400">Click to upload</span> or drag and drop
      </p>
      <p className="mt-1 text-xs text-zinc-500">.xlsx or .csv, up to 25MB</p>
    </div>
  );
}
