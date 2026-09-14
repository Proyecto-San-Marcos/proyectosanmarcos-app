import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mustChangePassword, setMustChangePassword] = useState(false);

    // Formatear datos de usuario para compatibilidad con la intranet
    const formatUserData = (supabaseUser) => {
        if (!supabaseUser) return null;
        
        const metadata = supabaseUser.user_metadata || {};
        const role = metadata.role || metadata.cargo || metadata.gerencia || 'Presidencia';
        const name = metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0] || 'Usuario';
        
        return {
            ...supabaseUser,
            name,
            role,
            codigo_universitario: metadata.codigo_universitario || '',
            gerencia: metadata.gerencia || '',
            must_change_password: Boolean(metadata.must_change_password)
        };
    };

    useEffect(() => {
        let isMounted = true;

        async function initAuth() {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                if (!isMounted) return;

                if (currentSession?.user) {
                    setSession(currentSession);
                    const formattedUser = formatUserData(currentSession.user);
                    setUser(formattedUser);
                    setMustChangePassword(Boolean(formattedUser.must_change_password));
                } else {
                    setSession(null);
                    setUser(null);
                    setMustChangePassword(false);
                }
            } catch (err) {
                console.error('Error inicializando autenticación:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        initAuth();

        // Escuchar cambios de autenticación en tiempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (!isMounted) return;

            if (newSession?.user) {
                setSession(newSession);
                const formattedUser = formatUserData(newSession.user);
                setUser(formattedUser);
                setMustChangePassword(Boolean(formattedUser.must_change_password));
            } else {
                setSession(null);
                setUser(null);
                setMustChangePassword(false);
            }
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    // Iniciar sesión con email y contraseña
    const login = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password
        });

        if (error) {
            return { success: false, error };
        }

        if (data?.user) {
            const formatted = formatUserData(data.user);
            setUser(formatted);
            setSession(data.session);
            setMustChangePassword(Boolean(formatted.must_change_password));
        }

        return { success: true, data };
    };

    // Cerrar sesión
    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        } finally {
            setUser(null);
            setSession(null);
            setMustChangePassword(false);
        }
    };

    // Actualizar contraseña de usuario y limpiar bandera de cambio obligatorio
    const updatePassword = async (newPassword) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
            data: {
                must_change_password: false,
                password_configured: true,
                password_updated_at: new Date().toISOString()
            }
        });

        if (error) {
            return { success: false, error };
        }

        setMustChangePassword(false);
        if (data?.user) {
            setUser(formatUserData(data.user));
        }

        return { success: true, data };
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                mustChangePassword,
                setMustChangePassword,
                login,
                logout,
                updatePassword
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
