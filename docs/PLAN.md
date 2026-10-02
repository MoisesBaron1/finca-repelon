# Plan del MVP

1. Crear y probar `src/domain.mjs`: coordenadas, visitas con 3 puntos/10 s, intervalos de 15 s, pesos compatibles, unidades y fusión por eventos.
2. Crear `src/storage.mjs`: IndexedDB/puente SQLite, cola de eventos, escrituras confirmadas antes de mostrar guardado y paquetes AES-GCM.
3. Crear interfaz React por módulos: tablero, tareas, plano y jornadas, ganado, plátano, recursos, informes y configuración.
4. Crear Kotlin: Activity con WebView local sin navegación remota, puente de persistencia, servicio visible de ubicación cada 5 s, segmentos y diagnóstico de interrupciones; compilar APK.
5. Verificar tests de dominio, persistencia/reimportación/tamper, navegador desktop/móvil y operación offline. Entregar guía de instalación y matriz honesta HU/CA.
