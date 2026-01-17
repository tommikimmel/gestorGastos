import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config.js'

const categoriesRef = collection(db, 'categories')

export const getCategories = async () => {
  const snapshot = await getDocs(categoriesRef)
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }))
}

export const createCategory = async ({ nombre, icono, color }) => {
  return await addDoc(categoriesRef, {
    nombre,
    icono: icono || '',
    color: color || '#22c55e',
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
