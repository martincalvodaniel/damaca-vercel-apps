# Registro de entregas

Registra evidencia observada por iteración. No registres trabajo futuro como evidencia.

## 01 — Definir producto

- Actualizados alcance, reglas, invariantes locales y criterios en `master.md` a partir de la petición humana.
- Referencia contrastada: [reglas de Ludoteka](https://www.ludoteka.com/games/pocha/rules); la secuencia se mantiene configurable porque las mesas varían.
- Decisiones confirmadas: 3–6 jugadores, un móvil, puntuación habitual, sube-baja configurable, copias JSON, interfaz en español, empate elegible, corrección histórica y rotación de turnos.
- La interfaz compacta móvil y los controles numéricos −/+ se añadieron tras los requisitos posteriores de la persona propietaria.

## 02 — Motor y persistencia

- Añadidos esquemas, cálculo puro de puntuación y secuencias, repositorio IndexedDB con control de revisión, importación transaccional y exportación JSON.
- Migración de base 1 a 2 conserva las preferencias y crea el almacén de partidas.
- `bun run test --filter=@damaca/pocha-score`: 25 pruebas pasan, 0 fallan (reglas, persistencia, migración, copias y worker).
- `bun run type-check --filter=@damaca/pocha-score`: pasa.

## 03 — Experiencia de partida

- Añadidos creación, anotación en dos fases, autoguardado, edición histórica, clasificación, desempate, historial, importación/exportación, ajustes y textos en español.
- Campos numéricos con botones accesibles de decremento e incremento; espacios compactos, diseño responsive y tabla desplazable horizontalmente en móvil.
- Revisión visual e interacción en navegador a 390×844 y 1440×900. Comprobado que la pantalla móvil no tiene desbordamiento horizontal y que las acciones −/+ actualizan las pedidas.
- La evidencia de navegador usó IndexedDB local de prueba en localhost; no se usó una instalación nativa.

## 04 — Validar PWA y cerrar

- Capacidad consultada el 2026-10-24 09:30 UTC: 62% restante en ventana de 5 h (reinicio 13:19 UTC) y 93% restante en ventana de 7 días (reinicio 2026-10-30 18:44 UTC).
- `bun run build --filter=@damaca/pocha-score`: pasa; genera `/`, `/settings`, manifiesto y service worker con shell de 46 archivos.
- Pruebas de service worker y generación de shell pasan dentro de las 25 pruebas del app.
- `bunx biome check apps/pocha-score`: pasa en 52 archivos. `bun run lint --changed --since=HEAD` comprobó 0 archivos, así que los archivos nuevos y la app completa se verificaron con Biome directamente.
- `git diff --check`: pasa.
- Pendiente: la herramienta de navegador disponible no expone un control de red offline; no se verificó recarga offline de extremo a extremo ni instalación nativa. Se conservan pruebas automatizadas del worker y del shell como evidencia parcial.
