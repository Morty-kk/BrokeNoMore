const THEME_STORAGE_KEY = "bnm-theme";
const USER_STORAGE_KEY = "bnm-user";
const PLAN_STORAGE_KEY = "bnm-plan";

function getStoredUser() {
    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setStoredUser(user) {
    try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
        // ignore
    }
    updateHeaderUser();
}

function updateHeaderUser() {
    const slot = document.querySelector('[data-user-slot]');
    if (!slot) return;
    const user = getStoredUser();
    const headerCtas = document.querySelector('.header-ctas');
    if (!user) {
        slot.innerHTML = '';
        if (headerCtas) headerCtas.style.display = '';
        updateAuthUI();
        return;
    }

    const seed = encodeURIComponent(user.avatarSeed || user.email || user.name || 'user');
    const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
    slot.innerHTML = `
        <button type="button" data-profile-open aria-label="Profil öffnen" style="background:none;border:none;padding:0;cursor:pointer;display:inline-flex;">
            <img src="${avatarUrl}" alt="Profil" style="width:36px;height:36px;border-radius:999px;border:2px solid rgba(255,255,255,.35);object-fit:cover;">
        </button>
    `;

    if (headerCtas) headerCtas.style.display = 'none';
    updateAuthUI();
}

function updateAuthUI() {
    const user = getStoredUser();
    const starterBtn = document.querySelector('[data-plan-starter]');
    const primaryCta = document.querySelector('[data-primary-cta]');
    const plusBtn = document.querySelector('[data-plan-id="plus"]');
    const proBtn = document.querySelector('[data-plan-id="pro"]');
    const loginHint = document.querySelector('[data-login-hint]');
    const selectedPlan = getSelectedPlan();

    if (starterBtn) starterBtn.textContent = 'Loslegen';
    if (plusBtn) plusBtn.textContent = user ? 'Upgrade' : 'Jetzt starten';
    if (proBtn) proBtn.textContent = user ? 'Upgrade' : 'Upgrade';

    if (selectedPlan) {
        const btn = document.querySelector(`[data-plan-id="${selectedPlan}"]`);
        if (btn) btn.textContent = 'Ausgewählt';
    } else if (user && starterBtn) {
        starterBtn.textContent = 'Ausgewählt';
    }

    if (primaryCta) primaryCta.style.display = '';
    if (loginHint) loginHint.style.display = user ? 'none' : '';
}

function getSelectedPlan() {
    try {
        return localStorage.getItem(PLAN_STORAGE_KEY) || '';
    } catch {
        return '';
    }
}

function setSelectedPlan(planId) {
    try {
        if (planId) localStorage.setItem(PLAN_STORAGE_KEY, planId);
        else localStorage.removeItem(PLAN_STORAGE_KEY);
    } catch {
        // ignore
    }
    updateAuthUI();
}

function getPreferredTheme() {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "dark" || stored === "light") return stored;
    } catch {
        // ignore
    }

    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function initContactModal() {
    const modal = document.getElementById('contact-modal');
    if (!modal) return;

    const openLinks = Array.from(document.querySelectorAll('a[href="#kontakt"], [data-contact-open]'));
    const closeButtons = modal.querySelectorAll('[data-contact-close]');
    const registerForm = modal.querySelector('[data-register-form]');
    const loginForm = modal.querySelector('[data-login-form]');
    const showButtons = modal.querySelectorAll('[data-auth-show]');

    let lastActive = null;

    const openModal = () => {
        lastActive = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        const firstInput = modal.querySelector('.contact-form__input');
        if (firstInput) firstInput.focus();

        if (registerForm) {
            registerForm.style.display = '';
            registerForm.removeAttribute('aria-hidden');
            registerForm.querySelector('.contact-form__input')?.focus();
        }
        if (loginForm) {
            loginForm.style.display = 'none';
            loginForm.setAttribute('aria-hidden', 'true');
        }
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastActive && typeof lastActive.focus === 'function') lastActive.focus();
    };

    openLinks.forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    closeButtons.forEach((btn) => btn.addEventListener('click', closeModal));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    const backdrop = modal.querySelector('.contact-modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);

    showButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const which = btn.getAttribute('data-auth-show');
            if (which === 'register') {
                if (registerForm) { registerForm.style.display = ''; registerForm.removeAttribute('aria-hidden'); registerForm.querySelector('.contact-form__input')?.focus(); }
                if (loginForm) { loginForm.style.display = 'none'; loginForm.setAttribute('aria-hidden', 'true'); }
            } else {
                if (loginForm) { loginForm.style.display = ''; loginForm.removeAttribute('aria-hidden'); loginForm.querySelector('.contact-form__input')?.focus(); }
                if (registerForm) { registerForm.style.display = 'none'; registerForm.setAttribute('aria-hidden', 'true'); }
            }
        });
    });

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = (registerForm.querySelector('[name="name"]') || {}).value || '';
            const email = (registerForm.querySelector('[name="email"]') || {}).value || '';
            const password = (registerForm.querySelector('[name="password"]') || {}).value || '';

            if (!name || !email || !password) {
                alert('Bitte alle Felder ausfüllen.');
                return;
            }

            try {
                const apiBase = window.API_CONFIG?.baseURL || '';
                const res = await fetch(`${apiBase}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
                });

                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    const avatarSeed = Math.random().toString(36).slice(2, 10);
                    setStoredUser({ ...data.user, avatarSeed });
                    registerForm.reset();
                    closeModal();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert('Fehler: ' + (err.error || 'Registrierung fehlgeschlagen.'));
                }
            } catch (err) {
                console.error(err);
                alert('Registrierung fehlgeschlagen.');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = (loginForm.querySelector('[name="email"]') || {}).value || '';
            const password = (loginForm.querySelector('[name="password"]') || {}).value || '';

            if (!email || !password) {
                alert('Bitte alle Felder ausfüllen.');
                return;
            }

            try {
                const apiBase = window.API_CONFIG?.baseURL || '';
                const res = await fetch(`${apiBase}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim(), password })
                });

                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    const existing = getStoredUser();
                    const avatarSeed = existing && existing.email === data.user.email ? existing.avatarSeed : Math.random().toString(36).slice(2, 10);
                    setStoredUser({ ...data.user, avatarSeed });
                    loginForm.reset();
                    closeModal();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert('Fehler: ' + (err.error || 'Login fehlgeschlagen.'));
                }
            } catch (err) {
                console.error(err);
                alert('Login fehlgeschlagen.');
            }
        });
    }
}

function initProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    const closeButtons = modal.querySelectorAll('[data-profile-close]');
    const logoutBtn = modal.querySelector('[data-profile-logout]');

    let lastActive = null;

    const openModal = () => {
        lastActive = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastActive && typeof lastActive.focus === 'function') lastActive.focus();
    };

    document.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('[data-profile-open]');
        if (!btn) return;
        e.preventDefault();
        openModal();
    });

    closeButtons.forEach((btn) => btn.addEventListener('click', closeModal));
    const backdrop = modal.querySelector('.profile-modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            try { localStorage.removeItem(USER_STORAGE_KEY); } catch {}
            updateHeaderUser();
            closeModal();
        });
    }
}

function initRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (!modal) return;

    const openButtons = Array.from(document.querySelectorAll('[data-register-open]'));
    const closeButtons = modal.querySelectorAll('[data-register-close]');
    const showButtons = modal.querySelectorAll('[data-auth-show]');
    const registerForm = modal.querySelector('[data-register-form]');
    const loginForm = modal.querySelector('[data-login-form]');

    let lastActive = null;

    const openModal = (mode) => {
        lastActive = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        if (registerForm) { registerForm.style.display = 'none'; registerForm.setAttribute('aria-hidden', 'true'); }
        if (loginForm) { loginForm.style.display = 'none'; loginForm.setAttribute('aria-hidden', 'true'); }

        if (mode === 'login' && loginForm) {
            loginForm.style.display = '';
            loginForm.removeAttribute('aria-hidden');
            loginForm.querySelector('.contact-form__input')?.focus();
        } else if (mode === 'register' && registerForm) {
            registerForm.style.display = '';
            registerForm.removeAttribute('aria-hidden');
            registerForm.querySelector('.contact-form__input')?.focus();
        }
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastActive && typeof lastActive.focus === 'function') lastActive.focus();
    };

    openButtons.forEach((btn) => btn.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = btn.getAttribute('data-auth-show');
        openModal(mode || undefined);
    }));
    closeButtons.forEach((btn) => btn.addEventListener('click', closeModal));

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

    const backdrop = modal.querySelector('.register-modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);

    showButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const which = btn.getAttribute('data-auth-show');
            if (which === 'register') {
                if (registerForm) { registerForm.style.display = ''; registerForm.removeAttribute('aria-hidden'); registerForm.querySelector('.contact-form__input')?.focus(); }
                if (loginForm) { loginForm.style.display = 'none'; loginForm.setAttribute('aria-hidden', 'true'); }
            } else {
                if (loginForm) { loginForm.style.display = ''; loginForm.removeAttribute('aria-hidden'); loginForm.querySelector('.contact-form__input')?.focus(); }
                if (registerForm) { registerForm.style.display = 'none'; registerForm.setAttribute('aria-hidden', 'true'); }
            }
        });
    });

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = (registerForm.querySelector('[name="name"]') || {}).value || '';
            const email = (registerForm.querySelector('[name="email"]') || {}).value || '';
            const password = (registerForm.querySelector('[name="password"]') || {}).value || '';

            if (!name || !email || !password) {
                alert('Bitte alle Felder ausfüllen.');
                return;
            }

            try {
                const apiBase = window.API_CONFIG?.baseURL || '';
                const res = await fetch(`${apiBase}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
                });

                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    const avatarSeed = Math.random().toString(36).slice(2, 10);
                    setStoredUser({ ...data.user, avatarSeed });
                    alert('Registrierung erfolgreich.');
                    registerForm.reset();
                    closeModal();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert('Fehler: ' + (err.error || 'Registrierung fehlgeschlagen.'));
                }
            } catch (err) {
                console.error(err);
                alert('Registrierung fehlgeschlagen.');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = (loginForm.querySelector('[name="email"]') || {}).value || '';
            const password = (loginForm.querySelector('[name="password"]') || {}).value || '';

            if (!email || !password) {
                alert('Bitte alle Felder ausfüllen.');
                return;
            }

            try {
                const apiBase = window.API_CONFIG?.baseURL || '';
                const res = await fetch(`${apiBase}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim(), password })
                });

                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    const existing = getStoredUser();
                    const avatarSeed = existing && existing.email === data.user.email ? existing.avatarSeed : Math.random().toString(36).slice(2, 10);
                    setStoredUser({ ...data.user, avatarSeed });
                    alert('Login erfolgreich.');
                    loginForm.reset();
                    closeModal();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert('Fehler: ' + (err.error || 'Login fehlgeschlagen.'));
                }
            } catch (err) {
                console.error(err);
                alert('Login fehlgeschlagen.');
            }
        });
    }
}

function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("theme-dark", isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
}

// Apply as early as possible to reduce theme flash
applyTheme(getPreferredTheme());

function initThemeToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    const iconEl = btn.querySelector(".theme-toggle__icon");
    const labelEl = btn.querySelector(".theme-toggle__label");

    const moonSvg =
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M21 13.4A8.5 8.5 0 0 1 10.6 3.2a.75.75 0 0 0-1.05-.9A9.5 9.5 0 1 0 21.9 14.45a.75.75 0 0 0-.9-1.05Z"/></svg>';
    const sunSvg =
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></g></svg>';

    const render = () => {
        const isDark = document.documentElement.classList.contains("theme-dark");

        // Match screenshot behavior: show the *target* theme on the button
        const nextTheme = isDark ? "light" : "dark";
        btn.dataset.nextTheme = nextTheme;

        btn.setAttribute("aria-pressed", isDark ? "true" : "false");
        btn.setAttribute(
            "aria-label",
            nextTheme === "dark" ? "Zu Dark wechseln" : "Zu Light wechseln"
        );

        if (labelEl) labelEl.textContent = nextTheme === "dark" ? "Dark" : "Light";
        if (iconEl) iconEl.innerHTML = nextTheme === "dark" ? moonSvg : sunSvg;
    };

    render();

    btn.addEventListener("click", () => {
        const isDark = document.documentElement.classList.contains("theme-dark");
        const next = isDark ? "light" : "dark";
        applyTheme(next);

        try {
            localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            // ignore
        }

        render();
        if (typeof window.__setHeaderSpace === "function") {
            window.__setHeaderSpace();
        }
    });

    // If user didn't explicitly choose, follow system changes
    const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const onSystemChange = () => {
        let hasStored = false;
        try {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            hasStored = stored === "dark" || stored === "light";
        } catch {
            hasStored = false;
        }
        if (hasStored) return;
        applyTheme(mq && mq.matches ? "dark" : "light");
        render();
    };

    if (mq && typeof mq.addEventListener === "function") {
        mq.addEventListener("change", onSystemChange);
    } else if (mq && typeof mq.addListener === "function") {
        mq.addListener(onSystemChange);
    }
}

function initScrollHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const threshold = 48;
    let ticking = false;

    const update = () => {
        const scrolled = window.scrollY > threshold;
        header.classList.toggle("is-scrolled", scrolled);
        if (typeof window.__setHeaderSpace === "function") {
            window.__setHeaderSpace();
        }
        ticking = false;
    };

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
}

function initHeaderSpacer() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const setSpace = () => {
        const rect = header.getBoundingClientRect();
        const top = parseFloat(getComputedStyle(header).top || "0") || 0;
        const space = Math.ceil(rect.height + top + 18);
        document.documentElement.style.setProperty("--header-space", `${space}px`);
    };

    window.__setHeaderSpace = setSpace;

    setSpace();
    window.addEventListener("resize", setSpace);
}

function initHeroMoneyManLoop() {
    const obj = document.getElementById("hero-moneyman");
    if (!obj || obj.tagName.toLowerCase() !== "object") return;

    const host = obj.closest(".hero") || obj;
    let isIntersecting = true;
    let isPageVisible = !document.hidden;

    const getPlayer = () => {
        try {
            const doc = obj.contentDocument;
            if (!doc) return null;

            const svg = doc.querySelector("svg");
            if (!svg) return null;

            const player = svg.__svgatorPlayer || svg._svgatorPlayer || svg.svgatorPlayer;
            return player || null;
        } catch {
            return null;
        }
    };

    const ensureInfiniteLoop = (player) => {
        if (!player) return;

        // Ensure infinite looping.
        if (player.settings && typeof player.settings === "object") {
            player.settings.iterations = 0;
        }
        if (player._settings && typeof player._settings === "object") {
            player._settings.iterations = 0;
        }
        if ("iterations" in player) {
            try {
                player.iterations = 0;
            } catch {
                // ignore
            }
        }
    };

    const applyPlaybackState = () => {
        const player = getPlayer();
        if (!player) return;

        try {
            ensureInfiniteLoop(player);

            const shouldPlay = isPageVisible && isIntersecting;
            if (!shouldPlay) {
                if (typeof player.pause === "function") player.pause();
                return;
            }

            // Start/resume playback.
            if (typeof player.reachedToEnd === "function" && player.reachedToEnd()) {
                if (typeof player.restart === "function") player.restart();
            }

            if (typeof player.play === "function") player.play();
        } catch (err) {
            console.warn("MoneyMan init failed:", err);
        }
    };

    // `load` may have already fired (cache). Run once now and also on load.
    obj.addEventListener("load", applyPlaybackState, { once: true });
    applyPlaybackState();

    // Pause/resume when hero leaves/enters the viewport.
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
            (entries) => {
                const entry = entries && entries[0];
                isIntersecting = !!entry && entry.isIntersecting;
                applyPlaybackState();
            },
            { threshold: 0.15, rootMargin: "100px 0px 100px 0px" }
        );
        io.observe(host);
    }

    // Pause when tab is hidden; resume when visible.
    document.addEventListener("visibilitychange", () => {
        isPageVisible = !document.hidden;
        applyPlaybackState();
    });
}

function initEstimator() {
    const section = document.querySelector("[data-estimator]");
    if (!section) return;

    // Kurz: Siteweit eingesetzte Interaktionen, Includes und API‑Aufrufe.
    // Enthält u.a. Formular-Handling und Fetch-Requests an /api/*
    const incomeInput = section.querySelector("[data-estimator-income]");
    const expensesInput = section.querySelector("[data-estimator-expenses]");
    const targetInput = section.querySelector("[data-estimator-target]");
    const savingsDisplay = section.querySelector("[data-estimator-savings]");
    const rateDisplay = section.querySelector("[data-estimator-rate]");
    const targetDisplay = section.querySelector("[data-estimator-target-display]");
    const resultBox = section.querySelector("[data-estimator-result]");
    const hintEl = section.querySelector("[data-estimator-hint]");
    const resetBtn = section.querySelector("[data-estimator-reset]");
    const calcBtn = section.querySelector("[data-estimator-calc]");

    const formatter = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

    const parseValue = (value) => {
        if (value === undefined || value === null || value === "") return 0;
        const raw = String(value).trim();
        if (!raw) return 0;
        const cleaned = raw.replace(/[^0-9,.-]/g, "");
        const normalized = cleaned
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".");
        const num = Number(normalized);
        return Number.isFinite(num) ? num : 0;
    };

    const formatNumber = (num) => formatter.format(Math.abs(num));
    const formatSigned = (num) => (num < 0 ? "−" : "") + formatNumber(num);

    // expose small number helpers for other page scripts
    window.utils = window.utils || {};
    window.utils.parseGermanNumber = parseValue;
    window.utils.formatGerman = (n) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €';

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const update = () => {
        const income = parseValue(incomeInput && incomeInput.value);
        const expenses = parseValue(expensesInput && expensesInput.value);
        const rawTarget = parseValue(targetInput && targetInput.value);
        const target = clamp(rawTarget, 0, 60);

        if (targetInput && String(targetInput.value) !== String(target)) {
            targetInput.value = String(target);
        }

        const savings = income - expenses;
        const rate = income > 0 ? (savings / income) * 100 : 0;
        const targetAmount = income * (target / 100);

        if (savingsDisplay) savingsDisplay.textContent = `${formatSigned(savings)} €`;

        if (rateDisplay) {
            if (income <= 0) {
                rateDisplay.textContent = "0 % Sparquote vom Einkommen";
            } else if (savings < 0) {
                rateDisplay.textContent = "Über Budget";
            } else {
                rateDisplay.textContent = `${Math.round(rate)} % Sparquote vom Einkommen`;
            }
        }

        if (targetDisplay) {
            targetDisplay.textContent = `${Math.round(target)} % Zielbetrag: ${formatNumber(targetAmount)} €`;
        }

        if (resultBox) {
            resultBox.classList.toggle("is-negative", savings < 0);
        }

        if (hintEl) {
            hintEl.classList.remove("estimator-result__hint--success", "estimator-result__hint--warning");

            if (income <= 0) {
                hintEl.textContent = "Gib zuerst dein Einkommen an, dann zeigen wir dir eine Empfehlung.";
                hintEl.classList.add("estimator-result__hint--warning");
            } else if (savings < 0) {
                hintEl.textContent = "Achtung: Deine Ausgaben liegen über dem Einkommen – Ziel aktuell nicht möglich.";
                hintEl.classList.add("estimator-result__hint--warning");
            } else if (savings < targetAmount) {
                const diff = targetAmount - savings;
                hintEl.textContent = `Ziel wird knapp: Dir fehlen ${formatNumber(diff)} € pro Monat.`;
                hintEl.classList.add("estimator-result__hint--warning");
            } else {
                hintEl.textContent = `Passt! Du kannst monatlich ${formatNumber(targetAmount)} € sparen.`;
                hintEl.classList.add("estimator-result__hint--success");
            }
        }
    };

    if (calcBtn) {
        calcBtn.addEventListener("click", update);
    }

    [incomeInput, expensesInput, targetInput].forEach((input) => {
        if (!input) return;
        input.addEventListener("input", update);
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (incomeInput) incomeInput.value = "";
            if (expensesInput) expensesInput.value = "";
            if (targetInput) targetInput.value = "";
            update();
        });
    }

    update();
}

function initChatbot() {
    const chatbotButton = document.getElementById("chatbot-button");
    const chatbotContainer = document.getElementById("chatbot-container");

    if (!chatbotButton || !chatbotContainer) return;

    chatbotButton.addEventListener("mouseover", () => {
        chatbotButton.style.transform = "scale(1.2)";
    });

    chatbotButton.addEventListener("mouseout", () => {
        chatbotButton.style.transform = "scale(1)";
    });

    // Öffnen/Schließen verwalten und Klicks außerhalb behandeln
    let __outsideClickHandler = null;

    function openChat() {
        chatbotContainer.style.display = "flex";
        try {
            document.body.classList.add("chatbot-open");
        } catch {}

        // Kontaktformular beim Öffnen rendern
        const messages = document.getElementById("chatbot-messages");
        if (messages) renderContactForm(messages);

        // close when clicking outside the chat container or the button
        __outsideClickHandler = (e) => {
            if (!chatbotContainer.contains(e.target) && !chatbotButton.contains(e.target)) {
                closeChat();
            }
        };
        // Nach kurzem Tick anhängen, damit der Öffnen‑Klick es nicht auslöst
        setTimeout(() => document.addEventListener("click", __outsideClickHandler));
    }

    function closeChat() {
        chatbotContainer.style.display = "none";
        try {
            document.body.classList.remove("chatbot-open");
        } catch {}
        if (__outsideClickHandler) {
            document.removeEventListener("click", __outsideClickHandler);
            __outsideClickHandler = null;
        }
    }

    // prevent clicks inside the container from bubbling out
    chatbotContainer.addEventListener("click", (e) => e.stopPropagation());

    chatbotButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isClosed = chatbotContainer.style.display === "none" || !chatbotContainer.style.display;
        if (isClosed) openChat(); else closeChat();
    });

    const chatbotOptions = [
        { label: "Hallo", response: "Hallo! Wie kann ich Ihnen helfen?" },
        { label: "Hilfe", response: "Natürlich! Was benötigen Sie?" },
        { label: "Preis", response: "Unsere Preise finden Sie auf der Preisseite." },
        { label: "Team", response: "Unser Team besteht aus Experten in verschiedenen Bereichen." },
        {
            label: "Kontakt",
            response:
                "Wir sind derzeit geschlossen. Bitte geben Sie Ihre Kontaktdaten ein, damit wir uns per E-Mail bei Ihnen melden können.",
        },
    ];

    function renderChatbotOptions() {
        const messages = document.getElementById("chatbot-messages");
        if (!messages) return;

        const optionsContainer = document.createElement("div");
        optionsContainer.className = "chatbot-options";

        chatbotOptions.forEach((option) => {
            const button = document.createElement("button");
            button.textContent = option.label;
            button.className = "chatbot-option";

            button.addEventListener("click", () => {
                const userBubble = document.createElement("div");
                userBubble.textContent = option.label;
                userBubble.className = "chatbot-bubble chatbot-bubble--user";
                messages.appendChild(userBubble);

                const botBubble = document.createElement("div");
                botBubble.textContent = option.response;
                botBubble.className = "chatbot-bubble chatbot-bubble--bot";
                messages.appendChild(botBubble);
                messages.scrollTop = messages.scrollHeight;

                if (option.label === "Kontakt") {
                    renderContactForm(messages);
                }
            });

            optionsContainer.appendChild(button);
        });

        // Insert options between header and messages so they stay pinned
        const chatbotContainer = document.getElementById("chatbot-container");
        if (chatbotContainer) {
            chatbotContainer.insertBefore(optionsContainer, messages);
        } else {
            messages.appendChild(optionsContainer);
        }
    }

    function renderContactForm(messages) {
        if (messages.querySelector(".chatbot-form")) {
            return;
        }

        const formContainer = document.createElement("div");
        formContainer.className = "chatbot-form";

        const formTitle = document.createElement("div");
        formTitle.textContent = "Kontaktformular";
        formTitle.className = "chatbot-form__title";
        formContainer.appendChild(formTitle);

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Ihr Name";
        nameInput.className = "chatbot-field";
        formContainer.appendChild(nameInput);

        const emailInput = document.createElement("input");
        emailInput.type = "email";
        emailInput.placeholder = "Ihre E-Mail-Adresse";
        emailInput.className = "chatbot-field";
        formContainer.appendChild(emailInput);

        const messageInput = document.createElement("textarea");
        messageInput.placeholder = "Ihre Nachricht";
        messageInput.className = "chatbot-field";
        formContainer.appendChild(messageInput);

        const submitButton = document.createElement("button");
        submitButton.textContent = "Absenden";
        submitButton.className = "chatbot-submit";

        submitButton.addEventListener("click", async () => {
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            if (name && email && message) {
                try {
                    const apiBase = window.API_CONFIG?.baseURL || '';
                    const response = await fetch(`${apiBase}/api/saveContact`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ name, email, message }),
                    });

                    if (response.ok) {
                        // Inline confirmation instead of alert
                        const conf = document.createElement("div");
                        conf.className = "chatbot-bubble chatbot-bubble--bot";
                        conf.textContent = "Nachricht wurde versendet. Bitte warten Sie einen Moment.";
                        messages.appendChild(conf);
                        messages.scrollTop = messages.scrollHeight;
                        formContainer.remove();
                    } else {
                        const errorData = await response.json();
                        const err = document.createElement("div");
                        err.className = "chatbot-bubble chatbot-bubble--bot";
                        err.textContent = `Fehler: ${errorData.error}`;
                        messages.appendChild(err);
                        messages.scrollTop = messages.scrollHeight;
                    }
                } catch (error) {
                    alert(
                        "Es gab ein Problem beim Speichern Ihrer Nachricht. Bitte versuchen Sie es später erneut."
                    );
                    console.error(error);
                }
            } else {
                alert("Bitte füllen Sie alle Felder aus.");
            }
        });

        formContainer.appendChild(submitButton);
        messages.appendChild(formContainer);
        messages.scrollTop = messages.scrollHeight;
    }

    renderChatbotOptions();

    // Wire up send button + Enter key for the main chat input
    const textInput = document.getElementById("chatbot-text");
    const sendBtn = document.getElementById("chatbot-send");
    const messagesEl = document.getElementById("chatbot-messages");

    function sendMessageFromInput() {
        if (!textInput || !messagesEl) return;
        const text = textInput.value.trim();
        if (!text) return;

        const userBubble = document.createElement("div");
        userBubble.textContent = text;
        userBubble.className = "chatbot-bubble chatbot-bubble--user";
        messagesEl.appendChild(userBubble);

        // Temporary confirmation bubble from the system
        const botBubble = document.createElement("div");
        botBubble.textContent = "Nachricht wurde versendet. Bitte warten Sie einen Moment.";
        botBubble.className = "chatbot-bubble chatbot-bubble--bot";
        messagesEl.appendChild(botBubble);

        messagesEl.scrollTop = messagesEl.scrollHeight;
        textInput.value = "";
        textInput.focus();
    }

    if (sendBtn) {
        sendBtn.addEventListener("click", (e) => {
            e.preventDefault();
            sendMessageFromInput();
        });
    }

    if (textInput) {
        textInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                // prevent form submit / newline
                e.preventDefault();
                sendMessageFromInput();
            }
        });
    }
}

function initPaymentModal() {
    const modal = document.getElementById("payment-modal");
    if (!modal) return;

    const planLabel = modal.querySelector("[data-payment-plan-label]");
    const openButtons = document.querySelectorAll("[data-payment-open]");
    const closeButtons = modal.querySelectorAll("[data-payment-close]");
    const form = modal.querySelector(".payment-form");

    let lastActive = null;
    let activePlanId = '';

    const open = (planText, planId) => {
        lastActive = document.activeElement;
        activePlanId = planId || '';
        if (planLabel) planLabel.textContent = `Plan: ${planText || ""}`.trim();
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        const firstInput = modal.querySelector(".payment-form__input");
        if (firstInput) firstInput.focus();
    };

    const close = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        if (lastActive && typeof lastActive.focus === "function") {
            lastActive.focus();
        }
    };

    openButtons.forEach((btn) => {
        btn.addEventListener("click", () => open(btn.dataset.plan, btn.dataset.planId));
    });

    closeButtons.forEach((btn) => {
        btn.addEventListener("click", close);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            close();
        }
    });

    const expiryInput = form ? form.querySelector('[name="cardExpiry"]') : null;
    const numberInput = form ? form.querySelector('[name="cardNumber"]') : null;
    const cvcInput = form ? form.querySelector('[name="cardCvc"], [name="cardCVC"]') : null;
    const nameInput = form ? form.querySelector('[name="cardName"]') : null;

    const formatExpiry = (value) => {
        const digits = (value || '').replace(/\D/g, '').slice(0, 4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    };

    const formatCardNumber = (value) => {
        const digits = (value || '').replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    if (expiryInput) {
        expiryInput.addEventListener('input', () => {
            const formatted = formatExpiry(expiryInput.value);
            expiryInput.value = formatted;
        });
    }

    if (numberInput) {
        numberInput.addEventListener('input', () => {
            const formatted = formatCardNumber(numberInput.value);
            numberInput.value = formatted;
        });
    }

    if (cvcInput) {
        cvcInput.setAttribute('maxlength', '3');
        cvcInput.addEventListener('input', () => {
            const digits = (cvcInput.value || '').replace(/\D/g, '').slice(0, 3);
            cvcInput.value = digits;
        });
    }

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            const cleaned = (nameInput.value || '')
                .replace(/[^A-Za-zÄÖÜäöüß\s'-]/g, '')
                .replace(/\s{2,}/g, ' ');
            nameInput.value = cleaned;
        });
    }

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Collect and mask payment data (do NOT store full card number or CVC)
            const holder = (form.querySelector('[name="cardName"]') || {}).value || "";
            const number = (form.querySelector('[name="cardNumber"]') || {}).value || "";
            const expiry = (form.querySelector('[name="cardExpiry"]') || {}).value || ""; // MM/YY

            // basic validation
            if (!holder || !number || !expiry) {
                alert("Bitte füllen Sie alle Felder korrekt aus.");
                return;
            }

            // Extract last 4 digits and expiry month/year
            const digits = number.replace(/\D/g, "");
            const last4 = digits.slice(-4);
            const parts = expiry.split(/[\/\-\s]/).map((s) => s.trim());
            let month = 0, year = 0;
            if (parts.length >= 2) {
                month = parseInt(parts[0], 10) || 0;
                year = parseInt(parts[1], 10) || 0;
                if (year < 100) year += 2000;
            }

            try {
                const apiBase = window.API_CONFIG?.baseURL || '';
                const res = await fetch(`${apiBase}/api/savePayment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ holderName: holder, last4, expMonth: month, expYear: year })
                });

                if (res.ok) {
                    if (activePlanId) {
                        setSelectedPlan(activePlanId);
                    }
                    form.reset();
                    if (expiryInput) expiryInput.value = '';
                    // Show inline confirmation
                    const messages = document.getElementById('chatbot-messages');
                    if (messages) {
                        const conf = document.createElement('div');
                        conf.className = 'chatbot-bubble chatbot-bubble--bot';
                        conf.textContent = 'Nachricht wurde versendet. Bitte warten Sie einen Moment.';
                        messages.appendChild(conf);
                        messages.scrollTop = messages.scrollHeight;
                    }
                    close();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert('Fehler beim Speichern der Zahlungsdaten: ' + (err.error || res.statusText));
                }
            } catch (e) {
                console.error('Payment save error', e);
                alert('Fehler beim Speichern der Zahlungsdaten. Bitte versuchen Sie es später.');
            }
        });
    }
}

function initPlanButtons() {
    document.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest ? e.target.closest('[data-plan-id]') : null;
        if (!btn) return;

        const user = getStoredUser();
        if (!user) return;

        e.preventDefault();
        e.stopPropagation();

        const planId = btn.getAttribute('data-plan-id') || '';
        if (planId) setSelectedPlan(planId);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const includes = Array.from(document.querySelectorAll("[data-include]"));

    const isLocalhost =
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1" ||
        location.hostname === "::1";

    const isHttp = location.protocol === "http:" || location.protocol === "https:";
    let includeFailures = 0;

    await Promise.all(
        includes.map(async (el) => {
            try {
                const includePath = el.getAttribute("data-include");
                if (!includePath) return;

                const cacheBust = Date.now();
                const separator = includePath.includes("?") ? "&" : "?";
                const url = `${includePath}${separator}v=${cacheBust}`;
                const res = await fetch(url, { cache: isLocalhost ? "no-store" : "default" });
                if (!res.ok) throw new Error(`HTTP ${res.status} while loading ${includePath}`);

                const data = await res.text();
                el.innerHTML = data;
            } catch (err) {
                includeFailures += 1;
                console.error("Include-Fehler:", err);
                const path = el.getAttribute("data-include") || "(unknown)";
                el.innerHTML = `
                    <div style="padding:1rem;border:2px solid rgba(14,42,26,.22);border-radius:16px;background:rgba(255,255,255,.65);">
                        <strong>Komponente konnte nicht geladen werden:</strong> ${path}<br/>
                        <span style="opacity:.8;">Tipp: Seite über <code>http://localhost:5500</code> öffnen und sicherstellen, dass der Server läuft.</span>
                    </div>
                `;
            }
        })
    );

    updateHeaderUser();

    if (!isHttp || includeFailures > 0) {
        const banner = document.createElement("div");
        banner.setAttribute("role", "alert");
        banner.style.cssText =
            "position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;" +
            "padding:12px 14px;border-radius:16px;border:2px solid rgba(14,42,26,.28);" +
            "background:rgba(255,255,255,.85);backdrop-filter:saturate(1.1) blur(6px);" +
            "font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;";

        if (!isHttp) {
            banner.innerHTML =
                `<strong>Hinweis:</strong> Du hast die Seite über <code>${location.protocol}//</code> geöffnet. ` +
                `Die Komponenten-Loader (fetch) funktionieren so oft nicht. Öffne stattdessen <code>http://localhost:5500</code>.`;
        } else {
            banner.innerHTML =
                `<strong>Hinweis:</strong> ${includeFailures} Komponenten konnten nicht geladen werden. ` +
                `Wenn der Bildschirm "weiß" ist: Local-Server auf <code>localhost:5500</code> starten.`;
        }

        document.body.appendChild(banner);
        window.setTimeout(() => banner.remove(), 12000);
    }

    initThemeToggle();
    initHeaderSpacer();
    initScrollHeader();
    initHeroMoneyManLoop();
    initEstimator();
    initChatbot();
    initPaymentModal();
    initPlanButtons();
    initContactModal();
    initRegisterModal();
    initProfileModal();

    // Smooth-scroll anchors with header offset
    function scrollToElementWithHeaderOffset(el) {
        if (!el) return;
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerHeight - 12);
        window.scrollTo({ top, behavior: 'smooth' });
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href') || '';

        // handle same-page anchors like #pricing
        if (href.startsWith('#')) {
            const id = href.slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                scrollToElementWithHeaderOffset(target);
                try { history.replaceState(null, '', href); } catch {}
            }
        } else {
            // links to same page with pathname + hash
            try {
                const url = new URL(href, location.href);
                if (url.pathname === location.pathname && url.hash) {
                    const id = url.hash.slice(1);
                    const target = document.getElementById(id);
                    if (target) {
                        e.preventDefault();
                        scrollToElementWithHeaderOffset(target);
                        try { history.replaceState(null, '', url.hash); } catch {}
                    }
                }
            } catch (err) {
                // ignore invalid URLs
            }
        }
    });

    // Previously: auto-scroll to fragment on page load. This caused pages
    // to jump directly to the footer for some users. Disable automatic
    // scrolling on initial load to avoid unwanted jumps. Anchors still
    // work for user clicks (handled above).
    /*
    if (location.hash) {
        setTimeout(() => {
            const id = location.hash.slice(1);
            const el = document.getElementById(id);
            if (el) scrollToElementWithHeaderOffset(el);
        }, 250);
    }
    */
});
