import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import UnsubscribePage from './pages/UnsubscribePage'
import ManageAlertsPage from './pages/ManageAlertsPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/desinscription" element={<UnsubscribePage />} />
      <Route path="/mes-alertes" element={<ManageAlertsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
