import { useState, useEffect, useMemo } from 'react';
import { usuariosService } from '../../services/usuariosService';
import {
    Users, Search, Filter, ShieldCheck, Mail, Building,
    RefreshCw, Loader2, AlertCircle, Database, CheckCircle,
    UserCheck, ChevronLeft, ChevronRight, Download
} from 'lucide-react';

const GERENCIAS_OPCIONES = [
    'Todas',
    'Presidencia',
    'PMO',
    'Comunicaciones',
    'Finanzas',
    'Talento Humano'
];

export default function TecnologiaAdminPage() {
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGerencia, setSelectedGerencia] = useState('Todas');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Cargar miembros desde BD_TODOS
    const loadMiembros = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await usuariosService.getMiembros({
                query: '',
                gerencia: selectedGerencia !== 'Todas' ? selectedGerencia : '',
                limit: 500
            });

            if (!res.success) {
                setError('No fue posible cargar el padrón de miembros desde BD_TODOS.');
            } else {
                setMiembros(res.data || []);
            }
        } catch (err) {
            console.error('Error al cargar miembros:', err);
            setError('Ocurrió un error inesperado al conectar con Supabase.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMiembros();
    }, [selectedGerencia]);

    // Filtrar localmente con búsqueda
    const filteredMiembros = useMemo(() => {
        if (!searchQuery.trim()) return miembros;
        const q = searchQuery.trim().toLowerCase();

        return miembros.filter((m) => {
            const fullName = `${m.nombres || ''} ${m.apellidos || ''}`.toLowerCase();
            const codigo = (m.codigo_universitario || '').toString().toLowerCase();
            const gerencia = (m.gerencia_actual || '').toLowerCase();
            const cargo = (m.cargo || '').toLowerCase();
            const correo = (m.correo_institucional || m.correo_personal || '').toLowerCase();

            return (
                fullName.includes(q) ||
                codigo.includes(q) ||
                gerencia.includes(q) ||
                cargo.includes(q) ||
                correo.includes(q)
            );
        });
    }, [miembros, searchQuery]);

    // Paginación
    const totalPages = Math.ceil(filteredMiembros.length / pageSize) || 1;
    const paginatedMiembros = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredMiembros.slice(start, start + pageSize);
    }, [filteredMiembros, currentPage, pageSize]);

    // Estadísticas
    const totalCount = miembros.length;
    const gerenciasActivas = new Set(miembros.map(m => m.gerencia_actual).filter(Boolean)).size;

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* ENCABEZADO DE LA SECCIÓN */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="psm-badge">
                            Tecnología y Sistemas
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            Sub-área 5 • Talento Humano
                        </span>
                    </div>
                    <h1
                        className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight"
                        style={{ fontFamily: 'var(--psm-font-heading)' }}
                    >
                        Padrón y Administración de Miembros
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] font-medium">
                        Gestión centralizada del padrón maestro de la organización en la tabla <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-xs font-bold">BD_TODOS</code>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadMiembros}
                        disabled={loading}
                        className="psm-btn-outline text-xs sm:text-sm py-2.5 px-4 font-bold text-[var(--psm-navy)] border-slate-300 hover:border-[var(--psm-teal)] hover:text-[var(--psm-teal)] transition-all cursor-pointer flex items-center gap-2"
                        title="Recargar datos"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>

            {/* TARJETAS DE INDICADORES RÁPIDOS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted,#9ca3af)] uppercase tracking-wider mb-0.5">
                            Total en Padrón
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold text-[var(--psm-navy,#0f2044)]">
                            {totalCount} <span className="text-xs font-medium text-slate-400">voluntarios</span>
                        </p>
                    </div>
                </div>

                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted,#9ca3af)] uppercase tracking-wider mb-0.5">
                            Padrón Habilitado
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                            100% <span className="text-xs font-medium text-slate-400">listos para activar</span>
                        </p>
                    </div>
                </div>

                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                        <Database size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted,#9ca3af)] uppercase tracking-wider mb-0.5">
                            Gerencias Activas
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold text-[var(--psm-navy,#0f2044)]">
                            {gerenciasActivas || 5} <span className="text-xs font-medium text-slate-400">áreas</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* TABLA PRINCIPAL Y FILTROS */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] overflow-hidden">
                {/* BARRA DE HERRAMIENTAS: BÚSQUEDA Y FILTRO */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Búsqueda */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Buscar por nombre, código o cargo..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[var(--psm-navy)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Filtro por Gerencia */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400 shrink-0" />
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Gerencia:
                            </label>
                        </div>
                        <select
                            value={selectedGerencia}
                            onChange={(e) => {
                                setSelectedGerencia(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-slate-50 border border-slate-200 text-sm font-semibold text-[var(--psm-navy)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] cursor-pointer"
                        >
                            {GERENCIAS_OPCIONES.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* MENSAJES DE ERROR */}
                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3 text-red-700 text-xs font-semibold">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* TABLA DE MIEMBROS */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                            <Loader2 size={32} className="animate-spin text-[var(--psm-teal)]" />
                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--psm-navy)]">
                                Consultando BD_TODOS...
                            </p>
                        </div>
                    ) : filteredMiembros.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <Users size={40} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-bold text-slate-700">No se encontraron miembros</p>
                            <p className="text-xs text-slate-400 mt-1">Prueba modificando los términos de búsqueda o el filtro de gerencia.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-100">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Miembro</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gerencia</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {paginatedMiembros.map((m, idx) => {
                                    const fullName = `${m.nombres || ''} ${m.apellidos || ''}`.trim() || 'Sin Nombre';
                                    const codigo = m.codigo_universitario || '---';
                                    const gerencia = m.gerencia_actual || 'General';
                                    const cargo = m.cargo || 'Voluntario';
                                    const correo = m.correo_institucional || m.correo_personal || 'Sin correo';

                                    // Color badge por gerencia
                                    let badgeColor = 'bg-slate-100 text-slate-700';
                                    if (gerencia.includes('Presidencia')) badgeColor = 'bg-purple-100 text-purple-800';
                                    else if (gerencia.includes('PMO')) badgeColor = 'bg-blue-100 text-blue-800';
                                    else if (gerencia.includes('Comunicaciones')) badgeColor = 'bg-pink-100 text-pink-800';
                                    else if (gerencia.includes('Finanzas')) badgeColor = 'bg-emerald-100 text-emerald-800';
                                    else if (gerencia.includes('Talento Humano')) badgeColor = 'bg-amber-100 text-amber-800';

                                    return (
                                        <tr key={m.id || idx} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="p-4 font-mono font-bold text-[var(--psm-navy)]">
                                                {codigo}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1b3068&color=fff&size=64&bold=true`}
                                                        alt={fullName}
                                                        className="w-8 h-8 rounded-full shrink-0 shadow-xs"
                                                    />
                                                    <span className="font-bold text-[var(--psm-navy)]">
                                                        {fullName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
                                                    {gerencia}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-700 font-medium">
                                                {cargo}
                                            </td>
                                            <td className="p-4 text-slate-500 font-mono text-xs">
                                                {correo}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle size={12} />
                                                    Activo
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PIE DE TABLA / PAGINACIÓN */}
                {!loading && filteredMiembros.length > 0 && (
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <p>
                            Mostrando <strong className="text-slate-800">{paginatedMiembros.length}</strong> de <strong className="text-slate-800">{filteredMiembros.length}</strong> miembros encontrados
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-2 font-bold text-slate-700">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
