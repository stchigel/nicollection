<!--
## Sync Impact Report
- Version change: (sin versión previa) → 1.0.0
- Razón del bump: ratificación inicial del proyecto
- Principios añadidos: I a XII (constitución nueva)
- Secciones añadidas: Core Principles, Technology Stack & Constraints, Development Workflow & Quality Gates, Governance
- Secciones eliminadas: N/A (constitución nueva)
- Templates actualizados:
  - .specify/templates/plan-template.md ✅ — sección "Constitution Check" actualizada con gates específicos del proyecto
  - .specify/templates/spec-template.md ✅ — añadida sección obligatoria "Seguridad y Control de Acceso" en requisitos
  - .specify/templates/tasks-template.md ✅ — tests de reglas de negocio y Security Rules marcados como OBLIGATORIOS (no opcionales)
  - .specify/templates/checklist-template.md ✅ — sin cambios requeridos
- TODOs diferidos:
  - TODO(VISITOR_CAPABILITIES): las capacidades exactas del rol Visitante se definen en la especificación de la feature de roles (Principio XII)
-->

# nicollection Constitution

## Core Principles

### I. La Especificación Manda (NON-NEGOTIABLE)

La especificación es la única fuente de verdad para la implementación.
- No MUST escribirse código de producción para funcionalidad que no esté trazada a una historia de usuario o requisito explícito y aprobado.
- Si durante la implementación surge una necesidad no especificada, se detiene la implementación y se registra el nuevo ítem como parte del ciclo de especificación antes de continuar.
- El código no puede adelantarse a la especificación bajo ninguna circunstancia; las ideas de implementación van a `specs/` primero.

### II. Dominio con Orientación a Objetos Real

El dominio MUST modelarse con orientación a objetos real; se evitan las clases anémicas.
- Cuando exista una regla de negocio clara, el comportamiento va dentro del objeto que posee los datos (no en servicios externos que operan sobre estructuras de datos pasivas).
- Se identifican y distinguen Value Objects, Entities y Aggregates cuando la complejidad del dominio lo justifique.
- Los DTOs y view-models existen exclusivamente en las capas externas (presentación / infraestructura) y nunca en el dominio.
- Las reglas de invariante de una pieza de la colección (ej.: estado válido, campos obligatorios) MUST residir en la clase de dominio correspondiente.

### III. Separación de Responsabilidades en Capas

Las responsabilidades MUST separarse en capas bien definidas sin dependencias que "salten" niveles:
- **Dominio**: reglas de negocio puras, sin dependencias externas ni de frameworks.
- **Aplicación/Servicios**: casos de uso; orquestan el dominio y acceden a repositorios vía interfaces.
- **Infraestructura**: implementaciones concretas de repositorios, adaptadores del SDK de Firebase (Firestore, Auth), persistencia.
- **Presentación**: adaptadores y view-models que traducen entre el dominio y la UI. No existen endpoints ni DTOs de red propios; el contrato con el exterior es el SDK de Firebase + las Firestore Security Rules.
- **Frontend**: interfaz de usuario; consume solo la capa de presentación, nunca el dominio ni la infraestructura directamente.
- Violaciones de capas MUST justificarse explícitamente en el plan de implementación (ver Principio V).

### IV. Backend Exclusivamente Firebase (NON-NEGOTIABLE)

El backend se limita de forma estricta y exclusiva a Firebase Authentication, Cloud Firestore y Firebase Hosting.
- NO MUST usarse Firebase Functions ni ningún backend o servidor propio en V1.
- TODA la lógica de negocio es client-side (navegador/app).
- Las imágenes y el almacenamiento de archivos están fuera del scope de V1; se evaluarán a futuro (Cloudinary o Cloud Storage for Firebase). No MUST crearse abstracciones para ello en V1.
- La integración con Colnect API está fuera del scope de V1; se evaluará en versiones futuras (Principio XI).
- Cualquier propuesta que requiera un servidor, Lambda, Cloud Function u otro proceso en backend MUST rechazarse o diferirse a una revisión de constitución.

### V. Patrones de Diseño Intencionales (YAGNI)

Los patrones de diseño MUST aplicarse solo cuando simplifican de forma demostrable un problema concreto y existente.
- No se MUST adoptar patrones por convención, "buenas prácticas" genéricas o para anticipar necesidades futuras hipotéticas.
- Cada patrón introducido MUST justificarse en el plan de implementación con el problema específico que resuelve y por qué una solución más simple no es suficiente.
- YAGNI es la postura por defecto: la abstracción más simple que funcione correctamente.

### VI. Toda Regla de Negocio Importante Debe Tener Tests (NON-NEGOTIABLE)

Toda regla de negocio importante MUST tener cobertura de test automático antes de considerarse implementada.
- Los tests se ejecutan contra Firebase Emulator Suite (Firestore Emulator + Auth Emulator); no se testea contra el proyecto de Firebase de producción.
- Las Firestore Security Rules MUST tener su propio conjunto de tests (usando `@firebase/rules-unit-testing` o equivalente).
- Las reglas de dominio (validaciones, invariantes, transiciones de estado) MUST probarse con tests unitarios.
- El ciclo es: tests escritos → tests fallan (red) → implementación → tests pasan (green) → refactor si aplica.
- No se MUST aceptar una PR/commit de regla de negocio sin tests que la acrediten.

### VII. Diseñado para Escalar

El sistema MUST diseñarse desde el inicio para crecer a grandes cantidades de elementos (estimado: miles de piezas de colección).
- Todas las consultas a Firestore sobre colecciones MUST usar paginación basada en cursores (`startAfter`) y nunca cargar una colección completa en memoria.
- Los filtros y búsquedas MUST apoyarse en índices de Firestore declarados en `firestore.indexes.json`; no se MUST depender de filtros client-side sobre datos completos.
- El modelo de datos MUST evitar subcollections anidadas profundamente que dificulten consultas cross-categoría o cross-colección.
- Las decisiones de estructura de datos que afecten la escalabilidad MUST documentarse en el plan de implementación con la justificación correspondiente.

### VIII. Usabilidad Primero

La interfaz MUST priorizar la usabilidad sin sacrificar la estética; la experiencia de exploración y búsqueda es central al producto.
- Las acciones primarias (explorar catálogo, buscar, filtrar por categoría) MUST ser accesibles en un máximo de dos interacciones desde cualquier vista principal.
- Las funciones de filtrado, búsqueda y categorización MUST funcionar sin autenticación (usuario Público, ver Principio XII).
- El diseño MUST ser responsive y funcionar correctamente en dispositivos móviles y de escritorio.
- La performance percibida (First Contentful Paint, Time to Interactive) MUST priorizarse; no MUST cargarse datos que no sean necesarios para la pantalla actual (lazy loading, paginación).
- Cualquier flujo de usuario nuevo MUST evaluarse contra este principio antes de ser aprobado en especificación.

### IX. Sin Código Durante las Fases de Especificación (NON-NEGOTIABLE)

No MUST escribirse ni modificarse código de producción o tests durante las siguientes fases del ciclo de desarrollo:
especificación, aclaración, checklist, planificación y generación de tareas.
- Durante estas fases solo MUST crearse o actualizarse documentos dentro de `.specify/` o `specs/`.
- La fase de implementación comienza únicamente cuando la especificación está aprobada y el archivo `tasks.md` ha sido generado y revisado.
- Si durante las fases de spec/plan se descubre que una decisión requiere validación técnica (PoC), se registra como tarea exploratoria en `tasks.md` y no se codifica de forma especulativa.

### X. Defensa en Profundidad: Security Rules Espejo del Dominio (NON-NEGOTIABLE)

Toda regla de negocio que implique control de acceso o integridad de datos MUST reflejarse en Firestore Security Rules ADEMÁS de en la capa de dominio cliente.
- El dominio valida para UX (feedback inmediato al usuario sin round-trip); las Security Rules validan para seguridad real (el servidor de Firestore rechaza operaciones no autorizadas independientemente del cliente).
- Ninguna regla de autorización puede depender SOLO de validación client-side; si una Security Rule no lo protege, no está protegido.
- Toda modificación a las reglas de acceso o integridad en el dominio MUST ir acompañada de la modificación correspondiente en `firestore.rules`, y ambas MUST ir en el mismo commit o PR.
- Los tests de Security Rules (Principio VI) MUST cubrir los tres roles: Público, Visitante y Admin (Principio XII).

### XI. Integraciones Futuras Identificadas y Diferidas

Las integraciones externas futuras están identificadas pero MUST mantenerse estrictamente fuera del scope de V1.
- **Colnect API**: evaluación de integración con la API de coleccionismo diferida a versiones post-V1.
- **Almacenamiento de imágenes**: Cloudinary o Cloud Storage for Firebase, evaluación diferida a post-V1.
- Durante V1, no MUST crearse interfaces, abstracciones ni "hooks" anticipando estas integraciones; se agregarán cuando estén formalmente especificadas en una versión futura.
- Este principio garantiza que V1 permanezca enfocado y entregable sin deuda técnica anticipatoria.

### XII. Control de Acceso en Tres Niveles (NON-NEGOTIABLE)

El sistema MUST implementar tres niveles de acceso bien definidos:
- **Público** (no autenticado): solo lectura de piezas publicadas. Ninguna operación de escritura o modificación.
- **Visitante** (autenticado, rol básico): capacidades específicas a definir en la especificación de la feature de roles.
  - TODO(VISITOR_CAPABILITIES): las capacidades exactas del Visitante (ej.: favoritos, comentarios, listas privadas) se definen en `specs/` antes de implementar cualquier funcionalidad de este rol.
- **Admin** (autenticado, gestión completa): creación, edición, publicación y eliminación de piezas; gestión de categorías; administración de usuarios.
- Los roles MUST gestionarse vía Firebase Auth (custom claims) y/o una colección de roles en Firestore, según se defina en la spec correspondiente.
- El cumplimiento de roles MUST hacerse cumplir en Firestore Security Rules (Principio X); la UI solo adapta la experiencia visual, no es el mecanismo de seguridad.
- Ninguna operación de escritura privilegiada MUST ser posible para un Público o Visitante, aun si el cliente intenta enviarla directamente.

## Technology Stack & Constraints

- **Frontend**: SPA o framework moderno (a definir en spec; compatible con deploy estático en Firebase Hosting).
- **Autenticación**: Firebase Authentication (email/password; proveedores OAuth opcionales según spec).
- **Base de datos**: Cloud Firestore en modo nativo.
- **Hosting**: Firebase Hosting (deploy estático).
- **Backend**: **Ninguno propio. Ninguna Firebase Function en V1.**
- **Lógica de negocio**: 100% client-side, ejecutada en el navegador.
- **Testing**: Firebase Emulator Suite (Firestore Emulator + Auth Emulator); `@firebase/rules-unit-testing` para Security Rules.
- **Índices**: declarados en `firestore.indexes.json`; revisados en cada feature que añada consultas nuevas.
- **Reglas de seguridad**: `firestore.rules`; versionadas junto al código fuente.
- **Imágenes en V1**: sin soporte gestionado. Las piezas pueden tener un campo `imageUrl` opcional de tipo string (URL externa), pero V1 no gestiona upload ni almacenamiento.
- **CI/CD**: a definir en spec propia; como mínimo: lint + tests (emulator) antes de cualquier deploy a producción.

## Development Workflow & Quality Gates

1. **Especificación primero**: toda feature nueva comienza con `spec.md` en `specs/###-nombre-feature/`.
2. **Plan técnico**: `plan.md` define la arquitectura, pasa el Constitution Check y detalla la estructura de código.
3. **Generación de tareas**: `tasks.md` desglosa la implementación en tareas rastreables organizadas por historia de usuario.
4. **Implementación**: el código solo se escribe tras la aprobación de `tasks.md`.
5. **Tests antes de implementar reglas de negocio**: los tests de dominio y de Security Rules MUST escribirse antes que la implementación correspondiente (ciclo red-green-refactor).
6. **Sincronización Security Rules**: cualquier cambio de acceso o integridad MUST sincronizarse entre el dominio y `firestore.rules` en el mismo commit o PR.
7. **Sin saltarse fases**: si la especificación cambia durante implementación, se regresa a la fase de especificación. No hay "arreglos rápidos" que bypassen el ciclo.
8. **Constitution Check en cada plan**: antes de iniciar la implementación, el plan MUST verificar el cumplimiento de los principios no negociables (I, IV, VI, IX, X, XII).

## Governance

- Esta constitución es el documento rector del proyecto `nicollection`; toda decisión de arquitectura, tecnología y proceso MUST ser coherente con ella.
- Las enmiendas requieren: (a) identificar el principio o sección afectada, (b) justificar el cambio con contexto concreto, (c) actualizar este documento con nueva versión semántica, (d) propagar cambios a los templates dependientes y documentar en el Sync Impact Report.
- **Versionado semántico**:
  - **MAJOR**: cambios incompatibles hacia atrás — eliminación o redefinición fundamental de un principio.
  - **MINOR**: nuevo principio o sección añadida, o expansión material de guía existente.
  - **PATCH**: aclaraciones, correcciones de redacción, ajustes no semánticos.
- Los commits/PRs MUST verificar el cumplimiento de los principios no negociables (I, IV, VI, IX, X, XII) antes de ser aprobados.
- La complejidad que viole el Principio V (YAGNI) MUST justificarse explícitamente en la tabla "Complexity Tracking" del plan de implementación.
- La constitución está disponible en `.specify/memory/constitution.md` y es referencia obligatoria para todos los agentes de especificación e implementación del proyecto.

**Version**: 1.0.0 | **Ratified**: 2026-07-07 | **Last Amended**: 2026-07-07
