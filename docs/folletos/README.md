# Folletos visuales para usar la app sin señal

Dos guías gratuitas, en español y con letra grande, para personas con poca experiencia tecnológica. Cada folleto tiene dos páginas A4: preparación con internet y uso en la finca sin señal. Se pueden guardar en el teléfono, compartir como imágenes o imprimir por ambas caras con giro por el borde largo.

- [Folleto para Android](../../public/downloads/Folleto-Android-Finca-Repelon.pdf): instalación desde la descarga oficial y prueba del GPS con pantalla bloqueada.
- [Folleto para iPhone](../../public/downloads/Folleto-iPhone-Finca-Repelon.pdf): Safari, icono en la pantalla de inicio y GPS manteniendo la app visible.
- [Paquete con ambos PDF y cuatro imágenes](../../public/downloads/Folletos-Visuales-Finca-Repelon.zip).

Guarda los archivos en **Archivos o Descargas antes de salir**. Los botones y códigos QR necesitan internet para abrir la app o descargar Android. El folleto guardado se puede consultar sin conexión.

## Contenido y límites

Las capturas corresponden a botones y mensajes reales de la versión 0.3.1. Se obtienen en una sesión aislada, sin datos de usuarios. Las ilustraciones de teléfono y compartir son dibujos explicativos; no representan capturas del sistema operativo.

Los pasos distinguen la aplicación instalada de Android del navegador de iPhone. La prueba con pantalla bloqueada en Android no garantiza continuidad ni autonomía en todos los modelos. En iPhone, bloquear la pantalla o cambiar de aplicación puede interrumpir el GPS. Los datos se guardan en el teléfono y recuperar internet no los sincroniza automáticamente.

La [guía completa sin señal](../GUIA-SIN-SENAL.md) explica permisos, copias protegidas y recuperación con más detalle.

## Regenerar las guías

Desde la raíz del repositorio, instala las dependencias de la app con `npm ci`. Para renovar las capturas, inicia `npm run dev` en otra terminal y ejecuta:

```sh
npx playwright install chromium
APP_URL=http://127.0.0.1:5173 node scripts/capture-brochure.mjs
```

Para componer los PDF y sus imágenes de vista previa, usa Python 3.10 o posterior:

```sh
python -m venv .venv
.venv/bin/pip install -r docs/folletos/requirements.txt
.venv/bin/python scripts/create-visual-brochures.py
```

El texto y diseño están en `scripts/create-visual-brochures.py`; los recortes, en `docs/folletos/imagenes/`. La tipografía Manrope se toma de la dependencia local de la app, sin fuentes remotas. Los PDF conservan texto seleccionable, fuentes incrustadas, idioma español y enlaces pulsables. Las imágenes de cada página se renderizan desde el PDF final.

Al modificar la dirección publicada, actualiza `URL` en el generador para renovar tanto los enlaces como los códigos QR. Revisa las cuatro páginas antes de publicarlas.
