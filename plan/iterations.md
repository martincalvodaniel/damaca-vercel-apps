# Iteraciones transversales

Este archivo es la única fuente de estado de cada iteración transversal. `validated` indica que se cumplieron los criterios documentados; publicación y SHA se verifican en Git y se evidencian en el registro.

## AGW-01 — Centralizar el flujo y el contrato documental

- Estado: `validated`.
- Objetivo: centralizar el protocolo en la raíz, separar funciones de los tres documentos, reducir duplicación local y exigir el sistema a toda app actual y futura.
- Rutas: instrucciones raíz y de apps, `plan/**`, README y enlaces afectados.
- Dependencias: autorización del usuario en esta conversación.
- Aceptación: funciones documentales no duplicadas; workflows locales retirados; archivo histórico conservado donde había volumen; nueva app obligada a incluir estructura antes de trabajo no trivial; sin CI ni generador.
- Validación prevista: enlaces, coherencia, conservación del archivo, `git diff --check`.
- Evidencia: [iteration-log.md#AGW-01](iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental).

## AGW-02 — Generación de apps con Turborepo

- Estado: `pending`; requiere definir y autorizar un trabajo futuro.
- Objetivo: evaluar la futura creación de apps con Turborepo Generate e incluir el contrato documental en el scaffold.
- Rutas/dependencias: por definir al iniciar; parte de la generación de apps.
- Aceptación y validación: por definir antes de implementar; comprobar que se genera la estructura obligatoria, enlaces y límites de producto.
