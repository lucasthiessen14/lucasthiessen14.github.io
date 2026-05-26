/*!
    Lucas Thiessen portfolio — site interactions
*/

(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scrollAnimId = null;

    var heroRoles = [
        'Computer Engineering Graduate',
        'Embedded Systems Engineer',
        'Robotics & C++ Developer',
        'Full-Stack Developer'
    ];
    var roleIndex = 0;

    function $(sel, ctx) {
        return (ctx || document).querySelector(sel);
    }

    function $$(sel, ctx) {
        return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
    }

    // --- Smooth scroll (easeInOut, capped duration) ---
    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function scrollToY(targetY) {
        if (prefersReducedMotion) {
            window.scrollTo(0, targetY);
            return;
        }

        if (scrollAnimId) {
            cancelAnimationFrame(scrollAnimId);
        }

        var startY = window.pageYOffset;
        var distance = Math.abs(targetY - startY);
        var duration = Math.min(1100, Math.max(650, distance * 0.5));
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = easeInOutQuad(progress);
            window.scrollTo(0, startY + (targetY - startY) * eased);

            if (progress < 1) {
                scrollAnimId = requestAnimationFrame(step);
            } else {
                scrollAnimId = null;
            }
        }

        scrollAnimId = requestAnimationFrame(step);
    }

    function scrollToSelector(selector) {
        var el = $(selector);
        if (!el) return;
        var navHeight = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 64;
        scrollToY(el.getBoundingClientRect().top + window.pageYOffset - navHeight + 1);
    }

    function initScrollLinks() {
        $$('[data-scroll], .site-nav__link[data-nav], .site-nav__logo').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var href = link.getAttribute('href');
                if (!href || href.charAt(0) !== '#') return;
                e.preventDefault();
                scrollToSelector(href);
                closeNav();
            });
        });
    }

    // --- Mobile nav ---
    function closeNav() {
        var panel = $('#nav-panel');
        var toggle = $('#nav-toggle');
        document.body.classList.remove('nav-open');
        if (panel) panel.classList.remove('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    function initNav() {
        var toggle = $('#nav-toggle');
        var panel = $('#nav-panel');
        if (!toggle || !panel) return;

        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            document.body.classList.toggle('nav-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    // --- Scroll progress + active nav ---
    function initScrollSpy() {
        var progress = $('#scroll-progress');
        var navLinks = $$('.site-nav__link[data-nav]');
        var sections = navLinks.map(function (link) {
            var id = link.getAttribute('href');
            return id ? $(id) : null;
        }).filter(Boolean);

        function onScroll() {
            var scrollTop = window.pageYOffset;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (progress && docHeight > 0) {
                progress.style.width = (scrollTop / docHeight) * 100 + '%';
            }

            var current = null;
            var navOffset = 120;
            sections.forEach(function (section) {
                if (section.offsetTop - navOffset <= scrollTop) {
                    current = section.id;
                }
            });

            navLinks.forEach(function (link) {
                var active = link.getAttribute('href') === '#' + current;
                link.classList.toggle('is-active', active);
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // --- Reveal on scroll ---
    function initReveal() {
        if (prefersReducedMotion) {
            $$('.reveal').forEach(function (el) {
                el.classList.add('is-visible');
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
        );

        $$('.reveal').forEach(function (el) {
            observer.observe(el);
        });
    }

    // --- Hero tagline rotation ---
    function initHeroTagline() {
        var el = $('#hero-role');
        if (!el || prefersReducedMotion || heroRoles.length < 2) return;

        el.style.opacity = '1';
        el.style.transition = 'opacity 0.2s ease';

        setInterval(function () {
            roleIndex = (roleIndex + 1) % heroRoles.length;
            el.style.opacity = '0';
            setTimeout(function () {
                el.textContent = heroRoles[roleIndex];
                el.style.opacity = '1';
            }, 200);
        }, 4000);
    }

    // --- Projects toggle (single button) ---
    function initProjects(ctx) {
        var root = ctx || document;
        var more = root.querySelector('#more-projects') || root.querySelector('.projects__more');
        var toggle = root.querySelector('#projects-toggle') || root.querySelector('.projects__actions .btn');
        if (!more || !toggle || toggle.dataset.bound === 'true') return;

        toggle.dataset.bound = 'true';
        toggle.addEventListener('click', function () {
            var opening = more.hidden;
            more.hidden = !opening;
            toggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
            toggle.textContent = opening ? 'View Less Projects' : 'View More Projects';

            if (opening) {
                $$('.projects__more .reveal', root).forEach(function (el) {
                    el.classList.add('is-visible');
                });
            } else if (!ctx) {
                scrollToSelector('#projects');
            }
        });
    }

    // --- Copy to clipboard ---
    function showToast(message) {
        var toast = $('#toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-shown');
        setTimeout(function () {
            toast.classList.remove('is-shown');
        }, 2200);
    }

    function initCopyButtons(ctx) {
        var root = ctx || document;
        var buttons = root === document
            ? $$('.contact__copy')
            : Array.prototype.slice.call(root.querySelectorAll('.contact__copy'));

        buttons.forEach(function (btn) {
            if (btn.dataset.bound === 'true') return;
            btn.dataset.bound = 'true';
            btn.addEventListener('click', function () {
                var text = btn.getAttribute('data-copy');
                if (!text) return;

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () {
                        showToast('Copied to clipboard');
                    }).catch(fallbackCopy);
                } else {
                    fallbackCopy();
                }

                function fallbackCopy() {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    try {
                        document.execCommand('copy');
                        showToast('Copied to clipboard');
                    } catch (err) {
                        showToast('Copy failed');
                    }
                    document.body.removeChild(ta);
                }
            });
        });
    }

    // --- Contact form (Web3Forms) ---
    function initContactForm(ctx) {
        var root = ctx || document;
        var form = root.querySelector('#contact-form') || root.querySelector('.contact__form');
        if (!form || form.dataset.bound === 'true') return;

        form.dataset.bound = 'true';
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var honeypot = form.querySelector('[name="botcheck"]');
            if (honeypot && honeypot.checked) return;

            var submitBtn = form.querySelector('[type="submit"]');
            var defaultLabel = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';

            var payload = Object.fromEntries(new FormData(form).entries());

            fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(function (res) {
                    return res.json();
                })
                .then(function (data) {
                    if (data.success) {
                        showToast('Message sent — thanks for reaching out!');
                        form.reset();
                    } else {
                        showToast(data.message || 'Could not send message. Please try again.');
                    }
                })
                .catch(function () {
                    showToast('Could not send message. Please try again.');
                })
                .finally(function () {
                    submitBtn.disabled = false;
                    submitBtn.textContent = defaultLabel;
                });
        });
    }

    // --- UI mode (classic / game) ---
    function applyUiMode(mode) {
        document.documentElement.setAttribute('data-ui', mode);
        localStorage.setItem('uiMode', mode);

        var toggle = $('#ui-mode-toggle');
        if (toggle) {
            toggle.setAttribute('aria-pressed', mode === 'game' ? 'true' : 'false');
            toggle.setAttribute('aria-label', mode === 'game' ? 'Switch to classic portfolio' : 'Switch to adventure map');
        }

        document.dispatchEvent(new CustomEvent('ui-mode-change', { detail: { mode: mode } }));
    }

    function initUiMode() {
        var toggle = $('#ui-mode-toggle');
        if (!toggle) return;

        var stored = localStorage.getItem('uiMode');
        var initial = stored === 'game' ? 'game' : 'classic';
        document.documentElement.setAttribute('data-ui', initial);
        toggle.setAttribute('aria-pressed', initial === 'game' ? 'true' : 'false');
        toggle.setAttribute('aria-label', initial === 'game' ? 'Switch to classic portfolio' : 'Switch to adventure map');

        toggle.addEventListener('click', function () {
            var next = document.documentElement.getAttribute('data-ui') === 'game' ? 'classic' : 'game';
            applyUiMode(next);
        });

        if (initial === 'game') {
            document.dispatchEvent(new CustomEvent('ui-mode-change', { detail: { mode: 'game' } }));
        }
    }

    function initPanelHooks(ctx) {
        if (!ctx) return;
        $$('.reveal', ctx).forEach(function (el) {
            el.classList.add('is-visible');
        });
        initProjects(ctx);
        initCopyButtons(ctx);
        initContactForm(ctx);
    }

    window.Portfolio = {
        setUiMode: applyUiMode,
        initPanelHooks: initPanelHooks,
        showToast: showToast
    };

    // --- Footer year + age ---
    function initDates() {
        var y = new Date().getFullYear();
        var ageEl = $('#age');
        var yearEl = $('#copyright-year');
        if (ageEl) ageEl.textContent = y - 2001;
        if (yearEl) yearEl.textContent = y;
    }

    function init() {
        initUiMode();
        initScrollLinks();
        initNav();
        initScrollSpy();
        initReveal();
        initHeroTagline();
        initProjects();
        initCopyButtons();
        initContactForm();
        initDates();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
