/* ══════════════════════════════════════════════════════════
   service-detail.js — shared enhancer for services/*.html
   Turns the repeated service detail sections into a single-panel
   carousel while preserving anchor navigation and no-JS fallback.
   ══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    const PANEL_SELECTOR = 'section.service-band, section.service-outcomes, section.service-method, section.service-proof';
    const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]';
    const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

    function getPanelLabel(section, links) {
        const href = '#' + section.id;
        const link = links.find(item => item.getAttribute('href') === href);
        if (link) return link.textContent.trim();
        const heading = section.querySelector('.service-section-heading, h2, h3');
        return heading ? heading.textContent.trim() : '';
    }

    function createControl(direction) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'service-carousel-control service-carousel-control-' + direction;
        button.innerHTML = direction === 'prev'
            ? '<svg class="service-carousel-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg><span class="service-carousel-label"></span>'
            : '<span class="service-carousel-label"></span><svg class="service-carousel-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7"/></svg>';
        return button;
    }

    function syncPanelFocus(section, isActive) {
        section.classList.toggle('is-active', isActive);
        section.setAttribute('aria-hidden', isActive ? 'false' : 'true');

        if ('inert' in section) {
            section.inert = !isActive;
        }

        section.querySelectorAll(FOCUSABLE_SELECTOR).forEach(element => {
            if (element.dataset.originalTabindex === undefined) {
                element.dataset.originalTabindex = element.getAttribute('tabindex') || '';
            }

            if (isActive) {
                if (element.dataset.originalTabindex) {
                    element.setAttribute('tabindex', element.dataset.originalTabindex);
                } else {
                    element.removeAttribute('tabindex');
                }
            } else {
                element.setAttribute('tabindex', '-1');
            }
        });
    }

    function initCarousel() {
        const body = document.body;
        const main = document.querySelector('main');
        if (!body.classList.contains('service-detail') || !main) return false;

        const links = Array.from(document.querySelectorAll('.section-nav-link[href^="#"]'));
        const sections = Array.from(main.children).filter(child => child.matches && child.matches(PANEL_SELECTOR));
        if (sections.length < 2) return false;

        const carousel = document.createElement('div');
        carousel.className = 'service-detail-carousel';
        carousel.setAttribute('aria-label', 'Service detail sections');
        carousel.setAttribute('aria-roledescription', 'carousel');

        const controls = document.createElement('div');
        controls.className = 'service-carousel-controls';
        controls.setAttribute('aria-label', 'Service section controls');

        const prevButton = createControl('prev');
        const nextButton = createControl('next');
        controls.append(prevButton, nextButton);

        const viewport = document.createElement('div');
        viewport.className = 'service-carousel-viewport';
        viewport.tabIndex = 0;

        const track = document.createElement('div');
        track.className = 'service-carousel-track';

        main.insertBefore(carousel, sections[0]);
        carousel.append(controls, viewport);
        viewport.append(track);
        sections.forEach(section => track.appendChild(section));

        const motionQuery = window.matchMedia ? window.matchMedia(REDUCED_MOTION_QUERY) : null;
        let activeIndex = Math.max(0, sections.findIndex(section => '#' + section.id === window.location.hash));
        let heightFrame = 0;

        function prefersReducedMotion() {
            return motionQuery ? motionQuery.matches : false;
        }

        function updateHeight() {
            if (heightFrame) window.cancelAnimationFrame(heightFrame);
            heightFrame = window.requestAnimationFrame(() => {
                const activePanel = sections[activeIndex];
                if (activePanel) {
                    viewport.style.height = activePanel.offsetHeight + 'px';
                }
            });
        }

        function updateControls() {
            const prevLabel = activeIndex > 0 ? getPanelLabel(sections[activeIndex - 1], links) : '';
            const nextLabel = activeIndex < sections.length - 1 ? getPanelLabel(sections[activeIndex + 1], links) : '';
            const isItalian = document.documentElement.lang === 'it';

            prevButton.querySelector('.service-carousel-label').textContent = prevLabel;
            nextButton.querySelector('.service-carousel-label').textContent = nextLabel;
            prevButton.disabled = activeIndex === 0;
            nextButton.disabled = activeIndex === sections.length - 1;
            prevButton.setAttribute('aria-label', prevLabel
                ? (isItalian ? 'Sezione precedente: ' : 'Previous section: ') + prevLabel
                : (isItalian ? 'Sezione precedente' : 'Previous section'));
            nextButton.setAttribute('aria-label', nextLabel
                ? (isItalian ? 'Sezione successiva: ' : 'Next section: ') + nextLabel
                : (isItalian ? 'Sezione successiva' : 'Next section'));
        }

        function updateNav() {
            links.forEach(link => {
                const targetIndex = sections.findIndex(section => link.getAttribute('href') === '#' + section.id);
                link.classList.toggle('active', targetIndex === activeIndex);
            });
        }

        function updatePanels() {
            track.style.transform = 'translateX(' + (-activeIndex * 100) + '%)';
            sections.forEach((section, index) => syncPanelFocus(section, index === activeIndex));
            updateControls();
            updateNav();
            updateHeight();
        }

        function scrollCarouselIntoView() {
            carousel.scrollIntoView({
                block: 'start',
                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
        }

        function goTo(index, options) {
            if (index < 0 || index >= sections.length) return;

            if (index === activeIndex) {
                const activeHash = '#' + sections[activeIndex].id;
                if (options && options.updateHash && window.location.hash !== activeHash) {
                    window.history.pushState(null, '', activeHash);
                }
                if (options && options.scroll) scrollCarouselIntoView();
                return;
            }

            activeIndex = index;
            updatePanels();

            const nextHash = '#' + sections[activeIndex].id;
            if (options && options.updateHash && window.location.hash !== nextHash) {
                window.history.pushState(null, '', nextHash);
            }
            if (options && options.scroll) scrollCarouselIntoView();
        }

        prevButton.addEventListener('click', () => goTo(activeIndex - 1, { updateHash: true, scroll: true }));
        nextButton.addEventListener('click', () => goTo(activeIndex + 1, { updateHash: true, scroll: true }));

        links.forEach(link => {
            link.addEventListener('click', event => {
                const href = link.getAttribute('href');
                const index = sections.findIndex(section => href === '#' + section.id);
                if (index < 0) return;
                event.preventDefault();
                goTo(index, { updateHash: true, scroll: true });
            });
        });

        viewport.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goTo(activeIndex - 1, { updateHash: true, scroll: false });
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                goTo(activeIndex + 1, { updateHash: true, scroll: false });
            }
        });

        window.addEventListener('resize', updateHeight);
        window.addEventListener('load', updateHeight);
        window.addEventListener('popstate', () => {
            const index = sections.findIndex(section => '#' + section.id === window.location.hash);
            if (index >= 0) {
                activeIndex = index;
                updatePanels();
            }
        });
        window.addEventListener('service-languagechange', () => {
            window.setTimeout(() => {
                updateControls();
                updateHeight();
            }, 0);
        });

        const nav = document.querySelector('.section-nav');
        if (nav && 'MutationObserver' in window) {
            new MutationObserver(() => {
                updateControls();
                updateHeight();
            }).observe(nav, { childList: true, characterData: true, subtree: true });
        }

        updatePanels();

        if (activeIndex > 0 && window.location.hash) {
            window.requestAnimationFrame(scrollCarouselIntoView);
        }

        return true;
    }

    function initScrollspy() {
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

    function init() {
        if (!initCarousel()) {
            initScrollspy();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
