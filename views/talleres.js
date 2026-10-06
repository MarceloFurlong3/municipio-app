// ══════════════════════════════════════════════════════════════════════════════
// talleres.js — Órdenes de Trabajo y Vales de Materiales
// Departamento de Talleres — Municipalidad de Bahía Blanca
// Backend: Supabase municipio-bahia-blanca (independiente del GAS)
// ══════════════════════════════════════════════════════════════════════════════
import { toast } from '../shared.js';

const SUPA_URL = 'https://mghbnxtavlzwvjozhojc.supabase.co';
const SUPA_KEY = 'sb_publishable_0wctZO5HpYmOmh5kfFGAcw_GJLJ-ec9';

async function supa(tabla, method = 'GET', body = null, params = '') {
  const res = await fetch(`${SUPA_URL}/rest/v1/${tabla}${params}`, {
    method,
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': 'Bearer ' + SUPA_KEY,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : ''
    },
    body: body ? JSON.stringify(body) : null
  });
  if (!res.ok) throw new Error(await res.text());
  return method === 'DELETE' ? null : res.json();
}

async function proximoNumeroOT() {
  const rows = await supa('ordenes_trabajo', 'GET', null, '?select=numero_ot&order=numero_ot.desc&limit=1');
  return rows.length ? rows[0].numero_ot + 1 : 131001;
}
async function proximoNumeroVale() {
  const rows = await supa('vales_materiales', 'GET', null, '?select=numero_vale&order=numero_vale.desc&limit=1');
  return rows.length ? rows[0].numero_vale + 1 : 535;
}

// ── Cache ─────────────────────────────────────────────────────────────────────
let otsCache   = [];
let valesCache = [];

// ── Montar ────────────────────────────────────────────────────────────────────
export function montarTalleres(c) {
  c.innerHTML = `
<style>
.tall-tabs { display:flex; gap:0; border-bottom:2px solid #e2e8f0; margin-bottom:14px; }
.tall-tab { flex:1; padding:10px; text-align:center; font-size:13px; font-weight:700; color:#64748b; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; background:none; border-top:none; border-left:none; border-right:none; transition:all .15s; }
.tall-tab.on { color:#0b1b35; border-bottom-color:#0b1b35; }
.tall-nuevo { width:100%; padding:11px; background:#0b1b35; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; margin-bottom:14px; }
.tall-card { background:#fff; border-radius:10px; border:1px solid #e2e8f0; padding:13px; margin-bottom:8px; cursor:pointer; transition:box-shadow .12s; }
.tall-card:hover { box-shadow:0 2px 8px rgba(0,0,0,.08); }
.tall-card-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; }
.tall-num { font-size:16px; font-weight:800; color:#0b1b35; }
.tall-badge { font-size:11px; font-weight:700; padding:3px 9px; border-radius:20px; }
.tall-badge.pendiente { background:#fef9c3; color:#92400e; }
.tall-badge.retirado  { background:#dcfce7; color:#166534; }
.tall-badge.abierta   { background:#dbeafe; color:#1e40af; }
.tall-badge.cerrada   { background:#f1f5f9; color:#64748b; }
.tall-ri { font-size:13px; font-weight:700; color:#334155; }
.tall-dep { font-size:11px; color:#94a3b8; margin-top:2px; }
.tall-items { font-size:11px; color:#64748b; margin-top:5px; }
.tall-modal-bg { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:500; align-items:flex-end; justify-content:center; }
.tall-modal-bg.vis { display:flex; }
.tall-modal { background:#fff; border-radius:18px 18px 0 0; width:100%; max-width:600px; padding:20px; max-height:92vh; overflow-y:auto; }
.tall-modal h3 { font-size:16px; font-weight:800; margin-bottom:16px; color:#0b1b35; }
.tall-field { margin-bottom:12px; }
.tall-field label { display:block; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
.tall-field input, .tall-field select, .tall-field textarea { width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; outline:none; font-family:inherit; transition:border-color .15s; }
.tall-field input:focus, .tall-field select:focus, .tall-field textarea:focus { border-color:#0b1b35; }
.tall-field textarea { resize:vertical; min-height:70px; }
.tall-row { display:flex; gap:10px; }
.tall-row .tall-field { flex:1; }
.items-lista { border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; margin-bottom:8px; }
.item-row { display:flex; align-items:center; gap:8px; padding:8px 10px; border-bottom:1px solid #f1f5f9; }
.item-row:last-child { border-bottom:none; }
.item-cant { width:60px; flex-shrink:0; }
.item-desc { flex:1; }
.item-del { background:none; border:none; color:#ef4444; cursor:pointer; font-size:16px; padding:0 4px; }
.btn-add-item { width:100%; padding:8px; background:#f8fafc; border:1.5px dashed #cbd5e1; border-radius:8px; color:#64748b; font-size:13px; font-weight:600; cursor:pointer; }
.tall-btns { display:flex; gap:8px; margin-top:16px; }
.tall-btn-ok { flex:1; padding:12px; background:#0b1b35; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; }
.tall-btn-cancel { padding:12px 18px; background:none; border:1.5px solid #e2e8f0; color:#64748b; border-radius:10px; font-size:14px; cursor:pointer; }
.tall-btn-print { flex:1; padding:12px; background:#16a34a; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; }
.tall-btn-retiro { flex:1; padding:10px; background:#f59e0b; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; }
</style>

<div class="tall-tabs">
  <button class="tall-tab on" id="tab-ot" onclick="switchTallTab('ot')">📋 Órdenes de Trabajo</button>
  <button class="tall-tab" id="tab-vale" onclick="switchTallTab('vale')">📄 Vales de Materiales</button>
</div>

<div id="panel-ot">
  <button class="tall-nuevo" onclick="abrirNuevaOT()">+ Nueva Orden de Trabajo</button>
  <div id="lista-ot"><div style="text-align:center;padding:30px;color:#94a3b8;font-size:13px">Cargando...</div></div>
</div>

<div id="panel-vale" style="display:none">
  <button class="tall-nuevo" onclick="abrirNuevoVale()">+ Nuevo Vale de Materiales</button>
  <div id="lista-vale"><div style="text-align:center;padding:30px;color:#94a3b8;font-size:13px">Cargando...</div></div>
</div>

<!-- MODAL OT -->
<div class="tall-modal-bg" id="modal-ot">
  <div class="tall-modal">
    <h3>📋 Nueva Orden de Trabajo</h3>
    <div class="tall-row">
      <div class="tall-field"><label>R.I. del Vehículo</label><input id="ot-ri" placeholder="Ej: T136 - FORD F 100 NAFTA" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="tall-field"><label>Sección</label><input id="ot-seccion" placeholder="Ej: ALMACEN" oninput="this.value=this.value.toUpperCase()"></div>
    </div>
    <div class="tall-field"><label>Dependencia</label><input id="ot-dependencia" placeholder="Ej: 210 - SEC. ECONOMIA" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="tall-row">
      <div class="tall-field"><label>Legajo solicita</label><input id="ot-legajo" type="number" placeholder="12640"></div>
      <div class="tall-field"><label>Nombre solicita</label><input id="ot-nombre" placeholder="APELLIDO NOMBRE" oninput="this.value=this.value.toUpperCase()"></div>
    </div>
    <div class="tall-row">
      <div class="tall-field"><label>Memo N°</label><input id="ot-memo" placeholder="Opcional"></div>
      <div class="tall-field"><label>Odómetro</label><input id="ot-odometro" type="number" value="0"></div>
    </div>
    <div class="tall-field"><label>Descripción del trabajo</label><textarea id="ot-descripcion" placeholder="KIT DE FILTROS — KIT DE DISTRIBUCIÓN"></textarea></div>
    <div class="tall-btns">
      <button class="tall-btn-cancel" onclick="cerrarModales()">Cancelar</button>
      <button class="tall-btn-ok" onclick="guardarOT()">Crear OT</button>
    </div>
  </div>
</div>

<!-- MODAL VALE -->
<div class="tall-modal-bg" id="modal-vale">
  <div class="tall-modal">
    <h3>📄 Nuevo Vale de Materiales</h3>
    <div class="tall-row">
      <div class="tall-field"><label>R.I. del Vehículo</label><input id="v-ri" placeholder="Ej: A779" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="tall-field"><label>O/T N°</label><input id="v-ot" type="number" placeholder="131001"></div>
    </div>
    <div class="tall-field"><label>Dependencia</label><input id="v-dependencia" placeholder="Ej: CONSERVACIÓN VIAL" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="tall-row">
      <div class="tall-field"><label>Código U.D. N°</label><input id="v-codud" placeholder="2201"></div>
      <div class="tall-field"><label>Legajo solicita</label><input id="v-legajo" type="number" placeholder="12640"></div>
    </div>
    <div class="tall-field"><label>Nombre solicita</label><input id="v-nombre" placeholder="APELLIDO NOMBRE" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="tall-field">
      <label>Materiales / Repuestos</label>
      <div class="items-lista" id="items-lista">
        <div class="item-row" id="item-0">
          <input class="item-cant" type="number" placeholder="1" min="1" value="1">
          <input class="item-desc" placeholder="Descripción del material" oninput="this.value=this.value.toUpperCase()">
          <button class="item-del" onclick="eliminarItem(0)">✕</button>
        </div>
      </div>
      <button class="btn-add-item" onclick="agregarItem()">+ Agregar item</button>
    </div>
    <div class="tall-btns">
      <button class="tall-btn-cancel" onclick="cerrarModales()">Cancelar</button>
      <button class="tall-btn-ok" onclick="guardarVale()">Crear Vale</button>
    </div>
  </div>
</div>

`;

  window.switchTallTab  = switchTallTab;
  window.abrirNuevaOT   = abrirNuevaOT;
  window.abrirNuevoVale = abrirNuevoVale;
  window.cerrarModales  = cerrarModales;
  window.guardarOT      = guardarOT;
  window.guardarVale    = guardarVale;
  window.agregarItem    = agregarItem;
  window.eliminarItem   = eliminarItem;
  window.imprimirOT     = imprimirOT;
  window.imprimirVale   = imprimirVale;
  window.marcarRetirado = marcarRetirado;
  window.imprimirOTById   = (id) => imprimirOT(otsCache.find(o => o.id === id));
  window.imprimirValeById = (id) => imprimirVale(valesCache.find(x => x.id === id));

  cargarOTs();
  cargarVales();
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function switchTallTab(tab) {
  document.getElementById('tab-ot').classList.toggle('on', tab === 'ot');
  document.getElementById('tab-vale').classList.toggle('on', tab === 'vale');
  document.getElementById('panel-ot').style.display   = tab === 'ot'   ? '' : 'none';
  document.getElementById('panel-vale').style.display = tab === 'vale' ? '' : 'none';
}

// ── Cargar ────────────────────────────────────────────────────────────────────
async function cargarOTs() {
  try {
    otsCache = await supa('ordenes_trabajo', 'GET', null, '?order=numero_ot.desc');
    renderOTs();
  } catch(e) { document.getElementById('lista-ot').innerHTML = '<div style="padding:20px;color:#ef4444;font-size:13px">Error al cargar</div>'; }
}

async function cargarVales() {
  try {
    valesCache = await supa('vales_materiales', 'GET', null, '?order=numero_vale.desc');
    renderVales();
  } catch(e) { document.getElementById('lista-vale').innerHTML = '<div style="padding:20px;color:#ef4444;font-size:13px">Error al cargar</div>'; }
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderOTs() {
  const el = document.getElementById('lista-ot');
  if (!otsCache.length) { el.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:13px">Sin órdenes de trabajo</div>'; return; }
  el.innerHTML = otsCache.map(ot => `
    <div class="tall-card" onclick="abrirDetalleOT(${ot.id})">
      <div class="tall-card-hdr">
        <span class="tall-num">OT ${ot.numero_ot}</span>
        <span class="tall-badge ${(ot.estado||'abierta').toLowerCase()}">${ot.estado||'Abierta'}</span>
      </div>
      <div class="tall-ri">${ot.ri||'—'} · ${ot.seccion||'—'}</div>
      <div class="tall-dep">${ot.dependencia||'—'}</div>
      <div class="tall-items">${ot.descripcion||''}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:5px">${ot.fecha||''} · ${ot.nombre_solicita||'—'}</div>
    </div>`).join('');
}

function renderVales() {
  const el = document.getElementById('lista-vale');
  if (!valesCache.length) { el.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:13px">Sin vales</div>'; return; }
  el.innerHTML = valesCache.map(v => {
    const itemsTxt = (v.items||[]).map(i=>`${i.cant}×${i.desc}`).join(', ');
    return `<div class="tall-card" onclick="abrirDetalleVale(${v.id})">
      <div class="tall-card-hdr">
        <span class="tall-num">Vale ${String(v.numero_vale).padStart(7,'0')}</span>
        <span class="tall-badge ${(v.estado||'pendiente').toLowerCase()}">${v.estado||'Pendiente'}</span>
      </div>
      <div class="tall-ri">${v.ri||'—'} ${v.numero_ot ? '· OT '+v.numero_ot : ''}</div>
      <div class="tall-dep">${v.dependencia||'—'}</div>
      <div class="tall-items">${itemsTxt}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:5px">${v.fecha||''} · ${v.nombre_solicita||'—'}</div>
    </div>`;
  }).join('');
}

// ── Modales ───────────────────────────────────────────────────────────────────
function abrirNuevaOT()   { document.getElementById('modal-ot').classList.add('vis'); }
function abrirNuevoVale() { document.getElementById('modal-vale').classList.add('vis'); }
function cerrarModales()  { ['modal-ot','modal-vale'].forEach(id => document.getElementById(id).classList.remove('vis')); }

// ── Items ─────────────────────────────────────────────────────────────────────
let itemCount = 1;
function agregarItem() {
  const lista = document.getElementById('items-lista');
  const div = document.createElement('div');
  div.className = 'item-row'; div.id = 'item-'+itemCount;
  div.innerHTML = `<input class="item-cant" type="number" placeholder="1" min="1" value="1">
    <input class="item-desc" placeholder="Material" oninput="this.value=this.value.toUpperCase()">
    <button class="item-del" onclick="eliminarItem(${itemCount})">✕</button>`;
  lista.appendChild(div);
  div.querySelector('.item-desc').focus();
  itemCount++;
}
function eliminarItem(id) {
  const el = document.getElementById('item-'+id);
  if (el && document.querySelectorAll('.item-row').length > 1) el.remove();
}
function getItems() {
  return [...document.querySelectorAll('.item-row')].map(r=>({
    cant: r.querySelector('.item-cant').value||'1',
    desc: r.querySelector('.item-desc').value.trim()
  })).filter(i=>i.desc);
}

// ── Guardar OT ────────────────────────────────────────────────────────────────
async function guardarOT() {
  const ri   = document.getElementById('ot-ri').value.trim();
  const desc = document.getElementById('ot-descripcion').value.trim();
  if (!ri || !desc) { toast('Completá el RI y la descripción', 'err'); return; }
  try {
    const numero_ot = await proximoNumeroOT();
    const [ot] = await supa('ordenes_trabajo', 'POST', {
      numero_ot, ri,
      seccion:         document.getElementById('ot-seccion').value.trim(),
      dependencia:     document.getElementById('ot-dependencia').value.trim(),
      legajo_solicita: document.getElementById('ot-legajo').value,
      nombre_solicita: document.getElementById('ot-nombre').value.trim(),
      memo:            document.getElementById('ot-memo').value.trim(),
      odometro:        parseInt(document.getElementById('ot-odometro').value)||0,
      descripcion:     desc,
      estado:          'Abierta'
    });
    toast('OT '+numero_ot+' creada', 'ok');
    cerrarModales();
    await cargarOTs();
    setTimeout(() => imprimirOT(ot||otsCache[0]), 300);
  } catch(e) { toast('Error: '+e.message, 'err'); }
}

// ── Guardar Vale ──────────────────────────────────────────────────────────────
async function guardarVale() {
  const ri    = document.getElementById('v-ri').value.trim();
  const items = getItems();
  if (!ri || !items.length) { toast('Completá el RI y al menos un material', 'err'); return; }
  try {
    const numero_vale = await proximoNumeroVale();
    const otNum = document.getElementById('v-ot').value;
    const [vale] = await supa('vales_materiales', 'POST', {
      numero_vale, ri,
      numero_ot:       otNum ? parseInt(otNum) : null,
      dependencia:     document.getElementById('v-dependencia').value.trim(),
      codigo_ud:       document.getElementById('v-codud').value.trim(),
      legajo_solicita: document.getElementById('v-legajo').value,
      nombre_solicita: document.getElementById('v-nombre').value.trim(),
      items,
      estado:          'Pendiente'
    });
    toast('Vale '+numero_vale+' creado', 'ok');
    cerrarModales();
    await cargarVales();
    setTimeout(() => imprimirVale(vale||valesCache[0]), 300);
  } catch(e) { toast('Error: '+e.message, 'err'); }
}

// ── Detalle OT ────────────────────────────────────────────────────────────────
window.abrirDetalleOT = function(id) {
  const ot = otsCache.find(o => o.id === id);
  if (!ot) return;
  const area = document.createElement('div');
  area.style = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:400;padding:20px;display:flex;align-items:center;justify-content:center';
  area.innerHTML = `
    <div style="padding:16px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;max-width:500px;width:100%">
      <div style="font-size:18px;font-weight:800;color:#0b1b35;margin-bottom:12px">OT ${ot.numero_ot}</div>
      <div style="font-size:13px;color:#334155;line-height:2">
        <b>Fecha:</b> ${ot.fecha||''}<br><b>RI:</b> ${ot.ri||''}<br>
        <b>Sección:</b> ${ot.seccion||''}<br><b>Dependencia:</b> ${ot.dependencia||''}<br>
        <b>Solicita:</b> ${ot.nombre_solicita||''} (Leg. ${ot.legajo_solicita||''})<br>
        <b>Descripción:</b> ${ot.descripcion||''}<br><b>Estado:</b> ${ot.estado||''}
      </div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="tall-btn-print no-print" onclick="imprimirOTById(${id})">🖨 Imprimir OT</button>
      </div>
    </div>
    <button onclick="this.parentElement.remove()" style="position:absolute;top:16px;right:16px;background:#fff;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer">×</button>`;
  document.body.appendChild(area);
};

// ── Detalle Vale ──────────────────────────────────────────────────────────────
window.abrirDetalleVale = function(id) {
  const v = valesCache.find(x => x.id === id);
  if (!v) return;
  const itemsHtml = (v.items||[]).map(i=>`<li>${i.cant} — ${i.desc}</li>`).join('');
  const area = document.createElement('div');
  area.style = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:400;padding:20px;display:flex;align-items:center;justify-content:center';
  area.innerHTML = `
    <div style="padding:16px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;max-width:500px;width:100%">
      <div style="font-size:18px;font-weight:800;color:#0b1b35;margin-bottom:12px">Vale ${String(v.numero_vale).padStart(7,'0')}</div>
      <div style="font-size:13px;color:#334155;line-height:2">
        <b>Fecha:</b> ${v.fecha||''}<br><b>RI:</b> ${v.ri||''}<br>
        <b>O/T:</b> ${v.numero_ot||'—'}<br><b>Dependencia:</b> ${v.dependencia||''}<br>
        <b>Solicita:</b> ${v.nombre_solicita||''}<br>
        <b>Estado:</b> <span class="tall-badge ${(v.estado||'pendiente').toLowerCase()}">${v.estado||'Pendiente'}</span>
      </div>
      <ul style="margin:10px 0 10px 18px;font-size:13px">${itemsHtml}</ul>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="tall-btn-print no-print" onclick="imprimirValeById(${id})">🖨 Imprimir</button>
        ${v.estado!=='Retirado'?`<button class="tall-btn-retiro no-print" onclick="marcarRetirado(${id},this)">✅ Marcar retirado</button>`:''}
      </div>
    </div>
    <button onclick="this.parentElement.remove()" style="position:absolute;top:16px;right:16px;background:#fff;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer">×</button>`;
  document.body.appendChild(area);
};

// ── Marcar retirado ───────────────────────────────────────────────────────────
async function marcarRetirado(id, btn) {
  try {
    await supa('vales_materiales?id=eq.'+id, 'PATCH', {
      estado: 'Retirado',
      fecha_retiro: new Date().toISOString().slice(0,10)
    });
    toast('Marcado como retirado', 'ok');
    btn?.closest('[style*="fixed"]')?.remove();
    await cargarVales();
  } catch(e) { toast('Error: '+e.message, 'err'); }
}

// ══════════════════════════════════════════════════════════════════════════════
// IMPRESIÓN — formato idéntico al papel oficial
// ══════════════════════════════════════════════════════════════════════════════
function imprimirOT(ot) {
  if (!ot) return;
  document.getElementById('print-area').innerHTML = `
<style>
@media print { @page { size:A4 portrait; margin:18mm 15mm; } body { margin:0; } }
.ot-doc { font-family:Arial,sans-serif; font-size:11px; color:#000; line-height:1.5; }
.ot-linea { border-bottom:1px dashed #555; margin:9px 0 0; height:0; }
.ot-bloque { margin-top:16px; }
.ot-fila { display:flex; align-items:flex-end; gap:4px; margin-bottom:6px; }
.ot-fila b { font-size:10px; font-weight:bold; white-space:nowrap; }
.ot-raya { flex:1; border-bottom:1px dashed #555; margin-bottom:1px; }
</style>
<div class="ot-doc">
  <p style="margin:0 0 6px;font-size:9px">Departamento de Talleres</p>
  <p style="margin:0 0 14px;font-size:15px;font-weight:bold;padding-left:20px">O.T.: ${ot.numero_ot}</p>
  <div style="display:flex;justify-content:space-between;padding-left:20px">
    <div style="line-height:1.9">
      <div>Sección &nbsp;<b>${ot.seccion||''}</b></div>
      <div>R.I.: &nbsp;<b>${ot.ri||''}</b></div>
      <div>Dependencia: &nbsp;${ot.dependencia||''}</div>
      <div>Solicita: &nbsp;${ot.legajo_solicita||''} &nbsp;&nbsp; ${ot.nombre_solicita||''}</div>
    </div>
    <div style="text-align:right;line-height:1.9">
      <div>Fecha: &nbsp;${ot.fecha||''}</div>
      <div>Memo n°: &nbsp;${ot.memo||''}</div>
      <div>Odómetro: &nbsp;${ot.odometro||0}</div>
    </div>
  </div>
  <p style="margin:14px 0 18px;padding-left:20px">${(ot.descripcion||'').toUpperCase().replace(/\n/g,'<br>')}</p>

  <div class="ot-bloque">
    <div class="ot-fila"><b>TAREAS EFECTUADAS:</b><div class="ot-raya"></div></div>
    <div class="ot-linea"></div><div class="ot-linea"></div><div class="ot-linea"></div>
  </div>

  <div class="ot-bloque">
    <div class="ot-fila"><b>REPUESTOS/INSUMOS UTILIZADOS:</b><div class="ot-raya"></div></div>
    <div class="ot-linea"></div><div class="ot-linea"></div><div class="ot-linea"></div>
  </div>

  <div class="ot-bloque">
    <div class="ot-fila"><b>LEG. AGENTE INTERVINIENTES:</b><div class="ot-raya"></div></div>
  </div>
  <div style="margin-top:10px">
    <div class="ot-fila"><b>CANTIDAD DE HORAS UTILIZADASDAS:</b><div class="ot-raya"></div></div>
    <div class="ot-linea"></div>
  </div>

  <div style="margin-top:24px;display:flex;gap:40px">
    <span>Fecha y Hora Entrada: _______________</span>
    <span>Fecha y Hora Salida: _______________</span>
  </div>
  <div style="display:flex;gap:24px;margin-top:12px">
    <span>Firma: ____________</span>
    <span>Aclaración: ________________________</span>
    <span>Legajo: ______</span>
    <span>Fecha: ________</span>
  </div>
</div>`;
  setTimeout(() => window.print(), 200);
}

function imprimirVale(v) {
  if (!v) return;
  const num = String(v.numero_vale).padStart(7,'0');
  const itemsRows = (v.items||[]).map(i=>
    `<tr><td style="border:1px solid #000;padding:4px 6px;text-align:center">${i.cant}</td>
     <td style="border:1px solid #000;padding:4px 6px">${i.desc}</td></tr>`).join('');
  const vacias = Math.max(0, 6-(v.items||[]).length);
  const filasVacias = Array(vacias).fill(`<tr><td style="border:1px solid #000;height:22px"></td><td style="border:1px solid #000"></td></tr>`).join('');

  document.getElementById('print-area').innerHTML = `
<style>
@media print { @page { size:A4; margin:15mm; } body { font-family:Arial,sans-serif; font-size:11px; } }
.vale-doc { font-family:Arial,sans-serif; font-size:11px; }
.vfr { display:flex; border-top:1px solid #000; }
.vfc { flex:1; padding:6px; border-right:1px solid #000; font-size:10px; }
.vfc:last-child { border-right:none; }
</style>
<div class="vale-doc">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:10px">
    <div><p style="font-weight:bold;font-size:13px">MUNICIPALIDAD DE BAHÍA BLANCA</p><p style="font-size:10px">DEPARTAMENTO TALLERES</p></div>
    <div style="text-align:center"><p style="font-weight:bold;font-size:13px">VALE DE MATERIALES</p></div>
    <div style="font-weight:bold;font-size:16px">${num}</div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-bottom:10px">
    <div>
      <p>DEPENDENCIA: ${v.dependencia||''}</p>
      <p>CÓDIGO U.D. Nº: ${v.codigo_ud||''}</p>
      <p>CUENTAS DE GASTOS: ___________________________</p>
    </div>
    <div style="text-align:right">
      <p>O/T &nbsp; N° ${v.numero_ot||'___________'}</p><p>&nbsp;</p>
      <p>R.I. &nbsp; Letra <b>${(v.ri||'').charAt(0)}</b> &nbsp; N° <b>${(v.ri||'').slice(1)}</b></p>
    </div>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
    <thead><tr>
      <th style="border:1px solid #000;padding:4px;width:80px;text-align:center">CANTIDAD</th>
      <th style="border:1px solid #000;padding:4px;text-align:center">DESCRIPCIÓN</th>
    </tr></thead>
    <tbody>${itemsRows}${filasVacias}</tbody>
  </table>
  <div class="vfr"><div class="vfc" style="width:120px"><p style="font-weight:bold">FIRMA</p></div><div class="vfc"><p style="font-weight:bold">ACLARACIÓN</p></div><div class="vfc" style="width:100px"><p style="font-weight:bold">FECHA</p></div><div class="vfc" style="width:80px"><p style="font-weight:bold">HORA</p></div><div class="vfc"><p style="font-weight:bold">DEPTO. COMPRAS</p></div></div>
  <div class="vfr"><div class="vfc" style="height:40px"><p style="font-size:10px;color:#555">SOLICITA</p></div><div class="vfc"><p style="font-size:10px;color:#555">${v.nombre_solicita||''}</p></div><div class="vfc"><p style="font-size:10px;color:#555">${v.fecha||''}</p></div><div class="vfc"></div><div class="vfc"></div></div>
  <div class="vfr"><div class="vfc" style="height:40px"><p style="font-size:10px;color:#555">RETIRA</p></div><div class="vfc"></div><div class="vfc"></div><div class="vfc"></div><div class="vfc"></div></div>
</div>`;
  setTimeout(() => window.print(), 200);
}
