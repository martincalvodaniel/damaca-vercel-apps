# Archivo de entregas

## HM-01 — Receta y observaciones opcionales

- Inicio: 2026-10-31. Capacidad consultada: 84% restante de 5h y 97% de 7d. Estimación conservadora: menos de 10 puntos de 5h y 3 de 7d para implementación, validación y publicación; respeta las reservas.
- Alcance y aceptación: [HM-01](../../iterations.md#hm-01--receta-y-observaciones-opcionales).
- Implementado `notes` opcional en esquema, Server Actions y lectura/escritura MongoDB. Vaciar el campo reemplaza las notas previas por texto vacío. Sin nuevas consultas o índices y sin migración.
- Formulario con etiqueta y textarea; consulta plegable reutilizada en recetario y menú semanal. Texto escapado por React, con saltos de línea y ajuste de palabras largas.
- Corregidos todos los avisos de Biome en archivos editados: callbacks estables y convención `it` en tests. Revisión adicional con `vercel-react-best-practices` y `vercel:react-best-practices`: sin nuevas dependencias, peticiones, efectos o estado para las notas; marcado nativo accesible.
- `bun run lint --staged`: 11 archivos, sin hallazgos. La comprobación inicial con `--changed` no cubría cambios sin preparar; se sustituyó por esta validación sobre todos los archivos preparados.
- `bun run type-check --filter=@damaca/dalis-home-management`: correcto.
- `bun run test --filter=@damaca/dalis-home-management`: 101 tests correctos, 0 fallos; incluye notas ausentes/vacías, saltos de línea, longitud máxima y entradas inválidas.
- El primer build Turbopack pasó antes de corregir callbacks. El build final con Turbopack falló al abrir un puerto de PostCSS (`Operation not permitted`), también tras solicitar ejecución fuera del sandbox. `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto sobre la versión final, sin cambiar configuración del proyecto.
- `git diff --check` y enlaces locales de los planes: correctos. Sin prueba interactiva autenticada ni escrituras en la base de datos real.
- Capacidad refrescada antes del cierre: 81% de 5h y 97% de 7d, por encima de reservas.
- Rama `int`, sin cambios previos ajenos ni commits locales pendientes al inicio. Referencia remota comprobada antes de publicar: `ecda84c748e56552a64a4287a06dadb0899a3b47`. Preparada para commit y publicación; la coincidencia del SHA remoto se comprueba al cierre.

## HM-02 — Listas compactas y limpieza de búsquedas

- Inicio: 2026-11-01. Capacidad consultada al inicio: 99% de 5h y 93% de 7d; estimación conservadora inferior a 10 y 3 puntos respectivamente, con reservas de 7% y 2%.
- Alcance y aceptación: [HM-02](../../iterations.md#hm-02--listas-compactas-y-limpieza-de-búsquedas).
- Rama `int`, árbol limpio y sin commits locales pendientes de publicación al inicio.
- Compactados padding, márgenes, separaciones, ingredientes, notas y acciones en inventario, compra, recetario y menú semanal. Controles de cantidad compactos de 32px y selectores de menú de 36px; los formularios conservan el tamaño habitual.
- Añadido `SearchInput` compartido en los tres filtros de lista, `ProductPicker` y `SelectField`: cruz roja condicional al contenido, independiente del foco, botón con nombre accesible y retorno del foco tras limpiar. Ocultado el control nativo de WebKit para evitar duplicados.
- Corregidos todos los avisos de Biome en archivos editados mediante callbacks estables; ajustados los manejadores de opciones para conservar la selección. Revisadas las guías `vercel-react-best-practices` y `vercel:react-best-practices`: componentes extraídos, hooks antes de retornos condicionales, tipos y controles accesibles, sin nuevas dependencias ni peticiones.
- Biome sobre los 17 TSX editados/nuevos: sin hallazgos. La primera revisión detectó avisos previos de callbacks y una etiqueta sin asociación explícita, corregidos. La primera comprobación de tipos detectó una colisión entre `PointerEvent` nativo y React, corregida con alias.
- `bun run type-check --filter=@damaca/dalis-home-management`: correcto tras corregir el alias.
- `bun run test --filter=@damaca/dalis-home-management`: 101 tests correctos, 0 fallos.
- `bun run build --filter=@damaca/dalis-home-management`: Turbopack bloqueado por `binding to a port: Operation not permitted`. `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto; no se cambió la configuración del proyecto.
- Prueba temporal aislada en Chrome con componentes reales y CSS del build: cruz roja visible al perder foco, oculta al vaciar, tratamiento de espacios, borrado con clic/Enter y retorno del foco; selección y limpieza en ambos selectores; cantidad editable; alturas de 32/36px; móvil de 390px, escritorio de 1440px y modo oscuro. Sin errores de ejecución. El lanzamiento inicial de Chrome quedó bloqueado por el sandbox; la ejecución autorizada fuera de él completó la comprobación. Se corrigió un selector ambiguo del script temporal antes de repetir con éxito. Sin pruebas autenticadas ni escrituras sobre datos reales.
- Capacidad refrescada tras el fallo de Turbopack: 94% de 5h y 93% de 7d, con margen para cierre.
- Validación final: `bun run lint --staged` revisó 20 archivos sin hallazgos; `git diff --cached --check` y enlaces locales de planificación correctos. Revisados diff y archivos preparados: solo esta app, sin credenciales ni cambios ajenos.
- El sandbox bloqueó inicialmente la escritura del índice Git y la resolución DNS de GitHub; preparación y lectura remota completadas fuera del sandbox con autorización de herramientas. `origin/int` comprobado antes de publicar: `dd3e7e3adcd0bde60f877ae1ca55f3eaed6b0afa`, igual a la base local. Commit y publicación a `int` se verifican al cierre.
