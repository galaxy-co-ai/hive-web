"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Hex } from "@/lib/schemas";

type InputMode = "file" | "text" | "url";
type Status = "idle" | "dragover" | "processing" | "success" | "error";

interface IngestResponse {
  success: boolean;
  data?: {
    hexes: Hex[];
    message: string;
  };
  error?: string;
}

interface ProgressEvent {
  type: "progress" | "complete" | "error";
  current?: number;
  total?: number;
  message?: string;
  hexes?: Hex[];
  error?: string;
}

export function DropZone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<InputMode>("file");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  // Text input state
  const [pastedText, setPastedText] = useState("");
  const [sourceName, setSourceName] = useState("");

  // URL input state
  const [url, setUrl] = useState("");

  const resetState = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
    setSuccessMessage("");
    setProgressMessage("");
    setProgressPercent(0);
  }, []);

  const handleSuccess = useCallback(
    (hexes: Hex[], message: string) => {
      setStatus("success");
      setSuccessMessage(`Created ${hexes.length} hex(es): ${message}`);
      setTimeout(() => {
        router.push("/viewer");
      }, 1500);
    },
    [router]
  );

  const handleError = useCallback((message: string) => {
    setStatus("error");
    setErrorMessage(message);
  }, []);

  const processFilesWithStreaming = useCallback(
    async (files: File[]) => {
      setStatus("processing");
      setProgressMessage(`Starting batch upload of ${files.length} file(s)...`);
      setProgressPercent(0);

      const formData = new FormData();
      files.forEach((file) => formData.append("file", file));

      try {
        const response = await fetch("/api/ingest/stream", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          handleError(data.error || "Failed to process files");
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          handleError("No response stream");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event: ProgressEvent = JSON.parse(line.slice(6));

                if (event.type === "progress") {
                  setProgressMessage(event.message || "Processing...");
                  if (event.current && event.total) {
                    setProgressPercent(Math.round((event.current / event.total) * 100));
                  }
                } else if (event.type === "complete") {
                  handleSuccess(event.hexes || [], event.message || "Complete");
                } else if (event.type === "error") {
                  handleError(event.error || "Unknown error");
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      } catch {
        handleError("Network error. Please try again.");
      }
    },
    [handleSuccess, handleError]
  );

  const processFile = useCallback(
    async (file: File) => {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        handleError("File exceeds 10MB limit");
        return;
      }

      // Validate file type
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "txt", "md"].includes(extension || "")) {
        handleError("Unsupported file type. Use PDF, TXT, or MD.");
        return;
      }

      setStatus("processing");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/ingest", {
          method: "POST",
          body: formData,
        });

        const data: IngestResponse = await response.json();

        if (data.success && data.data) {
          handleSuccess(data.data.hexes, data.data.message);
        } else {
          handleError(data.error || "Failed to process file");
        }
      } catch {
        handleError("Network error. Please try again.");
      }
    },
    [handleSuccess, handleError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      resetState();

      const files = Array.from(e.dataTransfer.files);

      if (files.length === 0) return;

      // Validate all files
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          handleError(`File "${file.name}" exceeds 10MB limit`);
          return;
        }
        const extension = file.name.split(".").pop()?.toLowerCase();
        if (!["pdf", "txt", "md"].includes(extension || "")) {
          handleError(`File "${file.name}" has unsupported type. Use PDF, TXT, or MD.`);
          return;
        }
      }

      if (files.length === 1) {
        processFile(files[0]);
      } else {
        // Batch upload with streaming
        processFilesWithStreaming(files);
      }
    },
    [processFile, processFilesWithStreaming, resetState, handleError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setStatus("dragover");
  }, []);

  const handleDragLeave = useCallback(() => {
    setStatus("idle");
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      resetState();

      if (files.length === 1) {
        processFile(files[0]);
      } else {
        processFilesWithStreaming(files);
      }
    },
    [processFile, processFilesWithStreaming, resetState]
  );

  const handleTextSubmit = useCallback(async () => {
    if (!pastedText.trim()) {
      handleError("Please enter some text");
      return;
    }

    setStatus("processing");

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pastedText,
          sourceName: sourceName || "Pasted Text",
        }),
      });

      const data: IngestResponse = await response.json();

      if (data.success && data.data) {
        handleSuccess(data.data.hexes, data.data.message);
      } else {
        handleError(data.error || "Failed to process text");
      }
    } catch {
      handleError("Network error. Please try again.");
    }
  }, [pastedText, sourceName, handleSuccess, handleError]);

  const handleUrlSubmit = useCallback(async () => {
    if (!url.trim()) {
      handleError("Please enter a URL");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      handleError("URL must start with http:// or https://");
      return;
    }

    setStatus("processing");

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data: IngestResponse = await response.json();

      if (data.success && data.data) {
        handleSuccess(data.data.hexes, data.data.message);
      } else {
        handleError(data.error || "Failed to process URL");
      }
    } catch {
      handleError("Network error. Please try again.");
    }
  }, [url, handleSuccess, handleError]);

  const getDropZoneClasses = () => {
    const base =
      "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer";

    switch (status) {
      case "dragover":
        return `${base} border-primary bg-primary/5 scale-[1.02]`;
      case "processing":
        return `${base} border-muted-foreground/30 bg-muted/50 cursor-wait`;
      case "success":
        return `${base} border-green-500 bg-green-500/5`;
      case "error":
        return `${base} border-destructive bg-destructive/5`;
      default:
        return `${base} border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30`;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as InputMode);
          resetState();
        }}
      >
        <TabsList className="w-full mb-4">
          <TabsTrigger value="file" className="flex-1">
            Files
          </TabsTrigger>
          <TabsTrigger value="text" className="flex-1">
            Paste Text
          </TabsTrigger>
          <TabsTrigger value="url" className="flex-1">
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <div
            className={getDropZoneClasses()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md"
              multiple
              onChange={handleFileSelect}
            />

            {status === "processing" ? (
              <div className="space-y-3">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground">{progressMessage || "Processing..."}</p>
                {progressPercent > 0 && (
                  <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            ) : status === "success" ? (
              <div className="space-y-3">
                <div className="text-4xl">✓</div>
                <p className="text-green-600 dark:text-green-400">
                  {successMessage}
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to viewer...
                </p>
              </div>
            ) : status === "error" ? (
              <div className="space-y-3">
                <div className="text-4xl">⚠</div>
                <p className="text-destructive">{errorMessage}</p>
                <Button variant="outline" size="sm" onClick={resetState}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl opacity-50">📄</div>
                <p className="text-lg font-medium">
                  {status === "dragover"
                    ? "Drop it!"
                    : "Drop files or click to upload"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, TXT, or Markdown (max 10MB each)
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports batch upload — drop multiple files
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="text">
          <div className="space-y-4">
            <Input
              placeholder="Source name (optional)"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
            />
            <Textarea
              placeholder="Paste your text here..."
              className="min-h-[200px]"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />

            {status === "error" && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            {status === "success" && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            )}

            <Button
              className="w-full"
              onClick={handleTextSubmit}
              disabled={status === "processing"}
            >
              {status === "processing" ? "Processing..." : "Process Text"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-4">
            <Input
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            {status === "error" && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            {status === "success" && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            )}

            <Button
              className="w-full"
              onClick={handleUrlSubmit}
              disabled={status === "processing"}
            >
              {status === "processing" ? "Fetching..." : "Fetch & Process"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
