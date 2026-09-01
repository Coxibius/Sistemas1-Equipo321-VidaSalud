param(
    [string]$BaseUrl = "http://localhost:5237/api"
)

$ErrorActionPreference = "Stop"
$resultados = [System.Collections.Generic.List[object]]::new()
$usuarioTemporalId = $null
$usuarioTemporalNombre = "smokeqa$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"

function Invoke-Api {
    param(
        [Parameter(Mandatory)] [string]$Metodo,
        [Parameter(Mandatory)] [string]$Ruta,
        [object]$Cuerpo,
        [hashtable]$Headers = @{}
    )

    $parametros = @{
        Uri = "$BaseUrl$Ruta"
        Method = $Metodo
        Headers = $Headers
    }

    $parametrosInvokeWebRequest = (Get-Command Invoke-WebRequest).Parameters
    if ($parametrosInvokeWebRequest.ContainsKey("SkipHttpErrorCheck")) {
        $parametros.SkipHttpErrorCheck = $true
    }
    if ($parametrosInvokeWebRequest.ContainsKey("UseBasicParsing")) {
        $parametros.UseBasicParsing = $true
    }

    if ($null -ne $Cuerpo) {
        $parametros.ContentType = "application/json"
        $json = $Cuerpo | ConvertTo-Json -Depth 6
        $parametros.Body = [System.Text.Encoding]::UTF8.GetBytes($json)
    }

    try {
        $respuesta = Invoke-WebRequest @parametros
        $status = [int]$respuesta.StatusCode
        $contenido = $respuesta.Content
    }
    catch [System.Net.WebException] {
        $respuestaError = $_.Exception.Response
        if ($null -eq $respuestaError) {
            throw
        }

        $status = [int]$respuestaError.StatusCode
        $lector = [System.IO.StreamReader]::new($respuestaError.GetResponseStream())
        try {
            $contenido = $lector.ReadToEnd()
        }
        finally {
            $lector.Dispose()
        }
    }

    $datos = $null
    if (-not [string]::IsNullOrWhiteSpace($contenido)) {
        $datos = $contenido | ConvertFrom-Json
    }

    return [PSCustomObject]@{
        Status = $status
        Data = $datos
    }
}

function Add-Resultado {
    param(
        [string]$Historia,
        [string]$Prueba,
        [bool]$Cumple,
        [string]$Detalle
    )

    $resultados.Add([PSCustomObject]@{
        HU = $Historia
        Prueba = $Prueba
        Resultado = if ($Cumple) { "OK" } else { "FALLO" }
        Detalle = $Detalle
    })

    if (-not $Cumple) {
        throw "Prueba fallida: $Historia - $Prueba. $Detalle"
    }
}

try {
    $health = Invoke-Api -Metodo GET -Ruta "/health"
    Add-Resultado "Infra" "API disponible" ($health.Status -eq 200 -and $health.Data.status -eq "ok") "HTTP $($health.Status)"

    $loginAdmin = Invoke-Api -Metodo POST -Ruta "/auth/login" -Cuerpo @{
        usuario = "admin"
        contrasena = "admin123"
    }
    Add-Resultado "HU05" "Login valido" ($loginAdmin.Status -eq 200 -and $loginAdmin.Data.rol -eq "ADMINISTRADOR") "HTTP $($loginAdmin.Status)"

    $loginInvalido = Invoke-Api -Metodo POST -Ruta "/auth/login" -Cuerpo @{
        usuario = "admin"
        contrasena = "incorrecta"
    }
    Add-Resultado "HU05" "Login invalido rechazado" ($loginInvalido.Status -eq 401) "HTTP $($loginInvalido.Status)"

    $productos = Invoke-Api -Metodo GET -Ruta "/productos"
    Add-Resultado "HU02" "Listado general" ($productos.Status -eq 200 -and $productos.Data.Count -gt 0) "$($productos.Data.Count) productos"

    $busqueda = Invoke-Api -Metodo GET -Ruta "/productos?search=Paraceta"
    $coincide = @($busqueda.Data | Where-Object { $_.nombre -like "*Paraceta*" }).Count -gt 0
    Add-Resultado "HU02" "Busqueda parcial" ($busqueda.Status -eq 200 -and $coincide) "$($busqueda.Data.Count) coincidencia(s)"

    $nombreProducto = "Producto Prueba Demo Day"
    $productoExistente = @(($productos.Data) | Where-Object { $_.nombre -eq $nombreProducto } | Select-Object -First 1)
    if ($productoExistente.Count -eq 0) {
        $categoria = ($productos.Data | Select-Object -First 1).categoria
        $productoCreado = Invoke-Api -Metodo POST -Ruta "/productos" -Cuerpo @{
            nombre = $nombreProducto
            categoria = $categoria
            precio = 15.75
            cantidad = 20
            fechaVencimiento = "2027-12-31"
            responsable = "admin"
        }
        Add-Resultado "HU01" "Registro de producto" ($productoCreado.Status -eq 201) "HTTP $($productoCreado.Status)"
        $productoPrueba = $productoCreado.Data
    }
    else {
        $productoPrueba = $productoExistente[0]
        Add-Resultado "HU01" "Producto de prueba disponible" $true "Registro reutilizado"
    }

    $duplicado = Invoke-Api -Metodo POST -Ruta "/productos" -Cuerpo @{
        nombre = $nombreProducto
        categoria = $productoPrueba.categoria
        precio = 15.75
        cantidad = 20
        fechaVencimiento = "2027-12-31"
        responsable = "admin"
    }
    Add-Resultado "HU01" "Duplicado rechazado" ($duplicado.Status -eq 409 -and $duplicado.Data.code -eq "DUPLICATE_PRODUCT") "HTTP $($duplicado.Status)"

    $precioNegativo = Invoke-Api -Metodo POST -Ruta "/productos" -Cuerpo @{
        nombre = "Producto Precio Negativo QA"
        categoria = $productoPrueba.categoria
        precio = -1
        cantidad = 1
        fechaVencimiento = "2027-12-31"
        responsable = "admin"
    }
    Add-Resultado "HU01" "Precio negativo rechazado" ($precioNegativo.Status -eq 400) "HTTP $($precioNegativo.Status)"

    $entrada = Invoke-Api -Metodo POST -Ruta "/movimientos" -Cuerpo @{
        productoId = $productoPrueba.id
        tipo = "ENTRADA"
        cantidad = 5
        responsable = "admin"
    }
    Add-Resultado "HU03" "Entrada de inventario" ($entrada.Status -eq 201) "HTTP $($entrada.Status)"

    $salida = Invoke-Api -Metodo POST -Ruta "/movimientos" -Cuerpo @{
        productoId = $productoPrueba.id
        tipo = "SALIDA"
        cantidad = 3
        responsable = "admin"
    }
    Add-Resultado "HU03" "Salida valida" ($salida.Status -eq 201) "HTTP $($salida.Status)"

    $salidaExcesiva = Invoke-Api -Metodo POST -Ruta "/movimientos" -Cuerpo @{
        productoId = $productoPrueba.id
        tipo = "SALIDA"
        cantidad = 999999
        responsable = "admin"
    }
    Add-Resultado "HU03" "Stock insuficiente rechazado" ($salidaExcesiva.Status -eq 400 -and $salidaExcesiva.Data.code -eq "INSUFFICIENT_STOCK") "HTTP $($salidaExcesiva.Status)"

    $alertas = Invoke-Api -Metodo GET -Ruta "/vencimientos/alertas"
    $estadosAlerta = @($alertas.Data | ForEach-Object { $_.estadoVencimiento })
    $contieneAlerta = @($estadosAlerta | Where-Object { $_ -in @("VENCIDO", "PROXIMO_A_VENCER") }).Count -gt 0
    Add-Resultado "HU04" "Alertas calculadas" ($alertas.Status -eq 200 -and $contieneAlerta) "$($alertas.Data.Count) alerta(s)"

    $usuariosAntes = Invoke-Api -Metodo GET -Ruta "/usuarios"

    $usuarioCreado = Invoke-Api -Metodo POST -Ruta "/usuarios" -Headers @{ "X-Actor" = "admin" } -Cuerpo @{
        nombre = "Usuario Temporal QA"
        usuario = $usuarioTemporalNombre
        email = "$usuarioTemporalNombre@vidasalud.demo"
        rol = "AUXILIAR"
        contrasena = "smoke123"
    }
    $usuarioTemporalId = $usuarioCreado.Data.id
    Add-Resultado "HU06" "Crear usuario" ($usuarioCreado.Status -eq 201 -and $null -ne $usuarioTemporalId) "Id $usuarioTemporalId"

    $usuarioEditado = Invoke-Api -Metodo PUT -Ruta "/usuarios/$usuarioTemporalId" -Headers @{ "X-Actor" = "admin" } -Cuerpo @{
        nombre = "Usuario QA Actualizado"
        usuario = $usuarioTemporalNombre
        email = "actualizado.$usuarioTemporalNombre@vidasalud.demo"
        rol = "ENCARGADO"
    }
    Add-Resultado "HU06" "Editar usuario y rol" ($usuarioEditado.Status -eq 200 -and $usuarioEditado.Data.rol -eq "ENCARGADO") "Rol $($usuarioEditado.Data.rol)"

    $admin = $usuariosAntes.Data | Where-Object { $_.usuario -eq "admin" } | Select-Object -First 1
    $borrarAdmin = Invoke-Api -Metodo DELETE -Ruta "/usuarios/$($admin.id)" -Headers @{ "X-Actor" = "admin" }
    Add-Resultado "HU06" "Administrador protegido" ($borrarAdmin.Status -eq 400 -and $borrarAdmin.Data.code -eq "ADMIN_PROTECTED") "HTTP $($borrarAdmin.Status)"

    $perfil = Invoke-Api -Metodo GET -Ruta "/usuarios/$usuarioTemporalId"
    Add-Resultado "HU07" "Consultar datos propios" ($perfil.Status -eq 200 -and $perfil.Data.usuario -eq $usuarioTemporalNombre) "HTTP $($perfil.Status)"

    $perfilActualizado = Invoke-Api -Metodo PUT -Ruta "/usuarios/$usuarioTemporalId/perfil" -Headers @{ "X-Actor" = $usuarioTemporalNombre } -Cuerpo @{
        nombre = "Usuario QA Perfil"
        email = "perfil.$usuarioTemporalNombre@vidasalud.demo"
    }
    Add-Resultado "HU07" "Rectificar datos" ($perfilActualizado.Status -eq 200 -and $perfilActualizado.Data.nombre -eq "Usuario QA Perfil") "HTTP $($perfilActualizado.Status)"

    $solicitud = Invoke-Api -Metodo POST -Ruta "/solicitudes-baja" -Cuerpo @{
        usuarioId = $usuarioTemporalId
        motivo = "Prueba controlada del Demo Day"
    }
    Add-Resultado "HU07" "Solicitar baja" ($solicitud.Status -eq 201 -and $solicitud.Data.estado -eq "PENDIENTE") "Solicitud $($solicitud.Data.id)"

    $resolucion = Invoke-Api -Metodo PUT -Ruta "/solicitudes-baja/$($solicitud.Data.id)/resolver" -Cuerpo @{
        estado = "APROBADA"
        resueltaPor = "admin"
    }
    Add-Resultado "HU07" "Aprobar baja" ($resolucion.Status -eq 200 -and $resolucion.Data.estado -eq "APROBADA") "HTTP $($resolucion.Status)"

    $loginInactivo = Invoke-Api -Metodo POST -Ruta "/auth/login" -Cuerpo @{
        usuario = $usuarioTemporalNombre
        contrasena = "smoke123"
    }
    Add-Resultado "HU07" "Cuenta inactiva bloqueada" ($loginInactivo.Status -eq 403 -and $loginInactivo.Data.code -eq "ACCOUNT_INACTIVE") "HTTP $($loginInactivo.Status)"

    $auditoria = Invoke-Api -Metodo GET -Ruta "/auditoria?limite=100"
    $acciones = @($auditoria.Data | ForEach-Object { $_.accion })
    $accionesEsperadas = @("CREAR_PRODUCTO", "REGISTRAR_ENTRADA", "REGISTRAR_SALIDA", "CREAR_USUARIO", "ACTUALIZAR_PERFIL", "SOLICITAR_BAJA", "APROBAR_BAJA")
    $faltantes = @($accionesEsperadas | Where-Object { $_ -notin $acciones })
    Add-Resultado "Auditoria" "Acciones criticas persistentes" ($auditoria.Status -eq 200 -and $faltantes.Count -eq 0) "Faltantes: $($faltantes -join ', ')"
}
finally {
    if ($null -ne $usuarioTemporalId) {
        $eliminado = Invoke-Api -Metodo DELETE -Ruta "/usuarios/$usuarioTemporalId" -Headers @{ "X-Actor" = "admin" }
        Add-Resultado "HU06" "Baja logica de usuario" ($eliminado.Status -eq 204) "HTTP $($eliminado.Status)"

        $perfilOculto = Invoke-Api -Metodo GET -Ruta "/usuarios/$usuarioTemporalId"
        Add-Resultado "HU06" "Usuario eliminado oculto por id" ($perfilOculto.Status -eq 404) "HTTP $($perfilOculto.Status)"

        $usuariosFinales = Invoke-Api -Metodo GET -Ruta "/usuarios"
        $sigueVisible = @($usuariosFinales.Data | Where-Object { $_.usuario -eq $usuarioTemporalNombre }).Count -gt 0
        Add-Resultado "HU06" "Usuario eliminado oculto del listado" (-not $sigueVisible) "$($usuariosFinales.Data.Count) usuarios visibles"

        $loginEliminado = Invoke-Api -Metodo POST -Ruta "/auth/login" -Cuerpo @{
            usuario = $usuarioTemporalNombre
            contrasena = "smoke123"
        }
        Add-Resultado "HU06" "Usuario eliminado no inicia sesion" ($loginEliminado.Status -eq 401) "HTTP $($loginEliminado.Status)"

        $solicitudesFinales = Invoke-Api -Metodo GET -Ruta "/solicitudes-baja"
        $historialConRelacion = @($solicitudesFinales.Data | Where-Object {
            $_.usuario -eq $usuarioTemporalNombre -and $_.usuarioId -eq $usuarioTemporalId
        }).Count -gt 0
        Add-Resultado "Integridad" "Baja logica conserva relacion historica" $historialConRelacion "UsuarioId $usuarioTemporalId conservado"
    }
}

$resultados | Format-Table -AutoSize
"TOTAL_PRUEBAS=$($resultados.Count)"
"TOTAL_OK=$(@($resultados | Where-Object { $_.Resultado -eq 'OK' }).Count)"
