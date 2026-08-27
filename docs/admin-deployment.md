# Private administration deployment

Deploy the repository a second time with `APP_MODE=admin`. Configure the exact private
`APP_URL`, public `PUBLIC_SITE_URL`, numeric owner ID, Auth.js GitHub OAuth, Pinterest
OAuth, and Supabase server credentials.

The public deployment must use `APP_MODE=public` and must not receive Supabase, Auth.js,
GitHub OAuth, Pinterest, or session-encryption credentials. Configure only the private
backend's sanitized `/api/public/boards` URL as `PUBLIC_CATALOG_API_URL`.

After changing the private host, update both provider registrations:

- GitHub: `<PRIVATE_ADMIN_ORIGIN>/api/auth/callback/github`
- Pinterest: `<PRIVATE_ADMIN_ORIGIN>/api/pinterest/auth/callback`

Then verify unauthenticated `/admin` redirects to `/login`, non-owner GitHub sign-in is
rejected, owner OAuth completes, all public Boards load, and each public Board page
returns its Pins without exposing credentials.
