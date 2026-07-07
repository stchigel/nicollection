/**
 * T042 — FirestorePieceRepository
 *
 * Implementa IPieceRepository usando Firestore SDK v10 modular.
 * - findByCategory: paginado con limit(20) + startAfter — nunca sin limit (RNF-007)
 * - findById: respeta draft → solo admin
 * - create/update/delete: solo admin (reforzado por Security Rules)
 */
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
  deleteDoc,
  addDoc,
} from 'firebase/firestore'
import { db } from '@infrastructure/firebase/firebaseConfig'
import type {
  IPieceRepository,
  PieceData,
  PieceFilters,
  PieceListResult,
  AdminDataFields,
} from '@domain/piece/IPieceRepository'
import type { Role } from '@domain/user/Role'
import type { PublicationStatus } from '@domain/piece/PublicationStatus'

const PAGE_SIZE = 20

function toPieceData(id: string, data: Record<string, unknown>): PieceData {
  return {
    id,
    categoryId: data['categoryId'] as string,
    title: data['title'] as string,
    description: (data['description'] as string) ?? '',
    tags: (data['tags'] as string[]) ?? [],
    year: (data['year'] as number | null) ?? null,
    country: (data['country'] as string | null) ?? null,
    pieceType: (data['pieceType'] as string | null) ?? null,
    imageUrl: (data['imageUrl'] as string | null) ?? null,
    status: data['status'] as PublicationStatus,
    specificFields: (data['specificFields'] as Record<string, unknown>) ?? {},
    searchTokens: (data['searchTokens'] as string[]) ?? [],
    createdAt: (data['createdAt'] as { toDate?: () => Date } | null)?.toDate?.() ?? new Date(),
    updatedAt: (data['updatedAt'] as { toDate?: () => Date } | null)?.toDate?.() ?? new Date(),
    createdBy: (data['createdBy'] as string) ?? '',
  }
}

export class FirestorePieceRepository implements IPieceRepository {
  async findByCategory(
    categoryId: string,
    _filters: PieceFilters,
    cursor: unknown | null,
    role: Role,
    pageSize = PAGE_SIZE,
  ): Promise<PieceListResult> {
    const statusFilter = role === 'admin'
      ? ['published', 'draft']
      : ['published']

    // Base query — I-001 index
    let q = query(
      collection(db, 'pieces'),
      where('categoryId', '==', categoryId),
      where('status', 'in', statusFilter),
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    )

    if (cursor) q = query(q, startAfter(cursor as DocumentSnapshot))

    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(d => toPieceData(d.id, d.data()))
    const nextCursor = snapshot.docs.length === pageSize
      ? snapshot.docs[snapshot.docs.length - 1]
      : null

    return { items, nextCursor }
  }

  async searchByTokens(
    categoryId: string,
    searchQuery: string,
    cursor: unknown | null,
    role: Role,
    pageSize = PAGE_SIZE,
  ): Promise<PieceListResult> {
    const token = searchQuery.toLowerCase().trim()
    const statusFilter = role === 'admin' ? ['published', 'draft'] : ['published']

    let q = query(
      collection(db, 'pieces'),
      where('categoryId', '==', categoryId),
      where('status', 'in', statusFilter),
      where('searchTokens', 'array-contains', token),
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    )

    if (cursor) q = query(q, startAfter(cursor as DocumentSnapshot))

    const snapshot = await getDocs(q)
    const items = snapshot.docs.map(d => toPieceData(d.id, d.data()))
    const nextCursor = snapshot.docs.length === pageSize
      ? snapshot.docs[snapshot.docs.length - 1]
      : null

    return { items, nextCursor }
  }

  async findById(id: string, role: Role): Promise<PieceData | null> {
    const ref = doc(db, 'pieces', id)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return null
    const data = toPieceData(id, snapshot.data())
    if (data.status === 'draft' && role !== 'admin') return null
    return data
  }

  async findAdminData(pieceId: string): Promise<AdminDataFields | null> {
    const ref = doc(db, 'pieces', pieceId, 'private', 'adminData')
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return null
    const d = snapshot.data()
    return {
      functioning: d['functioning'] ?? 'na',
      hasBox: d['hasBox'] ?? 'na',
      accessories: d['accessories'] ?? [],
      condition: d['condition'] ?? 'good',
      provenance: d['provenance'] ?? null,
      acquisitionDate: d['acquisitionDate']?.toDate?.() ?? null,
      notes: d['notes'] ?? null,
      updatedAt: d['updatedAt']?.toDate?.() ?? new Date(),
    }
  }

  async create(
    data: Omit<PieceData, 'id'>,
    adminData: Omit<AdminDataFields, 'updatedAt'>,
  ): Promise<string> {
    const pieceRef = await addDoc(collection(db, 'pieces'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    // adminData en subcollección /pieces/{id}/private/adminData
    const adminRef = doc(db, 'pieces', pieceRef.id, 'private', 'adminData')
    await setDoc(adminRef, { ...adminData, updatedAt: serverTimestamp() })
    return pieceRef.id
  }

  async update(
    id: string,
    data: Partial<Omit<PieceData, 'id'>>,
    adminData?: Partial<Omit<AdminDataFields, 'updatedAt'>>,
  ): Promise<void> {
    const ref = doc(db, 'pieces', id)
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
    if (adminData) {
      const adminRef = doc(db, 'pieces', id, 'private', 'adminData')
      await updateDoc(adminRef, { ...adminData, updatedAt: serverTimestamp() })
    }
  }

  async delete(id: string): Promise<void> {
    // Borrar adminData
    const adminRef = doc(db, 'pieces', id, 'private', 'adminData')
    await deleteDoc(adminRef).catch(() => {})
    // Borrar pieza principal
    await deleteDoc(doc(db, 'pieces', id))
  }

  async countDependencies(pieceId: string): Promise<{
    commentCount: number
    favoriteCount: number
    collectionCount: number
  }> {
    const [commentsSnap, favSnap, colSnap] = await Promise.all([
      getDocs(query(collection(db, 'comments'), where('pieceId', '==', pieceId))),
      getDocs(query(collectionGroup(db, 'favorites'), where('pieceId', '==', pieceId))),
      getDocs(query(collectionGroup(db, 'collection'), where('pieceId', '==', pieceId))),
    ])
    return {
      commentCount: commentsSnap.size,
      favoriteCount: favSnap.size,
      collectionCount: colSnap.size,
    }
  }

  // Elimina todos los comentarios de una pieza en batches de ≤500
  async deleteAllCommentsByPiece(pieceId: string): Promise<void> {
    const q = query(collection(db, 'comments'), where('pieceId', '==', pieceId))
    const snapshot = await getDocs(q)
    const docs = snapshot.docs
    for (let i = 0; i < docs.length; i += 500) {
      const batch = writeBatch(db)
      docs.slice(i, i + 500).forEach(d => batch.delete(d.ref))
      await batch.commit()
    }
  }
}
