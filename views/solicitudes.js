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

// ── RENDER CARDS ──────────────────────────────────────────────────────────────
function renderCards(tipo) {
  const data    = tipo === 'bhi' ? dataBHI : dataPIB;
  const q       = (document.getElementById(`buscar-${tipo}`).value || '').toLowerCase();
  const filtroE = document.getElementById(`filtro-estado-${tipo}`).value;
  const cont    = document.getElementById(`cards-${tipo}`);

  let lista = data.filter(s => {
    const texto = `${s.id} ${s.ri} ${s.oficina} ${s.detalle} ${s.memo_vale}`.toLowerCase();
    const okQ   = !q || texto.includes(q);
    const okE   = !filtroE || s.estado_flujo === filtroE || s.estado === filtroE;
    return okQ && okE;
  });

  if (lista.length === 0) {
    cont.innerHTML = `<div class="empty"><i data-lucide="inbox"></i>Sin solicitudes</div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  cont.innerHTML = lista.map(s => cardHTML(s, tipo)).join('');
  cont.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => abrirModal(card.dataset.fila, tipo));
  });
  if (window.lucide) lucide.createIcons();
}

function cardHTML(s, tipo) {
  const estadoClass = getEstadoClass(s.estado_flujo || s.estado);
  const estadoLabel = getEstadoLabel(s.estado_flujo || s.estado);
  const cardClass   = getCardClass(s);

  const chips = [];
  if (s.ri)          chips.push(`<span class="card-chip">RI: ${esc(s.ri)}</span>`);
  if (s.presupuesto) chips.push(`<span class="card-chip ok">PRES: ${esc(s.presupuesto)}</span>`);
  if (s.suministro)  chips.push(`<span class="card-chip oc">OC: ${esc(s.suministro)}</span>`);
  if (s.memo_vale)   chips.push(`<span class="card-chip warn">${esc(s.memo_vale)}</span>`);

  return `
    <div class="card ${cardClass}" data-fila="${s.fila}">
      <div class="card-header">
        <span class="card-id ${tipo}">${esc(s.id)}</span>
        <span class="card-estado ${estadoClass}">${estadoLabel}</span>
        <span class="card-fecha">${esc(s.fecha)}</span>
      </div>
      <div class="card-oficina">${esc(s.oficina || '—')}</div>
      <div class="card-detalle">${esc(s.detalle || '—')}</div>
      ${chips.length ? `<div class="card-footer">${chips.join('')}</div>` : ''}
    </div>`;
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function abrirModal(fila, tipo) {
  const data = tipo === 'bhi' ? dataBHI : dataPIB;
  const sol  = data.find(s => String(s.fila) === String(fila));
  if (!sol) return;
  solicitudActual = { ...sol, tipo };

  document.getElementById('modal-id').textContent   = sol.id;
  document.getElementById('modal-id').className     = `modal-id ${tipo}`;
  document.getElementById('modal-fecha').textContent = sol.fecha;

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-row">
      <div class="modal-field"><div class="modal-label">RI</div><div class="modal-val">${esc(sol.ri||'—')}</div></div>
      <div class="modal-field"><div class="modal-label">Estado</div><div class="modal-val"><span class="card-estado ${getEstadoClass(sol.estado_flujo||sol.estado)}">${getEstadoLabel(sol.estado_flujo||sol.estado)}</span></div></div>
    </div>
    <div class="modal-row">
      <div class="modal-field"><div class="modal-label">Memo / Vale</div><div class="modal-val">${esc(sol.memo_vale||'—')}</div></div>
      <div class="modal-field"><div class="modal-label">Presupuesto</div><div class="modal-val">${esc(sol.presupuesto||'—')}</div></div>
    </div>
    <div class="modal-row">
      <div class="modal-field"><div class="modal-label">N° Suministro / OC</div><div class="modal-val">${esc(sol.suministro||'—')}</div></div>
      <div class="modal-field"><div class="modal-label">Aprobado carga</div><div class="modal-val">${sol.aprobado ? '✅ Sí' : '⏳ No'}</div></div>
    </div>
    <div class="modal-field modal-detalle-full"><div class="modal-label">Oficina / Sección</div><div class="modal-val">${esc(sol.oficina||'—')}</div></div>
    <div class="modal-field modal-detalle-full"><div class="modal-label">Detalle del pedido</div><div class="modal-val">${esc(sol.detalle||'—')}</div></div>
    <div class="modal-field modal-detalle-full"><div class="modal-label">Observaciones</div><div class="modal-val">${esc(sol.observaciones||'—')}</div></div>
    ${sol.rechazo ? `<div class="modal-field modal-detalle-full"><div class="modal-label" style="color:#dc2626">Rechazo</div><div class="modal-val" style="color:#dc2626">${esc(sol.rechazo)}</div></div>` : ''}
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
  const cont = document.getElementById('modal-acciones');
  const flujo = sol.estado_flujo || '';
  const aprobado = sol.aprobado;
  const btns = [];

  btns.push(`<div class="modal-acciones-title">Acciones</div>`);

  // Aprobar carga (col F)
  if (!aprobado) {
    btns.push(`<button class="btn-accion btn-aprobar" onclick="window._aprobar()"><i data-lucide="check-circle"></i>Aprobar carga</button>`);
  }

  // Flujo de estados (col I) — solo si está aprobado
  if (aprobado) {
    if (!flujo || flujo === 'Pendiente') {
      btns.push(`<button class="btn-accion btn-firma" onclick="window._cambiarEstado('Pase a Firma')"><i data-lucide="file-signature"></i>Pase a Firma</button>`);
    }
    if (flujo === 'Pase a Firma') {
      btns.push(`<button class="btn-accion btn-iniciado" onclick="window._cambiarEstado('Iniciado')"><i data-lucide="play-circle"></i>Marcar Iniciado</button>`);
    }
    if (flujo === 'Iniciado') {
      btns.push(`<button class="btn-accion btn-aprobado" onclick="window._cambiarEstado('aprobado')"><i data-lucide="thumbs-up"></i>Aprobar</button>`);
    }
    if (flujo === 'aprobado') {
      btns.push(`<button class="btn-accion btn-fisico" onclick="window._cambiarEstado('pase a fisico')"><i data-lucide="package-check"></i>Pase a Físico</button>`);
    }
  }

  // Rechazos (col J)
  if (flujo !== 'pase a fisico') {
    btns.push(`
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn-accion btn-rechazar" style="flex:1" onclick="window._rechazar('Falta Memo')"><i data-lucide="file-x"></i>Sin Memo</button>
        <button class="btn-accion btn-rechazar" style="flex:1" onclick="window._rechazar('Falta Presupuesto')"><i data-lucide="file-x-2"></i>Sin Pres.</button>
      </div>
      <button class="btn-accion btn-rechazar" onclick="window._rechazarMotivo()"><i data-lucide="x-circle"></i>Rechazar con motivo</button>
    `);
  }

  cont.innerHTML = btns.join('');
  if (window.lucide) lucide.createIcons();
}

// ── ACCIONES ──────────────────────────────────────────────────────────────────
window._aprobar = async function() {
  if (!solicitudActual) return;
  try {
    const r = await apiPost({ action: 'aprobar', fila: solicitudActual.fila, valor: true });
    if (r.error) throw new Error(r.error);
    toast('✅ Aprobado', 'ok');
    solicitudActual.aprobado = true;
    actualizarLocal(solicitudActual);
    cerrarModal();
    renderCards(solicitudActual.tipo);
  } catch(e) { toast('❌ ' + e.message, 'err'); }
};

window._cambiarEstado = async function(estado) {
  if (!solicitudActual) return;
  try {
    const r = await apiPost({ action: 'cambiarEstado', fila: solicitudActual.fila, estado });
    if (r.error) throw new Error(r.error);
    toast('✅ Estado: ' + estado, 'ok');
    solicitudActual.estado_flujo = estado;
    actualizarLocal(solicitudActual);
    cerrarModal();
    renderCards(solicitudActual.tipo);
  } catch(e) { toast('❌ ' + e.message, 'err'); }
};

window._rechazar = async function(motivo) {
  if (!solicitudActual) return;
  if (!confirm(`¿Rechazar por "${motivo}"?`)) return;
  try {
    const r = await apiPost({ action: 'rechazar', fila: solicitudActual.fila, motivo });
    if (r.error) throw new Error(r.error);
    toast('Rechazado: ' + motivo, 'err');
    solicitudActual.rechazo = motivo;
    actualizarLocal(solicitudActual);
    cerrarModal();
    renderCards(solicitudActual.tipo);
  } catch(e) { toast('❌ ' + e.message, 'err'); }
};

window._rechazarMotivo = async function() {
  const motivo = prompt('Escribí el motivo del rechazo:');
  if (!motivo) return;
  if (!solicitudActual) return;
  try {
    const r = await apiPost({ action: 'rechazar', fila: solicitudActual.fila, motivo: 'Motivo Escrito' });
    if (r.error) throw new Error(r.error);
    toast('Rechazado', 'err');
    solicitudActual.rechazo = motivo;
    actualizarLocal(solicitudActual);
    cerrarModal();
    renderCards(solicitudActual.tipo);
  } catch(e) { toast('❌ ' + e.message, 'err'); }
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function actualizarLocal(sol) {
  const arr  = sol.tipo === 'bhi' ? dataBHI : dataPIB;
  const idx  = arr.findIndex(s => s.fila === sol.fila);
  if (idx >= 0) arr[idx] = { ...sol };
}

function getEstadoClass(e) {
  if (!e || e === 'Pendiente') return 'estado-pendiente';
  if (e === 'Pase a Firma')   return 'estado-pase-firma';
  if (e === 'Iniciado')       return 'estado-iniciado';
  if (e === 'aprobado')       return 'estado-aprobado';
  if (e === 'pase a fisico')  return 'estado-fisico';
  if (e.toLowerCase().includes('rechazo') || e.toLowerCase().includes('falta')) return 'estado-rechazado';
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
