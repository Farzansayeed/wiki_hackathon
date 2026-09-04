# 🌐 WikiExplore — Knowledge at Your Fingertips

> The free encyclopedia, rebuilt as a living reading experience — powered 100% by live Wikipedia data. No database. No backend. No excuses. Just you, a browser, and **every one of Wikipedia's 66 million articles**.

## ✨ What This Is

WikiExplore isn't another static list of canned articles behind a fake "library." It's a **live editorial portal** that pulls the entire breadth of human knowledge straight from Wikipedia's APIs — and wraps it in a reading experience polished enough to ship.

**The old version:** ~27 KB of hardcoded articles, frozen in time, that we pretended was a library.

**This version:** the whole encyclopedia, live. The moment you open the page, today's **real featured article** boots into the reader — no clicks required.

---

## 🏆 The Brag Sheet

### 📡 A Live Home Feed, Four Sections, One API Call
- **Featured Today** — Wikipedia's actual featured article of the day, thumbnail and all.
- **Popular Right Now** — today's top 5 most-read articles, with rankings.
- **This Day in History** — dated historical events with tappable topic chips.
- **In the News** — real current events with inline, article-opening links.
- Hero stats that mean something: **66M+ articles**, today's real read counts, live event tallies.

### 📖 A Serious Article Reader
- Boots **today's featured article on load** — the page is never dead.
- Pulls up to **8 live sections** with a matching table of contents.
- **Read time** computed from real word counts (200 wpm).
- **Cross-links woven through every chapter** — 70+ on a typical article — with hover preview tooltips and one-click loading. First-mention-per-section, just like the real thing.
- **Related topics** sourced from Wikipedia's own link graph, not a keyword guess.
- Thumbnails, live infoboxes, keyboard-navigable previews. It reads like an encyclopedia because it *is* one.

### 📚 Sources & References — Real Footnotes
- Every chapter's citations are captured and merged into one **Sources & References** end-note, numbered continuously.
- **24+ footnote jumps** per article — click `[1]` in the prose, glide to the citation, click back.
- Broken "cite error" phantoms are **detected and dropped** without ever shifting the numbering of real citations.
- External source links (`↗`) straight to the journals and archives.

### 🧠 Zero-Dependency Engineering
- **No frameworks. No build step. No node_modules. No tracking. Nothing.**
- Pure vanilla HTML/CSS/JS — ~4,240 lines, hand-tuned.
- Every article body, CSS leak, and markup edge case from Wikipedia's raw HTML is **sanitized server-side-of-your-browser** — the prose arrives clean.

### 🧭 Browse, Explore, Remember
- **Explore grid** — 10 random real articles with thumbnails, and a **Shuffle** button for infinite discovery.
- **Surprise Me** — one click, one random corner of the universe.
- **Live search** — instant Wikipedia results with a dropdown and full modal.
- **Bookmarks, recents, and a reading dashboard** — streak tracking, minutes read, exportable history.
- **Deep links** — share `?w=Quantum mechanics` and it opens exactly that article. Even legacy links still work.
- **Dark mode** with a `D` shortcut, `/` to search, keyboard-first everything.

### 🛡️ Self-Healing Data
- A one-time **migration engine** rewrites old local ids to live `wiki:` ids — bookmarks, history, and stats survive the upgrade untouched.
- Idempotent. Runs once. Never corrupts a byte.

### 🎨 Editorial Design
- Swiss-modern grid, Newsreader serif for long-form reading, Public Sans for UI.
- Two fully-tokenized themes (light + dark), responsive down to mobile.

---

## 🚀 Run It

No install. No `npm i`. Open the file — or serve it:

```bash
# any static server will do
python3 -m http.server 8123
# or just double-click index.html
```

That's it. The internet is your database.

---

## 🛠️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Markup | Semantic HTML5 | Accessible, skip-links, ARIA everywhere |
| Styles | Vanilla CSS with design tokens | Two themes, no framework tax |
| Logic | Vanilla ES6+ | Zero deps, zero bloat |
| Data | Wikipedia REST + MediaWiki APIs | Live, authoritative, CC BY-SA |

---

## 🧰 Feature Index

- Featured / Popular / On-this-day / News live feed
- Live article reader with TOC, sections, images, cross-links, previews
- Sources & References end-notes with footnote jumps
- Random explore grid + shuffle + Surprise Me
- Live search (dropdown + modal)
- Bookmarks, recents, reading dashboard, streaks
- Export history/bookmarks to JSON
- Deep links (`?w=` / `?a=`) incl. legacy id migration
- Dark mode + font scaling + keyboard shortcuts (`/`, `D`)

---

## 📜 License & Credits

Made for the **Code & Debug Challenge** as an open educational resource.

Content is licensed under **CC BY-SA** via Wikipedia — we host none of it locally, we just serve it beautifully. Built with far too much caffeine and a healthy fear of Wikipedia's raw HTML.
