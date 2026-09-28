# TICKETS — Municipio App

---

## 🎯 MISIÓN — Sistema de identificación y gestión de filtros del depósito municipal

**ID:** MUNI-001  
**Estado:** EN PROGRESO  
**Prioridad:** Alta  
**Fecha inicio:** 2026-09-21  

---

### El problema
El depósito municipal tiene filtros sin identificar. No se sabe con certeza a qué vehículo de la flota corresponde cada uno. Cuando hay que hacer un service, se pierde tiempo buscando o se compra el filtro equivocado.

### La misión
Catalogar cada filtro físico del depósito, cruzarlo contra la flota municipal (1.654 vehículos, 612 modelos), confirmar con múltiples fuentes online, y dejarlo todo visible en la app para que cualquiera sepa en segundos qué filtro necesita cada vehículo y si hay stock.

---

### Contexto del sistema
- **Flota:** 1.654 vehículos, 612 modelos únicos — `C:\Users\furlo\flota-municipal\data.json`
- **Modelos con más unidades:** MB 1114 (11), Ford 1723 (11), VW Polo 1.9D (10), Deutz Agrale (10), Fiat Ducato (9), Ford F-14000 (8), Iveco 170E22 (8)
- **Supabase:** tabla `kits_filtros` ya existe en sugkmcdngvtvwzglodkh
- **Inventario físico:** `Municipio App/inventario-filtros.md` — 17 filtros catalogados al 21/09
- **Góndolas:** 4 en total, arrancamos con góndola 1 (filtros de aire)

---

### Sistema de confianza — cómo validamos cada filtro

Cada filtro tiene un nivel de confianza basado en cuántas fuentes confirman la coincidencia:

| Nivel | Criterio | Acción |
|---|---|---|
| ✅ CONFIRMADO | prix.com.ar + flota + 1 fuente más coinciden | Cargar en kits_filtros, verificado=true |
| ⚠️ PROBABLE | prix.com.ar + flota coinciden | Cargar con verificado=false, revisar en taller |
| ❓ POSIBLE | Solo flota coincide o vehículo similar | Anotar como sugerencia, confirmar manual |
| ❌ SIN MATCH | No hay vehículo de ese tipo en la Muni | Igual lo cargamos — puede ser compra futura |

---

### Fuentes de verificación (en orden de confianza)

1. **prix.com.ar** — `prix.com.ar/tienda/filtro-de-aire/AA1708` → vehículo + equivalencias exactas
2. **alfarodamientos.com.ar** — Bahía Blanca, línea Monza completa, conocen la flota local
3. **catalogo.fram.com.ar** — equivalencias FRAM oficiales
4. **filtroseurofil.com** — cruce Baldwin, Donaldson, Cummins
5. **data.json de la flota** — cruce final contra los 1.654 vehículos reales

---

### Fases

#### FASE 1 — Catalogar el inventario físico ← ESTAMOS ACÁ
- [x] Arrancar inventario-filtros.md
- [ ] Catalogar todos los filtros de aire (Góndola 1) — 17/~60 hechos
- [ ] Catalogar filtros de combustible (Góndola 2)
- [ ] Catalogar filtros de aceite (Góndola 3)
- [ ] Catalogar filtros de motor/hidráulico (Góndola 4)
- [ ] Catalogar Donaldson sin código (fotografiar y buscar por forma/medida)
- **Datos por filtro:** código, tipo, marca, compatible con (crudo), cantidad, ubicación, equivalencias

#### FASE 2 — Cruce automático contra la flota
- [ ] Por cada filtro del inventario → buscar en prix.com.ar el vehículo compatible
- [ ] Cruzar vehículo contra data.json → ¿está en la flota de la Muni?
- [ ] Verificar con 1 fuente extra (FRAM, Eurofil, alfarodamientos)
- [ ] Asignar nivel de confianza (✅ ⚠️ ❓ ❌)
- [ ] Resultado: tabla con filtro → vehículo → confianza → cantidad en stock

#### FASE 3 — Cargar en Supabase
- [ ] Insertar en `kits_filtros`: modelo vehículo + filtro_aire + filtro_aceite + etc.
- [ ] Insertar en tabla de inventario: código filtro + cantidad + ubicación góndola
- [ ] Vincular: vehículo ↔ kit ↔ stock disponible

#### FASE 4 — Visible en la app
- [ ] Tab "Depósito" en Lubricentro de la Muni App
- [ ] Buscar por RI o modelo → muestra kit completo + stock disponible
- [ ] Buscar por código de filtro → muestra a qué vehículos aplica
- [ ] Badge de stock: ✅ hay / ⚠️ último / ❌ sin stock
- [ ] Skill en Zanta: consulta por Telegram → respuesta en segundos

---

### Criterios de aceptación
- Dado un código de filtro → vehículo compatible + si hay stock en menos de 10 segundos
- Dado un RI o modelo → kit de filtros completo + stock disponible
- El inventario refleja la realidad física del depósito
- Nunca se compra un filtro equivocado porque el sistema lo previene

---

### Notas técnicas
- MR = código Monza (marca argentina), AA = código alternativo genérico (suelen ser equivalentes)
- Los /S son filtros secundarios que van DENTRO del primario — registrar por separado, vincular al primario
- Donaldson sin código: fotografiar, medir diámetro y altura, buscar por dimensiones
- Góndolas: 4 en total, todas iguales — etiquetar G1/G2/G3/G4 + estante E1/E2/E3
