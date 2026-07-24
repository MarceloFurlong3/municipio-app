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

## Próximos pasos
1. Bajas en flota visibles para todos (hoy solo admin)
2. Subir Word de bajas a Drive para URLs reales
3. Vincular OT y Vales con la flota por RI
4. Municipio 2.0 — después de NK 2.0

## Stack
- Frontend: vanilla JS + Vercel
- Backend solicitudes: GAS + Sheets
- Backend talleres/flota: Supabase mghbnxtavlzwvjozhojc
- Regla: herramienta de ayuda, NO de control

## Último commit (auto)
`2026-07-24 13:55` — docs: actualizar ESTADO.md con todo lo hecho en la sesion 2026-07-24
