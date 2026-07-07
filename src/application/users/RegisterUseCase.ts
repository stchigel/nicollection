/**
 * T050 — RegisterUseCase
 *
 * Flujo completo de registro:
 * 1. Valida Username via Username.create()
 * 2. Crea cuenta en Firebase Auth (email/password)
 * 3. Transacción Firestore: /usernames/{username} (unicidad) + /users/{uid}
 *
 * [US5, FR-034/035/036, research.md D-005]
 */
import {
  createUserWithEmailAndPassword,
  type Auth,
} from 'firebase/auth'
import {
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore'
import { Username } from '@domain/user/Username'
import { DomainError } from '@domain/errors/DomainError'

export interface RegisterInput {
  email: string
  password: string
  username: string
}

export class RegisterUseCase {
  constructor(
    private readonly auth: Auth,
    private readonly db: Firestore,
  ) {}

  async execute(input: RegisterInput): Promise<void> {
    // 1. Validar username con reglas del dominio (lanza DomainError si inválido)
    Username.create(input.username)

    // 2. Crear cuenta en Firebase Auth (lanza FirebaseError si email duplicado)
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      input.email,
      input.password,
    )
    const uid = credential.user.uid

    // 3. Transacción Firestore: unicidad de username + creación de documentos
    const usernameRef = doc(this.db, 'usernames', input.username)
    const userRef = doc(this.db, 'users', uid)

    try {
      await runTransaction(this.db, async tx => {
        const existingUsername = await tx.get(usernameRef)
        if (existingUsername.exists()) {
          throw new DomainError('El nombre de usuario ya está en uso')
        }
        tx.set(usernameRef, { uid })
        tx.set(userRef, {
          username: input.username,
          role: 'visitor',
          enabled: true,
          createdAt: serverTimestamp(),
        })
      })
    } catch (error) {
      // Si la transacción falla, la cuenta de Auth queda huérfana.
      // Intentar eliminarla para limpiar el estado (best-effort).
      try {
        await credential.user.delete()
      } catch {
        // Ignorar error de limpieza
      }
      throw error
    }
  }
}
