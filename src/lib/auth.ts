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
        const existing = await db.user.findUnique({
          where:  { email: user.email },
          select: { id: true, role: true, emailVerified: true },
        }).catch(() => null);

        const isNewUser = !existing?.emailVerified;
        await db.user.update({
          where: { email: user.email },
          data:  {
            emailVerified: new Date(),
            image: (profile?.picture as string) ?? user.image ?? undefined,
            name:  user.name ?? undefined,
            ...(isNewUser || existing?.role === "EMPLOYEE" ? { role: "MANAGER" } : {}),
          },
        }).catch(() => null);
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
