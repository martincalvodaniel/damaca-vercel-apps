# La Bottega di Pali — LBDP

Esqueleto público independiente. Interfaz española, contenido editorial estático y fotos locales del negocio. No utiliza billing, bases de datos, autenticación ni secretos.

Desde la raíz del monorepo:

```sh
bun install --frozen-lockfile
bun run dev --filter=@damaca/lbdp
bun run build --filter=@damaca/lbdp
bun run type-check --filter=@damaca/lbdp
```

Desarrollo: `http://localhost:3006`. Las páginas se generan estáticamente durante el build; el servidor Next también sirve y optimiza las imágenes locales. No requiere variables de entorno ni fuentes remotas.

## Estructura

- `src/content/site.ts`: catálogo editorial y contacto; sin precios, fechas ni plazas que puedan confundirse con datos en vivo.
- `src/components/`: cabecera responsive, imágenes, tarjetas, contacto y pie compartidos. Solo la cabecera necesita estado cliente.
- `src/app/page.tsx`: portada.
- `src/app/[slug]/page.tsx`: talleres por categoría, clases, bono, celebraciones, servicios y contacto.
- `src/app/producto/[slug]/page.tsx`: siete fichas de experiencias.
- `public/images/`: logo y fotografías optimizadas; procedencia en [SOURCES.md](public/images/SOURCES.md).

Las fechas, condiciones y compras se consultan mediante enlaces explícitos a la web vigente. Contacto abre correo, teléfono o WhatsApp; no existe un formulario que finja enviar datos. La dirección pendiente de confirmar no se duplica.

Las páginas legales y de financiación enlazan al sitio vigente. Robots y metadatos conservan `noindex` mientras se prepara la sustitución. Publicar esta app no constituye migración del comercio.

## Vercel

Proyecto [lbdp](https://vercel.com/martincalvodaniels-projects/lbdp) creado en el equipo existente, conectado a este repositorio con raíz `apps/lbdp`. Next.js, Node 24, instalación `npx --yes --package=bun@1.4.4 bun install --frozen-lockfile --filter @damaca/lbdp` y build `npx --yes --package=bun@1.4.4 bun run build` desde la raíz de la app. Producción permanece en `main`; selección nativa de cambios y protección de despliegue activas.

El primer Preview de `int` fue rechazado el 02/11/2026 por cuota Vercel (`402`, `api-deployments-free-per-day`). No hay URL READY ni comprobación HTTP alojada. Tras el desbloqueo, comprobar primero deployments de lbdp y reutilizar el pendiente si existe; crear un único Preview del SHA vigente de `origin/int` solo si no existe uno equivalente. No deducir del tiempo transcurrido que la cuota se haya renovado. Evidencia y pasos pendientes en [LBDP-02](plan/iteration-log.md#lbdp-02--proyecto-vercel-y-preview-de-int).

No hay dominio personalizado, variables de negocio ni producción desplegada por esta entrega. La vinculación local `.vercel` está ignorada. No importar credenciales/configuración de otras aplicaciones. El lanzamiento comercial y la elección de plan siguen pendientes.

## Plan y decisiones pendientes

[Plan maestro](plan/master.md), [iteraciones](plan/iterations.md) y [evidencia](plan/iteration-log.md). La integración y reglas de comercio siguen en el [dossier](../../docs/research/la-bottega-di-pali/README.md).

Validación pendiente en [LBDP-03](plan/iterations.md#lbdp-03--reparar-el-lanzador-de-instalación-de-vercel): la instalación del intento 996618a falló en Vercel antes de iniciar Bun; se cambió el bootstrap de bunx a npx y el Preview de comprobación sigue bloqueado por cuota.
