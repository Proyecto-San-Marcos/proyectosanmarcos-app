import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuariosService } from '../../services/usuariosService';
import PasswordChangeModal from '../../components/PasswordChangeModal';
import {
    User, Mail, Building, Briefcase, Award, Clock,
    FolderKanban, KeyRound, ShieldCheck, CheckCircle2,
    Calendar, ArrowRight, Sparkles, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MiPerfilPage() {
    const { user } = useAuth();
    const [memberData, setMemberData] = useState(null);
    const [loadingMember, setLoadingMember] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Cargar datos extendidos desde BD_TODOS
    useEffect(() => {
        let isMounted = true;

        async function fetchExtendedData() {
            if (!user) return;
            const codigo = user.codigo_universitario || user.user_metadata?.codigo_universitario;

            if (codigo) {
                setLoadingMember(true);
                const res = await usuariosService.getMiembroByCodigo(codigo);
                if (isMounted && res.success && res.data) {
                    setMemberData(res.data);
                }
                if (isMounted) setLoadingMember(false);
            } else {
                setLoadingMember(false);
            }
        }

        fetchExtendedData();

        return () => {
            isMounted = false;
        };
    }, [user]);

    // Combinar datos del usuario
    const nombreCompleto = memberData
        ? `${memberData.nombres || ''} ${memberData.apellidos || ''}`.trim()
        : user?.name || 'Voluntario PSM';

    const codigoUniversitario = memberData?.codigo_universitario || user?.codigo_universitario || 'No asignado';
    const gerencia = memberData?.gerencia_actual || user?.gerencia || user?.role || 'Voluntariado General';
    const cargo = memberData?.cargo || user?.role || 'Miembro Activo';
    const correoInstitucional = memberData?.correo_institucional || user?.email || 'No registrado';
    const correoPersonal = memberData?.correo_personal || 'No registrado';

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Modal de Cambio de Contraseña */}
            <PasswordChangeModal
                isOpen={isPasswordModalOpen}
                isMandatory={false}
                onClose={() => setIsPasswordModalOpen(false)}
            />

            {/* HEADER DE BIENVENIDA AL ESPACIO PERSONAL */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-5 relative z-10">
                    <div className="relative">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=0f2044&color=00b4d8&size=128&bold=true`}
                            alt="Avatar de Miembro"
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-[var(--psm-teal,#00b4d8)]/20 shadow-md object-cover"
                        />
                        <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-200" title="Cuenta Activa"></span>
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="psm-badge">
                                {gerencia}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ShieldCheck size={12} />
                                Miembro Activo
                            </span>
                        </div>
                        <h1
                            className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight"
                            style={{ fontFamily: 'var(--psm-font-heading)' }}
                        >
                            {nombreCompleto}
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] font-medium">
                            {cargo} • Código UNMSM: <strong className="text-[var(--psm-navy,#0f2044)] font-mono">{codigoUniversitario}</strong>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10">
                    <button
                        type="button"
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="psm-btn-outline text-xs sm:text-sm py-2.5 px-4 font-bold text-[var(--psm-navy)] border-slate-300 hover:border-[var(--psm-teal)] hover:text-[var(--psm-teal)] hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <KeyRound size={16} />
                        <span>Cambiar Clave</span>
                    </button>
                    <Link
                        to="/talento-humano/horas"
                        className="psm-btn-primary text-xs sm:text-sm py-2.5 px-4 font-bold shadow-md hover:shadow-lg cursor-pointer"
                    >
                        <Clock size={16} />
                        <span>Registrar Horas</span>
                    </Link>
                </div>
            </div>

            {/* TARJETAS RESUMEN DE IMPACTO PERSONAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Horas de Voluntariado */}
                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-800">
                            Periodo 2026
                        </span>
                    </div>
                    <h3 className="text-xs font-bold text-[var(--psm-text-muted,#9ca3af)] uppercase tracking-wider mb-1">
                        Horas de Voluntariado
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                        <p className="text-3xl font-extrabold text-[var(--psm-navy,#0f2044)]">
                            0.0 <span className="text-sm font-semibold text-slate-400">hrs</span>
                        </p>
                        <span className="text-xs text-emerald-600 font-semibold">(0 aprobadas)</span>
                    </div>
                    <p className="text-xs text-[var(--psm-text-body,#4b5563)] mb-4 leading-relaxed">
                        Completa tus 60 horas semestrales para habilitar la constancia oficial de voluntariado.
                    </p>
                    <Link
                        to="/talento-humano/horas"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--psm-teal,#00b4d8)] hover:text-[var(--psm-blue-hover,#1e40af)] transition-colors"
                    >
                        <span>Ver detalle de marcación</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {/* 2. Proyectos Asignados */}
                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                            <FolderKanban size={24} />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-800">
                            Activos
                        </span>
                    </div>
                    <h3 className="text-xs font-bold text-[var(--psm-text-muted,#9ca3af)] uppercase tracking-wider mb-1">
                        Proyectos Asignados
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                        <p className="text-3xl font-extrabold text-[var(--psm-navy,#0f2044)]">
                            0 <span className="text-sm font-semibold text-slate-400">proyectos</span>
                        </p>
                    </div>
                    <p className="text-xs text-[var(--psm-text-body,#4b5563)] mb-4 leading-relaxed">
                        Explora los proyectos activos en UNMSM o postula una nueva iniciativa en el Banco PMO.
                    </p>
                    <Link
                        to="/pmo"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--psm-teal,#00b4d8)] hover:text-[var(--psm-blue-hover,#1e40af)] transition-colors"
                    >
                        <span>Explorar Tablero PMO</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {/* 3. Certificados y Constancias */}
                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                            <Award size={24} />
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800">
                            Acreditaciones
                        </span>
                    </div>
                    <h3 className="text-xs font-bold text-[var(--psm-text-muted,#9ca3af)] uppercase tracking-wider mb-1">
                        Certificados y Constancias
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                        <p className="text-3xl font-extrabold text-[var(--psm-navy,#0f2044)]">
                            0 <span className="text-sm font-semibold text-slate-400">emitidos</span>
                        </p>
                    </div>
                    <p className="text-xs text-[var(--psm-text-body,#4b5563)] mb-4 leading-relaxed">
                        Tus certificados con código QR de verificación se listarán aquí al finalizar cada periodo.
                    </p>
                    <Link
                        to="/talento-humano/certificados"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--psm-teal,#00b4d8)] hover:text-[var(--psm-blue-hover,#1e40af)] transition-colors"
                    >
                        <span>Módulo de Certificados</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* SECCIÓN DETALLADA: DATOS DEL MIEMBRO Y RECURSOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Información de Contacto y Académica */}
                <div className="lg:col-span-2 bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8">
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                        <div>
                            <h2
                                className="text-lg sm:text-xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight"
                                style={{ fontFamily: 'var(--psm-font-heading)' }}
                            >
                                Ficha Oficial del Voluntario
                            </h2>
                            <p className="text-xs text-[var(--psm-text-muted,#9ca3af)] font-medium">
                                Sincronizada con el Padrón Institucional BD_TODOS
                            </p>
                        </div>
                        <span className="p-2 bg-[var(--psm-teal-subtle)] text-[var(--psm-teal,#00b4d8)] rounded-xl">
                            <Sparkles size={20} />
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <User size={14} />
                                <span>Nombres y Apellidos</span>
                            </p>
                            <p className="font-bold text-[var(--psm-navy,#0f2044)]">{nombreCompleto}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Building size={14} />
                                <span>Código Universitario</span>
                            </p>
                            <p className="font-mono font-bold text-[var(--psm-navy,#0f2044)]">{codigoUniversitario}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Briefcase size={14} />
                                <span>Gerencia Asignada</span>
                            </p>
                            <p className="font-bold text-[var(--psm-navy,#0f2044)]">{gerencia}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck size={14} />
                                <span>Cargo / Rol</span>
                            </p>
                            <p className="font-bold text-[var(--psm-navy,#0f2044)]">{cargo}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Mail size={14} />
                                <span>Correo Institucional UNMSM</span>
                            </p>
                            <p className="font-medium text-slate-700 break-all">{correoInstitucional}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Mail size={14} />
                                <span>Correo Personal</span>
                            </p>
                            <p className="font-medium text-slate-700 break-all">{correoPersonal}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
                        <p>
                            ¿Detectas algún dato desactualizado? Contacta a la subárea de Tecnología o Talento Humano.
                        </p>
                        <Link
                            to="/talento-humano/tecnologia"
                            className="font-bold text-[var(--psm-teal,#00b4d8)] hover:underline inline-flex items-center gap-1"
                        >
                            <span>Ir a Mesa de Ayuda</span>
                            <ExternalLink size={12} />
                        </Link>
                    </div>
                </div>

                {/* Columna Derecha: Accesos y Documentación Rápida */}
                <div className="space-y-6">
                    <div className="bg-[var(--psm-navy,#0f2044)] text-white rounded-[var(--psm-radius-lg,20px)] p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="psm-badge mb-3 bg-white/10 text-[var(--psm-teal-light)] border-white/20">
                                Guía Rápida PSM
                            </span>
                            <h3
                                className="text-xl font-bold uppercase mb-2 tracking-tight"
                                style={{ fontFamily: 'var(--psm-font-heading)' }}
                            >
                                Regla del Trámite Obligatorio
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed mb-6">
                                Recuerda que todas las constancias de horas, plantillas de proyectos y solicitudes presupuestales se procesan únicamente por esta intranet.
                            </p>
                            <Link
                                to="/pmo/plantillas"
                                className="psm-btn-primary w-full justify-center text-xs py-2.5 font-bold shadow-md cursor-pointer"
                            >
                                Descargar Plantillas PMO
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Accesos Directos Personales
                        </h4>
                        <ul className="space-y-3 text-xs font-semibold">
                            <li>
                                <Link
                                    to="/talento-humano/horas"
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[var(--psm-teal)] transition-colors group"
                                >
                                    <span className="flex items-center gap-2">
                                        <Clock size={16} className="text-slate-400 group-hover:text-[var(--psm-teal)]" />
                                        <span>Registrar Horas de Hoy</span>
                                    </span>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/finanzas/logistica"
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[var(--psm-teal)] transition-colors group"
                                >
                                    <span className="flex items-center gap-2">
                                        <Building size={16} className="text-slate-400 group-hover:text-[var(--psm-teal)]" />
                                        <span>Pedir Aula o Equipo en UNMSM</span>
                                    </span>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/comunicaciones/brand-kit"
                                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[var(--psm-teal)] transition-colors group"
                                >
                                    <span className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-slate-400 group-hover:text-[var(--psm-teal)]" />
                                        <span>Descargar Kit de Marca (Brand Kit)</span>
                                    </span>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
