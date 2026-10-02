# Verificación de la entrega · 2 de octubre de 2026

Versión Android `0.1.0-piloto`, applicationId `co.repelon.finca`, versionCode 1, Android 8+ (API 26), target API 35.

## Comprobaciones realizadas

- `npm test`: 17 pruebas aprobadas; ninguna omitida. Cubren atribución conservadora por palma, ambigüedad, huecos/reinicios, precisión, puntos antiguos/simulados, requisitos del piloto, pesajes compatibles, balance de recursos, idempotencia, ramas y resolución de conflictos, esquema de importación, CSV y cifrado autenticado.
- `npm run build`: compilación de producción satisfactoria. Recursos y tipografías locales; caché offline generada.
- `npm run test:browser`: nueve grupos de comprobación aprobados en Chromium. Creación y persistencia de tareas, revisión manual con evidencia, escrituras simultáneas desde dos pestañas, métodos de pesaje, unidades de cosecha separadas, copia/importación protegida, recarga y escritura sin conexión, separación de datos reales y de ejemplo, navegación móvil sin desbordamiento ni errores JavaScript.
- Inspección visual en 1440 px y 390 px. Las tablas amplias tienen desplazamiento propio.
- Revisión independiente: correcciones confirmadas para concurrencia, conflictos entre ramas y validación de paquetes.
- Android `:app:assembleRelease`: satisfactorio, incluyendo `lintVitalAnalyzeRelease` y `lintVitalRelease`, sin desactivar comprobaciones.
- APK alineada y firmada con una clave exclusiva del piloto. `apksigner verify --verbose`: válida con esquemas v2 y v3, un firmante.
- Comparación binaria: el HTML y cada recurso de la APK coinciden con la compilación web final.
- Inspección del manifiesto compilado: no solicita permiso de Internet. GPS y datos privados funcionan con recursos locales.

SHA-256 de `Finca-Repelon-piloto.apk`:

```text
f7e4c7881c5b17c1fbc009b492bb12aa2461d1a9bb3b3eb57f542182699cada0
```

## Validación pendiente en campo

No se ejecutó la APK en un teléfono físico ni en un emulador. La compilación y la firma no demuestran autonomía, precisión ni continuidad real de la captura.

Antes de habilitar permanencia por palma en la finca real, pruebe los modelos autorizados durante 8 horas, con pantalla bloqueada, vegetación y ubicación precisa. Registre batería inicial/final, huecos, precisión, pérdidas de señal, permisos, cierre forzado y reinicio; valide el inventario y apruebe el piloto en ajustes. La aplicación conserva interrupciones y exige reanudar explícitamente; no rellena huecos ni verifica tareas mediante GPS.

El navegador es complementario: su captura requiere la página visible. La sincronización entre equipos se realiza mediante archivos protegidos, sin servidor ni identidad criptográfica del emisor. Los responsables locales no constituyen roles autenticados. Esta entrega es un MVP para piloto, no aceptación integral de las historias H0–H5.
