"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateHexInput, HexType } from "@/lib/schemas";

const hexTypes: Array<{ value: HexType; label: string; description: string }> = [
  { value: "data", label: "Data", description: "Stores information" },
  { value: "tool", label: "Tool", description: "Exposes a capability" },
  { value: "gateway", label: "Gateway", description: "Connects to external systems" },
  { value: "junction", label: "Junction", description: "Pure routing logic" },
];

interface StepBasicProps {
  isEdit: boolean;
}

export function StepBasic({ isEdit }: StepBasicProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<CreateHexInput>();

  const selectedType = watch("type");

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="id">ID</Label>
        <Input
          id="id"
          placeholder="my-hex-id"
          {...register("id")}
          disabled={isEdit}
          className="mt-2"
        />
        {errors.id && (
          <p className="mt-1 text-sm text-destructive">{errors.id.message}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Lowercase alphanumeric with hyphens. Cannot be changed after creation.
        </p>
      </div>

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="My Hex"
          {...register("name")}
          className="mt-2"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label>Type</Label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {hexTypes.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("type", value)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                selectedType === value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <p className="font-medium">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="mt-1 text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Brief description of what this hex contains..."
          {...register("description")}
          className="mt-2"
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>
    </div>
  );
}
