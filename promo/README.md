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
