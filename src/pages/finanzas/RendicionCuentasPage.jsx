import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { finanzasService } from '../../services/finanzasService';
import { pmoService } from '../../services/pmoService';
import {
    DollarSign, UploadCloud, FileText, CheckCircle,
    XCircle, Clock, Plus, Search, RefreshCw, Loader2,
    AlertCircle, Image, ExternalLink, Calendar
} from 'lucide-react';

const TIPOS_COMPROBANTE = ['Boleta', 'Factura', 'Recibo por Honorarios', 'Ticket'];

export default function RendicionCuentasPage() {
    const { user } = useAuth();
    const [rendiciones, setRendiciones] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Formulario
    const [formData, setFormData] = useState({
        proyecto_id: '',
        fecha_gasto: new Date().toISOString().split('T')[0],
        tipo_comprobante: 'Boleta',
        numero_comprobante: '',
        monto: '',
        proveedor: '',
        descripcion_concepto: ''
    });
    const [archivo, setArchivo] = useState(null);

    const memberId = user?.user_metadata?.member_id || user?.id;

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            // Cargar rendiciones
            const resRend = await finanzasService.getRendicionesGastos();
            if (resRend.success) setRendiciones(resRend.data || []);

            // Proyectos
            const resProy = await pmoService.getProyectos();
            if (resProy.success) setProyectos(resProy.data || []);
        } catch (err) {
            console.error('Error al cargar rendiciones de cuentas:', err);
            setError('Ocurrió un error inesperado al conectar con Supabase.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [memberId]);

    const handleSubmitRendicion = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!formData.monto || !formData.fecha_gasto || !formData.descripcion_concepto.trim()) {
            setError('Por favor completa los campos obligatorios (monto, fecha y concepto).');
            return;
        }

        const montoNum = parseFloat(formData.monto);
        if (isNaN(montoNum) || montoNum <= 0) {
            setError('El monto debe ser mayor a 0.');
            return;
        }

        if (!archivo) {
            setError('Debes adjuntar la fotografía o PDF del comprobante de pago.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await finanzasService.crearRendicionGasto({
                proyecto_id: formData.proyecto_id || null,
                responsable_id: memberId,
                fecha_gasto: formData.fecha_gasto,
                tipo_comprobante: formData.tipo_comprobante,
                numero_comprobante: formData.numero_comprobante.trim(),
                monto: montoNum,
                proveedor: formData.proveedor.trim(),
                descripcion_concepto: formData.descripcion_concepto.trim()
            }, archivo);

            if (!res.success) {
                setError('No fue posible registrar la rendición o subir el comprobante a storage.');
            } else {
                setSuccessMessage('¡Comprobante de gasto registrado con éxito en Finanzas!');
                setIsModalOpen(false);
                setFormData({
                    proyecto_id: '',
                    fecha_gasto: new Date().toISOString().split('T')[0],
                    tipo_comprobante: 'Boleta',
                    numero_comprobante: '',
                    monto: '',
                    proveedor: '',
                    descripcion_concepto: ''
                });
                setArchivo(null);
                await loadData();
            }
        } catch (err) {
            console.error('Error en handleSubmitRendicion:', err);
            setError('Ocurrió un error inesperado al registrar el gasto.');
        } finally {
            setSubmitting(false);
        }
    };

    // Monto total rendido
    const totalRendido = rendiciones.reduce((sum, r) => sum + (parseFloat(r.monto) || 0), 0);
    const totalAprobado = rendiciones
        .filter(r => r.estado_rendicion === 'Aprobado')
        .reduce((sum, r) => sum + (parseFloat(r.monto) || 0), 0);

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
                            Sub-área 2 • Planificación y Control Financiero
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Módulo de Rendición de Cuentas y Comprobantes
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] font-medium">
                        Justificación de presupuestos asignados mediante carga de boletas, facturas y comprobantes al bucket <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">comprobantes-finanzas</code>.
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
                        <span>Rendir Nuevo Gasto</span>
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

            {/* INDICADORES DE RENDICIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[var(--psm-white)] p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-0.5">Total Declarado</p>
                        <p className="text-3xl font-extrabold text-[var(--psm-navy)]">S/ {totalRendido.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-[var(--psm-white)] p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-0.5">Total Aprobado</p>
                        <p className="text-3xl font-extrabold text-emerald-700">S/ {totalAprobado.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-[var(--psm-white)] p-6 rounded-[var(--psm-radius-lg)] border border-[var(--psm-gray-mid)] shadow-[var(--psm-shadow-card)] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--psm-text-muted)] uppercase tracking-wider mb-0.5">Comprobantes</p>
                        <p className="text-3xl font-extrabold text-amber-600">{rendiciones.length} <span className="text-xs font-semibold text-slate-400">cargas</span></p>
                    </div>
                </div>
            </div>

            {/* TABLA DE RENDICIONES */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-[var(--psm-navy,#0f2044)] uppercase" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                        Histórico de Gastos y Comprobantes
                    </h2>
                    <span className="text-xs font-bold text-slate-500">
                        {rendiciones.length} registros
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-16 text-center text-slate-400">
                            <Loader2 size={28} className="animate-spin mx-auto text-[var(--psm-teal)] mb-1" />
                            <p className="text-xs font-semibold">Consultando rendiciones...</p>
                        </div>
                    ) : rendiciones.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <DollarSign size={40} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-bold text-slate-700">No hay rendiciones registradas</p>
                            <p className="text-xs text-slate-400 mt-0.5">Usa el botón "Rendir Nuevo Gasto" para subir tu primera boleta o factura.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[750px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Proyecto</th>
                                    <th className="p-4">Concepto / Proveedor</th>
                                    <th className="p-4">Comprobante</th>
                                    <th className="p-4">Monto</th>
                                    <th className="p-4 text-center">Archivo</th>
                                    <th className="p-4 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {rendiciones.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="p-4 font-mono text-slate-600 whitespace-nowrap">
                                            {r.fecha_gasto}
                                        </td>
                                        <td className="p-4 font-bold text-[var(--psm-navy)]">
                                            {r.proyecto?.nombre || 'Gasto Operativo'}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-800">{r.descripcion_concepto}</p>
                                            {r.proveedor && <p className="text-[11px] text-slate-400">Proveedor: {r.proveedor}</p>}
                                        </td>
                                        <td className="p-4 text-slate-600 text-xs">
                                            <span className="font-bold">{r.tipo_comprobante}</span>
                                            {r.numero_comprobante && <span className="font-mono text-slate-400 block">N° {r.numero_comprobante}</span>}
                                        </td>
                                        <td className="p-4 font-mono font-bold text-emerald-700 whitespace-nowrap">
                                            S/ {parseFloat(r.monto || 0).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            {r.comprobante_archivo_url ? (
                                                <a
                                                    href={r.comprobante_archivo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg inline-flex items-center gap-1 text-xs font-bold transition-colors"
                                                    title="Ver Comprobante"
                                                >
                                                    <ExternalLink size={13} />
                                                    <span>Ver</span>
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Sin archivo</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                r.estado_rendicion === 'Aprobado'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : r.estado_rendicion === 'Observado'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {r.estado_rendicion || 'Pendiente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL PARA SUBIR GASTO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[var(--psm-navy,#0f2044)] uppercase">
                                        Rendición de Gasto
                                    </h3>
                                    <p className="text-xs text-slate-400">Sube tu boleta o factura de respaldo</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitRendicion} className="space-y-4">
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
                                    <option value="">Gasto Operativo / General</option>
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
                                        Fecha del Gasto *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fecha_gasto}
                                        onChange={(e) => setFormData({ ...formData, fecha_gasto: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] font-mono"
                                        required
                                    />
                                </div>

                                {/* Monto */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Monto (PEN S/) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.10"
                                        value={formData.monto}
                                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Tipo Comprobante */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Tipo de Comprobante
                                    </label>
                                    <select
                                        value={formData.tipo_comprobante}
                                        onChange={(e) => setFormData({ ...formData, tipo_comprobante: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] cursor-pointer"
                                    >
                                        {TIPOS_COMPROBANTE.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Número Comprobante */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        N° de Comprobante
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.numero_comprobante}
                                        onChange={(e) => setFormData({ ...formData, numero_comprobante: e.target.value })}
                                        placeholder="Ej: B001-00234"
                                        className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] font-mono"
                                    />
                                </div>
                            </div>

                            {/* Proveedor */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Proveedor o Razón Social
                                </label>
                                <input
                                    type="text"
                                    value={formData.proveedor}
                                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                                    placeholder="Ej: Librería San Marcos SAC"
                                    className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)]"
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Concepto / Justificación del Gasto *
                                </label>
                                <textarea
                                    rows="2"
                                    value={formData.descripcion_concepto}
                                    onChange={(e) => setFormData({ ...formData, descripcion_concepto: e.target.value })}
                                    placeholder="Describe qué se compró y para qué actividad se utilizó..."
                                    className="w-full bg-slate-50 border border-slate-200 text-sm text-[var(--psm-navy)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] resize-none"
                                    required
                                />
                            </div>

                            {/* Archivo */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Fotografía o PDF del Comprobante *
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setArchivo(e.target.files[0] || null)}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
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
                                    <span>Guardar y Subir</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
