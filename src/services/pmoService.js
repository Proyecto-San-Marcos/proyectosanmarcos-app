import { supabase } from '../lib/supabaseClient';

/**
 * Servicio para la gestión de proyectos y plantillas oficiales de PMO
 */
export const pmoService = {
    /**
     * Obtener listado de proyectos con filtros opcionales
     */
    async getProyectos({ estado = '', search = '' } = {}) {
        try {
            let query = supabase
                .from('proyectos')
                .select(`
                    *,
                    director:director_id (
                        id,
                        nombres,
                        apellidos,
                        correo_institucional
                    )
                `)
                .order('created_at', { ascending: false });

            if (estado && estado !== 'Todos') {
                query = query.eq('estado', estado);
            }

            if (search.trim()) {
                query = query.or(`nombre.ilike.%${search}%,codigo_proyecto.ilike.%${search}%,descripcion.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error al obtener proyectos:', error);
                return { success: false, error, data: [] };
            }

            return { success: true, data: data || [] };
        } catch (err) {
            console.error('Excepción en getProyectos:', err);
            return { success: false, error: err, data: [] };
        }
    },

    /**
     * Obtener lista de plantillas de PMO
     */
    async getPlantillas({ categoria = '', search = '' } = {}) {
        try {
            let query = supabase
                .from('pmo_plantillas')
                .select('*')
                .order('created_at', { ascending: false });

            if (categoria && categoria !== 'Todas') {
                query = query.eq('categoria', categoria);
            }

            if (search.trim()) {
                query = query.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error al obtener plantillas PMO:', error);
                return { success: false, error, data: [] };
            }

            return { success: true, data: data || [] };
        } catch (err) {
            console.error('Excepción en getPlantillas:', err);
            return { success: false, error: err, data: [] };
        }
    },

    /**
     * Incrementar contador de descargas de una plantilla
     */
    async registrarDescargaPlantilla(id, currentCount = 0) {
        try {
            const { error } = await supabase
                .from('pmo_plantillas')
                .update({ descargas_count: (currentCount || 0) + 1 })
                .eq('id', id);

            if (error) console.error('Error incrementando descarga:', error);
        } catch (err) {
            console.error('Excepción en registrarDescargaPlantilla:', err);
        }
    },

    /**
     * Obtener URL pública o firmada de descarga desde el bucket 'pmo-templates'
     */
    getPlantillaDownloadUrl(archivoUrl) {
        if (!archivoUrl) return '#';
        if (archivoUrl.startsWith('http://') || archivoUrl.startsWith('https://')) {
            return archivoUrl;
        }

        // Si es un path relativo dentro del bucket pmo-templates
        const { data } = supabase.storage
            .from('pmo-templates')
            .getPublicUrl(archivoUrl);

        return data?.publicUrl || archivoUrl;
    }
};

export default pmoService;
