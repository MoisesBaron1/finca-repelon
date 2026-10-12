# Continuar Finca Repelón en Claude

Entrega preparada el **11 de octubre de 2026**. El repositorio reúne el historial de la app, código web, Android, pruebas, documentación, descargas y el proyecto editable de HyperFrames. Las credenciales y claves de firma quedan fuera de Git.

Repositorio público indicado por el propietario: https://github.com/MoisesBaron1/finca-repelon. La entrega local incluye código web, Android, pruebas, HyperFrames y documentación para Claude; no contiene credenciales ni claves de firma. La subida al repositorio sigue pendiente de autorizar escritura.

## GitHub

El repositorio ya es visible y su enlace está confirmado. La conexión aún rechaza escritura con error 403 tanto por Git como por la API; los permisos del propietario en la ficha del repositorio no son los permisos efectivos de la aplicación. Para completar la subida, configura GitHub en las Aplicaciones de ChatGPT y autoriza la aplicación para este repositorio. El historial completo se conserva en la entrega local, rama main. Para futuras subidas desde la carpeta original puedes ejecutar `npm run publish:github`; el script conserva el remoto anterior, no hace force push y comprueba el commit remoto. Desde un clon de GitHub usa tu flujo habitual de ramas y pull requests.

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
