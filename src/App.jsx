import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Ingresos from './pages/Ingresos.jsx'
import Gastos from './pages/Gastos.jsx'
import Cuentas from './pages/Cuentas.jsx'
import Categorias from './pages/Categorias.jsx'

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ingresos" element={<Ingresos />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/cuentas" element={<Cuentas />} />
        <Route path="/categorias" element={<Categorias />} />
      </Routes>
    </AppLayout>
  )
}