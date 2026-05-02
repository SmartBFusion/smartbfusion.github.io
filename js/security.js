/**
 * Security: Disable text selection, right-click, and inspect
 */

(function() {
    'use strict';

    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Disable common keyboard shortcuts for inspect
    document.addEventListener('keydown', function(e) {
        // Disable F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+S (Save Page)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
    });

    // Disable text selection (already handled by CSS, but double-check with JS)
    document.addEventListener('selectstart', function(e) {
        // Allow selection in inputs and textareas
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        return false;
    });

    // Disable drag
    document.addEventListener('dragstart', function(e) {
        // Allow dragging in file inputs
        if (e.target.tagName === 'INPUT' && e.target.type === 'file') {
            return true;
        }
        e.preventDefault();
        return false;
    });

    // Console warning (optional, can be bypassed but provides warning)
    console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone\'s account, it is a scam.', 'font-size: 16px;');

})();

