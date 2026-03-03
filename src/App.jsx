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
                    {/* Public Login Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Root redirect to Login or App based on Auth in actual logic, for now forcing to Login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Protected Intranet Area */}
                    <Route
                        path="/app"
                        element={
                            <ProtectedRoute>
                                <IntranetDashboard />
                            </ProtectedRoute>
                        }
                    >
                        {/* Child Routes matching IntranetDashboard Outlets */}

                        {/* Base general dashboard view */}
                        <Route index element={<DashboardHome />} />

                        {/* PMO specific route - Only Presidencia and PMO allowed */}
                        <Route
                            path="pmo"
                            element={
                                <ProtectedRoute allowedRoles={['PMO', 'Presidencia']}>
                                    <PmoPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback internal 404/Empty pages for missing mock routes */}
                        <Route path="*" element={
                            <div className="flex h-64 items-center justify-center text-[var(--psm-text-secondary)]">
                                <p>Esta sección está en construcción.</p>
                            </div>
                        } />
                    </Route>

                </Routes>
            </Router>
        </AuthProvider>
    );
}
