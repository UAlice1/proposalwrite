import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SECTION_ORDER, SECTION_META } from "@/types";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]/export">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: { sections: { orderBy: { order: "asc" } } },
  });

  if (!proposal) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { format, sections } = await request.json();

  if (format === "pdf") {
    // For PDF, return a simple text file that user can print to PDF via browser
    const textContent = buildTextDocument(proposal, sections);
    return new Response(textContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${proposal.title.replace(/\s+/g, "_")}.txt"`,
      },
    });
  }

  if (format === "docx") {
    // For Word, return HTML that Word can import
    const htmlContent = buildHtmlDocument(proposal, sections);
    return new Response(htmlContent, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${proposal.title.replace(/\s+/g, "_")}.doc"`,
      },
    });
  }

  return Response.json({ error: "Invalid format" }, { status: 400 });
}

function buildTextDocument(proposal: any, sections: Record<string, string>): string {
  let doc = `${proposal.title}\n`;
  doc += `${"=".repeat(proposal.title.length)}\n\n`;
  doc += `Client: ${proposal.clientName}\n`;
  if (proposal.clientIndustry) doc += `Industry: ${proposal.clientIndustry}\n`;
  if (proposal.budgetRange) doc += `Budget: ${proposal.budgetRange}\n`;
  doc += `\n${"=".repeat(60)}\n\n`;

  for (const type of SECTION_ORDER) {
    const content = sections?.[type] ?? proposal.sections.find((s: any) => s.type === type)?.content ?? "";
    if (!content.trim()) continue;
    const meta = SECTION_META[type];
    doc += `${meta.title}\n`;
    doc += `${"-".repeat(meta.title.length)}\n\n`;
    doc += `${content}\n\n`;
  }

  return doc;
}

function buildHtmlDocument(proposal: any, sections: Record<string, string>): string {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${proposal.title}</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
    h2 { color: #6366f1; margin-top: 30px; }
    p { margin: 10px 0; }
    .meta { background: #f4f4f4; padding: 15px; border-left: 3px solid #6366f1; margin-bottom: 30px; }
  </style>
</head>
<body>
  <h1>${proposal.title}</h1>
  <div class="meta">
    <p><strong>Client:</strong> ${proposal.clientName}</p>
    ${proposal.clientIndustry ? `<p><strong>Industry:</strong> ${proposal.clientIndustry}</p>` : ""}
    ${proposal.budgetRange ? `<p><strong>Budget:</strong> ${proposal.budgetRange}</p>` : ""}
  </div>
`;

  for (const type of SECTION_ORDER) {
    const content = sections?.[type] ?? proposal.sections.find((s: any) => s.type === type)?.content ?? "";
    if (!content.trim()) continue;
    const meta = SECTION_META[type];
    html += `  <h2>${meta.title}</h2>\n`;
    html += `  <div>${content.split("\n").map((p) => `<p>${p}</p>`).join("\n")}</div>\n\n`;
  }

  html += `</body>
</html>`;

  return html;
}
