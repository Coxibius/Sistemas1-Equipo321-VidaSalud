# Evidencia de pruebas integrales — 1 de septiembre de 2026

## Resultado

El smoke test automatizado del MVP terminó correctamente en dos ejecuciones consecutivas:

- 26 verificaciones ejecutadas por corrida.
- 26 verificaciones aprobadas por corrida.
- 0 fallos funcionales.
- La cuenta temporal con nombre único fue dada de baja lógica al finalizar cada corrida.
- La base conservó los 8 perfiles de demostración.

El script reproducible se encuentra en `scripts/smoke-test.ps1`. Se ejecuta con la API y
PostgreSQL activos:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

## Cobertura verificada

| Frente | Casos aprobados |
| --- | --- |
| Infraestructura | `GET /api/health` responde HTTP 200. |
| HU01 | Registro de producto, rechazo de duplicado y rechazo de precio negativo. |
| HU02 | Listado general y búsqueda parcial por nombre. |
| HU03 | Entrada, salida válida y rechazo por stock insuficiente. |
| HU04 | Cálculo de lotes vencidos y próximos a vencer. |
| HU05 | Inicio de sesión válido y rechazo de contraseña incorrecta. |
| HU06 | Crear y editar usuario; protección del administrador único; baja lógica y ocultamiento. |
| HU07 | Consultar y corregir datos, solicitar baja, aprobarla y bloquear la cuenta inactiva. |
| Auditoría | Persistencia de las acciones críticas ejecutadas por el test. |

## Estado observable después de las pruebas

- 10 productos disponibles.
- El producto controlado `Producto Prueba Demo Day` quedó disponible y con vencimiento
  `2027-12-31`; su stock aumenta dos unidades netas por corrida controlada.
- 4 alertas: 1 lote vencido y 3 próximos a vencer.
- 8 usuarios activos, todos ficticios y sin contraseñas expuestas por la API.
- Los eventos de auditoría de las operaciones ejecutadas quedaron persistidos.
- La cuenta temporal dejó de aparecer en listado y perfil y no pudo iniciar sesión después del
  `DELETE`. Su solicitud histórica conservó el mismo `usuarioId`, demostrando que la baja lógica
  evita datos huérfanos.

## Verificaciones técnicas

- Backend: `dotnet build --no-restore` terminó con 0 errores y 0 advertencias.
- Entity Framework: no existen cambios pendientes entre el modelo y las migraciones.
- Paquetes .NET: no se detectaron paquetes vulnerables directos ni transitivos.
- Frontend: TypeScript terminó sin errores.
- Expo web: compiló y mostró la pantalla de acceso sin errores de ejecución.
- Responsive: pantalla de acceso revisada a `390 x 844`; contenido visible sin solapamientos.
- Compatibilidad Expo: `react-native-safe-area-context` quedó en `5.6.2`, dentro del rango
  recomendado `~5.6.0` para el proyecto.

## Recorrido visual web

Se inició sesión con la cuenta de demostración `admin` y se comprobaron sin modificar datos:

- Dashboard con 10 productos, 751 unidades, 1 producto con stock bajo y 4 alertas.
- Productos con sus 10 registros, búsqueda y acceso al formulario de alta.
- Inventario con selección de producto, tipo de movimiento, cantidad y responsable automático.
- Vencimientos con 1 lote vencido y 3 próximos a vencer, ordenados por fecha.
- Administración con 8 usuarios, solicitudes de baja y actividad reciente.
- Mi perfil con consulta de datos, corrección y protección de la única cuenta administradora.
- Cierre de sesión y retorno correcto a la pantalla de acceso.

La consola no registró errores. Solo aparecieron advertencias de desarrollo sobre `shadow*` y
`pointerEvents`, ambas obsoletas en React Native Web pero no bloqueantes.

## Riesgo conocido de dependencias frontend

`npm audit --omit=dev` informa 25 vulnerabilidades transitivas (16 moderadas y 9 altas) dentro
del árbol de Expo/Metro/React Navigation. La corrección automática propuesta requiere
`npm audit fix --force` y cambios incompatibles con Expo SDK 54. No se aplicó esa operación antes
del Demo Day porque podría romper el MVP.

Decisión académica: registrar el riesgo y mantener versiones compatibles para la demostración
local. Antes de un uso real se debe planificar la actualización completa de Expo, reinstalar
dependencias y repetir TypeScript, auditoría y pruebas funcionales. Esta limitación no cambia el
hecho de que el sistema no procesa pacientes, historias clínicas ni información financiera.

## Advertencia visual no bloqueante

React Native Web muestra advertencias de desarrollo sobre propiedades `shadow*` y
`props.pointerEvents` obsoletas. No producen errores ni impiden el recorrido del MVP; pueden
corregirse como mejora visual posterior a la presentación.
