# Tasks: nicollection V1 — Vitrina de Colección Personal

**Input**: `specs/001-vitrina-coleccion/` — spec.md · plan.md · data-model.md · contracts/firebase-schema.yaml · quickstart.md · research.md

**Prerequisites**: spec.md ✅ | plan.md ✅ | data-model.md ✅ | contracts/firebase-schema.yaml ✅ | quickstart.md ✅

**Creado**: 2026-07-07

---

## Convenciones

- **[P]** — tarea paralelizable dentro de la misma fase (sin dependencias de otras [P] del mismo nivel)
- **→ Tnn** — depende de la tarea indicada
- **[US-n]** — trazabilidad a Historia de Usuario
- **[FR-nnn]** / **[SEC-nnn]** — trazabilidad a Requisito Funcional o de Seguridad
- **🔴 OBLIGATORIO** — test que debe escribirse y fallar ANTES de la implementación correspondiente (Constitución VI)
- **🔒 SINCRONIZAR** — cambio en dominio y en `firestore.rules` en el mismo commit (Constitución X)

## Regla TDD no negociable

> **Constitución VI**: Toda regla de negocio importante DEBE tener tests antes de ser implementada.
> Ciclo obligatorio: **test escrito → test falla (rojo) → implementación → test pasa (verde)**.
> Ninguna entidad de dominio ni regla de Firestore se considera implementada sin su test pasando.

---

## Phase 1: Setup del Proyecto

**Objetivo**: Repositorio inicializado, tooling configurado, emuladores corriendo.
**⚠️ BLOQUEANTE**: Ninguna otra fase puede comenzar sin completar esta.

- [x] T001 Inicializar proyecto Vite + React + TypeScript: genera `package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `index.html`
- [x] T002 [P] → T001 | Configurar `tsconfig.json`: `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`; path aliases `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@ui/*` en `vite.config.ts` y `tsconfig.json`
- [x] T003 [P] → T001 | Instalar dependencias de producción: `firebase` (SDK v9 modular), `react-router-dom`
- [x] T004 [P] → T001 | Instalar dependencias de desarrollo y testing: `vitest`, `@vitest/ui`, `@firebase/rules-unit-testing`, `@testing-library/react`, `@testing-library/user-event`; crear `vitest.config.ts` apuntando al emulador
- [x] T005 [P] → T001 | Crear estructura de directorios completa según plan.md: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/`, `src/ui/`, `tests/security/`, `tests/unit/`, `tests/integration/`, `tests/fixtures/`
- [x] T006 [P] → T001 | Configurar proyecto Firebase: `firebase.json` (Firestore + Auth + Hosting + Emulators), `.firebaserc`; puertos: Firestore 8080, Auth 9099, Emulator UI 4000
- [x] T007 [P] → T001 | Configurar linting: `eslint.config.js` con reglas TypeScript (`@typescript-eslint/recommended`); configurar Prettier en `prettier.config.js`

**Checkpoint Phase 1**: `vite build` sin errores; `vitest` arranca (0 tests); `firebase emulators:start` inicia sin conflictos de puertos.

---

## Phase 2: Dominio y Reglas de Negocio

**Objetivo**: Modelado OO del dominio. Orden mandatorio: enums/interfaces → tests → entidades.
**Prerequisito**: Phase 1 completada.

### 2A — Enumeraciones, interfaces y Value Objects simples (sin lógica compleja)

*No requieren TDD previo porque no contienen reglas de negocio ejecutables; son definiciones de tipos.*

- [ ] T008 [P] → T001-T007 | Crear enumeraciones de dominio en `src/domain/`: `piece/PublicationStatus.ts` (`'published' | 'draft'`), `category/CategoryType.ts` (`'internal' | 'external'`), `user/Role.ts` (`'visitor' | 'admin'`), `piece/FunctioningStatus.ts` (`'yes' | 'no' | 'na'`), `piece/Condition.ts` (`'perfect' | 'excellent' | 'good' | 'acceptable' | 'poor' | 'very_poor'`) [FR-020, FR-025]
- [ ] T009 [P] → T008 | Crear `src/domain/category/FieldDefinition.ts` (Value Object): interfaz `{ key, label, fieldType: 'string'|'number'|'date', required }` [FR-006, FR-026]
- [ ] T010 [P] → T008 | Definir interfaces de repositorio: `src/domain/piece/IPieceRepository.ts`, `src/domain/category/ICategoryRepository.ts`, `src/domain/comment/ICommentRepository.ts`, `src/domain/user/IUserRepository.ts`, `src/domain/interaction/IInteractionRepository.ts` [Constitución III]
- [ ] T011 [P] → T008 | Crear `src/domain/interaction/Favorite.ts` y `src/domain/interaction/CollectionEntry.ts` (Value Objects): `{ userId, pieceId, createdAt }` con constructor; sin lógica de negocio compleja [FR-046, FR-047]

### 2B — 🔴 Tests unitarios de dominio — ESCRIBIR Y VERIFICAR QUE FALLAN PRIMERO

- [ ] T012 → T008 | 🔴 `tests/unit/Username.test.ts`: valida mínimo 3 chars; valida máximo 30 chars; rechaza espacios; rechaza caracteres especiales fuera de `[a-zA-Z0-9_-]`; acepta username válido `"nick_user-01"`; rechaza string vacío [US5, FR-034/035]
- [ ] T013 [P] → T009 | 🔴 `tests/unit/Category.test.ts`: `isInternal()` retorna true para `type:'internal'`; `isExternal()` retorna true para `type:'external'`; categoría externa tiene `fieldSchema` vacío; `getFieldSchema()` retorna definiciones correctas; invariante: external requiere `externalUrl` [US1, US4, FR-006]
- [ ] T014 [P] → T008-T009 | 🔴 `tests/unit/Piece.test.ts`: `validate()` falla con `title` vacío; `validate()` falla con `title` de solo espacios; `validate()` falla si categoría es `type:'external'`; `publish()` establece `status:'published'`; `draft()` establece `status:'draft'`; `generateSearchTokens("Tarjeta AA", "desc", ["tag1"])` retorna `["tarjeta", "aa", "desc", "tag1"]` en minúsculas sin duplicados [US7, FR-019/020]
- [ ] T015 [P] → T008 | 🔴 `tests/unit/Comment.test.ts`: `editText("")` lanza error; `editText("x".repeat(1001))` lanza error; `editText("válido")` actualiza `text` y `edited:true`; `canBeEditedBy(authorId, 'visitor')` retorna true; `canBeEditedBy(otherId, 'visitor')` retorna false; `canBeDeletedBy(otherId, 'admin')` retorna true; `canBeDeletedBy(otherId, 'visitor')` retorna false; nuevo comentario crea con `edited:false` [US6, FR-040/041/044]
- [ ] T016 [P] → T008 | 🔴 `tests/unit/User.test.ts`: `canBeDisabledBy(sameUid)` retorna false (Admin no puede inhabilitarse a sí mismo); `canBeDisabledBy(differentUid)` retorna true; `disable()` establece `enabled:false`; `enable()` establece `enabled:true`; rol no puede ser asignado como `'admin'` en constructor de usuario normal [US8, FR-051/055, SEC-006]
- [ ] T017 [P] → T008 | 🔴 `tests/unit/AdminData.test.ts`: constructor acepta solo valores de enums válidos para `functioning`, `hasBox`, `condition`; rechaza valores no definidos en cada enum [FR-025]

### 2C — Implementación de entidades (tras confirmar que todos los tests de 2B fallan)

- [ ] T018 → T012 | 🔒 Implementar `src/domain/user/Username.ts` (Value Object): constructor privado; factory estático `Username.create(value)` que valida reglas (longitud 3-30, regex `[a-zA-Z0-9_-]`); lanza `DomainError` en caso de fallo; expone `value: string` de solo lectura [FR-034/035]
- [ ] T019 [P] → T013 | Implementar `src/domain/category/Category.ts` (Entity): constructor; `isInternal()`, `isExternal()`, `getFieldSchema()`; invariante en constructor: si `external` entonces `externalUrl` obligatorio [US1, US4, FR-006]
- [ ] T020 [P] → T014 | Implementar `src/domain/piece/Piece.ts` (Aggregate Root): `validate()` — valida `title` y que `categoryId` no sea de categoría externa; `publish()` / `draft()` — transiciones de estado; `generateSearchTokens(title, description, tags)` — normaliza a minúsculas, split por espacios y signos de puntuación, deduplica [FR-019/020, research.md D-001]
- [ ] T021 [P] → T015 | Implementar `src/domain/comment/Comment.ts` (Entity): `editText(text: string)` — valida longitud y actualiza `edited`/`editedAt`; `canBeEditedBy(userId, role)` — solo autor; `canBeDeletedBy(userId, role)` — autor o admin [US6, FR-041/044]
- [ ] T022 [P] → T016 | Implementar `src/domain/user/User.ts` (Entity): `enable()`, `disable()`, `canBeDisabledBy(requestingAdminUid)`; `changeUsername(newUsername: Username)`; invariante anti-self-disable [US8, FR-051/055]
- [ ] T023 [P] → T017 | Implementar `src/domain/piece/AdminData.ts` (Value Object): campos con tipos correctos usando las enumeraciones de T008; fábrica `AdminData.create(data)` con validación de enums [FR-025]
- [ ] T024 [P] → T008 | Implementar `src/domain/errors/DomainError.ts`: clase base de error de dominio tipada, usada por todas las entidades para comunicar invariantes violadas [Constitución II]

**Checkpoint Phase 2**: `vitest run tests/unit/` — **100% tests verdes**. Ninguna entidad de dominio puede considerarse implementada hasta este punto.

---

## Phase 3: Seguridad y Autorización

**Objetivo**: `firestore.rules` que espeje el dominio (Constitución X). Ciclo TDD idéntico al dominio.
**Prerequisito**: Phase 1 completada. Puede correr en paralelo con Phase 2.

### 3A — 🔴 Tests de Security Rules — ESCRIBIR Y VERIFICAR QUE FALLAN PRIMERO

- [ ] T025 → T004, T006 | 🔴 `tests/security/categories.rules.test.ts`: Público (no autenticado) puede leer; Visitante habilitado puede leer; Admin habilitado puede leer; Público (no autenticado) NO puede crear/actualizar/eliminar; Visitante NO puede crear/actualizar/eliminar; Admin habilitado SÍ puede crear y actualizar [SEC-001, SEC-003]
- [ ] T026 [P] → T004, T006 | 🔴 `tests/security/pieces.rules.test.ts`: Público (no autenticado) puede leer pieza `published`; Público NO puede leer pieza `draft`; Visitante NO puede leer pieza `draft`; Admin puede leer pieza `draft`; Público/Visitante NO pueden crear piezas; Admin habilitado puede crear pieza; Admin puede leer `/pieces/{id}/private/adminData`; Público NO puede leer `/pieces/{id}/private/adminData`; Visitante NO puede leer `/pieces/{id}/private/adminData` [SEC-001 a SEC-004]
- [ ] T027 [P] → T004, T006 | 🔴 `tests/security/users.rules.test.ts`: usuario puede leer su propio `/users/{uid}`; Admin puede leer cualquier `/users/{uid}`; Visitante NO puede leer doc ajeno; usuario NO puede actualizar su propio `role` a `'admin'`; Admin puede actualizar doc de otro usuario; Admin NO puede establecer `enabled:false` en su propio doc; nadie puede eliminar un documento en `/users/` [SEC-004(e), SEC-006, FR-055]
- [ ] T028 [P] → T004, T006 | 🔴 `tests/security/usernames.rules.test.ts`: Público (no autenticado) puede leer `/usernames/{username}`; Visitante puede leer; usuario autenticado puede crear documento con su propio uid; usuario autenticado NO puede crear documento con uid ajeno; nadie puede hacer update; Admin habilitado puede eliminar [FR-035, SEC-004(e)]
- [ ] T029 [P] → T004, T006 | 🔴 `tests/security/comments.rules.test.ts`: Público (no autenticado) puede leer; Visitante habilitado puede crear con su propio `authorId`; Visitante NO puede crear con `authorId` ajeno; texto vacío es rechazado; texto >1000 chars rechazado; autor habilitado puede actualizar su propio comentario; Visitante NO puede actualizar comentario ajeno; Admin puede eliminar cualquier comentario; autor puede eliminar el propio [SEC-002, SEC-004(c), FR-044] — *nota: la validación de que la pieza target tiene `status:'published'` es responsabilidad de `AddCommentUseCase` (T057), no de Security Rules*
- [ ] T030 [P] → T004, T006 | 🔴 `tests/security/interactions.rules.test.ts`: Visitante habilitado puede crear/leer/eliminar en su propia subcollección `/favorites/` y `/collection/`; usuario NO puede leer/crear/eliminar en subcollección ajena; nadie puede hacer update en estos documentos [SEC-002, SEC-004(c), FR-046/047]

### 3B — 🔒 Implementación de `firestore.rules` (tras confirmar que tests de 3A fallan)

- [ ] T031 → T025-T030 | 🔒 Implementar funciones auxiliares en `firestore.rules`: `isAuthenticated()`, `userDoc()`, `isAdmin()`, `isEnabledUser()`, `isEnabledAdmin()`, `isEnabledVisitorOrAdmin()`; estas funciones usan `get()` sobre `/users/{uid}` — el mismo commit debe incluir la estructura base de `/users/` [data-model.md §5]
- [ ] T032 [P] → T031, T025 | 🔒 Implementar reglas `/categories/{categoryId}` en `firestore.rules`: `read: true`; `write: isEnabledAdmin()`. Commit sincronizado con `Category.ts` [SEC-001, SEC-003]
- [ ] T033 [P] → T031, T026 | 🔒 Implementar reglas `/pieces/{pieceId}` en `firestore.rules`: `read`: si `status == 'published'` permite todos; si `draft` solo Admin; `create/update/delete`: solo `isEnabledAdmin()` con validaciones: `title` no vacío, `status` en enum válido. Commit sincronizado con `Piece.ts` [SEC-001 a SEC-004]
- [ ] T034 [P] → T031, T026 | 🔒 Implementar reglas `/pieces/{pieceId}/private/{doc}` en `firestore.rules`: `read` y `write`: solo `isEnabledAdmin()`. Commit sincronizado con `AdminData.ts` [SEC-004(a)]
- [ ] T035 [P] → T031, T027 | 🔒 Implementar reglas `/users/{uid}` en `firestore.rules`: `read`: owner o Admin; `create`: solo owner, con `role == 'visitor'` y `enabled == true`; `update`: solo `isEnabledAdmin()`, con restricción `!(resource.data.uid == request.auth.uid && request.resource.data.enabled == false)`; `delete`: nadie. Commit sincronizado con `User.ts` [SEC-004(e), SEC-006]
- [ ] T036 [P] → T031, T028 | 🔒 Implementar reglas `/usernames/{username}` en `firestore.rules`: `read`: todos; `create`: autenticado con `request.resource.data.uid == request.auth.uid`; `update`: nadie; `delete`: `isEnabledAdmin()` [FR-035]
- [ ] T037 [P] → T031, T029 | 🔒 Implementar reglas `/comments/{commentId}` en `firestore.rules`: `read`: todos; `create`: `isEnabledVisitorOrAdmin()` + `authorId == request.auth.uid` + `text.size() >= 1` + `text.size() <= 1000` + `edited == false`; `update`: autor habilitado (solo campos `text`, `edited`, `editedAt`) o Admin; `delete`: autor habilitado o Admin. Commit sincronizado con `Comment.ts` [SEC-002, SEC-004(c)]
- [ ] T038 [P] → T031, T030 | 🔒 Implementar reglas `/users/{uid}/favorites/{pieceId}` y `/users/{uid}/collection/{pieceId}` en `firestore.rules`: `read/create/delete`: `isEnabledVisitorOrAdmin() && uid == request.auth.uid`; `update`: nadie. Commit sincronizado con `Favorite.ts`/`CollectionEntry.ts` [SEC-002, SEC-004(c)]

**Checkpoint Phase 3**: `vitest run tests/security/` — **100% tests verdes**. Verificar que los tests cubren todos los roles definidos en SEC-001 a SEC-006.

---

## Phase 4: Persistencia Firestore

**Objetivo**: Repositorios concretos que adaptan el SDK de Firebase al dominio.
**Prerequisito**: Phase 2 completada (interfaces en T010). Phase 3 puede correr en paralelo.

- [ ] T039 → T001-T007 | Implementar `src/infrastructure/firebase/firebaseConfig.ts`: inicialización del SDK de Firebase v9 modular; exporta `app`, `auth`, `db`; usa variables de entorno `import.meta.env.VITE_*`; en modo emulador conecta con `connectFirestoreEmulator` y `connectAuthEmulator` [FR-034/037]
- [ ] T040 [P] → T006 | Declarar los 9 índices compuestos en `firestore.indexes.json`: I-001 a I-009 según `data-model.md §4`; sin este archivo las consultas con múltiples `where` fallan en producción [FR-007/010/011, RNF-007]
- [ ] T041 [P] → T010, T039 | Implementar `src/infrastructure/repositories/FirestoreCategoryRepository.ts`: `findAll()` con `getDocs`; implementa `ICategoryRepository`; mapea documentos Firestore a entidades `Category` [US1, FR-001]
- [ ] T042 [P] → T010, T039, T040 | Implementar `src/infrastructure/repositories/FirestorePieceRepository.ts`: `findByCategory(categoryId, filters, cursor, pageSize)` con `startAfter(cursor)` y `limit(pageSize)` — **nunca sin `limit()`**; `findById(id, role)` — incluye validación de draft; `create()`, `update()`, `delete()`; `countDependencies(pieceId)` para preview de delete; mapea a/desde entidades `Piece` + `AdminData` en subcollección separada [US2/3/7, FR-007/018/031, research.md D-007]
- [ ] T043 [P] → T010, T039, T040 | Implementar `src/infrastructure/repositories/FirestoreCommentRepository.ts`: `findByPiece(pieceId, cursor)` con `orderBy('createdAt', 'asc')` + `limit(20)`; `findByAuthor(authorId, cursor)` para perfil; `create()`, `update()`, `delete()`; `deleteAllByPiece(pieceId)` para cascade (batches de ≤500) [US3/6, FR-040/041/042, research.md D-006]
- [ ] T044 [P] → T010, T039 | Implementar `src/infrastructure/repositories/FirestoreUserRepository.ts`: `findAll()` para panel Admin; `findByUid(uid)`; `update(uid, data)`; `listenToUser(uid, callback)` retorna `unsubscribe` — usado para detección de inhabilitación en tiempo real [US5/8, FR-034/039/050, research.md D-004]
- [ ] T045 [P] → T010, T039 | Implementar `src/infrastructure/repositories/FirestoreInteractionRepository.ts`: `toggleFavorite(userId, pieceId)`; `isFavorite(userId, pieceId)`; `listFavorites(userId, cursor)` paginado; `deleteAllFavoritesByPiece(pieceId)` para cascade; análogos para collection; document ID = pieceId para garantizar idempotencia [US6, FR-046/047, research.md D-008]

**Checkpoint Phase 4**: Repositorios compilan sin errores TypeScript; conectan correctamente al emulador con datos de semilla.

---

## Phase 5: Casos de Uso de Aplicación

**Objetivo**: Capa de orquestación entre dominio y repositorios.
**Prerequisito**: Phase 2 (T018-T024) y Phase 4 (T041-T045) completadas.

### 5A — Lectura y navegación [US1, US2, US3, US4]

- [ ] T046 [P] → T019, T041 | Implementar `src/application/categories/ListCategoriesUseCase.ts`: obtiene todas las categorías, retorna separadas en `internal[]` y `external[]` [US1, US4, FR-001/003/005]
- [ ] T047 [P] → T020, T042 | Implementar `src/application/pieces/ListPiecesUseCase.ts`: acepta `categoryId`, `filters` (year, country, pieceType, specificFields), `cursor`, `role`; construye la query Firestore con los filtros aplicados; retorna `{ items: PieceSummary[], nextCursor }` [US2, FR-007/010/011/012]
- [ ] T048 [P] → T020, T042 | Implementar `src/application/pieces/SearchPiecesUseCase.ts`: acepta `categoryId`, `searchQuery`, `cursor`, `role`; normaliza query a minúsculas; usa `array-contains` sobre `searchTokens`; retorna paginado [US2, FR-008/009, research.md D-001]
- [ ] T049 [P] → T020, T023, T042 | Implementar `src/application/pieces/GetPieceDetailUseCase.ts`: obtiene pieza por id; si `draft` y solicitante no es Admin retorna `null`; carga `adminData` desde subcollección solo si rol es Admin [US3, FR-015/017/018]

### 5B — Autenticación y usuarios [US5, US8]

- [ ] T050 → T018, T022, T044 | Implementar `src/application/users/RegisterUseCase.ts`: valida `Username.create(username)`; ejecuta transacción Firestore: (1) crea `/usernames/{username}` — falla si ya existe; (2) crea `/users/{uid}` con `role:'visitor'`, `enabled:true`; maneja `FirebaseError` de Auth para email duplicado [US5, FR-034/035/036, research.md D-005]
- [ ] T051 [P] → T022, T044 | Implementar `src/application/users/DisableUserUseCase.ts`: invoca `User.canBeDisabledBy(requestingAdminUid)`; si falla lanza `DomainError`; actualiza `enabled:false` en `/users/{uid}` [US8, FR-051/055, SEC-005]
- [ ] T052 [P] → T022, T044 | Implementar `src/application/users/EnableUserUseCase.ts`: actualiza `enabled:true` en `/users/{uid}` [US8, FR-051]
- [ ] T053 [P] → T018, T022, T043, T044 | Implementar `src/application/users/ChangeUsernameUseCase.ts`: valida nuevo username; transacción: elimina `/usernames/{old}`, crea `/usernames/{new}`, actualiza `/users/{uid}.username`; batch update de `authorUsername` en todos los comentarios del usuario (múltiples batches si >500) [US8, FR-052/053, research.md D-006]
- [ ] T105 [P] → T022, T044 | Implementar `src/application/users/ListUsersUseCase.ts`: obtiene todos los usuarios vía `FirestoreUserRepository.findAll()`; retorna lista ordenada por `createdAt` desc con username, role, enabled, createdAt; no requiere paginación en V1 (colección de usuarios acotada) [US8, FR-050]

### 5C — Gestión de piezas Admin [US7]

- [ ] T054 → T020, T023, T041, T042 | Implementar `src/application/pieces/CreatePieceUseCase.ts`: instancia `Piece`, ejecuta `validate()`, genera `searchTokens` via `piece.generateSearchTokens()`, persiste en `/pieces/`; persiste `AdminData` en `/pieces/{id}/private/adminData` en batch [US7, FR-027/028]
- [ ] T055 [P] → T020, T023, T042 | Implementar `src/application/pieces/UpdatePieceUseCase.ts`: carga pieza existente, aplica cambios, regenera `searchTokens` si cambiaron campos de texto, persiste; actualiza `adminData` si se proveen campos admin [US7, FR-029]
- [ ] T056 [P] → T020, T042, T043, T045 | Implementar `src/application/pieces/DeletePieceUseCase.ts`: fase 1 (`preview`): cuenta comentarios, favoritos, entradas colección — retorna `{ commentCount, favoriteCount, collectionCount }`; fase 2 (`execute`): borrado en cascada vía batches: elimina `/pieces/{id}/private/adminData`, `/comments/` del piece, favoritos, colecciones, finalmente `/pieces/{id}` [US7, FR-031, research.md D-006]

### 5D — Interacciones Visitante [US6]

- [ ] T057 [P] → T020, T021, T042, T043 | Implementar `src/application/comments/AddCommentUseCase.ts`: valida texto no vacío y ≤1000 chars; **antes de persistir, verifica que la pieza referenciada por `pieceId` tenga `status: 'published'` vía `IPieceRepository.findById()`; si la pieza no existe o está en `draft` lanza `DomainError`** (FR-040 — "piezas publicadas"); persiste en `/comments/` con `edited:false` [US6, FR-040]
- [ ] T058 [P] → T021, T043 | Implementar `src/application/comments/EditCommentUseCase.ts`: carga comentario, invoca `Comment.editText(text)` (valida permisos y longitud), persiste con `edited:true` y `editedAt` actualizado [US6, FR-041]
- [ ] T059 [P] → T021, T043 | Implementar `src/application/comments/DeleteCommentUseCase.ts`: carga comentario, invoca `Comment.canBeDeletedBy(userId, role)`; si no tiene permiso lanza `DomainError`; elimina documento [US6, FR-042/043]
- [ ] T060 [P] → T011, T045 | Implementar `src/application/interactions/ToggleFavoriteUseCase.ts`: verifica con `isFavorite()`; si existe elimina; si no existe crea — operación idempotente sin error en ningún caso [US6, FR-046]
- [ ] T061 [P] → T011, T045 | Implementar `src/application/interactions/ToggleCollectionUseCase.ts`: análogo a T060 para la colección personal [US6, FR-047]

**Checkpoint Phase 5**: Todos los casos de uso compilan con TypeScript strict sin errores; cada uno puede instanciarse con repositorios mock en tests unitarios futuros.

---

## Phase 6: Testing — Integración y Cobertura Final

**Objetivo**: Tests de integración para los flujos más críticos y verificación de cobertura completa.
**Prerequisito**: Phases 2, 3, 4 y 5 completadas.

*Los tests de Phase 2B y 3A son obligatorios y ya deben estar verdes. Las tareas aquí son de integración (opcionales de alta prioridad).*

- [ ] T062 → T050, T044 | `tests/integration/RegisterUseCase.integration.test.ts`: flujo completo contra el emulador; primer registro crea `/usernames/` + `/users/` atómicamente; segundo intento con el mismo username falla con error de unicidad limpiamente; segundo registro con email duplicado retorna error de Auth [US5, FR-034/035]
- [ ] T063 [P] → T056, T043, T045 | `tests/integration/DeletePieceUseCase.integration.test.ts`: crea pieza con comentarios, favoritos y entradas de colección; `preview()` retorna conteos exactos; `execute()` elimina todo en cascada; verificar que ningún documento huérfano queda en Firestore [US7, FR-031]
- [ ] T064 [P] → T053, T043 | `tests/integration/ChangeUsernameUseCase.integration.test.ts`: crea usuario con 3 comentarios; cambia username; verifica que los 3 comentarios muestran el nuevo `authorUsername`; verifica que `/usernames/` se actualizó correctamente [US8, FR-052/053]
- [ ] T065 → T062-T064 | Ejecutar suite completa: `vitest run tests/unit/ tests/security/ tests/integration/`; verificar que no hay tests fallando ni skipped; documentar conteo de tests por categoría [SC-011, Constitución VI]

**Checkpoint Phase 6**: 100% verde en `tests/security/` y `tests/unit/`; integrations pasan; `vitest --coverage` muestra cobertura de las rutas críticas de negocio.

---

## Phase 7: Frontend Base

**Objetivo**: Infraestructura de UI — router, contexto de auth, componentes base reutilizables.
**Prerequisito**: Phase 1. **Puede correr en paralelo con Phases 2-5** hasta que necesite los casos de uso.

- [ ] T066 → T039 | Implementar `src/ui/hooks/useAuth.ts`: suscripción a `onAuthStateChanged`; al detectar usuario carga `/users/{uid}` y suscribe con `onSnapshot` para detectar cambio de `enabled`; si `enabled` pasa a `false` llama `signOut()` y redirige a home [US5, FR-039, SEC-005, research.md D-004]
- [ ] T067 [P] → T003 | Configurar `src/ui/router.tsx` con React Router: rutas públicas `/ /categoria/:id /pieza/:id /auth`; rutas de Visitante `/perfil`; rutas de Admin `/admin/piezas /admin/piezas/nueva /admin/piezas/:id/editar /admin/usuarios`; usa `<ProtectedRoute>` (implementado en T068) para envolver rutas que requieren autenticación o rol específico [US5/7/8, FR-002]
- [ ] T068 [P] → T066, T067 | Implementar `src/ui/components/ProtectedRoute.tsx`: recibe `requiredRole`; si no autenticado redirige a `/auth`; si rol insuficiente muestra 403; si usuario inhabilitado redirige a home
- [ ] T069 [P] → T003 | Implementar `src/ui/components/layout/Layout.tsx`: barra de navegación con logo, link a categorías, login/logout según estado de auth, acceso admin si rol Admin; footer
- [ ] T070 [P] → T003 | Implementar componentes UI base: `src/ui/components/LoadingSpinner.tsx`, `src/ui/components/ErrorBoundary.tsx`, `src/ui/components/EmptyState.tsx` (mensaje + acción opcional) [US2, FR-014]
- [ ] T071 [P] → T003 | Implementar `src/ui/components/ConfirmDialog.tsx`: acepta `title`, `description`, `items: { label, count }[]` (para mostrar conteos de dependencias), callbacks `onConfirm` / `onCancel` [US7, FR-031]
- [ ] T072 [P] → T066, T047, T048 | Implementar `src/ui/hooks/usePieces.ts`: estado `pieces`, `isLoading`, `cursor`, `filters`, `searchQuery`; expone `loadMore()`, `applyFilter()`, `setSearch()`, `clearFilters()`; integra `ListPiecesUseCase` y `SearchPiecesUseCase` [US2, FR-007/013]
- [ ] T073 [P] → T066, T060, T061 | Implementar `src/ui/hooks/useInteractions.ts`: estado `isFavorite`, `isInCollection`, `isTogglingFavorite`, `isTogglingCollection`; expone `toggleFavorite()`, `toggleCollection()`; operaciones idempotentes [US6, FR-046/047]
- [ ] T106 [P] → T066, T057, T058, T059 | Implementar `src/ui/hooks/useComments.ts`: estado `comments`, `isLoading`, `isSubmitting`; expone `addComment(text)`, `editComment(id, text)`, `deleteComment(id)`; actúa de mediador entre `CommentSection` y los use cases de comentarios; jamás expone use cases directamente a componentes UI [US6, FR-040/041/042/043, Constitución III]

**Checkpoint Phase 7**: App arranca con `vite dev`; routing funciona; `useAuth` detecta correctamente el estado del emulador; `usePieces` retorna datos paginados del emulador.

---

## Phase 8: Pantallas y Experiencia de Usuario

**Objetivo**: Implementar todas las pantallas definidas en spec.md.
**Prerequisito**: Phases 5 (T046-T061) y 7 (T066-T073) completadas.

### 8A — View-models de presentación [Constitución III]

- [ ] T074 [P] → T019 | Implementar `src/presentation/categories/CategoryViewModel.ts`: traduce `Category` a props del tile (name, type, externalUrl) [US1, Constitución III]
- [ ] T075 [P] → T020 | Implementar `src/presentation/pieces/PieceSummaryViewModel.ts`: traduce `Piece` a los campos para la tarjeta del listado — **solo campos públicos**, sin `adminData` [US2, FR-015, Constitución III]
- [ ] T076 [P] → T020, T023 | Implementar `src/presentation/pieces/PieceDetailViewModel.ts`: traduce `Piece` + `AdminData` opcional a la ficha; incluye `adminFields` solo si el rol es `'admin'`; garantía en tiempo de compilación que Público/Visitante no reciben campos admin [US3/7, FR-017, Constitución III]
- [ ] T077 [P] → T022 | Implementar `src/presentation/users/UserViewModel.ts`: traduce `User` para perfil (solo lectura) y para panel admin (con acciones disponibles según contexto) [US5/6/8, Constitución III]

### 8B — Pantallas públicas [US1, US2, US3, US4]

- [ ] T078 → T046, T074, T069 | Implementar `src/ui/pages/HomePage.tsx`: grilla responsive de `CategoryTile`; usa `ListCategoriesUseCase`; muestra `EmptyState` si no hay categorías; carga completa en ≤ 5 segundos [US1, FR-001/005]
- [ ] T079 [P] → T074 | Implementar `src/ui/components/CategoryTile.tsx`: muestra nombre; indicador visual diferenciado para externa (ícono + etiqueta); click en interna → `navigate('/categoria/:id')`; click en externa → `window.open(externalUrl, '_blank')` [US1/4, FR-002/003/005]
- [ ] T080 → T072, T075, T078 | Implementar `src/ui/pages/CategoryPage.tsx`: listado paginado con `usePieces`; `SearchBar` + `FilterPanel`; botón "cargar más" o indicador de fin; `EmptyState` con botón "limpiar filtros" cuando sin resultados [US2, FR-007 a FR-014]
- [ ] T081 [P] → T075 | Implementar `src/ui/components/PieceCard.tsx`: muestra título, año, pieceType, imageUrl (si existe); enlace a `/pieza/:id` [US2, FR-007]
- [ ] T082 [P] → T072 | Implementar `src/ui/components/SearchBar.tsx`: input controlado; dispara búsqueda al presionar Enter o hacer clic en botón; botón de limpiar [US2, FR-008/009/013]
- [ ] T083 [P] → T072 | Implementar `src/ui/components/FilterPanel.tsx`: filtros estáticos (año, país, pieceType); filtros dinámicos por `fieldSchema` de la categoría activa; botón "limpiar todos"; AND lógico entre filtros activos [US2, FR-010/011/012/013]
- [ ] T084 → T049, T073, T076 | Implementar `src/ui/pages/PieceDetailPage.tsx`: todos los campos públicos + campos específicos; imageUrl si tiene valor; acciones de interacción (favorito, En Colección) solo para Visitante/Admin; sección de comentarios; **los campos admin no se renderizan para Público/Visitante en ningún caso** [US3, FR-015/016/017/018, SEC-004(a)]
- [ ] T085 [P] → T106 | Implementar `src/ui/components/CommentSection.tsx`: lista comentarios con nombre de usuario + fecha + indicador "editado"; formulario de nuevo comentario para Visitante/Admin; aviso "inicia sesión" para Público; botones editar/eliminar visibles solo para el autor del comentario y Admin [US3/6, FR-040 a FR-045]

### 8C — Auth y Perfil [US5, US6]

- [ ] T086 → T050, T066, T067 | Implementar `src/ui/pages/AuthPage.tsx`: tabs "Iniciar Sesión" / "Registrarse"; formulario de registro con validación inline de `Username`; mensajes de error descriptivos para username duplicado, email duplicado, contraseña inválida; usa `RegisterUseCase` + Firebase Auth `signInWithEmailAndPassword` [US5, FR-034/035/037]
- [ ] T087 → T060, T061, T073, T077 | Implementar `src/ui/pages/ProfilePage.tsx`: tabs "Mis Favoritos" / "Mi Colección" / "Mis Comentarios"; listas paginadas filtradas de piezas publicadas; piezas eliminadas/despublicadas omitidas; nombre de usuario en solo lectura (no editable por el Visitante — Decisión Q3) [US6, FR-048/049]

### 8D — Panel de administración [US7, US8]

- [ ] T088 → T046, T047, T055, T056, T071, T076 | Implementar `src/ui/pages/admin/PieceListPage.tsx`: tabla de piezas (Publicadas + Borradores); columna de estado con indicador visual; acciones: publicar/despublicar, editar, eliminar; al eliminar abre `ConfirmDialog` con los conteos del preview de `DeletePieceUseCase`; paginación del listado [US7, FR-030/031/032]
- [ ] T089 → T054, T055, T046 | Implementar `src/ui/pages/admin/PieceFormPage.tsx`: formulario de alta y edición; selector de categoría que al cambiar recarga el `fieldSchema` y oculta/muestra campos específicos dinámicamente; campos comunes + campos específicos + campos admin; validación de campos obligatorios con mensajes inline; solo categorías `internal` en el selector [US7, FR-027/028/029, FR-004]
- [ ] T090 → T044, T051, T052, T053, T077, T105 | Implementar `src/ui/pages/admin/UsersPage.tsx`: tabla de usuarios con username, estado, fecha de registro; botones habilitar/inhabilitar con confirmación; modal de edición de username con validación; **sin opción de conceder rol Admin en ningún elemento de la UI** [US8, FR-050/051/052/054/055, SEC-006]

**Checkpoint Phase 8**: Todos los flujos de las 8 US son navegables en el emulador; 0 errores de TypeScript; campos admin no aparecen fuera del panel admin; `PieceDetailViewModel` con rol visitor no expone `adminFields`.

---

## Phase 9: Integración con Firebase

**Objetivo**: Conectar todos los componentes con Firebase de forma robusta y preparar el deploy.
**Prerequisito**: Phases 4, 5 y 7 completadas.

- [ ] T091 → T040 | Verificar y validar `firestore.indexes.json`: confirmar que los 9 índices I-001 a I-009 de `data-model.md §4` están declarados; ejecutar todas las consultas con filtros combinados contra el emulador y verificar que ninguna retorna error `FAILED_PRECONDITION` por índice faltante [FR-007/010/011, RNF-007]
- [ ] T092 [P] → T039 | Configurar `vite.config.ts` para producción: `build.rollupOptions` con code splitting por ruta; lazy loading de `pages/admin/*`; variables de entorno `VITE_FIREBASE_*` para config de producción vs emulador
- [ ] T093 [P] → T001-T007, T039 | Crear `tests/fixtures/seed.ts`: script que carga en el emulador los datos de semilla del `quickstart.md §0.2` — 4 categorías internas + 1 externa, 5 piezas published, 1 pieza draft, 1 Admin pre-existente, 1 Visitante habilitado; los tests de integración lo invocan en `beforeAll`
- [ ] T094 [P] → T039 | Configurar variables de entorno: `.env` con config de Firebase producción; `.env.emulator` o variable `VITE_USE_EMULATOR=true`; documentar en `.env.example` qué variables son necesarias
- [ ] T107 [P] → T039, T041 | Crear `scripts/seed-categories.ts`: script de semilla para las 4 categorías internas de producción con sus definiciones completas de `fieldSchema` (Aerolíneas, Sellos, Monedas, Tarjetas Telefónicas) y la categoría externa (Colnect); ejecutar con `npx ts-node scripts/seed-categories.ts --env=production` antes del primer deploy; idempotente (verifica existencia antes de crear) [FR-004, FR-005]
- [ ] T095 → T092, T094 | Smoke test de deploy: `firebase deploy --only hosting`; verificar que la app carga en la URL de Firebase Hosting y se conecta al proyecto real; verificar que no hay llamadas a la API del emulador desde producción

**Checkpoint Phase 9**: La app funciona end-to-end en el emulador local y en Firebase Hosting staging; no hay referencias al emulador en el build de producción.

---

## Phase 10: Validación Final y Criterios de Aceptación

**Objetivo**: Verificar los criterios de éxito de `spec.md` y el checklist completo de `quickstart.md §3`.
**Prerequisito**: Phases 1-9 completadas.

- [ ] T096 → todas las fases | Ejecutar suite completa: `vitest run tests/unit/ tests/security/ tests/integration/`; verificar 100% verde; ningún test skipped [SC-011, Constitución VI]
- [ ] T097 [P] → T093 | Validar SC-002/RNF-001: con dataset de semilla (~100 piezas en emulador), medir tiempo de respuesta de búsqueda y filtrado; debe ser < 5 segundos en todos los casos; documentar tiempos en `specs/001-vitrina-coleccion/checklists/acceptance.md`
- [ ] T098 [P] → T088, T089, T090 | Validar SC-008/RNF-004: abrir la app en viewport 375px y 1280px; recorrer todos los flujos de las 8 US; ningún scroll horizontal ni elementos solapados
- [ ] T099 [P] → T084, T085, T088 | Validar SC-009: con DevTools, inspeccionar el DOM en los tres roles (Público, Visitante, Admin) para la ficha de una pieza que tiene `adminData` cargado; confirmar que ningún campo admin aparece para Público o Visitante
- [ ] T100 [P] → T090, T066 | Validar SC-010/RNF-006: con Visitante logueado, Admin lo inhabilita desde UsersPage; medir tiempo hasta desconexión automática del Visitante por el listener; debe ser < 60 segundos
- [ ] T101 [P] → T078, T080, T084 | Validar SC-001: contar interacciones para navegar desde home hasta ficha de pieza; deben ser ≤ 3 (home → categoría → pieza)
- [ ] T102 [P] → T042-T045 | Validar RNF-007: en DevTools Network durante una sesión de uso normal, verificar que ninguna respuesta de Firestore contiene más de 20 documentos; ninguna query sin `limit()`
- [ ] T103 → T001-T090 | Ejecutar `tsc --noEmit` sobre todo el proyecto; 0 errores con `strict: true`; 0 usos de `any` implícito ni `as unknown as X` sin justificación [RNF-009]
- [ ] T104 → T096-T103 | Validación manual completa de `quickstart.md §1`: ejecutar los 8 escenarios de US con el emulador; marcar cada ítem; registrar evidencia en `specs/001-vitrina-coleccion/checklists/acceptance.md`

**CHECKPOINT FINAL**: Todos los ítems de `quickstart.md §3 — Criterio de Done` marcados. La feature V1 está lista para deploy a producción.

---

## Dependencias entre Fases

```
Phase 1: Setup
    │
    ├──────────────────────────────────────────────┐
    ↓                                              ↓
Phase 2: Dominio ←→ Phase 3: Security Rules    Phase 7: Frontend Base
    │  (paralelo entre sí)                         │
    ↓                                              │
Phase 4: Persistencia                              │
    │                                              │
    ↓                                              │
Phase 5: Casos de Uso ─────────────────────────→──┤
    │                                              │
    ├── Phase 6: Tests de integración              ↓
    │                                         Phase 8: Pantallas
    ↓                                              │
Phase 9: Firebase Integration ←────────────────────┤
    │                                              │
    └───────────────────────────────────────────→──┤
                                                   ↓
                                          Phase 10: Validación Final
```

### Dependencias críticas de tareas individuales

| Tarea | Depende de | Razón |
|-------|------------|-------|
| T012-T017 (unit tests) | T008-T011 | Tests necesitan tipos definidos |
| T018-T024 (entidades) | T012-T017 | TDD: tests deben fallar primero |
| T025-T030 (security tests) | T006-T007 | Tests necesitan emulador configurado |
| T031-T038 (firestore.rules) | T025-T030 | TDD: tests deben fallar primero |
| T040-T045 (repositorios) | T010, T039 | Interfaces de dominio + config Firebase |
| T046-T061, T105 (casos de uso) | T018-T024, T041-T045 | Entidades + repositorios |
| T062-T064 (integration) | T046-T061 | Casos de uso completos |
| T074-T090, T106 (pantallas) | T046-T061, T066-T073, T105 | Use cases + frontend base |

---

## Estrategia de Ejecución Incremental

### Incremento 1 — Vitrina pública solo lectura (US1 + US2 + US3)

```
Phase 1 → Phase 2 (T008-T020) → Phase 3 (T025-T026 + T031-T034) →
Phase 4 (T039-T042) → Phase 5 (T046-T049) → Phase 7 (T066-T072) →
Phase 8 (T074-T085: pantallas públicas)
```
**Resultado**: catálogo navegable públicamente, sin login, sin admin.

### Incremento 2 — Registro + Interacciones (US5 + US6)

```
Phase 2 (T021-T023) → Phase 3 (T028-T030 + T036-T038) →
Phase 4 (T043-T045) → Phase 5 (T050 + T057-T061) →
Phase 7 (T106) → Phase 8 (T085-T087)
```
**Resultado**: registro, login, favoritos, colección personal, comentarios.

### Incremento 3 — Panel de administración (US7 + US8)

```
Phase 2 (T022-T024) → Phase 3 (T027 + T035) →
Phase 4 (T044) → Phase 5 (T051-T056, T105) →
Phase 8 (T088-T090)
```
**Resultado**: ABM de piezas y gestión de usuarios.

### Cierre

```
Phase 6 (T062-T065) → Phase 9 (T091-T095) → Phase 10 (T096-T104)
```

---

## Resumen de Tareas

| Fase | Tareas | Paralelizables | Tests obligatorios |
|------|--------|----------------|--------------------|
| 1 — Setup | T001-T007 | T002-T007 | — |
| 2 — Dominio | T008-T024 | T008-T017 (2A+2B); T019-T024 (2C) | T012-T017 🔴 |
| 3 — Security Rules | T025-T038 | T026-T030 (3A); T032-T038 (3B) | T025-T030 🔴 |
| 4 — Persistencia | T039-T045 | T041-T045 | — |
| 5 — Casos de Uso | T046-T061, T105 | T046-T049; T051-T053; T055-T061; T105 | — |
| 6 — Integración Tests | T062-T065 | T062-T064 | T062-T064 (recomendados) |
| 7 — Frontend Base | T066-T073, T106 | T067-T073; T106 | — |
| 8 — Pantallas | T074-T090 | T074-T079; T081-T083 | — |
| 9 — Firebase Integration | T091-T095, T107 | T092-T094; T107 | — |
| 10 — Validación Final | T096-T104 | T097-T102 | — |
| **Total** | **107 tareas** | | **18 tests obligatorios** |
