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

export function DropZone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<InputMode>("file");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Text input state
  const [pastedText, setPastedText] = useState("");
  const [sourceName, setSourceName] = useState("");

  // URL input state
  const [url, setUrl] = useState("");

  const resetState = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  const handleSuccess = useCallback(
    (response: IngestResponse) => {
      if (response.success && response.data) {
        setStatus("success");
        setSuccessMessage(
          `Created ${response.data.hexes.length} hex(es): ${response.data.message}`
        );
        // Redirect to viewer after short delay
        setTimeout(() => {
          router.push("/viewer");
        }, 1500);
      }
    },
    [router]
  );

  const handleError = useCallback((message: string) => {
    setStatus("error");
    setErrorMessage(message);
  }, []);

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

        if (data.success) {
          handleSuccess(data);
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

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile, resetState]
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
      const file = e.target.files?.[0];
      if (file) {
        resetState();
        processFile(file);
      }
    },
    [processFile, resetState]
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

      if (data.success) {
        handleSuccess(data);
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

      if (data.success) {
        handleSuccess(data);
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
            File
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
              onChange={handleFileSelect}
            />

            {status === "processing" ? (
              <div className="space-y-3">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground">Processing document...</p>
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
                    : "Drop a file or click to upload"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, TXT, or Markdown (max 10MB)
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
