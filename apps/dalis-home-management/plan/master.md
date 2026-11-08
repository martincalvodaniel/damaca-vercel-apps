# Dalis Home Management — plan maestro

## Estado vigente

Las completadas del día ofrecen corrección/eliminación y etiqueta de autor con sus colores comunes. El buscador de Tareas ignora mayúsculas y diacríticos.

Autoría de Tareas: Ambos, Dani y Pali comparten verde primario con nombres visibles en selector, día e histórico. La corrección permite cambiar persona y fecha; las programaciones pendientes del histórico se pueden reprogramar o cancelar. El buscador solo filtra las fichas padre, sin sugerencias y sin distinguir mayúsculas ni acentos.

El histórico de Tareas incluye ejecuciones y ocurrencias pendientes con sus fechas previstas. Las sugerencias fantasma desaparecen al existir una programación pendiente desde hoy, aunque sea posterior al límite; los avisos de periodicidad mantienen su cálculo independiente.

HM-16 amplía Tareas con periodicidad opcional, catálogo horizontal filtrable, navegación mensual por gesto, sugerencias de programación al límite y autoría de ejecuciones (Dani, Pali o Ambos). Las tareas sin periodicidad no generan avisos ni sugerencias; las ejecuciones antiguas conservan su autoría desconocida.

La página de Tareas incorpora catálogo compartido, calendario mensual e histórico de ejecuciones; su aceptación y evidencia se registran en HM-11.

Los platos admiten una receta u observaciones opcionales como texto libre de hasta 10.000 caracteres. Se pueden añadir, editar, borrar y consultar desde el recetario y el menú semanal, conservando saltos de línea. Los platos existentes sin notas siguen siendo válidos; no se requiere migración.

## Interfaz vigente

- Carrusel de Tareas con contención de layout/pintado para evitar expansión del viewport móvil; advertencias de periodicidad mediante icono junto a la fecha límite.

- Densidad móvil obligatoria para páginas nuevas e iteraciones visuales según el [contrato de diseño](../docs/design-system.md#densidad-móvil-obligatoria), con controles compactos y acciones por iconos accesibles.
- Listas compactas en Inventario, Compra, Platos, Menú y Tareas, con padding superior de 8px. Títulos de escritorio visibles y títulos móviles ocultos.
- Tareas utiliza barra móvil sin presentación, fechas compactas con valor completo accesible y acciones por iconos; fichas y calendario densos, manteniendo datos y avisos.
- Menú con rango semanal y etiqueta `X/14`, selector y vaciado en una fila. «Vaciar semana» siempre visible y deshabilitado si está vacía. Copia y vista previa son accesos compactos excluyentes; copia lleva flecha izquierda y texto derecho.
- Filtros de compra desplazables horizontalmente sin barra visible. Buscadores con cruz roja siempre visible cuando hay texto.
- Modales de pantalla completa con cruz roja, título y tick verde en cabecera independiente del scroll; contenido desde arriba, adaptación al viewport visual y zonas seguras.

## Decisiones de color aceptadas

Aplicar el [sistema de diseño](../docs/design-system.md) al crear o modificar UI. Centralizar la paleta clara/oscura en tokens por función, usar superficies comunes, acciones principales y foco uniformes, separar estados de acentos de sección y mantener contraste AA. Los productos comprados conservan legibilidad. Los valores cromáticos pertenecen a `globals.css`; la documentación fija sus reglas de uso.

## Límites aceptados

Conservar el comportamiento, arquitectura, seguridad, datos y límites de despliegue documentados en [AGENTS.md](../AGENTS.md). El [workflow común](../../../plan/workflow.md) define el proceso de entrega y el contrato documental.

## Dudas abiertas

No hay dudas abiertas para el alcance actual.

## Application icons

Browser and home-screen icons use local SVG sources, a 16/32/48-pixel ICO fallback, installation PNGs and an Apple Touch Icon. Existing PWA manifests also declare an opaque maskable variant. Regenerate with `bun run icons:generate` from the repository root. Shared status and evidence: [AGW-10](../../../plan/iterations.md#agw-10--application-favicons) and [delivery log](../../../plan/iteration-log.md#agw-10-application-favicons).

La publicación Vercel pasa a ser manual bajo petición mediante `git.deploymentEnabled: false`. Registro transversal: [AGW-17](../../../plan/iterations.md#agw-17--manual-vercel-deployments).

## Tareas recurrentes del hogar (HM-11)

Nueva página independiente `/household-tasks`, con datos compartidos y acceso autorizado en navegación. Periodicidad máxima en días, aviso desde el 80% sin programación a tiempo, vencimiento persistente y ausencia de avisos antes de la primera ejecución. Calendario mensual con arrastre y alternativa por fecha; rojo si queda alguna pendiente, verde si todas se completan y neutro sin tareas. Histórico con fecha real independiente de la prevista, corrección y eliminación. Archivo conserva histórico y retira pendientes con confirmación. Sin cambios fuera de esta app ni cambios funcionales de otras páginas.

La persistencia de HM-11 es compatible con MongoDB standalone: escrituras condicionales por documento, unicidad tarea/día y archivo previo a la limpieza de pendientes. Las lecturas ocultan pendientes archivadas incluso si falla la limpieza; reintentar el archivo la completa. La fecha real corregida conserva la fecha prevista si existía programación; para ejecuciones no programadas mueve también el registro del calendario. Eliminar una ejecución de una tarea archivada retira el registro sin reabrir pendientes. Fechas admitidas de 1900 a 2199; periodicidad de 1 a 36.500 días.

Los controles de Tareas se mantienen compactos y accesibles según HM-12/HM-13: restauración de archivadas, histórico alineado y check reversible directo para completar o deshacer eventos diarios.

La instalación web en modo independiente se documenta en [AGW-21](../../../plan/iterations.md#agw-21--manifiestos-de-instalación-para-billing-y-home-management).

Los nombres de instalación por rama se documentan en [AGW-23](../../../plan/iterations.md#agw-23--nombres-de-instalación-de-dalis).
