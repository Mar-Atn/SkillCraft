import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './components/dashboard/Dashboard'
import ScenarioPage from './pages/ScenarioPage'
import PracticePage from './pages/PracticePage'
import AdminDashboard from './pages/AdminDashboard'
import ScenarioManagement from './pages/admin/ScenarioManagement'
import CharacterManagement from './pages/admin/CharacterManagement'
import FeedbackPrompts from './pages/admin/FeedbackPrompts'
import Analytics from './pages/admin/Analytics'
import UserHistory from './pages/UserHistory'
import UserProgress from './pages/UserProgress'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/scenario/:scenarioId" element={
              <ProtectedRoute>
                <ScenarioPage />
              </ProtectedRoute>
            } />
            <Route path="/practice" element={
              <ProtectedRoute>
                <PracticePage />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <UserHistory />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <UserProgress />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/scenarios" element={
              <ProtectedRoute requireAdmin={true}>
                <ScenarioManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/characters" element={
              <ProtectedRoute requireAdmin={true}>
                <CharacterManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/feedback" element={
              <ProtectedRoute requireAdmin={true}>
                <FeedbackPrompts />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requireAdmin={true}>
                <Analytics />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App