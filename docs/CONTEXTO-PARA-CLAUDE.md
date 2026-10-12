# Finca Repelón · Contexto para continuar en Claude

Versión de la app: 0.3.0. Repositorio: https://github.com/MoisesBaron1/finca-repelon.

Este archivo reúne instrucciones y documentación; no contiene el código completo ni credenciales. Los resultados de pruebas que aparecen tienen sus propias fechas y deben repetirse cuando corresponda. Para modificar código usa el repositorio local con Claude Code, conecta GitHub si tu cuenta lo admite o adjunta los archivos afectados.

Se regenera desde la raíz con `npm run prepare:claude`.

---

## Documento: CLAUDE.md

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

---

## Documento: README.md

# Finca Repelón · MVP gratuito

Gestión local de tareas, palmas y jornadas, ganado, plátano, recursos y movimientos básicos de dinero. Android captura ubicación con un servicio Kotlin; el navegador es una interfaz complementaria y solo captura GPS mientras permanece visible. Todo el código y las dependencias se pueden usar sin contratar servicios. El código propio se entrega bajo licencia MIT: no exige suscripción ni servidor para esta etapa.

## Probar

La app está publicada en [Vercel](https://temporary-spry-jasper-gs4cyvp.vercel.app). La [guía promocional](https://temporary-spry-jasper-gs4cyvp.vercel.app/guia-promocional/) reúne el video de HyperFrames, el PDF y las descargas Android.

Abre el panel entregado o instala `Finca-Repelon-piloto.apk` en Android 8 o superior. La primera pantalla contiene **datos de ejemplo**. Usa «Datos de ejemplo → Usar mi finca» para empezar con inventarios reales separados.

La versión 0.2.0 simplifica la interfaz para personas mayores: cuatro acciones en Inicio, letras grandes, ayuda integrada, registros por pasos y protección al salir sin guardar. En Ayuda puedes aumentar más el texto; la app recuerda esa elección. El APK mantiene la misma firma e identificador y aumenta versionCode, para poder actualizar la instalación anterior sin desinstalarla.

La versión 0.3.0 amplía los formularios por pasos, guía el primer animal, lote o recurso y permite corregir pesajes, cosechas e inventario sin duplicarlos. Protege cambios simultáneos y copias de otras fincas, reduce las fotos y mejora la compatibilidad con teléfonos antiguos. La APK conserva la firma del piloto y usa versionCode 4.

1. Configura nombre, área y responsables en Datos y ajustes.
2. Añade palmas manualmente o importa el CSV. Valida coordenadas en terreno.
3. Registra animales, lotes y recursos. El inventario comienza con movimientos de entrada.
4. Crea tareas. En Android, permite ubicación precisa e inicia una jornada con la app abierta.
5. Finaliza y revisa el recorrido. Verificar una tarea exige una revisión explícita con evidencia.
6. Crea una copia protegida y guárdala fuera del dispositivo; importa el archivo en otro equipo usando la misma contraseña.

El navegador funciona offline después de completar la primera descarga. Para la jornada con pantalla bloqueada utiliza la APK, que contiene todos sus recursos locales y no requiere conexión.

La página `/guia-promocional/` contiene un video vertical de 71 segundos creado con HyperFrames, una versión ligera para WhatsApp, la guía PDF y las descargas del piloto. La configuración y los pasos para publicar gratuitamente en Vercel están en [docs/VERCEL.md](docs/VERCEL.md). Cambiar de enlace requiere traer una copia protegida de los datos del navegador anterior.

## Desarrollo y verificación

El código completo está disponible en [MoisesBaron1/finca-repelon](https://github.com/MoisesBaron1/finca-repelon), repositorio público indicado por el propietario. Para continuar en Claude Code o en el chat de Claude, sigue [esta guía](docs/CONTINUAR-EN-CLAUDE.md). `CLAUDE.md` contiene las instrucciones del proyecto y `docs/PROMPT-PARA-CLAUDE.md` un mensaje inicial listo para copiar. El proyecto editable de HyperFrames está en [`promo/`](promo/README.md).

Requisitos web: Node 22 o 24 y npm. Requisitos Android: JDK 17 o 21 con compilador, SDK plataforma 35 y build-tools 35.0.0.

```sh
npm ci
npm test
npm run build
npm run dev
```

Los tests de navegador necesitan servir la compilación en `http://127.0.0.1:5173`:

```sh
npx playwright install chromium
python -m http.server 5173 --directory dist
npm run test:browser
npm run test:hardening
npm run test:compatibility
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
- `src/records.mjs`: reglas de guardado e importación dentro de la transacción.
- `src/farm.jsx`: acciones compartidas, historial, inicio/final y actualización entre pestañas.
- `src/compat.mjs`: compatibilidad con métodos ausentes en WebViews antiguos.
- `src/exports.mjs`: informes CSV con nombres y columnas en español.
- `src/seed.mjs`: inventario de ejemplo inmutable entre instalaciones, separado del espacio real.
- `src/pages.jsx`, `src/Forms.jsx`: interfaz y flujos de trabajo.
- `android/app/src/main/java/co/repelon/finca`: WebView con recursos privados, SQLite y servicio nativo GPS.

El contrato de transferencia está en `docs/CONTRATO.md`; la matriz y los límites de aceptación están en `docs/ALCANCE.md` y `docs/VERIFICACION.md`.

## Límites del piloto

Sin servidor, sincronización automática, roles autenticados, diagnóstico veterinario automático ni certificación por GPS. Transferencia manual por archivo protegido. Datos confirmados hasta 40 MiB por espacio y paquetes hasta 75 MiB, incluyendo Base64 y fotografías. La contraseña cifra e íntegra el paquete, pero no identifica criptográficamente a su emisor. Android limita reinicios y cierres forzados; se requiere reanudación explícita y los huecos no se rellenan.

La precisión por palma y autonomía de 8 horas requieren un piloto físico antes de habilitar el control individual. No se dispone de un teléfono real en este entorno. Es una entrega de MVP, no la aceptación integral H0–H5 de la épica.

---

## Documento: PRODUCT.md

# Finca Repelón

MVP gratuito de gestión offline para una finca con palma, ganado bovino, plátano y mantenimiento, basado en la épica entregada el 2 de octubre de 2026.

Trabajadores registran jornadas e incidencias; un administrador organiza y revisa labores. Android es la plataforma para captura GPS con pantalla bloqueada. El navegador es una superficie complementaria de gestión y prueba; su GPS requiere la página visible.

La interfaz se dirige especialmente a personas mayores con poca experiencia tecnológica. La entrada ofrece cuatro acciones concretas; los registros frecuentes se completan por pasos, con revisión y confirmación de guardado. Ayuda y regreso al inicio siempre están disponibles. La legibilidad y evitar errores accidentales tienen prioridad sobre la densidad del tablero.

Datos privados locales, sin cuenta ni servicios de pago. Recepción entre dispositivos por paquetes protegidos con contraseña; sin servidor de sincronización en esta versión. Modo de ejemplo claramente separado de la finca real. No se afirman precisión por palma, autonomía de 8 horas ni control de acceso multiusuario antes de un piloto.

Éxito: guardar y recuperar datos offline, evitar duplicados al importar, conservar conflictos, separar GPS de verificación, producir un APK y una compilación reproducible.

---

## Documento: DESIGN.md

# Diseño

Superficie de operación: un cuaderno de campo claro, pensado para personas mayores con poca experiencia tecnológica. Fondo gris claro #f5f7f5, superficies blancas, texto #20382e, verde profundo #123c30 y acento lima #cee891. Tipografía Manrope local, base 18px, con opción persistente de 21px en Ayuda. Controles principales de al menos 52px; bordes visibles y radios 12–16px.

Inicio muestra cuatro acciones con nombre e icono: Ver tareas, Anotar un dato, Avisar un problema e Iniciar jornada. Los avisos, datos agregados y plano se abren cuando se necesitan. En móvil, Inicio, Tareas, Más opciones y Ayuda tienen navegación inferior permanente. Las tablas se adaptan a filas con etiquetas y las tareas se leen como listas, sin necesitar desplazamiento horizontal.

Los registros frecuentes tienen pasos cortos, revisión antes de guardar y confirmación persistente. Los detalles opcionales se despliegan aparte. Volver conserva lo escrito; cerrar una anotación modificada exige elegir entre continuar o salir sin guardar. Tocar fuera del diálogo no lo cierra. El guardado permanece accesible en el pie del formulario y el recorrido en marcha tiene un aviso visible en todas las pantallas.

Los estados usan texto además del color. Se distinguen reportado, verificado, visita probable y ambigüedad. Se respeta movimiento reducido. El foco acompaña los cambios de pantalla y pasos, y los errores indican qué dato corregir. Usar palabras cotidianas: anotar, guardar, problema, copia y traer una copia. Los términos técnicos quedan en informes o configuración cuando aportan información necesaria.

---

## Documento: docs/CONTRATO.md

# Contrato de datos y transferencia v1

Cada evento contiene `id` único, `entityId`, `kind`, `payload`, `version`, `parentEventId`, `deviceId`, `farmId`, `actor` y fecha UTC `time`. Se conservan las versiones anteriores. El ID del dispositivo receptor no se reemplaza al importar; los IDs de evidencia se mantienen. La interfaz deriva su estado de eventos locales aceptados; una rama recibida cuyo padre no es el evento aceptado no sobrescribe sus cambios posteriores. Conflictos de versión se revisan de forma explícita; resolver conserva las propuestas y crea una versión nueva con `resolvedEventIds` y motivo.

El navegador confirma lectura, validación y escritura en una sola transacción IndexedDB, serializable entre pestañas. Android confirma el JSON operativo en una transacción SQLite; el servicio confirma puntos individuales y diagnósticos en tablas propias. Los puntos nativos se agregan al evento de jornada al finalizar y también se recuperan después de una interrupción. No se permite crear respaldos con una jornada activa para evitar omitir puntos todavía en captura.

Paquete `.finca`: envoltura `format=repelon-encrypted`, `schema=1`, `salt`, `iv`, `checksum`, `body`. Sal aleatoria 16 bytes, IV aleatorio 12 bytes; PBKDF2-HMAC-SHA256 de 250.000 iteraciones y AES-256-GCM. El contenido cifrado contiene finca, modo, fecha y todos sus eventos/fotos. GCM autentica el contenido y el identificador de formato; SHA-256 detecta incongruencia del contenido decodificado. Se exige contraseña de al menos 8 caracteres. Contraseña incorrecta, alteración, versión desconocida, tipos de datos inválidos y otra finca con inventario existente se rechazan antes de escribir. La protección del paquete no acredita identidad individual del emisor.

Los mismos eventos importados conservan un solo ID; una colisión de ID con contenido diferente se rechaza. No se borra el origen ni se marca una exportación como recepción confirmada. Una finca real vacía puede adoptar una copia de otra instalación, preservando sus IDs. Ejemplo y datos reales tienen modos separados. Los archivos nunca activan el GPS al importar.

Presupuesto de datos: 40 MiB por espacio; paquete cifrado hasta 75 MiB para absorber la expansión de Base64. El guardado/exportación comprueba el presupuesto antes de confirmar. La guía recomienda copias frecuentes fuera del dispositivo.

Contrato futuro de servidor: recepción por ID de evento y adjunto, acuse duradero por elemento, fecha de recepción independiente de la ocurrencia, versión y padre de evento, conflictos conservados. HU12 (servidor) y firma del emisor de HU14 quedan diferidas. No se simula una cola enviada o sincronización inexistente.

---

## Documento: docs/ALCANCE.md

# Alcance del MVP

Se entrega una APK Android híbrida: interfaz React empaquetada, servicio nativo Kotlin de ubicación, SQLite privado y transacciones. El navegador usa IndexedDB y caché offline. Ambas interfaces comparten reglas de negocio y cálculos.

## Historias cubiertas parcialmente en esta etapa

- H1 / HU01, HU02, HU04–HU11: configuración local, palmas, jornadas, puntos, cálculo conservador, revisión e incidencias.
- H2 / HU13–HU15: transferencia y copias AES-GCM con contraseña, checksum SHA-256, IDs estables, importación repetida sin duplicados y conflictos preservados. No hay identidad criptográfica del emisor ni sincronización automática a servidor.
- H3 / HU16–HU19, HU21–HU24: animales, pesajes medidos/estimados, salud, lotes, labores y cosechas con unidades separadas.
- H4: tareas y verificación manual con historial, inventario por movimientos, gastos/ingresos COP y reportes CSV.

## Límites explícitos

El seguimiento individual por palma está desactivado en una finca real hasta aprobar un piloto y validar coordenadas. GPS jamás verifica una tarea. No hay garantía de servicio tras cierre forzado o reinicio: se registra interrupción y se exige reanudación visible. No hay autenticación por persona ni roles seguros: esta etapa se usa en equipos autorizados por el propietario. Los datos de ejemplo no son datos levantados en la finca.

Pendientes de H0/H5: inventario real, autorización de modelos de teléfono, 8 horas en bolsillo y pantalla bloqueada, consumo de batería, precisión bajo vegetación, permisos y cierre/reinicio en dispositivos físicos. No se dispone de teléfono Android físico en este entorno.

---

## Documento: docs/VERIFICACION.md

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

## Verificación de producción

Publicación del commit `83bc6c0` en Vercel, despliegue `dpl_HJ6NECbtqgbxYj2DMwurABiD2Dea`, estado READY y destino production. App pública: https://temporary-spry-jasper-gs4cyvp.vercel.app.

- `node artifacts/verify-vercel.mjs`: aprobado en la dirección pública sin sesión de Vercel. Cuatro acciones grandes, interfaz e historial en español incluso con navegador en inglés, pesajes persistentes y guardado y recarga sin conexión.
- `APP_URL=https://temporary-spry-jasper-gs4cyvp.vercel.app node scripts/verify-promo.mjs`: aprobado. Guía accesible en 320/390/1280 px, cuatro descargas HTTP 200 y reproducción H.264/AAC del video HyperFrames de 71 segundos.
- HTML y service worker HTTP 200, con el paquete final `index-CbunQPCe.js`. APK y manual PDF publicados idénticos byte por byte a los archivos locales. SHA-256 del manual: `bf2a4f8ed09179d7ba07897a8c8a186afdbad2829b5a2659f67d3aa574c1055c`.

## Validación pendiente en campo

No se ejecutó la APK en un teléfono físico ni en un emulador. La compilación y la firma no demuestran autonomía, precisión ni continuidad real de la captura. Tampoco se realizó un estudio de usabilidad con personas mayores; hay que observar la comprensión y comodidad de los trabajadores reales durante el piloto.

Antes de habilitar permanencia por palma en la finca real, pruebe los modelos autorizados durante 8 horas con pantalla bloqueada, vegetación y ubicación precisa. Registre batería, huecos, precisión, pérdidas de señal, permisos, cierre forzado y reinicio; valide el inventario y apruebe el piloto en ajustes. Los huecos no se rellenan y el GPS no verifica tareas.

El navegador captura ubicación con la página visible. La transferencia entre equipos usa archivos protegidos, sin servidor ni identidad criptográfica del emisor. Los responsables locales no son roles autenticados. La entrega sigue siendo un MVP gratuito para piloto, no aceptación integral de H0–H5.

---

## Documento: docs/CONTINUAR-EN-CLAUDE.md

# Continuar Finca Repelón en Claude

Entrega preparada el **11 de octubre de 2026**. El repositorio reúne el historial de la app, código web, Android, pruebas, documentación, descargas y el proyecto editable de HyperFrames. Las credenciales y claves de firma quedan fuera de Git.

Repositorio público indicado por el propietario: https://github.com/MoisesBaron1/finca-repelon. Incluye código web, Android, pruebas, HyperFrames y documentación para Claude; no contiene credenciales ni claves de firma.

## GitHub

La conexión tiene acceso de escritura al repositorio. El historial de la app se conserva en la rama main. Para futuras subidas desde la carpeta original puedes ejecutar `npm run publish:github`; el script conserva el remoto anterior, no hace force push y comprueba el commit remoto. Desde un clon de GitHub usa tu flujo habitual de ramas y pull requests.

## Opción recomendada: Claude Code

Claude Code permite editar los archivos y ejecutar las pruebas en tu equipo. Usa la documentación oficial de instalación y acceso en https://code.claude.com/docs. El funcionamiento gratuito de la app es independiente del plan o consumo de Claude que elijas.

1. Instala Git, Node 22 o 24 y Claude Code. Para tu repositorio, inicia sesión en GitHub CLI con `gh auth login` si todavía no tienes acceso configurado.
2. Descarga el repositorio y abre Claude dentro de su carpeta:

```sh
gh repo clone MoisesBaron1/finca-repelon
cd finca-repelon
npm ci
claude
```

3. Claude Code lee `CLAUDE.md` automáticamente al trabajar en esta carpeta. Usa el mensaje de `docs/PROMPT-PARA-CLAUDE.md` para iniciar. No hace falta copiar esta conversación.
4. Antes de cambiar algo, pide que lea el contrato y compruebe el estado con `git status`, `npm test` y `npm run build`. Los resultados de la entrega anterior están en `docs/VERIFICACION.md`.
5. Para ver la app, ejecuta `npm run dev` y abre la dirección que indique Vite. Para probar offline y flujos móviles, sigue los comandos de `CLAUDE.md`.
6. Trabaja en una rama, revisa los cambios y conserva un commit por tarea. Los cambios locales no actualizan automáticamente Vercel.

Ejemplo de trabajo por rama:

```sh
git switch -c mejora/descripcion-corta
# Trabaja con Claude y ejecuta las comprobaciones pertinentes.
git diff --check
git status
git add ruta/al/archivo
git commit -m "Describe la mejora"
git push -u origin mejora/descripcion-corta
```

## Si prefieres el chat de Claude

Si tu cuenta ofrece integración con GitHub, conéctala desde Claude y concede acceso al repositorio `MoisesBaron1/finca-repelon`. Añade los archivos relevantes a un proyecto o conversación. La disponibilidad y los permisos de esa integración dependen de Claude y de tu cuenta.

También puedes trabajar sin conector: carga `docs/CONTEXTO-PARA-CLAUDE.md`, copia el mensaje de `docs/PROMPT-PARA-CLAUDE.md` y añade los archivos de código afectados por la tarea. El contexto explica arquitectura, producto y estado, pero no sustituye el código completo. Para ejecutar cambios y pruebas usa Claude Code o tu editor local.

El archivo de código ZIP sirve para descargar todo y abrirlo en tu equipo. No es necesario que Claude acepte archivos ZIP: el contexto se entrega además como Markdown independiente. No cargues contraseñas, claves ni copias reales de la finca al chat.

## Android y firma

El código nativo está completo, incluido el wrapper Gradle. Para compilar instala JDK 17/21 y SDK Android 35; define `ANDROID_HOME` o un `android/local.properties` local. Después ejecuta los pasos de `docs/ANDROID.md`.

La APK publicada está firmada con la clave del piloto. Esa clave no forma parte del repositorio ni de los paquetes para Claude. Para actualizar sobre una instalación existente hay que custodiar y usar la misma clave, mantener applicationId y aumentar versionCode. Una APK debug sirve para desarrollo; no es una actualización del piloto firmado.

## HyperFrames

Todo el proyecto editable está en `promo/`: ocho composiciones, guion, tiempos, capturas, fuentes y audios. El video publicado dura 71 segundos. La narración existente puede reutilizarse sin contratar un servicio.

```sh
cd promo
npm run check
npm run render -- --output exports/Finca-Repelon-Promocional.mp4 --fps 30 --quality high --workers 2
```

Las herramientas se fijan a HyperFrames 0.8.112. Para regenerar voz se necesita Python, Kokoro y FFmpeg; consulta `promo/README.md`. La guía PDF necesita ReportLab y fuentes DejaVu. Estos requisitos no son necesarios para desarrollar la app web.

## Publicar otra versión

La app vigente continúa en https://temporary-spry-jasper-gs4cyvp.vercel.app. Subir código a GitHub no configura por sí solo un despliegue automático.

Para publicar una versión nueva, usa tu sesión Vercel y los pasos de `docs/VERCEL.md`, enlazando el proyecto existente `prj_tSVKN4aLJnlAKzgIftqXs2dtPVjD`, equipo `moi-83ef`. Antes, ejecuta pruebas y compilación; después, comprueba el enlace público, funcionamiento offline y descargas. No crees otra dirección sin planear cómo trasladar los datos locales.

## Trabajo pendiente y límites

- Validar GPS, batería y continuidad durante ocho horas en teléfonos físicos.
- Observar a personas mayores usando los formularios y ajustar según sus dificultades reales.
- Probar WebViews antiguos reales: se verificaron fallbacks en Chromium moderno, no todos los dispositivos antiguos.
- Cualquier sincronización automática o identidad de usuarios requiere una decisión nueva; el MVP actual intercambia copias cifradas manualmente.

La épica está resumida y contrastada en `docs/ALCANCE.md`; no se afirma aceptación integral de H0–H5. Mantén la app gratuita y en español al continuar.

---

## Documento: docs/PROMPT-PARA-CLAUDE.md

# Mensaje inicial para Claude

Copia este texto al abrir Claude Code o el proyecto de Claude:

```text
Continúa el proyecto Finca Repelón del repositorio MoisesBaron1/finca-repelon.
Es un MVP gratuito, offline y completamente en español para personas mayores
con poca experiencia tecnológica. La versión publicada es 0.3.0.

Lee CLAUDE.md, README.md, docs/CONTINUAR-EN-CLAUDE.md, docs/CONTRATO.md,
docs/ALCANCE.md y docs/VERIFICACION.md. Si solo tienes el paquete de contexto,
úsalo para orientarte y solicita los archivos concretos necesarios antes de
proponer una modificación de código que no puedes comprobar.

Primero revisa el estado del repositorio y ejecuta npm test y npm run build
si tienes terminal. No confundas los resultados históricos con pruebas nuevas.

Conserva los datos anteriores, las copias cifradas schema 1, el historial de
eventos, las transacciones, la separación ejemplo/real y el dominio Vercel.
Mantén botones grandes, formularios guiados y revisión antes de guardar.
No agregues servicios de pago ni dependencias de internet al flujo de campo.

El código Android está en android/ y HyperFrames en promo/. Las claves de
firma y credenciales no están en Git. No se ha validado aún el GPS de ocho
horas en teléfonos físicos ni la usabilidad con trabajadores reales.

Resume el estado y las comprobaciones que pudiste ejecutar. Después trabaja
sobre la siguiente tarea que te indique, con cambios pequeños, una regresión
si corresponde y verificación final. No publiques ni cambies infraestructura
sin que la tarea vigente lo autorice.
```

Después añade tu solicitud concreta, por ejemplo: «Mejora la búsqueda del ganado manteniendo los botones grandes y el uso sin conexión».

---

## Documento: promo/README.md

# Finca Repelón · Guía promocional HyperFrames

Video vertical de 71 segundos para teléfonos. Capturas reales del MVP v0.2.0 con datos de ejemplo, letras grandes, transiciones suaves y voz española generada gratis con HyperFrames TTS (Kokoro, ef_dora). No requiere claves de servicios de pago.

El proyecto incluye ocho escenas editables en `compositions/`, recursos locales en `assets/`, guion en `narracion.json`, tiempos exactos de cada audio en `timing.json` y storyboard en `STORYBOARD.md`. Ahora forma parte del repositorio completo en `promo/`; la app vigente es 0.3.0 y conserva el recorrido mostrado. Las capturas se renuevan desde la raíz de la app con `node scripts/capture-promo.mjs promo/assets`, sirviendo primero `dist` en el puerto 5173. Lee `CLAUDE.md` para continuar en Claude.

## Reproducir el video

Necesitas Node 22 o superior, FFmpeg y Chromium. La CLI está fijada a HyperFrames 0.8.112.

```bash
npm run check
npx --yes hyperframes@0.8.112 preview --background
npx --yes hyperframes@0.8.112 preview --status
npm run render -- --output exports/Finca-Repelon-Promocional.mp4 --fps 30 --quality high --workers 2
```

Abre la URL de Studio que indique `preview`, con `#project/repelon-promo`. Usa `preview --stop` al terminar. Si ya tienes Chrome Headless Shell, define `HYPERFRAMES_BROWSER_PATH` con su ruta para acelerar la captura.

Para cambiar títulos o instrucciones, edita `scripts/componer.mjs` y ejecuta `node scripts/componer.mjs`. Si solo quieres cambiar una escena directamente, edita su archivo HTML y conserva el contrato HyperFrames y su timeline pausado.

## Regenerar la narración

Los audios ya vienen incluidos. Solo necesitas estas dependencias si cambias el guion:

```bash
python3 -m venv .venv
.venv/bin/pip install kokoro-onnx soundfile
HYPERFRAMES_PYTHON="$PWD/.venv/bin/python" node scripts/narrar.mjs
node scripts/componer.mjs
npm run check
```

La primera ejecución descarga el modelo local gratuito. El guion se sintetiza a velocidad 0,95 y se ralentiza a 0,84 con FFmpeg conservando el tono. La composición utiliza los tiempos reales de los archivos resultantes. Los subtítulos SRT acompañan la narración con tiempos orientativos por frase; el propio video muestra instrucciones grandes.

La guía PDF y los textos de presentación se regeneran con `python3 scripts/guia.py [URL-publica-de-la-app]` usando ReportLab. Publicar la app en Vercel necesita una sesión Vercel del propietario; las credenciales no forman parte de este proyecto.

## Enlaces publicados

La publicación inicial está disponible en https://temporary-spry-jasper-gs4cyvp.vercel.app y la guía en https://temporary-spry-jasper-gs4cyvp.vercel.app/guia-promocional/. El PDF y el texto para compartir incluyen el enlace real, comprobado con HTTP 200.

---

## Documento: promo/CLAUDE.md

# Finca Repelón · HyperFrames para Claude

Lee primero `../CLAUDE.md`, `README.md`, `DESIGN.md`, `STORYBOARD.md` y `VERIFICACION.md`. Este proyecto es la guía promocional editable de la app; las capturas usan datos de ejemplo. No necesitas instalar habilidades de otro asistente para entender estos archivos.

## Archivos y herramientas

- HyperFrames CLI fijada a **0.8.112** en `package.json`.
- `index.html`: composición principal vertical de 71 segundos.
- `compositions/`: ocho escenas; `scripts/componer.mjs` regenera las escenas.
- `assets/`: capturas, fuentes, GSAP local y audios incluidos.
- `narracion.json`: guion en español; `timing.json`: tiempos reales.
- `scripts/narrar.mjs`: voz local Kokoro y FFmpeg, sin clave de pago.
- `scripts/guia.py`: PDF y texto para compartir, salida en `exports/`.

## Conservar el contrato de animación

Los elementos temporales usan `data-start` y duración. Las escenas visuales llevan `class="clip"`; la composición registra un timeline raíz pausado en `window.__timelines`. Las escenas hijas añadidas al timeline raíz no se pausan. Mantén recursos locales y lógica determinista; evita `Date.now()`, `Math.random()` y peticiones de red durante la composición.

Todo texto y voz deben estar en español. Conserva letras grandes, transiciones suaves y contraste; no muestres anotaciones reales de la finca. Después de editar HTML ejecuta `npm run check` y corrige los errores antes de renderizar. Los resultados históricos están en `VERIFICACION.md`, no son comprobaciones nuevas.

```sh
npm run check
npx --yes hyperframes@0.8.112 preview --background
npx --yes hyperframes@0.8.112 preview --status
npm run render -- --output exports/Finca-Repelon-Promocional.mp4 --fps 30 --quality high --workers 2
npx --yes hyperframes@0.8.112 preview --stop
```

Consulta los temas disponibles con `npx --yes hyperframes@0.8.112 docs` y la documentación oficial en https://hyperframes.heygen.com/llms.txt. No actualices la versión fijada sin verificar compatibilidad.

Desde la raíz de la app puedes renovar capturas con `node scripts/capture-promo.mjs promo/assets`, después de servir la compilación en el puerto 5173. Para publicar nuevos videos, copia las salidas finales a `../public/downloads/`, actualiza los enlaces si corresponde y comprueba la guía web. Subir código no publica automáticamente la app ni el video.
