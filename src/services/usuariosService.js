import { supabase } from '../lib/supabaseClient';

/**
 * Servicio para consultar y administrar el padrón maestro de miembros en BD_TODOS
 */
export const usuariosService = {
    /**
     * Obtiene el listado de miembros con filtros opcionales de búsqueda y gerencia
     * @param {Object} options Opciones de búsqueda
     * @param {string} options.query Texto a buscar en nombres, apellidos o código
     * @param {string} options.gerencia Filtrar por gerencia específica
     * @param {number} options.limit Límite de miembros a retornar
     */
    async getMiembros({ query = '', gerencia = '', limit = 100 } = {}) {
        try {
            let request = supabase
                .from('BD_TODOS')
                .select('*')
                .order('apellidos', { ascending: true })
                .limit(limit);

            if (gerencia && gerencia !== 'Todas') {
                request = request.ilike('gerencia_actual', `%${gerencia}%`);
            }

            const { data, error } = await request;

            if (error) {
                console.error('Error al consultar miembros en BD_TODOS:', error);
                return { success: false, error, data: [] };
            }

            let filteredData = data || [];

            // Filtrado local en caso de búsqueda por texto compuesta (nombres + apellidos o código)
            if (query.trim()) {
                const term = query.trim().toLowerCase();
                filteredData = filteredData.filter(m => {
                    const fullName = `${m.nombres || ''} ${m.apellidos || ''}`.toLowerCase();
                    const codigo = (m.codigo_universitario || '').toString().toLowerCase();
                    const correoInst = (m.correo_institucional || '').toLowerCase();
                    const correoPers = (m.correo_personal || '').toLowerCase();
                    const cargo = (m.cargo || '').toLowerCase();

                    return (
                        fullName.includes(term) ||
                        codigo.includes(term) ||
                        correoInst.includes(term) ||
                        correoPers.includes(term) ||
                        cargo.includes(term)
                    );
                });
            }

            return { success: true, data: filteredData };
        } catch (err) {
            console.error('Excepción al consultar miembros:', err);
            return { success: false, error: err, data: [] };
        }
    },

    /**
     * Obtiene los datos detallados de un miembro por su código universitario o ID
     */
    async getMiembroByCodigo(codigoUniversitario) {
        try {
            const { data, error } = await supabase
                .from('BD_TODOS')
                .select('*')
                .eq('codigo_universitario', codigoUniversitario)
                .maybeSingle();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error('Error al buscar miembro por código:', err);
            return { success: false, error: err, data: null };
        }
    },

    /**
     * Actualizar estado o datos de un miembro en BD_TODOS
     */
    async updateMiembro(id, updates) {
        try {
            const { data, error } = await supabase
                .from('BD_TODOS')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error('Error al actualizar miembro en BD_TODOS:', err);
            return { success: false, error: err };
        }
    }
};

export default usuariosService;
