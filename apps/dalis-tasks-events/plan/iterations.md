# Iteraciones

El contrato común de planificación para esta app se estableció en la entrega transversal [AGW-01](../../../plan/iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental). El [workflow raíz](../../../plan/workflow.md) es el único protocolo.

Este archivo es la única fuente del estado de las entregas. Las diez iteraciones recientes mantienen objetivo, rutas, dependencias, aceptación y validación prevista; la evidencia observada permanece en [iteration-log.md](iteration-log.md). La ingeniería del alcance de lanzamiento está cerrada según [release-readiness.md](release-readiness.md). No hay trabajo de producto autorizado pendiente. Promoción a `main` y smoke posterior al despliegue son acciones separadas; el trabajo pospuesto no se convierte en backlog sin nueva decisión.

## 23n — Compatibilidad Intl en calendario civil

- Estado: `validated`.
- Objetivo: Evitar que ICU/Linux omita la era en las conversiones del año 0001.
- Rutas: `src/lib/calendar/civil-date.ts`, `zoned-time.ts` y pruebas.
- Dependencias: Incidente de CI registrado en la evidencia de esta entrega.
- Aceptación: Usar `en-US`/`gregory`, aceptar AD válido, rechazar fechas civiles BC y permitir solo cálculos auxiliares BC necesarios para resolver medianoche del año 0001.
- Validación prevista: Pruebas de fechas, suite, lint, tipos, build y reproducción Bun/Linux.
- Evidencia: [registro](iteration-log.md#23n).

## 23m — Tipado oficial de configuración Vercel

- Estado: `validated`.
- Objetivo: Aplicar el tipo oficial a la configuración existente sin cambiar su export.
- Rutas: `vercel.ts`, `package.json`, `bun.lock`.
- Dependencias: Configuración geográfica documentada en 23l.
- Aceptación: Exportar configuración tipada sin casts ni tipos manuales y conservar serialización validada.
- Validación prevista: Tipos, suite, lint, build y comparación del export.
- Evidencia: [registro](iteration-log.md#23m).

## 23l — Configuración Vercel: España y París

- Estado: `validated`.
- Objetivo: Expresar en configuración el bloqueo geográfico solicitado y la región funcional.
- Rutas: `vercel.ts`.
- Dependencias: Requisito de configuración registrado en la evidencia histórica.
- Aceptación: País ES continúa; país distinto o ausente queda denegado; región de funciones `cdg1`. No atribuir efecto en producción sin despliegue.
- Validación prevista: Validar export y esquema oficial; no requiere verificación remota hasta despliegue autorizado.
- Evidencia: [registro](iteration-log.md#23l).

## 23k — Categorías con acciones directas

- Estado: `validated`.
- Objetivo: Retirar el desplegable y mostrar edición/borrado directamente.
- Rutas: Componentes de categorías, `row-actions`, pruebas.
- Dependencias: Fila de planes y acciones compartidas existentes.
- Aceptación: Mantener edición, borrado con confirmación, color, orden, accesibilidad y estado ocupado.
- Validación prevista: SSR, regresión de filas de planes y revisión móvil; las limitaciones visuales constan en el registro.
- Evidencia: [registro](iteration-log.md#23k).

## 23j — Agenda compacta y sin paginación manual

- Estado: `validated`.
- Objetivo: Cargar páginas del intervalo visible sin botón “Ver más” y quitar espacios sobrantes.
- Rutas: Agenda, hook de apariciones, calendario y pruebas.
- Dependencias: Comportamiento de intervalos finitos ya existente.
- Aceptación: Atrasadas y horizonte de Próximas se drenan con guardia; las series sin fin no se materializan ilimitadamente; otros modos paginados permanecen.
- Validación prevista: Pruebas sobre >50 series, paginación y revisión UI.
- Evidencia: [registro](iteration-log.md#23j).

## 23i — Filas directas y títulos móviles discretos

- Estado: `validated`.
- Objetivo: Mostrar datos/acciones de plan sin desplegable y conservar H1 accesible en móvil.
- Rutas: PlanCard, PlanList, encabezados de navegación, pruebas.
- Dependencias: Diseño de interacción vigente de agenda.
- Aceptación: Conservar edición, checklist, contexto de serie, confirmaciones, acciones táctiles y foco/título semántico.
- Validación prevista: SSR, interacción móvil, regresión de gesto y suite.
- Evidencia: [registro](iteration-log.md#23i).

## 23h — Calendario compacto

- Estado: `validated`.
- Objetivo: Reducir altura de celda sin reducir la superficie táctil.
- Rutas: Componente de cuadrícula mensual y estilos.
- Dependencias: Diseño y gestos del calendario existentes.
- Aceptación: Celda de 44 px con navegación, colores, selección y arrastre preservados.
- Validación prevista: Suite, tipos, build y medida visual móvil.
- Evidencia: [registro](iteration-log.md#23h).

## 23g — Movimiento entre categorías

- Estado: `validated`.
- Objetivo: Permitir mover un plan antes/después o a una categoría vacía en el mismo día.
- Rutas: LongPressOrder, agrupación, PlanList, calendario, núcleo puro y pruebas.
- Dependencias: Operación `task.move` y persistencia existentes.
- Aceptación: Guardar categoría/posición en una operación; preservar fecha y estado; gestionar series, cancelación y destinos obsoletos con guardias.
- Validación prevista: Pruebas de planner, gesto UI, recarga/cola y regresiones pertinentes.
- Evidencia: [registro](iteration-log.md#23g).

## 23f — Completados azules y expansión mensual

- Estado: `validated`.
- Objetivo: Evitar que una página parcial oculte completados del calendario.
- Rutas: Cuadrícula mensual, lector de apariciones y pruebas.
- Dependencias: Lector paginado local existente.
- Aceptación: Expandir dentro de límites; no afirmar mes completo si hay páginas pendientes, errores o tope alcanzado.
- Validación prevista: Pruebas con >50 apariciones, SSR y revisión UI de completar/reabrir.
- Evidencia: [registro](iteration-log.md#23f).

## 23e — Estado diario sin recuento

- Estado: `validated`.
- Objetivo: Comunicar pendientes/completados por color, sin recuento ni punto.
- Rutas: Cuadrícula mensual, vista calendario y pruebas.
- Dependencias: Resumen diario local de planes/apariciones.
- Aceptación: Rojo con pendiente, verde solo con evidencia completa, neutro vacío; mantener accesibilidad, selección y estados de carga.
- Validación prevista: SSR de estados/carga parcial, revisión de completar/reabrir y suite.
- Evidencia: [registro](iteration-log.md#23e).

## Historial anterior

Las iteraciones anteriores a `23e` se conservan en el [archivo histórico](archive/2026-10-24/README.md).
