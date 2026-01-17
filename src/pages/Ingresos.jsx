import { useEffect, useMemo, useState } from "react"
import { ArrowDown, Plus, Pencil, Trash, Briefcase, Gift, Coins, PiggyBank } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getAccounts } from "../service/account"
import { createIngreso, getIngresos, updateIngreso, deleteIngreso } from "../service/transactions"
import { formatAmount } from "../utils/formatAmount"

const INCOME_CATEGORIES = [
  { value: "SALARIOS", label: "Salarios", Icon: Briefcase, color: "#22c55e" },
  { value: "REGALO", label: "Regalo", Icon: Gift, color: "#f97316" },
  { value: "INTERES", label: "Interés", Icon: Coins, color: "#0ea5e9" },
  { value: "OTROS", label: "Otros", Icon: PiggyBank, color: "#a855f7" },
]

const INCOME_CATEGORY_META = INCOME_CATEGORIES.reduce((acc, cat) => {
  acc[cat.value] = cat
  return acc
}, {})

export default function Ingresos() {
  const [monto, setMonto] = useState("")
  const [cuentaId, setCuentaId] = useState("")
  const [categoriaIngreso, setCategoriaIngreso] = useState("SALARIOS")
  const [fecha, setFecha] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [ingresos, setIngresos] = useState([])
  const [accounts, setAccounts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [useToday, setUseToday] = useState(true)
  const [isIncomeCategoryDropdownOpen, setIsIncomeCategoryDropdownOpen] = useState(false)

  const accountsMap = useMemo(
    () => Object.fromEntries(accounts.map((acc) => [acc.id, acc.nombre])),
    [accounts],
  )

  const resetForm = () => {
    setMonto("")
    setCuentaId("")
    setCategoriaIngreso("SALARIOS")
    setFecha("")
    setDescripcion("")
    setEditingId(null)
    setUseToday(true)
    setIsIncomeCategoryDropdownOpen(false)
  }

  const loadData = async () => {
    const [accountsData, ingresosData] = await Promise.all([
      getAccounts(),
      getIngresos(),
    ])

    setAccounts(accountsData)
    setIngresos(ingresosData)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!monto || !cuentaId || !fecha || isSubmitting) return

    setIsSubmitting(true)

    try {
      if (editingId) {
        await updateIngreso(editingId, { monto, cuentaId, fecha, descripcion, categoriaIngreso })
      } else {
        await createIngreso({ monto, cuentaId, fecha, descripcion, categoriaIngreso })
      }

      await loadData()
      resetForm()
      setIsFormOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateForm = () => {
    resetForm()
    // por defecto en nuevos ingresos usamos la fecha de hoy
    const today = new Date().toISOString().slice(0, 10)
    setFecha(today)
    setIsFormOpen(true)
  }

  const openEditForm = (ingreso) => {
    setEditingId(ingreso.id)
    setMonto(String(ingreso.monto))
    setCuentaId(ingreso.cuentaId)
    setCategoriaIngreso(ingreso.categoriaIngreso || "OTROS")
    setFecha(ingreso.fecha || "")
    setUseToday(false)
    setDescripcion(ingreso.descripcion || "")
    setIsFormOpen(true)
  }

  const openDeleteConfirm = (id) => {
    setConfirmDeleteId(id)
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId || isDeleting) return

    setIsDeleting(true)

    try {
      await deleteIngreso(confirmDeleteId)
      await loadData()
      setConfirmDeleteId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center border-b border-slate-700 pb-3 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <span className="p-4 bg-slate-700/50 rounded border border-slate-600">
            <ArrowDown />
          </span>
          <h2 className="text-3xl font-semibold text-slate-200">Ingresos</h2>
        </div>
        <div className="w-full sm:w-auto sm:ml-auto">
          <button
            type="button"
            onClick={openCreateForm}
            className="w-full sm:w-auto rounded-md border border-slate-600 bg-slate-900/70 px-4 py-2 hover:bg-slate-800 flex items-center justify-center sm:justify-start gap-2 text-slate-100 text-sm font-medium"
          >
            <Plus size="18px" />
            Nuevo ingreso
          </button>
        </div>
      </motion.div>

      {ingresos.length === 0 ? (
        <div className="flex justify-center py-10 bg-slate-800 rounded-lg border border-slate-700 mb-6 mt-2">
          <p className="text-sm text-slate-400">Todavía no registraste ingresos.</p>
        </div>
      ) : (
        <motion.div
          className="mt-4 mb-6 rounded-lg border border-slate-700 bg-slate-900/40 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-3 sm:px-4 py-2 text-left font-medium text-xs sm:text-sm hidden sm:table-cell">Fecha</th>
                <th className="px-3 sm:px-4 py-2 text-left font-medium text-xs sm:text-sm">Categoría</th>
                <th className="px-3 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">Monto</th>
                <th className="px-3 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ingresos.map((ingreso, index) => {
                const meta =
                  INCOME_CATEGORY_META[ingreso.categoriaIngreso || "OTROS"] ||
                  INCOME_CATEGORY_META.OTROS
                const IconComp = meta?.Icon

                return (
                  <motion.tr
                    key={ingreso.id}
                    className="hover:bg-slate-900/60"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <td className="px-3 sm:px-4 py-2 text-slate-200 text-xs hidden sm:table-cell">
                      {ingreso.fecha || "-"}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-slate-200 text-xs">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className="inline-flex h-3 w-3 rounded-full border border-slate-700"
                          style={{ backgroundColor: meta.color }}
                        />
                        {IconComp && (
                          <IconComp className="h-3.5 w-3.5 text-slate-200" />
                        )}
                        <span className="text-xs text-slate-200">{meta.label}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-right font-semibold text-emerald-400 text-sm">
                      ${formatAmount(ingreso.monto || 0)}
                    </td>
                    <td className="px-3 sm:px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-slate-50"
                          onClick={() => openEditForm(ingreso)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          onClick={() => openDeleteConfirm(ingreso.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Modal formulario */}
      <AnimatePresence>
      {isFormOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-800 p-6 rounded-lg shadow-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className="border-b border-slate-600 flex items-center mb-4 pb-1">
            <h3 className="text-xl font-semibold text-slate-200">
              {editingId ? "Editar ingreso" : "Nuevo ingreso"}
            </h3>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-slate-300" htmlFor="monto">
              Monto
            </label>
            <input
              id="monto"
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-slate-300" htmlFor="cuenta">
              Cuenta
            </label>
            <select
              id="cuenta"
              value={cuentaId}
              onChange={(e) => setCuentaId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="" disabled>
                Seleccioná una cuenta
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-slate-300" htmlFor="categoriaIngreso">
              Categoría del ingreso
            </label>
            <div className="relative">
              <button
                type="button"
                id="categoriaIngreso"
                onClick={() => setIsIncomeCategoryDropdownOpen((open) => !open)}
                className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-between gap-2"
              >
                {(() => {
                  const meta = INCOME_CATEGORY_META[categoriaIngreso] || INCOME_CATEGORY_META.OTROS
                  const IconComp = meta?.Icon
                  return (
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-600"
                        style={{ backgroundColor: meta.color + "33" }}
                      >
                        {IconComp && <IconComp className="h-4 w-4 text-slate-50" />}
                      </span>
                      <span className="text-sm text-slate-100">{meta.label}</span>
                    </span>
                  )
                })()}
              </button>

              {isIncomeCategoryDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-slate-600 bg-slate-800 shadow-lg">
                  {INCOME_CATEGORIES.map((cat) => {
                    const IconComp = cat.Icon
                    const isSelected = categoriaIngreso === cat.value
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setCategoriaIngreso(cat.value)
                          setIsIncomeCategoryDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                          isSelected ? "bg-slate-700" : "hover:bg-slate-700/70"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-slate-600"
                            style={{ backgroundColor: cat.color + "33" }}
                          >
                            {IconComp && <IconComp className="h-3.5 w-3.5 text-slate-50" />}
                          </span>
                          <span className="text-slate-100">{cat.label}</span>
                        </span>
                        <span
                          className="inline-flex h-3 w-3 rounded-full border border-slate-700"
                          style={{ backgroundColor: cat.color }}
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-300" htmlFor="fecha">
                Fecha
              </label>
              <div className="inline-flex rounded-full border border-slate-600 bg-slate-800/60 p-0.5 text-[11px] text-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setUseToday(true)
                    const today = new Date().toISOString().slice(0, 10)
                    setFecha(today)
                  }}
                  className={`px-2 py-0.5 rounded-full transition-colors ${
                    useToday ? 'bg-slate-700 text-slate-50' : 'hover:bg-slate-700/70'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setUseToday(false)}
                  className={`px-2 py-0.5 rounded-full transition-colors ${
                    !useToday ? 'bg-slate-700 text-slate-50' : 'hover:bg-slate-700/70'
                  }`}
                >
                  Elegir fecha
                </button>
              </div>
            </div>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={useToday}
              className={`w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                useToday ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-slate-300" htmlFor="descripcion">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold py-2 px-4 transition-colors duration-200 hover:bg-emerald-500/15 hover:border-emerald-400 mb-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? editingId
                ? "Guardando..."
                : "Creando..."
              : editingId
                ? "Guardar cambios"
                : "Crear ingreso"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            className="w-full rounded-md border border-slate-600 bg-slate-800/60 text-slate-200 font-medium py-2 px-4 transition-colors duration-200 hover:bg-slate-700/80 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => {
              resetForm()
              setIsFormOpen(false)
            }}
          >
            Cancelar
          </button>
          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Modal confirmación borrado */}
      <AnimatePresence>
      {confirmDeleteId && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-slate-50 mb-2">Eliminar ingreso</h4>
            <p className="text-sm text-slate-400 mb-4">
              ¿Seguro que querés eliminar este ingreso? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700/80"
                onClick={() => setConfirmDeleteId(null)}
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
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.section>
  )
}
