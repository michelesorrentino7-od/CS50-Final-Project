# Sorrentino Consultancy — Project Guide

Static, bilingual (EN/IT) multi-page website for a GRC advisory practice.
Plain HTML + CSS + vanilla JS on Bootstrap 5.3.8 (CDN). No build step, no backend.

## Run it

```bash
python3 -m http.server 8000   # from the project root
# open http://localhost:8000/index.html
```

HTTP serving is required: the cover page's 3D model (GLB) will not load over `file://`.

## Load-bearing rules

- **Single stylesheet**: all styles live in `styles.css`, organized in §-numbered
  sections with a map at the top. Add styles to the matching section; never inline
  styles in HTML or add per-page stylesheets.
- **Image registry**: every image path lives in the `REGISTRY` object in `images.js`.
  HTML uses `<img data-img="key">`; backgrounds become `--bg-*` CSS variables.
  Never hard-code an image path in HTML or CSS. To swap an image, overwrite the
  destination file or repoint one registry line. Recipe: JPG, ~1400px long side,
  quality ~82, < 400KB.
- **i18n**: English lives in the markup; `i18n.js` swaps to Italian at runtime via
  `data-i18n` keys (plus a TreeWalker phrase map for legacy nodes). When adding
  content, add a `data-i18n` key and its IT string to the `IT` object. Business
  terms (GRC, ESG, CSRD, CSDDD, GDPR, Mod. 231) are never translated.
- **Animations** honor `prefers-reduced-motion` (§36). Keep it that way.
- `_archive/` is git-ignored retired material — never reference it.
- See `HANDOFF.md` for the full page map and image-slot concepts.

## Design Context

### Users
Prospective GRC clients — Italian SMEs, start-ups, and foreign companies entering
Italy — evaluating an independent advisor; plus CS50 reviewers. They skim for
credibility signals: clarity, restraint, evidence of method. Bilingual EN/IT.

### Brand Personality
Modern & sharp, built on heritage. Three words: precise, established, direct.
The site should evoke confident competence — crisp, decisive, never ornamental
or washed-out.

### Aesthetic Direction
Editorial serif identity (Cormorant Garamond display) executed with contemporary
crispness: warm stone palette (§1 tokens in styles.css — never cool/slate grays),
real warm-stone architectural photography (towers, walls, colonnades), sharp 1px
rules, square corners, high text contrast, generous whitespace. Light mode only.
Anti-references: generic corporate stock, faded murkiness, decorative clutter.

### Design Principles
1. One palette, tokenized — every color comes from a §1 CSS variable; no raw hexes in components.
2. Crisp contrast — body and label text meet WCAG AA (4.5:1); prefer solid token colors over opacity fades.
3. Serif display hierarchy — Cormorant Garamond for all headings; DM Sans for body, labels, UI.
4. Typographic scale — font sizes come from the token scale, never ad-hoc values.
5. Sharp restraint — hairline rules, square geometry, whitespace over decoration.
6. Images via the registry only (images.js); warm architectural photography, never cool/blue corporate stock.
