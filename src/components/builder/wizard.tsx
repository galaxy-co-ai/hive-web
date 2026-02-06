"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { StepBasic } from "./step-basic";
import { StepHints } from "./step-hints";
import { StepContents } from "./step-contents";
import { StepEdges } from "./step-edges";
import { Preview } from "./preview";
import { createHexSchema, CreateHexInput, Hex } from "@/lib/schemas";

const STEPS = ["Basic info", "Entry hints", "Contents", "Edges"] as const;

interface WizardProps {
  initialData?: Hex;
  mode: "create" | "edit";
}

export function Wizard({ initialData, mode }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<CreateHexInput>({
    resolver: zodResolver(createHexSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          name: initialData.name,
          type: initialData.type,
          description: initialData.description,
          entryHints: initialData.entryHints,
          tags: initialData.tags,
          contents: initialData.contents,
          edges: initialData.edges,
        }
      : {
          id: "",
          name: "",
          type: "data",
          description: "",
          entryHints: [],
          tags: [],
          contents: { data: {} },
          edges: [],
        },
    mode: "onChange",
  });

  const { trigger, handleSubmit, watch } = methods;
  const formData = watch();

  const validateStep = async () => {
    switch (step) {
      case 0:
        return trigger(["id", "name", "type", "description"]);
      case 1:
        return trigger(["entryHints", "tags"]);
      case 2:
        return trigger(["contents"]);
      case 3:
        return trigger(["edges"]);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid && step < STEPS.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (data: CreateHexInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = mode === "edit" ? `/api/hexes/${data.id}` : "/api/hexes";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || "Failed to save hex");
        return;
      }

      router.push(`/viewer/${result.data.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPreview = step === STEPS.length;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                        ? "border-2 border-primary text-primary"
                        : "border border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="mt-2 text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  isPreview
                    ? "border-2 border-primary text-primary"
                    : "border border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                5
              </div>
              <span className="mt-2 text-xs text-muted-foreground">Preview</span>
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {step === 0 && <StepBasic isEdit={mode === "edit"} />}
          {step === 1 && <StepHints />}
          {step === 2 && <StepContents />}
          {step === 3 && <StepEdges />}
          {isPreview && <Preview data={formData as CreateHexInput} />}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </Button>

          <div className="flex gap-3">
            {!isPreview ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "edit"
                    ? "Update hex"
                    : "Create hex"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
