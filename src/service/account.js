import {collection, addDoc, doc, updateDoc, deleteDoc, getDocs} from 'firebase/firestore';
import {db} from '../firebase/config.js';

const accountRef = collection(db, 'accounts');

export const getAccounts = async () => {
    const snapshot = await getDocs(accountRef);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
}

export const createAccount = async ({nombre, total}) => {
    return await addDoc(accountRef,
        {
            nombre,
            total: Number(total)
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