import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar.jsx'

export default function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      <div className="flex h-screen">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

        <div className="flex-1 flex flex-col md:ml-0 overflow-y-auto">
          <header className="flex items-center gap-3 border-b border-slate-800 px-4 py-3 md:px-6">
            <button
              type="button"
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-200 hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div>
              <h1 className="text-base font-semibold leading-tight text-slate-50">
                Gestor de Gastos
              </h1>
              <p className="text-xs text-slate-400">
                Panel para administrar cuentas y sus movimientos.
              </p>
            </div>
          </header>

          <main className="flex-1 px-4 py-4 md:px-6 md:py-6 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
            <div
              className={`mx-auto transition-[max-width] duration-200 ${
                isSidebarOpen ? 'max-w-5xl' : 'max-w-6xl'
              }`}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
