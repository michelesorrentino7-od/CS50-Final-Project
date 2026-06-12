# Sorrentino Consultancy — Project Handoff

Last updated: June 2026 · Git: clean working tree, all work committed on `master`.

## What this is

A multi-page, bilingual (EN/IT) static website for an independent GRC advisory practice. Pure HTML + CSS + vanilla JS on Bootstrap 5.3.8 (CDN) — no build step, no backend. The visual identity is **warm stone / aged paper + classical pencil-sketch artwork + editorial serif typography** (Cormorant Garamond for display, DM Sans for body). This theme is deliberate and must remain prevalent in any future work.

## Run it

```bash
cd ~/Documents/"CS50 Final Project"
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

The HTTP server is required: the cover page's 3D model (GLB) and ES-module scripts will not load over `file://`.

## Page map

| Page | Purpose |
|---|---|
| `index.html` | Cover: interactive 3D capitol (hover/scroll-driven rotation), cryptex word reveal, principles |
| `home.html` | Main homepage; canonical "Home" target |
| `services.html` | Hub with 8 service rows → `services/*.html` (7 detail pages) |
| `about.html` | Three-generation story (linked from home heritage section) |
| `case-studies.html` | Anonymised engagement cards |
| `cv.html`, `contact.html` | CV; contact info + mailto form |

Shared assets: `styles.css` (single stylesheet, §1–§39), `i18n.js` (EN/IT runtime engine), `images.js` (image registry — see below).

---

## THE IMAGE REGISTRY (`images.js`) — read this before touching any image

**Every visual asset on the site is referenced in exactly one place: the `REGISTRY` object at the top of `images.js`.** No HTML file hard-codes an image path (except the favicon links). To swap an image you edit one line; to find where an image is used you read one object.

### How it works

1. `REGISTRY.backgrounds` maps short keys to page-background files. On load, the engine injects each as a CSS variable on `:root`: key `home` becomes `--bg-home`. `styles.css` §4 then assigns it per page: `body.page-home { --page-bg: var(--bg-home); }`, and `body::before` paints it full-bleed, fixed, with per-page opacity and a `saturate(0.78) contrast(0.92)` filter.
2. `REGISTRY.images` maps keys to content images. The engine finds every `<img data-img="key">` in the DOM and sets its `src`. An element whose key is missing from the registry is left untouched (and its `onerror` fallback hides the broken frame).
3. The base path (`""` or `"../"`) is auto-detected from the `<script src>` attribute, so pages inside `services/` resolve the same registry paths correctly. **Never** put absolute paths in the registry.

### Registry keys, where they appear, and the concept each must evoke

**Backgrounds** (`images/backgrounds/`, displayed heavily muted — texture matters more than subject):

| Key | File | Page |
|---|---|---|
| `cover` | bg-cover.jpg | index.html — pencil-sketch capitol banner (1920×1080) |
| `home` / `about` / `services` / `cases` / `cv` / `contact` | bg-*.jpg | one per page |

**Content images** (`images/middle/` + logo). These are the slots to upgrade with better photography:

| Key | Used on | Concept to evoke |
|---|---|---|
| `logo` | every page (navbar) + cover | brand mark (torre saracena) |
| `home-governance` | home §What We Do | risk frameworks, ERM, internal audit — order out of complexity |
| `home-compliance` | home §What We Do | defensible evidence, GDPR / Mod. 231 accountability |
| `home-security` | home §What We Do | third-party assurance, supplier audits, operational security |
| `home-esg` | home §What We Do | CSRD/CSDDD readiness, sustainability with substance |
| `home-heritage` | home §Who We Are | three generations of trust, Napoli, heritage become method |
| `services-governance` | services hub row 1 | governance & risk structure |
| `services-privacy` | services hub row 2 | privacy & data protection as daily practice |
| `services-esg` | services hub row 3 | ESG governance (the system behind the report) |
| `services-supply-chain` | services hub row 4 | CSRD/CSDDD supply-chain due diligence |
| `services-compliance` | services hub row 5 | compliance & internal controls that live in operations |
| `services-assurance` | services hub row 6 | security & third-party assurance heritage |
| `services-digital` | services hub row 7 | digital GRC: organised data over shiny platforms |
| `services-fractional` | services hub row 8 | fractional GRC officer: a trusted presence |
| `cases-erm` | case studies | ERM framework expansion (logistics, Southern Europe) |
| `cases-audit` | case studies | third-party audit programme redesign (30+ suppliers) |
| `cases-loss-prevention` | case studies | loss prevention across a multi-site network |
| `cases-gdpr` | case studies | GDPR readiness across operations |
| `contact-desk` | contact page | a quiet desk ready for an advisory conversation |

### Frames, ratios, and what that means for choosing images

All content images render inside fixed-ratio frames with `object-fit: cover` — the image is **cropped to fit**, so original aspect ratio is forgiving but composition matters (subject should survive a center crop):

- `.image-kicker` (home What-We-Do cards): **5:3**, small (≤11rem wide)
- `.visual-frame` (home heritage): **4:5** portrait
- `.area-media-frame` (services hub rows): **4:3**
- `.contact-image-frame`: **4:3**
- Mobile: frames switch to 16:10

Every framed image also receives `filter: saturate(0.72) contrast(0.94)` — colors are automatically muted toward the stone palette, so slightly-too-vivid photos are fine; *busy* photos are not.

### Swapping / adding an image — the 3-step recipe

1. Drop the file in `images/middle/` (or `images/backgrounds/`). Prefer JPG, ~1200–1600px on the long side, < 400KB (use quality ~82–85).
2. Point the registry key at it in `images.js` (one line).
3. Hard-refresh (Cmd+Shift+R). Nothing else: no HTML edits needed.

To add a *new* slot: add the key to `REGISTRY.images`, then place `<img data-img="your-key" alt="…" loading="lazy" decoding="async" onerror="this.closest('.your-frame').classList.add('is-missing');this.remove();">` inside a frame element.

### Gotchas

- `_archive/` holds retired/heavy assets and is git-ignored — don't reference anything in it.
- The cover background (`bg-cover.jpg` — cream colonnade photo) is also the only background whose opacity/overlay differs (§38: 0.42 / 0.75) because the image is light.
- `window.IMAGE_REGISTRY` is exposed in the console for debugging.

---

## Animations (all honor `prefers-reduced-motion`)

- **Cover 3D model**: fixed camera; yaw driven by mouse-x + scroll (`index.html` bottom script).
- **Cryptex reveal**: on section entry each word spins ~1.1s (3 motion-blurred turns, 130ms stagger) and clicks into place; replays on re-entry.
- **Principles chain**: cryptex ends → 500ms pause → pillars appear one-by-one (320ms); replays on re-entry; 2.5s fallback if cryptex never ran.
- **Site-wide (§39)**: accent underline grow on nav links, card lift on hover, slow image zoom in frames, CSS scroll-driven entrance fades (`animation-timeline: view()`, progressive enhancement).

## i18n in one paragraph

English lives in the markup; `i18n.js` swaps to Italian at runtime via `data-i18n` keys, a TreeWalker phrase map for legacy nodes, and placeholder/title maps. Preference persists in `localStorage`. Business terms (GRC, ESG, CSRD, GDPR…) are intentionally never translated. When adding content, add a `data-i18n` key and its IT string to the `IT` object.

---

## Image research brief (prompt for Perplexity)

The text of the prompt is maintained in `PERPLEXITY_PROMPT.md` next to this file — paste it into Perplexity as-is.
