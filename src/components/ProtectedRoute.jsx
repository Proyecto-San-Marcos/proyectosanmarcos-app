import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading: authLoading } = useAuth();
    const [isCheckingUser, setIsCheckingUser] = useState(true);
    const [activeUser, setActiveUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Verificación activa con supabase.auth.getUser()
    useEffect(() => {
        let isMounted = true;

        async function checkActiveSession() {
            try {
                const { data: { user: currentUser }, error } = await supabase.auth.getUser();

                if (!isMounted) return;

                if (error || !currentUser) {
                    setActiveUser(null);
                    navigate('/login', { replace: true, state: { from: location } });
                } else {
                    setActiveUser(currentUser);
                }
            } catch (err) {
                console.error('Error al verificar sesión activa:', err);
                if (isMounted) {
                    setActiveUser(null);
                    navigate('/login', { replace: true, state: { from: location } });
                }
            } finally {
                if (isMounted) {
                    setIsCheckingUser(false);
                }
            }
        }

        checkActiveSession();

        return () => {
            isMounted = false;
        };
    }, [navigate, location]);

    // Estado de carga mientras se verifica el usuario
    if (authLoading || isCheckingUser) {
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

    // Si no hay usuario activo tras la comprobación, redirigir al login
    if (!activeUser && !user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Comprobación de roles específicos si la ruta lo requiere
    const currentRole = user?.role || activeUser?.user_metadata?.role || activeUser?.user_metadata?.cargo;
    if (allowedRoles && currentRole && !allowedRoles.includes(currentRole) && currentRole !== 'Presidencia' && currentRole !== 'Junta Directiva') {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--psm-gray-light,#f0f4f8)] text-[var(--psm-text-body,#4b5563)] p-4">
                <div className="text-center p-8 sm:p-10 bg-white shadow-xl rounded-[var(--psm-radius-lg,20px)] max-w-lg border border-red-100">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-[var(--psm-navy,#0f2044)] uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Acceso Denegado
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] mb-6">
                        Tu rol actual ({currentRole}) no tiene permisos para ver esta sección.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="psm-btn-primary px-6 py-2.5 font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        Volver atrás
                    </button>
                </div>
            </div>
        );
    }

    return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

