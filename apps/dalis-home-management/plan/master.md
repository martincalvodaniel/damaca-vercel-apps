# Dalis Home Management — plan maestro

## Estado vigente

Los platos admiten una receta u observaciones opcionales como texto libre de hasta 10.000 caracteres. Se pueden añadir, editar, borrar y consultar desde el recetario y el menú semanal, conservando saltos de línea. Los platos existentes sin notas siguen siendo válidos; no se requiere migración.

Las cuatro páginas (inventario, compra, recetario y menú semanal) usan listas compactas con menor espacio vertical. El padding superior de las listas es de 8px. El acceso a la vista previa de compra muestra el contador junto al título, y la navegación y el vaciado de semana comparten fila también en móvil. Los títulos y textos de presentación se conservan en escritorio y se ocultan en móvil; el rango semanal permanece visible junto a una etiqueta numérica `X/14` de comidas planificadas. Cuando la semana está vacía, el acceso a copiar la semana anterior comparte el aspecto compacto de vista previa, con flecha a la izquierda y texto alineado a la derecha, sin panel explicativo. El calendario omite la frase de ayuda sobre arrastrar; «Vaciar semana» permanece visible y se deshabilita si no hay comidas planificadas. Los filtros de lugares de compra en Compra e Inventario permiten desplazamiento horizontal con la barra visual oculta. En móvil, todas las modales se abren arriba con margen seguro y altura ajustada al viewport visual para aprovechar el espacio al aparecer el teclado; en escritorio permanecen centradas. Todos los buscadores ofrecen una cruz roja para limpiar cuando contienen texto, visible también sin foco.

## Límites aceptados

Conservar el comportamiento, arquitectura, seguridad, datos y límites de despliegue documentados en [AGENTS.md](../AGENTS.md). El [workflow común](../../../plan/workflow.md) define el proceso de entrega y el contrato documental.

## Dudas abiertas

No hay dudas abiertas para el alcance actual.

## Application icons

Browser and home-screen icons use local SVG sources, a 16/32/48-pixel ICO fallback, installation PNGs and an Apple Touch Icon. Existing PWA manifests also declare an opaque maskable variant. Regenerate with `bun run icons:generate` from the repository root. Shared status and evidence: [AGW-10](../../../plan/iterations.md#agw-10--application-favicons) and [delivery log](../../../plan/iteration-log.md#agw-10-application-favicons).
