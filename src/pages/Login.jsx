import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        login({ username, password });
        navigate('/app');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--psm-gray-light)]">

            <div className="w-full max-w-sm flex flex-col items-center justify-center">
                {/* Logo and Brand */}
                <div className="mb-10 text-center">
                    <img src="https://uvsnieedcxndpdlyemgn.supabase.co/storage/v1/object/public/icons-psm/logo-nobg.png" alt="Logo" className="w-32 h-32" />
                </div>

                {/* Clean Form Container */}
                <div className="w-full bg-[var(--psm-white)] p-8 rounded-[var(--psm-radius-lg)] shadow-[var(--psm-shadow-card)] border border-[var(--psm-gray-mid)]">
                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Username Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--psm-text-body)] uppercase tracking-wider">Usuario</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--psm-text-muted)] group-focus-within:text-[var(--psm-teal)] transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-[var(--psm-gray-light)] border border-transparent rounded-[var(--psm-radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] focus:bg-white transition-all text-sm font-medium text-[var(--psm-navy)] placeholder-[var(--psm-text-muted)]"
                                    placeholder="Ej. m.lopez"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--psm-text-body)] uppercase tracking-wider">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--psm-text-muted)] group-focus-within:text-[var(--psm-teal)] transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-[var(--psm-gray-light)] border border-transparent rounded-[var(--psm-radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] focus:bg-white transition-all text-sm text-[var(--psm-navy)]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full psm-btn-primary justify-center mt-4 py-3.5 shadow-sm"
                        >
                            <span>Ingresar</span>
                            <ArrowRight size={18} />
                        </button>

                    </form>
                </div>

                {/* Support Link */}
                <div className="mt-8 text-center">
                    <button className="text-sm font-medium text-[var(--psm-text-body)] hover:text-[var(--psm-teal)] transition-colors">
                        ¿Necesitas ayuda? Contactar a soporte.
                    </button>
                </div>

            </div>

        </div>
    );
}
