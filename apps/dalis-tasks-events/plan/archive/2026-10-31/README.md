# Archivo de planificación — 2026-10-31

Se conserva íntegramente la entrega más antigua para mantener diez entregas recientes. [Iteraciones vigentes](../../iterations.md) · [Registro vigente](../../iteration-log.md).

## 23f — Completados azules y expansión mensual

- Estado: `validated`.
- Objetivo: Evitar que una página parcial oculte completados del calendario.
- Rutas: Cuadrícula mensual, lector de apariciones y pruebas.
- Dependencias: Lector paginado local existente.
- Aceptación: Expandir dentro de límites; no afirmar mes completo si hay páginas pendientes, errores o tope alcanzado.
- Validación prevista: Pruebas con >50 apariciones, SSR y revisión UI de completar/reabrir.
- Evidencia: [registro](#23f).


<a id="23f"></a>
## 23f — Completados azules y mes expandido automáticamente

Completados pasa de verde a azul700/negrita en claro y azul400/negrita en oscuro. Se identifica y reproduce una causa del color ausente: la primera página de repeticiones dejaba nextCursor y la guardia global desactivaba completados para todo el mes. El consumidor mensual ahora expande automáticamente páginas locales con el lector existente, máximo50páginas de500, rango validado de42días. No requiere pulsar Completar mes; si se alcanza el límite o hay errores, mantiene protección contra afirmar todos completados sin evidencia y orienta a un día concreto. Paginación de Mi espacio/días individuales, datos y protocolo intactos.

Prueba con93excepciones completadas: lectura anterior conserva cursor, nueva lectura completa93/31días con3porfecha, sin pendientes; reabrir última excepción en página posterior deja sólo31oct pendiente. Entradas intactas y rechazo de rango excesivo antes de expansión. SSR valida azul seleccionado y guardias de evidencia/carga parcial.17focalizadas/127aserciones; DoD1370pass/225opt-in skip/0fail/14939aserciones, lint1111sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados.

UI productiva+IndexedDB propio: tres planes completados vuelven el día azul visible, peso calculado700 y color oklch(0.707 0.165 254.624) en oscuro; al reabrir uno vuelve rojo. Captura390px /private/tmp/dalis-23f-calendar-blue.png. La expansión93 se prueba en núcleo real, no se atribuye a esta fixture de3planes. Prueba y bases propias eliminadas, pestaña/servidor retirados y viewport restablecido. No se ha inspeccionado la cuenta del usuario ni se afirma causa única de su dispositivo; sin RPC/Google/prueba física nueva ni DBusuario/producción. Entrada66%5h/95%7d, control63%/94%, reservas10%/1%; mismo commit/pushint/SHA/cuotas.

## 23g — Movimiento entre categorías

- Estado: `validated`.
- Objetivo: Permitir mover un plan antes/después o a una categoría vacía en el mismo día.
- Rutas: LongPressOrder, agrupación, PlanList, calendario, núcleo puro y pruebas.
- Dependencias: Operación `task.move` y persistencia existentes.
- Aceptación: Guardar categoría/posición en una operación; preservar fecha y estado; gestionar series, cancelación y destinos obsoletos con guardias.
- Validación prevista: Pruebas de planner, gesto UI, recarga/cola y regresiones pertinentes.
- Evidencia: [registro](#23g).


<a id="23g"></a>
## 23g — Arrastre entre categorías del mismo día

Hoy y día del Calendario permiten soltar un plan antes/después de una fila de otra categoría, en su cabecera para añadirlo al final o en una categoría vacía/Sin categoría. Destinos vacíos se revelan sólo durante el gesto; no añaden bloques vacíos permanentes. Se amplía LongPressOrder con grupos tipados y scope propio de sección, vecinos calculados del catálogo actual y previsualización accesible. Fingerprint/busy/escape preservados. Se captura destino antes de retirar selección, para que una zona vacía no desaparezca antes del hit-test. Pulsación inmóvil requiere desplazamiento>12px para evitar cambios al revelarse zonas por encima de la fila.

PlanList usa un único task.move productivo que ya guarda vista de categoría y posiciones en la misma TX/outbox; sin concatenar dos mutaciones ni ACK local. El motor remoto ya soporta esta operación y no cambia. Para una aparición, asignación pertenece al padre y cambia toda la serie; preview lo advierte, y vecinos incluyen hermanos visibles de ese padre que entrarán también en destino. La posición se guarda sólo en fecha/slot elegido. Atrasadas/Próximas continuas no son destinos de este gesto; se mantienen fecha-drop del Calendario y teclado dentro de categoría/selector accesible.

Veinte pruebas focalizadas/205aserciones con vecinos primero/medio/último/vacío, destinos obsoletos/duplicados y no-op de mismo grupo, SSR vacío sólo durante gesto y8casos contra planner real (cuatro variantes×simple/aparición, incluidos hermanos solapados). Comprueban comando validado, vista+placement conjunto, snapshot intacto, fecha/identidad originales y vacíos. DoD final1381pass/225opt-in skip/0fail/15041aserciones, lint1113sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados. Sin cambios de esquema/protocolo/ejecutor/índices, por lo que no se repite matriz Mongo/Next remota histórica ni se atribuye ACK/convergencia nueva.

Fixture Touch sintetizada sobre PlanAgenda/PlanCalendarBoard reales+IndexedDB propio a390px: cinco movimientos (simple→otra categoría antes/después, retorno a categoría vacía, serie→Vacía→Sin categoría), en ambas vistas. Tras recarga, vista y orden Plan2→Plan1 correctos, categoría de serie y futuras apariciones coherentes, cinco comandos pending/attempt0/sinlease y contenido/slots/tags/settings idénticos al baseline. Escape y pulsación sin desplazar no añaden operación. Primer intento de cancelación del harness falló al identificar preview por coordenadas junto al borde/auto-scroll; se centraron source/destino y se repitió tras recarga con preview válido y cancelación confirmada, sin alterar aserciones de persistencia. Regresión independiente del arrastre dentro de categoría en Calendario pasa (Plan3→Plan1→Plan2, un comando pending). No evidencia de nuevo dispositivo físico ni Google/RPC. Captura /private/tmp/dalis-23g-category-drag.png. Particiones/bases de control propias eliminadas con ownership, pestañas/servidores retirados y viewport restaurado.

Entrada59%5h/94%7d, controles54/93,51/92 y42/91; reservas10%/1%, secuencial, sin créditos/reinicios/programación. Mismo commit/pushint/SHA/cuotas. No DBusuario/producción/dependencias nuevas.
