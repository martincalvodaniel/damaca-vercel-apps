# Configurar Alexa y ChatGPT en Damaca POCs

## Preview y variables de entorno

Configura las seis variables en Vercel → **damaca-pocs → Settings → Environment Variables**, con ámbito **Preview → `int`**. Vuelve a desplegar `int` para aplicar los valores. [Variables de entorno en Vercel](https://vercel.com/docs/environment-variables/managing-environment-variables)

| Variable | Valor |
| --- | --- |
| `ALEXA_SKILL_ID` | El **Skill ID** de Alexa Developer Console. Empieza por `amzn1.ask.skill.`. |
| `ALEXA_USER_ID` | El valor de `context.System.user.userId` en el JSON de una petición del simulador. |
| `ALEXA_OWNER_EMAIL` | El correo de la cuenta de Google con la que ya hayas iniciado sesión en Damaca POCs. |
| `CHATGPT_CLIENT_ID` | Un identificador que elijas, por ejemplo `damaca-pocs-chatgpt-int`. Usa el mismo en ChatGPT. |
| `CHATGPT_CLIENT_SECRET` | El secreto aleatorio que puedes generar con `openssl rand -hex 32`. Usa el mismo en Vercel y ChatGPT. |
| `CHATGPT_REDIRECT_URI` | La URI de retorno exacta que muestra ChatGPT para esa conexión OAuth, incluido cualquier identificador final. |

La preview ya tenía configuradas las variables de Google, MongoDB y Better Auth. Comprueba que `BETTER_AUTH_URL` apunta al [origen HTTPS estable de la preview](https://damaca-pocs-git-int-martincalvodaniels-projects.vercel.app), sin ruta. En Google Cloud, autoriza `https://damaca-pocs-git-int-martincalvodaniels-projects.vercel.app/api/auth/callback/google` en el cliente cuyo ID coincide con `GOOGLE_CLIENT_ID` de Preview. `MONGODB_DB` es opcional y por defecto usa `damaca-pocs`. [Clientes de Google Auth Platform](https://console.cloud.google.com/auth/clients)

Alexa y ChatGPT necesitan un origen HTTPS accesible desde sus servidores. ChatGPT también necesita llegar a los metadatos y al intercambio de tokens OAuth. Si el alias redirige al inicio de sesión de Vercel, revisa la excepción que configuraste para ese dominio. Las excepciones de Vercel se aplican al dominio completo. [Protección de despliegues de Vercel](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection)

## Alexa

1. Crea una skill **Custom** con idioma **Español (ES)** y alojamiento propio. [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Abre la skill en edición y, en la pestaña **Build**, despliega **CUSTOM → Interaction Model** en el menú lateral. Selecciona **Español (ES)** y abre **JSON Editor**. Carga el [modelo es-ES.json](alexa/es-ES.json), guarda y pulsa **Build Model**. En **Endpoint → HTTPS**, configura `https://damaca-pocs-git-int-martincalvodaniels-projects.vercel.app/api/integrations/alexa` como **Default Region** y selecciona la opción de subdominio con certificado comodín (`*.vercel.app`). [Configuración de la skill](https://developer.amazon.com/en-US/docs/alexa/devconsole/build-your-skill.html)
3. En **Test → Development**, di o escribe «abre Damaca Pocs». En **Skill I/O → JSON Input**, copia `context.System.user.userId`. La primera llamada puede fallar mientras falten las variables. Guarda las tres variables de Alexa y vuelve a desplegar. [Simulador de Alexa](https://developer.amazon.com/en-US/docs/alexa/devconsole/test-your-skill.html)
4. Di «Alexa, abre Damaca Pocs» y luego «añade leche a la lista de la compra». Abre Damaca Pocs de nuevo y di «crea un recordatorio para llamar al dentista». Responde «para mañana» y «a las nueve de la mañana». Comprueba que ambas entradas aparecen en el panel. El recordatorio queda guardado en Damaca.

## ChatGPT y OAuth con cliente preconfigurado

Tú eliges el identificador y el secreto del cliente y configuras los mismos valores en ChatGPT y Damaca. Al conectar el plugin, inicias sesión con Google en Damaca y autorizas a ChatGPT a guardar enlaces y resúmenes en tu cuenta. [Autenticación OAuth de plugins](https://developers.openai.com/plugins/build/auth)

1. En **Plugins → + → Add custom MCP server**, pon `Damaca` como nombre, elige **OAuth** y usa esta URL. La opción depende de los permisos de tu cuenta o espacio de trabajo. [Plugins de ChatGPT](https://chatgpt.com/plugins)

   ```text
   https://damaca-pocs-git-int-martincalvodaniels-projects.vercel.app/api/integrations/mcp
   ```

2. En **Client ID**, escribe `damaca-pocs-chatgpt-int`. En **Client Secret**, pega el resultado de `openssl rand -hex 32`. Si aparece la casilla **OIDC habilitado**, déjala desactivada. Si aparece un campo de alcance, usa `captures:write`. [Configuración de un MCP privado](https://developers.openai.com/api/docs/guides/custom-mcp-server)
3. Copia la **Redirect URI** que muestra ChatGPT. Damaca devolverá el navegador a esa dirección después de autorizar. Guarda el ID, el secreto y la URI exacta en las tres variables de ChatGPT de **Preview → `int`** y vuelve a desplegar la rama. [URI de retorno de ChatGPT](https://developers.openai.com/plugins/build/auth#redirect-url)
4. Con la nueva preview lista, instala el plugin, completa la conexión con Google y pulsa **Allow**. En un chat web, selecciona `@Damaca` y prueba «Exporta un resumen de esta conversación» y «Guarda este enlace: https://example.com». Al recargar Damaca, comprueba **Conversation summaries** y **Saved links**.
