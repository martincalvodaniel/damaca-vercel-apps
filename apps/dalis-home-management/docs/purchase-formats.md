# Formatos de compra y unidades de consumo

> Estado: propuesta para una futura implementación. Este documento no describe
> funcionalidad disponible actualmente.

## Contexto

La cantidad utilizada en una receta no suele coincidir con la presentación en
la que se compra un producto:
- Una receta puede necesitar 225 g de lentejas, pero las lentejas se compran en
  bolsas de 500 g o 1 kg.
- Un plato puede consumir una parte de una bolsa de queso rallado, mientras que
  en la tienda se compra la bolsa completa.
- Una receta puede necesitar 2 piadinas, aunque se vendan en paquetes de 8.

El modelo debe distinguir cuánto se consume, cuánto hay en casa y qué envase se
compra. Una bolsa o un paquete no es una unidad de medida estable, ya que su
contenido puede variar.

## Objetivos

- Expresar ingredientes con cantidades útiles para cocinar.
- Mantener el inventario en cantidades comparables con las recetas.
- Generar una compra realista en paquetes completos.
- Permitir varios formatos de compra para un mismo producto.
- Actualizar el inventario con el contenido real de los paquetes comprados.
- Mostrar al usuario por qué se propone una cantidad y cuánto sobrará.

## Fuera de alcance inicial

- Gestión de lotes, fechas de caducidad o paquetes concretos.
- Seguimiento de paquetes abiertos y cerrados por separado.
- Marcas, precios, ofertas o selección automática del formato más barato.
- Conversión entre magnitudes incompatibles, como gramos y mililitros.
- Estimación automática de expresiones no cuantificadas como “un poco”.

## Separación de conceptos

El dominio debe separar tres cantidades:
1. **Cantidad de consumo**: lo que utiliza una receta.
2. **Cantidad de inventario**: lo que hay disponible en casa.
3. **Cantidad de compra**: el número de paquetes o envases que se comprará.

Las cantidades de consumo e inventario utilizan una unidad base. La cantidad de
compra utiliza un formato comercial que indica cuánto contiene cada paquete.

## Unidades base

Las cantidades deberían almacenarse normalizadas en una de estas unidades:
- `gram`
- `milliliter`
- `unit`

Los kilogramos y litros serían unidades de entrada o visualización:
- 1 kg se almacena como 1000 g.
- 1,5 l se almacena como 1500 ml.

Esto evita comparar valores expresados en escalas diferentes. La interfaz puede
elegir automáticamente la representación más legible sin cambiar el valor
almacenado.

## Modelo propuesto

### Producto

`inventory_items` puede seguir siendo el catálogo canónico y el inventario. El
producto incorpora uno o varios formatos de compra.

```ts
interface Product {
  id: string
  name: string
  baseUnit: "gram" | "milliliter" | "unit"
  inventoryQuantity: number
  purchaseFormats: PurchaseFormat[]
}

interface PurchaseFormat {
  id: string
  name: string
  contentQuantity: number
  isDefault: boolean
  purchasePlaces: string[]
}
```

Ejemplo:

```ts
const lentils: Product = {
  id: "lentils",
  name: "Lentejas",
  baseUnit: "gram",
  inventoryQuantity: 300,
  purchaseFormats: [
    {
      id: "bag-500",
      name: "Bolsa",
      contentQuantity: 500,
      isDefault: true,
      purchasePlaces: ["Supermercado"],
    },
    {
      id: "bag-1000",
      name: "Bolsa",
      contentQuantity: 1000,
      isDefault: false,
      purchasePlaces: ["Supermercado"],
    },
  ],
}
```

Reglas recomendadas:
- Los identificadores de formato deben ser estables.
- Solo puede existir un formato predeterminado por producto.
- `contentQuantity` siempre se expresa en la unidad base del producto.
- Los formatos de compra deben pertenecer al producto; no necesitan una
  colección independiente.
- Un producto puede no tener formatos si se compra a granel o si todavía no se
  han configurado.

### Ingrediente

La receta guarda la cantidad que realmente consume, no el número de paquetes.

```ts
interface Ingredient {
  productId: string
  quantity: number
}
```

La unidad se obtiene del producto. Una receta con 225 g de lentejas almacenaría:

```ts
const ingredient: Ingredient = {
  productId: "lentils",
  quantity: 225,
}
```

### Elemento de la lista de la compra

Una propuesta generada debe conservar la necesidad calculada y la elección de
compra realizada por el usuario.

```ts
interface ShoppingListItem {
  productId: string
  requiredQuantity: number | null
  purchaseFormat: PurchaseFormatSnapshot | null
  packageCount: number
  isMealPlanGenerated: boolean
  isPurchased: boolean
}

interface PurchaseFormatSnapshot {
  formatId: string
  name: string
  contentQuantity: number
}
```

El snapshot evita que editar posteriormente un formato de compra modifique una
línea que ya estaba preparada. Al ser la lista efímera, también sería posible
guardar solo `formatId` y resolver el formato actual, pero el snapshot ofrece un
comportamiento más predecible al actualizar el inventario.

Para productos sin formato, la línea puede seguir usando una cantidad directa
en la unidad base. La implementación debería tratar explícitamente ambos modos:
- Compra por paquetes completos.
- Compra directa o a granel.

## Cálculo de la compra

Para cada producto de una semana:

```text
requiredQuantity = sum(recipe ingredient quantities)
missingQuantity = max(requiredQuantity - inventoryQuantity, 0)
packageCount = ceil(missingQuantity / formatContentQuantity)
purchasedQuantity = packageCount * formatContentQuantity
surplusQuantity = purchasedQuantity - missingQuantity
```

Ejemplo:

```text
Necesidad semanal: 900 g
Inventario actual: 100 g
Cantidad faltante: 800 g
Formato seleccionado: bolsa de 500 g
Paquetes propuestos: 2
Cantidad comprada: 1000 g
Excedente sobre la necesidad: 200 g
```

Cuando no falta producto, no se debe añadir una línea nueva a Compra. La vista
previa del menú puede seguir mostrando que el inventario cubre la necesidad.

## Ejemplos completos

### Lentejas

Configuración:

```text
Unidad base: gramos
Cantidad de receta: 225 g
Formatos: bolsa de 500 g y bolsa de 1 kg
Formato predeterminado: bolsa de 500 g
```

Sin inventario, Compra mostraría:

```text
Lentejas
Faltan 225 g
[−] 1 bolsa [＋]
Bolsa de 500 g
Añadirá 500 g al inventario · Sobrarán 275 g
```

Si hay 100 g en inventario, faltan 125 g y se sigue proponiendo una bolsa de
500 g. El usuario puede cambiar el formato a 1 kg o ajustar el número de bolsas.

### Queso rallado

Configuración:

```text
Unidad base: gramos
Cantidad de receta: 50 g
Formato: bolsa de 150 g
```

Las recetas deberían guardar gramos, incluso si el usuario piensa en fracciones
de bolsa. El formulario puede ofrecer atajos de entrada:

```text
Poco · ⅓ bolsa · ½ bolsa · 1 bolsa
```

Al pulsar `⅓ bolsa`, la aplicación convierte el valor utilizando el formato
predeterminado y guarda 50 g. La receta no debe guardar la fracción, porque
cambiar el tamaño habitual de la bolsa alteraría retroactivamente el plato.

“Un poco” solo puede participar en cálculos si se convierte a una cantidad
numérica. Podría ser un preset configurable, por ejemplo 30 g, pero no debería
ser un valor cualitativo dentro del modelo persistido.

### Piadinas

Configuración:

```text
Unidad base: unidades
Cantidad de receta: 2 unidades
Formato: paquete de 8 unidades
```

Sin inventario, Compra mostraría:

```text
Piadinas
Faltan 2 uds.
[−] 1 paquete [＋]
8 uds. por paquete · Sobrarán 6 uds.
```

Al completar la compra se incorporan 8 unidades al inventario. Si la necesidad
semanal fuese de 10 unidades, se propondrían 2 paquetes y se incorporarían 16.

## Experiencia de usuario

### Edición de producto

El formulario de producto debería permitir:
- Seleccionar su unidad base.
- Añadir, editar y eliminar formatos de compra.
- Elegir el formato predeterminado.
- Indicar el nombre del envase: bolsa, paquete, botella, bandeja, etc.
- Indicar cuánto contiene el formato.
- Asociar opcionalmente lugares de compra a cada formato.

Ejemplo:

```text
Producto: Lentejas
Unidad base: gramos

Formatos de compra
● Bolsa · 500 g · Supermercado
○ Bolsa · 1 kg · Supermercado
```

### Edición de receta

La cantidad debe expresarse en la unidad base del producto:

```text
Lentejas
[−] 225 g [＋]
```

Los atajos basados en fracciones de envase serían una mejora posterior de la
interfaz. Siempre deben convertir el resultado a la unidad base antes de guardar.

### Lista de la compra

La tarjeta debe distinguir necesidad y decisión de compra:

```text
Lentejas                           Menú
Faltan 225 g

[−] 1 bolsa [＋]        Bolsa de 500 g
Añadirá 500 g al inventario
```

El usuario debería poder:
- Cambiar el número de paquetes.
- Cambiar entre los formatos disponibles.
- Ver cuánto falta según menú e inventario.
- Ver cuánto se añadirá al inventario.
- Ver el excedente esperado.

Para una línea manual bastaría con seleccionar producto, formato y número de
paquetes. Si no existe un formato, se introduciría una cantidad directa.

### Actualización del inventario

La acción “Actualizar inventario y limpiar” debe incrementar el inventario con:

```text
packageCount * purchaseFormat.contentQuantity
```

No debe incrementar el inventario con `packageCount`, salvo que el formato
contenga exactamente una unidad base.

## Primera iteración recomendada

1. Restringir el almacenamiento canónico a gramos, mililitros y unidades.
2. Añadir formatos de compra embebidos en cada producto.
3. Permitir un formato predeterminado.
4. Mantener las recetas en cantidades de unidad base.
5. Generar paquetes mediante redondeo hacia arriba.
6. Permitir cambiar formato y número de paquetes en Compra.
7. Mostrar necesidad, contenido comprado y excedente.
8. Actualizar el inventario con el contenido total comprado.

Los presets como `⅓ bolsa` o “Poco” deberían quedar para una segunda iteración.

## Consideraciones de persistencia

- El cambio modifica el significado actual de `unit` y `quantity`, por lo que
  requiere una estrategia explícita de migración o limpieza de datos.
- Las acciones de servidor deben validar formatos y cantidades mediante Zod.
- El servidor debe derivar la unidad y el contenido desde el producto; no debe
  confiar en snapshots enviados por el cliente.
- El resultado de actualizar inventario y limpiar debe mantener la idempotencia
  para evitar aplicar dos veces el contenido de los paquetes.
- Al añadir consultas por campos embebidos, formatos predeterminados o lugares de
  compra, se deben evaluar y registrar los índices correspondientes en
  `src/lib/db/ensure-indexes.ts`.

## Decisiones pendientes

Antes de implementar conviene decidir:
1. Si un formato puede estar asociado a varios lugares de compra o solo uno.
2. Si Compra guarda un snapshot del formato o siempre utiliza su versión actual.
3. Cómo se representa la compra a granel y cuál es su incremento mínimo.
4. Si se permite cambiar la unidad base de un producto que ya tiene recetas.
5. Cómo se redondean conversiones como un tercio de una bolsa de 200 g.
6. Si el excedente es solo informativo o actualiza alguna previsión antes de
   completar la compra.
7. Si los formatos eliminados deben archivarse para conservar referencias
   pendientes.
