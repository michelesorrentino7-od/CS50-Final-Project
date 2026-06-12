/* ══════════════════════════════════════════════════════════
   service-detail.js — shared enhancer for services/*.html
   Section-nav scrollspy: the same IntersectionObserver pattern
   home.html uses inline, shared here across all 8 detail pages.
   ══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    function init() {
        const links = document.querySelectorAll('.section-nav-link[href^="#"]');
        const sections = Array.from(links)
            .map(l => document.querySelector(l.getAttribute('href')))
            .filter(Boolean);

        if (!sections.length || !('IntersectionObserver' in window)) {
            return;
        }

        /* rootMargin crops top 30% / bottom 60% so the active link flips
           when a section crosses the upper-middle of the viewport —
           identical to the home.html inline scrollspy. */
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    links.forEach(l => l.classList.remove('active'));
                    const active = document.querySelector(`.section-nav-link[href="#${entry.target.id}"]`);
                    if (active) active.classList.add('active');
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });

        sections.forEach(s => observer.observe(s));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
