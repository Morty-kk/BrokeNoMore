const statusEl = document.getElementById('admin-status');
// Kurz: Admin‑Frontend: lädt Kontakte/Zahlungen und füllt Tabellen (nur lokal).
const contactsBody = document.getElementById('contacts-body');
const paymentsBody = document.getElementById('payments-body');

const setStatus = (text, isError = false) => {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = isError ? '#b42318' : '';
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('de-DE');
  } catch {
    return value;
  }
};

const fillTable = (tbody, rows, renderRow, emptyText) => {
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.className = 'muted';
    td.style.padding = '.5rem 0';
    td.textContent = emptyText;
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  rows.forEach((row) => tbody.appendChild(renderRow(row)));
};

const renderContactRow = (contact) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding:.5rem 0;vertical-align:top">${formatDate(contact.createdAt)}</td>
    <td style="padding:.5rem 0;vertical-align:top">${contact.name || '-'}</td>
    <td style="padding:.5rem 0;vertical-align:top">${contact.email || '-'}</td>
    <td style="padding:.5rem 0;vertical-align:top">${contact.message || '-'}</td>
  `;
  return tr;
};

const renderPaymentRow = (payment) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding:.5rem 0;vertical-align:top">${formatDate(payment.createdAt)}</td>
    <td style="padding:.5rem 0;vertical-align:top">${payment.holderName || '-'}</td>
    <td style="padding:.5rem 0;vertical-align:top">${payment.last4 || '-'}</td>
    <td style="padding:.5rem 0;vertical-align:top">${payment.expMonth || '--'}/${payment.expYear || '--'}</td>
  `;
  return tr;
};

const loadData = async () => {
  setStatus('Lade Daten …');

  try {
    const apiBase = window.API_CONFIG?.baseURL || '';
    const [contactsRes, paymentsRes] = await Promise.all([
      fetch(`${apiBase}/api/contacts`),
      fetch(`${apiBase}/api/payments`),
    ]);

    if (!contactsRes.ok) {
      const err = await contactsRes.json().catch(() => ({}));
      throw new Error(err.error || 'Kontakte konnten nicht geladen werden.');
    }

    if (!paymentsRes.ok) {
      const err = await paymentsRes.json().catch(() => ({}));
      throw new Error(err.error || 'Zahlungen konnten nicht geladen werden.');
    }

    const contactsData = await contactsRes.json();
    const paymentsData = await paymentsRes.json();

    fillTable(contactsBody, contactsData.contacts, renderContactRow, 'Keine Kontakte vorhanden.');
    fillTable(paymentsBody, paymentsData.payments, renderPaymentRow, 'Keine Zahlungen vorhanden.');

    setStatus('Daten geladen.');
  } catch (error) {
    setStatus(error.message || 'Fehler beim Laden.', true);
  }
};

const init = () => {
  loadData();
};

document.addEventListener('DOMContentLoaded', init);
