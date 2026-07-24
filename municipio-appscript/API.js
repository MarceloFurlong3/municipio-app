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

  // ── ÓRDENES DE TRABAJO ──
  if (data.action === 'crearOT')    return respJSON(crearOT(data));
  if (data.action === 'getOTs')     return respJSON(getOTs());
  if (data.action === 'actualizarOT') return respJSON(actualizarOT(data));

  // ── VALES DE MATERIALES ──
  if (data.action === 'crearVale')  return respJSON(crearVale(data));
  if (data.action === 'getVales')   return respJSON(getVales());
  if (data.action === 'marcarValeRetirado') return respJSON(marcarValeRetirado(data.fila));

  return respJSON({ error: 'accion invalida' });
}

// ══════════════════════════════════════════════════════════════════════════════
// ÓRDENES DE TRABAJO
// Hoja: ORDENES_TRABAJO
// Cols: A=numero_ot | B=fecha | C=seccion | D=ri | E=dependencia |
//       F=memo | G=odometro | H=legajo_solicita | I=nombre_solicita |
//       J=descripcion | K=tareas | L=repuestos | M=agente | N=horas |
//       O=fecha_entrada | P=hora_entrada | Q=fecha_salida | R=hora_salida |
//       S=firma_aclaracion | T=legajo_firma | U=estado
// ══════════════════════════════════════════════════════════════════════════════
function _getSheetOT() {
  const ss = getSpreadsheet();
  let sh = ss.getSheetByName('ORDENES_TRABAJO');
  if (!sh) {
    sh = ss.insertSheet('ORDENES_TRABAJO');
    sh.getRange(1, 1, 1, 21).setValues([[
      'numero_ot','fecha','seccion','ri','dependencia','memo','odometro',
      'legajo_solicita','nombre_solicita','descripcion',
      'tareas','repuestos','agente','horas',
      'fecha_entrada','hora_entrada','fecha_salida','hora_salida',
      'firma_aclaracion','legajo_firma','estado'
    ]]);
    sh.getRange(1,1,1,21).setFontWeight('bold');
  }
  return sh;
}

function _proximoNumeroOT() {
  const sh = _getSheetOT();
  const last = sh.getLastRow();
  if (last < 2) return 130001;
  const nums = sh.getRange(2, 1, last - 1, 1).getValues()
    .map(r => parseInt(r[0]) || 0).filter(n => n > 0);
  return nums.length ? Math.max(...nums) + 1 : 130001;
}

function crearOT(d) {
  try {
    const sh = _getSheetOT();
    const num = _proximoNumeroOT();
    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
    sh.appendRow([
      num, fecha,
      d.seccion || '',
      d.ri || '',
      d.dependencia || '',
      d.memo || '',
      d.odometro || 0,
      d.legajo_solicita || '',
      d.nombre_solicita || '',
      d.descripcion || '',
      '', '', '', '',  // tareas, repuestos, agente, horas (se completan después)
      '', '', '', '',  // fechas/horas entrada y salida
      '', '',          // firma, legajo
      'Abierta'        // estado
    ]);
    SpreadsheetApp.flush();
    return { ok: true, numero_ot: num };
  } catch(e) {
    return { error: e.message };
  }
}

function getOTs() {
  try {
    const sh = _getSheetOT();
    const last = sh.getLastRow();
    if (last < 2) return { ots: [] };
    const rows = sh.getRange(2, 1, last - 1, 21).getDisplayValues();
    const ots = rows.filter(r => r[0]).map((r, i) => ({
      fila: i + 2,
      numero_ot: r[0], fecha: r[1], seccion: r[2], ri: r[3],
      dependencia: r[4], memo: r[5], odometro: r[6],
      legajo_solicita: r[7], nombre_solicita: r[8], descripcion: r[9],
      tareas: r[10], repuestos: r[11], agente: r[12], horas: r[13],
      fecha_entrada: r[14], hora_entrada: r[15], fecha_salida: r[16], hora_salida: r[17],
      firma_aclaracion: r[18], legajo_firma: r[19], estado: r[20]
    }));
    return { ots };
  } catch(e) {
    return { error: e.message };
  }
}

function actualizarOT(d) {
  try {
    const sh = _getSheetOT();
    const f = parseInt(d.fila);
    if (!f) return { error: 'Fila inválida' };
    if (d.tareas !== undefined) sh.getRange(f, 11).setValue(d.tareas);
    if (d.repuestos !== undefined) sh.getRange(f, 12).setValue(d.repuestos);
    if (d.agente !== undefined) sh.getRange(f, 13).setValue(d.agente);
    if (d.horas !== undefined) sh.getRange(f, 14).setValue(d.horas);
    if (d.estado !== undefined) sh.getRange(f, 21).setValue(d.estado);
    SpreadsheetApp.flush();
    return { ok: true };
  } catch(e) {
    return { error: e.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// VALES DE MATERIALES
// Hoja: VALES_MATERIALES
// Cols: A=numero_vale | B=fecha | C=dependencia | D=codigo_ud |
//       E=numero_ot | F=ri | G=items_json | H=legajo_solicita |
//       I=nombre_solicita | J=estado | K=fecha_retiro
// ══════════════════════════════════════════════════════════════════════════════
function _getSheetVales() {
  const ss = getSpreadsheet();
  let sh = ss.getSheetByName('VALES_MATERIALES');
  if (!sh) {
    sh = ss.insertSheet('VALES_MATERIALES');
    sh.getRange(1, 1, 1, 11).setValues([[
      'numero_vale','fecha','dependencia','codigo_ud','numero_ot','ri',
      'items_json','legajo_solicita','nombre_solicita','estado','fecha_retiro'
    ]]);
    sh.getRange(1,1,1,11).setFontWeight('bold');
  }
  return sh;
}

function _proximoNumeroVale() {
  const sh = _getSheetVales();
  const last = sh.getLastRow();
  if (last < 2) return 535;
  const nums = sh.getRange(2, 1, last - 1, 1).getValues()
    .map(r => parseInt(r[0]) || 0).filter(n => n > 0);
  return nums.length ? Math.max(...nums) + 1 : 535;
}

function crearVale(d) {
  try {
    const sh = _getSheetVales();
    const num = _proximoNumeroVale();
    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
    sh.appendRow([
      num, fecha,
      d.dependencia || '',
      d.codigo_ud || '',
      d.numero_ot || '',
      d.ri || '',
      JSON.stringify(d.items || []),
      d.legajo_solicita || '',
      d.nombre_solicita || '',
      'Pendiente',
      ''
    ]);
    SpreadsheetApp.flush();
    return { ok: true, numero_vale: num };
  } catch(e) {
    return { error: e.message };
  }
}

function getVales() {
  try {
    const sh = _getSheetVales();
    const last = sh.getLastRow();
    if (last < 2) return { vales: [] };
    const rows = sh.getRange(2, 1, last - 1, 11).getDisplayValues();
    const vales = rows.filter(r => r[0]).map((r, i) => ({
      fila: i + 2,
      numero_vale: r[0], fecha: r[1], dependencia: r[2], codigo_ud: r[3],
      numero_ot: r[4], ri: r[5],
      items: (() => { try { return JSON.parse(r[6]); } catch(e) { return []; } })(),
      legajo_solicita: r[7], nombre_solicita: r[8],
      estado: r[9], fecha_retiro: r[10]
    }));
    return { vales };
  } catch(e) {
    return { error: e.message };
  }
}

function marcarValeRetirado(fila) {
  try {
    const sh = _getSheetVales();
    const f = parseInt(fila);
    if (!f) return { error: 'Fila inválida' };
    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
    sh.getRange(f, 10).setValue('Retirado');
    sh.getRange(f, 11).setValue(fecha);
    SpreadsheetApp.flush();
    return { ok: true };
  } catch(e) {
    return { error: e.message };
  }
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
