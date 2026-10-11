// ══════════════════════════════════════════════════════════════════════════════
// talleres.js — Órdenes de Trabajo y Vales de Materiales
// Departamento de Talleres — Municipalidad de Bahía Blanca
// Backend: Supabase municipio-bahia-blanca (independiente del GAS)
// ══════════════════════════════════════════════════════════════════════════════
import { toast } from '../shared.js';


const DEPENDENCIAS = [
  ['ACCION COMUNITARIA','525'],['ADMINISTRACION DE REDES, DATOS Y TRANSF. DIGITAL','266'],
  ['AGENCIA DE SEGURIDAD VIAL','368'],['ALMACEN COMPRAS TALLERES','238'],
  ['ALMACEN DE COMPRAS','238'],['ANALISIS BROMATOLOGICOS','559'],
  ['ANTICIPOS JUBILADOS','235'],['ARCHIVO','315'],['AREA PROGRAMATICA II','692'],
  ['AREA PROGRAMATICA III','693'],['AREA PROGRAMATICA IV','694'],['AREA PROGRAMATICA IX','699'],
  ['AREA PROGRAMATICA V','695'],['AREA PROGRAMATICA VI','696'],['AREA PROGRAMATICA VII','697'],
  ['AREA PROGRAMATICA VIII','698'],['AREA PROGRAMATICA X','700'],['AREA PROGRAMATICA XI','701'],
  ['ARTICULACION PROGRAMATICA','579'],['ASESORIA MUNICIPAL DE TIERRAS Y ESCRITURAS','300'],
  ['BALNEARIO MALDONADO','602'],['BROMATOLOGIA Y PROTECC. SALUD','530'],
  ['CASA DE ABRIGO','605'],['CASA DE ABRIGO II','713'],['CASA DEL NIÑO VILLA ROSAS','521'],
  ['CENTRO CAPAC. Y PROMOCION VILLA MIRAMAR','545'],['CENTRO DE ATENCION AL VECINO','106'],
  ['CENTRO DE CAPAC.INVEST. Y RELAC. INSTITUCIONALES','603'],['CENTRO DE DIA Y FLIA. SUST.','563'],
  ['CENTRO DE GESTION COMUNAL','814'],['CENTRO DE GESTION CULTURAL ISLAS MALVINAS','349'],
  ['CENTRO DE SALUD MPAL. ING. WHITE','534'],['COLONIA AGUSTIN DE ARRIETA','601'],
  ['COMEDIA MUNICIPAL','341'],['COMITE TECNICO EJECUTIVO','614'],['COMUNICACIONES','317'],
  ['COORD. DE REC. ARTISTICOS','325'],['COORD. PROGRAMA ENVION','815'],
  ['COORDINACION LEGAL DE PRODUCCION','104'],['CTRO MPAL. DE CULTURA POPULAR','339'],
  ['CTRO MPAL. DE EST. FOLKLORICOS','337'],['DELEGACION ALTOS','403'],
  ['DELEGACION BAHIA BLANCA CENTRO','126'],['DELEGACION CABILDO','114'],
  ['DELEGACION GRAL. DANIEL CERRI','115'],['DELEGACION INGENIERO WHITE','116'],
  ['DELEGACION LAS VILLAS','117'],['DELEGACION NOROESTE','124'],['DELEGACION NORTE','123'],
  ['DELEGACION SESQUICENTENARIO','109'],['DELEGACION VILLA H. GREEN','119'],
  ['DELEGACION VILLA ROSAS','118'],['DEP. CATASTRO','224'],['DEP. COMPRAS','211'],
  ['DEP. CONTADURIA','215'],['DEP. CONTR. OBRAS PARTICULARES','421'],
  ['DEP. DE ANALISIS POLITICA FISCAL','212'],['DEP. DE PLANIFICACION Y CONTROL FINANCIERO','253'],
  ['DEP. EDUCACION VIAL','342'],['DEP. ELECTRICIDAD Y MECANICA','415'],
  ['DEP. HABILITACIONES','227'],['DEP. INSPECCIONES','213'],
  ['DEP. MANTENIMIENTO DE ALUMBRADO PUBLICO','437'],['DEP. NIÑEZ, ADOLESCENCIA Y FAMILIA','517'],
  ['DEP. PLANEAMIENTO URBANO','422'],['DEP. PROC. Y COBRO JUD. DE MULTAS IMPAGAS','153'],
  ['DEP. PROYECTOS Y OBRAS','416'],['DEP. RECAUDACION','222'],['DEP. TERRITORIAL','843'],
  ['DEP. TESORERIA','218'],['DEP. VIALIDAD','417'],['DEP. VIVIENDA','420'],
  ['DEPARTAMENTO CEMENTERIO','431'],['DEPARTAMENTO CONSERVACION VIAL','668'],
  ['DEPARTAMENTO CONTROL LIMPIEZA URBANA','364'],['DEPARTAMENTO INGENIERIA DE TRANSITO','334'],
  ['DEPARTAMENTO INSPECCIONES OBRAS VIALES Y SERVICIOS','401'],
  ['DEPARTAMENTO MANTENIMIENTO OBRAS CIVILES','438'],['DEPARTAMENTO TRANSPORTE URBANO','336'],
  ['DEPOSITO ACCION COMUNITARIA','598'],
  ['DIR GRAL. INTEG Y FORTALECIMIENTO DERECHOS HUMANOS','508'],
  ['DIR. ADJUNTA DE EMPLEO, ECON SOCIAL Y JUVENTUD','503'],
  ['DIR. ADJUNTA MANT. CIVIL EN ESPACIOS PUBLICOS','642'],['DIR. ADULTOS MAYORES','505'],
  ['DIR. CATASTRO','842'],['DIR. DE DESARROLLO Y ECONOMIA SOCIAL','363'],
  ['DIR. DE LOGISTICA Y DISTRIBUCION','634'],['DIR. DE MONITOREO Y COMUNICACION','355'],
  ['DIR. DE TURISMO','793'],['DIR. FORTALECIMIENTO COMUNITARIO','705'],
  ['DIR. GRAL DE ASUNTOS TURISTICOS E INTERNACIONALES','361'],
  ['DIR. GRAL PLANEAMIENTO EDUCATIVO','631'],['DIR. GRAL. DE CATASTRO Y OBRAS PARTICULARES','465'],
  ['DIR. GRAL. DE DESARROLLO SOCIAL','717'],['DIR. GRAL. DE MOVILIDAD URBANA','335'],
  ['DIR. GRAL. DE PLANIFICACION ESTRATEGICA EN SALUD','574'],
  ['DIR. GRAL. DE PROG. Y PROY. FORM. Y CAPAC.','632'],
  ['DIR. GRAL. ELECTRICIDAD, ALUMB Y CEMENTERIO','464'],['DIR. OBRAS MUNICIPALES','414'],
  ['DIR. PLANEAMIENTO URBANO','418'],['DIR. PREVENCION Y CONVIVENCIA','704'],
  ['DIR. RECOPILACION Y ANALISIS DE DATOS','706'],['DIR. VIVIENDA','400'],
  ['DIR.DE SERVICIO SOCIAL','800'],['DIR.GRAL.DEFENSA CIVIL','120'],
  ['DIRECCION ADJ ORDENAMIENTO FORESTAL URBANO','419'],
  ['DIRECCION ADJ. INTEGRACION TERRITORIAL','669'],['DIRECCION ADJUNTA DE CULTOS','509'],
  ['DIRECCION ADJUNTA FERIAS EN ESPACIOS PUBLICOS','646'],
  ['DIRECCION ARTE EMERGENTE Y ACT CULT EN ESP PUBLICO','369'],
  ['DIRECCION DE ACCION CULTURAL','376'],['DIRECCION DE COORDINACION','507'],
  ['DIRECCION DE ESPACIOS PUBLICOS','461'],['DIRECCION DE ESTUDIOS URBANISTICOS','402'],
  ['DIRECCION DE GESTION DE RIESGO','759'],
  ['DIRECCION DE HOGARES, DE PREVENCION Y PROTECCION','638'],
  ['DIRECCION DE INCLUSION Y ACCESIBILIDAD','620'],
  ['DIRECCION DE INFRAESTRUCTURA ESCOLAR','633'],['DIRECCION DE MUSEOS Y ARTE','797'],
  ['DIRECCION DE PLANIFICACION URBANA','639'],['DIRECCION DE POLITICAS DE GENERO','546'],
  ['DIRECCION DE RELACIONES INSTITUCIONALES','622'],
  ['DIRECCION DE SERVICIOS COOPERATIVOS','249'],['DIRECCION DE TIERRAS','453'],
  ['DIRECCION DE TRABAJO','531'],['DIRECCION GENERAL DE CAPITAL HUMANO','243'],
  ['DIRECCION GENERAL DE DELEGACIONES','377'],['DIRECCION GENERAL DE FISCALIZACION','365'],
  ['DIRECCION GENERAL DE MANTENIMIENTO VIAL','647'],
  ['DIRECCION GENERAL DE OPERACIONES VIALES','648'],
  ['DIRECCION GRAL. COORDINACION Y MONITOREO INTERNO','627'],
  ['DIRECCION GRAL. DE ACCION SOCIAL','515'],['DIRECCION GRAL. DE EDUCACION','628'],
  ['DIRECCION GRAL. DE ESPACIO TECNO','107'],['DIRECCION GRAL. DE ESPACIOS PUBLICOS','637'],
  ['DIRECCION GRAL. DE ORDENAMIENTO URBANO','645'],['DIRECCION GRAL. DE PRODUCCION','105'],
  ['DIRECCION GRAL. DE PROTECCION CIUDADANA','718'],
  ['DIRECCION GRAL. DE TECNICA JURIDICA','113'],['DIRECCION GRAL. HIGIENE URBANA','671'],
  ['DIRECCION JUVENTUD','506'],['DIRECCION MUNICIPAL DE ESTADISTICAS','323'],
  ['DIRECCION PLANIFICACION Y CONTROL','301'],['DIRECCION PROGRAMAS SOCIOEDUCATIVOS','635'],
  ['DIV. ACCESIBILIDAD E INCLUSION','587'],['DIV. MESA DE ENTRADAS Y ARCHIVO','314'],
  ['DIV. PLAN MAS VIDA','589'],['DIVISION ADMINISTRTIVA DE TRANSITO','332'],
  ['DIVISION CENTRAL TERRITORIAL','845'],['DIVISION CONSORCIOS Y OBRAS BASICAS','228'],
  ['DIVISION DE GESTION TERRITORIAL','846'],
  ['DIVISION DE ORDENAMIENTO DEL ESPACIO URBANO','640'],
  ['DIVISION DE PREVENCION COMUNITARIA','358'],
  ['DIVISION DE PRODUCCION SOCIAL DEL HABITAT','847'],['DIVISION DE SALUD LABORAL','232'],
  ['DIVISION DE TRANSITO URBANO','345'],['DIVISION EDUCACION ECOLOGICA URBANA','442'],
  ['DIVISION HIGIENE Y SEGURIDAD EN EL TRABAJO','262'],
  ['DIVISION INSPECCIONES DE MANTENIMIENTO URBANO','450'],
  ['DIVISION PARQUE AUTOMOTOR','424'],['DPTO. ADMINISTRACION DE PERSONAL','230'],
  ['DPTO. ALUMB. Y SEMAFORIZACION DE ESPACIOS PUBLICOS','670'],
  ['DPTO. DE PROYECTOS URBANOS','844'],['DPTO. EPIDEMIOLOGIA Y CALIDAD','805'],
  ['DPTO. LOGISTICA Y MANTENIMIENTO URBANO','411'],
  ['DPTO. REGISTRO LICITADORES Y OBRAS DE CONSORCIOS','425'],
  ['DPTO. SALUD MENTAL Y ADICCIONES','547'],['DPTO. TALLERES Y MAESTRANZA','412'],
  ['ECONOMIA SOCIAL','624'],['EPIDEMIOLOGIA AMBIENTAL','611'],
  ['ESCUELA CAPACITACION LABORAL SAN ROQUE','553'],
  ['ESPACIO DE PRIMERA INFANCIA MI LUGAR','702'],
  ['ESPACIO PRIMERA INFANCIA RAYITO DE SOL','544'],['FONDO EDUCATIVO','604'],
  ['FONDO ROTATIVO SOLIDARIO DE MATERIALES','709'],
  ['HOGAR DE NIÑOS Y NIÑAS PEUMAYEN','591'],['HOGAR DEL ADOLESCENTE','519'],
  ['HOGAR NUEVA PROVINCIA 2153','752'],['HOGAR REFUGIO DE VIOLENCIA FAMILIAR','590'],
  ['INSTITUTO CULTURAL MUNICIPAL','311'],
  ['INSTITUTO DE INNOVAC, DES ECONOMICO Y RELAC INSTIT','128'],
  ['INSTITUTO JOSE LUIS CANTILO','520'],
  ['Instituto Municipal Viv. Tierras y Habital','473'],
  ['INSUMOS Y DROGAS','572'],['JARDIN MATERNAL PACIFICO','538'],
  ['JARDIN MATERNAL TE VEO BIEN','539'],
  ['JARDIN MATERNAL Y DE INFANTES INGENIERO WHITE','684'],
  ['JARDIN MATERNAL Y DE INFANTES PETETE','535'],
  ['JARDIN MATERNAL Y DE INFANTES PIMPOLLITOS','537'],
  ['JARDIN MATERNAL Y DE INFANTES SAN VICENTE','536'],
  ['JOVENES POR LOS JOVENES','594'],['JUBILACIONES Y PENSIONES','261'],
  ['LAB BAHIA LABORATORIO','848'],
  ['LILIANA ABIA DE CECI (EX CASA DEL NIÑO ING. WHITE)','522'],
  ['MAMAS CUIDADORAS','564'],['MAYORDOMIA','432'],['MERCADO MUNICIPAL','233'],
  ['MUSEO DE ARTE CONTEMPORANEO','318'],['MUSEO DE BELLAS ARTES','801'],
  ['MUSEO DE CIENCIAS NATURALES','327'],['MUSEO DEL DEPORTE','367'],
  ['MUSEO DEL PUERTO','312'],['MUSEO FERROWHITE','802'],['MUSEO HISTORICO','313'],
  ['OFICINA DE COORDINACION NIDO','532'],['OFICINA DE PERSONAS JURIDICAS','754'],
  ['OFICINA PROMOCION INDUSTRIAL','200'],['P. ENVION CARACOL','608'],
  ['P. ENVION ESTELA MARIS','606'],['P. ENVION SALADERO','609'],
  ['PEQUEÑOS HOGARES - HOGAR SUST.','524'],['PLAN APELL','613'],
  ['PLANTAS DE TRATAMIENTO Y CLASIFICACION DE RESIDUOS','641'],
  ['PROG. ENVION SPURR','607'],['PROGRAMA CABALLO DE TROYA','753'],
  ['PROTOCOLO Y RELACIONES INSTITUCIONALES','130'],['PROYECTO APICULTURA','578'],
  ['REGISTRO PATRIMONIAL','217'],['SANEAMIENTO AMBIENTAL','617'],
  ['SEC. DE GOBIERNO','310'],['SEC. DE INFRAESTRUCTURA','410'],
  ['SEC. DE POLITICAS SOCIALES','510'],['SEC. DE SALUD','796'],
  ['SECRETARIA DE ECONOMIA','210'],['SECRETARIA DE GESTION URBANA','636'],
  ['SECRETARIA DE INNOVACION Y TRANSFORACION DIGITAL','134'],
  ['SECRETARIA DE PRODUCCION','101'],['SECRETARIA GENERAL','110'],
  ['SERV. LOC. PROM Y PROT.I.DER. NIÑOS Y ADOLES.','583'],
  ['SERVICIO SOCIAL','516'],['SISTEMA DE AMAS EXTERNAS','585'],
  ['SUBDIR. DE PRENSA Y CONTENIDOS PUBLICOS','121'],
  ['SUBDIR. GESTION DE PRESTACIONES','513'],['SUBDIRECCION DE PRESUPUESTO','219'],
  ['SUBDIRECCION DE SISTEMAS E INFR. TECNOLOGICA','223'],
  ['SUBSEC. DE GESTION AMBIENTAL','621'],
  ['SUBSEC. DE PLANIFICACION Y CALIDAD DE GESTION','140'],
  ['SUBSECR. DE NINEZ, ADOLESC. Y FAMILIA','593'],
  ['SUBSECRETARIA DE ATENCION INTEGRAL DE SALUD','576'],
  ['SUBSECRETARIA DE DEPORTES','527'],['SUBSECRETARIA DE DESARROLLO','102'],
  ['SUBSECRETARIA DE DESARROLLO SOCIAL','504'],
  ['SUBSECRETARIA DE GESTION URBANA','644'],
  ['SUBSECRETARIA DE GESTION Y ECON DE LA SALUD','511'],
  ['SUBSECRETARIA DE GOBIERNO','372'],['SUBSECRETARIA DE INGRESOS PUBLICOS','221'],
  ['SUBSECRETARIA DE MANTENIMIENTO','447'],
  ['SUBSECRETARIA DE MEDIOS Y CONTENIDOS PUBLICOS','129'],
  ['SUBSECRETARIA DE PLANIFICACION','155'],
  ['SUBSECRETARIA DE PLANIFICACION Y CONTROL DEL GASTO','248'],
  ['SUBSECRETARIA DE PLANIFICACION Y DESARROLLO URBANO','446'],
  ['SUBSECRETARIA DE PRODUCCION Y EMPLEO','244'],
  ['SUBSECRETARIA DE PROTECCION CIUDADANA','791'],
  ['SUBSECRETARIA DE PROYECTOS Y OBRAS','445'],['SUBSECRETARIA LEGAL Y TECNICA','152'],
  ['SUEÑO DE BARRILETE','523'],['TEATRO MUNICIPAL','319'],
  ['TERMINAL DE OMNIBUS SAN FRANCISCO DE ASIS','330'],['TRIBUNAL DE FALTAS','111'],
].sort((a,b) => a[0].localeCompare(b[0]));

async function supa(tabla, method = 'GET', body = null, params = '') {
  const qs = params ? `&${params.replace(/^\?/, '')}` : '';
  const res = await fetch(`/api/proxy?project=municipio&path=${tabla}${qs}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : null
  });
  if (!res.ok) throw new Error(await res.text());
  if (method === 'DELETE' || method === 'PATCH') return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function proximoNumeroOT() {
  const rows = await supa('ordenes_trabajo', 'GET', null, '?select=numero_ot&order=numero_ot.desc&limit=1');
  return rows.length ? rows[0].numero_ot + 1 : 200001;
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
.dep-wrap { position:relative; }
.dep-input { width:100%; box-sizing:border-box; }
.dep-drop { display:none; position:absolute; top:100%; left:0; right:0; background:#fff; border:1.5px solid #0b1b35; border-top:none; border-radius:0 0 8px 8px; max-height:200px; overflow-y:auto; z-index:999; }
.dep-opt { padding:9px 12px; font-size:13px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; }
.dep-opt:hover { background:#f1f5f9; }
.dep-cod { font-size:11px; color:#94a3b8; margin-left:8px; }
.dep-empty { color:#94a3b8; cursor:default; }
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
  <div style="display:flex;gap:8px;margin-bottom:10px">
    <button class="tall-nuevo" style="margin-bottom:0" onclick="abrirNuevaOT()">+ Nueva Orden de Trabajo</button>
    <button onclick="abrirBasureroOT()" style="padding:11px 14px;background:#f1f5f9;border:1.5px solid #e2e8f0;border-radius:10px;font-size:18px;cursor:pointer;flex-shrink:0" title="Basurero">🗑</button>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:6px">
    <select id="ot-filtro-estado" onchange="renderOTs()" style="flex:1;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;outline:none">
      <option value="">Todas</option>
      <option value="Abierta">Abiertas</option>
      <option value="Cerrada">Cerradas</option>
    </select>
    <select id="ot-filtro-mes" onchange="renderOTs()" style="flex:1;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;outline:none">
      <option value="">Todos los meses</option>
    </select>
  </div>
  <div style="margin-bottom:12px">
    <select id="ot-filtro-seccion" onchange="renderOTs()" style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;outline:none">
      <option value="">Todos los sectores</option>
      <option>ALMACEN</option>
      <option>MECANICA PESADA</option>
      <option>MECANICA LIVIANA</option>
      <option>CARPINTERIA</option>
      <option>TORNERIA</option>
      <option>HERRERIA</option>
      <option>MECANICA VIAL</option>
      <option>LUBRICENTRO</option>
      <option>OFICINA</option>
      <option>ELECTRICIDAD</option>
    </select>
  </div>
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
      <div class="tall-field"><label>R.I. del Vehículo</label>
        <input id="ot-ri" list="ri-datalist" placeholder="Escribí el RI..." oninput="filtrarRIs(this.value)" autocomplete="off">
        <datalist id="ri-datalist"></datalist>
      </div>
      <div class="tall-field"><label>Sección</label>
        <select id="ot-seccion">
          <option value="">— Seleccioná —</option>
          <option>ALMACEN</option>
          <option>MECANICA PESADA</option>
          <option>MECANICA LIVIANA</option>
          <option>CARPINTERIA</option>
          <option>TORNERIA</option>
          <option>HERRERIA</option>
          <option>MECANICA VIAL</option>
          <option>LUBRICENTRO</option>
          <option>OFICINA</option>
          <option>ELECTRICIDAD</option>
        </select>
      </div>
    </div>
    <div class="tall-field"><label>Dependencia</label>
      <div class="dep-wrap" id="wrap-ot-dependencia">
        <input type="text" id="ot-dependencia-input" class="dep-input" placeholder="Buscar dependencia..." autocomplete="off">
        <input type="hidden" id="ot-dependencia">
        <div class="dep-drop" id="ot-dependencia-drop"></div>
      </div>
    </div>
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
    <div class="tall-field"><label>Dependencia</label>
      <div class="dep-wrap" id="wrap-v-dependencia">
        <input type="text" id="v-dependencia-input" class="dep-input" placeholder="Buscar dependencia..." autocomplete="off">
        <input type="hidden" id="v-dependencia">
        <div class="dep-drop" id="v-dependencia-drop"></div>
      </div>
    </div>
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
  window.cerrarOT   = (id) => cambiarEstadoOT(id, 'Cerrada');
  window.reabrirOT  = (id) => cambiarEstadoOT(id, 'Abierta');
  window.renderOTs  = renderOTs;

  llenarDependencias();
  cargarRIsFlota();
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

// ── Dependencias y RIs ───────────────────────────────────────────────────────
function initDepSearch(baseId) {
  const input = document.getElementById(baseId + '-input');
  const hidden = document.getElementById(baseId);
  const drop   = document.getElementById(baseId + '-drop');
  const wrap   = document.getElementById('wrap-' + baseId);
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (q.length < 1) { drop.style.display = 'none'; return; }
    const filtered = DEPENDENCIAS.filter(([n,c]) =>
      n.toLowerCase().includes(q) || c.includes(q)
    ).slice(0, 20);
    drop.innerHTML = filtered.length
      ? filtered.map(([n,c]) =>
          `<div class="dep-opt" data-val="${c} - ${n}">${n} <span class="dep-cod">${c}</span></div>`
        ).join('')
      : '<div class="dep-opt dep-empty">Sin resultados</div>';
    drop.style.display = 'block';
  });

  drop.addEventListener('click', e => {
    const opt = e.target.closest('.dep-opt[data-val]');
    if (!opt) return;
    input.value  = opt.querySelector('.dep-cod') ? opt.firstChild.textContent.trim() : '';
    hidden.value = opt.dataset.val;
    drop.style.display = 'none';
  });

  document.addEventListener('click', e => {
    if (!wrap.contains(e.target)) drop.style.display = 'none';
  });
}

function llenarDependencias() {
  ['ot-dependencia','v-dependencia'].forEach(initDepSearch);
}

let riData = [];

async function cargarRIsFlota() {
  try {
    const res  = await fetch('https://marcelofurlong3.github.io/flota-municipal/indice_vehiculos.json');
    const data = await res.json();
    const porRi = data.por_ri || {};
    riData = Object.values(porRi)
      .filter(v => v.ri)
      .map(v => ({
        ri:   v.ri.toUpperCase(),
        desc: v.modelo ? v.modelo.toUpperCase() : '',
        dep:  v.dep  || ''
      }))
      .sort((a,b) => a.ri.localeCompare(b.ri));
  } catch(e) { console.warn('RIs no cargados:', e); }
}

window.filtrarRIs = function(val) {
  const q = val.toUpperCase();
  const dl = document.getElementById('ri-datalist');
  if (!dl || q.length < 1) return;
  const filtered = riData.filter(v => v.ri.startsWith(q) || v.desc.includes(q)).slice(0, 30);
  dl.innerHTML = filtered.map(v => {
    const label = [v.desc, v.dep].filter(Boolean).join(' · ');
    return `<option value="${v.ri}">${label}</option>`;
  }).join('');
}

async function eliminarOT(id) {
  if (!confirm('¿Mandás esta OT al basurero?')) return;
  try {
    await supa('ordenes_trabajo?id=eq.'+id, 'PATCH', { eliminado: true });
    toast('OT enviada al basurero', 'ok');
    document.querySelector('.tall-detalle-modal')?.remove();
    await cargarOTs();
  } catch(e) { toast('Error: '+e.message, 'err'); }
}

window.eliminarOT = eliminarOT;

window.abrirBasureroOT = async function() {
  const eliminadas = await supa('ordenes_trabajo', 'GET', null, '?eliminado=eq.true&order=numero_ot.desc');
  const area = document.createElement('div');
  area.className = 'tall-detalle-modal';
  area.style = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:400;padding:20px;display:flex;align-items:center;justify-content:center';
  const items = eliminadas.length
    ? eliminadas.map(ot => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid #f1f5f9">
          <div>
            <div style="font-size:13px;font-weight:700;color:#0b1b35">OT ${ot.numero_ot} — ${ot.ri||'—'}</div>
            <div style="font-size:11px;color:#94a3b8">${ot.dependencia||''} · ${ot.fecha||''}</div>
          </div>
          <div style="display:flex;gap:6px">
            <button onclick="recuperarOT(${ot.id})" style="padding:6px 12px;background:#dcfce7;color:#166534;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">↩ Recuperar</button>
            <button onclick="eliminarDefinitivoOT(${ot.id})" style="padding:6px 10px;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">🗑 Borrar</button>
          </div>
        </div>`).join('')
    : '<p style="text-align:center;color:#94a3b8;padding:20px;font-size:13px">El basurero está vacío</p>';
  area.innerHTML = `
    <div style="background:#fff;border-radius:14px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid #f1f5f9">
        <span style="font-size:16px;font-weight:800;color:#0b1b35">🗑 Basurero — OTs eliminadas</span>
        <button onclick="this.closest('.tall-detalle-modal').remove()" style="background:none;border:none;font-size:20px;color:#94a3b8;cursor:pointer">×</button>
      </div>
      ${items}
    </div>`;
  document.body.appendChild(area);
};

window.eliminarDefinitivoOT = async function(id) {
  if (!confirm('⚠️ Esto borra la OT para siempre. ¿Confirmás?')) return;
  try {
    await supa('ordenes_trabajo?id=eq.'+id, 'DELETE');
    toast('OT eliminada definitivamente', 'ok');
    document.querySelector('.tall-detalle-modal')?.remove();
    await cargarOTs();
  } catch(e) { toast('Error: '+e.message, 'err'); }
};

window.recuperarOT = async function(id) {
  try {
    await supa('ordenes_trabajo?id=eq.'+id, 'PATCH', { eliminado: false });
    toast('OT recuperada', 'ok');
    document.querySelector('.tall-detalle-modal')?.remove();
    await cargarOTs();
  } catch(e) { toast('Error: '+e.message, 'err'); }
};

async function cambiarEstadoOT(id, estado) {
  try {
    const patch = { estado };
    if (estado === 'Cerrada') patch.fecha_cierre = new Date().toISOString().slice(0,10);
    if (estado === 'Abierta') patch.fecha_cierre = null;
    await supa('ordenes_trabajo?id=eq.'+id, 'PATCH', patch);
    toast('OT ' + estado.toLowerCase(), 'ok');
    document.querySelector('.tall-detalle-modal')?.remove();
    await cargarOTs();
  } catch(e) { toast('Error: '+e.message, 'err'); }
}

// ── Cargar ────────────────────────────────────────────────────────────────────
async function cargarOTs() {
  try {
    otsCache = await supa('ordenes_trabajo', 'GET', null, '?eliminado=not.eq.true&order=numero_ot.desc');
    poblarMesesOT();
    renderOTs();
  } catch(e) { document.getElementById('lista-ot').innerHTML = '<div style="padding:20px;color:#ef4444;font-size:13px">Error al cargar</div>'; }
}

function poblarMesesOT() {
  const sel = document.getElementById('ot-filtro-mes');
  if (!sel) return;
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const vistos = new Set();
  const opts = [];
  otsCache.forEach(ot => {
    const f = ot.fecha || (ot.created_at ? ot.created_at.slice(0,10) : null);
    if (!f) return;
    const [anio, mes] = f.split('-');
    const key = `${anio}-${mes}`;
    if (!vistos.has(key)) {
      vistos.add(key);
      opts.push({ key, label: `${meses[parseInt(mes)-1]} ${anio}` });
    }
  });
  const actual = sel.value;
  sel.innerHTML = '<option value="">Todos los meses</option>' +
    opts.map(o => `<option value="${o.key}" ${actual===o.key?'selected':''}>${o.label}</option>`).join('');
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
  const filtroEstado  = (document.getElementById('ot-filtro-estado')||{}).value || '';
  const filtroMes     = (document.getElementById('ot-filtro-mes')||{}).value || '';
  const filtroSeccion = (document.getElementById('ot-filtro-seccion')||{}).value || '';

  let lista = otsCache;
  if (filtroEstado)  lista = lista.filter(o => (o.estado||'Abierta') === filtroEstado);
  if (filtroSeccion) lista = lista.filter(o => (o.seccion||'') === filtroSeccion);
  if (filtroMes)     lista = lista.filter(o => {
    const f = o.fecha || (o.created_at ? o.created_at.slice(0,10) : '');
    return f.slice(0,7) === filtroMes;
  });

  if (!lista.length) { el.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:13px">Sin resultados</div>'; return; }
  el.innerHTML = lista.map(ot => {
    const fechaApertura = ot.fecha || (ot.created_at ? ot.created_at.slice(0,10) : '—');
    const fechaCierre   = ot.fecha_cierre ? ` · Cerrada: ${ot.fecha_cierre}` : '';
    return `
    <div class="tall-card" onclick="abrirDetalleOT(${ot.id})">
      <div class="tall-card-hdr">
        <span class="tall-num">OT ${ot.numero_ot}</span>
        <span class="tall-badge ${(ot.estado||'abierta').toLowerCase()}">${ot.estado||'Abierta'}</span>
      </div>
      <div class="tall-ri">${ot.ri||'—'} · ${ot.seccion||'—'}</div>
      <div class="tall-dep">${ot.dependencia||'—'}</div>
      <div class="tall-items">${ot.descripcion||''}</div>
      <div style="font-size:10px;color:#94a3b8;margin-top:5px">Abierta: ${fechaApertura}${fechaCierre} · ${ot.nombre_solicita||'—'}</div>
    </div>`;
  }).join('');
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
  area.className = 'tall-detalle-modal';
  area.style = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:400;padding:20px;display:flex;align-items:center;justify-content:center';
  const esCerrada = (ot.estado||'') === 'Cerrada';
  area.innerHTML = `
    <div style="padding:16px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;max-width:500px;width:100%">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:18px;font-weight:800;color:#0b1b35">OT ${ot.numero_ot}</span>
          <span class="tall-badge ${(ot.estado||'abierta').toLowerCase()}">${ot.estado||'Abierta'}</span>
        </div>
        <button onclick="this.closest('.tall-detalle-modal').remove()" style="background:none;border:none;font-size:20px;color:#94a3b8;cursor:pointer;line-height:1;padding:0 4px">×</button>
      </div>
      <div style="font-size:13px;color:#334155;line-height:2">
        <b>Fecha:</b> ${ot.fecha||''}<br><b>RI:</b> ${ot.ri||''}<br>
        <b>Sección:</b> ${ot.seccion||''}<br><b>Dependencia:</b> ${ot.dependencia||''}<br>
        <b>Solicita:</b> ${ot.nombre_solicita||''} (Leg. ${ot.legajo_solicita||''})<br>
        <b>Descripción:</b> ${ot.descripcion||''}
      </div>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="tall-btn-print no-print" onclick="imprimirOTById(${id})">🖨 Imprimir OT</button>
        ${esCerrada
          ? `<button class="tall-btn-retiro no-print" onclick="reabrirOT(${id})">🔓 Reabrir OT</button>`
          : `<button style="flex:1;padding:10px;background:#64748b;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer" class="no-print" onclick="cerrarOT(${id})">🔒 Cerrar OT</button>`
        }
        <button style="padding:10px 14px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer" class="no-print" onclick="eliminarOT(${id})">🗑</button>
      </div>
    </div>`;
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
@media print {
  @page { size:A4 portrait; margin:0; }
  body { margin:0; background:white !important; }
}
.ot-wrap { font-family:Arial,sans-serif; font-size:10.5px; color:#000; line-height:1.4;
           padding:14mm 14mm 10mm 14mm; box-sizing:border-box;
           width:210mm; min-height:297mm; background:white; }
.ot-linea { border-bottom:1px dashed #555; height:20px; margin:0; }
.ot-bloque { margin-top:16px; }
.ot-fila { display:flex; align-items:flex-end; gap:4px; }
.ot-fila b { font-size:9.5px; font-weight:bold; white-space:nowrap; }
.ot-raya { flex:1; border-bottom:1px dashed #555; margin-bottom:2px; }
</style>
<div class="ot-wrap">
  <p style="margin:0 0 3px;font-size:9px">Departamento de Talleres</p>
  <p style="margin:0 0 8px;font-size:14px;font-weight:bold;padding-left:14px">O.T.: ${ot.numero_ot}</p>
  <div style="display:flex;justify-content:space-between;padding-left:14px">
    <div style="line-height:1.75">
      <div>Sección &nbsp;<b>${ot.seccion||''}</b></div>
      <div>R.I.: &nbsp;<b>${ot.ri||''}</b></div>
      <div>Dependencia: &nbsp;${ot.dependencia||''}</div>
      <div>Solicita: &nbsp;${ot.legajo_solicita||''} &nbsp;&nbsp; ${ot.nombre_solicita||''}</div>
    </div>
    <div style="text-align:right;line-height:1.75">
      <div>Fecha: &nbsp;${ot.fecha||''}</div>
      <div>Memo n°: &nbsp;${ot.memo||''}</div>
      <div>Odómetro: &nbsp;${ot.odometro||0}</div>
    </div>
  </div>
  <p style="margin:7px 0 20px;padding-left:14px">${(ot.descripcion||'').toUpperCase().replace(/\n/g,'<br>')}</p>

  <div class="ot-bloque">
    <div class="ot-fila"><b>TAREAS EFECTUADAS:</b><div class="ot-raya"></div></div>
    <div class="ot-linea"></div><div class="ot-linea"></div><div class="ot-linea"></div><div class="ot-linea"></div>
  </div>

  <div class="ot-bloque">
    <div class="ot-fila"><b>REPUESTOS/INSUMOS UTILIZADOS:</b><div class="ot-raya"></div></div>
    <div class="ot-linea"></div><div class="ot-linea"></div><div class="ot-linea"></div><div class="ot-linea"></div>
  </div>

  <div class="ot-bloque">
    <div class="ot-fila"><b>LEG. AGENTE INTERVINIENTES:</b><div class="ot-raya"></div></div>
    <div class="ot-linea"></div>
  </div>

  <div class="ot-bloque">
    <div class="ot-fila"><b>CANTIDAD DE HORAS UTILIZADASDAS:</b><div class="ot-raya"></div></div>
    <div class="ot-linea"></div>
  </div>

  <div style="margin-top:14mm;display:flex;gap:30px">
    <span>Fecha y Hora Entrada: _______________</span>
    <span>Fecha y Hora Salida: _______________</span>
  </div>
  <div style="display:flex;gap:18px;margin-top:8px">
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
