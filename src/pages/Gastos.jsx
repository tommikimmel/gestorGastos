import { useEffect, useMemo, useState } from "react"
import {
  ArrowUp,
  Plus,
  Pencil,
  Trash,
  ShoppingCart,
  Car,
  Utensils,
  Home,
  Gamepad2,
  Heart,
  Gift,
  Shirt,
  CreditCard,
  Beer,
  Plane,
  Bus,
  Train,
  Smartphone,
  Laptop,
  Wifi,
  Lightbulb,
  Stethoscope,
  Baby,
  Dog,
  Cat,
  BookOpen,
  Briefcase,
  PiggyBank,
  Dumbbell,
  Music2,
  Trees,
  SunMedium,
  CloudRain,
  Coins,
  Fuel,
  Building2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getAccounts } from "../service/account"
import { getCategories } from "../service/categories"
import { createGasto, getGastos, updateGasto, deleteGasto } from "../service/transactions"
import { formatAmount } from "../utils/formatAmount"

const ICON_COMPONENTS = {
  "shopping-cart": ShoppingCart,
  shirt: Shirt,
  gift: Gift,
  car: Car,
  bus: Bus,
  train: Train,
  plane: Plane,
  fuel: Fuel,
  utensils: Utensils,
  beer: Beer,
  home: Home,
  lightbulb: Lightbulb,
  "building-2": Building2,
  wifi: Wifi,
  smartphone: Smartphone,
  laptop: Laptop,
  heart: Heart,
  stethoscope: Stethoscope,
  baby: Baby,
  dog: Dog,
  cat: Cat,
  "book-open": BookOpen,
  briefcase: Briefcase,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  coins: Coins,
  "gamepad-2": Gamepad2,
  "music-2": Music2,
  dumbbell: Dumbbell,
  trees: Trees,
  "sun-medium": SunMedium,
  "cloud-rain": CloudRain,
}

export default function Gastos() {
  const [monto, setMonto] = useState("")
  const [cuentaId, setCuentaId] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [fecha, setFecha] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [gastos, setGastos] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [editingId, setEditingId] = useState(null)
  
  const [editingOriginal, setEditingOriginal] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [useToday, setUseToday] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)

  const accountsMap = useMemo(
    () => Object.fromEntries(accounts.map((acc) => [acc.id, acc.nombre])),
    [accounts],
  )

  const categoriesMap = useMemo(
    () => Object.fromEntries(categories.map((cat) => [cat.id, cat])),
    [categories],
  )

  const resetForm = () => {
    setMonto("")
    setCuentaId("")
    setCategoriaId("")
    setFecha("")
    setDescripcion("")
    setEditingId(null)
    setEditingOriginal(null)
    setUseToday(true)
    setErrorMessage("")
    setIsCategoryDropdownOpen(false)
  }

  const loadData = async () => {
    const [accountsData, categoriesData, gastosData] = await Promise.all([
      getAccounts(),
      getCategories(),
      getGastos(),
    ])

    setAccounts(accountsData)
    setCategories(categoriesData)
    setGastos(gastosData)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!categoriaId) {
      setErrorMessage("Seleccioná una categoría.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      if (editingId) {
        await updateGasto(editingId, { monto, cuentaId, categoriaId, fecha, descripcion })
      } else {
        await createGasto({ monto, cuentaId, categoriaId, fecha, descripcion })
      }

      await loadData()
      resetForm()
      setIsFormOpen(false)
    } catch (err) {
      const msg = err?.message || "Ocurrió un error al guardar el gasto"
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateForm = () => {
    resetForm()
    const today = new Date().toISOString().slice(0, 10)
    setFecha(today)
    setUseToday(true)
    setIsFormOpen(true)
  }

  const openEditForm = (gasto) => {
    setEditingId(gasto.id)
    setEditingOriginal(gasto)
    setMonto(String(gasto.monto))
    setCuentaId(gasto.cuentaId)
    setCategoriaId(gasto.categoriaId)
    setFecha(gasto.fecha || "")
    setUseToday(false)
    setDescripcion(gasto.descripcion || "")
    setErrorMessage("")
    setIsFormOpen(true)
  }

  const openDeleteConfirm = (id) => {
    setConfirmDeleteId(id)
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId || isDeleting) return

    setIsDeleting(true)

    try {
      await deleteGasto(confirmDeleteId)
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
            <ArrowUp />
          </span>
          <h2 className="text-3xl font-semibold text-slate-200">Gastos</h2>
        </div>
        <div className="w-full sm:w-auto sm:ml-auto">
          <button
            type="button"
            onClick={openCreateForm}
            className="w-full sm:w-auto rounded-md border border-slate-600 bg-slate-900/70 px-4 py-2 hover:bg-slate-800 flex items-center justify-center sm:justify-start gap-2 text-slate-100 text-sm font-medium"
          >
            <Plus size="18px" />
            Nuevo gasto
          </button>
        </div>
      </motion.div>

      {gastos.length === 0 ? (
        <div className="flex justify-center py-10 bg-slate-800 rounded-lg border border-slate-700 mb-6 mt-2">
          <p className="text-sm text-slate-400">Todavía no registraste gastos.</p>
        </div>
      ) : (
        <div className="mt-4 mb-6 rounded-lg border border-slate-700 bg-slate-900/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-3 sm:px-4 py-2 text-left font-medium text-xs sm:text-sm">Fecha</th>
                <th className="px-3 sm:px-4 py-2 text-left font-medium text-xs sm:text-sm">Categoría</th>
                <th className="px-3 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">Monto</th>
                <th className="px-3 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {gastos.map((gasto) => {
                const cuentaNombre = accountsMap[gasto.cuentaId] || "Sin cuenta"
                const categoria = categoriesMap[gasto.categoriaId]
                const IconComp = categoria ? ICON_COMPONENTS[categoria.icono] : null

                return (
                  <tr key={gasto.id} className="hover:bg-slate-900/60">
                    <td className="px-3 sm:px-4 py-2 text-slate-200 text-xs">{gasto.fecha || "-"}</td>
                    <td className="px-3 sm:px-4 py-2 text-slate-200 text-xs">
                      {categoria ? (
                        <div className="inline-flex items-center gap-2">
                          <span
                            className="inline-flex h-3 w-3 rounded-full border border-slate-700"
                            style={{ backgroundColor: categoria.color || "#22c55e" }}
                          />
                          {IconComp && (
                            <IconComp className="h-3.5 w-3.5 text-slate-200" />
                          )}
                          <span className="text-xs text-slate-200">{categoria.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-right font-semibold text-red-400 text-sm">
                      -${formatAmount(gasto.monto || 0)}
                    </td>
                    <td className="px-3 sm:px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-slate-50"
                          onClick={() => openEditForm(gasto)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          onClick={() => openDeleteConfirm(gasto.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-800 p-6 rounded-lg shadow-md"
          >
            <div className="border-b border-slate-600 flex items-center mb-4 pb-1">
              <h3 className="text-xl font-semibold text-slate-200">
                {editingId ? "Editar gasto" : "Nuevo gasto"}
              </h3>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-slate-300" htmlFor="monto">
                Monto
              </label>
              <input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="" disabled>
                  Seleccioná una cuenta
                </option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.nombre} - ${formatAmount(acc.total || 0)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-slate-300" htmlFor="categoria">
                Categoría
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="categoria"
                  onClick={() => setIsCategoryDropdownOpen((open) => !open)}
                  className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 text-left focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-between gap-2"
                >
                  {categoriesMap[categoriaId] ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-600">
                        {(() => {
                          const selectedCat = categoriesMap[categoriaId]
                          const IconComp = selectedCat
                            ? ICON_COMPONENTS[selectedCat.icono]
                            : null
                          return IconComp ? (
                            <IconComp className="h-4 w-4" />
                          ) : (
                            selectedCat?.icono || "?"
                          )
                        })()}
                      </span>
                      <span className="text-sm text-slate-100">
                        {categoriesMap[categoriaId]?.nombre}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">Seleccioná una categoría</span>
                  )}
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-slate-600 bg-slate-800 shadow-lg">
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-[11px] text-slate-400">
                        No tenés categorías aún. Creá algunas desde la sección "Categorías".
                      </div>
                    ) : (
                      categories.map((cat) => {
                        const IconComp = ICON_COMPONENTS[cat.icono]
                        const isSelected = categoriaId === cat.id
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setCategoriaId(cat.id)
                              setIsCategoryDropdownOpen(false)
                              setErrorMessage("")
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                              isSelected ? "bg-slate-700" : "hover:bg-slate-700/70"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-slate-600">
                                {IconComp ? (
                                  <IconComp className="h-3.5 w-3.5" />
                                ) : (
                                  cat.icono || "?"
                                )}
                              </span>
                              <span className="text-slate-100">{cat.nombre}</span>
                            </span>
                            <span
                              className="inline-flex h-3 w-3 rounded-full border border-slate-700"
                              style={{ backgroundColor: cat.color || "#22c55e" }}
                            />
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
              {categories.length === 0 && (
                <p className="mt-1 text-[11px] text-slate-400">
                  No tenés categorías aún. Creá algunas desde la sección "Categorías".
                </p>
              )}
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
                      useToday ? "bg-slate-700 text-slate-50" : "hover:bg-slate-700/70"
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseToday(false)}
                    className={`px-2 py-0.5 rounded-full transition-colors ${
                      !useToday ? "bg-slate-700 text-slate-50" : "hover:bg-slate-700/70"
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
                className={`w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  useToday ? "opacity-60 cursor-not-allowed" : ""
                }`}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1 text-slate-300"
                htmlFor="descripcion"
              >
                Descripción (opcional)
              </label>
              <textarea
                id="descripcion"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 font-semibold py-2 px-4 transition-colors duration-200 hover:bg-red-500/15 hover:border-red-400 mb-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? editingId
                  ? "Guardando..."
                  : "Creando..."
                : editingId
                ? "Guardar cambios"
                : "Crear gasto"}
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
          </form>
        </div>
      )}

      {/* Modal confirmación borrado */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-slate-50 mb-2">Eliminar gasto</h4>
            <p className="text-sm text-slate-400 mb-4">
              ¿Seguro que querés eliminar este gasto? Esta acción no se puede deshacer.
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
          </div>
        </div>
      )}
    </motion.section>
  )
}