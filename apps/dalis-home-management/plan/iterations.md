# Iteraciones

El contrato común de planificación para esta app se estableció en la entrega transversal [AGW-01](../../../plan/iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental). El [workflow raíz](../../../plan/workflow.md) es el único protocolo.

## HM-01 — Receta y observaciones opcionales

- Estado: `validated`.
- Objetivo: guardar y consultar texto libre opcional por plato.
- Rutas: `src/schemas/dish*`, `src/lib/db/dishes*`, `src/features/meal-planning/actions.ts`, `src/features/meal-planning/components/` y `plan/`.
- Dependencias: flujo actual de platos, sin nuevas dependencias, consultas ni índices.
- Aceptación: crear y editar con o sin notas; recuperar y borrar notas; conservar saltos de línea; consulta en recetario y menú; compatibilidad con documentos existentes; validar límite de 10.000 caracteres en cliente y servidor.
- Validación prevista: Biome incremental, tipos, tests de la app, build y revisión del diff.
- Evidencia: [HM-01](iteration-log.md#hm-01--receta-y-observaciones-opcionales).

## HM-02 — Listas compactas y limpieza de búsquedas

- Estado: `validated`.
- Objetivo: mostrar más información en las cuatro páginas y mantener una cruz roja para limpiar cualquier búsqueda no vacía, incluso sin foco.
- Rutas: `src/components/ui/`, componentes de listas y menú en `src/features/`, y `plan/`.
- Dependencias: componentes existentes; sin nuevas dependencias ni cambios de datos.
- Aceptación: reducir padding, márgenes y separaciones verticales en inventario, compra, recetario y menú; conservar acciones y legibilidad; cruz roja visible con texto, oculta sin texto y accesible con teclado en búsquedas y selectores con búsqueda.
- Validación prevista: Biome incremental, tipos, tests de la app, build y revisión del diff.
- Evidencia: [HM-02](iteration-log.md#hm-02--listas-compactas-y-limpieza-de-búsquedas).

## HM-03 — Cabeceras y vista previa compactas

- Estado: `validated`.
- Objetivo: reducir el hueco entre divisor y buscadores, compactar el acceso a vista previa y alinear navegación y vaciado de semana.
- Rutas: gestores de inventario, compra y platos; `meal-plan-page.tsx`, `shopping-list-preview.tsx`, `clear-week-button.tsx`; páginas y cabeceras de listas; `plan/`.
- Dependencias: componentes existentes, sin cambios de datos ni dependencias nuevas.
- Aceptación: separación superior de 8px en las tres listas; vista previa en una fila con contador numérico a la derecha del título; selector y vaciado de semana en la misma fila también en móvil, sin desbordamiento; ocultar títulos y textos de presentación redundantes en escritorio, conservar títulos móviles y rango semanal.
- Validación prevista: Biome, tipos, tests, build Webpack y comprobación visual aislada de disposición responsive.
- Evidencia: [HM-03](iteration-log.md#hm-03--cabeceras-y-vista-previa-compactas).

## HM-04 — Corregir visibilidad responsive de títulos

- Estado: `validated`.
- Objetivo: conservar títulos en escritorio y ocultarlos en móvil según la corrección explícita del usuario.
- Rutas: páginas de inventario, compra, platos y menú; cabeceras de las tres listas, calendario y botón de vaciado semanal; `plan/`.
- Dependencias: disposición compacta de HM-03.
- Aceptación: títulos y presentación visibles desde 640px y ocultos por debajo; conservar buscadores, contador, rango semanal y controles compactos; eliminar el texto de ayuda sobre arrastrar; mantener «Vaciar semana» visible y deshabilitado cuando no hay comidas planificadas.
- Validación prevista: Biome, tipos, tests, build Webpack y verificación responsive en Chrome.
- Evidencia: [HM-04](iteration-log.md#hm-04--corregir-visibilidad-responsive-de-títulos).

## HM-05 — Acceso compacto para copiar semana anterior

- Estado: `validated`.
- Objetivo: sustituir el panel de copia de semana por un botón con el aspecto invertido del acceso a vista previa.
- Rutas: `src/features/meal-planning/components/copy-previous-week-button.tsx` y `plan/`.
- Dependencias: estilos compactos de vista previa y acción de copia existentes.
- Aceptación: eliminar título, descripción y contenedor decorativo del panel; botón de ancho completo con mismos colores, altura y forma que vista previa; flecha a la izquierda y texto alineado a la derecha; conservar copia, estado de carga y errores; accesos de copia y vista previa mutuamente excluyentes.
- Validación prevista: Biome, tipos, tests, build Webpack y revisión responsive aislada.
- Evidencia: [HM-05](iteration-log.md#hm-05--acceso-compacto-para-copiar-semana-anterior).

## HM-06 — Contador semanal compacto

- Estado: `validated`.
- Objetivo: sustituir la frase de comidas planificadas por una etiqueta visual `X/Y`.
- Rutas: `src/features/meal-planning/components/meal-plan-page.tsx` y `plan/`.
- Dependencias: número actual de comidas planificadas, sin cambios de datos.
- Aceptación: mostrar únicamente `X/14` dentro de una etiqueta compacta junto al rango semanal, conservando descripción accesible y adaptación a móvil/escritorio.
- Validación prevista: Biome, tipos, tests, build Webpack y revisión visual aislada.
- Evidencia: [HM-06](iteration-log.md#hm-06--contador-semanal-compacto).

## HM-07 — Ocultar barra horizontal de filtros

- Estado: `validated`.
- Objetivo: ocultar la barra horizontal en Compra e Inventario conservando el desplazamiento.
- Rutas: `src/features/catalog/components/purchase-place-filter.tsx` y `plan/`.
- Dependencias: filtro compartido de lugares de compra, sin cambios funcionales ni dependencias nuevas.
- Aceptación: barra invisible con soporte estándar y WebKit; contenido horizontal desplazable y filtros accesibles mediante teclado.
- Validación prevista: Biome, tipos, tests, build Webpack y comprobación de scroll en Chrome.
- Evidencia: [HM-07](iteration-log.md#hm-07--ocultar-barra-horizontal-de-filtros).

## HM-08 — Modales móviles adaptadas al teclado

- Estado: `validated`.
- Objetivo: abrir todas las modales móviles en la parte superior y adaptar su altura al área visible al aparecer el teclado.
- Rutas: `src/hooks/use-dialog-viewport.ts`, `src/components/ui/*dialog.tsx`, diálogo de catálogo, vista previa/ejecución de comidas, `src/app/globals.css` y `plan/`.
- Dependencias: dialog nativo y VisualViewport del navegador; sin dependencias nuevas.
- Aceptación: modales superiores en móvil con margen seguro, altura limitada al área visible y contenido desplazable; formularios accesibles al reducirse el viewport por teclado; paneles de altura completa y diálogos anidados compatibles; escritorio centrado; conservar cierre, foco y bloqueo del fondo.
- Validación prevista: Biome, tipos, tests, build Webpack y Chrome con reducción simulada del viewport visual, navegación por formularios y comprobación desktop.
- Evidencia: [HM-08](iteration-log.md#hm-08--modales-móviles-adaptadas-al-teclado).

## HM-09 — Modales de pantalla completa y acciones superiores

- Estado: `validated`.
- Objetivo: adoptar el patrón de edición de Tasks, con modales de pantalla completa, contenido de arriba abajo y acciones superiores independientes del scroll.
- Rutas: diálogos y nueva cabecera compartida en `src/components/ui/`, formularios de inventario/compra/platos/catálogo, vista previa y ejecución, gestores, `src/app/globals.css`, `plan/`.
- Dependencias: controles nativos de formulario, hook de viewport de HM-08 y referencia de Tasks (solo lectura); sin nuevas dependencias.
- Aceptación: pantalla completa en móvil y escritorio; cruz roja izquierda y tick verde derecha, título centrado y cabecera siempre visible; validación y envío nativos, accesibilidad y estados pendientes conservados; contenido desplazable desde arriba; teclado y diálogos anidados compatibles; sin botones duplicados al pie.
- Validación prevista: Biome, tipos, tests, build Webpack y Chrome con scroll, validación, envíos aislados, teclado simulado y diálogos anidados.
- Evidencia: [HM-09](iteration-log.md#hm-09--modales-de-pantalla-completa-y-acciones-superiores).
