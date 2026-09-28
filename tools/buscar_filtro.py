#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
buscar_filtro.py - Investigador de filtros del Municipio de Bahia Blanca
Dado un codigo de filtro, busca en internet con Playwright y cruza con la flota.

Uso: python buscar_filtro.py AA1705
     python buscar_filtro.py ARS9837
     python buscar_filtro.py P551010
"""

import os, sys, re, time, requests
from difflib import SequenceMatcher
from urllib.parse import quote_plus

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── Config Supabase ────────────────────────────────────────────────────────────
SUPA_URL = "https://sugkmcdngvtvwzglodkh.supabase.co"
SUPA_KEY = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
            ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Z2ttY2RuZ3Z0dnd6Z2xvZGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjk5ODMsImV4cCI6MjA5ODY0NTk4M30"
            ".hL-0sa0ZmeY7iZ_Zy50Dy8k8oxqbYlc4cWZ82HDiEbM")
HEADERS_SUPA = {"apikey": SUPA_KEY, "Authorization": f"Bearer {SUPA_KEY}"}

MARCAS_FLOTA = [
    "CATERPILLAR", "JOHN DEERE", "NEW HOLLAND", "CASE", "VOLVO", "SCANIA",
    "MERCEDES", "IVECO", "VOLKSWAGEN", "FORD", "CHEVROLET", "FIAT", "NISSAN",
    "TOYOTA", "RENAULT", "PEUGEOT", "HYUNDAI", "MITSUBISHI", "AGRALE", "DEUTZ",
    "LONKING", "MICHIGAN", "XCMG", "ZHENGLOADER", "MAN", "ISUZU", "HINO",
    "KOMATSU", "HIDROMEK", "MANITOU", "YANMAR",
]


# ── 1. Playwright — scraping real ──────────────────────────────────────────────

def scrape_con_playwright(codigo):
    """
    Abre un navegador real (invisible) y busca el filtro en los catálogos argentinos.
    Retorna lista de textos con info del vehiculo.
    """
    from playwright.sync_api import sync_playwright

    codigo_lower = codigo.lower().replace(" ", "").replace("-", "")
    urls = [
        # Monza — fabricante del filtro AA, MR, etc.
        f"https://monzafiltros.com.ar/?s={quote_plus(codigo)}",
        # disfil — distribuidor argentino con catalogo completo
        f"https://disfil.com.ar/?s={quote_plus(codigo)}",
        # especialistasenfiltros — busca por codigo
        f"https://www.especialistasenfiltros.com.ar/?s={quote_plus(codigo)}",
        # sf-filter — cruce de referencias
        f"https://www.sf-filter.com/en/cross-reference-list?searchValue={quote_plus(codigo)}",
        # Google via Playwright (renderiza JS)
        f"https://www.google.com/search?q={quote_plus(f'filtro {codigo} aplicacion camion argentina')}&hl=es",
    ]

    textos = []
    cod_n = codigo.upper().replace("-", "").replace(" ", "")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for url in urls:
            page = None
            try:
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                               "AppleWebKit/537.36 (KHTML, like Gecko) "
                               "Chrome/120.0.0.0 Safari/537.36",
                    locale="es-AR"
                )
                page = context.new_page()
                page.goto(url, timeout=18000, wait_until="domcontentloaded")
                time.sleep(1.5)
                texto = page.inner_text("body")
                tiene_codigo = cod_n in texto.upper().replace("-", "").replace(" ", "")
                tiene_marca  = any(m in texto.upper() for m in MARCAS_FLOTA)
                if tiene_codigo or tiene_marca:
                    textos.append(texto[:4000])
                    print(f"  [pw]   OK: {url[:65]}")
                else:
                    print(f"  [pw]   sin datos utiles: {url[:55]}")
            except Exception as e:
                msg = str(e).split("\n")[0][:80]
                print(f"  [pw]   error: {msg}")
            finally:
                if page:
                    try: page.close()
                    except: pass
                try: context.close()
                except: pass

        browser.close()

    return textos


def buscar_google_simple(codigo):
    """
    Busca en Google News/Search como texto plano (sin JS).
    Funciona a veces como complemento.
    """
    url = (f"https://www.google.com/search?q="
           f"{quote_plus(f'filtro {codigo} aplicacion vehiculo camion argentina')}"
           f"&num=5&hl=es")
    try:
        r = requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
        }, timeout=10)
        return [r.text[:3000]] if len(r.text) > 500 else []
    except:
        return []


MONZA_PDF_URL = ("https://www.autopartcomodoro.com.ar/wp-content/uploads"
                 "/2014/07/MONZA-septiembre-14.pdf")
_monza_pdf_cache = None

def buscar_en_monza_pdf(codigo):
    """
    Lee el catalogo Monza 2014 (PDF) y busca el codigo.
    Funciona para prefijos AA y MR. Cachea el PDF en memoria.
    Retorna la linea exacta del catalogo o None.
    """
    global _monza_pdf_cache
    try:
        import pdfplumber, io
        if _monza_pdf_cache is None:
            r = requests.get(MONZA_PDF_URL,
                             headers={"User-Agent": "Mozilla/5.0"}, timeout=20)
            _monza_pdf_cache = r.content

        cod_n = codigo.upper().replace("-", "").replace(" ", "")
        with pdfplumber.open(io.BytesIO(_monza_pdf_cache)) as pdf:
            for page in pdf.pages:
                texto = page.extract_text() or ""
                if cod_n in texto.upper().replace("-", "").replace(" ", ""):
                    idx = texto.upper().replace("-", "").replace(" ", "").find(cod_n)
                    # Reconstruir posicion aproximada en texto original
                    lineas = texto.split("\n")
                    for linea in lineas:
                        if cod_n in linea.upper().replace("-", "").replace(" ", ""):
                            return linea.strip()
        return None
    except Exception as e:
        return None


def investigar_web(codigo):
    """
    Estrategia por tipo de filtro:
    - AA / MR (Monza) → PDF del catalogo Monza
    - Otros → Playwright en disfil + sf-filter
    """
    prefijo = codigo[:2].upper().replace("-", "")
    textos = []

    if prefijo in ("AA", "MR"):
        print(f"  [pdf]  Buscando en catalogo Monza...")
        linea = buscar_en_monza_pdf(codigo)
        if linea:
            print(f"  [pdf]  Encontrado: {linea[:80]}")
            textos.append(linea)
        else:
            print(f"  [pdf]  No encontrado en catalogo Monza")

    if not textos:
        textos = scrape_con_playwright(codigo)

    return textos


# ── 2. Extraccion de marcas ────────────────────────────────────────────────────

def extraer_menciones(textos):
    """
    Extrae menciones de marcas del texto. Evita falsos positivos:
    - MAN solo si va seguido de espacio+numero o solo (no "Management", "Manual")
    - CASE solo si no es "because", "in case", etc.
    """
    menciones = {}
    # Marcas que necesitan validacion extra (estan contenidas en palabras comunes)
    MARCAS_ESTRICTAS = {"MAN", "CASE", "FORD"}

    for texto in textos:
        texto_up = texto.upper()
        for marca in MARCAS_FLOTA:
            if marca not in texto_up:
                continue
            # Para marcas estrictas, verificar que sea una palabra entera
            if marca in MARCAS_ESTRICTAS:
                # Buscar como palabra completa con regex
                patron = r'(?<![A-Z])' + marca + r'(?![A-Z])'
                if not re.search(patron, texto_up):
                    continue
            idx = texto_up.find(marca)
            contexto = texto[idx:idx + 100].strip()
            menciones.setdefault(marca, []).append(contexto)
    return menciones


def extraer_modelos_prix(textos):
    """
    prix.com.ar lista los vehiculos compatibles en su pagina de producto.
    Busca el patron 'APLICACIONES:' o listas de modelos.
    """
    modelos = []
    for texto in textos:
        # Buscar seccion de aplicaciones
        idx = texto.upper().find("APLICACION")
        if idx >= 0:
            bloque = texto[idx:idx + 800]
            modelos.append(bloque)
        # Buscar patron de modelo (marca + numero)
        patrones = re.findall(
            r'((?:MERCEDES|FORD|IVECO|VOLKSWAGEN|AGRALE|DEUTZ|SCANIA|VOLVO|'
            r'CATERPILLAR|JOHN\s?DEERE|NEW\s?HOLLAND)[^,\n]{3,50})',
            texto, re.IGNORECASE
        )
        modelos.extend(patrones[:10])
    return modelos


# ── 3. Carga de flota ─────────────────────────────────────────────────────────

def cargar_flota():
    try:
        r = requests.get(
            SUPA_URL + "/rest/v1/kits_filtros"
            "?select=modelo,ris,filtro_aceite,filtro_aire,filtro_aire_secundario,"
            "filtro_combustible,filtro_trampa,filtro_transmision&limit=500",
            headers=HEADERS_SUPA, timeout=10
        )
        return r.json()
    except Exception as e:
        print(f"  ERROR cargando flota: {e}")
        return []


def cargar_alternativos():
    try:
        r = requests.get(
            SUPA_URL + "/rest/v1/kits_alternativos"
            "?select=modelo,codigo,marca,tipo&limit=1000",
            headers=HEADERS_SUPA, timeout=10
        )
        return r.json()
    except:
        return []


# ── 4. Scoring ────────────────────────────────────────────────────────────────

def norm(s):
    return s.upper().replace("-", "").replace(" ", "")


def similitud(a, b):
    return SequenceMatcher(None, a.upper(), b.upper()).ratio()


def puntuar(vehiculo, menciones, modelos_prix, codigo):
    modelo_up = vehiculo["modelo"].upper()
    score = 0.0
    razon = []

    # A) Match exacto en campos de filtro de la base
    campos = {
        "filtro_aceite": vehiculo.get("filtro_aceite"),
        "filtro_aire": vehiculo.get("filtro_aire"),
        "filtro_aire_secundario": vehiculo.get("filtro_aire_secundario"),
        "filtro_combustible": vehiculo.get("filtro_combustible"),
        "filtro_trampa": vehiculo.get("filtro_trampa"),
        "filtro_transmision": vehiculo.get("filtro_transmision"),
    }
    cod_n = norm(codigo)
    for campo, valor in campos.items():
        if valor and norm(valor) == cod_n:
            return 1.0, [f"match exacto en {campo}: {valor}"]
        elif valor and (cod_n in norm(valor) or norm(valor) in cod_n):
            score = max(score, 0.85)
            razon.append(f"match parcial en {campo}: {valor}")

    # B) El modelo aparece textualmente en lo que scrapeo de prix
    for bloque in modelos_prix:
        if modelo_up[:15] in bloque.upper():
            score = max(score, 0.88)
            razon.append(f"modelo encontrado en catalogo: '{bloque[:60]}'")
        else:
            sim = similitud(modelo_up, bloque)
            if sim > 0.6:
                score = max(score, sim * 0.75)
                razon.append(f"similitud {int(sim*100)}% con catalogo: '{bloque[:50]}'")

    # C) Marca del vehiculo en texto scrapeado
    for marca in MARCAS_FLOTA:
        if marca in modelo_up and marca in menciones:
            for contexto in menciones[marca]:
                sim = similitud(modelo_up, contexto)
                if sim > 0.5:
                    bonus = sim * 0.65
                elif sim > 0.25:
                    bonus = 0.3
                else:
                    bonus = 0.2
                if bonus > score:
                    score = bonus
                    razon.append(f"marca {marca} en web, sim {int(sim*100)}%: '{contexto[:50]}'")

    return score, razon


# ── 5. Investigacion principal ─────────────────────────────────────────────────

def investigar(codigo):
    codigo_orig = codigo.strip().upper()
    sep = "=" * 55
    print(f"\n{sep}")
    print(f"  INVESTIGANDO FILTRO: {codigo_orig}")
    print(sep)

    # Web con Playwright
    print(f"  [web]  Abriendo navegador...")
    textos = investigar_web(codigo_orig)
    print(f"  [web]  {len(textos)} paginas con datos obtenidos")

    # Extraer menciones y modelos
    menciones = extraer_menciones(textos)
    modelos_prix = extraer_modelos_prix(textos)
    marcas = list(menciones.keys())

    if marcas:
        print(f"  [web]  Marcas detectadas: {', '.join(marcas)}")
    if modelos_prix:
        print(f"  [web]  Modelos del catalogo: {modelos_prix[0][:80]}")

    # Flota
    print(f"  [db]   Cargando flota...")
    flota = cargar_flota()
    alternativos = cargar_alternativos()
    print(f"  [db]   {len(flota)} modelos | {len(alternativos)} alternativos")

    # Match directo en alternativos
    alt_hits = [a for a in alternativos if norm(a.get("codigo", "")) == norm(codigo_orig)]
    if alt_hits:
        print(f"\n  ** Codigo encontrado como alternativo en la base:")
        for a in alt_hits:
            print(f"     -> {a['marca']} | tipo: {a['tipo']} | modelo: {a['modelo']}")

    # Puntuar
    resultados = []
    for v in flota:
        score, razon = puntuar(v, menciones, modelos_prix, codigo_orig)
        if score > 0.18:
            resultados.append({
                "modelo": v["modelo"],
                "ris": v.get("ris") or [],
                "score": score,
                "razon": razon,
            })

    resultados.sort(key=lambda x: x["score"], reverse=True)

    # Resultado
    print(f"\n{'-'*55}")
    print(f"  RESULTADO: {codigo_orig}")
    print(f"{'-'*55}")

    if not resultados and not alt_hits:
        print("  Sin coincidencias en la flota.")
        if marcas:
            print(f"  Pista: revisar vehiculos de marca {', '.join(marcas)}")
        print("  Puede ser vehiculo aun no cargado (72/269 modelos).")
    else:
        for i, r in enumerate(resultados[:6]):
            pct = int(r["score"] * 100)
            ris_str = ", ".join(r["ris"][:6]) or "---"
            if len(r["ris"]) > 6:
                ris_str += f" (+{len(r['ris'])-6})"
            barra = "#" * (pct // 10) + "." * (10 - pct // 10)
            print(f"\n  [{i+1}] {pct:3d}%  [{barra}]")
            print(f"       {r['modelo']}")
            print(f"       RIs: {ris_str}")
            if r["razon"]:
                print(f"       -> {r['razon'][0]}")

    print(f"\n{sep}\n")
    return resultados


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python tools/buscar_filtro.py CODIGO")
        print("Ej:  python tools/buscar_filtro.py AA1705")
        sys.exit(1)
    investigar(" ".join(sys.argv[1:]))
