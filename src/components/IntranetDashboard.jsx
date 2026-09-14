import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordChangeModal from './PasswordChangeModal';
import {
    Menu, X, Search, Bell, LogOut, ChevronDown, KeyRound, AlertTriangle,
    LayoutDashboard, Users, PieChart, Briefcase,
    Megaphone, FileText, Calendar, DollarSign,
    UserPlus, FileBarChart, Monitor, Layers
} from 'lucide-react';

const ROLES_MENU = {
    Presidencia: [
        { name: 'Dashboard Global', icon: LayoutDashboard, path: '/' },
        { name: 'PMO (Proyectos)', icon: Briefcase, path: '/pmo' },
        { name: 'Métricas Globales', icon: PieChart, path: '/metricas' },
        { name: 'Gestión de Usuarios', icon: Users, path: '/usuarios' },
    ],
    PMO: [
        { name: 'Resumen PMO', icon: LayoutDashboard, path: '/' },
        { name: 'Control de Proyectos', icon: Briefcase, path: '/pmo' },
        { name: 'Metodologías Ágiles', icon: Layers, path: '/metodologias' },
        { name: 'Cronogramas', icon: Calendar, path: '/cronogramas' },
    ],
    Comunicaciones: [
        { name: 'Resumen Comunicaciones', icon: LayoutDashboard, path: '/' },
        { name: 'Gestión de Redes', icon: Monitor, path: '/redes' },
        { name: 'Blog Interno', icon: FileText, path: '/blog' },
        { name: 'Comunicados', icon: Megaphone, path: '/comunicados' },
    ],
    Finanzas: [
        { name: 'Resumen Finanzas', icon: LayoutDashboard, path: '/' },
        { name: 'Presupuestos', icon: DollarSign, path: '/presupuestos' },
        { name: 'Caja', icon: Briefcase, path: '/caja' },
        { name: 'Reportes Financieros', icon: FileBarChart, path: '/reportes' },
    ],
    'Talento Humano': [
        { name: 'Resumen TH', icon: LayoutDashboard, path: '/' },
        { name: 'Directorio', icon: Users, path: '/directorio' },
        { name: 'Reclutamiento', icon: UserPlus, path: '/reclutamiento' },
        { name: 'Asistencia', icon: Calendar, path: '/asistencia' },
    ],
};

export default function IntranetDashboard() {
    const { user, logout, mustChangePassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopOpen, setIsDesktopOpen] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isPasswordModalManualOpen, setIsPasswordModalManualOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    // Fallback de usuario
    const role = user?.role || 'Presidencia';
    const currentMenu = ROLES_MENU[role] || ROLES_MENU['Presidencia'] || [];
    const userName = user?.name || 'Invitado';
    const userEmail = user?.email || '';

    // Manejo de Cierre de Sesión con Supabase
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

    // Cerrar menú de perfil al hacer click fuera
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

            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity backdrop-blur-xs"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed top-0 left-0 h-full bg-[var(--psm-navy,#0f2044)] text-white transition-all duration-300 z-30 flex flex-col
                ${isSidebarOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full w-64'} 
                md:translate-x-0 ${isDesktopOpen ? 'md:w-64' : 'md:w-20'}`}
            >
                {/* Logo Area */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <img
                            src="https://uvsnieedcxndpdlyemgn.supabase.co/storage/v1/object/public/icons-psm/logo-white.png"
                            alt="Logo PSM"
                            className={`w-10 ${!isDesktopOpen && 'md:hidden'}`}
                        />

                        {/* Desktop Toggle */}
                        <button
                            onClick={() => setIsDesktopOpen(!isDesktopOpen)}
                            className={`p-1 hover:bg-white/10 rounded-md transition-colors hidden md:block cursor-pointer ${!isDesktopOpen && 'mx-auto'}`}
                            title="Alternar Menú"
                        >
                            {isDesktopOpen ? <X size={20} /> : <Menu size={20} />}
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

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden psm-scrollbar">
                    {currentMenu.map((item, idx) => {
                        const Icon = item.icon;
                        const isDashboardHome = item.path === '/' || item.path === '/app';
                        return (
                            <NavLink
                                to={item.path}
                                end={isDashboardHome}
                                key={idx}
                                className={({ isActive }) =>
                                    `w-full flex items-center gap-3 px-3 py-3 rounded-[var(--psm-radius-md,12px)] transition-all duration-200 group ${isActive
                                        ? 'bg-[var(--psm-teal,#00b4d8)] text-white font-bold shadow-[var(--psm-shadow-card)]'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    } ${!isDesktopOpen && 'md:justify-center'}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[var(--psm-teal-light,#90e0ef)] transition-colors'}`} />
                                        <span className={`whitespace-nowrap ${!isDesktopOpen && 'md:hidden'}`}>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Area / Logout en Menú Lateral */}
                <div className="p-4 border-t border-white/10 shrink-0 space-y-1">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-[var(--psm-radius-md,12px)] text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group cursor-pointer ${!isDesktopOpen && 'md:justify-center'}`}
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} className="shrink-0 group-hover:text-red-400 transition-colors" />
                        <span className={`whitespace-nowrap ${!isDesktopOpen && 'md:hidden'}`}>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className={`flex-1 flex flex-col transition-all duration-300 w-full min-w-0 ${isDesktopOpen ? 'md:ml-64' : 'md:ml-20'}`}>

                {/* TOP BAR */}
                <header className="h-16 bg-[var(--psm-white,#ffffff)] border-b border-[var(--psm-gray-mid,#e5e7eb)] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-xs shrink-0">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 -ml-2 text-[var(--psm-text-muted,#9ca3af)] hover:text-[var(--psm-navy,#0f2044)] transition-colors rounded-md cursor-pointer"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Search */}
                    <div className="hidden sm:flex items-center gap-2 bg-[var(--psm-gray-light,#f0f4f8)] px-4 py-2 rounded-full w-full max-w-sm lg:max-w-md focus-within:ring-2 focus-within:ring-[var(--psm-teal,#00b4d8)] transition-all ml-4 md:ml-0">
                        <Search size={18} className="text-[var(--psm-text-muted,#9ca3af)] shrink-0" />
                        <input
                            type="text"
                            placeholder="Buscar proyectos, miembros..."
                            className="bg-transparent border-none outline-none w-full text-sm text-[var(--psm-navy,#0f2044)] placeholder-[var(--psm-text-muted,#9ca3af)] focus:ring-0"
                        />
                    </div>

                    {/* Right Area (Notifications & Profile) */}
                    <div className="flex items-center gap-3 sm:gap-6 ml-auto shrink-0 relative">
                        {/* Notifications */}
                        <button className="relative p-2 text-[var(--psm-text-muted,#9ca3af)] hover:text-[var(--psm-teal,#00b4d8)] transition-colors rounded-full hover:bg-[var(--psm-teal-subtle)] focus:outline-none cursor-pointer">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-3 cursor-pointer group pl-2 sm:pl-4 sm:border-l border-[var(--psm-gray-mid,#e5e7eb)] focus:outline-none"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-[var(--psm-navy,#0f2044)] leading-tight max-w-[140px] truncate">{userName}</p>
                                    <p className="text-xs text-[var(--psm-text-muted,#9ca3af)] font-medium truncate max-w-[140px]">{role}</p>
                                </div>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1b3068&color=fff&bold=true`}
                                    alt="Profile"
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full group-hover:ring-2 group-hover:ring-[var(--psm-teal,#00b4d8)] group-hover:ring-offset-2 transition-all shadow-xs"
                                />
                                <ChevronDown size={14} className="text-[var(--psm-text-muted,#9ca3af)] group-hover:text-[var(--psm-teal,#00b4d8)] hidden md:block transition-colors" />
                            </button>

                            {/* Menu desplegable de perfil */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-4 py-2.5 border-b border-slate-100">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Conectado como</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                                        <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                                    </div>

                                    <div className="py-1">
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

                {/* Banner de Advertencia si está pendiente cambiar la contraseña */}
                {mustChangePassword && (
                    <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-between text-amber-800 text-xs font-medium shrink-0 animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                            <span>
                                <strong>Cambio de clave requerido:</strong> Estás utilizando una contraseña temporal. Por favor configura tu contraseña personal para mantener tu cuenta segura.
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

                {/* DYNAMIC DASHBOARD CONTENT (Sub-routes render here) */}
                <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}
