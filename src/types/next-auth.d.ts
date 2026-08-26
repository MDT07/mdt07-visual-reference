import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      githubId: string;
      role: "OWNER" | "UNAUTHORIZED";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubId?: string;
    role?: "OWNER" | "UNAUTHORIZED";
  }
}
