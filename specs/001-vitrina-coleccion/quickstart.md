# Quickstart: Guía de Validación — nicollection V1

**Feature**: `specs/001-vitrina-coleccion/` | **Date**: 2026-07-07
**Prerequisito**: `research.md`, `data-model.md` y `contracts/firebase-schema.yaml` completos.

Esta guía describe los escenarios de validación de extremo a extremo que deben ejecutarse
para confirmar que la implementación cumple la especificación. No contiene código;
describe qué ejecutar y qué observar.

---

## 0. Preparación del entorno

### 0.1 Iniciar Firebase Emulator Suite

Antes de cualquier prueba, los siguientes emuladores deben estar corriendo:

| Emulador | Puerto por defecto | Propósito |
|----------|--------------------|-----------|
| Firestore | 8080 | Persistencia y Security Rules |
| Auth | 9099 | Autenticación de usuarios |
| Emulator UI | 4000 | Panel de administración de emuladores |

Verificar que `firebase.json` incluya configuración de emuladores para `firestore` y `auth`.

### 0.2 Cargar datos de semilla (seed)

Para los escenarios manuales, cargar en el emulador:
- Al menos 4 categorías internas (Aerolíneas, Celulares, Hotel, Tecnología Antigua).
- Al menos 1 categoría externa con `externalUrl` definida.
- Al menos 5 piezas en estado `published` distribuidas en diferentes categorías.
- Al menos 1 pieza en estado `draft`.
- 1 cuenta de Admin pre-existente en `/users/` con `role: 'admin'`.
- 1 cuenta de Visitante habilitada.

### 0.3 Ejecutar suite de tests automatizados

```
Tests de Security Rules:  tests/security/
Tests unitarios dominio:  tests/unit/
Runner:                   Vitest
Entorno:                  Firebase Emulator Suite (Firestore + Auth)
```

Todos los tests en `tests/security/` y `tests/unit/` deben pasar al 100% antes de
considerar cualquier historia de usuario como completada.

---

## 1. Validación por Historia de Usuario

### US1 — Explorar el catálogo de categorías

**Escenario**: Usuario Público (no autenticado) abre la home.

Verificar:
- [ ] Se muestran tiles para todas las categorías cargadas (internas + externas).
- [ ] Las categorías externas tienen un indicador visual diferente (ej. ícono o etiqueta).
- [ ] Si no hay categorías, se muestra el mensaje de estado vacío.
- [ ] El tiempo de carga de la home es < 5 segundos con emulador local.

**Test automatizado de Security Rules (obligatorio)**:
- Un lector anónimo puede hacer `get` en `/categories/{id}`: debe permitirse.
- Un lector anónimo puede hacer `list` en `/categories/`: debe permitirse.
- Un lector anónimo NO puede hacer `create/update/delete` en `/categories/`: debe rechazarse.
- Un Visitante NO puede crear categorías: debe rechazarse.
- Un Admin puede crear/actualizar categorías: debe permitirse.

---

### US2 — Navegar y filtrar piezas de una categoría interna

**Escenario**: Usuario Público navega al listado de Aerolíneas.

Verificar:
- [ ] Solo piezas con `status: 'published'` aparecen en el listado.
- [ ] El listado carga en lotes de ≤ 20 piezas; hay opción de cargar más.
- [ ] Al aplicar filtro por año, solo aparecen piezas de ese año.
- [ ] Al aplicar búsqueda "tarjeta", solo aparecen piezas cuyo `searchTokens` contiene "tarjeta".
- [ ] Con múltiples filtros activos, se aplica AND lógico.
- [ ] "Limpiar filtros" restablece el listado completo paginado con una acción.
- [ ] Al llegar al último ítem, se muestra indicador de fin de lista (no error).

**Test automatizado de Security Rules**:
- Un lector anónimo puede leer una pieza con `status: 'published'`: debe permitirse.
- Un lector anónimo NO puede leer una pieza con `status: 'draft'`: debe rechazarse.
- Un Visitante NO puede leer una pieza con `status: 'draft'`: debe rechazarse.
- Un Admin puede leer una pieza con `status: 'draft'`: debe permitirse.

**Test unitario de dominio**:
- `Piece.isPublished()` retorna `true` solo cuando `status === 'published'`.
- `Piece.isDraft()` retorna `true` solo cuando `status === 'draft'`.
- `Piece.validate()` falla si `title` está vacío.
- `Piece.validate()` falla si `categoryId` referencia una categoría externa.

---

### US3 — Ver el detalle de una pieza

**Escenario**: Usuario Público navega a la ficha de una pieza publicada.

Verificar:
- [ ] Se muestran todos los campos públicos: título, descripción, tags, año, país, tipo, campos específicos, `imageUrl` (si tiene valor).
- [ ] Los comentarios se muestran en orden cronológico ascendente con nombre de usuario y fecha.
- [ ] Los campos de administración NO aparecen en ningún lugar de la vista.
- [ ] Acceder por URL directa a una pieza en `draft` muestra "pieza no encontrada".
- [ ] La sección de comentarios muestra aviso de "iniciar sesión" para Público.

**Test automatizado de Security Rules**:
- Un lector anónimo NO puede leer `/pieces/{id}/private/adminData`: debe rechazarse.
- Un Visitante NO puede leer `/pieces/{id}/private/adminData`: debe rechazarse.
- Un Admin puede leer `/pieces/{id}/private/adminData`: debe permitirse.

---

### US4 — Acceder a una categoría externa

**Escenario**: Usuario hace clic en categoría externa.

Verificar:
- [ ] El navegador abre la `externalUrl` en una nueva pestaña.
- [ ] No se muestra ningún listado interno de piezas.
- [ ] No existe ninguna ruta en la aplicación que muestre piezas de una categoría externa.

**Test unitario de dominio**:
- `Category.isExternal()` retorna `true` para categorías de tipo `'external'`.
- `Category.isInternal()` retorna `false` para las mismas.

---

### US5 — Registro e inicio de sesión

**Escenario**: Nuevo usuario se registra.

Verificar:
- [ ] Con correo único, contraseña válida y username disponible: cuenta creada, usuario autenticado como Visitante.
- [ ] Con username ya en uso: error descriptivo, cuenta no creada, `/usernames/` no modificado.
- [ ] Con correo ya registrado: error descriptivo.
- [ ] Con usuario inhabilitado: inicio de sesión rechazado con mensaje de cuenta inactiva.
- [ ] Cierre de sesión: usuario vuelve a estado Público, no puede realizar acciones de Visitante.

**Test automatizado de Security Rules**:
- Un usuario autenticado puede crear `/usernames/{username}` con su propio `uid`: debe permitirse.
- Un usuario autenticado NO puede crear `/usernames/{username}` con un `uid` ajeno: debe rechazarse.
- Un usuario NO puede actualizar un documento `/usernames/`: debe rechazarse.
- Un usuario puede crear su propio documento en `/users/{uid}` con `role: 'visitor'`: debe permitirse.
- Un usuario NO puede crear `/users/{uid}` con `role: 'admin'`: debe rechazarse.

**Test unitario de dominio**:
- `Username.validate("ab")` falla (menos de 3 caracteres).
- `Username.validate("nick user")` falla (contiene espacio).
- `Username.validate("nick_user-123")` pasa.
- `Username.validate("a".repeat(31))` falla (más de 30 caracteres).

---

### US6 — Interacciones del Visitante

**Escenario**: Visitante autenticado interactúa con una pieza publicada.

Verificar:
- [ ] Publicar comentario no vacío: aparece en la ficha con nombre de usuario y fecha.
- [ ] Publicar comentario vacío: error; comentario no creado.
- [ ] Editar comentario propio: texto actualizado; indicador "editado" visible con fecha.
- [ ] Eliminar comentario propio tras confirmación: comentario desaparece de la ficha.
- [ ] Marcar favorito: pieza aparece en "Mis Favoritos" del perfil.
- [ ] Marcar favorito dos veces: no crea duplicado.
- [ ] Desmarcar favorito: pieza desaparece de "Mis Favoritos".
- [ ] Marcar "En Colección": pieza aparece en "Mi Colección" del perfil.
- [ ] Pieza despublicada: desaparece de "Mis Favoritos" y "Mi Colección" sin error.

**Test automatizado de Security Rules**:
- Un Visitante habilitado puede crear `/comments/{id}` con su propio `authorId`: debe permitirse.
- Un Visitante habilitado NO puede crear `/comments/{id}` con un `authorId` ajeno: debe rechazarse.
- Un Visitante habilitado puede eliminar su propio comentario: debe permitirse.
- Un Visitante habilitado NO puede eliminar el comentario de otro usuario: debe rechazarse.
- Un Visitante puede crear `/users/{uid}/favorites/{pieceId}` para su propio `uid`: debe permitirse.
- Un Visitante NO puede crear favoritos para otro `uid`: debe rechazarse.

**Test unitario de dominio**:
- `Comment.canBeEditedBy(authorId)` retorna `true` solo para el autor.
- `Comment.canBeDeletedBy(otherUserId, 'visitor')` retorna `false`.
- `Comment.canBeDeletedBy(otherUserId, 'admin')` retorna `true`.
- `Comment.editText("")` lanza error (texto vacío).
- `Comment.editText("x".repeat(1001))` lanza error (> 1000 chars).

---

### US7 — Gestionar piezas como Admin

**Escenario**: Admin crea, edita y elimina piezas.

Verificar:
- [ ] Al seleccionar categoría en el formulario de alta, se muestran solo los campos específicos de esa categoría.
- [ ] Guardar pieza sin título: error descriptivo, pieza no creada.
- [ ] Guardar pieza con título y categoría: creada en estado `published`; visible en catálogo inmediatamente.
- [ ] Cambiar a `draft`: pieza desaparece del catálogo público.
- [ ] Cambiar a `published`: pieza vuelve al catálogo público.
- [ ] Admin puede ver piezas en `draft` en el panel de gestión.
- [ ] Al intentar eliminar pieza con dependencias: pantalla de confirmación muestra conteos exactos.
- [ ] Tras confirmar: pieza eliminada + comentarios, favoritos y entradas "En Colección" eliminados en cascada.
- [ ] Los campos de administración son editables desde el panel Admin.
- [ ] No se puede crear una pieza en una categoría de tipo externo.

**Test automatizado de Security Rules**:
- Un Visitante NO puede crear una pieza: debe rechazarse.
- Un Visitante NO puede actualizar una pieza: debe rechazarse.
- Un Visitante NO puede eliminar una pieza: debe rechazarse.
- Un Admin habilitado puede crear, actualizar y eliminar piezas: debe permitirse.
- Un Admin puede leer y escribir `/pieces/{id}/private/adminData`: debe permitirse.

**Test unitario de dominio**:
- `Piece.validate()` pasa con título y categoryId de categoría interna.
- `Piece.validate()` falla si categoryId referencia una categoría externa.
- `Piece.publish()` cambia `status` a `'published'`.
- `Piece.draft()` cambia `status` a `'draft'`.

---

### US8 — Gestionar usuarios como Admin

**Escenario**: Admin gestiona cuentas de Visitantes.

Verificar:
- [ ] Admin puede ver lista de usuarios con username, estado y fecha de registro.
- [ ] Admin inhabilita Visitante: Visitante pierde acceso en < 60 segundos (validar con real-time listener).
- [ ] Admin habilita Visitante: acceso restaurado.
- [ ] Admin cambia username de Visitante: comentarios históricos muestran nuevo username.
- [ ] Admin asigna username ya en uso: error descriptivo; cambio no aplicado.
- [ ] La opción de conceder rol Admin no existe en la interfaz.
- [ ] Admin intenta inhabilitarse a sí mismo: rechazado con error descriptivo.

**Test automatizado de Security Rules**:
- Un Admin habilitado puede actualizar `/users/{uid}` de otro usuario: debe permitirse.
- Un Visitante NO puede actualizar `/users/{uid}` de otro usuario: debe rechazarse.
- Un Admin NO puede crear un usuario con `role: 'admin'` desde la interfaz:
  debe rechazarse por la regla que no permite asignación de rol admin vía UI.
- Nadie puede eliminar un documento en `/users/`: debe rechazarse.
- Un Admin NO puede establecer `enabled: false` en su propio documento: debe rechazarse.

**Test unitario de dominio**:
- `User.canBeDisabledBy(adminId)` retorna `false` cuando el Admin intenta inhabilitarse a sí mismo.
- `User.canBeDisabledBy(differentAdminId)` retorna `true`.

---

## 2. Validación de Requisitos No Funcionales

| RNF | Cómo validar |
|-----|--------------|
| RNF-001 (< 5 s) | Con emulador local y dataset de prueba de 500+ piezas, verificar tiempo de respuesta de búsqueda |
| RNF-004 (responsive) | Abrir la app en viewport 375px y 1280px; verificar que todos los flujos principales son operables |
| RNF-005 (100% security tests) | Ejecutar `tests/security/` y verificar que todos los casos de las 3 tablas de acceso están cubiertos |
| RNF-006 (< 60 s inhabilitación) | Inhabilitár usuario desde Admin; medir tiempo hasta que el Visitante es desconectado por el listener |
| RNF-007 (sin carga masiva) | Verificar en DevTools Network que ninguna consulta a Firestore retorna más de 20 documentos |
| RNF-008 (domain + rules sincronizados) | Revisar que cada regla de `tests/unit/` tiene su contraparte en `tests/security/` |

---

## 3. Criterio de "Done" para V1

La feature se considera completa cuando:

- [ ] Todos los tests de `tests/security/` pasan al 100% contra el emulador.
- [ ] Todos los tests de `tests/unit/` pasan al 100%.
- [ ] Los 8 escenarios de validación manual de las US están verificados.
- [ ] Los 10 RNF han sido validados (todos deben pasar).
- [ ] `firestore.rules` y los cambios de dominio correspondientes están en el mismo commit.
- [ ] `firestore.indexes.json` declara los 9 índices de `data-model.md §4`.
- [ ] El build de Vite produce un bundle desplegable en Firebase Hosting sin errores de TypeScript.
