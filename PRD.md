# PRD — VidaSalud

## 1. Resumen del producto

VidaSalud es un MVP académico para gestionar inventario farmacéutico. Centraliza productos,
lotes, existencias, movimientos, vencimientos y responsables de operación. No procesa historias
clínicas, datos de pacientes ni información financiera.

## 2. Problema

El control manual o disperso del inventario provoca desconocimiento del stock real, registros
duplicados, detección tardía de vencimientos y poca trazabilidad de entradas y salidas.

## 3. Objetivo SMART

Al cierre del proyecto académico, disponer de un MVP web/móvil conectado a PostgreSQL que
permita ejecutar HU01–HU07 sin errores críticos: registrar y buscar productos, actualizar stock,
detectar vencimientos, identificar responsables, administrar cuentas y ejercer consulta,
rectificación y solicitud de baja de datos personales.

El objetivo se considerará alcanzado cuando:

- las 7 historias superen el smoke test funcional;
- las reglas de duplicado, stock insuficiente y cuenta inactiva se demuestren correctamente;
- al menos 80 % de las tareas de la prueba de usabilidad sean completadas sin ayuda; y
- PostgreSQL conserve relaciones, restricciones y auditoría después de reiniciar la aplicación.

## 4. Alineación con ODS

- **ODS 9 — Industria, innovación e infraestructura:** digitaliza un proceso operativo mediante
  una aplicación Expo, API REST y base de datos relacional.
- **ODS 16 — Instituciones sólidas, impacto complementario:** fortalece transparencia y
  trazabilidad mediante responsables identificados y logs de auditoría.

## 5. Usuarios y roles

- **ADMINISTRADOR:** gestiona usuarios, revisa solicitudes de baja y consulta auditoría.
- **ENCARGADO:** opera productos, stock y vencimientos.
- **AUXILIAR:** consulta el inventario y registra operaciones generales.

El login es deliberadamente académico: no utiliza JWT y la sesión vive en memoria del frontend.
La visibilidad por rol no constituye autorización criptográfica de los endpoints.

## 6. Alcance funcional

- HU01: registrar producto y lote inicial.
- HU02: listar y buscar productos por nombre.
- HU03: registrar entradas y salidas sin permitir stock negativo ni salida de lotes vencidos.
- HU04: mostrar lotes vencidos o próximos a vencer.
- HU05: iniciar y cerrar una sesión académica con usuarios almacenados en PostgreSQL.
- HU06: administrar usuarios y contraseñas almacenadas mediante hash.
- HU07: consultar y corregir datos personales y solicitar la baja de una cuenta.
- Dashboard con indicadores, stock bajo y alertas.
- Auditoría persistente de operaciones críticas.

## 7. Fuera de alcance

- Historias clínicas, recetas y datos de pacientes.
- Pagos, facturación e información financiera.
- Requisitos ASFI.
- JWT, OAuth, recuperación de contraseña por correo y despliegue productivo.
- Proveedores y compras.

## 8. Reglas de negocio principales

1. Nombre, categoría, precio, cantidad y vencimiento son obligatorios al registrar productos.
2. Precio y cantidad no pueden ser negativos; el nombre del producto es único.
3. Una salida no puede superar el stock disponible ni utilizar lotes vencidos.
4. Los lotes con 30 días o menos se consideran próximos a vencer.
5. Los roles válidos son ADMINISTRADOR, ENCARGADO y AUXILIAR.
6. Existe un único administrador protegido.
7. Las contraseñas nunca se devuelven por API y se almacenan mediante `PasswordHasher`.
8. Una cuenta inactiva no puede iniciar sesión.
9. Solo puede existir una solicitud de baja pendiente por usuario.
10. Aprobar una baja desactiva la cuenta y conserva su trazabilidad histórica.
11. La eliminación administrativa de un usuario es lógica: establece `activo = false` y
    `eliminado = true`; la cuenta deja de mostrarse sin borrar sus relaciones históricas.
12. Los nombres de usuario y correos eliminados continúan reservados para evitar ambigüedad en la
    trazabilidad.

## 9. Datos personales y seguridad

VidaSalud almacena únicamente nombre, usuario, correo opcional, rol, fecha de registro y estados
de actividad/eliminación lógica. La pantalla **Mi perfil** permite conocer y rectificar
nombre/correo, y registrar una solicitud de baja. Las operaciones críticas se guardan en
`log_auditoria` sin contraseñas ni hashes.

Estas medidas apoyan los principios de acceso, rectificación, actualización y cancelación del
artículo 130 de la Constitución Política del Estado y del artículo 56 del DS 1793, reglamentario de
la Ley 164. El proyecto es académico y no constituye un sistema productivo de cumplimiento legal.

## 10. Trazabilidad problema → solución

| Causa identificada | Historia | Evidencia funcional |
| --- | --- | --- |
| Registro manual y duplicado | HU01 | Registro validado y nombre único |
| Desconocimiento de existencias | HU02 | Búsqueda y stock calculado por lotes |
| Falta de control de entradas/salidas | HU03 | Movimiento con responsable y validación de stock |
| Detección tardía de vencimientos | HU04 | Alertas ordenadas por vencimiento |
| Operaciones sin responsable | HU05 | Login y usuario visible en la sesión |
| Falta de administración de accesos | HU06 | CRUD de usuarios y roles |
| Falta de control sobre datos personales | HU07 | Mi perfil, rectificación y solicitud de baja |
| Falta de evidencia sobre operaciones | Requisito transversal | Tabla y vista de auditoría |

## 11. Criterios de cierre del MVP

- HU01–HU07 ejecutadas sin errores críticos.
- Migraciones aplicables desde una base vacía.
- Integridad referencial y restricciones demostrables en PostgreSQL.
- Contraseñas observables únicamente como hashes.
- Auditoría visible desde la administración.
- Recorrido móvil y web utilizable durante la presentación.
- Código, PRD, UML, diccionario de datos e informe final sincronizados.

## 12. Referencias normativas

- Constitución Política del Estado, artículos 130–131 — Acción de Protección de Privacidad:
  <https://www.gacetaoficialdebolivia.gob.bo/app/webroot/archivos/constitucion.pdf>
- Ley N.º 164, artículo 56 — protección de datos personales e intimidad en comunicaciones:
  <https://www.agetic.gob.bo/wp-content/uploads/2022/08/Ley-164-General-de-TICs.pdf>
- Decreto Supremo N.º 1793, artículo 56 — tratamiento y seguridad de datos personales:
  <https://agetic.gob.bo/sites/default/files/2025-02/decreto-supremo-1793.pdf>

## 13. Evidencia documental

- Árbol de Problemas: `docs/analysis/ARBOL_PROBLEMAS.png`.
- Matriz de trazabilidad: `docs/TRAZABILIDAD.md`.
- UML alineado con el MVP: `docs/uml/final/`.
- Diccionario y esquema implementado: `docs/database/DICCIONARIO_DATOS.md` y
  `docs/database/ESQUEMA_IMPLEMENTADO.sql`.
- Protocolo de usabilidad: `docs/usability/PRUEBA_USABILIDAD.md`.
- Guía de defensa: `docs/DEMO_DAY.md`.
