import { supabase } from '../lib/supabaseClient';

/**
 * Servicio para obtener y gestionar comunicados del muro de la intranet
 */
export const comunicadosService = {
    /**
     * Obtiene los comunicados más recientes ordenados por fecha de creación descendente
     * @param {Object} options Opciones de paginación y filtrado
     * @param {number} options.limit Cantidad máxima de registros
     * @param {boolean} options.soloDestacados Filtrar solo destacados
     */
    async getComunicados({ limit = 10, soloDestacados = false } = {}) {
        try {
            let query = supabase
                .from('comunicados')
                .select('*')
                .order('es_destacado', { ascending: false })
                .order('created_at', { ascending: false });

            if (soloDestacados) {
                query = query.eq('es_destacado', true);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error al obtener comunicados:', error);
                return { success: false, error, data: [] };
            }

            return { success: true, data: data || [] };
        } catch (err) {
            console.error('Excepción al consultar comunicados:', err);
            return { success: false, error: err, data: [] };
        }
    },

    /**
     * Obtiene los próximos eventos del calendario institucional
     * @param {number} limit Límite de eventos a retornar
     */
    async getEventosInstitucionales({ limit = 5 } = {}) {
        try {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('eventos_institucionales')
                .select('*')
                .gte('fecha_inicio', now)
                .order('fecha_inicio', { ascending: true })
                .limit(limit);

            if (error) {
                // Si la tabla no tiene fechas futuras, traer los últimos registrados como fallback
                console.warn('Aviso al filtrar eventos futuros, trayendo eventos generales:', error.message);
                const fallback = await supabase
                    .from('eventos_institucionales')
                    .select('*')
                    .order('fecha_inicio', { ascending: false })
                    .limit(limit);

                if (fallback.error) {
                    return { success: false, error: fallback.error, data: [] };
                }
                return { success: true, data: fallback.data || [] };
            }

            // Si no hay futuros, traer los registrados
            if (!data || data.length === 0) {
                const fallback = await supabase
                    .from('eventos_institucionales')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(limit);
                return { success: true, data: fallback.data || [] };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Excepción al consultar eventos:', err);
            return { success: false, error: err, data: [] };
        }
    },

    /**
     * Crear un nuevo comunicado oficial
     */
    async crearComunicado(comunicado) {
        try {
            const { data, error } = await supabase
                .from('comunicados')
                .insert([comunicado])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error('Error al crear comunicado:', err);
            return { success: false, error: err };
        }
    }
};

export default comunicadosService;
