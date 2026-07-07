# Feature Specification: nicollection V1 — Vitrina de Colección Personal

**Feature Branch**: `001-vitrina-coleccion`

**Created**: 2026-07-07

**Status**: Ready for Planning

## User Scenarios & Testing

<!--
  Historias de usuario ordenadas por prioridad de entrega (P1 = MVP más crítico).
  Cada historia es independientemente testeable y entregable.
-->

### User Story 1 — Explorar el catálogo de categorías (Priority: P1)

Un usuario sin cuenta visita la página de inicio y ve una grilla de cajitas, una por cada categoría de la colección. Entiende de inmediato qué tipo de objetos contiene la vitrina y puede elegir qué explorar.

**Why this priority**: Es la puerta de entrada al sistema. Sin esta vista, ningún otro flujo es posible. Todo el valor como vitrina depende de que el catálogo sea navegable desde el primer instante.

**Independent Test**: Un visitante sin cuenta puede abrir la aplicación, ver todas las categorías disponibles (internas y externas) en la home, y distinguir visualmente las categorías externas de las internas.

**Acceptance Scenarios**:

1. **Given** el usuario no está autenticado, **When** abre la página de inicio, **Then** ve una representación visual (tile/cajita) por cada categoría existente, mostrando al menos el nombre de la categoría.
2. **Given** la colección tiene categorías internas y categorías externas (tipo Colnect), **When** el usuario ve la home, **Then** ambas aparecen en la home y las categorías externas tienen un indicador visual que las distingue de las internas.
3. **Given** no hay ninguna categoría cargada en el sistema, **When** el usuario abre la home, **Then** se muestra un mensaje informativo indicando que no hay categorías disponibles aún.

---

### User Story 2 — Navegar y filtrar piezas de una categoría interna (Priority: P2)

Un usuario sin cuenta hace clic en una categoría interna y ve el listado paginado de piezas publicadas. Puede buscar por texto libre y aplicar filtros para encontrar exactamente lo que le interesa.

**Why this priority**: La exploración y el filtrado son el núcleo de la experiencia de vitrina. Sin búsqueda y filtrado el sistema no es más que una lista no interactiva.

**Independent Test**: Un usuario sin cuenta puede seleccionar una categoría interna, ver sus piezas publicadas paginadas, escribir un texto de búsqueda y aplicar al menos un filtro; los resultados se actualizan en consecuencia.

**Acceptance Scenarios**:

1. **Given** el usuario está en el listado de una categoría interna con piezas publicadas, **When** el listado carga, **Then** las piezas se muestran en tarjetas o filas con al menos título, año y tipo, cargadas en lotes (no todas a la vez).
2. **Given** el usuario escribe texto en el campo de búsqueda, **When** confirma la búsqueda, **Then** solo se muestran piezas cuyo título, descripción o tags contienen el texto (sin distinción de mayúsculas/minúsculas).
3. **Given** el usuario aplica un filtro (por ej. año, país o tipo), **When** el filtro se activa, **Then** la lista se actualiza para mostrar únicamente piezas que cumplan ese filtro.
4. **Given** el usuario aplica múltiples filtros simultáneamente, **When** los filtros se activan, **Then** se muestran solo piezas que cumplen todos los filtros activos a la vez (AND lógico).
5. **Given** la búsqueda o los filtros activos no producen resultados, **When** el sistema evalúa la consulta, **Then** muestra un mensaje claro de "sin resultados" y una opción para limpiar todos los criterios con una sola acción.
6. **Given** el usuario está en el listado con filtros aplicados, **When** hace clic en "limpiar filtros", **Then** todos los filtros y la búsqueda de texto se restablecen y el listado completo (paginado) vuelve a aparecer.
7. **Given** el usuario ha llegado al final de la página actual de resultados, **When** hay más resultados disponibles, **Then** puede cargar la siguiente página; cuando no hay más resultados, el sistema lo indica claramente.

---

### User Story 3 — Ver el detalle de una pieza (Priority: P3)

Un usuario sin cuenta hace clic en una pieza del listado y accede a su ficha completa: todos los campos públicos, los campos específicos de la categoría, el campo de imagen (si existe) y los comentarios de otros usuarios.

**Why this priority**: El detalle de pieza es la unidad central de contenido del sistema; sin él la navegación no tiene destino.

**Independent Test**: Un usuario sin cuenta puede navegar a la ficha de una pieza publicada, ver todos sus campos públicos y los comentarios existentes. Los campos de administración no aparecen.

**Acceptance Scenarios**:

1. **Given** el usuario hace clic en una pieza publicada, **When** se carga la ficha, **Then** se muestran todos los campos públicos: título, descripción, tags, categoría, año, país, tipo, campos específicos de la categoría e `imageUrl` si tiene valor.
2. **Given** la ficha de una pieza tiene comentarios, **When** el usuario la visualiza, **Then** los comentarios se muestran ordenados por fecha (más antiguos primero), con el nombre de usuario del autor y la fecha de publicación.
3. **Given** un usuario sin autenticar accede a la URL directa de una pieza en estado Borrador, **When** el sistema la evalúa, **Then** devuelve "pieza no encontrada" sin revelar que existe en Borrador.
4. **Given** el usuario no está autenticado y ve la sección de comentarios de una pieza, **When** el usuario intenta comentar, **Then** ve un aviso de que necesita iniciar sesión para interactuar y no puede publicar el comentario.
5. **Given** los campos de administración están almacenados en la pieza, **When** cualquier usuario (Público o Visitante) visualiza la ficha, **Then** esos campos (Funcionando, Caja, Accesorios, Estado, Procedencia, Adquisición, Notas) no aparecen en ningún lugar de la vista.

---

### User Story 4 — Acceder a una categoría externa (Colnect) (Priority: P4)

Un usuario hace clic en la cajita de una categoría gestionada externamente y es redirigido al sitio externo correspondiente, sin ninguna pantalla interna del sistema.

**Why this priority**: Define el límite explícito del sistema. Es un comportamiento simple pero fundamental para establecer la separación entre colecciones internas y externas.

**Independent Test**: Un usuario hace clic en una cajita de categoría externa y el navegador navega a la URL externa asociada; no aparece ninguna pantalla interna de listado de piezas.

**Acceptance Scenarios**:

1. **Given** el usuario está en la home, **When** hace clic en la cajita de una categoría externa, **Then** el navegador navega a la URL externa asociada a esa categoría (en nueva pestaña).
2. **Given** el usuario observa la cajita de una categoría externa en la home, **When** la visualiza, **Then** un indicador visible (ícono, etiqueta u otro elemento) la distingue de las categorías internas.
3. **Given** una categoría es de tipo externo, **When** se intenta acceder a un listado interno de sus piezas por cualquier medio (URL directa, etc.), **Then** el sistema no muestra dicho listado ni permite cargar piezas para esa categoría.

---

### User Story 5 — Registrarse e iniciar sesión como Visitante (Priority: P5)

Un nuevo usuario puede crear una cuenta proporcionando correo electrónico, contraseña y un nombre de usuario único en el sistema. Una vez registrado puede iniciar y cerrar sesión.

**Why this priority**: El registro habilita todas las capacidades de interacción del Visitante. Sin esto, los usuarios no pueden comentar, marcar favoritos ni gestionar su colección personal.

**Independent Test**: Un nuevo usuario puede completar el registro (correo + contraseña + nombre de usuario único), iniciar sesión con esas credenciales y cerrar sesión correctamente.

**Acceptance Scenarios**:

1. **Given** un nuevo usuario en la pantalla de registro, **When** ingresa correo válido, contraseña que cumple los requisitos mínimos y un nombre de usuario disponible, **Then** la cuenta se crea y el usuario queda autenticado con el rol Visitante.
2. **Given** el usuario intenta registrarse con un nombre de usuario ya en uso, **When** envía el formulario, **Then** el sistema muestra un error descriptivo y no crea la cuenta.
3. **Given** el usuario intenta registrarse con un correo electrónico ya registrado, **When** envía el formulario, **Then** el sistema muestra un error descriptivo y no crea la cuenta.
4. **Given** un Visitante registrado en la pantalla de inicio de sesión, **When** ingresa sus credenciales correctas, **Then** inicia sesión y puede acceder a las funciones de Visitante.
5. **Given** un Visitante autenticado, **When** hace clic en "Cerrar sesión", **Then** la sesión finaliza y el usuario vuelve al estado Público (solo lectura).
6. **Given** un usuario inhabilitado por el Admin intenta iniciar sesión, **When** ingresa sus credenciales, **Then** el sistema rechaza el acceso con un mensaje claro de cuenta inactiva.

---

### User Story 6 — Interactuar con piezas como Visitante (Priority: P6)

Un Visitante autenticado puede dejar comentarios en piezas publicadas, marcar piezas como favoritas y agregar piezas a su lista "En Colección". Puede ver estas listas en su perfil y editar o eliminar sus propios comentarios.

**Why this priority**: Las interacciones son el diferenciador entre una vitrina pasiva y una experiencia de comunidad de coleccionistas. Son la propuesta de valor social del sistema.

**Independent Test**: Un Visitante autenticado puede realizar las tres interacciones (comentar, favorito, En Colección) sobre una pieza publicada, verlas reflejadas en su perfil, y editar/eliminar sus propios comentarios.

**Acceptance Scenarios**:

1. **Given** un Visitante autenticado en la ficha de una pieza publicada, **When** escribe y envía un comentario no vacío, **Then** el comentario aparece en la lista de la pieza con el nombre de usuario del Visitante y la fecha de creación.
2. **Given** un Visitante autenticado en la ficha de una pieza, **When** hace clic en "Marcar como favorito", **Then** la pieza queda marcada; al hacer clic nuevamente, se desmarca (operación idempotente: marcarlo dos veces no crea duplicados).
3. **Given** un Visitante autenticado en la ficha de una pieza, **When** hace clic en "En Colección", **Then** la pieza se agrega a su lista personal; al hacer clic nuevamente, se retira (operación idempotente).
4. **Given** un Visitante autenticado en su perfil en "Mis Favoritos", **When** visualiza la lista, **Then** ve todas las piezas que marcó como favoritas; las piezas despublicadas o eliminadas no aparecen.
5. **Given** un Visitante autenticado en su perfil en "Mi Colección", **When** visualiza la lista, **Then** ve todas las piezas que marcó como "En Colección"; las piezas despublicadas o eliminadas no aparecen.
6. **Given** un Visitante autenticado ve un comentario propio, **When** hace clic en "Editar", **Then** puede modificar el texto; al guardar, el comentario queda marcado como editado con la fecha de edición.
7. **Given** un Visitante autenticado ve un comentario propio, **When** hace clic en "Eliminar" y confirma, **Then** el comentario se elimina de la ficha de la pieza.
8. **Given** un Visitante intenta editar o eliminar el comentario de otro usuario (incluso por acceso directo), **When** el sistema evalúa la operación, **Then** la rechaza y muestra un mensaje de permisos insuficientes.

---

### User Story 7 — Gestionar piezas como Admin (Priority: P7)

Un Admin autenticado puede crear nuevas piezas con todos sus campos (comunes, específicos de la categoría y de administración), editar piezas existentes, cambiar su estado de publicación y eliminarlas.

**Why this priority**: Sin ABM de piezas no hay contenido que mostrar en la vitrina. Es la capacidad fundacional del Administrador y el mecanismo principal de curación de la colección.

**Independent Test**: Un Admin puede crear una pieza en cada categoría interna con todos sus campos (incluyendo los específicos), editarla, cambiar su estado de publicación y eliminarla. Las piezas en Borrador no son visibles para Público ni Visitante.

**Acceptance Scenarios**:

1. **Given** un Admin en el formulario de alta de pieza, **When** selecciona una categoría interna, **Then** el formulario muestra los campos comunes más los campos específicos de esa categoría (y solo esos).
2. **Given** un Admin completa el formulario con título y categoría (campos obligatorios) y guarda, **When** la pieza se crea, **Then** queda en estado **Publicada** por defecto y es visible en el catálogo público inmediatamente.
3. **Given** una pieza está en estado Borrador, **When** un Público o Visitante busca o navega piezas, **Then** la pieza en Borrador no aparece en ningún listado público ni es accesible por URL directa.
4. **Given** un Admin en la vista de gestión (panel admin), **When** cambia el estado de una pieza de Borrador a Publicada, **Then** la pieza pasa a ser visible en el catálogo público inmediatamente.
5. **Given** un Admin cambia el estado de una pieza de Publicada a Borrador, **When** el cambio se guarda, **Then** la pieza deja de aparecer en el catálogo público y en las listas de Favoritos/En Colección de los Visitantes.
6. **Given** un Admin edita una pieza publicada, **When** modifica cualquier campo público y guarda, **Then** los cambios se reflejan inmediatamente en la vista pública.
7. **Given** un Admin en el formulario de una pieza de categoría "Celulares", **When** completa los campos específicos (Fabricante, Modelo, Sistema Operativo, Color), **Then** esos datos se guardan y se muestran en la ficha pública de la pieza.
8. **Given** un Admin intenta guardar una pieza sin título o sin categoría, **When** el sistema valida el formulario, **Then** muestra un error descriptivo por campo faltante y no guarda la pieza.
9. **Given** un Admin intenta eliminar una pieza que tiene comentarios, favoritos y/o entradas "En Colección" asociadas, **When** hace clic en "Eliminar", **Then** el sistema muestra una pantalla de confirmación que indica el número de comentarios, favoritos y entradas "En Colección" que serán eliminados en cascada; solo tras la confirmación explícita del Admin se procede al borrado permanente de la pieza y todas sus dependencias.
10. **Given** un Admin ve la ficha de una pieza en el panel admin, **When** visualiza los campos de administración (Funcionando, Caja, Accesorios, Estado, Procedencia, Adquisición, Notas), **Then** puede editarlos; esos campos no son accesibles para Público ni Visitante.
11. **Given** el panel de gestión de piezas del Admin, **When** el Admin visualiza el listado, **Then** ve tanto las piezas Publicadas como las que están en Borrador, con indicación clara del estado de cada una.

---

### User Story 8 — Gestionar usuarios como Admin (Priority: P8)

Un Admin puede ver la lista de usuarios del sistema, inhabilitar o habilitar cuentas y modificar el nombre de usuario de cualquier cuenta. No puede conceder el rol Admin a otros usuarios.

**Why this priority**: La gestión de usuarios es necesaria para moderar el acceso a la plataforma y mantener la calidad de la comunidad.

**Independent Test**: Un Admin puede inhabilitar una cuenta (impidiendo el acceso inmediato del usuario), habilitarla nuevamente y modificar el nombre de usuario de un Visitante.

**Acceptance Scenarios**:

1. **Given** un Admin en el panel de gestión de usuarios, **When** visualiza la lista, **Then** ve todos los usuarios con su nombre de usuario, estado (habilitado/inhabilitado) y fecha de registro.
2. **Given** un Admin inhabilita una cuenta de Visitante, **When** ese Visitante intenta iniciar sesión o ejecutar cualquier acción autenticada, **Then** el sistema rechaza el acceso inmediatamente (sin esperar a que expire la sesión activa).
3. **Given** un Admin habilita una cuenta previamente inhabilitada, **When** el usuario intenta iniciar sesión, **Then** el acceso es restaurado.
4. **Given** un Admin modifica el nombre de usuario de un Visitante y guarda, **When** se completa el cambio, **Then** el nuevo nombre de usuario aparece en todos los comentarios históricos de ese Visitante.
5. **Given** un Admin asigna un nombre de usuario ya en uso, **When** intenta guardar, **Then** el sistema rechaza el cambio con un error descriptivo.
6. **Given** un Admin en el panel de usuarios, **When** el Admin busca la opción de conceder el rol Administrador a otro usuario, **Then** esa opción no existe en ningún lugar de la interfaz.
7. **Given** un Admin intenta inhabilitarse a sí mismo, **When** ejecuta la acción, **Then** el sistema la rechaza con un error descriptivo.

---

### Edge Cases

- Si una pieza es eliminada mientras un Visitante la tiene en Favoritos o "En Colección", la pieza desaparece de las listas del Visitante sin aviso; las listas simplemente omiten referencias a piezas inexistentes.
- Si una pieza es despublicada (pasa a Borrador) mientras un Visitante la tiene en Favoritos o "En Colección", desaparece de las listas del Visitante hasta que sea publicada nuevamente.
- Un Visitante que accede directamente a la URL de una pieza en estado Borrador recibe "pieza no encontrada", sin ninguna indicación de que existe una versión en Borrador.
- Si el campo de búsqueda de texto está vacío, la búsqueda no aplica filtro de texto y retorna el listado completo (paginado) de la categoría activa.
- Si los filtros activos no producen resultados, se muestra "sin resultados" con acceso para limpiar filtros; no se muestra error.
- Al llegar al final de la lista paginada cuando no hay más resultados, se muestra un indicador de fin de lista, no un error.
- Un Admin no puede crear una pieza en una categoría de tipo externo; esas categorías no aparecen en el selector de categorías del formulario de alta.
- Los comentarios de un Visitante inhabilitado permanecen visibles en las fichas de piezas (con su nombre de usuario), pero el Visitante inhabilitado no puede crear, editar ni eliminar comentarios.
- Cuando el Admin modifica el nombre de usuario de un Visitante, los comentarios históricos de ese Visitante se muestran con el nuevo nombre de usuario.
- Un Visitante que intenta enviar un comentario vacío recibe un error; la operación no se realiza.
- Marcar como favorito o "En Colección" una pieza que ya está en esa lista es una operación idempotente: no se crea duplicado y no se produce error.
- Si dos usuarios intentan registrarse simultáneamente con el mismo nombre de usuario, solo uno tiene éxito; el otro recibe un error de nombre de usuario ya en uso.
- El Admin no puede eliminar su propia cuenta ni inhabilitarse a sí mismo.
- Una categoría interna sin piezas publicadas muestra su tile en la home igualmente (ver Assumptions).

## Requirements

### Functional Requirements

#### Navegación y Categorías

- **FR-001**: El sistema MUST mostrar en la página de inicio una representación visual (tile/cajita) por cada categoría existente (internas y externas).
- **FR-002**: Al seleccionar una categoría interna, el sistema MUST navegar al listado paginado de piezas publicadas de esa categoría.
- **FR-003**: Al seleccionar una categoría de tipo externo, el sistema MUST redirigir al usuario a la URL externa asociada, sin mostrar ningún listado interno.
- **FR-004**: Las categorías de tipo externo NO MUST tener piezas cargadas, formulario de ABM de piezas ni ficha interna en el sistema.
- **FR-005**: Las categorías externas MUST estar diferenciadas visualmente de las categorías internas en la home.
- **FR-006**: El sistema MUST soportar la adición de nuevas categorías internas en el futuro, cada una con sus propios campos específicos, sin requerir modificaciones a piezas existentes de otras categorías.

#### Búsqueda y Filtrado

- **FR-007**: El sistema MUST mostrar el listado de piezas publicadas de una categoría interna con carga paginada; nunca carga todas las piezas de la colección simultáneamente en el cliente.
- **FR-008**: El sistema MUST ofrecer búsqueda por texto libre que opere sobre, como mínimo, el título, la descripción y los tags de las piezas.
- **FR-009**: La búsqueda por texto MUST ser insensible a mayúsculas y minúsculas.
- **FR-010**: El sistema MUST ofrecer filtros por: año, país y tipo (Papelería/Objeto/etc.).
- **FR-011**: El sistema MUST ofrecer filtros por los campos específicos de la categoría actualmente visualizada.
- **FR-012**: Los filtros múltiples MUST combinarse con AND lógico.
- **FR-013**: El sistema MUST proveer una acción de "limpiar filtros" que restablezca todos los criterios de búsqueda y filtrado con una sola interacción.
- **FR-014**: Cuando no hay resultados para los criterios activos, el sistema MUST mostrar un mensaje descriptivo y la opción de limpiar los criterios.

#### Detalle de Pieza

- **FR-015**: La ficha de una pieza publicada MUST mostrar: título, descripción, tags, categoría, año, país, tipo, campos específicos de la categoría, `imageUrl` (si tiene valor) y la lista de comentarios.
- **FR-016**: Los comentarios en la ficha de una pieza MUST incluir el nombre de usuario del autor y la fecha de publicación, ordenados cronológicamente.
- **FR-017**: Los campos de administración MUST estar completamente ausentes de la vista de ficha para Público y Visitante.
- **FR-018**: El acceso directo (por URL) a una pieza en estado Borrador por parte de Público o Visitante MUST resultar en una respuesta de "no encontrada".

#### Modelo de Piezas y Campos

- **FR-019**: Toda pieza MUST tener los siguientes campos comunes: título (obligatorio), descripción (opcional), tags (opcional, lista), categoría (obligatorio), año (opcional), país (opcional), tipo (opcional), `imageUrl` (opcional, texto libre).
- **FR-020**: Toda pieza MUST tener un estado de publicación con exactamente dos valores: Borrador y Publicada. El estado inicial al crear una pieza nueva es **Publicada**.
- **FR-021**: Las piezas de categoría "Aerolíneas" MUST tener los campos adicionales: aerolínea, subtipo.
- **FR-022**: Las piezas de categoría "Celulares" MUST tener los campos adicionales: fabricante, modelo, sistema operativo, color.
- **FR-023**: Las piezas de categoría "Hotel" MUST tener los campos adicionales: cadena, hotel específico, ciudad, subtipo.
- **FR-024**: Las piezas de categoría "Tecnología Antigua" MUST tener los campos adicionales: fabricante, modelo, subtipo.
- **FR-025**: Toda pieza MUST tener los siguientes campos de administración (visibles y editables exclusivamente por Admin): Funcionando (Sí/No/No aplica), Caja (Sí/No/No aplica), Accesorios (lista de textos), Estado (Perfecto/Excelente/Bueno/Aceptable/Malo/Muy Malo), Procedencia (texto libre), Adquisición (fecha), Notas (texto libre).
- **FR-026**: El modelo MUST ser extensible: una categoría interna futura MUST poder definir sus propios campos específicos sin alterar la estructura de piezas de otras categorías.

#### Gestión de Piezas (Admin)

- **FR-027**: Un Admin MUST poder crear una pieza con todos sus campos (comunes, específicos de categoría y de administración).
- **FR-028**: El formulario de alta MUST adaptarse dinámicamente para mostrar los campos específicos de la categoría seleccionada.
- **FR-029**: Un Admin MUST poder editar cualquier campo de una pieza existente.
- **FR-030**: Un Admin MUST poder cambiar el estado de publicación de una pieza entre Borrador y Publicada.
- **FR-031**: Un Admin MUST poder eliminar una pieza permanentemente. Antes de ejecutar la eliminación, el sistema MUST mostrar una pantalla de confirmación que informe al Admin la cantidad exacta de comentarios, favoritos y entradas "En Colección" que serán eliminados como consecuencia. Solo tras la confirmación explícita se procede al borrado en cascada de la pieza y todas sus dependencias.
- **FR-032**: El panel de gestión de piezas del Admin MUST mostrar tanto piezas Publicadas como Borradores, con indicación clara del estado de cada una.
- **FR-033**: Los cambios en una pieza publicada MUST reflejarse en la vista pública en la siguiente carga de la página. *Aclaración de alcance (Decisión F14-A, 2026-07-07)*: "inmediatamente" significa disponible para cualquier usuario que cargue o recargue la ficha después del guardado. No se requiere sincronización en tiempo real para usuarios que ya tienen la página abierta. La implementación es un re-fetch estándar en la entrada a la ruta; no se usa `onSnapshot` en `PieceDetailPage`.

#### Autenticación y Cuentas de Usuario

- **FR-034**: Un nuevo usuario MUST poder registrarse proporcionando correo electrónico, contraseña y un nombre de usuario único.
- **FR-035**: El nombre de usuario MUST ser único en todo el sistema; el registro MUST rechazarse si el nombre de usuario ya está en uso.
- **FR-036**: El nombre de usuario es un dato del dominio del sistema, gestionado de forma independiente a las credenciales de autenticación (correo/contraseña).
- **FR-037**: Un usuario registrado MUST poder iniciar sesión con correo y contraseña.
- **FR-038**: Un usuario autenticado MUST poder cerrar sesión.
- **FR-039**: Un usuario inhabilitado por el Admin MUST perder el acceso al sistema de forma inmediata; su sesión activa MUST invalidarse.

#### Interacciones del Visitante

- **FR-040**: Un Visitante autenticado MUST poder publicar comentarios en piezas publicadas; un comentario MUST tener texto no vacío y registrar la fecha de publicación.
- **FR-041**: Un Visitante MUST poder editar sus propios comentarios; el comentario MUST quedar marcado como editado con la fecha de la última edición.
- **FR-042**: Un Visitante MUST poder eliminar sus propios comentarios.
- **FR-043**: Un Admin MUST poder eliminar cualquier comentario de cualquier usuario.
- **FR-044**: Un Visitante NO MUST poder editar ni eliminar comentarios de otros usuarios; el sistema MUST rechazar el intento aun si se realiza por acceso directo.
- **FR-045**: Los comentarios de piezas publicadas MUST ser visibles para Público, Visitante y Admin.
- **FR-046**: Un Visitante autenticado MUST poder marcar y desmarcar una pieza como Favorita; la operación de marcado es idempotente (marcar dos veces no genera duplicados).
- **FR-047**: Un Visitante autenticado MUST poder marcar y desmarcar una pieza como "En Colección"; la operación es idempotente.
- **FR-048**: Un Visitante MUST tener una vista de perfil con secciones: "Mis Favoritos", "Mi Colección" y "Mis Comentarios".
- **FR-049**: Las piezas despublicadas o eliminadas NO MUST aparecer en las secciones de perfil del Visitante (Favoritos, En Colección).

#### Gestión de Usuarios (Admin)

- **FR-050**: Un Admin MUST poder ver una lista de todos los usuarios del sistema con, al menos, nombre de usuario, estado y fecha de registro.
- **FR-051**: Un Admin MUST poder inhabilitar y habilitar cuentas de usuario.
- **FR-052**: Un Admin MUST poder modificar el nombre de usuario de cualquier cuenta.
- **FR-053**: Al cambiar el nombre de usuario de un Visitante, los comentarios históricos MUST mostrarse con el nuevo nombre de usuario.
- **FR-054**: Un Admin NO MUST poder conceder el rol de Administrador a otros usuarios; esta capacidad no existe en el sistema.
- **FR-055**: Un Admin NO MUST poder inhabilitarse a sí mismo.
- **FR-056**: En V1, el campo `imageUrl` de una pieza es un campo de texto libre opcional; el sistema NO MUST proveer ningún mecanismo de carga, almacenamiento ni gestión de archivos de imagen.

### Security & Access Control Requirements

- **SEC-001 — Público** (no autenticado): puede leer piezas publicadas, categorías y comentarios de piezas publicadas. No puede realizar ninguna operación de escritura. No puede leer campos de administración de piezas. No puede acceder a piezas en Borrador.
- **SEC-002 — Visitante** (autenticado, rol básico): puede hacer todo lo que puede el Público, más: crear/editar/eliminar sus propios comentarios, crear/eliminar sus propios favoritos y entradas "En Colección". No puede escribir, editar ni eliminar piezas. No puede acceder a campos de administración. No puede gestionar usuarios ni piezas en Borrador.
- **SEC-003 — Admin** (autenticado, rol administrador): puede hacer todo lo que puede el Visitante, más: crear/editar/eliminar cualquier pieza (incluyendo Borradores), leer y editar los campos de administración, eliminar cualquier comentario, y gestionar cuentas de usuario (inhabilitar/habilitar, modificar nombre de usuario). No puede conceder el rol Admin a otros.
- **SEC-004**: Las reglas de seguridad del sistema de persistencia MUST garantizar: (a) los campos de administración de piezas no son legibles por Público ni Visitante; (b) ningún Público ni Visitante puede crear, editar ni eliminar piezas; (c) cada usuario solo puede modificar sus propios comentarios, favoritos y entradas "En Colección"; (d) las piezas en Borrador no son accesibles por Público ni Visitante; (e) ningún usuario puede autoasignarse el rol Admin.
- **SEC-005**: La inhabilitación de un usuario MUST hacerse efectiva a nivel del sistema de autenticación; una sesión activa de un usuario inhabilitado MUST ser rechazada sin esperar a su expiración natural.
- **SEC-006**: No MUST existir ninguna ruta de escalado de privilegios al rol Admin vía la interfaz de usuario ni por acceso directo al sistema de persistencia.

### Key Entities

- **Categoría**: nombre, tipo (interna / externa-Colnect), URL externa (solo si es externa), definición de campos específicos (para categorías internas).
- **Pieza**: identificador, categoría (obligatorio), título (obligatorio), descripción, tags (lista), año, país, tipo, `imageUrl`, estado de publicación (Borrador/Publicada), campos específicos (según categoría), campos de administración (Funcionando, Caja, Accesorios, Estado, Procedencia, Adquisición, Notas).
- **Comentario**: identificador, referencia a pieza, referencia a usuario (autor), texto, fecha de creación, fecha de última edición (si editado), indicador booleano "editado".
- **Favorito**: referencia a usuario, referencia a pieza (relación many-to-many entre usuarios y piezas).
- **EntradaEnColección**: referencia a usuario, referencia a pieza (relación many-to-many entre usuarios y piezas).
- **Usuario**: identificador del proveedor de autenticación, nombre de usuario (único, dato del dominio), rol (visitante / admin), estado (habilitado / inhabilitado), fecha de registro.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Un usuario Público puede navegar desde la home hasta la ficha de una pieza en no más de 3 interacciones.
- **SC-002**: Los resultados de búsqueda y filtrado aparecen en menos de 5 segundos bajo condiciones normales de uso.
- **SC-003**: El sistema soporta colecciones del orden de miles de piezas por categoría sin que los tiempos de respuesta superen el límite de SC-002.
- **SC-004**: El sistema soporta múltiples usuarios concurrentes sin degradación de rendimiento perceptible para ninguno de ellos.
- **SC-005**: Un nuevo usuario puede completar el flujo de registro completo (correo + contraseña + nombre de usuario) en menos de 2 minutos.
- **SC-006**: Un Admin puede crear una pieza con todos sus campos (comunes + específicos de categoría + administración) en menos de 5 minutos.
- **SC-007**: Las tres interacciones del Visitante (comentar, favorito, En Colección) están disponibles en la ficha de una pieza con una sola interacción cada una, sin salir de la ficha.
- **SC-008**: La interfaz es completamente funcional y usable en dispositivos móviles (pantallas desde 375px de ancho) y en escritorio (desde 1280px de ancho).
- **SC-009**: Ningún campo de administración de ninguna pieza es visible para Público o Visitante; esta invariante está verificada por tests de seguridad automáticos.
- **SC-010**: Un usuario inhabilitado por el Admin pierde el acceso en menos de 60 segundos tras la acción de inhabilitación.
- **SC-011**: El 100% de las reglas de control de acceso de SEC-001 a SEC-006 están cubiertas por tests automáticos ejecutados contra el entorno de pruebas.

## Assumptions

- Se asume que la autenticación de correo/contraseña es delegada a un proveedor externo de identidad; el sistema propio gestiona únicamente el nombre de usuario, el rol y el estado de habilitación.
- Se asume que los nombres de usuario son alfanuméricos (pueden incluir guiones y guiones bajos), tienen entre 3 y 30 caracteres y no contienen espacios. Si se requieren otras restricciones, deben especificarse antes de la implementación.
- Se asume que los tags son términos simples sin espacios internos, con un máximo de 20 tags por pieza.
- Se asume que los comentarios son texto plano (sin formato enriquecido) con un máximo de 1000 caracteres.
- Se asume que el tile de una categoría interna sin piezas publicadas aparece igualmente en la home (la categoría existe aunque esté vacía).
- Se asume que los comentarios tienen estructura plana (no hay hilos ni respuestas); se muestran en orden cronológico ascendente.
- Se asume que la redirección a categorías externas abre la URL en una nueva pestaña del navegador.
- Se asume que el orden por defecto del listado de piezas de una categoría es por fecha de creación descendente (más recientes primero), salvo que el usuario aplique ordenamiento explícito.
- Se asume que el Admin es la única cuenta con rol administrador y que dicha cuenta existe de forma pre-establecida (no se crea desde la interfaz pública).
- **Decisión (Q2)**: La eliminación de una pieza es un borrado en cascada con confirmación informada: el sistema muestra al Admin el conteo de dependencias (comentarios, favoritos, entradas "En Colección") antes de proceder, y solo actúa tras confirmación explícita.
- **Decisión (Q3)**: En V1, el Visitante NO puede cambiar su propio nombre de usuario desde su perfil. La vista de perfil del Visitante muestra su nombre de usuario como campo de solo lectura. Solo el Admin puede modificar el nombre de usuario de cualquier cuenta.
- Se asume que el campo `tipo` de una pieza (Papelería/Objeto/etc.) es una lista de valores cerrada cuya gestión queda fuera del scope de V1; los valores iniciales son definidos durante la configuración del sistema.
- V1 no incluye notificaciones (por correo ni dentro de la aplicación) para ningún evento.
- V1 no incluye la posibilidad de que el Visitante cambie su propio correo, contraseña ni nombre de usuario desde la interfaz del sistema.
- V1 no incluye la capacidad de eliminar cuentas de usuario (ni por el propio usuario ni por el Admin).
