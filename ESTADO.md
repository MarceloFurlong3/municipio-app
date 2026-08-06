# ESTADO — Municipio App (Talleres BHI)
> Claude lee esto al arrancar cualquier sesión sobre este proyecto.

## Estado actual
**En producción activa** — municipio-app.vercel.app

## Lo que se construyó (2026-07-24)

### Solicitudes
- Flujo: 2 estados — **Iniciado** y **Pase a Físico** (sin intermedios)
- Botón "Iniciar": pide suministro si no lo tiene → aprueba + mail 1
- Botón "Pase a Físico": pide OC si no la tiene → mail 2
- Mail 1: suministro + links a memo y presupuesto
- Mail 2: OC + links documentos
- PIB: siempre va a depositotalleres@bahiablanca.gov.ar

### Basurero
- Botón eliminar en modal → soft delete → hoja "Solicitudes Eliminadas"
- Botón 🗑 en header → abre basurero completo con opción recuperar

### Módulo Talleres
- Tab Talleres: OT + Vales de Materiales
- Backend: Supabase municipio-bahia-blanca (mghbnxtavlzwvjozhojc)
- Impresión idéntica al papel oficial para ambos documentos
- GAS @53 deployado

### Flota
- flota_estados en Supabase: 34 vehículos registrados
- 11 bajas con documentos Word vinculados

## Módulo Lubricentro (2026-08-06) ✅
- Card nueva en pantalla inicio: 🛢️ Lubricentro (Aceites · Service)
- Tab Aceites: 13 lubricantes, estado crítico/bajo/ok, admin con pass `toro`
- Tab Service: 14 pedidos históricos (del WhatsApp), marcar realizado, agregar nuevo, eliminar
- localStorage mismo key que inventario-aceites.html (v4) — datos compatibles
- inventario-municipio.vercel.app sigue andando como backup

## Galería de fotos por RI (2026-08-06) ✅
- Botón 📷 en cada vehículo de la app de flota
- Tabla flota_fotos + bucket Storage `flota-fotos` en Supabase sugkmcdngvtvwzglodkh
- Admin puede subir fotos, todos pueden ver
- 114 vales de materiales analizados → 89 RIs identificados, 24 dudosos
- analisis_flota.json en C:\Users\furlo\OneDrive\Escritorio\Nueva carpeta\

## Módulo Kits de Filtros (en progreso)
- Arquitectura completa en `KITS_FILTROS.md`
- Misión: saber qué kit corresponde a cada modelo antes de comprar
- 45 modelos identificados con vale físico, 220 pendientes
- Próximo: crear tabla kits_filtros en Supabase (Fase 1.1)

## Próximos pasos
1. ~~Integrar inventario aceites a la app del Municipio~~ ✅ Lubricentro integrado
2. ~~Galería fotos por RI en flota~~ ✅ deployado
3. ~~Subir 88 fotos identificadas a Supabase~~ ✅ 88/88 subidas (2026-08-06, script subir_fotos_flota.py)
4. ~~Interfaz web para 24 RIs dudosos~~ ✅ confirmados manualmente (2026-08-06)
5. Bajas en flota visibles para todos (hoy solo admin)
6. Subir Word de bajas a Drive para URLs reales
7. Vincular OT y Vales con la flota por RI
8. Kits de filtros por modelo — próxima fase Lubricentro
5. Municipio 2.0 — después de NK 2.0

## Stack
- Frontend: vanilla JS + Vercel
- Backend solicitudes: GAS + Sheets
- Backend talleres/flota: Supabase mghbnxtavlzwvjozhojc
- Regla: herramienta de ayuda, NO de control

## Último commit (auto)
`2026-08-06 12:01` — feat: módulo Lubricentro — inventario aceites + pedidos de service
