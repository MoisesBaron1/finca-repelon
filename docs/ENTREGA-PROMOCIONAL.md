# Entrega promocional y publicación Vercel

Se preparó una guía promocional de Finca Repelón con HyperFrames 0.8.112: video vertical de 71 segundos, pantallas reales con datos de ejemplo, voz española local gratuita y textos grandes. El proyecto editable se entrega por separado en Finca-Repelon-HyperFrames.zip.

La versión para WhatsApp mide aproximadamente 2,2 MB y está disponible en `public/downloads/Finca-Repelon-WhatsApp.mp4`. La página `/guia-promocional/` reúne el reproductor, la descarga Android, el PDF promocional, el video y el manual de uso. Los videos no se precargan para el funcionamiento offline de la app.

Verificación realizada: compilación Vite y generación del service worker; accesibilidad WCAG AA de la página de promoción; adaptación a 320/390/1280 px; cuatro descargas completas y reproducción H.264/AAC en Chromium del sistema. La configuración de Vercel está en `vercel.json` y el procedimiento en `docs/VERCEL.md`.

## Estado de publicación

Vercel: pendiente de completar el inicio de sesión oficial del propietario. El conector conectado permite listar el equipo moi, pero su llamada de despliegue devuelve `Tool deploy_to_vercel not found`. La CLI oficial solicita autorización mediante un enlace de dispositivo. No se ha creado ni confirmado un despliegue Vercel, y no se inventa una URL de producción.

La publicación existente de Sites permanece sin cambios. Al usar una nueva dirección, el administrador debe traer una copia protegida de los datos del navegador anterior.
