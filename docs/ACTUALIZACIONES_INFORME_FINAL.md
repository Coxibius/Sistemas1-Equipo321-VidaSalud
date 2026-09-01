# Cambios específicos para `actividad11.pdf`

Revisión realizada sobre el borrador de 21 páginas del 1 de septiembre de 2026. Este documento
indica qué editar antes de exportar nuevamente el informe. No se modifica ni reemplaza el PDF.

## Correcciones de presentación

1. **Portada:** sustituir `Intro`, actualizar la fecha real de entrega y escribir
   `Ingeniería en Sistemas` y `Sistemas de Información I` con capitalización uniforme.
2. **Numeración:** corregir el pie de página; actualmente todas las páginas muestran el número
   `1`.
3. **Archivos incrustados:** eliminar textos accidentales como `ai_context.txtTXT` y
   `Informe_Final_VidaSalud_borrador 1.pdfPDF` que aparecen dentro del contenido.
4. **Capturas:** insertar imágenes legibles con número, título y una oración que explique qué
   criterio demuestran. No mostrar contraseñas ni secretos locales.

## Cambios por sección del informe

### 1. Resumen ejecutivo

Agregar Dashboard, HU07, auditoría persistente y solicitudes de baja. Cambiar cualquier frase que
presente esos elementos como mejoras futuras. Incluir el resultado técnico: 26 de 26
verificaciones aprobadas, compilación sin errores y ocho usuarios ficticios activos.

La afirmación de que se realizaron pruebas de usabilidad solo debe conservarse si se adjunta la
tabla completada con participantes P1/P2/P3. Si todavía no existe esa evidencia, indicar que la
prueba humana está pendiente y no presentar el valor `3,58/5` como resultado final.

### 4. Trazabilidad entre el problema y el MVP

La cadena actual termina en HU04. Agregar:

- Acceso sin identificación → HU05 → login académico e identificación del responsable.
- Accesos sin administración → HU06 → gestión de usuarios y tres roles.
- Datos personales sin control del titular → HU07 → Mi perfil, rectificación y solicitud de baja.
- Operaciones sin evidencia → requisito transversal → `log_auditoria`.

Usar como respaldo `docs/TRAZABILIDAD.md` y el Árbol de Problemas final.

### 5. Cumplimiento de objetivos

Incorporar el objetivo SMART definido en `PRD.md` y asociarlo con resultados observables:
productos persistidos, movimientos con responsable, cuatro alertas activas, ocho usuarios de
demostración y logs de auditoría.

### 6. Diseño centrado en el usuario

Agregar el perfil **Administrador**, que gestiona usuarios, revisa solicitudes de baja y consulta
actividad reciente. Mencionar la adaptación responsive y el uso de áreas seguras para evitar que
la barra de Android cubra acciones.

### 9 y 10. Historias de usuario

Mantener HU01–HU06 como implementadas e incorporar **HU07 — Control de datos personales**:
consultar datos propios, corregir nombre/correo, solicitar baja y resolución administrativa.

### 11. Diseño y normalización de base de datos

La lista vigente debe incluir siete tablas: `categoria`, `producto`, `lote`,
`movimiento_inventario`, `usuario`, `solicitud_baja` y `log_auditoria`. Explicar que la baja
administrativa es lógica mediante `usuario.eliminado`: la cuenta se oculta, pero la fila y
`solicitud_baja.id_usuario` se conservan. `SET NULL` queda como salvaguarda si una eliminación
física excepcional se ejecuta fuera de la API.

### 12. Integridad y reglas de negocio

Agregar las reglas demostrables: usuario único, roles restringidos, administrador único
protegido, cuenta inactiva bloqueada, baja lógica sin datos huérfanos, salida sin stock rechazada
y lotes vencidos excluidos de salidas. La explicación exacta de FK, `RESTRICT`, `CASCADE` y
`SET NULL` está en el diccionario de
datos.

### 14 a 16. Pruebas

Agregar el smoke test reproducible de `scripts/smoke-test.ps1` y su resultado 26/26. Separar esta
evidencia técnica de la prueba humana de usabilidad. No completar resultados de participantes por
suposición.

### 17. Auditoría legal y de seguridad

Conservar los hallazgos históricos como evidencia de la Actividad 10, pero añadir el estado
actual:

- trazabilidad durable: mitigada con `log_auditoria`;
- contraseñas: almacenadas mediante hash;
- CORS: limitado a los orígenes web configurados;
- errores internos: ocultos en respuestas 500;
- Habeas Data: acceso, rectificación y solicitud de baja implementados;
- limitación abierta: no existe autorización real de endpoints ni JWT.

También registrar el riesgo conocido de dependencias transitivas de Expo descrito en
`docs/testing/SMOKE_TEST_2026-09-01.md`.

### 19. Habeas Data

Reemplazar el texto que presenta **Mi perfil** como mejora recomendada. La pantalla ya permite
consultar nombre, usuario, correo, rol y fecha; corregir nombre/correo; y registrar una solicitud
de baja. La única cuenta administradora está protegida para evitar dejar el sistema sin gestión.

### 20. Trazabilidad y auditoría de operaciones

Eliminar completamente el marcador:

`[EN ESTA PARTE INSERTAR EL RESULTADO FINAL DE LOG_AUDITORIA...]`

Sustituirlo por el resultado real: la tabla `log_auditoria` registra actor, acción, entidad,
identificador, fecha UTC, resultado y detalle. Cubre login, productos, entradas, salidas, usuarios,
perfil y solicitudes de baja. Adjuntar una captura de **Actividad reciente** o una consulta de
PostgreSQL; al cierre del recorrido web existían 37 eventos persistidos.

### 21. UML

Referenciar `docs/uml/final`: diagrama de clases y secuencias HU01–HU07. Evitar presentar como
arquitectura actual cualquier diagrama histórico que contenga repositorios o tablas no
implementadas.

### 22. Matriz final de trazabilidad

Cambiar HU05 y HU06 de `Validar estado final` a `Implementado`. Agregar HU07 y la auditoría
transversal. La versión completa ya está en `docs/TRAZABILIDAD.md`.

### 23. Preparación para el Demo Day

Actualizar el recorrido: Login → Dashboard → Productos → Inventario → Vencimientos → Mi perfil →
Administración → PostgreSQL/GitHub. Incluir solicitudes de baja y actividad reciente.

### 26. Limitaciones

Mantener como limitaciones reales: autenticación académica sin JWT, autorización visual de roles,
HTTP en desarrollo, ausencia de despliegue productivo y dependencias Expo pendientes de
actualización. No listar la falta de auditoría o Mi perfil como limitaciones.

### 27. Conclusiones

Añadir que el MVP ya cubre acceso y rectificación de datos, solicitudes de baja, trazabilidad
durable, Dashboard y datos de demostración. Mantener la declaración honesta de que no es un
sistema listo para producción.

### 28. Recomendaciones y trabajo futuro

Eliminar `fortalecer el registro de auditoría` e `incorporar una sección de perfil y solicitudes`,
porque ya están implementados. Reemplazarlos por:

- autenticación y autorización real por roles;
- HTTPS y despliegue seguro;
- actualización controlada de Expo y dependencias transitivas;
- pruebas automáticas en integración continua;
- respaldo y recuperación de PostgreSQL.

### 29. Anexos

Adjuntar únicamente evidencia final: enlace definitivo a GitHub, PRD, Árbol de Problemas, matriz
de trazabilidad, UML final, diccionario de datos, migraciones, smoke test 26/26, prueba de
usabilidad real y las capturas indicadas en `docs/CAPTURAS_DEMO_DAY.md`.

## Texto breve listo para la sección 20

> VidaSalud implementa auditoría persistente mediante la tabla `log_auditoria`. Cada evento
> registra actor, acción, entidad afectada, identificador opcional, fecha UTC, resultado y detalle.
> La cobertura incluye inicios de sesión exitosos o rechazados, registro de productos, entradas y
> salidas, administración de usuarios, corrección de perfil y solicitudes de baja. Esta evidencia
> permite determinar quién realizó una operación, sobre qué dato, cuándo y con qué resultado.

