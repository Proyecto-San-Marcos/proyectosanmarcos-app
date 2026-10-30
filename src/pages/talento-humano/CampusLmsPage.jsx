import { useState, useEffect } from 'react';
import { lmsService } from '../../services/lmsService';
import {
    GraduationCap, Search, Play, FileText, Download,
    Clock, BookOpen, CheckCircle2, ChevronRight, X,
    Award, Sparkles, Filter, ExternalLink, Video,
    UserCheck, Layers, AlertCircle
} from 'lucide-react';

const CATEGORIAS = [
    'Todas',
    'PMO & Proyectos',
    'Metodologías Ágiles',
    'Liderazgo & Equipos',
    'Herramientas & TI'
];

const NIVELES = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];

export default function CampusLmsPage() {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
    const [nivelSeleccionado, setNivelSeleccionado] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    // Estado del Curso Activo en el Reproductor
    const [cursoActivo, setCursoActivo] = useState(null);
    const [moduloActivo, setModuloActivo] = useState(null);
    const [activeTabModal, setActiveTabModal] = useState('video'); // 'video' | 'recursos' | 'instructor'
    const [modulosCompletados, setModulosCompletados] = useState({});

    useEffect(() => {
        let isMounted = true;

        async function fetchCursos() {
            setLoading(true);
            const res = await lmsService.getCursos({
                categoria: categoriaSeleccionada,
                nivel: nivelSeleccionado,
                search: searchTerm
            });
            if (isMounted) {
                setCursos(res.data || []);
                setLoading(false);
            }
        }

        fetchCursos();

        return () => {
            isMounted = false;
        };
    }, [categoriaSeleccionada, nivelSeleccionado, searchTerm]);

    const abrirAulaVirtual = async (curso) => {
        setLoading(true);
        const res = await lmsService.getCursoById(curso.id);
        const cursoConModulos = res.data || curso;
        setCursoActivo(cursoConModulos);
        if (cursoConModulos.modulos && cursoConModulos.modulos.length > 0) {
            setModuloActivo(cursoConModulos.modulos[0]);
        } else {
            setModuloActivo(null);
        }
        setActiveTabModal('video');
        setLoading(false);
    };

    const cerrarAulaVirtual = () => {
        setCursoActivo(null);
        setModuloActivo(null);
    };

    const toggleCompletado = (moduloId) => {
        setModulosCompletados(prev => ({
            ...prev,
            [moduloId]: !prev[moduloId]
        }));
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* HERO BANNER INSTITUCIONAL DEL CAMPUS LMS */}
            <div className="bg-gradient-to-r from-[var(--psm-navy,#0f2044)] via-slate-900 to-[var(--psm-navy)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[var(--psm-teal)]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="psm-badge bg-[var(--psm-teal)]/20 text-[var(--psm-teal-light)] border-[var(--psm-teal)]/40 flex items-center gap-1.5">
                            <GraduationCap size={13} />
                            Campus Virtual PSM UNMSM
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-200 border border-white/15">
                            Formación Continua
                        </span>
                    </div>

                    <h1
                        className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white mb-3"
                        style={{ fontFamily: 'var(--psm-font-heading)' }}
                    >
                        Academia y Talleres Metodológicos
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mb-6">
                        Desarrolla tus competencias en dirección de proyectos, metodologías ágiles (Scrum/Kanban), liderazgo adaptativo y herramientas digitales. Todos los talleres cuentan con acreditación oficial de horas de voluntariado.
                    </p>

                    {/* Buscador Integrado */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por título de curso, tema o ponente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] backdrop-blur-md transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Métricas rápidas del campus */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
                    <div>
                        <span className="text-xl sm:text-2xl font-bold text-white block">{cursos.length}</span>
                        <span className="text-[11px] text-slate-400 font-medium">Talleres Registrados</span>
                    </div>
                    <div>
                        <span className="text-xl sm:text-2xl font-bold text-[var(--psm-teal-light)] block">32+</span>
                        <span className="text-[11px] text-slate-400 font-medium">Horas Acreditables</span>
                    </div>
                    <div>
                        <span className="text-xl sm:text-2xl font-bold text-white block">13</span>
                        <span className="text-[11px] text-slate-400 font-medium">Módulos en Video</span>
                    </div>
                    <div>
                        <span className="text-xl sm:text-2xl font-bold text-emerald-400 block">100%</span>
                        <span className="text-[11px] text-slate-400 font-medium">Certificación Gratuita</span>
                    </div>
                </div>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Categorías Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIAS.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoriaSeleccionada(cat)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                categoriaSeleccionada === cat
                                    ? 'bg-[var(--psm-navy)] text-white shadow-sm'
                                    : 'bg-[var(--psm-white,#ffffff)] text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Filtro por nivel */}
                <div className="flex items-center gap-2 self-end md:self-auto text-xs font-semibold text-slate-600">
                    <Filter size={14} className="text-slate-400" />
                    <span>Nivel:</span>
                    <select
                        value={nivelSeleccionado}
                        onChange={(e) => setNivelSeleccionado(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)]"
                    >
                        {NIVELES.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* GRID DE CURSOS Y TALLERES */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="bg-white rounded-[var(--psm-radius-lg,20px)] border border-slate-200 p-6 animate-pulse space-y-4">
                            <div className="h-44 bg-slate-200 rounded-2xl"></div>
                            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-full"></div>
                            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : cursos.length === 0 ? (
                <div className="bg-white rounded-[var(--psm-radius-lg,20px)] border border-slate-200 p-12 text-center text-slate-500">
                    <BookOpen size={48} className="mx-auto mb-3 text-slate-300" />
                    <h3 className="text-base font-bold text-slate-800">No se encontraron talleres en esta categoría</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Intenta modificando el término de búsqueda o seleccionando otra área temática del menú superior.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {cursos.map((curso) => {
                        return (
                            <div
                                key={curso.id}
                                className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:border-[var(--psm-teal)]/40 transition-all group"
                            >
                                <div>
                                    {/* Banner del Curso */}
                                    <div className="relative h-44 overflow-hidden bg-slate-800">
                                        <img
                                            src={curso.banner_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                                            alt={curso.titulo}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                        <div className="absolute top-3 left-3 flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[var(--psm-navy)] shadow-xs">
                                                {curso.categoria}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                curso.nivel === 'Básico' ? 'bg-emerald-500/90 text-white' :
                                                curso.nivel === 'Intermedio' ? 'bg-amber-500/90 text-white' :
                                                'bg-purple-600/90 text-white'
                                            }`}>
                                                {curso.nivel}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                                            <span className="flex items-center gap-1">
                                                <Clock size={13} className="text-[var(--psm-teal-light)]" />
                                                {curso.duracion_estimada || '4 horas'}
                                            </span>
                                            <span className="flex items-center gap-1 text-[var(--psm-teal-light)] font-bold">
                                                <Award size={13} />
                                                +{curso.horas_acreditables || 8} hrs voluntariado
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenido del Curso */}
                                    <div className="p-6">
                                        <h3
                                            className="font-bold text-lg text-[var(--psm-navy,#0f2044)] group-hover:text-[var(--psm-teal)] transition-colors line-clamp-2 mb-2 leading-snug"
                                            style={{ fontFamily: 'var(--psm-font-heading)' }}
                                        >
                                            {curso.titulo}
                                        </h3>

                                        <p className="text-xs text-[var(--psm-text-body,#4b5563)] line-clamp-3 leading-relaxed mb-4">
                                            {curso.descripcion}
                                        </p>

                                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                            <UserCheck size={14} className="text-slate-400 shrink-0" />
                                            <span className="truncate">
                                                Instructor: <strong className="text-slate-700">{curso.instructor}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer con botón de acción */}
                                <div className="p-6 pt-0">
                                    <button
                                        type="button"
                                        onClick={() => abrirAulaVirtual(curso)}
                                        className="psm-btn-primary w-full justify-center text-xs py-2.5 font-bold shadow-xs cursor-pointer flex items-center gap-2 group-hover:bg-[var(--psm-teal)] transition-colors"
                                    >
                                        <Play size={14} className="fill-current" />
                                        <span>Ingresar al Aula Virtual</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL / VISOR DE AULA VIRTUAL (REPRODUCTOR Y MÓDULOS) */}
            {cursoActivo && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
                        {/* Cabecera del Aula */}
                        <div className="bg-[var(--psm-navy,#0f2044)] text-white p-5 px-6 flex items-center justify-between gap-4 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[var(--psm-teal)]/20 border border-[var(--psm-teal)]/40 flex items-center justify-center text-[var(--psm-teal-light)] shrink-0">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--psm-teal-light)]">
                                            {cursoActivo.categoria}
                                        </span>
                                        <span className="text-white/40">•</span>
                                        <span className="text-[10px] text-slate-300">
                                            Acredita {cursoActivo.horas_acreditables || 8} horas
                                        </span>
                                    </div>
                                    <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                                        {cursoActivo.titulo}
                                    </h2>
                                </div>
                            </div>

                            <button
                                onClick={cerrarAulaVirtual}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                                title="Cerrar Aula"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Cuerpo del Modal: 2 Columnas (Video/Info + Lista de Módulos) */}
                        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                            {/* Columna Izquierda / Central: Reproductor y Contenido */}
                            <div className="lg:col-span-2 p-6 flex flex-col gap-4">
                                {/* Pestañas internas */}
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <button
                                        onClick={() => setActiveTabModal('video')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            activeTabModal === 'video'
                                                ? 'bg-slate-100 text-[var(--psm-navy)]'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Video size={14} />
                                        <span>Clase en Video</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTabModal('recursos')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            activeTabModal === 'recursos'
                                                ? 'bg-slate-100 text-[var(--psm-navy)]'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <FileText size={14} />
                                        <span>Recursos y Diapositivas</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTabModal('instructor')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            activeTabModal === 'instructor'
                                                ? 'bg-slate-100 text-[var(--psm-navy)]'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <UserCheck size={14} />
                                        <span>Docente</span>
                                    </button>
                                </div>

                                {activeTabModal === 'video' && (
                                    <>
                                        {/* Reproductor de Video Embebido */}
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                                            {moduloActivo?.video_url ? (
                                                <iframe
                                                    src={moduloActivo.video_url}
                                                    title={moduloActivo.titulo}
                                                    className="w-full h-full border-0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                                    <Video size={36} />
                                                    <p className="text-xs">No hay enlace de video configurado para este módulo.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Detalle del Módulo Actual */}
                                        {moduloActivo && (
                                            <div className="space-y-3 pt-2">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <h3 className="text-base font-bold text-[var(--psm-navy)]">
                                                        {moduloActivo.titulo}
                                                    </h3>
                                                    <button
                                                        onClick={() => toggleCompletado(moduloActivo.id)}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                                            modulosCompletados[moduloActivo.id]
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        <CheckCircle2 size={14} className={modulosCompletados[moduloActivo.id] ? 'text-emerald-600' : 'text-slate-400'} />
                                                        <span>{modulosCompletados[moduloActivo.id] ? 'Módulo Completado' : 'Marcar como Completado'}</span>
                                                    </button>
                                                </div>

                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    {moduloActivo.descripcion}
                                                </p>

                                                {/* Recurso descargable del módulo actual si existe */}
                                                {moduloActivo.recurso_url && (
                                                    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <FileText size={18} className="text-blue-600 shrink-0" />
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                                                                    {moduloActivo.recurso_nombre || 'Material Didáctico del Módulo'}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400">PDF / Plantilla de trabajo descargable</p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={moduloActivo.recurso_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="psm-btn-primary text-xs py-1.5 px-3 shadow-xs shrink-0 flex items-center gap-1"
                                                        >
                                                            <Download size={13} />
                                                            <span>Descargar</span>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTabModal === 'recursos' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-[var(--psm-navy)]">
                                            Materiales y Plantillas de Todo el Taller
                                        </h4>
                                        <div className="space-y-3">
                                            {cursoActivo.modulos?.filter(m => m.recurso_url).map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-[var(--psm-teal)]/40 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{m.recurso_nombre || m.titulo}</p>
                                                            <p className="text-[10px] text-slate-400">Asociado a: {m.titulo}</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={m.recurso_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="psm-btn-primary text-xs py-2 px-3 shadow-xs flex items-center gap-1"
                                                    >
                                                        <Download size={13} />
                                                        <span>Descargar</span>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTabModal === 'instructor' && (
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-[var(--psm-navy)] text-[var(--psm-teal)] flex items-center justify-center font-bold text-xl shadow-md">
                                                {cursoActivo.instructor?.charAt(0) || 'D'}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-[var(--psm-navy)]">
                                                    {cursoActivo.instructor}
                                                </h4>
                                                <p className="text-xs text-slate-500">Ponente Invitado • Especialista en Proyectos</p>
                                                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    Verificado por Talento Humano PSM
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            Este taller forma parte del plan curricular interno para capacitar a los voluntarios y coordinadores de Proyectos San Marcos. Al finalizar las evaluaciones y módulos correspondientes, las horas serán acreditadas en tu constancia semestral.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Columna Derecha: Temario y Lista de Módulos */}
                            <div className="p-5 bg-slate-50/50 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Contenido del Curso ({cursoActivo.modulos?.length || 0} lecciones)
                                    </h4>
                                    <span className="text-[11px] font-bold text-[var(--psm-navy)]">
                                        {Object.values(modulosCompletados).filter(Boolean).length} / {cursoActivo.modulos?.length || 0}
                                    </span>
                                </div>

                                <div className="space-y-2.5 overflow-y-auto max-h-[60vh] pr-1">
                                    {cursoActivo.modulos?.map((mod, index) => {
                                        const isSelected = moduloActivo?.id === mod.id;
                                        const isDone = modulosCompletados[mod.id];

                                        return (
                                            <button
                                                key={mod.id}
                                                type="button"
                                                onClick={() => {
                                                    setModuloActivo(mod);
                                                    setActiveTabModal('video');
                                                }}
                                                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                                                    isSelected
                                                        ? 'bg-white border-[var(--psm-teal)] shadow-sm ring-1 ring-[var(--psm-teal)]/20'
                                                        : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="mt-0.5">
                                                    {isDone ? (
                                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                                    ) : (
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                                            isSelected ? 'border-[var(--psm-teal)] text-[var(--psm-teal)]' : 'border-slate-300 text-slate-400'
                                                        }`}>
                                                            {index + 1}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold line-clamp-2 ${
                                                        isSelected ? 'text-[var(--psm-navy)]' : 'text-slate-700'
                                                    }`}>
                                                        {mod.titulo}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                                                        <Clock size={11} />
                                                        {mod.duracion_minutos || 40} mins
                                                    </span>
                                                </div>

                                                {isSelected && (
                                                    <ChevronRight size={14} className="text-[var(--psm-teal)] mt-1 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
