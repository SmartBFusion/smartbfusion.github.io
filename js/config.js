/**
 * SMART Holdings — Site Config Integration
 * Fetches GET /config from the Cloudflare Worker on every page load.
 * Updates division card visibility, contact links, and CTA text.
 * Falls back gracefully to built-in defaults if the fetch fails.
 *
 * Load this as the FIRST script on every page (before main.js).
 * It runs synchronously after DOMContentLoaded so updates happen
 * before GSAP scroll triggers are registered.
 */

(function () {
    'use strict';

    var CONFIG_URL = 'https://smart.smartbf.workers.dev/config';

    // ── Hard-coded fallback ────────────────────────────────────────────────────
    // Mirrors DEFAULT_CONFIG in the Worker so the site never shows broken state.
    var FALLBACK = {
        divisions: {
            amusements: {
                enabled: true,
                name: 'SMART Amusement World',
                tagline: 'Complete arcade solutions: spare parts, technical service, and cinema equipment',
                cta: 'Explore Services',
                url: 'amusements/',
                contact: { email: 'arcade@smartbusinessfusion.com', phone: '+94 77 368 9366' }
            },
            academy: {
                enabled: true,
                name: 'SMART Educational Academy',
                tagline: 'Professional training and certification programs',
                cta: 'Learn More',
                url: 'academy/',
                contact: { email: 'edu@smartbusinessfusion.com', phone: '+94 77 368 9366' },
                kids: { enabled: true, enrolling: false }
            },
            division1: { enabled: false },
            division2: { enabled: false },
            division3: { enabled: false }
        },
        contact: {
            main: 'SMART@smartbusinessfusion.com',
            info: 'info@smartbusinessfusion.com'
        }
    };

    // ── Division selector map ─────────────────────────────────────────────────
    // Maps config keys → data attributes on division cards in the HTML.
    // Cards should have:  data-division="amusements"  (or academy / division1 …)
    var DIVISION_CARD_ATTR = 'data-division';

    // ── Apply config to the DOM ───────────────────────────────────────────────
    function applyConfig(cfg) {
        if (!cfg || !cfg.divisions) return;

        // --- Division cards on main page ---
        var cards = document.querySelectorAll('[' + DIVISION_CARD_ATTR + ']');
        cards.forEach(function (card) {
            var key = card.getAttribute(DIVISION_CARD_ATTR);
            var div = cfg.divisions[key];
            if (!div) return;

            // Show/hide
            if (div.enabled === false) {
                card.style.display = 'none';
                return;
            }
            card.style.display = '';

            // CTA text
            if (div.cta) {
                var cta = card.querySelector('.btn-primary, .primary-cta');
                if (cta) cta.textContent = div.cta;
            }

            // Contact email link
            if (div.contact && div.contact.email) {
                var emailLink = card.querySelector('a[href^="mailto:"]');
                if (emailLink) {
                    emailLink.href = 'mailto:' + div.contact.email;
                    emailLink.textContent = div.contact.email;
                }
            }
        });

        // --- Footer contact links (pages that have them) ---
        if (cfg.contact) {
            var footerLinks = document.querySelectorAll('.footer-links a[href^="mailto:"]');
            footerLinks.forEach(function (link) {
                var text = link.textContent;
                if (/^Main:/i.test(text) && cfg.contact.main) {
                    link.href = 'mailto:' + cfg.contact.main;
                    link.textContent = 'Main: ' + cfg.contact.main;
                } else if (/^Info:/i.test(text) && cfg.contact.info) {
                    link.href = 'mailto:' + cfg.contact.info;
                    link.textContent = 'Info: ' + cfg.contact.info;
                }
            });
        }
    }

    // ── Fetch + apply ─────────────────────────────────────────────────────────
    function loadConfig() {
        // Always apply fallback first so the page looks correct even before fetch
        applyConfig(FALLBACK);

        fetch(CONFIG_URL, {
            method: 'GET',
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
        })
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function (cfg) {
            applyConfig(cfg);
            // Store in sessionStorage so sub-pages within a session skip the fetch
            try { sessionStorage.setItem('smartConfig', JSON.stringify(cfg)); } catch (_) {}
        })
        .catch(function (err) {
            // Fetch failed — fallback already applied, nothing to do.
            console.warn('[smart-config] Worker unreachable, using fallback config.', err.message);
        });
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadConfig);
    } else {
        loadConfig();
    }

    // Expose for debugging
    window.__smartConfig = { reload: loadConfig, fallback: FALLBACK };
})();
