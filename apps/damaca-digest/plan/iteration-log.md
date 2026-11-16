# Registro de entregas de Damaca Digest

[Entregas archivadas el 2026-11-16](archive/2026-11-16/iteration-log.md).

## 15 — Copiar una captura para una sesión de ChatGPT abierta

- La recepción de enlaces permite copiar el prompt sin abrir otra sesión de ChatGPT y conserva la selección manual como alternativa.
- Biome, tipos, 49 pruebas y build pasaron. Chrome a 320 px verificó copia sin navegación, copia con apertura interceptada y mensaje cuando el portapapeles devuelve un error.

## 16 — Buscar en el vocabulario de la biblioteca

- Topics permite buscar por nombre o alias con el mismo filtro normalizado que MCP. Las operaciones y recuentos siguen disponibles.
- Biome, tipos y build pasaron. La integración HTTP buscó un alias fusionado en mayúsculas y un término sin coincidencias. Chrome verificó la vista a 320 y 1280 px.

## 17 — Recuperarse de errores de biblioteca

- El panel muestra un reintento seguro y la ficha inexistente ofrece volver a la biblioteca. Una ficha ajena responde con el mismo 404. Las acciones rápidas validan el selector con Zod.
- Biome, tipos, build e integración HTTP pasaron. En Chrome a 320 px, la búsqueda se recuperó al pulsar el reintento tras restaurar un índice eliminado del MongoDB desechable.

## 18 — Unificar la interfaz de acceso y conexión

- Inicio de sesión, solicitud de acceso y consentimiento usan paneles y controles acordes a la biblioteca.
- Biome, tipos, build, integración HTTP de acceso y OAuth pasaron. Chrome verificó las tres pantallas a 320 y 1280 px, los controles táctiles de al menos 44 px y el permiso de lectura visible en el consentimiento.

- La comprobación final amplió el intervalo de la fixture del digest para cubrir ejecuciones que crucen medianoche UTC. Verificó agrupación por día y que la segunda cuenta recibe únicamente su lectura. El README recoge la comprobación pendiente en Android.

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
