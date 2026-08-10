import { toast } from "sonner";

type ToastAction = { label: string; onClick: () => void };

export function toastSuccess(message: string, description?: string, action?: ToastAction) {
  toast.success(message, { description, action });
}
export function toastError(message: string, description?: string) {
  toast.error(message, { description });
}
export function toastInfo(message: string, description?: string, action?: ToastAction) {
  toast.info(message, { description, action });
}
export function toastWarning(message: string, description?: string) {
  toast.warning(message, { description });
}

export const ProposalToast = {
  created: (title: string) =>
    toast.success("Proposal created", { description: `"${title}" has been saved as a draft.` }),

  saved: (title: string) =>
    toast.success("Changes saved", { description: `"${title}" has been updated.` }),

  deleted: (title: string) =>
    toast.success("Proposal deleted", { description: `"${title}" has been permanently removed.` }),

  duplicated: (title: string) =>
    toast.success("Proposal duplicated", { description: `A copy of "${title}" has been created.` }),

  archived: (title: string) =>
    toast.success("Proposal archived", { description: `"${title}" has been archived.` }),

  restored: (title: string) =>
    toast.success("Proposal restored", { description: `"${title}" has been moved back to drafts.` }),

  aiGenerated: (title: string) =>
    toast.success("Proposal generated", { description: `"${title}" has been created with all sections.` }),

  draftSaved: (title: string) =>
    toast.success("Draft saved", { description: `"${title}" has been saved as a draft.` }),

  exported: (format: string) =>
    toast.success(`Exported as ${format.toUpperCase()}`, { description: "Your file has been downloaded successfully." }),

  sectionRegenerated: (sectionTitle: string) =>
    toast.success("Section regenerated", { description: `"${sectionTitle}" has been rewritten by AI.` }),

  toneAdjusted: () =>
    toast.success("Tone adjusted", { description: "All sections have been rewritten with the new tone." }),

  error: (action: string, reason?: string) =>
    toast.error(`${action} failed`, { description: reason ?? "Something went wrong. Please try again." }),
};

// Keep SopToast as alias for any remaining references during transition
export const SopToast = ProposalToast;

export const AuthToast = {
  welcome: (name: string) =>
    toast.success(`Welcome to PryroWriter, ${name}!`, {
      description: "Start creating professional proposals with AI.",
    }),

  signedOut: () =>
    toast.info("Signed out", { description: "You have been signed out successfully." }),

  profileUpdated: () =>
    toast.success("Profile updated", { description: "Your profile changes have been saved." }),
};

export const SettingsToast = {
  aiSaved: (provider: string, model: string) =>
    toast.success("AI settings saved", { description: `Now using ${provider} / ${model}.` }),

  aiError: (reason?: string) =>
    toast.error("Failed to save AI settings", { description: reason ?? "Please check your API key and try again." }),
};
