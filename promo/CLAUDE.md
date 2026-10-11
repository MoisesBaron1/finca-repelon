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
