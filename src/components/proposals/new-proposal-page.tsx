"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProposalToast, toastError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText } from "lucide-react";

const PROPOSAL_TYPES = [
  { value: "CONSULTING",   label: "Consulting" },
  { value: "CONSTRUCTION", label: "Construction / Bid" },
  { value: "CREATIVE",     label: "Creative Agency" },
  { value: "IT_SOFTWARE",  label: "IT / Software" },
  { value: "FREELANCE",    label: "Freelance / General" },
  { value: "GENERAL",      label: "General Business" },
];

const TONES = [
  { value: "PROFESSIONAL",   label: "Professional" },
  { value: "CONVERSATIONAL", label: "Conversational" },
  { value: "EXECUTIVE",      label: "Executive" },
];

const schema = z.object({
  title:           z.string().min(2, "Title is required"),
  yourCompanyName: z.string().min(2, "Your company name is required"),
  clientName:      z.string().min(2, "Client name is required"),
  clientIndustry:  z.string().optional(),
  proposalType:    z.string().min(1, "Select a proposal type"),
  tonePreference:  z.string().min(1, "Select a tone"),
  projectDetails:  z.string().min(20, "Please provide at least 20 characters of detail"),
  budget:          z.string().optional(),
  timeline:        z.string().optional(),
  notes:           z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function NewProposalPage() {
  const router = useRouter();
  const [loading,     setLoading]     = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const { register, handleSubmit, getValues, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { proposalType: "GENERAL", tonePreference: "PROFESSIONAL" },
  });

  const detailsValue = watch("projectDetails") ?? "";

  const buildPayload = async (data: FormData, aiGenerate: boolean) => {
    if (!aiGenerate) {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:          data.title,
          clientName:     data.clientName,
          clientIndustry: data.clientIndustry,
          proposalType:   data.proposalType,
          tonePreference: data.tonePreference,
          description:    data.projectDetails,
          budget:         data.budget,
          timeline:       data.timeline,
          notes:          data.notes,
          status:         "DRAFT",
        }),
      });
      const json = await res.json() as { id?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to save draft");
      return json.id;
    }

    // Generate with AI
    const genRes = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:           data.title,
        proposalType:    data.proposalType,
        yourCompanyName: data.yourCompanyName,
        clientName:      data.clientName,
        clientIndustry:  data.clientIndustry,
        projectDetails:  data.projectDetails,
        budget:          data.budget,
        timeline:        data.timeline,
        tonePreference:  data.tonePreference,
        notes:           data.notes,
      }),
    });
    const genJson = await genRes.json() as { result?: Record<string, unknown>; error?: string };
    if (!genRes.ok) throw new Error(genJson.error ?? "AI generation failed");

    const generated = genJson.result as {
      title?: string;
      summary?: string;
      sections?: Array<{ key: string; title: string; content: string }>;
    };

    const saveRes = await fetch("/api/generate-proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:          generated.title || data.title,
        clientName:     data.clientName,
        clientIndustry: data.clientIndustry,
        proposalType:   data.proposalType,
        tonePreference: data.tonePreference,
        description:    data.projectDetails,
        budget:         data.budget,
        timeline:       data.timeline,
        notes:          data.notes,
        sections:       (generated.sections ?? []).map((s, i) => ({ ...s, order: i + 1 })),
      }),
    });
    const saveJson = await saveRes.json() as { proposalId?: string; error?: string };
    if (!saveRes.ok) throw new Error(saveJson.error ?? "Failed to save");
    return saveJson.proposalId;
  };

  const onSaveDraft = async () => {
    const data = getValues();
    if (!data.title || data.title.length < 2) { toastError("Please enter a proposal title"); return; }
    setSavingDraft(true);
    try {
      const id = await buildPayload(data, false);
      ProposalToast.draftSaved(data.title);
      router.push(`/proposals/${id}`);
    } catch (err: unknown) {
      ProposalToast.error("Save draft", err instanceof Error ? err.message : undefined);
    } finally { setSavingDraft(false); }
  };

  const onGenerate = handleSubmit(async (data) => {
    setLoading(true);
    try {
      const id = await buildPayload(data, true);
      ProposalToast.aiGenerated(data.title);
      router.push(`/proposals/${id}`);
    } catch (err: unknown) {
      ProposalToast.error("Generate Proposal", err instanceof Error ? err.message : undefined);
      setLoading(false);
    }
  });

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-xl font-semibold">New Proposal</h1>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-6 pb-10">
        <div className="w-full max-w-2xl">
          <div className="bg-card border border-border rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="flex items-center gap-3 px-7 pt-6 pb-5">
              <div>
                <h2 className="text-base font-semibold">Create New Proposal</h2>
                <p className="text-sm text-muted-foreground">Fill in the details and our AI will generate a complete proposal for you.</p>
              </div>
            </div>

            <div className="px-7 pb-7 space-y-5">
              {/* Proposal Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-medium">Proposal Title</Label>
                <Input id="title" {...register("title")}
                  className={errors.title ? "border-destructive" : ""} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              {/* Company + Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="yourCompanyName" className="text-sm font-medium">Your Company</Label>
                  <Input id="yourCompanyName" {...register("yourCompanyName")}
                    className={errors.yourCompanyName ? "border-destructive" : ""} />
                  {errors.yourCompanyName && <p className="text-xs text-destructive">{errors.yourCompanyName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="clientName" className="text-sm font-medium">Client / Recipient</Label>
                  <Input id="clientName" {...register("clientName")}
                    className={errors.clientName ? "border-destructive" : ""} />
                  {errors.clientName && <p className="text-xs text-destructive">{errors.clientName.message}</p>}
                </div>
              </div>

              {/* Proposal Type + Tone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Proposal Type</Label>
                  <Select defaultValue="GENERAL" onValueChange={(v) => setValue("proposalType", v)}>
                    <SelectTrigger className={errors.proposalType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPOSAL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Tone</Label>
                  <Select defaultValue="PROFESSIONAL" onValueChange={(v) => setValue("tonePreference", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-1.5">
                <Label htmlFor="projectDetails" className="text-sm font-medium">Project / Service Details</Label>
                <div className="relative">
                  <Textarea id="projectDetails" rows={5} {...register("projectDetails")}
                    className={`resize-none pb-7 ${errors.projectDetails ? "border-destructive" : ""}`} />
                  <span className="absolute bottom-2 right-3 text-[11px] text-muted-foreground tabular-nums">
                    {detailsValue.length} chars
                  </span>
                </div>
                {errors.projectDetails && <p className="text-xs text-destructive">{errors.projectDetails.message}</p>}
              </div>

              {/* Budget + Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="budget" className="text-sm font-medium">Budget (optional)</Label>
                  <Input id="budget" {...register("budget")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timeline" className="text-sm font-medium">Timeline (optional)</Label>
                  <Input id="timeline" {...register("timeline")} />
                </div>
              </div>

              {/* Client Industry */}
              <div className="space-y-1.5">
                <Label htmlFor="clientIndustry" className="text-sm font-medium">Client Industry (optional)</Label>
                <Input id="clientIndustry" {...register("clientIndustry")} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-5">
            <Button type="button" variant="outline" onClick={onSaveDraft} disabled={savingDraft || loading} className="gap-2">
              {savingDraft && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Draft
            </Button>
            <Button type="button" onClick={onGenerate} disabled={loading || savingDraft} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Generating…" : "Generate with AI"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
