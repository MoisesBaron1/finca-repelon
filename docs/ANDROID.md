# Instalación y captura Android

La APK piloto firmada se entrega fuera de Play Store, sin cuota de publicación. Descárgala, permite temporalmente instalar desde el navegador/gestor usado y abre Finca Repelón. El permiso de ubicación precisa se pide al iniciar una jornada. Android 13+ puede pedir permiso de notificaciones; concédelo para ver el indicador de captura.

Inicia la jornada con la app visible. El servicio usa LocationManager GPS_PROVIDER, solicita un punto cada 5 segundos y confirma cada punto en SQLite antes de notificar su recepción. Guarda hora UTC, precisión, proveedor, batería, secuencia, tiempo monotónico, arranque y marca de simulación. Un bloqueo parcial permite continuar la captura con pantalla apagada durante la jornada; su consumo aún debe medirse en los equipos reales.

Finalizar desde la pantalla o la notificación cierra la jornada. Android puede detener la app por batería, cierre forzado o reinicio: no se promete reinicio silencioso. Al volver se conserva la evidencia y se marca interrupción. Iniciar de nuevo crea un segmento/jornada explícita. Más de 60 s sin puntos genera diagnóstico; intervalos >15 s no suman permanencia. La captura por palma requiere inventario validado con referencia de hasta 5 m y piloto aprobado.

## Firma y actualización

Se generó una clave exclusiva de piloto, no una clave de producción. En el entorno de entrega la clave privada y su contraseña están en `/workspace/repelon-signing/finca-piloto.jks` y `/workspace/repelon-signing/piloto.password`, con permisos privados. No están en Git, en el sitio ni en el archivo de código fuente. El propietario debe custodiar ambos archivos fuera del sitio si quiere instalar actualizaciones sobre esta misma APK. No publique la contraseña.

Para reproducir una release y firmarla con una clave propia:

```sh
npm ci
npm run build
node scripts/sync-android.mjs
cd android
./gradlew :app:assembleRelease
```

Luego usa el SDK instalado:

```sh
zipalign -p -f 4 app/build/outputs/apk/release/app-release-unsigned.apk finca-aligned.apk
apksigner sign --ks /ruta/privada/clave.jks --ks-key-alias finca-piloto --ks-pass file:/ruta/privada/password --out Finca-Repelon-piloto.apk finca-aligned.apk
apksigner verify --verbose Finca-Repelon-piloto.apk
```

Una firma diferente exige desinstalar antes de instalar; desinstalar elimina los datos privados. Haga una copia y compruebe su importación antes de cambiar de firma o dispositivo. Aumente versionCode para una actualización y mantenga applicationId y la misma clave.
