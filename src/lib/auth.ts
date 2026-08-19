import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where:   { email },
          include: { organization: true },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id:             user.id,
          email:          user.email,
          name:           user.name,
          image:          user.image,
          role:           user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        // Use upsert to atomically handle both new and returning Google users.
        //
        // WHY: The PrismaAdapter creates the user record AFTER signIn returns
        // true, so findUnique() + update() has a race condition on first login —
        // the user row doesn't exist yet when update() fires, causing it to fail
        // silently. upsert() removes the race entirely: if the row exists it
        // updates it; if it doesn't exist yet it creates it with the correct
        // role and image in one atomic operation.
        try {
          await db.user.upsert({
            where: { email: user.email },
            // PrismaAdapter will also try to create the user — that's fine,
            // because our upsert runs first and sets the fields we care about.
            // If the adapter's create runs after, it won't overwrite emailVerified
            // or role because those fields aren't in the adapter's create payload.
            create: {
              email:         user.email,
              name:          user.name          ?? null,
              image:         (profile?.picture as string) ?? user.image ?? null,
              emailVerified: new Date(),
              role:          "MANAGER",
            },
            update: {
              emailVerified: new Date(),
              image:         (profile?.picture as string) ?? user.image ?? undefined,
              name:          user.name ?? undefined,
              // Only promote to MANAGER if they somehow ended up as EMPLOYEE
              // (e.g. created via invite). Never demote an existing ADMIN.
              role: undefined, // handled below via conditional spread
            },
          });

          // Promote EMPLOYEE → MANAGER on Google sign-in but never demote admins.
          // We do this as a separate step so we can read the current role first.
          const current = await db.user.findUnique({
            where:  { email: user.email },
            select: { role: true },
          });
          if (current?.role === "EMPLOYEE") {
            await db.user.update({
              where: { email: user.email },
              data:  { role: "MANAGER" },
            });
          }
        } catch (err) {
          // Log the real error instead of swallowing it silently
          console.error("[auth] Google signIn upsert failed:", err);
          // Still return true — the user can log in even if role assignment fails
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id             = user.id;
        token.role           = (user as { role?: string }).role;
        token.organizationId = (user as { organizationId?: string }).organizationId;
      }
      if (trigger === "update" || (!token.role && token.id)) {
        const dbUser = await db.user.findUnique({
          where:  { id: token.id as string },
          select: { role: true, organizationId: true },
        }).catch(() => null);
        if (dbUser) {
          token.role           = dbUser.role;
          token.organizationId = dbUser.organizationId ?? undefined;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role                     = token.role as string;
        (session.user as { organizationId?: string }).organizationId = token.organizationId as string;
      }
      return session;
    },
  },
});
