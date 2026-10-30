import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { certificadosService } from '../../services/certificadosService';
import { usuariosService } from '../../services/usuariosService';
import {
    Award, Download, Search, CheckCircle2, ShieldCheck,
    QrCode, FileText, Calendar, Clock, Plus, ExternalLink,
    AlertCircle, Sparkles, User, RefreshCw, X, Loader2
} from 'lucide-react';

export default function CertificadosPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('mis-certificados'); // 'mis-certificados' | 'emitir' | 'verificador'

    // Mis Certificados
    const [certificados, setCertificados] = useState([]);
    const [loadingCerts, setLoadingCerts] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const [selectedCertModal, setSelectedCertModal] = useState(null);
    const [modalQrUrl, setModalQrUrl] = useState('');

    // Emitir Certificado
    const [miembros, setMiembros] = useState([]);
    const [searchMiembro, setSearchMiembro] = useState('');
    const [selectedMiembro, setSelectedMiembro] = useState(null);
    const [formEmitir, setFormEmitir] = useState({
        proyecto_o_taller: '',
        horas_acreditadas: '',
        tipo_certificado: 'Constancia de Horas de Voluntariado',
        fecha_emision: new Date().toISOString().split('T')[0]
    });
    const [emitiendo, setEmitiendo] = useState(false);
    const [certRecienEmitido, setCertRecienEmitido] = useState(null);

    // Verificador de Código QR
    const [codigoVerificar, setCodigoVerificar] = useState('');
    const [resultadoVerificacion, setResultadoVerificacion] = useState(null);
    const [verificando, setVerificando] = useState(false);

    // Cargar certificados del usuario autenticado
    useEffect(() => {
        let isMounted = true;

        async function fetchMisCertificados() {
            setLoadingCerts(true);
            const miembroId = user?.id || 1;
            const res = await certificadosService.getMisCertificados(miembroId);
            if (isMounted) {
                setCertificados(res.data || []);
                setLoadingCerts(false);
            }
        }

        fetchMisCertificados();

        // Si viene query param ?verificar=... en la URL
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get('verificar');
        if (codeParam) {
            setCodigoVerificar(codeParam);
            setActiveTab('verificador');
            verificarCodigo(codeParam);
        }

        return () => {
            isMounted = false;
        };
    }, [user]);

    // Cargar miembros para emisión si entra a esa pestaña
    useEffect(() => {
        if (activeTab === 'emitir' && miembros.length === 0) {
            usuariosService.getMiembros().then(res => {
                if (res.success && res.data) {
                    setMiembros(res.data);
                }
            });
        }
    }, [activeTab, miembros.length]);

    const handleDescargarPdf = async (cert) => {
        try {
            setDownloadingId(cert.id);
            await certificadosService.descargarPdfCertificado(cert);
        } catch (err) {
            console.error('Error al descargar:', err);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleVerCertificado = async (cert) => {
        setSelectedCertModal(cert);
        const qr = await certificadosService.generarQrDataUrl(cert.codigo_verificacion);
        setModalQrUrl(qr);
    };

    const handleEmitirSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMiembro) {
            alert('Por favor selecciona un miembro de la lista.');
            return;
        }
        if (!formEmitir.proyecto_o_taller || !formEmitir.horas_acreditadas) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        try {
            setEmitiendo(true);
            const payload = {
                miembro_id: selectedMiembro.id,
                proyecto_o_taller: formEmitir.proyecto_o_taller,
                horas_acreditadas: parseFloat(formEmitir.horas_acreditadas),
                tipo_certificado: formEmitir.tipo_certificado,
                fecha_emision: formEmitir.fecha_emision
            };

            const res = await certificadosService.emitirCertificado(payload);
            if (res.success && res.data) {
                const nuevoCert = {
                    ...res.data,
                    miembro_nombre: `${selectedMiembro.nombres || ''} ${selectedMiembro.apellidos || ''}`.trim(),
                    miembro_codigo: selectedMiembro.codigo_universitario
                };
                setCertRecienEmitido(nuevoCert);
                setCertificados(prev => [nuevoCert, ...prev]);
                // Reset form
                setFormEmitir({
                    proyecto_o_taller: '',
                    horas_acreditadas: '',
                    tipo_certificado: 'Constancia de Horas de Voluntariado',
                    fecha_emision: new Date().toISOString().split('T')[0]
                });
                setSelectedMiembro(null);
                setSearchMiembro('');
            }
        } catch (err) {
            console.error('Error al emitir certificado:', err);
        } finally {
            setEmitiendo(false);
        }
    };

    const verificarCodigo = async (codigo = codigoVerificar) => {
        if (!codigo || !codigo.trim()) return;
        setVerificando(true);
        setResultadoVerificacion(null);
        const res = await certificadosService.verificarCertificado(codigo.trim());
        setResultadoVerificacion(res);
        setVerificando(false);
    };

    // Miembros filtrados en el buscador de emisión
    const miembrosFiltrados = miembros.filter(m => {
        const full = `${m.nombres || ''} ${m.apellidos || ''} ${m.codigo_universitario || ''}`.toLowerCase();
        return full.includes(searchMiembro.toLowerCase());
    }).slice(0, 5);

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* ENCABEZADO INSTITUCIONAL */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="psm-badge flex items-center gap-1.5">
                            <Award size={13} />
                            Certificación Oficial PSM
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <ShieldCheck size={12} />
                            Validación QR Integrada
                        </span>
                    </div>

                    <h1
                        className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight mb-2"
                        style={{ fontFamily: 'var(--psm-font-heading)' }}
                    >
                        Emisión y Descarga de Certificados
                    </h1>

                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] leading-relaxed">
                        Acreditación formal de horas de voluntariado, talleres del Campus Virtual y dirección de proyectos en la Universidad Nacional Mayor de San Marcos. Cada constancia incluye código criptográfico y código QR de validación en línea.
                    </p>
                </div>

                {/* Métricas del voluntario */}
                <div className="flex items-center gap-3 relative z-10 shrink-0">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[120px]">
                        <span className="text-2xl font-bold text-[var(--psm-navy)] block">
                            {certificados.reduce((sum, c) => sum + (parseFloat(c.horas_acreditadas) || 0), 0)} hrs
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Horas Avaladas</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center min-w-[120px]">
                        <span className="text-2xl font-bold text-[var(--psm-teal)] block">
                            {certificados.length}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Constancias</span>
                    </div>
                </div>
            </div>

            {/* PESTAÑAS DE NAVEGACIÓN */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                    onClick={() => setActiveTab('mis-certificados')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'mis-certificados'
                            ? 'bg-[var(--psm-navy)] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Award size={15} />
                    <span>Mis Constancias y Diplomas ({certificados.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('emitir')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'emitir'
                            ? 'bg-[var(--psm-navy)] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Plus size={15} />
                    <span>Emitir Certificado (Gestión TH)</span>
                </button>

                <button
                    onClick={() => setActiveTab('verificador')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'verificador'
                            ? 'bg-[var(--psm-navy)] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <QrCode size={15} />
                    <span>Validador de Autenticidad QR</span>
                </button>
            </div>

            {/* PESTAÑA 1: MIS CERTIFICADOS */}
            {activeTab === 'mis-certificados' && (
                <div className="space-y-6">
                    {loadingCerts ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map(n => (
                                <div key={n} className="bg-white rounded-[var(--psm-radius-lg,20px)] border border-slate-200 p-6 animate-pulse space-y-4">
                                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                                </div>
                            ))}
                        </div>
                    ) : certificados.length === 0 ? (
                        <div className="bg-white rounded-[var(--psm-radius-lg,20px)] border border-slate-200 p-12 text-center text-slate-500">
                            <Award size={48} className="mx-auto mb-3 text-slate-300" />
                            <h3 className="text-base font-bold text-slate-800">Aún no tienes constancias emitidas</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Tus horas aprobadas por Talento Humano y talleres completados en el Campus Virtual se convertirán automáticamente en certificados oficiales.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certificados.map((cert) => {
                                const isDownloading = downloadingId === cert.id;

                                return (
                                    <div
                                        key={cert.id}
                                        className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 flex flex-col justify-between hover:border-[var(--psm-teal)]/40 transition-all group relative overflow-hidden"
                                    >
                                        {/* Barra decorativa superior dorada/marino */}
                                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--psm-navy)] via-[var(--psm-teal)] to-amber-400"></div>

                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-2xl text-amber-700">
                                                    <Award size={22} />
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 block">
                                                        {cert.codigo_verificacion}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                                        Emisión: {cert.fecha_emision}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--psm-teal)] block mb-1">
                                                {cert.tipo_certificado || 'Constancia Oficial'}
                                            </span>

                                            <h3
                                                className="text-base font-bold text-[var(--psm-navy,#0f2044)] group-hover:text-[var(--psm-teal)] transition-colors mb-2 leading-snug"
                                                style={{ fontFamily: 'var(--psm-font-heading)' }}
                                            >
                                                {cert.proyecto_o_taller}
                                            </h3>

                                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs mb-5">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <User size={14} className="text-slate-400" />
                                                    <span className="font-medium truncate max-w-[180px]">
                                                        {cert.miembro_nombre}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-[var(--psm-navy)] bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                                                    {cert.horas_acreditadas} hrs
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => handleVerCertificado(cert)}
                                                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                                <FileText size={14} />
                                                <span>Ver Diploma</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDescargarPdf(cert)}
                                                disabled={isDownloading}
                                                className="flex-1 psm-btn-primary text-xs py-2 px-3 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                {isDownloading ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Download size={14} />
                                                )}
                                                <span>Descargar PDF</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* PESTAÑA 2: EMITIR CERTIFICADO (TALENTO HUMANO) */}
            {activeTab === 'emitir' && (
                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 max-w-3xl space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--psm-navy)] uppercase tracking-tight">
                            Generador de Constancias y Certificados Oficiales
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Este módulo registra el reconocimiento en la base de datos de Supabase y calcula el código criptográfico único que se imprimirá en el PDF y el código QR de validación.
                        </p>
                    </div>

                    {certRecienEmitido && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 animate-in fade-in">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-900">
                                        ¡Certificado emitido con éxito!
                                    </h4>
                                    <p className="text-xs text-emerald-700 mt-0.5">
                                        Se generó el código <strong className="font-mono">{certRecienEmitido.codigo_verificacion}</strong> para {certRecienEmitido.miembro_nombre}.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDescargarPdf(certRecienEmitido)}
                                className="psm-btn-primary text-xs py-1.5 px-3 shadow-xs shrink-0 flex items-center gap-1"
                            >
                                <Download size={13} />
                                <span>Descargar PDF</span>
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleEmitirSubmit} className="space-y-5">
                        {/* 1. Seleccionar Miembro de BD_TODOS */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                1. Seleccionar Voluntario / Miembro Destinatario *
                            </label>
                            {selectedMiembro ? (
                                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[var(--psm-navy)] text-white flex items-center justify-center font-bold text-xs">
                                            {selectedMiembro.nombres?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--psm-navy)]">
                                                {selectedMiembro.nombres} {selectedMiembro.apellidos}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-mono">
                                                Código: {selectedMiembro.codigo_universitario} • {selectedMiembro.gerencia_actual}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMiembro(null)}
                                        className="text-xs text-slate-500 hover:text-rose-600 font-bold px-2 py-1"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, apellido o código universitario..."
                                            value={searchMiembro}
                                            onChange={(e) => setSearchMiembro(e.target.value)}
                                            className="psm-input text-xs pl-10 w-full"
                                        />
                                    </div>
                                    {searchMiembro && (
                                        <div className="border border-slate-200 rounded-2xl bg-white shadow-lg overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                                            {miembrosFiltrados.length === 0 ? (
                                                <p className="p-3 text-xs text-slate-400 text-center">No se encontraron miembros con ese criterio.</p>
                                            ) : (
                                                miembrosFiltrados.map((m) => (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedMiembro(m);
                                                            setSearchMiembro('');
                                                        }}
                                                        className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer"
                                                    >
                                                        <div>
                                                            <strong className="text-slate-800">{m.nombres} {m.apellidos}</strong>
                                                            <span className="text-slate-400 block font-mono text-[10px]">{m.codigo_universitario} • {m.gerencia_actual}</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-[var(--psm-teal)]">Seleccionar</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 2. Proyecto o Taller */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                2. Nombre del Proyecto, Taller o Actividad Formativa *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Dirección de la I Jornada de Innovación Social UNMSM 2026"
                                value={formEmitir.proyecto_o_taller}
                                onChange={(e) => setFormEmitir({ ...formEmitir, proyecto_o_taller: e.target.value })}
                                className="psm-input text-xs w-full"
                            />
                        </div>

                        {/* 3. Horas y Tipo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    3. Horas Acreditadas *
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="1"
                                    max="500"
                                    required
                                    placeholder="Ej: 30"
                                    value={formEmitir.horas_acreditadas}
                                    onChange={(e) => setFormEmitir({ ...formEmitir, horas_acreditadas: e.target.value })}
                                    className="psm-input text-xs w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    4. Tipo de Acreditación *
                                </label>
                                <select
                                    value={formEmitir.tipo_certificado}
                                    onChange={(e) => setFormEmitir({ ...formEmitir, tipo_certificado: e.target.value })}
                                    className="psm-input text-xs w-full"
                                >
                                    <option value="Constancia de Horas de Voluntariado">Constancia de Horas de Voluntariado</option>
                                    <option value="Certificado de Participación y Aprobación">Certificado de Participación y Aprobación</option>
                                    <option value="Reconocimiento por Liderazgo y Gestión">Reconocimiento por Liderazgo y Gestión</option>
                                    <option value="Diploma de Ponente Invitado">Diploma de Ponente Invitado</option>
                                </select>
                            </div>
                        </div>

                        {/* Botón de Emisión */}
                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={emitiendo}
                                className="psm-btn-primary w-full justify-center text-xs py-3 font-bold shadow-md cursor-pointer flex items-center gap-2"
                            >
                                {emitiendo ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Generando Hash y Código QR...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        <span>Emitir y Generar Certificado Oficial</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* PESTAÑA 3: VERIFICADOR QR EN LÍNEA */}
            {activeTab === 'verificador' && (
                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[var(--psm-navy)] border border-blue-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                            <QrCode size={28} />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--psm-navy)] uppercase tracking-tight">
                            Portal Oficial de Verificación
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Cualquier empresa, institución o facultad puede validar la legitimidad de un certificado emitido por Proyectos San Marcos ingresando su código único.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Ingresa código (ej. PSM-CERT-2026-A48F)..."
                            value={codigoVerificar}
                            onChange={(e) => setCodigoVerificar(e.target.value.toUpperCase())}
                            className="psm-input text-xs font-mono uppercase flex-1"
                        />
                        <button
                            type="button"
                            onClick={() => verificarCodigo()}
                            disabled={verificando || !codigoVerificar.trim()}
                            className="psm-btn-primary text-xs py-2.5 px-4 shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                        >
                            {verificando ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                            <span>Validar</span>
                        </button>
                    </div>

                    {resultadoVerificacion && (
                        resultadoVerificacion.valido ? (
                            <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-4 animate-in fade-in">
                                <div className="flex items-center gap-3 text-emerald-800">
                                    <ShieldCheck size={28} className="text-emerald-600" />
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-tight">
                                            Certificado Válido y Oficial
                                        </h3>
                                        <span className="text-[11px] text-emerald-700">
                                            Registrado en el Padrón Institucional PSM UNMSM
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-emerald-200/60 space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-400">Titular Acreditado:</span>
                                        <strong className="text-slate-800">{resultadoVerificacion.certificado?.miembro_nombre}</strong>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-400">Código Universitario:</span>
                                        <span className="font-mono font-bold text-slate-800">{resultadoVerificacion.certificado?.miembro_codigo || 'No registrado'}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-400">Proyecto / Taller:</span>
                                        <strong className="text-[var(--psm-navy)] text-right max-w-xs">{resultadoVerificacion.certificado?.proyecto_o_taller}</strong>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-400">Horas Acreditadas:</span>
                                        <span className="font-bold text-emerald-700">{resultadoVerificacion.certificado?.horas_acreditadas} horas</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-400">Fecha de Emisión:</span>
                                        <span className="text-slate-700">{resultadoVerificacion.certificado?.fecha_emision}</span>
                                    </div>
                                    <div className="pt-1">
                                        <span className="text-[10px] text-slate-400 block">Hash Criptográfico de Seguridad:</span>
                                        <code className="text-[10px] text-slate-600 font-mono block break-all mt-0.5">
                                            {resultadoVerificacion.certificado?.firma_digital_hash || 'SHA256:VERIFIED_AUTHENTIC_STAMP'}
                                        </code>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDescargarPdf(resultadoVerificacion.certificado)}
                                    className="psm-btn-primary w-full justify-center text-xs py-2.5 font-bold shadow-xs cursor-pointer flex items-center gap-2"
                                >
                                    <Download size={14} />
                                    <span>Descargar Copia Oficial en PDF</span>
                                </button>
                            </div>
                        ) : (
                            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 animate-in fade-in">
                                <AlertCircle size={22} className="text-rose-600 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-tight">
                                        Código no válido o no encontrado
                                    </h4>
                                    <p className="text-xs text-rose-700 mt-0.5">
                                        {resultadoVerificacion.error || 'Verifica que hayas ingresado el código alfanumérico exactamente como figura en el documento.'}
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* MODAL DE PREVISUALIZACIÓN DE DIPLOMA OFICIAL EN ALTA RESOLUCIÓN */}
            {selectedCertModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                        {/* Cabecera del modal */}
                        <div className="bg-[var(--psm-navy,#0f2044)] text-white p-4 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <Award size={18} className="text-amber-400" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    Previsualización de Diploma Oficial PSM UNMSM
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedCertModal(null)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Diploma Renderizado en Pantalla */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex items-center justify-center">
                            <div className="bg-[#fdfefe] w-full max-w-3xl border-4 border-[var(--psm-navy)] p-8 sm:p-12 shadow-xl relative text-center rounded-lg space-y-6">
                                {/* Borde interior dorado */}
                                <div className="absolute inset-2 border-2 border-amber-500/80 pointer-events-none rounded"></div>
                                <div className="absolute inset-3 border border-[var(--psm-teal)]/40 pointer-events-none rounded"></div>

                                {/* Encabezado */}
                                <div>
                                    <p className="text-xs font-bold text-[var(--psm-navy)] tracking-widest uppercase">
                                        Universidad Nacional Mayor de San Marcos
                                    </p>
                                    <p className="text-[10px] text-slate-400">Decana de América • Fundada en 1551</p>
                                    <p className="text-sm font-bold text-[var(--psm-teal)] tracking-wider uppercase mt-1">
                                        Asociación Proyectos San Marcos (PSM)
                                    </p>
                                </div>

                                <div className="w-24 h-0.5 bg-amber-500 mx-auto"></div>

                                {/* Título */}
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--psm-navy)] uppercase tracking-tight font-serif">
                                        Certificado Oficial
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Se otorga el presente reconocimiento y constancia a:
                                    </p>
                                </div>

                                {/* Nombre */}
                                <div className="py-2">
                                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--psm-navy)] uppercase underline decoration-[var(--psm-teal)] decoration-2 underline-offset-8">
                                        {selectedCertModal.miembro_nombre}
                                    </h3>
                                    {selectedCertModal.miembro_codigo && (
                                        <p className="text-[10px] text-slate-400 mt-3 font-mono">
                                            Código Universitario: {selectedCertModal.miembro_codigo}
                                        </p>
                                    )}
                                </div>

                                {/* Texto */}
                                <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                                    Por su destacada participación en el programa y/o proyecto <strong className="text-slate-800">"{selectedCertModal.proyecto_o_taller}"</strong>, acumulando un total de <strong className="text-[var(--psm-navy)]">{selectedCertModal.horas_acreditadas} horas</strong> de voluntariado y gestión acreditadas con excelencia.
                                </p>

                                {/* Firmas y QR */}
                                <div className="grid grid-cols-3 items-end pt-8 gap-4 border-t border-slate-200">
                                    <div className="text-center">
                                        <div className="w-28 border-b border-slate-700 mx-auto mb-1"></div>
                                        <p className="text-[10px] font-bold text-slate-800">Presidencia General</p>
                                        <p className="text-[8px] text-slate-400">Proyectos San Marcos</p>
                                    </div>

                                    <div className="text-center flex flex-col items-center">
                                        {modalQrUrl && (
                                            <img
                                                src={modalQrUrl}
                                                alt="Código QR de Verificación"
                                                className="w-16 h-16 border border-slate-200 p-0.5 rounded shadow-2xs"
                                            />
                                        )}
                                        <span className="font-mono text-[9px] font-bold text-slate-700 mt-1 block">
                                            {selectedCertModal.codigo_verificacion}
                                        </span>
                                    </div>

                                    <div className="text-center">
                                        <div className="w-28 border-b border-slate-700 mx-auto mb-1"></div>
                                        <p className="text-[10px] font-bold text-slate-800">Dirección Talento Humano</p>
                                        <p className="text-[8px] text-slate-400">Acreditación & Capacitación</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer modal */}
                        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-mono">
                                Código: {selectedCertModal.codigo_verificacion}
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedCertModal(null)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={() => handleDescargarPdf(selectedCertModal)}
                                    className="psm-btn-primary text-xs py-2 px-4 font-bold shadow-xs flex items-center gap-1.5"
                                >
                                    <Download size={14} />
                                    <span>Descargar en PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
