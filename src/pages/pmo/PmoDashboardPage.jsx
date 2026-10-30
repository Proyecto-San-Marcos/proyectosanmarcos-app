import { useState, useEffect, useMemo } from 'react';
import { pmoService } from '../../services/pmoService';
import {
    Target, Clock, AlertCircle, CheckCircle2,
    FolderKanban, Search, RefreshCw, Loader2,
    Calendar, User, ArrowUpRight, Plus, Activity
} from 'lucide-react';

const COLUMNAS_KANBAN = [
    { key: 'Planificación', title: 'Planificación', color: 'border-blue-400 bg-blue-50/40 text-blue-800' },
    { key: 'En Ejecución', title: 'En Ejecución', color: 'border-emerald-400 bg-emerald-50/40 text-emerald-800' },
    { key: 'Cierre', title: 'Cierre', color: 'border-purple-400 bg-purple-50/40 text-purple-800' },
];

export default function PmoDashboardPage() {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const loadProyectos = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await pmoService.getProyectos();
            if (!res.success) {
                setError('No fue posible cargar los proyectos desde Supabase.');
            } else {
                setProyectos(res.data || []);
            }
        } catch (err) {
            console.error('Error al cargar proyectos:', err);
            setError('Ocurrió un error inesperado al conectar con Supabase.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProyectos();
    }, []);

    // Proyectos filtrados
    const filteredProyectos = useMemo(() => {
        if (!searchQuery.trim()) return proyectos;
        const q = searchQuery.trim().toLowerCase();
        return proyectos.filter(p => {
            const nombre = (p.nombre || '').toLowerCase();
            const codigo = (p.codigo_proyecto || '').toLowerCase();
            const desc = (p.descripcion || '').toLowerCase();
            return nombre.includes(q) || codigo.includes(q) || desc.includes(q);
        });
    }, [proyectos, searchQuery]);

    // Métricas para KPIs
    const totalCount = proyectos.length;
    const enEjecucion = proyectos.filter(p => (p.estado || '').toLowerCase().includes('ejecuc')).length;
    const enRiesgo = proyectos.filter(p => (p.salud_proyecto || '').toLowerCase().includes('riesgo') || (p.salud_proyecto || '').toLowerCase().includes('crítico')).length;

    // Helper de badge de salud
    const renderSaludBadge = (salud) => {
        const s = (salud || 'En Tiempo').toLowerCase();
        if (s.includes('crítico')) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                    <AlertCircle size={10} />
                    Crítico
                </span>
            );
        }
        if (s.includes('riesgo')) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock size={10} />
                    En Riesgo
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={10} />
                En Tiempo
            </span>
        );
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* ENCABEZADO */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="psm-badge">
                            Gerencia de PMO
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            Núcleo Operativo
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Tablero Central de Proyectos (Kanban)
                    </h1>
                    <p className="text-[var(--psm-text-body,#4b5563)] mt-1 font-medium text-xs sm:text-sm">
                        Supervisión técnica, ciclo de vida y estado de salud de todos los proyectos activos en UNMSM.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadProyectos}
                        disabled={loading}
                        className="psm-btn-outline text-xs sm:text-sm py-2 px-3 font-bold text-[var(--psm-navy)] border-slate-300 hover:border-[var(--psm-teal)] hover:text-[var(--psm-teal)] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>

            {/* KPIS DE PORTAFOLIO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[var(--psm-white)] p-5 sm:p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                    <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                        <FolderKanban size={26} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-0.5">Total en Portafolio</p>
                        <p className="text-2xl font-extrabold text-[var(--psm-navy)]">{totalCount} <span className="text-xs font-medium text-slate-400">iniciativas</span></p>
                    </div>
                </div>

                <div className="bg-[var(--psm-white)] p-5 sm:p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                        <Activity size={26} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-0.5">En Ejecución</p>
                        <p className="text-2xl font-extrabold text-emerald-700">{enEjecucion} <span className="text-xs font-medium text-slate-400">activos</span></p>
                    </div>
                </div>

                <div className="bg-[var(--psm-white)] p-5 sm:p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                    <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                        <AlertCircle size={26} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-0.5">Proyectos en Riesgo</p>
                        <p className="text-2xl font-extrabold text-amber-600">{enRiesgo} <span className="text-xs font-medium text-slate-400">requieren atención</span></p>
                    </div>
                </div>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por código o nombre de proyecto..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[var(--psm-navy)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] shadow-xs transition-all"
                    />
                </div>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-semibold">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* TABLERO KANBAN */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-[var(--psm-teal)]" />
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--psm-navy)]">
                        Consultando proyectos en Supabase...
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {COLUMNAS_KANBAN.map((col) => {
                        // Normalizar coincidencia de estado (soporta variaciones como 'Ejecución' o 'En Ejecución')
                        const items = filteredProyectos.filter(p => {
                            const est = (p.estado || '').toLowerCase();
                            if (col.key === 'Planificación') return est.includes('planific') || est.includes('idea');
                            if (col.key === 'En Ejecución') return est.includes('ejecuc') || est.includes('progreso');
                            if (col.key === 'Cierre') return est.includes('cierre') || est.includes('finaliz');
                            return false;
                        });

                        return (
                            <div
                                key={col.key}
                                className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] overflow-hidden flex flex-col"
                            >
                                {/* Cabecera de la Columna */}
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full border-2 ${col.color.split(' ')[0]}`} />
                                        <h3 className="font-bold text-sm text-[var(--psm-navy,#0f2044)] uppercase">
                                            {col.title}
                                        </h3>
                                    </div>
                                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                                        {items.length}
                                    </span>
                                </div>

                                {/* Tarjetas de la Columna */}
                                <div className="p-4 space-y-4 min-h-[300px] bg-slate-50/30">
                                    {items.length === 0 ? (
                                        <div className="py-12 text-center text-slate-400">
                                            <p className="text-xs font-semibold">Sin proyectos en esta fase</p>
                                        </div>
                                    ) : (
                                        items.map((proj) => {
                                            const directorName = proj.director
                                                ? `${proj.director.nombres || ''} ${proj.director.apellidos || ''}`.trim()
                                                : 'Por asignar';

                                            return (
                                                <div
                                                    key={proj.id}
                                                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-[var(--psm-teal)] transition-all group cursor-pointer"
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <span className="text-[10px] font-mono font-bold text-[var(--psm-teal)] bg-[var(--psm-teal-subtle)] px-2 py-0.5 rounded">
                                                            {proj.codigo_proyecto || 'PSM-PROY'}
                                                        </span>
                                                        {renderSaludBadge(proj.salud_proyecto)}
                                                    </div>

                                                    <h4 className="font-bold text-sm text-[var(--psm-navy,#0f2044)] group-hover:text-[var(--psm-teal)] transition-colors mb-1.5 leading-snug">
                                                        {proj.nombre}
                                                    </h4>

                                                    {proj.descripcion && (
                                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                                                            {proj.descripcion}
                                                        </p>
                                                    )}

                                                    <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500 font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <User size={13} className="text-slate-400 shrink-0" />
                                                            <span className="truncate">{directorName}</span>
                                                        </div>

                                                        {proj.fecha_fin_estimada && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar size={13} className="text-slate-400 shrink-0" />
                                                                <span>Fin est: {proj.fecha_fin_estimada}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
