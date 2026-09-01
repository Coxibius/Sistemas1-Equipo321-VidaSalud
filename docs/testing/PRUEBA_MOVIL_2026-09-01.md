# Verificación móvil y de red — 1 de septiembre de 2026

## Comprobaciones realizadas

- La API escucha en todas las interfaces mediante el perfil HTTP del backend.
- La IPv4 Wi-Fi observada durante la prueba fue `192.168.0.4`.
- `http://192.168.0.4:5237/api/health` respondió HTTP 200 desde la computadora.
- El frontend obtiene en ejecución la dirección del servidor de Expo y construye la URL de la
  API; no depende de una IP antigua escrita en el código.
- Expo web compiló después de limpiar la caché.
- La pantalla de acceso se revisó con un viewport móvil de `390 x 844` y no presentó cortes ni
  solapamientos.
- La dependencia de áreas seguras de Android quedó alineada con Expo SDK 54.

La IP puede cambiar al reconectar la computadora. Por eso no debe copiarse `192.168.0.4` al
código: Expo debe iniciarse de nuevo para publicar el host actual.

## Validación manual pendiente en el teléfono

Esta parte debe realizarse en el dispositivo que se llevará al stand:

1. Conectar computadora y teléfono a la misma red Wi-Fi y desactivar temporalmente la VPN.
2. Iniciar backend con `dotnet run --launch-profile http`.
3. Iniciar Expo con `npm start -- --lan --clear` y escanear el QR nuevo.
4. Abrir `http://IP_ACTUAL:5237/api/health` en el navegador del teléfono.
5. Iniciar sesión en Expo Go y recorrer Dashboard, Productos, Inventario y Vencimientos.
6. En Login, Registro de producto y Mi perfil, abrir y cerrar el teclado; comprobar que el campo
   activo y el botón principal siguen accesibles.
7. Comprobar que la barra inferior de Android no cubre botones ni contenido.
8. Tomar una captura como evidencia y guardarla junto al informe final.

Si el paso 4 falla, el problema no está en las credenciales: revisar el permiso de firewall de
.NET para redes privadas, aislamiento de clientes del router, VPN y que ambos equipos estén en la
misma subred.

## Criterio de salida

La prueba móvil queda cerrada cuando el teléfono responde al endpoint de salud, permite iniciar
sesión y completa una tarea con teclado sin interferencia de la barra de Android. La prueba web
responsive sirve como evidencia técnica complementaria, pero no sustituye esta comprobación
física.
