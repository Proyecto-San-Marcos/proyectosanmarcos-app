import { useState, useEffect } from 'react';
import { rrppService } from '../../services/rrppService';
import {
    Users, Building, Mail, Phone, MessageSquare,
    Search, Plus, Filter, FileText, CheckCircle2,
    Clock, AlertCircle, Copy, ExternalLink, X,
    Sparkles, Edit3, Trash2, ArrowUpRight, Award,
    Briefcase, ShieldCheck, ChevronRight
} from 'lucide-react';

const CATEGORIAS = [
    'Todas',
    'Ponente',
    'Empresa Auspiciadora',
    'Autoridad UNMSM',
    'Comunidad Aliada'
];

const ESTADOS_RELACION = [
    'Todos',
    'Aliado Activo',
    'En Negociación',
    'Contacto Inicial',
    'Inactivo'
];

export default function RrppCrmPage() {
    const [contactos, setContactos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
    const [estadoFiltro, setEstadoFiltro] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('crm'); // 'crm' | 'cartas'

    // Modal Crear / Editar Contacto
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formContacto, setFormContacto] = useState({
        nombre_completo: '',
        organizacion: '',
        cargo: '',
        categoria: 'Empresa Auspiciadora',
        correo: '',
        telefono: '',
        estado_relacion: 'Contacto Inicial',
        notas_seguimiento: ''
    });
    const [guardando, setGuardando] = useState(false);

    // Modal de Carta Institucional
    const [selectedCarta, setSelectedCarta] = useState(null);
    const [copiedAlert, setCopiedAlert] = useState(false);

    // Cargar contactos
    const fetchContactos = async () => {
        setLoading(true);
        const res = await rrppService.getContactos({
            categoria: categoriaFiltro,
            estadoRelacion: estadoFiltro,
            search: searchTerm
        });
        setContactos(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchContactos();
    }, [categoriaFiltro, estadoFiltro, searchTerm]);

    const abrirModalNuevo = () => {
        setEditingContact(null);
        setFormContacto({
            nombre_completo: '',
            organizacion: '',
            cargo: '',
            categoria: 'Empresa Auspiciadora',
            correo: '',
            telefono: '',
            estado_relacion: 'Contacto Inicial',
            notas_seguimiento: ''
        });
        setIsContactModalOpen(true);
    };

    const abrirModalEditar = (contacto) => {
        setEditingContact(contacto);
        setFormContacto({
            nombre_completo: contacto.nombre_completo || '',
            organizacion: contacto.organizacion || '',
            cargo: contacto.cargo || '',
            categoria: contacto.categoria || 'Empresa Auspiciadora',
            correo: contacto.correo || '',
            telefono: contacto.telefono || '',
            estado_relacion: contacto.estado_relacion || 'Contacto Inicial',
            notas_seguimiento: contacto.notas_seguimiento || ''
        });
        setIsContactModalOpen(true);
    };

    const handleSubmitContacto = async (e) => {
        e.preventDefault();
        if (!formContacto.nombre_completo || !formContacto.organizacion) {
            alert('Por favor completa nombre completo y organización.');
            return;
        }

        try {
            setGuardando(true);
            if (editingContact) {
                await rrppService.actualizarContacto(editingContact.id, formContacto);
            } else {
                await rrppService.crearContacto(formContacto);
            }
            setIsContactModalOpen(false);
            fetchContactos();
        } catch (err) {
            console.error('Error al guardar contacto:', err);
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminarContacto = async (id) => {
        if (confirm('¿Estás seguro de eliminar este contacto del directorio de RRPP?')) {
            await rrppService.eliminarContacto(id);
            setContactos(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleCambiarEstadoRapido = async (id, nuevoEstado) => {
        await rrppService.actualizarContacto(id, { estado_relacion: nuevoEstado });
        setContactos(prev => prev.map(c => c.id === id ? { ...c, estado_relacion: nuevoEstado } : c));
    };

    const copiarTextoCarta = (texto) => {
        navigator.clipboard.writeText(texto);
        setCopiedAlert(true);
        setTimeout(() => setCopiedAlert(false), 3000);
    };

    // Estadísticas
    const totalContactos = contactos.length;
    const aliadosActivos = contactos.filter(c => c.estado_relacion === 'Aliado Activo').length;
    const enNegociacion = contactos.filter(c => c.estado_relacion === 'En Negociación').length;
    const auspiciadores = contactos.filter(c => c.categoria === 'Empresa Auspiciadora').length;
    const ponentes = contactos.filter(c => c.categoria === 'Ponente').length;

    const modelosCartas = rrppService.getModelosCartas();

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* HERO / HEADER INSTITUCIONAL */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="psm-badge flex items-center gap-1.5">
                            <Users size={13} />
                            Comunicaciones & RRPP
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            CRM de Aliados y Auspicios
                        </span>
                    </div>

                    <h1
                        className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight mb-2"
                        style={{ fontFamily: 'var(--psm-font-heading)' }}
                    >
                        Relaciones Públicas y Gestión de Aliados
                    </h1>

                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] leading-relaxed">
                        Directorio unificado de contactos clave de la organización: ponentes magistrales, empresas patrocinadoras, autoridades sanmarquinas y comunidades aliadas con trazabilidad de cartas y acuerdos.
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10 shrink-0">
                    <button
                        type="button"
                        onClick={abrirModalNuevo}
                        className="psm-btn-primary text-xs py-2.5 px-4 font-bold shadow-md cursor-pointer flex items-center gap-2"
                    >
                        <Plus size={16} />
                        <span>Nuevo Contacto</span>
                    </button>
                </div>
            </div>

            {/* MÉTRICAS DEL CRM */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Contactos</span>
                    <span className="text-2xl font-bold text-[var(--psm-navy)] mt-1 block">{totalContactos}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Aliados Activos</span>
                    <span className="text-2xl font-bold text-emerald-700 mt-1 block">{aliadosActivos}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">En Negociación</span>
                    <span className="text-2xl font-bold text-amber-700 mt-1 block">{enNegociacion}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Empresas / Auspicios</span>
                    <span className="text-2xl font-bold text-blue-700 mt-1 block">{auspiciadores}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-2xs">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Ponentes / Expertos</span>
                    <span className="text-2xl font-bold text-purple-700 mt-1 block">{ponentes}</span>
                </div>
            </div>

            {/* PESTAÑAS PRINCIPALES */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                    onClick={() => setActiveTab('crm')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'crm'
                            ? 'bg-[var(--psm-navy)] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Users size={15} />
                    <span>Directorio CRM ({contactos.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('cartas')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'cartas'
                            ? 'bg-[var(--psm-navy)] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <FileText size={15} />
                    <span>Modelos de Cartas Institucionales ({modelosCartas.length})</span>
                </button>
            </div>

            {/* CONTENIDO TAB 1: DIRECTORIO CRM */}
            {activeTab === 'crm' && (
                <div className="space-y-6">
                    {/* Barra de Filtros y Búsqueda */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, organización o cargo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="psm-input text-xs pl-10 w-full"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={categoriaFiltro}
                                onChange={(e) => setCategoriaFiltro(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)]"
                            >
                                <option value="Todas">Todas las Categorías</option>
                                <option value="Ponente">Ponentes</option>
                                <option value="Empresa Auspiciadora">Empresas Auspiciadoras</option>
                                <option value="Autoridad UNMSM">Autoridades UNMSM</option>
                                <option value="Comunidad Aliada">Comunidades Aliadas</option>
                            </select>

                            <select
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)]"
                            >
                                <option value="Todos">Todos los Estados</option>
                                <option value="Aliado Activo">Aliado Activo</option>
                                <option value="En Negociación">En Negociación</option>
                                <option value="Contacto Inicial">Contacto Inicial</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    {/* Lista / Grid de Tarjetas de Contactos */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-3">
                                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                    <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                                    <div className="h-10 bg-slate-100 rounded-xl"></div>
                                </div>
                            ))}
                        </div>
                    ) : contactos.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                            <Users size={48} className="mx-auto mb-3 text-slate-300" />
                            <h3 className="text-base font-bold text-slate-800">No se encontraron contactos en esta categoría</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Puedes agregar un nuevo aliado o cambiar los filtros seleccionados arriba.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {contactos.map((contacto) => {
                                const cleanPhone = (contacto.telefono || '').replace(/\D/g, '');
                                const whatsappMsg = encodeURIComponent(`Hola ${contacto.nombre_completo}, le saluda cordialmente el equipo de Comunicaciones y RRPP de Proyectos San Marcos UNMSM.`);
                                const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsappMsg}` : null;

                                return (
                                    <div
                                        key={contacto.id}
                                        className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-5 flex flex-col justify-between hover:border-[var(--psm-teal)]/40 transition-all group"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {contacto.categoria}
                                                </span>

                                                {/* Estado de relación */}
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    contacto.estado_relacion === 'Aliado Activo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    contacto.estado_relacion === 'En Negociación' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                    contacto.estado_relacion === 'Contacto Inicial' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {contacto.estado_relacion}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-base text-[var(--psm-navy)] group-hover:text-[var(--psm-teal)] transition-colors line-clamp-1 mb-0.5">
                                                {contacto.nombre_completo}
                                            </h3>

                                            <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                                                {contacto.cargo}
                                            </p>

                                            <p className="text-xs text-[var(--psm-teal)] font-medium line-clamp-1 mb-3">
                                                {contacto.organizacion}
                                            </p>

                                            {/* Canales de contacto */}
                                            <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                {contacto.correo && (
                                                    <div className="flex items-center gap-2 truncate">
                                                        <Mail size={13} className="text-slate-400 shrink-0" />
                                                        <a href={`mailto:${contacto.correo}`} className="hover:underline text-slate-700 truncate">
                                                            {contacto.correo}
                                                        </a>
                                                    </div>
                                                )}
                                                {contacto.telefono && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={13} className="text-slate-400 shrink-0" />
                                                        <span className="font-mono text-slate-700">{contacto.telefono}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notas de seguimiento */}
                                            {contacto.notas_seguimiento && (
                                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic mb-4">
                                                    "{contacto.notas_seguimiento}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Acciones del contacto */}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5">
                                                {whatsappLink && (
                                                    <a
                                                        href={whatsappLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                        title="Escribir por WhatsApp"
                                                    >
                                                        <MessageSquare size={14} />
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => abrirModalEditar(contacto)}
                                                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                                    title="Editar Contacto"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarContacto(contacto.id)}
                                                    className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                                    title="Eliminar Contacto"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Selector rápido de estado */}
                                            <select
                                                value={contacto.estado_relacion}
                                                onChange={(e) => handleCambiarEstadoRapido(contacto.id, e.target.value)}
                                                className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none cursor-pointer"
                                            >
                                                <option value="Aliado Activo">Aliado Activo</option>
                                                <option value="En Negociación">En Negociación</option>
                                                <option value="Contacto Inicial">Contacto Inicial</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* CONTENIDO TAB 2: MODELOS DE CARTAS INSTITUCIONALES */}
            {activeTab === 'cartas' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--psm-navy)] uppercase tracking-tight">
                            Formatos y Modelos de Cartas con Membrete Oficial
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Plantillas estandarizadas para invitaciones formales, solicitudes de auspicio, patrocinios y convenios interinstitucionales aprobados por la Junta Directiva.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {modelosCartas.map((carta) => (
                            <div
                                key={carta.id}
                                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-[var(--psm-teal)]/40 shadow-xs transition-all"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                                            <FileText size={18} />
                                        </span>
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                                            {carta.categoria}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-base text-[var(--psm-navy)] mb-2">
                                        {carta.titulo}
                                    </h3>

                                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                        {carta.descripcion}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCarta(carta)}
                                        className="psm-btn-primary text-xs py-2 px-4 shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <FileText size={14} />
                                        <span>Abrir y Personalizar Carta</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL CREAR / EDITAR CONTACTO */}
            {isContactModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-[var(--psm-navy)] text-white p-5 px-6 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider">
                                {editingContact ? 'Editar Contacto de RRPP' : 'Registrar Nuevo Contacto / Aliado'}
                            </h3>
                            <button
                                onClick={() => setIsContactModalOpen(false)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitContacto} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Lic. Mariana Salcedo"
                                    value={formContacto.nombre_completo}
                                    onChange={(e) => setFormContacto({ ...formContacto, nombre_completo: e.target.value })}
                                    className="psm-input text-xs w-full"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Organización / Empresa *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Interbank, PMI, UNMSM"
                                        value={formContacto.organizacion}
                                        onChange={(e) => setFormContacto({ ...formContacto, organizacion: e.target.value })}
                                        className="psm-input text-xs w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Cargo *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Gerente de Alianzas"
                                        value={formContacto.cargo}
                                        onChange={(e) => setFormContacto({ ...formContacto, cargo: e.target.value })}
                                        className="psm-input text-xs w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Categoría
                                    </label>
                                    <select
                                        value={formContacto.categoria}
                                        onChange={(e) => setFormContacto({ ...formContacto, categoria: e.target.value })}
                                        className="psm-input text-xs w-full"
                                    >
                                        <option value="Empresa Auspiciadora">Empresa Auspiciadora</option>
                                        <option value="Ponente">Ponente</option>
                                        <option value="Autoridad UNMSM">Autoridad UNMSM</option>
                                        <option value="Comunidad Aliada">Comunidad Aliada</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Estado de Relación
                                    </label>
                                    <select
                                        value={formContacto.estado_relacion}
                                        onChange={(e) => setFormContacto({ ...formContacto, estado_relacion: e.target.value })}
                                        className="psm-input text-xs w-full"
                                    >
                                        <option value="Contacto Inicial">Contacto Inicial</option>
                                        <option value="En Negociación">En Negociación</option>
                                        <option value="Aliado Activo">Aliado Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="contacto@empresa.com"
                                        value={formContacto.correo}
                                        onChange={(e) => setFormContacto({ ...formContacto, correo: e.target.value })}
                                        className="psm-input text-xs w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Teléfono / WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="+51 987 654 321"
                                        value={formContacto.telefono}
                                        onChange={(e) => setFormContacto({ ...formContacto, telefono: e.target.value })}
                                        className="psm-input text-xs w-full font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Notas de Seguimiento / Última Interacción
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Detalles de la última llamada, acuerdos preliminares o compromisos de apoyo..."
                                    value={formContacto.notas_seguimiento}
                                    onChange={(e) => setFormContacto({ ...formContacto, notas_seguimiento: e.target.value })}
                                    className="psm-input text-xs w-full"
                                ></textarea>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsContactModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="psm-btn-primary text-xs py-2 px-5 font-bold shadow-md cursor-pointer"
                                >
                                    {guardando ? 'Guardando...' : editingContact ? 'Actualizar Contacto' : 'Registrar Contacto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PREVISUALIZADOR Y COPIADOR DE CARTAS INSTITUCIONALES */}
            {selectedCarta && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="bg-[var(--psm-navy)] text-white p-5 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--psm-teal)] block">
                                    Plantilla Institucional PSM
                                </span>
                                <h3 className="text-sm font-bold text-white">
                                    {selectedCarta.titulo}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedCarta(null)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {copiedAlert && (
                            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 border-b border-emerald-200 animate-in fade-in">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                <span>¡Texto de la carta copiado al portapapeles con éxito!</span>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs font-serif text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                                {selectedCarta.cuerpo}
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                                Sustituye los textos entre corchetes <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">[...]</code>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedCarta(null)}
                                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={() => copiarTextoCarta(selectedCarta.cuerpo)}
                                    className="psm-btn-primary text-xs py-2 px-4 font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Copy size={14} />
                                    <span>Copiar al Portapapeles</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
