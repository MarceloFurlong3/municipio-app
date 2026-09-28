# Filtros pendientes de identificar

Datos reales de compras municipales que no pudieron mapearse a un modelo exacto en la DB.
Una vez identificado el modelo → cargar en `kits_filtros` con fuente = 'compra_municipal', verificado = true.

---

## FORD 4000 2011

**Origen:** lista de compra municipal (2026-09-25)
**Posibles matches en DB:** `FORD F 4000 D`, `FORD F 4000 CUMMINS TD`, `FORD F-4000 D`
**Pregunta:** ¿cuál de los tres es el que aparece en la flota con este kit?

| Tipo | Código |
|---|---|
| Filtro de combustible | DB0732 |
| Filtro de aceite | OB1010 |
| Filtro de aire primario | V-750 |
| Filtro de aire secundario | V-750/S |

---

## FORD CARGO 1722 — ambigüedad dos filtros combustible

**Cargado en:** `FORD CARGO 1722/43` y `FORD CARGO 1722E`
**Duda:** la lista tiene dos líneas marcadas como "FILTRO DE COMBUSTIBLE":
- WK950/21 → cargado como `filtro_trampa` (asumo trampa de agua)
- WK940/1 → cargado como `filtro_combustible` (principal)
**Confirmar** cuál es cuál cuando se pueda verificar físicamente.

---

## X412 Talleres y Maestranza — RIs V749 a V757 (modelo desconocido)

**Origen:** lista de compra municipal (2026-09-25)
**Problema:** la lista indica los RIs pero no el modelo. Los RIs V749-V757 no están registrados en la base de datos.
**Acción pendiente:** identificar qué modelo son esos vehículos y cargar en `kits_filtros`.

| Tipo | Código |
|---|---|
| Filtro de aire primario | J3650 |
| Filtro de aire secundario | J3651 |
| Filtro de aceite | ML40540 |
| Filtro de combustible | P5074P |

---

## X412 — filtros gasoil sin modelo identificado

**Origen:** lista de compra municipal (2026-09-25)
**Problema:** la lista dice X412 pero no indica el modelo del vehículo.

| Tipo | Código |
|---|---|
| Filtro gasoil | MC-001 |
| Filtro trampa de gasoil | AC-294 |

---

## Repuestos individuales (no son kits de filtros)

Descartados de kits_filtros — son repuestos por unidad, no kits de modelo:
- **VW Polo Classic I.9L SD** (A468, A473, A465): polea alternador, pastillas freno, cortacorriente, cables, terminales, lámpara
- **Renault 12 TL L813** (A133): bomba de freno, pastillas freno
- **VW 13180** (C392): manijas de puerta interior y exterior
- **X412**: manguera 3/4 R2

---
