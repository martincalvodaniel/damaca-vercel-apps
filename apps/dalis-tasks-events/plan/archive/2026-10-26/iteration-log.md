# Registro archivado

<a id="23e"></a>
## 23e — Día rojo o verde sin recuento

El calendario elimina número de planes, punto y leyenda de recuento. El número del día es rojo/negrita con al menos un plan sin completar, verde/negrita cuando todos sus planes conocidos están completados y neutro sin planes. Selección usa borde/fondo neutro para no tapar el estado; hoy mantiene borde reconocible. Rojo700/verde700 en claro y400 en oscuro. Etiquetas accesibles españolas anuncian estado sin recuento. No se afirma completado si la evidencia de progreso falta, quedan páginas de apariciones o hay errores de expansión; los pendientes conocidos sí quedan rojos. Mensajes/botón de carga mensual ya no hablan de recuento.

SSR de selección en cada estado, vacío, ausencia de evidencia y página parcial. Catorce pruebas focalizadas/114aserciones iniciales; añadida guardia parcial después de inspeccionar consumidor mensual. DoD final1368pass/225opt-in skip/0fail/14929aserciones, lint1111sinavisos/tipos/Webpack16.4.2/worker46/diff aprobados sobre fuentes finales. Cálculo común de fechas/apariciones sigue intacto, sin nueva persistencia/protocolo/índice.

QA de PlanCalendarBoard real con IndexedDB propio: hoy rojo con tres planes; completar los tres lo vuelve verde y mantiene mañana/pasado rojos; reabrir uno vuelve hoy rojo. Vacíos neutros, sin contador ni punto. Captura390px /private/tmp/dalis-23e-calendar.png. Prueba/bases propias eliminadas, servidor/pestaña retirados y viewport restablecido. La guardia de carga parcial posterior se valida en SSR; no se atribuye recorrido UI parcial ni RPC/Google/físico nuevos. Entrada73%5h/96%7d y control68%/95%, reservas10%/1%; mismo commit/pushint/SHA/cuotas, sin DBusuario/producción.
