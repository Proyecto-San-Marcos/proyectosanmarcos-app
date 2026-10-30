import { supabase } from '../lib/supabaseClient';

/**
 * Servicio para el registro y aprobación de horas de voluntariado en Talento Humano
 */
export const horasService = {
    /**
     * Obtener historial de horas de un miembro específico
     * @param {number|string} miembroId ID del miembro en BD_TODOS
     */
    async getMisHoras(miembroId) {
        try {
            if (!miembroId) {
                return { success: true, data: [] };
            }

            const { data, error } = await supabase
                .from('registro_horas')
                .select(`
                    *,
                    proyecto:proyecto_id (
                        id,
                        nombre,
                        codigo_proyecto
                    )
                `)
                .eq('miembro_id', miembroId)
                .order('fecha_actividad', { ascending: false });

            if (error) {
                console.error('Error al obtener mis horas:', error);
                return { success: false, error, data: [] };
            }

            return { success: true, data: data || [] };
        } catch (err) {
            console.error('Excepción en getMisHoras:', err);
            return { success: false, error: err, data: [] };
        }
    },

    /**
     * Registrar una nueva marcación de horas
     * @param {Object} data Datos de la marcación (miembro_id, proyecto_id, fecha_actividad, horas, descripcion_tarea, enlace_evidencia)
     */
    async registrarHoras(data) {
        try {
            const { miembro_id, proyecto_id, fecha_actividad, horas, descripcion_tarea, enlace_evidencia } = data;

            const payload = {
                miembro_id,
                proyecto_id: proyecto_id || null,
                fecha_actividad,
                horas: parseFloat(horas),
                descripcion_tarea,
                enlace_evidencia: enlace_evidencia || null,
                estado: 'Pendiente'
            };

            const { data: record, error } = await supabase
                .from('registro_horas')
                .insert([payload])
                .select()
                .single();

            if (error) {
                console.error('Error al registrar horas:', error);
                return { success: false, error };
            }

            return { success: true, data: record };
        } catch (err) {
            console.error('Excepción en registrarHoras:', err);
            return { success: false, error: err };
        }
    },

    /**
     * Obtener todas las horas pendientes para administradores / Talento Humano
     */
    async getHorasPendientes() {
        try {
            const { data, error } = await supabase
                .from('registro_horas')
                .select(`
                    *,
                    miembro:miembro_id (
                        id,
                        codigo_universitario,
                        nombres,
                        apellidos,
                        gerencia_actual,
                        cargo
                    ),
                    proyecto:proyecto_id (
                        id,
                        nombre,
                        codigo_proyecto
                    )
                `)
                .eq('estado', 'Pendiente')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error al obtener horas pendientes:', error);
                return { success: false, error, data: [] };
            }

            return { success: true, data: data || [] };
        } catch (err) {
            console.error('Excepción en getHorasPendientes:', err);
            return { success: false, error: err, data: [] };
        }
    },

    /**
     * Aprobar o rechazar marcaciones de horas (Para coordinadores / TH)
     * @param {string} id ID del registro de horas
     * @param {string} estado 'Aprobado' o 'Rechazado'
     * @param {number|string} revisadoPor ID del revisor
     * @param {string} comentario Opcional
     */
    async aprobarRechazarHoras(id, estado, revisadoPor = null, comentario = '') {
        try {
            const updates = {
                estado,
                revisado_por: revisadoPor,
                comentario_revision: comentario || null
            };

            const { data, error } = await supabase
                .from('registro_horas')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error al actualizar estado de horas:', error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Excepción en aprobarRechazarHoras:', err);
            return { success: false, error: err };
        }
    }
};

export default horasService;
