"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
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

export function FloatingIngest() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
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
      "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer text-sm";

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
    <>
      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating container */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Expanded panel */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-background border rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-2 fade-in duration-200">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v as InputMode);
                resetState();
              }}
            >
              <TabsList className="w-full mb-3 h-8">
                <TabsTrigger value="file" className="flex-1 text-xs">
                  File
                </TabsTrigger>
                <TabsTrigger value="text" className="flex-1 text-xs">
                  Paste
                </TabsTrigger>
                <TabsTrigger value="url" className="flex-1 text-xs">
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-0">
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
                    <div className="space-y-2">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                      <p className="text-muted-foreground text-xs">Processing...</p>
                    </div>
                  ) : status === "success" ? (
                    <div className="space-y-2">
                      <div className="text-xl">✓</div>
                      <p className="text-green-600 dark:text-green-400 text-xs">
                        {successMessage}
                      </p>
                    </div>
                  ) : status === "error" ? (
                    <div className="space-y-2">
                      <div className="text-xl">⚠</div>
                      <p className="text-destructive text-xs">{errorMessage}</p>
                      <Button variant="outline" size="sm" onClick={resetState} className="h-6 text-xs">
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-xl opacity-50">📄</div>
                      <p className="font-medium text-xs">
                        {status === "dragover" ? "Drop it!" : "Drop or click"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        PDF, TXT, MD (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-0">
                <div className="space-y-2">
                  <Input
                    placeholder="Source name (optional)"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Textarea
                    placeholder="Paste your text here..."
                    className="min-h-[100px] text-sm resize-none"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                  />

                  {status === "error" && (
                    <p className="text-xs text-destructive">{errorMessage}</p>
                  )}
                  {status === "success" && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {successMessage}
                    </p>
                  )}

                  <Button
                    className="w-full h-8 text-sm"
                    onClick={handleTextSubmit}
                    disabled={status === "processing"}
                  >
                    {status === "processing" ? "Processing..." : "Process"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="url" className="mt-0">
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-8 text-sm"
                  />

                  {status === "error" && (
                    <p className="text-xs text-destructive">{errorMessage}</p>
                  )}
                  {status === "success" && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {successMessage}
                    </p>
                  )}

                  <Button
                    className="w-full h-8 text-sm"
                    onClick={handleUrlSubmit}
                    disabled={status === "processing"}
                  >
                    {status === "processing" ? "Fetching..." : "Fetch & Process"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}
