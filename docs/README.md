# Documentación final — VidaSalud

Este índice separa la evidencia vigente del MVP de los diagramas históricos elaborados durante
los sprints.

## Evidencia principal para el Demo Day

1. [PRD](../PRD.md): problema, ODS, objetivos SMART, alcance, reglas y seguridad.
2. [Árbol de Problemas](analysis/ARBOL_PROBLEMAS.png): causas, problema central y efectos.
3. [Matriz de trazabilidad](TRAZABILIDAD.md): causa → HU → pantalla → regla → tabla.
4. [UML final](uml/final/README.md): clases y secuencias HU01–HU07 en PNG y PlantUML.
5. [Diccionario de datos](database/DICCIONARIO_DATOS.md): campos, claves, restricciones y 3FN.
6. [Esquema SQL implementado](database/ESQUEMA_IMPLEMENTADO.sql): referencia alineada con EF.
7. [Prueba de usabilidad](usability/PRUEBA_USABILIDAD.md): protocolo y tabla para resultados reales.
8. [Guía del Demo Day](DEMO_DAY.md): pitch, recorrido, defensa y checklist.
9. [Actualizaciones del Informe Final](ACTUALIZACIONES_INFORME_FINAL.md): contenido que debe
   incorporarse al PDF de cierre.
10. [Smoke test integral](testing/SMOKE_TEST_2026-09-01.md): evidencia reproducible de HU01–HU07.
11. [Verificación móvil](testing/PRUEBA_MOVIL_2026-09-01.md): red, responsive y checklist físico.
12. [Plan de capturas](CAPTURAS_DEMO_DAY.md): imágenes esenciales, nombres y pies sugeridos.
13. [Ensayo operativo](ENSAYO_DEMO_DAY.md): pitch de 3 minutos, demo y defensa técnica.
14. [Cierre de GitHub](CIERRE_GITHUB.md): commit, Pull Request, actualización y Moodle.

## Documentación histórica

- `uml/HU01` a `uml/HU04`: diagramas elaborados en sus respectivos sprints.
- `database/Farmacia_BaseDatos.sql`: propuesta SQL original, marcada como histórica.
- `design/`: wireframes y navegación inicial.

Cuando exista diferencia entre un archivo histórico y el código actual, la defensa debe utilizar
`uml/final`, `DICCIONARIO_DATOS.md`, `ESQUEMA_IMPLEMENTADO.sql`, las migraciones de EF y el PRD.

## Pendiente de evidencia humana

La plantilla de usabilidad no debe presentarse como resultado hasta que dos o tres participantes
realicen las tareas y se completen tiempos, observaciones y capturas sin datos personales reales.
