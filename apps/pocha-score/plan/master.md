# Plan de producto

## Estado actual

Pocha Score es un marcador local e instalable para partidas presenciales de pocha. Una persona anota desde un dispositivo compartido entre 3 y 6 jugadores. Interfaz y mensajes en español. El producto conserva el almacenamiento local, exportación estática, instalación y acceso offline de esta app; no tiene cuentas, backend, telemetría ni sincronización.

## Alcance vigente

- Crear múltiples partidas con nombres únicos, orden de juego y primer repartidor.
- Generar y previsualizar rondas sube-baja. Baraja de 40 cartas, sin doses para tres jugadores; máximo inicial 12, 10, 8 o 6 para 3, 4, 5 o 6 jugadores y opción de reducirlo.
- Repetir por defecto tantas rondas de una carta al inicio, máximo y final como jugadores. Personalizar cada repetición con mínimo una; combinar repeticiones en un único bloque si el máximo es una carta.
- Rotar repartidor; quien pide después del repartidor abre y este pide último. Las pedidas no pueden sumar exactamente las bazas disponibles.
- Calcular acierto como 10 + 5 por baza y fallo como -5 por baza de diferencia. Completar rondas solo cuando las bazas conseguidas suman el total disponible.
- Guardar automáticamente rondas y borradores, reanudar, corregir cualquier ronda cerrada con recálculo posterior, consultar historial y decidir empates finales con victoria compartida o ronda extra de una carta.
- Exportar todas las partidas a JSON validado e importar como copias nuevas sin sobreescritura.
- Priorizar el uso móvil con márgenes y separaciones compactos, texto legible y diseño responsive. Los campos numéricos usan controles táctiles minimalistas con decremento a la izquierda e incremento a la derecha.

## Decisiones técnicas

- Mantener Next.js 16 con exportación estática, PWA, IndexedDB, Zod y la arquitectura existente. Añadir store de partidas con migración no destructiva de base 1 a 2; conservar preferencias.
- Mantener puntuación y calendario como funciones puras. No guardar acumulados derivados.
- Guardar con revisiones para detectar cambios de otra pestaña. El conflicto pide recargar en vez de sobrescribir.
- Los datos pertenecen al origen, navegador, perfil y dispositivo. La exportación es el mecanismo de copia manual; instalación no es respaldo.
- Sin multiplicadores, subastas, juego de cartas, penalización de renuncio ni variantes.

## Criterios de producto

Una partida puede configurarse, pausarse, reabrirse y completarse offline. La app valida entradas y sumas, mantiene puntuaciones correctas al corregir rondas, resuelve empates y conserva la información tras cerrar y abrir. Una exportación válida puede recuperarse como otra partida; un archivo inválido no modifica datos. La interfaz es legible, compacta y operable con teclado y táctil en móvil y escritorio; los valores numéricos se pueden escribir o ajustar con controles −/+.

## Referencias y dudas

- La regla de puntuación, prohibición de sumar las bazas pedidas y variantes de calendario se basan en [Ludoteka: reglas de la pocha](https://www.ludoteka.com/games/pocha/rules). Las reglas varían por mesa; la secuencia elegida aquí es configurable.
- No quedan decisiones de producto pendientes para el MVP. Producción y alojamiento no forman parte de esta entrega.
