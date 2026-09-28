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

## Módulo Kits de Filtros (2026-09-25) ✅ Fase 1+2 completas, datos cargados
- 41 modelos con datos reales de 269 totales (15% de la flota)
- Fuente principal: listas de compra municipal (mesa de entradas)
- Schema ampliado: filtro_trampa, filtro_aire_secundario, filtro_transmision, fuente=compra_municipal
- kits_alternativos poblado: Fleetguard, Donaldson, Mann, Mareno por modelo
- Pendientes en `FILTROS_PENDIENTES.md`: FORD 4000 2011, X412 V749-V757 sin modelo, filtros sin modelo genérico
- Próximo: seguir cargando listas OR arrancar Fase 3 (búsqueda automática Autodoc)

## ✅ T-MUN-001: Migrar GAS → Service Account — COMPLETADA (2026-09-28)

- Google Sheets API habilitada en proyecto `sistema-de-solicitudes-452316`
- `GOOGLE_SA_KEY` subida a Vercel production (JSON de Service Account)
- Planilla compartida con `sistema-solicitudes@sistema-de-solicitudes-452316.iam.gserviceaccount.com` como Editor
- Deploy exitoso — app carga BHI (162) y PIB (137) solicitudes sin GAS
- La app ya no depende de permisos que se resetean

---

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

## Herramientas MCP disponibles (manejar todo desde Claude sin salir)

### Supabase
- MCP: `mcp__supabase__*`
- Proyecto activo: `mghbnxtavlzwvjozhojc` (municipio-bahia-blanca)
- ⚠️ DESDE 30/10/2026 — Cada tabla nueva necesita GRANT explícito:
  ```sql
  grant select, insert, update, delete on public.nueva_tabla to authenticated;
  grant select, insert, update, delete on public.nueva_tabla to service_role;
  ```
  Sin esto la Data API devuelve "permission denied". Agregar en la misma migración.
- ⚠️ El proyecto se PAUSA solo después de 7 días sin uso → reactivar con `mcp__supabase__restore_project` (project_id: mghbnxtavlzwvjozhojc)
- Comandos útiles: `execute_sql`, `list_tables`, `apply_migration`, `get_project`

### Vercel
- MCP: deploy desde Bash con `vercel --prod` en la carpeta del proyecto
- URL producción: https://municipio-app.vercel.app
- Skill disponible: `vercel:deploy` (prod)
- Env var clave: `GAS_URL` → URL del script GAS. Si el script cambia de URL, solo actualizar esta variable en Vercel y redeploy.

### ⚠️ REGLA DE ORO — Cómo actualizar el script GAS sin romper la app

**NUNCA hacer "Implementar → Nueva implementación"** → eso cambia la URL y resetea permisos.

**Proceso correcto para actualizar el script:**
1. Apps Script → hacer cambios en el código
2. Click en "Implementar" → "Administrar implementaciones"
3. Click en el ✏️ (lápiz) de la implementación existente
4. En "Versión" elegir "Nueva versión"
5. Click en "Implementar"
→ La URL queda igual. Los permisos quedan igual. La app sigue funcionando.

**Si los permisos se rompieron (app dice "no disponible"):**
1. Apps Script → Implementar → Administrar implementaciones
2. Click en el lápiz de la implementación existente
3. Cambiar "Quién tiene acceso" a "Cualquier usuario"
4. Guardar
→ La app vuelve a funcionar sola, sin tocar código ni Vercel.

**Si se creó una nueva implementación por error (URL cambió):**
1. Copiar la nueva URL del script
2. Desde Claude: `vercel env rm GAS_URL production` → `vercel env add GAS_URL production` → pegar nueva URL
3. `vercel --prod` para redeploy

### Roles por URL
- Admin completo: `municipio-app.vercel.app`
- Depósito (sin Solicitudes): `municipio-app.vercel.app?rol=deposito`

## Stack
- Frontend: vanilla JS + Vercel
- Backend solicitudes: GAS + Sheets
- Backend talleres/flota: Supabase mghbnxtavlzwvjozhojc
- Regla: herramienta de ayuda, NO de control

## Último commit (auto)
`2026-08-06 20:32` — feat: fotos de vales en modal kit — click en modelo muestra las fotos del taller
