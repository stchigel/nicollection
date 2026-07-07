/**
 * T041 — FirestoreCategoryRepository
 *
 * Implementación concreta de ICategoryRepository usando Firestore SDK v10 modular.
 * Mapea documentos de /categories/ a CategoryData ordenados por displayOrder.
 */
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '@infrastructure/firebase/firebaseConfig'
import type { ICategoryRepository, CategoryData } from '@domain/category/ICategoryRepository'
import type { CategoryType } from '@domain/category/CategoryType'
import type { FieldDefinition } from '@domain/category/FieldDefinition'

export class FirestoreCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<CategoryData[]> {
    const q = query(
      collection(db, 'categories'),
      orderBy('displayOrder', 'asc'),
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data['name'] as string,
        type: data['type'] as CategoryType,
        externalUrl: (data['externalUrl'] as string | null) ?? null,
        displayOrder: data['displayOrder'] as number,
        fieldSchema: (data['fieldSchema'] ?? []) as FieldDefinition[],
        createdAt: data['createdAt']?.toDate() ?? new Date(),
        updatedAt: data['updatedAt']?.toDate() ?? new Date(),
      }
    })
  }
}
