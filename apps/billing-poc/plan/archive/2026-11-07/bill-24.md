# Registro histórico de Billing

## BILL-24 — Paleta oliva y terracota

- Inicio: 2026-11-05, rama `int`, base `11a5f3e`, árbol limpio, sin commits locales pendientes. Capacidad: 87 % en 5 h y 19 % en 7 d; estimación suficiente para completar con reservas.
- Aceptación: [BILL-24](../../iterations.md#bill-24--paleta-oliva-y-terracota).
- Implementación: las familias Tailwind existentes se mapean globalmente a oliva (acciones/ingresos), terracota (gastos/errores/borrado) y tonos cálidos (advertencias), con superficies crema y neutros oliva. Se mantienen las clases para cubrir también variantes responsive, dark, hover, focus y transparencias sin duplicar CSS por pantalla. Modo oscuro con fondos derivados y texto secundario aclarado. Colores de gráficos compartidos actualizados y selección de productos con anillo del tema en lugar del azul RGBA fijo. Marca Google y PDFs conservados.
- Contraste calculado: texto de botones principales 5,94:1, acciones destructivas 5,71:1, texto secundario claro 4,89:1 y oscuro 6,23:1. El tono 500 oliva se oscurece ligeramente respecto a la referencia para superar 4,5:1 con texto claro. No se afirma conformidad de todas las combinaciones, especialmente transparencias.
- Revisión React: solo clases de selección, sin cambios de estado, hooks, datos, dependencias ni comportamiento. Cobertura estática de colores de UI y constantes de gráficos revisada. No se realizó validación visual interactiva de las pantallas autenticadas; inventario de navegador disponible, sin sesión de billing verificada.
- Validación: Biome explícito de los tres archivos de código correcto; tipos correctos; 998 pruebas correctas, 0 fallos y 1835 assertions. Build webpack final correcto tras ajustar contraste (16,242 s). La caché remota no está disponible para tipos/tests, que se ejecutan localmente. El lint incremental sin preparar seleccionó cero archivos; se utiliza lint preparado al cierre. Se archiva BILL-14 para mantener diez entregas.
