/* ══════════════════════════════════════════════════════════
   images.js — Centralised Image & Asset Registry
   ══════════════════════════════════════════════════════════

   PURPOSE
   ───────
   Every visual asset on the site is registered in ONE place.
   To swap an image, edit a single entry below — no need to
   hunt through HTML files or CSS rules.

   HOW IT WORKS
   ────────────
   1. The REGISTRY object maps short keys to file paths.
   2. On page load the ENGINE reads the registry and:
      • Injects CSS custom properties (--bg-*) for backgrounds.
      • Sets `src` on every <img data-img="key"> element.
   3. The base path (empty string or "../") is auto-detected
      from this script's own `src` attribute so sub-folder
      pages (services/*) resolve paths correctly.

   FILE MAP
   ─────────────────────────────────────────────────
   §A  REGISTRY  ................  line ~40
       A1  backgrounds   — page background images
       A2  images        — <img> content images
       A3  external      — CDN / font URLs (reference only)
   §B  ENGINE  ..................  line ~120
       B1  getBasePath   — auto-detect root from <script src>
       B2  applyBackgrounds — set --bg-* CSS vars on :root
       B3  applyImages   — set src on [data-img] elements
       B4  boot          — orchestrate all injections
       B5  DOMContentLoaded listener
   ─────────────────────────────────────────────────

   DEPENDENCIES: none — vanilla JS, no frameworks.
   LOADED BY:    every HTML page via <script src="images.js">
                 (service detail pages use src="../images.js")
   ══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ══════════════════════════════════════════════════════
       §A  REGISTRY
       ══════════════════════════════════════════════════════ */

    var REGISTRY = {

        /* ── A1  BACKGROUNDS ─────────────────────────────
           Keys map to CSS variables: --bg-<key>
           Used by styles.css  body.page-* { --page-bg: var(--bg-<key>); }
           and by index.html   body { background-image: var(--bg-cover); }
           ──────────────────────────────────────────────── */
        backgrounds: {
            home:       'images/backgrounds/bg-home.jpg',
            about:      'images/backgrounds/bg-about.jpg',
            services:   'images/backgrounds/bg-services.jpg',
            cases:      'images/backgrounds/bg-cases.jpg',
            cv:         'images/backgrounds/bg-cv.jpg',
            contact:    'images/backgrounds/bg-contact.jpg',
            cover:      'images/coverpage.png'
        },

        /* ── A2  CONTENT IMAGES ──────────────────────────
           Keys map to <img data-img="key"> elements.
           Grouped by page for easy scanning.
           ──────────────────────────────────────────────── */
        images: {

            /* — Shared (navbar + footer on every page) — */
            'logo':                     'images/logo.png',

            /* — Home page — */
            'home-governance':          'images/middle/home-governance.jpg',
            'home-compliance':          'images/middle/home-compliance.jpg',
            'home-security':            'images/middle/home-security.jpg',
            'home-esg':                 'images/middle/home-esg.jpg',
            'home-heritage':            'images/middle/home-heritage.jpg',

            /* — Services hub page — */
            'services-governance':      'images/middle/services-governance.jpg',
            'services-privacy':         'images/middle/services-privacy.jpg',
            'services-esg':             'images/middle/services-esg.jpg',
            'services-supply-chain':    'images/middle/services-supply-chain.jpg',
            'services-compliance':      'images/middle/services-compliance.jpg',
            'services-assurance':       'images/middle/services-assurance.jpg',
            'services-digital':         'images/middle/services-digital.jpg',
            'services-fractional':      'images/middle/services-fractional.jpg',

            /* — Case studies page — */
            'cases-erm':                'images/middle/cases-erm.jpg',
            'cases-audit':              'images/middle/cases-audit.jpg',
            'cases-loss-prevention':    'images/middle/cases-loss-prevention.jpg',
            'cases-gdpr':               'images/middle/cases-gdpr.jpg',

            /* — Contact page — */
            'contact-desk':             'images/middle/contact-desk.jpg'
        },

        /* ── A3  EXTERNAL ASSETS (reference only) ────────
           These CDN / font URLs are loaded via <link> and
           <script> tags in the HTML <head> and must stay
           there for performance (they are render-blocking
           or need early fetching).  Listed here so every
           asset lives in one inventory.
           ──────────────────────────────────────────────── */
        external: {
            bootstrapCSS:   'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
            bootstrapJS:    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js',
            googleFonts:    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap'
        }
    };


    /* ══════════════════════════════════════════════════════
       §B  ENGINE
       ══════════════════════════════════════════════════════ */

    /* ── B1  getBasePath ─────────────────────────────────
       Auto-detect whether this script was loaded from the
       project root ("images.js") or a sub-folder
       ("../images.js").  Returns "" or "../" so every path
       in the registry resolves correctly relative to the
       current HTML document.
       ──────────────────────────────────────────────────── */
    function getBasePath() {
        var scripts = document.querySelectorAll('script[src$="images.js"]');
        var src = scripts[scripts.length - 1].getAttribute('src');
        return src.replace('images.js', '');
    }

    /* ── B2  applyBackgrounds ────────────────────────────
       Inject a --bg-<key> CSS custom property on :root for
       every entry in REGISTRY.backgrounds.  styles.css then
       picks the right one per page:
         body.page-home { --page-bg: var(--bg-home); }
       ──────────────────────────────────────────────────── */
    function applyBackgrounds() {
        var base = getBasePath();
        var root = document.documentElement;
        for (var key in REGISTRY.backgrounds) {
            if (REGISTRY.backgrounds.hasOwnProperty(key)) {
                root.style.setProperty(
                    '--bg-' + key,
                    'url("' + base + REGISTRY.backgrounds[key] + '")'
                );
            }
        }
    }

    /* ── B3  applyImages ─────────────────────────────────
       Find every <img data-img="key"> and set its `src` to
       the matching registry path.  Elements without a match
       are left untouched (graceful degradation).
       ──────────────────────────────────────────────────── */
    function applyImages() {
        var base = getBasePath();
        var elements = document.querySelectorAll('[data-img]');
        for (var i = 0; i < elements.length; i++) {
            var key = elements[i].getAttribute('data-img');
            var path = REGISTRY.images[key];
            if (path) {
                elements[i].src = base + path;
            }
        }
    }

    /* ── B4  boot ────────────────────────────────────────
       Orchestrate: backgrounds → images.
       ──────────────────────────────────────────────────── */
    function boot() {
        applyBackgrounds();
        applyImages();
    }

    /* ── B5  Auto-start on DOMContentLoaded ──────────────
       If the DOM is already parsed (script at end of body),
       run immediately; otherwise wait for the event.
       ──────────────────────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    /* Expose for console debugging: IMAGE_REGISTRY */
    window.IMAGE_REGISTRY = REGISTRY;

})();
