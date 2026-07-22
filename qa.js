/**
 * QA — Municipio App
 * Corre contra producción antes de deployar.
 * Uso: node qa.js
 */

const { chromium } = require('playwright');

const URL = 'https://municipio-app.vercel.app';
const TIMEOUT = 15000;

let ok = 0;
let fail = 0;

async function test(nombre, fn) {
  try {
    await fn();
    console.log(`  ✅ ${nombre}`);
    ok++;
  } catch (e) {
    console.log(`  ❌ ${nombre}`);
    console.log(`     ${e.message.split('\n')[0]}`);
    fail++;
  }
}

(async () => {
  console.log('\n🔍 QA — Municipio App');
  console.log(`   ${URL}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errores = [];
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });

  // ── 1. Pantalla de inicio ──
  await test('Pantalla de inicio carga', async () => {
    await page.goto(URL, { timeout: TIMEOUT });
    await page.waitForSelector('#pantalla-inicio', { timeout: TIMEOUT });
  });

  await test('Card Solicitudes visible', async () => {
    await page.waitForSelector('.area-card.sol', { timeout: 5000 });
    const txt = await page.textContent('.area-card.sol');
    if (!txt.includes('Solicitudes')) throw new Error('No dice Solicitudes');
  });

  await test('Card Depósito visible', async () => {
    await page.waitForSelector('.area-card.dep', { timeout: 5000 });
    const txt = await page.textContent('.area-card.dep');
    if (!txt.includes('Dep')) throw new Error('No dice Depósito');
  });

  // ── 2. Área Solicitudes ──
  await test('Entrar a Solicitudes', async () => {
    await page.click('.area-card.sol');
    await page.waitForSelector('#pantalla-app.visible', { timeout: 5000 });
    const titulo = await page.textContent('#nav-titulo');
    if (!titulo.includes('Solicitudes')) throw new Error(`Título incorrecto: ${titulo}`);
  });

  await test('Tabs BHI y PIB visibles', async () => {
    await page.waitForSelector('#tab-bhi', { timeout: 5000 });
    await page.waitForSelector('#tab-pib', { timeout: 5000 });
  });

  await test('Panel BHI activo por defecto', async () => {
    const activo = await page.$('#panel-bhi.activo');
    if (!activo) throw new Error('panel-bhi no está activo');
  });

  await test('BHI carga tarjetas (espera datos)', async () => {
    await page.waitForFunction(
      () => !document.querySelector('#cards-bhi .spinner'),
      { timeout: 12000 }
    );
    const cards = await page.$$('#cards-bhi .card');
    if (cards.length === 0) throw new Error('No hay tarjetas BHI');
  });

  await test('Tab PIB funciona', async () => {
    await page.click('#tab-pib');
    const activo = await page.$('#panel-pib.activo');
    if (!activo) throw new Error('panel-pib no activó');
  });

  // ── 3. Flota desde Solicitudes ──
  await test('Botón Flota visible en nav', async () => {
    await page.waitForSelector('#nav-sol-flota', { timeout: 5000 });
  });

  await test('Flota carga iframe', async () => {
    await page.click('#nav-sol-flota');
    await page.waitForSelector('#panel-flota.activo', { timeout: 5000 });
    await page.waitForSelector('#panel-flota iframe', { timeout: 5000 });
  });

  // ── 4. Volver al inicio ──
  await test('Logo MU vuelve al inicio', async () => {
    await page.click('.nav-logo');
    await page.waitForSelector('#pantalla-inicio', { timeout: 5000 });
    const visible = await page.isVisible('#pantalla-inicio');
    if (!visible) throw new Error('Pantalla inicio no visible');
  });

  // ── 5. Área Depósito ──
  await test('Entrar a Depósito', async () => {
    await page.click('.area-card.dep');
    await page.waitForSelector('#pantalla-app.visible', { timeout: 5000 });
    const titulo = await page.textContent('#nav-titulo');
    if (!titulo.includes('ep')) throw new Error(`Título incorrecto: ${titulo}`);
  });

  await test('Tabs BHI/PIB ocultos en Depósito', async () => {
    const oculto = await page.$('#tabs-solicitudes.oculto');
    if (!oculto) throw new Error('Tabs no están ocultos');
  });

  await test('Panel Depósito activo', async () => {
    const activo = await page.$('#panel-deposito.activo');
    if (!activo) throw new Error('panel-deposito no está activo');
  });

  await test('Flota accesible desde Depósito', async () => {
    await page.waitForSelector('#nav-dep-flota', { timeout: 5000 });
  });

  // ── 6. Errores de consola ──
  await test('Sin errores críticos de consola', async () => {
    const criticos = errores.filter(e =>
      !e.includes('favicon') && !e.includes('404') && !e.includes('sw.js')
    );
    if (criticos.length > 0) throw new Error(`Errores: ${criticos.join(' | ')}`);
  });

  await browser.close();

  // ── Resultado ──
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`  Resultado: ${ok} ✅  ${fail} ❌  (${ok + fail} tests)`);
  if (fail === 0) {
    console.log('  ✅ QA PASADO — listo para deployar\n');
    process.exit(0);
  } else {
    console.log('  ❌ QA FALLIDO — no se deploya\n');
    process.exit(1);
  }
})();
