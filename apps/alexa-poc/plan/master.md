# Alexa POC

Webapp privada para experimentar con la captura de recordatorios desde Alexa. El primer corte permite guardar y consultar recordatorios de texto desde la web con una cuenta Google autorizada.

MongoDB usa el clúster de Hub con una base separada `alexa-poc`. Cada cuenta consulta sus propios recordatorios. Las credenciales se configuran por aplicación.

Queda por definir la Skill de Alexa y su vinculación segura con la cuenta web. Los recordatorios de este corte son entradas guardadas, sin avisos programados.

Consulta [las iteraciones](iterations.md) y [el registro](iteration-log.md).

La configuración de despliegue y acceso geográfico se rige por [AGW-22](../../../plan/iterations.md#agw-22--align-vercel-configuration).
