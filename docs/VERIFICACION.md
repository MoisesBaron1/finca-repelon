# Verificación de la entrega · 2 de octubre de 2026

Versión Android `0.2.0-piloto`, applicationId `co.repelon.finca`, versionCode 2, Android 8+ (API 26), target API 35.

## Comprobaciones realizadas

- `npm test`: 17 pruebas aprobadas; ninguna omitida. Cubren atribución conservadora por palma, ambigüedad, huecos/reinicios, precisión, puntos antiguos/simulados, requisitos del piloto, pesajes compatibles, balance de recursos, idempotencia, ramas y resolución de conflictos, esquema de importación, CSV y cifrado autenticado.
- `npm run build`: compilación de producción satisfactoria. Recursos y tipografías locales; caché offline generada.
- `npm run test:browser`: once grupos de comprobación aprobados en Chromium. Inicio simplificado; registros por pasos; validación y foco del error; revisión antes de guardar; retroceso sin pérdida de datos; protección al cerrar, incluido el botón Atrás nativo; confirmación de guardado; revisión manual con evidencia; escrituras simultáneas desde dos pestañas; métodos de pesaje; unidades de cosecha separadas; copia/importación protegida; inicio y fin explícito de jornada en navegador; recarga y escritura sin conexión; separación de datos reales y de ejemplo; navegación móvil; aumento de letra persistente y adaptación a 320, 390 y 720 px sin desbordamiento ni errores JavaScript.
- Axe, reglas WCAG A/AA: sin incidencias en Inicio de escritorio, revisión de tarea, Inicio móvil, revisión de pesaje móvil y lista de ganado móvil. Es una comprobación automática de esos estados, no una certificación de accesibilidad de toda la aplicación.
- Inspección visual en 1440 px y 390 px. Las tablas amplias tienen desplazamiento propio.
- Revisión independiente de la entrega inicial: correcciones confirmadas para concurrencia, conflictos entre ramas y validación de paquetes. Las reglas se conservan y las 17 pruebas se ejecutaron de nuevo en 0.2.0.
- Android `:app:assembleRelease`: satisfactorio, incluyendo `lintVitalAnalyzeRelease` y `lintVitalRelease`, sin desactivar comprobaciones.
- APK alineada y firmada con una clave exclusiva del piloto. `apksigner verify --verbose`: válida con esquemas v2 y v3, un firmante.
- Se comprobó que el certificado coincide con el de la versión anterior. Se mantiene el identificador, se aumenta versionCode y no se cambia el esquema SQLite. No se probó la instalación de la actualización en un dispositivo físico.
- Comparación binaria: el HTML y cada recurso de la APK coinciden con la compilación web final.
- Inspección del manifiesto compilado: no solicita permiso de Internet. GPS y datos privados funcionan con recursos locales.

SHA-256 de `Finca-Repelon-piloto.apk`:

```text
a4e89df42fdfb6cae9383925226f280158fccb797b3e526377ae4aa9f45d5605
```

## Validación pendiente en campo

No se ejecutó la APK en un teléfono físico ni en un emulador. La compilación y la firma no demuestran autonomía, precisión ni continuidad real de la captura.

No se realizó un estudio de usabilidad con personas mayores. La revisión visual y las pruebas de interacción cubren los cambios de esta entrega; la comprensión y comodidad con los trabajadores reales deben observarse durante el piloto.

Antes de habilitar permanencia por palma en la finca real, pruebe los modelos autorizados durante 8 horas, con pantalla bloqueada, vegetación y ubicación precisa. Registre batería inicial/final, huecos, precisión, pérdidas de señal, permisos, cierre forzado y reinicio; valide el inventario y apruebe el piloto en ajustes. La aplicación conserva interrupciones y exige reanudar explícitamente; no rellena huecos ni verifica tareas mediante GPS.

El navegador es complementario: su captura requiere la página visible. La sincronización entre equipos se realiza mediante archivos protegidos, sin servidor ni identidad criptográfica del emisor. Los responsables locales no constituyen roles autenticados. Esta entrega es un MVP para piloto, no aceptación integral de las historias H0–H5.
