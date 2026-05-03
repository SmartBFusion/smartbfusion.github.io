	/**
 * Custom Smooth Scrolling System & Scrollbar for SMART Business Fusion Holdings
 * Provides smooth, consistent, non-sticky scrolling and a custom scrollbar UI.
 */
(function() {
	'use strict';

	const EASE = 0.16;
	const STOP_THRESHOLD = 0.3;

	// Only enable on desktop
	if (window.innerWidth <= 768) return;

	// Elements
	const body = document.body;
	const html = document.documentElement;
	let scrollContainer = document.querySelector('#smooth-scroll-container');
	if (!scrollContainer) {
		scrollContainer = document.createElement('div');
		scrollContainer.id = 'smooth-scroll-container';
		while (body.firstChild) {
			scrollContainer.appendChild(body.firstChild);
		}
		body.appendChild(scrollContainer);
	}

	// Style for container
	scrollContainer.style.position = 'fixed';
	scrollContainer.style.top = '0';
	scrollContainer.style.left = '0';
	scrollContainer.style.width = '100vw';
	scrollContainer.style.willChange = 'transform';
	scrollContainer.style.zIndex = '0';
	scrollContainer.style.overflow = 'visible';
	scrollContainer.style.minHeight = '100vh';

	// Set body height to allow native scroll
	function setBodyHeight() {
		body.style.height = scrollContainer.scrollHeight + 'px';
	}

	// Scroll state
	let targetScroll = window.scrollY;
	let currentScroll = window.scrollY;
	let isScrolling = false;

	// Custom Scrollbar
	let scrollbarContainer = document.querySelector('.custom-scrollbar-container');
	if (!scrollbarContainer) {
		scrollbarContainer = document.createElement('div');
		scrollbarContainer.className = 'custom-scrollbar-container';
		scrollbarContainer.innerHTML = '<div class="custom-scrollbar-track"><div class="custom-scrollbar-thumb"></div></div>';
		body.appendChild(scrollbarContainer);
	}
	const scrollbarTrack = scrollbarContainer.querySelector('.custom-scrollbar-track');
	const scrollbarThumb = scrollbarContainer.querySelector('.custom-scrollbar-thumb');

	// Update scrollbar thumb position
	function updateScrollbar() {
		const scrollHeight = scrollContainer.scrollHeight - window.innerHeight;
		const progress = Math.max(0, Math.min(1, currentScroll / (scrollHeight || 1)));
		const thumbHeight = Math.max(50, scrollbarTrack.offsetHeight * (window.innerHeight / scrollContainer.scrollHeight));
		scrollbarThumb.style.height = thumbHeight + 'px';
		scrollbarThumb.style.top = (progress * (scrollbarTrack.offsetHeight - thumbHeight)) + 'px';
	}

	// Scroll logic
	function onScroll() {
		targetScroll = Math.max(0, Math.min(scrollContainer.scrollHeight - window.innerHeight, window.scrollY));
		if (!isScrolling) {
			requestAnimationFrame(smoothScrollStep);
			isScrolling = true;
		}
	}

	function smoothScrollStep() {
		const diff = targetScroll - currentScroll;
		currentScroll += diff * EASE;
		if (Math.abs(diff) < STOP_THRESHOLD) {
			currentScroll = targetScroll;
		}
		scrollContainer.style.transform = `translateY(${-currentScroll}px)`;
		updateScrollbar();
		// Dispatch custom event for scroll-driven animations
		const event = new CustomEvent('customscroll', { detail: { scroll: currentScroll } });
		window.dispatchEvent(event);
		if (Math.abs(targetScroll - currentScroll) > STOP_THRESHOLD) {
			requestAnimationFrame(smoothScrollStep);
		} else {
			isScrolling = false;
		}
	}

	// Custom scrollbar drag
	let isDragging = false;
	let dragStartY = 0;
	let dragStartScroll = 0;
	scrollbarThumb.addEventListener('mousedown', function(e) {
		isDragging = true;
		dragStartY = e.clientY;
		dragStartScroll = currentScroll;
		document.body.style.userSelect = 'none';
	});
	window.addEventListener('mousemove', function(e) {
		if (!isDragging) return;
		const delta = e.clientY - dragStartY;
		const scrollHeight = scrollContainer.scrollHeight - window.innerHeight;
		const trackHeight = scrollbarTrack.offsetHeight - scrollbarThumb.offsetHeight;
		const scrollDelta = (delta / (trackHeight || 1)) * scrollHeight;
		window.scrollTo(0, Math.max(0, Math.min(scrollHeight, dragStartScroll + scrollDelta)));
	});
	window.addEventListener('mouseup', function() {
		isDragging = false;
		document.body.style.userSelect = '';
	});

	// Sync on resize
	window.addEventListener('resize', function() {
		setBodyHeight();
		updateScrollbar();
	});

	// Keep height in sync as content loads
	if (window.ResizeObserver) {
		const resizeObserver = new ResizeObserver(function() {
			setBodyHeight();
			updateScrollbar();
		});
		resizeObserver.observe(scrollContainer);
	}

	// Listen to native scroll
	window.addEventListener('scroll', onScroll, { passive: true });

	// Initial setup
	setBodyHeight();
	updateScrollbar();
	onScroll();

	window.addEventListener('load', function() {
		setBodyHeight();
		updateScrollbar();
		onScroll();
	});

	// Expose scroll position for other scripts
	window.customScroll = {
		getScroll: () => currentScroll,
		scrollTo: (y, opts = {}) => {
			const { duration = 600, ease = EASE } = opts;
			targetScroll = Math.max(0, Math.min(scrollContainer.scrollHeight - window.innerHeight, y));

			// Keep native scroll position in sync so users can scroll up/down normally after programmatic jumps
			window.scrollTo(0, targetScroll);

			const step = () => {
				const diff = targetScroll - currentScroll;
				currentScroll += diff * ease;
				if (Math.abs(diff) < STOP_THRESHOLD) {
					currentScroll = targetScroll;
				}
				scrollContainer.style.transform = `translateY(${-currentScroll}px)`;
				updateScrollbar();
				const event = new CustomEvent('customscroll', { detail: { scroll: currentScroll } });
				window.dispatchEvent(event);
				if (Math.abs(targetScroll - currentScroll) > STOP_THRESHOLD) {
					requestAnimationFrame(step);
				}
			};
			requestAnimationFrame(step);
		}
	};
})();
