# Matriz de trazabilidad — VidaSalud

Esta matriz permite defender que cada módulo responde a una causa del problema y deja evidencia
en una pantalla, regla de negocio y estructura persistente concreta.

| Causa o necesidad | HU | Pantalla o flujo | Regla verificable | Tabla principal |
| --- | --- | --- | --- | --- |
| Registro manual y productos duplicados | HU01 | Registrar producto | Nombre único; precio y cantidad no negativos | `producto`, `lote` |
| Dificultad para conocer existencias | HU02 | Productos y Dashboard | Búsqueda parcial; stock calculado desde lotes | `producto`, `lote`, `categoria` |
| Movimientos sin control | HU03 | Inventario | Salida no supera stock; FEFO; responsable obligatorio | `movimiento_inventario`, `lote` |
| Detección tardía de vencimientos | HU04 | Vencimientos | Alerta a 30 días; lotes vencidos no salen | `lote`, `producto` |
| Operaciones sin responsable identificable | HU05 | Login y sesión | Credenciales válidas; cuenta activa | `usuario`, `log_auditoria` |
| Accesos sin administración | HU06 | Gestión de usuarios | Tres roles; administrador único; contraseña con hash | `usuario`, `log_auditoria` |
| Falta de control sobre datos personales | HU07 | Mi perfil y solicitudes | Consulta, corrección y solicitud de baja | `usuario`, `solicitud_baja` |
| Ausencia de evidencia de acciones | Transversal | Actividad reciente | Actor, acción, fecha y resultado persistentes | `log_auditoria` |

## Ejemplo de defensa de extremo a extremo

La causa “movimientos sin control” origina HU03. En **Inventario**, una salida llega a
`MovimientosController`, se valida en `MovimientoService`, descuenta lotes vigentes por fecha de
vencimiento, guarda `movimiento_inventario` y registra el actor en `log_auditoria`. Así se puede
mostrar el vínculo problema → historia → interfaz → código → PostgreSQL.

## Límites declarados

VidaSalud no procesa pacientes, historias clínicas, recetas, pagos ni información financiera. La
trazabilidad corresponde únicamente al inventario y a las cuentas académicas del sistema.
