# Plan de capturas — Demo Day VidaSalud

Guardar las imágenes en `docs/evidence/screenshots/` con los nombres propuestos. Antes de cada
captura, cerrar notificaciones, ocultar otras pestañas y verificar que no aparezcan contraseñas ni
la cadena de conexión de PostgreSQL.

## Ocho capturas esenciales para el informe

1. `01-login.png` — pantalla de acceso sin contraseña escrita. Pie sugerido: **Inicio de sesión
   académico con cuentas y roles persistidos en PostgreSQL.**
2. `02-dashboard.png` — métricas y alertas completas. Pie: **Dashboard calculado a partir del
   inventario y los lotes almacenados.**
3. `03-productos-busqueda.png` — búsqueda parcial de `Paraceta`. Pie: **Consulta por coincidencia
   parcial y visualización del stock disponible.**
4. `04-inventario-validacion.png` — mensaje de stock insuficiente, sin guardar un movimiento
   incorrecto. Pie: **Regla que impide una salida superior a las existencias.**
5. `05-vencimientos.png` — 1 vencido y 3 próximos. Pie: **Clasificación preventiva según el umbral
   de 30 días.**
6. `06-mi-perfil.png` — pantalla de datos del usuario, sin contraseña. Pie: **Acceso y
   rectificación de datos personales conforme al alcance de Habeas Data.**
7. `07-admin-auditoria.png` — sección de solicitudes y actividad reciente. Pie: **Trazabilidad
   durable de actor, acción, entidad, fecha y resultado.**
8. `08-postgresql-integridad.png` — pgAdmin con las siete tablas y relaciones. Pie: **Modelo
   relacional normalizado e integridad implementada en PostgreSQL.**

## Capturas complementarias

9. `09-usuarios-roles.png` — ocho usuarios y los tres roles.
10. `10-solicitud-baja.png` — solicitud pendiente o resuelta con datos ficticios.
11. `11-smoke-test.png` — terminal mostrando `TOTAL_PRUEBAS=26` y `TOTAL_OK=26`.
12. `12-github-evidencia.png` — GitHub mostrando `PRD.md`, `docs/uml/final`, diccionario y
    migraciones.
13. `13-celular-dashboard.jpg` — Expo Go ejecutando el Dashboard.
14. `14-celular-teclado.jpg` — formulario con teclado abierto y botón visible sobre la barra de
    Android.

## Captura segura del hash

Si el docente solicita evidencia de contraseñas protegidas, ejecutar en pgAdmin:

```sql
SELECT nombre_usuario,
       rol,
       activo,
       eliminado,
       LEFT(password_hash, 24) || '...' AS hash_muestra
FROM usuario
WHERE eliminado = false
ORDER BY nombre_usuario;
```

La captura debe mostrar que los valores son hashes distintos, no contraseñas legibles. Nunca
capturar `appsettings.Development.json` ni la contraseña local de PostgreSQL.

Para demostrar la baja lógica y la conservación de relaciones sin exponer contraseñas:

```sql
SELECT u.id_usuario,
       u.nombre_usuario,
       u.activo,
       u.eliminado,
       s.id_solicitud
FROM usuario u
LEFT JOIN solicitud_baja s ON s.id_usuario = u.id_usuario
WHERE u.eliminado = true
ORDER BY u.id_usuario DESC;
```

## Captura segura de auditoría

```sql
SELECT actor, accion, entidad, fecha_utc, resultado
FROM log_auditoria
ORDER BY fecha_utc DESC
LIMIT 10;
```

## Orden recomendado para tomarlas

1. Web: Login, Dashboard, Productos, Inventario, Vencimientos, Mi perfil y Administración.
2. PostgreSQL: tablas, hash parcial y log.
3. Terminal: smoke test 26/26.
4. GitHub: documentación final en la rama fusionada.
5. Celular: Dashboard y formulario con teclado/barra de Android.

No es necesario llenar el informe con todas. Usar las ocho esenciales y conservar las demás como
respaldo para la defensa.

