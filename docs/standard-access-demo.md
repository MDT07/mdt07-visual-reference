# Pinterest Standard Access demo

## App purpose

MDT07 Visual Reference helps web designers and developers turn a specific web-project
brief into a focused reference set from public Pinterest boards available to the
connected user. The application lists those boards, retrieves public Pins from the
board the user selects, ranks the Pin metadata locally against the brief, links every
result to its original Pinterest source, and keeps selected references only in the
memory of the open page.

The application is independent and is not endorsed by, affiliated with, or an official
product of Pinterest. It does not claim global Pinterest search and does not request
write access, profile data, secret boards, or secret Pins.

## Demo account preparation

Before recording, prepare a Pinterest Business test account with:

- one clearly named public board, for example `Web Design References`;
- 8–12 public Pins that represent at least two visual directions;
- no private information visible in the profile or browser UI;
- the app removed from Pinterest's connected-app settings so the consent screen appears
  during the final take.

Create or save the demo Pins directly in Pinterest. The application itself should keep
requesting only `boards:read` and `pins:read`.

## Recording plan (about 2 minutes)

| Time | On screen | Optional English voiceover |
| --- | --- | --- |
| 0:00–0:15 | Production home page and product explanation | “MDT07 Visual Reference is a project-scoped research workspace for web designers and developers.” |
| 0:15–0:35 | Click **Connect Pinterest** and show the Pinterest consent screen | “The user connects their own Pinterest account through OAuth. The app requests only read access to public boards and public Pins.” |
| 0:35–0:48 | Approve access and return to the connected workspace | “The authorization code is exchanged server-side. Tokens are kept in an encrypted, HTTP-only browser session.” |
| 0:48–1:02 | Open the **Public Pinterest board** selector and choose the prepared board | “The app lists public boards available to the connected account. Secret content is not requested.” |
| 1:02–1:25 | Enter `editorial architecture portfolio, monochrome, asymmetric layout` and click **Search** | “The server retrieves live public Pins from the selected board. The project brief is parsed and the results are ranked locally.” |
| 1:25–1:42 | Scroll through real results and expand **Search pipeline** | “The ranking helps the user compare relevant visual directions without copying or taking ownership of Pinterest content.” |
| 1:42–1:55 | Click **Open original** on one result and briefly show its Pinterest source | “Every reference links back to the original Pin on Pinterest.” |
| 1:55–2:10 | Return and click **Save to moodboard** on two results | “Selected references are compared in a temporary session moodboard and are not persisted by the application.” |
| 2:10–2:20 | Show **Disconnect** and the footer links to Privacy and Terms | “The user can disconnect at any time. Public Privacy Policy, Terms, and contact information are available on the same production domain.” |

## Recording checklist

- Record the real production host: `https://mdt07-visual-reference.vercel.app`.
- Use a fresh OAuth authorization so the Pinterest consent screen is visible.
- Keep the address bar visible for the production site and callback return.
- Do not show the App Secret, access token, Vercel environment values, developer console,
  personal messages, or unrelated browser tabs.
- Keep the full Pinterest attribution and **Open original** links visible.
- Do not imply partnership, certification, global search, AI image analysis, content
  copying, persistent storage, or write functionality.
- Export MP4 (H.264), 1920×1080 or 1440×900, 30 fps, with readable cursor movement.
- Watch the exported file once from start to finish before uploading it.

## Submission notes

Use the same production website, Privacy Policy URL, OAuth redirect URI, app name, and
feature description everywhere in the Pinterest developer portal and in the Standard
Access form. The video should match the exact scopes and functionality in the deployed
application.
