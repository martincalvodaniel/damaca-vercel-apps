# Registro de entregas

[Entregas EPJ-01 a EPJ-07 archivadas](archive/2026-11-08/iteration-log.md).

[Entregas EPJ-08 a EPJ-59 archivadas](archive/2026-11-14/iteration-log.md).

## EPJ-60 — Cuenta atrás del podio

- Capacidad inicial de 44% en 5 h y 91% en 7 días. Dos segundos de preparación y tres de cuenta atrás. La fecha límite se aplica en servidor sin depender de que el administrador mantenga la página abierta.
- Biome, tipos, doce pruebas de Tapas y build correctos. Pendiente la revisión visual con dos sesiones autenticadas.

## EPJ-61 — Anuncio del premio en la cuenta atrás

- Capacidad inicial de 34% en 5 h y 90% en 7 días. El anuncio ocupa la capa de cuenta atrás durante tres segundos y la plata aparece encima del bronce.
- Biome, tipos, doce pruebas y build correctos. Se comprobó la ventana de publicación y el bloqueo de avances. Pendiente la revisión visual con dos sesiones autenticadas.

## EPJ-62 — Formato del anuncio de Tapas

- Capacidad inicial de 27% en 5 h y 89% en 7 días. El anuncio pone los autores entre paréntesis tras el nombre. Biome, tipos y build correctos.

## EPJ-63 — Puntuación, avatares y empate en la revelación

- Capacidad inicial de 98% en 5 h y 87% en 7 días. La animación muestra los puntos y solo al llegar a cero anuncia los autores con sus avatares. El empate en cabeza abre la votación tras el anuncio.
- Biome, tipos, trece pruebas de Tapas y build correctos. La prueba cubre la ocultación de finalistas y la apertura del desempate al expirar el anuncio. Pendiente la comprobación visual con dos sesiones.

## EPJ-64 — Votos de la ganadora y avatares de miembros

- Capacidad inicial de 87% en 5 h y 86% en 7 días. La animación muestra el recuento de la ganadora tras la cuenta atrás. Ajustes y Tapas comparten el avatar con iniciales de respaldo. Se retiran los avisos genéricos de guardado.
- Biome, tipos, catorce pruebas de Tapas y build correctos. Las pruebas cubren cero, uno, varios votos y ausencia de desempate. Pendiente la revisión visual con una sesión autenticada.

## EPJ-65 — Markdown y alojamiento desplegable

- Capacidad inicial de 76% en 5 h y 84% en 7 días. Las descripciones se renderizan como Markdown y Alojamiento comparte el grupo de desplegables de Letux.
- Biome, tipos, cinco pruebas de guía y renderizado y build correctos. Se verificó en código que el editor solo emite avisos de error. Pendiente la revisión visual con una sesión autenticada.

## EPJ-66 — Dos asistentes por fila

- Capacidad inicial de 60% en 5 h y 82% en 7 días. Los bloques de asistencia muestran dos columnas y los coches mantienen su lista. Biome, tipos y build correctos. Sin comprobación en navegador autenticado.

## EPJ-67 — Dos pasajeros por fila

- Capacidad inicial de 53% en 5 h y 81% en 7 días. Los coches reutilizan las dos columnas de asistencia. Biome, tipos y build correctos.

## EPJ-68 — Arrastre y subelementos de compra

- Capacidad inicial de 40% en 5 h y 78% en 7 días. El arrastre muestra una copia y el destino. La anidación admite un nivel y el modal confirma el grupo exacto.
- Biome, tipos, tres pruebas de la lista y build correctos. Pendiente la comprobación del arrastre en navegador autenticado con ratón y pantalla táctil.

## EPJ-69 — Lista de productos en la confirmación

- Capacidad inicial de 30% en 5 h y 77% en 7 días. El modal usa texto singular o una lista anidada según el contenido. Biome, tipos y build correctos.

## EPJ-70 — Avatares compactos en Ebrias

- Capacidad inicial de 13% en 5 h y 74% en 7 días. Avatares de 16 px en las filas y selectores, con iniciales cuando falta la foto o falla su carga.
- Biome incremental, tipos, 22 pruebas y build correctos. El build registró un aviso de DNS al inicializar la autenticación. Queda pendiente comprobar las rutas autenticadas en móvil y escritorio. Chrome terminó al iniciar la comprobación aislada del selector.

## EPJ-71 — Filas compactas de asistentes y coches

- Capacidad inicial de 100% en 5 h y 73% en 7 días. La X queda a 5 px del borde de la fila y el avatar conserva sus 16 px cuando el nombre se reparte en varias líneas.
- Chromium con HTML aislado y estilos de Ebrias a 320, 390 y 1280 px. Asistentes, coches y solo lectura muestran los nombres del pantallazo en una línea y los alias largos completos, sin desbordamiento. La comprobación cubre filas con y sin botón.
- Biome en los dos archivos de código modificados, tipos, 22 pruebas y build correctos. El build registró un aviso DNS al inicializar la autenticación. La revisión de espaciado se hizo sin sesión autenticada.
