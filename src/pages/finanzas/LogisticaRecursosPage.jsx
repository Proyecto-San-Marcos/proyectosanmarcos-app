import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { finanzasService } from '../../services/finanzasService';
import { pmoService } from '../../services/pmoService';
import {
    Box, Calendar, Clock, MapPin, Plus, Search,
    Filter, RefreshCw, Loader2, AlertCircle, CheckCircle,
    Building2, CheckSquare, Layers, Send
} from 'lucide-react';

export default function LogisticaRecursosPage() {
    const { user } = useAuth();
    const [inventario, setInventario] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('Todos');

    const [formData, setFormData] = useState({
        proyecto_id: '',
        recurso_id: '',
        espacio_requerido: '',
        fecha_uso_inicio: '',
        fecha_uso_fin: '',
        justificacion: ''
    });

    const memberId = user?.user_metadata?.member_id || user?.id;

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            // Inventario
            const resInv = await finanzasService.getInventario();
            if (resInv.success) setInventario(resInv.data || []);

            // Solicitudes
            const resSol = await finanzasService.getSolicitudesRecursos({ solicitanteId: memberId });
            if (resSol.success) setSolicitudes(resSol.data || []);

            // Proyectos
            const resProy = await pmoService.getProyectos();
            if (resProy.success) setProyectos(resProy.data || []);
        } catch (err) {
            console.error('Error al cargar logística y recursos:', err);
            setError('Ocurrió un error inesperado al conectar con Supabase.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [memberId]);

    // Filtrar inventario
    const filteredInventario = useMemo(() => {
        return inventario.filter(item => {
            const matchesTipo = tipoFiltro === 'Todos' || item.tipo === tipoFiltro;
            const matchesSearch = !searchQuery.trim() ||
                (item.nombre_recurso || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.notas || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTipo && matchesSearch;
        });
    }, [inventario, tipoFiltro, searchQuery]);

    const handleSubmitSolicitud = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!formData.fecha_uso_inicio || !formData.fecha_uso_fin || !formData.justificacion.trim()) {
            setError('Por favor completa las fechas y la justificación requerida.');
            return;
        }

        if (!formData.recurso_id && !formData.espacio_requerido.trim()) {
            setError('Debes seleccionar un recurso del inventario o especificar un aula/espacio UNMSM.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await finanzasService.crearSolicitudRecurso({
                solicitante_id: memberId,
                proyecto_id: formData.proyecto_id || null,
                recurso_id: formData.recurso_id || null,
                espacio_requerido: formData.espacio_requerido.trim() || null,
                fecha_uso_inicio: formData.fecha_uso_inicio,
                fecha_uso_fin: formData.fecha_uso_fin,
                justificacion: formData.justificacion.trim()
            });

            if (!res.success) {
                setError('No fue posible enviar la solicitud.');
            } else {
                setSuccessMessage('¡Solicitud de recurso registrada con éxito! El área de Finanzas y Logística evaluará la disponibilidad.');
                setIsModalOpen(false);
                setFormData({
                    proyecto_id: '',
                    recurso_id: '',
                    espacio_requerido: '',
                    fecha_uso_inicio: '',
                    fecha_uso_fin: '',
                    justificacion: ''
                });
                await loadData();
            }
        } catch (err) {
            console.error('Error en handleSubmitSolicitud:', err);
            setError('Ocurrió un error inesperado.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* ENCABEZADO */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="psm-badge">
                            Gerencia de Finanzas
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            Sub-área 1 • Logística y Espacios
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Inventario y Solicitud de Recursos / Aulas
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] font-medium">
                        Control de bienes institucionales, licencias y reserva de aulas / auditorios en facultades de la UNMSM.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="psm-btn-outline text-xs sm:text-sm py-2 px-3 font-bold text-[var(--psm-navy)] border-slate-300 hover:border-[var(--psm-teal)] hover:text-[var(--psm-teal)] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        <span>Actualizar</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="psm-btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-sm cursor-pointer flex items-center gap-2"
                    >
                        <Plus size={16} />
                        <span>Nueva Solicitud</span>
                    </button>
                </div>
            </div>

            {/* ALERTS */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-semibold">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
                    <CheckCircle size={18} className="shrink-0 text-emerald-600" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* SECCIÓN 1: CATÁLOGO DE INVENTARIO */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--psm-navy,#0f2044)] uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                            Catálogo de Bienes y Licencias Disponibles
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">Recursos físicos y cuentas digitales de la organización.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {['Todos', 'Físico', 'Digital'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTipoFiltro(t)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    tipoFiltro === t
                                        ? 'bg-[var(--psm-navy,#0f2044)] text-white shadow-xs'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Loader2 size={28} className="animate-spin text-[var(--psm-teal)]" />
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--psm-navy)]">Cargando inventario...</p>
                    </div>
                ) : filteredInventario.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                        <Box size={36} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-bold text-slate-700">Sin recursos disponibles</p>
                        <p className="text-xs text-slate-400 mt-0.5">No hay elementos registrados para este filtro en la tabla <code className="font-mono text-slate-600">inventario_recursos</code>.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredInventario.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-[var(--psm-teal)] transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                            item.tipo === 'Digital' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                                        }`}>
                                            {item.tipo || 'Físico'}
                                        </span>
                                        <span className="text-xs font-bold text-slate-600">
                                            Disp: <strong className="text-emerald-600">{item.cantidad_disponible || 0}</strong> / {item.cantidad_total || 1}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-base text-[var(--psm-navy,#0f2044)] mb-1">
                                        {item.nombre_recurso}
                                    </h3>
                                    {item.notas && (
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                            {item.notas}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-400 text-[11px]">
                                        Custodio: <strong className="text-slate-600">{item.responsable_custodia || 'Finanzas'}</strong>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, recurso_id: item.id }));
                                            setIsModalOpen(true);
                                        }}
                                        className="text-[var(--psm-teal)] hover:text-[var(--psm-navy)] font-bold transition-colors cursor-pointer"
                                    >
                                        Pedir este recurso →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECCIÓN 2: HISTORIAL DE MIS SOLICITUDES */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-[var(--psm-navy,#0f2044)] uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Mis Solicitudes de Aulas y Recursos
                    </h2>
                    <span className="text-xs font-bold text-slate-500">
                        Total: {solicitudes.length}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 text-center text-slate-400">
                            <Loader2 size={24} className="animate-spin mx-auto text-[var(--psm-teal)] mb-1" />
                            <p className="text-xs font-semibold">Cargando solicitudes...</p>
                        </div>
                    ) : solicitudes.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            <MapPin size={32} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-bold text-slate-700">Sin solicitudes de aulas o recursos</p>
                            <p className="text-xs text-slate-400 mt-0.5">Usa el botón "Nueva Solicitud" para tramitar reservas.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="p-4">Recurso / Espacio</th>
                                    <th className="p-4">Proyecto</th>
                                    <th className="p-4">Periodo de Uso</th>
                                    <th className="p-4">Justificación</th>
                                    <th className="p-4 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {solicitudes.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-[var(--psm-navy)]">
                                                {s.recurso?.nombre_recurso || s.espacio_requerido || 'Recurso General'}
                                            </p>
                                            {s.espacio_requerido && s.recurso && (
                                                <p className="text-[11px] text-slate-400">Espacio: {s.espacio_requerido}</p>
                                            )}
                                        </td>
                                        <td className="p-4 font-semibold text-slate-700">
                                            {s.proyecto?.nombre || 'General'}
                                        </td>
                                        <td className="p-4 text-slate-600 font-mono text-xs">
                                            <div>Desde: {new Date(s.fecha_uso_inicio).toLocaleString()}</div>
                                            <div>Hasta: {new Date(s.fecha_uso_fin).toLocaleString()}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 max-w-xs truncate" title={s.justificacion}>
                                            {s.justificacion}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                s.estado === 'Aprobado'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : s.estado === 'Rechazado'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {s.estado || 'Pendiente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL DE SOLICITUD */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[var(--psm-navy,#0f2044)] uppercase">
                                        Solicitud de Aula o Recurso
                                    </h3>
                                    <p className="text-xs text-slate-400">Canaliza tu reserva con Finanzas y Logística</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitSolicitud} className="space-y-4">
                            {/* Proyecto */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Proyecto Asociado (Opcional)
                                </label>
                                <select
                                    value={formData.proyecto_id}
                                    onChange={(e) => setFormData({ ...formData, proyecto_id: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] cursor-pointer"
                                >
                                    <option value="">General / Actividades Institucionales</option>
                                    {proyectos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.codigo_proyecto ? `[${p.codigo_proyecto}] ` : ''}{p.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Recurso de inventario */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Recurso del Inventario (Si aplica)
                                </label>
                                <select
                                    value={formData.recurso_id}
                                    onChange={(e) => setFormData({ ...formData, recurso_id: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] cursor-pointer"
                                >
                                    <option value="">Ninguno / Solo pedir Aula o Espacio físico</option>
                                    {inventario.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nombre_recurso} ({item.tipo}) - Disp: {item.cantidad_disponible}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Espacio o Aula UNMSM */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Aula, Auditorio o Espacio UNMSM
                                </label>
                                <input
                                    type="text"
                                    value={formData.espacio_requerido}
                                    onChange={(e) => setFormData({ ...formData, espacio_requerido: e.target.value })}
                                    placeholder="Ej: Auditorio Facultad de Sistemas / Aula 204"
                                    className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Inicio */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Fecha y Hora Inicio *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.fecha_uso_inicio}
                                        onChange={(e) => setFormData({ ...formData, fecha_uso_inicio: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 text-xs text-[var(--psm-navy)] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] font-mono"
                                        required
                                    />
                                </div>

                                {/* Fin */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Fecha y Hora Fin *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.fecha_uso_fin}
                                        onChange={(e) => setFormData({ ...formData, fecha_uso_fin: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 text-xs text-[var(--psm-navy)] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Justificación */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Justificación y Objetivo de la Actividad *
                                </label>
                                <textarea
                                    rows="3"
                                    value={formData.justificacion}
                                    onChange={(e) => setFormData({ ...formData, justificacion: e.target.value })}
                                    placeholder="Explica el motivo del uso, cantidad estimada de asistentes, etc."
                                    className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] resize-none"
                                    required
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="psm-btn-primary text-xs py-2.5 px-5 shadow-xs cursor-pointer flex items-center gap-2"
                                >
                                    {submitting && <Loader2 size={14} className="animate-spin" />}
                                    <span>Enviar Solicitud</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
