# Alcance del MVP

Se entrega una APK Android híbrida: interfaz React empaquetada, servicio nativo Kotlin de ubicación, SQLite privado y transacciones. El navegador usa IndexedDB y caché offline. Ambas interfaces comparten reglas de negocio y cálculos.

## Historias cubiertas parcialmente en esta etapa

- H1 / HU01, HU02, HU04–HU11: configuración local, palmas, jornadas, puntos, cálculo conservador, revisión e incidencias.
- H2 / HU13–HU15: transferencia y copias AES-GCM con contraseña, checksum SHA-256, IDs estables, importación repetida sin duplicados y conflictos preservados. No hay identidad criptográfica del emisor ni sincronización automática a servidor.
- H3 / HU16–HU19, HU21–HU24: animales, pesajes medidos/estimados, salud, lotes, labores y cosechas con unidades separadas.
- H4: tareas y verificación manual con historial, inventario por movimientos, gastos/ingresos COP y reportes CSV.

## Límites explícitos

El seguimiento individual por palma está desactivado en una finca real hasta aprobar un piloto y validar coordenadas. GPS jamás verifica una tarea. No hay garantía de servicio tras cierre forzado o reinicio: se registra interrupción y se exige reanudación visible. No hay autenticación por persona ni roles seguros: esta etapa se usa en equipos autorizados por el propietario. Los datos de ejemplo no son datos levantados en la finca.

Pendientes de H0/H5: inventario real, autorización de modelos de teléfono, 8 horas en bolsillo y pantalla bloqueada, consumo de batería, precisión bajo vegetación, permisos y cierre/reinicio en dispositivos físicos. No se dispone de teléfono Android físico en este entorno.
