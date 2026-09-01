# Guía de defensa — Demo Day VidaSalud

Documentos operativos complementarios:

- `CAPTURAS_DEMO_DAY.md`: evidencias visuales y nombres de archivo.
- `ENSAYO_DEMO_DAY.md`: pitch cronometrado y recorrido de seis minutos.
- `CIERRE_GITHUB.md`: publicación de la rama, Pull Request y entrega.

## Pitch de valor (3 minutos)

### 0:00–0:40 — Problema

Muchas farmacias pequeñas controlan inventario mediante registros manuales o dispersos. Esto
dificulta conocer el stock real, detectar productos próximos a vencer y determinar quién realizó
una entrada o salida.

### 0:40–1:20 — Solución y ODS

VidaSalud digitaliza ese proceso con una aplicación web/móvil, una API REST y PostgreSQL.
Contribuye principalmente al ODS 9 mediante infraestructura tecnológica aplicada a un proceso
operativo; como impacto complementario, la trazabilidad y protección de datos apoyan el ODS 16.

### 1:20–2:20 — Evidencia funcional

El MVP registra y busca productos, controla entradas y salidas, evita stock negativo, bloquea la
salida de lotes vencidos y presenta alertas. Un dashboard resume productos, unidades, stock bajo
y vencimientos. También administra usuarios con contraseñas hasheadas, registra auditoría y
permite consultar, corregir o solicitar la baja de datos personales.

### 2:20–3:00 — Valor diferencial y cierre

VidaSalud no procesa pacientes, historias clínicas ni información financiera. Su valor es reducir
errores de inventario y ofrecer información oportuna y trazable con una arquitectura sencilla,
normalizada y adecuada al alcance académico.

## Recorrido recomendado de la demo

1. Abrir PostgreSQL y mostrar las tablas y migraciones.
2. Iniciar sesión como María y mostrar dashboard y alertas.
3. Buscar un producto mediante coincidencia parcial.
4. Registrar un producto y demostrar el rechazo de un duplicado.
5. Registrar una entrada y una salida; intentar una salida superior al stock.
6. Abrir **Mi perfil**, mostrar los datos almacenados y corregir el correo.
7. Iniciar sesión como administrador.
8. Mostrar usuarios, solicitudes de baja y actividad reciente.
9. Crear una cuenta descartable para demostrar solicitud/aprobación de baja.
10. Mostrar que la cuenta desactivada ya no puede iniciar sesión.

No improvisar datos críticos durante la presentación. Preparar previamente un usuario descartable
y productos suficientes para los movimientos.

## Trazabilidad para la defensa

| Causa raíz | Historia | Demostración |
| --- | --- | --- |
| Registro manual y duplicado | HU01 | Registro y rechazo de duplicado |
| Stock desconocido | HU02 | Listado, búsqueda y dashboard |
| Movimientos sin control | HU03 | Entrada, salida y stock insuficiente |
| Vencimientos tardíos | HU04 | Alertas ordenadas y salida bloqueada |
| Responsable no identificado | HU05 | Login y responsable automático |
| Accesos sin administración | HU06 | Gestión de usuarios y roles |
| Datos sin control del titular | HU07 | Mi perfil, corrección y baja |
| Ausencia de evidencia | Transversal | Log de auditoría persistente |

## Pruebas de fuego del docente

### Integridad referencial

- La categoría de un producto no puede eliminarse mientras esté relacionada (`RESTRICT`).
- Los lotes se eliminan con su producto (`CASCADE`) según el modelo implementado.
- Un producto con movimientos no puede eliminarse (`RESTRICT`).
- Si se elimina una cuenta, una solicitud histórica conserva el nombre y deja su FK en nulo
  (`SET NULL`).

### Habeas Data

Ruta: iniciar sesión → tocar nombre/tarjeta del usuario → **Mi perfil**. Allí se visualizan todos
los datos personales almacenados, se corrige nombre/correo y se solicita la baja.

### Seguridad

- Contraseñas: `PasswordHasher<Usuario>`; nunca aparecen en DTOs.
- Auditoría: tabla `log_auditoria`, visible desde administración.
- Errores: las respuestas 500 no exponen excepciones internas.
- Limitación declarada: sesión académica sin JWT y sin autorización criptográfica de endpoints.

### Regla de negocio

Las reglas se encuentran en `PRD.md`; su implementación se concentra en los servicios del backend.
Por ejemplo, el umbral de 30 días se evalúa en `VencimientoService`.

## Checklist antes de abrir el stand

- [ ] Rama final fusionada en `main` y repositorio sin archivos secretos.
- [ ] `dotnet ef database update` ejecutado.
- [ ] Backend disponible en el puerto 5237.
- [ ] Expo iniciado en modo LAN y celular conectado a la misma red.
- [ ] `GET /api/health` responde desde el teléfono.
- [x] HU01–HU07 probadas de punta a punta en API y recorrido web.
- [x] Datos de demostración visibles en dashboard y vencimientos.
- [x] Árbol de Problemas y matriz de trazabilidad disponibles.
- [x] UML final disponible como PNG legible.
- [ ] Prueba de usabilidad completada con resultados reales.
- [x] PRD, UML y diccionario de datos preparados en la rama de trabajo.
- [ ] Informe Final PDF y enlace definitivo del repositorio listos para Moodle.
- [ ] Capturas o video corto disponibles como respaldo sin red.

Los elementos marcados corresponden al estado técnico local. GitHub solo se considera cerrado
cuando el Pull Request esté fusionado en `main` y el enlace se haya comprobado en una ventana
privada.

Evidencia automatizada disponible: `testing/SMOKE_TEST_2026-09-01.md` registra 22 de 22
verificaciones aprobadas. La casilla del teléfono debe marcarse únicamente después de completar
el checklist físico de `testing/PRUEBA_MOVIL_2026-09-01.md` en el dispositivo del stand.
