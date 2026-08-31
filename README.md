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

- `ADMINISTRADOR`: puede acceder al módulo de gestión de usuarios.
- `ENCARGADO`: puede operar productos, inventario y vencimientos.
- `AUXILIAR`: puede operar los módulos generales del inventario.

La sesión del proyecto es académica y no utiliza JWT. El frontend conserva al usuario únicamente mientras la aplicación permanece abierta. La restricción del módulo administrativo es visual; la API todavía no implementa autorización criptográfica por rol.

## Cuentas iniciales

La migración de usuarios crea estas cuentas de demostración:

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Auxiliar | `victor` | `victor123` |
| Encargado | `maria` | `maria123` |

Estas credenciales son exclusivamente para la presentación académica.

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

La migración crea las tablas, categorías iniciales y las tres cuentas de demostración.

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

1. Consultar la dirección IPv4 de la computadora con `ipconfig`.
2. Actualizar la dirección móvil en `frontend/services/api.ts`.
3. Iniciar la API escuchando conexiones de la red local:

```powershell
cd backend\VidaSalud.Api
dotnet run --urls http://0.0.0.0:5237
```

4. Iniciar Expo:

```powershell
cd frontend
npm start
```

Puede ser necesario permitir el puerto `5237` en el firewall de Windows.

## Endpoints principales

| Método | Ruta | Función |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Validar credenciales sin generar token |
| `GET` | `/api/productos` | Listar o buscar productos |
| `POST` | `/api/productos` | Registrar producto y lote inicial |
| `POST` | `/api/movimientos` | Registrar entrada o salida |
| `GET` | `/api/vencimientos/alertas` | Consultar alertas de vencimiento |
| `GET` | `/api/usuarios` | Listar usuarios sin contraseñas |
| `POST` | `/api/usuarios` | Registrar usuario |
| `PUT` | `/api/usuarios/{id}` | Editar usuario o cambiar contraseña |
| `DELETE` | `/api/usuarios/{id}` | Eliminar usuario no administrador |

Hay ejemplos adicionales en `backend/VidaSalud.Api/VidaSalud.Api.http`.

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

## Estructura principal

```text
Sistemas1-Equipo321-VidaSalud/
├── .bck-nd/requirements/       Historias HU01-HU06
├── backend/VidaSalud.Api/      API ASP.NET Core y migraciones
├── frontend/                   Aplicación Expo/React Native
└── docs/                       Diagramas y documentación académica
```

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
