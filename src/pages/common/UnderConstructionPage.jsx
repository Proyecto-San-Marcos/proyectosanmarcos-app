import { Link } from 'react-router-dom';
import { Hammer, ArrowLeft, Sparkles, Clock } from 'lucide-react';

export default function UnderConstructionPage({
    title = "Módulo en Construcción",
    gerencia = "Proyectos San Marcos",
    fase = "Fase 2 / Sprint 2",
    description = "Este módulo está programado según el plan de implementación de la Intranet PSM UNMSM y estará disponible próximamente."
}) {
    return (
        <div className="animate-in fade-in duration-300 max-w-4xl mx-auto py-8 px-4">
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-8 sm:p-12 text-center relative overflow-hidden">
                {/* Accent glow background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--psm-teal-subtle)] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                <div className="relative z-10">
                    <div className="inline-flex p-4 rounded-3xl bg-[var(--psm-teal-subtle)] text-[var(--psm-teal,#00b4d8)] border border-[var(--psm-teal,#00b4d8)]/30 mb-6 shadow-xs">
                        <Hammer size={40} className="animate-bounce" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-4 uppercase tracking-wider">
                        <Clock size={14} />
                        <span>{fase}</span>
                    </div>

                    <h1
                        className="text-2xl sm:text-4xl font-bold text-[var(--psm-navy,#0f2044)] mb-3 uppercase tracking-tight"
                        style={{ fontFamily: 'var(--psm-font-heading)' }}
                    >
                        {title}
                    </h1>

                    <p className="text-xs sm:text-sm font-semibold text-[var(--psm-teal,#00b4d8)] uppercase tracking-wider mb-4">
                        Gerencia: {gerencia}
                    </p>

                    <p className="text-sm sm:text-base text-[var(--psm-text-body,#4b5563)] max-w-xl mx-auto leading-relaxed mb-8">
                        {description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/"
                            className="psm-btn-primary w-full sm:w-auto justify-center text-sm shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft size={16} />
                            <span>Volver al Dashboard Principal</span>
                        </Link>
                        <Link
                            to="/mi-perfil"
                            className="psm-btn-outline w-full sm:w-auto justify-center text-sm text-[var(--psm-navy)] border-[var(--psm-navy)] hover:bg-[var(--psm-navy)] hover:text-white"
                        >
                            <Sparkles size={16} />
                            <span>Ir a Mi Espacio</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
