import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import { deploymentConfig } from "@/lib/deployment";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    signIn({ account, profile }) {
      if (!deploymentConfig.isAdmin || account?.provider !== "github") {
        return false;
      }

      return String(profile?.id ?? "") === deploymentConfig.ownerGithubId;
    },
    jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile) {
        token.githubId = String(profile.id ?? "");
        token.role =
          token.githubId === deploymentConfig.ownerGithubId
            ? "OWNER"
            : "UNAUTHORIZED";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.githubId =
          typeof token.githubId === "string" ? token.githubId : "";
        session.user.role = token.role === "OWNER" ? "OWNER" : "UNAUTHORIZED";
      }
      return session;
    },
  },
});
