#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
buscar_filtro.py - Investigador de filtros del Municipio de Bahia Blanca
Dado un codigo de filtro, busca en internet y cruza con la flota municipal.

Uso: python buscar_filtro.py ARS9837
     python buscar_filtro.py P551010
"""

import os, sys, re, json, requests
from urllib.parse import quote_plus
from difflib import SequenceMatcher

try:
    import anthropic
    _HAS_ANTHROPIC = True
except ImportError:
    _HAS_ANTHROPIC = False

# Forzar UTF-8 en la salida
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
    "TOYOTA", "RENAULT", "PEUGEOT", "HYUNDAI", "MITSUBISHI",
    "LONKING", "MICHIGAN", "XCMG", "ZHENGLOADER", "MAN", "ISUZU", "HINO",
    "KOMATSU", "HIDROMEK", "MANITOU", "YANMAR",
]

BROWSER_HEADERS = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/120.0.0.0 Safari/537.36")
}


# ── 1. Busqueda web ────────────────────────────────────────────────────────────

def consultar_claude(codigo):
    """
    Usa Claude Haiku para identificar el vehiculo de un codigo de filtro.
    Requiere ANTHROPIC_API_KEY en el entorno.
    """
    if not _HAS_ANTHROPIC:
        return None
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    try:
        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            messages=[{
                "role": "user",
                "content": (
                    f"Soy mecanico de una flota municipal en Argentina. "
                    f"Tengo un filtro con codigo '{codigo}'. "
                    f"Necesito saber: para que marca y modelo de vehiculo es este filtro, "
                    f"de que tipo es (aceite/aire/combustible/trampa), "
                    f"y si conoces codigos equivalentes de otras marcas. "
                    f"Respondeme solo con esa informacion, sin explicaciones largas. "
                    f"Formato: VEHICULO: ..., TIPO: ..., EQUIVALENTES: ..."
                )
            }]
        )
        return msg.content[0].text
    except Exception as e:
        return None


def extraer_texto_claude(respuesta):
    """Convierte la respuesta de Claude en lista de textos para extraer marcas."""
    if not respuesta:
        return []
    return [respuesta]


def investigar_web(codigo):
    """Investiga el codigo via Claude API (conocimiento de catalogo)."""
    respuesta = consultar_claude(codigo)
    if respuesta:
        return [respuesta]
    # Fallback: texto vacio, el scoring dependera solo de la base
    return []


# ── 2. Extraccion de marcas ────────────────────────────────────────────────────

def extraer_menciones(textos):
    menciones = {}
    for texto in textos:
        texto_up = texto.upper()
        for marca in MARCAS_FLOTA:
            if marca in texto_up:
                idx = texto_up.find(marca)
                contexto = texto[idx:idx + 80].strip()
                menciones.setdefault(marca, []).append(contexto)
    return menciones


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

def similitud(a, b):
    return SequenceMatcher(None, a.upper(), b.upper()).ratio()


def norm(s):
    return s.upper().replace("-", "").replace(" ", "")


def puntuar(vehiculo, menciones, codigo):
    modelo_up = vehiculo["modelo"].upper()
    score = 0.0
    razon = []

    # A) Match exacto en campos de filtro
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
        if valor:
            val_n = norm(valor)
            if cod_n == val_n:
                return 1.0, [f"match exacto en {campo}: {valor}"]
            elif cod_n in val_n or val_n in cod_n:
                score = max(score, 0.85)
                razon.append(f"match parcial en {campo}: {valor}")

    # B) Marca del vehiculo aparece en resultados web con contexto similar
    for marca in MARCAS_FLOTA:
        if marca in modelo_up and marca in menciones:
            for contexto in menciones[marca]:
                sim = similitud(modelo_up, contexto)
                if sim > 0.55:
                    bonus = sim * 0.7
                elif sim > 0.3:
                    bonus = sim * 0.45
                else:
                    bonus = 0.2  # marca presente pero sin similitud de modelo
                if bonus > score:
                    score = bonus
                    razon.append(
                        f"marca {marca} en web, similitud modelo {int(sim*100)}%: "
                        f"'{contexto[:50]}'"
                    )

    return score, razon


# ── 5. Investigacion principal ─────────────────────────────────────────────────

def investigar(codigo):
    codigo = norm(codigo)
    sep = "=" * 55
    print(f"\n{sep}")
    print(f"  INVESTIGANDO FILTRO: {codigo}")
    print(sep)

    # Web
    textos = investigar_web(codigo)
    print(f"  [web]  {len(textos)} fragmentos obtenidos")

    # Menciones de marcas
    menciones = extraer_menciones(textos)
    marcas = list(menciones.keys())
    if marcas:
        print(f"  [web]  Marcas detectadas: {', '.join(marcas)}")
    else:
        print(f"  [web]  Ninguna marca conocida detectada")

    # Flota
    print(f"  [db]   Cargando flota desde Supabase...")
    flota = cargar_flota()
    alternativos = cargar_alternativos()
    print(f"  [db]   {len(flota)} modelos | {len(alternativos)} codigos alternativos")

    # Match directo en alternativos
    alt_hits = [a for a in alternativos if norm(a.get("codigo", "")) == codigo]
    if alt_hits:
        print(f"\n  ** Codigo encontrado como alternativo en la base:")
        for a in alt_hits:
            print(f"     -> {a['marca']} | tipo: {a['tipo']} | modelo: {a['modelo']}")

    # Puntuar vehiculos
    resultados = []
    for v in flota:
        score, razon = puntuar(v, menciones, codigo)
        if score > 0.15:
            resultados.append({
                "modelo": v["modelo"],
                "ris": v.get("ris") or [],
                "score": score,
                "razon": razon,
            })

    resultados.sort(key=lambda x: x["score"], reverse=True)

    # Resultado
    print(f"\n{'-'*55}")
    print(f"  RESULTADO: {codigo}")
    print(f"{'-'*55}")

    if not resultados:
        print("  Sin coincidencias en la flota.")
        print("  Probable causa: vehiculo aun no cargado (72/269 modelos).")
        if marcas:
            print(f"  Pista web: revisar vehiculos de marca {', '.join(marcas)}")
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


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python tools/buscar_filtro.py CODIGO")
        print("Ej:  python tools/buscar_filtro.py ARS9837")
        sys.exit(1)
    investigar(" ".join(sys.argv[1:]))
