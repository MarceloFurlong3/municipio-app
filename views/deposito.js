// ══════════════════════════════════════════════════════════════════════════════
// NK Distribuciones — views/deposito.js
// Vista Depósito: Pedidos Internos cargados + Rechazados PIB
// ══════════════════════════════════════════════════════════════════════════════

import { apiFetch, toast, esc } from '../shared.js';

let pedidosCache   = [];
let rechazadosCache = [];

export async function montarDeposito(contenedor) {
  contenedor.innerHTML = getHTML();
  if (window.lucide) lucide.createIcons();
  bindEventos(contenedor);
  await cargar(contenedor);
}

// ── HTML ──────────────────────────────────────────────────────────────────────
function getHTML() { return `
<style>
.dep-wrap { font-family:'Barlow',sans-serif; background:#f6f8fc; min-height:100%; padding-bottom:80px; }
.dep-inner { max-width:900px; margin:0 auto; }

/* TABS */
.dep-tabs { display:flex; background:#fff; border-bottom:2px solid #e4eaf5; padding:0 16px; position:sticky; top:0; z-index:30; box-shadow:0 1px 4px rgba(15,23,42,.06); }
.dep-tab { flex:1; padding:14px 8px; border:none; background:none; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; color:#64748b; cursor:pointer; border-bottom:3px solid transparent; margin-bottom:-2px; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:6px; }
.dep-tab:hover { color:#0b1b35; }
.dep-tab.activo { color:#0b1b35; border-bottom-color:#0b1b35; }
.dep-tab.rec.activo { color:#dc2626; border-bottom-color:#dc2626; }
.dep-badge { background:#e4eaf5; color:#475569; font-size:10px; font-weight:800; padding:1px 7px; border-radius:20px; }
.dep-tab.activo .dep-badge { background:#0b1b35; color:#fff; }
.dep-tab.rec.activo .dep-badge { background:#dc2626; color:#fff; }

/* CONTENIDO */
.dep-panel { display:none; padding:16px; }
.dep-panel.activo { display:block; }

/* HEADER */
.dep-hdr { background:#fff; border-radius:14px; padding:16px 20px; margin-bottom:14px; border:1px solid #f0f4f9; box-shadow:0 1px 3px rgba(15,23,42,.04); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
.dep-hdr-title { font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:800; color:#0b1b35; }
.dep-hdr-sub { font-size:11px; color:#94a3b8; margin-top:2px; }
.dep-btn-refresh { background:#f1f5f9; border:none; border-radius:10px; padding:9px 14px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; color:#0b1b35; cursor:pointer; display:flex; align-items:center; gap:6px; transition:background .15s; }
.dep-btn-refresh:hover { background:#e4eaf5; }
.dep-btn-refresh svg { width:14px; height:14px; }

/* BUSCADOR */
.dep-search { width:100%; padding:10px 14px; border:1.5px solid #e4eaf5; border-radius:10px; font-family:'Barlow',sans-serif; font-size:13px; background:#fff; outline:none; margin-bottom:14px; }
.dep-search:focus { border-color:#93c5fd; }

/* CARDS */
.dep-cards { display:flex; flex-direction:column; gap:10px; }
.dep-card { background:#fff; border-radius:14px; padding:16px 18px; border:1.5px solid #e4eaf5; box-shadow:0 1px 3px rgba(15,23,42,.04); }
.dep-card.rechazado { border-color:#fca5a5; background:#fff8f8; }
.dep-card-hdr { display:flex; align-items:center; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
.dep-id { font-family:'Barlow Condensed',sans-serif; font-size:17px; font-weight:800; color:#0b1b35; }
.dep-fecha { font-size:11px; color:#94a3b8; margin-left:auto; }
.dep-estado { font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; }
.dep-est-pendiente { background:#fef9c3; color:#a16207; }
.dep-est-rechazado { background:#fecaca; color:#dc2626; }

.dep-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.dep-field { }
.dep-label { font-size:9px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
.dep-val { font-size:12px; font-weight:600; color:#0f172a; }
.dep-val.full { grid-column:1/-1; }
.dep-motivo { margin-top:10px; padding:10px 12px; background:#fef2f2; border-radius:10px; border-left:3px solid #dc2626; font-size:12px; color:#dc2626; font-weight:600; }
.dep-link { color:#2563eb; text-decoration:underline; word-break:break-all; font-weight:600; font-size:12px; }
.dep-link:hover { color:#1d4ed8; }
.dep-resubir { margin-top:12px; padding-top:12px; border-top:1px solid #fecaca; display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
.dep-btn-resubir { display:inline-flex; align-items:center; gap:6px; background:#0b1b35; color:#fff; border:none; border-radius:10px; padding:8px 14px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; cursor:pointer; text-decoration:none; transition:background .15s; }
.dep-btn-resubir:hover { background:#1e3a5f; }
.dep-btn-resubir svg { width:14px; height:14px; }

/* EMPTY */
/* GRUPOS */
.dep-grupo-mes { margin-bottom:20px; }
.dep-grupo-mes-lbl { font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:800; color:#0b1b35; padding:10px 0 6px; border-bottom:2px solid #0b1b35; margin-bottom:12px; }
.dep-grupo-sec { margin-bottom:14px; padding-left:10px; border-left:3px solid #e4eaf5; }
.dep-grupo-sec-lbl { font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
.dep-grupo-ri { margin-bottom:10px; }
.dep-grupo-ri-lbl { font-size:10px; font-weight:800; color:#fff; background:#64748b; display:inline-block; padding:2px 10px; border-radius:20px; margin-bottom:6px; letter-spacing:.5px; }

.dep-empty { text-align:center; padding:60px 20px; color:#94a3b8; font-size:13px; }

/* SPINNER */
.dep-spin { text-align:center; padding:60px; color:#94a3b8; font-size:13px; }

@media(max-width:600px) {
  .dep-grid { grid-template-columns:1fr; }
}
</style>

<div class="dep-wrap">
<div class="dep-inner">

  <div class="dep-tabs">
    <button class="dep-tab activo" id="dep-tab-pedidos">
      <i data-lucide="clipboard-list"></i>
      Mis pedidos <span class="dep-badge" id="dep-badge-ped">0</span>
    </button>
    <button class="dep-tab rec" id="dep-tab-rechazados">
      <i data-lucide="x-circle"></i>
      Rechazados <span class="dep-badge" id="dep-badge-rec">0</span>
    </button>
  </div>

  <!-- PEDIDOS INTERNOS -->
  <div class="dep-panel activo" id="dep-panel-pedidos">
    <div class="dep-hdr">
      <div>
        <div class="dep-hdr-title">Pedidos Internos</div>
        <div class="dep-hdr-sub">Solicitudes cargadas desde el formulario PIB</div>
      </div>
      <button class="dep-btn-refresh" id="dep-refresh">
        <i data-lucide="refresh-cw"></i> Actualizar
      </button>
    </div>
    <input type="search" class="dep-search" id="dep-buscar-ped" placeholder="🔍 Buscar por ID, sección, detalle...">
    <div class="dep-cards" id="dep-cards-ped">
      <div class="dep-spin">⏳ Cargando pedidos...</div>
    </div>
  </div>

  <!-- RECHAZADOS PIB -->
  <div class="dep-panel" id="dep-panel-rec">
    <div class="dep-hdr">
      <div>
        <div class="dep-hdr-title" style="color:#dc2626">Pedidos Rechazados</div>
        <div class="dep-hdr-sub">Solicitudes PIB que fueron rechazadas</div>
      </div>
    </div>
    <input type="search" class="dep-search" id="dep-buscar-rec" placeholder="🔍 Buscar por ID, sección, detalle...">
    <div class="dep-cards" id="dep-cards-rec">
      <div class="dep-spin">⏳ Cargando rechazados...</div>
    </div>
  </div>

</div>
</div>
`; }

// ── EVENTOS ───────────────────────────────────────────────────────────────────
function bindEventos(c) {
  c.querySelector('#dep-tab-pedidos').addEventListener('click', () => switchTab('pedidos', c));
  c.querySelector('#dep-tab-rechazados').addEventListener('click', () => switchTab('rechazados', c));
  c.querySelector('#dep-refresh').addEventListener('click', () => cargar(c, true));
  c.querySelector('#dep-buscar-ped').addEventListener('input', () => renderPedidos(c));
  c.querySelector('#dep-buscar-rec').addEventListener('input', () => renderRechazados(c));
}

function switchTab(tab, c) {
  ['pedidos','rechazados'].forEach(t => {
    c.querySelector(`#dep-tab-${t === 'rechazados' ? 'rechazados' : 'pedidos'}`).classList.toggle('activo', t === tab);
    c.querySelector(`#dep-panel-${t === 'rechazados' ? 'rec' : 'pedidos'}`).classList.toggle('activo', t === tab);
  });
}

// ── CARGA ─────────────────────────────────────────────────────────────────────
async function cargar(c, forzar = false) {
  try {
    const datos = await apiFetch('getDeposito');
    if (datos.error) throw new Error(datos.error);
    pedidosCache    = datos.pedidos    || [];
    rechazadosCache = datos.rechazados || [];
    c.querySelector('#dep-badge-ped').textContent = pedidosCache.length;
    c.querySelector('#dep-badge-rec').textContent = rechazadosCache.length;
    renderPedidos(c);
    renderRechazados(c);
    if (forzar) toast('✅ Actualizado', 'ok');
  } catch(e) {
    toast('❌ Error: ' + e.message, 'err');
    c.querySelector('#dep-cards-ped').innerHTML = `<div class="dep-empty">❌ ${e.message}</div>`;
    c.querySelector('#dep-cards-rec').innerHTML = `<div class="dep-empty">❌ ${e.message}</div>`;
  }
  if (window.lucide) lucide.createIcons();
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function esURL(s) {
  return s && (s.startsWith('http://') || s.startsWith('https://'));
}

function linkOTexto(val, label) {
  if (!val || val === '—') return `<div class="dep-val">—</div>`;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const conLinks = String(val).replace(urlRegex, url => {
    const texto = url.length > 50 ? '🔗 Ver ' + label : '🔗 ' + url;
    return `<a href="${url}" target="_blank" rel="noopener" class="dep-link"
      onclick="verificarLink(event,'${url}')">${texto}</a>`;
  });
  return `<div class="dep-val">${conLinks}</div>`;
}

function esAnioActual(id) {
  // Acepta IDs que terminen en -26 o -2026
  return /-26$/.test(String(id).trim()) || /-2026$/.test(String(id).trim());
}

// Agrupar array por clave
function agrupar(arr, fn) {
  return arr.reduce((acc, item) => {
    const k = fn(item) || 'Sin datos';
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

function mesDesFecha(fecha) {
  if (!fecha) return 'Sin fecha';
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  // formato dd/mm/yyyy o mm/dd/yyyy
  const p = String(fecha).split('/');
  if (p.length === 3) {
    const m = parseInt(p[1]) - 1;
    return (meses[m] || 'Mes ' + p[1]) + ' ' + p[2];
  }
  return fecha;
}

function primeraLetraRI(ri) {
  const s = String(ri || '').trim();
  if (!s) return 'Sin RI';
  // Toma solo la parte de letras iniciales (ej: "UP - 28/01" → "UP", "DEP" → "DEP")
  const match = s.match(/^[A-ZÁÉÍÓÚa-záéíóú]+/);
  return match ? match[0].toUpperCase() : s.charAt(0).toUpperCase();
}

// ── RENDER PEDIDOS ────────────────────────────────────────────────────────────
function renderPedidos(c) {
  const q = (c.querySelector('#dep-buscar-ped').value || '').toLowerCase();
  const lista = pedidosCache.filter(p =>
    esAnioActual(p.id) &&
    `${p.id} ${p.seccion} ${p.detalle} ${p.ri} ${p.vale}`.toLowerCase().includes(q)
  );
  const cont = c.querySelector('#dep-cards-ped');
  if (!lista.length) { cont.innerHTML = '<div class="dep-empty">Sin pedidos de este año</div>'; return; }

  // Agrupar: Mes → Sección → Letra RI
  const porMes = agrupar(lista, p => mesDesFecha(p.fecha));
  let html = '';
  Object.keys(porMes).sort().forEach(mes => {
    html += `<div class="dep-grupo-mes"><div class="dep-grupo-mes-lbl">📅 ${mes}</div>`;
    const porSeccion = agrupar(porMes[mes], p => p.seccion || 'Sin sección');
    Object.keys(porSeccion).sort().forEach(sec => {
      html += `<div class="dep-grupo-sec"><div class="dep-grupo-sec-lbl">🏢 ${sec}</div>`;
      const porRI = agrupar(porSeccion[sec], p => primeraLetraRI(p.ri));
      Object.keys(porRI).sort().forEach(letra => {
        html += `<div class="dep-grupo-ri"><div class="dep-grupo-ri-lbl">RI: ${letra}</div><div class="dep-cards">`;
        porRI[letra].forEach(p => { html += cardPedido(p); });
        html += `</div></div>`;
      });
      html += `</div>`;
    });
    html += `</div>`;
  });
  cont.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function cardPedido(p) {
  return `
    <div class="dep-card">
      <div class="dep-card-hdr">
        <span class="dep-id">${esc(p.id)}</span>
        <span class="dep-estado dep-est-pendiente">Pendiente</span>
        <span class="dep-fecha">${esc(p.fecha)}</span>
      </div>
      <div class="dep-grid">
        <div class="dep-field"><div class="dep-label">RI</div><div class="dep-val">${esc(p.ri||'—')}</div></div>
        <div class="dep-field"><div class="dep-label">N° Vale</div><div class="dep-val">${esc(p.num_vale||'—')}</div></div>
        <div class="dep-field"><div class="dep-label">N° OT</div><div class="dep-val">${esc(p.num_ot||'—')}</div></div>
        <div class="dep-field full"><div class="dep-label">Vale</div>${linkOTexto(p.vale, 'Vale')}</div>
        <div class="dep-field full"><div class="dep-label">Presupuesto</div>${linkOTexto(p.presupuesto, 'Presupuesto')}</div>
        <div class="dep-field full"><div class="dep-label">Detalle del pedido</div><div class="dep-val">${esc(p.detalle||'—')}</div></div>
        ${p.observaciones ? `<div class="dep-field full"><div class="dep-label">Observaciones</div>${linkOTexto(p.observaciones, 'Observaciones')}</div>` : ''}
      </div>
    </div>`;
}

// ── RENDER RECHAZADOS ─────────────────────────────────────────────────────────
function renderRechazados(c) {
  const q = (c.querySelector('#dep-buscar-rec').value || '').toLowerCase();
  const lista = rechazadosCache.filter(p =>
    esAnioActual(p.id) &&
    `${p.id} ${p.oficina} ${p.detalle} ${p.ri}`.toLowerCase().includes(q)
  );
  const cont = c.querySelector('#dep-cards-rec');
  if (!lista.length) { cont.innerHTML = '<div class="dep-empty">Sin rechazados de este año</div>'; return; }

  cont.innerHTML = lista.map(p => `
    <div class="dep-card rechazado">
      <div class="dep-card-hdr">
        <span class="dep-id">${esc(p.id)}</span>
        <span class="dep-estado dep-est-rechazado">Rechazado</span>
        <span class="dep-fecha">${esc(p.fecha)}</span>
      </div>
      <div class="dep-grid">
        <div class="dep-field"><div class="dep-label">Oficina / Sección</div><div class="dep-val">${esc(p.oficina||'—')}</div></div>
        <div class="dep-field"><div class="dep-label">RI</div><div class="dep-val">${esc(p.ri||'—')}</div></div>
        <div class="dep-field full"><div class="dep-label">Vale / Memo</div>${linkOTexto(p.memo_vale, 'Vale')}</div>
        <div class="dep-field full"><div class="dep-label">Presupuesto</div>${linkOTexto(p.presupuesto, 'Presupuesto')}</div>
        <div class="dep-field full"><div class="dep-label">Detalle</div><div class="dep-val">${esc(p.detalle||'—')}</div></div>
        ${p.observaciones ? `<div class="dep-field full"><div class="dep-label">Observaciones (Col N)</div>${linkOTexto(p.observaciones, 'Observaciones')}</div>` : ''}
      </div>
      ${p.motivo ? `<div class="dep-motivo">⚠️ Motivo de rechazo: ${esc(p.motivo === 'Motivo Escrito' ? (p.observaciones || 'Sin detalle') : p.motivo)}</div>` : ''}
      <div class="dep-resubir">
        <span style="font-size:11px;color:#94a3b8;font-weight:600">¿Querés resubir el vale o presupuesto?</span>
        <a href="https://docs.google.com/forms" target="_blank" class="dep-btn-resubir">
          <i data-lucide="upload"></i> Resubir documentación
        </a>
      </div>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

// ── VERIFICAR LINK ────────────────────────────────────────────────────────────
window.verificarLink = async function(e, url) {
  const link = e.currentTarget;
  if (link.dataset.verificado) return;
  link.dataset.verificado = '1';
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors' });
  } catch(err) {
    e.preventDefault();
    link.textContent = '⚠️ Link caído';
    link.style.color = '#dc2626';
    link.style.textDecoration = 'line-through';
    link.style.cursor = 'default';
    link.onclick = null;
  }
};
