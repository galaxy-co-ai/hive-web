"use client";

import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateHexInput } from "@/lib/schemas";

export function StepContents() {
  const { watch, setValue, formState: { errors } } = useFormContext<CreateHexInput>();
  const contents = watch("contents");

  const [jsonString, setJsonString] = useState(() =>
    JSON.stringify(contents || { data: {} }, null, 2)
  );

  const parseError = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonString);
      setValue("contents", parsed);
      return null;
    } catch {
      return "Invalid JSON";
    }
  }, [jsonString, setValue]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="contents">Contents</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          JSON object with the hex&apos;s payload. Use the structure: {`{ data: {...}, refs: [...], tools: [...] }`}
        </p>
      </div>

      <Textarea
        id="contents"
        value={jsonString}
        onChange={(e) => setJsonString(e.target.value)}
        className="mt-2 min-h-[300px] font-mono text-sm"
        placeholder={`{
  "data": {
    "key": "value"
  }
}`}
      />

      {parseError && (
        <p className="text-sm text-destructive">{parseError}</p>
      )}
      {errors.contents && (
        <p className="text-sm text-destructive">
          {errors.contents.message || "Contents must be a valid object"}
        </p>
      )}

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm font-medium">Structure reference</p>
        <pre className="mt-2 text-xs text-muted-foreground">
{`{
  "data": { ... },     // Actual payload
  "refs": ["..."],     // Pointers to files, URLs, hexes
  "tools": [...]       // Callable functions (for tool hexes)
}`}
        </pre>
      </div>
    </div>
  );
}
