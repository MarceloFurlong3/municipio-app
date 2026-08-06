// ══════════════════════════════════════════════════════════════════════════════
// lubricentro.js — Inventario de Aceites + Pedidos de Service
// Departamento de Talleres — Municipalidad de Bahía Blanca
// ══════════════════════════════════════════════════════════════════════════════

const ACEITES_DEFAULT = [
  { id:1,  nombre:'15-W40',        desc:'Multigrado para motores diésel de vehículos pesados',             estado:'critico', cantidad:1  },
  { id:2,  nombre:'SAE 20',        desc:'Monogrado para motores que requieren baja viscosidad',             estado:'normal',  cantidad:3  },
  { id:3,  nombre:'BP 46',         desc:'Hidráulico para sistemas con bombas, cilindros y elevadores',      estado:'normal',  cantidad:2  },
  { id:4,  nombre:'Hidráulico 68', desc:'Hidráulico de alta viscosidad para equipos pesados',               estado:'critico', cantidad:1  },
  { id:5,  nombre:'10W40',         desc:'Multigrado para motores nafteros y diésel livianos',               estado:'normal',  cantidad:2  },
  { id:6,  nombre:'SAE 30',        desc:'Monogrado para motores, compresores y bombas de agua',             estado:'normal',  cantidad:9  },
  { id:7,  nombre:'Refrigeración', desc:'Líquido para radiadores y sistemas de enfriamiento de motores',    estado:'normal',  cantidad:3  },
  { id:8,  nombre:'SAE 50',        desc:'Alta viscosidad para motores pesados de trabajo intensivo',        estado:'normal',  cantidad:5  },
  { id:9,  nombre:'UNITRACTOR 30', desc:'Aceite universal para tractores, caja y transmisión',              estado:'normal',  cantidad:4  },
  { id:10, nombre:'85-140',        desc:'Para engranajes, diferenciales y cajas de cambio manuales',        estado:'normal',  cantidad:3  },
  { id:11, nombre:'Grasa',         desc:'Lubricante semisólido para rodamientos, bocines y articulaciones', estado:'normal',  cantidad:1  },
  { id:12, nombre:'ATF',           desc:'Para transmisiones automáticas y dirección hidráulica',            estado:'critico', cantidad:3  },
  { id:13, nombre:'AGUA',          desc:'Agua destilada para baterías, radiadores y niveles',               estado:'normal',  cantidad:30 },
];

const SERVICE_DEFAULT = [
  { id:1,  fecha:'2026-05-19', ri:'B394', modelo:'Peugeot Boxer', dep:'Políticas Sociales 510', nota:'',                        estado:'pendiente' },
  { id:2,  fecha:'2026-06-04', ri:'V334', modelo:'Trafic',         dep:'Sonosis',                nota:'',                        estado:'pendiente' },
  { id:3,  fecha:'2026-06-04', ri:'B334', modelo:'Trafic',         dep:'',                       nota:'',                        estado:'pendiente' },
  { id:4,  fecha:'2026-06-22', ri:'A777', modelo:'Foton',          dep:'Espacios Públicos',      nota:'',                        estado:'pendiente' },
  { id:5,  fecha:'2026-06-29', ri:'V526', modelo:'',               dep:'',                       nota:'',                        estado:'pendiente' },
  { id:6,  fecha:'2026-07-06', ri:'C723', modelo:'',               dep:'',                       nota:'',                        estado:'pendiente' },
  { id:7,  fecha:'2026-07-08', ri:'T548', modelo:'S10',            dep:'',                       nota:'',                        estado:'pendiente' },
  { id:8,  fecha:'2026-07-14', ri:'V394', modelo:'Iveco Daily',    dep:'',                       nota:'',                        estado:'pendiente' },
  { id:9,  fecha:'2026-07-14', ri:'T738', modelo:'',               dep:'Residuos',               nota:'',                        estado:'pendiente' },
  { id:10, fecha:'2026-07-15', ri:'T290', modelo:'MWM',            dep:'',                       nota:'Daniel Fernández filtros', estado:'pendiente' },
  { id:11, fecha:'2026-07-17', ri:'T284', modelo:'',               dep:'',                       nota:'',                        estado:'pendiente' },
  { id:12, fecha:'2026-07-23', ri:'A457', modelo:'',               dep:'',                       nota:'',                        estado:'pendiente' },
  { id:13, fecha:'2026-07-30', ri:'T564', modelo:'',               dep:'',                       nota:'',                        estado:'pendiente' },
  { id:14, fecha:'2026-08-03', ri:'A644', modelo:'Corsa',          dep:'',                       nota:'',                        estado:'pendiente' },
];

const ACEITES_KEY = 'inventario_aceites';
const ACEITES_VER = 'v4';
const SERVICE_KEY = 'lubricentro_service';
const SERVICE_VER = 'v1';
const PASSWORD    = 'toro';

let aceites     = [];
let services    = [];
let adminActivo = false;
let editId      = null;

// ── Persistencia ──────────────────────────────────────────────────────────────
function cargarAceites() {
  try {
    if (localStorage.getItem('inventario_version') !== ACEITES_VER) {
      localStorage.removeItem(ACEITES_KEY);
      localStorage.setItem('inventario_version', ACEITES_VER);
    }
    const s = localStorage.getItem(ACEITES_KEY);
    if (s) return JSON.parse(s);
  } catch(e){}
  return ACEITES_DEFAULT.map(i => ({...i}));
}

function guardarAceites() {
  try {
    localStorage.setItem(ACEITES_KEY, JSON.stringify(aceites));
    localStorage.setItem('inventario_fecha', new Date().toLocaleString('es-AR'));
  } catch(e){}
  const f = localStorage.getItem('inventario_fecha') || '—';
  const el = document.getElementById('lub-fecha-aceites');
  if (el) el.textContent = 'Actualizado: ' + f;
}

function cargarService() {
  try {
    if (localStorage.getItem('srv_version') !== SERVICE_VER) {
      localStorage.removeItem(SERVICE_KEY);
      localStorage.setItem('srv_version', SERVICE_VER);
    }
    const s = localStorage.getItem(SERVICE_KEY);
    if (s) return JSON.parse(s);
  } catch(e){}
  return SERVICE_DEFAULT.map(i => ({...i}));
}

function guardarService() {
  try { localStorage.setItem(SERVICE_KEY, JSON.stringify(services)); } catch(e){}
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatFecha(f) {
  if (!f) return '';
  const [y, m, d] = f.split('-');
  const meses = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} ${meses[parseInt(m)]} ${y}`;
}

// ── Render aceites ────────────────────────────────────────────────────────────
function renderAceites() {
  const lista = document.getElementById('lub-items-aceites');
  if (!lista) return;
  let nCrit = 0, nBajo = 0;

  lista.innerHTML = aceites.map(item => {
    const e = item.estado || 'normal';
    if (e === 'critico') nCrit++;
    if (e === 'bajo')    nBajo++;
    const label = e === 'critico' ? '⚠️ Stock crítico' : e === 'bajo' ? '↓ Stock bajo' : '✓ OK';
    const colorSel = adminActivo
      ? `<div class="lub-color-sel">
          <button class="lub-dot lub-dot-verde${e==='normal'?' on':''}"    data-id="${item.id}" data-est="normal"></button>
          <button class="lub-dot lub-dot-amarillo${e==='bajo'?' on':''}"   data-id="${item.id}" data-est="bajo"></button>
          <button class="lub-dot lub-dot-rojo${e==='critico'?' on':''}"    data-id="${item.id}" data-est="critico"></button>
         </div>`
      : '';
    return `
      <div class="lub-item ${e}${adminActivo ? ' lub-admin-on' : ''}" id="lub-item-${item.id}">
        <div class="lub-ind"></div>
        <div class="lub-item-info">
          <div class="lub-item-nombre">${item.nombre}</div>
          <div class="lub-item-desc">${item.desc || ''}</div>
          <div class="lub-item-status">${label}</div>
          ${colorSel}
        </div>
        <div class="lub-item-qty">
          <div class="lub-num-static">
            <div class="lub-num">${item.cantidad}</div>
            <div class="lub-unidad">unidades</div>
          </div>
          <div class="lub-admin-ctrl">
            <button class="btn-qty-lub minus" data-id="${item.id}" data-delta="-1">−</button>
            <input class="lub-qty-inp" type="number" inputmode="numeric" value="${item.cantidad}" data-id="${item.id}">
            <button class="btn-qty-lub plus"  data-id="${item.id}" data-delta="1">+</button>
          </div>
        </div>
      </div>`;
  }).join('');

  document.getElementById('lub-total-ac').textContent   = aceites.length;
  document.getElementById('lub-critico-ac').textContent = nCrit;
  document.getElementById('lub-bajo-ac').textContent    = nBajo;
  const f = localStorage.getItem('inventario_fecha') || '—';
  const el = document.getElementById('lub-fecha-aceites');
  if (el) el.textContent = 'Actualizado: ' + f;
}

// ── Render service ────────────────────────────────────────────────────────────
function renderService() {
  const wrap = document.getElementById('lub-cards-service');
  if (!wrap) return;

  const pend   = services.filter(s => s.estado === 'pendiente');
  const realiz = services.filter(s => s.estado === 'realizado');

  document.getElementById('srv-total').textContent = services.length;
  document.getElementById('srv-pend').textContent  = pend.length;
  document.getElementById('srv-done').textContent  = realiz.length;
  document.getElementById('lub-badge-service').textContent = pend.length || '';

  function cardHTML(s) {
    const hecho = s.estado === 'realizado';
    const chips = [
      s.dep   && `<span class="srv-chip dep">${s.dep}</span>`,
      s.nota  && `<span class="srv-chip nota">${s.nota}</span>`,
      s.fecha && `<span class="srv-chip fecha">${formatFecha(s.fecha)}</span>`,
      hecho   && `<span class="srv-chip hecho">✓ Realizado</span>`,
    ].filter(Boolean).join('');
    return `
      <div class="srv-card${hecho ? ' realizado' : ''}" id="srv-card-${s.id}">
        <div class="srv-card-body">
          <div class="srv-ri">${s.ri}</div>
          ${s.modelo ? `<div class="srv-modelo">${s.modelo}</div>` : ''}
          <div class="srv-info">${chips}</div>
        </div>
        <div class="srv-actions">
          <button class="btn-srv-done${hecho ? ' hecho' : ''}" data-id="${s.id}" title="${hecho ? 'Deshacer' : 'Marcar realizado'}">${hecho ? '✓' : '○'}</button>
          <button class="btn-srv-del" data-id="${s.id}" title="Eliminar">✕</button>
        </div>
      </div>`;
  }

  let html = '';
  if (pend.length)   html += pend.map(cardHTML).join('');
  if (realiz.length) html += `<div class="srv-sec-lbl">Realizados (${realiz.length})</div>` + realiz.map(cardHTML).join('');
  if (!services.length) html = '<div style="text-align:center;padding:40px;color:#94a3b8;font-size:14px;">Sin pedidos registrados</div>';

  wrap.innerHTML = html;
}

// ── HTML ──────────────────────────────────────────────────────────────────────
function getHTML() { return `
<style>
.lub-wrap { font-family:'Barlow',sans-serif; background:#f6f8fc; min-height:100%; padding-bottom:80px; }

.lub-tabs { display:flex; background:#fff; border-bottom:2px solid #e4eaf5; padding:0 16px; position:sticky; top:0; z-index:30; box-shadow:0 1px 4px rgba(15,23,42,.06); }
.lub-tab  { flex:1; padding:14px 8px; border:none; background:none; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; color:#64748b; cursor:pointer; border-bottom:3px solid transparent; margin-bottom:-2px; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:6px; }
.lub-tab:hover { color:#d97706; }
.lub-tab.activo { color:#d97706; border-bottom-color:#d97706; }
.lub-badge { background:#e4eaf5; color:#475569; font-size:10px; font-weight:800; padding:1px 7px; border-radius:20px; }
.lub-tab.activo .lub-badge { background:#f59e0b; color:#fff; }

.lub-panel { display:none; padding:16px; }
.lub-panel.activo { display:block; }

.lub-stats { display:flex; gap:10px; margin-bottom:14px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
.lub-stats::-webkit-scrollbar { display:none; }
.lub-stat { background:#fff; border:1.5px solid #e4eaf5; border-radius:12px; padding:12px 18px; text-align:center; white-space:nowrap; min-width:90px; box-shadow:0 1px 2px rgba(15,23,42,.04); }
.lub-stat-num { font-size:1.5rem; font-weight:900; color:#0b1b35; }
.lub-stat-num.critico { color:#dc2626; }
.lub-stat-num.pend    { color:#f59e0b; }
.lub-stat-num.done    { color:#16a34a; }
.lub-stat-lbl { font-size:.65rem; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin-top:2px; font-weight:700; }

.lub-hdr { background:#fff; border-radius:14px; padding:14px 18px; margin-bottom:14px; border:1px solid #f0f4f9; box-shadow:0 1px 2px rgba(15,23,42,.04); display:flex; align-items:center; justify-content:space-between; gap:10px; }
.lub-hdr-title { font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:800; color:#0b1b35; }
.lub-hdr-fecha { font-size:10px; color:#94a3b8; margin-top:2px; }
.btn-lub-admin { background:#f1f5f9; border:none; border-radius:10px; padding:9px 14px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; color:#0b1b35; cursor:pointer; display:flex; align-items:center; gap:6px; transition:background .15s; white-space:nowrap; }
.btn-lub-admin:hover { background:#e4eaf5; }
.btn-lub-admin.on { background:#fef3c7; color:#d97706; }

.lub-items { display:flex; flex-direction:column; gap:8px; }
.lub-item { background:#fff; border:1.5px solid #e4eaf5; border-radius:14px; padding:14px 16px; display:flex; align-items:center; gap:12px; box-shadow:0 1px 2px rgba(15,23,42,.04); transition:border-color .2s; }
.lub-item.critico { border-color:rgba(220,38,38,.4); }
.lub-item.bajo    { border-color:rgba(245,158,11,.35); }
.lub-ind { width:5px; height:44px; border-radius:4px; flex-shrink:0; }
.lub-item.critico .lub-ind { background:#dc2626; }
.lub-item.bajo    .lub-ind { background:#f59e0b; }
.lub-item.normal  .lub-ind { background:#22c55e; }
.lub-item-info { flex:1; min-width:0; }
.lub-item-nombre { font-size:1rem; font-weight:800; color:#0f172a; }
.lub-item-desc   { font-size:.72rem; color:#94a3b8; margin-top:2px; line-height:1.4; }
.lub-item-status { font-size:.68rem; font-weight:700; margin-top:4px; }
.lub-item.critico .lub-item-status { color:#dc2626; }
.lub-item.bajo    .lub-item-status  { color:#f59e0b; }
.lub-item.normal  .lub-item-status  { color:#16a34a; }
.lub-color-sel { display:flex; gap:6px; margin-top:8px; align-items:center; }
.lub-dot { width:22px; height:22px; border-radius:50%; border:2px solid transparent; cursor:pointer; opacity:.3; transition:opacity .15s, transform .1s; padding:0; }
.lub-dot:active { transform:scale(.88); }
.lub-dot.on { opacity:1; border-color:rgba(0,0,0,.2); transform:scale(1.15); }
.lub-dot-verde    { background:#22c55e; }
.lub-dot-amarillo { background:#f59e0b; }
.lub-dot-rojo     { background:#dc2626; }
.lub-item-qty { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.lub-num-static { text-align:right; }
.lub-num { font-family:'Barlow Condensed',sans-serif; font-size:2rem; font-weight:900; min-width:42px; text-align:right; }
.lub-item.critico .lub-num { color:#dc2626; }
.lub-item.bajo    .lub-num { color:#f59e0b; }
.lub-item.normal  .lub-num { color:#16a34a; }
.lub-unidad { font-size:.7rem; color:#94a3b8; text-align:right; margin-top:2px; }
.lub-admin-ctrl { display:none; align-items:center; gap:6px; }
.lub-admin-on .lub-admin-ctrl { display:flex; }
.lub-admin-on .lub-num-static { display:none; }
.btn-qty-lub { width:36px; height:36px; border:1.5px solid #e4eaf5; border-radius:9px; background:#f8fafd; font-size:1.2rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .12s; }
.btn-qty-lub:active { background:#e4eaf5; }
.btn-qty-lub.minus { border-color:rgba(220,38,38,.35); color:#dc2626; }
.btn-qty-lub.plus  { border-color:rgba(22,163,74,.35);  color:#16a34a; }
.lub-qty-inp { width:54px; text-align:center; border:1.5px solid #e4eaf5; border-radius:8px; color:#0f172a; font-family:'Barlow',sans-serif; font-size:1.2rem; font-weight:900; padding:4px; outline:none; }
.lub-qty-inp:focus { border-color:#0b1b35; }

.lub-srv-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.lub-srv-titulo { font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:800; color:#0b1b35; }
.btn-srv-nuevo { background:#0b1b35; color:#fff; border:none; border-radius:10px; padding:9px 16px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:background .15s; }
.btn-srv-nuevo:hover { background:#1e3a5f; }
.lub-srv-cards { display:flex; flex-direction:column; gap:8px; }
.srv-card { background:#fff; border:1.5px solid #e4eaf5; border-radius:14px; padding:14px 16px; box-shadow:0 1px 2px rgba(15,23,42,.04); display:flex; align-items:center; gap:12px; }
.srv-card.realizado { border-color:#86efac; background:#f0fdf4; }
.srv-card-body { flex:1; min-width:0; }
.srv-ri { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:800; color:#0b1b35; }
.srv-card.realizado .srv-ri { color:#16a34a; }
.srv-modelo { font-size:12px; font-weight:700; color:#475569; margin-top:1px; }
.srv-info { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
.srv-chip { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; background:#f1f5f9; color:#64748b; }
.srv-chip.dep   { background:#eff6ff; color:#2563eb; }
.srv-chip.nota  { background:#fef9c3; color:#a16207; }
.srv-chip.fecha { background:#f1f5f9; color:#94a3b8; }
.srv-chip.hecho { background:#dcfce7; color:#15803d; }
.srv-actions { display:flex; flex-direction:column; gap:6px; align-items:center; flex-shrink:0; }
.btn-srv-done { width:36px; height:36px; border:1.5px solid #86efac; border-radius:50%; background:#f0fdf4; color:#16a34a; cursor:pointer; font-size:1rem; font-weight:700; display:flex; align-items:center; justify-content:center; transition:all .12s; }
.btn-srv-done:active { background:#bbf7d0; }
.btn-srv-done.hecho { background:#16a34a; color:#fff; border-color:#16a34a; }
.btn-srv-del { width:28px; height:28px; border:none; border-radius:50%; background:#fee2e2; color:#dc2626; cursor:pointer; font-size:.75rem; display:flex; align-items:center; justify-content:center; transition:background .12s; }
.btn-srv-del:active { background:#fca5a5; }
.srv-sec-lbl { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; padding:12px 0 8px; }

.lub-modal-bg { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:500; align-items:flex-end; justify-content:center; }
.lub-modal-bg.vis { display:flex; }
.lub-modal { background:#fff; border-radius:18px 18px 0 0; width:100%; max-width:600px; padding:20px; max-height:85vh; overflow-y:auto; }
.lub-modal-drag { width:40px; height:4px; background:#e4eaf5; border-radius:2px; margin:0 auto 16px; }
.lub-modal-title { font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:800; color:#0b1b35; margin-bottom:16px; }
.lub-field { margin-bottom:12px; }
.lub-field label { display:block; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
.lub-field input { width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; outline:none; font-family:inherit; transition:border-color .15s; }
.lub-field input:focus { border-color:#0b1b35; }
.lub-row2 { display:flex; gap:10px; }
.lub-row2 .lub-field { flex:1; }
.btn-lub-guardar { width:100%; padding:12px; background:#0b1b35; color:#fff; border:none; border-radius:10px; font-family:'Barlow',sans-serif; font-size:14px; font-weight:700; cursor:pointer; margin-top:4px; }
.btn-lub-guardar:hover { background:#1e3a5f; }
.btn-lub-cerrar { width:100%; padding:10px; background:transparent; border:1.5px solid #e4eaf5; border-radius:10px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; color:#64748b; cursor:pointer; margin-top:8px; }

.lub-pass-bg { display:none; position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:600; align-items:center; justify-content:center; padding:20px; }
.lub-pass-bg.vis { display:flex; }
.lub-pass-box { background:#fff; border-radius:18px; padding:28px 24px; width:100%; max-width:320px; }
.lub-pass-box h3 { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:800; margin-bottom:6px; color:#0b1b35; }
.lub-pass-box p { font-size:13px; color:#94a3b8; margin-bottom:16px; }
.lub-pass-inp { width:100%; padding:12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:1.1rem; font-weight:700; text-align:center; letter-spacing:4px; outline:none; margin-bottom:12px; }
.lub-pass-inp:focus { border-color:#0b1b35; }
.lub-pass-err { color:#dc2626; font-size:12px; text-align:center; margin-bottom:8px; display:none; }
.lub-pass-err.vis { display:block; }
.btn-lub-desbloquear { width:100%; padding:13px; background:#f59e0b; border:none; border-radius:10px; font-family:'Barlow',sans-serif; font-size:14px; font-weight:800; color:#fff; cursor:pointer; margin-bottom:8px; }
.btn-lub-cancelar { width:100%; padding:11px; background:transparent; border:1.5px solid #e4eaf5; border-radius:10px; font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; color:#64748b; cursor:pointer; }
</style>

<div class="lub-wrap">

  <div class="lub-tabs">
    <button class="lub-tab activo" id="lub-tab-aceites">🛢️ Aceites <span class="lub-badge" id="lub-badge-aceites">13</span></button>
    <button class="lub-tab" id="lub-tab-service">🔧 Service <span class="lub-badge" id="lub-badge-service"></span></button>
  </div>

  <!-- PANEL ACEITES -->
  <div class="lub-panel activo" id="lub-panel-aceites">
    <div class="lub-hdr">
      <div>
        <div class="lub-hdr-title">Lubricantes y fluidos</div>
        <div class="lub-hdr-fecha" id="lub-fecha-aceites">—</div>
      </div>
      <button class="btn-lub-admin" id="btn-lub-admin">🔒 Admin</button>
    </div>
    <div class="lub-stats">
      <div class="lub-stat"><div class="lub-stat-num" id="lub-total-ac">0</div><div class="lub-stat-lbl">Productos</div></div>
      <div class="lub-stat"><div class="lub-stat-num critico" id="lub-critico-ac">0</div><div class="lub-stat-lbl">Crítico</div></div>
      <div class="lub-stat"><div class="lub-stat-num pend" id="lub-bajo-ac">0</div><div class="lub-stat-lbl">Stock bajo</div></div>
    </div>
    <div class="lub-items" id="lub-items-aceites"></div>
  </div>

  <!-- PANEL SERVICE -->
  <div class="lub-panel" id="lub-panel-service">
    <div class="lub-stats">
      <div class="lub-stat"><div class="lub-stat-num" id="srv-total">0</div><div class="lub-stat-lbl">Total</div></div>
      <div class="lub-stat"><div class="lub-stat-num pend" id="srv-pend">0</div><div class="lub-stat-lbl">Pendientes</div></div>
      <div class="lub-stat"><div class="lub-stat-num done" id="srv-done">0</div><div class="lub-stat-lbl">Realizados</div></div>
    </div>
    <div class="lub-srv-hdr">
      <div class="lub-srv-titulo">Pedidos de Service</div>
      <button class="btn-srv-nuevo" id="btn-srv-nuevo">+ Nuevo</button>
    </div>
    <div class="lub-srv-cards" id="lub-cards-service"></div>
  </div>

</div>

<!-- MODAL NUEVO SERVICE -->
<div class="lub-modal-bg" id="lub-modal-srv">
  <div class="lub-modal">
    <div class="lub-modal-drag"></div>
    <div class="lub-modal-title" id="lub-modal-srv-titulo">Nuevo pedido de service</div>
    <div class="lub-row2">
      <div class="lub-field" style="flex:0 0 100px">
        <label>RI *</label>
        <input id="srv-inp-ri" type="text" placeholder="T548" autocomplete="off" style="text-transform:uppercase">
      </div>
      <div class="lub-field">
        <label>Fecha</label>
        <input id="srv-inp-fecha" type="date">
      </div>
    </div>
    <div class="lub-field">
      <label>Modelo</label>
      <input id="srv-inp-modelo" type="text" placeholder="S10, Trafic, Iveco Daily...">
    </div>
    <div class="lub-field">
      <label>Dependencia</label>
      <input id="srv-inp-dep" type="text" placeholder="Residuos, Espacios Públicos...">
    </div>
    <div class="lub-field">
      <label>Nota</label>
      <input id="srv-inp-nota" type="text" placeholder="Filtros, aceite, revisión...">
    </div>
    <button class="btn-lub-guardar" id="btn-srv-guardar">Guardar</button>
    <button class="btn-lub-cerrar" id="btn-srv-cerrar">Cancelar</button>
  </div>
</div>

<!-- MODAL CONTRASEÑA ADMIN -->
<div class="lub-pass-bg" id="lub-pass-bg">
  <div class="lub-pass-box">
    <h3>🔐 Modo Admin</h3>
    <p>Ingresá la contraseña para modificar cantidades.</p>
    <input class="lub-pass-inp" id="lub-pass-inp" type="password" placeholder="••••••" autocomplete="off">
    <div class="lub-pass-err" id="lub-pass-err">Contraseña incorrecta</div>
    <button class="btn-lub-desbloquear" id="btn-lub-desbloquear">Desbloquear</button>
    <button class="btn-lub-cancelar" id="btn-lub-cancelar">Cancelar</button>
  </div>
</div>
`; }

// ── Eventos ───────────────────────────────────────────────────────────────────
function bindEventos() {
  document.getElementById('lub-tab-aceites').addEventListener('click', () => {
    document.getElementById('lub-tab-aceites').classList.add('activo');
    document.getElementById('lub-tab-service').classList.remove('activo');
    document.getElementById('lub-panel-aceites').classList.add('activo');
    document.getElementById('lub-panel-service').classList.remove('activo');
  });
  document.getElementById('lub-tab-service').addEventListener('click', () => {
    document.getElementById('lub-tab-service').classList.add('activo');
    document.getElementById('lub-tab-aceites').classList.remove('activo');
    document.getElementById('lub-panel-service').classList.add('activo');
    document.getElementById('lub-panel-aceites').classList.remove('activo');
  });

  // Admin aceites
  document.getElementById('btn-lub-admin').addEventListener('click', () => {
    if (adminActivo) {
      adminActivo = false;
      const btn = document.getElementById('btn-lub-admin');
      btn.className = 'btn-lub-admin';
      btn.textContent = '🔒 Admin';
      renderAceites();
    } else {
      abrirPassModal();
    }
  });

  document.getElementById('btn-lub-desbloquear').addEventListener('click', verificarPass);
  document.getElementById('btn-lub-cancelar').addEventListener('click', cerrarPassModal);
  document.getElementById('lub-pass-inp').addEventListener('keydown', e => { if (e.key === 'Enter') verificarPass(); });
  document.getElementById('lub-pass-bg').addEventListener('click', e => { if (e.target === document.getElementById('lub-pass-bg')) cerrarPassModal(); });

  // Aceites: delegación
  document.getElementById('lub-items-aceites').addEventListener('click', e => {
    const btn = e.target.closest('[data-delta]');
    if (btn) {
      const id    = parseInt(btn.dataset.id);
      const delta = parseInt(btn.dataset.delta);
      const item  = aceites.find(i => i.id === id);
      if (item) { item.cantidad = Math.max(0, item.cantidad + delta); guardarAceites(); renderAceites(); }
      return;
    }
    const dot = e.target.closest('[data-est]');
    if (dot) {
      const id  = parseInt(dot.dataset.id);
      const est = dot.dataset.est;
      const item = aceites.find(i => i.id === id);
      if (item) { item.estado = est; guardarAceites(); renderAceites(); }
    }
  });
  document.getElementById('lub-items-aceites').addEventListener('change', e => {
    const inp = e.target.closest('.lub-qty-inp');
    if (inp) {
      const id   = parseInt(inp.dataset.id);
      const item = aceites.find(i => i.id === id);
      const n    = Math.max(0, parseInt(inp.value) || 0);
      if (item) { item.cantidad = n; inp.value = n; guardarAceites(); }
    }
  });

  // Service: modal
  document.getElementById('btn-srv-nuevo').addEventListener('click', () => abrirModalSrv(null));
  document.getElementById('btn-srv-cerrar').addEventListener('click', cerrarModalSrv);
  document.getElementById('lub-modal-srv').addEventListener('click', e => { if (e.target === document.getElementById('lub-modal-srv')) cerrarModalSrv(); });
  document.getElementById('btn-srv-guardar').addEventListener('click', guardarSrv);
  document.getElementById('srv-inp-ri').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });

  // Service: delegación
  document.getElementById('lub-cards-service').addEventListener('click', e => {
    const done = e.target.closest('.btn-srv-done');
    if (done) {
      const id = parseInt(done.dataset.id);
      const s  = services.find(x => x.id === id);
      if (s) { s.estado = s.estado === 'realizado' ? 'pendiente' : 'realizado'; guardarService(); renderService(); }
      return;
    }
    const del = e.target.closest('.btn-srv-del');
    if (del) {
      const id = parseInt(del.dataset.id);
      if (confirm('¿Eliminar este pedido?')) {
        services = services.filter(x => x.id !== id);
        guardarService();
        renderService();
      }
    }
  });
}

function abrirPassModal() {
  document.getElementById('lub-pass-bg').classList.add('vis');
  document.getElementById('lub-pass-inp').value = '';
  document.getElementById('lub-pass-err').classList.remove('vis');
  setTimeout(() => document.getElementById('lub-pass-inp').focus(), 100);
}

function cerrarPassModal() {
  document.getElementById('lub-pass-bg').classList.remove('vis');
}

function verificarPass() {
  const val = document.getElementById('lub-pass-inp').value;
  if (val === PASSWORD) {
    cerrarPassModal();
    adminActivo = true;
    const btn = document.getElementById('btn-lub-admin');
    btn.className = 'btn-lub-admin on';
    btn.textContent = '🔓 Cerrar';
    renderAceites();
  } else {
    document.getElementById('lub-pass-err').classList.add('vis');
    document.getElementById('lub-pass-inp').value = '';
    document.getElementById('lub-pass-inp').focus();
  }
}

function abrirModalSrv(id) {
  editId = id;
  const hoy = new Date().toISOString().split('T')[0];
  if (id === null) {
    document.getElementById('lub-modal-srv-titulo').textContent = 'Nuevo pedido de service';
    document.getElementById('srv-inp-ri').value     = '';
    document.getElementById('srv-inp-modelo').value = '';
    document.getElementById('srv-inp-dep').value    = '';
    document.getElementById('srv-inp-nota').value   = '';
    document.getElementById('srv-inp-fecha').value  = hoy;
  } else {
    const s = services.find(x => x.id === id);
    if (!s) return;
    document.getElementById('lub-modal-srv-titulo').textContent = 'Editar pedido';
    document.getElementById('srv-inp-ri').value     = s.ri;
    document.getElementById('srv-inp-modelo').value = s.modelo;
    document.getElementById('srv-inp-dep').value    = s.dep;
    document.getElementById('srv-inp-nota').value   = s.nota;
    document.getElementById('srv-inp-fecha').value  = s.fecha || hoy;
  }
  document.getElementById('lub-modal-srv').classList.add('vis');
  setTimeout(() => document.getElementById('srv-inp-ri').focus(), 100);
}

function cerrarModalSrv() {
  document.getElementById('lub-modal-srv').classList.remove('vis');
  editId = null;
}

function guardarSrv() {
  const ri = document.getElementById('srv-inp-ri').value.trim().toUpperCase();
  if (!ri) { document.getElementById('srv-inp-ri').focus(); return; }
  const datos = {
    ri,
    modelo: document.getElementById('srv-inp-modelo').value.trim(),
    dep:    document.getElementById('srv-inp-dep').value.trim(),
    nota:   document.getElementById('srv-inp-nota').value.trim(),
    fecha:  document.getElementById('srv-inp-fecha').value,
    estado: 'pendiente',
  };
  if (editId === null) {
    const nuevoId = services.length ? Math.max(...services.map(s => s.id)) + 1 : 1;
    services.unshift({ id: nuevoId, ...datos });
  } else {
    const idx = services.findIndex(x => x.id === editId);
    if (idx !== -1) services[idx] = { ...services[idx], ...datos };
  }
  guardarService();
  renderService();
  cerrarModalSrv();
}

// ── Montar ────────────────────────────────────────────────────────────────────
export function montarLubricentro(c) {
  aceites     = cargarAceites();
  services    = cargarService();
  adminActivo = false;
  c.innerHTML = getHTML();
  if (window.lucide) lucide.createIcons();
  bindEventos();
  renderAceites();
  renderService();
}
