/**
 * T044 — FirestoreUserRepository
 *
 * Implementación concreta de IUserRepository usando Firestore SDK v10 modular.
 * `listenToUser` usa onSnapshot para detectar cambio de `enabled` en tiempo real
 * (research.md D-004, FR-039, SEC-005).
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@infrastructure/firebase/firebaseConfig'
import type { IUserRepository, UserData } from '@domain/user/IUserRepository'
import type { Role } from '@domain/user/Role'

export class FirestoreUserRepository implements IUserRepository {
  async findAll(): Promise<UserData[]> {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => this.toUserData(d.id, d.data()))
  }

  async findByUid(uid: string): Promise<UserData | null> {
    const ref = doc(db, 'users', uid)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return null
    return this.toUserData(uid, snapshot.data())
  }

  async update(
    uid: string,
    data: Partial<Omit<UserData, 'uid' | 'createdAt'>>,
  ): Promise<void> {
    const ref = doc(db, 'users', uid)
    await updateDoc(ref, data)
  }

  listenToUser(
    uid: string,
    callback: (data: UserData | null) => void,
  ): () => void {
    const ref = doc(db, 'users', uid)
    return onSnapshot(ref, snapshot => {
      if (!snapshot.exists()) {
        callback(null)
      } else {
        callback(this.toUserData(uid, snapshot.data()))
      }
    })
  }

  private toUserData(uid: string, data: Record<string, unknown>): UserData {
    return {
      uid,
      username: data['username'] as string,
      role: data['role'] as Role,
      enabled: data['enabled'] as boolean,
      createdAt: (data['createdAt'] as { toDate?: () => Date } | null)?.toDate?.() ?? new Date(),
    }
  }
}
