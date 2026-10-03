# Finca Repelón · MVP gratuito

Gestión local de tareas, palmas y jornadas, ganado, plátano, recursos y movimientos básicos de dinero. Android captura ubicación con un servicio Kotlin; el navegador es una interfaz complementaria y solo captura GPS mientras permanece visible. Todo el código y las dependencias se pueden usar sin contratar servicios. El código propio se entrega bajo licencia MIT: no exige suscripción ni servidor para esta etapa.

## Probar

Abre el panel entregado o instala `Finca-Repelon-piloto.apk` en Android 8 o superior. La primera pantalla contiene **datos de ejemplo**. Usa «Datos de ejemplo → Usar mi finca» para empezar con inventarios reales separados.

La versión 0.2.0 simplifica la interfaz para personas mayores: cuatro acciones en Inicio, letras grandes, ayuda integrada, registros por pasos y protección al salir sin guardar. En Ayuda puedes aumentar más el texto; la app recuerda esa elección. El APK mantiene la misma firma e identificador y aumenta versionCode, para poder actualizar la instalación anterior sin desinstalarla.

La versión 0.2.1 corrige la apertura de Informes y traduce los tipos del historial al español. Incluye la APK actualizada con versionCode 3 y la misma firma del piloto.

1. Configura nombre, área y responsables en Datos y ajustes.
2. Añade palmas manualmente o importa el CSV. Valida coordenadas en terreno.
3. Registra animales, lotes y recursos. El inventario comienza con movimientos de entrada.
4. Crea tareas. En Android, permite ubicación precisa e inicia una jornada con la app abierta.
5. Finaliza y revisa el recorrido. Verificar una tarea exige una revisión explícita con evidencia.
6. Crea una copia protegida y guárdala fuera del dispositivo; importa el archivo en otro equipo usando la misma contraseña.

El navegador funciona offline después de completar la primera descarga. Para la jornada con pantalla bloqueada utiliza la APK, que contiene todos sus recursos locales y no requiere conexión.

La página `/guia-promocional/` contiene un video vertical de 71 segundos creado con HyperFrames, una versión ligera para WhatsApp, la guía PDF y las descargas del piloto. La configuración y los pasos para publicar gratuitamente en Vercel están en [docs/VERCEL.md](docs/VERCEL.md). Cambiar de enlace requiere traer una copia protegida de los datos del navegador anterior.

## Desarrollo y verificación

Requisitos web: Node 22 o 24 y npm. Requisitos Android: JDK 17 o 21 con compilador, SDK plataforma 35 y build-tools 35.0.0.

```sh
npm ci
npm test
npm run build
node scripts/create-sw.mjs
npm run dev
```

Los tests de navegador necesitan servir la compilación en `http://127.0.0.1:5173`:

```sh
npx playwright install chromium
python -m http.server 5173 --directory dist
npm run test:browser
```

La APK se construye con los recursos ya compilados. Desde la raíz:

```sh
node scripts/sync-android.mjs
cd android
./gradlew :app:assembleDebug
```

Define `ANDROID_HOME` o crea `android/local.properties` con `sdk.dir=/ruta/al/android-sdk`. La compilación release produce una APK sin firma; usa una clave custodiada y `zipalign`/`apksigner` como se describe en `docs/ANDROID.md`. El repositorio no incluye claves ni contraseñas.

## Arquitectura

- `src/domain.mjs`: reglas GPS conservadoras, pesos, unidades, eventos/versiones y CSV.
- `src/storage.mjs`: transacciones IndexedDB, puente SQLite y copias AES-GCM/PBKDF2 con SHA-256.
- `src/farm.jsx`: acciones compartidas, historial, inicio/final y recepción local.
- `src/seed.mjs`: inventario de ejemplo inmutable entre instalaciones, separado del espacio real.
- `src/pages.jsx`, `src/Forms.jsx`: interfaz y flujos de trabajo.
- `android/app/src/main/java/co/repelon/finca`: WebView con recursos privados, SQLite y servicio nativo GPS.

El contrato de transferencia está en `docs/CONTRATO.md`; la matriz y los límites de aceptación están en `docs/ALCANCE.md` y `docs/VERIFICACION.md`.

## Límites del piloto

Sin servidor, sincronización automática, roles autenticados, diagnóstico veterinario automático ni certificación por GPS. Transferencia manual por archivo protegido. Datos confirmados hasta 40 MiB por espacio y paquetes hasta 75 MiB, incluyendo Base64 y fotografías. La contraseña cifra e íntegra el paquete, pero no identifica criptográficamente a su emisor. Android limita reinicios y cierres forzados; se requiere reanudación explícita y los huecos no se rellenan.

La precisión por palma y autonomía de 8 horas requieren un piloto físico antes de habilitar el control individual. No se dispone de un teléfono real en este entorno. Es una entrega de MVP, no la aceptación integral H0–H5 de la épica.
