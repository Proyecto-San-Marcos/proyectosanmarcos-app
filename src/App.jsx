import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout and Pages
import Login from './pages/Login';
import IntranetDashboard from './components/IntranetDashboard';
import DashboardHome from './pages/DashboardHome';
import PmoPage from './pages/gerencias/PmoPage';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Ruta Pública de Login / Activación */}
                    <Route path="/login" element={<Login />} />

                    {/* Ruta Principal Protegida / */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <IntranetDashboard />
                            </ProtectedRoute>
                        }
                    >
                        {/* Vista general del dashboard en la raíz */}
                        <Route index element={<DashboardHome />} />

                        {/* Ruta de PMO (Proyectos) */}
                        <Route
                            path="pmo"
                            element={
                                <ProtectedRoute allowedRoles={['PMO', 'Presidencia', 'Junta Directiva']}>
                                    <PmoPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Secciones en desarrollo */}
                        <Route
                            path="*"
                            element={
                                <div className="flex h-64 items-center justify-center text-[var(--psm-text-body,#4b5563)] bg-white rounded-xl border border-slate-200">
                                    <p className="font-medium text-sm">Esta sección está en construcción.</p>
                                </div>
                            }
                        />
                    </Route>

                    {/* Redirección de compatibilidad para rutas /app hacia / */}
                    <Route path="/app" element={<Navigate to="/" replace />} />
                    <Route path="/app/*" element={<Navigate to="/" replace />} />

                    {/* Redirección por defecto */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
