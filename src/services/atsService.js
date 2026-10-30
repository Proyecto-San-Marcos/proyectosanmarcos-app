import { supabase } from '../lib/supabaseClient';

/**
 * Convocatorias institucionales de muestra (Fallback)
 */
const MOCK_CONVOCATORIAS = [
    {
        id: 'conv-1',
        titulo: 'Convocatoria General de Nuevos Miembros PSM 2026-II',
        gerencia: 'Talento Humano',
        descripcion: 'Búsqueda de estudiantes sanmarquinos con vocación de servicio, liderazgo y ganas de aprender dirección de proyectos de alto impacto.',
        perfil_requerido: 'Estudiantes del 2do al 8vo ciclo de cualquier facultad de la UNMSM. Disponibilidad de 6 a 8 horas semanales.',
        vacantes: 25,
        fecha_inicio: '2026-09-01',
        fecha_cierre: '2026-11-15',
        estado: 'Abierta',
        requisitos: [
            'Ser estudiante activo de la UNMSM.',
            'Compromiso mínimo de un semestre académico.',
            'Interés en metodologías ágiles o gestión de proyectos.'
        ]
    },
    {
        id: 'conv-2',
        titulo: 'Coordinador(a) de PMO y Metodologías Ágiles',
        gerencia: 'PMO',
        descripcion: 'Liderar el acompañamiento de charters, cronogramas y tableros Kanban de los proyectos sociales en facultades.',
        perfil_requerido: 'Estudiantes de Ing. de Sistemas, Industrial, Administración o afines con nociones de PMBOK o Scrum.',
        vacantes: 4,
        fecha_inicio: '2026-09-15',
        fecha_cierre: '2026-11-05',
        estado: 'Abierta',
        requisitos: [
            'Conocimiento en herramientas como Notion, Jira o Trello.',
            'Capacidad de facilitación de reuniones de seguimiento.'
        ]
    },
    {
        id: 'conv-3',
        titulo: 'Creador(a) de Contenidos & Community Manager',
        gerencia: 'Comunicaciones',
        descripcion: 'Diseño de piezas para Instagram, TikTok y LinkedIn de PSM, redacción de copys e interacción con la comunidad.',
        perfil_requerido: 'Estudiantes de Comunicación Social, Arte, Publicidad o apasionados del diseño en Canva / Figma.',
        vacantes: 5,
        fecha_inicio: '2026-08-20',
        fecha_cierre: '2026-10-10',
        estado: 'En Evaluación',
        requisitos: [
            'Manejo intermedio de Canva, Figma o Illustrator.',
            'Excelente ortografía y creatividad narrativa.'
        ]
    }
];

/**
 * Postulantes en diferentes etapas del Pipeline (Fallback)
 */
const MOCK_POSTULANTES = [
    {
        id: 'post-101',
        convocatoria_id: 'conv-1',
        nombres: 'Camila Valeria',
        apellidos: 'Ríos Mendoza',
        correo: 'camila.rios@unmsm.edu.pe',
        telefono: '+51 987 112 334',
        facultad: 'Facultad de Ciencias Administrativas',
        carrera: 'Administración de Negocios Internacionales',
        ciclo: '4to Ciclo',
        cv_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        estado_etapa: 'Postulado',
        puntaje_evaluacion: 0,
        notas_entrevista: 'Perfil entusiasta, fue voluntaria en eventos de su facultad.',
        fecha_postulacion: '2026-10-20'
    },
    {
        id: 'post-102',
        convocatoria_id: 'conv-1',
        nombres: 'Sebastián Gonzalo',
        apellidos: 'Peralta Castro',
        correo: 'sebastian.peralta@unmsm.edu.pe',
        telefono: '+51 992 445 667',
        facultad: 'Facultad de Ingeniería de Sistemas e Informática',
        carrera: 'Ingeniería de Software',
        ciclo: '5to Ciclo',
        cv_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        estado_etapa: 'En Entrevista',
        puntaje_evaluacion: 4,
        notas_entrevista: 'Citado para el sábado a las 11:00 am vía Google Meet. Experiencia en React y desarrollo web.',
        fecha_postulacion: '2026-10-18'
    },
    {
        id: 'post-103',
        convocatoria_id: 'conv-1',
        nombres: 'Luciana Belén',
        apellidos: 'Flores Quispe',
        correo: 'luciana.flores@unmsm.edu.pe',
        telefono: '+51 981 778 990',
        facultad: 'Facultad de Letras y Ciencias Humanas',
        carrera: 'Comunicación Social',
        ciclo: '6to Ciclo',
        cv_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        estado_etapa: 'Aceptado',
        puntaje_evaluacion: 5,
        notas_entrevista: 'Excelente desenvolvimiento en entrevista. Asignada a Gerencia de Comunicaciones.',
        fecha_postulacion: '2026-10-12'
    },
    {
        id: 'post-104',
        convocatoria_id: 'conv-1',
        nombres: 'Jorge Luis',
        apellidos: 'Maldonado Vega',
        correo: 'jorge.maldonado@unmsm.edu.pe',
        telefono: '+51 976 554 433',
        facultad: 'Facultad de Ciencias Económicas',
        carrera: 'Economía',
        ciclo: '8vo Ciclo',
        cv_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        estado_etapa: 'Rechazado',
        puntaje_evaluacion: 2,
        notas_entrevista: 'Horarios incompatibles con las reuniones semanales de la organización.',
        fecha_postulacion: '2026-10-08'
    },
    {
        id: 'post-105',
        convocatoria_id: 'conv-2',
        nombres: 'Mateo Alejandro',
        apellidos: 'Zúñiga Prado',
        correo: 'mateo.zuniga@unmsm.edu.pe',
        telefono: '+51 984 332 211',
        facultad: 'Facultad de Ingeniería Industrial',
        carrera: 'Ingeniería Industrial',
        ciclo: '7mo Ciclo',
        cv_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        estado_etapa: 'En Entrevista',
        puntaje_evaluacion: 4,
        notas_entrevista: 'Maneja conceptos clave de EDT y matriz de riesgos. Entrevista programada para el lunes.',
        fecha_postulacion: '2026-10-15'
    }
];

export const atsService = {
    /**
     * Obtener listado de convocatorias de reclutamiento
     */
    async getConvocatorias({ estado = '', gerencia = '' } = {}) {
        try {
            let query = supabase
                .from('ats_convocatorias')
                .select('*')
                .order('created_at', { ascending: false });

            if (estado && estado !== 'Todas') {
                query = query.eq('estado', estado);
            }

            if (gerencia && gerencia !== 'Todas') {
                query = query.eq('gerencia', gerencia);
            }

            const { data, error } = await query;

            if (error || !data || data.length === 0) {
                let filtered = [...MOCK_CONVOCATORIAS];
                if (estado && estado !== 'Todas') {
                    filtered = filtered.filter(c => c.estado === estado);
                }
                if (gerencia && gerencia !== 'Todas') {
                    filtered = filtered.filter(c => c.gerencia === gerencia);
                }
                return { success: true, data: filtered, isFallback: true };
            }

            return { success: true, data, isFallback: false };
        } catch (err) {
            console.warn('Excepción en getConvocatorias:', err);
            return { success: true, data: MOCK_CONVOCATORIAS, isFallback: true };
        }
    },

    /**
     * Crear una nueva convocatoria de reclutamiento
     */
    async crearConvocatoria(payload) {
        try {
            const { data, error } = await supabase
                .from('ats_convocatorias')
                .insert([payload])
                .select()
                .single();

            if (error) {
                console.warn('Aviso en crearConvocatoria a BD:', error.message);
                return {
                    success: true,
                    data: {
                        id: `conv-local-${Date.now()}`,
                        ...payload
                    },
                    isLocal: true
                };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Error en crearConvocatoria:', err);
            return {
                success: true,
                data: {
                    id: `conv-local-${Date.now()}`,
                    ...payload
                },
                isLocal: true
            };
        }
    },

    /**
     * Obtener postulantes de una convocatoria o de todo el sistema
     */
    async getPostulantes({ convocatoriaId = null, etapa = '', search = '' } = {}) {
        try {
            let query = supabase
                .from('ats_postulantes')
                .select(`
                    *,
                    convocatoria:convocatoria_id (
                        id,
                        titulo,
                        gerencia
                    )
                `)
                .order('fecha_postulacion', { ascending: false });

            if (convocatoriaId && convocatoriaId !== 'Todas') {
                query = query.eq('convocatoria_id', convocatoriaId);
            }

            if (etapa && etapa !== 'Todas') {
                query = query.eq('estado_etapa', etapa);
            }

            const { data, error } = await query;

            if (error || !data || data.length === 0) {
                let filtered = [...MOCK_POSTULANTES];
                if (convocatoriaId && convocatoriaId !== 'Todas') {
                    filtered = filtered.filter(p => p.convocatoria_id === convocatoriaId);
                }
                if (etapa && etapa !== 'Todas') {
                    filtered = filtered.filter(p => p.estado_etapa === etapa);
                }
                if (search.trim()) {
                    const q = search.toLowerCase();
                    filtered = filtered.filter(p =>
                        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) ||
                        p.carrera.toLowerCase().includes(q) ||
                        p.correo.toLowerCase().includes(q)
                    );
                }
                return { success: true, data: filtered, isFallback: true };
            }

            return { success: true, data, isFallback: false };
        } catch (err) {
            console.warn('Excepción en getPostulantes:', err);
            return { success: true, data: MOCK_POSTULANTES, isFallback: true };
        }
    },

    /**
     * Subir CV en formato PDF a storage bucket ats-cvs
     */
    async uploadCv(file) {
        try {
            if (!file) return { success: false, error: 'Archivo no proporcionado' };

            const fileExt = file.name.split('.').pop();
            const fileName = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
            const filePath = `postulantes/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('ats-cvs')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) {
                console.warn('Aviso al subir CV a storage:', uploadError.message);
                return {
                    success: true,
                    publicUrl: URL.createObjectURL(file),
                    fileName: file.name
                };
            }

            const { data: urlData } = supabase.storage
                .from('ats-cvs')
                .getPublicUrl(filePath);

            return {
                success: true,
                publicUrl: urlData?.publicUrl || '',
                fileName: file.name
            };
        } catch (err) {
            console.error('Error en uploadCv:', err);
            return {
                success: true,
                publicUrl: URL.createObjectURL(file),
                fileName: file.name
            };
        }
    },

    /**
     * Registrar postulación de un aspirante a una convocatoria
     */
    async registrarPostulacion(postulanteData, cvFile = null) {
        try {
            let cv_url = postulanteData.cv_url || null;

            if (cvFile) {
                const cvRes = await this.uploadCv(cvFile);
                if (cvRes.success) {
                    cv_url = cvRes.publicUrl;
                }
            }

            const payload = {
                ...postulanteData,
                cv_url,
                estado_etapa: 'Postulado',
                puntaje_evaluacion: 0,
                fecha_postulacion: new Date().toISOString().split('T')[0]
            };

            const { data, error } = await supabase
                .from('ats_postulantes')
                .insert([payload])
                .select()
                .single();

            if (error) {
                console.warn('Aviso en registrarPostulacion a BD:', error.message);
                return {
                    success: true,
                    data: {
                        id: `post-local-${Date.now()}`,
                        ...payload
                    },
                    isLocal: true
                };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Error en registrarPostulacion:', err);
            return {
                success: true,
                data: {
                    id: `post-local-${Date.now()}`,
                    ...postulanteData,
                    estado_etapa: 'Postulado',
                    fecha_postulacion: new Date().toISOString().split('T')[0]
                },
                isLocal: true
            };
        }
    },

    /**
     * Cambiar de etapa al postulante en el pipeline (Postulado -> En Entrevista -> Aceptado / Rechazado)
     */
    async actualizarEtapaPostulante(postulanteId, nuevaEtapa, notas = null, puntaje = null) {
        try {
            const updates = { estado_etapa: nuevaEtapa };
            if (notas !== null) updates.notas_entrevista = notas;
            if (puntaje !== null) updates.puntaje_evaluacion = puntaje;

            const { data, error } = await supabase
                .from('ats_postulantes')
                .update(updates)
                .eq('id', postulanteId)
                .select()
                .single();

            if (error) {
                console.warn('Aviso al actualizar etapa en BD:', error.message);
                return { success: true, data: { id: postulanteId, ...updates }, isLocal: true };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Error en actualizarEtapaPostulante:', err);
            return { success: true, data: { id: postulanteId, estado_etapa: nuevaEtapa }, isLocal: true };
        }
    },

    /**
     * Calcular métricas del proceso de selección ATS
     */
    getMetricasATS(postulantesList = []) {
        const list = postulantesList || [];
        return {
            total: list.length,
            postulados: list.filter(p => p.estado_etapa === 'Postulado').length,
            enEntrevista: list.filter(p => p.estado_etapa === 'En Entrevista').length,
            aceptados: list.filter(p => p.estado_etapa === 'Aceptado').length,
            rechazados: list.filter(p => p.estado_etapa === 'Rechazado').length
        };
    }
};

export default atsService;
