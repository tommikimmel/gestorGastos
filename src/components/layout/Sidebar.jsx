import { NavLink } from 'react-router-dom'
import { Home, ArrowDown, ArrowUp, Wallet, Tag, ChevronLeft, ChevronRight, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/ingresos', label: 'Ingresos', icon: ArrowDown },
  { to: '/gastos', label: 'Gastos', icon: ArrowUp },
  { to: '/cuentas', label: 'Cuentas', icon: Wallet },
  { to: '/categorias', label: 'Categorías', icon: Tag },
]

const linkBaseClasses =
  'flex items-center rounded-md text-sm font-medium transition-all duration-200'

export default function Sidebar({ isOpen, onToggle }) {
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <>
      {/* Botón de cerrar para móvil (fuera del sidebar) */}
      <button
        type="button"
        onClick={onToggle}
        className={`
          fixed top-4 left-[288px] z-50 md:hidden
          h-10 w-10 items-center justify-center rounded-full
          bg-slate-900 border border-slate-700 text-slate-200
          hover:bg-slate-800 transition-all duration-200
          ${isOpen ? 'flex' : 'hidden'}
        `}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 h-screen w-72 bg-slate-950 border-r border-slate-800 transform transition-all duration-200 ease-out
          md:static md:translate-x-0 md:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isOpen ? 'md:w-64' : 'md:w-20'}
        `}
      >
        <div className="flex h-full flex-col pt-4 pb-6">
          <div className="px-3 mb-6 flex-shrink-0">
          {isOpen ? (
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Gestor de Gastos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggle}
                className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-emerald-300">
                <Shield className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={onToggle}
                className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-2 overflow-y-auto min-h-0">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${linkBaseClasses} ${
                  isOpen
                    ? 'w-full justify-start px-3 py-3 gap-3'
                    : 'h-12 w-12 mx-auto justify-center gap-0'
                } ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                }`
              }
            >
              <Icon className={isOpen ? 'h-4 w-4' : 'h-6 w-6'} />
              {isOpen && (
                <span className="truncate">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-4 flex-shrink-0 px-2 space-y-2">
          {isOpen && user && (
            <div className="px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Sesión iniciada como:</p>
              <p className="text-sm text-slate-300 truncate">{user.email}</p>
            </div>
          )}
          
          <button
            type="button"
            onClick={handleLogout}
            className={`${linkBaseClasses} ${
              isOpen
                ? 'w-full justify-start px-3 py-3 gap-3'
                : 'h-12 w-12 mx-auto justify-center gap-0'
            } text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-slate-800 hover:border-red-500/30`}
          >
            <LogOut className={isOpen ? 'h-4 w-4' : 'h-5 w-5'} />
            {isOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </aside>
    </>
  )
}
