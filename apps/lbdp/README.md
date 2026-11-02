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

No hay proyecto remoto creado, credenciales ni dominio configurados. Cuando se autorice, la raíz del proyecto será `apps/lbdp`, manteniendo el workspace/lockfile raíz y los comandos filtrados del monorepo. No importar credenciales/configuración de otras aplicaciones. La elección de plan y el lanzamiento comercial siguen pendientes.

## Plan y decisiones pendientes

[Plan maestro](plan/master.md), [iteraciones](plan/iterations.md) y [evidencia](plan/iteration-log.md). La integración y reglas de comercio siguen en el [dossier](../../docs/research/la-bottega-di-pali/README.md).
