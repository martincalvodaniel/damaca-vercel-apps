# Registro histórico de Billing

## BILL-23 — Menú de navegación en anchuras intermedias

- Inicio: 2026-11-05, rama `int`, base `0d524d0`, árbol limpio. Capacidad: 92 % en 5 h y 20 % en 7 d; margen suficiente para una entrega pequeña completa.
- Aceptación: [BILL-23](../../iterations.md#bill-23--menú-de-navegación-en-anchuras-intermedias).
- Reproducción estática antes del arreglo: el botón con `xl:hidden` está visible a 800/1100 px mientras el overlay con `sm:hidden` está oculto; a 390 px ambos visibles y a 1280 px ambos ocultos. Esto coincide con el síntoma aportado. No se añade una prueba que solo replique clases de implementación.

- Fix: `MobileMenuOverlay` cambia `sm:hidden` por `xl:hidden`, alineado con NavigationBar. Comparación posterior a 390/800/1100/1280 px correcta: ambos visibles por debajo de xl y ocultos desde xl. Sin cambios de hooks, foco, cierre, acciones ni datos; revisión React del cambio de CSS.
- Validación: Biome del componente correcto; tipos correctos; 998 pruebas correctas, 0 fallos; build webpack correcto (17,847 s). Caché remota no disponible; validación local completa. No se realizó comprobación interactiva en navegador. Se archiva BILL-13 para conservar diez entregas recientes.
- Prueba Vercel asociada: consulta previa al push confirma `enableAffectedProjectsDeployments: false` en card-wars y ningún Ignored Build Step configurado. No se modifica configuración remota. Los registros posteriores se consultan tras publicar; la ausencia de un registro no prueba por sí sola el contador interno de cuota.
