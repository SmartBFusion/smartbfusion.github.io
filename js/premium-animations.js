/**
 * Premium Scroll Choreography - Agency-Level Motion Design
 */

(function() {
    'use strict';

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    function initPremiumAnimations() {
        // Master timeline for hero sequence
        const heroTimeline = gsap.timeline({
            defaults: { ease: 'power3.out' }
        });

        const heroTitle = document.querySelector('.hero-title-reveal');
        const heroSubtitle = document.querySelector('.hero-subtitle-reveal');

        if (heroTitle && heroSubtitle) {
            heroTimeline
                .to(heroTitle, {
                    opacity: 1,
                    y: 0,
                    clipPath: 'inset(0 0 0% 0)',
                    duration: 1.2,
                    ease: 'power4.out'
                })
                .to(heroSubtitle, {
                    opacity: 1,
                    y: 0,
                    clipPath: 'inset(0 0 0% 0)',
                    duration: 1,
                    ease: 'power3.out'
                }, '-=0.5');

            ScrollTrigger.create({
                trigger: '.hero',
                start: 'top 80%',
                animation: heroTimeline,
                toggleActions: 'play none none none',
                once: true
            });
        }

        // Advanced parallax with multiple layers
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            // Lock hero in place to avoid gray-out/opacity shifts on scroll
            gsap.set(heroContent, { y: 0, scale: 1, opacity: 1 });
        }

        // Layered section reveals with stagger
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            if (section.classList.contains('hero')) return;

            const children = section.querySelectorAll('.scroll-reveal, .section-title, .division-card, .intro-line');
            
            children.forEach((child, childIndex) => {
                gsap.fromTo(child,
                    {
                        opacity: 0,
                        y: 80,
                        scale: 0.95
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        delay: childIndex * 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: child,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                            once: true
                        }
                    }
                );
            });
        });

        // Advanced card interactions with magnetic effect
        const divisionCards = document.querySelectorAll('.division-card');
        divisionCards.forEach((card) => {
            const content = card.querySelector('.card-3d-content');
            if (!content) return;

            let bounds;
            const rotateToMouse = (e) => {
                if (e && e.target && e.target.closest && e.target.closest('a, button, input, textarea, select, .btn, .btn-primary, .btn-secondary, .cta-button, .back-button, .home-button')) {
                    return;
                }
                if (!bounds) bounds = card.getBoundingClientRect();
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const leftX = mouseX - bounds.x;
                const topY = mouseY - bounds.y;
                const center = {
                    x: leftX - bounds.width / 2,
                    y: topY - bounds.height / 2
                };
                const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

                gsap.to(content, {
                    duration: 0.5,
                    rotationX: (-center.y / bounds.height) * 15,
                    rotationY: (center.x / bounds.width) * 15,
                    transformPerspective: 1000,
                    transformOrigin: 'center center',
                    ease: 'power2.out'
                });
            };

            card.addEventListener('mouseenter', () => {
                bounds = card.getBoundingClientRect();
                card.addEventListener('mousemove', rotateToMouse);
            });

            card.addEventListener('mouseleave', () => {
                card.removeEventListener('mousemove', rotateToMouse);
                gsap.to(content, {
                    duration: 0.8,
                    rotationX: 0,
                    rotationY: 0,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });

        // Smooth scroll velocity-based animations
        let lastScrollTop = 0;
        let scrollVelocity = 0;

        ScrollTrigger.addEventListener('scrollStart', () => {
            lastScrollTop = window.scrollY;
        });

        ScrollTrigger.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            scrollVelocity = currentScroll - lastScrollTop;
            lastScrollTop = currentScroll;
        });

        // Section-based scroll progress indicators
        sections.forEach((section) => {
            if (section.classList.contains('hero')) return;

            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => {
                    section.classList.add('section-active');
                },
                onLeave: () => {
                    section.classList.remove('section-active');
                },
                onEnterBack: () => {
                    section.classList.add('section-active');
                },
                onLeaveBack: () => {
                    section.classList.remove('section-active');
                }
            });
        });
    }

    // Initialize after page load
    if (document.body.classList.contains('loaded')) {
        setTimeout(initPremiumAnimations, 100);
    } else {
        window.addEventListener('load', () => {
            setTimeout(initPremiumAnimations, 100);
        });
    }

})();

