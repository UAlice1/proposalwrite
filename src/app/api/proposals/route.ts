import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateAllSections } from "@/lib/ai";
import { SECTION_ORDER } from "@/types";
import type { ProposalFormData } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposals = await db.proposal.findMany({
    where: { userId: session.user.id },
    include: { sections: true },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json(proposals);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Freemium: free users capped at 3 proposals
  const plan = (session.user as { plan?: string }).plan ?? "FREE";
  if (plan === "FREE") {
    const count = await db.proposal.count({
      where: { userId: session.user.id },
    });
    if (count >= 3) {
      return Response.json(
        {
          error:
            "Free plan is limited to 3 proposals. Upgrade to Pro for unlimited proposals.",
        },
        { status: 403 }
      );
    }
  }

  let body: ProposalFormData;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, clientName, clientIndustry, projectScope, budgetRange, linkedSopId } =
    body;

  if (!title?.trim() || !clientName?.trim() || !projectScope?.trim()) {
    return Response.json(
      { error: "title, clientName, and projectScope are required" },
      { status: 400 }
    );
  }

  // Generate all sections via AI
  const generatedSections = await generateAllSections({
    title,
    clientName,
    clientIndustry,
    projectScope,
    budgetRange,
  });

  // Persist to DB
  const proposal = await db.proposal.create({
    data: {
      title: title.trim(),
      clientName: clientName.trim(),
      clientIndustry: clientIndustry?.trim() || null,
      projectScope: projectScope.trim(),
      budgetRange: budgetRange?.trim() || null,
      linkedSopId: linkedSopId?.trim() || null,
      userId: session.user.id,
      sections: {
        create: SECTION_ORDER.map((type, order) => ({
          type,
          title: type.replace(/_/g, " "),
          content: generatedSections[type] ?? "",
          order,
        })),
      },
    },
    select: { id: true },
  });

  return Response.json({ id: proposal.id }, { status: 201 });
}
