import { supabase } from '../lib/supabaseClient';

/**
 * Cursos y talleres de muestra oficiales de PSM UNMSM (Fallback interactivo)
 */
const MOCK_CURSOS = [
    {
        id: 'c1111111-1111-1111-1111-111111111111',
        titulo: 'Fundamentos de Gestión de Proyectos con Enfoque PMBOK 7 y Ágil',
        descripcion: 'Aprende los principios del estándar PMBOK 7 aplicados a iniciativas sociales y universitarias: acta de constitución, EDT, matriz RACI y gestión de riesgos.',
        categoria: 'PMO & Proyectos',
        nivel: 'Intermedio',
        instructor: 'Ing. Carlos Mendoza (PMP, Asesor PMO PSM)',
        duracion_estimada: '6 horas (4 módulos)',
        banner_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
        estado: 'Activo',
        modulos_count: 4,
        horas_acreditables: 10
    },
    {
        id: 'c2222222-2222-2222-2222-222222222222',
        titulo: 'Scrum y Marcos Ágiles para Proyectos Universitarios de Alto Impacto',
        descripcion: 'Cómo liderar sprints, ceremonias de Scrum (Planning, Daily, Review, Retro) y utilizar tableros Kanban en proyectos de voluntariado sanmarquino.',
        categoria: 'Metodologías Ágiles',
        nivel: 'Básico',
        instructor: 'Lic. Andrea Palacios (Scrum Master Certified)',
        duracion_estimada: '4 horas (3 módulos)',
        banner_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        estado: 'Activo',
        modulos_count: 3,
        horas_acreditables: 8
    },
    {
        id: 'c3333333-3333-3333-3333-333333333333',
        titulo: 'Liderazgo Adaptativo, Inteligencia Emocional y Trabajo en Equipo',
        descripcion: 'Desarrollo de habilidades directivas, resolución de conflictos, escucha activa y motivación de equipos multidisciplinarios en el voluntariado.',
        categoria: 'Liderazgo & Equipos',
        nivel: 'Básico',
        instructor: 'Psic. Diego Huamán (Consultor de Talento)',
        duracion_estimada: '5 horas (3 módulos)',
        banner_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
        estado: 'Activo',
        modulos_count: 3,
        horas_acreditables: 8
    },
    {
        id: 'c4444444-4444-4444-4444-444444444444',
        titulo: 'Herramientas Digitales de Productividad: Notion, Figma y Trello para PMO',
        descripcion: 'Dominio de software colaborativo para documentación de proyectos, wireframing de ideas y trazabilidad de entregables de equipo.',
        categoria: 'Herramientas & TI',
        nivel: 'Intermedio',
        instructor: 'Equipo de Tecnología & Optimización PSM',
        duracion_estimada: '3.5 horas (3 módulos)',
        banner_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        estado: 'Activo',
        modulos_count: 3,
        horas_acreditables: 6
    }
];

const MOCK_MODULOS = {
    'c1111111-1111-1111-1111-111111111111': [
        {
            id: 'm1-1',
            curso_id: 'c1111111-1111-1111-1111-111111111111',
            orden: 1,
            titulo: 'Módulo 1: Introducción a la Dirección de Proyectos y Ciclo de Vida',
            descripcion: 'Diferencia entre operaciones y proyectos. Fases del ciclo de vida: Inicio, Planificación, Ejecución, Monitoreo y Cierre.',
            video_url: 'https://www.youtube.com/embed/B23i9W4w_Ak',
            duracion_minutos: 45,
            recurso_nombre: 'Diapositivas_Modulo1_CicloVida_PSM.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            id: 'm1-2',
            curso_id: 'c1111111-1111-1111-1111-111111111111',
            orden: 2,
            titulo: 'Módulo 2: Elaboración del Project Charter y Definición del Alcance',
            descripcion: 'Cómo redactar el acta de constitución oficial, alinear expectativas de stakeholders y evitar el síndrome de corrupción del alcance.',
            video_url: 'https://www.youtube.com/embed/e-ORhEE9VVg',
            duracion_minutos: 50,
            recurso_nombre: 'Guia_Project_Charter_Plantilla_2026.docx',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            id: 'm1-3',
            curso_id: 'c1111111-1111-1111-1111-111111111111',
            orden: 3,
            titulo: 'Módulo 3: Construcción de la Estructura de Desglose del Trabajo (EDT)',
            descripcion: 'Técnica de descomposición de entregables, paquetes de trabajo, diccionario de la EDT y aseguramiento de completitud.',
            video_url: 'https://www.youtube.com/embed/8vXo1uA4G60',
            duracion_minutos: 60,
            recurso_nombre: 'Ejemplo_EDT_Proyecto_Social_UNMSM.xlsx',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            id: 'm1-4',
            curso_id: 'c1111111-1111-1111-1111-111111111111',
            orden: 4,
            titulo: 'Módulo 4: Gestión de Riesgos, Matriz RACI y Cierre Formal',
            descripcion: 'Identificación de amenazas y oportunidades, plan de contingencia y lista de chequeo de lecciones aprendidas.',
            video_url: 'https://www.youtube.com/embed/jHDiaU4J6F4',
            duracion_minutos: 55,
            recurso_nombre: 'Checklist_Auditoria_PMO_Cierre.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
    ],
    'c2222222-2222-2222-2222-222222222222': [
        {
            id: 'm2-1',
            curso_id: 'c2222222-2222-2222-2222-222222222222',
            orden: 1,
            titulo: 'Módulo 1: Manifiesto Ágil y Roles de Scrum',
            descripcion: 'Los 4 valores y 12 principios ágiles. Roles: Product Owner, Scrum Master y Development Team.',
            video_url: 'https://www.youtube.com/embed/9TycLR0TqFA',
            duracion_minutos: 40,
            recurso_nombre: 'Guia_Scrum_Oficial_2020_Resumen.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            id: 'm2-2',
            curso_id: 'c2222222-2222-2222-2222-222222222222',
            orden: 2,
            titulo: 'Módulo 2: Eventos y Artefactos de Scrum en la Práctica',
            descripcion: 'Product Backlog, Sprint Backlog, Sprint Planning, Daily Scrum, Sprint Review y Retrospectiva.',
            video_url: 'https://www.youtube.com/embed/2Vt7Ik8Ubl8',
            duracion_minutos: 45,
            recurso_nombre: 'Plantilla_Miro_Sprint_Planning_PSM.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            id: 'm2-3',
            curso_id: 'c2222222-2222-2222-2222-222222222222',
            orden: 3,
            titulo: 'Módulo 3: Métricas Ágiles: Burn-down Charts y Velocidad',
            descripcion: 'Estimación por puntos de historia, cálculo de capacidad del equipo y adaptación continua.',
            video_url: 'https://www.youtube.com/embed/4b4bXkXq8_w',
            duracion_minutos: 35,
            recurso_nombre: 'Calculadora_Velocidad_Equipo_Excel.xlsx',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
    ],
    'c3333333-3333-3333-3333-333333333333': [
        {
            id: 'm3-1',
            curso_id: 'c3333333-3333-3333-3333-333333333333',
            orden: 1,
            titulo: 'Módulo 1: Autoliderazgo y Gestión del Tiempo Universitario',
            descripcion: 'Equilibrio entre carrera universitaria y voluntariado. Matriz de Eisenhower y técnica Pomodoro.',
            video_url: 'https://www.youtube.com/embed/B23i9W4w_Ak',
            duracion_minutos: 40,
            recurso_nombre: 'Taller_Gestion_Tiempo_SanMarcos.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            id: 'm3-2',
            curso_id: 'c3333333-3333-3333-3333-333333333333',
            orden: 2,
            titulo: 'Módulo 2: Comunicación Asertiva y Negociación de Conflictos',
            descripcion: 'Herramientas para feedback constructivo (método sándwich y modelo SBI), escucha activa y empatía.',
            video_url: 'https://www.youtube.com/embed/e-ORhEE9VVg',
            duracion_minutos: 45,
            recurso_nombre: 'Guia_Feedback_Constructivo_TH.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            id: 'm3-3',
            curso_id: 'c3333333-3333-3333-3333-333333333333',
            orden: 3,
            titulo: 'Módulo 3: Liderazgo Inspirador y Cultura Organizacional PSM',
            descripcion: 'Cómo motivar voluntarios con propósito, visión compartida y reconocimiento permanente.',
            video_url: 'https://www.youtube.com/embed/8vXo1uA4G60',
            duracion_minutos: 50,
            recurso_nombre: 'Manual_Cultura_Liderazgo_PSM.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
    ],
    'c4444444-4444-4444-4444-444444444444': [
        {
            id: 'm4-1',
            curso_id: 'c4444444-4444-4444-4444-444444444444',
            orden: 1,
            titulo: 'Módulo 1: Notion Avanzado para Documentación de Proyectos',
            descripcion: 'Bases de datos relacionadas, fórmulas, vistas de cronograma y plantillas de actas.',
            video_url: 'https://www.youtube.com/embed/9TycLR0TqFA',
            duracion_minutos: 45,
            recurso_nombre: 'Workspace_Template_Notion_PSM.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            id: 'm4-2',
            curso_id: 'c4444444-4444-4444-4444-444444444444',
            orden: 2,
            titulo: 'Módulo 2: Prototipado Rápido con Figma para Comunicaciones',
            descripcion: 'Componentes básicos, auto-layout y diseño de banners oficiales según el Brand Kit.',
            video_url: 'https://www.youtube.com/embed/2Vt7Ik8Ubl8',
            duracion_minutos: 50,
            recurso_nombre: 'Kit_UI_SanMarcos_Figma_Guia.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
            id: 'm4-3',
            curso_id: 'c4444444-4444-4444-4444-444444444444',
            orden: 3,
            titulo: 'Módulo 3: Flujos de Automatización y Google Workspace',
            descripcion: 'Formularios, hojas de cálculo conectadas y extensiones para automatizar tareas repetitivas.',
            video_url: 'https://www.youtube.com/embed/4b4bXkXq8_w',
            duracion_minutos: 40,
            recurso_nombre: 'Recetario_Scripts_Productividad.pdf',
            recurso_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
    ]
};

/**
 * Servicio para el Campus Virtual LMS (Cursos, Talleres, Módulos y Recursos)
 */
export const lmsService = {
    /**
     * Obtener listado de cursos y capacitaciones del campus
     * @param {Object} options Filtros por categoría, nivel o búsqueda
     */
    async getCursos({ categoria = '', nivel = '', search = '' } = {}) {
        try {
            let query = supabase
                .from('lms_cursos')
                .select('*')
                .order('created_at', { ascending: false });

            if (categoria && categoria !== 'Todas') {
                query = query.eq('categoria', categoria);
            }

            if (nivel && nivel !== 'Todos') {
                query = query.eq('nivel', nivel);
            }

            if (search.trim()) {
                query = query.or(`titulo.ilike.%${search}%,descripcion.ilike.%${search}%,instructor.ilike.%${search}%`);
            }

            const { data, error } = await query;

            if (error || !data || data.length === 0) {
                // Fallback con filtros aplicados en memoria
                let filtered = [...MOCK_CURSOS];
                if (categoria && categoria !== 'Todas') {
                    filtered = filtered.filter(c => c.categoria === categoria);
                }
                if (nivel && nivel !== 'Todos') {
                    filtered = filtered.filter(c => c.nivel === nivel);
                }
                if (search.trim()) {
                    const q = search.toLowerCase();
                    filtered = filtered.filter(c =>
                        c.titulo.toLowerCase().includes(q) ||
                        c.descripcion.toLowerCase().includes(q) ||
                        c.instructor.toLowerCase().includes(q)
                    );
                }
                return { success: true, data: filtered, isFallback: true };
            }

            return { success: true, data, isFallback: false };
        } catch (err) {
            console.warn('Excepción en getCursos, usando fallback:', err);
            return { success: true, data: MOCK_CURSOS, isFallback: true };
        }
    },

    /**
     * Obtener detalle de un curso con sus módulos
     * @param {string} cursoId ID del curso
     */
    async getCursoById(cursoId) {
        try {
            const { data: curso, error: cursoError } = await supabase
                .from('lms_cursos')
                .select('*')
                .eq('id', cursoId)
                .single();

            if (cursoError || !curso) {
                const mockCurso = MOCK_CURSOS.find(c => c.id === cursoId) || MOCK_CURSOS[0];
                const mockModulos = MOCK_MODULOS[mockCurso.id] || MOCK_MODULOS['c1111111-1111-1111-1111-111111111111'];
                return {
                    success: true,
                    data: { ...mockCurso, modulos: mockModulos },
                    isFallback: true
                };
            }

            // Obtener módulos del curso
            const { data: modulos } = await supabase
                .from('lms_modulos')
                .select('*')
                .eq('curso_id', cursoId)
                .order('orden', { ascending: true });

            return {
                success: true,
                data: { ...curso, modulos: modulos || [] },
                isFallback: false
            };
        } catch (err) {
            console.warn('Excepción en getCursoById, usando fallback:', err);
            const mockCurso = MOCK_CURSOS.find(c => c.id === cursoId) || MOCK_CURSOS[0];
            return {
                success: true,
                data: { ...mockCurso, modulos: MOCK_MODULOS[mockCurso.id] || [] },
                isFallback: true
            };
        }
    },

    /**
     * Obtener módulos de un curso específico
     * @param {string} cursoId ID del curso
     */
    async getModulosByCurso(cursoId) {
        try {
            const { data, error } = await supabase
                .from('lms_modulos')
                .select('*')
                .eq('curso_id', cursoId)
                .order('orden', { ascending: true });

            if (error || !data || data.length === 0) {
                return {
                    success: true,
                    data: MOCK_MODULOS[cursoId] || MOCK_MODULOS['c1111111-1111-1111-1111-111111111111'],
                    isFallback: true
                };
            }

            return { success: true, data, isFallback: false };
        } catch (err) {
            console.warn('Excepción en getModulosByCurso:', err);
            return {
                success: true,
                data: MOCK_MODULOS[cursoId] || [],
                isFallback: true
            };
        }
    },

    /**
     * Subir un archivo de recurso al bucket lms-recursos
     * @param {File} file Archivo a subir
     */
    async uploadRecurso(file) {
        try {
            if (!file) return { success: false, error: 'No se especificó archivo' };

            const fileExt = file.name.split('.').pop();
            const fileName = `recurso_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
            const filePath = `lms/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('lms-recursos')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) {
                console.warn('Aviso al subir recurso a storage:', uploadError.message);
                return {
                    success: true,
                    publicUrl: URL.createObjectURL(file),
                    fileName: file.name
                };
            }

            const { data: urlData } = supabase.storage
                .from('lms-recursos')
                .getPublicUrl(filePath);

            return {
                success: true,
                publicUrl: urlData?.publicUrl || '',
                fileName: file.name
            };
        } catch (err) {
            console.error('Error en uploadRecurso:', err);
            return {
                success: true,
                publicUrl: URL.createObjectURL(file),
                fileName: file.name
            };
        }
    }
};

export default lmsService;
