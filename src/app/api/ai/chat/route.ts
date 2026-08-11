import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAISettings, callAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, proposalId } = await req.json();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  let context = "";

  if (proposalId) {
    const proposal = await db.proposal.findFirst({
      where:   { id: proposalId, authorId: session.user.id },
      include: { sections: { orderBy: { order: "asc" } } },
    });

    if (proposal) {
      context = `You are helping with a business proposal titled "${proposal.title}"${proposal.clientName ? ` for ${proposal.clientName}` : ""}.

Proposal sections:
${proposal.sections.map((s) => `## ${s.title}\n${s.content}`).join("\n\n")}

Answer questions and provide suggestions to improve this proposal.`;
    }
  } else {
    context = "You are a helpful business proposal writing assistant. Help users create compelling, professional proposals.";
  }

  try {
    const settings = await getAISettings(session.user.id);
    const prompt   = `${context}\n\nUser: ${message}\n\nAssistant:`;
    const result   = await callAI(prompt, settings);
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
