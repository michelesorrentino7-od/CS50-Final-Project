# Sorrentino Consultancy — A Bilingual GRC Advisory Website

#### Video Demo: <URL HERE>

#### Description

Sorrentino Consultancy is a multi-page, bilingual (English/Italian) static website for an independent Governance, Risk & Compliance (GRC) advisory practice based in Napoli, Italy. The site presents the consultancy's story — three generations of a family business that began with Vigilanza Turris, a security company founded in 1953 — together with its modern advisory services, anonymised case studies, a professional CV and a contact channel. It is built with plain HTML, CSS and vanilla JavaScript on top of Bootstrap 5.3.8, with no build step and no server-side code: every feature, including the language toggle and the contact form, runs entirely in the browser.

The site opens on an editorial cover page (`index.html`) featuring an interactive 3D model of a classical capitol rendered with Google's `<model-viewer>` web component. The model auto-rotates and can be dragged with the mouse or touch. Scrolling down triggers a word-by-word reveal animation of the mission statement, followed by three "principles" pillars that fade in with a staggered entrance, both driven by `IntersectionObserver`. From there the visitor enters the main site (`home.html`), which uses a sticky navbar shared across all pages, a secondary in-page section navigation, a four-column expertise grid linking to dedicated service pages, an editorial heritage section and an audience-focused "How We Work" band.

#### Files

- `index.html` — cover/entry page with the 3D model, scroll-linked word reveal and mission pillars. Its styles live in §38 of `styles.css`, scoped under `body.page-cover`.
- `home.html` — main homepage and the canonical "Home" navigation target.
- `services.html` — hub page with eight alternating service rows, each with an expandable overview.
- `services/` — seven service detail pages (governance-risk, compliance-regulation, privacy, esg-governance, assurance-security, digital-grc, fractional-grc), each following a shared editorial template: hero, "who it's for" cards, deliverables, method and a proof/case section.
- `about.html` — the three-generation family story, reachable from the homepage heritage section.
- `case-studies.html` — filterable, anonymised engagement cards.
- `cv.html` — professional CV with experience, education, certifications and languages.
- `contact.html` — contact details plus a client-side form that validates input and composes a `mailto:` message; no data is stored anywhere.
- `styles.css` — single stylesheet for the whole site: design tokens (a warm "stone" palette), per-page background layers, glassmorphism overlays, all component styles, responsive breakpoints and reduced-motion support.
- `i18n.js` — the EN/IT translation engine (see below).
- `images.js` — a centralised image registry: every visual asset is keyed in one object, and the engine injects `--bg-*` CSS variables and `src` attributes on `[data-img]` elements at load, auto-detecting the base path so the `services/` subpages resolve correctly.
- `images/` — logo, page backgrounds, editorial photography and the GLB 3D model.

#### Design decisions

The internationalisation engine was the hardest design problem. A common approach is to duplicate every page per language, but that doubles maintenance. Instead, `i18n.js` keeps English in the markup as the source of truth and swaps content at runtime through three mechanisms: keyed lookups via `data-i18n` attributes, full-sentence phrase matching through a `TreeWalker` for legacy text nodes without attributes, and placeholder/title maps for form fields and `document.title`. Original English values are cached before the first swap so the toggle is fully reversible, and the preference persists in `localStorage`. Deliberately, business terms such as GRC, ESG, CSRD and GDPR are never translated, mirroring how Italian professionals actually speak.

A second decision was the central image registry. Early drafts hard-coded image paths in fifteen HTML files, which made swapping a photo error-prone. Centralising paths in `images.js` means one edit changes an asset everywhere, and the base-path detection keeps subfolder pages working without duplication.

Third, the contact form is intentionally `mailto:`-based. A static site has no backend; rather than pretending to submit data, the form validates with the HTML5 constraint API, then composes a pre-filled email in the visitor's own client and says so explicitly in the UI — honest about what a static page can and cannot do.

Finally, the cover page's styles are scoped under `body.page-cover` inside the shared stylesheet rather than inlined, so the entire site loads exactly one CSS file and the cover classes cannot collide with similarly named classes used elsewhere (e.g. `.cover-title` on the about hero).

#### Running locally

Browsers block GLB loading over `file://`, so serve the folder over HTTP to see the 3D model:

```bash
cd ~/Documents/"CS50 Final Project"
python3 -m http.server 8000
# open http://localhost:8000/index.html
```
