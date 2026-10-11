# Instrucciones del proyecto promocional

Lee `CLAUDE.md` en esta carpeta y `../CLAUDE.md` para conocer el producto, los requisitos de español y las comprobaciones. Estas instrucciones sirven también para otros asistentes.

No modifiques HTML sin conservar el contrato de HyperFrames: tiempos `data-start`, duración, escenas `clip` y timeline raíz pausado en `window.__timelines`. Tras cambios en composiciones ejecuta `npm run check` antes de renderizar. Mantén la versión 0.8.112, recursos locales, datos de ejemplo, letras grandes y voz española.

Para una vista previa persistente usa `npx --yes hyperframes@0.8.112 preview --background`, comprueba `preview --status` y detén con `preview --stop` al terminar. Los archivos generados van a `exports/` y no se incluyen en Git; los entregables publicados están en `../public/downloads/`.
