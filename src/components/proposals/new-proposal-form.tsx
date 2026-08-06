"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ProposalFormData } from "@/types";

const INDUSTRIES = [
  { value: "", label: "Select industry…" },
  { value: "Agriculture", label: "Agriculture & Agribusiness" },
  { value: "Construction", label: "Construction & Real Estate" },
  { value: "Education", label: "Education & Training" },
  { value: "Finance", label: "Finance & Fintech" },
  { value: "Healthcare", label: "Healthcare & Pharmaceuticals" },
  { value: "Hospitality", label: "Hospitality & Tourism" },
  { value: "ICT", label: "ICT & Software" },
  { value: "Logistics", label: "Logistics & Supply Chain" },
  { value: "Manufacturing", label: "Manufacturing & Production" },
  { value: "Media", label: "Media & Creative Arts" },
  { value: "NGO", label: "NGO & Social Enterprise" },
  { value: "Retail", label: "Retail & E-commerce" },
  { value: "Other", label: "Other" },
];

const BUDGETS = [
  { value: "", label: "Select range…" },
  { value: "Under $1,000", label: "Under $1,000" },
  { value: "$1,000 – $5,000", label: "$1,000 – $5,000" },
  { value: "$5,000 – $20,000", label: "$5,000 – $20,000" },
  { value: "$20,000 – $50,000", label: "$20,000 – $50,000" },
  { value: "$50,000 – $100,000", label: "$50,000 – $100,000" },
  { value: "Above $100,000", label: "Above $100,000" },
  { value: "To be discussed", label: "To be discussed" },
];

const STEPS = ["Project Details", "Client Info", "Review & Generate"];

export function NewProposalForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProposalFormData>({
    title: "",
    clientName: "",
    clientIndustry: "",
    projectScope: "",
    budgetRange: "",
    linkedSopId: "",
  });

  function update(field: keyof ProposalFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance() {
    if (step === 0)
      return form.title.trim().length > 0 && form.projectScope.trim().length > 0;
    if (step === 1) return form.clientName.trim().length > 0;
    return true;
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate proposal");
      }
      const { id } = await res.json();
      router.push(`/proposals/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    i < step
                      ? "bg-violet-600 text-white"
                      : i === step
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {i < step ? (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`hidden sm:block text-xs font-medium ${
                    i === step ? "text-zinc-900" : "text-zinc-400"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 sm:w-12 flex-shrink-0 transition-colors ${
                    i < step ? "bg-violet-600" : "bg-zinc-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0 — Project Details */}
      {step === 0 && (
        <div className="space-y-5">
          <Input
            label="Proposal Title"
            placeholder="e.g. Digital Transformation Strategy for ACME Ltd"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            hint="Give this proposal a clear, descriptive name"
          />
          <Select
            label="Budget Range"
            options={BUDGETS}
            value={form.budgetRange}
            onChange={(e) => update("budgetRange", e.target.value)}
          />
          <Textarea
            label="Project Scope"
            placeholder="Describe what you'll deliver — services, goals, expected outcomes, and any relevant background context..."
            value={form.projectScope}
            onChange={(e) => update("projectScope", e.target.value)}
            rows={5}
            hint="The more detail you provide, the better the AI-generated proposal"
          />
        </div>
      )}

      {/* Step 1 — Client Info */}
      {step === 1 && (
        <div className="space-y-5">
          <Input
            label="Client / Organisation Name"
            placeholder="e.g. ACME Ltd, Ministry of Agriculture"
            value={form.clientName}
            onChange={(e) => update("clientName", e.target.value)}
          />
          <Select
            label="Client Industry"
            options={INDUSTRIES}
            value={form.clientIndustry}
            onChange={(e) => update("clientIndustry", e.target.value)}
          />
          <Input
            label="Linked SOP ID (optional)"
            placeholder="e.g. sop_abc123 — from your Pryro SOP library"
            value={form.linkedSopId ?? ""}
            onChange={(e) => update("linkedSopId", e.target.value)}
            hint="Attach an SOP to automatically pull methodology into your proposal"
          />
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            Review your details before we generate the proposal.
          </p>
          <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100">
            {[
              ["Proposal Title", form.title],
              ["Client", form.clientName],
              ["Industry", form.clientIndustry || "—"],
              ["Budget", form.budgetRange || "—"],
              ["Linked SOP", form.linkedSopId || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-zinc-500">{label}</span>
                <span className="font-medium text-zinc-800 text-right max-w-xs truncate">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-600">
            <p className="font-medium text-zinc-700 mb-1">Scope summary</p>
            <p className="leading-relaxed line-clamp-4">{form.projectScope}</p>
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          size="md"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < 2 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            loading={loading}
            disabled={loading}
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating…" : "Generate Proposal"}
          </Button>
        )}
      </div>
    </div>
  );
}
