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
.dep-inner { max-width:1300px; margin:0 auto; }

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
.dep-card { background:#fff; border-radius:14px; padding:16px 18px; border:1.5px solid #dde3ee; box-shadow:0 2px 6px rgba(15,23,42,.07); }
.dep-card.rechazado { border-color:#fca5a5; background:#fff8f8; }
.dep-card-hdr { display:flex; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
.dep-id { font-family:'Barlow Condensed',sans-serif; font-size:17px; font-weight:800; color:#0b1b35; }
.dep-fecha { font-size:11px; color:#64748b; font-weight:700; margin-left:auto; background:#f1f5f9; padding:2px 8px; border-radius:6px; }
.dep-estado { font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; }
.dep-est-pendiente { background:#fef9c3; color:#a16207; }
.dep-est-iniciado  { background:#dcfce7; color:#15803d; }
.dep-est-aprobado  { background:#bbf7d0; color:#166534; }
.dep-est-fisico    { background:#fed7aa; color:#c2410c; }
.dep-est-rechazado { background:#fecaca; color:#dc2626; }

.dep-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.dep-field { background:#f8fafd; border-radius:8px; padding:8px 10px; }
.dep-label { font-size:10px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px; }
.dep-val { font-size:13px; font-weight:600; color:#0f172a; }
.dep-val.full { grid-column:1/-1; }
.dep-val-clamp { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
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
@media(min-width:900px) {
  .dep-grupo-ri .dep-cards { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .dep-panel { padding:20px 24px; }
  .dep-hdr { margin-bottom:20px; }
}
</style>

<div class="dep-wrap">
<div class="dep-inner">

  <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px 0;gap:12px">
    <div class="dep-tabs" style="border-bottom:none;padding:0;flex:1">
      <button class="dep-tab activo" id="dep-tab-pedidos">
        <i data-lucide="clipboard-list"></i>
        Mis pedidos <span class="dep-badge" id="dep-badge-ped">0</span>
      </button>
      <button class="dep-tab rec" id="dep-tab-rechazados">
        <i data-lucide="x-circle"></i>
        Rechazados <span class="dep-badge" id="dep-badge-rec">0</span>
      </button>
    </div>
    <select class="dep-search" id="dep-filtro-mes" style="margin-bottom:0;padding:8px 12px;font-weight:700;color:#0b1b35;border-color:#0b1b35;flex:0 0 auto">
      <option value="">Todos los meses</option>
    </select>
  </div>
  <div style="border-bottom:2px solid #e4eaf5;margin:0 16px"></div>

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
    <div style="display:grid;grid-template-columns:1fr repeat(3,auto);gap:8px;margin-bottom:14px;align-items:center">
      <input type="search" class="dep-search" id="dep-buscar-ped" placeholder="🔍 Buscar por ID, RI, detalle..." style="margin-bottom:0">
      <select class="dep-search" id="dep-filtro-estado" style="margin-bottom:0;padding:10px 10px;white-space:nowrap">
        <option value="">Todos los estados</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Iniciado">Iniciado</option>
        <option value="aprobado">Aprobado</option>
        <option value="pase a fisico">Pase a Físico</option>
      </select>
      <select class="dep-search" id="dep-filtro-seccion" style="margin-bottom:0;padding:10px 10px;max-width:200px">
        <option value="">Todas las secciones</option>
      </select>
      <select class="dep-search" id="dep-filtro-letra" style="margin-bottom:0;padding:10px 10px">
        <option value="">Todas las letras RI</option>
      </select>
    </div>
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
  c.querySelector('#dep-filtro-estado').addEventListener('change', () => renderPedidos(c));
  c.querySelector('#dep-filtro-seccion').addEventListener('change', () => renderPedidos(c));
  c.querySelector('#dep-filtro-letra').addEventListener('change', () => renderPedidos(c));
  c.querySelector('#dep-filtro-mes').addEventListener('change', () => { renderPedidos(c); renderRechazados(c); });
  c.querySelector('#dep-buscar-rec').addEventListener('input', () => renderRechazados(c));
}

function switchTab(tab, c) {
  ['pedidos','rechazados'].forEach(t => {
    c.querySelector(`#dep-tab-${t === 'rechazados' ? 'rechazados' : 'pedidos'}`).classList.toggle('activo', t === tab);
    c.querySelector(`#dep-panel-${t === 'rechazados' ? 'rec' : 'pedidos'}`).classList.toggle('activo', t === tab);
  });
}

const CACHE_KEY = 'dep-cache';
const CACHE_TTL = 60 * 1000; // 60 segundos

// ── CARGA ─────────────────────────────────────────────────────────────────────
async function cargar(c, forzar = false) {
  // Mostrar datos cacheados inmediatamente si existen y no es refresh forzado
  if (!forzar) {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const { ts, datos } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL) {
          pedidosCache    = datos.pedidos    || [];
          rechazadosCache = datos.rechazados || [];
          c.querySelector('#dep-badge-ped').textContent = pedidosCache.length;
          c.querySelector('#dep-badge-rec').textContent = rechazadosCache.length;
          poblarFiltros(c);
          renderPedidos(c);
          renderRechazados(c);
          if (window.lucide) lucide.createIcons();
          return; // datos frescos, no hace falta ir a GAS
        }
      }
    } catch(_) {}
  }

  try {
    const datos = await apiFetch('getDeposito');
    if (datos.error) throw new Error(datos.error);
    pedidosCache    = datos.pedidos    || [];
    rechazadosCache = datos.rechazados || [];
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), datos }));
    c.querySelector('#dep-badge-ped').textContent = pedidosCache.length;
    c.querySelector('#dep-badge-rec').textContent = rechazadosCache.length;
    poblarFiltros(c);
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
  // Separar por espacios/saltos de línea para detectar múltiples URLs
  const partes = String(val).split(/[\s\n]+/).filter(Boolean);
  const urls = partes.filter(p => esURL(p));
  const textoPlano = partes.filter(p => !esURL(p)).join(' ');

  if (urls.length === 0) return `<div class="dep-val">${esc(val)}</div>`;

  let html = '<div class="dep-val">';
  urls.forEach((url, i) => {
    const etiqueta = urls.length > 1 ? `📎 ${label} ${i+1}` : `📎 ${label}`;
    html += `<a href="${url}" target="_blank" rel="noopener" class="dep-link"
      onclick="verificarLink(event,'${url}')" style="display:block;margin-bottom:3px">${etiqueta}</a>`;
  });
  if (textoPlano) html += `<span>${esc(textoPlano)}</span>`;
  html += '</div>';
  return html;
}

function fechaOrd(fecha) {
  if (!fecha) return '';
  const p = String(fecha).split('/');
  return p.length === 3 ? `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}` : fecha;
}

function sortMesesDep(keys) {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return keys.slice().sort((a, b) => {
    const parse = s => { const p = s.split(' '); return (parseInt(p[1])||0) * 100 + (meses.indexOf(p[0]) + 1); };
    return parse(b) - parse(a);
  });
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

// ── MES ACTUAL ────────────────────────────────────────────────────────────────
function mesActual() {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const now = new Date();
  return meses[now.getMonth()] + ' ' + now.getFullYear();
}

// ── POBLAR FILTROS DINÁMICOS ──────────────────────────────────────────────────
function poblarFiltros(c) {
  const secciones = [...new Set(pedidosCache.map(p => p.oficina || '').filter(Boolean))].sort();
  const letras    = [...new Set(pedidosCache.map(p => primeraLetraRI(p.ri)).filter(v => v !== 'Sin RI'))].sort();

  // Meses: unión de pedidos y rechazados, ordenados de más nuevo a más viejo
  const todosMeses = [
    ...pedidosCache.map(p => mesDesFecha(p.fecha)),
    ...rechazadosCache.map(p => mesDesFecha(p.fecha))
  ];
  const meses = [...new Set(todosMeses.filter(m => m && m !== 'Sin fecha'))];
  meses.sort((a, b) => {
    const parse = s => { const p = s.split(' '); const ms = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']; return (parseInt(p[1])||0)*100+(ms.indexOf(p[0])+1); };
    return parse(b) - parse(a);
  });

  const selMes = c.querySelector('#dep-filtro-mes');
  const actual = mesActual();
  selMes.innerHTML = '<option value="">Todos los meses</option>' +
    meses.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
  selMes.value = meses.includes(actual) ? actual : (meses[0] || '');

  const selSec = c.querySelector('#dep-filtro-seccion');
  const valSec = selSec.value;
  selSec.innerHTML = '<option value="">Todas las secciones</option>' +
    secciones.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  if (valSec) selSec.value = valSec;

  const selLetra = c.querySelector('#dep-filtro-letra');
  const valLetra = selLetra.value;
  selLetra.innerHTML = '<option value="">Todas las letras RI</option>' +
    letras.map(l => `<option value="${esc(l)}">RI: ${esc(l)}</option>`).join('');
  if (valLetra) selLetra.value = valLetra;
}

// ── RENDER PEDIDOS ────────────────────────────────────────────────────────────
function renderPedidos(c) {
  const q        = (c.querySelector('#dep-buscar-ped').value || '').toLowerCase();
  const filtroE  = c.querySelector('#dep-filtro-estado').value;
  const filtroS  = c.querySelector('#dep-filtro-seccion').value;
  const filtroL  = c.querySelector('#dep-filtro-letra').value;
  const filtroM  = c.querySelector('#dep-filtro-mes').value;
  const lista = pedidosCache.filter(p => {
    const estadoEfectivo = p.estado_flujo || 'Pendiente';
    const okE = !filtroE || estadoEfectivo === filtroE;
    const okS = !filtroS || (p.oficina || '') === filtroS;
    const okL = !filtroL || primeraLetraRI(p.ri) === filtroL;
    const okM = !filtroM || mesDesFecha(p.fecha) === filtroM;
    const okQ = !q || `${p.id} ${p.oficina} ${p.detalle} ${p.ri} ${p.memo_vale}`.toLowerCase().includes(q);
    return esAnioActual(p.id) && okE && okS && okL && okM && okQ;
  });
  const cont = c.querySelector('#dep-cards-ped');
  if (!lista.length) { cont.innerHTML = '<div class="dep-empty">Sin pedidos de este año</div>'; return; }

  // Ordenar de más nuevo a más viejo
  const listaOrd = lista.slice().sort((a, b) => fechaOrd(b.fecha).localeCompare(fechaOrd(a.fecha)));

  // Agrupar: Mes → Sección → Letra RI
  const porMes = agrupar(listaOrd, p => mesDesFecha(p.fecha));
  let html = '';
  sortMesesDep(Object.keys(porMes)).forEach(mes => {
    html += `<div class="dep-grupo-mes"><div class="dep-grupo-mes-lbl">📅 ${mes}</div>`;
    const porSeccion = agrupar(porMes[mes], p => p.oficina || p.seccion || 'Sin sección');
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

function estadoLabel(e) {
  if (!e || e === 'Pendiente') return 'Pendiente';
  if (e === 'pase a fisico') return 'Pase a Físico';
  if (e === 'aprobado') return 'Aprobado';
  return e;
}
function estadoClass(e) {
  if (!e || e === 'Pendiente') return 'dep-est-pendiente';
  if (e === 'Iniciado') return 'dep-est-iniciado';
  if (e === 'aprobado') return 'dep-est-aprobado';
  if (e === 'pase a fisico') return 'dep-est-fisico';
  return 'dep-est-pendiente';
}

function cardPedido(p) {
  const flujo = p.estado_flujo || '';
  return `
    <div class="dep-card">
      <div class="dep-card-hdr">
        <span class="dep-id">${esc(p.id)}</span>
        <span class="dep-estado ${estadoClass(flujo)}">${estadoLabel(flujo)}</span>
        <span class="dep-fecha">${esc(p.fecha)}</span>
      </div>
      <div class="dep-grid">
        <div class="dep-field"><div class="dep-label">RI</div><div class="dep-val" style="font-weight:800;color:#0b1b35">${esc(p.ri||'—')}</div></div>
        <div class="dep-field"><div class="dep-label">Oficina / Sección</div><div class="dep-val">${esc(p.oficina||'—')}</div></div>
        <div class="dep-field"><div class="dep-label">N° Suministro</div><div class="dep-val">${esc(p.num_suministro||'—')}</div></div>
        <div class="dep-field"><div class="dep-label">Orden de Compra</div><div class="dep-val">${esc(p.oc||'—')}</div></div>
        <div class="dep-field full"><div class="dep-label">Memo / Vale</div>${linkOTexto(p.memo_vale, 'Vale')}</div>
        <div class="dep-field full"><div class="dep-label">Presupuesto</div>${linkOTexto(p.presupuesto, 'Presupuesto')}</div>
        <div class="dep-field full"><div class="dep-label">Detalle del pedido</div><div class="dep-val dep-val-clamp" title="${esc(p.detalle||'')}">${esc(p.detalle||'—')}</div></div>
        ${p.observaciones ? `<div class="dep-field full"><div class="dep-label">Observaciones</div><div class="dep-val dep-val-clamp" title="${esc(p.observaciones)}">${esc(p.observaciones)}</div></div>` : ''}
      </div>
    </div>`;
}

// ── RENDER RECHAZADOS ─────────────────────────────────────────────────────────
function renderRechazados(c) {
  const q = (c.querySelector('#dep-buscar-rec').value || '').toLowerCase();
  const filtroM = c.querySelector('#dep-filtro-mes').value;
  const lista = rechazadosCache
    .filter(p => {
      const okM = !filtroM || mesDesFecha(p.fecha) === filtroM;
      const okQ = `${p.id} ${p.oficina} ${p.detalle} ${p.ri}`.toLowerCase().includes(q);
      return esAnioActual(p.id) && okM && okQ;
    })
    .sort((a, b) => fechaOrd(b.fecha).localeCompare(fechaOrd(a.fecha)));
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
