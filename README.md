# VidaSalud

Sistema académico de gestión de inventario farmacéutico desarrollado para la materia Sistemas de Información 1.

VidaSalud permite registrar y consultar productos, controlar entradas y salidas, visualizar alertas de vencimiento y administrar usuarios con tres roles. No procesa historias clínicas, datos de pacientes ni información financiera.

## Funcionalidades implementadas

- HU01: registro de productos y lote inicial.
- HU02: consulta y búsqueda parcial de productos.
- HU03: registro de entradas y salidas de inventario.
- HU04: alertas de lotes vencidos o próximos a vencer.
- HU05: pantalla de inicio y cierre de sesión.
- HU06: CRUD de usuarios almacenados en PostgreSQL.
- HU07: consulta y corrección de datos personales y solicitud de baja.
- Auditoría persistente de inicios de sesión, productos, movimientos, usuarios y bajas.

## Tecnologías

### Backend

- ASP.NET Core sobre .NET 10.
- Entity Framework Core 10.
- PostgreSQL mediante Npgsql.
- `PasswordHasher` de ASP.NET para almacenar contraseñas mediante hash.

### Frontend

- Expo SDK 54.
- React Native y React Native Web.
- TypeScript.
- Axios.

## Roles

- `ADMINISTRADOR`: gestiona usuarios, solicitudes de baja y registros de auditoría.
- `ENCARGADO`: puede operar productos, inventario y vencimientos.
- `AUXILIAR`: puede operar los módulos generales del inventario.

La sesión del proyecto es académica y no utiliza JWT. El frontend conserva al usuario únicamente mientras la aplicación permanece abierta. La restricción del módulo administrativo es visual; la API todavía no implementa autorización criptográfica por rol.

## Cuentas de demostración

La migración crea las tres cuentas originales y el seeder idempotente completa ocho perfiles
ficticios. Las contraseñas se almacenan mediante hash y nunca se devuelven por la API:

| Nombre | Rol | Usuario | Contraseña inicial |
| --- | --- | --- | --- |
| Ana Patricia Rojas | Administrador | `admin` | `admin123` |
| Víctor Hugo Mamani | Auxiliar | `victor` | `victor123` |
| María López Vargas | Encargado | `maria` | `maria123` |
| José Roberto Márquez | Encargado | `jose` | `jose123` si la cuenta no existía |
| Camila Rojas Pérez | Auxiliar | `camila` | `camila123` |
| Diego Flores Choque | Encargado | `diego` | `diego123` |
| Lucía Mendoza Quispe | Auxiliar | `lucia` | `lucia123` |
| Carlos Condori Vargas | Encargado | `carlos` | `carlos123` |

Estas credenciales son exclusivamente para la presentación académica.
Si una cuenta ya existía, el seeder conserva su contraseña, estado y cambios personales. Solo
completa nombres o correos que aún conservan los valores iniciales conocidos.

## Requisitos previos

- Git.
- .NET SDK 10.
- PostgreSQL instalado y con el servicio activo.
- Node.js 20.19 o una versión compatible con Expo SDK 54.
- npm.

Comprobación rápida:

```powershell
git --version
dotnet --version
psql --version
node --version
npm --version
```

## Clonar el proyecto

```powershell
git clone https://github.com/Coxibius/Sistemas1-Equipo321-VidaSalud.git
cd Sistemas1-Equipo321-VidaSalud
```

## Configurar PostgreSQL

Crear la base de datos desde PowerShell si `createdb` está disponible:

```powershell
createdb -U postgres vidasalud_db
```

También puede crearse manualmente desde pgAdmin con el nombre `vidasalud_db`.

Crear el archivo local `backend/VidaSalud.Api/appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=vidasalud_db;Username=postgres;Password=TU_PASSWORD"
  }
}
```

Reemplazar `TU_PASSWORD` por la contraseña local de PostgreSQL. No subir este archivo ni contraseñas reales a GitHub.

## Ejecutar el backend

Desde la raíz del repositorio:

```powershell
cd backend\VidaSalud.Api
dotnet restore
dotnet ef database update
dotnet run --launch-profile http
```

La API quedará disponible en:

```text
http://localhost:5237/api
```

La migración crea las tablas, categorías iniciales y las tres cuentas originales. Al iniciar la API,
el seeder completa los ocho usuarios y agrega ocho productos con lotes de ejemplo para alimentar
el dashboard y las alertas de vencimiento. Es idempotente: no duplica usuarios ni productos y no
sobrescribe contraseñas existentes. Puede desactivarse con `"SeedDemoData": false` en la
configuración local.

La migración `AddAuditoriaYSolicitudesBaja` agrega el estado de cuenta, logs persistentes y el
flujo de solicitudes de baja. Debe aplicarse antes de probar HU07.

## Ejecutar el frontend web

Abrir otra terminal desde la raíz del repositorio:

```powershell
cd frontend
npm ci
npm run web
```

En la versión web, Axios utiliza automáticamente `http://localhost:5237/api`.

## Ejecutar desde Expo Go

Para utilizar un teléfono en la misma red:

1. Conectar la computadora y el teléfono a la misma red Wi-Fi.
2. Iniciar la API. El perfil HTTP ya escucha conexiones de la red local:

```powershell
cd backend\VidaSalud.Api
dotnet run --launch-profile http
```

3. En otra terminal, iniciar Expo en modo LAN y limpiar la caché:

```powershell
cd frontend
npm start -- --lan --clear
```

4. Escanear el nuevo QR desde Expo Go. La aplicación obtiene automáticamente la IP del
servidor de Expo y construye la dirección de la API; no se modifica `frontend/services/api.ts`.

Si el teléfono todavía no conecta, consultar la IPv4 de la computadora con `ipconfig` y abrir
`http://TU_IPV4:5237/api/health` en el navegador del teléfono. Si esa dirección no responde,
permitir .NET y el puerto `5237` para redes privadas en el firewall de Windows. Una VPN o una
red Wi-Fi con aislamiento entre dispositivos también puede impedir la conexión.

## Endpoints principales

| Método | Ruta | Función |
| --- | --- | --- |
| `GET` | `/api/health` | Comprobar que el teléfono puede alcanzar la API |
| `POST` | `/api/auth/login` | Validar credenciales sin generar token |
| `GET` | `/api/productos` | Listar o buscar productos |
| `POST` | `/api/productos` | Registrar producto y lote inicial |
| `POST` | `/api/movimientos` | Registrar entrada o salida |
| `GET` | `/api/vencimientos/alertas` | Consultar alertas de vencimiento |
| `GET` | `/api/usuarios` | Listar usuarios sin contraseñas |
| `GET` | `/api/usuarios/{id}` | Consultar los datos del perfil |
| `POST` | `/api/usuarios` | Registrar usuario |
| `PUT` | `/api/usuarios/{id}` | Editar usuario o cambiar contraseña |
| `PUT` | `/api/usuarios/{id}/perfil` | Corregir nombre y correo propios |
| `DELETE` | `/api/usuarios/{id}` | Aplicar baja lógica a un usuario no administrador |
| `GET` | `/api/auditoria` | Consultar eventos críticos recientes |
| `GET` | `/api/solicitudes-baja` | Listar solicitudes de baja |
| `POST` | `/api/solicitudes-baja` | Registrar una solicitud de baja |
| `PUT` | `/api/solicitudes-baja/{id}/resolver` | Aprobar o rechazar una solicitud |

Hay ejemplos adicionales en `backend/VidaSalud.Api/VidaSalud.Api.http`.

La baja administrativa no borra físicamente la cuenta: establece `activo = false` y
`eliminado = true`. El filtro global de Entity Framework la excluye del listado, perfil e inicio
de sesión, mientras PostgreSQL conserva sus relaciones y la evidencia histórica.

## Verificaciones rápidas

Backend:

```powershell
cd backend\VidaSalud.Api
dotnet build --no-restore
```

Frontend:

```powershell
cd frontend
npx tsc --noEmit
```

Prueba integral HU01–HU07, con la API y PostgreSQL activos:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

Control previo al Demo Day:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\pre-demo-check.ps1
```

La evidencia de la ejecución del 1 de septiembre de 2026 está en
[`docs/testing/SMOKE_TEST_2026-09-01.md`](docs/testing/SMOKE_TEST_2026-09-01.md). La comprobación
de red y el checklist para el teléfono están en
[`docs/testing/PRUEBA_MOVIL_2026-09-01.md`](docs/testing/PRUEBA_MOVIL_2026-09-01.md).

## Estructura principal

```text
Sistemas1-Equipo321-VidaSalud/
├── .bck-nd/requirements/       Historias HU01-HU07
├── backend/VidaSalud.Api/      API ASP.NET Core y migraciones
├── frontend/                   Aplicación Expo/React Native
└── docs/                       Diagramas y documentación académica
```

El alcance, ODS, reglas y trazabilidad final están definidos en `PRD.md`.

Documentos recomendados para la defensa (índice completo en [`docs/README.md`](docs/README.md)):

- [`docs/analysis/ARBOL_PROBLEMAS.png`](docs/analysis/ARBOL_PROBLEMAS.png): causas, problema central y efectos.
- [`docs/TRAZABILIDAD.md`](docs/TRAZABILIDAD.md): relación causa → HU → pantalla → regla → tabla.
- [`docs/uml/final/`](docs/uml/final/README.md): fuentes e imágenes UML del código implementado.
- [`docs/database/DICCIONARIO_DATOS.md`](docs/database/DICCIONARIO_DATOS.md): tablas, claves y normalización.
- [`docs/usability/PRUEBA_USABILIDAD.md`](docs/usability/PRUEBA_USABILIDAD.md): protocolo y registro de resultados reales.
- [`docs/DEMO_DAY.md`](docs/DEMO_DAY.md): pitch, recorrido y checklist del stand.
- [`docs/testing/`](docs/testing/): resultados técnicos y validación móvil del MVP.
- [`docs/CAPTURAS_DEMO_DAY.md`](docs/CAPTURAS_DEMO_DAY.md): capturas que deben anexarse.
- [`docs/ENSAYO_DEMO_DAY.md`](docs/ENSAYO_DEMO_DAY.md): pitch, demo y respuestas técnicas.
- [`docs/CIERRE_GITHUB.md`](docs/CIERRE_GITHUB.md): cierre de rama, PR y entrega Moodle.

## Flujo Git recomendado

Cada integrante trabaja en su propia rama y abre un Pull Request hacia `main`.

Antes de comenzar:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/nombre-de-la-tarea
```

Guardar y publicar el trabajo:

```powershell
git status
git add .
git commit -m "feat: describir el cambio realizado"
git push -u origin feature/nombre-de-la-tarea
```

Después de revisar y fusionar el Pull Request en GitHub, todos actualizan su copia local:

```powershell
git switch main
git pull --ff-only origin main
```

No usar `git push --force` ni trabajar directamente sobre `main` cuando haya cambios compartidos.

## Nota de seguridad

El proyecto utiliza hashes para las contraseñas, pero no implementa JWT ni protección real de endpoints por rol. Esta limitación es intencional para mantener el alcance académico y debe considerarse antes de utilizar el sistema fuera de una demostración.
