import { useState, useEffect } from "react"
import { Wallet, Plus, Trash, Pencil } from "lucide-react"
import { useUserServices } from "../hooks/useUserServices"
import { formatAmount } from "../utils/formatAmount"

export default function Cuentas() {
    const { getAccounts, createAccount, deleteAccount, updateAccount } = useUserServices()

    const [nombre, setNombre] = useState('');
    const [total, setTotal] = useState('');
    const [formularioOpen, setFormularioOpen] = useState(false);
    const [accounts, setAccounts] = useState([]);
    
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmDeleteName, setConfirmDeleteName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    const loadAccounts = async () => {
        const data = await getAccounts();
        setAccounts(data);
    }

    useEffect(() => {
        loadAccounts();
    }, []);


  const resetForm = () => {
    setNombre('');
    setTotal('');
    setEditingId(null);
  }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre || isSubmitting) return;

        setIsSubmitting(true);

        try {
            if (editingId) {
                await updateAccount(editingId, { nombre, total: Number(total) });
            } else {
                await createAccount({ nombre, total });
            }

            await loadAccounts();
            resetForm();
            setFormularioOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    const openDeleteConfirm = (account) => {
        setConfirmDeleteId(account.id);
        setConfirmDeleteName(account.nombre);
    }

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId || isDeleting) return;

        setIsDeleting(true);

        try {
            await deleteAccount(confirmDeleteId);
            await loadAccounts();
            setConfirmDeleteId(null);
            setConfirmDeleteName('');
        } finally {
            setIsDeleting(false);
        }
    }

    const openCreateForm = () => {
        resetForm();
        setFormularioOpen(true);
    }

    const openEditForm = (account) => {
        setEditingId(account.id);
        setNombre(account.nombre);
        setTotal(String(account.total));
        setFormularioOpen(true);
    }

  return (
    <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center border-b border-slate-700 pb-3 mb-4">
            <div className="flex items-center gap-4">
                <span className="p-4 bg-slate-700/50 rounded border border-slate-600"><Wallet /></span>
                <h2 className="text-3xl font-semibold text-slate-200">Cuentas</h2>
            </div>
            <div className="w-full sm:w-auto sm:ml-auto">
                <button
                        className="w-full sm:w-auto rounded-md border border-slate-600 bg-slate-900/70 px-4 py-2 hover:bg-slate-800 flex items-center justify-center sm:justify-start gap-2 text-slate-100 text-sm font-medium"
                        onClick={openCreateForm}
                >
                        <Plus size="18px" />
                        Nueva cuenta
                </button>
            </div>
        </div>

        {accounts.length === 0 ? (
            <div className="flex justify-center py-10 bg-slate-800 rounded-lg border border-slate-700 mb-6 mt-2">
                <p className="text-sm text-slate-400">Todavía no creaste cuentas.</p>
            </div>
        ) : (
            <div className="mt-4 mb-6 rounded-lg border border-slate-700 bg-slate-900/40 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900/80 text-slate-400">
                        <tr>
                            <th className="px-2 sm:px-4 py-2 text-left font-medium text-xs sm:text-sm">Cuenta</th>
                            <th className="px-2 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">Saldo</th>
                            <th className="px-2 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {accounts.map((account) => (
                            <tr key={account.id} className="hover:bg-slate-900/60">
                                <td className="px-2 sm:px-4 py-2 text-slate-200 text-xs sm:text-sm">
                                    {account.nombre}
                                </td>
                                <td className="px-2 sm:px-4 py-2 text-right font-semibold text-emerald-400 text-xs sm:text-sm">
                                    ${formatAmount(account.total || 0)}
                                </td>
                                <td className="px-2 sm:px-4 py-2">
                                    <div className="flex justify-end gap-1 sm:gap-2">
                                        <button
                                            type="button"
                                            className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-slate-50"
                                            onClick={() => openEditForm(account)}
                                        >
                                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            onClick={() => openDeleteConfirm(account)}
                                        >
                                            <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {formularioOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-800 p-6 rounded-lg shadow-md"
                >
            <div className="border-b-1 border-slate-600 flex items-center mb-2">
                <h3 className="text-xl font-semibold text-slate-200 mb-2">
                    {editingId ? 'Editar cuenta' : 'Crear nueva cuenta'}
                </h3>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-slate-300" htmlFor="nombre">Nombre de la Cuenta</label>
                <input
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-slate-300" htmlFor="total">Total Inicial</label> 
                <input
                    type="number"
                    id="total"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold py-2 px-4 transition-colors duration-200 hover:bg-emerald-500/15 hover:border-emerald-400 mb-2 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
                    {isSubmitting
                        ? (editingId ? 'Guardando...' : 'Creando...')
                        : (editingId ? 'Guardar cambios' : 'Crear cuenta')}
            </button>
            <button
                type="button"
                disabled={isSubmitting}
                className="w-full rounded-md border border-slate-600 bg-slate-800/60 text-slate-200 font-medium py-2 px-4 transition-colors duration-200 hover:bg-slate-700/80 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => {
                    resetForm();
                    setFormularioOpen(false);
                }}
            >
                Cancelar
            </button>
            </form>
            </div>
        )}

        {confirmDeleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
                    <h4 className="text-lg font-semibold text-slate-50 mb-2">Eliminar cuenta</h4>
                    <p className="text-sm text-slate-400 mb-4">
                        ¿Seguro que querés eliminar la cuenta
                        {" "}
                        <span className="font-semibold text-slate-100">{confirmDeleteName}</span>?
                        {" "}
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700/80"
                            onClick={() => {
                                setConfirmDeleteId(null);
                                setConfirmDeleteName('');
                            }}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/15 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </section>
  )
}
