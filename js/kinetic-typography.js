/**
 * Advanced Scroll-Driven Kinetic Typography
 * Transforms intro text into cinematic, deconstructed typography experience
 */


(function() {
    'use strict';

    if (typeof gsap === 'undefined') {
        console.warn('GSAP required for kinetic typography');
        return;
    }

    // Content (do not change)
    const introLines = [
        "SMART Holding Business Fusion operates at the intersection of engineering, experience, and long-term vision.",
        "Each division is built with purpose, designed to evolve, and structured to scale across industries that demand precision, reliability, and impact.",
        "Scroll to explore the systems behind the experience."
    ];

    // Emphasis config: only color/weight/scale; accent font allowed for key terms
    const emphasis = [
        ["engineering", "experience", "long-term vision"],
        ["purpose", "evolve", "scale", "precision", "reliability", "impact"],
        []
    ];

    const accentTerms = new Set([
        'engineering', 'experience', 'long-term vision', 'precision', 'scale', 'impact'
    ]);

    function highlightPhrases(line, phrases) {
        let result = line;
        phrases.forEach(phrase => {
            const regex = new RegExp(`(${phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
            const cls = accentTerms.has(phrase.toLowerCase()) ? 'kt-em kt-em-accent' : 'kt-em';
            result = result.replace(regex, `<span class="${cls}">$1</span>`);
        });
        return result;
    }

    function initKineticTypography() {
        const introSection = document.querySelector('.pre-category-intro');
        if (!introSection) return;
        const introContent = introSection.querySelector('.intro-content');
        if (!introContent) return;
        introContent.innerHTML = '';
        introContent.style.minHeight = '200vh';

        introLines.forEach((line, i) => {
            const lineDiv = document.createElement('div');
            lineDiv.className = `kt-line kt-line-${i}`;
            lineDiv.innerHTML = highlightPhrases(line, emphasis[i]);
            introContent.appendChild(lineDiv);
        });

        setupScrollAnimations(introSection, introContent);
    }

    function setupScrollAnimations(section, content) {
        let sectionTop = section.offsetTop;
        let sectionHeight = content.offsetHeight || 2000;
        const viewportHeight = window.innerHeight;
        const lines = content.querySelectorAll('.kt-line');

        // Cache element positions to avoid layout thrashing
        let cachedSectionTop = sectionTop;
        let cachedSectionHeight = sectionHeight;

        function getScrollProgress() {
            if (window.customScroll) {
                return window.customScroll.getScroll();
            }
            return window.pageYOffset || window.scrollY || 0;
        }

        let lastProgress = -1;
        let animationFrame = null;
        let isAnimating = false;

        function animateOnScroll() {
            if (isAnimating) return;
            isAnimating = true;

            // Update cached positions periodically
            if (Math.random() < 0.1) {
                cachedSectionTop = section.offsetTop;
                cachedSectionHeight = content.offsetHeight || 2000;
            }

            const scrollPos = getScrollProgress();
            const sectionStart = cachedSectionTop - viewportHeight * 0.5;
            const sectionEnd = cachedSectionTop + cachedSectionHeight;

            let progress = 0;
            if (scrollPos >= sectionStart && scrollPos <= sectionEnd) {
                progress = (scrollPos - sectionStart) / (sectionEnd - sectionStart);
                progress = Math.max(0, Math.min(1, progress));
            } else if (scrollPos < sectionStart) {
                progress = 0;
            } else {
                progress = 1;
            }

            // Only animate if progress changed significantly
            if (Math.abs(progress - lastProgress) < 0.005) {
                isAnimating = false;
                return;
            }
            lastProgress = progress;

            // Cancel any pending animation frame
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            animationFrame = requestAnimationFrame(() => {
                // Animate lines: single dominant line, fully scrubbed, no snaps
                const center = progress * lines.length;
                lines.forEach((line, i) => {
                    const dist = Math.abs((i + 0.5) - center); // distance in line units
                    const t = Math.max(0, 1 - Math.min(1, dist)); // 1 at center, 0 at distance >=1
                    const weight = 0.5 * (1 - Math.cos(Math.PI * t)); // smooth bell curve
                    const opacity = 0.25 + 0.75 * weight;
                    const y = 26 - 26 * weight;
                    const scale = 0.985 + 0.05 * weight;
                    const fontWeight = Math.round(400 + 300 * weight);

                    gsap.set(line, {
                        opacity,
                        y,
                        scale,
                        fontWeight,
                        immediateRender: true
                    });
                });

                // Emphasis styling (color/weight + subtle scale). Accent font allowed.
                content.querySelectorAll('.kt-em').forEach(em => {
                    gsap.set(em, {
                        color: 'var(--color-accent)',
                        fontWeight: 700,
                        scale: 1.06,
                        immediateRender: true
                    });
                });
                animationFrame = null;
                isAnimating = false;
            });
        }

        // Listen to scroll events with throttling
        let scrollTimeout = null;
        function handleScroll() {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                animateOnScroll();
                scrollTimeout = null;
            }, 16); // ~60fps
        }

        window.addEventListener('customscroll', handleScroll, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initial animation
        setTimeout(() => {
            animateOnScroll();
        }, 100);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKineticTypography);
    } else {
        setTimeout(initKineticTypography, 500);
    }

})();
