# Evidencia archivada el 2026-11-18

<a id="23h"></a>

## 23h — Calendario más compacto

Altura mínima de cada día reducida de56a44px (min-h-14→min-h-11), conservando superficie táctil de44px, bordes, colores/estado, selección, navegación y destinos de arrastre. Sólo cambia esta claseCSS. Sin nuevas pruebas que reflejen literalmente la implementación. Suite vigente1381pass/225opt-in skip/0fail/15041aserciones, lint1113sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados.

QA de PlanCalendarBoard productivo con cuenta/IndexedDB propios a390px:35celdas renderizadas, altura real44px uniforme; captura /private/tmp/dalis-23h-calendar-compact.png. Datos/bases propios eliminados, pestaña/servidor retirados y viewport restablecido. Sin nueva prueba de gestos/RPC/Google/dispositivo físico ni cambios de datos/protocolo/índices/dependencias. Entrada39%5h/90%7d, reservas10%/1%, secuencial; mismo commit/pushint/SHA/cuotas, sin DBusuario/producción.

<a id="23i"></a>

## 23i — Filas directas e iconos de acción; H1 móvil sin duplicar navegación

PlanCard elimina details/summary, flecha y selector de categoría de la fila. Título/fecha/estado, descripción compacta y checklist quedan visibles sin abrir un desplegable; contexto de serie permanece accesible. Lápiz SVG y cruz SVG roja aparecen directamente a la derecha, cada botón con área44px, nombre/título español y disabled mientras guarda. Se conservan editor y diálogos de eliminar/cancelar aparición; categoría se cambia por arrastre o editor. PlanList retira estado de expansión y mutación/foco exclusivos del antiguo selector, sin alterar colapsado de Atrasadas/Hoy/Próximas ni sus contadores.

WorkspaceHeading de las cuatro pantallas de navegación usa sr-only en móvil y md:not-sr-only en escritorio; H1 semántico, document.title y foco de navegación se conservan. No se ocultan encabezados de autenticación o avisos que no duplican la navegación. Nueva superficie no interactiva data-plan-drag-surface sustituye summary en fixture del gesto.

Seis pruebas focalizadas/142aserciones de cuatro variantes/checklist/iconos/labels/busy y cuatro títulos responsive. DoD1383pass/225opt-in skip/0fail/15084aserciones, lint1114sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados. UI productiva propia a390px: cero details/select en filas, accionesSVG de44px, editor abierto directamente con Categoría disponible y cancelado sin cambios; cruz abre confirmación y Conservar plan no borra. Cambio a Calendario y Touch sintetizado ordena Plan3→Plan1→Plan2: un task.move pending/attempt0, padres/slots/preferencias intactos. Captura /private/tmp/dalis-23i-plan-actions.png. No se atribuye prueba física ni nueva matriz RPC/remota.

Fixture de navegación sin DB: H1 móvil de1×1px/positionabsolute, Categorías recibe foco tras navegación; a1024px vuelve apositionstatic/altura36px. Bases/partición de planes propias eliminadas, pestañas/servidores retirados y viewport restablecido. Sin datos/índices/protocolo/dependencias/DBusuario/producción. Entrada34%5h/90%7d y control27%/89%, reservas10%/1%, secuencial; mismo commit/pushint/SHA/cuotas.
