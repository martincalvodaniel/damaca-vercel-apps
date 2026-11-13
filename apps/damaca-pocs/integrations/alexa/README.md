# Skill privada de Alexa

1. Crea una skill Custom con endpoint HTTPS propio en Alexa Developer Console y añade el idioma Español (ES). Carga `es-ES.json` en el editor JSON y compila el modelo.
2. Usa el identificador de la skill como `ALEXA_SKILL_ID`. Activa las pruebas de desarrollo. Obtén `context.System.user.userId` en la inspección de solicitudes del simulador y úsalo como `ALEXA_USER_ID`. Si el usuario vuelve a habilitar la skill, revisa ese identificador.
3. Configura `ALEXA_OWNER_EMAIL` con la cuenta de Google verificada que ya inició sesión en Damaca POCs. Configura el endpoint de la skill como `https://<preview>/api/integrations/alexa`. Alexa debe poder llegar a esa ruta HTTPS.
4. En el simulador y en un dispositivo con la misma cuenta e idioma, di «Alexa, abre Damaca Pocs», luego «añade leche a la lista de la compra». Abre Damaca Pocs otra vez y di «crea un recordatorio para llamar al dentista». Responde «para mañana» y «a las nueve de la mañana». Comprueba las dos entradas en el panel.
