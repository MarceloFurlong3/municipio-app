// ══════════════════════════════════════════════════════════════════════════════
// shared.js — Utilidades globales Municipio App
// ══════════════════════════════════════════════════════════════════════════════

const APPS_SCRIPT_URL = 'AKfycbyGempAViZqIN_ZSgv6BKjCLuKCcbHTFCGGQH7yCOuymQZFgxpoczFNjqX-lykYUWmL';
const _BASE_URL = `https://script.google.com/macros/s/${APPS_SCRIPT_URL}/exec`;

export async function apiFetch(action, params = {}) {
  const q = new URLSearchParams({ action, ...params }).toString();
  const r = await fetch(`${_BASE_URL}?${q}`);
  return r.json();
}

export async function apiPost(body) {
  const r = await fetch(_BASE_URL, {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify(body)
  });
  return r.json();
}

export function toast(msg, tipo = 'ok') {
  let t = document.getElementById('muni-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'muni-toast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:10px;font-family:sans-serif;font-size:13px;font-weight:700;z-index:9999;transition:opacity .3s;pointer-events:none';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = tipo === 'ok' ? '#16a34a' : '#dc2626';
  t.style.color = '#fff';
  t.style.opacity = '1';
  clearTimeout(t._to);
  t._to = setTimeout(() => t.style.opacity = '0', 2800);
}

export function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export function fmtFecha(s) {
  if (!s) return '—';
  return s;
}
