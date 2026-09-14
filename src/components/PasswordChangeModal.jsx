import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function PasswordChangeModal({ isOpen, onClose, isMandatory = false }) {
    const { updatePassword } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden. Por favor verifícalas.');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await updatePassword(newPassword);

            if (!result.success) {
                const msg = result.error?.message || 'Error al actualizar la contraseña.';
                if (msg.includes('same_password')) {
                    setError('La nueva contraseña no puede ser idéntica a la anterior.');
                } else {
                    setError(msg);
                }
            } else {
                setSuccessMessage('¡Contraseña actualizada con éxito! Redirigiendo...');
                setTimeout(() => {
                    if (onClose) onClose();
                }, 1500);
            }
        } catch (err) {
            setError('Ocurrió un error inesperado. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Header decorativo */}
                <div className="bg-[var(--psm-navy)] px-6 py-6 text-white text-center relative">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--psm-teal-subtle)] border-2 border-[var(--psm-teal)] flex items-center justify-center text-[var(--psm-teal)]">
                        <ShieldAlert size={28} />
                    </div>
                    <h2 className="text-xl font-bold tracking-wide uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        {isMandatory ? 'Cambio Obligatorio de Contraseña' : 'Actualizar Contraseña'}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                        {isMandatory
                            ? 'Por seguridad, debes configurar tu contraseña personal antes de continuar en la Intranet.'
                            : 'Define una nueva contraseña segura para tu cuenta de Proyectos San Marcos.'}
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Alerta de Error */}
                    {error && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Alerta de Éxito */}
                    {successMessage && (
                        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium animate-in fade-in">
                            <CheckCircle size={16} className="shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Nueva contraseña */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                disabled={isSubmitting}
                                required
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] focus:bg-white transition-all disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                disabled={isSubmitting}
                                required
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] focus:bg-white transition-all disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full psm-btn-primary justify-center py-3 shadow-md hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer font-bold text-sm"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Actualizando contraseña...
                                </span>
                            ) : (
                                'Guardar y Continuar'
                            )}
                        </button>

                        {!isMandatory && onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
