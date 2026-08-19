import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/notifications/[id] — mark single notification as read
// PATCH /api/notifications/all — mark all as read (handled by id="all")
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (id === "all") {
      // Mark all unread notifications as read for this user
      await db.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data:  { read: true },
      });
      return NextResponse.json({ success: true });
    }

    // Mark a single notification as read — verify ownership
    const notification = await db.notification.findUnique({
      where:  { id },
      select: { userId: true },
    });

    if (!notification) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updated = await db.notification.update({
      where: { id },
      data:  { read: true },
    });

    return NextResponse.json({ notification: updated });
  } catch (error) {
    console.error("PATCH /api/notifications/[id] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/notifications/[id] — delete a single notification
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const notification = await db.notification.findUnique({
      where:  { id },
      select: { userId: true },
    });

    if (!notification) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await db.notification.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notifications/[id] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
