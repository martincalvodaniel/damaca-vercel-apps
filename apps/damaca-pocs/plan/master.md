# damaca-pocs

Espacio para futuras pruebas de concepto. El alcance inicial comprende una landing, acceso con Google y persistencia de identidad y sesiones en una base de datos propia del clúster de Damaca Hub.
- [Iteraciones](iterations.md)
- [Registro de entregas](iteration-log.md)

La configuración de despliegue y acceso geográfico se rige por [AGW-22](../../../plan/iterations.md#agw-22--align-vercel-configuration).

`MONGODB_DB` selecciona la base de datos de autenticación en el clúster indicado por `MONGODB_URI`. El valor predeterminado es `damaca-pocs`.
