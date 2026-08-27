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

## Recording plan (one continuous take, about 80–100 seconds)

| Time | On screen | Optional English voiceover |
| --- | --- | --- |
| 0:00–0:08 | Production URL, disconnected admin screen, and **Connect with Pinterest OAuth** | “MDT07 Visual Reference uses Pinterest OAuth and the Pinterest API to research public visual references for one web project.” |
| 0:08–0:22 | Click **Connect with Pinterest OAuth**; keep the Pinterest authorization URL, app name, and requested permissions visible | “The user authorizes only read access to public boards and public Pins.” |
| 0:22–0:32 | Click **Give access** and show the uninterrupted return to the production callback and connected admin screen | “Pinterest returns an authorization code. The server exchanges it for a token and keeps credentials outside the browser UI.” |
| 0:32–0:44 | Show the **Live Pinterest API response** board count and choose `Web Design References` | “The app now retrieves the connected account’s public boards from the Pinterest API. Secret content is not requested.” |
| 0:44–0:58 | Enter `editorial architecture portfolio, monochrome, asymmetric layout` and click **Search** | “The server retrieves public Pins from the selected board and ranks their metadata locally against the project brief.” |
| 0:58–1:10 | Show the live Pin count, results, Pinterest attribution, and expand **Search pipeline** | “The displayed Pins came from this live Pinterest API request and are not cached.” |
| 1:10–1:20 | Click **Open original Pin on Pinterest** and show the matching Pinterest Pin page | “Every result links back to its original Pin on Pinterest.” |
| 1:20–1:32 | Return without stopping the recording; save two results and show the temporary moodboard | “Selections stay only in the open page and are not persisted.” |

## Recording checklist

- Record the real production host: `https://mdt07-visual-reference.vercel.app`.
- Use a fresh OAuth authorization so the Pinterest consent screen is visible.
- Record Connect → consent → Give access → callback → API action in one uninterrupted take. Do not replace any part with screenshots or slides.
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
