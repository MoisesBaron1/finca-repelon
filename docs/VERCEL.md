# Publicar el MVP en Vercel

El proyecto es una app estática Vite. No necesita servidores, base de datos remota ni servicios de pago. `vercel.json` instala con `npm ci`, compila la app y genera el service worker. `dist` es la carpeta de salida. El recorrido GPS con pantalla bloqueada requiere la APK Android; una publicación web no sustituye esa implementación nativa.

## Publicación

Necesitas iniciar sesión en la cuenta Vercel que alojará el proyecto. Con Vercel CLI 62.2.0:

```bash
npx --yes vercel@62.2.0 login
npx --yes vercel@62.2.0 link --yes --project finca-repelon --scope moi-83ef
npx --yes vercel@62.2.0 deploy --prod --yes --scope moi-83ef
```

Abre la URL oficial de inicio de sesión que muestre el primer comando. Usa el plan gratuito disponible en la cuenta y el dominio vercel.app incluido; no es necesario comprar un dominio ni activar servicios externos. Si necesitas otra cuenta, reemplaza `--scope` por su equipo.

La carpeta `.vercel` queda fuera de Git. Las credenciales de Vercel y las claves de firma Android no se incluyen en el repositorio ni en los archivos para publicar. `.vercelignore` excluye Android, pruebas, artefactos y configuración privada de Sites.

Si aún no hay una sesión de CLI, Vercel 62.2.0 también permite `npx --yes vercel@62.2.0 deploy --temporary --yes --prod`. Genera una publicación pública de 60 minutos y un enlace oficial para guardar el proyecto en la cuenta del propietario. Es imprescindible completar ese paso para conservar el sitio. La configuración privada de esta modalidad se guarda en `.vercel/anonymous.json`; tampoco debe compartirse.

## Revisar el resultado

1. Confirma que el despliegue termina en estado READY y que el dominio de producción funciona.
2. Abre Inicio, anota un dato de ejemplo y comprueba la confirmación de guardado.
3. Abre una vez con internet, desconecta y verifica que la app permite anotar y volver a abrir.
4. Revisa `/guia-promocional/` y descarga la APK, el video y la guía PDF.

Los archivos de video se guardan en `downloads`, fuera de la precarga del service worker. Esto conserva una primera instalación ligera. La guía promocional incluye un reproductor sin reproducción automática.

Puedes comprobar accesibilidad, adaptación a teléfonos, descargas y reproducción con `node scripts/verify-promo.mjs`. Define `APP_URL` para comprobar el sitio publicado y `PROMO_BROWSER_PATH` si tu Chrome está en otra ruta. El navegador de pruebas debe incluir H.264 y AAC; el Chromium del sistema los admite en este entorno, mientras que la distribución de Playwright instalada aquí no los incluye.

## Pasar datos desde el enlace anterior

Cada dirección web mantiene su propio almacenamiento. Antes de dejar de usar la URL anterior, guarda una copia protegida desde Ayuda. Abre la nueva URL, elige Traer una copia y usa la misma contraseña. Compartir el enlace de Vercel no comparte automáticamente las anotaciones de los teléfonos.
