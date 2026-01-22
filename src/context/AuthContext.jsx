import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'
import { initializeDefaultCategories } from '../service/categories'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      // Si hay un usuario autenticado, inicializar categorías predefinidas
      if (user) {
        try {
          await initializeDefaultCategories(user.uid)
        } catch (error) {
          console.error('Error al inicializar categorías:', error)
        }
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    return await signOut(auth)
  }

  const loginWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider)
  }

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      return await sendEmailVerification(auth.currentUser)
    }
  }

  const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    sendVerificationEmail,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
