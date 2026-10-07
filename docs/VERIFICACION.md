# Verificación de la versión 0.3.0 · 7 de octubre de 2026

Android `0.3.0-piloto`, applicationId `co.repelon.finca`, versionCode 4, Android 8+ (API 26), target API 35. Recursos web compilados para Chrome 80; la compatibilidad se simuló en Chromium actual, no en un motor Chrome 80 real.

## Comprobaciones realizadas

- `npm test`: 53 pruebas aprobadas, ninguna omitida. Cubren GPS conservador, pesos, unidades, CSV, cifrado, copias v1 anteriores, fechas y tipos inválidos, orden causal, ramas, resoluciones y duplicados con distinto orden de claves JSON. También comprueban guardas para cambios desactualizados, restauración de fincas, saldos decimales y una única jornada en curso por espacio.
- `npm run build`: compilación satisfactoria. El comando genera la caché offline de 18 recursos; no descarga videos ni APK al precargar la app.
- `npm run test:browser`: 12 grupos aprobados. Inicio, formularios, validación, revisión manual, dos pestañas, ganado, cosechas, copias, jornadas, guardado y recarga offline, espacios separados y navegación móvil. Adaptación a 320, 390 y 720 px.
- `npm run test:hardening`: 7 recorridos aprobados. Error de almacenamiento y reintento al reportar una tarea; quitar una foto; abrir otra pestaña durante la jornada; crear el primer animal y continuar con el pesaje; configuración desactualizada; resolución de conflictos producidos por 0.2.1; corrección de pesajes conservando su identidad.
- `npm run test:compatibility`: 3 grupos aprobados con `toSorted`, `toReversed`, `at` y `crypto.randomUUID` ausentes antes del arranque. Inicio, UUID criptográfico, guardado persistente, tareas, ganado, jornadas, informes y fechas en español.
- Axe, reglas WCAG A/AA: sin incidencias en las superficies verificadas de Inicio, revisión de tarea, Inicio móvil, revisión de pesaje y ganado móvil. Es una comprobación automática, no una certificación completa de accesibilidad.
- `node scripts/verify-promo.mjs`: guía en español, WCAG AA, 320/390/1280 px, cuatro descargas válidas y reproducción H.264/AAC del video HyperFrames de 71 segundos.
- Revisión independiente del código: encontró una guarda incompatible con metadatos antiguos en la resolución de conflictos. Se corrigió con un snapshot explícito de la versión vigente; la regresión falló antes y pasó después. Sin otros problemas críticos o importantes reportados en el alcance revisado.
- Android `:app:assembleRelease`: satisfactorio, incluyendo lint vital. APK alineada y firma v2/v3 válida, un firmante; certificado idéntico al piloto anterior. El identificador y el esquema SQLite se conservan, versionCode aumenta a 4.
- Comparación binaria: el HTML y los 12 recursos de la APK coinciden con la compilación web final. El manifiesto no solicita permiso de Internet.
- Manual de uso en español actualizado a 0.3.0, cinco páginas de letras grandes. La guía promocional y el video siguen cubriendo el recorrido de anotación vigente.

SHA-256 de `Finca-Repelon-piloto.apk`:

```text
b16dc4dfbf644fc5e269948acc81ac8702bafdbdc53c20c051fc29c83ea51129
```

## Validación pendiente en campo

No se ejecutó la APK en un teléfono físico ni en un emulador. La compilación y la firma no demuestran autonomía, precisión ni continuidad real de la captura. Tampoco se realizó un estudio de usabilidad con personas mayores; hay que observar la comprensión y comodidad de los trabajadores reales durante el piloto.

Antes de habilitar permanencia por palma en la finca real, pruebe los modelos autorizados durante 8 horas con pantalla bloqueada, vegetación y ubicación precisa. Registre batería, huecos, precisión, pérdidas de señal, permisos, cierre forzado y reinicio; valide el inventario y apruebe el piloto en ajustes. Los huecos no se rellenan y el GPS no verifica tareas.

El navegador captura ubicación con la página visible. La transferencia entre equipos usa archivos protegidos, sin servidor ni identidad criptográfica del emisor. Los responsables locales no son roles autenticados. La entrega sigue siendo un MVP gratuito para piloto, no aceptación integral de H0–H5.
