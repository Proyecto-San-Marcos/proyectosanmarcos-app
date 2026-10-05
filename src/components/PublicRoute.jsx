import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * PublicRoute: Componente para rutas públicas (ej. /login).
 * Si el usuario ya está autenticado, lo redirige a la ruta principal o a donde intentaba ir.
 */
export default function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[var(--psm-gray-light,#f0f4f8)]">
                <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Loader2 size={36} className="animate-spin text-[var(--psm-teal,#00b4d8)]" />
                    <p className="text-xs font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-wider">
                        Verificando sesión...
                    </p>
                </div>
            </div>
        );
    }

    if (user) {
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    return children;
}

PublicRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

