import { Target, Clock, AlertCircle } from 'lucide-react';

export default function PmoPage() {
    return (
        <div className="animate-in fade-in duration-500">

            {/* Header Container */}
            <div className="bg-[var(--psm-white)] p-6 sm:p-8 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy)] tracking-tight uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Panel de Control - PMO
                    </h1>
                    <p className="text-[var(--psm-text-body)] mt-1 font-medium text-sm sm:text-base">Gestión y supervisión técnica de todos los proyectos activos.</p>
                </div>
                <button className="psm-btn-primary shadow-sm">
                    Nuevo Proyecto
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {/* KPI 1 */}
                <div className="bg-[var(--psm-white)] p-5 sm:p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                        <Target size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-1">Hitos Completados</p>
                        <p className="text-2xl font-bold text-[var(--psm-navy)]">12 / 15</p>
                    </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-[var(--psm-white)] p-5 sm:p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-1">Proyectos en Riesgo</p>
                        <p className="text-2xl font-bold text-[var(--psm-navy)]">3</p>
                    </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-[var(--psm-white)] p-5 sm:p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4 sm:col-span-2 lg:col-span-1 hover:-translate-y-1 transition-transform">
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl shrink-0">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-1">Salud del Portafolio</p>
                        <p className="text-2xl font-bold text-[var(--psm-navy)]">85%</p>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--psm-white)] border border-[var(--psm-gray-mid)] rounded-[var(--psm-radius-lg)] overflow-hidden shadow-[var(--psm-shadow-card)]">
                <div className="p-5 sm:p-6 border-b border-[var(--psm-gray-mid)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--psm-navy)] uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>Listado de Proyectos Rápidos</h2>

                    {/* Fix: Using a standard button style instead of the broken psm-btn-outline format */}
                    <button className="text-sm font-bold text-[var(--psm-teal)] bg-[var(--psm-teal-subtle)] hover:bg-[var(--psm-teal)] hover:text-white transition-colors py-2 px-6 rounded-full self-start sm:self-auto">
                        Ver Todos
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-[var(--psm-gray-light)] border-b border-[var(--psm-gray-mid)]">
                                <th className="p-4 text-xs font-bold text-[var(--psm-text-body)] uppercase tracking-wider">Proyecto</th>
                                <th className="p-4 text-xs font-bold text-[var(--psm-text-body)] uppercase tracking-wider">Estado</th>
                                <th className="p-4 text-xs font-bold text-[var(--psm-text-body)] uppercase tracking-wider">Fecha Fin</th>
                                <th className="p-4 text-xs font-bold text-[var(--psm-text-body)] uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--psm-gray-mid)]">
                            {[
                                { name: 'Talleres Educativos Sur', status: 'En Progreso', color: 'bg-blue-100 text-blue-800', date: '15 Nov 2026' },
                                { name: 'Campaña Invierno Cálido', status: 'En Riesgo', color: 'bg-amber-100 text-amber-800', date: '01 Dic 2026' },
                                { name: 'Acopio Solidario Central', status: 'Planificación', color: 'bg-green-100 text-green-800', date: '10 Ene 2027' },
                            ].map((proj, idx) => (
                                <tr key={idx} className="hover:bg-[var(--psm-gray-light)] transition-colors group">
                                    <td className="p-4 font-bold text-[var(--psm-navy)]">{proj.name}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${proj.color}`}>
                                            {proj.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[var(--psm-text-body)] text-sm font-medium">{proj.date}</td>
                                    <td className="p-4">
                                        <button className="text-[var(--psm-teal)] font-bold text-sm hover:text-[var(--psm-blue-hover)] transition-colors">Ver Detalles</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
