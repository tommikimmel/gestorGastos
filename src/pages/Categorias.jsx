import { useEffect, useState } from "react"
import {
  Tag,
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
  Wrench,
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
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../service/categories"

const ICON_OPTIONS = [
  // Compras / vida diaria
  { value: "shopping-cart", label: "Compras", Icon: ShoppingCart },
  { value: "shirt", label: "Ropa", Icon: Shirt },
  { value: "gift", label: "Regalos", Icon: Gift },

  // Transporte
  { value: "car", label: "Auto / Taxi", Icon: Car },
  { value: "bus", label: "Colectivo / Bus", Icon: Bus },
  { value: "train", label: "Tren / Subte", Icon: Train },
  { value: "plane", label: "Vuelos / Viajes", Icon: Plane },
  { value: "fuel", label: "Combustible", Icon: Fuel },

  // Comida y salidas
  { value: "utensils", label: "Comida", Icon: Utensils },
  { value: "beer", label: "Bebidas / Bares", Icon: Beer },

  // Casa y servicios
  { value: "home", label: "Hogar", Icon: Home },
  { value: "lightbulb", label: "Servicios (luz/agua)", Icon: Lightbulb },
  { value: "building-2", label: "Alquiler / Expensas", Icon: Building2 },
  { value: "wifi", label: "Internet", Icon: Wifi },

  // Tecnología
  { value: "smartphone", label: "Celular", Icon: Smartphone },
  { value: "laptop", label: "Computadora", Icon: Laptop },

  // Salud y cuidado
  { value: "heart", label: "Salud", Icon: Heart },
  { value: "stethoscope", label: "Médico", Icon: Stethoscope },
  { value: "baby", label: "Bebés / Hijos", Icon: Baby },

  // Mascotas
  { value: "dog", label: "Mascotas (perro)", Icon: Dog },
  { value: "cat", label: "Mascotas (gato)", Icon: Cat },

  // Educación y trabajo
  { value: "book-open", label: "Educación", Icon: BookOpen },
  { value: "briefcase", label: "Trabajo", Icon: Briefcase },

  // Finanzas
  { value: "credit-card", label: "Tarjeta", Icon: CreditCard },
  { value: "piggy-bank", label: "Ahorro", Icon: PiggyBank },
  { value: "coins", label: "Impuestos / Tasas", Icon: Coins },

  // Ocio y deportes
  { value: "gamepad-2", label: "Ocio / Juegos", Icon: Gamepad2 },
  { value: "music-2", label: "Música / Eventos", Icon: Music2 },
  { value: "dumbbell", label: "Gimnasio / Deporte", Icon: Dumbbell },

  // Naturaleza / clima
  { value: "trees", label: "Aire libre", Icon: Trees },
  { value: "sun-medium", label: "Vacaciones", Icon: SunMedium },
  { value: "cloud-rain", label: "Clima / Seguros", Icon: CloudRain },
]

const ICON_COMPONENTS = ICON_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = opt.Icon
  return acc
}, {})

const getIconLabel = (value) =>
  ICON_OPTIONS.find((opt) => opt.value === value)?.label || "Sin icono"

export default function Categorias() {
  const [nombre, setNombre] = useState("")
  const [icono, setIcono] = useState("")
  const [color, setColor] = useState("#22c55e")
  const [categorias, setCategorias] = useState([])

  const [editingId, setEditingId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [confirmDeleteName, setConfirmDeleteName] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const resetForm = () => {
    setNombre("")
    setIcono("")
    setColor("#22c55e")
    setEditingId(null)
  }

  const loadData = async () => {
    const data = await getCategories()
    setCategorias(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || isSubmitting) return

    setIsSubmitting(true)

    try {
      if (editingId) {
        await updateCategory(editingId, { nombre, icono, color })
      } else {
        await createCategory({ nombre, icono, color })
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
    setIsFormOpen(true)
  }

  const openEditForm = (categoria) => {
    setEditingId(categoria.id)
    setNombre(categoria.nombre || "")
    setIcono(categoria.icono || "")
    setColor(categoria.color || "#22c55e")
    setIsFormOpen(true)
  }

  const openDeleteConfirm = (categoria) => {
    setConfirmDeleteId(categoria.id)
    setConfirmDeleteName(categoria.nombre || "")
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId || isDeleting) return

    setIsDeleting(true)

    try {
      await deleteCategory(confirmDeleteId)
      await loadData()
      setConfirmDeleteId(null)
      setConfirmDeleteName("")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center border-b border-slate-700 pb-3 mb-4">
        <div className="flex items-center gap-4">
          <span className="p-4 bg-slate-700/50 rounded border border-slate-600">
            <Tag />
          </span>
          <h2 className="text-3xl font-semibold text-slate-200">Categorías</h2>
        </div>
        <div className="w-full sm:w-auto sm:ml-auto">
          <button
            type="button"
            onClick={openCreateForm}
            className="w-full sm:w-auto rounded-md border border-slate-600 bg-slate-900/70 px-4 py-2 hover:bg-slate-800 flex items-center justify-center sm:justify-start gap-2 text-slate-100 text-sm font-medium"
          >
            <Plus size="18px" />
            Nueva categoría
          </button>
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="flex justify-center py-10 bg-slate-800 rounded-lg border border-slate-700 mb-6 mt-2">
          <p className="text-sm text-slate-400">Todavía no creaste categorías.</p>
        </div>
      ) : (
        <div className="mt-4 mb-6 rounded-lg border border-slate-700 bg-slate-900/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left font-medium text-xs sm:text-sm">Icono</th>
                <th className="px-2 sm:px-4 py-2 text-left font-medium text-xs sm:text-sm">Nombre</th>
                <th className="px-2 sm:px-4 py-2 text-left font-medium text-xs sm:text-sm hidden sm:table-cell">Color</th>
                <th className="px-2 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {categorias.map((categoria) => (
                <tr key={categoria.id} className="hover:bg-slate-900/60">
                  <td className="px-2 sm:px-4 py-2 text-slate-200 text-xs">
                    <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-600 text-base">
                      {(() => {
                        const IconComp = ICON_COMPONENTS[categoria.icono]
                        return IconComp ? (
                          <IconComp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          categoria.icono || "?"
                        )
                      })()}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 text-slate-200 text-xs sm:text-sm">{categoria.nombre}</td>
                  <td className="px-2 sm:px-4 py-2 text-slate-200 text-xs hidden sm:table-cell">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className="inline-flex h-4 w-4 rounded-full border border-slate-700"
                        style={{ backgroundColor: categoria.color || "#22c55e" }}
                      />
                      <span className="text-[11px] text-slate-400">
                        {categoria.color || "#22c55e"}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-slate-50"
                        onClick={() => openEditForm(categoria)}
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => openDeleteConfirm(categoria)}
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

      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-800 p-6 rounded-lg shadow-md"
          >
          <div className="border-b border-slate-600 flex items-center mb-4 pb-1">
            <h3 className="text-xl font-semibold text-slate-200">
              {editingId ? "Editar categoría" : "Nueva categoría"}
            </h3>
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1 text-slate-300"
              htmlFor="nombre"
            >
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="mb-4">
            <p className="block text-sm font-medium mb-1 text-slate-300">
              Icono
            </p>
            <div className="grid grid-cols-6 gap-2 mb-2">
              {ICON_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIcono(value)}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border text-slate-200 text-base transition-colors ${
                    icono === value
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-slate-600 bg-slate-800 hover:border-slate-500"
                  }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {icono ? `Seleccionado: ${getIconLabel(icono)}` : "Elegí un icono para la categoría."}
            </p>
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1 text-slate-300"
              htmlFor="color"
            >
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 rounded border border-slate-600 bg-slate-700"
              />
              <span className="text-xs text-slate-300">{color}</span>
            </div>
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
              : "Crear categoría"}
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

      {confirmDeleteId && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-slate-50 mb-2">
              Eliminar categoría
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              ¿Seguro que querés eliminar la categoría
              {" "}
              <span className="font-semibold text-slate-100">
                {confirmDeleteName}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700/80"
                onClick={() => {
                  setConfirmDeleteId(null)
                  setConfirmDeleteName("")
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
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
