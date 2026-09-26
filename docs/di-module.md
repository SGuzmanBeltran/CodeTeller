# Módulo introductorio: inyección de dependencias (DI)

## Propósito y alcance

Esta es la especificación de contenido y comportamiento para implementar el módulo introductorio de DI en CodeTeller. Público: personas que saben programar, pero todavía no conocen DI ni arquitectura de software. Se reutilizan la selección de fragmentos de código, el diagrama y el ciclo de comprobación que ya existen. Los fragmentos Python se muestran y se evalúan por las opciones elegidas; **no se ejecuta Python del alumno**.

Al terminar, la persona debe poder explicar quién construye una dependencia y quién la utiliza, inyectarla por constructor, conectarla en el punto de entrada y sustituirla en una prueba sin infraestructura. También debe poder repetir esas decisiones en otro dominio. Acertar por descarte no equivale a comprender: el último reto reduce las pistas y sirve para comprobar la transferencia.

**Idea central:** DI consiste en entregar a un objeto sus colaboradores desde fuera, en lugar de hacer que los busque o los construya. Facilita elegir implementaciones en distintos contextos y aislar pruebas; no garantiza por sí sola una arquitectura flexible, ni obliga a usar un contenedor o una interfaz.

## Decisiones para esta versión

- Recorrido principal: `constructor-injection` -> `storage-adapter` -> `composition-root` -> `test-double` -> `capstone`. El primer reto enseña únicamente a recibir el cliente MongoDB; cada reto posterior añade una pieza del patrón completo. No añadir más niveles principales por ahora.
- `service-locator` queda como profundización posterior sobre dependencias ocultas; `di-vs-dip`, como puente separado hacia DIP (la D de SOLID). No cuentan para completar este módulo. Si se conservan en el producto, ofrecerlos fuera del recorrido principal, no intercalados aquí.
- Mantener `OrderService`, `MongoClient` y `MongoOrderStorage` como hilo conductor. No mostrar ni exigir `Storage` en los primeros retos: introducir ese contrato como soporte para sustituir implementaciones en el reto de pruebas. No evaluar DIP en este módulo; el contrato se explica solo hasta donde hace falta para entender que real y fake ofrecen la misma operación. En el reto integrador se proporciona de igual forma `Mailer`.
- Cada reto tiene un problema concreto, una pregunta, una decisión mediante código y una consecuencia visible. Evitar dar una definición extensa antes de que aparezca la necesidad.
- Se permiten varias opciones simultáneas; para aprobar se exige exactamente el conjunto correcto, sin opciones extra. Al fallar se explican solo las seleccionadas; al aprobar se revelan todas. Conservar los identificadores de opción existentes siempre que sea posible.

## Hilo conductor

Los cinco retos conservan el mismo `OrderService` de pedidos durante los cuatro primeros pasos. El punto de partida crea `MongoClient` dentro del servicio y usa la colección `shop.orders` para insertar el pedido:

```python
class OrderService:
    def __init__(self):
        self.client = pymongo.MongoClient("mongodb://localhost:27017")

    def place(self, order: dict) -> None:
        if not order.get("id"):
            raise ValueError("Missing order id")
        self.client["shop"]["orders"].insert_one(order)
```

En el reto 1, `OrderService` recibe `MongoClient` pero todavía conoce MongoDB y `insert_one`. En el reto 2, `MongoOrderStorage` asume esa responsabilidad y `OrderService` recibe ese adaptador concreto. En el reto 3 se aprende quién construye ambos objetos. En el reto 4 se entrega un `FakeStorage` al mismo servicio para probar el caso sin MongoDB.

Usar `MongoClient` es un objeto cliente; PyMongo normalmente abre conexiones de forma perezosa cuando se necesita operar. No describir la inyección del cliente como “desacoplar OrderService de MongoDB”: desacopla la creación/configuración del cliente, pero el servicio aún depende de la API MongoDB. Esa limitación prepara la pregunta del segundo reto.

## Reto 1: recibir el cliente (`constructor-injection`)

**Pregunta:** ¿Cómo puede `OrderService` usar MongoDB sin crear él mismo el cliente?

**1. Objetivo.** Enseñar la mecánica mínima de DI por constructor: el servicio recibe un `MongoClient` ya configurado. El reto resuelve quién crea y configura el cliente, no cómo eliminar la dependencia de MongoDB.

**Estado inicial:** `OrderService.__init__` llama a `pymongo.MongoClient(...)`; `place` valida el pedido y ejecuta `self.client["shop"]["orders"].insert_one(order)`.

**Por qué conviene recibirlo.** Si cada `OrderService` construye su propio cliente, esa clase decide detalles que pertenecen al arranque de la aplicación: URI y opciones de conexión, credenciales y cuándo se crea y se cierra el cliente. Además, `MongoClient` administra su propio pool de conexiones; crear clientes sin necesidad puede duplicar pools y dificultar su cierre ordenado. Al recibir un cliente, quien ensambla la aplicación puede configurar y reutilizar el cliente adecuado, y una prueba puede entregar un cliente de prueba en lugar de abrir una conexión a la base real. La clase también se puede construir sin conocer la URI ni cómo se preparó el cliente.

Este beneficio tiene un límite deliberado: `OrderService` todavía usa `MongoClient`, colecciones e `insert_one`. Inyectar el cliente separa **la creación y configuración** de **su uso**; no elimina la dependencia de la API MongoDB. El siguiente reto responde por qué extraer `MongoOrderStorage` da un paso más.

**2. Opciones de código (selección única válida).**

| ID | Cambio propuesto | Papel y explicación al revelar |
| --- | --- | --- |
| `inject-client` | `def __init__(self, client: pymongo.MongoClient): self.client = client`; `place` sigue usando la colección y `insert_one`. | Correcta: el llamador controla configuración y ciclo de vida del cliente, y puede suministrar otro cliente para una prueba. Esto es DI; `OrderService` aún conoce MongoDB, limitación que motiva el reto 2. |
| `lazy-client` | Crear `MongoClient` dentro de `place` en el primer uso. | Retrasa la creación, pero `OrderService` sigue decidiendo cómo crear su cliente. |
| `module-singleton` | Importar un `MongoClient` global de otro módulo. | El cliente se crea fuera, pero el consumidor lo obtiene mediante estado global, no por su constructor. |
| `inject-settings` | Recibir `Settings` y llamar a `MongoClient(settings.mongo_uri)` dentro de `OrderService`. | Se inyecta configuración, pero el servicio sigue construyendo el cliente. |

El llamador entrega un cliente en el ejemplo, pero no se enseña aún dónde se construye en producción. Esa pregunta se reserva para el reto 3.

**3. Interacción del sistema.** El diagrama inicia con `OrderService` creando `pymongo.MongoClient`. Al seleccionar `inject-client`, muestra que el cliente llega desde fuera, pero mantiene visible que el servicio conoce `MongoClient` y la colección. No mostrar `MongoOrderStorage` ni `Storage` todavía. Los distractores conservan la creación dentro del servicio o la esconden en un global. Tras comprobar, explicar el beneficio concreto: configuración y ciclo de vida quedan a cargo del llamador y se puede suministrar un cliente de prueba. Aclarar que esto no elimina el acoplamiento a MongoDB ni basta para probar el comportamiento sin una instancia o sustituto compatible con la API del cliente.

**4. Respuesta correcta.** `['inject-client']`. Cierre: “OrderService ya no decide cómo se configura ni cuándo se crea MongoClient; el llamador se lo entrega. Eso facilita compartir la configuración y usar otro cliente en una prueba. El servicio aún habla MongoDB: cambiamos quién crea el cliente, no qué API usa el servicio”.

**Comprobación de comprensión:** preguntar qué línea dejó de construir el cliente y qué operación de MongoDB sigue dentro de `OrderService`.

## Reto 2: separar el almacenamiento (`storage-adapter`)

**Pregunta:** `OrderService` ya recibe MongoClient. ¿Por qué sigue siendo difícil cambiar MongoDB o probar el servicio con un almacenamiento falso?

**1. Objetivo.** Extraer colección e inserción a `MongoOrderStorage`, y reemplazar el cliente en el constructor del servicio por el storage. Este reto se apoya en la mecánica de inyección aprendida en el reto 1: no vuelve a explicar desde cero cómo pasar un argumento; enseña que conviene inyectar el colaborador que representa la operación que el negocio necesita, en vez de una API de infraestructura.

**2. Opciones de código (selección múltiple).**

| ID | Cambio propuesto | Papel y explicación al revelar |
| --- | --- | --- |
| `extract-storage` | Definir `MongoOrderStorage(client)` con `save(order)`, que llama a `client["shop"]["orders"].insert_one(order)`. | Correcta, pero sola deja el adaptador sin uso; el servicio sigue recibiendo y usando `MongoClient`. |
| `inject-storage` | Cambiar el constructor a `def __init__(self, storage: MongoOrderStorage): self.storage = storage`; `place` conserva la validación y llama `self.storage.save(order)`. | Correcta junto con la extracción: el servicio expresa que necesita guardar, no cómo MongoDB lo hace. |
| `inject-client` | Mantener `MongoClient` como parámetro del constructor y dejar `insert_one` en `place`. | Es DI válida y resuelve el reto 1, pero no alcanza el objetivo nuevo: el negocio todavía usa la API MongoDB. |
| `storage-factory-in-core` | Crear `MongoOrderStorage` dentro de `OrderService` mediante una factoría privada. | Cambia la forma de organizar el código, pero el consumidor sigue eligiendo su adaptador. |

**3. Interacción del sistema.** Estado inicial: la solución del reto 1, `OrderService` recibe `MongoClient` y llama a la colección. Si se selecciona solo `extract-storage`, mostrar `MongoOrderStorage` desconectado mientras `OrderService` mantiene su código MongoDB. Si se selecciona solo `inject-storage`, mostrar que el servicio espera un storage pero aún no se ha extraído una pieza que implemente `save`. Con ambas y sin extras, mostrar `OrderService -> MongoOrderStorage`; el nodo indica que el adaptador encapsula la colección MongoDB. No mostrar aún el punto de entrada ni un `FakeStorage`: se introducen en retos posteriores.

**4. Respuesta correcta.** `['extract-storage', 'inject-storage']`. Cierre: “El servicio recibe una pieza con una operación de almacenamiento. MongoOrderStorage traduce esa operación a MongoDB. El servicio ya no conoce colecciones ni `insert_one`; aún recibe un tipo concreto, y todavía falta aprender quién construye las piezas”.

**Comprobación de comprensión:** contrastar las firmas `storage: MongoClient` y `storage: MongoOrderStorage`: ¿cuál obliga a `OrderService` a conocer colecciones y por qué?

## Reto 3: conectar las piezas (`composition-root`)

**Pregunta:** Si `OrderService` ya recibe `MongoOrderStorage`, ¿quién crea `MongoClient`, el adaptador y el servicio en producción?

**1. Objetivo.** Conservar el servicio del reto anterior y ensamblar la aplicación en su punto de entrada. La palabra *composition root* nombra el lugar donde se toman decisiones concretas; no implica que siempre exista un archivo llamado `main.py`.

**Estado inicial:** `OrderService` recibe `MongoOrderStorage`, pero el arranque tiene un TODO y no construye ni conecta las piezas. El diagrama debe diferenciar “el servicio admite inyección” de “la aplicación está ensamblada”.

**2. Opciones de código (selección única válida).**

| ID | Cambio propuesto | Papel y explicación al revelar |
| --- | --- | --- |
| `wire-at-root` | En el punto de entrada: `client = pymongo.MongoClient("mongodb://localhost:27017"); storage = MongoOrderStorage(client); service = OrderService(storage)`. | Correcta; el composition root construye y conecta cliente, adaptador y servicio. |
| `inject-settings` | Entregar `Settings` al servicio para que allí llame a `build_storage(settings)`. | El servicio sigue escogiendo y construyendo su infraestructura. |
| `factory-in-core` | Crear `OrderService(MongoOrderStorage(pymongo.MongoClient(...)))` en una factoría dentro del módulo del servicio. | La factoría sigue llevando el conocimiento de MongoDB al núcleo; una factoría en el borde sería otra historia. |
| `lazy-init` | Construir `MongoClient` y `MongoOrderStorage` al primer uso en una propiedad del servicio. | Retrasa la decisión pero la mantiene dentro del consumidor. |

**3. Interacción del sistema.** Antes de escoger, mostrar las piezas sin conexión de producción: el servicio requiere storage y el adaptador requiere cliente. Al escoger `wire-at-root`, mostrar `main.py -> MongoClient -> MongoOrderStorage -> OrderService`. Las selecciones incorrectas señalan qué parte sigue construida dentro del consumidor o qué responsabilidad quedó en el núcleo. No mostrar la aplicación como ensamblada solo porque el servicio admite recibir un storage.

**4. Respuesta correcta.** `['wire-at-root']`. Cierre: “El composition root conoce las piezas concretas y las conecta. El servicio no construye ni MongoClient ni MongoOrderStorage”.

**Comprobación de comprensión:** preguntar en qué archivo o capa buscaría el alumno para cambiar de proveedor sin editar `OrderService`.

## Reto 4: probar sin MongoDB (`test-double`)

**Pregunta:** Ahora que `OrderService` recibe un storage, ¿cómo probamos la lógica de pedidos sin MongoDB ni cambios en el servicio?

**1. Objetivo.** Ver una consecuencia concreta de la inyección: construir el mismo servicio con un doble en la prueba, llamar a `place` y comprobar qué se guardó. No basta con instanciar el servicio; hay que verificar comportamiento. Introducir aquí, como parte del scaffolding, un contrato mínimo `Storage` para expresar el método que ya necesitan ambos adaptadores. No enseñar ni nombrar DIP en este reto:

```python
from typing import Protocol

class Storage(Protocol):
    def save(self, order: dict) -> None: ...
```

Cambiar la anotación del constructor de `MongoOrderStorage` a `Storage`. Explicar que `Protocol` ayuda al análisis estático a reconocer que el adaptador real y el fake ofrecen el mismo método; no es una pieza que el servicio construya en tiempo de ejecución. `FakeStorage` está disponible en el enunciado y cumple ese contrato:

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

**3. Interacción del sistema.** Estado inicial: producción usa `MongoOrderStorage` y la prueba aún depende del adaptador o de MongoDB. Al escoger `fake-in-test`, mostrar el test entregando `FakeStorage` por el mismo constructor y una aserción sobre el pedido guardado; producción sigue usando MongoOrderStorage. Al fallar, distinguir “se prueba el adaptador con mongomock”, “se sustituye con un parche” y “la prueba no se ejecuta”. `mongomock` puede ser válido para probar el adaptador; no es la respuesta cuando el objetivo es aislar la lógica de pedidos. No inventar que el diagrama ejecuta Python: el resultado del test se muestra en la tarjeta/feedback.

**4. Respuesta correcta.** `['fake-in-test']`. Cierre: “Producción y prueba construyen el mismo servicio con colaboradores distintos. La prueba comprueba un pedido guardado sin abrir una conexión”.

**Comprobación de comprensión:** pedir al alumno indicar qué está probando (`OrderService`), qué está reemplazando (`MongoOrderStorage`) y cómo `FakeStorage` permite evitar MongoDB.

## Reto 5: repetir el patrón en otro caso (`capstone`)

**Pregunta:** ¿Puedes aplicar todo el patrón para que producción envíe correo y el test verifique el mensaje sin red?

**1. Objetivo.** Integrar, con menos pistas, las decisiones ya aprendidas: el servicio declara lo que necesita, producción conecta una implementación concreta en el composition root y el test entrega un doble por el mismo constructor. No añadir una nueva técnica. Proporcionar `Mailer` como contrato mínimo en el escenario; el reto mide transferencia de DI, no diseño de abstracciones.

**2. Opciones de código (selección múltiple).**

| ID | Cambio propuesto | Papel y explicación al revelar |
| --- | --- | --- |
| `inject-mailer` | `def __init__(self, mailer: Mailer): self.mailer = mailer`; `send_welcome` llama `self.mailer.send(...)`. | Correcta: NotificationService deja de construir SMTP y declara qué colaborador necesita. |
| `wire-mailer-at-root` | Producción: `mailer = SmtpMailer(); service = NotificationService(mailer)` en el punto de entrada. | Correcta: una decisión de producción se conecta fuera del consumidor. |
| `fake-mailer-test` | El test crea `NotificationService(FakeMailer())`, llama `send_welcome(...)` y comprueba el mensaje guardado por el fake. | Correcta: sustituye SMTP mediante DI y comprueba un resultado sin red. |
| `optional-mailer` | `mailer: Mailer | None = None` y usar `SmtpMailer()` como valor por defecto. | El servicio aún decide la implementación cuando no recibe argumento. |
| `patch-smtplib` | Parchear `smtplib.SMTP` en la prueba. | Evita una conexión real, pero prueba detalles del adaptador y no demuestra que el consumidor admita otro colaborador. |
| `env-mailer` | Elegir `FakeMailer` o `SmtpMailer` por `APP_ENV` dentro de NotificationService. | El consumidor queda encargado de conocer entorno e implementaciones. |

El escenario define `FakeMailer.sent` como una lista de mensajes con `to`, `subject` y `body`, y ofrece una aserción completa para que el alumno vea qué significa “probar el comportamiento”.

**3. Interacción del sistema.** Estado inicial: NotificationService crea SmtpMailer y la prueba depende de red. La selección actualiza por separado consumidor, wiring de producción y test. Si falta una opción correcta, el feedback indica qué parte del patrón no está resuelta; un distractor mantiene visible la decisión oculta. Solo con las tres elecciones correctas se muestran ambos recorridos: `main.py -> SmtpMailer -> NotificationService` y `test -> FakeMailer -> NotificationService`. El servicio es el mismo en producción y pruebas.

**4. Respuesta correcta.** `['inject-mailer', 'wire-mailer-at-root', 'fake-mailer-test']`, sin opciones extra. Cierre: “DI no es solo recibir un objeto: producción y pruebas construyen sus colaboradores en sus propios contextos y los entregan al mismo consumidor”.

**Comprobación de comprensión:** sin pistas, preguntar dónde se construye el mailer real, qué recibe NotificationService y cómo el test comprueba el envío sin SMTP.

## Comportamiento común y criterios de aceptación

1. Mantener panel de misión, fragmentos seleccionables, pista bajo demanda, diagrama, botón de comprobar, feedback y avance secuencial. Mostrar el problema antes del vocabulario; cada reto puede nombrar el concepto después de exponerlo. No añadir una pantalla larga de teoría ni ejecutar fragmentos Python.
2. Barajar las opciones al entrar a un reto; el orden no cambia su ID ni su significado. La selección actualiza la vista previa del diagrama. Comprobar exige igualdad exacta de conjuntos; no aprobar una opción correcta mezclada con un distractor. Si se edita la selección tras comprobar, limpiar el resultado previo.
3. En un intento incompleto revelar y explicar solo las opciones marcadas, con feedback accionable sobre el objetivo concreto; tras acertar, mostrar la explicación de todas. No llamar “incorrecta en general” a una técnica válida para otro objetivo. Usar texto y estados legibles, no depender solo del color.
4. El diagrama no debe confundir inyectar el cliente, inyectar el adaptador y ensamblar la aplicación. En el reto 1 muestra al cliente entregado pero conserva la dependencia MongoDB. En el reto 2 muestra la extracción sola como pieza desconectada y solo celebra la solución cuando el servicio recibe el adaptador. En el 3, representar el wiring ausente/presente (el `effect: 'composition'` actual no modifica `getDiagramState`). En el 4 distinguir implementaciones de producción y de prueba; en el 5 mostrar separadamente los recorridos de producción y test. Extender solo el estado y la vista necesarios para esas transiciones.
5. Mantener consistencia entre ejemplos: `MongoClient` en el reto 1; `MongoOrderStorage(client)` y `save(order)` desde el reto 2; contrato `Storage.save` y `FakeStorage` desde el reto 4; `Mailer.send` y `FakeMailer.sent` en el reto 5. No mostrar doubles incompatibles con el parámetro que recibe el servicio. Los ejemplos se presentan como código didáctico; no se ejecutan.
6. El recorrido principal tiene cinco retos. Reordenar los identificadores como `constructor-injection`, nuevo `storage-adapter`, `composition-root`, `test-double`, `capstone`; `service-locator` y `di-vs-dip` quedan fuera de este recorrido y no cuentan para completarlo. Revisar `LevelId`, `diLevels`, numeradores, desbloqueo y `moduleComplete`. Cambia la respuesta correcta del primer reto, así que no conservar un `passed` antiguo como si demostrara el objetivo nuevo: versionar o migrar con claridad el progreso `codeteller-di-intro-module-v2`, preservar idioma/tema y explicar al usuario si debe repetir ese reto. Mapear selecciones antiguas solo cuando su significado siga siendo el mismo.
7. Implementar ES/EN de manera equivalente. Revisar `src/i18n/es.ts`, `src/i18n/en.ts`, `src/data/diModule.ts`, `src/data/diagramState.ts`, `src/App.tsx`, `src/progress.ts`, los componentes existentes solo si hacen falta y `README.md`. No añadir puntuación ni introducir formalmente SOLID o arquitectura hexagonal en este módulo.
8. Probar: reto 1 con cliente inyectado y cada distractor; reto 2 con extracción sola, inyección sola, conjunto correcto y distractor; composition root correcto e incorrecto; test fake, mongomock, parche y test omitido; tres decisiones del capstone y cada selección parcial; progreso, desbloqueos, reinicio, recarga y ambos idiomas. Ejecutar `pnpm build` y `pnpm lint` y revisar el flujo manual en móvil y escritorio.

## Señal de aprendizaje

Tras completar el módulo, preguntar sin opciones: “Un servicio crea su propio cliente de base de datos y la prueba requiere una instancia real. ¿Qué cambiarías primero, qué extraerías después, quién conectaría las piezas en producción y qué entregarías al test?”. Una respuesta suficiente distingue inyectar el cliente de encapsular la persistencia, explica el wiring externo y propone un fake para probar la lógica. Si varias personas no pueden responder, mejorar las pistas y el feedback del paso donde se pierden antes de añadir otro reto. Contenedores, DIP formal y arquitectura hexagonal quedan para módulos posteriores.