# damaca-pocs

Espacio para futuras pruebas de concepto. El alcance inicial comprende una landing, acceso con Google y persistencia de identidad y sesiones en una base de datos propia del clúster de Damaca Hub.
- [Iteraciones](iterations.md)
- [Registro de entregas](iteration-log.md)

La configuración de despliegue y acceso geográfico se rige por [AGW-22](../../../plan/iterations.md#agw-22--align-vercel-configuration).

`MONGODB_DB` selecciona la base de datos de autenticación en el clúster indicado por `MONGODB_URI`. El valor predeterminado es `damaca-pocs`.

## Captura personal

El panel privado reúne artículos de compra, recordatorios con vencimiento, enlaces y resúmenes. Alexa captura compras y recordatorios mediante una skill privada en español. ChatGPT captura enlaces y resúmenes mediante una integración MCP privada con OAuth. Los recordatorios se visualizan en horario de Madrid. Solo las rutas exactas de integración y los endpoints OAuth de máquina necesarios admiten tráfico desde fuera de España.
