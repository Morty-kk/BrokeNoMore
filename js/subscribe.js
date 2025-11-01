// Attach handler to signup form (works with async includes)
(function () {
  function attach() {
    const form = document.querySelector('#signup-form');
    if (!form) return false;

    const statusEl = document.querySelector('#signup-status');
    const setStatus = (text, color) => {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.style.color = color || 'inherit';
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('Sende...', '#666');

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name') || null,
        email: (formData.get('email') || '').toString().trim(),
      };

      if (!payload.email) {
        setStatus('Bitte E‑Mail angeben.', '#b00020');
        return;
      }

      try {
        const resp = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (resp.ok) {
          setStatus('Danke! Du bist eingetragen. ✅', '#0b7');
          form.reset();
        } else {
          const data = await resp.json().catch(() => ({}));
          const msg = data && data.error ? data.error : 'Fehler beim Senden';
          setStatus(msg, '#b00020');
        }
      } catch (err) {
        setStatus('Netzwerkfehler. Bitte später erneut.', '#b00020');
      }
    });
    return true;
  }

  // Try immediately (in case component already present)
  if (attach()) return;

  // Observe for dynamically included content
  const observer = new MutationObserver(() => {
    if (attach()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

