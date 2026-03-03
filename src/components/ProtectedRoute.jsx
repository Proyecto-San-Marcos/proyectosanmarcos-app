import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useAuth();

    // If user is not logged in, redirect to login page.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check roles if some are explicitly specified
    if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'Presidencia') {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--psm-bg-layout)] text-[var(--psm-text-primary)] fade-in">
                <div className="text-center p-10 bg-white shadow-xl rounded-[var(--psm-radius-card)] max-w-lg border border-red-100">
                    <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--psm-font-heading)' }}>Acceso Denegado</h1>
                    <p className="text-[var(--psm-text-secondary)] mb-6">Tu rol actual ({user.role}) no tiene permisos para ver esta sección.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-[var(--psm-brand-navy)] text-white px-6 py-2 rounded-[var(--psm-radius-button)] font-medium shadow-md hover:bg-[#0f2044] transition-all"
                    >
                        Volver atrás
                    </button>
                </div>
            </div>
        );
    }

    return children;
}
