/**
 * Real Loading System - Waits for actual asset/ready state
 */

(function() {
    'use strict';

    let assetsLoaded = false;
    let layoutReady = false;
    let loadingProgress = 0;
    let totalAssets = 0;
    let loadedAssets = 0;

    const loader = document.getElementById('loading-screen');
    const progressBar = document.querySelector('.loading-progress-bar');

    // Check if everything is already loaded
    function checkIfAlreadyLoaded() {
        const gsapLoaded = typeof gsap !== 'undefined';
        const threeLoaded = typeof THREE !== 'undefined';
        const fontsLoaded = document.fonts ? document.fonts.check('1em Inter') : true; // Fallback to true if API not available
        const domReady = document.readyState !== 'loading';
        
        // Check images
        const images = document.querySelectorAll('img');
        let imagesLoaded = true;
        if (images.length > 0) {
            imagesLoaded = Array.from(images).every(img => img.complete && img.naturalHeight !== 0);
        }

        return gsapLoaded && threeLoaded && fontsLoaded && domReady && imagesLoaded;
    }

    function updateProgress(progress) {
        loadingProgress = progress;
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }

    function checkReady() {
        if (assetsLoaded && layoutReady) {
            // Make sure progress is at 100%
            updateProgress(100);
            
            // Small delay to show completion, then hide
            setTimeout(() => {
                hideLoader();
            }, 300);
        }
    }

    function hideLoader() {
        if (!loader) return;
        
        loader.classList.add('hidden');
        
        // Remove from DOM after transition
        setTimeout(() => {
            if (loader.parentNode) {
                loader.remove();
            }
            // Trigger any initial animations
            document.body.classList.add('loaded');
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 800);
    }

    function checkAssetLoaded(assetName, progress) {
        loadedAssets++;
        updateProgress(progress);
        
        // Check if all critical assets are loaded
        const criticalAssetsLoaded = 
            loadedAssets >= totalAssets || 
            (typeof gsap !== 'undefined' && layoutReady);
        
        if (criticalAssetsLoaded) {
            assetsLoaded = true;
            checkReady();
        }
    }

    function initLoading() {
        // Skip loader if everything is already loaded
        if (checkIfAlreadyLoaded()) {
            if (loader) {
                loader.style.display = 'none';
                loader.remove();
            }
            document.body.classList.add('loaded');
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
            return;
        }

        // Count assets to load
        totalAssets = 3; // GSAP, Fonts, Images (Three.js is optional)
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                layoutReady = true;
                checkAssetLoaded('dom', 30);
            });
        } else {
            layoutReady = true;
            checkAssetLoaded('dom', 30);
        }

        // Check if GSAP is loaded
        if (typeof gsap === 'undefined') {
            const gsapCheck = setInterval(() => {
                if (typeof gsap !== 'undefined') {
                    clearInterval(gsapCheck);
                    checkAssetLoaded('gsap', 60);
                }
            }, 50);
            
            // Timeout fallback
            setTimeout(() => {
                clearInterval(gsapCheck);
                if (typeof gsap !== 'undefined') {
                    checkAssetLoaded('gsap', 60);
                }
            }, 5000);
        } else {
            checkAssetLoaded('gsap', 60);
        }

        // Wait for fonts to load
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                checkAssetLoaded('fonts', 80);
            }).catch(() => {
                // Fallback if fonts fail
                checkAssetLoaded('fonts', 80);
            });
        } else {
            // Fallback for browsers without Font Loading API
            setTimeout(() => checkAssetLoaded('fonts', 80), 100);
        }

        // Check images
        const images = document.querySelectorAll('img');
        if (images.length === 0) {
            checkAssetLoaded('images', 100);
        } else {
            let loadedImages = 0;
            const totalImages = images.length;
            
            images.forEach(img => {
                if (img.complete && img.naturalHeight !== 0) {
                    loadedImages++;
                    updateProgress(30 + (loadedImages / totalImages) * 50);
                } else {
                    const loadHandler = () => {
                        loadedImages++;
                        updateProgress(30 + (loadedImages / totalImages) * 50);
                        if (loadedImages === totalImages) {
                            checkAssetLoaded('images', 100);
                        }
                        img.removeEventListener('load', loadHandler);
                        img.removeEventListener('error', loadHandler);
                    };
                    img.addEventListener('load', loadHandler);
                    img.addEventListener('error', loadHandler);
                }
            });
            
            if (loadedImages === totalImages) {
                checkAssetLoaded('images', 100);
            }
        }
    }

    // Animate loading elements
    function animateLoader() {
        const logo = document.querySelector('.loading-logo');
        const text = document.querySelector('.loading-text');

        if (logo && typeof gsap !== 'undefined') {
            gsap.to(logo, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                delay: 0.2
            });
        } else if (logo) {
            // Fallback if GSAP not loaded yet
            setTimeout(() => {
                logo.style.opacity = '1';
                logo.style.transform = 'translateY(0)';
            }, 200);
        }

        if (text && typeof gsap !== 'undefined') {
            gsap.to(text, {
                opacity: 1,
                duration: 0.6,
                delay: 0.5
            });
        } else if (text) {
            setTimeout(() => {
                text.style.opacity = '1';
            }, 500);
        }

        // Initialize progress bar
        updateProgress(0);
    }

    // Initialize when script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initLoading();
            setTimeout(animateLoader, 100);
        });
    } else {
        initLoading();
        setTimeout(animateLoader, 100);
    }

    // Fallback timeout - hide loader after max 5 seconds
    setTimeout(() => {
        if (loader && !loader.classList.contains('hidden')) {
            console.warn('Loading timeout - forcing hide');
            hideLoader();
        }
    }, 5000);

})();
