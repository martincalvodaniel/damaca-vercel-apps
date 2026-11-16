# Registro de entregas de Damaca Digest

[Entregas archivadas el 2026-11-16](archive/2026-11-16/iteration-log.md).

## 19 — Navegar Digest con el teclado

- El panel expone un único contenido principal. El primer Tab revela el enlace para saltar al contenido y Enter mueve allí el foco. Los controles muestran un contorno visible y la navegación diferencia la página actual de la sección activa.
- Biome, tipos, 49 pruebas, build e integración HTTP con MongoDB pasaron. Chrome a 320 y 1280 px verificó el salto y la navegación con Tab hasta los controles principales de biblioteca, ficha, Topics y Compartir.
- El registro en el menú Compartir y el envío desde el conector siguen pendientes en un Android real con una versión publicada.

## 20 — Usar el complemento del entorno al compartir

- Compartir usa el nombre de la instalación en el prompt y en las instrucciones. Android utiliza el intent de Chrome con alternativa web. iOS usa el enlace universal de ChatGPT.
- Pasaron Biome, 50 pruebas, builds de main e int, verificación de HTML y portapapeles en Chrome a 320 px e integración HTTP de int con MongoDB aislado. La apertura nativa queda por comprobar en dispositivos móviles.

## 21 — Abrir ChatGPT desde Chrome para Android

- La ruta Compartir sirve un enlace directo al esquema de la app para Android y conserva la alternativa HTTPS. Si copiar agota la activación, muestra que el prompt se copió y permite tocar el enlace.
- Biome, 50 pruebas, build e integración HTTP de int pasaron. La prueba HTTP comprobó el intent renderizado al simular Chrome para Android. Falta confirmar que la app lo resuelve en un dispositivo real.

## 22 — Compactar la interfaz de Digest

- Topics pasa a la navegación. La captura ocupa el icono a la izquierda del buscador. La ficha agrupa sus acciones y el editor las mantiene arriba, con confirmación de borrado.
- Pasaron Biome, tipos, 50 pruebas, build e integración HTTP con MongoDB. Chrome a 320 y 1280 px comprobó la alineación del buscador, la navegación, la barra sticky, el foco inicial del diálogo, la cancelación, el guardado de favorito y la confirmación del borrado.

## 23 — Compactar controles y facilitar filtros

- Captura reutiliza la navegación y sigue siendo pública. Cada autor del listado añade su filtro manteniendo la búsqueda y los filtros activos. El selector de estado de lectura pasa a la barra sticky del editor.
- Biome, tipos, 50 pruebas, build e integración HTTP con MongoDB pasaron. Chrome a 320 y 1280 px comprobó la navegación de Captura, el filtro por autor y el guardado de estados.

## 24 — Unificar los buscadores de Library y Topics

- Búsqueda y gestión de Topics ahora comparten un panel con los estilos de Library. Ambos buscadores usan la misma lupa verde.
- Biome, tipos, 50 pruebas, build e integración HTTP pasaron. Chrome comparó los estilos y comprobó los desplegables a 320 y 1280 px.

## 25 — Abrir filtros y gestión de topics en modales

- Los disparadores se sitúan a la izquierda de la lupa. Ambas modales usan una barra sticky para aplicar, limpiar y cerrar. Limpiar filtros conserva el término de búsqueda y limpiar la gestión de topics restablece el formulario.
- Biome, tipos, 50 pruebas, build e integración HTTP pasaron. Chrome a 320 y 1280 px comprobó la pantalla completa, el foco, la barra sticky y las acciones de filtros y limpieza.

## 26 — Fijar los buscadores y alinear las acciones

- Los buscadores quedan arriba al desplazarse y debajo de la navegación en escritorio. La papelera de filtros queda a la izquierda de aplicar. La gestión de topics conserva aplicar y cerrar en las mismas posiciones.
- Biome, tipos, 50 pruebas y build pasaron. Chrome verificó el desplazamiento y las coordenadas de las acciones a 320 y 1280 px.

## 27 — Cambiar de pestaña con un gesto horizontal

- Las tres pestañas admiten gestos táctiles hacia la pestaña contigua, con límites en Library y Settings. La lupa de Topics queda centrada con el campo y el icono de gestión.
- Biome, tipos, 50 pruebas y build pasaron. Chrome verificó los gestos en ambas direcciones, los límites, el desplazamiento vertical, los controles y las pantallas excluidas. La alineación se comprobó en móvil y escritorio.

## 28 — Mover Captura a la navegación

- Capture ocupa el primer destino y Library usa un icono de libros. Se retira el botón de captura del buscador. Los gestos mantienen el recorrido entre las tres pestañas existentes.
- Biome, tipos, 50 pruebas y build pasaron. Chrome comprobó el orden, la apertura y selección de Capture a 320 y 1280 px y los gestos entre las tres pestañas.
