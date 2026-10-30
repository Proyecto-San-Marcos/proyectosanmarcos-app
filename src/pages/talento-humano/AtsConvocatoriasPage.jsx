import { useState, useEffect } from 'react';
import { atsService } from '../../services/atsService';
import {
    Users, Briefcase, FileText, CheckCircle2, XCircle,
    Clock, Search, Plus, Filter, ArrowRight, Star,
    ExternalLink, Upload, AlertCircle, Calendar, GraduationCap,
    Sparkles, Eye, X, MessageSquare, ChevronRight, Loader2
} from 'lucide-react';

const ETAPAS = [
    { id: 'Postulado', label: 'Postulado', color: 'bg-blue-50 text-blue-700 border-blue-200', countColor: 'bg-blue-100 text-blue-800' },
    { id: 'En Entrevista', label: 'En Entrevista', color: 'bg-amber-50 text-amber-700 border-amber-200', countColor: 'bg-amber-100 text-amber-800' },
    { id: 'Aceptado', label: 'Aceptado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', countColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'Rechazado', label: 'Rechazado', color: 'bg-rose-50 text-rose-700 border-rose-200', countColor: 'bg-rose-100 text-rose-800' }
];

export default function AtsConvocatoriasPage() {
    const [convocatorias, setConvocatorias] = useState([]);
    const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState('Todas');
    const [postulantes, setPostulantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'convocatorias' | 'postular'

    // Modal de Detalle / Evaluación de Postulante
    const [selectedPostulante, setSelectedPostulante] = useState(null);
    const [evalNotes, setEvalNotes] = useState('');
    const [evalScore, setEvalScore] = useState(0);
    const [guardandoEval, setGuardandoEval] = useState(false);

    // Modal Crear Convocatoria
    const [isCrearConvModalOpen, setIsCrearConvModalOpen] = useState(false);
    const [formConv, setFormConv] = useState({
        titulo: '',
        gerencia: 'Talento Humano',
        descripcion: '',
        perfil_requerido: '',
        vacantes: 5,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_cierre: '',
        estado: 'Abierta'
    });
    const [creandoConv, setCreandoConv] = useState(false);

    // Formulario de Postulación Manual
    const [formPostular, setFormPostular] = useState({
        convocatoria_id: '',
        nombres: '',
        apellidos: '',
        correo: '',
        telefono: '',
        facultad: 'Facultad de Ingeniería de Sistemas e Informática',
        carrera: 'Ingeniería de Software',
        ciclo: '4to Ciclo',
        cv_url: ''
    });
    const [cvFile, setCvFile] = useState(null);
    const [registrandoPostulante, setRegistrandoPostulante] = useState(false);
    const [postulacionExitosa, setPostulacionExitosa] = useState(false);

    // Cargar Convocatorias y Postulantes
    const cargarDatos = async () => {
        setLoading(true);
        const [resConv, resPost] = await Promise.all([
            atsService.getConvocatorias(),
            atsService.getPostulantes({
                convocatoriaId: convocatoriaSeleccionada !== 'Todas' ? convocatoriaSeleccionada : null,
                search: searchTerm
            })
        ]);

        const convList = resConv.data || [];
        setConvocatorias(convList);
        setPostulantes(resPost.data || []);
        if (convList.length > 0 && !formPostular.convocatoria_id) {
            setFormPostular(prev => ({ ...prev, convocatoria_id: convList[0].id }));
        }
        setLoading(false);
    };

    useEffect(() => {
        cargarDatos();
    }, [convocatoriaSeleccionada, searchTerm]);

    const handleCambiarEtapa = async (postulanteId, nuevaEtapa) => {
        await atsService.actualizarEtapaPostulante(postulanteId, nuevaEtapa);
        setPostulantes(prev => prev.map(p => p.id === postulanteId ? { ...p, estado_etapa: nuevaEtapa } : p));
        if (selectedPostulante && selectedPostulante.id === postulanteId) {
            setSelectedPostulante(prev => ({ ...prev, estado_etapa: nuevaEtapa }));
        }
    };

    const abrirModalEvaluacion = (postulante) => {
        setSelectedPostulante(postulante);
        setEvalNotes(postulante.notas_entrevista || '');
        setEvalScore(postulante.puntaje_evaluacion || 0);
    };

    const guardarEvaluacion = async () => {
        if (!selectedPostulante) return;
        setGuardandoEval(true);
        await atsService.actualizarEtapaPostulante(selectedPostulante.id, selectedPostulante.estado_etapa, evalNotes, evalScore);
        setPostulantes(prev => prev.map(p => p.id === selectedPostulante.id ? {
            ...p,
            notas_entrevista: evalNotes,
            puntaje_evaluacion: evalScore
        } : p));
        setGuardandoEval(false);
        setSelectedPostulante(null);
    };

    const handleCrearConvocatoria = async (e) => {
        e.preventDefault();
        setCreandoConv(true);
        const res = await atsService.crearConvocatoria(formConv);
        if (res.success) {
            setConvocatorias(prev => [res.data, ...prev]);
            setIsCrearConvModalOpen(false);
            setFormConv({
                titulo: '',
                gerencia: 'Talento Humano',
                descripcion: '',
                perfil_requerido: '',
                vacantes: 5,
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_cierre: '',
                estado: 'Abierta'
            });
        }
        setCreandoConv(false);
    };

    const handlePostulacionSubmit = async (e) => {
        e.preventDefault();
        setRegistrandoPostulante(true);
        const res = await atsService.registrarPostulacion(formPostular, cvFile);
        if (res.success) {
            setPostulantes(prev => [res.data, ...prev]);
            setPostulacionExitosa(true);
            setFormPostular({
                convocatoria_id: convocatorias[0]?.id || '',
                nombres: '',
                apellidos: '',
                correo: '',
                telefono: '',
                facultad: 'Facultad de Ingeniería de Sistemas e Informática',
                carrera: 'Ingeniería de Software',
                ciclo: '4to Ciclo',
                cv_url: ''
            });
            setCvFile(null);
            setTimeout(() => setPostulacionExitosa(false), 5000);
        }
        setRegistrandoPostulante(false);
    };

    // Métricas del ATS
    const metricas = atsService.getMetricasATS(postulantes);

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* HERO / HEADER INSTITUCIONAL */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="psm-badge flex items-center gap-1.5">
                            <Briefcase size={13} />
                            Talento Humano
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            ATS & Pipeline de Selección
                        </span>
                    </div>

                    <h1
                        className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight mb-2"
                        style={{ fontFamily: 'var(--psm-font-heading)' }}
                    >
                        Sistema de Reclutamiento y Selección
                    </h1>

                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] leading-relaxed">
                        Control integral de convocatorias institucionales, recepción de currículums de estudiantes sanmarquinos, agendamiento de entrevistas y asignación a gerencias.
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsCrearConvModalOpen(true)}
                        className="psm-btn-primary text-xs py-2.5 px-4 font-bold shadow-md cursor-pointer flex items-center gap-2"
                    >
                        <Plus size={16} />
                        <span>Nueva Convocatoria</span>
                    </button>
                </div>
            </div>

            {/* MÉTRICAS RÁPIDAS DEL PIPELINE */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Postulantes</span>
                    <span className="text-2xl font-bold text-[var(--psm-navy)] mt-1 block">{metricas.total}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">1. Postulados</span>
                    <span className="text-2xl font-bold text-blue-700 mt-1 block">{metricas.postulados}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">2. En Entrevista</span>
                    <span className="text-2xl font-bold text-amber-700 mt-1 block">{metricas.enEntrevista}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">3. Aceptados</span>
                    <span className="text-2xl font-bold text-emerald-700 mt-1 block">{metricas.aceptados}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">4. Rechazados</span>
                    <span className="text-2xl font-bold text-rose-700 mt-1 block">{metricas.rechazados}</span>
                </div>
            </div>

            {/* TABS DE NAVEGACIÓN */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'pipeline'
                            ? 'bg-[var(--psm-navy)] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Users size={15} />
                    <span>Tablero Pipeline ATS ({postulantes.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('convocatorias')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'convocatorias'
                            ? 'bg-[var(--psm-navy)] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Briefcase size={15} />
                    <span>Gestión de Convocatorias ({convocatorias.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('postular')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'postular'
                            ? 'bg-[var(--psm-navy)] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Plus size={15} />
                    <span>Simulador de Postulación Externa</span>
                </button>
            </div>

            {/* TAB 1: TABLERO PIPELINE KANBAN */}
            {activeTab === 'pipeline' && (
                <div className="space-y-6">
                    {/* Barra de filtros del pipeline */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                            <span className="text-xs font-bold text-slate-500 shrink-0">Convocatoria:</span>
                            <select
                                value={convocatoriaSeleccionada}
                                onChange={(e) => setConvocatoriaSeleccionada(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 w-full focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] truncate"
                            >
                                <option value="Todas">Todas las Convocatorias</option>
                                {convocatorias.map(c => (
                                    <option key={c.id} value={c.id}>{c.titulo} ({c.gerencia})</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative flex-1 max-w-sm">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por candidato, carrera o correo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="psm-input text-xs pl-10 w-full"
                            />
                        </div>
                    </div>

                    {/* Columnas Kanban */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="bg-slate-100/60 rounded-3xl p-4 h-96 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                            {ETAPAS.map((etapa) => {
                                const candidatosEtapa = postulantes.filter(p => p.estado_etapa === etapa.id);

                                return (
                                    <div
                                        key={etapa.id}
                                        className="bg-slate-50/70 rounded-3xl border border-slate-200/80 p-3 flex flex-col gap-3 min-h-[500px]"
                                    >
                                        {/* Cabecera de Columna */}
                                        <div className="p-2.5 px-3 bg-white rounded-2xl border border-slate-200/60 shadow-2xs flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-800">
                                                {etapa.label}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${etapa.countColor}`}>
                                                {candidatosEtapa.length}
                                            </span>
                                        </div>

                                        {/* Lista de tarjetas en esta etapa */}
                                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1">
                                            {candidatosEtapa.length === 0 ? (
                                                <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                                                    Sin candidatos
                                                </div>
                                            ) : (
                                                candidatosEtapa.map((candidato) => (
                                                    <div
                                                        key={candidato.id}
                                                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-[var(--psm-teal)]/40 hover:shadow-xs transition-all space-y-3"
                                                    >
                                                        <div>
                                                            <div className="flex items-start justify-between gap-1 mb-1">
                                                                <h4 className="text-xs font-bold text-[var(--psm-navy)] line-clamp-1">
                                                                    {candidato.nombres} {candidato.apellidos}
                                                                </h4>
                                                                {candidato.puntaje_evaluacion > 0 && (
                                                                    <span className="flex items-center text-amber-500 text-[10px] font-bold shrink-0">
                                                                        <Star size={10} className="fill-current mr-0.5" />
                                                                        {candidato.puntaje_evaluacion}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="text-[11px] font-medium text-slate-600 line-clamp-1">
                                                                {candidato.carrera}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 font-mono block">
                                                                {candidato.ciclo} • {candidato.telefono}
                                                            </span>
                                                        </div>

                                                        {candidato.notas_entrevista && (
                                                            <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl italic line-clamp-2 border border-slate-100">
                                                                "{candidato.notas_entrevista}"
                                                            </p>
                                                        )}

                                                        {/* Acciones de la tarjeta */}
                                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => abrirModalEvaluacion(candidato)}
                                                                className="text-[10px] font-bold text-[var(--psm-teal)] hover:underline flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <FileText size={12} />
                                                                <span>Evaluar</span>
                                                            </button>

                                                            {/* Botones de cambio de etapa rápido */}
                                                            <div className="flex items-center gap-1">
                                                                {etapa.id === 'Postulado' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCambiarEtapa(candidato.id, 'En Entrevista')}
                                                                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                                                                        title="Pasar a Entrevista"
                                                                    >
                                                                        A Entrevista
                                                                    </button>
                                                                )}
                                                                {etapa.id === 'En Entrevista' && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleCambiarEtapa(candidato.id, 'Aceptado')}
                                                                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                                                                            title="Aceptar Candidato"
                                                                        >
                                                                            Aceptar
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleCambiarEtapa(candidato.id, 'Rechazado')}
                                                                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                                                                            title="Rechazar"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {etapa.id === 'Rechazado' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCambiarEtapa(candidato.id, 'Postulado')}
                                                                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                                                                    >
                                                                        Reabrir
                                                                    </button>
                                                                )}
                                                                {etapa.id === 'Aceptado' && (
                                                                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                                                                        <CheckCircle2 size={12} />
                                                                        Listo
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: GESTIÓN DE CONVOCATORIAS */}
            {activeTab === 'convocatorias' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-[var(--psm-navy)] uppercase tracking-tight">
                                Convocatorias Oficiales del Voluntariado
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Procesos activos y pasados de reclutamiento para las 5 gerencias de Proyectos San Marcos.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCrearConvModalOpen(true)}
                            className="psm-btn-primary text-xs py-2 px-3.5 shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus size={14} />
                            <span>Crear Convocatoria</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {convocatorias.map((conv) => (
                            <div
                                key={conv.id}
                                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:border-[var(--psm-teal)]/40 transition-all"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                            {conv.gerencia}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                            conv.estado === 'Abierta' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                            conv.estado === 'En Evaluación' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                            {conv.estado}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-base text-[var(--psm-navy)] mb-2">
                                        {conv.titulo}
                                    </h3>

                                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                                        {conv.descripcion}
                                    </p>

                                    <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span>Vacantes Disponibles:</span>
                                            <strong className="text-slate-800">{conv.vacantes || 10} plazas</strong>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Cierre de Convocatoria:</span>
                                            <span className="text-slate-700 font-mono text-[11px]">{conv.fecha_cierre || '15 Nov 2026'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                                    <button
                                        onClick={() => {
                                            setConvocatoriaSeleccionada(conv.id);
                                            setActiveTab('pipeline');
                                        }}
                                        className="text-xs font-bold text-[var(--psm-teal)] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Ver en Pipeline</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: SIMULADOR DE POSTULACIÓN EXTERNA */}
            {activeTab === 'postular' && (
                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
                    <div>
                        <span className="psm-badge mb-2">Formulario de Admisión</span>
                        <h2 className="text-lg font-bold text-[var(--psm-navy)] uppercase tracking-tight">
                            Postulación de Aspirante Sanmarquino
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Simula o registra una postulación directa a una de las convocatorias abiertas para que aparezca automáticamente en la columna "Postulado" del pipeline.
                        </p>
                    </div>

                    {postulacionExitosa && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                            <span>¡Postulación registrada con éxito en el Pipeline del ATS!</span>
                        </div>
                    )}

                    <form onSubmit={handlePostulacionSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Convocatoria a la que postula *
                            </label>
                            <select
                                required
                                value={formPostular.convocatoria_id}
                                onChange={(e) => setFormPostular({ ...formPostular, convocatoria_id: e.target.value })}
                                className="psm-input text-xs w-full"
                            >
                                {convocatorias.map(c => (
                                    <option key={c.id} value={c.id}>{c.titulo} ({c.gerencia})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Nombres *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Camila Valeria"
                                    value={formPostular.nombres}
                                    onChange={(e) => setFormPostular({ ...formPostular, nombres: e.target.value })}
                                    className="psm-input text-xs w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Apellidos *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Ríos Mendoza"
                                    value={formPostular.apellidos}
                                    onChange={(e) => setFormPostular({ ...formPostular, apellidos: e.target.value })}
                                    className="psm-input text-xs w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Correo Electrónico UNMSM *
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="camila.rios@unmsm.edu.pe"
                                    value={formPostular.correo}
                                    onChange={(e) => setFormPostular({ ...formPostular, correo: e.target.value })}
                                    className="psm-input text-xs w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Teléfono / WhatsApp *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="+51 987 112 334"
                                    value={formPostular.telefono}
                                    onChange={(e) => setFormPostular({ ...formPostular, telefono: e.target.value })}
                                    className="psm-input text-xs w-full font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Carrera Profesional *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Administración, Ing. Sistemas, etc."
                                    value={formPostular.carrera}
                                    onChange={(e) => setFormPostular({ ...formPostular, carrera: e.target.value })}
                                    className="psm-input text-xs w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Ciclo Académico Actual *
                                </label>
                                <select
                                    value={formPostular.ciclo}
                                    onChange={(e) => setFormPostular({ ...formPostular, ciclo: e.target.value })}
                                    className="psm-input text-xs w-full"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                                        <option key={c} value={`${c}to Ciclo`}>{c}to Ciclo</option>
                                    ))}
                                    <option value="Egresado Reciente">Egresado Reciente</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Currículum Vitae (Archivo PDF o Enlace Drive/LinkedIn)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setCvFile(e.target.files[0] || null)}
                                className="psm-input text-xs w-full"
                            />
                        </div>

                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={registrandoPostulante}
                                className="psm-btn-primary w-full justify-center text-xs py-3 font-bold shadow-md cursor-pointer flex items-center gap-2"
                            >
                                {registrandoPostulante ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Procesando e ingresando al ATS...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        <span>Enviar Postulación al Pipeline</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL DE EVALUACIÓN DE CANDIDATO */}
            {selectedPostulante && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-[var(--psm-navy)] text-white p-5 px-6 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--psm-teal)] block">
                                    Ficha de Evaluación de Candidato
                                </span>
                                <h3 className="text-base font-bold text-white">
                                    {selectedPostulante.nombres} {selectedPostulante.apellidos}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedPostulante(null)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Datos del postulante */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Carrera y Ciclo:</span>
                                    <strong className="text-slate-800">{selectedPostulante.carrera} ({selectedPostulante.ciclo})</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Correo UNMSM:</span>
                                    <a href={`mailto:${selectedPostulante.correo}`} className="text-blue-600 hover:underline">{selectedPostulante.correo}</a>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Teléfono:</span>
                                    <span className="font-mono text-slate-800">{selectedPostulante.telefono}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                                    <span className="text-slate-400">Currículum Vitae:</span>
                                    {selectedPostulante.cv_url ? (
                                        <a
                                            href={selectedPostulante.cv_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-[var(--psm-teal)] hover:underline flex items-center gap-1"
                                        >
                                            <FileText size={13} />
                                            <span>Ver CV en PDF</span>
                                        </a>
                                    ) : (
                                        <span className="text-slate-400">No adjuntado</span>
                                    )}
                                </div>
                            </div>

                            {/* Calificación por estrellas */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                    Calificación de la Entrevista (1 a 5 estrellas)
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setEvalScore(star)}
                                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={24}
                                                className={star <= evalScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-slate-600 ml-2">
                                        {evalScore > 0 ? `${evalScore} / 5` : 'Sin calificar'}
                                    </span>
                                </div>
                            </div>

                            {/* Notas de entrevista */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Feedback y Notas de Entrevista
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Anotar fortalezas, respuestas clave, disponibilidad de horario o gerencia recomendada..."
                                    value={evalNotes}
                                    onChange={(e) => setEvalNotes(e.target.value)}
                                    className="psm-input text-xs w-full"
                                ></textarea>
                            </div>

                            {/* Cambiar estado */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Etapa Actual en el Pipeline
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ETAPAS.map((et) => (
                                        <button
                                            key={et.id}
                                            type="button"
                                            onClick={() => handleCambiarEtapa(selectedPostulante.id, et.id)}
                                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                                                selectedPostulante.estado_etapa === et.id
                                                    ? 'bg-[var(--psm-navy)] text-white border-[var(--psm-navy)] shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span>{et.label}</span>
                                            {selectedPostulante.estado_etapa === et.id && <CheckCircle2 size={14} className="text-emerald-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPostulante(null)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="button"
                                    onClick={guardarEvaluacion}
                                    disabled={guardandoEval}
                                    className="psm-btn-primary text-xs py-2 px-5 font-bold shadow-md cursor-pointer"
                                >
                                    {guardandoEval ? 'Guardando...' : 'Guardar Evaluación'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CREAR CONVOCATORIA */}
            {isCrearConvModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-[var(--psm-navy)] text-white p-5 px-6 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider">
                                Publicar Nueva Convocatoria
                            </h3>
                            <button
                                onClick={() => setIsCrearConvModalOpen(false)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCrearConvocatoria} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Título de la Convocatoria *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Coordinador(a) de PMO y Proyectos Sociales"
                                    value={formConv.titulo}
                                    onChange={(e) => setFormConv({ ...formConv, titulo: e.target.value })}
                                    className="psm-input text-xs w-full"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Gerencia Asignada
                                    </label>
                                    <select
                                        value={formConv.gerencia}
                                        onChange={(e) => setFormConv({ ...formConv, gerencia: e.target.value })}
                                        className="psm-input text-xs w-full"
                                    >
                                        <option value="Talento Humano">Talento Humano</option>
                                        <option value="PMO">Gerencia de PMO</option>
                                        <option value="Comunicaciones">Comunicaciones</option>
                                        <option value="Finanzas">Finanzas</option>
                                        <option value="Presidencia">Presidencia</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Número de Vacantes *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        required
                                        value={formConv.vacantes}
                                        onChange={(e) => setFormConv({ ...formConv, vacantes: parseInt(e.target.value) || 1 })}
                                        className="psm-input text-xs w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Descripción del Rol *
                                </label>
                                <textarea
                                    rows="2"
                                    required
                                    placeholder="Objetivos del puesto y funciones principales..."
                                    value={formConv.descripcion}
                                    onChange={(e) => setFormConv({ ...formConv, descripcion: e.target.value })}
                                    className="psm-input text-xs w-full"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Perfil y Requisitos del Estudiante
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Ciclo, carreras preferentes, compromiso horario..."
                                    value={formConv.perfil_requerido}
                                    onChange={(e) => setFormConv({ ...formConv, perfil_requerido: e.target.value })}
                                    className="psm-input text-xs w-full"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Fecha de Inicio
                                    </label>
                                    <input
                                        type="date"
                                        value={formConv.fecha_inicio}
                                        onChange={(e) => setFormConv({ ...formConv, fecha_inicio: e.target.value })}
                                        className="psm-input text-xs w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Fecha de Cierre
                                    </label>
                                    <input
                                        type="date"
                                        value={formConv.fecha_cierre}
                                        onChange={(e) => setFormConv({ ...formConv, fecha_cierre: e.target.value })}
                                        className="psm-input text-xs w-full"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCrearConvModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creandoConv}
                                    className="psm-btn-primary text-xs py-2 px-5 font-bold shadow-md cursor-pointer"
                                >
                                    {creandoConv ? 'Publicando...' : 'Publicar Convocatoria'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
