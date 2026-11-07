# Registro de entregas

Archivo histórico: [BILL-01 y BILL-02](archive/2026-11-01/bill-01-02.md), [BILL-03](archive/2026-11-01/bill-03.md), [BILL-04](archive/2026-11-01/bill-04.md), [BILL-05](archive/2026-11-01/bill-05.md), [BILL-06](archive/2026-11-02/bill-06.md), [BILL-07](archive/2026-11-02/bill-07.md), [BILL-08](archive/2026-11-02/bill-08.md), [BILL-09](archive/2026-11-02/bill-09.md), [BILL-10](archive/2026-11-02/bill-10.md), [BILL-11](archive/2026-11-02/bill-11.md).

Archivo adicional: [BILL-12](archive/2026-11-05/bill-12.md), [BILL-13](archive/2026-11-05/bill-13.md), [BILL-14](archive/2026-11-05/bill-14.md), [BILL-15](archive/2026-11-05/bill-15.md), [BILL-16](archive/2026-11-05/bill-16.md).

Archivo adicional: [BILL-17](archive/2026-11-07/bill-17.md).

Archivo adicional: [BILL-18](archive/2026-11-07/bill-18.md).

Archivo adicional: [BILL-19](archive/2026-11-07/bill-19.md).

Archivo adicional: [BILL-20](archive/2026-11-07/bill-20.md).

Archivo adicional: [BILL-21](archive/2026-11-07/bill-21.md).

Archivo adicional: [BILL-22](archive/2026-11-07/bill-22.md).

## BILL-23 — Menú de navegación en anchuras intermedias

- Inicio: 2026-11-05, rama `int`, base `0d524d0`, árbol limpio. Capacidad: 92 % en 5 h y 20 % en 7 d; margen suficiente para una entrega pequeña completa.
- Aceptación: [BILL-23](iterations.md#bill-23--menú-de-navegación-en-anchuras-intermedias).
- Reproducción estática antes del arreglo: el botón con `xl:hidden` está visible a 800/1100 px mientras el overlay con `sm:hidden` está oculto; a 390 px ambos visibles y a 1280 px ambos ocultos. Esto coincide con el síntoma aportado. No se añade una prueba que solo replique clases de implementación.

- Fix: `MobileMenuOverlay` cambia `sm:hidden` por `xl:hidden`, alineado con NavigationBar. Comparación posterior a 390/800/1100/1280 px correcta: ambos visibles por debajo de xl y ocultos desde xl. Sin cambios de hooks, foco, cierre, acciones ni datos; revisión React del cambio de CSS.
- Validación: Biome del componente correcto; tipos correctos; 998 pruebas correctas, 0 fallos; build webpack correcto (17,847 s). Caché remota no disponible; validación local completa. No se realizó comprobación interactiva en navegador. Se archiva BILL-13 para conservar diez entregas recientes.
- Prueba Vercel asociada: consulta previa al push confirma `enableAffectedProjectsDeployments: false` en card-wars y ningún Ignored Build Step configurado. No se modifica configuración remota. Los registros posteriores se consultan tras publicar; la ausencia de un registro no prueba por sí sola el contador interno de cuota.

## BILL-24 — Paleta oliva y terracota

- Inicio: 2026-11-05, rama `int`, base `11a5f3e`, árbol limpio, sin commits locales pendientes. Capacidad: 87 % en 5 h y 19 % en 7 d; estimación suficiente para completar con reservas.
- Aceptación: [BILL-24](iterations.md#bill-24--paleta-oliva-y-terracota).
- Implementación: las familias Tailwind existentes se mapean globalmente a oliva (acciones/ingresos), terracota (gastos/errores/borrado) y tonos cálidos (advertencias), con superficies crema y neutros oliva. Se mantienen las clases para cubrir también variantes responsive, dark, hover, focus y transparencias sin duplicar CSS por pantalla. Modo oscuro con fondos derivados y texto secundario aclarado. Colores de gráficos compartidos actualizados y selección de productos con anillo del tema en lugar del azul RGBA fijo. Marca Google y PDFs conservados.
- Contraste calculado: texto de botones principales 5,94:1, acciones destructivas 5,71:1, texto secundario claro 4,89:1 y oscuro 6,23:1. El tono 500 oliva se oscurece ligeramente respecto a la referencia para superar 4,5:1 con texto claro. No se afirma conformidad de todas las combinaciones, especialmente transparencias.
- Revisión React: solo clases de selección, sin cambios de estado, hooks, datos, dependencias ni comportamiento. Cobertura estática de colores de UI y constantes de gráficos revisada. No se realizó validación visual interactiva de las pantallas autenticadas; inventario de navegador disponible, sin sesión de billing verificada.
- Validación: Biome explícito de los tres archivos de código correcto; tipos correctos; 998 pruebas correctas, 0 fallos y 1835 assertions. Build webpack final correcto tras ajustar contraste (16,242 s). La caché remota no está disponible para tipos/tests, que se ejecutan localmente. El lint incremental sin preparar seleccionó cero archivos; se utiliza lint preparado al cierre. Se archiva BILL-14 para mantener diez entregas.

## BILL-25 — Superficies neutras y donuts originales

- Inicio: 2026-11-05, `int`, base `a306d74`, árbol limpio y sin commits pendientes. Capacidad: 81 % de 5 h y 18 % de 7 d; margen estimado suficiente con reservas.
- Aceptación: [BILL-25](iterations.md#bill-25--superficies-neutras-y-donuts-originales).
- Se identifica el tinte generalizado en la escala zinc sustituida por verdes, incluido texto y bordes. Ahora zinc usa grises cálidos poco saturados, tarjetas blancas y fondo marfil suave; el modo oscuro usa carbón cálido con texto neutro. Oliva/terracota quedan en acentos y estados existentes. No se modifican componentes ni comportamiento.
- CHART_COLORS restaurado byte a byte desde `11a5f3e`, comprobado con Git. Los diez colores multicolor originales vuelven a los donuts y sus leyendas.
- Contraste calculado: texto secundario sobre blanco 4,99:1; secundario oscuro sobre tarjeta 6,19:1; principal sobre blanco 6,45:1; destructivo sobre blanco 6,20:1. No equivale a una auditoría de todas las combinaciones.
- Validación: Biome explícito correcto, tipos correctos, 998 pruebas correctas y 0 fallos (1835 assertions), build webpack correcto. Caché remota no disponible; validaciones locales completas. Sin comprobación visual interactiva autenticada. Se archiva BILL-15 para conservar diez entregas recientes. Enlaces, diff y lint preparado se comprueban al cierre.
- Publicación Git prevista en `int` conforme al workflow; este corte no solicita un nuevo despliegue Vercel.

## BILL-26 — Temas y configuración por usuario

- Inicio: 2026-11-05, `int`, base `7e9fff7`, árbol limpio y sin commits pendientes. Capacidad inicial: 99 % de 5 h y 18 % de 7 d; estimación suficiente para implementar, validar y publicar con reservas.
- Aceptación y contrato: [BILL-26](iterations.md#bill-26--temas-y-configuración-por-usuario).
- Implementación: `/settings` usa PageLayout y selector etiquetado con Original/Oliva y terracota. Nombre/correo/avatar enlazan desde menú y escritorio; el menú se cierra al navegar. Confirmación compartida Toast, estado guardando y error con posibilidad de reintentar; sin cambio optimista que pudiera presentar como guardado un fallo.
- Persistencia: entidad/puerto/repositorio separados. Correo de sesión normalizado como `_id` de `userPreferences` (índice único automático), upsert por cuenta y Zod estricto. No se admite identidad en el cuerpo; parámetros de identidad en URL no tienen efecto. Guard requireAuth inyectado al handler, con sesión comprobada antes de persistir. GET/PUT privados sin caché HTTP compartida. No se modifica autenticación ni hay nuevas dependencias.
- Tema: roles semánticos centralizados con compatibilidad para utilidades existentes. Original fija valores Tailwind de la versión original de main (`11a5f3e`); Oliva conserva BILL-25. Root scope mediante `:has([data-palette])` cubre portales y fondo, incluidas variantes oscuras. El layout carga Mongo antes de renderizar; fallback SSR de SWR evita la consulta inicial duplicada y separa caché por cuenta. No hay localStorage. Donuts y PDFs sin cambios.
- Pruebas: 27 nuevas sobre default, aislamiento de dos cuentas, correo estable entre sesiones, rechazo 401/403 e identidad ausente, JSON inválido, esquema estricto e intento de cambiar otra cuenta, fallos de lectura/escritura, headers privados, helpers SWR y HTML inicial/enlace. Primer pase detectó un timeout por un caso vacío de `it.each` interpretado como callback done; corregido usando casos con cierre sin parámetros. Resultado final: 1025 pruebas correctas, 0 fallos y 1906 assertions (103 archivos).
- Navegador: banco temporal con componentes reales, CSS del build y handlers reales con usuarios ficticios/repositorio en memoria. Se comprobó guardar Oliva, toast, recarga que mantiene la selección, segunda cuenta en Original, regreso a la primera sin perder Oliva y apertura/cierre de Modal portaleado con la misma paleta. Estilo computado del botón: Original `oklch(0.546 0.245 262.881)`, Oliva `rgb(84, 100, 55)`. Consola sin avisos/errores. No demuestra persistencia contra Mongo real ni OAuth real; el adaptador y su filtro `_id` se revisan estáticamente. Banco detenido al terminar, sin cambios de datos reales.
- Validación: Biome de los 20 archivos de código/pruebas editados y nuevos, correcto; tipos correctos; build webpack correcto (18,09 s), incluidas `/settings` y `/api/user-preferences`. Caché remota no disponible, comprobaciones locales completas. Revisión React: SWR sin efectos de fetch, callbacks estables, identidad compartida, carga SSR, labels/foco/pending, sin listeners ni dependencias nuevas. Se archiva BILL-16 para mantener diez entregas. Enlaces locales, diff y lint preparado se comprueban al cierre; commit/push/SHA remoto se verifican al publicar.
- Herramientas: el CLI Postman instalado no admite `postman status` (`unknown command`); no se inicializa ni publica un workspace. El contrato queda en la iteración y las comprobaciones ejecutables usan los handlers locales con Bun.
- Sin despliegue Vercel en esta entrega.

## BILL-27 — Estudio de obligaciones fiscales del autónomo

- Inicio: 2026-11-07, rama `int`, árbol limpio y sin commits locales pendientes. Capacidad inicial: 99 % restante en 5 h y 13 % en 7 d.
- Aceptación: [BILL-27](iterations.md#bill-27--estudio-de-obligaciones-fiscales-del-autónomo).
- Entrega: [estudio fiscal](fiscalidad-autonomos.md) con calendario, condiciones por perfil, fuentes oficiales y casos de aceptación para futuras implementaciones. El foco es la persona física en territorio común. Los casos sectoriales y territoriales se identifican para evaluación específica.
- Validación: fechas de ejemplo contrastadas con el calendario AEAT, normativa de facturación contrastada con BOE y AEAT, destinos de enlaces locales comprobados y `git diff --check` correcto. Entrega documental.
- Se archiva BILL-17 para conservar diez entregas recientes.

## BILL-28 — Particularidades de Aragón y priorización fiscal

- Inicio: 2026-11-07, rama `int`, árbol limpio y sin commits pendientes. Capacidad inicial: 96 % restante en 5 h y 13 % en 7 d.
- Aceptación: [BILL-28](iterations.md#bill-28--particularidades-de-aragón-y-priorización-fiscal).
- Entrega: reglas autonómicas y circuito estatal, matriz de beneficio y regresión basada en las entidades existentes y primer corte propuesto de agenda y exportación.
- Validación: fuentes oficiales de Aragón, AEAT y BOA, revisión estática de Payment e Invoice, enlaces locales y diff. Entrega documental.
- Se archiva BILL-18 para conservar diez entregas recientes.

## BILL-29 — Agenda fiscal

- Inicio: rama `int`, árbol limpio. Capacidad inicial del 94 % en 5 h y 13 % en 7 d.
- Aceptación: [BILL-29](iterations.md#bill-29--agenda-fiscal).
- Entrega: página y API autenticada, catálogo AEAT 2026, sugerencias idempotentes y trámites manuales con seguimiento de presentación, pago y justificante. Fechas ajustadas a Madrid, catálogo corregible de forma explícita para trámites pendientes y persistencia aislada por cuenta.
- Validación: Biome sin hallazgos en los archivos editados, tipos y 1.033 pruebas correctas. Build webpack correcto tras repetir con acceso a Google Fonts. Las pruebas de contratos ejercitan aislamiento, altas, duplicados, actualización de fechas y fechas inválidas.
- Navegador: incorporación de 303 y alta de un trámite manual a 390 y 1440 px con Chrome y API simulada. No se ejercitaron OAuth ni MongoDB real. Los flujos de Mes, Año, facturas, encargos y cocciones se revisaron mediante la suite existente y el diff de las rutas y repositorios.
- Se archiva BILL-19 para conservar diez entregas recientes.

## BILL-30 — Borradores fiscales 303, 130 y 390

- Inicio: rama `int`, árbol limpio. Capacidad inicial del 82 % en 5 h y 11 % en 7 d.
- Aceptación: [BILL-30](iterations.md#bill-30--borradores-fiscales-303-130-y-390).
- Entrega: vista de borradores enlazada desde agenda, confirmación de facturas y datos adicionales por cuenta, subtotales por casilla y conciliación anual. Los casos especiales, incluidos rectificativas, quedan fuera del cálculo ordinario y visibles como incidencias.
- Validación: Biome, tipos, 1.040 pruebas y build webpack correctos. Casos de referencia sintéticos de exclusión de recibos, enlaces repetidos, facturas múltiples, devengo, invalidación, acumulado del 130 y conciliación del 390. Chrome con API simulada confirmó la revisión de una factura y el cambio entre 303, 130 y 390. Pendiente contraste autenticado en Preview con declaraciones reales de referencia.
- Se archiva BILL-20 para conservar diez entregas recientes.

## BILL-31 — Acceso a facturas y pagos desde borradores

- Inicio: rama `int`, árbol limpio. Capacidad inicial del 73 % en 5 h y 9 % en 7 d.
- Aceptación: [BILL-31](iterations.md#bill-31--acceso-a-facturas-y-pagos-desde-borradores).
- Entrega: enlaces HTTP(S) y PDFs en otra pestaña. Modal existente desde la factura y el desglose por casilla. El borrador se consulta de nuevo al actualizar, eliminar o cerrar el pago.
- Validación: Biome, tipos, 1.040 pruebas y build webpack correctos. Sin comprobación en navegador autenticado.
- Se archiva BILL-21 para conservar diez entregas recientes.

## BILL-32 — Cohesión de la interfaz fiscal

- Inicio: rama `int`, árbol limpio. Capacidad inicial del 68 % en 5 h y 9 % en 7 d.
- Aceptación: [BILL-32](iterations.md#bill-32--cohesión-de-la-interfaz-fiscal).
- Entrega: IVA y total del pago abren la modal desde el documento. El desglose vuelve a enlazar al documento y se elimina la acción separada. Agenda y Borradores usan superficies, controles, colores y estados de Billing, y Agenda reutiliza la modal y la confirmación de cabecera.
- Validación: Biome, tipos, 1.040 pruebas y build webpack correctos. Revisión estática de temas claro y oscuro; sin comprobación visual autenticada.
- Se archiva BILL-22 para conservar diez entregas recientes.
