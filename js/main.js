/**
 * Main JavaScript for SMART Holding Business Fusion website
 * Handles navigation, UI interactions, and basic functionality
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initScrollRestoration();
        initHomeReturnFlag();
        initTriangleTransitions();
        initNavigation();
        initYear();
        initViewToggle();
        initSmoothAnchors();
        initHashScroll();
        applyStoredScrollTarget();
        initLocalFileLinks();
    });

    /**
     * Page transition overlay: show while navigating, hide after page fully loads
     */
    function initTriangleTransitions() {
        const overlay = document.getElementById('triangle-transition');
        if (!overlay) return;

        const ANIM_MS = 700;
        const STORAGE_KEY = 'triangleNav';

        const hideOverlay = () => {
            overlay.classList.remove('is-animating');
            overlay.classList.remove('is-prepping');
            overlay.classList.remove('is-exiting');
        };

        const playExitAnimation = () => {
            overlay.classList.add('is-prepping');
            // allow style application then trigger exit
            requestAnimationFrame(() => {
                overlay.classList.add('is-exiting');
                overlay.classList.remove('is-prepping');
            });
        };

        const onExitEnd = (e) => {
            if (e.target.tagName.toLowerCase() !== 'svg') return;
            if (!overlay.classList.contains('is-exiting')) return;
            hideOverlay();
        };

        overlay.addEventListener('transitionend', onExitEnd);

        // If coming from a navigation, play exit animation on load
        const fromNav = (() => {
            try {
                const v = sessionStorage.getItem(STORAGE_KEY);
                if (v) sessionStorage.removeItem(STORAGE_KEY);
                return !!v;
            } catch (e) {
                return false;
            }
        })();

        const resetOnLoad = () => {
            if (fromNav) {
                playExitAnimation();
                // safety hide in case transitionend doesn't fire
                setTimeout(hideOverlay, ANIM_MS + 150);
            } else {
                hideOverlay();
            }
        };

        if (document.readyState === 'complete') {
            resetOnLoad();
        } else {
            window.addEventListener('load', resetOnLoad, { once: true });
        }

        document.addEventListener('click', (e) => {
            const link = e.target.closest && e.target.closest('a');
            if (!link) return;
            if (e.defaultPrevented) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Ignore external/special links
            if (link.target && link.target === '_blank') return;
            if (/^(mailto:|tel:)/i.test(href)) return;
            if (href.startsWith('#')) return;

            const isAbsoluteHttp = /^(https?:)?\/\//i.test(href);
            if (isAbsoluteHttp && link.origin !== window.location.origin) return;

            // Same-page hash-only link
            const [pathPart, hashPart] = href.split('#');
            if (hashPart && (!pathPart || pathPart === '')) return;

            // Prepare destination, including file:// index fallback
            const destination = resolveHrefForFile(href);

            // If navigating to the same page path without hash, allow default
            const currentPath = window.location.pathname.replace(/index\.html$/i, '').replace(/\/$/, '/');
            const tempAnchor = document.createElement('a');
            tempAnchor.href = destination;
            const targetPath = tempAnchor.pathname.replace(/index\.html$/i, '').replace(/\/$/, '/');
            if (currentPath === targetPath && !hashPart) return;

            e.preventDefault();

            try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (err) {}

            overlay.classList.add('is-animating');

            setTimeout(() => {
                window.location.assign(destination);
            }, ANIM_MS);
        }, { passive: false });
    }

    function resolveHrefForFile(href) {
        if (window.location.protocol !== 'file:') return href;
        if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
        if (/\.html(#[^\s]*)?$/i.test(href)) return href;

        let target = href;
        if (target.endsWith('/')) {
            target = target + 'index.html';
        } else if (!/\.[^\/]+$/.test(target)) {
            target = target + '/index.html';
        }
        return target;
    }

    /**
     * When running the site from the local filesystem (file://), clicking a link
     * to a folder opens the OS directory listing. To make local browsing easier
     * (without changing production URLs), intercept clicks and append
     * `index.html` for folder-style links when protocol is file:.
     */
    function initLocalFileLinks() {
        try {
            if (window.location.protocol !== 'file:') return;

            document.addEventListener('click', function(e) {
                if (e.defaultPrevented) return;
                const a = e.target.closest && e.target.closest('a');
                if (!a) return;
                const href = a.getAttribute('href');
                if (!href) return;

                // Ignore external or special links
                if (/^(https?:|mailto:|tel:|#)/.test(href)) return;

                // If link already points to an .html file, let it through
                if (/\.html(#[^\\s]*)?$/.test(href)) return;

                // If link already ends with a slash or looks like a folder, append index.html
                // Prevent default and navigate to the computed path so the file:// loader opens the page
                e.preventDefault();
                let target = href;
                if (target.endsWith('/')) {
                    target = target + 'index.html';
                } else if (!/\.[^\/]+$/.test(target)) {
                    // no file extension present and no trailing slash
                    target = target + '/index.html';
                }

                // Use location.assign with the relative path so folder-redirects work locally
                location.assign(target);
            }, { passive: false });
        } catch (err) {
            // Fail silently if any security/storage restrictions occur
            console.warn('initLocalFileLinks error', err);
        }
    }

    /**
     * Prevent browser from restoring mid-page positions that conflict with custom scroll
     */
    function initScrollRestoration() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }

    /**
     * When clicking Home buttons on subpages, remember to land on divisions without polluting the URL with hashes
     */
    function initHomeReturnFlag() {
        const homeButtons = document.querySelectorAll('.home-button');
        homeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    sessionStorage.setItem('scrollTarget', 'divisions');
                } catch (e) {
                    // storage might be blocked; fail silently
                }
            });
        });
    }

    /**
     * Mobile Navigation Toggle
     */
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const mainNav = document.getElementById('mainNav');
        const navMenu = mainNav ? mainNav.querySelector('.nav-menu') : null;

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', 
                    navMenu.classList.contains('active') ? 'true' : 'false'
                );
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                if (!mainNav.contains(event.target) && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Close menu when clicking on a nav link
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(function(link) {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    /**
     * Set current year in footer
     */
    function initYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    /**
     * Smooth anchor scrolling respecting custom scroll system
     */
    function initSmoothAnchors() {
        const anchorLinks = document.querySelectorAll('a[href*="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
                const hashIndex = href.indexOf('#');
                if (hashIndex === -1) return;
                const targetId = href.slice(hashIndex + 1);
                const targetEl = document.getElementById(targetId);
                if (!targetEl) return;

                e.preventDefault();
                const rect = targetEl.getBoundingClientRect();
                const absoluteY = (window.customScroll ? window.customScroll.getScroll() : window.pageYOffset || window.scrollY || 0) + rect.top;

                if (window.customScroll && typeof window.customScroll.scrollTo === 'function') {
                    window.customScroll.scrollTo(absoluteY, { ease: 0.12 });
                } else {
                    window.scrollTo({ top: absoluteY, behavior: 'smooth' });
                }
            });
        });
    }

    /**
     * Honor initial hash (e.g., #divisions) using custom scroll
     */
    function initHashScroll() {
        const applyHash = () => {
            const hash = window.location.hash ? window.location.hash.substring(1) : '';
            if (!hash) return;
            const targetEl = document.getElementById(hash);
            if (!targetEl) return;
            const rect = targetEl.getBoundingClientRect();
            const base = (window.customScroll && window.customScroll.getScroll) ? window.customScroll.getScroll() : (window.pageYOffset || window.scrollY || 0);
            const absoluteY = base + rect.top;

            if (window.customScroll && typeof window.customScroll.scrollTo === 'function') {
                window.customScroll.scrollTo(absoluteY, { ease: 0.12 });
            } else {
                window.scrollTo({ top: absoluteY, behavior: 'smooth' });
            }
        };

        // Apply shortly after load to allow layout and custom scroll to initialize
        setTimeout(applyHash, 250);
        window.addEventListener('hashchange', () => {
            setTimeout(applyHash, 50);
        });
    }

    /**
     * Apply stored scroll target (set by Home buttons) without leaving a hash in the URL
     */
    function applyStoredScrollTarget() {
        let targetId = null;
        try {
            targetId = sessionStorage.getItem('scrollTarget');
            if (targetId) {
                sessionStorage.removeItem('scrollTarget');
            }
        } catch (e) {
            // storage blocked; ignore
        }

        if (!targetId) return;
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const scrollToTarget = () => {
            const rect = targetEl.getBoundingClientRect();
            const base = (window.customScroll && window.customScroll.getScroll) ? window.customScroll.getScroll() : (window.pageYOffset || window.scrollY || 0);
            const absoluteY = base + rect.top;

            if (window.customScroll && typeof window.customScroll.scrollTo === 'function') {
                window.customScroll.scrollTo(absoluteY, { ease: 0.12 });
            } else {
                window.scrollTo({ top: absoluteY, behavior: 'smooth' });
            }
        };

        // Defer slightly to allow layout and custom scroll setup
        setTimeout(scrollToTarget, 250);
    }

    /**
     * Product view toggle (grid/list) for spare parts page
     */
    function initViewToggle() {
        const viewButtons = document.querySelectorAll('.view-btn');
        const productsContainer = document.getElementById('productsContainer');

        if (viewButtons.length > 0 && productsContainer) {
            viewButtons.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const viewType = this.getAttribute('data-view');
                    
                    // Update active state
                    viewButtons.forEach(function(b) {
                        b.classList.remove('active');
                    });
                    this.classList.add('active');

                    // Toggle view class on container
                    productsContainer.className = 'products-' + viewType;
                });
            });
        }
    }

})();

