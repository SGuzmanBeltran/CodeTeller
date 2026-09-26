# Módulo introductorio: inyección de dependencias (DI)

## Propósito y alcance

Esta es la especificación de contenido y comportamiento para implementar el módulo introductorio de DI en CodeTeller. Público: personas que saben programar, pero todavía no conocen DI ni arquitectura de software. Se reutilizan la selección de fragmentos de código, el diagrama y el ciclo de comprobación que ya existen. Los fragmentos Python se muestran y se evalúan por las opciones elegidas; **no se ejecuta Python del alumno**.

Al terminar, la persona debe poder explicar quién construye una dependencia y quién la utiliza, inyectarla por constructor, conectarla en el punto de entrada y sustituirla en una prueba sin infraestructura. También debe poder repetir esas decisiones en otro dominio. Acertar por descarte no equivale a comprender: el último reto reduce las pistas y sirve para comprobar la transferencia.

**Idea central:** DI consiste en entregar a un objeto sus colaboradores desde fuera, en lugar de hacer que los busque o los construya. Facilita elegir implementaciones en distintos contextos y aislar pruebas; no garantiza por sí sola una arquitectura flexible, ni obliga a usar un contenedor o una interfaz.

## Decisiones para esta versión

- Recorrido principal: `constructor-injection` -> `composition-root` -> `test-double` -> `capstone`. Cada reto responde una pregunta nueva y se desbloquea al superar el anterior. No añadir más niveles principales por ahora.
- `service-locator` queda como profundización posterior sobre dependencias ocultas; `di-vs-dip`, como puente separado hacia DIP (la D de SOLID). No cuentan para completar este módulo. Si se conservan en el producto, ofrecerlos fuera del recorrido principal, no intercalados aquí.
- Mantener `OrderService` y `MongoOrderStorage` con esos nombres durante los tres primeros retos. El contrato `Storage` **ya existe y se muestra** en el contexto inicial, sin pedir al alumno que lo invente. Es infraestructura didáctica para que el código Python sea coherente, no el concepto que se examina. En el reto final se proporciona de igual forma `Mailer`.
- Cada reto tiene un problema concreto, una pregunta, una decisión mediante código y una consecuencia visible. Evitar dar una definición extensa antes de que aparezca la necesidad.
- Se permiten varias opciones simultáneas; para aprobar se exige exactamente el conjunto correcto, sin opciones extra. Al fallar se explican solo las seleccionadas; al aprobar se revelan todas. Conservar los identificadores de opción existentes siempre que sea posible.

## Base compartida de los retos 1 a 3

El servicio coloca pedidos. Al inicio valida el identificador, crea `pymongo.MongoClient` y llama a `client["shop"]["orders"].insert_one(order)` dentro de `place`. El proyecto ya dispone del siguiente contrato, mostrado en el contexto del reto 1:

```python
from typing import Protocol

class Storage(Protocol):
    def save(self, order: dict) -> None: ...
```

Al finalizar el primer reto, el estado que se arrastra a los siguientes debe ser coherente con esto:

```python
class MongoOrderStorage:
    def __init__(self, client: pymongo.MongoClient):
        self.collection = client["shop"]["orders"]

    def save(self, order: dict) -> None:
        self.collection.insert_one(order)

class OrderService:
    def __init__(self, storage: Storage):
        self.storage = storage

    def place(self, order: dict) -> None:
        if not order.get("id"):
            raise ValueError("Missing order id")
        self.storage.save(order)
```

`Storage` es una anotación y un contrato estructural en Python, no una garantía en tiempo de ejecución. La lección aquí es *cómo* se entrega el colaborador; el porqué de orientar las dependencias hacia abstracciones se trata después en DIP. No afirmar que DI y DIP son sinónimos.

## Reto 1: separar y recibir (`constructor-injection`)

**Pregunta:** Si `OrderService` crea un cliente MongoDB y usa su colección, ¿cómo hacemos que reciba a quien guarda el pedido?

**1. Objetivo.** Sacar del servicio la creación del cliente y los detalles de colección y `insert_one`, sin cambiar la validación del pedido. Enseñar dos momentos distintos dentro de **un solo reto**: extraer el acceso a MongoDB a `MongoOrderStorage` separa responsabilidades; pasar `storage` al constructor es la inyección. `MongoOrderStorage` recibe el cliente, que se construirá en el punto de entrada en el reto 2. El contrato `Storage` ya se proporciona, no es una tercera opción a descubrir.

**2. Opciones de código (selección múltiple).** Mantener las tarjetas actuales, con estos significados y fragmentos representativos:

| ID | Cambio propuesto | Papel y explicación al revelar |
| --- | --- | --- |
| `extract-storage` | Definir `MongoOrderStorage(client).save(order)`, que elige `client["shop"]["orders"]` y llama a `insert_one`. | Correcta, pero sola deja una pieza que `OrderService` todavía no utiliza. |
| `inject-storage` | `def __init__(self, storage: Storage): self.storage = storage`; `place` conserva la validación y termina en `self.storage.save(order)`. | Correcta, pero necesita una implementación que asuma el acceso a MongoDB. |
| `inject-client` | `def __init__(self, client: pymongo.MongoClient): self.client = client`. | **Sí es DI**, pero no alcanza el objetivo de este reto: el servicio sigue eligiendo colecciones y llamando a `insert_one`. Evitar presentarla como DI inválida. |
| `lazy-client` | Crear `pymongo.MongoClient` dentro de `place` al primer uso. | Cambia el momento de construcción, no el dueño ni el acoplamiento. |
| `module-singleton` | Crear un cliente global en un módulo e importarlo en el servicio. | La dependencia no llega explícitamente al constructor; dificulta sustituirla en este ejercicio. |

No hace falta mostrar todo el código anterior dentro de cada tarjeta: sí debe quedar visible qué fragmento se cambia y qué permanece en `OrderService`. Los nombres, el método `save` y el contrato deben coincidir en el enunciado, las tarjetas y el resultado.

**3. Interacción del sistema.** Inicialmente, el diagrama muestra `OrderService` ligado a `pymongo.MongoClient`, sin insinuar que ya se inyecta nada. Al marcar solo `extract-storage`, aparece `MongoOrderStorage` como pieza sin conectar y el servicio sigue acoplado. Al marcar solo `inject-storage`, mostrar la intención de recibir `Storage` pero señalar que aún falta mover el acceso a la colección; **no** dibujar una solución terminada. Con ambas y sin extras, el diagrama muestra `OrderService -> Storage <- MongoOrderStorage`: el servicio recibe un colaborador, no lo crea. Con cualquier distractor seleccionado, la comprobación no aprueba y el diagrama deja visible el acoplamiento que permanece. Tras un fallo, explicar únicamente las tarjetas elegidas y permitir modificar la selección y volver a comprobar.

**4. Respuesta correcta.** `['extract-storage', 'inject-storage']`, sin ninguna opción adicional. Cierre: “Separamos quién sabe de MongoDB de quién coloca pedidos. Luego entregamos esa pieza al servicio por el constructor. Extraer y recibir son decisiones distintas”.

**Comprobación de comprensión:** pedir al alumno identificar qué línea del constructor deja de crear `MongoClient` y qué parte conoce ahora la colección y `insert_one`. La pista puede recordar las dos responsabilidades, pero no enumerar los IDs correctos.

## Reto 2: conectar la aplicación (`composition-root`)

**Pregunta:** Si `OrderService` ya recibe `Storage`, ¿quién crea `MongoClient` y `MongoOrderStorage` en producción?

**1. Objetivo.** Conservar el servicio del reto anterior y ensamblar la aplicación en su punto de entrada. La palabra *composition root* nombra el lugar donde se toman decisiones concretas; no implica que siempre exista un archivo llamado `main.py`.

**Estado inicial:** el servicio ya pide `Storage`, pero el arranque tiene un TODO y no construye ni conecta el adaptador. El diagrama debe diferenciar “declara una dependencia” de “la aplicación ya está ensamblada”.

**2. Opciones de código (selección única válida).**

| ID | Cambio propuesto | Papel y explicación al revelar |
| --- | --- | --- |
| `wire-at-root` | En el punto de entrada: `client = pymongo.MongoClient("mongodb://localhost:27017"); storage = MongoOrderStorage(client); service = OrderService(storage)`. | Correcta; el borde de la aplicación construye cliente y adaptador. |
| `inject-settings` | Entregar `Settings` al servicio para que allí llame a `build_storage(settings)`. | El servicio sigue escogiendo y construyendo su infraestructura. |
| `factory-in-core` | Crear `OrderService(MongoOrderStorage(pymongo.MongoClient(...)))` en una factoría dentro del módulo del servicio. | La factoría sigue llevando el conocimiento de MongoDB al núcleo; una factoría en el borde sería otra historia. |
| `lazy-init` | Construir `MongoClient` y `MongoOrderStorage` al primer uso en una propiedad del servicio. | Retrasa la decisión pero la mantiene dentro del consumidor. |

**3. Interacción del sistema.** Antes de escoger, mostrar el servicio esperando una instancia: conoce `Storage`, pero la app no está conectada. Al escoger `wire-at-root`, mostrar que el punto de entrada construye `MongoClient` y entrega `MongoOrderStorage`. Las selecciones incorrectas muestran dónde permanece la decisión concreta; no se debe indicar “listo para producción” simplemente porque el servicio declara `Storage`. Como en el reto anterior, las tarjetas se pueden cambiar y volver a comprobar.

**4. Respuesta correcta.** `['wire-at-root']`. Cierre: “El servicio declara qué necesita; el punto de entrada decide con qué satisfacerlo. En otro contexto se podría conectar otra implementación sin mover esa decisión al servicio”.

**Comprobación de comprensión:** preguntar en qué archivo o capa buscaría el alumno para cambiar de proveedor sin editar `OrderService`.

## Reto 3: probar sin MongoDB (`test-double`)

**Pregunta:** ¿Cómo probamos la lógica de pedidos sin arrancar MongoDB ni modificar `OrderService`?

**1. Objetivo.** Observar la ventaja de la inyección: construir el mismo servicio con un doble en la prueba, llamar a `place` y comprobar qué se guardó. No basta con instanciar el servicio; hay que verificar comportamiento. `FakeStorage` está disponible en el enunciado y cumple el contrato ya presentado:

```python
class FakeStorage:
    def __init__(self):
        self.saved: list[dict] = []

    def save(self, order: dict) -> None:
        self.saved.append(order)
```

**2. Opciones de código (selección única válida).**

| ID | Cambio propuesto | Papel y explicación al revelar |
| --- | --- | --- |
| `fake-in-test` | `fake = FakeStorage(); service = OrderService(fake); service.place({"id": "A-1"}); assert fake.saved == [{"id": "A-1"}]`. | Correcta: prueba el comportamiento del servicio y observa el efecto sin servidor. |
| `mongomock-client` | Probar `OrderService(MongoOrderStorage(mongomock.MongoClient()))`. | Válida para **otro objetivo**, como probar el adaptador MongoDB; aquí mezcla el adaptador con la lógica de pedidos. |
| `monkeypatch-mongo` | Parchear en el test un import de `MongoOrderStorage`. | Aquí es innecesario y más frágil que entregar el doble por el constructor; el servicio no importa ese adaptador. |
| `skip-without-mongo` | Saltar la prueba si MongoDB no está disponible. | Evita la infraestructura dejando la lógica sin comprobar. |

**3. Interacción del sistema.** Estado inicial: producción usa `MongoOrderStorage` y la prueba aún depende de MongoDB. Al escoger `fake-in-test`, añadir `FakeStorage` como implementación usada por el test **sin reemplazar** la de producción y mostrar que `OrderService` no cambia. Al fallar, distinguir “la prueba sigue usando el adaptador”, “requiere parches” y “no se ejecuta”. No prometer que `mongomock` es incorrecto en todas las pruebas. Si el diagrama no representa una operación o una aserción, mostrarlas en la tarjeta y en el feedback; no inventar que el diagrama ejecuta Python.

**4. Respuesta correcta.** `['fake-in-test']`. Cierre: “Producción y prueba construyen el mismo servicio con colaboradores distintos. La prueba comprueba un pedido guardado sin abrir una conexión”.

**Comprobación de comprensión:** pedir al alumno indicar qué está probando (`OrderService`), qué no está probando (`MongoOrderStorage`) y por qué puede evitar MongoDB.

## Reto 4: aplicar la idea a correo (`capstone`)

**Pregunta:** Ante un proveedor de correo que va a cambiar, ¿puedes aplicar la misma idea sin tocar la lógica de notificaciones?

**1. Objetivo.** Repetir el razonamiento en un dominio nuevo con menos orientación: `NotificationService` hoy crea `SmtpMailer`; debe recibir un colaborador y el test debe sustituirlo. El enunciado proporciona `Mailer` con `send(to: str, subject: str, body: str) -> None` y un `FakeMailer` que guarda los mensajes enviados. No se pide diseñar un nuevo contrato desde cero ni aprender DIP aquí. El servicio conserva `send_welcome(address: str)`, que llama a `mailer.send(address, "Welcome", ...)`.

**2. Opciones de código (selección múltiple).**

| ID | Cambio propuesto | Papel y explicación al revelar |
| --- | --- | --- |
| `inject-mailer` | `def __init__(self, mailer: Mailer): self.mailer = mailer`; `send_welcome` usa `self.mailer.send(...)`. | Correcta: el servicio deja de crear `SmtpMailer`. |
| `fake-mailer-test` | `fake = FakeMailer(); service = NotificationService(fake); service.send_welcome("a@example.com"); assert fake.sent[0].to == "a@example.com"`. | Correcta: comprueba que el flujo llama al colaborador sin red. Definir `sent` como registros con el campo `to` en el enunciado. |
| `optional-mailer` | `mailer: Mailer | None = None` y `self.mailer = mailer or SmtpMailer()`. | El test puede funcionar, pero el servicio sigue eligiendo SMTP si no se le entrega nada. |
| `patch-smtplib` | Parchear `smtplib.SMTP` en el test. | Puede evitar envíos reales, pero acopla esta prueba a los detalles de SMTP y no resuelve el cambio de proveedor. |
| `env-mailer` | Elegir `FakeMailer` o `SmtpMailer` según `APP_ENV` dentro del servicio. | El servicio conoce el entorno y las implementaciones; la decisión debería estar fuera. |

**3. Interacción del sistema.** Comenzar con `NotificationService -> SmtpMailer` y una prueba que depende de red. Una elección parcial permite reconocer qué se ha logrado y qué falta; no declarar victoria hasta que el servicio deje de crear SMTP **y** se compruebe la prueba con el fake. Al completar, mostrar dos conexiones en sus respectivos contextos: producción conecta `SmtpMailer` desde el punto de entrada y el test entrega `FakeMailer`. El servicio utiliza el mismo constructor en ambos. Mantener pistas menos explícitas que en el reto 1; la devolución final debe explicar por qué las dos opciones funcionan juntas.

**4. Respuesta correcta.** `['inject-mailer', 'fake-mailer-test']`. Cierre: “No cambió el servicio para cada entorno: cambió qué se le entrega al construirlo. Producción usa SMTP; el test usa un fake. Eso es DI aplicada a un problema nuevo”.

**Comprobación de comprensión:** sin revelar tarjetas, pedir que el alumno señale dónde se cambiaría el proveedor real y por qué la prueba sigue funcionando sin SMTP.

## Comportamiento común y criterios de aceptación

1. Mantener panel de misión, fragmentos seleccionables, pista bajo demanda, diagrama, botón de comprobar, feedback y avance secuencial. Mostrar el problema antes del vocabulario; cada reto puede nombrar el concepto después de exponerlo. No añadir una pantalla larga de teoría ni ejecutar fragmentos Python.
2. Barajar las opciones al entrar a un reto; el orden no cambia su ID ni su significado. La selección actualiza la vista previa del diagrama. Comprobar exige igualdad exacta de conjuntos; no aprobar una opción correcta mezclada con un distractor. Si se edita la selección tras comprobar, limpiar el resultado previo.
3. En un intento incompleto revelar y explicar solo las opciones marcadas, con feedback accionable sobre el objetivo concreto; tras acertar, mostrar la explicación de todas. No llamar “incorrecta en general” a una técnica válida para otro objetivo. Usar texto y estados legibles, no depender solo del color.
4. El diagrama no debe confundir existencia de un contrato, inyección de una dependencia y ensamblaje efectivo en el punto de entrada. En el reto 1 debe representar la extracción sola como pieza suelta; en el 2 hace falta representar el ensamblaje ausente/presente (el `effect: 'composition'` actual no modifica `getDiagramState`); en el 3 y el 4 distinguir implementaciones de producción y de prueba. Si alguna transición no cabe en los flags actuales, extender **solo** el estado y la vista necesarios para mostrarla con honestidad.
5. Mantener consistencia entre códigos y resultados: `MongoOrderStorage` en retos 1-3, `Storage.save` para el servicio y ambos adaptadores, `Mailer.send` y `FakeMailer.sent` definidos antes de usarlos. No mostrar un fake incompatible con el tipo que espera el constructor. Los ejemplos de aserción son ilustrativos, no resultados de una ejecución real.
6. Persistir avance, selección y resultado por reto. Los tres IDs de opción que antes nombraban el proveedor ya se traducen al cargar `codeteller-di-intro-module-v2`; mantener esta compatibilidad. Revisar `diLevels`, `LevelId`, el cálculo de `moduleComplete`, los numeradores y los textos de la portada para que solo los cuatro retos principales cuenten. No borrar ni reinterpretar silenciosamente el progreso de quienes ya empezaron seis retos: mapear IDs y completados que sigan siendo válidos; si el contenido cambia sustancialmente, pedir repetir el reto sin afirmar que ya se ha superado. Preferencias de idioma y tema no se reinician.
7. Implementar el mismo contenido y matices en español e inglés. Revisar textos en `src/i18n/es.ts` y `src/i18n/en.ts`, datos en `src/data/diModule.ts`, estados del diagrama en `src/data/diagramState.ts`, flujo en `src/App.tsx`, progreso en `src/progress.ts`, componentes existentes solo si hace falta y documentación de portada en `README.md`. No añadir un sistema de puntuación ni nuevos conceptos arquitectónicos al flujo principal.
8. Probar al menos: extracción sola, inyección sola, solución completa, solución con distractor, selección modificada tras fallo, paso al siguiente reto, recarga con progreso, idiomas ES/EN, finalización tras cuatro retos y usuario con progreso guardado de seis. Ejecutar `pnpm build` y `pnpm lint` después de implementar; verificar también el recorrido manual en móvil y escritorio.

## Señal de aprendizaje

Tras completar el módulo, preguntar sin opciones: “Un servicio crea un cliente externo y la prueba requiere red: ¿qué cambiarías en el constructor, dónde construirías el cliente real y qué pasarías en la prueba?”. Una respuesta suficiente debe describir quién entrega la dependencia, cómo se conecta en producción y por qué la prueba puede sustituirla. Si varias personas no pueden responder, mejorar las pistas y el feedback del paso concreto donde se pierden antes de añadir otro reto. Los contenedores, DIP y arquitectura hexagonal quedan para módulos posteriores.