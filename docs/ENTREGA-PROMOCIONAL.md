# Entrega promocional y publicación Vercel

Se preparó una guía promocional de Finca Repelón con HyperFrames 0.8.112: video vertical de 71 segundos, pantallas reales con datos de ejemplo, voz española local gratuita y textos grandes. El proyecto editable se entrega por separado en Finca-Repelon-HyperFrames.zip.

La versión para WhatsApp mide aproximadamente 2,2 MB y está disponible en `public/downloads/Finca-Repelon-WhatsApp.mp4`. La página `/guia-promocional/` reúne el reproductor, la descarga Android, el PDF promocional, el video y el manual de uso. Los videos no se precargan para el funcionamiento offline de la app.

Verificación realizada: compilación Vite y generación del service worker; accesibilidad WCAG AA de la página de promoción; adaptación a 320/390/1280 px; cuatro descargas completas y reproducción H.264/AAC en Chromium del sistema. La configuración de Vercel está en `vercel.json` y el procedimiento en `docs/VERCEL.md`.

## Publicación confirmada · 3 de octubre de 2026

- App: https://temporary-spry-jasper-gs4cyvp.vercel.app
- Guía promocional: https://temporary-spry-jasper-gs4cyvp.vercel.app/guia-promocional/
- PDF: https://temporary-spry-jasper-gs4cyvp.vercel.app/downloads/Guia-Promocional-Finca-Repelon.pdf

El proyecto `prj_tSVKN4aLJnlAKzgIftqXs2dtPVjD` está guardado en el equipo `moi` (`moi-83ef`). La CLI oficial Vercel 62.2.0 confirmó el despliegue de producción `dpl_7NB5gV3zPrBqtEbEusNjjvmQ4VeT` en estado READY. La versión inicial 0.2.1 se publicó mediante `deploy --prod --yes --scope moi-83ef`.

La entrega 0.3.0 amplía los formularios por pasos y permite corregir anotaciones. Protege cambios entre pestañas y copias anteriores, reduce las fotos y mejora la compatibilidad con navegadores antiguos. La APK conserva la firma del piloto y aumenta versionCode a 4. El PDF promocional incluye el enlace real de la app y el manual completo está actualizado.

Las pruebas sobre la dirección pública, sin iniciar sesión en Vercel, confirmaron: cuatro acciones grandes en Inicio; interfaz en español con un navegador configurado en inglés; apertura de Informes e historial traducido; guardado y recarga sin conexión; guía sin desbordamiento a 320/390/1280 px; accesibilidad WCAG AA de la guía; cuatro descargas y reproducción real H.264/AAC del video. Se compararon los archivos publicados con los locales para verificar la APK y el PDF final.

Las credenciales de Vercel, los archivos `.env*`, la carpeta `.vercel` y las claves Android quedan excluidos del repositorio y de la subida. Si se cambia de teléfono, navegador o dirección web, se deben recuperar las anotaciones mediante una copia protegida.
