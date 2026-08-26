import { cookies } from "next/headers";

import { signOut } from "@/auth";
import {
  oauthStateCookieName,
  pinterestSessionCookieName,
} from "@/lib/pinterest/session";

export default function OwnerSignOut() {
  return (
    <form
      action={async () => {
        "use server";
        const cookieStore = await cookies();
        cookieStore.delete(pinterestSessionCookieName);
        cookieStore.delete(oauthStateCookieName);
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="text-sm text-text-secondary underline-offset-4 hover:text-brand hover:underline"
      >
        Sign out
      </button>
    </form>
  );
}
