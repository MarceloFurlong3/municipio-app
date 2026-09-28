// ── Google Sheets API via Service Account ─────────────────────────────────────
// Sin GAS, sin permisos que se resetean. La Service Account siempre tiene acceso.

import { google } from 'googleapis';

const SS_ID     = '1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo';
const HOJA_SOL  = 'Solicitudes Generales';
const HOJA_REC  = 'Trabajos Rechazados';
const HOJA_ELIM = 'Solicitudes Eliminadas';
const HOJA_OT   = 'ORDENES_TRABAJO';
const HOJA_VALE = 'VALES_MATERIALES';

function getSheets() {
  const key = process.env.GOOGLE_SA_KEY;
  if (!key) throw new Error('GOOGLE_SA_KEY no configurada en Vercel.');
  const credentials = JSON.parse(key);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

async function leerRango(sheets, hoja, rango) {
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SS_ID,
    range: `'${hoja}'!${rango}`,
    valueRenderOption: 'FORMATTED_VALUE'
  });
  return r.data.values || [];
}

async function escribirCelda(sheets, hoja, fila, col, valor) {
  const letra = String.fromCharCode(64 + col);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SS_ID,
    range: `'${hoja}'!${letra}${fila}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[valor]] }
  });
}

async function appendFila(sheets, hoja, valores) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SS_ID,
    range: `'${hoja}'!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [valores] }
  });
}

function fechaHoy() {
  return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── GET: getSolicitudes ────────────────────────────────────────────────────────
async function getSolicitudes(sheets) {
  const rows = await leerRango(sheets, HOJA_SOL, 'A2:Y2000');
  const bhi = [], pib = [];
  rows.forEach((r, i) => {
    const id = String(r[0] || '').trim();
    if (!id) return;
    const sol = {
      fila: i + 2, id,
      fecha:          r[1]  || '',
      ri:             r[2]  || '',
      memo_vale:      r[3]  || '',
      presupuesto:    r[4]  || '',
      aprobado:       r[5] === 'TRUE' || r[5] === 'VERDADERO',
      tipo_oc:        r[6]  || '',
      num_suministro: r[7]  || '',
      estado_flujo:   r[8]  || '',
      rechazo:        r[9]  || '',
      oc:             r[10] || '',
      oficina:        r[11] || '',
      detalle:        r[12] || '',
      observaciones:  r[13] || '',
      fecha_iniciado: r[22] || '',
      fecha_aprobado: r[23] || '',
      fecha_fisico:   r[24] || ''
    };
    if (id.toUpperCase().startsWith('BHI')) bhi.push(sol);
    else if (id.toUpperCase().startsWith('PIB')) pib.push(sol);
  });
  return { bhi, pib };
}

// ── GET: getDeposito ───────────────────────────────────────────────────────────
async function getDeposito(sheets) {
  const rowsSol = await leerRango(sheets, HOJA_SOL, 'A2:Q2000');
  const pedidos = rowsSol
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => String(r[0] || '').trim().toUpperCase().startsWith('PIB'))
    .map(({ r, i }) => ({
      fila: i + 2, id: r[0], fecha: r[1], ri: r[2],
      memo_vale: r[3], presupuesto: r[4],
      aprobado: r[5] === 'TRUE' || r[5] === 'VERDADERO',
      num_suministro: r[7], estado_flujo: r[8],
      rechazo: r[9], oc: r[10], oficina: r[11],
      detalle: r[12], observaciones: r[13], email: r[16]
    }));

  const rowsRec = await leerRango(sheets, HOJA_REC, 'A2:N2000');
  const rechazados = rowsRec
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => String(r[0] || '').trim().toUpperCase().startsWith('PIB'))
    .map(({ r, i }) => ({
      fila: i + 2, id: r[0], fecha: r[1], ri: r[2],
      memo_vale: r[3], presupuesto: r[4],
      estado_flujo: r[8], motivo: r[9],
      oficina: r[11], detalle: r[12], observaciones: r[13]
    }));

  return { pedidos, rechazados };
}

// ── GET: getEliminadas ─────────────────────────────────────────────────────────
async function getEliminadas(sheets) {
  const rows = await leerRango(sheets, HOJA_ELIM, 'A2:AH2000');
  const eliminadas = rows
    .filter(r => r[2])
    .map((r, i) => ({
      fila_bas: i + 2,
      fecha_eliminacion: r[0], fila_original: r[1],
      id: r[2], fecha: r[3], ri: r[4],
      memo: r[5], presupuesto: r[6],
      suministro: r[9], estado_flujo: r[10],
      oc: r[12], oficina: r[13], detalle: r[14]
    }));
  return { eliminadas };
}

// ── POST: setCelda ─────────────────────────────────────────────────────────────
async function setCelda(sheets, fila, col, valor) {
  await escribirCelda(sheets, HOJA_SOL, fila, col, valor);
  return { ok: true };
}

// ── POST: aprobar ──────────────────────────────────────────────────────────────
async function aprobar(sheets, fila, valor) {
  await escribirCelda(sheets, HOJA_SOL, fila, 6, valor === true || valor === 'true');
  return { ok: true };
}

// ── POST: cambiarEstado ────────────────────────────────────────────────────────
async function cambiarEstado(sheets, fila, estado) {
  const estadosValidos = ['Iniciado', 'pase a fisico'];
  if (!estadosValidos.includes(estado)) return { error: 'Estado inválido' };

  await escribirCelda(sheets, HOJA_SOL, fila, 6, true);
  await escribirCelda(sheets, HOJA_SOL, fila, 9, estado);

  const row = await leerRango(sheets, HOJA_SOL, `A${fila}:Q${fila}`);
  const r = row[0] || [];
  const id = r[0], ri = r[2], memo = r[3], presupuesto = r[4];
  const suministro = r[7], oc = r[10], detalle = r[12];
  const email = String(r[0] || '').toUpperCase().startsWith('PIB')
    ? 'depositotalleres@bahiablanca.gov.ar'
    : (r[16] || '');

  const fecha = fechaHoy();
  if (estado === 'Iniciado') {
    await escribirCelda(sheets, HOJA_SOL, fila, 23, fecha);
    if (email) {
      await enviarMail(email,
        `Registro ${id} — Suministro N° ${suministro}`,
        `<p>Se cargó la solicitud <strong>${id}</strong>.</p>
         <p><strong>N° de Suministro: ${suministro}</strong></p>
         <p><strong>RI:</strong> ${ri} | <strong>Detalle:</strong> ${detalle}</p>
         <p>Gracias.<br><em>Dirección de Talleres</em></p>`
      );
    }
  }
  if (estado === 'pase a fisico') {
    await escribirCelda(sheets, HOJA_SOL, fila, 25, fecha);
    if (email) {
      await enviarMail(email,
        `Registro ${id} — Pase a Físico (OC: ${oc})`,
        `<p>La solicitud <strong>${id}</strong> tiene OC aprobada y está disponible en mesa de entrada.</p>
         <p><strong>OC: ${oc}</strong> | <strong>Suministro: ${suministro}</strong></p>
         <p>Gracias.<br><em>Dirección de Talleres</em></p>`
      );
    }
  }
  return { ok: true };
}

// ── POST: rechazar ─────────────────────────────────────────────────────────────
async function rechazar(sheets, fila, motivo, detalle) {
  const motivos = ['Falta Memo', 'Falta Presupuesto', 'Motivo Escrito', 'Actualizar Presupuesto'];
  if (!motivos.includes(motivo)) return { error: 'Motivo inválido' };
  await escribirCelda(sheets, HOJA_SOL, fila, 10, motivo);
  if (motivo === 'Motivo Escrito' && detalle) {
    await escribirCelda(sheets, HOJA_SOL, fila, 14, detalle);
  }
  const row = await leerRango(sheets, HOJA_SOL, `A${fila}:Q${fila}`);
  const r = row[0] || [];
  const id = r[0], ri = r[2], email = r[16];
  if (email) {
    const msgs = {
      'Falta Memo': `Se rechazó el proceso del RI: ${ri} por falta en el Memo.`,
      'Falta Presupuesto': `Se rechazó el proceso del RI: ${ri} por falta en el Presupuesto.`,
      'Motivo Escrito': `Se rechazó el proceso del RI: ${ri}. Motivo: ${detalle || ''}`,
      'Actualizar Presupuesto': `Se rechazó el proceso del RI: ${ri}. El presupuesto debe actualizarse.`
    };
    await enviarMail(email, `Solicitud Rechazada — ${id}`,
      `<p>${msgs[motivo]}</p><p>Realice una nueva solicitud con la información correcta.</p><em>Dirección de Talleres</em>`
    );
  }
  return { ok: true };
}

// ── POST: eliminarSolicitud ────────────────────────────────────────────────────
async function eliminarSolicitud(sheets, fila) {
  const row = await leerRango(sheets, HOJA_SOL, `A${fila}:AH${fila}`);
  const datos = row[0] || [];
  const fecha = new Date().toLocaleString('es-AR');
  await appendFila(sheets, HOJA_ELIM, [fecha, fila, ...datos]);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SS_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId: await getSheetId(sheets, HOJA_SOL), dimension: 'ROWS', startIndex: fila - 1, endIndex: fila }
        }
      }]
    }
  });
  return { ok: true };
}

// ── POST: recuperarSolicitud ───────────────────────────────────────────────────
async function recuperarSolicitud(sheets, filaBas) {
  const row = await leerRango(sheets, HOJA_ELIM, `C${filaBas}:AH${filaBas}`);
  const datos = row[0] || [];
  await appendFila(sheets, HOJA_SOL, datos);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SS_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId: await getSheetId(sheets, HOJA_ELIM), dimension: 'ROWS', startIndex: filaBas - 1, endIndex: filaBas }
        }
      }]
    }
  });
  return { ok: true };
}

// ── OT y Vales (sin cambios de lógica) ────────────────────────────────────────
async function getOTs(sheets) {
  const rows = await leerRango(sheets, HOJA_OT, 'A2:U2000');
  const ots = rows.filter(r => r[0]).map((r, i) => ({
    fila: i + 2, numero_ot: r[0], fecha: r[1], seccion: r[2], ri: r[3],
    dependencia: r[4], memo: r[5], odometro: r[6], legajo_solicita: r[7],
    nombre_solicita: r[8], descripcion: r[9], tareas: r[10], repuestos: r[11],
    agente: r[12], horas: r[13], fecha_entrada: r[14], hora_entrada: r[15],
    fecha_salida: r[16], hora_salida: r[17], firma_aclaracion: r[18],
    legajo_firma: r[19], estado: r[20]
  }));
  return { ots };
}

async function getVales(sheets) {
  const rows = await leerRango(sheets, HOJA_VALE, 'A2:K2000');
  const vales = rows.filter(r => r[0]).map((r, i) => ({
    fila: i + 2, numero_vale: r[0], fecha: r[1], dependencia: r[2],
    codigo_ud: r[3], numero_ot: r[4], ri: r[5],
    items: (() => { try { return JSON.parse(r[6]); } catch { return []; } })(),
    legajo_solicita: r[7], nombre_solicita: r[8], estado: r[9], fecha_retiro: r[10]
  }));
  return { vales };
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const sheetIdCache = {};
async function getSheetId(sheets, nombre) {
  if (sheetIdCache[nombre]) return sheetIdCache[nombre];
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SS_ID });
  for (const s of meta.data.sheets) {
    sheetIdCache[s.properties.title] = s.properties.sheetId;
  }
  return sheetIdCache[nombre];
}

async function enviarMail(dest, asunto, htmlBody) {
  // Si hay un webhook de n8n configurado, lo usamos para mandar el mail
  const n8nUrl = process.env.N8N_MAIL_WEBHOOK;
  if (!n8nUrl) return; // sin webhook, silencioso
  await fetch(n8nUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dest, asunto, htmlBody })
  }).catch(() => {});
}

// ── Handler principal ──────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sheets = getSheets();

    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
      const { action, id } = req.query;
      if (action === 'getSolicitudes') return res.json(await getSolicitudes(sheets));
      if (action === 'getSolicitud')   return res.json({ error: 'No implementado aún' });
      if (action === 'getDeposito')    return res.json(await getDeposito(sheets));
      if (action === 'getEliminadas')  return res.json(await getEliminadas(sheets));
      if (action === 'getOTs')         return res.json(await getOTs(sheets));
      if (action === 'getVales')       return res.json(await getVales(sheets));
      return res.json({ error: 'accion invalida' });
    }

    if (req.method === 'POST') {
      const d = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (d.action === 'aprobar')           return res.json(await aprobar(sheets, d.fila, d.valor));
      if (d.action === 'cambiarEstado')     return res.json(await cambiarEstado(sheets, d.fila, d.estado));
      if (d.action === 'rechazar')          return res.json(await rechazar(sheets, d.fila, d.motivo, d.detalle));
      if (d.action === 'setSuministro')     return res.json(await setCelda(sheets, d.fila, 8, d.valor));
      if (d.action === 'setOrdenCompra')    return res.json(await setCelda(sheets, d.fila, 11, d.valor));
      if (d.action === 'setOC')             return res.json(await setCelda(sheets, d.fila, 11, d.oc));
      if (d.action === 'setObservaciones')  return res.json(await setCelda(sheets, d.fila, 14, d.valor));
      if (d.action === 'limpiarRechazo')    return res.json(await setCelda(sheets, d.fila, 10, ''));
      if (d.action === 'eliminarSolicitud') return res.json(await eliminarSolicitud(sheets, d.fila));
      if (d.action === 'recuperarSolicitud')return res.json(await recuperarSolicitud(sheets, d.fila));
      if (d.action === 'getEliminadas')     return res.json(await getEliminadas(sheets));
      if (d.action === 'crearOT')           return res.json({ error: 'Usar getOTs/crearOT por separado' });
      if (d.action === 'getOTs')            return res.json(await getOTs(sheets));
      if (d.action === 'getVales')          return res.json(await getVales(sheets));
      if (d.action === 'crearVale')         return res.json({ error: 'Usar crearVale por separado' });
      if (d.action === 'marcarValeRetirado')return res.json(await setCelda(sheets, d.fila, 10, 'Retirado'));
      return res.json({ error: 'accion invalida' });
    }
  } catch (err) {
    console.error('Sheets API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
