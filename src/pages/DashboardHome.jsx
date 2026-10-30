import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { comunicadosService } from '../services/comunicadosService';
import {
    Calendar, Clock, Download, Building, Megaphone,
    Sparkles, ArrowRight, Loader2, Pin, Tag,
    ExternalLink, MapPin, AlertCircle, RefreshCw, GraduationCap
} from 'lucide-react';

export default function DashboardHome() {
    const { user } = useAuth();
    const role = user?.role || user?.gerencia || 'Voluntario';
    const name = user?.name?.split(' ')[0] || 'Sanmarquino';

    const [comunicados, setComunicados] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [loadingComunicados, setLoadingComunicados] = useState(true);
    const [loadingEventos, setLoadingEventos] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const loadData = async () => {
        setLoadingComunicados(true);
        setLoadingEventos(true);
        setErrorMsg('');

        try {
            // Cargar Comunicados
            const comRes = await comunicadosService.getComunicados({ limit: 6 });
            if (comRes.success) {
                setComunicados(comRes.data || []);
            } else {
                console.warn('Aviso cargando comunicados:', comRes.error);
            }

            // Cargar Eventos Institucionales
            const evRes = await comunicadosService.getEventosInstitucionales({ limit: 5 });
            if (evRes.success) {
                setEventos(evRes.data || []);
            } else {
                console.warn('Aviso cargando eventos:', evRes.error);
            }
        } catch (err) {
            console.error('Error al cargar datos del dashboard:', err);
            setErrorMsg('Hubo una demora al conectar con la base de datos.');
        } finally {
            setLoadingComunicados(false);
            setLoadingEventos(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* HERO / BIENVENIDA */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="psm-badge">
                            Intranet Oficial 2026
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                            {role}
                        </span>
                    </div>
                    <h1
                        className="text-2xl sm:text-4xl font-extrabold text-[var(--psm-navy,#0f2044)] tracking-tight uppercase"
                        style={{ fontFamily: 'var(--psm-font-heading)' }}
                    >
                        ¡Hola, {name}!
                    </h1>
                    <p className="text-[var(--psm-text-body,#4b5563)] mt-1 text-sm sm:text-base font-medium max-w-xl">
                        Bienvenido a la plataforma central de Proyectos San Marcos. Consulta los anuncios oficiales, eventos y accesos directos de tu gerencia.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10">
                    <Link
                        to="/mi-perfil"
                        className="psm-btn-outline text-xs sm:text-sm py-2.5 px-5 font-bold text-[var(--psm-navy)] border-slate-300 hover:border-[var(--psm-teal)] hover:text-[var(--psm-teal)] transition-all cursor-pointer"
                    >
                        Mi Espacio
                    </Link>
                    <button
                        onClick={loadData}
                        className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[var(--psm-navy)] transition-colors cursor-pointer"
                        title="Actualizar datos"
                    >
                        <RefreshCw size={18} className={loadingComunicados ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* BARRA DE ACCIÓN RÁPIDA (QUICK ACTION PILLS) */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                    Trámites y Accesos Frecuentes
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Botón 1: Registrar Horas */}
                    <Link
                        to="/talento-humano/horas"
                        className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-md,12px)] border border-[var(--psm-gray-mid,#e5e7eb)] p-4 shadow-xs hover:shadow-md hover:border-[var(--psm-teal)] hover:-translate-y-0.5 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-[var(--psm-navy)] group-hover:text-[var(--psm-teal)] transition-colors">
                                    Registrar Horas
                                </h3>
                                <p className="text-xs text-slate-400">Marca tu voluntariado semanal</p>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-[var(--psm-teal)] group-hover:translate-x-1 transition-all" />
                    </Link>

                    {/* Botón 2: Descargar Plantillas */}
                    <Link
                        to="/pmo/plantillas"
                        className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-md,12px)] border border-[var(--psm-gray-mid,#e5e7eb)] p-4 shadow-xs hover:shadow-md hover:border-[var(--psm-teal)] hover:-translate-y-0.5 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Download size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-[var(--psm-navy)] group-hover:text-[var(--psm-teal)] transition-colors">
                                    Descargar Plantillas
                                </h3>
                                <p className="text-xs text-slate-400">Charter, EDT, RACI oficiales</p>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-[var(--psm-teal)] group-hover:translate-x-1 transition-all" />
                    </Link>

                    {/* Botón 3: Solicitar Recurso */}
                    <Link
                        to="/finanzas/logistica"
                        className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-md,12px)] border border-[var(--psm-gray-mid,#e5e7eb)] p-4 shadow-xs hover:shadow-md hover:border-[var(--psm-teal)] hover:-translate-y-0.5 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Building size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-[var(--psm-navy)] group-hover:text-[var(--psm-teal)] transition-colors">
                                    Solicitar Recurso
                                </h3>
                                <p className="text-xs text-slate-400">Aulas UNMSM o equipos</p>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-[var(--psm-teal)] group-hover:translate-x-1 transition-all" />
                    </Link>

                    {/* Botón 4: Campus LMS */}
                    <Link
                        to="/talento-humano/campus-lms"
                        className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-md,12px)] border border-[var(--psm-gray-mid,#e5e7eb)] p-4 shadow-xs hover:shadow-md hover:border-[var(--psm-teal)] hover:-translate-y-0.5 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <GraduationCap size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-[var(--psm-navy)] group-hover:text-[var(--psm-teal)] transition-colors">
                                    Campus Virtual
                                </h3>
                                <p className="text-xs text-slate-400">Talleres y capacitaciones</p>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-[var(--psm-teal)] group-hover:translate-x-1 transition-all" />
                    </Link>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL: MURO DE COMUNICADOS + CALENDARIO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUMNA 1 & 2: MURO DE COMUNICADOS OFICIALES */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Megaphone size={20} className="text-[var(--psm-teal,#00b4d8)]" />
                            <h2
                                className="text-lg sm:text-xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight"
                                style={{ fontFamily: 'var(--psm-font-heading)' }}
                            >
                                Muro de Comunicados Oficiales
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                            {comunicados.length} anuncios activos
                        </span>
                    </div>

                    {loadingComunicados ? (
                        <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] p-12 text-center">
                            <Loader2 size={32} className="animate-spin text-[var(--psm-teal)] mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-medium">Cargando comunicados institucionales...</p>
                        </div>
                    ) : comunicados.length === 0 ? (
                        <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] p-8 text-center text-slate-400">
                            <AlertCircle size={32} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-600">No hay comunicados activos por ahora.</p>
                            <p className="text-xs text-slate-400 mt-1">Los avisos de Presidencia y Comunicaciones aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comunicados.map((item) => (
                                <article
                                    key={item.id}
                                    className={`bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border p-5 sm:p-6 shadow-[var(--psm-shadow-card)] transition-all hover:border-[var(--psm-teal)]/50 ${
                                        item.es_destacado
                                            ? 'border-l-4 border-l-[var(--psm-teal,#00b4d8)] border-slate-200 bg-gradient-to-r from-blue-50/30 to-white'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            {item.es_destacado && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                                    <Pin size={11} className="rotate-45" />
                                                    Fijado
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                                                <Tag size={11} />
                                                {item.categoria || 'General'}
                                            </span>
                                        </div>
                                        <time className="text-xs text-slate-400 font-medium">
                                            {formatDate(item.created_at)}
                                        </time>
                                    </div>

                                    <h3
                                        className="text-base sm:text-lg font-bold text-[var(--psm-navy,#0f2044)] mb-2"
                                        style={{ fontFamily: 'var(--psm-font-heading)' }}
                                    >
                                        {item.titulo}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] leading-relaxed whitespace-pre-line mb-4">
                                        {item.contenido}
                                    </p>

                                    {item.imagen_url && (
                                        <div className="my-3 rounded-xl overflow-hidden border border-slate-100 max-h-60">
                                            <img
                                                src={item.imagen_url}
                                                alt={item.titulo}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                        <span>
                                            Emitido por: <strong className="text-slate-600">{item.autor_nombre || 'Presidencia PSM'}</strong>
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                {/* COLUMNA 3: CALENDARIO DE EVENTOS */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar size={20} className="text-[var(--psm-navy,#0f2044)]" />
                            <h2
                                className="text-lg sm:text-xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight"
                                style={{ fontFamily: 'var(--psm-font-heading)' }}
                            >
                                Agenda Semanal
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                            Próximos
                        </span>
                    </div>

                    <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-5 space-y-4">
                        {loadingEventos ? (
                            <div className="py-8 text-center">
                                <Loader2 size={24} className="animate-spin text-[var(--psm-teal)] mx-auto mb-2" />
                                <p className="text-xs text-slate-400">Cargando fechas importantes...</p>
                            </div>
                        ) : eventos.length === 0 ? (
                            <div className="py-8 text-center text-slate-400">
                                <Calendar size={28} className="mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-semibold text-slate-600">No hay eventos programados</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Disfruta tu semana de actividades regulares.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {eventos.map((ev) => (
                                    <div
                                        key={ev.id}
                                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-[var(--psm-teal)]/40 hover:shadow-2xs transition-all space-y-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--psm-teal,#00b4d8)]">
                                                {ev.tipo_evento || 'Reunión'}
                                            </span>
                                            <span className="text-[11px] font-bold text-[var(--psm-navy)]">
                                                {formatDate(ev.fecha_inicio)}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-xs text-slate-800 line-clamp-1">
                                            {ev.titulo}
                                        </h3>

                                        {ev.descripcion && (
                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                {ev.descripcion}
                                            </p>
                                        )}

                                        {ev.lugar && (
                                            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                                                <MapPin size={12} className="shrink-0 text-slate-400" />
                                                <span className="truncate">{ev.lugar}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 text-center">
                            <span className="text-[11px] text-slate-400 font-medium">
                                Los eventos se sincronizan con la secretaría de Presidencia
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
