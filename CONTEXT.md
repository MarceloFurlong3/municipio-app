# Municipio App — Contexto del Proyecto

## Descripción
PWA para gestión de solicitudes del Taller Municipal (BHI y PIB).
Sirve archivos estáticos + proxy local para desarrollo. En producción: Vercel.

## URLs
- **Producción:** https://municipio-app.vercel.app
- **API (Apps Script):** https://script.google.com/macros/s/AKfycbzxCygphFeyT6x4s3eStxixxvbp0M4dk_WUKG1TgAuRgt2WujH8bA7O0VaJmXpo_bvS/exec
- **Planilla Google Sheets:** https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo
- **Script ID Apps Script:** 18fVmHMrZk3LWcyJ6yYD3TX_5qxtRdNaPJdzhREvoDxtUDFYU82JQKF3y

## Servidor local (desarrollo)
```
node dev-server.js
```
- Sirve archivos estáticos con `Cache-Control: no-store` (sin caché)
- Proxy en `/api-proxy` → Apps Script (evita CORS)
- `shared.js` detecta `localhost` automáticamente y usa el proxy

## Estructura de carpetas
```
Municipio App/
├── index.html            # Entrada principal, tabs BHI/PIB
├── shared.js             # apiFetch, apiPost, toast, esc — detección localhost/prod
├── dev-server.js         # Servidor local con proxy anti-CORS
├── sw.js                 # Service Worker (PWA)
├── manifest.json         # PWA manifest
├── views/
│   ├── solicitudes.js    # Vista principal BHI/PIB
│   └── deposito.js       # Vista depósito/pedidos internos
├── icons/                # Íconos PWA
└── municipio-appscript/  # Código Google Apps Script
    ├── API.js            # Endpoints REST (doGet/doPost)
    ├── Código.js         # Triggers onEdit + envío de mails
    ├── CodigoInterno.js  # Formulario PIB + pedidos internos
    ├── BoletaFactura.js  # Lógica facturación + NumeroALetras
    ├── BuscadorExterno.js
    ├── Buscadorinterno.js
    └── appsscript.json
```

## Hojas de la planilla
| Hoja | Uso |
|------|-----|
| Solicitudes Generales | Principal — BHI y PIB |
| Respuestas de formulario 3 | Formulario BHI entrada |
| PEDIDOS INTERNOS | Formulario PIB entrada |
| Trabajos Rechazados | Filas rechazadas (color rojo) |
| Trabajos Finalizados | Filas finalizadas (color verde) |
| Trabajos con Numero OC | Filas con OC + pase a físico |
| Facturacion | Gestión de facturas/OC |
| Factura a Firmar | Plantilla de boleta |

## Columnas — Solicitudes Generales
| Col | Letra | Campo |
|-----|-------|-------|
| 1 | A | ID (BHI-XXXX-26 / PIB-XXXX-26) |
| 2 | B | Fecha |
| 3 | C | RI |
| 4 | D | Memo/Vale |
| 5 | E | Presupuesto |
| 6 | F | Aprobado (checkbox) |
| 7 | G | Tipo envío mail OC |
| 8 | H | N° Suministro |
| 9 | I | Estado flujo (Iniciado/aprobado/pase a fisico) |
| 10 | J | Rechazo (Falta Memo/Falta Presupuesto/Motivo Escrito/Actualizar Presupuesto) |
| 11 | K | Orden de Compra |
| 12 | L | Oficina/Sección |
| 13 | M | Detalle del pedido |
| 14 | N | Observaciones |
| 17 | Q | Email del solicitante |
| 22 | V | Fecha Pase a Firma |
| 23 | W | Fecha Iniciado |
| 24 | X | Fecha Aprobado |
| 25 | Y | Fecha Pase a Físico |

## Flujo de estados (col I)
```
[Sin aprobar] → Aprobar carga (col F checkbox)
      ↓
  Pendiente → Iniciado → Aprobado → Pase a Físico
```
**Nota:** "Pase a Firma" fue eliminado del flujo de la app (aún existe en la planilla para retrocompatibilidad).

## Acciones por estado — qué hace API.js
| Acción | Col | Color fila | Mail | Fecha |
|--------|-----|-----------|------|-------|
| Aprobar carga | F=TRUE | — | — | — |
| Iniciado | I | Amarillo (245,255,176) | ✅ Suministro al solicitante | Col 23 |
| Aprobado | I | Amarillo (245,255,176) | — | Col 24 |
| Pase a Físico | I | Naranja (255,215,145) | ✅ SGC aprobado al solicitante | Col 25 |
| Falta Memo | J | Rojo (255,63,63) | ✅ Rechazo al solicitante | — |
| Falta Presupuesto | J | Rojo (255,63,63) | ✅ Rechazo al solicitante | — |
| Motivo Escrito | J | Rojo (255,63,63) | ✅ Rechazo al solicitante | — |
| Actualizar Presupuesto | J | Rojo (255,63,63) | ✅ Rechazo al solicitante | — |

## Mover filas — función moverFila() (manual en planilla)
- Rojo (#ff3f3f) → hoja "Trabajos Rechazados"
- Verde (#b6d7a8) → hoja "Trabajos Finalizados"
- Suministro + pase a fisico + OC → hoja "Trabajos con Numero OC"

## Triggers en Apps Script (onEdit — solo desde planilla, NO desde API)
Los triggers `mionEdit`, `traerdatosFacturacion`, `ColorFacturacion`, `PasarOrdenes`
se activan solo al editar manualmente la planilla. La API replica su lógica directamente.

## Validación inline en tarjetas
- **N° Suministro** (col H): editable directo en la tarjeta → `setSuministro`
- **Orden de Compra** (col K): editable directo en la tarjeta → `setOrdenCompra`
- Al marcar **Iniciado** sin suministro → popup obligatorio para ingresarlo

## Despliegue
```bash
# Push Apps Script
cd municipio-appscript
clasp push --force
clasp deploy --deploymentId AKfycbzxCyg... --description "descripcion"

# Deploy Vercel (ejecutar desde terminal del usuario)
cd "C:\Users\furlo\Municipio App"
npx vercel@latest --prod --yes
```

## Problemas conocidos / resueltos
- CORS desde localhost → resuelto con proxy en `dev-server.js`
- Caché del service worker → `dev-server.js` sirve con `Cache-Control: no-store`
- Filtro "Pendiente" no encontraba registros con `estado_flujo` vacío → resuelto en `renderCards`
- Error "cannot read property of null" al cerrar modal → resuelto guardando `tipo` antes de `cerrarModal()`
- Triggers `onEdit` no se activan desde API → lógica replicada directamente en `rechazarSolicitud` y `cambiarEstado`
