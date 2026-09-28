# Kits de Filtros — Arquitectura y Roadmap

## Misión
Saber exactamente qué kit de filtros corresponde a cada modelo de la flota municipal,
tenerlo disponible en la app antes de hacer una compra, y nunca comprar el kit equivocado.

## Estado actual
- 595 vehículos válidos (con ruedas, series A B C K N O T V W)
- 265 modelos únicos
- 45 modelos identificados con vale físico ✅
- 220 modelos sin kit todavía ❌

---

## Fase 1 — Base de datos [ ]
**Objetivo:** tabla `kits_filtros` en Supabase con todo lo que ya sabemos.

- [x] 1.1 Crear tabla `kits_filtros` en Supabase
  ```sql
  CREATE TABLE kits_filtros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modelo TEXT NOT NULL,
    filtro_aceite TEXT,
    filtro_aire TEXT,
    filtro_combustible TEXT,
    filtro_habitaculo TEXT,
    filtro_hidraulico TEXT,
    notas TEXT,
    fuente TEXT,          -- 'vale_fisico' | 'autodoc' | 'mann' | 'manual'
    verificado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [x] 1.2 Poblar con los 45 modelos ya identificados via vales físicos
  - Script Python que lee `flota_fotos` → cruza con `data.json` → inserta en `kits_filtros`
  - fuente = 'vale_fisico', verificado = true (son los más confiables)
  - Por ahora sin los códigos de filtro — solo el modelo confirmado con vale

- [x] 1.3 Insertar los 220 modelos restantes como filas vacías
  - fuente = null, verificado = false
  - Sirven de lista de pendientes visible en la app

---

## Fase 2 — App: sección en Lubricentro [ ]
**Objetivo:** ver el estado de kits en la app, filtrar por estado, buscar por modelo.

- [x] 2.1 Tab nuevo "Kits" en el módulo Lubricentro
  - Lista de todos los modelos con su estado: ✅ completo / ⚠️ sin verificar / ❌ sin datos
  - Buscador por nombre de modelo
  - Filtro por serie (A / C / T / V / etc.)

- [x] 2.2 Vista detalle por modelo — modal con fotos de vales (click en foto para zoom)

- [x] 2.3 Desde la vista de un vehículo (búsqueda por RI)
  - Badge "Kit identificado" / "Sin kit" en cada modelo de la app de flota
  - Al expandir el modelo → muestra campos de filtro arriba de los vehículos

---

## Fase 3 — Búsqueda automática en catálogos [ ]
**Objetivo:** completar los 220 modelos faltantes con datos de fuentes online confiables.
⚠️ TODO lo que venga de internet queda verificado = false hasta confirmación manual.

- [ ] 3.1 Normalizar los nombres de modelos del registro municipal
  - "FORD F-14000/DSL MWM 229" → "Ford F-14000"
  - "IVECO EURO ATTACK 170E22" → "Iveco EuroCargo 170E22"
  - Tabla de mapeo manual para los casos raros

- [ ] 3.2 Script de búsqueda en Autodoc (autodoc.com.ar)
  - Entrada: marca + modelo + año
  - Salida: códigos de filtros disponibles
  - Guardar con fuente = 'autodoc', verificado = false

- [ ] 3.3 Script de verificación cruzada Mann-Filter
  - Cruzar los códigos de Autodoc con catálogo Mann-Filter
  - Si coinciden → subir confianza pero no marcar verificado igual

- [ ] 3.4 Reporte de cobertura
  - Cuántos modelos tienen datos de catálogo
  - Cuántos modelos no existen en ningún catálogo (vehículos viejos/raros)

---

## Fase 4 — Verificación manual [ ]
**Objetivo:** que el taller confirme los datos de catálogo contra la realidad.

- [ ] 4.1 Cola de verificación en la app
  - Lista de kits con fuente = 'autodoc' sin verificar
  - Alguien del taller revisa, confirma o corrige, marca verificado

- [ ] 4.2 Vincular vale físico al kit
  - Cuando se sube una foto de vale → si el modelo ya tiene kit → confirmar que coincide
  - Si no coincide → alerta para revisar

---

## Fase 5 — Alertas de compra [ ]
**Objetivo:** nunca comprar el kit equivocado.

- [ ] 5.1 Antes de generar un pedido de compra → verificar que el kit está confirmado
- [ ] 5.2 Si el kit no está verificado → advertencia visible antes de aprobar el pedido
- [ ] 5.3 Historial de compras por modelo → saber cada cuánto se cambia el kit

---

## Archivos relevantes
- Vales cargados: `C:\Users\furlo\OneDrive\Escritorio\Nueva carpeta\analisis_flota.json`
- Script subida: `C:\Users\furlo\subir_fotos_flota.py`
- Script confirmación dudosos: `C:\Users\furlo\confirmar_dudosos.py`
- Flota data: `C:\Users\furlo\flota-municipal\data.json`
- Supabase NK/Flota: sugkmcdngvtvwzglodkh.supabase.co

## Próximo paso
→ Revisión manual de los 45 vales verificados con http://localhost:9292 (revisar_kits.py)
→ Después: Fase 3 — búsqueda automática en catálogos para los 220 sin kit

## Notas de análisis (2026-08-06)
- OCR automático con Claude Haiku NO funcionó — el vale tiene demasiados números (OT, materiales, correlativo) y el modelo no identifica cuál es el RI
- Solo 2/114 fotos coincidieron — resultado no confiable
- Revisión manual via revisar_kits.py (http://localhost:9292) es el único camino confiable
- Scripts disponibles:
  - C:\Users\furlo\subir_fotos_flota.py — sube HEIC identificadas a Supabase
  - C:\Users\furlo\confirmar_dudosos.py — confirma RIs dudosos (puerto 9191)
  - C:\Users\furlo\revisar_kits.py — revisa foto por foto los 45 verificados (puerto 9292)
  - C:\Users\furlo\verificar_vales_vision.py — OCR con visión (no confiable para estos vales)
