# Implementation Plan: nicollection V1 — Vitrina de Colección Personal

**Branch**: `001-vitrina-coleccion` | **Date**: 2026-07-07 | **Spec**: `specs/001-vitrina-coleccion/spec.md`

## Summary

Sistema de vitrina virtual + archivo de colección personal. La home muestra tiles de
categorías (internas y externas); las categorías internas navegan a listados paginados con
búsqueda y filtros; las externas redirigen a Colnect. Los visitantes autenticados pueden
comentar, marcar favoritos y gestionar una colección personal. El administrador gestiona el
ABM de piezas y cuentas de usuario. Toda la lógica es client-side usando el SDK oficial de
Firebase; no existe backend propio ni Functions.

## Technical Context

| Campo              | Valor                                                                       |
|--------------------|-----------------------------------------------------------------------------|
| **Language**       | TypeScript 5.x (strict mode obligatorio)                                    |
| **Frontend**       | React 18 + Vite 5                                                           |
| **Firebase SDK**   | Firebase JS SDK v9+ (modular / tree-shakeable)                              |
| **Persistencia**   | Cloud Firestore (modo nativo)                                               |
| **Auth**           | Firebase Authentication (email/password)                                    |
| **Hosting**        | Firebase Hosting (deploy estático del bundle Vite)                          |
| **Testing**        | Vitest + `@firebase/rules-unit-testing` + Firebase Emulator Suite           |
| **Plataforma**     | Web SPA — desktop (≥ 1280 px) y mobile (≥ 375 px)                          |
| **Escala/Scope**   | Miles de piezas en categorías internas; decenas de usuarios concurrentes    |
| **Restricciones**  | Sin backend propio; sin Firebase Functions; sin APIs externas en V1;        |
|                    | Colnect API y storage de imágenes fuera de scope de V1                      |

## Constitution Check

| # | Gate | Principio | Estado |
|---|------|-----------|--------|
| G1 | Spec aprobada con US + FR trazados | I — Spec manda | ✅ 8 US, 56 FR, 6 SEC en spec.md |
| G2 | Sin Firebase Functions / backend propio | IV — Firebase-only | ✅ stack: React + Vite + SDK; cero Functions |
| G3 | Imágenes y Colnect explícitamente fuera de scope | IV, XI | ✅ FR-056 + Assumptions en spec.md |
| G4 | Toda regla de negocio importante tiene tests planeados | VI — Tests obligatorios | ✅ `tests/security/` y `tests/unit/` en estructura |
| G5 | Consultas sobre colecciones con paginación por cursor (`startAfter`) | VII — Escalar | ✅ ver research.md § Paginación |
| G6 | Índices Firestore declarados en `firestore.indexes.json` | VII — Escalar | ✅ 9 índices en data-model.md |
| G7 | Toda regla de acceso/integridad tiene contraparte en `firestore.rules` | X — Defense in Depth | ✅ Security Rules completas en data-model.md |
| G8 | Cambios en `firestore.rules` van en el mismo commit que cambios de dominio | X — Defense in Depth | ✅ política de commits en §Workflow |
| G9 | Los tres roles (Público, Visitante, Admin) considerados en diseño de acceso | XII — Control de acceso | ✅ SEC-001 a SEC-006 en spec.md |
| G10 | No se introducen abstracciones sin problema concreto | V — YAGNI | ⚠️ search-tokens pattern → justificado en Complexity Tracking |

## Project Structure

### Documentation (esta feature)

```text
specs/001-vitrina-coleccion/
├── spec.md              ← fuente de verdad funcional
├── plan.md              ← este archivo
├── research.md          ← decisiones técnicas y alternativas
├── data-model.md        ← entidades, Firestore schema, Security Rules
├── quickstart.md        ← guía de validación de extremo a extremo
└── contracts/
    └── firebase-schema.yaml   ← contrato de colecciones Firestore
```

### Source Code (repositorio raíz)

```text
nicollection/
├── src/
│   ├── domain/                        # Reglas de negocio puras — sin dependencias externas
│   │   ├── category/
│   │   │   ├── Category.ts            # Entidad: Category (isInternal, isExternal)
│   │   │   ├── CategoryType.ts        # Enum: 'internal' | 'external'
│   │   │   └── FieldDefinition.ts     # Value Object: definición de campo específico
│   │   ├── piece/
│   │   │   ├── Piece.ts               # Aggregate Root: Piece (publish, draft, validate)
│   │   │   ├── PublicationStatus.ts   # Enum: 'published' | 'draft'
│   │   │   ├── AdminData.ts           # Value Object: campos admin-only
│   │   │   └── PieceType.ts           # Value Object: tipo de pieza
│   │   ├── user/
│   │   │   ├── User.ts                # Entidad: User (enable, disable, changeUsername)
│   │   │   ├── Role.ts                # Enum: 'visitor' | 'admin'
│   │   │   └── Username.ts            # Value Object: invariantes de nombre de usuario
│   │   ├── comment/
│   │   │   └── Comment.ts             # Entidad: Comment (editText, canBeEdited/Deleted)
│   │   └── interaction/
│   │       ├── Favorite.ts            # Value Object: marcado de favorito
│   │       └── CollectionEntry.ts     # Value Object: entrada en colección personal
│   │
│   ├── application/                   # Casos de uso — orquestan dominio + repositorios
│   │   ├── pieces/
│   │   │   ├── ListPiecesUseCase.ts
│   │   │   ├── SearchPiecesUseCase.ts
│   │   │   ├── GetPieceDetailUseCase.ts
│   │   │   ├── CreatePieceUseCase.ts
│   │   │   ├── UpdatePieceUseCase.ts
│   │   │   └── DeletePieceUseCase.ts  # incluye preview de dependencias + cascada
│   │   ├── categories/
│   │   │   └── ListCategoriesUseCase.ts
│   │   ├── comments/
│   │   │   ├── AddCommentUseCase.ts
│   │   │   ├── EditCommentUseCase.ts
│   │   │   └── DeleteCommentUseCase.ts
│   │   ├── interactions/
│   │   │   ├── ToggleFavoriteUseCase.ts
│   │   │   └── ToggleCollectionUseCase.ts
│   │   └── users/
│   │       ├── RegisterUseCase.ts     # crea user doc + /usernames en transacción
│   │       ├── DisableUserUseCase.ts
│   │       ├── EnableUserUseCase.ts
│   │       └── ChangeUsernameUseCase.ts  # actualiza /usernames + batch update comments
│   │
│   ├── infrastructure/                # Adaptadores Firebase — implementan interfaces del dominio
│   │   ├── firebase/
│   │   │   └── firebaseConfig.ts      # inicialización del SDK
│   │   └── repositories/
│   │       ├── FirestorePieceRepository.ts
│   │       ├── FirestoreCategoryRepository.ts
│   │       ├── FirestoreCommentRepository.ts
│   │       ├── FirestoreUserRepository.ts
│   │       └── FirestoreInteractionRepository.ts
│   │
│   ├── presentation/                  # View-models — traducen dominio → UI
│   │   ├── pieces/
│   │   │   ├── PieceSummaryViewModel.ts   # campos públicos para listado
│   │   │   └── PieceDetailViewModel.ts    # todos los campos según rol
│   │   ├── categories/
│   │   │   └── CategoryViewModel.ts
│   │   └── users/
│   │       └── UserViewModel.ts
│   │
│   └── ui/                            # React — consume solo presentation
│       ├── components/                # componentes reutilizables
│       ├── pages/
│       │   ├── HomePage.tsx           # grilla de categorías
│       │   ├── CategoryPage.tsx       # listado + filtros + búsqueda
│       │   ├── PieceDetailPage.tsx    # ficha de pieza + comentarios
│       │   ├── ProfilePage.tsx        # Mis Favoritos / Mi Colección / Mis Comentarios
│       │   ├── AuthPage.tsx           # registro e inicio de sesión
│       │   └── admin/
│       │       ├── PieceFormPage.tsx  # formulario alta/edición de pieza
│       │       ├── PieceListPage.tsx  # panel admin con Publicadas y Borradores
│       │       └── UsersPage.tsx      # gestión de cuentas de usuario
│       └── hooks/
│           ├── useAuth.ts             # estado de autenticación + rol
│           ├── usePieces.ts           # listado, paginación, filtros
│           └── useInteractions.ts     # favoritos, colección, comentarios
│
├── tests/
│   ├── security/          # Tests de Firestore Security Rules — OBLIGATORIOS
│   │   ├── pieces.rules.test.ts
│   │   ├── users.rules.test.ts
│   │   ├── comments.rules.test.ts
│   │   └── interactions.rules.test.ts
│   ├── unit/              # Tests de reglas de negocio del dominio — OBLIGATORIOS
│   │   ├── Piece.test.ts
│   │   ├── User.test.ts
│   │   ├── Comment.test.ts
│   │   └── Username.test.ts
│   └── integration/       # Tests de casos de uso completos — opcionales
│
├── firestore.rules        # Security Rules — sincronizadas con dominio en cada commit
├── firestore.indexes.json # Índices compuestos declarados
├── firebase.json
├── .firebaserc
├── vite.config.ts
├── tsconfig.json          # strict: true obligatorio
└── package.json
```

**Structure Decision**: Aplicación web (opción 2 del template, adaptada). No hay backend
separado: todo es frontend SPA. La capa `infrastructure/` actúa como backend-replacement
(adapta el SDK de Firebase al dominio). Las Security Rules actúan como "servidor de
autorización". Estructura de capas: `domain → application → infrastructure ↑` y
`domain → presentation → ui`.

## Requisitos No Funcionales

| ID | Requisito | Fuente |
|----|-----------|--------|
| RNF-001 | Tiempo de respuesta de búsqueda/filtrado < 5 segundos bajo carga normal | SC-002, SC-003 |
| RNF-002 | El sistema soporta miles de piezas por categoría sin degradación; paginación cursor-based obligatoria | SC-003, FR-007 |
| RNF-003 | Múltiples usuarios concurrentes sin degradación; Firestore gestiona la concurrencia nativamente | SC-004 |
| RNF-004 | Interfaz funcional en dispositivos móviles ≥ 375 px y escritorio ≥ 1280 px | SC-008 |
| RNF-005 | 100% de reglas de control de acceso (SEC-001 a SEC-006) cubiertas por tests automáticos | SC-011, Const. VI |
| RNF-006 | Inhabilitación de usuario efectiva en < 60 segundos tras la acción del Admin | SC-010 |
| RNF-007 | Ningún listado completo de piezas de una colección se carga en memoria del cliente | FR-007, Const. VII |
| RNF-008 | Toda regla de acceso implementada tanto en dominio cliente como en `firestore.rules` | Const. X |
| RNF-009 | TypeScript strict mode habilitado; sin `any` implícitos ni aserciones de tipo sin justificar | Stack obligatorio |
| RNF-010 | Navegación desde home hasta ficha de pieza en ≤ 3 interacciones | SC-001 |

## Trazabilidad

| Historia de Usuario | Requisitos Funcionales | Reglas de Seguridad | Entidades de Dominio |
|---------------------|------------------------|---------------------|----------------------|
| US1 — Explorar categorías | FR-001, FR-005, FR-006 | SEC-001 (lectura pública de categorías) | `Category`, `CategoryType` |
| US2 — Filtrar piezas | FR-007 a FR-014 | SEC-001 (solo piezas publicadas para Público/Visitante) | `Piece.isPublished()`, `PublicationStatus` |
| US3 — Detalle de pieza | FR-015 a FR-018 | SEC-001, SEC-002, SEC-003, SEC-004(a)(d) | `Piece`, `Comment` |
| US4 — Categoría externa | FR-003, FR-004, FR-005 | SEC-004 (ningún ABM para categorías externas) | `Category.isExternal()` |
| US5 — Registro / login | FR-034 a FR-039 | SEC-004(e) (no autoasignación admin), SEC-005 | `User`, `Username`, `Role` |
| US6 — Interacciones visitante | FR-040 a FR-049 | SEC-002, SEC-004(c) | `Comment`, `Favorite`, `CollectionEntry` |
| US7 — ABM piezas | FR-019 a FR-033 | SEC-003, SEC-004(a)(b)(d) | `Piece`, `AdminData`, `FieldDefinition` |
| US8 — Gestión usuarios | FR-050 a FR-055 | SEC-006 (no escalado de privilegios) | `User.canBeDisabledBy()`, `User.changeUsername()` |

## Workflow de Commits

- Todo cambio en `firestore.rules` que derive de un cambio de dominio va en el **mismo commit**.
- Los tests de Security Rules y tests unitarios del dominio afectado se incluyen en el mismo commit o PR.
- Formato de mensaje de commit sugerido: `feat(dominio): descripción [US-N, FR-NNN]`

## Complexity Tracking

| Decisión | Problema concreto | Alternativa más simple rechazada | Justificación |
|----------|-------------------|----------------------------------|---------------|
| Search-tokens array en piezas | Búsqueda de texto libre sobre miles de piezas sin backend | Filtrado client-side en memoria | FR-007 prohíbe cargar toda la colección; no hay Functions ni servicio externo de search |
| Subcollección `/pieces/{id}/private/adminData` | Firestore no permite ocultar campos parciales de un documento | Almacenar campos admin en el documento principal | SEC-004(a): campos admin NO deben ser legibles por Público/Visitante; Firestore solo permite allow/deny por documento entero |
| Colección `/usernames/{username}` como índice de unicidad | Firestore no tiene UNIQUE constraints | Comprobar en consulta antes de crear | La consulta con `where` no es atómica; se necesita una escritura transaccional que garantice unicidad |
| Real-time listener en documento de usuario para detección de inhabilitación | RNF-006 requiere < 60 s; Firebase Auth no revoca tokens sin Admin SDK | Dejar que el token expire (hasta 1 hora) | Sin Functions no hay otra forma de invalidar sesión activa en tiempo real |
