# METODOLOGIA — Identificacion de filtros del Municipio de Bahia Blanca

> Documento vivo. Claude lo actualiza cada vez que aprende algo nuevo sobre como identificar filtros.
> Ultima actualizacion: 2026-09-28

---

## Para que sirve este archivo

Cuando Marcelo trae un codigo de filtro desconocido, Claude sigue esta metodologia para dar la respuesta mas probable. A medida que hacemos mas investigaciones, este archivo crece y las respuestas mejoran.

---

## Sistema de confianza

| Nivel | Criterio |
|---|---|
| 95-100% | Match exacto en kits_filtros o en kits_alternativos de Supabase |
| 75-90%  | Fuente web confirma marca+modelo, y ese modelo esta en la flota |
| 50-74%  | Marca del vehiculo coincide pero no el modelo especifico |
| 30-49%  | El vehiculo probablemente esta en la flota pero no esta cargado aun |
| <30%    | Solo pistas indirectas, sin confirmacion |

---

## Como buscar un filtro — paso a paso

### Paso 1: Buscar en Supabase primero

Antes de ir a internet, verificar si el codigo ya esta en la base:

```sql
-- Buscar en campos de filtro
SELECT modelo, ris, filtro_aceite, filtro_aire, filtro_combustible
FROM kits_filtros
WHERE filtro_aceite ILIKE '%CODIGO%' OR filtro_aire ILIKE '%CODIGO%'
   OR filtro_combustible ILIKE '%CODIGO%' OR filtro_trampa ILIKE '%CODIGO%';

-- Buscar en alternativos
SELECT modelo, codigo, marca, tipo FROM kits_alternativos
WHERE codigo ILIKE '%CODIGO%';
```

Si encuentra → respuesta inmediata con 95%+ de confianza.

### Paso 2: Identificar la marca del filtro por el prefijo

| Prefijo | Marca | Tipo usual |
|---|---|---|
| ARS | Tecfil (Brasil) | Filtro de aire |
| ACO | Tecfil (Brasil) | Filtro de aceite |
| P5xxxxx | Fleetguard / Donaldson | Varios |
| C-xxxxx | Mann+Hummel | Varios |
| LF | Fleetguard | Aceite |
| AF | Fleetguard | Aire |
| FF | Fleetguard | Combustible |
| WF | Fleetguard | Agua/refrigerante |
| AA-xxx | Monza / generico argentino | Aire |
| MR-xxx | Monza | Aire |
| J-xxx PA | WIX / Filtros Argentinos | Varios |
| CP-xxx | WIX | Aire |
| 90411xxx | GM / Chevrolet | Aire (autos) |
| 84xxxxxx | CNH (Case / New Holland) | Varios |
| 24xxxxxx | Caterpillar OEM | Varios |
| RE-xxx | John Deere OEM | Varios |

### Paso 3: Fuentes de consulta (en orden de confianza)

1. **prix.com.ar** — mejor cobertura de la flota argentina
   - URL tipo: `prix.com.ar/filtro-de-aire/ARS9837`
   - Tiene equivalencias cruzadas entre marcas

2. **petroil.net** — buena cobertura, incluye equipos pesados
   - URL tipo: `petroil.net/buscar?q=ARS9837`

3. **alfarodamientos.com.ar** — Bahia Blanca, conocen la flota local municipal

4. **filtroseurofil.com** — cruce Baldwin, Donaldson, Cummins

5. **catalogo.fram.com.ar** — equivalencias FRAM

6. **mercadolibre.com.ar** — titulo del producto suele incluir el vehiculo

7. **Claude (este mismo)** — conocimiento de catalogo del entrenamiento.
   Pedir: "Para que vehiculo es el filtro CODIGO, que tipo es y que equivalentes tiene"

### Paso 4: Cruzar con la flota municipal

Una vez que la web dice "este filtro es para Iveco 170E22", buscar en Supabase:

```sql
SELECT modelo, ris FROM kits_filtros
WHERE modelo ILIKE '%IVECO%' AND modelo ILIKE '%170E22%';
```

Si el modelo no esta en kits_filtros, buscar en flota_estados:
```sql
SELECT ri, marca, modelo FROM flota_estados
WHERE modelo ILIKE '%IVECO%170E22%';
```

---

## Equivalencias conocidas (acumulado por sesiones)

| Codigo original | Equivalente | Marca equivalente | Vehiculo | Fuente |
|---|---|---|---|---|
| ARS9837 | C27902 | Mann+Hummel | Iveco EuroCargo Tector 170E22H | petroil.net |
| ARS9837 | 503120253 | Iveco OEM | Iveco EuroCargo Tector 170E22H | petroil.net |
| P551010 | — | Fleetguard | Caterpillar 120K (filtro trampa) | kits_alternativos |
| C27902 | ARS9837 | Tecfil | Iveco 170E28 NC M32 (RIs C-762 a C-767) | base propia |

---

## Patrones detectados en la flota de Bahia Blanca

### Vehiculos con mas unidades (mas probable que un filtro sea para estos)
- Mercedes Benz 1114 — 11 unidades
- Ford F-1723 — 11 unidades
- VW Polo 1.9D — 10 unidades
- Deutz Agrale — 10 unidades
- Fiat Ducato — 9 unidades
- Ford F-14000 — 8 unidades
- Iveco 170E22 — 8 unidades (varios submodelos)

### Marcas de filtros mas comunes en el deposito
- Monza (linea AA y MR) — filtros de aire, mayoria para camiones
- Tecfil (ARS) — aire para Iveco y camiones medianos
- Fleetguard (P5xxxxx) — equipos pesados Caterpillar, John Deere
- Mann (C-xxxxx) — Iveco principalmente
- WIX / Filtros Arg (CP-xxx, J-xxx) — Iveco, camiones varios

### Que tipo de filtro es mas probable segun el codigo
- Codigos cortos (4-6 digitos): probablemente aceite o combustible
- Codigos largos con letras al inicio: probablemente aire
- Prefijo P5: casi siempre trampa de agua o combustible en equipos pesados

---

## Casos resueltos (historial de investigaciones)

### 2026-09-28 — ARS9837
- **Pregunta:** Para que vehiculo es el filtro Tecfil ARS9837?
- **Respuesta:** Iveco EuroCargo Tector 170E22H
- **En la flota:** Si — IVECO 170E28 NC M32 (RIs C-762 a C-767) tiene Mann C27902 (equivalente)
- **Confianza:** 95% — confirmado por petroil.net + equivalencia en base

### 2026-09-28 — P551010
- **Pregunta:** Para que vehiculo es el filtro Fleetguard P551010?
- **Respuesta:** Caterpillar 120K — filtro trampa
- **En la flota:** Si — CATERPILLAR 120K (RIs V-490, V-571) — en base como Fleetguard alternativo
- **Confianza:** 100% — encontrado en kits_alternativos de la base

---

## Lo que NO funciona (para no perder tiempo)

- **Google scraping** — bloquea por CAPTCHA de IP cuando se repiten pedidos
- **Bing scraping** — resultados relevantes estan en JavaScript, no en el HTML estatico
- **DuckDuckGo API** — funciona para preguntas generales, NO para codigos de filtro especificos
- **DuckDuckGo HTML** — inconsistente, a veces bloquea
- **prix.com.ar** — bloquea robots.txt automatico; ademas, solo tiene filtros marca Prix, NO Monza
- **disfil.com.ar/equivalencias** — NO tiene AA1705 ni muchos filtros Monza en su base
- **monzafiltros.com.ar** — dominio no existe
- **alfarodamientos, todofiltros, centraldelfiltro** — no tienen AA1705

## Lo que SI funciona (en orden de velocidad)

### 1. Supabase directo — SIEMPRE PRIMERO (instantaneo)
```sql
SELECT modelo, ris, filtro_aire FROM kits_filtros
WHERE filtro_aire ILIKE '%CODIGO%' OR filtro_aceite ILIKE '%CODIGO%';

SELECT modelo, codigo, marca FROM kits_alternativos
WHERE codigo ILIKE '%CODIGO%';
```

### 2. Catalogo Monza PDF — FUENTE DEFINITIVA para filtros AA y MR (2-3 segundos)
Para cualquier codigo Monza (AA-xxxx, MR-xxxx):
```python
import requests, pdfplumber, io
r = requests.get('https://www.autopartcomodoro.com.ar/wp-content/uploads/2014/07/MONZA-septiembre-14.pdf')
with pdfplumber.open(io.BytesIO(r.content)) as pdf:
    for page in pdf.pages:
        texto = page.extract_text() or ''
        if 'AA1705' in texto.upper():
            # encontrado — extraer la linea
```
El PDF tiene 29 paginas. Los codigos AA estan en orden numerico. AA1705 esta en pagina 20.
Formato de cada linea: `CODIGO  APLICACION  CANTIDAD  PRECIO  DIMENSIONES  EQUIVALENTES`

### 3. disfil.com.ar/equivalencias con Playwright — para otras marcas
Funciona para codigos que disfil tiene en su base (principalmente WIX, Mann, Fleetguard):
```python
page.goto('https://disfil.com.ar/equivalencias', wait_until='networkidle')
page.locator('input').first.fill('CODIGO')
page.keyboard.press('Enter')
time.sleep(3)
texto = page.inner_text('body')  # contiene "Sin equivalencias" o la lista
```

### 4. sf-filter.com — para cruces de referencia entre marcas
URL: `https://www.sf-filter.com/en/cross-reference-list?searchValue=CODIGO`
Funciona con requests normal (sin Playwright). Util para saber el SF-Filter equivalente.
Ejemplo: AA1705 → SL6214

### 5. especialistasenfiltros.com.ar — para vehiculos Mercedes/Ford/Iveco
URL: `https://www.especialistasenfiltros.com.ar/filtros/camiones/mercedes-benz/MODELO`
Tiene tabla con motor/año/filtros en formato limpio. Bueno para confirmar.

---

## Casos resueltos (historial)

### 2026-09-28 — ARS9837
- **Pregunta:** Para que vehiculo es el filtro Tecfil ARS9837?
- **Fuente:** petroil.net + web search
- **Respuesta:** Iveco EuroCargo Tector 170E22H
- **En la flota:** IVECO 170E28 NC M32 (RIs C-762 a C-767) tiene Mann C27902 (equivalente)
- **Confianza:** 95%

### 2026-09-28 — P551010
- **Pregunta:** Para que vehiculo es el filtro Fleetguard P551010?
- **Fuente:** kits_alternativos en Supabase
- **Respuesta:** Caterpillar 120K — filtro trampa
- **Confianza:** 100% — match exacto en base

### 2026-09-28 — AA1705 Monza
- **Pregunta:** Para que vehiculo es el filtro Monza AA1705?
- **Fuente:** Catalogo Monza PDF (autopartcomodoro.com.ar) — PAGINA 20
- **Respuesta:** PERKINS 6 - Mercedes Benz 813/913 - Chevrolet D20 - Deutz - Ford - Massey
- **Dimensiones:** 87mm int · 165mm ext · 351mm alto
- **Secundario:** AA1706 (va dentro del AA1705)
- **En la flota:** Massey Ferguson varios + Ford F-100 Perkins (sin filtro_aire cargado)
- **IMPORTANTE:** NO sirve para todos los Massey — solo los que tienen Perkins 6-cil.
  Los MF 265/290 suelen tener Perkins 4-cil y usarian un filtro mas chico.
  Para confirmar: medir el filtro fisico (165mm ext x 351mm alto).
- **Confianza:** 92% en aplicacion, 60% en quales Massey de la flota

---

## Algoritmo optimo para investigar un filtro (post-sesion 2026-09-28)

```
1. Identificar la marca por el prefijo (AA/MR → Monza, ARS → Tecfil, P5 → Fleetguard, etc.)
2. Buscar en kits_filtros y kits_alternativos de Supabase (instantaneo)
3. Si es Monza (AA o MR) → leer el PDF de autopartcomodoro.com.ar con pdfplumber
4. Si es otra marca → disfil.com.ar/equivalencias con Playwright
5. Cruzar resultado con la flota → puntuar y rankear
6. Si la dimension esta disponible → agregarla al resultado para confirmar fisico
```
