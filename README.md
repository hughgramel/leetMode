# LeetMode — Scheduled LeetCode Focus Sessions

Stay locked in on LeetCode. **LeetMode** lets you schedule recurring practice windows or start an instant session. While a session is active, LeetCode stays accessible and all non-LeetCode sites are blocked. A visible countdown keeps you honest.

> “Schedule practice times” • “Start focus now” • “Block everything except LeetCode”

---

## ✨ Features

- **Scheduled practice** — create recurring windows (e.g., Sat/Sun 8–9 PM).
- **Instant focus** — start a session with one click.
- **Allow-only mode** — access to `leetcode.com` (and optionally `leetcode.cn`) while all other domains are blocked.
- **Live countdown** — time remaining displayed in the UI.
- **Gentle UX** — clean card UI with large “Schedule Practice Times” CTA.
- **Persistence** — schedules are saved and respected even if the UI is closed.

> _Screenshot examples:_  
> `docs/leetmode-card.png` (home card with countdown)  
> `docs/leetmode-schedules.png` (list of recurring schedules)

---

## 🔧 How it works

LeetMode runs a session timer and an allowlist filter.  
When a session is **ON**, navigation to domains outside the allowlist is blocked.  
When the timer ends, normal browsing resumes automatically.

_Default allowlist:_ `leetcode.com`, `www.leetcode.com` (add `leetcode.cn` if you use it)

---

## 🧰 Tech Stack

- **TypeScript** + **React** (UI)
- **Manifest V3** browser extension APIs:
  - `alarms` (scheduled sessions)
  - `storage` (persist schedules)
  - `declarativeNetRequest` / `webRequest` (domain blocking)
  - `notifications` (optional session start/end toasts)
- Bundler: Vite (or your preferred build tool)

> If you’re using a web dashboard alongside the extension, the UI is a standard React app that talks to extension storage.

---

## 🚀 Installation

### From source (Chrome / Edge)
1. `git clone https://github.com/<you>/leetmode.git`
2. `npm install`
3. `npm run build`  
   This outputs a production bundle in `dist/`.
4. Open **chrome://extensions** → enable **Developer mode** → **Load unpacked** → select `dist/`.

### From source (Firefox)
1. `npm run build:firefox` (configure your build to emit an MV2-compatible or MV3 beta bundle).
2. Open **about:debugging** → **This Firefox** → **Load Temporary Add-on…** → select the generated manifest.

---

## 🗓️ Usage

1. Open LeetMode → **Schedule Practice Times** → add one or more windows (e.g., _Sat, Sun – 8:00 PM–9:00 PM_).
2. Or click **Start Session** to begin immediately (choose a duration).
3. Keep the timer visible or work in LeetCode — non-LeetCode navigation will be blocked until the timer ends.
4. End early anytime via the UI.

---

## ⚙️ Configuration

Create (or edit) `src/config.ts`:

```ts
export const ALLOWLIST = [
  "leetcode.com",
  "www.leetcode.com",
  // "leetcode.cn",
];

export const DEFAULT_SESSION_MINUTES = 60;
