import { useState, useEffect, useMemo } from 'react';
import { pmoService } from '../../services/pmoService';
import {
    FileText, Download, Search, Filter, FolderKanban,
    FileSpreadsheet, FileBox, RefreshCw, Loader2, AlertCircle,
    CheckCircle, ExternalLink
} from 'lucide-react';

const CATEGORIAS = ['Todas', 'Inicio', 'Planificación', 'Control', 'Cierre'];

export default function PlantillasPmoPage() {
    const [plantillas, setPlantillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState('Todas');
    const [downloadingId, setDownloadingId] = useState(null);

    // Cargar plantillas de PMO desde Supabase
    const loadPlantillas = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await pmoService.getPlantillas({
                categoria: selectedCategoria !== 'Todas' ? selectedCategoria : '',
                search: searchQuery
            });

            if (!res.success) {
                setError('No fue posible cargar las plantillas de PMO.');
            } else {
                setPlantillas(res.data || []);
            }
        } catch (err) {
            console.error('Error al cargar plantillas:', err);
            setError('Ocurrió un error inesperado al conectar con Supabase.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlantillas();
    }, [selectedCategoria]);

    // Filtrar localmente con búsqueda rápida
    const filteredPlantillas = useMemo(() => {
        if (!searchQuery.trim()) return plantillas;
        const q = searchQuery.trim().toLowerCase();
        return plantillas.filter((item) => {
            const nombre = (item.nombre || '').toLowerCase();
            const desc = (item.descripcion || '').toLowerCase();
            const cat = (item.categoria || '').toLowerCase();
            return nombre.includes(q) || desc.includes(q) || cat.includes(q);
        });
    }, [plantillas, searchQuery]);

    const handleDownload = async (item) => {
        try {
            setDownloadingId(item.id);
            // Registrar incremento de conteo de descargas
            await pmoService.registrarDescargaPlantilla(item.id, item.descargas_count);

            const downloadUrl = pmoService.getPlantillaDownloadUrl(item.archivo_url);
            
            // Forzar descarga o abrir ventana
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('download', item.nombre || 'plantilla-pmo');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Actualizar contador localmente
            setPlantillas(prev => prev.map(p => p.id === item.id ? { ...p, descargas_count: (p.descargas_count || 0) + 1 } : p));
        } catch (err) {
            console.error('Error en descarga:', err);
        } finally {
            setDownloadingId(null);
        }
    };

    const getFileIcon = (ext) => {
        const e = (ext || '').toLowerCase();
        if (e.includes('xls') || e.includes('sheet') || e.includes('csv')) {
            return <FileSpreadsheet className="text-emerald-500" size={28} />;
        }
        if (e.includes('doc') || e.includes('word')) {
            return <FileText className="text-blue-500" size={28} />;
        }
        return <FileBox className="text-amber-500" size={28} />;
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            {/* ENCABEZADO */}
            <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="psm-badge">
                            Gerencia de PMO
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            Metodología y Estándares
                        </span>
                    </div>
                    <h1
                        className="text-2xl sm:text-3xl font-bold text-[var(--psm-navy,#0f2044)] uppercase tracking-tight"
                        style={{ fontFamily: 'var(--psm-font-heading)' }}
                    >
                        Repositorio Oficial de Plantillas PMO
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--psm-text-body,#4b5563)] font-medium">
                        Descarga directa de artefactos oficiales: Project Charter, EDT, RACI, Cronogramas y Matriz de Riesgos.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadPlantillas}
                        disabled={loading}
                        className="psm-btn-outline text-xs sm:text-sm py-2 px-4 font-bold text-[var(--psm-navy)] border-slate-300 hover:border-[var(--psm-teal)] hover:text-[var(--psm-teal)] transition-all cursor-pointer flex items-center gap-2"
                        title="Recargar plantillas"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>

            {/* BARRA DE FILTROS Y BÚSQUEDA */}
            <div className="bg-[var(--psm-white,#ffffff)] p-4 sm:p-5 rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Búsqueda */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre o descripción de plantilla..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[var(--psm-navy)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--psm-teal)] focus:bg-white transition-all"
                    />
                </div>

                {/* Filtro por Categorías */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    <Filter size={16} className="text-slate-400 shrink-0 hidden sm:block" />
                    {CATEGORIAS.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategoria(cat)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                selectedCategoria === cat
                                    ? 'bg-[var(--psm-navy,#0f2044)] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-semibold">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* LISTA DE PLANTILLAS EN GRID */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-[var(--psm-teal)]" />
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--psm-navy)]">
                        Cargando plantillas desde bucket pmo-templates...
                    </p>
                </div>
            ) : filteredPlantillas.length === 0 ? (
                <div className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] p-12 text-center text-slate-400">
                    <FolderKanban size={48} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-base font-bold text-slate-700">No se encontraron plantillas registradas</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Aún no se han añadido artefactos para esta categoría o criterio de búsqueda en la tabla <code className="font-mono text-slate-600">pmo_plantillas</code>.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlantillas.map((item) => {
                        const extension = item.extension || 'docx';
                        const descargas = item.descargas_count || 0;
                        const version = item.version || '1.0';

                        return (
                            <div
                                key={item.id}
                                className="bg-[var(--psm-white,#ffffff)] rounded-[var(--psm-radius-lg,20px)] border border-[var(--psm-gray-mid,#e5e7eb)] shadow-[var(--psm-shadow-card)] p-5 flex flex-col justify-between hover:-translate-y-1 hover:border-[var(--psm-teal)]/40 transition-all group"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-blue-50 transition-colors">
                                            {getFileIcon(extension)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                v{version}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                                {item.categoria || 'General'}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-base text-[var(--psm-navy,#0f2044)] group-hover:text-[var(--psm-teal)] transition-colors line-clamp-1 mb-1">
                                        {item.nombre}
                                    </h3>
                                    <p className="text-xs text-[var(--psm-text-body,#4b5563)] line-clamp-3 leading-relaxed mb-4">
                                        {item.descripcion || 'Plantilla metodológica oficial estandarizada para proyectos de voluntariado PSM UNMSM.'}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        {descargas} descargas
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(item)}
                                        disabled={downloadingId === item.id}
                                        className="psm-btn-primary text-xs py-2 px-3.5 shadow-xs cursor-pointer flex items-center gap-1.5"
                                    >
                                        {downloadingId === item.id ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Download size={14} />
                                        )}
                                        <span>Descargar</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
