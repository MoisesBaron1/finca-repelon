# Verificación de la guía promocional

- HyperFrames 0.8.112: `npm run check` termina correctamente. Lint y runtime: cero errores o avisos. Diseño: cero incidencias en nueve muestras. Movimiento: cero errores o avisos. Contraste: 35 de 35 textos pasan WCAG AA.
- Se revisaron nueve fotogramas de Studio, incluyendo ambas fases de la selección del animal, y fotogramas extraídos del MP4 final. Las capturas corresponden al MVP v0.2.0 con datos de ejemplo. Las instrucciones y las etiquetas de los botones coinciden con la aplicación.
- El video principal tiene 1080 × 1920 píxeles, H.264, 30 fps y audio AAC de 48 kHz. La pista de video dura 70,933 segundos frente a los 70,932 segundos de la composición; el contenedor final dura 71,000 segundos después del ajuste de audio.
- La versión ligera tiene 720 × 1280 píxeles, H.264, 24 fps, audio AAC de 48 kHz y duración 71,000 segundos. Tamaño aproximado: 2,2 MB. Ambos archivos tienen audio ajustado para una voz más audible, sin música de fondo.
- El render HyperFrames utilizó captura beginframe y GPU por software; terminó correctamente en unos 90 segundos. El ajuste final de audio conserva la pista de video original.
- El mapa de animación se generó con el script oficial y paquetes fijados a 0.8.112. Sus avisos de colisión incluyen los contenedores de escena que contienen los elementos animados y las capas de transición. Los tiempos sin movimiento se usan para leer y escuchar. Se contrastaron con la inspección visual y las comprobaciones de contenido y desbordamiento de HyperFrames.
- Solo los encabezados que se superponen durante los fundidos tienen la marca `data-layout-allow-overlap`; no se excluye todo el contenedor de escena del análisis.
- El PDF contiene tres páginas A4 con texto de tamaño grande; se verificó su distribución y no contiene enlaces inventados. Se añadió el enlace real de Vercel después de comprobar la publicación con HTTP 200. Se revisó la primera página con el enlace; el PDF conserva tres páginas A4.
- Los subtítulos externos SRT y VTT tienen tiempos orientativos calculados por frase. El video también muestra los pasos principales con texto grande.
- La comprobación inicial del reproductor detectó que el Chromium distribuido con Playwright en este entorno no incluye los códecs H.264/AAC. El mismo archivo y página cargan metadatos correctamente en el Chromium del sistema, que sí los incluye. La verificación del reproductor utiliza ese navegador.
- La página de promoción pasa WCAG AA, adapta su contenido a anchos de 320, 390 y 1280 píxeles y permite descargar sus cuatro recursos. Se comprobó reproducción real del video en el Chromium del sistema. El service worker no precarga archivos de video ni la carpeta de descargas.

La guía explica el piloto gratuito, la primera carga web con internet, el guardado local, la separación entre ejemplo y finca real y el intercambio manual mediante copias protegidas. No promete sincronización remota ni precisión GPS comprobada.
