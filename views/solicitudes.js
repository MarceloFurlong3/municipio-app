// ══════════════════════════════════════════════════════════════════════════════
// views/solicitudes.js — Vista principal Solicitudes BHI / PIB
// ══════════════════════════════════════════════════════════════════════════════

import { apiFetch, apiPost, toast, esc } from '../shared.js';

let dataBHI = [];
let dataPIB = [];
let solicitudActual = null;

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  document.getElementById('tab-bhi').addEventListener('click', () => switchTab('bhi'));
  document.getElementById('tab-pib').addEventListener('click', () => switchTab('pib'));
  document.getElementById('btn-refresh').addEventListener('click', () => cargar(true));

  document.getElementById('buscar-bhi').addEventListener('input', () => renderCards('bhi'));
  document.getElementById('buscar-pib').addEventListener('input', () => renderCards('pib'));
  document.getElementById('filtro-estado-bhi').addEventListener('change', () => renderCards('bhi'));
  document.getElementById('filtro-estado-pib').addEventListener('change', () => renderCards('pib'));
  document.getElementById('orden-bhi').addEventListener('change', () => renderCards('bhi'));
  document.getElementById('orden-pib').addEventListener('change', () => renderCards('pib'));

  document.getElementById('modal-bg').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-bg')) cerrarModal();
  });

  cargar();
});

function switchTab(tab) {
  ['bhi','pib'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('activo', t === tab);
    document.getElementById(`panel-${t}`).classList.toggle('activo', t === tab);
  });
}

// ── CARGA ─────────────────────────────────────────────────────────────────────
async function cargar(forzar = false) {
  document.getElementById('btn-refresh').style.opacity = '.4';
  try {
    const datos = await apiFetch('getSolicitudes');
    if (datos.error) throw new Error(datos.error);
    dataBHI = datos.bhi || [];
    dataPIB = datos.pib || [];
    document.getElementById('badge-bhi').textContent = dataBHI.length;
    document.getElementById('badge-pib').textContent = dataPIB.length;
    renderCards('bhi');
    renderCards('pib');
    if (forzar) toast('✅ Actualizado', 'ok');
  } catch(e) {
    toast('❌ Error: ' + e.message, 'err');
    document.getElementById('cards-bhi').innerHTML = `<div class="empty">❌ ${e.message}</div>`;
    document.getElementById('cards-pib').innerHTML = `<div class="empty">❌ ${e.message}</div>`;
  }
  document.getElementById('btn-refresh').style.opacity = '1';
  if (window.lucide) lucide.createIcons();
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function agruparPor(arr, fn) {
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
  const p = String(fecha).split('/');
  if (p.length === 3) { const m = parseInt(p[1])-1; return (meses[m]||'Mes '+p[1])+' '+p[2]; }
  return fecha;
}

function letraRI(ri) {
  const s = String(ri||'').trim();
  if (!s) return 'Sin RI';
  const m = s.match(/^[A-ZÁÉÍÓÚa-záéíóú]+/);
  return m ? m[0].toUpperCase() : s.charAt(0).toUpperCase();
}

const ORDEN_ESTADO = { 'Iniciado': 0, 'pase a fisico': 1, 'Pendiente': 2 };
function ordenEstado(e) { return ORDEN_ESTADO[e] ?? 5; }

function fechaOrden(fecha) {
  if (!fecha) return '';
  const p = String(fecha).split('/');
  return p.length === 3 ? `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}` : fecha;
}

function sortDesc(arr) {
  return arr.slice().sort((a, b) => fechaOrden(b.fecha).localeCompare(fechaOrden(a.fecha)));
}

function sortMeses(keys) {
  return keys.slice().sort((a, b) => {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const parse = s => { const p = s.split(' '); return (parseInt(p[1])||0) * 100 + (meses.indexOf(p[0]) + 1); };
    return parse(b) - parse(a);
  });
}

function esURL(v) { return v && (String(v).startsWith('http://') || String(v).startsWith('https://')); }

// ── CHIPS ─────────────────────────────────────────────────────────────────────
function chipMemoVale(v, etiqueta) {
  if (!v) return '';
  const partes = String(v).split(/[\s,\n]+/).filter(Boolean);
  const urls = partes.filter(p => esURL(p));
  const texto = partes.filter(p => !esURL(p)).join(' ');
  let html = '';
  urls.forEach((url, i) => {
    html += `<a href="${url}" target="_blank" rel="noopener"
      class="card-chip warn card-chip-link"
      onclick="event.stopPropagation()">📄 ${etiqueta}${urls.length > 1 ? ' '+(i+1) : ''}</a>`;
  });
  if (texto) html += `<span class="card-chip warn">📄 ${etiqueta}: ${esc(texto)}</span>`;
  if (!urls.length && !texto) html = `<span class="card-chip warn">📄 ${etiqueta}: ${esc(v)}</span>`;
  return html;
}

function chipPresupuesto(v) {
  if (!v) return '';
  const partes = String(v).split(/[\s,\n]+/).filter(Boolean);
  const urls = partes.filter(p => esURL(p));
  const texto = partes.filter(p => !esURL(p)).join(' ');
  let html = '';
  if (urls.length === 1) {
    html += `<a href="${urls[0]}" target="_blank" rel="noopener"
      class="card-chip ok card-chip-link" onclick="event.stopPropagation()">📎 Presupuesto</a>`;
  } else if (urls.length > 1) {
    html += `<span class="card-chip ok">📎 ${urls.length} presupuestos</span>`;
  }
  if (texto) html += `<span class="card-chip ok">📎 ${esc(texto)}</span>`;
  return html;
}

// ── SELECTOR DE PRESUPUESTOS (para el modal) ──────────────────────────────────
function renderSelectorPresupuesto(v) {
  if (!v) return '<span style="color:#94a3b8">—</span>';
  const partes = String(v).split(/[\s,\n]+/).filter(Boolean);
  const urls = partes.filter(p => esURL(p));
  const texto = partes.filter(p => !esURL(p)).join(' ');

  if (urls.length === 0) return `<span style="font-size:12px;color:#0f172a">${esc(v)}</span>`;

  if (urls.length === 1) {
    return `<a href="${urls[0]}" target="_blank" rel="noopener"
      style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:#0b1b35;color:#fff;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none">
      📎 Ver presupuesto</a>`;
  }

  const options = urls.map((u, i) => `<option value="${u}">Presupuesto ${i+1}</option>`).join('');
  return `
    <div style="display:flex;gap:8px;align-items:center">
      <select id="pres-sel" style="flex:1;padding:9px 10px;border:1.5px solid #e2e8f4;border-radius:8px;font-family:'Barlow',sans-serif;font-size:12px;background:#fff;outline:none;color:#0f172a">
        ${options}
      </select>
      <button onclick="window.open(document.getElementById('pres-sel').value,'_blank')"
        style="padding:9px 16px;background:#0b1b35;color:#fff;border:none;border-radius:8px;font-family:'Barlow',sans-serif;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">
        Abrir ↗
      </button>
    </div>
    ${texto ? `<div style="font-size:11px;color:#94a3b8;margin-top:4px">${esc(texto)}</div>` : ''}`;
}

// ── TIMELINE DE ESTADOS ───────────────────────────────────────────────────────
function renderTimeline(sol) {
  const pasos = [
    { label: 'Iniciado',  fecha: sol.fecha_iniciado, clase: 'estado-iniciado' },
    { label: 'A Físico',  fecha: sol.fecha_fisico,   clase: 'estado-fisico'   },
  ];
  const tieneAlguna = pasos.some(p => p.fecha);
  if (!tieneAlguna) return '';

  const items = pasos.map(p => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
      <span class="card-estado ${p.fecha ? p.clase : ''}"
        style="${p.fecha ? '' : 'opacity:.3;background:#f1f5f9;color:#94a3b8'}">
        ${p.label}
      </span>
      <span style="font-size:10px;color:${p.fecha ? '#475569' : '#cbd5e1'};font-weight:600">
        ${p.fecha || '—'}
      </span>
    </div>
  `).join('<div style="width:1px;background:#e2e8f4;align-self:stretch;margin:4px 0"></div>');

  return `
    <div class="modal-field modal-detalle-full">
      <div class="modal-label">Historial de estados</div>
      <div style="display:flex;align-items:flex-start;gap:0;margin-top:6px;background:#f8fafd;border-radius:10px;padding:10px 8px;border:1px solid #e2e8f4">
        ${items}
      </div>
    </div>`;
}

// ── CARD HTML (limpia — solo info, sin forms) ─────────────────────────────────
function cardHTML(s, tipo) {
  const estadoClass = getEstadoClass(s.estado_flujo || s.estado);
  const estadoLabel = getEstadoLabel(s.estado_flujo || s.estado);
  const cardClass   = getCardClass(s);

  const chips = [];
  if (s.presupuesto) chips.push(chipPresupuesto(s.presupuesto));
  if (s.memo_vale)   chips.push(chipMemoVale(s.memo_vale, tipo === 'pib' ? 'Vale' : 'Memo'));

  const rechazoHTML = s.rechazo
    ? `<div style="display:flex;align-items:center;gap:6px;margin-top:8px;padding:6px 10px;background:#fff8f8;border-radius:8px;border:1px solid #fca5a5">
        <span style="font-size:13px">⛔</span>
        <span style="font-size:11px;font-weight:700;color:#dc2626">${esc(s.rechazo)}</span>
       </div>`
    : '';

  return `
    <div class="card ${cardClass}" data-fila="${s.fila}">
      <div class="card-header">
        <span class="card-id ${tipo}">${esc(s.id)}</span>
        <span class="card-estado ${estadoClass}">${estadoLabel}</span>
        <span class="card-fecha">${esc(s.fecha)}</span>
      </div>
      <div class="card-ri-grande">${esc(s.ri || '—')}</div>
      <div class="card-oficina">${esc(s.oficina || '—')}</div>
      <div class="card-detalle">${esc(s.detalle || '—')}</div>
      ${chips.length ? `<div class="card-footer">${chips.join('')}</div>` : ''}
      ${rechazoHTML}
    </div>`;
}

// ── RENDER GRUPOS ─────────────────────────────────────────────────────────────
function renderGrupos(lista, tipo, orden) {
  const estadoEmoji = { 'Iniciado':'🟢', 'Pase a Firma':'🔵', 'aprobado':'✅', 'pase a fisico':'🟠', 'Pendiente':'⏳' };
  let html = '';

  if (orden === 'sector') {
    const grupos = agruparPor(lista, s => s.oficina || 'Sin sección');
    Object.keys(grupos).sort().forEach(k => {
      html += `<div class="grp-estado"><div class="grp-estado-lbl">🏢 ${k} <span class="grp-count">${grupos[k].length}</span></div><div class="cards">`;
      sortDesc(grupos[k]).forEach(s => { html += cardHTML(s, tipo); });
      html += `</div></div>`;
    });
  } else if (orden === 'fecha') {
    const grupos = agruparPor(sortDesc(lista), s => mesDesFecha(s.fecha));
    sortMeses(Object.keys(grupos)).forEach(k => {
      html += `<div class="grp-estado"><div class="grp-estado-lbl">📅 ${k} <span class="grp-count">${grupos[k].length}</span></div><div class="cards">`;
      grupos[k].forEach(s => { html += cardHTML(s, tipo); });
      html += `</div></div>`;
    });
  } else if (orden === 'ri') {
    const grupos = agruparPor(lista, s => letraRI(s.ri));
    Object.keys(grupos).sort().forEach(k => {
      html += `<div class="grp-estado"><div class="grp-estado-lbl"><span class="grp-ri-lbl" style="font-size:13px">RI: ${k}</span> <span class="grp-count">${grupos[k].length}</span></div><div class="cards">`;
      sortDesc(grupos[k]).forEach(s => { html += cardHTML(s, tipo); });
      html += `</div></div>`;
    });
  } else {
    const porEstado = agruparPor(lista, s => s.estado_flujo || s.estado || 'Pendiente');
    Object.keys(porEstado).sort((a,b) => ordenEstado(a)-ordenEstado(b)).forEach(estado => {
      html += `<div class="grp-estado"><div class="grp-estado-lbl">${estadoEmoji[estado]||'•'} ${getEstadoLabel(estado)} <span class="grp-count">${porEstado[estado].length}</span></div>`;
      const porMes = agruparPor(sortDesc(porEstado[estado]), s => mesDesFecha(s.fecha));
      sortMeses(Object.keys(porMes)).forEach(mes => {
        html += `<div class="grp-mes"><div class="grp-mes-lbl">📅 ${mes}</div>`;
        const porSec = agruparPor(porMes[mes], s => s.oficina || 'Sin sección');
        Object.keys(porSec).sort().forEach(sec => {
          html += `<div class="grp-sec"><div class="grp-sec-lbl">🏢 ${sec}</div>`;
          const porRI = agruparPor(porSec[sec], s => letraRI(s.ri));
          Object.keys(porRI).sort().forEach(letra => {
            html += `<div class="grp-ri"><span class="grp-ri-lbl">RI: ${letra}</span><div class="cards">`;
            porRI[letra].forEach(s => { html += cardHTML(s, tipo); });
            html += `</div></div>`;
          });
          html += `</div>`;
        });
        html += `</div>`;
      });
      html += `</div>`;
    });
  }
  return html;
}

function renderCards(tipo) {
  const data    = tipo === 'bhi' ? dataBHI : dataPIB;
  const q       = (document.getElementById(`buscar-${tipo}`).value || '').toLowerCase();
  const filtroE = document.getElementById(`filtro-estado-${tipo}`).value;
  const cont    = document.getElementById(`cards-${tipo}`);

  let lista = data.filter(s => {
    const texto = `${s.id} ${s.ri} ${s.oficina} ${s.detalle} ${s.memo_vale}`.toLowerCase();
    const okQ   = !q || texto.includes(q);
    const estadoEfectivo = s.estado_flujo || s.estado || 'Pendiente';
    const okE   = !filtroE || estadoEfectivo === filtroE;
    return okQ && okE;
  });

  if (lista.length === 0) {
    cont.innerHTML = `<div class="empty"><i data-lucide="inbox"></i>Sin solicitudes</div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const orden = (document.getElementById(`orden-${tipo}`)?.value) || (tipo === 'bhi' ? 'sector' : 'estado');
  cont.innerHTML = renderGrupos(lista, tipo, orden);
  cont.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => abrirModal(card.dataset.fila, tipo));
  });
  if (window.lucide) lucide.createIcons();
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function abrirModal(fila, tipo) {
  const data = tipo === 'bhi' ? dataBHI : dataPIB;
  const sol  = data.find(s => String(s.fila) === String(fila));
  if (!sol) return;
  solicitudActual = { ...sol, tipo };

  document.getElementById('modal-id').textContent    = sol.id;
  document.getElementById('modal-id').className      = `modal-id ${tipo}`;
  document.getElementById('modal-fecha').textContent  = sol.fecha;

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-row">
      <div class="modal-field">
        <div class="modal-label">RI</div>
        <div class="modal-val" style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800">${esc(sol.ri||'—')}</div>
      </div>
      <div class="modal-field">
        <div class="modal-label">Estado</div>
        <div class="modal-val"><span class="card-estado ${getEstadoClass(sol.estado_flujo||sol.estado)}">${getEstadoLabel(sol.estado_flujo||sol.estado)}</span></div>
      </div>
      <div class="modal-field">
        <div class="modal-label">Aprobado</div>
        <div class="modal-val">${sol.aprobado ? '✅ Sí' : '⏳ No'}</div>
      </div>
    </div>

    <div class="modal-field modal-detalle-full">
      <div class="modal-label">Oficina / Sección</div>
      <div class="modal-val">${esc(sol.oficina||'—')}</div>
    </div>

    <div class="modal-field modal-detalle-full">
      <div class="modal-label">Detalle del pedido</div>
      <div class="modal-val" style="white-space:pre-wrap">${esc(sol.detalle||'—')}</div>
    </div>

    <div class="modal-row">
      <div class="modal-field">
        <div class="modal-label">Memo / Vale</div>
        <div class="modal-val">${chipMemoVale(sol.memo_vale, tipo==='pib'?'Vale':'Memo') || esc(sol.memo_vale||'—')}</div>
      </div>
      <div class="modal-field">
        <div class="modal-label">Presupuesto</div>
        <div class="modal-val">${renderSelectorPresupuesto(sol.presupuesto)}</div>
      </div>
    </div>

    <div class="modal-row">
      <div class="modal-field">
        <div class="modal-label">N° Suministro</div>
        <input class="card-edit-inp" id="modal-suministro" value="${esc(sol.num_suministro||'')}" placeholder="—"
          style="width:100%;margin-top:4px"
          onchange="window._guardarSuministroModal(this)">
      </div>
      <div class="modal-field">
        <div class="modal-label">Orden de Compra</div>
        <input class="card-edit-inp" id="modal-oc" value="${esc(sol.oc||'')}" placeholder="—"
          style="width:100%;margin-top:4px"
          onchange="window._guardarOCModal(this)">
      </div>
    </div>

    ${sol.observaciones ? `
    <div class="modal-field modal-detalle-full">
      <div class="modal-label">Observaciones</div>
      <div class="modal-val" style="white-space:pre-wrap">${esc(sol.observaciones)}</div>
    </div>` : ''}

    ${sol.rechazo ? `
    <div class="modal-field modal-detalle-full">
      <div class="modal-label" style="color:#dc2626">Motivo de rechazo</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px;padding:10px 12px;background:#fff8f8;border-radius:10px;border:1.5px solid #fca5a5">
        <span style="font-size:13px;font-weight:700;color:#dc2626">⛔ ${esc(sol.rechazo)}</span>
        <button onclick="window._limpiarRechazo()"
          style="padding:5px 12px;background:#fff;border:1.5px solid #fca5a5;border-radius:7px;font-size:11px;font-weight:700;color:#dc2626;cursor:pointer">
          Limpiar
        </button>
      </div>
    </div>` : ''}

    ${renderTimeline(sol)}
  `;

  renderAcciones(sol);
  document.getElementById('modal-bg').classList.add('open');
  if (window.lucide) lucide.createIcons();
}

function cerrarModal() {
  document.getElementById('modal-bg').classList.remove('open');
  solicitudActual = null;
}

function renderAcciones(sol) {
  const cont   = document.getElementById('modal-acciones');
  const flujo  = sol.estado_flujo || '';
  const aprobado = sol.aprobado;
  const btns   = [];

  btns.push(`<div class="modal-acciones-title">Acciones</div>`);

  // Flujo simplificado: 2 pasos solamente
  if (!flujo || flujo === 'Pendiente' || flujo === 'Pase a Firma') {
    btns.push(`<button class="btn-accion btn-iniciado" onclick="window._cambiarEstado('Iniciado')"><i data-lucide="play-circle"></i>Iniciar</button>`);
  }
  if (flujo === 'Iniciado') {
    btns.push(`<button class="btn-accion btn-fisico" onclick="window._cambiarEstado('pase a fisico')"><i data-lucide="package-check"></i>Pase a Físico</button>`);
  }

  if (flujo !== 'pase a fisico') {
    btns.push(`
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn-accion btn-rechazar" style="flex:1" onclick="window._rechazar('Falta Memo')"><i data-lucide="file-x"></i>Sin Memo</button>
        <button class="btn-accion btn-rechazar" style="flex:1" onclick="window._rechazar('Falta Presupuesto')"><i data-lucide="file-x-2"></i>Sin Pres.</button>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-accion btn-rechazar" style="flex:1" onclick="window._rechazar('Actualizar Presupuesto')"><i data-lucide="refresh-ccw"></i>Actualizar Pres.</button>
        <button class="btn-accion btn-rechazar" style="flex:1" onclick="window._rechazarMotivo()"><i data-lucide="x-circle"></i>Otro motivo</button>
      </div>
    `);
  }

  btns.push(`<button class="btn-accion" style="background:#fee2e2;color:#991b1b;margin-top:8px" onclick="window._eliminar()"><i data-lucide="trash-2"></i>Eliminar pedido</button>`);

  cont.innerHTML = btns.join('');
  if (window.lucide) lucide.createIcons();
}

// ── ACCIONES ──────────────────────────────────────────────────────────────────
function setBtnLoading(loading) {
  document.querySelectorAll('#modal-acciones .btn-accion').forEach(b => {
    if (loading) {
      b._orig = b.innerHTML;
      b.innerHTML = '<span style="display:inline-block;animation:spin .7s linear infinite">⏳</span> Cargando...';
      b.disabled = true;
    } else {
      if (b._orig) b.innerHTML = b._orig;
      b.disabled = false;
    }
  });
}

window._aprobar = async function() {
  if (!solicitudActual) return;
  const tipo = solicitudActual.tipo;
  setBtnLoading(true);
  try {
    const r = await apiPost({ action: 'aprobar', fila: solicitudActual.fila, valor: true });
    if (r.error) throw new Error(r.error);
    toast('✅ Aprobado', 'ok');
    solicitudActual.aprobado = true;
    actualizarLocal(solicitudActual);
    cerrarModal();
    renderCards(tipo);
  } catch(e) { setBtnLoading(false); toast('❌ ' + e.message, 'err'); }
};

window._cambiarEstado = async function(estado) {
  if (!solicitudActual) return;
  const tipo = solicitudActual.tipo;

  // Si no tiene suministro → pedirlo antes de Iniciar
  if (estado === 'Iniciado' && (!solicitudActual.num_suministro || solicitudActual.num_suministro === 'Pendiente')) {
    const inp = document.getElementById('modal-suministro');
    const num = inp ? inp.value.trim() : '';
    if (!num) {
      toast('⚠️ Ingresá el N° de Suministro primero', 'err');
      if (inp) inp.focus();
      return;
    }
    solicitudActual.num_suministro = num;
    setBtnLoading(true);
    const rs = await apiPost({ action: 'setSuministro', fila: solicitudActual.fila, valor: num });
    if (rs.error) { setBtnLoading(false); toast('❌ Error al guardar suministro', 'err'); return; }
  }

  // Si no tiene OC → pedirla antes de Pase a Físico
  if (estado === 'pase a fisico' && (!solicitudActual.oc || solicitudActual.oc === 'Pendiente')) {
    const oc = prompt('N° de Orden de Compra:');
    if (!oc || !oc.trim()) { toast('⚠️ Ingresá la Orden de Compra primero', 'err'); return; }
    solicitudActual.oc = oc.trim();
    setBtnLoading(true);
    const ro = await apiPost({ action: 'setOrdenCompra', fila: solicitudActual.fila, valor: oc.trim() });
    if (ro.error) { setBtnLoading(false); toast('❌ Error al guardar OC', 'err'); return; }
  } else {
    setBtnLoading(true);
  }

  try {
    const r = await apiPost({ action: 'cambiarEstado', fila: solicitudActual.fila, estado });
    if (r.error) throw new Error(r.error);
    toast('✅ ' + getEstadoLabel(estado), 'ok');
    solicitudActual.estado_flujo = estado;
    actualizarLocal(solicitudActual);
    cerrarModal();
    renderCards(tipo);
  } catch(e) { setBtnLoading(false); toast('❌ ' + e.message, 'err'); }
};

window._rechazar = async function(motivo) {
  if (!solicitudActual) return;
  if (!confirm(`¿Rechazar por "${motivo}"?`)) return;
  const tipo = solicitudActual.tipo;
  setBtnLoading(true);
  try {
    const r = await apiPost({ action: 'rechazar', fila: solicitudActual.fila, motivo });
    if (r.error) throw new Error(r.error);
    toast('Rechazado: ' + motivo, 'err');
    solicitudActual.rechazo = motivo;
    actualizarLocal(solicitudActual);
    cerrarModal();
    renderCards(tipo);
  } catch(e) { setBtnLoading(false); toast('❌ ' + e.message, 'err'); }
};

window._rechazarMotivo = async function() {
  const motivo = prompt('Escribí el motivo del rechazo:');
  if (!motivo || !motivo.trim()) return;
  if (!solicitudActual) return;
  const tipo = solicitudActual.tipo;
  setBtnLoading(true);
  try {
    // Bug fix: guardar el texto real en observaciones (Col N) + rechazar con 'Motivo Escrito'
    const r = await apiPost({ action: 'rechazar', fila: solicitudActual.fila, motivo: 'Motivo Escrito', detalle: motivo.trim() });
    if (r.error) throw new Error(r.error);
    toast('Rechazado', 'err');
    solicitudActual.rechazo = 'Motivo Escrito';
    solicitudActual.observaciones = motivo.trim();
    actualizarLocal(solicitudActual);
    cerrarModal();
    renderCards(tipo);
  } catch(e) { setBtnLoading(false); toast('❌ ' + e.message, 'err'); }
};

window._limpiarRechazo = async function() {
  if (!solicitudActual) return;
  if (!confirm('¿Limpiar el rechazo y reactivar la solicitud?')) return;
  const tipo = solicitudActual.tipo;
  setBtnLoading(true);
  try {
    const r = await apiPost({ action: 'limpiarRechazo', fila: solicitudActual.fila });
    if (r.error) throw new Error(r.error);
    toast('✅ Rechazo limpiado', 'ok');
    solicitudActual.rechazo = '';
    actualizarLocal(solicitudActual);
    cerrarModal();
    renderCards(tipo);
  } catch(e) { setBtnLoading(false); toast('❌ ' + e.message, 'err'); }
};

window._guardarSuministroModal = async function(input) {
  if (!solicitudActual) return;
  const valor = input.value.trim();
  input.disabled = true;
  try {
    const r = await apiPost({ action: 'setSuministro', fila: solicitudActual.fila, valor });
    if (r.error) throw new Error(r.error);
    solicitudActual.num_suministro = valor;
    actualizarLocal(solicitudActual);
    input.classList.add('guardado');
    setTimeout(() => input.classList.remove('guardado'), 2000);
    toast('✅ Suministro guardado', 'ok');
  } catch(e) { toast('❌ ' + e.message, 'err'); }
  input.disabled = false;
};

window._guardarOCModal = async function(input) {
  if (!solicitudActual) return;
  const valor = input.value.trim();
  input.disabled = true;
  try {
    const r = await apiPost({ action: 'setOrdenCompra', fila: solicitudActual.fila, valor });
    if (r.error) throw new Error(r.error);
    solicitudActual.oc = valor;
    actualizarLocal(solicitudActual);
    input.classList.add('guardado');
    setTimeout(() => input.classList.remove('guardado'), 2000);
    toast('✅ OC guardada', 'ok');
  } catch(e) { toast('❌ ' + e.message, 'err'); }
  input.disabled = false;
};

// ── ELIMINAR (soft delete → basurero) ────────────────────────────────────────
window._eliminar = async function() {
  if (!solicitudActual) return;
  if (!confirm(`¿Eliminar "${solicitudActual.id}"?\nVa al basurero — podés recuperarlo después.`)) return;
  const tipo = solicitudActual.tipo;
  setBtnLoading(true);
  try {
    const r = await apiPost({ action: 'eliminarSolicitud', fila: solicitudActual.fila });
    if (r.error) throw new Error(r.error);
    toast('🗑 Movido al basurero', 'ok');
    // Quitar de la lista local
    if (tipo === 'bhi') dataBHI = dataBHI.filter(s => s.fila !== solicitudActual.fila);
    else dataPIB = dataPIB.filter(s => s.fila !== solicitudActual.fila);
    cerrarModal();
    renderCards(tipo);
  } catch(e) { setBtnLoading(false); toast('❌ ' + e.message, 'err'); }
};

// ── BASURERO ──────────────────────────────────────────────────────────────────
window.abrirBasurero = async function() {
  const overlay = document.createElement('div');
  overlay.id = 'bas-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:600;display:flex;align-items:flex-end;justify-content:center';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:18px 18px 0 0;width:100%;max-width:600px;padding:20px;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="font-size:16px;font-weight:800">🗑 Basurero</div>
        <button onclick="document.getElementById('bas-overlay').remove()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#64748b">×</button>
      </div>
      <div id="bas-lista"><div style="text-align:center;padding:20px;color:#94a3b8">Cargando...</div></div>
    </div>`;
  document.body.appendChild(overlay);

  try {
    const r = await apiPost({ action: 'getEliminadas' });
    const lista = r.eliminadas || [];
    const el = document.getElementById('bas-lista');
    if (!lista.length) {
      el.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8">El basurero está vacío</div>';
      return;
    }
    el.innerHTML = lista.map(s => `
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:14px;font-weight:800;color:#0b1b35">${s.id}</span>
          <span style="font-size:10px;color:#94a3b8">Eliminado: ${s.fecha_eliminacion}</span>
        </div>
        <div style="font-size:12px;color:#334155">RI: ${s.ri||'—'} · ${s.oficina||'—'}</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">${s.detalle||''}</div>
        <button onclick="window._recuperar(${s.fila_bas})"
          style="margin-top:10px;width:100%;padding:8px;background:#dcfce7;color:#166534;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">
          ↩ Recuperar
        </button>
      </div>`).join('');
  } catch(e) {
    document.getElementById('bas-lista').innerHTML = '<div style="color:#ef4444;padding:20px">Error al cargar</div>';
  }
};

window._recuperar = async function(fila_bas) {
  if (!confirm('¿Recuperar esta solicitud?')) return;
  try {
    const r = await apiPost({ action: 'recuperarSolicitud', fila: fila_bas });
    if (r.error) throw new Error(r.error);
    toast('✅ Solicitud recuperada', 'ok');
    document.getElementById('bas-overlay')?.remove();
    await cargar(true);
  } catch(e) { toast('❌ ' + e.message, 'err'); }
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function actualizarLocal(sol) {
  const arr = sol.tipo === 'bhi' ? dataBHI : dataPIB;
  const idx = arr.findIndex(s => s.fila === sol.fila);
  if (idx >= 0) arr[idx] = { ...sol };
}

function getEstadoClass(e) {
  if (!e || e === 'Pendiente') return 'estado-pendiente';
  if (e === 'Pase a Firma')   return 'estado-pase-firma';
  if (e === 'Iniciado')       return 'estado-iniciado';
  if (e === 'aprobado')       return 'estado-aprobado';
  if (e === 'pase a fisico')  return 'estado-fisico';
  return 'estado-pendiente';
}

function getEstadoLabel(e) {
  if (!e || e === 'Pendiente') return 'Pendiente';
  if (e === 'pase a fisico')   return 'Pase a Físico';
  if (e === 'aprobado')        return 'Aprobado';
  return e;
}

function getCardClass(s) {
  const e = s.estado_flujo || s.estado || '';
  if (s.rechazo) return 'rechazado';
  if (e === 'pase a fisico') return 'finalizado';
  if (e === 'Iniciado' || e === 'aprobado' || e === 'Pase a Firma') return 'en-proceso';
  return '';
}
