import { supabase } from '../lib/supabaseClient';

/**
 * Directorio de contactos de muestra para el CRM de RRPP (Fallback)
 */
const MOCK_CONTACTOS = [
    {
        id: 'c-001',
        nombre_completo: 'Dr. José Carlos Niño de Guzmán',
        organizacion: 'Vicerrectorado de Investigación y Posgrado (VRIP UNMSM)',
        cargo: 'Director General de Innovación',
        categoria: 'Autoridad UNMSM',
        correo: 'vrip.innovacion@unmsm.edu.pe',
        telefono: '+51 987 654 321',
        estado_relacion: 'Aliado Activo',
        notas_seguimiento: 'Aprobó uso de auditorio central de la Facultad de Sistemas para la Jornada Anual PSM. Favorable a firmar convenio de apoyo.',
        created_at: '2026-08-10T10:00:00Z'
    },
    {
        id: 'c-002',
        nombre_completo: 'Lic. Mariana Salcedo Rivera',
        organizacion: 'Interbank (Área de Sostenibilidad y Comunidad)',
        cargo: 'Gerente de Alianzas Universitarias',
        categoria: 'Empresa Auspiciadora',
        correo: 'msalcedo@intercorp.com.pe',
        telefono: '+51 991 223 344',
        estado_relacion: 'En Negociación',
        notas_seguimiento: 'Reunión sostenida el 15 de Octubre. Revisando propuesta de patrocinio para kits y coffee break del Hackathon PSM 2026.',
        created_at: '2026-09-02T14:30:00Z'
    },
    {
        id: 'c-003',
        nombre_completo: 'Ing. Renzo Farfán Pacheco, PMP',
        organizacion: 'PMI Lima Chapter',
        cargo: 'Vicepresidente de Membresías y Educación',
        categoria: 'Ponente',
        correo: 'rfarfan@pmi-lima.org',
        telefono: '+51 980 112 233',
        estado_relacion: 'Aliado Activo',
        notas_seguimiento: 'Confirmó su participación como ponente principal en el Taller de Dirección de Proyectos. Enviar carta de agradecimiento oficial.',
        created_at: '2026-09-18T11:15:00Z'
    },
    {
        id: 'c-004',
        nombre_completo: 'Ing. Fiorella Benavides',
        organizacion: 'Google Developer Student Clubs (GDSC UNMSM)',
        cargo: 'Lead Organizacional',
        categoria: 'Comunidad Aliada',
        correo: 'gdsc.unmsm@gmail.com',
        telefono: '+51 977 445 566',
        estado_relacion: 'Aliado Activo',
        notas_seguimiento: 'Coorganización de talleres de herramientas de desarrollo colaborativo y Git para el voluntariado.',
        created_at: '2026-09-25T16:00:00Z'
    },
    {
        id: 'c-005',
        nombre_completo: 'Dra. Carmen Rosa Valdivia',
        organizacion: 'Decanato Facultad de Ciencias Administrativas UNMSM',
        cargo: 'Decana de Facultad',
        categoria: 'Autoridad UNMSM',
        correo: 'decanato.fca@unmsm.edu.pe',
        telefono: '+51 999 888 777',
        estado_relacion: 'Contacto Inicial',
        notas_seguimiento: 'Se envió carta de presentación institucional para solicitar difusión en murales y canales oficiales de la facultad.',
        created_at: '2026-10-01T09:20:00Z'
    }
];

/**
 * Modelos de cartas institucionales estandarizadas de PSM
 */
const MODELOS_CARTAS = [
    {
        id: 'carta-1',
        titulo: 'Carta de Invitación a Ponente / Tallerista Magistral',
        categoria: 'Ponentes',
        descripcion: 'Formato protocolar con membrete oficial para invitar a expertos y profesionales a dictar capacitaciones o conferencias.',
        cuerpo: `Ciudad Universitaria, Lima, [FECHA]

Señor(a):
[NOMBRE_CONTACTO]
[CARGO_CONTACTO] - [ORGANIZACION]
Presente.-

ASUNTO: Invitación formal en calidad de Ponente Magistral en el evento "[NOMBRE_EVENTO]"

De nuestra especial consideración:

Es grato saludarte cordialmente a nombre de la Asociación Estudiantil PROYECTOS SAN MARCOS (PSM) de la Universidad Nacional Mayor de San Marcos, organización dedicada a la formación en dirección de proyectos, metodologías de innovación y ejecución de iniciativas de alto impacto social.

Conociendo su amplia trayectoria y destacado liderazgo profesional en el área de [ESPECIALIDAD], nos honraría contar con su participación como expositor principal en la sesión programada para el día [FECHA_EVENTO] a las [HORA_EVENTO], de manera [MODALIDAD: Presencial en UNMSM / Virtual vía Meet].

Agradeciendo de antemano su gentil atención y disposición en beneficio de la comunidad sanmarquina, quedamos atentos a su confirmación.

Atentamente,

JUNTA DIRECTIVA - PROYECTOS SAN MARCOS
Universidad Nacional Mayor de San Marcos`
    },
    {
        id: 'carta-2',
        titulo: 'Solicitud Formal de Patrocinio y Auspicio Corporativo',
        categoria: 'Empresas',
        descripcion: 'Presentación formal de proyecto y solicitud de paquetes de auspicio económico, merchandising o refrigerios.',
        cuerpo: `Ciudad Universitaria, Lima, [FECHA]

Señores:
[ORGANIZACION]
Atención: [NOMBRE_CONTACTO] ([CARGO_CONTACTO])
Presente.-

ASUNTO: Propuesta de Auspicio y Alianza Estratégica para el proyecto "[NOMBRE_PROYECTO]"

De nuestra mayor consideración:

Reciban un cordial saludo a nombre de PROYECTOS SAN MARCOS (PSM) de la Universidad Nacional Mayor de San Marcos (UNMSM).

En esta oportunidad nos dirigimos a su prestigiosa institución para presentar el proyecto "[NOMBRE_PROYECTO]", que impactará directamente a más de [NUMERO_BENEFICIARIOS] estudiantes y ciudadanos, promoviendo el desarrollo de competencias tecnológicas y de gestión.

En virtud de su compromiso con la educación y la responsabilidad social corporativa, nos complace invitarlos a formar parte como AUSPICIADOR OFICIAL en la categoría [CATEGORIA_PATROCINIO: Platino / Oro / Plata], brindando a su marca presencia destacada en todas nuestras piezas gráficas, redes sociales y menciones en sala.

Adjuntamos el Dossier de Auspicios con los beneficios recíprocos y quedamos a su disposición para coordinar una reunión de presentación.

Atentamente,

GERENCIA DE COMUNICACIONES & RRPP
PROYECTOS SAN MARCOS - UNMSM`
    },
    {
        id: 'carta-3',
        titulo: 'Carta de Agradecimiento y Reconocimiento Institucional',
        categoria: 'Reconocimiento',
        descripcion: 'Carta de cierre tras culminación de eventos para fortalecer lazos a largo plazo con aliados.',
        cuerpo: `Ciudad Universitaria, Lima, [FECHA]

Estimado(a):
[NOMBRE_CONTACTO]
[CARGO_CONTACTO] - [ORGANIZACION]
Presente.-

ASUNTO: Agradecimiento y Reconocimiento por participación en "[NOMBRE_EVENTO]"

De nuestra mayor estima:

A través de la presente, la Junta Directiva y la Gerencia de Comunicaciones de PROYECTOS SAN MARCOS (PSM) de la UNMSM expresan su más sincero agradecimiento por su invaluable contribución durante la realización de "[NOMBRE_EVENTO]".

Su experiencia, conocimiento y vocación de servicio fueron fundamentales para el éxito del programa y enriquecieron notablemente el aprendizaje de los participantes.

Hacemos propicia la oportunidad para reiterarle nuestros sentimientos de especial estima y desearle los mayores éxitos en sus actividades.

Cordialmente,

PRESIDENCIA GENERAL
PROYECTOS SAN MARCOS - UNMSM`
    },
    {
        id: 'carta-4',
        titulo: 'Propuesta de Convenio y Cooperación Estudiantil',
        categoria: 'Comunidades',
        descripcion: 'Marco para alianzas interfacultativas, capítulos estudiantiles y organizaciones hermanas.',
        cuerpo: `Ciudad Universitaria, Lima, [FECHA]

A la Junta Directiva de:
[ORGANIZACION]
Atención: [NOMBRE_CONTACTO]
Presente.-

ASUNTO: Propuesta de Colaboración Mutua y Alianza Interinstitucional

Estimados compañeros:

Por medio de la presente, PROYECTOS SAN MARCOS (PSM) expresa su interés en estrechar lazos de colaboración con [ORGANIZACION] para articular esfuerzos conjuntos en el desarrollo de talleres, difusión cruzada de eventos y proyectos interdisciplinarios en beneficio de la comunidad universitaria de la UNMSM.

Proponemos una agenda de trabajo conjunta que permita maximizar el alcance de nuestras iniciativas y potenciar las capacidades de nuestros miembros.

Quedamos a su disposición para coordinar una sesión de planificación.

Fraternalmente,

GERENCIA DE COMUNICACIONES Y RELACIONES PÚBLICAS
PROYECTOS SAN MARCOS - UNMSM`
    }
];

export const rrppService = {
    /**
     * Obtener listado de contactos del CRM
     */
    async getContactos({ categoria = '', estadoRelacion = '', search = '' } = {}) {
        try {
            let query = supabase
                .from('rrpp_contactos')
                .select('*')
                .order('created_at', { ascending: false });

            if (categoria && categoria !== 'Todas') {
                query = query.eq('categoria', categoria);
            }

            if (estadoRelacion && estadoRelacion !== 'Todos') {
                query = query.eq('estado_relacion', estadoRelacion);
            }

            if (search.trim()) {
                query = query.or(`nombre_completo.ilike.%${search}%,organizacion.ilike.%${search}%,cargo.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error || !data || data.length === 0) {
                let filtered = [...MOCK_CONTACTOS];
                if (categoria && categoria !== 'Todas') {
                    filtered = filtered.filter(c => c.categoria === categoria);
                }
                if (estadoRelacion && estadoRelacion !== 'Todos') {
                    filtered = filtered.filter(c => c.estado_relacion === estadoRelacion);
                }
                if (search.trim()) {
                    const q = search.toLowerCase();
                    filtered = filtered.filter(c =>
                        c.nombre_completo.toLowerCase().includes(q) ||
                        c.organizacion.toLowerCase().includes(q) ||
                        c.cargo.toLowerCase().includes(q)
                    );
                }
                return { success: true, data: filtered, isFallback: true };
            }

            return { success: true, data, isFallback: false };
        } catch (err) {
            console.warn('Excepción en getContactos, usando fallback:', err);
            return { success: true, data: MOCK_CONTACTOS, isFallback: true };
        }
    },

    /**
     * Registrar un nuevo contacto en el CRM
     */
    async crearContacto(contactoData) {
        try {
            const { data, error } = await supabase
                .from('rrpp_contactos')
                .insert([contactoData])
                .select()
                .single();

            if (error) {
                console.warn('Aviso al insertar contacto en BD:', error.message);
                return {
                    success: true,
                    data: {
                        id: `c-local-${Date.now()}`,
                        ...contactoData,
                        created_at: new Date().toISOString()
                    },
                    isLocal: true
                };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Error en crearContacto:', err);
            return {
                success: true,
                data: {
                    id: `c-local-${Date.now()}`,
                    ...contactoData,
                    created_at: new Date().toISOString()
                },
                isLocal: true
            };
        }
    },

    /**
     * Actualizar estado o notas de un contacto
     */
    async actualizarContacto(id, updates) {
        try {
            const { data, error } = await supabase
                .from('rrpp_contactos')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.warn('Aviso al actualizar contacto en BD:', error.message);
                return { success: true, data: { id, ...updates }, isLocal: true };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Error en actualizarContacto:', err);
            return { success: true, data: { id, ...updates }, isLocal: true };
        }
    },

    /**
     * Eliminar contacto del CRM
     */
    async eliminarContacto(id) {
        try {
            const { error } = await supabase
                .from('rrpp_contactos')
                .delete()
                .eq('id', id);

            if (error) {
                console.warn('Aviso al eliminar contacto en BD:', error.message);
            }
            return { success: true };
        } catch (err) {
            console.error('Error en eliminarContacto:', err);
            return { success: true };
        }
    },

    /**
     * Obtener métricas y KPIs del directorio de RRPP
     */
    async getEstadisticas(contactosList = null) {
        const list = contactosList || MOCK_CONTACTOS;
        return {
            total: list.length,
            aliadosActivos: list.filter(c => c.estado_relacion === 'Aliado Activo').length,
            enNegociacion: list.filter(c => c.estado_relacion === 'En Negociación').length,
            ponentes: list.filter(c => c.categoria === 'Ponente').length,
            auspiciadores: list.filter(c => c.categoria === 'Empresa Auspiciadora').length,
            autoridades: list.filter(c => c.categoria === 'Autoridad UNMSM').length
        };
    },

    /**
     * Obtener catálogo de modelos de cartas institucionales
     */
    getModelosCartas() {
        return MODELOS_CARTAS;
    }
};

export default rrppService;
