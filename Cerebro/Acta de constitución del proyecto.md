---
tags:
Tipo: Documento Constitutivo
Fecha de Creación: 2026-04-30
Última actualización: 2026-05-06
Version: 1.2
Autor: Jorge Ivan Caicedo Gutierrez
---
## Propósito o justificación del proyecto

El propósito del proyecto es desarrollar una aplicación multiplataforma de gestión de producción que permita centralizar, planificar, ejecutar y controlar las diferentes fases del proceso productivo de la organización.

La solución integrará a los distintos actores involucrados en la producción, facilitando la gestión de desarrollos provenientes de la aplicación Lexi, la planificación y ejecución del plan de producción, así como el seguimiento en tiempo real de las operaciones.

Adicionalmente, la aplicación permitirá la gestión de pedidos internos, el control de tiempos de los procesos, la administración de inventarios de insumos y productos terminados, y el registro de servicios asociados a la producción.

En el ámbito administrativo y financiero, el sistema facilitará la integración con herramientas contables mediante la generación de **solicitudes de registro de movimientos contables** (y demás solicitudes hacia el contable según reglas de negocio, incluido el flujo de **pagos y obligaciones**), la gestión de pagos al personal y el seguimiento de terceros externos.

Finalmente, la plataforma incorporará funcionalidades para el control del talento humano, incluyendo horarios y desempeño, la gestión logística de transporte de mercancías, y la generación de información estratégica que permita proyectar y analizar los movimientos operativos y financieros de la organización.

#### El objetivo: 
*Una herramienta de autogestión de la producción completa*

## Situación actual y problema a resolver

### Herramienta actual
Hoy la producción se gestiona con **software propio elaborado en Zoho Creator**. Esa solución **reúne lo que la operación necesita** para el trabajo diario.

### Principales dolores
1. **Crecimiento funcional:** La empresa necesita **sumar más funcionalidades** al sistema actual; hacerlo sobre Zoho Creator genera **fricción y costo de proyecto** por las **limitaciones de la plataforma** (techo técnico, flexibilidad y mantenimiento de lógica cada vez más compleja).
2. **Dependencia y anclaje:** La evolución del negocio queda **condicionada** a lo que Zoho Creator permite y al ritmo viable de cambios dentro de ese entorno.
3. **Eficiencia de la gestión:** Buena parte de la **gestión** asociada a la producción **consume mucho esfuerzo** y **no resulta eficiente** comparada con lo que se podría **automatizar** con una plataforma diseñada a la medida e integrada.

### Urgencia y horizonte (~6 meses)
- **Con la nueva solución:** Se espera que **todo en la empresa sea más automático**, en especial la **gestión** que hoy es **costosa y poco eficiente**, mediante procesos más integrados y menos trabajo manual repetitivo.
- **Sin avanzar hacia la nueva solución:** Persiste el **anclaje** a Zoho Creator y sus **limitaciones** para incorporar capacidades; la **automatización** y la **eficiencia** en gestión **no** mejoran en ese horizonte de forma sustancial.

## Alcance funcional y acuerdos de diseño (cuestionario operativo)

Detalle ampliado en **`Pregutas de la AI.md`**. Resumen para el acta:

### Perfiles de usuario
El sistema debe permitir **perfiles personalizables** en configuración. Perfiles previstos: **Administrador** (dashboards); **Encargados de áreas** (progreso de producción y desarrollos, coordinación de talleres); **Talleres**, **Operarios** y **Lavanderías** (procesos asignados, interacción con ellos, visibilidad de operaciones ligadas a pagos); **Vendedores** (solo producciones en etapa de **terminación**); **Contador y auxiliar contable** (liquidaciones de nómina y registros).

### Flujos transversales prioritarios
Flujos de **desarrollos** (desde Lexi), de **producción** y de **contabilidad** para **todos los servicios**, con trazabilidad en la plataforma.

### Ciclo de vida de la orden de producción
**Creación:** patronista o gerente. **Aprobación de la orden en su creación:** quien la crea. **Cierre:** encargado del **último proceso** (en la operación actual, **especialista de terminación**). Las **aprobaciones de negocio** adicionales (montos, planes, anulaciones u otras reglas) recaen en el **Project Manager**.

### Integraciones y datos
**Lexi** envía solicitudes de **desarrollo** (idea de prenda que evoluciona hasta muestra; entrada típica: **imagen** y datos como silueta y color). Integración mediante **API y webhooks**. Los datos persistentes se alojan en **servidor interno** con **respaldo** y medidas de seguridad.

**Contabilidad:** generación de **solicitudes de registro de movimientos contables** para **sincronizar** con el sistema contable en uso (hoy definido; posible migración futura a otra opción). Ante fallo de sincronización: **reintento** y apoyo a **mesa de ayuda de ingeniería**.

**Canales y dispositivos:** **correo electrónico** y **WhatsApp**; **bitácora** en el software reemplaza la necesidad de **firma** física en flujos internos; **básculas** y **lectores QR**; demás acoples a software externos previstos como **configurables a futuro**.

### Inventario y unidades de medida
**Lotes y series** desde el inicio. **Varias unidades de medida** según el recurso o el campo operativo en que se trabaje.

### Requisitos no funcionales orientativos
Aproximadamente **40 usuarios concurrentes** en pico. Acceso desde **móvil** y **PC**. Solución **siempre en línea** (sin requerimiento de modo offline). **Interfaz en español**; **código fuente en convención inglesa** (acuerdo de equipo).

La **trazabilidad técnica** (bitácora de acciones y cambios en registros críticos) es parte del MVP; el **Project Manager** y **ingeniería** acotan qué eventos se registran y la política de retención, en línea con la **bitácora operativa** que sustituye firma física en flujos internos.

### Criterios de seguimiento post despliegue
Indicadores iniciales: **unidades producidas**, **tiempos promedio por proceso**, **costos por referencia**. El cierre del entregable previo a estabilización operativa se considera cuando la solución está **desplegada en los ambientes acordados** y ha **superado el plan de pruebas** definido para esa etapa (incluida la transición a pruebas con usuarios según el roadmap).

### Dirección de proyecto
**Project Manager:** Jorge Ivan Caicedo Gutierrez. **Revisión del cronograma:** **semanal**. **Cambios de alcance:** validación por el **Project Manager**.

## Objetivos estratégicos
### 1. Optimización de la producción  
- Reducir los tiempos de ejecución de los procesos productivos  
- Mejorar la eficiencia en cada fase de producción  
- Estandarizar los flujos de trabajo operativos  
  
### 2. Centralización de la información  
- Consolidar todos los procesos productivos en una sola plataforma  
- Garantizar la trazabilidad completa de la producción  
- Reducir la dispersión de información entre herramientas  
  
### 3. Automatización de procesos  
- Disminuir la intervención manual en tareas repetitivas  
- Automatizar la planificación y seguimiento de producción  
- Integrar procesos operativos con administrativos  
  
### 4. Gestión eficiente del talento humano  
- Controlar horarios de entrada y salida del personal  
- Mejorar la asignación de tareas y recursos humanos  
- Gestionar pagos al personal de forma organizada  
  
### 5. Integración financiera  
- Generar solicitudes hacia el sistema contable (movimientos contables para sincronización; pagos y obligaciones según reglas de negocio)  
- Controlar los costos asociados a la producción  
- Hacer seguimiento a pagos y obligaciones financieras  
  
### 6. Control de recursos físicos  
- Optimizar la gestión de inventarios de insumos  
- Controlar el stock de productos en proceso y terminados  
- Gestionar el transporte y logística de mercancías  
  
### 7. Soporte a la toma de decisiones  
- Generar reportes operativos en tiempo real  
- Proyectar movimientos productivos y financieros  
- Facilitar el análisis estratégico para la gerencia

# Objetivos del Proyecto

### 1. Diseño y arquitectura del sistema
- [ ] Definir y documentar la arquitectura completa del sistema (frontend, backend, base de datos e integraciones) en un plazo máximo de 4 semanas
- [ ] Diseñar el modelo de base de datos relacional que soporte los módulos de producción, inventario, personal y finanzas antes del inicio del desarrollo (máximo 3 semanas)

### 2. Desarrollo del módulo de producción (core)
- [ ] Desarrollar e implementar el módulo de planificación y seguimiento de producción con funcionalidades de creación de órdenes y control de fases en un plazo de 8 semanas
- [ ] Implementar un sistema de trazabilidad que permita registrar el estado de cada orden de producción en tiempo real antes del primer release funcional (máximo 10 semanas)

### 3. Integración con Lexi
- [ ] Diseñar e implementar la integración con la aplicación Lexi para recibir desarrollos o solicitudes de producción en un plazo de 6 semanas
- [ ] Validar el flujo completo desde la generación en Lexi hasta la creación automática de órdenes de producción en el sistema en un entorno de pruebas antes de la semana 8

### 4. Desarrollo del módulo de inventarios
- [ ] Implementar el control de inventarios de insumos y productos terminados con actualización en tiempo real en un plazo de 6 semanas posteriores al core
- [ ] Garantizar una precisión mínima del 95% en los registros de inventario durante las pruebas funcionales

### 5. Desarrollo del módulo de talento humano
- [ ] Implementar el registro de horarios de entrada y salida del personal en un plazo de 4 semanas
- [ ] Desarrollar el sistema de asignación de tareas por operario dentro del flujo productivo antes de la semana 12 del proyecto

### 6. Integración financiera
- [ ] Implementar la generación automática de solicitudes hacia el sistema contable —incluidas solicitudes de registro de movimientos contables para sincronización— (ej: Zoho Books) en un plazo de 5 semanas
- [ ] Validar la correcta sincronización de al menos el 90% de las transacciones en entorno de pruebas antes del despliegue

### 7. Desarrollo de reportes y analítica
- [ ] Implementar un módulo de reportes operativos en tiempo real para producción, inventario y personal en un plazo de 4 semanas
- [ ] Definir e implementar al menos 5 KPIs técnicos y operativos dentro del sistema antes del lanzamiento de la versión MVP

### 8. Implementación y despliegue
- [ ] Desplegar una versión MVP funcional en un entorno productivo en un plazo máximo de 16 semanas
- [ ] Garantizar una disponibilidad del sistema del 95% durante el primer mes de operación

### 9. Calidad y pruebas
- [ ] Ejecutar pruebas funcionales sobre el 100% de los módulos desarrollados antes del despliegue
- [ ] Corregir el 95% de los errores críticos identificados en pruebas antes de la salida a producción


## Entregables
### 1. Módulo de Planificación de Producción  
- Integración con Lexi (recepción de desarrollos)  
- Creación y gestión de planes de producción  
- Programación de órdenes de producción  
  
### 2. Módulo de Gestión Operativa de Producción  
- Creación y seguimiento de órdenes de producción  
- Control de fases y estados de producción  
- Registro de tiempos por proceso  
- Trazabilidad de procesos productivos  
  
### 3. Módulo de Gestión de Pedidos Internos  
- Interfaz para solicitudes de producción  
- Validación y aprobación de pedidos  
- Conversión de pedidos en órdenes de producción  
  
### 4. Módulo de Inventarios  
- Gestión de insumos  
- Control de productos en proceso  
- Control de productos terminados  
- Movimientos de inventario en tiempo real  
  
### 5. Módulo de Talento Humano  
- Registro de personal  
- Control de horarios (entrada/salida)  
- Asignación de tareas  
- Seguimiento de desempeño  
  
### 6. Módulo Financiero e Integración Contable  
- Generación de solicitudes hacia el contable (movimientos contables; pagos y obligaciones según negocio)  
- Integración con sistema contable (ej: Zoho Books)  
- Control de costos de producción  
- Gestión de pagos al personal  
  
### 7. Módulo de Gestión de Terceros  
- Registro de proveedores y aliados  
- Seguimiento de servicios externos  
- Control de obligaciones con terceros  
  
### 8. Módulo de Logística y Transporte  
- Gestión de envíos de mercancía  
- Control de rutas o movimientos  
- Seguimiento de entregas  
  
### 9. Módulo de Reportes y Analítica  
- Reportes operativos en tiempo real  
- KPIs de producción  
- Análisis de eficiencia  
- Proyecciones operativas y financieras  
  
### 10. Módulo de Administración del Sistema  
- Gestión de usuarios y roles  
- Control de accesos  
- Configuración general del sistema

# Cronograma del Proyecto (30 abril – 30 julio)

| #   | Entregable                    | Actividades principales                                                                            | Inicio     | Fin        |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| 1   | Arquitectura del sistema      | Definición de alcance (MVP), diseño de arquitectura, modelo de base de datos, definición de flujos | 30/04/2026 | 13/05/2026 |
| 2   | Módulo de Producción          | Órdenes de producción, estados y fases, seguimiento en tiempo real, registro de tiempos            | 14/05/2026 | 03/06/2026 |
| 3   | Módulo de Usuarios y Roles    | Creación de usuarios, definición de roles, control de accesos                                      | 14/05/2026 | 27/05/2026 |
| 4   | Módulo de Inventario          | Gestión de insumos, movimientos de inventario, relación con producción, control de productos       | 28/05/2026 | 17/06/2026 |
| 5   | Módulo de Pedidos Internos    | Interfaz de solicitudes, validación de pedidos, conversión a órdenes                               | 04/06/2026 | 24/06/2026 |
| 6   | Integración Contable          | Solicitudes de movimientos contables y hacia contable, integración con Zoho Books (u otro), validación de flujo | 25/06/2026 | 08/07/2026 |
| 7   | Módulo de Reportes Básicos    | Reportes de producción, inventario y KPIs básicos                                                  | 02/07/2026 | 15/07/2026 |
| 8   | Pruebas funcionales y ajustes | Pruebas con usuarios, corrección de errores, ajustes operativos                                    | 09/07/2026 | 22/07/2026 |
| 9   | Despliegue en producción      | Configuración en servidor (Dokploy), activación del sistema                                        | 20/07/2026 | 24/07/2026 |
| 10  | Capacitación y sincronización | Capacitación de usuarios, acompañamiento operativo, ajustes finales, documentación                 | 23/07/2026 | 30/07/2026 |

## 9. Stakeholders clave  
# Interesados Clave del Proyecto

| # | Interesado | Rol en el proyecto | Nivel de influencia | Descripción de influencia |
|---|------------|-------------------|---------------------|---------------------------|
| 1 | Patrocinador del proyecto | Financiador / decisor estratégico | Alto | Define prioridades, aprueba recursos y valida el éxito del proyecto |
| 2 | Gerente general | Dirección organizacional | Alto | Alinea el proyecto con los objetivos estratégicos de la empresa |
| 3 | Jefe de producción | Usuario líder / experto funcional | Alto | Define procesos productivos y valida el funcionamiento del sistema |
| 4 | Personal operativo | Usuarios finales | Medio | Utilizan el sistema en el día a día, su adopción define el éxito real |
| 5 | Área administrativa | Soporte operativo | Medio | Interactúa con pedidos, pagos y procesos administrativos |
| 6 | Área contable | Integración financiera | Medio | Recibe información de pagos y valida la coherencia financiera |
| 7 | Proveedores / terceros | Actores externos | Bajo | Participan en procesos indirectos (servicios, insumos) |
| 8 | Equipo de desarrollo (Ingeniero) | Ejecutor técnico | Alto | Diseña, desarrolla e implementa la solución |
| 9 | Consultor / implementador | Acompañamiento técnico | Medio | Apoya la configuración, despliegue y adaptación del sistema |
| 10 | Usuarios administrativos clave | Validadores de procesos | Medio | Validan flujos y ayudan en la adopción del sistema |

## 13. Aprobaciones  
- [ ] Firma del patrocinador  
- [ ] Firma del Project Manager