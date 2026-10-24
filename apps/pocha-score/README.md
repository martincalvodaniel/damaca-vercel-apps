# Pocha Score

Marcador local para partidas presenciales de pocha entre 3 y 6 jugadores. Anota bazas pedidas y conseguidas, calcula puntuaciones y guarda la partida en **IndexedDB** en este dispositivo. Se instala como **PWA estática** y funciona sin cuentas, sincronización ni servidor de aplicación.

## Arranque

Requisitos: Bun y Node compatible con el Next instalado.

```bash
bun install --frozen-lockfile
bun run dev
```

Abre [localhost:3003](http://localhost:3003). No necesitas `.env.local`. El servidor de desarrollo no registra el service worker; para comprobar instalación y offline usa la salida compilada:

```bash
bun run build
bun run start
```

`build` usa Webpack y genera `out/` junto con su service worker, que incluye las rutas, payloads y recursos locales. `start` sirve esa carpeta en localhost; es una herramienta de previsualización, no un backend del producto. Si el puerto está ocupado, usa `bun run scripts/preview.ts --port 3107`. No uses `next start` ni abras el HTML mediante `file://`.

## Qué incluye

- Next.js App Router con exportación estática; React y TypeScript para interacción local.
- Partidas con secuencia sube-baja configurable, rotación del repartidor, puntuación habitual, clasificación y corrección de rondas.
- Historial local, reanudación, guardado automático y copias JSON para exportar e importar partidas.
- IndexedDB con `idb`, conexión compartida, migración no destructiva de versión 1 a 2 y registros validados con Zod.
- Interfaz en español, navegación inferior móvil/superior escritorio, áreas seguras y tema Sistema/Claro/Oscuro.
- Manifest, iconos PNG normales/maskable/Apple y favicon propios. Fuentes del sistema; sin peticiones de fuentes o recursos externos.
- Caché offline del build completo. Indicador de preparación en Settings y actualización explícita con **Update and reload**. Las actualizaciones no borran IndexedDB.
- Bun, Biome y pruebas con `fake-indexeddb` para persistencia aislada. No hay ORM, framework PWA, biblioteca de estado ni UI kit.

El tema y las partidas se guardan en IndexedDB. localStorage conserva únicamente una caché pequeña para aplicar el tema antes de hidratar, y propaga cambios entre pestañas. Si falla la persistencia, la UI muestra el error; no anuncia éxito silenciosamente.

## Instalación y uso sin conexión

1. Sirve `out/` desde la raíz de un origen **HTTPS**; localhost es válido para pruebas. La primera carga y preparación requieren conexión al host.
2. Abre Ajustes y espera **Lista para usar sin conexión**. Se prepara la aplicación completa, incluso Ajustes aunque no se haya visitado antes.
3. En navegadores compatibles aparece **Install app**. También puedes usar la opción del menú del navegador. En iPhone/iPad: Safari → Compartir → Añadir a pantalla de inicio. En escritorio: opción de instalar en la barra de direcciones o menú.
4. Abre desde el icono o vuelve al mismo origen. Con la caché preparada, ambas rutas se abren sin conexión.

La instalación depende del navegador y sistema; el botón no se fuerza donde no existe esa API. No incluye publicación en tiendas, notificaciones push ni sincronización. [Referencia de instalación de MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing).

Cuando hay un build nuevo, se descarga en segundo plano y se ofrece la recarga. Termina el trabajo abierto antes de aceptarla. Se conserva una caché anterior para pestañas con la versión previa; cierra/actualiza pestañas que lleven varias versiones abiertas. Si falla la descarga completa, no se instala una caché parcial. [Ciclo del service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Datos locales

IndexedDB pertenece al origen, navegador, perfil y dispositivo actuales. No hay cuenta, respaldo automático, cifrado propio ni sincronización entre dispositivos. Borrar datos del sitio, navegar en privado o las políticas de almacenamiento del navegador pueden eliminar los datos; instalar no equivale a hacer una copia.

Exporta periódicamente una copia JSON desde la pantalla de partidas y guárdala fuera del dispositivo. La importación valida todo el archivo y añade cada partida como copia nueva; repetir una importación puede duplicar partidas. Si una escritura falla, conserva la pantalla y vuelve a intentarlo. Una actualización de esquema debe incrementar la versión y migrar sin eliminar registros. Los accesos bloqueados o fallidos deben mostrarse y permitir reintentar. La capa local usa [idb](https://github.com/jakearchibald/idb), un envoltorio de IndexedDB con promesas.

## Copiar para una aplicación nueva

1. Copia los archivos del proyecto **sin** `.git`, `node_modules`, `.next`, `out`, `.env*` locales ni cachés generadas. No copies credenciales ni el remoto del repositorio original. No hay plantilla de entorno porque no se necesita configuración secreta.
2. Inicializa el repositorio y configura el remoto propio antes de autorizar el cierre con push. Los agentes trabajan en `int`; tú revisas e integras `main`.
3. Personaliza `name` en `package.json` y regenera `bun.lock` con `bun install`. Cambia nombre, descripción y namespaces en [src/config/app.ts](src/config/app.ts), iconos en `public/icons/`, favicon y textos de Home. Los namespaces de tema se derivan de esa configuración.
4. Sustituye el alcance del producto en [plan/master.md](plan/master.md), inicia `01` en [plan/iterations.md](plan/iterations.md) y conserva el historial solo como referencia. No heredes roles o requisitos de iteraciones antiguas.
5. Implementa funcionalidades en `src/features/<feature>/`, con esquemas compartidos y repositorios bajo `src/lib/storage/`. Cada store/índice/migración corresponde a una necesidad real.
6. Mantén la salida estática y las invariantes locales de [AGENTS.md](AGENTS.md). No añadas login, backend o servicios externos sin una nueva decisión humana explícita.

La configuración asume hosting en `/`. Usar un subdirectorio requiere alinear rutas, assets, scope, start URL y registro del service worker; no basta con mover la carpeta.

## Publicación estática

Sube **todo `out/`** a un host estático HTTPS con tipos MIME correctos y soporte de `index.html` por carpeta. Publica de forma atómica. `sw.js`, manifest y HTML deben revalidarse (`Cache-Control: no-cache`); los recursos con hash pueden tener caché inmutable. Next no aplica headers de servidor en una exportación: configúralos en el host.

La primera visita necesita descargar la aplicación. No se ha vinculado ni desplegado un proyecto de hosting; no hay permisos implícitos para producción o infraestructura.

### Configuración opcional de Vercel

[vercel.ts](vercel.ts) conserva la configuración aportada: `regions: ["cdg1"]` y una regla para todas las rutas que deniega la petición cuando `x-vercel-ip-country` no coincide con `ES`, incluida su ausencia. El país corresponde a la IP pública, no a una identidad ni a la ubicación física garantizada. La regla solo se aplica al desplegar en Vercel; `next dev`, el preview estático y otros hosts no la aplican. Consulta la [configuración tipada](https://vercel.com/docs/project-configuration/vercel-ts), las [reglas WAF](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules) y el [header de país](https://vercel.com/docs/headers/request-headers).

`@vercel/config` está instalado únicamente como dependencia de desarrollo para resolver `VercelConfig`; no se incorpora al código del navegador. `cdg1` es París y configura la región de ejecución de funciones; la exportación estática actual no genera funciones y su contenido se distribuye por la red de Vercel. No fija la residencia de los datos del navegador. [Referencia de regiones](https://vercel.com/docs/regions).

El bloqueo se evalúa en las peticiones que llegan a Vercel. **Una copia de la PWA ya almacenada puede seguir utilizándose offline fuera de España**: el service worker responde desde el dispositivo y no consulta el país. La regla no borra IndexedDB ni revoca esa copia local. El bloqueo efectivo y la entrega de rutas/assets desde España deben verificarse en un despliegue autorizado; una compilación local no acredita esas comprobaciones. Al copiar a otro proveedor, adapta o retira `vercel.ts` y su dependencia de tipos.

## Organización y validación

```text
plan/                    Alcance, iteraciones, reglas y evidencias
src/app/                 Composición de rutas y metadata estática
src/components/          Primitivas, navegación y providers
src/features/            UI y comportamiento por funcionalidad
src/config/              Marca y constantes locales
src/lib/storage/         IndexedDB, migraciones y repositorios
src/lib/pwa/             Contratos/hook de instalación y offline
src/lib/theme/           Aplicación y sincronización de tema
src/schemas/             Validación compartida
scripts/                 Build del worker y preview estático
test/                    Pruebas del service worker
```

```bash
bun run lint
bun run type-check
bun run test
bun run build
bun run knip
```

Las pruebas de IndexedDB simulan su API; las del worker comprueban caché/errores/actualización sin un navegador. Para cambiar persistencia o PWA, comprueba también el build en navegador: recarga offline de Home y Settings, navegación, tema después de cerrar/reabrir y actualización. Registra separadamente la prueba de instalación nativa en cada dispositivo. Otros comandos: `format`, `lint:fix`, `test:watch`.

## Iteraciones con agentes

Empieza por [AGENTS.md](AGENTS.md), el [plan maestro](plan/master.md), las [iteraciones](plan/iterations.md), el [registro](plan/iteration-log.md) y el [workflow común](../../plan/workflow.md). `CLAUDE.md` remite a las mismas reglas. Define objetivo, rutas, dependencias, aceptación y pruebas antes de editar. Mantén las invariantes locales en cada entrega y registra evidencia real.

> Lee AGENTS.md y plan/master.md. Quiero crear [producto] local para [usuarios]. Concreta el MVP y las primeras iteraciones con IndexedDB, offline e instalación. Define recuperación si habrá datos irremplazables. Implementa la primera entrega autorizada y valida su aceptación.

Consulta el [flujo agéntico común](../../plan/workflow.md) para delegación, capacidad, cierre y publicación. Este documento mantiene únicamente los límites del producto de la plantilla.
