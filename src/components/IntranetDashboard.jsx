import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Menu, X, Search, Bell, LogOut, ChevronDown,
    LayoutDashboard, Users, PieChart, Briefcase,
    Megaphone, FileText, Calendar, DollarSign,
    UserPlus, FileBarChart, Monitor, Layers
} from 'lucide-react';

const ROLES_MENU = {
    Presidencia: [
        { name: 'Dashboard Global', icon: LayoutDashboard, path: '/app' },
        { name: 'PMO (Proyectos)', icon: Briefcase, path: '/app/pmo' },
        { name: 'Métricas Globales', icon: PieChart, path: '/app/metricas' },
        { name: 'Gestión de Usuarios', icon: Users, path: '/app/usuarios' },
    ],
    PMO: [
        { name: 'Resumen PMO', icon: LayoutDashboard, path: '/app' },
        { name: 'Control de Proyectos', icon: Briefcase, path: '/app/pmo' },
        { name: 'Metodologías Ágiles', icon: Layers, path: '/app/metodologias' },
        { name: 'Cronogramas', icon: Calendar, path: '/app/cronogramas' },
    ],
    Comunicaciones: [
        { name: 'Resumen Comunicaciones', icon: LayoutDashboard, path: '/app' },
        { name: 'Gestión de Redes', icon: Monitor, path: '/app/redes' },
        { name: 'Blog Interno', icon: FileText, path: '/app/blog' },
        { name: 'Comunicados', icon: Megaphone, path: '/app/comunicados' },
    ],
    Finanzas: [
        { name: 'Resumen Finanzas', icon: LayoutDashboard, path: '/app' },
        { name: 'Presupuestos', icon: DollarSign, path: '/app/presupuestos' },
        { name: 'Caja', icon: Briefcase, path: '/app/caja' },
        { name: 'Reportes Financieros', icon: FileBarChart, path: '/app/reportes' },
    ],
    'Talento Humano': [
        { name: 'Resumen TH', icon: LayoutDashboard, path: '/app' },
        { name: 'Directorio', icon: Users, path: '/app/directorio' },
        { name: 'Reclutamiento', icon: UserPlus, path: '/app/reclutamiento' },
        { name: 'Asistencia', icon: Calendar, path: '/app/asistencia' },
    ],
};

export default function IntranetDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopOpen, setIsDesktopOpen] = useState(true);

    // Fallback
    const role = user?.role || 'Presidencia';
    const currentMenu = ROLES_MENU[role] || [];
    const userName = user?.name || 'Invitado';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex bg-[var(--psm-gray-light)] min-h-screen text-[var(--psm-text-body)] font-[var(--psm-font-body)] overflow-x-hidden">

            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed top-0 left-0 h-full bg-[var(--psm-navy)] text-white transition-all duration-300 z-30 flex flex-col
        ${isSidebarOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full w-64'} 
        md:translate-x-0 ${isDesktopOpen ? 'md:w-64' : 'md:w-20'}`}
            >
                {/* Logo Area */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <img src="https://uvsnieedcxndpdlyemgn.supabase.co/storage/v1/object/public/icons-psm/logo-white.png" alt="" className={`w-10 ${!isDesktopOpen && 'md:hidden'}`} />

                        {/* Desktop Toggle */}
                        <button
                            onClick={() => setIsDesktopOpen(!isDesktopOpen)}
                            className={`p-1 hover:bg-white/10 rounded-md transition-colors hidden md:block ${!isDesktopOpen && 'mx-auto'}`}
                        >
                            {isDesktopOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {/* Mobile Close Button */}
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 hover:bg-white/10 rounded-md">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden psm-scrollbar">
                    {currentMenu.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                to={item.path}
                                end={item.path === '/app'}
                                key={idx}
                                className={({ isActive }) =>
                                    `w-full flex items-center gap-3 px-3 py-3 rounded-[var(--psm-radius-md)] transition-all duration-200 group ${isActive
                                        ? 'bg-[var(--psm-teal)] text-white font-bold shadow-[var(--psm-shadow-card)]'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    } ${!isDesktopOpen && 'md:justify-center'}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[var(--psm-teal-light)] transition-colors'}`} />
                                        <span className={`whitespace-nowrap ${!isDesktopOpen && 'md:hidden'}`}>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Area / Logout */}
                <div className="p-4 border-t border-white/10 shrink-0">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-[var(--psm-radius-md)] text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group ${!isDesktopOpen && 'md:justify-center'}`}
                    >
                        <LogOut size={20} className="shrink-0 group-hover:text-red-400 transition-colors" />
                        <span className={`whitespace-nowrap ${!isDesktopOpen && 'md:hidden'}`}>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className={`flex-1 flex flex-col transition-all duration-300 w-full min-w-0 ${isDesktopOpen ? 'md:ml-64' : 'md:ml-20'}`}>

                {/* TOP BAR */}
                <header className="h-16 bg-[var(--psm-white)] border-b border-[var(--psm-gray-mid)] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shadow-sm shrink-0">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 -ml-2 text-[var(--psm-text-muted)] hover:text-[var(--psm-navy)] transition-colors rounded-md"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Search */}
                    <div className="hidden sm:flex items-center gap-2 bg-[var(--psm-gray-light)] px-4 py-2 rounded-full w-full max-w-sm lg:max-w-md focus-within:ring-2 focus-within:ring-[var(--psm-teal)] transition-all ml-4 md:ml-0">
                        <Search size={18} className="text-[var(--psm-text-muted)] shrink-0" />
                        <input
                            type="text"
                            placeholder="Buscar proyectos..."
                            className="bg-transparent border-none outline-none w-full text-sm text-[var(--psm-navy-dark)] placeholder-[var(--psm-text-muted)] focus:ring-0"
                        />
                    </div>

                    {/* Right Area (Notifications & Profile) */}
                    <div className="flex items-center gap-3 sm:gap-6 ml-auto shrink-0">
                        {/* Notifications */}
                        <button className="relative p-2 text-[var(--psm-text-muted)] hover:text-[var(--psm-teal)] transition-colors lg:bg-[var(--psm-gray-light)] rounded-full hover:bg-[var(--psm-teal-subtle)] focus:outline-none">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Profile */}
                        <div className="flex items-center gap-3 cursor-pointer group pl-2 sm:pl-4 sm:border-l border-[var(--psm-gray-mid)]">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-[var(--psm-navy)] leading-tight max-w-[120px] truncate">{userName}</p>
                                <p className="text-xs text-[var(--psm-text-muted)] font-medium truncate max-w-[120px]">{role}</p>
                            </div>
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1b3068&color=fff&bold=true`}
                                alt="Profile"
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full group-hover:ring-2 group-hover:ring-[var(--psm-teal)] group-hover:ring-offset-2 transition-all shadow-sm"
                            />
                            <ChevronDown size={14} className="text-[var(--psm-text-muted)] group-hover:text-[var(--psm-teal)] hidden md:block delay-75 transition-colors" />
                        </div>
                    </div>
                </header>

                {/* DYNAMIC DASHBOARD CONTENT (Sub-routes render here) */}
                <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}
