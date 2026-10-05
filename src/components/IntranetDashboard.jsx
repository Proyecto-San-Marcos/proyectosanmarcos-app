import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordChangeModal from './PasswordChangeModal';
import {
    Menu, X, Search, Bell, LogOut, ChevronDown, ChevronRight,
    KeyRound, AlertTriangle, LayoutDashboard, Users, User,
    Briefcase, Megaphone, FileText, Calendar, DollarSign,
    FolderKanban, Award, ShieldCheck, Clock, Download,
    Building, Sparkles, BookOpen, Layers
} from 'lucide-react';

// Estructura de Gerencias y Subáreas para el Menú Acordeón
const GERENCIAS_SECCIONES = [
    {
        id: 'presidencia',
        name: 'Presidencia',
        icon: ShieldCheck,
        basePath: '/presidencia',
        subareas: [
            { name: 'Tablero de Objetivos (OKRs)', path: '/presidencia' },
            { name: 'Actas y Acuerdos', path: '/presidencia/actas' },
            { name: 'Planes de Mejora', path: '/presidencia/mejora-continua' },
        ]
    },
    {
        id: 'pmo',
        name: 'Gerencia de PMO',
        icon: FolderKanban,
        basePath: '/pmo',
        subareas: [
            { name: 'Tablero Central (Kanban)', path: '/pmo' },
            { name: 'Banco de Iniciativas', path: '/pmo/banco-iniciativas' },
            { name: 'Plantillas Oficiales', path: '/pmo/plantillas' },
            { name: 'Lecciones Aprendidas', path: '/pmo/lecciones-aprendidas' },
            { name: 'Auditoría de Calidad', path: '/pmo/auditoria-calidad' },
        ]
    },
    {
        id: 'comunicaciones',
        name: 'Comunicaciones',
        icon: Megaphone,
        basePath: '/comunicaciones',
        subareas: [
            { name: 'Calendario Editorial', path: '/comunicaciones/calendario-editorial' },
            { name: 'Kit de Marca (Brand Kit)', path: '/comunicaciones/brand-kit' },
            { name: 'Gestor de Comunicados', path: '/comunicaciones/redactor' },
            { name: 'Relaciones Públicas (CRM)', path: '/comunicaciones/rrpp' },
        ]
    },
    {
        id: 'finanzas',
        name: 'Finanzas',
        icon: DollarSign,
        basePath: '/finanzas',
        subareas: [
            { name: 'Inventario y Recursos', path: '/finanzas/logistica' },
            { name: 'Control de Caja Chica', path: '/finanzas/caja-chica' },
            { name: 'Rendición de Cuentas', path: '/finanzas/rendiciones' },
        ]
    },
    {
        id: 'talento-humano',
        name: 'Talento Humano',
        icon: Users,
        basePath: '/talento-humano',
        subareas: [
            { name: 'Registro de Horas', path: '/talento-humano/horas' },
            { name: 'Directorio de Miembros', path: '/talento-humano/directorio' },
            { name: 'Campus Virtual (LMS)', path: '/talento-humano/campus-lms' },
            { name: 'Emisión de Certificados', path: '/talento-humano/certificados' },
            { name: 'Convocatorias (ATS)', path: '/talento-humano/ats' },
            { name: 'Evaluaciones 360°', path: '/talento-humano/evaluaciones' },
            { name: 'Tecnología y Padrón', path: '/talento-humano/tecnologia' },
        ]
    }
];

export default function IntranetDashboard() {
    const { user, logout, mustChangePassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopOpen, setIsDesktopOpen] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isPasswordModalManualOpen, setIsPasswordModalManualOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    // Estado del Acordeón para cada Gerencia
    const [openSections, setOpenSections] = useState(() => {
        const initial = {};
        GERENCIAS_SECCIONES.forEach((g) => {
            initial[g.id] = location.pathname.startsWith(g.basePath);
        });
        return initial;
    });

    // Auto-expandir acordeón si cambia la ruta activa
    useEffect(() => {
        GERENCIAS_SECCIONES.forEach((g) => {
            if (location.pathname.startsWith(g.basePath)) {
                setOpenSections((prev) => ({ ...prev, [g.id]: true }));
            }
        });
    }, [location.pathname]);

    const toggleSection = (id) => {
        if (!isDesktopOpen) {
            setIsDesktopOpen(true);
        }
        setOpenSections((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const role = user?.role || user?.gerencia || 'Voluntario';
    const userName = user?.name || 'Miembro PSM';
    const userEmail = user?.email || '';

    const handleLogout = async () => {
        setIsProfileMenuOpen(false);
        await logout();
        navigate('/login', { replace: true });
    };

    // Cerrar sidebar móvil en cambio de ruta
    useEffect(() => {
        setIsSidebarOpen(false);
        setIsProfileMenuOpen(false);
    }, [location.pathname]);

    // Cerrar menú de perfil al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showPasswordModal = mustChangePassword || isPasswordModalManualOpen;

    return (
        <div className="flex bg-[var(--psm-gray-light,#f0f4f8)] min-h-screen text-[var(--psm-text-body,#4b5563)] font-[var(--psm-font-body)] overflow-x-hidden">
            {/* Modal de Cambio de Contraseña */}
            <PasswordChangeModal
                isOpen={showPasswordModal}
                isMandatory={mustChangePassword}
                onClose={() => setIsPasswordModalManualOpen(false)}
            />

            {/* OVERLAY PARA MÓVIL */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity backdrop-blur-xs"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR NAVEGACIÓN MODULAR */}
            <aside
                className={`fixed top-0 left-0 h-full bg-[var(--psm-navy,#0f2044)] text-white transition-all duration-300 z-30 flex flex-col
                ${isSidebarOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full w-72'} 
                md:translate-x-0 ${isDesktopOpen ? 'md:w-72' : 'md:w-20'}`}
            >
                {/* Logo & Toggle Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <div className={`flex items-center gap-3 ${!isDesktopOpen && 'md:hidden'}`}>
                            <img
                                src="https://uvsnieedcxndpdlyemgn.supabase.co/storage/v1/object/public/icons-psm/logo-white.png"
                                alt="Logo PSM"
                                className="w-9 h-9 object-contain"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-white tracking-wide uppercase leading-tight" style={{ fontFamily: 'var(--psm-font-heading)' }}>
                                    Intranet PSM
                                </span>
                                <span className="text-[10px] text-[var(--psm-teal-light)] font-semibold tracking-wider uppercase">
                                    UNMSM 2026
                                </span>
                            </div>
                        </div>

                        {/* Desktop Toggle Button */}
                        <button
                            onClick={() => setIsDesktopOpen(!isDesktopOpen)}
                            className={`p-1.5 hover:bg-white/10 rounded-md transition-colors hidden md:block cursor-pointer ${!isDesktopOpen && 'mx-auto'}`}
                            title={isDesktopOpen ? "Contraer Menú" : "Expandir Menú"}
                        >
                            {isDesktopOpen ? <X size={18} /> : <Menu size={20} />}
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden p-1 hover:bg-white/10 rounded-md cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* CONTENIDO DEL MENÚ CON SCROLL */}
                <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto overflow-x-hidden psm-scrollbar text-xs">
                    {/* SECCIÓN PRINCIPAL: DASHBOARD Y MI ESPACIO */}
                    <div className="space-y-1">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--psm-radius-md,12px)] transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-[var(--psm-teal,#00b4d8)] text-white font-bold shadow-md'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                } ${!isDesktopOpen && 'md:justify-center'}`
                            }
                            title="Dashboard General"
                        >
                            <LayoutDashboard size={18} className="shrink-0 text-white" />
                            <span className={`whitespace-nowrap font-semibold ${!isDesktopOpen && 'md:hidden'}`}>
                                Dashboard General
                            </span>
                        </NavLink>

                        <NavLink
                            to="/mi-perfil"
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--psm-radius-md,12px)] transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-gradient-to-r from-teal-500 to-[var(--psm-teal,#00b4d8)] text-white font-bold shadow-md'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                } ${!isDesktopOpen && 'md:justify-center'}`
                            }
                            title="Mi Espacio / Perfil"
                        >
                            <User size={18} className="shrink-0 text-[var(--psm-teal-light,#90e0ef)]" />
                            <div className={`flex items-center justify-between w-full ${!isDesktopOpen && 'md:hidden'}`}>
                                <span className="whitespace-nowrap font-semibold">Mi Espacio</span>
                                <span className="text-[10px] uppercase font-bold bg-white/15 px-1.5 py-0.5 rounded text-white">
                                    Perfil
                                </span>
                            </div>
                        </NavLink>
                    </div>

                    <div className="h-px bg-white/10 my-2" />

                    {/* SECCIÓN JERÁRQUICA: 5 GERENCIAS CON ACORDEÓN */}
                    <div className="space-y-1">
                        {isDesktopOpen && (
                            <p className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Gerencias y Áreas
                            </p>
                        )}

                        {GERENCIAS_SECCIONES.map((seccion) => {
                            const Icon = seccion.icon;
                            const isOpen = openSections[seccion.id];
                            const isSectionActive = location.pathname.startsWith(seccion.basePath);

                            return (
                                <div key={seccion.id} className="space-y-1">
                                    {/* Botón Encabezado de la Gerencia */}
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(seccion.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--psm-radius-md,12px)] transition-colors group cursor-pointer ${
                                            isSectionActive
                                                ? 'bg-white/10 text-white font-bold'
                                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                        } ${!isDesktopOpen && 'md:justify-center'}`}
                                        title={seccion.name}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Icon
                                                size={18}
                                                className={`shrink-0 ${
                                                    isSectionActive ? 'text-[var(--psm-teal)]' : 'text-slate-400 group-hover:text-white'
                                                }`}
                                            />
                                            <span className={`whitespace-nowrap text-xs font-semibold truncate ${!isDesktopOpen && 'md:hidden'}`}>
                                                {seccion.name}
                                            </span>
                                        </div>

                                        {isDesktopOpen && (
                                            <span className="text-slate-400 shrink-0 ml-1">
                                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </span>
                                        )}
                                    </button>

                                    {/* Subáreas desplegables */}
                                    {isOpen && isDesktopOpen && (
                                        <div className="pl-7 pr-1 space-y-1 border-l-2 border-white/10 ml-5 my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                            {seccion.subareas.map((sub) => {
                                                const isCurrent = location.pathname === sub.path;
                                                return (
                                                    <NavLink
                                                        key={sub.path}
                                                        to={sub.path}
                                                        className={({ isActive }) =>
                                                            `block py-1.5 px-2.5 rounded-lg text-xs transition-colors ${
                                                                isActive || isCurrent
                                                                    ? 'text-[var(--psm-teal-light,#90e0ef)] font-bold bg-white/10'
                                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                            }`
                                                        }
                                                    >
                                                        {sub.name}
                                                    </NavLink>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer Area / Logout */}
                <div className="p-3 border-t border-white/10 shrink-0 space-y-1">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--psm-radius-md,12px)] text-slate-400 hover:bg-red-500/15 hover:text-red-300 transition-colors group cursor-pointer text-xs ${!isDesktopOpen && 'md:justify-center'}`}
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} className="shrink-0 group-hover:text-red-300 transition-colors" />
                        <span className={`whitespace-nowrap font-bold ${!isDesktopOpen && 'md:hidden'}`}>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className={`flex-1 flex flex-col transition-all duration-300 w-full min-w-0 ${isDesktopOpen ? 'md:ml-72' : 'md:ml-20'}`}>
                {/* TOP BAR / HEADER */}
                <header className="h-16 bg-[var(--psm-white,#ffffff)] border-b border-[var(--psm-gray-mid,#e5e7eb)] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-xs shrink-0">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 -ml-2 text-[var(--psm-text-muted,#9ca3af)] hover:text-[var(--psm-navy,#0f2044)] transition-colors rounded-md cursor-pointer"
                        title="Abrir Menú"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Buscador de Cabecera */}
                    <div className="hidden sm:flex items-center gap-2 bg-[var(--psm-gray-light,#f0f4f8)] px-4 py-2 rounded-full w-full max-w-sm lg:max-w-md focus-within:ring-2 focus-within:ring-[var(--psm-teal,#00b4d8)] transition-all ml-4 md:ml-0">
                        <Search size={18} className="text-[var(--psm-text-muted,#9ca3af)] shrink-0" />
                        <input
                            type="text"
                            placeholder="Buscar en la Intranet PSM..."
                            className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-[var(--psm-navy,#0f2044)] placeholder-[var(--psm-text-muted,#9ca3af)] focus:ring-0"
                        />
                    </div>

                    {/* Perfil & Acciones de Usuario */}
                    <div className="flex items-center gap-3 sm:gap-6 ml-auto shrink-0 relative">
                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-3 cursor-pointer group pl-2 sm:pl-4 sm:border-l border-[var(--psm-gray-mid,#e5e7eb)] focus:outline-none"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs sm:text-sm font-bold text-[var(--psm-navy,#0f2044)] leading-tight max-w-[150px] truncate">{userName}</p>
                                    <p className="text-[11px] text-[var(--psm-text-muted,#9ca3af)] font-medium truncate max-w-[150px]">{role}</p>
                                </div>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0f2044&color=00b4d8&bold=true`}
                                    alt="Profile"
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full group-hover:ring-2 group-hover:ring-[var(--psm-teal,#00b4d8)] group-hover:ring-offset-2 transition-all shadow-xs"
                                />
                                <ChevronDown size={14} className="text-[var(--psm-text-muted,#9ca3af)] group-hover:text-[var(--psm-teal,#00b4d8)] hidden md:block transition-colors" />
                            </button>

                            {/* Menú Desplegable */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-4 py-2.5 border-b border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Conectado como</p>
                                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{userName}</p>
                                        <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                                    </div>

                                    <div className="py-1">
                                        <NavLink
                                            to="/mi-perfil"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[var(--psm-teal,#00b4d8)] flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <User size={15} />
                                            <span>Mi Espacio / Perfil</span>
                                        </NavLink>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                setIsPasswordModalManualOpen(true);
                                            }}
                                            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[var(--psm-teal,#00b4d8)] flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <KeyRound size={15} />
                                            <span>Cambiar Contraseña</span>
                                        </button>
                                    </div>

                                    <div className="border-t border-slate-100 pt-1">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <LogOut size={15} />
                                            <span>Cerrar Sesión</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Banner de Advertencia si está pendiente cambiar contraseña */}
                {mustChangePassword && (
                    <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-between text-amber-800 text-xs font-medium shrink-0 animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                            <span>
                                <strong>Cambio de clave requerido:</strong> Estás utilizando una contraseña temporal. Configura tu contraseña personal para mantener tu cuenta segura.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPasswordModalManualOpen(true)}
                            className="ml-3 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-xs shrink-0 transition-colors cursor-pointer"
                        >
                            Cambiar ahora
                        </button>
                    </div>
                )}

                {/* ÁREA DE CONTENIDO DINÁMICO */}
                <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
