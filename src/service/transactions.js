import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where, getDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'

const transactionRef = collection(db, 'transactions')

export const createIngreso = async ({ monto, cuentaId, fecha, descripcion, categoriaIngreso, userId }) => {
    const numericMonto = Number(monto)

    await addDoc(transactionRef, {
        tipo: 'INGRESO',
        monto: numericMonto,
        cuentaId,
        fecha,
        descripcion: descripcion || '',
        categoriaIngreso: categoriaIngreso || 'OTROS',
        userId,
    })

    if (cuentaId) {
        const accountRef = doc(db, 'accounts', cuentaId)
        await updateDoc(accountRef, {
            total: increment(numericMonto),
        })
    }
}

export const getIngresos = async (userId) => {
    const q = query(
        transactionRef, 
        where('tipo', '==', 'INGRESO'),
        where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
    }))
}

export const updateIngreso = async (id, data) => {
    const ref = doc(db, 'transactions', id)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
        return
    }

    const prev = snap.data()

    const newMonto =
        data.monto != null ? Number(data.monto) : Number(prev.monto || 0)
    const prevMonto = Number(prev.monto || 0)

    const newCuentaId = data.cuentaId || prev.cuentaId
    const prevCuentaId = prev.cuentaId

    const payload = { ...data, monto: newMonto }

    await updateDoc(ref, payload)

    // Ajustar totales de cuentas
    if (prevCuentaId === newCuentaId) {
        if (prevCuentaId) {
            const accountRef = doc(db, 'accounts', prevCuentaId)
            const delta = newMonto - prevMonto
            if (delta !== 0) {
                await updateDoc(accountRef, { total: increment(delta) })
            }
        }
    } else {
        if (prevCuentaId) {
            const prevAccountRef = doc(db, 'accounts', prevCuentaId)
            await updateDoc(prevAccountRef, { total: increment(-prevMonto) })
        }

        if (newCuentaId) {
            const newAccountRef = doc(db, 'accounts', newCuentaId)
            await updateDoc(newAccountRef, { total: increment(newMonto) })
        }
    }
}

export const deleteIngreso = async (id) => {
    const ref = doc(db, 'transactions', id)
    const snap = await getDoc(ref)

    if (snap.exists()) {
        const data = snap.data()
        const monto = Number(data.monto || 0)
        const cuentaId = data.cuentaId

        if (cuentaId && monto) {
            const accountRef = doc(db, 'accounts', cuentaId)
            await updateDoc(accountRef, { total: increment(-monto) })
        }
    }

    await deleteDoc(ref)
}

// --- Gastos ---

export const createGasto = async ({ monto, cuentaId, categoriaId, fecha, descripcion, userId }) => {
    const numericMonto = Number(monto)

    if (!cuentaId || !categoriaId) {
        throw new Error('Cuenta y categoría son obligatorias')
    }

    if (!Number.isFinite(numericMonto) || numericMonto <= 0) {
        throw new Error('El monto del gasto debe ser mayor a 0')
    }

    const accountRef = doc(db, 'accounts', cuentaId)
    const accountSnap = await getDoc(accountRef)

    const currentTotal = Number(accountSnap.data()?.total || 0)

    if (numericMonto > currentTotal) {
        throw new Error('El monto del gasto no puede superar el saldo de la cuenta')
    }

    await addDoc(transactionRef, {
        tipo: 'GASTO',
        monto: numericMonto,
        cuentaId,
        categoriaId,
        fecha,
        descripcion: descripcion || '',
        userId,
    })

    await updateDoc(accountRef, {
        total: increment(-numericMonto),
    })
}

export const getGastos = async (userId) => {
    const q = query(
        transactionRef, 
        where('tipo', '==', 'GASTO'),
        where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
    }))
}

export const updateGasto = async (id, data) => {
    const ref = doc(db, 'transactions', id)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
        return
    }

    const prev = snap.data()

    const newMonto =
        data.monto != null ? Number(data.monto) : Number(prev.monto || 0)
    const prevMonto = Number(prev.monto || 0)

    if (!Number.isFinite(newMonto) || newMonto <= 0) {
        throw new Error('El monto del gasto debe ser mayor a 0')
    }

    const newCuentaId = data.cuentaId || prev.cuentaId
    const prevCuentaId = prev.cuentaId

    const payload = { ...data, monto: newMonto }

    // Validaciones de saldo antes de aplicar cambios
    if (prevCuentaId === newCuentaId) {
        if (prevCuentaId) {
            const accountRef = doc(db, 'accounts', prevCuentaId)
            const delta = newMonto - prevMonto

            if (delta > 0) {
                const accSnap = await getDoc(accountRef)
                const currentTotal = Number(accSnap.data()?.total || 0)
                if (delta > currentTotal) {
                    throw new Error('El monto del gasto no puede superar el saldo de la cuenta')
                }
            }

            await updateDoc(ref, payload)

            if (delta !== 0) {
                await updateDoc(accountRef, { total: increment(-delta) })
            }
        } else {
            await updateDoc(ref, payload)
        }
    } else {
        // Cambió la cuenta del gasto
        const updates = []

        if (prevCuentaId) {
            const prevAccountRef = doc(db, 'accounts', prevCuentaId)
            updates.push(updateDoc(prevAccountRef, { total: increment(prevMonto) }))
        }

        if (newCuentaId) {
            const newAccountRef = doc(db, 'accounts', newCuentaId)
            const accSnap = await getDoc(newAccountRef)
            const currentTotal = Number(accSnap.data()?.total || 0)

            if (newMonto > currentTotal) {
                throw new Error('El monto del gasto no puede superar el saldo de la nueva cuenta')
            }

            updates.push(updateDoc(newAccountRef, { total: increment(-newMonto) }))
        }

        await updateDoc(ref, payload)
        await Promise.all(updates)
    }
}

export const deleteGasto = async (id) => {
    const ref = doc(db, 'transactions', id)
    const snap = await getDoc(ref)

    if (snap.exists()) {
        const data = snap.data()
        const monto = Number(data.monto || 0)
        const cuentaId = data.cuentaId

        if (cuentaId && monto) {
            const accountRef = doc(db, 'accounts', cuentaId)
            await updateDoc(accountRef, { total: increment(monto) })
        }
    }

    await deleteDoc(ref)
}