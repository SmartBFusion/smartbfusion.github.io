/**
 * Playful bubble cursor with spark trail
 */

(function() {
    'use strict';

    const isKidsPage = document.body?.classList?.contains('kids-page');
    let cursor = null;
    let cursorTrail = null;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let trailParticles = [];
    const MAX_TRAIL_PARTICLES = 14;
    let lastTime = 0;
    const TRAIL_INTERVAL = 55; // ms between trail particles

    function initCursor() {
        // Only initialize on desktop
        if (window.innerWidth <= 768) {
            return;
        }

        cursor = document.getElementById('cursor');
        cursorTrail = document.getElementById('cursor-trail');

        if (!cursor || !cursorTrail) {
            return;
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        // Delegated hover/active for all interactive elements (links, buttons, inputs)
        const isInteractive = (el) => !!el && (el.closest('a, button, input, select, textarea, [role="button"], [data-interactive]'));

        document.addEventListener('pointerover', (e) => {
            if (isInteractive(e.target)) {
                cursor?.classList.add('hover');
            }
        }, true);

        document.addEventListener('pointerout', (e) => {
            if (isInteractive(e.target)) {
                cursor?.classList.remove('hover');
                cursor?.classList.remove('active');
            }
        }, true);

        document.addEventListener('pointerdown', (e) => {
            if (isInteractive(e.target)) {
                cursor?.classList.add('active');
            }
        }, true);

        document.addEventListener('pointerup', (e) => {
            if (isInteractive(e.target)) {
                cursor?.classList.remove('active');
            }
        }, true);

        animateCursor();
    }

    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        const now = Date.now();
        if (now - lastTime >= TRAIL_INTERVAL) {
            createTrailParticle(mouseX, mouseY);
            lastTime = now;
        }
    }

    function handleMouseEnter() {
        if (cursor) {
            cursor.style.opacity = '1';
        }
    }

    function handleMouseLeave() {
        if (cursor) {
            cursor.style.opacity = '0';
        }
    }

    function createTrailParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = isKidsPage ? 'cursor-spark' : 'cursor-triangle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        cursorTrail.appendChild(particle);
        trailParticles.push({ element: particle, time: Date.now() });

        // Remove old particles
        if (trailParticles.length > MAX_TRAIL_PARTICLES) {
            const oldParticle = trailParticles.shift();
            if (oldParticle.element.parentNode) {
                oldParticle.element.remove();
            }
        }

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
            trailParticles = trailParticles.filter(p => p.element !== particle);
        }, 800);
    }

    function animateCursor() {
        if (!cursor) return;

        // Smooth cursor movement
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        // Rotate cursor slightly based on movement
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (isKidsPage) {
            cursor.style.transform = `translate(-50%, -50%) rotate(0deg)`;
        } else {
            cursor.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        }

        requestAnimationFrame(animateCursor);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCursor);
    } else {
        initCursor();
    }

    // Reinitialize on resize if switching between mobile/desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const isMobile = window.innerWidth <= 768;
            if (cursor) {
                cursor.style.display = isMobile ? 'none' : 'block';
            }
            if (cursorTrail) {
                cursorTrail.style.display = isMobile ? 'none' : 'block';
            }
        }, 250);
    });

})();

