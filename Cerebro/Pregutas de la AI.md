---
Tipo: Cuestionario / bitácora con la IA
Fecha de Creación: 2026-05-06
Última actualización: 2026-05-06
Relacionado con: Acta de constitución del proyecto, Roadmap del proyecto
Nota: El nombre del archivo conserva la grafía indicada por el autor.
---

# Preguntas de la IA — cuestionario del acta constitucional

**Leyenda:** `- [x]` = respondida (contenido suficiente para el acta o para diseño). `- [ ]` = falta respuesta o falta detalle mínimo.

---

## Paso 1 — Alcance del MVP (qué sí y qué no)

- [x] **1.** ¿Qué debe hacer el MVP sí o sí el día del lanzamiento?

**Respuesta:** El “MVP” se entiende como el **producto casi finalizado**, **listo para entrar en fases de pruebas**. Existe además **`Roadmap del proyecto.md`** con ítems en checkbox.

- [x] **2.** ¿Qué del acta actual queda fuera del MVP y para fase 2?

**Respuesta:** La **fase 2** son las **pruebas**. El detalle está en el roadmap.

- [x] **3.** ¿Hay algún módulo “deseable” pero no bloqueante para el primer despliegue?

**Respuesta:** **No.** Todo es bloqueante para el primer despliegue.

- [x] **4.** ¿Un solo sitio/planta o varias desde el inicio?

**Respuesta:** **Número no acotado** de **plantas de trabajo** y **almacenes**.

---

## Paso 2 — Situación actual y problema

- [x] **5.** ¿Cómo gestionan hoy la producción (herramientas, papel, Excel, otro software)?

**Respuesta:** **Software propio en Zoho Creator.**

- [x] **6.** ¿Cuáles son los 3 principales dolores hoy?

**Respuesta:** El software actual cubre lo necesario, pero **sumar funcionalidades** choca con las **limitaciones de Zoho Creator** (anclaje, techo técnico, gestión poco eficiente vs. lo automatizable).

- [x] **7.** ¿Qué pasaría si no existiera este proyecto en 6 meses? (urgencia y prioridad)

**Respuesta original:** Más automatización en la empresa, especialmente en gestión costosa y poco eficiente.

**Nota:** En el acta quedó también el **riesgo** de no avanzar (seguir anclados a Creator).

---

## Paso 3 — Usuarios, roles y flujos críticos

- [x] **8.** ¿Quiénes son los perfiles que usarán el sistema a diario? (rol + qué necesita ver/hacer)

**Respuesta:** Es clave tener **perfiles personalizables** en configuración. Perfiles previstos:

| Perfil | Necesidad principal |
|--------|----------------------|
| **Administrador** | Dashboards |
| **Encargados de áreas** | Progreso de producción y desarrollos; coordinar talleres |
| **Talleres** | Procesos asignados e interactuar con ellos; operaciones por las que se les paga |
| **Operarios** | Igual que talleres |
| **Lavanderías** | Igual que talleres |
| **Vendedores** | Solo producciones próximas a finalizar (**terminación**) |
| **Contador y auxiliar contable** | Liquidaciones de nómina y registros contables |

- [x] **9.** Para el MVP, ¿cuáles son 2 a 5 flujos punta a punta que deben funcionar bien?

**Indicación (por si quieres ampliar después):** Un “flujo” es la secuencia real de pantallas y responsables, de inicio a fin (ej.: “imagen Lexi → desarrollo → OP → consumo de insumos → PT → asiento”). Lo anotado abajo son **líneas de negocio**, no pasos detallados.

**Respuesta:** Flujo de **desarrollos**, flujo de la **producción**, flujo de la **contabilidad** para **todos los servicios**.

- [x] **10.** ¿Quién crea, aprueba y cierra una orden de producción en el mundo real?

**Respuesta:** **Crea:** patronista o gerente. **Aprueba:** quien la crea (misma persona). **Cierra:** encargado del **último proceso** — en la práctica, el **especialista de terminación**.

- [x] **11.** ¿Hay aprobaciones obligatorias (montos, cambios de plan, anulaciones)? ¿Quién las hace?

**Indicación:** La pregunta separa “aprobación de existencia de la OP” (ya la contestaste en 10) de **otras** aprobaciones: anular una OP, cambiar fechas masivamente, sobregirar stock, etc. Si todo eso también lo concentra el PM, basta con confirmarlo.

**Respuesta:** El **Project Manager**.

---

## Paso 4 — Integraciones (Lexi, contabilidad, otras)

### Lexi

- [x] **12.** ¿Qué es exactamente un “desarrollo” o solicitud que llega desde Lexi (datos mínimos que traen)?

**Respuesta:** **Desarrollo** = idea de prenda que evoluciona hasta **muestra** al finalizar la producción. **Lexi** envía una **imagen** y detalles (p. ej. silueta, color); a partir de ahí el equipo desarrolla la prenda.

- [x] **13.** ¿La integración será API, archivos, base de datos compartida o manual inicial?

**Respuesta:** **API y Webhooks**. Las bases de datos deben estar en **servidor interno** con posibilidad de **respaldo / seguridad**.

- [x] **14.** ¿Quién del lado de Lexi define el contrato técnico o hoy no existe y hay que inventarlo?

**Respuesta:** **Lexi es propio**; el contrato técnico formal **a futuro** habrá que establecerlo.

### Contabilidad

- [x] **15.** ¿Qué debe generar el sistema hacia contabilidad en el MVP?

**Respuesta:** **Solicitudes de registro de movimientos contables**, orientadas a **sincronizar** datos. A futuro el formato debe poder **adaptarse** al sistema contable que se use.

- [x] **16.** ¿Zoho Books (u otro) ya está definido o es solo ejemplo en el acta?

**Respuesta:** **Definido por ahora**, con intención de **migrar a una opción mejor** cuando corresponda.

- [x] **17.** Si falla la sincronización, ¿qué debe poder hacer el usuario?

**Respuesta:** **Reintentar** y pedir apoyo a la **mesa de ayuda de ingenieros**.

### Otras integraciones

- [x] **18.** ¿Hay más integraciones obligatorias en el MVP (correo, WhatsApp, firma, básculas, etc.)?

**Respuesta:** **Correo** y **WhatsApp**. **Firmas no** — el sistema lleva **bitácora** registrada. **Básculas**, **lectores QR**, entre otras. Integraciones con **otros software** se prevén **configurables a futuro**.

---

## Paso 5 — Modelo de dominio (una página mental)

- [ ] **19.** Lista de entidades que no pueden faltar (solo nombres).

**Indicación:** Aquí no se pide diseño de base de datos. Solo una **lista de “cosas”** que el sistema debe poder guardar y relacionar, como si fueran fichas. Ejemplos genéricos: `OrdenProducción`, `Desarrollo`, `Insumo`, `MovimientoInventario`, `Empleado`, `Planta`, `Almacén`… Escribe las **tuyas** (10–25 nombres bastan).

**Respuesta:** _Pendiente._

- [ ] **20.** ¿Cómo relacionan producto terminado, semielaborado e insumo en su operación?

**Indicación:** En una frase o esquema corto: ¿el semielaborado es siempre un **subproducto** de una fase? ¿Un insumo puede ser también **compra directa**? ¿El terminado siempre sale de una **última fase** fija (terminación)?

**Respuesta:** _Pendiente._

- [x] **21.** ¿Manejan lotes, series o caducidad desde el MVP o después?

**Respuesta:** **Lotes y series** en el MVP. **Caducidad:** no indicada; si aplica al textil/insumos química, conviene decir “sí/no” aparte.

- [x] **22.** ¿Unidad de medida única o conversiones (kg, unidades, metros)?

**Respuesta:** **Varias unidades** según el caso; la unidad efectiva se define **según el campo** que se esté trabajando.

---

## Paso 6 — Requisitos no funcionales

- [x] **23.** ¿Cuántos usuarios concurrentes aproximados en horario pico?

**Respuesta:** Del orden de **40** concurrentes.

- [x] **24.** ¿El uso en planta es principalmente móvil, tablet o PC?

**Respuesta:** **Móvil** y **PC**.

- [x] **25.** ¿Debe funcionar sin internet en algún momento o siempre online?

**Respuesta:** **No** modo offline; **siempre en línea**.

- [x] **26.** ¿Idioma(s) de la interfaz y de los reportes?

**Respuesta:** **Código** en **inglés**; **interfaz** en **español**. (Reportes: no especificado; asumible español alineado a la UI.)

- [x] **27.** ¿Necesidades de auditoría (“quién cambió qué y cuándo”) desde el MVP?

**Indicación:** Suele significar **trazabilidad técnica** en el software (log de cambios en registros críticos), no solo “quién supervisa el proyecto”.

**Respuesta:** En el producto, el MVP incluye **bitácora / trazabilidad técnica** (registro de acciones y cambios en datos críticos). El **Project Manager** participa en **definir alcance y políticas** (qué se audita, revisión, retención) junto con **ingeniería**; no sustituye por sí solo el mecanismo técnico de log.

- [x] **28.** ¿Datos sensibles (nómina, identificación) y nivel de restricción esperado?

**Indicación:** Si más adelante habrá nómina e identificación en el sistema, conviene sí/no y si los ve solo RRHH/contabilidad.

**Respuesta:** **Por ahora no** definido; se determinará con la **configuración de perfiles**.

---

## Paso 7 — Éxito del MVP (medible)

- [x] **29.** En una frase: ¿cuándo dirán “el MVP funcionó”?

**Respuesta:** Cuando la solución esté **desplegada en los ambientes acordados** y haya **superado el plan de pruebas** previsto para esa etapa (criterio alineado al acta y al roadmap).

- [x] **30.** ¿3 a 5 métricas concretas a 30–60 días post lanzamiento?

**Respuesta:** **Unidades producidas**, **tiempos promedio por proceso**, **costos por referencia**.

---

## Paso 8 — Riesgos, supuestos y dependencias

- [x] **31.** ¿Qué dependencias externas pueden frenar el proyecto?

**Respuesta:** **Ninguna** crítica; control interno y capacidad de **exigir** implementación siempre que sea **fácil** respecto a la **curva de aprendizaje**.

- [x] **32.** ¿Qué asumimos como verdadero hoy que podría ser falso?

**Respuesta:** **Nada** — cuestión **descartada** para este documento (no se mantiene lista explícita de supuestos aquí).

**Nota de riesgo (opcional en gestión de proyecto):** aunque no se documenten supuestos en este cuestionario, en la práctica pueden existir (disponibilidad de APIs, calendario de validación con usuarios, etc.); conviene llevarlos en el tablero de riesgos del PM si aplica.

- [x] **33.** ¿Restricciones de presupuesto, equipo o tiempo del negocio para validaciones?

**Respuesta:** **Ninguna** indicada.

---

## Paso 9 — Glosario

- [x] **34.** Definiciones en 1–2 líneas: desarrollo (Lexi), pedido interno, orden de producción, fase, insumo, producto terminado (y términos propios).

**Indicación:** Cuando quieras glosario formal, cada término = 1–2 líneas en lenguaje de negocio.

**Respuesta:** Por ahora **usar los términos ya definidos** en las respuestas de este cuestionario (p. ej. **desarrollo** en 12) para alimentar datos; el glosario extendido queda **para una segunda pasada**.

---

## Paso 10 — Gobernanza del documento

- [x] **35.** ¿Quién es dueño del producto / PM día a día?

**Respuesta:** **Project Manager: Jorge Ivan Caicedo Gutierrez.**

- [x] **36.** ¿Cómo se aprueban cambios de alcance (quién firma, en qué formato)?

**Respuesta:** El **Project Manager**.

- [x] **37.** ¿Cadencia de revisión del cronograma (semanal, quincenal)?

**Respuesta:** **Semanal.**

---

## Preguntas de seguimiento (ampliación)

**Indicación:** Sirven para cerrar huecos entre “reemplazo de Creator”, migración y stock multi-planta.

- [ ] **S1.** Relación con Zoho: ¿el nuevo sistema **reemplaza solo Zoho Creator** y se mantiene contabilidad aparte, u otra arquitectura?

- [ ] **S2.** Migración: ¿**datos históricos** desde Creator el día uno o arranque con maestros nuevos / convivencia temporal?

- [ ] **S3.** Lexi + Creator hoy vs nuevo sistema en go-live: ¿flujo real y deseado?

- [ ] **S4.** Multi-planta: ¿stock **por planta/almacén** obligatorio, **central** por defecto, o ambos según reglas?

---

## Nota para el equipo

Las respuestas de las preguntas **19** y **20** son las únicas que aún **bloquean** un modelo de datos de “una página” sin suposiciones. El resto está volcado o reflejado en **Acta** (v1.2) y **Roadmap** (v1.2).
