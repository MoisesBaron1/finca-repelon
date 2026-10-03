# Entrega promocional y publicación Vercel

Se preparó una guía promocional de Finca Repelón con HyperFrames 0.8.112: video vertical de 71 segundos, pantallas reales con datos de ejemplo, voz española local gratuita y textos grandes. El proyecto editable se entrega por separado en Finca-Repelon-HyperFrames.zip.

La versión para WhatsApp mide aproximadamente 2,2 MB y está disponible en `public/downloads/Finca-Repelon-WhatsApp.mp4`. La página `/guia-promocional/` reúne el reproductor, la descarga Android, el PDF promocional, el video y el manual de uso. Los videos no se precargan para el funcionamiento offline de la app.

Verificación realizada: compilación Vite y generación del service worker; accesibilidad WCAG AA de la página de promoción; adaptación a 320/390/1280 px; cuatro descargas completas y reproducción H.264/AAC en Chromium del sistema. La configuración de Vercel está en `vercel.json` y el procedimiento en `docs/VERCEL.md`.

## Estado de publicación

La app ya está publicada mediante la CLI oficial Vercel 62.2.0, con `deploy --temporary --yes --prod`, en https://temporary-spry-jasper-gs4cyvp.vercel.app. La guía está en https://temporary-spry-jasper-gs4cyvp.vercel.app/guia-promocional/. Se comprobaron las respuestas públicas HTTP 200 de la app, la guía, el PDF y el video; la guía también pasó las pruebas de navegador con reproducción H.264/AAC.

El proyecto temporal es `prj_tSVKN4aLJnlAKzgIftqXs2dtPVjD`. Vercel confirmó que el proyecto fue reclamado al intentar publicar la actualización: «This project was claimed successfully». El enlace inicial sigue respondiendo HTTP 200. Falta autorizar la CLI para comprobar la cuenta propietaria y subir la versión corregida; el conector no encuentra el proyecto en su equipo conectado.

La versión 0.2.1, preparada y verificada localmente, corrige una pantalla en blanco al abrir Informes, causada por la etiqueta de las pestañas con contadores, y muestra en español los tipos del historial. Se incorporó una prueba de regresión. La APK actualizada conserva la firma y aumenta versionCode a 3.

El conector sigue devolviendo `Tool deploy_to_vercel not found` y el inicio de sesión mediante dispositivo aún no generó una sesión de CLI. La publicación temporal oficial permitió entregar un enlace real y revisable. La actualización 0.2.1 permanece pendiente de esa autorización de CLI.

La publicación existente de Sites permanece sin cambios. Al usar una nueva dirección, el administrador debe traer una copia protegida de los datos del navegador anterior.
