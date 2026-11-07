# Iteraciones

El [workflow raíz](../../../plan/workflow.md) es el único protocolo. El contrato documental se estableció en [AGW-01](../../../plan/iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental).

## BILL-01 — Commissions

- Estado: `validated`.
- Objetivo: CRUD de encargos y generación idempotente de un pago completo vinculado.
- Rutas: `src/features/commissions`, `src/app/(dashboard)/commissions`, `src/app/api/commissions`, entidades/puertos/servicios/adaptadores y esquemas correspondientes; integración de navegación, conceptos compartidos y pagos; glosario e índice raíz.
- Dependencias: clientes, productos, pagos y calculador financiero existentes; sin nuevas dependencias.
- Aceptación: campos, orden, triestado independiente, conceptos opcionales, productos sin stock; generación sin cliente y con conceptos; reintentos/concurrencia y recuperación sin duplicados; sincronización con protección de facturas; navegación bidireccional y limpieza de vínculos; móvil, escritorio y modo oscuro.
- Validación: tests herméticos de dominio, esquemas, repositorio y helpers SWR; lint incremental, tipos, tests y build de billing; comprobación visual cuando el entorno permita autenticación.
- Evidencia: [registro BILL-01](archive/2026-11-01/bill-01-02.md#bill-01--commissions).

## BILL-02 — Cohesión de Commissions

- Estado: `validated`.
- Objetivo: compartir los patrones de interacción existentes entre Commissions y el resto de billing.
- Rutas: componentes compartidos (`PaymentActions`, selector de producto y control segmentado/BinaryToggle), `features/commissions/components`, `features/events/components/AttendeeRow`, servicio/pruebas de pagos de encargos y documentación de billing.
- Dependencias: `AddButton`, `IconButton`, iconos y badge de Eventos, `ClientQueryInput`, SWR de productos y `BinaryToggle` existentes; sin nuevas librerías.
- Aceptación: alta/edición/borrado con iconos comunes; efectivo/tarjeta/transferencia y apertura del pago mediante un único componente compartido con Eventos; producto con búsqueda y elección inequívoca que añade conceptos sin stock; 0/50/100 visibles y seleccionables; tag `Encargo` en generación; cabecera/campos/estado vacío coherentes. Conservar eventos y todas las opciones del control binario, además de reservas/reintentos de pago.
- Validación: pruebas pertinentes y suite de billing, Biome incremental, tipos y build; navegador para búsqueda, triestado e iconos en móvil/escritorio y comparación con Eventos.
- Evidencia: [BILL-02](archive/2026-11-01/bill-01-02.md#bill-02--cohesión-de-commissions).

## BILL-03 — Alineación de acciones en tarjetas

- Estado: `validated`.
- Objetivo: edición/borrado en la fila del título y pagos en la fila del importe, también en móvil.
- Rutas: `src/features/commissions/components/CommissionCard.tsx` y planificación de billing.
- Dependencias: componentes de iconos y acciones de pago existentes.
- Aceptación: ambos grupos comparten su fila correspondiente, sin cambiar interacciones ni crear componentes.
- Validación: Biome incremental, tipos, suite existente y build de billing; revisión de la estructura y clases responsive.
- Evidencia: [BILL-03](archive/2026-11-01/bill-03.md#bill-03--alineación-de-acciones-en-tarjetas).

## BILL-04 — Prepaid y agrupación por pago

- Estado: `validated`.
- Objetivo: sustituir progreso porcentual por importe prepagado informativo y separar encargos con pago en una sección cerrada por defecto.
- Rutas: entidad/esquema/adaptador y pruebas de Commission; componentes y helpers de Commissions; glosario y planificación de billing.
- Dependencias: controles compartidos existentes. Sin nuevas librerías.
- Aceptación: Prepaid en EUR no negativo, con centavos e inicial 0; cambios de Prepaid no recalculan pagos, que siguen generándose por el total. Sin conversión automática del porcentaje antiguo; registros sin importe se muestran con 0. With payment cerrada por defecto agrupa por vínculo real; reservas pendientes fuera; orden y navegación conservados. Móvil en cuatro filas según la petición y etiqueta Deadline en lista/formulario.
- Validación: tests de esquema, persistencia, separación/orden y pagos; Biome incremental, tipos, suite y build de billing; navegador para importe, agrupación y cuatro filas móviles.
- Evidencia: [BILL-04](archive/2026-11-01/bill-04.md#bill-04--prepaid-y-agrupación-por-pago).

## BILL-05 — Etiquetas e importes en línea

- Estado: `validated`.
- Objetivo: mostrar Client, Deadline, Prepaid y Total como «Etiqueta: valor» en las tarjetas.
- Rutas: `src/features/commissions/components/CommissionCard.tsx` y planificación de billing.
- Dependencias: estilos y componentes existentes.
- Aceptación: etiquetas con dos puntos y valores en línea; conservar las cuatro filas móviles, iconos y sección de encargos con pago.
- Validación: Biome incremental, tipos, suite y build de billing; revisión estática del marcado inline.
- Evidencia: [BILL-05](archive/2026-11-01/bill-05.md#bill-05--etiquetas-e-importes-en-línea).

## BILL-06 — Etiqueta de encargos pagados

- Estado: `validated`.
- Objetivo: llamar Paid a la sección colapsada de encargos con un pago vinculado.
- Rutas: `src/features/commissions/components/CommissionsPageContent.tsx` y planificación de billing.
- Dependencias: agrupación existente por `paymentId`.
- Aceptación: el encabezado muestra `Paid (n)` y conserva contador, contenido y comportamiento colapsable.
- Validación: Biome incremental, tipos y suite existente de billing.
- Evidencia: [BILL-06](archive/2026-11-02/bill-06.md#bill-06--etiqueta-de-encargos-pagados).

## BILL-07 — Navegación fija al hacer scroll

- Estado: `validated`.
- Objetivo: mantener visible la navegación compartida durante el scroll vertical de cualquier página.
- Rutas: `src/components/shared/NavigationBar.tsx`, `src/components/shared/PageLayout.tsx` y planificación de billing.
- Dependencias: layout y navegación existentes; sin nuevas librerías.
- Aceptación: barra sticky en móvil y escritorio, conservando ancho, margen superior, colores y posición por debajo de menús y modales. El contenedor no debe interceptar el scroll sticky.
- Validación: Biome incremental, tipos, suite y build de billing; revisión de ancestros, cobertura de páginas y capas CSS.
- Evidencia: [BILL-07](archive/2026-11-02/bill-07.md#bill-07--navegación-fija-al-hacer-scroll).

## BILL-08 — Márgenes opacos de navegación

- Estado: `validated`.
- Objetivo: mantener opaco el espacio superior e inferior de la barra durante el scroll.
- Rutas: `src/components/shared/PageLayout.tsx`, `src/components/shared/NavigationBar.tsx` y planificación de billing.
- Dependencias: navegación sticky de BILL-07; sin nuevas librerías.
- Aceptación: franja sticky con fondo de página en ambos temas y padding superior/inferior permanente; contenido oculto al pasar por detrás, ancho de barra conservado y overlays por encima.
- Validación: lint staged, tipos, suite y build de billing; revisión de estructura y capas.
- Evidencia: [BILL-08](archive/2026-11-02/bill-08.md#bill-08--márgenes-opacos-de-navegación).

## BILL-09 — Instagram de clientes

- Estado: `validated`.
- Objetivo: añadir Instagram como campo opcional de Client, editable, persistido y visible en el listado.
- Rutas: entidad y puerto de Client, schema, repositorio Mongo, formulario y tabla de clientes, pruebas y planificación de billing.
- Dependencias: patrones actuales para campos opcionales de Client; sin nuevas dependencias ni migración.
- Aceptación: creación/edición aceptan y recortan Instagram, un valor vacío lo omite y permite borrar uno existente; Mongo no guarda nullish; los clientes existentes siguen cargando; el formulario y la tabla muestran el campo.
- Validación: pruebas de esquema pertinentes, type-check, suite de billing, lint incremental y diff check.
- Evidencia: [BILL-09](archive/2026-11-02/bill-09.md#bill-09--instagram-de-clientes).

## BILL-10 — Copiar Instagram desde el listado

- Estado: `validated`.
- Objetivo: copiar Instagram al portapapeles al hacer clic en el valor de la tabla de clientes.
- Rutas: `src/features/clients/components/ClientTableRow.tsx` y planificación de billing.
- Dependencias: `CopyToClipboardButton` y toast de copia existentes.
- Aceptación: valor presente copiable, confirmación coherente con email y clic que no activa la edición de la fila; valor vacío conserva el marcador actual.
- Validación: Biome incremental, type-check y pruebas de billing pertinentes; revisión del manejo de propagación y `git diff --check`.
- Evidencia: [BILL-10](archive/2026-11-02/bill-10.md#bill-10--copiar-instagram-desde-el-listado).

## BILL-11 — Traducción de la interfaz al español

- Estado: `validated`.
- Objetivo: traducir al español toda la interfaz visible de billing-poc, incluidos navegación, formularios, tablas, diálogos, estados, mensajes, accesibilidad y metadatos; usar localización española para fechas.
- Rutas: `src/app/`, `src/components/`, `src/features/`, utilidades compartidas de formato de UI y planificación de billing.
- Dependencias: componentes y flujos existentes; sin cambios de comportamiento ni nuevas dependencias. Nombre aprobado por el usuario: `Commissions` se presenta como `Encargos`.
- Aceptación: ninguna cadena inglesa dirigida a usuarios permanece en la UI, salvo marcas, nombres propios, códigos/términos técnicos necesarios y contenido introducido por los usuarios; textos accesibles y errores visibles también traducidos; idioma del documento y formatos coherentes con `es-ES`.
- Validación: inventario y búsqueda residual de cadenas UI inglesas; Biome en archivos editados, type-check y build de billing; diff check. No ejecutar pruebas salvo que el usuario las solicite.
- Evidencia: [BILL-11](archive/2026-11-02/bill-11.md#bill-11--traducción-de-la-interfaz-al-español).

## BILL-12 — Cocciones y plantillas

- Estado: `validated`.
- Objetivo: gestionar cocciones y sus plantillas desde una nueva página equivalente a Encargos.
- Rutas: componentes/hooks/servidor de commissions compartidos, nueva página y API de firings, `features/firings`, entidad/puerto/adaptador/schema de plantillas; navegación, integración con pagos y planificación de billing.
- Dependencias: CRUD de Encargos, acciones de pago, controles, selectores y SWR existentes; sin nuevas dependencias.
- Aceptación: título obligatorio; cliente, fecha límite y descripción opcionales; conceptos libres o copiados de plantillas; IVA inicial 21 %. Sin anticipo en Cocciones. Plantillas con solo nombre/precio, CRUD al principio de la página cerrado por defecto. Listado y modal permiten generar/abrir pago con los botones compartidos; guardar cambios antes de convertir desde el modal. Pago único con tag `Cocción`, sincronización protegida de facturas, vínculo bidireccional y limpieza al eliminar pago; sin stock ni mezcla con encargos/productos. UI responsive y modo oscuro.
- Contrato: `/api/firings` reutiliza los payloads de Encargos y su respuesta interna (`commissions`/`commission`); GET/POST/PUT/DELETE autenticados, detalle `/:id`, conversión `/:id/payment` y consulta inversa `/payment/:paymentId`. `/api/firing-templates`: GET devuelve `{ templates }`; POST `{ name, price }`, PUT `{ id, name, price }`, DELETE `{ id }`; nombres recortados no vacíos, precio finito no negativo, IDs Mongo válidos.
- Validación: pruebas de dominio/reintentos/sincronización y contratos/helpers SWR/plantillas; Biome en archivos editados, tipos, suite y build de billing; revisión visual si hay sesión accesible.

- Evidencia BILL-12: [registro y limitaciones de la suite previa](archive/2026-11-05/bill-12.md#bill-12--cocciones-y-plantillas).

## BILL-13 — Reparar las pruebas de localización

- Estado: `validated`.
- Objetivo: corregir los 14 fallos previos de la suite y los defectos de localización que exponen.
- Rutas: pruebas de `PaymentActions`, `lib/utils/formatters`, helpers y pruebas de `features/events/components/eventsUi` y calendarios de eventos/ausencias; planificación de billing.
- Dependencias: localización española aceptada en BILL-11 y pruebas existentes; sin nuevas dependencias.
- Aceptación: etiquetas de pago y fechas esperadas en español; calendarios accesibles completamente en español con singular/plural correcto; fechas recurrentes sin plurales inválidos para los siete días; ausencia de fecha en español; suite completa sin fallos conservando las comprobaciones de comportamiento.
- Validación: reproducción inicial de 977 pruebas con 14 fallos; tests de regresión antes del arreglo, suite completa, lint incremental, type-check y build de billing; diff check y enlaces locales.
- Evidencia: [BILL-13](archive/2026-11-05/bill-13.md#bill-13--reparar-las-pruebas-de-localización).

## BILL-14 — Cabeceras y acciones de modales

- Estado: `validated`.
- Objetivo: fijar todas las cabeceras de modales y concentrar confirmación/cierre en la parte superior.
- Rutas: `src/components/ui`, formularios y modales de `src/features`, planificación de billing.
- Dependencias: Modal, iconos, formularios y mutaciones existentes; sin nuevas dependencias.
- Aceptación: cabecera siempre visible con scroll interno; sin aceptar/cancelar al pie; tick verde junto a papelera cuando exista y cruz roja arriba; conservar validación, envío nativo, estados pendientes, navegación y subformularios. Móvil y temas claro/oscuro.
- Validación: inventario de modales, lint, tipos, suite y build de billing; revisión de accesibilidad y formularios; comprobación visual si el entorno lo permite.
- Evidencia: [BILL-14](archive/2026-11-05/bill-14.md#bill-14--cabeceras-y-acciones-de-modales).

## BILL-15 — Página de cliente

- Estado: `validated`.
- Objetivo: abrir una ficha de cliente desde los listados con datos, resumen histórico y actividad.
- Rutas: página `/clients/[id]`, componentes/hooks/servidor de clientes, navegación desde clientes/pagos, filtros de repositorios e índices, invalidación de pagos/encargos y planificación de billing.
- Dependencias: PageLayout, SummaryCard, DonutChart, calculador de totales, modal de cliente y repositorios existentes; sin nuevas dependencias.
- Aceptación: datos completos y edición desde la ficha; ingresos/gastos/saldo históricos y desglose por etiqueta exclusivos del cliente; pagos, encargos y cocciones en tres secciones cerradas inicialmente con contador exacto, incluyendo registros pagados; navegación desde clientes y pagos; estados de carga/error/no encontrado/vacío, móvil y modo oscuro.
- Contrato: GET autenticado `/api/clients/:id/activity` devuelve `{ client, payments, commissions, firings }` del cliente solicitado, sin filtro temporal; 400 para ID inválido, 404 si no existe, 500 ante error. Las mutaciones relacionadas invalidan la actividad.
- Validación: pruebas de contrato/aislamiento, helpers SWR y navegación/render; lint incremental, tipos, suite y build de billing; revisión visual si el entorno lo permite.
- Evidencia: [BILL-15](archive/2026-11-05/bill-15.md#bill-15--página-de-cliente).

## BILL-16 — Simplificar cabeceras y altas

- Estado: `validated`.
- Objetivo: eliminar cabeceras redundantes, completar traducción de Año y llevar altas principales a la navegación.
- Rutas: PageLayout/NavigationBar, página de clientes y año; cabeceras de ausencias, productos, facturas, eventos, encargos/cocciones y Mes; tabla mensual; planificación de billing.
- Dependencias: AddButton, buscador y callbacks existentes; sin nuevas dependencias.
- Aceptación: Clientes usa + a la izquierda del buscador en navegación; altas principales de Productos, Eventos y Encargos/Cocciones en navegación; Mes conserva su + y elimina Monthly Filter/Overview; Compacto/Todo; se eliminan títulos/subtítulos redundantes de las páginas indicadas; Año sin cabecera textual y UI en español. Conservar controles de periodos, formularios, acciones contextuales, temas y accesibilidad.
- Validación: Biome incremental, tipos, suite y build de billing; revisión responsive y visual si existe sesión accesible.
- Evidencia: [BILL-16](archive/2026-11-05/bill-16.md#bill-16--simplificar-cabeceras-y-altas).

## BILL-17 — Alta mensual, orden de cocciones y traducción de facturas

- Estado: `validated`.
- Objetivo: duplicar el alta mensual en navegación, adelantar cocciones pagadas y completar el español de Facturas.
- Rutas: MonthPageContent, CommissionsPageContent, componentes de Facturas y planificación de billing.
- Dependencias: controles, agrupación y callbacks existentes; sin nuevas dependencias.
- Aceptación: ambos + de Mes abren el mismo formulario; Cocciones muestra Pagadas cerrada por defecto antes de las vigentes, sin cambiar Encargos; textos visibles de Facturas y reducción de numeración en español, conservando valores internos y comportamiento.
- Validación: Biome, tipos, suite y build de billing; revisión estática de orden, callbacks y textos.
- Evidencia: [BILL-17](archive/2026-11-07/bill-17.md#bill-17--alta-mensual-orden-de-cocciones-y-traducción-de-facturas).

## BILL-18 — Navegación de escritorio

- Estado: `validated`.
- Objetivo: eliminar identificación redundante y colocar los controles de página debajo del menú solo en escritorio.
- Rutas: `src/components/shared/NavigationBar.tsx` y planificación de billing.
- Dependencias: breakpoint `xl` y slot de acciones existentes.
- Aceptación: escritorio sin Billing/título de página; menú antes de acciones/buscador, con orden de foco coherente; móvil conserva título, acciones y menú actuales; todas las páginas y ambos temas.
- Validación: Biome, tipos, suite y build de billing; revisión de clases responsive y DOM.
- Evidencia: [BILL-18](archive/2026-11-07/bill-18.md#bill-18--navegación-de-escritorio).

## BILL-19 — Controles de cabecera en navegación de escritorio

- Estado: `validated`.
- Objetivo: integrar en navegación los controles de Ausencias, Eventos, Mes, Productos y Año solo en escritorio.
- Rutas: PageLayout/NavigationBar y las cinco páginas indicadas; planificación de billing.
- Dependencias: slot de cabecera, acciones y breakpoint `xl` existentes; sin nuevas dependencias.
- Aceptación: buscadores, selectores de periodo/gráficos/plantillas, filtros y acciones de cabecera integrados bajo el menú y fijos en escritorio; móvil conserva ubicación y scroll actuales; un único árbol de controles sin duplicar estado/IDs ni remontar al cambiar anchura; otras páginas conservadas.
- Validación: Biome, tipos, suite y build de billing; revisión responsive y del árbol de componentes.
- Evidencia: [BILL-19](archive/2026-11-07/bill-19.md#bill-19--controles-de-cabecera-en-navegación-de-escritorio).

## BILL-20 — Una fila de controles en escritorio

- Estado: `validated`.
- Objetivo: alinear altas y controles de cabecera en la misma fila de escritorio, sin cambiar móvil.
- Rutas: NavigationBar, cabeceras de Eventos/Productos, planificación de billing.
- Dependencias: cabeceras de escritorio y AddButton existentes.
- Aceptación: + de Eventos/Productos junto a periodo/búsqueda/acciones; Mes usa solo el + de su fila de controles en escritorio; móvil conserva + superior y controles actuales, incluidos los dos + de Mes; filtros de Productos en la misma banda; sin cambios de estado, datos ni acciones.
- Validación: Biome, tipos, suite y build de billing; revisión de visibilidad responsive y callbacks.
- Evidencia: [BILL-20](archive/2026-11-07/bill-20.md#bill-20--una-fila-de-controles-en-escritorio).

## BILL-21 — Ausencias localizadas y tabla de pagos del cliente

- Estado: `validated`.
- Objetivo: pulir ausencias/calendarios y reutilizar la tabla mensual en la ficha de cliente.
- Rutas: resumen/formularios/modales de ausencias y foco inline; MonthCalendarGrid; listado/ficha/actividad de clientes; vista/tabla/fila de pagos y exportación; planificación de billing.
- Dependencias: Modal stableHeight, tabla/filtros/acciones de pagos y modal de cliente existentes; sin nuevas dependencias.
- Aceptación: encabezados Ausencias/Recuperaciones/Última ausencia; Mañana/Tarde/Alumno/a/Fecha; modales de día/edición a altura disponible sin foco automático en nombre al editar; calendarios lun/mar/mié/jue/vie/sáb/dom; lápiz antes de papelera abre edición sin navegar; pagos del cliente usan tabla mensual con fecha completa y mismas columnas/filtros/orden/acciones/exportación, sin filtrar por mes ni perder actividad histórica.
- Validación: regresiones de etiquetas/calendario, fecha completa y acciones de cliente; Biome, tipos, suite y build de billing; revisión de foco y accesibilidad.
- Evidencia: [BILL-21](archive/2026-11-07/bill-21.md#bill-21--ausencias-localizadas-y-tabla-de-pagos-del-cliente).

## BILL-22 — Fecha y hora de eventos y favicon original

- Estado: `validated`.
- Objetivo: separar Fecha y Hora en eventos y recuperar el sello original de billing.
- Rutas: tabla/helpers/pruebas de eventos, iconos de billing y planificación.
- Dependencias: formateadores e historial Git existentes; sin dependencias nuevas.
- Aceptación: recurrentes «mar nov», puntuales «vie 13 nov» con día inferido del año real, sin año; Hora HH:mm independiente; fechas parciales conservadas sin inventar datos; favicon original sin icono SVG competidor.
- Validación: regresiones de fechas, Biome, tipos, suite y build de billing; verificación del icono recuperado.
- Evidencia: [BILL-22](archive/2026-11-07/bill-22.md#bill-22--fecha-y-hora-de-eventos-y-favicon-original).

## BILL-23 — Menú de navegación en anchuras intermedias

- Estado: `validated`.
- Objetivo: mostrar el menú abierto siempre que esté disponible el botón hamburguesa.
- Rutas: MobileMenuOverlay y planificación de billing.
- Dependencias: breakpoint xl de NavigationBar, foco y cierre existentes.
- Aceptación: botón y overlay disponibles por debajo de xl, incluidos 640–1279 px; navegación de escritorio desde xl; sin cambios de enlaces ni acciones.
- Validación: comparación de visibilidad responsive en 390/800/1100/1280 px, Biome, tipos, suite y build.
- Evidencia: [BILL-23](archive/2026-11-07/bill-23.md#bill-23--menú-de-navegación-en-anchuras-intermedias).

## BILL-24 — Paleta oliva y terracota

- Estado: `validated`.
- Objetivo: aplicar la paleta facilitada a toda la UI con jerarquía y semántica coherentes.
- Rutas: tema global, colores de gráficos, selección de productos y planificación de billing.
- Dependencias: tokens Tailwind y componentes existentes, sin dependencias nuevas.
- Aceptación: superficies crema, acciones/ingresos oliva, gastos/errores terracota; tema oscuro cálido; gráficos armonizados; conservar marca de Google, documentos PDF y comportamiento.
- Validación: contraste de pares principales, cobertura de tokens, Biome, tipos, suite y build; inspección visual si el navegador está disponible.
- Evidencia: [BILL-24](archive/2026-11-07/bill-24.md#bill-24--paleta-oliva-y-terracota).

## BILL-25 — Superficies neutras y donuts originales

- Estado: `validated`.
- Objetivo: eliminar el efecto de filtro verde y recuperar la diferenciación de categorías de los donuts.
- Rutas: tema global, constantes de gráficos y planificación de billing.
- Dependencias: tema y gráficos existentes.
- Aceptación: fondos, tarjetas, bordes y texto neutros en claro/oscuro; oliva/terracota como acentos; colores originales de CHART_COLORS restaurados exactamente.
- Validación: comparación con constantes originales en Git, contraste de pares principales, lint preparado, tipos, suite y build.
- Evidencia: [BILL-25](iteration-log.md#bill-25--superficies-neutras-y-donuts-originales).

## BILL-26 — Temas y configuración por usuario

- Estado: `validated`.
- Objetivo: elegir Original u Oliva y terracota desde la configuración propia.
- Rutas: tema global, layouts/navegación, `features/settings`, API de preferencias, entidad/puerto/repositorio y documentación de billing.
- Dependencias: sesión Better Auth, MongoDB, SWR y componentes existentes; sin nuevas dependencias.
- Aceptación: enlace desde identidad del menú y escritorio a `/settings`; selector accesible, guardado/error/pending; elección aislada por correo autenticado, persistente entre dispositivos; Original por defecto, variante actual opcional, claro/oscuro del sistema y donuts independientes; HTML inicial con paleta persistida.
- Contrato: GET/PUT `/api/user-preferences` usan exclusivamente identidad de sesión; cuerpo PUT estricto `{theme: original|olive}`; 401/403 sin autorización, 400 inválido, 500 error de persistencia; respuestas privadas sin caché HTTP compartida.
- Validación: pruebas herméticas de aislamiento, validación, fallos, render inicial/enlaces, helpers SWR y paletas; lint incremental/preparado, tipos, suite y build. Verificación autenticada cuando el entorno lo permita.
- Evidencia: [BILL-26](iteration-log.md#bill-26--temas-y-configuración-por-usuario).

## BILL-27 — Estudio de obligaciones fiscales del autónomo

- Estado: `validated`.
- Objetivo: documentar el ciclo fiscal del autónomo y su aplicación futura en Billing.
- Rutas: `plan/fiscalidad-autonomos.md` y planificación de Billing.
- Dependencias: AEAT y normativa publicada en el BOE.
- Aceptación: calendario, modelos y condiciones, gestiones no periódicas, casos especiales y criterios para futuras funcionalidades.
- Validación: contraste de fuentes oficiales, enlaces locales y `git diff --check`.
- Evidencia: [BILL-27](iteration-log.md#bill-27--estudio-de-obligaciones-fiscales-del-autónomo).

## BILL-28 — Particularidades de Aragón y priorización fiscal

- Estado: `validated`.
- Objetivo: documentar la fiscalidad aragonesa aplicable y valorar las funcionalidades fiscales por beneficio y riesgo de regresión.
- Rutas: `plan/fiscalidad-autonomos.md` y planificación de Billing.
- Dependencias: AEAT, Gobierno de Aragón, BOA y modelos actuales de pagos y facturas.
- Aceptación: distinguir obligaciones estatales y autonómicas, proponer un orden de entrega y vincular cada riesgo a una comprobación.
- Validación: contraste de fuentes oficiales, revisión del código afectado por las propuestas, enlaces locales y `git diff --check`.
- Evidencia: [BILL-28](iteration-log.md#bill-28--particularidades-de-aragón-y-priorización-fiscal).

## BILL-29 — Agenda fiscal

- Estado: `validated`.
- Objetivo: incorporar vencimientos oficiales y manuales y registrar presentación, pago y justificante.
- Rutas: módulo fiscal, API, repositorio, navegación y planificación de Billing.
- Dependencias: calendario AEAT 2026, sesión, MongoDB y SWR.
- Aceptación: agenda aislada por usuario, importación idempotente, edición manual y actualización explícita de sugerencias pendientes; sin cambios en la exportación existente.
- Validación: catálogo, estados y contratos, lint incremental, tipos, pruebas y build.
- Evidencia: [BILL-29](iteration-log.md#bill-29--agenda-fiscal).

## BILL-30 — Borradores fiscales 303, 130 y 390

- Estado: `validated`.
- Objetivo: calcular borradores parciales desde pagos con factura y confirmaciones separadas.
- Rutas: módulo de borradores, agenda, API, adaptador Mongo y planificación.
- Dependencias: pagos existentes, catálogo de casillas AEAT 2026 y sesión.
- Aceptación: exclusión de pagos sin factura, trazabilidad, conciliación y detección de datos pendientes.
- Validación: pruebas de reglas y regresión, Biome, tipos y build.
- Evidencia: [BILL-30](iteration-log.md#bill-30--borradores-fiscales-303-130-y-390).

## BILL-31 — Acceso a facturas y pagos desde borradores

- Estado: `validated`.
- Objetivo: abrir facturas y la modal de pago desde el borrador fiscal.
- Rutas: vista de borradores y planificación de Billing.
- Dependencias: modal y ruta de facturas existentes.
- Aceptación: enlaces externos HTTP(S), PDF por identificador y modal de pago sin salir del borrador.
- Validación: Biome, tipos, suite y build.
- Evidencia: [BILL-31](iteration-log.md#bill-31--acceso-a-facturas-y-pagos-desde-borradores).

## BILL-32 — Cohesión de la interfaz fiscal

- Estado: `validated`.
- Objetivo: alinear Agenda y Borradores con Billing y abrir el pago desde IVA y total.
- Rutas: componentes fiscales, proyección del total de pago y planificación.
- Aceptación: enlaces visuales sobre ambos importes, sin botón separado; tarjetas, controles, estados y modal coherentes en claro y oscuro.
- Validación: Biome, tipos, pruebas y build.
- Evidencia: [BILL-32](iteration-log.md#bill-32--cohesión-de-la-interfaz-fiscal).

## BILL-33 — Inclusión automática de pagos facturados

- Estado: `validated`.
- Objetivo: incorporar pagos facturados ordinarios sin confirmación individual.
- Rutas: cálculo fiscal, vista, pruebas y planificación de Billing.
- Dependencias: datos de pago y revisiones fiscales existentes.
- Aceptación: inclusión automática, respeto a ajustes explícitos y detección de incidencias.
- Validación: lint, tipos, pruebas y build.
- Evidencia: [BILL-33](iteration-log.md#bill-33--inclusión-automática-de-pagos-facturados).

## BILL-34 — Filtro de incidencias fiscales

- Estado: `validated`.
- Objetivo: filtrar facturas por incidencia y mostrar su causa concreta.
- Rutas: vista y cálculo fiscal, pruebas y planificación.
- Aceptación: filtro solo visual y mismo tratamiento de factura completa y simplificada con datos equivalentes.
- Validación: lint, tipos, pruebas y build.
- Evidencia: [BILL-34](iteration-log.md#bill-34--filtro-de-incidencias-fiscales).
