# Finca Repelón · Instrucciones para Claude

## Objetivo y estado

MVP gratuito de gestión de finca, en español, para personas mayores con poca experiencia tecnológica. La versión publicada es **0.3.0**. La app web y Android funcionan localmente; no hay backend, cuentas autenticadas ni sincronización automática. El repositorio incluye también el proyecto editable de HyperFrames en `promo/`.

- GitHub de destino: https://github.com/MoisesBaron1/finca-repelon (público, destino indicado por el propietario).
- App: https://temporary-spry-jasper-gs4cyvp.vercel.app
- Guía: https://temporary-spry-jasper-gs4cyvp.vercel.app/guia-promocional/
- Publicación verificada el 7 de octubre de 2026. No confundas resultados históricos con verificaciones nuevas.

Lee primero `README.md`, `docs/CONTINUAR-EN-CLAUDE.md`, `docs/CONTRATO.md`, `docs/ALCANCE.md` y `docs/VERIFICACION.md`. Para interfaz lee también `DESIGN.md` y `PRODUCT.md`. No necesitas el historial del chat para trabajar.

## Reglas del producto

1. Todo texto visible para el usuario debe estar en español. Conserva cuatro acciones grandes en Inicio, texto ampliable, pasos cortos, revisión antes de guardar y errores claros con reintento. Comprueba teléfonos de 320 y 390 px.
2. Mantén el funcionamiento offline y la separación entre datos de ejemplo y Mi finca. No añadas APIs de pago, suscripciones, dependencias de conexión ni un backend sin una petición explícita.
3. No borres ni reescribas el historial para corregir un registro. Conserva `entityId`, crea otra versión con su padre y comprueba la versión vigente dentro de la transacción. Los conflictos se resuelven explícitamente y las copias antiguas deben seguir siendo importables.
4. IndexedDB en web y SQLite en Android son fuentes locales de datos. Compartir el enlace no comparte anotaciones. El contrato cifrado `.finca` sigue en schema 1: AES-256-GCM y PBKDF2-SHA256 de 250.000 iteraciones.
5. El navegador captura GPS solo con la página visible. Android usa un servicio nativo. No infieras labores completadas a partir de ubicación ni rellenes huecos; no prometas ocho horas de autonomía o precisión por palma sin pruebas físicas.
6. Conserva el dominio Vercel: cambiar de origen cambia el almacenamiento del navegador. La publicación no constituye autorización permanente para futuros despliegues; atiende la petición vigente del propietario.
7. No subas `.env*`, `.vercel/`, claves Android, contraseñas, copias `.finca` ni datos reales. Las claves de firma deben mantenerse fuera de Git; otra firma impide actualizar la APK instalada sin desinstalar.

## Mapa del código

- `src/domain.mjs`: validación, eventos, materialización causal, conflictos, GPS, pesos, unidades y CSV.
- `src/records.mjs`: guardado e importación atómicos, control de cambios simultáneos y saldos.
- `src/storage.mjs`: IndexedDB, puente SQLite, cifrado y copias.
- `src/farm.jsx`: estado compartido, actualización entre pestañas y jornadas; `src/journey-lock.mjs`: bloqueo de captura entre pestañas.
- `src/easy-ui.jsx`, `src/Forms.jsx`, `src/components.jsx`, `src/pages.jsx`: formularios y pantallas.
- `src/compat.mjs`: fallbacks seguros para WebViews antiguos; debe importarse primero. Compilación objetivo Chrome 80.
- `src/photo.mjs`, `src/exports.mjs`: reducción de fotos e informes en español.
- `android/app/src/main/java/co/repelon/finca/`: WebView, SQLite y servicio GPS; applicationId `co.repelon.finca`, versionCode 4, Android 8+.
- `public/guia-promocional/` y `public/downloads/`: página y entregables publicados.
- `promo/`: composiciones, imágenes, audios, guion y herramientas HyperFrames 0.8.112. Lee sus instrucciones antes de modificar videos.

## Desarrollo y comprobaciones

Node 22 o 24. Desde la raíz:

```sh
npm ci
npm test
npm run build
npm run dev
```

Para comprobar offline usa la compilación, no solo el servidor de desarrollo. En una terminal:

```sh
npx playwright install chromium
python3 -m http.server 5173 --bind 127.0.0.1 --directory dist
```

En otra terminal, desde la raíz:

```sh
npm run test:browser
npm run test:hardening
npm run test:compatibility
```

Compatibilidad usa `/usr/bin/chromium` por defecto; define `CHROMIUM_PATH` con la ruta a Chrome/Chromium si es distinta. La prueba promocional necesita un navegador con H.264/AAC: `PROMO_BROWSER_PATH=/ruta/a/chrome node scripts/verify-promo.mjs`.

Tras cambios Android: `npm run build`, `node scripts/sync-android.mjs` y, desde `android/`, `./gradlew :app:assembleDebug`. Requiere JDK 17/21, SDK 35 y build-tools 35.0.0. Consulta `docs/ANDROID.md` para firma y actualización.

## Forma de trabajar

- Identifica el flujo afectado antes de editar. Para un bug, reproduce el problema y añade una regresión significativa cuando corresponda.
- Haz cambios pequeños y revisables. No rediseñes ni migres almacenamiento solo para modernizar el código.
- Ejecuta las comprobaciones pertinentes y comunica sus resultados reales. Si una prueba no pudo ejecutarse, indícalo.
- Revisa `git diff --check` y el diff antes de hacer commit. No hagas force push ni sobrescribas cambios del propietario.
- Pendientes reales: piloto GPS de ocho horas en teléfonos físicos, pruebas con personas mayores y WebViews antiguos reales. Las 53 pruebas unitarias y los 22 grupos de navegador históricos no sustituyen esas pruebas.
