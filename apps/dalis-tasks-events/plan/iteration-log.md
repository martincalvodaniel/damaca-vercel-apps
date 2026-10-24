# Registro de iteraciones

La evidencia reciente se mantiene aquí; el [archivo](archive/2026-10-24/README.md) conserva íntegra la historia anterior. Los porcentajes y decisiones operativas de registros históricos no son políticas vigentes.

<a id="23n"></a>
## 23n — Compatibilidad de Intl en calendario civil

Implementación: `civil-date.ts` y `zoned-time.ts` fijan locale `en-US` y calendario `gregory`, para que ICU exponga era `AD`/`BC` incluso cuando Bun ejecuta en Linux. La guardia de calendario civil sigue rechazando fechas antes del año 0001; el resolver zoned-time reconoce muestras auxiliares BC sin confundirlas con el año 1.

Regresiones: conversión del instante `0001-01-01` UTC, rechazo de año cero UTC y del año 1 al retroceder localmente a Honolulu, y resolución de `0001-01-01T00:00` en Honolulu. Se conserva la matriz previa de DST, día omitido, medianoche final, años bajos y eventos.

Validación: focalizadas28pass/163skip/0fail/173 expect; suite completa1386pass/225skip/0fail/15108 expect. Biome8 archivos, TypeScript, build Next/Turbopack y `git diff --check` pasan. Bun1.4.4 en Linux devuelve sólo año con iso8601 y año+era AD con gregory, reproduciendo la causa y verificando el fix. Las regresiones conservan rechazo BC fuera de rango y cubren el cálculo auxiliar BC para medianoche local del año0001.

La ejecución remota de Actions no se ha vuelto a lanzar: este checkout está en `main`, que permanece human-managed; no se hizo push ni despliegue. Sin DB, dependencias, esquema, cambios de zona por host ni artefactos de build versionados.


<a id="23m"></a>
## 23m — Tipado oficial de vercel.ts

vercel.ts importa type VercelConfig desde @vercel/config/v1 y anota config con el contrato oficial, sin casts ni tipos manuales. @vercel/config0.13.0 añadido como devDependency con versión exacta y bun.lock actualizado; instalación frozen aprobada sin cambios. No dependencia core ni import runtime: TypeScript elimina importtype. Export serializado comparado con23l idéntico (España/París/missing/deny), tipos del proyecto aprobados. Mismo esquema oficial validado en23l aplicable al objeto idéntico; no se atribuye despliegue ni prueba geográfica remota.

DoD:1386pass/225opt-in skip/0fail/15104aserciones, lint1117sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados.

Entrada28%5h/70%7d, reservas10%/1%, secuencial. Rama main conservada; commit local sin push ni despliegue. Sin cambios de aplicación/datos/índices/panel/permisos.


<a id="23l"></a>
## 23l — Vercel TypeScript: España y París

Nuevo vercel.ts con export config, regions:[cdg1] y routes/mitigate:deny para cualquier ruta cuyo header de geolocalización Vercel x-vercel-ip-country no coincida con ES (missing). España continúa al enrutado del framework; otros países y país ausente quedan bloqueados. No se añade nombreOnlySpain no admitido por rutas: es la equivalencia declarativa de la regla del screenshot, no una creación de regla nombrada en el panel. Funciones en París; recursos estáticos conservan distribución global. Mismo alcance en despliegues Preview/Production que incluyan el archivo, sin distinción de rama. No excepciones para API, auth o assets; no implementación de bloqueo en desarrollo local. Sin dependencias nuevas ni cambios de aplicación/datos/índices.

Fuentes: [configuración TypeScript](https://vercel.com/docs/project-configuration/vercel-ts), [WAF declarativo](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules), [header de país](https://vercel.com/docs/headers/request-headers#x-vercel-ip-country), [regiones](https://vercel.com/docs/regions) y [esquema oficial](https://openapi.vercel.sh/vercel.json). El paquete @vercel/config ofrece tipos/helpers opcionales; config exportado plano evita dependencia adicional. Validación de export con Bun, esquema oficial Draft4 con jsonschema temporal fuera del repo, lint y tipos del archivo aprobados. No se atribuye prueba geográfica/403 remota ni creación en panel: requiere despliegue posterior.

DoD final:1386pass/225opt-in skip/0fail/15104aserciones, lint1117sinavisos/tipos/Webpack16.4.2/worker46 aprobados; diff limpio. Build local no interpreta reglas del edgeVercel, por lo que no acredita bloqueo geográfico desplegado.

Rama actual main conservada, sin push ni despliegue productivo. Entrada33%5h/71%7d y control30/71; reservas10%/1%, secuencial. Dependencias existentes restauradas con install frozen sin cambios de manifests/lockfile para DoD.


<a id="23k"></a>
## 23k — Categorías sin desplegable e iconos directos

TagCard elimina details/summary y muestra lápiz SVG y cruz roja SVG a la derecha. RowActions extrae las acciones existentes de PlanCard para compartir iconos, estilos y áreas táctiles de44px; ambos mantienen nombres accesibles españoles y disabled mientras guardan. Nombre flexible, color y orderControl se conservan. TagManager mantiene sus callbacks y confirmación de borrado sin cambios.

Dos tests SSR cubren ausencia de desplegable, SVG/labels/color/orden, nombre largo y busy; regresión PlanCard intacta. Siete focalizadas/132aserciones; DoD1386pass/225opt-in skip/0fail/15104aserciones, lint1116sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados. Se corrigió un cierre JSX durante extracción antes de validar fuentes finales. Fixture local sin DB preparada con TagCard, TagForm y DeleteTagDialog reales; QA visual móvil NO ejecutada: inventario CUA sin navegadores y createBrowserTab iab no disponible. No se atribuye recorrido visual ni prueba de gestos nueva. Servidor propio retirado, sin pestañas creadas ni datos persistidos.

Entrada67%5h/76%7d, control54%/74%, reservas10%/1%, secuencial. Sin datos/índices/protocolo/dependencias/DBusuario/producción. Mismo commit/pushint/SHA/cuotas.


<a id="23j"></a>
## 23j — Sin espacios verticales sobrantes ni Ver más en agenda

Mi espacio elimina margen superior de Atrasadas mediante flushTop; separación de Hoy/Próximas se mantiene. Calendario usa padding horizontal y0vertical también en escritorio. usePlanAppearances elimina estado/botones de paginación y lee todas las páginas con modo all y tamaño500, conservando cursor/guardia de avance del lector puro. PlanList retira Ver más y aviso de página parcial de este consumidor. Modo numérico y tope mensual de otros callers se conservan.

Atrasadas materializa su rango histórico finito completo; Próximas materializa todas las repeticiones del horizonte visible30días ampliable. Series sin fin no se convierten en una lista infinita, ni se afirma que se muestran todas sus fechas futuras. Planes simples futuros siguen su selección vigente. Lectura sin escrituras/ACK, mismos filtros de estado/cancelación y contexto de orden.

Prueba de61series×2días: modoall entrega122slots únicos/sincursor y conserva entrada; modo numérico1 sigue paginado. DoD1384pass/225opt-in skip/0fail/15090aserciones, lint1114sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados. UI productiva propia390px con52seriesextra: Atrasadas1fila, Hoy62, Próximas5; cero botones Ver más y margen superior de primera sección0px (resto16px). La fixture de52extras termina cada una en su primera fecha, por eso no se atribuyen52extras a Próximas; regresión122slots acredita drenaje de intervalo. Captura /private/tmp/dalis-23j-full-agenda.png. Segunda fixture confirma paddingTop/paddingBottom0px del calendario; captura /private/tmp/dalis-23j-calendar-spacing.png.

Bases/particiones/control propios eliminados con ownership; pestañas/servidores retirados y viewport restablecido. Sin prueba física/Google/RPC nueva ni DBusuario/producción/índices/protocolo/dependencias. Entrada24%5h/88%7d, controles22/88 y19/87, reservas10%/1%, secuencial; mismo commit/pushint/SHA/cuotas.


<a id="23i"></a>
## 23i — Filas directas e iconos de acción; H1 móvil sin duplicar navegación

PlanCard elimina details/summary, flecha y selector de categoría de la fila. Título/fecha/estado, descripción compacta y checklist quedan visibles sin abrir un desplegable; contexto de serie permanece accesible. Lápiz SVG y cruz SVG roja aparecen directamente a la derecha, cada botón con área44px, nombre/título español y disabled mientras guarda. Se conservan editor y diálogos de eliminar/cancelar aparición; categoría se cambia por arrastre o editor. PlanList retira estado de expansión y mutación/foco exclusivos del antiguo selector, sin alterar colapsado de Atrasadas/Hoy/Próximas ni sus contadores.

WorkspaceHeading de las cuatro pantallas de navegación usa sr-only en móvil y md:not-sr-only en escritorio; H1 semántico, document.title y foco de navegación se conservan. No se ocultan encabezados de autenticación o avisos que no duplican la navegación. Nueva superficie no interactiva data-plan-drag-surface sustituye summary en fixture del gesto.

Seis pruebas focalizadas/142aserciones de cuatro variantes/checklist/iconos/labels/busy y cuatro títulos responsive. DoD1383pass/225opt-in skip/0fail/15084aserciones, lint1114sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados. UI productiva propia a390px: cero details/select en filas, accionesSVG de44px, editor abierto directamente con Categoría disponible y cancelado sin cambios; cruz abre confirmación y Conservar plan no borra. Cambio a Calendario y Touch sintetizado ordena Plan3→Plan1→Plan2: un task.move pending/attempt0, padres/slots/preferencias intactos. Captura /private/tmp/dalis-23i-plan-actions.png. No se atribuye prueba física ni nueva matriz RPC/remota.

Fixture de navegación sin DB: H1 móvil de1×1px/positionabsolute, Categorías recibe foco tras navegación; a1024px vuelve apositionstatic/altura36px. Bases/partición de planes propias eliminadas, pestañas/servidores retirados y viewport restablecido. Sin datos/índices/protocolo/dependencias/DBusuario/producción. Entrada34%5h/90%7d y control27%/89%, reservas10%/1%, secuencial; mismo commit/pushint/SHA/cuotas.


<a id="23h"></a>
## 23h — Calendario más compacto

Altura mínima de cada día reducida de56a44px (min-h-14→min-h-11), conservando superficie táctil de44px, bordes, colores/estado, selección, navegación y destinos de arrastre. Sólo cambia esta claseCSS. Sin nuevas pruebas que reflejen literalmente la implementación. Suite vigente1381pass/225opt-in skip/0fail/15041aserciones, lint1113sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados.

QA de PlanCalendarBoard productivo con cuenta/IndexedDB propios a390px:35celdas renderizadas, altura real44px uniforme; captura /private/tmp/dalis-23h-calendar-compact.png. Datos/bases propios eliminados, pestaña/servidor retirados y viewport restablecido. Sin nueva prueba de gestos/RPC/Google/dispositivo físico ni cambios de datos/protocolo/índices/dependencias. Entrada39%5h/90%7d, reservas10%/1%, secuencial; mismo commit/pushint/SHA/cuotas, sin DBusuario/producción.


<a id="23g"></a>
## 23g — Arrastre entre categorías del mismo día

Hoy y día del Calendario permiten soltar un plan antes/después de una fila de otra categoría, en su cabecera para añadirlo al final o en una categoría vacía/Sin categoría. Destinos vacíos se revelan sólo durante el gesto; no añaden bloques vacíos permanentes. Se amplía LongPressOrder con grupos tipados y scope propio de sección, vecinos calculados del catálogo actual y previsualización accesible. Fingerprint/busy/escape preservados. Se captura destino antes de retirar selección, para que una zona vacía no desaparezca antes del hit-test. Pulsación inmóvil requiere desplazamiento>12px para evitar cambios al revelarse zonas por encima de la fila.

PlanList usa un único task.move productivo que ya guarda vista de categoría y posiciones en la misma TX/outbox; sin concatenar dos mutaciones ni ACK local. El motor remoto ya soporta esta operación y no cambia. Para una aparición, asignación pertenece al padre y cambia toda la serie; preview lo advierte, y vecinos incluyen hermanos visibles de ese padre que entrarán también en destino. La posición se guarda sólo en fecha/slot elegido. Atrasadas/Próximas continuas no son destinos de este gesto; se mantienen fecha-drop del Calendario y teclado dentro de categoría/selector accesible.

Veinte pruebas focalizadas/205aserciones con vecinos primero/medio/último/vacío, destinos obsoletos/duplicados y no-op de mismo grupo, SSR vacío sólo durante gesto y8casos contra planner real (cuatro variantes×simple/aparición, incluidos hermanos solapados). Comprueban comando validado, vista+placement conjunto, snapshot intacto, fecha/identidad originales y vacíos. DoD final1381pass/225opt-in skip/0fail/15041aserciones, lint1113sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados. Sin cambios de esquema/protocolo/ejecutor/índices, por lo que no se repite matriz Mongo/Next remota histórica ni se atribuye ACK/convergencia nueva.

Fixture Touch sintetizada sobre PlanAgenda/PlanCalendarBoard reales+IndexedDB propio a390px: cinco movimientos (simple→otra categoría antes/después, retorno a categoría vacía, serie→Vacía→Sin categoría), en ambas vistas. Tras recarga, vista y orden Plan2→Plan1 correctos, categoría de serie y futuras apariciones coherentes, cinco comandos pending/attempt0/sinlease y contenido/slots/tags/settings idénticos al baseline. Escape y pulsación sin desplazar no añaden operación. Primer intento de cancelación del harness falló al identificar preview por coordenadas junto al borde/auto-scroll; se centraron source/destino y se repitió tras recarga con preview válido y cancelación confirmada, sin alterar aserciones de persistencia. Regresión independiente del arrastre dentro de categoría en Calendario pasa (Plan3→Plan1→Plan2, un comando pending). No evidencia de nuevo dispositivo físico ni Google/RPC. Captura /private/tmp/dalis-23g-category-drag.png. Particiones/bases de control propias eliminadas con ownership, pestañas/servidores retirados y viewport restaurado.

Entrada59%5h/94%7d, controles54/93,51/92 y42/91; reservas10%/1%, secuencial, sin créditos/reinicios/programación. Mismo commit/pushint/SHA/cuotas. No DBusuario/producción/dependencias nuevas.


<a id="23f"></a>
## 23f — Completados azules y mes expandido automáticamente

Completados pasa de verde a azul700/negrita en claro y azul400/negrita en oscuro. Se identifica y reproduce una causa del color ausente: la primera página de repeticiones dejaba nextCursor y la guardia global desactivaba completados para todo el mes. El consumidor mensual ahora expande automáticamente páginas locales con el lector existente, máximo50páginas de500, rango validado de42días. No requiere pulsar Completar mes; si se alcanza el límite o hay errores, mantiene protección contra afirmar todos completados sin evidencia y orienta a un día concreto. Paginación de Mi espacio/días individuales, datos y protocolo intactos.

Prueba con93excepciones completadas: lectura anterior conserva cursor, nueva lectura completa93/31días con3porfecha, sin pendientes; reabrir última excepción en página posterior deja sólo31oct pendiente. Entradas intactas y rechazo de rango excesivo antes de expansión. SSR valida azul seleccionado y guardias de evidencia/carga parcial.17focalizadas/127aserciones; DoD1370pass/225opt-in skip/0fail/14939aserciones, lint1111sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados.

UI productiva+IndexedDB propio: tres planes completados vuelven el día azul visible, peso calculado700 y color oklch(0.707 0.165 254.624) en oscuro; al reabrir uno vuelve rojo. Captura390px /private/tmp/dalis-23f-calendar-blue.png. La expansión93 se prueba en núcleo real, no se atribuye a esta fixture de3planes. Prueba y bases propias eliminadas, pestaña/servidor retirados y viewport restablecido. No se ha inspeccionado la cuenta del usuario ni se afirma causa única de su dispositivo; sin RPC/Google/prueba física nueva ni DBusuario/producción. Entrada66%5h/95%7d, control63%/94%, reservas10%/1%; mismo commit/pushint/SHA/cuotas.


<a id="23e"></a>
## 23e — Día rojo o verde sin recuento

El calendario elimina número de planes, punto y leyenda de recuento. El número del día es rojo/negrita con al menos un plan sin completar, verde/negrita cuando todos sus planes conocidos están completados y neutro sin planes. Selección usa borde/fondo neutro para no tapar el estado; hoy mantiene borde reconocible. Rojo700/verde700 en claro y400 en oscuro. Etiquetas accesibles españolas anuncian estado sin recuento. No se afirma completado si la evidencia de progreso falta, quedan páginas de apariciones o hay errores de expansión; los pendientes conocidos sí quedan rojos. Mensajes/botón de carga mensual ya no hablan de recuento.

SSR de selección en cada estado, vacío, ausencia de evidencia y página parcial. Catorce pruebas focalizadas/114aserciones iniciales; añadida guardia parcial después de inspeccionar consumidor mensual. DoD final1368pass/225opt-in skip/0fail/14929aserciones, lint1111sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados sobre fuentes finales. Cálculo común de fechas/apariciones sigue intacto, sin nueva persistencia/protocolo/índice.

QA de PlanCalendarBoard real con IndexedDB propio: hoy rojo con tres planes; completar los tres lo vuelve verde y mantiene mañana/pasado rojos; reabrir uno vuelve hoy rojo. Vacíos neutros, sin contador ni punto. Captura390px /private/tmp/dalis-23e-calendar.png. Prueba/bases propias eliminadas, servidor/pestaña retirados y viewport restablecido. La guardia de carga parcial posterior se valida en SSR; no se atribuye recorrido UI parcial ni RPC/Google/físico nuevos. Entrada73%5h/96%7d y control68%/95%, reservas10%/1%; mismo commit/pushint/SHA/cuotas, sin DBusuario/producción.
