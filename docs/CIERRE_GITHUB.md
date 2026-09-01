# Cierre de GitHub y entrega

## Estado observado

- Rama de trabajo: `feature/hu02-hu06-victor`.
- Rama remota principal: `origin/main`.
- Los cambios de HU07, seguridad, datos demo y documentación todavía no están confirmados.
- `appsettings.Development.json`, `.env`, `node_modules`, `bin` y `obj` están ignorados.
- No se encontró una credencial real versionada; `appsettings.json` conserva marcadores
  `TU_USUARIO` y `TU_PASSWORD`.

## Antes del commit

1. Completar la prueba física del celular.
2. Guardar las capturas seleccionadas en `docs/evidence/screenshots/`.
3. Completar la prueba humana de usabilidad o declararla pendiente con honestidad.
4. Revisar especialmente que no se agregue `appsettings.Development.json`.
5. Ejecutar desde la raíz:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\pre-demo-check.ps1
git status
git diff --check
```

## Commit y publicación de la rama

Ejecutar únicamente después de revisar las capturas y el estado:

```powershell
git add .
git status --short
git diff --cached --name-only
git commit -m "feat: completar HU07 y preparar Demo Day"
git push origin feature/hu02-hu06-victor
```

En `git status --short` no deben aparecer archivos con contraseñas, `.env`, `node_modules`, `bin`
ni `obj`. Si aparece alguno, retirarlo del área de preparación antes del commit.

## Pull Request recomendado

- **Base:** `main`
- **Compare:** `feature/hu02-hu06-victor`
- **Título:** `feat: completar VidaSalud y preparar Demo Day`
- **Resumen:** HU07, auditoría persistente, solicitudes de baja, datos demo, Dashboard,
  compatibilidad Expo, PRD, UML, SQL y evidencia de pruebas.
- **Pruebas:** backend 0 errores, TypeScript 0 errores y smoke test 22/22.

Después de revisar el PR en GitHub, fusionarlo a `main` sin usar `push --force`.

## Actualización de la compañera

Después del merge:

```powershell
git switch main
git pull --ff-only origin main
cd backend\VidaSalud.Api
dotnet restore
dotnet ef database update
cd ..\..\frontend
npm ci
```

Después debe crear su propio `appsettings.Development.json`, iniciar PostgreSQL y ejecutar backend
y frontend siguiendo el README.

## Entrega Moodle

- Exportar el informe actualizado a PDF.
- Verificar que no contiene marcadores pendientes ni capturas ilegibles.
- Incluir el enlace definitivo de `main`, no el enlace de una rama temporal.
- Abrir el enlace en una ventana privada para confirmar que el docente puede verlo.
- Subir el PDF y comprobar que Moodle permite descargarlo correctamente.

