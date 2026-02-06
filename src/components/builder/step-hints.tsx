"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateHexInput } from "@/lib/schemas";

export function StepHints() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateHexInput>();

  const entryHints = watch("entryHints") || [];
  const tags = watch("tags") || [];

  const [hintInput, setHintInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const addHint = () => {
    if (hintInput.trim() && !entryHints.includes(hintInput.trim())) {
      setValue("entryHints", [...entryHints, hintInput.trim()]);
      setHintInput("");
    }
  };

  const removeHint = (hint: string) => {
    setValue(
      "entryHints",
      entryHints.filter((h) => h !== hint)
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  };

  const handleHintKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addHint();
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-8">
      {/* Entry Hints */}
      <div>
        <Label>Entry hints</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          Semantic keywords that help agents find this hex. Press Enter to add.
        </p>

        <div className="mt-3 flex gap-2">
          <Input
            placeholder="e.g., button styling, form validation..."
            value={hintInput}
            onChange={(e) => setHintInput(e.target.value)}
            onKeyDown={handleHintKeyDown}
          />
          <Button type="button" variant="secondary" onClick={addHint}>
            Add
          </Button>
        </div>

        {errors.entryHints && (
          <p className="mt-1 text-sm text-destructive">
            {errors.entryHints.message || "At least one entry hint is required"}
          </p>
        )}

        {entryHints.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {entryHints.map((hint) => (
              <Badge
                key={hint}
                variant="secondary"
                className="cursor-pointer gap-1 pr-1"
              >
                {hint}
                <button
                  type="button"
                  onClick={() => removeHint(hint)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove ${hint}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <Label>Tags (optional)</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          Categorization tags for filtering and organization.
        </p>

        <div className="mt-3 flex gap-2">
          <Input
            placeholder="e.g., ui, backend, constitution..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            Add
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer gap-1 pr-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove ${tag}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
