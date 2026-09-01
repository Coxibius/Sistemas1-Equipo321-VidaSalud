# Ensayo operativo — Demo Day VidaSalud

## Reparto sugerido

- **Víctor:** pitch, Dashboard, Productos, Vencimientos y cierre de valor.
- **María:** Inventario, Usuarios, Mi perfil, PostgreSQL y defensa técnica.

Ambos deben conocer las limitaciones: sesión académica sin JWT, autorización de API pendiente y
uso local mediante HTTP.

## Pitch cronometrado — 3 minutos

### 0:00–0:30 — Problema

“VidaSalud nace para resolver un problema cotidiano de las farmacias pequeñas: cuando el
inventario se controla manualmente, el stock pierde confiabilidad y los vencimientos se detectan
demasiado tarde. Esto provoca registros duplicados, salidas sin trazabilidad y pérdidas de
productos.”

### 0:30–1:00 — Causas y usuarios

“Identificamos como causas la información dispersa, la actualización manual del stock, la falta de
alertas y la ausencia de responsables identificados. Los usuarios principales son el encargado, el
auxiliar y el administrador.”

### 1:00–1:35 — Solución

“Nuestro MVP integra productos, lotes, entradas, salidas, vencimientos y usuarios mediante una
aplicación Expo, una API ASP.NET Core y PostgreSQL. El Dashboard y las alertas se calculan desde
datos reales de la base.”

### 1:35–2:00 — ODS

“VidaSalud contribuye principalmente al ODS 9 porque digitaliza y hace más confiable un proceso
operativo. Como impacto complementario, la trazabilidad y el control de datos apoyan el ODS 16.”

### 2:00–2:40 — Diferencial y ética

“El sistema evita stock negativo, bloquea lotes vencidos para salidas, alerta con 30 días, registra
responsables y conserva auditoría. Las contraseñas usan hash y cada usuario puede consultar,
corregir y solicitar la baja de sus datos. No procesamos pacientes, historias clínicas ni datos
financieros.”

### 2:40–3:00 — Cierre

“VidaSalud reduce errores operativos y permite tomar decisiones preventivas con información
consistente y trazable. Es un MVP académico funcional, con límites de seguridad reconocidos y una
arquitectura preparada para evolucionar.”

## Live demo — máximo 6 minutos

1. **0:00–0:30:** entrar como `maria` y mostrar el rol.
2. **0:30–1:10:** Dashboard: 10 productos, stock, alertas y vencimientos.
3. **1:10–2:00:** buscar `Paraceta` y mostrar rechazo de duplicado o valor negativo.
4. **2:00–2:50:** registrar movimiento controlado y explicar responsable/stock.
5. **2:50–3:30:** mostrar vencidos y próximos a vencer.
6. **3:30–4:20:** Mi perfil: datos almacenados y solicitud de baja.
7. **4:20–5:20:** entrar como `admin`; mostrar ocho usuarios, solicitudes y actividad reciente.
8. **5:20–6:00:** abrir pgAdmin o GitHub y cerrar con 3FN, auditoría y trazabilidad.

No crear el usuario de prueba durante el pitch. Si se necesita demostrar una baja, utilizar una
cuenta descartable preparada antes del ensayo.

## Respuestas de 20 segundos

- **¿Por qué PostgreSQL + EF Core?** PostgreSQL aplica integridad relacional; EF Core mantiene el
  modelo y las migraciones versionadas.
- **¿Dónde está la 3FN?** Categoría, Producto, Lote, Movimiento, Usuario, Solicitud y Log representan
  conceptos separados. Cantidad y vencimiento viven en Lote porque cambian por ingreso.
- **¿Cómo se evita vender vencidos?** Las salidas consumen lotes con cantidad positiva y fecha
  posterior a hoy; si no existe stock válido, la operación se rechaza.
- **¿Cómo aplican Ley 164?** Minimizamos datos, protegemos credenciales, registramos trazabilidad y
  permitimos acceso, rectificación y solicitud de baja.
- **¿Qué seguridad falta?** Autenticación y autorización real de endpoints; la sesión actual es
  académica y no debe usarse en producción.
- **¿Dónde se cambia una regla?** Primero en `PRD.md` y la HU correspondiente; después en el servicio,
  validaciones, pruebas y modelo si afecta datos.

## Plan de contingencia

- Ruta principal: web local con PostgreSQL y API.
- Respaldo 1: Expo Go en el teléfono.
- Respaldo 2: capturas y video corto del recorrido.
- Respaldo 3: smoke test y evidencia documental si falla la red.
- Llevar cargador, hotspot, copia local del repositorio y credenciales ficticias impresas.

## Ensayos obligatorios

1. Dos pitch completos cronometrados entre 2:50 y 3:00.
2. Dos recorridos de demo menores a seis minutos.
3. Un ensayo con fallo simulado de Expo, pasando inmediatamente a la web.
4. Una ronda de preguntas: 3FN, FK, reglas, Ley 164, IA y limitaciones.

