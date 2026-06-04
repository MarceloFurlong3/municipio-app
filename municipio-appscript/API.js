// ══════════════════════════════════════════════════════════════════════════════
// API.js — Endpoints REST para la PWA Municipio App
// ══════════════════════════════════════════════════════════════════════════════

const SS_URL = "https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit";
const HOJA_SOL = "Solicitudes Generales";

function getSpreadsheet() {
  return SpreadsheetApp.openByUrl(SS_URL);
}

function respJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── doGet ─────────────────────────────────────────────────────────────────────
function doGetAPI(e) {
  const action = e.parameter.action;

  if (action === 'getSolicitudes')   return respJSON(getSolicitudes());
  if (action === 'getSolicitud')     return respJSON(getSolicitud(e.parameter.id));
  if (action === 'getDeposito')      return respJSON(getDeposito());

  return respJSON({ error: 'accion invalida' });
}

// ── doPost ────────────────────────────────────────────────────────────────────
function doPostAPI(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'aprobar')        return respJSON(aprobarSolicitud(data.fila, data.valor));
  if (data.action === 'cambiarEstado')  return respJSON(cambiarEstado(data.fila, data.estado));
  if (data.action === 'rechazar')       return respJSON(rechazarSolicitud(data.fila, data.motivo));
  if (data.action === 'setOC')          return respJSON(setOrdenCompra(data.fila, data.oc, data.proveedor));

  return respJSON({ error: 'accion invalida' });
}

// ── LEER SOLICITUDES (Cols A-N = 1-14) ───────────────────────────────────────
function getSolicitudes() {
  try {
    const sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return { bhi: [], pib: [] };

    const rows = sh.getRange(2, 1, lastRow - 1, 14).getDisplayValues();
    const bhi = [], pib = [];

    rows.forEach(function(r, i) {
      var id = String(r[0]).trim();
      if (!id) return;

      var sol = {
        fila:        i + 2,
        id:          id,
        fecha:       r[1],
        ri:          r[2],
        memo_vale:   r[3],
        presupuesto: r[4],
        aprobado:    r[5] === 'TRUE' || r[5] === 'VERDADERO' || r[5] === true,
        tipo_oc:     r[6],
        num_suministro: r[7],   // Col H
        estado_flujo:   r[8],   // Col I
        rechazo:        r[9],   // Col J
        oc:             r[10],  // Col K — Orden de Compra
        oficina:        r[11],  // Col L
        detalle:        r[12],  // Col M
        observaciones:  r[13]   // Col N
      };

      if (id.toUpperCase().startsWith('BHI')) bhi.push(sol);
      else if (id.toUpperCase().startsWith('PIB')) pib.push(sol);
    });

    return { bhi: bhi, pib: pib };
  } catch(err) {
    return { error: err.message };
  }
}

// ── LEER UNA SOLICITUD ────────────────────────────────────────────────────────
function getSolicitud(id) {
  try {
    const sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 14).getDisplayValues();
    var found = null;
    rows.forEach(function(r, i) {
      if (String(r[0]).trim().toUpperCase() === String(id).toUpperCase()) {
        found = { fila: i + 2, id: r[0], fecha: r[1], ri: r[2], memo_vale: r[3],
          presupuesto: r[4], aprobado: r[5], tipo_oc: r[6], estado: r[7],
          estado_flujo: r[8], rechazo: r[9], suministro: r[10],
          oficina: r[11], detalle: r[12], observaciones: r[13] };
      }
    });
    return found || { error: 'No encontrado' };
  } catch(err) {
    return { error: err.message };
  }
}

// ── APROBAR (Col F = checkbox) ────────────────────────────────────────────────
function aprobarSolicitud(fila, valor) {
  try {
    var sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    sh.getRange(fila, 6).setValue(valor === true || valor === 'true');
    return { ok: true };
  } catch(err) { return { error: err.message }; }
}

// ── CAMBIAR ESTADO FLUJO (Col I) ──────────────────────────────────────────────
function cambiarEstado(fila, estado) {
  var estados = ['Pase a Firma', 'Iniciado', 'aprobado', 'pase a fisico'];
  if (estados.indexOf(estado) === -1) return { error: 'Estado inválido' };
  try {
    var sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    sh.getRange(fila, 9).setValue(estado);
    return { ok: true };
  } catch(err) { return { error: err.message }; }
}

// ── VISTA DEPÓSITO ────────────────────────────────────────────────────────────
// Trae PEDIDOS INTERNOS + filas rechazadas con PIB en col A
function getDeposito() {
  try {
    var ss = getSpreadsheet();

    // 1. PEDIDOS INTERNOS
    // Cols: 1=ID, 2=Fecha, 3=Email, 4=RI, 5=FechaVale, 6=NumVale, 7=Seccion,
    //       8=Observaciones, 9=Vale, 10=Detalle, 11=Presupuesto, 12=FechaPres, 13=NumOT
    var shPI = ss.getSheetByName('PEDIDOS INTERNOS');
    var pedidos = [];
    if (shPI && shPI.getLastRow() >= 2) {
      var lastPIRow = shPI.getLastRow(); var rowsPI = lastPIRow >= 2 ? shPI.getRange(2, 1, lastPIRow - 1, 13).getDisplayValues() : [];
      rowsPI.forEach(function(r, i) {
        var id = String(r[0]).trim();
        if (!id) return;
        pedidos.push({
          fila:         i + 2,
          id:           id,
          fecha:        r[1],
          email:        r[2],
          ri:           r[3],
          fecha_vale:   r[4],
          num_vale:     r[5],
          seccion:      r[6],
          observaciones: r[7],
          vale:         r[8],
          detalle:      r[9],
          presupuesto:  r[10],
          fecha_pres:   r[11],
          num_ot:       r[12]
        });
      });
    }

    // 2. RECHAZADOS con PIB en col A
    var shRec = ss.getSheetByName('Trabajos Rechazados');
    var rechazados = [];
    if (shRec && shRec.getLastRow() >= 2) {
      var lastRecRow = shRec.getLastRow(); var rowsRec = lastRecRow >= 2 ? shRec.getRange(2, 1, lastRecRow - 1, 14).getDisplayValues() : [];
      rowsRec.forEach(function(r, i) {
        var id = String(r[0]).trim();
        if (!id || !id.toUpperCase().startsWith('PIB')) return;
        rechazados.push({
          fila:         i + 2,
          id:           id,
          fecha:        r[1],
          ri:           r[2],
          memo_vale:    r[3],
          presupuesto:  r[4],
          estado:       r[7],
          estado_flujo: r[8],
          motivo:       r[9],
          oficina:      r[11],
          detalle:      r[12],
          observaciones: r[13]
        });
      });
    }

    return { pedidos: pedidos, rechazados: rechazados };
  } catch(err) {
    return { error: err.message };
  }
}

// ── RECHAZAR (Col J) ──────────────────────────────────────────────────────────
function rechazarSolicitud(fila, motivo) {
  var motivos = ['Falta Memo', 'Falta Presupuesto', 'Motivo Escrito'];
  if (motivos.indexOf(motivo) === -1) return { error: 'Motivo inválido' };
  try {
    var sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    sh.getRange(fila, 10).setValue(motivo);
    return { ok: true };
  } catch(err) { return { error: err.message }; }
}

// ── ASIGNAR OC Y PROVEEDOR (Col K) ───────────────────────────────────────────
function setOrdenCompra(fila, oc, proveedor) {
  try {
    var sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    if (oc)         sh.getRange(fila, 11).setValue(oc);
    if (proveedor)  sh.getRange(fila, 10).setValue(proveedor);
    return { ok: true };
  } catch(err) { return { error: err.message }; }
}
