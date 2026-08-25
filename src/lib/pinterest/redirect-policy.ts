const PINTEREST_CALLBACK_PATH = "/api/pinterest/auth/callback";

export function isValidPinterestRedirectUri(
  redirectUri: string,
  appUrl: string
): boolean {
  try {
    const redirect = new URL(redirectUri);
    const app = new URL(appUrl);

    return (
      redirect.origin === app.origin &&
      redirect.pathname === PINTEREST_CALLBACK_PATH &&
      redirect.search === "" &&
      redirect.hash === "" &&
      (redirect.protocol === "https:" ||
        (redirect.protocol === "http:" && redirect.hostname === "localhost"))
    );
  } catch {
    return false;
  }
}
