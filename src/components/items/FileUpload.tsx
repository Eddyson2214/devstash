"use client";

import { useRef, useState, type DragEvent } from "react";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { FILE_EXTENSIONS, IMAGE_EXTENSIONS, formatFileSize, type UploadCategory } from "@/lib/file-upload";

export interface UploadedFile {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

interface FileUploadProps {
  category: UploadCategory;
  value: UploadedFile | null;
  onChange: (value: UploadedFile | null) => void;
}

export function FileUpload({ category, value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  function upload(file: File) {
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setProgress(null);

      if (xhr.status >= 200 && xhr.status < 300) {
        onChange(JSON.parse(xhr.responseText) as UploadedFile);
        return;
      }

      const message = parseErrorMessage(xhr.responseText);
      toast.error(message);
    };

    xhr.onerror = () => {
      setProgress(null);
      toast.error("Upload failed");
    };

    xhr.send(formData);
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) upload(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
        {category === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote R2 URL, not a local asset
          <img
            src={value.fileUrl}
            alt={value.fileName}
            className="size-14 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
            <FileText className="size-6 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{value.fileName}</span>
          <span className="text-xs text-muted-foreground">{formatFileSize(value.fileSize)}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove file"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors",
        dragActive ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={(category === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS).join(",")}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {progress !== null ? (
        <div className="flex w-full flex-col gap-2">
          <span className="text-sm text-muted-foreground">Uploading… {progress}%</span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <Upload className="size-6 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">
            Drag and drop or click to upload {category === "image" ? "an image" : "a file"}
          </span>
        </>
      )}
    </div>
  );
}

function parseErrorMessage(responseText: string): string {
  try {
    const data = JSON.parse(responseText) as { error?: string };
    return data.error ?? "Upload failed";
  } catch {
    return "Upload failed";
  }
}
