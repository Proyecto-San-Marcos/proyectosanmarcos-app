import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { comunicadosService } from '../services/comunicadosService';
import {
    Calendar, Clock, Download, Building, Megaphone,
    Sparkles, ArrowRight, Loader2, Pin, Tag,
    ExternalLink, MapPin, AlertCircle, RefreshCw
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    </div>

                    {loadingComunicados ? (
                        <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] p-12 text-center text-slate-400">
                            <Loader2 size={32} className="animate-spin text-[var(--psm-teal)] mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--psm-navy)]">
                                Cargando comunicados...
                            </p>
                        </div>
                    ) : comunicados.length === 0 ? (
                        <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] p-10 text-center text-slate-400 shadow-[var(--psm-shadow-card)]">
                            <div className="w-14 h-14 rounded-full bg-[var(--psm-teal-subtle)] text-[var(--psm-teal)] mx-auto flex items-center justify-center mb-3">
                                <Megaphone size={26} />
                            </div>
                            <h3 className="text-base font-bold text-[var(--psm-navy)] mb-1">
                                No hay comunicados recientes
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Presidencia y Comunicaciones publicarán aquí los anuncios institucionales, directivas y avisos importantes.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comunicados.map((item) => {
                                const isDestacado = Boolean(item.es_destacado);
                                return (
                                    <article
                                        key={item.id}
                                        className={`bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border transition-all duration-300 p-5 sm:p-6 shadow-[var(--psm-shadow-card)] ${
                                            isDestacado
                                                ? 'border-l-4 border-l-[var(--psm-teal,#00b4d8)] border-slate-200 bg-gradient-to-r from-cyan-50/20 to-white'
                                                : 'border-[var(--psm-gray-mid,#e5e7eb)] hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                {isDestacado && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[var(--psm-teal)] text-white shadow-xs">
                                                        <Pin size={11} />
                                                        Destacado
                                                    </span>
                                                )}
                                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                                    {item.categoria || 'Institucional'}
                                                </span>
                                            </div>

                                            <span className="text-xs text-slate-400 font-medium">
                                                {formatDate(item.created_at)}
                                            </span>
                                        </div>

                                        <h3 className="text-base sm:text-lg font-bold text-[var(--psm-navy)] mb-2 hover:text-[var(--psm-teal)] transition-colors">
                                            {item.titulo}
                                        </h3>

                                        <p className="text-xs sm:text-sm text-[var(--psm-text-body)] leading-relaxed line-clamp-3 mb-4">
                                            {item.contenido}
                                        </p>

                                        {item.imagen_url && (
                                            <div className="mb-4 rounded-xl overflow-hidden max-h-60 border border-slate-100">
                                                <img
                                                    src={item.imagen_url}
                                                    alt={item.titulo}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>
                                                Emitido por: <strong className="text-slate-700">{item.autor_nombre || 'Presidencia PSM'}</strong>
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* COLUMNA 3: CALENDARIO INSTITUCIONAL */}
                <div className="space-y-6">
                    <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Calendar size={20} className="text-[var(--psm-teal,#00b4d8)]" />
                                <h3
                                    className="text-base sm:text-lg font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight"
                                    style={{ fontFamily: 'var(--psm-font-heading)' }}
                                >
                                    Próximos Eventos
                                </h3>
                            </div>
                            <span className="text-xs font-bold text-[var(--psm-teal)] bg-[var(--psm-teal-subtle)] px-2.5 py-0.5 rounded-full">
                                Agenda
                            </span>
                        </div>

                        {loadingEventos ? (
                            <div className="py-8 text-center text-slate-400">
                                <Loader2 size={24} className="animate-spin text-[var(--psm-teal)] mx-auto mb-1" />
                                <p className="text-xs">Cargando eventos...</p>
                            </div>
                        ) : eventos.length === 0 ? (
                            <div className="py-8 text-center text-slate-400">
                                <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-bold text-slate-700">No hay eventos programados</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Las próximas entregas y talleres aparecerán aquí.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {eventos.map((ev) => {
                                    const evDate = new Date(ev.fecha_inicio || ev.created_at);
                                    const day = evDate.getDate();
                                    const month = evDate.toLocaleDateString('es-PE', { month: 'short' }).toUpperCase();

                                    return (
                                        <div
                                            key={ev.id}
                                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                        >
                                            {/* Badge de fecha */}
                                            <div className="w-12 h-12 rounded-xl bg-[var(--psm-navy)] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                                                <span className="text-sm font-extrabold leading-none">{day}</span>
                                                <span className="text-[10px] font-bold text-[var(--psm-teal-light)] uppercase tracking-wider">{month}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-[var(--psm-navy)] truncate">
                                                    {ev.titulo}
                                                </p>
                                                {ev.lugar && (
                                                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                                        <MapPin size={11} className="shrink-0 text-slate-400" />
                                                        <span>{ev.lugar}</span>
                                                    </p>
                                                )}
                                                {ev.tipo_evento && (
                                                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                        {ev.tipo_evento}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* BANNER DE AYUDA Y SOPORTE */}
                    <div className="bg-gradient-to-br from-[var(--psm-navy)] to-[var(--psm-navy-mid)] text-white rounded-[var(--psm-radius-lg,20px)] p-6 shadow-md relative overflow-hidden">
                        <h4
                            className="text-lg font-bold uppercase mb-2 tracking-tight"
                            style={{ fontFamily: 'var(--psm-font-heading)' }}
                        >
                            ¿Tienes dudas con el sistema?
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">
                            Reporta cualquier incidencia o solicita accesos a través de la Mesa de Ayuda de Tecnología.
                        </p>
                        <Link
                            to="/talento-humano/tecnologia"
                            className="psm-btn-primary w-full justify-center text-xs py-2.5 font-bold shadow-md cursor-pointer"
                        >
                            Ir a Mesa de Ayuda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
