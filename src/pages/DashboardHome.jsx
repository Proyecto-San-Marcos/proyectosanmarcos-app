import { Calendar, Briefcase, DollarSign, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATS_MOCK = [
    { title: 'Voluntarios Activos', value: '1,240', trend: '+12%', icon: Users },
    { title: 'Proyectos en Curso', value: '45', trend: '+5%', icon: Briefcase },
    { title: 'Horas Voluntariado', value: '15,300', trend: '+20%', icon: Calendar },
    { title: 'Presupuesto Ejecutado', value: '$85,000', trend: '-2%', icon: DollarSign },
];

export default function DashboardHome() {
    const { user } = useAuth();
    const role = user?.role || 'Gerencia';
    const name = user?.name?.split(' ')[0] || 'Usuario';

    return (
        <div className="animate-in fade-in duration-500">
            {/* Welcome Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--psm-navy)] tracking-tight uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Hola, {name}
                    </h1>
                    <p className="text-[var(--psm-text-body)] mt-1 text-sm md:text-base font-medium">Aquí tienes el resumen de tu gerencia ({role}) para hoy.</p>
                </div>
                <button className="psm-btn-primary w-full md:w-auto justify-center shadow-[var(--psm-shadow-card)] hover:shadow-[var(--psm-shadow-card-dark)]">
                    Generar Reporte
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {STATS_MOCK.map((stat, idx) => {
                    const Icon = stat.icon;
                    const isPositive = stat.trend.startsWith('+');
                    return (
                        <div
                            key={idx}
                            className="bg-[var(--psm-white)] rounded-[var(--psm-radius-lg)] p-5 sm:p-6 border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] hover:-translate-y-1 transition-all duration-300 group cursor-default"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="psm-icon-circle group-hover:scale-110 group-hover:bg-[var(--psm-teal)] group-hover:text-white transition-all duration-300">
                                    <Icon size={24} />
                                </div>
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-[var(--psm-text-muted)] text-sm font-bold tracking-wide uppercase mb-1">{stat.title}</h3>
                                <p className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy)] tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Extra generic sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[var(--psm-white)] border border-[var(--psm-gray-mid)] rounded-[var(--psm-radius-lg)] p-5 sm:p-6 shadow-[var(--psm-shadow-card)]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[var(--psm-navy)] font-bold text-lg uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>Actividad Reciente</h3>
                        <button className="text-sm font-bold text-[var(--psm-teal)] hover:text-[var(--psm-blue-hover)] transition-colors">Ver todo</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-3 border-b border-[var(--psm-gray-mid)] last:border-0 last:pb-0 hover:bg-[var(--psm-gray-light)] rounded-lg px-2 -mx-2 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-[var(--psm-gray-light)] flex items-center justify-center text-[var(--psm-text-muted)] shrink-0 border border-[var(--psm-gray-mid)]">
                                    <Calendar size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-[var(--psm-navy)]">Actualización trimestral de proyectos de impacto social {i + 1}</p>
                                    <p className="text-xs text-[var(--psm-text-muted)] mt-0.5">Hace {i + 2} horas • Por PMO</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[var(--psm-white)] border border-[var(--psm-gray-mid)] rounded-[var(--psm-radius-lg)] p-6 shadow-[var(--psm-shadow-card)] relative overflow-hidden group">
                    {/* Decorative accent background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--psm-teal)] opacity-[0.05] rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <h3 className="text-[var(--psm-navy)] font-bold text-lg mb-2 uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>Centro de Ayuda</h3>
                            <p className="text-sm text-[var(--psm-text-body)] mb-6 leading-relaxed">
                                Encuentra guías y recursos rápidos para navegar por la nueva Intranet de Proyectos San Marcos.
                            </p>
                        </div>

                        <button className="psm-btn-outline w-full justify-center">
                            Ir a Documentación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
