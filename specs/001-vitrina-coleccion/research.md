# Research: nicollection V1 — Decisiones Técnicas

**Feature**: `specs/001-vitrina-coleccion/` | **Date**: 2026-07-07

Todas las decisiones técnicas que requirieron investigación o comparación de alternativas
para la implementación client-side con Firebase. Cada sección sigue el formato:
**Decisión → Alternativas consideradas → Rationale**.

---

## D-001: Búsqueda de texto libre sin backend

**Contexto**: FR-008/FR-009 exigen búsqueda por texto libre sobre título, descripción y
tags de miles de piezas, insensible a mayúsculas. FR-007 prohíbe cargar la colección
completa en el cliente. No hay backend propio ni Firebase Functions.

**Decisión**: Campo `searchTokens: string[]` en cada documento de pieza.

- Al guardar una pieza, el dominio genera tokens normalizados a minúsculas dividiendo el
  título, la descripción y los tags por espacios.
- Las búsquedas usan `where('searchTokens', 'array-contains', query.toLowerCase().trim())`.
- Búsqueda de una sola palabra: usa `array-contains`. Búsqueda de múltiples palabras: filtra
  por el término más selectivo y aplica filtro adicional client-side sobre el lote devuelto.

**Limitaciones documentadas**:
- Coincidencia de palabras completas únicamente (no subcadenas internas). Ejemplo: "aero"
  encuentra "aerolínea" solo si "aero" fue tokenizado como palabra (lo es si aparece solo);
  "rolínea" no encontraría nada.
- No hay búsqueda fonética ni por similitud.
- Post-V1: se puede migrar a Algolia o Typesense cuando exista un proceso de indexación
  (Function o script externo), sin cambiar el contrato de dominio.

**Alternativas rechazadas**:
| Alternativa | Razón de rechazo |
|-------------|-----------------|
| Filtrado client-side completo | FR-007 lo prohíbe explícitamente |
| Algolia / Typesense | Requiere webhook/Function para indexar; fuera de scope V1 |
| Firebase Extensions (Algolia Extension) | Requiere Firebase Functions; fuera de scope V1 |

---

## D-002: Aislamiento de campos de administración

**Contexto**: SEC-004(a): los campos admin (Funcionando, Caja, Accesorios, Estado,
Procedencia, Adquisición, Notas) no deben ser legibles por Público ni Visitante. Firestore
Security Rules operan a nivel de documento; no permiten ocultar campos individuales dentro
de un documento.

**Decisión**: Subcollección `/pieces/{pieceId}/private/adminData` con un único documento.

- El documento principal `/pieces/{pieceId}` contiene solo campos públicos + `status`.
- La subcollección `/private/` tiene Security Rules que exigen rol Admin para cualquier
  lectura o escritura.
- El Admin carga ambos documentos; Público y Visitante solo cargan el documento principal.

**Alternativas rechazadas**:
| Alternativa | Razón de rechazo |
|-------------|-----------------|
| Todo en el documento principal | Firestore no puede ocultar campos parciales; viola SEC-004(a) |
| Colección paralela `/piecesAdmin/{id}` | Funciona igual pero rompe co-localización; subcollección es más idiomática |

---

## D-003: Gestión de roles — Firestore vs. Custom Claims

**Contexto**: Los roles (visitor/admin) deben ser verificables en Firestore Security Rules.
Custom Claims en Firebase Auth requieren Admin SDK para asignarlos → requiere Functions
(fuera de scope V1). Los roles en Firestore son accesibles vía `get()` en Security Rules.

**Decisión**: Roles almacenados en `/users/{uid}.role`. Las Security Rules usan
`get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role == 'admin'`.

**Consideraciones de seguridad**:
- Las Security Rules de `/users/{uid}` deben prohibir que un usuario escriba su propio
  campo `role`. Solo el Admin puede actualizar documentos en `/users/`.
- El Admin pre-existente se crea manualmente en Firestore (fuera de la interfaz pública).

**Post-V1**: si se habilitan Functions, migrar a Custom Claims elimina el `get()` en cada
regla (mejor performance de rules evaluation).

**Alternativas rechazadas**:
| Alternativa | Razón de rechazo |
|-------------|-----------------|
| Custom Claims via Firebase Auth | Requiere Admin SDK = Functions; fuera de scope V1 |
| Rol solo en cliente (localStorage / context) | No tiene valor de seguridad; viola Const. X |

---

## D-004: Invalidación de sesión para usuarios inhabilitados

**Contexto**: RNF-006: un usuario inhabilitado debe perder el acceso en < 60 s. Firebase
Auth ID tokens tienen validez de 1 hora. Sin Admin SDK no se puede revocar el token.

**Decisión**: Doble mecanismo:
1. **Firestore Security Rules**: chequean `users/{uid}.enabled == true` en cada operación
   autenticada → todas las escrituras/lecturas privilegiadas fallan inmediatamente para
   usuarios inhabilitados, sin importar si el token es válido.
2. **Real-time listener en el cliente**: la app se suscribe al documento `/users/{uid}` con
   `onSnapshot`. Cuando `enabled` pasa a `false`, el cliente llama a `signOut()` y redirige
   al estado Público.

Este mecanismo garantiza < 60 s en la práctica (el listener notifica en segundos).

**Alternativas rechazadas**:
| Alternativa | Razón de rechazo |
|-------------|-----------------|
| Esperar expiración del token (1h) | Viola RNF-006 y SC-010 |
| Revocación de token via Admin SDK | Requiere Functions; fuera de scope V1 |

---

## D-005: Unicidad de nombre de usuario

**Contexto**: FR-035 exige nombres de usuario únicos. Firestore no tiene UNIQUE constraints.
Dos registros concurrentes con el mismo nombre de usuario no pueden detectarse con una
simple consulta (race condition).

**Decisión**: Colección `/usernames/{username}` como índice de unicidad.

- Cada documento `/usernames/nicolas` contiene `{ uid: "..." }`.
- El registro es una **transacción Firestore** que: (1) intenta crear `/usernames/{username}`
  con `create` (falla si ya existe → transaction abort), (2) crea `/users/{uid}`, (3) crea
  la cuenta en Firebase Auth.
- Security Rules: `/usernames/{username}` solo permite `create` (no `update`); el `delete`
  solo lo puede hacer un Admin (para cambios de nombre de usuario).
- El cambio de nombre de usuario por Admin: transacción que elimina el documento viejo en
  `/usernames/` y crea el nuevo.

**Alternativas rechazadas**:
| Alternativa | Razón de rechazo |
|-------------|-----------------|
| `where('username', '==', x)` + check antes de crear | Race condition: no es atómica |
| Username como UID del documento de usuario | Firestore UID es asignado por Auth, no elegible por el usuario |

---

## D-006: Nombre de usuario en comentarios (desnormalización)

**Contexto**: FR-053 + US8 AC4: cuando un Admin cambia el nombre de usuario de un Visitante,
los comentarios históricos deben mostrarse con el nuevo nombre. Los comentarios almacenan
`authorId` + `authorUsername` (desnormalizado).

**Decisión**: Almacenar `authorUsername` desnormalizado en cada comentario. Cuando el Admin
cambia un nombre de usuario, el caso de uso `ChangeUsernameUseCase` hace un batch update de
todos los comentarios del usuario afectado.

**Limitación documentada**: Firestore tiene un límite de 500 escrituras por batch. Si un
usuario tiene más de 500 comentarios, se necesitan múltiples batches secuenciales. Para V1
(colección personal con pocos usuarios), este límite es manejable.

**Alternativas rechazadas**:
| Alternativa | Razón de rechazo |
|-------------|-----------------|
| Resolver nombre desde `/users/{uid}` en tiempo de lectura | N+1 reads por cada comentario mostrado; inaceptable para performance |
| Almacenar solo `authorId` + resolver en presentation layer | Requiere cargar todos los user docs en cada carga de página de piezas |

---

## D-007: Paginación cursor-based

**Contexto**: FR-007 + Const. VII: nunca cargar toda la colección. Firestore soporta
paginación por offset (`.limit().offset()`) y por cursor (`.startAfter(lastDoc)`).

**Decisión**: Paginación exclusivamente por cursor (`startAfter(lastDocument)`).

- Tamaño de página: 20 ítems (configurable por pantalla).
- El cursor es el último documento del lote anterior (no un número de página).
- La UI implementa "cargar más" (infinite scroll o botón "Ver más"), no paginación numerada.

**Rationale**: La paginación por offset en Firestore no es eficiente (lee y descarta los
documentos anteriores al offset). La paginación por cursor es O(1) en costo por página.

---

## D-008: Estrategia de carga de Favoritos / En Colección

**Contexto**: Las subcollecciones `/users/{uid}/favorites/` y `/users/{uid}/collection/`
almacenan solo el `pieceId` + fecha. Para mostrar los tiles de las piezas favoritas, se
necesitan los datos de cada pieza.

**Decisión**: Carga en dos pasos con paginación propia:
1. Listar los N `pieceId` más recientes del usuario (paginados por `createdAt` desc).
2. Cargar los documentos de pieza correspondientes en batch (hasta 20 lecturas paralelas).
3. Filtrar client-side los que no existen o tienen `status !== 'published'` (deleted/draft).

Este filtrado client-side es aceptable porque opera sobre un lote pequeño y acotado (20
ítems por página) ya pre-cargado.

---

## D-009: Framework y tooling

| Decisión | Elección | Rationale |
|----------|----------|-----------|
| Framework UI | React 18 | Especificado por el stack obligatorio |
| Build tool | Vite 5 | Especificado; HMR rápido, ESM nativo, compatible con Firebase Hosting deploy |
| Lenguaje | TypeScript 5 (strict) | Especificado; tipado fuerte para modelado de dominio |
| Test runner | Vitest | Compatible con Vite/TypeScript; API similar a Jest; sin configuración extra |
| Security Rules testing | `@firebase/rules-unit-testing` | Biblioteca oficial para tests de reglas contra emulador |
| Emulator | Firebase Emulator Suite (Firestore + Auth) | Mandatorio por Const. VI; no se testea contra producción |

---

## D-010: Campos específicos por categoría — modelo extensible

**Contexto**: FR-026: nuevas categorías deben poder definir sus propios campos sin alterar
piezas existentes.

**Decisión**: Campo `specificFields: Record<string, unknown>` en el documento de pieza.
La entidad `Category` almacena un `fieldSchema: FieldDefinition[]` que define las claves
válidas, etiquetas y tipos para su categoría. El dominio valida que `specificFields`
conforme al `fieldSchema` de la categoría antes de persistir.

Ejemplo de schema para Aerolíneas:
```
fieldSchema: [
  { key: "airline", label: "Aerolínea", fieldType: "string", required: false },
  { key: "subtype", label: "Subtipo",   fieldType: "string", required: false }
]
```

Cuando se agrega una categoría nueva (ej. "Relojes"), solo se crea un nuevo documento en
`/categories/` con su `fieldSchema`; las piezas existentes no se tocan.

**Limitación**: Firestore no valida el schema de `specificFields`; la validación es
responsabilidad exclusiva del dominio cliente + Security Rules (validación de integridad
básica).
