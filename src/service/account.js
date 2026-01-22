import {collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where} from 'firebase/firestore';
import {db} from '../firebase/config.js';

const accountRef = collection(db, 'accounts');

export const getAccounts = async (userId) => {
    const q = query(accountRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
}

export const createAccount = async ({nombre, total, userId}) => {
    return await addDoc(accountRef,
        {
            nombre,
            total: Number(total),
            userId,
        }
    )
}

export const updateAccount = async (id, data) => {
    const ref = doc(db, 'accounts', id);
    return await updateDoc(ref, data);
}

export const deleteAccount = async (id) => {
    const ref = doc(db, 'accounts', id);
    return await deleteDoc(ref);
}