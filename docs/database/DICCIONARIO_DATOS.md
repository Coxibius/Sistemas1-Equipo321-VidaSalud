# Diccionario de datos implementado — VidaSalud

Este documento describe el modelo materializado por Entity Framework y PostgreSQL. No incluye
tablas propuestas fuera del alcance del MVP, como proveedores o datos de pacientes.

## `categoria`

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| `id_categoria` | integer | PK, identity | Identificador de categoría |
| `nombre_categoria` | varchar(50) | requerido, único | Nombre de categoría |

## `producto`

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| `id_producto` | integer | PK, identity | Identificador del producto |
| `nombre` | varchar(100) | requerido, único | Nombre comercial |
| `id_categoria` | integer | FK → categoria, RESTRICT | Categoría |
| `precio` | decimal(10,2) | requerido | Precio referencial |
| `fecha_creacion` | date | requerido | Fecha de alta |

## `lote`

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| `id_lote` | integer | PK, identity | Identificador del lote |
| `id_producto` | integer | FK → producto, CASCADE | Producto asociado |
| `cantidad` | integer | requerido | Unidades disponibles |
| `fecha_ingreso` | date | requerido | Fecha de ingreso |
| `fecha_vencimiento` | date | requerido | Fecha de vencimiento |

## `movimiento_inventario`

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| `id_movimiento` | integer | PK, identity | Identificador del movimiento |
| `id_producto` | integer | FK → producto, RESTRICT | Producto afectado |
| `tipo_movimiento` | varchar(10) | requerido | ENTRADA o SALIDA |
| `cantidad` | integer | requerido | Cantidad operada |
| `fecha` | timestamptz | requerido | Fecha UTC |
| `estado_movimiento` | varchar(15) | requerido | Estado del movimiento |
| `responsable` | varchar(80) | requerido | Responsable visible |

## `usuario`

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| `id_usuario` | integer | PK, identity | Identificador de cuenta |
| `nombre` | varchar(80) | requerido | Nombre del usuario |
| `nombre_usuario` | varchar(50) | requerido, único | Credencial de acceso |
| `email` | varchar(100) | opcional, único | Correo |
| `rol` | varchar(20) | CHECK | ADMINISTRADOR, ENCARGADO o AUXILIAR |
| `password_hash` | varchar(500) | requerido | Hash no reversible para validación |
| `fecha_registro` | timestamptz | requerido | Alta de la cuenta |
| `activo` | boolean | requerido, default true | Habilitación para iniciar sesión |
| `eliminado` | boolean | requerido, default false | Baja lógica; las consultas normales ocultan la cuenta |

## `solicitud_baja`

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| `id_solicitud` | integer | PK, identity | Identificador de solicitud |
| `id_usuario` | integer | FK nullable → usuario, SET NULL | Titular asociado |
| `nombre_usuario` | varchar(50) | requerido | Identificador histórico del titular |
| `motivo` | varchar(250) | opcional | Motivo declarado |
| `estado` | varchar(15) | CHECK | PENDIENTE, APROBADA o RECHAZADA |
| `fecha_solicitud` | timestamptz | requerido | Registro UTC |
| `fecha_resolucion` | timestamptz | opcional | Resolución UTC |
| `resuelta_por` | varchar(80) | opcional | Administrador responsable |

## `log_auditoria`

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| `id_log` | integer | PK, identity | Identificador del evento |
| `actor` | varchar(80) | requerido | Usuario que originó la acción |
| `accion` | varchar(50) | requerido | Operación registrada |
| `entidad` | varchar(50) | requerido | Componente afectado |
| `entidad_id` | integer | opcional | ID de referencia sin FK |
| `fecha_utc` | timestamptz | requerido, indexado | Instante del evento |
| `resultado` | varchar(15) | CHECK | EXITOSO, FALLIDO o RECHAZADO |
| `detalle` | varchar(250) | opcional | Resumen sin datos sensibles |

## Normalización

El modelo implementado cumple 3FN en el alcance del MVP: cada tabla representa una entidad,
los atributos son atómicos, las relaciones usan claves foráneas y no se duplican datos de categoría
o producto en lotes y movimientos. La eliminación administrativa de cuentas es lógica:
`usuario.eliminado` pasa a `true`, la cuenta se oculta y la FK de `solicitud_baja` se conserva.
`nombre_usuario` permanece como instantánea histórica. `SET NULL` es una salvaguarda ante una
eliminación física excepcional fuera del flujo normal de la API.
