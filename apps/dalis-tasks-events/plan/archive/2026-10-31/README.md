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
