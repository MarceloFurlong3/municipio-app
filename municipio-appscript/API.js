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

  if (data.action === 'aprobar')          return respJSON(aprobarSolicitud(data.fila, data.valor));
  if (data.action === 'cambiarEstado')    return respJSON(cambiarEstado(data.fila, data.estado));
  if (data.action === 'rechazar')         return respJSON(rechazarSolicitud(data.fila, data.motivo, data.detalle));
  if (data.action === 'setSuministro')    return respJSON(setCeldaSolicitud(data.fila, 8, data.valor));
  if (data.action === 'setOrdenCompra')   return respJSON(setCeldaSolicitud(data.fila, 11, data.valor));
  if (data.action === 'setOC')            return respJSON(setOrdenCompra(data.fila, data.oc, data.proveedor));
  if (data.action === 'setObservaciones') return respJSON(setCeldaSolicitud(data.fila, 14, data.valor));
  if (data.action === 'limpiarRechazo')   return respJSON(limpiarRechazo(data.fila));

  return respJSON({ error: 'accion invalida' });
}

// ── LEER SOLICITUDES (Cols A-N = 1-14) ───────────────────────────────────────
function getSolicitudes() {
  try {
    const sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return { bhi: [], pib: [] };

    const rows = sh.getRange(2, 1, lastRow - 1, 25).getDisplayValues();
    const bhi = [], pib = [];

    rows.forEach(function(r, i) {
      var id = String(r[0]).trim();
      if (!id) return;

      var sol = {
        fila:           i + 2,
        id:             id,
        fecha:          r[1],
        ri:             r[2],
        memo_vale:      r[3],
        presupuesto:    r[4],
        aprobado:       r[5] === 'TRUE' || r[5] === 'VERDADERO' || r[5] === true,
        tipo_oc:        r[6],
        num_suministro: r[7],   // Col H
        estado_flujo:   r[8],   // Col I
        rechazo:        r[9],   // Col J
        oc:             r[10],  // Col K
        oficina:        r[11],  // Col L
        detalle:        r[12],  // Col M
        observaciones:  r[13],  // Col N
        fecha_iniciado: r[22],  // Col W
        fecha_aprobado: r[23],  // Col X
        fecha_fisico:   r[24]   // Col Y
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

// ── ESCRIBIR CELDA GENÉRICA ───────────────────────────────────────────────────
function setCeldaSolicitud(fila, col, valor) {
  try {
    var sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    sh.getRange(fila, col).setValue(valor);
    return { ok: true };
  } catch(err) { return { error: err.message }; }
}

// ── APROBAR (Col F = checkbox) ────────────────────────────────────────────────
function aprobarSolicitud(fila, valor) {
  try {
    var sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    sh.getRange(fila, 6).setValue(valor === true || valor === 'true');
    // Habilita la validación de estados en col I (igual que mionEdit col F)
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Iniciado', 'aprobado', 'pase a fisico']).build();
    sh.getRange(fila, 9).setDataValidation(rule);
    return { ok: true };
  } catch(err) { return { error: err.message }; }
}

// ── CAMBIAR ESTADO FLUJO (Col I) ──────────────────────────────────────────────
function cambiarEstado(fila, estado) {
  var estados = ['Iniciado', 'aprobado', 'pase a fisico'];
  if (estados.indexOf(estado) === -1) return { error: 'Estado inválido' };
  try {
    var sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    sh.getRange(fila, 9).setValue(estado);

    var id        = sh.getRange(fila, 1).getValue();
    var ri        = sh.getRange(fila, 3).getValue();
    var detalle   = sh.getRange(fila, 13).getValue();
    var suministro= sh.getRange(fila, 8).getValue();
    var email     = sh.getRange(fila, 17).getValue();
    var lastCol   = sh.getLastColumn();
    var fecha     = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');

    if (estado === 'Iniciado') {
      sh.getRange(fila, 2, 1, lastCol - 1).setBackgroundRGB(245, 255, 176);
      sh.getRange(fila, 23).setValue(fecha);
      if (email) {
        var body = '<p>Se ha cargado el proceso en SGC.</p>'
          + '<p>N° de Suministro: <strong>' + suministro + '</strong></p>'
          + '<p>Solicitud: ' + detalle + '</p>'
          + '<p>RI: ' + ri + '</p>'
          + '<p>Gracias.</p><em>Dirección de talleres</em>';
        GmailApp.sendEmail(email, 'Registro número ' + id, '', { name: 'Direccion de talleres BHI', htmlBody: body });
      }
    }

    if (estado === 'aprobado') {
      sh.getRange(fila, 2, 1, lastCol - 1).setBackgroundRGB(245, 255, 176);
      sh.getRange(fila, 24).setValue(fecha);
    }

    if (estado === 'pase a fisico') {
      sh.getRange(fila, 2, 1, lastCol - 1).setBackgroundRGB(255, 215, 145);
      sh.getRange(fila, 25).setValue(fecha);
      if (email) {
        var body2 = '<p>Se ha aprobado el proceso.</p>'
          + '<p>El suministro <strong>' + suministro + '</strong> ya se puede visualizar en la mesa de entrada.</p>'
          + '<p>Solicitud: ' + detalle + '</p>'
          + '<p>Gracias.</p><em>Dirección de talleres</em>';
        GmailApp.sendEmail(email, 'Registro número ' + id, '', { name: 'Direccion de talleres BHI', htmlBody: body2 });
      }
    }

    return { ok: true };
  } catch(err) { return { error: err.message }; }
}

// ── VISTA DEPÓSITO ────────────────────────────────────────────────────────────
// Pedidos: PIB en curso desde Solicitudes Generales
// Rechazados: PIB desde Trabajos Rechazados
function getDeposito() {
  try {
    var ss = getSpreadsheet();

    // 1. PIB en marcha desde Solicitudes Generales (cols A-N + Q=17)
    var shSol = ss.getSheetByName('Solicitudes Generales');
    var pedidos = [];
    if (shSol && shSol.getLastRow() >= 2) {
      var rows = shSol.getRange(2, 1, shSol.getLastRow() - 1, 17).getDisplayValues();
      rows.forEach(function(r, i) {
        var id = String(r[0]).trim();
        if (!id || !id.toUpperCase().startsWith('PIB')) return;
        pedidos.push({
          fila:          i + 2,
          id:            id,
          fecha:         r[1],
          ri:            r[2],
          memo_vale:     r[3],
          presupuesto:   r[4],
          aprobado:      r[5] === 'TRUE' || r[5] === 'VERDADERO',
          num_suministro: r[7],
          estado_flujo:  r[8],
          rechazo:       r[9],
          oc:            r[10],
          oficina:       r[11],
          detalle:       r[12],
          observaciones: r[13],
          email:         r[16]
        });
      });
    }

    // 2. Rechazados PIB desde Trabajos Rechazados
    var shRec = ss.getSheetByName('Trabajos Rechazados');
    var rechazados = [];
    if (shRec && shRec.getLastRow() >= 2) {
      var rowsRec = shRec.getRange(2, 1, shRec.getLastRow() - 1, 14).getDisplayValues();
      rowsRec.forEach(function(r, i) {
        var id = String(r[0]).trim();
        if (!id || !id.toUpperCase().startsWith('PIB')) return;
        rechazados.push({
          fila:          i + 2,
          id:            id,
          fecha:         r[1],
          ri:            r[2],
          memo_vale:     r[3],
          presupuesto:   r[4],
          estado_flujo:  r[8],
          motivo:        r[9],
          oficina:       r[11],
          detalle:       r[12],
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
function rechazarSolicitud(fila, motivo, detalle) {
  var motivos = ['Falta Memo', 'Falta Presupuesto', 'Motivo Escrito', 'Actualizar Presupuesto'];
  if (motivos.indexOf(motivo) === -1) return { error: 'Motivo inválido' };
  try {
    var sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    sh.getRange(fila, 10).setValue(motivo);

    // Si hay detalle libre (Motivo Escrito), guardarlo en Col N (observaciones)
    if (motivo === 'Motivo Escrito' && detalle) {
      sh.getRange(fila, 14).setValue(detalle);
    }

    var lastCol = sh.getLastColumn();
    sh.getRange(fila, 2, 1, lastCol - 1).setBackgroundRGB(255, 63, 63);

    var id    = sh.getRange(fila, 1).getValue();
    var ri    = sh.getRange(fila, 3).getValue();
    var email = sh.getRange(fila, 17).getValue();
    if (email) {
      var textoMotivo = (motivo === 'Motivo Escrito' && detalle) ? detalle : null;
      var cuerpos = {
        'Falta Memo':             'Se ha rechazado el proceso de compra del RI: ' + ri + ' debido a un error o falta en el Memo.',
        'Falta Presupuesto':      'Se ha rechazado el proceso de compra del RI: ' + ri + ' debido a un error o falta en el Presupuesto.',
        'Motivo Escrito':         'Se ha rechazado el proceso de compra del RI: ' + ri + '.' + (textoMotivo ? '<br>Motivo: ' + textoMotivo : ''),
        'Actualizar Presupuesto': 'Se ha rechazado el proceso de compra del RI: ' + ri + ' porque el presupuesto debe actualizarse.'
      };
      var htmlBody = '<p>' + cuerpos[motivo] + '</p><p>Por favor, realice una nueva solicitud con la información correcta.</p><p>Gracias.</p><em>Dirección de talleres</em>';
      GmailApp.sendEmail(email, 'Solicitud Rechazada — ' + id, '', { name: 'Direccion de talleres BHI', htmlBody: htmlBody });
    }

    return { ok: true };
  } catch(err) { return { error: err.message }; }
}

// ── LIMPIAR RECHAZO (Col J) ───────────────────────────────────────────────────
function limpiarRechazo(fila) {
  try {
    var sh = getSpreadsheet().getSheetByName(HOJA_SOL);
    sh.getRange(fila, 10).setValue('');
    // Restaurar color amarillo si tenía estado, o blanco si no
    var estado = sh.getRange(fila, 9).getValue();
    var lastCol = sh.getLastColumn();
    if (estado === 'pase a fisico') {
      sh.getRange(fila, 2, 1, lastCol - 1).setBackgroundRGB(255, 215, 145);
    } else if (estado === 'Iniciado' || estado === 'aprobado') {
      sh.getRange(fila, 2, 1, lastCol - 1).setBackgroundRGB(245, 255, 176);
    } else {
      sh.getRange(fila, 2, 1, lastCol - 1).setBackground(null);
    }
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
