import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, ArrowRight, UserCheck, AlertCircle, CheckCircle, Loader2, KeyRound } from 'lucide-react';

export default function Login() {
    const [mode, setMode] = useState('login'); // 'login' | 'activate'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [codigoUniversitario, setCodigoUniversitario] = useState('');
    const [activateEmail, setActivateEmail] = useState('');

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath = location.state?.from?.pathname || '/';

    // Iniciar Sesión convencional con Supabase Auth
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const result = await login({ email, password });

            if (!result.success) {
                const msg = result.error?.message || '';
                if (msg.includes('Invalid login credentials')) {
                    setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
                } else if (msg.includes('Email not confirmed')) {
                    setError('Tu correo aún no ha sido confirmado. Por favor revisa tu bandeja de entrada.');
                } else {
                    setError(msg || 'No fue posible iniciar sesión. Inténtalo de nuevo.');
                }
                return;
            }

            // Redireccionar a la ruta principal protegida o a la solicitada previamente
            navigate(redirectPath, { replace: true });
        } catch {
            setError('Error de conexión al servidor. Inténtalo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    // Activar Cuenta / Primer Ingreso validando contra BD_TODOS
    const handleActivateAccount = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        const trimmedCodigo = codigoUniversitario.trim();
        const trimmedEmail = activateEmail.trim().toLowerCase();

        if (!trimmedCodigo || !trimmedEmail) {
            setError('Por favor ingresa tu código universitario y tu correo.');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Buscar coincidencia en la tabla BD_TODOS
            const { data: records, error: dbError } = await supabase
                .from('BD_TODOS')
                .select('id, codigo_universitario, nombres, apellidos, correo_institucional, correo_personal, gerencia_actual, cargo')
                .eq('codigo_universitario', trimmedCodigo);

            if (dbError) {
                console.error('Error al consultar BD_TODOS:', dbError);
                setError('Hubo un error al verificar tus datos con el padrón de miembros.');
                setIsLoading(false);
                return;
            }

            // 2. Verificar que exista y que el correo coincida con el institucional o personal registrado
            const matchedMember = records?.find(r => {
                const cInst = r.correo_institucional ? r.correo_institucional.trim().toLowerCase() : '';
                const cPers = r.correo_personal ? r.correo_personal.trim().toLowerCase() : '';
                return cInst === trimmedEmail || cPers === trimmedEmail;
            });

            if (!matchedMember) {
                setError('Los datos ingresados no coinciden con ningún miembro registrado en la base de datos de PSM.');
                setIsLoading(false);
                return;
            }

            // 3. Generar la contraseña temporal: codigo_universitario + ID
            const tempPassword = `${matchedMember.codigo_universitario}${matchedMember.id}`;

            // 4. Crear la cuenta en Supabase Auth con must_change_password: true y emailRedirectTo: null
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: trimmedEmail,
                password: tempPassword,
                options: {
                    emailRedirectTo: null,
                    data: {
                        must_change_password: true,
                        password_configured: false,
                        codigo_universitario: matchedMember.codigo_universitario,
                        full_name: `${matchedMember.nombres} ${matchedMember.apellidos}`.trim(),
                        name: matchedMember.nombres,
                        role: matchedMember.cargo || matchedMember.gerencia_actual || 'Presidencia',
                        gerencia: matchedMember.gerencia_actual || '',
                        member_id: matchedMember.id
                    }
                }
            });

            if (signUpError) {
                if (signUpError.message.includes('User already registered') || signUpError.message.includes('already exists')) {
                    setError('Esta cuenta ya fue activada previamente. Inicia sesión con tus credenciales.');
                } else {
                    setError(signUpError.message);
                }
                setIsLoading(false);
                return;
            }

            // Supabase devuelve identities vacío si el usuario ya existía previamente (protección de enumeración)
            if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
                setError('Esta cuenta ya fue activada previamente. Inicia sesión con tus credenciales.');
                setIsLoading(false);
                return;
            }

            // 5. Notificar éxito al usuario
            if (signUpData?.session) {
                setSuccessMessage(
                    `¡Hola ${matchedMember.nombres}! Tu cuenta ha sido activada con éxito. Redirigiendo a la intranet para que configures tu contraseña personal...`
                );
                setTimeout(() => {
                    navigate(redirectPath, { replace: true });
                }, 1500);
            } else {
                setSuccessMessage(
                    `¡Hola ${matchedMember.nombres}! Tu cuenta ha sido activada con éxito. Tu contraseña inicial temporal es tu código universitario + tu ID (${tempPassword}). Inicia sesión ahora para configurar tu contraseña definitiva.`
                );

                // Pre-llenar el correo en el formulario de login y cambiar a modo login
                setEmail(trimmedEmail);
                setPassword(tempPassword);
                setTimeout(() => {
                    setMode('login');
                }, 3000);
            }

        } catch (err) {
            console.error('Error durante la activación:', err);
            setError('Ocurrió un error inesperado al activar la cuenta.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--psm-gray-light,#f0f4f8)]">
            <div className="w-full max-w-md flex flex-col items-center justify-center">

                {/* Logo institucional */}
                <div className="mb-8 text-center flex flex-col items-center">
                    <img
                        src="https://uvsnieedcxndpdlyemgn.supabase.co/storage/v1/object/public/icons-psm/logo-nobg.png"
                        alt="Proyectos San Marcos"
                        className="w-28 h-28 object-contain drop-shadow-sm"
                    />
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--psm-navy,#0f2044)] uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Intranet PSM
                    </h1>
                    <p className="text-xs text-[var(--psm-text-muted,#9ca3af)] font-medium">
                        Sistema de Gestión y Coordinación
                    </p>
                </div>

                {/* Contenedor del Formulario */}
                <div className="w-full bg-[var(--psm-white,#ffffff)] p-8 rounded-[var(--psm-radius-lg,20px)] shadow-[var(--psm-shadow-card)] border border-[var(--psm-gray-mid,#e5e7eb)]">

                    {/* Alerta de Error */}
                    {error && (
                        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Alerta de Éxito */}
                    {successMessage && (
                        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in leading-relaxed">
                            <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* MODO 1: INICIAR SESIÓN */}
                    {mode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="border-b border-slate-100 pb-3 mb-2">
                                <h2 className="text-base font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-wide">
                                    Iniciar Sesión
                                </h2>
                                <p className="text-xs text-[var(--psm-text-body,#4b5563)]">
                                    Ingresa tu correo y contraseña registrados.
                                </p>
                            </div>

                            {/* Campo de Correo */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--psm-text-body,#4b5563)] uppercase tracking-wider">
                                    Correo Electrónico
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--psm-text-muted,#9ca3af)] group-focus-within:text-[var(--psm-teal,#00b4d8)] transition-colors" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[var(--psm-gray-light,#f0f4f8)] border border-transparent rounded-[var(--psm-radius-md,12px)] focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal,#00b4d8)] focus:bg-white transition-all text-sm font-medium text-[var(--psm-navy,#0f2044)] placeholder-[var(--psm-text-muted,#9ca3af)]"
                                        placeholder="ejemplo@unmsm.edu.pe"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Campo de Contraseña */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--psm-text-body,#4b5563)] uppercase tracking-wider">
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--psm-text-muted,#9ca3af)] group-focus-within:text-[var(--psm-teal,#00b4d8)] transition-colors" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[var(--psm-gray-light,#f0f4f8)] border border-transparent rounded-[var(--psm-radius-md,12px)] focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal,#00b4d8)] focus:bg-white transition-all text-sm text-[var(--psm-navy,#0f2044)] placeholder-[var(--psm-text-muted,#9ca3af)]"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full psm-btn-primary justify-center mt-3 py-3.5 shadow-sm disabled:opacity-60 cursor-pointer font-bold transition-all"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={18} className="animate-spin" />
                                        Iniciando sesión...
                                    </span>
                                ) : (
                                    <>
                                        <span>Ingresar</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            {/* Enlace para Activar Cuenta */}
                            <div className="pt-4 border-t border-slate-100 text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError('');
                                        setSuccessMessage('');
                                        setMode('activate');
                                    }}
                                    className="text-xs font-semibold text-[var(--psm-teal,#00b4d8)] hover:text-[var(--psm-blue-hover,#1e40af)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <KeyRound size={14} />
                                    <span>¿Es tu primera vez aquí? Activa tu cuenta</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* MODO 2: ACTIVAR CUENTA / PRIMER INGRESO */
                        <form onSubmit={handleActivateAccount} className="space-y-5">
                            <div className="border-b border-slate-100 pb-3 mb-2">
                                <h2 className="text-base font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-wide flex items-center gap-2">
                                    <UserCheck size={18} className="text-[var(--psm-teal,#00b4d8)]" />
                                    Activar Cuenta (Primer Ingreso)
                                </h2>
                                <p className="text-xs text-[var(--psm-text-body,#4b5563)] mt-1">
                                    Ingresa tu código y correo registrados en el padrón de PSM para activar tu acceso.
                                </p>
                            </div>

                            {/* Código Universitario */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--psm-text-body,#4b5563)] uppercase tracking-wider">
                                    Código Universitario
                                </label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--psm-text-muted,#9ca3af)] group-focus-within:text-[var(--psm-teal,#00b4d8)] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={codigoUniversitario}
                                        onChange={(e) => setCodigoUniversitario(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[var(--psm-gray-light,#f0f4f8)] border border-transparent rounded-[var(--psm-radius-md,12px)] focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal,#00b4d8)] focus:bg-white transition-all text-sm font-medium text-[var(--psm-navy,#0f2044)] placeholder-[var(--psm-text-muted,#9ca3af)]"
                                        placeholder="Ej. 19130141"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Correo Electrónico */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--psm-text-body,#4b5563)] uppercase tracking-wider">
                                    Correo Registrado en PSM
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--psm-text-muted,#9ca3af)] group-focus-within:text-[var(--psm-teal,#00b4d8)] transition-colors" size={18} />
                                    <input
                                        type="email"
                                        value={activateEmail}
                                        onChange={(e) => setActivateEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[var(--psm-gray-light,#f0f4f8)] border border-transparent rounded-[var(--psm-radius-md,12px)] focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal,#00b4d8)] focus:bg-white transition-all text-sm font-medium text-[var(--psm-navy,#0f2044)] placeholder-[var(--psm-text-muted,#9ca3af)]"
                                        placeholder="Institucional o personal de registro"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full psm-btn-primary justify-center mt-3 py-3.5 shadow-sm disabled:opacity-60 cursor-pointer font-bold transition-all"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={18} className="animate-spin" />
                                        Verificando en padrón...
                                    </span>
                                ) : (
                                    <>
                                        <span>Verificar y Activar Cuenta</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            {/* Volver a Login */}
                            <div className="pt-4 border-t border-slate-100 text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError('');
                                        setSuccessMessage('');
                                        setMode('login');
                                    }}
                                    className="text-xs font-semibold text-slate-600 hover:text-[var(--psm-navy,#0f2044)] transition-colors cursor-pointer"
                                >
                                    ← Volver a Iniciar Sesión
                                </button>
                            </div>
                        </form>
                    )}

                </div>

                {/* Enlace de soporte */}
                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => alert('Para soporte o asistencia con tu cuenta, comunícate con la Junta Directiva o envía un correo a contacto@proyectossanmarcos.org')}
                        className="text-xs font-medium text-[var(--psm-text-body,#4b5563)] hover:text-[var(--psm-teal,#00b4d8)] transition-colors cursor-pointer"
                    >
                        ¿Necesitas ayuda? Contactar a soporte.
                    </button>
                </div>

            </div>
        </div>
    );
}
