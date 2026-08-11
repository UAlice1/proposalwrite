import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateProposalHTML, type ProposalExportData } from "@/lib/proposal-export";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") ?? "html";

  const proposal = await db.proposal.findFirst({
    where:   { id, deletedAt: null },
    include: {
      author:   { select: { name: true } },
      sections: { orderBy: { order: "asc" } },
      organization: { select: { name: true, logo: true, brandColor: true } },
    },
  });

  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const exportData: ProposalExportData = {
    title:          proposal.title,
    clientName:     proposal.clientName,
    clientIndustry: proposal.clientIndustry,
    proposalType:   proposal.proposalType,
    tonePreference: proposal.tonePreference,
    status:         proposal.status,
    version:        proposal.version,
    createdAt:      proposal.createdAt,
    updatedAt:      proposal.updatedAt,
    budget:         proposal.budget,
    timeline:       proposal.timeline,
    author:         proposal.author,
    sections:       proposal.sections,
    branding: proposal.organization ? {
      orgName:    proposal.organization.name,
      logo:       proposal.organization.logo,
      brandColor: proposal.organization.brandColor ?? "#1e293b",
    } : undefined,
  };

  // ── HTML ────────────────────────────────────────────────────────────────
  if (format === "html") {
    const html = generateProposalHTML(exportData);
    return new NextResponse(html, {
      headers: {
        "Content-Type":        "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${proposal.title}.html"`,
      },
    });
  }

  // ── PDF — generate via HTML print ──────────────────────────────────────
  if (format === "pdf") {
    const html = generateProposalHTML(exportData, true);

    // Log export history
    await db.exportHistory.create({
      data: {
        proposalId: id,
        userId:     session.user.id,
        format:     "pdf",
        fileName:   `${proposal.title}.pdf`,
      },
    }).catch(() => null);

    // Return HTML with PDF print styles — client prints it
    // For a proper PDF, integrate puppeteer or a PDF service
    return new NextResponse(html, {
      headers: {
        "Content-Type":        "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${proposal.title}.pdf"`,
        "X-Export-Format":     "pdf",
      },
    });
  }

  // ── DOCX ────────────────────────────────────────────────────────────────
  if (format === "docx") {
    try {
      const { generateProposalDOCX } = await import("@/lib/proposal-docx");
      const buffer = await generateProposalDOCX(exportData);

      await db.exportHistory.create({
        data: {
          proposalId: id,
          userId:     session.user.id,
          format:     "docx",
          fileName:   `${proposal.title}.docx`,
        },
      }).catch(() => null);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${proposal.title}.docx"`,
        },
      });
    } catch (err) {
      console.error("DOCX generation failed:", err);
      return NextResponse.json({ error: "DOCX generation failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}
