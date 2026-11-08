# LBDP — plan maestro

## Alcance autorizado

Esqueleto público independiente de La Bottega di Pali. Identidad verde oliva y crema, fotos del negocio, portada, talleres y fichas, clases, bonos, celebraciones, servicios y contacto. Contenido editorial estático y navegación responsive. La web actual conserva fechas, precios y compra mediante enlaces explícitos.

Investigación de referencia: [dossier](../../../docs/research/la-bottega-di-pali/README.md). Las decisiones pendientes siguen abiertas: no se elige base de datos, pasarela, reglas de bonos/aforo ni contrato API. No hay conexión a billing, cuentas, formularios enviados, carrito, reservas o cobros locales. No cambiar las otras aplicaciones.

## Decisiones del esqueleto

Next.js del catálogo raíz, Server Components, CSS propio, imágenes locales optimizadas y componentes de presentación compartidos. Sin secretos, servicios remotos de runtime, analítica, cookies opcionales, auth ni PWA. Metadatos noindex durante preparación; no sustituye todavía la web actual. Las páginas legales y de financiación se consultan en la web vigente hasta aprobar contenido.

## Pendiente

Confirmar domicilio/local y condiciones comerciales; alcance editorial, integración, catálogo/agenda y lanzamiento según [decisiones pendientes](../../../docs/research/la-bottega-di-pali/08-decisiones-pendientes.md). LBDP-01 no configura Vercel, DNS ni producción. LBDP-02 crea el proyecto Vercel independiente y la conexión Git por petición del usuario; el Preview queda bloqueado por cuota de despliegues. DNS y producción siguen sin modificarse.

## Entregas

[LBDP-01](iterations.md#lbdp-01--esqueleto-público) y [evidencia](iteration-log.md).

## Vercel

Proyecto `lbdp` del equipo `martincalvodaniels-projects`, raíz `apps/lbdp`, Next.js, Node 24, Bun 1.4.4 en instalación/build. Repositorio conectado, producción `main`, selección nativa de proyectos afectados activa y protección de acceso conservada. [LBDP-02](iterations.md#lbdp-02--proyecto-vercel-y-preview-de-int) registra el intento Preview de `int` rechazado por cuota; no hay URL READY acreditada. La vinculación local permanece ignorada en Git.

[LBDP-03](iterations.md#lbdp-03--reparar-el-lanzador-de-instalación-de-vercel) sustituye el bootstrap de bunx por npx. El fallo alojado no está confirmado como resuelto: el Preview de validación fue rechazado por cuota.

[LBDP-04](iterations.md#lbdp-04--desactivar-deployments-automáticos-de-git) incorpora `vercel.ts` con `git.deploymentEnabled: false` y dependencia de configuración del catálogo; publicación manual bajo petición.

La configuración de despliegue y acceso geográfico se rige por [AGW-22](../../../plan/iterations.md#agw-22--align-vercel-configuration).
