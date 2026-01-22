import { useEffect, useMemo, useState } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { ArrowDown, ArrowUp } from "lucide-react"
import { useUserServices } from "../hooks/useUserServices"
import { formatAmount } from "../utils/formatAmount"

ChartJS.register(ArcElement, Tooltip, Legend)

const INCOME_CATEGORIES = [
  { value: "SALARIOS", label: "Salarios", color: "#22c55e" },
  { value: "REGALO", label: "Regalo", color: "#f97316" },
  { value: "INTERES", label: "Interés", color: "#0ea5e9" },
  { value: "OTROS", label: "Otros", color: "#a855f7" },
]

const INCOME_CATEGORY_META = INCOME_CATEGORIES.reduce((acc, cat) => {
  acc[cat.value] = cat
  return acc
}, {})

export default function Dashboard() {
  const { getIngresos, getGastos, getCategories } = useUserServices()
  
  const [selectedType, setSelectedType] = useState("GASTOS") // "GASTOS" | "INGRESOS"
  const [ingresos, setIngresos] = useState([])
  const [gastos, setGastos] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [ingresosData, gastosData, categoriesData] = await Promise.all([
          getIngresos(),
          getGastos(),
          getCategories(),
        ])

        setIngresos(ingresosData)
        setGastos(gastosData)
        setCategories(categoriesData)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const categoriesMap = useMemo(
    () => Object.fromEntries(categories.map((cat) => [cat.id, cat])),
    [categories],
  )

  const totalIngresos = useMemo(
    () => ingresos.reduce((sum, ing) => sum + Number(ing.monto || 0), 0),
    [ingresos],
  )

  const totalGastos = useMemo(
    () => gastos.reduce((sum, g) => sum + Number(g.monto || 0), 0),
    [gastos],
  )

  const ingresosPorCategoria = useMemo(() => {
    const map = {}
    for (const ing of ingresos) {
      const key = ing.categoriaIngreso || "OTROS"
      const monto = Number(ing.monto || 0)
      map[key] = (map[key] || 0) + monto
    }
    return Object.entries(map).map(([key, value]) => {
      const meta = INCOME_CATEGORY_META[key] || INCOME_CATEGORY_META.OTROS
      return {
        key,
        label: meta.label,
        value,
        color: meta.color,
      }
    })
  }, [ingresos])

  const gastosPorCategoria = useMemo(() => {
    const map = {}
    for (const g of gastos) {
      const key = g.categoriaId || "sin-categoria"
      const monto = Number(g.monto || 0)
      map[key] = (map[key] || 0) + monto
    }

    return Object.entries(map).map(([key, value]) => {
      const cat = categoriesMap[key]
      return {
        key,
        label: key === "sin-categoria" ? "Sin categoría" : cat?.nombre || "Sin categoría",
        value,
        color: cat?.color || "#f97373",
      }
    })
  }, [gastos, categoriesMap])

  const currentData = selectedType === "GASTOS" ? gastosPorCategoria : ingresosPorCategoria
  const currentTotal = selectedType === "GASTOS" ? totalGastos : totalIngresos

  const pieData = useMemo(() => {
    if (!currentData.length) {
      return null
    }

    const labels = currentData.map((item) => item.label)
    const values = currentData.map((item) => item.value)

    const baseColors = [
      "#22c55e",
      "#0ea5e9",
      "#f97316",
      "#a855f7",
      "#facc15",
      "#ec4899",
      "#14b8a6",
      "#fb7185",
    ]

    const backgroundColor = currentData.map((item, idx) =>
      item.color || baseColors[idx % baseColors.length],
    )

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor,
          borderColor: "#020617",
          borderWidth: 2,
        },
      ],
    }
  }, [currentData])

  const pieOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  }

  const title =
    selectedType === "GASTOS" ? "Distribución de gastos" : "Distribución de ingresos"

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between mb-4 border-b border-slate-700 pb-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50 mb-1">Dashboard</h2>
          <p className="text-sm text-slate-400">
            Resumen rápido de tus ingresos y gastos por categoría.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-slate-600 bg-slate-900/70 p-0.5 text-xs text-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedType("GASTOS")}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
              selectedType === "GASTOS" ? "bg-slate-700" : "hover:bg-slate-800/70"
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Gastos
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("INGRESOS")}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
              selectedType === "INGRESOS" ? "bg-slate-700" : "hover:bg-slate-800/70"
            }`}
          >
            <ArrowDown className="h-3.5 w-3.5" />
            Ingresos
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-slate-400">Cargando datos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Mitad izquierda: gráfico circular + total */}
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 flex flex-col h-full">
            <h3 className="text-sm font-medium text-slate-200 mb-3">{title}</h3>
            <div className="flex-1 flex items-center justify-center mb-4 min-h-[220px]">
              {pieData ? (
                <div className="w-56 h-56 md:w-64 md:h-64">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              ) : (
                <p className="text-xs text-slate-500">No hay datos para mostrar.</p>
              )}
            </div>
            <div className="border-t border-slate-700 pt-3 mt-auto">
              <p className="text-xs text-slate-400 mb-1">
                Total de {selectedType === "GASTOS" ? "gastos" : "ingresos"}
              </p>
              <p
                className={`text-2xl font-semibold ${
                  selectedType === "GASTOS" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {selectedType === "GASTOS" ? "-" : ""}${formatAmount(currentTotal || 0)}
              </p>
            </div>
          </div>

          {/* Mitad derecha: detalle por categoría */}
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 h-full">
            <h3 className="text-sm font-medium text-slate-200 mb-3">
              {selectedType === "GASTOS" ? "Gastos por categoría" : "Ingresos por categoría"}
            </h3>

            {currentData.length === 0 ? (
              <p className="text-xs text-slate-500">No hay movimientos en este período.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {currentData.map((item) => {
                  const percentage = currentTotal
                    ? Math.round((item.value / currentTotal) * 100)
                    : 0

                  const color = item.color || (selectedType === "GASTOS" ? "#f97373" : "#22c55e")

                  return (
                    <li
                      key={item.key}
                      className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex h-3 w-3 rounded-full border border-slate-800"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-slate-100">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            selectedType === "GASTOS" ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {selectedType === "GASTOS" ? "-" : ""}${formatAmount(item.value || 0)}
                        </p>
                        <p className="text-[10px] text-slate-500">{percentage}% del total</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
