# Registro de entregas

No hay entregas de producto registradas en este ámbito. Añadir evidencia observada por identificador al cerrar una iteración; consultar el estado en `iterations.md`.

## HM-01 — Receta y observaciones opcionales

- Inicio: 2026-10-31. Capacidad consultada: 84% restante de 5h y 97% de 7d. Estimación conservadora: menos de 10 puntos de 5h y 3 de 7d para implementación, validación y publicación; respeta las reservas.
- Alcance y aceptación: [HM-01](iterations.md#hm-01--receta-y-observaciones-opcionales).
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
- Alcance y aceptación: [HM-02](iterations.md#hm-02--listas-compactas-y-limpieza-de-búsquedas).
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

## HM-03 — Cabeceras y vista previa compactas

- Inicio: 2026-11-01. Rama `int`, árbol limpio y sin commits locales pendientes. Capacidad inicial: 90% de 5h y 92% de 7d. Estimación conservadora inferior a 7 y 2 puntos respectivamente; respeta reservas.
- Alcance y aceptación: [HM-03](iterations.md#hm-03--cabeceras-y-vista-previa-compactas).
- Reducido de 28–40px a 8px el padding superior de los gestores de Compra, Inventario y Platos. Ocultados visualmente en escritorio los bloques de presentación y títulos de lista redundantes; conservada su semántica accesible, títulos móviles y rango semanal.
- Acceso a vista previa reducido de al menos 80px a 46px, con contador numérico inmediatamente a la derecha del título y descripción accesible del número. Eliminada la segunda línea también cuando el contador es cero.
- Navegación y vaciado semanal en una fila, controles de 36px y texto «Esta semana» sin salto de línea a 320px. Se conserva la confirmación antes de vaciar. Separación sobre calendario y vista previa reducida a 8px.
- Corregidos avisos previos de callbacks en los archivos editados, sin cambiar la lógica de las acciones. La primera revisión detectó un `aria-label` en un span sin rol compatible; sustituido por texto `sr-only`. Revisadas las guías React ya aplicadas en HM-02: sin dependencias nuevas, sin peticiones añadidas, callbacks con dependencias completas y marcado accesible.
- `bun run type-check --filter=@damaca/dalis-home-management`: correcto. `bun run test --filter=@damaca/dalis-home-management`: 101 tests correctos, 0 fallos. Biome sobre los 12 TSX editados: sin hallazgos.
- Prueba temporal en Chrome con las cuatro páginas reales, datos ficticios y acciones/Next aislados: anchos de 320, 390, 768 y 1440px; separación exacta de 8px bajo el divisor; títulos visualmente ocultos en escritorio y conservados en móvil; vista previa de 46px con contador alineado; controles semanales en la misma fila; ningún desbordamiento ni error de ejecución; apertura y cierre del diálogo de vista previa. Capturas móvil y escritorio inspeccionadas. Sin acceso autenticado ni escrituras en datos reales.
- Enlaces locales de planificación y `git diff --check`: correctos. Capacidad refrescada antes del cierre: 85% de 5h y 91% de 7d.
- `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto sobre la versión final. Se utilizó Webpack por la limitación de puertos de Turbopack acreditada en HM-02, sin cambiar configuración. Una repetición del build iniciada antes de terminar la anterior devolvió código 1; se repitió secuencialmente con éxito.
- Referencia remota previa a publicación: `d54d01a6ff23bbc1e3a823420c5d8f4e7db5ca3d`, igual a la base local. Revisados diff, alcance y archivos: solo esta app, sin credenciales ni cambios ajenos. La coincidencia del commit publicado se verifica al cierre.
- Validación final de preparación: `bun run lint --staged` comprobó 15 archivos sin hallazgos; `git diff --cached --check` correcto.

## HM-04 — Corregir visibilidad responsive de títulos

- Inicio: 2026-11-01. Rama `int`, árbol limpio. Capacidad inicial: 83% de 5h y 91% de 7d. Estimación conservadora inferior a 4 y 1 puntos; respeta reservas.
- Alcance y aceptación: [HM-04](iterations.md#hm-04--corregir-visibilidad-responsive-de-títulos).
- Corrección de la interpretación anterior: el usuario confirma títulos visibles en escritorio y ocultos en móvil.
- Invertida la visibilidad responsive de cabeceras: títulos y presentación visibles desde `sm` (640px), ocultos por debajo. Restauradas las cabeceras de las tres listas en escritorio. Conservados rango semanal, botones compactos, contador de vista previa y buscadores.
- `bun run type-check --filter=@damaca/dalis-home-management`: correcto. `bun run test --filter=@damaca/dalis-home-management`: 101 tests correctos, 0 fallos. Biome de los siete TSX modificados y `git diff --check`: correctos.
- Chrome sobre las cuatro páginas con datos ficticios y acciones aisladas: títulos ocultos en 320/390px y visibles en 768/1440px; buscadores a 8px del divisor en móvil; controles semanales en una fila, vista previa compacta con contador y diálogo funcional, sin desbordamiento ni errores. Captura móvil inspeccionada. Sin acceso autenticado ni escrituras sobre datos reales.
- Incorporadas las dos indicaciones posteriores del usuario: eliminado el texto sobre arrastrar y su contenedor vacío; se conserva el estado «Moviendo…». «Vaciar semana» se renderiza siempre y usa `disabled` cuando `slots.length === 0`, además del estado de guardado.
- Repetidas comprobaciones de tipos y los 101 tests tras estos ajustes: correctas. Biome de los nueve TSX modificados: sin hallazgos.
- Repetida la prueba de Chrome sobre la versión final: ausencia del texto de ayuda y botón de vaciado visible y deshabilitado con semana vacía; resto de comprobaciones responsive correctas.
- `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto sobre la versión final, sin cambiar configuración. `bun run lint --staged`: 12 archivos sin hallazgos; enlaces locales de planificación y `git diff --cached --check`: correctos.
- Capacidad antes del cierre: 80% de 5h y 90% de 7d. Revisados diff y alcance: sin credenciales ni cambios ajenos. Base remota de `int` comprobada: `d48c7dc298f9c841c14ace8fa3a1d886558b6086`, igual a la base local; la coincidencia del commit publicado se verifica al cierre.

## HM-05 — Acceso compacto para copiar semana anterior

- Inicio: 2026-11-01. Rama `int`, árbol limpio. Capacidad inicial: 78% de 5h y 90% de 7d. Estimación conservadora inferior a 3 y 1 puntos; respeta reservas.
- Alcance y aceptación: [HM-05](iterations.md#hm-05--acceso-compacto-para-copiar-semana-anterior).
- Eliminados el contenedor decorativo, el título y la descripción del panel de copia. Queda el botón de ancho completo con los colores, borde, radio, sombra y altura de vista previa, con flecha a la izquierda y texto a la derecha. Los errores siguen mostrándose como aviso independiente y se conserva el estado «Copiando…».
- Conservadas las condiciones existentes: copia en semanas vacías con platos disponibles y vista previa cuando hay comidas planificadas. Ambos accesos son mutuamente excluyentes. Sin cambios en la acción de copia ni nuevas dependencias.
- Biome del componente, `bun run type-check --filter=@damaca/dalis-home-management` y `bun run test --filter=@damaca/dalis-home-management`: correctos, 101 tests y 0 fallos. Callback estabilizado para cumplir Biome.
- Chrome con componentes reales, datos ficticios y acciones aisladas en 320/390/768/1440px: coincidencia exacta de altura, ancho, colores, borde, radio y sombra entre copia y vista previa; flecha izquierda, alineación derecha, ausencia del panel anterior, exclusión mutua y ningún desbordamiento. Clic de copia aislado sin errores. Captura móvil inspeccionada. Sin escrituras sobre datos reales.
- `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto. Enlaces locales de planificación y `git diff --check`: correctos.
- Capacidad previa al cierre: 76% de 5h y 90% de 7d. Base remota de `int` comprobada: `d593476ae0c3fe5317ea5da85d580e044a20e016`, igual a la base local. Revisado diff: solo componente y planificación de esta app, sin credenciales ni cambios ajenos; publicación se verifica al cierre.
- Validación final: `bun run lint --staged` comprobó 4 archivos sin hallazgos; `git diff --cached --check` correcto.

## HM-06 — Contador semanal compacto

- Inicio: 2026-11-01. Rama `int`, árbol limpio. Capacidad inicial: 74% de 5h y 89% de 7d. Estimación conservadora inferior a 3 y 1 puntos; respeta reservas.
- Alcance y aceptación: [HM-06](iterations.md#hm-06--contador-semanal-compacto).
- Sustituida la frase visible por una etiqueta redondeada `X/14` junto al rango semanal. La descripción completa permanece solo para lectores de pantalla. Sin cambios en el cálculo ni en datos.
- Biome del componente, `bun run type-check --filter=@damaca/dalis-home-management` y `bun run test --filter=@damaca/dalis-home-management`: correctos, 101 tests y 0 fallos.
- Chrome con datos ficticios en 320/390/768/1440px: etiquetas `0/14` y `1/14` visibles, descripción accesible fuera de la presentación visual y ningún desbordamiento. Se conserva disposición y comportamiento de los accesos de copia/vista previa. Captura móvil inspeccionada; sin escrituras sobre datos reales.
- `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto. `bun run lint --staged`: 4 archivos sin hallazgos. `git diff --cached --check` y enlaces locales de planificación correctos.
- Base remota de `int` comprobada: `e0cef10cf2b66364fbf20502877c13376ed0d5f1`, igual a la base local. Revisado diff: solo componente y planificación de esta app, sin credenciales ni cambios ajenos; publicación se verifica al cierre.
