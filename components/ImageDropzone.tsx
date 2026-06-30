"use client";

import { useCallback, useState } from "react";

type ImageDropzoneProps = {
  file: File | null;
  preview: string | null;
  onFileSelect: (file: File, preview: string) => void;
  onClear: () => void;
  disabled?: boolean;
};

export function ImageDropzone({
  file,
  preview,
  onFileSelect,
  onClear,
  disabled,
}: ImageDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (selected: File) => {
      setError(null);
      if (!selected.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5 MB.");
        return;
      }
      const url = URL.createObjectURL(selected);
      onFileSelect(selected, url);
    },
    [onFileSelect]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSelect(dropped);
  };

  return (
    <div className="sm:col-span-2">
      <span className="mb-1 block text-sm text-zinc-400">Watch Image</span>
      {!file ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition ${
            dragging
              ? "border-orange-500 bg-orange-500/10"
              : "border-zinc-700 bg-zinc-950 hover:border-zinc-600"
          } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <span className="text-3xl text-zinc-600">↑</span>
          <p className="mt-2 text-sm font-medium text-zinc-300">
            Drag & drop watch image here
          </p>
          <p className="mt-1 text-xs text-zinc-500">or click to browse · PNG, JPG, WebP · max 5 MB</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) validateAndSelect(selected);
            }}
          />
        </label>
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Watch preview"
              className="max-h-48 w-full object-contain"
            />
          )}
          <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
            <span className="truncate text-xs text-zinc-400">{file.name}</span>
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
