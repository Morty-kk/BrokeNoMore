// js/subscribe.js

const form = document.querySelector('#subscribe-form');
const errorBox = document.querySelector('#subscribe-error');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('input[name="name"]')?.value || '';
    const email = form.querySelector('input[name="email"]')?.value || '';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        errorBox.textContent = data.error || 'Fehler beim Senden';
        errorBox.style.color = 'red';
        return;
      }

      errorBox.textContent = 'Erfolgreich eingetragen ✅';
      errorBox.style.color = 'lightgreen';
      form.reset();
    } catch (err) {
      console.error(err);
      errorBox.textContent = 'Server nicht erreichbar';
      errorBox.style.color = 'red';
    }
  });
}
