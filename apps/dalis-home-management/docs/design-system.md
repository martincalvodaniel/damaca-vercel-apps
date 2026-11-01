# Sistema de diseño: color

Esta es la referencia obligatoria al crear o modificar páginas, componentes, formularios, modales o estados visuales de Home Management. Las decisiones fueron aceptadas en HM-10. Los valores de la paleta viven exclusivamente en [globals.css](../src/app/globals.css); el [plan maestro](../plan/master.md) registra el alcance vigente.

## Roles y aplicación

- Usar tokens semánticos de Tailwind: `canvas` para fondo global; `surface` y `surface-raised` para capas; `field` para campos; `ink`, `muted` y `placeholder` para texto. Las modales y sus cabeceras comparten las superficies neutras de la aplicación.
- Toda acción principal utiliza `primary`, `on-primary` y `primary-hover`, independientemente de la página. El foco de cualquier control utiliza `ring`, visible con teclado.
- `success`, `danger` y `warning` representan estados, con sus variantes `*-soft` y colores `on-*` cuando hay relleno sólido. Mantener verde para confirmar/guardar y rojo para cancelar/cerrar/limpiar/eliminar; conservar nombres accesibles e iconos que expliquen la acción. Las confirmaciones destructivas deben seguir describiendo la operación.
- `accent` y `section-*` identifican áreas solo en pequeños iconos, puntos o etiquetas. El fondo completo de un formulario no cambia por sección. El día actual usa el estado seleccionado primario; agotado usa advertencia.
- `border` delimita superficies decorativas; `control-border` identifica campos y controles. Los controles y sus estados deben seguir siendo identificables en claro y oscuro.
- Superficies de contenido opacas. Reservar transparencia para navegación superpuesta, backdrop y decoración de acceso. Atenuar texto o un control deshabilitado de forma localizada; los productos comprados conservan texto y controles legibles.

## Contraste y temas

- Texto normal, secundario y placeholders: contraste mínimo de 4,5:1 frente al fondo efectivo; texto grande: 3:1. Indicadores necesarios para identificar controles o estados: 3:1. La excepción de controles deshabilitados no se aplica a datos comprados ni a información secundaria.
- Verificar pares con transparencias y todos los estados interactivos sobre sus fondos reales. No redondear un resultado inferior al umbral para aprobarlo. Combinar estado con texto/icono, además de color.
- El tema oscuro comparte fondo global y de página, y declara `color-scheme`. Mantener capas coherentes por luminosidad y texto claro cálido. El cambio de tema se resuelve en tokens; evitar duplicar el mismo rol con clases `dark:` locales.

## Extensión y validación

- Reutilizar un rol existente antes de añadir colores. Los nuevos roles requieren propósito documentado, valores claro/oscuro y validación de contraste. Los literales cromáticos se centralizan en `globals.css`; se preservan colores oficiales de marcas externas y activos de identidad.
- Revisar las cuatro páginas, acceso, modales, listas vacías, selección, errores, advertencias, éxito y deshabilitados en claro/oscuro y móvil/escritorio. Conservar el contrato de modales de pantalla completa, acciones superiores fijas y adaptación al teclado.
- La evidencia observada y los comandos se registran por iteración, sin duplicar este contrato ni inventar comprobaciones.

La [prueba de paleta](../src/config/color-palette.test.ts) comprueba pares de texto, límites de campos y centralización de literales cromáticos. Al extender roles, añadir sus combinaciones de uso a esta prueba y comprobar también los colores compuestos en navegador.
