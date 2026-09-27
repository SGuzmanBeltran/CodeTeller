# Plan de evolución: DI y DIP

## Objetivo y límites

Separar el recorrido actual en dos módulos consecutivos. DI termina cuando la aplicación construye e inyecta las piezas fuera de `OrderService` (retos 1 a 3). DIP continúa con el mismo ejemplo y pregunta por qué `OrderService` sigue dependiendo del tipo concreto `MongoOrderStorage`. El alumno aprende a expresar la operación que necesita mediante `OrderStorage`, usa una implementación de prueba y transfiere las decisiones a otro dominio.

DI responde a **quién construye y entrega** un colaborador; DIP, a **de qué depende el código de alto nivel**. En Python, un fake compatible puede entregarse sin `Protocol`: el contrato explícito sirve para comunicar la operación esperada y verificar tipos, no es un requisito de DI ni el mecanismo que permite la sustitución en tiempo de ejecución. Los fragmentos Python siguen siendo didácticos; la aplicación no los ejecuta.

Realizar las cuatro fases en orden, con una entrega verificable al finalizar cada una. Conservar ES y EN equivalentes. La fase 3 separa los módulos y prepara la transición; la fase 4 implementa el recorrido pedagógico de DIP sobre lo aprendido en DI.

## Fase 1: concepto antes del ejercicio

- Añadir a cada reto dos vistas: **concepto** y **ejercicio**. Al entrar por primera vez en un reto, mostrar una explicación breve y concreta en el panel, con una acción clara para avanzar. Solo al avanzar aparecen el problema, el diagrama, las opciones, la pista y la comprobación. Permitir volver a consultar el concepto sin cambiar selección, resultado ni avance.
- Separar en el contenido traducido la explicación previa del enunciado y objetivo actuales. Para los tres primeros retos: (1) recibir un cliente en vez de crearlo, sin prometer independencia de MongoDB; (2) dejar la lógica de colecciones en `MongoOrderStorage` mientras `OrderService` ya recibe `MongoClient`; (3) ensamblar las piezas en el punto de entrada. Usar lenguaje simple y un solo ejemplo por explicación.
- Preparar el mecanismo para cualquier reto posterior. Los textos definitivos de DIP se incorporan en la fase 4, junto a los nuevos objetivos. Mientras los retos actuales 4 y 5 sigan en el recorrido, no presentar el contrato como algo que el alumno ya conoce.
- Mantener la vista elegida al alternar idioma o tema y al volver a consultar la explicación. Al entrar en el siguiente reto, comenzar en concepto; al recargar un ejercicio en curso, restaurar el ejercicio sin perder progreso. Reiniciar las opciones no debe impedir volver al concepto.

**Archivos guía:** `src/components/MissionPanel.tsx`, `src/components/ChallengePage.tsx`, `src/i18n/translations.ts`, `src/i18n/es.ts`, `src/i18n/en.ts` y, solo si hace falta persistir la fase, `src/App.tsx` / `src/progress.ts`.

**Criterio de aceptación:** el alumno ve primero el concepto, avanza y resuelve el reto; consultar de nuevo el concepto, cambiar idioma, recargar o reiniciar no invalida su trabajo. Verificar en móvil y escritorio.

## Fase 2: ampliar el panel

- El ancho de la columna lateral está definido como `275px` en `src/components/ChallengePage.module.css`. Probar un ancho de aproximadamente 330-350 px en escritorio, dejando al área de trabajo `minmax(0, 1fr)` y manteniendo espacio para el diagrama y las tarjetas.
- Ajustar espaciados y límites del código de apoyo en `src/components/MissionPanel.module.css` solo donde lo exija el nuevo ancho. En pantallas estrechas conservar una columna, con texto legible y desplazamiento horizontal solo dentro de bloques de código.
- No usar el ancho extra como motivo para añadir snippets grandes al reto 2: corregir su continuidad narrativa basta para explicar que el cliente ya se inyecta y lo que queda dentro es `insert_one`.

**Criterio de aceptación:** concepto, enunciado, diagrama y opciones no se solapan ni desbordan en ES/EN, móvil y escritorio; el panel gana legibilidad sin dejar demasiado estrecha la zona de decisiones.

## Fase 3: cerrar DI y preparar el módulo DIP

### Cambios de niveles

| Recorrido | Acción | Objetivo comprobable |
| --- | --- | --- |
| DI 1: `constructor-injection` | Conservar; ajustar solo texto si hace falta | Recibir `MongoClient` sin crearlo dentro de `OrderService`; aún se usa la API de MongoDB. |
| DI 2: `storage-adapter` | Conservar opciones y diagrama; corregir introducción y objetivo | El servicio **ya recibe** el cliente, pero aún usa la colección y `insert_one`. Extraer `MongoOrderStorage` e inyectarlo; no introducir contratos aquí. |
| DI 3: `composition-root` | Conservar como cierre de DI | Construir `MongoClient`, `MongoOrderStorage` y `OrderService` fuera del servicio, en el punto de entrada. Terminar el módulo DI aquí. |
| Actual `test-double` | Retirar del recorrido DI y reservar para la fase 4 | No presentar su contrato como un conocimiento adquirido al terminar DI. |
| Actual `capstone` | Retirar del recorrido DI y reservar para la fase 4 | Reutilizar el caso de correo cuando se hayan practicado DI y DIP. |

Preparar la identidad y el progreso independiente del módulo DIP, sin publicar retos vacíos ni permitir acceder a los antiguos retos 4 y 5 como sustituto del recorrido nuevo. Hasta completar la fase 4, mostrar DI como terminado y DIP como pendiente de disponibilidad.

### Flujo y persistencia

- Separar agrupación, contador y finalización de DI y DIP: completar DI tras el tercer reto debe mostrar un cierre; DIP no debe figurar como parte pendiente de DI. Mantener la posibilidad de repasar DI. Activar la acción para iniciar DIP cuando sus retos estén implementados en la fase 4.
- Revisar navegación, textos de cabecera, portada y reflexión final. La reflexión de DI debe evaluar quién crea, recibe y conecta; la de DIP debe evaluar qué tipo declara el servicio, por qué, y cómo se sustituyen implementaciones.
- Versionar o migrar el progreso actual. Preservar los aprobados válidos de los retos 1 a 3. No dar por aprobados el antiguo reto 4 ni el integrador porque cambia el objetivo; no perder preferencia de idioma ni de tema. Probar progreso parcial, DI completado, módulo anterior completado, recarga, reinicio y avance a DIP.
- Actualizar `docs/di-module.md` para que no contradiga el recorrido nuevo, y `README.md` para describir ambos módulos y su secuencia. Mantener los IDs actuales solo cuando el objetivo evaluado conserve su significado; añadir un ID nuevo para el primer reto DIP.

**Archivos guía:** `src/data/diModule.ts`, `src/data/diagramState.ts`, `src/components/ArchitectureDiagram.tsx`, `src/App.tsx`, `src/progress.ts`, traducciones, `docs/di-module.md` y `README.md`.

**Criterio de aceptación:** DI termina al aprobar `composition-root`, conserva el progreso válido y puede repasarse sin depender de DIP. Los antiguos retos 4 y 5 ya no forman parte de DI; no hay accesos a ejercicios DIP incompletos. Verificar migración, recarga, cierre, contadores y ambos idiomas. Ejecutar `pnpm build` y `pnpm lint`.

## Fase 4: aprender DIP a partir de DI

### Punto de partida del equipo

El equipo ya sabe recibir colaboradores por constructor, encapsular las llamadas MongoDB y ensamblar la aplicación desde fuera. No volver a enseñar esos pasos como si fueran nuevos: cada reto parte del resultado del anterior y distingue **lo que conservamos** de **la decisión nueva**. Mantener `OrderService`, su validación y `MongoOrderStorage` como hilo conductor hasta el ejercicio de transferencia.

La idea nueva no es simplemente añadir una interfaz: la lógica de pedidos define qué necesita para guardar, y los detalles de persistencia se ajustan a ese contrato. El servicio y el adaptador dependen de esa abstracción, que no debe importar PyMongo ni estar definida como un detalle del adaptador. Diferenciar la dirección de las dependencias de código de la llamada que sigue ocurriendo al guardar un pedido.

### DIP 1: del tipo concreto al contrato de pedidos

- **Partida:** la solución de DI 3. `OrderService` recibe `MongoOrderStorage` y el punto de entrada construye las piezas. La inyección ya funciona.
- **Problema:** el equipo quiere incorporar otra persistencia sin hacer que la lógica de pedidos conozca cada proveedor. El servicio solo necesita guardar un pedido, pero su código declara una dependencia del adaptador MongoDB.
- **Explicación previa:** introducir contrato como una operación acordada entre consumidor e implementaciones, usando `save(order)`. Explicar después cómo `Protocol` expresa esa operación en Python, sin exigir herencia ni presentarlo como una comprobación automática en ejecución.
- **Decisión:** definir `OrderStorage` en un módulo de contratos de la aplicación independiente de MongoDB, y cambiar la dependencia del servicio de `MongoOrderStorage` a `OrderStorage`. Conservar `MongoOrderStorage` y el ensamblaje de producción; no volver a pedir que el alumno resuelva DI.
- **Alternativas:** contrastar con renombrar el tipo concreto, definir el contrato dentro del módulo MongoDB o elegir proveedor con un condicional en el servicio. Explicar qué dependencia sigue apuntando a infraestructura en cada caso.
- **Diagrama:** empezar con el tipo concreto; mostrar el contrato y las dependencias hacia él solo al seleccionar esos cambios. No dibujarlo como un objeto intermediario construido en ejecución.
- **Comprobación:** el equipo puede señalar qué dependencia de código cambió, quién define la operación y por qué producción sigue utilizando MongoDB.

### DIP 2: comprobar el mismo servicio sin MongoDB

- **Partida:** `OrderService` ya depende de `OrderStorage`. Recuperar y adaptar el actual `test-double`; no introducir otro contrato.
- **Problema:** probar la validación y el guardado de pedidos sin levantar MongoDB ni recorrer su adaptador.
- **Explicación previa:** `FakeOrderStorage` conserva pedidos en memoria y ofrece la misma operación. DI permite entregarlo; el contrato permite expresar y comprobar su compatibilidad de tipos. Una firma compatible no garantiza por sí sola todos los comportamientos esperados.
- **Decisión:** inyectar el fake, llamar a `place` y comprobar el pedido guardado. Incluir una comprobación de pedido inválido que verifique el error y que nada se guardó, mediante fragmentos breves separados para no sobrecargar el panel.
- **Alternativas:** conservar el contraste con `mongomock`, parchear imports y omitir la prueba. No presentar `mongomock` como incorrecto en general: aquí el objetivo es aislar `OrderService`.
- **Diagrama:** mostrar que producción conserva `MongoOrderStorage` mientras la prueba entrega `FakeOrderStorage` al mismo servicio. Las aserciones se muestran como código y feedback, no como Python ejecutado por la aplicación.
- **Comprobación:** el equipo identifica qué prueba, qué reemplaza y qué evidencia aporta la aserción; no basta con instanciar el servicio.

### DIP 3: transferir DI y DIP a correo

- **Partida:** cambiar de dominio y reutilizar el caso de `NotificationService` del actual `capstone`. Reducir pistas sin introducir una técnica adicional.
- **Problema:** conectar un proveedor real en producción y probar mensajes sin red, manteniendo la lógica de notificación independiente de SMTP.
- **Explicación previa:** recordar las preguntas aprendidas: qué necesita el consumidor, dónde vive su contrato, quién conecta la implementación y cómo se observa el resultado en una prueba. No revelar la combinación correcta.
- **Decisión:** hacer que el servicio dependa de un contrato `Mailer` definido desde sus necesidades e independiente de SMTP, conectar `SmtpMailer` desde el punto de entrada y entregar `FakeMailer` en la prueba con una aserción del mensaje. Dar el contexto y las operaciones necesarias sin entregar ya resuelta la dependencia del servicio.
- **Alternativas:** incluir un contrato que exponga detalles SMTP, una implementación elegida dentro del servicio y una prueba sin aserciones. El feedback debe distinguir errores de DIP, de DI y de verificación de comportamiento.
- **Comprobación:** pedir una explicación breve sin opciones: qué parte aplica DI, qué parte aplica DIP y qué código cambiaría al incorporar otro proveedor. No calificar automáticamente la respuesta libre.

### Implementación y aceptación

- Crear un ID para DIP 1 y adaptar los otros dos objetivos sin reutilizar sus aprobados antiguos. Activar la transición desde el cierre de DI y contar los retos dentro de DIP, con finalización y repaso independientes.
- Reutilizar las vistas de concepto/ejercicio de la fase 1 y el panel de la fase 2. Usar `OrderStorage` y `FakeOrderStorage` consistentemente; mantener textos ES/EN, código, feedback y diagrama alineados.
- Implementar los estados parciales del nuevo reto: definir solo el contrato no cambia la dependencia del servicio; cambiar solo la anotación sin proporcionar el contrato deja una pieza pendiente. Aprobar únicamente el conjunto que satisface el objetivo, sin distractores adicionales.
- Reutilizar los datos, componentes y validación existentes; separar los datos DIP en un archivo propio si simplifica la agrupación. Actualizar la documentación del recorrido real al publicar los retos, no antes como si ya estuvieran disponibles.

**Criterio de aceptación:** se puede recorrer DI y luego los tres retos DIP sin saltos conceptuales. Las decisiones nuevas parten del diseño ya construido, los contratos no aparecen de antemano como soluciones completas y las explicaciones distinguen DI de DIP. Verificar respuestas correctas, parciales y distractores, migración, desbloqueo, recarga, repaso, idiomas y diseño móvil/escritorio; ejecutar `pnpm build` y `pnpm lint`. En una revisión con el equipo, comprobar que puede explicar la dirección de las dependencias y aplicar el criterio al caso de correo sin limitarse a recordar las opciones.