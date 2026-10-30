import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { horasService } from '../../services/horasService';
import { pmoService } from '../../services/pmoService';
import {
    Clock, CheckCircle, XCircle, AlertCircle, Calendar,
    Plus, Search, RefreshCw, Loader2, Check, X,
    FileText, Link as LinkIcon, ShieldCheck, UserCheck, Layers
} from 'lucide-react';

export default function RegistroHorasPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('mis-horas'); // 'mis-horas' | 'aprobaciones'
    const [misHoras, setMisHoras] = useState([]);
    const [horasPendientes, setHorasPendientes] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Estado del Modal de Marcación
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [actionId, setActionId] = useState(null); // id en proceso de aprobar/rechazar

    // Campos del formulario
    const [formData, setFormData] = useState({
        proyecto_id: '',
        fecha_actividad: new Date().toISOString().split('T')[0],
        horas: '',
        descripcion_tarea: '',
        enlace_evidencia: ''
    });

    const memberId = user?.user_metadata?.member_id || user?.id;
    const userRole = (user?.role || user?.gerencia || '').toLowerCase();
    const canApprove = userRole.includes('talento humano') ||
                       userRole.includes('presidencia') ||
                       userRole.includes('junta directiva') ||
                       userRole.includes('coordinador') ||
                       userRole.includes('director') ||
                       userRole.includes('admin');

    // Cargar datos
    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            // Cargar proyectos para el selector
            const resProy = await pmoService.getProyectos();
            if (resProy.success) {
                setProyectos(resProy.data || []);
            }

            // Cargar mis horas
            if (memberId) {
                const resHoras = await horasService.getMisHoras(memberId);
                if (resHoras.success) {
                    setMisHoras(resHoras.data || []);
                }
            }

            // Si tiene permiso para aprobar, cargar pendientes
            if (canApprove) {
                const resPend = await horasService.getHorasPendientes();
                if (resPend.success) {
                    setHorasPendientes(resPend.data || []);
                }
            }
        } catch (err) {
            console.error('Error al cargar horas:', err);
            setError('Ocurrió un error inesperado al conectar con Supabase.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [memberId]);

    // Manejar envío de nueva marcación
    const handleSubmitMarcacion = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!formData.fecha_actividad || !formData.horas || !formData.descripcion_tarea.trim()) {
            setError('Por favor completa todos los campos requeridos.');
            return;
        }

        const numHoras = parseFloat(formData.horas);
        if (isNaN(numHoras) || numHoras <= 0 || numHoras > 24) {
            setError('Las horas deben ser un número mayor a 0 y menor o igual a 24.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await horasService.registrarHoras({
                miembro_id: memberId,
                proyecto_id: formData.proyecto_id || null,
                fecha_actividad: formData.fecha_actividad,
                horas: numHoras,
                descripcion_tarea: formData.descripcion_tarea.trim(),
                enlace_evidencia: formData.enlace_evidencia.trim()
            });

            if (!res.success) {
                setError('No fue posible guardar la marcación de horas.');
            } else {
                setSuccessMessage('¡Marcación registrada con éxito! Queda pendiente de aprobación por TH o tu coordinador.');
                setIsModalOpen(false);
                setFormData({
                    proyecto_id: '',
                    fecha_actividad: new Date().toISOString().split('T')[0],
                    horas: '',
                    descripcion_tarea: '',
                    enlace_evidencia: ''
                });
                await loadData();
            }
        } catch (err) {
            console.error('Error en handleSubmitMarcacion:', err);
            setError('Ocurrió un error inesperado al registrar tus horas.');
        } finally {
            setSubmitting(false);
        }
    };

    // Manejar Aprobación / Rechazo
    const handleAprobarRechazar = async (id, nuevoEstado) => {
        setActionId(id);
        setError('');
        try {
            const res = await horasService.aprobarRechazarHoras(id, nuevoEstado, memberId);
            if (!res.success) {
                setError(`No fue posible cambiar el estado a ${nuevoEstado}.`);
            } else {
                // Actualizar listas
                setHorasPendientes(prev => prev.filter(item => item.id !== id));
                setMisHoras(prev => prev.map(item => item.id === id ? { ...item, estado: nuevoEstado } : item));
                setSuccessMessage(`Marcación marcada como ${nuevoEstado} exitosamente.`);
            }
        } catch (err) {
            console.error('Error en handleAprobarRechazar:', err);
            setError('Ocurrió un error al procesar la solicitud.');
        } finally {
            setActionId(null);
        }
    };

    // Resumen de horas acumuladas
    const totalAprobadas = misHoras
        .filter(h => h.estado === 'Aprobado')
        .reduce((sum, h) => sum + (parseFloat(h.horas) || 0), 0);

    const totalPendientes = misHoras
        .filter(h => h.estado === 'Pendiente')
        .reduce((sum, h) => sum + (parseFloat(h.horas) || 0), 0);

    const renderBadgeEstado = (estado) => {
        if (estado === 'Aprobado') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle size={12} />
                    Aprobado
                </span>
            );
        }
        if (estado === 'Rechazado') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    <XCircle size={12} />
                    Rechazado
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Clock size={12} />
                Pendiente
            </span>
        );
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* ENCABEZADO */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="psm-badge">
                            Talento Humano
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            Sub-área 1 • Asistencia y Registro
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Control de Asistencia y Registro de Horas
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] font-medium">
                        Marcación semanal de actividades realizadas. Base para la emisión de la constancia oficial de voluntariado.
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
                        <span>Registrar Horas</span>
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

            {/* TARJETAS RESUMEN DE MIS HORAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[var(--psm-white)] p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-0.5">Horas Aprobadas</p>
                        <p className="text-3xl font-extrabold text-emerald-700">{totalAprobadas.toFixed(1)} <span className="text-xs font-semibold text-slate-400">hrs</span></p>
                    </div>
                </div>

                <div className="bg-[var(--psm-white)] p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-0.5">Horas Pendientes</p>
                        <p className="text-3xl font-extrabold text-amber-600">{totalPendientes.toFixed(1)} <span className="text-xs font-semibold text-slate-400">hrs</span></p>
                    </div>
                </div>

                <div className="bg-[var(--psm-white)] p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-0.5">Total Marcaciones</p>
                        <p className="text-3xl font-extrabold text-[var(--psm-navy)]">{misHoras.length} <span className="text-xs font-semibold text-slate-400">registros</span></p>
                    </div>
                </div>
            </div>

            {/* PESTAÑAS (TABS): MIS HORAS vs BANDEJA DE APROBACIÓN */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] overflow-hidden">
                <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('mis-horas')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'mis-horas'
                                    ? 'bg-[var(--psm-navy,#0f2044)] text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Historial de Mis Horas ({misHoras.length})
                        </button>

                        {canApprove && (
                            <button
                                onClick={() => setActiveTab('aprobaciones')}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    activeTab === 'aprobaciones'
                                        ? 'bg-[var(--psm-navy,#0f2044)] text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <ShieldCheck size={16} className={activeTab === 'aprobaciones' ? 'text-[var(--psm-teal)]' : 'text-slate-400'} />
                                <span>Aprobación de Horas</span>
                                {horasPendientes.length > 0 && (
                                    <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                        {horasPendientes.length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* TAB 1: HISTORIAL DE MIS HORAS */}
                {activeTab === 'mis-horas' && (
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                                <Loader2 size={32} className="animate-spin text-[var(--psm-teal)]" />
                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--psm-navy)]">
                                    Cargando historial de horas...
                                </p>
                            </div>
                        ) : misHoras.length === 0 ? (
                            <div className="py-16 text-center text-slate-400">
                                <Clock size={40} className="mx-auto mb-2 text-slate-300" />
                                <p className="text-sm font-bold text-slate-700">Aún no has registrado horas</p>
                                <p className="text-xs text-slate-400 mt-1">Haz clic en "Registrar Horas" para guardar tu primera actividad.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Proyecto</th>
                                        <th className="p-4">Horas</th>
                                        <th className="p-4">Tarea Realizada</th>
                                        <th className="p-4">Evidencia</th>
                                        <th className="p-4 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                    {misHoras.map((h) => (
                                        <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="p-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                                                {h.fecha_actividad}
                                            </td>
                                            <td className="p-4 font-bold text-[var(--psm-navy)]">
                                                {h.proyecto?.nombre || 'General / Operativo'}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-[var(--psm-teal)]">
                                                {h.horas} hrs
                                            </td>
                                            <td className="p-4 text-slate-600 max-w-xs truncate" title={h.descripcion_tarea}>
                                                {h.descripcion_tarea}
                                            </td>
                                            <td className="p-4">
                                                {h.enlace_evidencia ? (
                                                    <a
                                                        href={h.enlace_evidencia}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[var(--psm-teal)] hover:underline inline-flex items-center gap-1 font-semibold text-xs"
                                                    >
                                                        <LinkIcon size={12} />
                                                        <span>Ver Enlace</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Sin enlace</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {renderBadgeEstado(h.estado)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB 2: APROBACIONES PENDIENTES (TALENTO HUMANO / LÍDERES) */}
                {activeTab === 'aprobaciones' && canApprove && (
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                                <Loader2 size={32} className="animate-spin text-[var(--psm-teal)]" />
                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--psm-navy)]">
                                    Consultando solicitudes pendientes...
                                </p>
                            </div>
                        ) : horasPendientes.length === 0 ? (
                            <div className="py-16 text-center text-slate-400">
                                <CheckCircle size={40} className="mx-auto mb-2 text-emerald-400" />
                                <p className="text-sm font-bold text-slate-700">¡Bandeja al día!</p>
                                <p className="text-xs text-slate-400 mt-1">No hay marcaciones de horas pendientes de revisión en este momento.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="p-4">Miembro</th>
                                        <th className="p-4">Proyecto</th>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Horas</th>
                                        <th className="p-4">Detalle / Evidencia</th>
                                        <th className="p-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                    {horasPendientes.map((h) => {
                                        const voluntarioName = h.miembro
                                            ? `${h.miembro.nombres || ''} ${h.miembro.apellidos || ''}`.trim()
                                            : 'Voluntario';
                                        const isProcessing = actionId === h.id;

                                        return (
                                            <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-bold text-[var(--psm-navy)]">{voluntarioName}</p>
                                                        <p className="text-[11px] text-slate-400">{h.miembro?.gerencia_actual || 'General'}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-semibold text-slate-700">
                                                    {h.proyecto?.nombre || 'General / Operativo'}
                                                </td>
                                                <td className="p-4 font-mono text-slate-600">
                                                    {h.fecha_actividad}
                                                </td>
                                                <td className="p-4 font-mono font-bold text-[var(--psm-teal)]">
                                                    {h.horas} hrs
                                                </td>
                                                <td className="p-4 max-w-xs">
                                                    <p className="text-xs text-slate-600 line-clamp-2">{h.descripcion_tarea}</p>
                                                    {h.enlace_evidencia && (
                                                        <a
                                                            href={h.enlace_evidencia}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[var(--psm-teal)] hover:underline inline-flex items-center gap-1 font-semibold text-[11px] mt-1"
                                                        >
                                                            <LinkIcon size={11} />
                                                            <span>Ver evidencia</span>
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAprobarRechazar(h.id, 'Aprobado')}
                                                            disabled={isProcessing}
                                                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 text-xs"
                                                            title="Aprobar Horas"
                                                        >
                                                            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                            <span>Aprobar</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAprobarRechazar(h.id, 'Rechazado')}
                                                            disabled={isProcessing}
                                                            className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 text-xs"
                                                            title="Rechazar Horas"
                                                        >
                                                            <X size={14} />
                                                            <span>Rechazar</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL PARA MARCAR HORAS */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[var(--psm-navy,#0f2044)] uppercase">
                                        Registrar Horas de Voluntariado
                                    </h3>
                                    <p className="text-xs text-slate-400">Ingresa la actividad realizada y su evidencia</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitMarcacion} className="space-y-4">
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
                                    <option value="">General / Actividades de Organización</option>
                                    {proyectos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.codigo_proyecto ? `[${p.codigo_proyecto}] ` : ''}{p.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Fecha */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Fecha de Actividad *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fecha_actividad}
                                        onChange={(e) => setFormData({ ...formData, fecha_actividad: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] font-mono"
                                        required
                                    />
                                </div>

                                {/* Horas */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Horas Dedicadas *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        max="24"
                                        value={formData.horas}
                                        onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
                                        placeholder="Ej: 3.5"
                                        className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Descripción Tarea */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Descripción de la Tarea Realizada *
                                </label>
                                <textarea
                                    rows="3"
                                    value={formData.descripcion_tarea}
                                    onChange={(e) => setFormData({ ...formData, descripcion_tarea: e.target.value })}
                                    placeholder="Detalla las actividades y entregables realizados..."
                                    className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] resize-none"
                                    required
                                />
                            </div>

                            {/* Enlace Evidencia */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Enlace de Evidencia (Google Drive / GitHub / Meet)
                                </label>
                                <input
                                    type="url"
                                    value={formData.enlace_evidencia}
                                    onChange={(e) => setFormData({ ...formData, enlace_evidencia: e.target.value })}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)]"
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
                                    <span>Guardar Marcación</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
