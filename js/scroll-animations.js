/**
 * Scroll-based animations using GSAP ScrollTrigger
 */

(function() {
    'use strict';

    // Register ScrollTrigger plugin
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP or ScrollTrigger not loaded');
            return;
        }

        // Wait for page load before initializing scroll animations
        if (document.body.classList.contains('loaded')) {
            setupAnimations();
        } else {
            window.addEventListener('load', setupAnimations);
            // Fallback timeout
            setTimeout(setupAnimations, 2000);
        }
    }

    function setupAnimations() {
        // Hero Title and Subtitle Reveal
        const heroTitle = document.querySelector('.hero-title-reveal');
        const heroSubtitle = document.querySelector('.hero-subtitle-reveal');
        
        if (heroTitle) {
            gsap.to(heroTitle, {
                opacity: 1,
                y: 0,
                clipPath: 'inset(0 0 0% 0)',
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                    once: true
                }
            });
        }

        if (heroSubtitle) {
            gsap.to(heroSubtitle, {
                opacity: 1,
                y: 0,
                clipPath: 'inset(0 0 0% 0)',
                duration: 1,
                delay: 0.3,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                    once: true
                }
            });
        }

        // Pre-Category Intro Section - Now handled by kinetic-typography.js
        // This section uses advanced scroll-driven kinetic typography

        // Animate scroll reveal elements with enhanced motion
        const scrollReveals = document.querySelectorAll('.scroll-reveal');
        
        scrollReveals.forEach((element, index) => {
            const delay = parseFloat(element.getAttribute('data-delay')) || 0;
            
            gsap.fromTo(element, 
                {
                    opacity: 0,
                    y: 60,
                    scale: 0.96
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1,
                    delay: delay,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 82%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none none',
                        once: true
                    }
                }
            );
        });

        // Service cards animation
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach((card, index) => {
            gsap.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                    once: true
                },
                onComplete: () => {
                    card.classList.add('revealed');
                }
            });
        });

        // Enhanced 3D card interactions
        const divisionCards = document.querySelectorAll('.division-card');
        divisionCards.forEach((card, index) => {
            const content = card.querySelector('.card-3d-content');
            if (!content) return;

            // Enhanced stagger animation with depth
            gsap.fromTo(card,
                {
                    opacity: 0,
                    y: 80,
                    scale: 0.92,
                    rotationX: 15
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotationX: 0,
                    duration: 0.9,
                    delay: index * 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                        once: true
                    }
                }
            );
        });

        // Parallax scroll for hero content with depth
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            // Keep hero fully legible; disable parallax fade/scale that was dimming the header on scroll
            gsap.set(heroContent, { y: 0, scale: 1, opacity: 1 });
        }

        // Parallax for pre-category intro section
        const introContent = document.querySelector('.intro-content');
        if (introContent) {
            gsap.to(introContent, {
                y: -50,
                opacity: 0.6,
                scrollTrigger: {
                    trigger: '.pre-category-intro',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.2
                }
            });
        }

        // Section title animations with depth
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            gsap.fromTo(title,
                {
                    opacity: 0,
                    y: 50,
                    clipPath: 'inset(0 0 100% 0)'
                },
                {
                    opacity: 1,
                    y: 0,
                    clipPath: 'inset(0 0 0% 0)',
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: title,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                        once: true
                    }
                }
            );
        });

        // Service items and cinema categories animation
        const serviceItems = document.querySelectorAll('.service-item, .cinema-category');
        serviceItems.forEach((item, index) => {
            gsap.to(item, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                delay: index * 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                    once: true
                },
                onComplete: () => {
                    item.classList.add('revealed');
                }
            });
        });

        // Enhanced footer reveal
        const footer = document.querySelector('.main-footer');
        if (footer) {
            gsap.fromTo(footer,
                {
                    opacity: 0,
                    y: 50
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: footer,
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                        once: true
                    }
                }
            );
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 250);
    });

})();
