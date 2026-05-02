/**
 * Amusements contact form — powered by EmailJS
 *
 * SETUP INSTRUCTIONS (one-time, free):
 * 1. Create a free account at https://www.emailjs.com
 * 2. Add an Email Service (Gmail or any SMTP) — copy the Service ID
 * 3. Create an Email Template with these variables:
 *      {{from_name}}, {{company}}, {{reply_to}}, {{phone}},
 *      {{service_type}}, {{message}}
 *    Set "To email" to arcade@smartbusinessfusion.com
 *    Copy the Template ID
 * 4. Go to Account → API Keys and copy your Public Key
 * 5. Replace the three placeholder strings below with your real values.
 *
 * That's it — no backend, no server, works on GitHub Pages.
 */

(function () {
    'use strict';

    // ─── REPLACE THESE WITH YOUR EMAILJS VALUES ───────────────────────────────
    var EMAILJS_PUBLIC_KEY  = 'Na9jY20yG14uoTbx-';     // Account → API Keys
    var EMAILJS_SERVICE_ID  = 'smart_admin';             // Email Services tab
    var EMAILJS_TEMPLATE_ID = 'template_smart';          // Email Templates tab
    // ─────────────────────────────────────────────────────────────────────────

    var configured = (
        EMAILJS_PUBLIC_KEY  !== 'YOUR_PUBLIC_KEY'  &&
        EMAILJS_SERVICE_ID  !== 'YOUR_SERVICE_ID'  &&
        EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID'
    );

    function init() {
        var form   = document.getElementById('amusements-contact-form');
        var status = document.getElementById('cf-status');
        var submit = document.getElementById('cf-submit');
        if (!form) return;

        if (!configured) {
            // Don't break the page — just log a dev note
            console.info(
                '[contact-form] EmailJS not yet configured. ' +
                'Open js/contact-form.js and fill in your Public Key, Service ID, and Template ID.'
            );
        }

        if (typeof emailjs !== 'undefined' && configured) {
            emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearStatus(status);

            // Basic client-side validation
            var name    = form.from_name.value.trim();
            var company = form.company.value.trim();
            var email   = form.reply_to.value.trim();
            var service = form.service_type.value;

            if (!name || !company || !email || !service) {
                showStatus(status, 'error', 'Please fill in all required fields.');
                return;
            }

            if (!isValidEmail(email)) {
                showStatus(status, 'error', 'Please enter a valid email address.');
                return;
            }

            if (!configured || typeof emailjs === 'undefined') {
                showStatus(status, 'error',
                    'Contact form is not yet configured. Please email us directly at ' +
                    'arcade@smartbusinessfusion.com');
                return;
            }

            submit.disabled = true;
            submit.textContent = 'Sending…';

            emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
                .then(function () {
                    showStatus(status, 'success',
                        'Message sent! We'll get back to you within one business day.');
                    form.reset();
                    submit.disabled = false;
                    submit.textContent = 'Send Message';
                })
                .catch(function (err) {
                    console.error('[EmailJS]', err);
                    showStatus(status, 'error',
                        'Something went wrong. Please email us directly at arcade@smartbusinessfusion.com');
                    submit.disabled = false;
                    submit.textContent = 'Send Message';
                });
        });
    }

    function showStatus(el, type, msg) {
        el.className = 'form-status ' + type;
        el.textContent = msg;
    }

    function clearStatus(el) {
        el.className = 'form-status';
        el.textContent = '';
    }

    function isValidEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
