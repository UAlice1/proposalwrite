import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
    }

    const { email } = parsed.data;

    // Always respond with success to prevent email enumeration attacks
    const user = await db.user.findUnique({
      where:  { email },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user || !user.password) {
      // User doesn't exist or is OAuth-only — still return 200
      return NextResponse.json({ success: true });
    }

    // Invalidate any existing unexpired tokens for this user
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      data:  { used: true },
    });

    // Generate a secure random token
    const token     = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // Send the email
    await sendPasswordResetEmail(user.email, token, user.name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    // Don't leak error details — always return 200 for security
    return NextResponse.json({ success: true });
  }
}
