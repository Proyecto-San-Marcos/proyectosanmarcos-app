import { supabase } from '../lib/supabaseClient';

/**
 * Servicio para Finanzas, Inventario de Recursos, Solicitudes y Rendiciones de Gastos
 */
export const finanzasService = {
    /**
     * Obtener lista de bienes y licencias del inventario
     * @param {Object} options Filtro por tipo ('Físico', 'Digital') o búsqueda
     */
    async getInventario({ tipo = '', search = '' } = {}) {
        try {
            let query = supabase
                .from('inventario_recursos')
                .select('*')
                .order('nombre_recurso', { ascending: true });

            if (tipo && tipo !== 'Todos') {
                query = query.eq('tipo', tipo);
            }

            if (search.trim()) {
                query = query.or(`nombre_recurso.ilike.%${search}%,responsable_custodia.ilike.%${search}%,notas.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error al obtener inventario:', error);
                return { success: false, error, data: [] };
            }

            return { success: true, data: data || [] };
        } catch (err) {
            console.error('Excepción en getInventario:', err);
            return { success: false, error: err, data: [] };
        }
    },

    /**
     * Registrar pedido de aula o recurso
     * @param {Object} data Datos de la solicitud
     */
    async crearSolicitudRecurso(data) {
        try {
            const {
                solicitante_id,
                proyecto_id,
                recurso_id,
                espacio_requerido,
                fecha_uso_inicio,
                fecha_uso_fin,
                justificacion
            } = data;

            const payload = {
                solicitante_id,
                proyecto_id: proyecto_id || null,
                recurso_id: recurso_id || null,
                espacio_requerido: espacio_requerido || null,
                fecha_uso_inicio,
                fecha_uso_fin,
                justificacion,
                estado: 'Pendiente'
            };

            const { data: record, error } = await supabase
                .from('solicitudes_recursos')
                .insert([payload])
                .select()
                .single();

            if (error) {
                console.error('Error al crear solicitud de recurso:', error);
                return { success: false, error };
            }

            return { success: true, data: record };
        } catch (err) {
            console.error('Excepción en crearSolicitudRecurso:', err);
            return { success: false, error: err };
        }
    },

    /**
     * Obtener solicitudes de recursos realizadas por un usuario o todas (para administradores)
     */
    async getSolicitudesRecursos({ solicitanteId = null } = {}) {
        try {
            let query = supabase
                .from('solicitudes_recursos')
                .select(`
                    *,
                    recurso:recurso_id (
                        id,
                        nombre_recurso,
                        tipo
                    ),
                    proyecto:proyecto_id (
                        id,
                        nombre,
                        codigo_proyecto
                    ),
                    solicitante:solicitante_id (
                        id,
                        nombres,
                        apellidos,
                        correo_institucional
                    )
                `)
                .order('created_at', { ascending: false });

            if (solicitanteId) {
                query = query.eq('solicitante_id', solicitanteId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error al obtener solicitudes de recursos:', error);
                return { success: false, error, data: [] };
            }

            return { success: true, data: data || [] };
        } catch (err) {
            console.error('Excepción en getSolicitudesRecursos:', err);
            return { success: false, error: err, data: [] };
        }
    },

    /**
     * Subir comprobante a Supabase Storage y guardar registro en rendiciones_gastos
     * @param {Object} data Datos de la rendición
     * @param {File} archivo Archivo de boleta, factura o recibo
     */
    async crearRendicionGasto(data, archivo) {
        try {
            let comprobanteArchivoUrl = '';

            if (archivo) {
                const fileExt = archivo.name.split('.').pop();
                const sanitizedName = archivo.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const filePath = `${Date.now()}_${sanitizedName}`;

                // Subir al bucket comprobantes-finanzas
                const { error: uploadError } = await supabase.storage
                    .from('comprobantes-finanzas')
                    .upload(filePath, archivo, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Error al subir archivo a comprobantes-finanzas:', uploadError);
                    return { success: false, error: uploadError };
                }

                // Generar URL pública o identificador
                const { data: urlData } = supabase.storage
                    .from('comprobantes-finanzas')
                    .getPublicUrl(filePath);

                comprobanteArchivoUrl = urlData?.publicUrl || filePath;
            }

            const payload = {
                proyecto_id: data.proyecto_id || null,
                responsable_id: data.responsable_id || null,
                fecha_gasto: data.fecha_gasto,
                tipo_comprobante: data.tipo_comprobante || 'Boleta',
                numero_comprobante: data.numero_comprobante || null,
                monto: parseFloat(data.monto),
                proveedor: data.proveedor || '',
                descripcion_concepto: data.descripcion_concepto,
                comprobante_archivo_url: comprobanteArchivoUrl,
                estado_rendicion: 'Pendiente'
            };

            const { data: record, error } = await supabase
                .from('rendiciones_gastos')
                .insert([payload])
                .select()
                .single();

            if (error) {
                console.error('Error al registrar rendición de gasto:', error);
                return { success: false, error };
            }

            return { success: true, data: record };
        } catch (err) {
            console.error('Excepción en crearRendicionGasto:', err);
            return { success: false, error: err };
        }
    },

    /**
     * Obtener listado de rendiciones de gastos registradas
     */
    async getRendicionesGastos({ proyectoId = null, responsableId = null } = {}) {
        try {
            let query = supabase
                .from('rendiciones_gastos')
                .select(`
                    *,
                    proyecto:proyecto_id (
                        id,
                        nombre,
                        codigo_proyecto
                    ),
                    responsable:responsable_id (
                        id,
                        nombres,
                        apellidos,
                        correo_institucional
                    )
                `)
                .order('fecha_gasto', { ascending: false });

            if (proyectoId) {
                query = query.eq('proyecto_id', proyectoId);
            }

            if (responsableId) {
                query = query.eq('responsable_id', responsableId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error al obtener rendiciones de gastos:', error);
                return { success: false, error, data: [] };
            }

            return { success: true, data: data || [] };
        } catch (err) {
            console.error('Excepción en getRendicionesGastos:', err);
            return { success: false, error: err, data: [] };
        }
    }
};

export default finanzasService;
