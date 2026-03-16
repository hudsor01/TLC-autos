import type { NextAuthConfig } from "next-auth";

/**
 * Auth config shared between middleware (Edge) and server (Node).
 * Does NOT import Prisma or any Node-only modules.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { role: string }).role = token.role as string;
        (session.user as unknown as { id: string }).id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";
      const isAdminApi = nextUrl.pathname.startsWith("/api/admin");

      // Allow login page
      if (isLoginPage) return true;

      // Protect admin routes
      if (isAdminRoute || isAdminApi) {
        return !!auth?.user;
      }

      return true;
    },
  },
  providers: [], // Providers added in full auth.ts
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
