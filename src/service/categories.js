import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/config.js'

const categoriesRef = collection(db, 'categories')

export const getCategories = async (userId) => {
  const q = query(categoriesRef, where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }))
}

export const createCategory = async ({ nombre, icono, color, userId }) => {
  return await addDoc(categoriesRef, {
    nombre,
    icono: icono || '',
    color: color || '#22c55e',
    userId,
  })
}

export const updateCategory = async (id, data) => {
  const ref = doc(db, 'categories', id)
  return await updateDoc(ref, data)
}

export const deleteCategory = async (id) => {
  const ref = doc(db, 'categories', id)
  return await deleteDoc(ref)
}
const DEFAULT_CATEGORIES = [
  { nombre: 'Salud', icono: 'stethoscope', color: '#ef4444' },
  { nombre: 'Ocio', icono: 'gamepad-2', color: '#8b5cf6' },
  { nombre: 'Casa', icono: 'home', color: '#f59e0b' },
  { nombre: 'Café', icono: 'beer', color: '#6b4423' },
  { nombre: 'Educación', icono: 'book-open', color: '#3b82f6' },
  { nombre: 'Regalos', icono: 'gift', color: '#ec4899' },
  { nombre: 'Alimentación', icono: 'utensils', color: '#10b981' },
  { nombre: 'Familia', icono: 'baby', color: '#f97316' },
  { nombre: 'Rutina', icono: 'briefcase', color: '#06b6d4' },
  { nombre: 'Transporte', icono: 'car', color: '#64748b' },
  { nombre: 'Otros', icono: 'piggy-bank', color: '#a855f7' },
]

export const initializeDefaultCategories = async (userId) => {
  // Verificar si el usuario ya tiene categorías
  const existingCategories = await getCategories(userId)
  
  if (existingCategories.length === 0) {
    // Crear las categorías predefinidas
    const promises = DEFAULT_CATEGORIES.map(cat => 
      createCategory({ ...cat, userId })
    )
    await Promise.all(promises)
  }
}