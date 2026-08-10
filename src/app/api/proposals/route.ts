import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Permission } from "@/lib/permissions";

const createSchema = z.object({
  title:          z.string().min(1),
  clientName:     z.string().optional(),
  clientIndustry: z.string().optional(),
  proposalType:   z.enum(["CONSULTING","CONSTRUCTION","CREATIVE","IT_SOFTWARE","FREELANCE","GENERAL"]).default("GENERAL"),
  tonePreference: z.enum(["PROFESSIONAL","CONVERSATIONAL","EXECUTIVE"]).default("PROFESSIONAL"),
  description:    z.string().optional(),
  budget:         z.string().optional(),
  timeline:       z.string().optional(),
  notes:          z.string().optional(),
  status:         z.enum(["DRAFT","REVIEW","SENT","ACCEPTED","REJECTED","ARCHIVED"]).default("DRAFT"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role  = (session.user as { role?: string }).role ?? "EMPLOYEE";
  const orgId = (session.user as { organizationId?: string }).organizationId;
  const canViewAll = Permission.canViewAllOrgProposals(role);

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search")   ?? "";
  const status   = searchParams.get("status")   ?? "";
  const archived = searchParams.get("archived") === "true";
  const page     = parseInt(searchParams.get("page")  ?? "1");
  const limit    = parseInt(searchParams.get("limit") ?? "20");

  const where: Record<string, unknown> = canViewAll
    ? { ...(orgId ? { organizationId: orgId } : {}), isArchived: archived, deletedAt: null }
    : { authorId: session.user.id, isArchived: archived, deletedAt: null };

  if (search) {
    where.OR = [
      { title:      { contains: search, mode: "insensitive" } },
      { clientName: { contains: search, mode: "insensitive" } },
      { description:{ contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  const [proposals, total] = await Promise.all([
    db.proposal.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author:   { select: { id: true, name: true, image: true } },
        sections: { select: { id: true, key: true, title: true, order: true }, orderBy: { order: "asc" } },
        _count:   { select: { sections: true } },
      },
    }),
    db.proposal.count({ where }),
  ]);

  return NextResponse.json({ proposals, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    const proposal = await db.proposal.create({
      data: {
        ...parsed.data,
        authorId:      session.user.id,
        organizationId:(session.user as { organizationId?: string }).organizationId,
      },
    });

    await db.activity.create({
      data: {
        proposalId:  proposal.id,
        userId:      session.user.id,
        action:      "created",
        description: `Created proposal: ${proposal.title}`,
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
  }
}
