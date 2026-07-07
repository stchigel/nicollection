# Data Model: nicollection V1

**Feature**: `specs/001-vitrina-coleccion/` | **Date**: 2026-07-07
**Fuente**: `spec.md` FR-019 a FR-056, SEC-001 a SEC-006; `research.md` D-001 a D-010

---

## 1. Entidades del Dominio

### 1.1 Category (Entidad)

Representa una categoría de la colección. Puede ser interna (piezas gestionadas en el
sistema) o externa (redirige a Colnect).

**Responsabilidades**:
- Determinar si acepta piezas propias (`isInternal()`).
- Proveer el schema de campos específicos para su categoría (`getFieldSchema()`).
- Una categoría externa nunca puede tener piezas asociadas (invariante).

**Invariantes**:
- `type` solo acepta los valores `'internal'` o `'external'`.
- Si `type === 'external'`, entonces `externalUrl` es obligatorio y `fieldSchema` es vacío.
- Si `type === 'internal'`, entonces `externalUrl` es nulo.

### 1.2 Piece (Aggregate Root)

Representa una pieza de la colección. Es la entidad central del sistema.

**Responsabilidades**:
- Validar que todos los campos obligatorios estén presentes antes de persistir.
- Gestionar las transiciones de estado (Publicada ↔ Borrador).
- Validar que `specificFields` conforme al `fieldSchema` de su categoría.
- Generar `searchTokens` normalizados a partir de título, descripción y tags.

**Invariantes**:
- `title` no puede ser vacío ni solo espacios.
- `categoryId` debe referenciar una categoría de tipo `'internal'`.
- `status` solo acepta `'published'` o `'draft'`.
- `specificFields` debe conformar al `fieldSchema` de la categoría referenciada.
- `imageUrl` es texto libre opcional; el sistema no valida ni gestiona el contenido del URL.

**Transiciones de estado**:
```
[Publicada] ←→ [Borrador]
Estado inicial por defecto: Publicada (Decisión Q1)
```

**Campos públicos** (visibles para todos los roles):
`id`, `categoryId`, `title`, `description`, `tags`, `year`, `country`, `pieceType`,
`imageUrl`, `status`, `specificFields`, `searchTokens`, `createdAt`, `updatedAt`

**Campos de administración** (solo Admin — subcollección separada):
`functioning`, `hasBox`, `accessories`, `condition`, `provenance`, `acquisitionDate`, `notes`

### 1.3 AdminData (Value Object)

Agrupa los campos de administración de una pieza. Solo existe como subcollección adjunta
a una pieza; no tiene identidad independiente.

**Valores aceptados**:
- `functioning` / `hasBox`: `'yes'` | `'no'` | `'na'`
- `condition`: `'perfect'` | `'excellent'` | `'good'` | `'acceptable'` | `'poor'` | `'very_poor'`

### 1.4 User (Entidad)

Representa un usuario del sistema. Sus credenciales (correo/contraseña) son gestionadas
por Firebase Authentication; el dominio gestiona el `username`, `role` y `enabled`.

**Responsabilidades**:
- Controlar habilitación/inhabilitación (`enable()`, `disable()`).
- Validar que un Admin no pueda inhabilitarse a sí mismo (`canBeDisabledBy(adminId)`).
- Gestionar cambios de nombre de usuario respetando la unicidad.

**Invariantes**:
- `username`: 3–30 caracteres, alfanumérico con `-` y `_` permitidos, sin espacios.
- `username` es único en todo el sistema (enforced por `/usernames/` collection).
- `role` solo acepta `'visitor'` o `'admin'`.
- Un Admin no puede cambiar su propio `enabled` a `false`.
- El rol `'admin'` no puede ser concedido vía la interfaz del sistema (solo pre-setup manual).

### 1.5 Username (Value Object)

Encapsula las reglas de validación del nombre de usuario.

**Reglas**:
- Longitud: 3–30 caracteres.
- Caracteres: `[a-zA-Z0-9_-]` únicamente.
- Sin espacios, sin caracteres especiales.

### 1.6 Comment (Entidad)

Representa un comentario sobre una pieza publicada.

**Responsabilidades**:
- Controlar quién puede editarlo o eliminarlo.
- Registrar la fecha de edición cuando el texto se modifica.

**Invariantes**:
- `text` no puede ser vacío.
- `text` máximo 1000 caracteres.
- Solo el autor (`authorId == userId`) o un Admin puede editar o eliminar un comentario.
- Cuando se edita, `edited` pasa a `true` y `editedAt` se actualiza.

### 1.7 Favorite / CollectionEntry (Value Objects)

Representan el marcado de una pieza como favorita o como perteneciente a la colección
personal de un Visitante. Son operaciones idempotentes: agregar un duplicado no falla, y
remover un elemento que no existe tampoco falla.

### 1.8 FieldDefinition (Value Object)

Describe un campo específico de una categoría interna.

**Campos**: `key: string`, `label: string`, `fieldType: 'string' | 'number' | 'date'`,
`required: boolean`.

---

## 2. Enumeraciones

```
PublicationStatus  : 'published' | 'draft'
Role               : 'visitor'   | 'admin'
CategoryType       : 'internal'  | 'external'
FunctioningStatus  : 'yes' | 'no' | 'na'
Condition          : 'perfect' | 'excellent' | 'good' | 'acceptable' | 'poor' | 'very_poor'
```

---

## 3. Colecciones Firestore

### 3.1 `/categories/{categoryId}`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | `string` | Nombre visible de la categoría |
| `type` | `'internal' \| 'external'` | Tipo de categoría |
| `externalUrl` | `string \| null` | URL destino (solo si `type === 'external'`) |
| `displayOrder` | `number` | Orden de aparición en la home |
| `fieldSchema` | `FieldDefinition[]` | Campos específicos (solo si `type === 'internal'`) |
| `createdAt` | `Timestamp` | Fecha de creación |
| `updatedAt` | `Timestamp` | Fecha de última modificación |

**Categorías iniciales** (datos de configuración, no generados por el usuario):
- `airlines` — Aerolíneas (internal): fields `airline`, `subtype`
- `hotels` — Hotel (internal): fields `chain`, `specificHotel`, `city`, `subtype`
- `phones` — Celulares (internal): fields `manufacturer`, `model`, `operatingSystem`, `color`
- `retro-tech` — Tecnología Antigua (internal): fields `manufacturer`, `model`, `subtype`
- *(categorías externas de tarjetas plásticas u otras → type: external)*

### 3.2 `/pieces/{pieceId}`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `categoryId` | `string` | ✅ | Referencia a `/categories/{categoryId}` |
| `title` | `string` | ✅ | Título de la pieza (no vacío) |
| `description` | `string` | — | Descripción libre |
| `tags` | `string[]` | — | Lista de etiquetas (máx. 20) |
| `year` | `number \| null` | — | Año de la pieza |
| `country` | `string \| null` | — | Código de país (ISO 3166-1 alpha-2) |
| `pieceType` | `string \| null` | — | Tipo: "Papelería", "Objeto", etc. |
| `imageUrl` | `string \| null` | — | URL de imagen externa (texto libre) |
| `status` | `'published' \| 'draft'` | ✅ | Estado de publicación |
| `specificFields` | `Record<string, unknown>` | — | Campos específicos según categoría |
| `searchTokens` | `string[]` | ✅ | Tokens de búsqueda (generados por dominio) |
| `createdAt` | `Timestamp` | ✅ | Fecha de alta |
| `updatedAt` | `Timestamp` | ✅ | Fecha de última modificación |
| `createdBy` | `string` | ✅ | UID del Admin que creó la pieza |

**Ejemplo de `specificFields` para Aerolíneas**:
```json
{ "airline": "Aerolíneas Argentinas", "subtype": "tarjeta de embarque" }
```

**Ejemplo de `searchTokens`** (generados del título "Tarjeta de embarque AA 1985"):
```json
["tarjeta", "de", "embarque", "aa", "1985"]
```

### 3.3 `/pieces/{pieceId}/private/adminData`

Subcollección con un único documento (`adminData`). Solo accesible con rol Admin.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `functioning` | `'yes' \| 'no' \| 'na'` | ¿Funciona? |
| `hasBox` | `'yes' \| 'no' \| 'na'` | ¿Tiene caja? |
| `accessories` | `string[]` | Lista de accesorios (ej. `["cargador", "stylus"]`) |
| `condition` | `Condition` | Estado de conservación |
| `provenance` | `string \| null` | Procedencia (texto libre) |
| `acquisitionDate` | `Timestamp \| null` | Fecha de adquisición |
| `notes` | `string \| null` | Notas internas |
| `updatedAt` | `Timestamp` | Fecha de última actualización |

### 3.4 `/users/{uid}`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `username` | `string` | Nombre de usuario único en el sistema |
| `role` | `'visitor' \| 'admin'` | Rol del usuario |
| `enabled` | `boolean` | Estado de habilitación |
| `createdAt` | `Timestamp` | Fecha de registro |

### 3.5 `/usernames/{username}`

Índice de unicidad de nombres de usuario. Documento ID = el username en sí.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `uid` | `string` | UID de Firebase Auth del propietario |

### 3.6 `/comments/{commentId}`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `pieceId` | `string` | ✅ | Referencia a `/pieces/{pieceId}` |
| `authorId` | `string` | ✅ | UID del autor |
| `authorUsername` | `string` | ✅ | Nombre de usuario desnormalizado (ver research.md D-006) |
| `text` | `string` | ✅ | Contenido del comentario (1–1000 chars) |
| `createdAt` | `Timestamp` | ✅ | Fecha de creación |
| `editedAt` | `Timestamp \| null` | — | Fecha de última edición |
| `edited` | `boolean` | ✅ | Indica si fue editado |

### 3.7 `/users/{uid}/favorites/{pieceId}`

Subcollección de favoritos. Documento ID = `pieceId` (garantiza idempotencia).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `pieceId` | `string` | Referencia a la pieza |
| `createdAt` | `Timestamp` | Fecha en que se marcó |

### 3.8 `/users/{uid}/collection/{pieceId}`

Subcollección "En Colección". Misma estructura que `/favorites/`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `pieceId` | `string` | Referencia a la pieza |
| `createdAt` | `Timestamp` | Fecha en que se marcó |

---

## 4. Índices Compuestos Requeridos (`firestore.indexes.json`)

| # | Colección | Campos | Uso |
|---|-----------|--------|-----|
| I-001 | `pieces` | `categoryId ASC` + `status ASC` + `createdAt DESC` | Listado principal paginado |
| I-002 | `pieces` | `categoryId ASC` + `status ASC` + `year ASC` + `createdAt DESC` | Filtro por año |
| I-003 | `pieces` | `categoryId ASC` + `status ASC` + `country ASC` + `createdAt DESC` | Filtro por país |
| I-004 | `pieces` | `categoryId ASC` + `status ASC` + `pieceType ASC` + `createdAt DESC` | Filtro por tipo |
| I-005 | `pieces` | `categoryId ASC` + `status ASC` + `searchTokens ARRAY` + `createdAt DESC` | Búsqueda texto |
| I-006 | `comments` | `pieceId ASC` + `createdAt ASC` | Comentarios de una pieza |
| I-007 | `comments` | `authorId ASC` + `createdAt DESC` | Comentarios de un usuario (perfil) |
| I-008 | `users/{uid}/favorites` | `createdAt DESC` | Favoritos del usuario paginados |
| I-009 | `users/{uid}/collection` | `createdAt DESC` | Colección del usuario paginada |

**Nota**: Los índices de campos específicos por categoría (ej. `specificFields.airline`) se
agregarán como parte de la especificación de cada categoría nueva que requiera filtrado por
esos campos. Se deben declarar en `firestore.indexes.json` antes de desplegar.

---

## 5. Firestore Security Rules — Especificación

Las reglas siguientes deben implementarse en `firestore.rules`. Son el espejo de las reglas
del dominio cliente (Const. X). Los tests de `tests/security/` deben verificar cada regla.

### Funciones auxiliares

```
isAuthenticated()          → request.auth != null
userDoc()                  → get(/databases/$(db)/documents/users/$(request.auth.uid))
isAdmin()                  → isAuthenticated() && userDoc().data.role == 'admin'
isEnabledUser()            → isAuthenticated() && userDoc().data.enabled == true
isEnabledAdmin()           → isAdmin() && userDoc().data.enabled == true
isEnabledVisitorOrAdmin()  → isAuthenticated() && userDoc().data.enabled == true
```

### `/categories/{categoryId}`

| Operación | Permitido para |
|-----------|----------------|
| `read`    | Todos (Público, Visitante, Admin) |
| `write`   | Solo Admin habilitado |

### `/pieces/{pieceId}`

| Operación | Permitido para |
|-----------|----------------|
| `read`    | Si `status == 'published'`: Público, Visitante, Admin. Si `status == 'draft'`: solo Admin habilitado. |
| `create`  | Solo Admin habilitado; `title` no vacío; `categoryId` no vacío; `status` in `['published','draft']` |
| `update`  | Solo Admin habilitado |
| `delete`  | Solo Admin habilitado |

### `/pieces/{pieceId}/private/{doc}`

| Operación | Permitido para |
|-----------|----------------|
| `read`    | Solo Admin habilitado |
| `write`   | Solo Admin habilitado |

### `/users/{uid}`

| Operación | Permitido para |
|-----------|----------------|
| `read`    | El propio usuario (`request.auth.uid == uid`) o Admin habilitado |
| `create`  | Solo el propio usuario durante el registro; `role` forzado a `'visitor'`; `enabled` forzado a `true` |
| `update`  | Solo Admin habilitado; el campo `role` solo puede ser `'visitor'` o `'admin'` (no escalar vía UI); el campo `enabled` no puede ser `false` si el uid modificado es el uid del Admin actual |
| `delete`  | Nadie (no hay eliminación de cuentas en V1) |

### `/usernames/{username}`

| Operación | Permitido para |
|-----------|----------------|
| `read`    | Todos (necesario para verificar disponibilidad en el registro) |
| `create`  | Usuario autenticado; `request.resource.data.uid == request.auth.uid` |
| `update`  | Nadie |
| `delete`  | Solo Admin habilitado |

### `/comments/{commentId}`

| Operación | Permitido para |
|-----------|----------------|
| `read`    | Todos |
| `create`  | Visitante o Admin habilitado; `authorId == request.auth.uid`; `text` no vacío; `text.size() <= 1000`; `edited == false` |
| `update`  | Autor habilitado (solo `text`, `edited`, `editedAt`) o Admin habilitado (cualquier campo) |
| `delete`  | Autor habilitado o Admin habilitado |

### `/users/{uid}/favorites/{pieceId}`

| Operación | Permitido para |
|-----------|----------------|
| `read`    | El propietario (`uid == request.auth.uid`) o Admin |
| `create`  | Solo el propietario habilitado |
| `delete`  | Solo el propietario habilitado |
| `update`  | Nadie |

### `/users/{uid}/collection/{pieceId}`

Idénticas reglas a `/users/{uid}/favorites/{pieceId}`.

---

## 6. Modelo de Dominio Conceptual — Relaciones

```
Category 1──────────────────── * Piece
  (solo internal)                 (tiene categoryId + specificFields)

Piece 1────────────────────── * Comment
  (una pieza puede tener muchos comentarios)

Piece 1──── (privado) ──────── 1 AdminData
  (subcollección /private/adminData)

User 1──────────────────────── * Comment      (un usuario puede tener muchos)
User *──── (favorites) ──────── * Piece       (many-to-many via /users/{uid}/favorites/)
User *──── (collection) ─────── * Piece       (many-to-many via /users/{uid}/collection/)

Username 1──────────────────── 1 User         (/usernames/ es índice de unicidad)
```

---

## 7. Consideraciones de Escalabilidad

- **Miles de piezas**: todas las consultas sobre `/pieces/` usan `limit(20)` +
  `startAfter(cursor)`. Nunca se ejecuta un `getDocs` sin `limit`.
- **Comentarios**: top-level collection con índice compuesto `pieceId+createdAt`.
  No son subcollección de piezas para mantener la flexibilidad de consultas por autor.
- **Favoritos / Colección**: subcollecciones de usuario; punto de lectura O(1) para
  verificar si una pieza está marcada (`/users/{uid}/favorites/{pieceId}`).
- **Campo `searchTokens`**: crece con el tamaño del título+descripción+tags; se puede
  acotar normalizando solo los primeros N tokens más relevantes si el tamaño del
  documento se vuelve un problema (límite Firestore: 1 MiB por documento).
