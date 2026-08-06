"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SECTION_META, type SectionTypeKey } from "@/types";

export async function updateSection(
  proposalId: string,
  sectionType: SectionTypeKey,
  content: string
) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const proposal = await db.proposal.findUnique({
    where: { id: proposalId },
    include: { user: true },
  });

  if (!proposal || proposal.user.email !== session.user.email) {
    throw new Error("Forbidden");
  }

  const meta = SECTION_META[sectionType];

  await db.proposalSection.upsert({
    where: {
      proposalId_type: {
        proposalId,
        type: sectionType,
      },
    },
    create: {
      proposalId,
      type: sectionType,
      title: meta.title,
      content,
      order: meta.order,
    },
    update: {
      content,
    },
  });

  revalidatePath(`/proposals/${proposalId}`);
  return { success: true };
}

export async function regenerateSection(
  proposalId: string,
  sectionType: SectionTypeKey,
  proposalContext: string
): Promise<string> {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const proposal = await db.proposal.findUnique({
    where: { id: proposalId },
    include: { user: true },
  });

  if (!proposal || proposal.user.email !== session.user.email) {
    throw new Error("Forbidden");
  }

  // Call our generation API
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proposalId, sectionType, proposalContext }),
  });

  if (!response.ok) throw new Error("Generation failed");
  
  // Read the stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let content = "";

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      content += decoder.decode(value, { stream: true });
    }
  }

  return content;
}

export async function updateProposalStatus(proposalId: string, status: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const proposal = await db.proposal.findUnique({
    where: { id: proposalId },
    include: { user: true },
  });

  if (!proposal || proposal.user.email !== session.user.email) {
    throw new Error("Forbidden");
  }

  await db.proposal.update({
    where: { id: proposalId },
    data: { status: status as any },
  });

  revalidatePath(`/proposals/${proposalId}`);
  revalidatePath("/dashboard");
}

export async function deleteProposal(proposalId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const proposal = await db.proposal.findUnique({
    where: { id: proposalId },
    include: { user: true },
  });

  if (!proposal || proposal.user.email !== session.user.email) {
    throw new Error("Forbidden");
  }

  await db.proposal.delete({
    where: { id: proposalId },
  });

  revalidatePath("/dashboard");
}
