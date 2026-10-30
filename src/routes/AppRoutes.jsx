import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';

// Layout and Core Pages
import Login from '../pages/Login';
import IntranetDashboard from '../components/IntranetDashboard';
import DashboardHome from '../pages/DashboardHome';
import MiPerfilPage from '../pages/perfil/MiPerfilPage';
import PmoPage from '../pages/gerencias/PmoPage';
import TecnologiaAdminPage from '../pages/talento-humano/TecnologiaAdminPage';
import UnderConstructionPage from '../pages/common/UnderConstructionPage';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Ruta Pública: Login / Activación (si ya está autenticado, redirige al dashboard) */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            {/* Ruta Principal Protegida / (si no está autenticado, redirige a /login) */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <IntranetDashboard />
                    </ProtectedRoute>
                }
            >
                {/* Vista general del dashboard en la raíz */}
                <Route index element={<DashboardHome />} />

                {/* Mi Espacio / Mi Perfil */}
                <Route path="mi-perfil" element={<MiPerfilPage />} />

                {/* 👑 Presidencia */}
                <Route
                    path="presidencia"
                    element={
                        <UnderConstructionPage
                            title="Tablero de Objetivos (OKRs / KPIs)"
                            gerencia="Presidencia"
                            fase="Fase 2 / Sprint 3"
                            description="Seguimiento de cumplimiento de metas organizacionales por gerencia y métricas estratégicas."
                        />
                    }
                />
                <Route
                    path="presidencia/actas"
                    element={
                        <UnderConstructionPage
                            title="Actas y Acuerdos de Junta Directiva"
                            gerencia="Presidencia"
                            fase="Fase 2 / Sprint 3"
                            description="Repositorio oficial de sesiones ordinarias y extraordinarias con registro de acuerdos tomados."
                        />
                    }
                />
                <Route
                    path="presidencia/mejora-continua"
                    element={
                        <UnderConstructionPage
                            title="Planes de Mejora Continua"
                            gerencia="Presidencia"
                            fase="Fase 2 / Sprint 3"
                            description="Registro de hallazgos y acciones preventivas y correctivas en los procesos de la organización."
                        />
                    }
                />

                {/* 📐 Gerencia de PMO */}
                <Route path="pmo" element={<PmoPage />} />
                <Route
                    path="pmo/banco-iniciativas"
                    element={
                        <UnderConstructionPage
                            title="Banco de Proyectos e Iniciativas"
                            gerencia="Gerencia de PMO"
                            fase="Fase 2 / Sprint 3"
                            description="Formulario para postulación de nuevas ideas de proyectos y evaluación de viabilidad."
                        />
                    }
                />
                <Route
                    path="pmo/plantillas"
                    element={
                        <UnderConstructionPage
                            title="Repositorio Oficial de Plantillas PMO"
                            gerencia="Gerencia de PMO"
                            fase="Fase 2 / Sprint 3"
                            description="Descarga directa de Project Charter, EDT, Matriz RACI, Cronogramas y Matriz de Riesgos."
                        />
                    }
                />
                <Route
                    path="pmo/lecciones-aprendidas"
                    element={
                        <UnderConstructionPage
                            title="Base de Lecciones Aprendidas"
                            gerencia="Gerencia de PMO"
                            fase="Fase 2 / Sprint 3"
                            description="Histórico de errores y aciertos de proyectos finalizados para la mejora continua del voluntariado."
                        />
                    }
                />
                <Route
                    path="pmo/auditoria-calidad"
                    element={
                        <UnderConstructionPage
                            title="Auditoría y Lista de Chequeo PMO"
                            gerencia="Gerencia de PMO"
                            fase="Fase 2 / Sprint 3"
                            description="Verificación de artefactos metodológicos requeridos antes del cierre formal de cada proyecto."
                        />
                    }
                />

                {/* 📢 Gerencia de Comunicaciones */}
                <Route
                    path="comunicaciones"
                    element={
                        <UnderConstructionPage
                            title="Panel de Comunicaciones e Impacto"
                            gerencia="Gerencia de Comunicaciones"
                            fase="Fase 3 / Sprint 5"
                            description="Métricas de redes sociales, impacto de difusión y alcance de campañas sanmarquinas."
                        />
                    }
                />
                <Route
                    path="comunicaciones/calendario-editorial"
                    element={
                        <UnderConstructionPage
                            title="Calendario Editorial de Redes"
                            gerencia="Gerencia de Comunicaciones"
                            fase="Fase 3 / Sprint 5"
                            description="Planificación y programación visual de contenidos para Instagram, LinkedIn y TikTok."
                        />
                    }
                />
                <Route
                    path="comunicaciones/brand-kit"
                    element={
                        <UnderConstructionPage
                            title="Kit de Marca Oficial (Brand Kit)"
                            gerencia="Gerencia de Comunicaciones"
                            fase="Fase 3 / Sprint 5"
                            description="Descarga de logotipos en alta resolución, paleta de colores oficial y tipografías corporativas."
                        />
                    }
                />
                <Route
                    path="comunicaciones/redactor"
                    element={
                        <UnderConstructionPage
                            title="Gestor de Comunicados Institucionales"
                            gerencia="Gerencia de Comunicaciones"
                            fase="Fase 3 / Sprint 5"
                            description="Herramienta para redactar y publicar anuncios oficiales en la portada de la intranet."
                        />
                    }
                />
                <Route
                    path="comunicaciones/rrpp"
                    element={
                        <UnderConstructionPage
                            title="Relaciones Públicas y Directorio de Aliados"
                            gerencia="Gerencia de Comunicaciones"
                            fase="Fase 3 / Sprint 5"
                            description="CRM de ponentes, empresas auspiciadoras, autoridades sanmarquinas y modelos de cartas formales."
                        />
                    }
                />

                {/* 💵 Gerencia de Finanzas */}
                <Route
                    path="finanzas"
                    element={
                        <UnderConstructionPage
                            title="Panel de Finanzas y Presupuesto"
                            gerencia="Gerencia de Finanzas"
                            fase="Fase 2 / Sprint 4"
                            description="Balance financiero, ingresos por auspicios y control de presupuestos organizacionales."
                        />
                    }
                />
                <Route
                    path="finanzas/logistica"
                    element={
                        <UnderConstructionPage
                            title="Inventario y Solicitud de Recursos"
                            gerencia="Gerencia de Finanzas"
                            fase="Fase 2 / Sprint 4"
                            description="Control de bienes físicos, licencias compartidas y solicitud de aulas y auditorios en UNMSM."
                        />
                    }
                />
                <Route
                    path="finanzas/caja-chica"
                    element={
                        <UnderConstructionPage
                            title="Control de Caja Chica por Proyecto"
                            gerencia="Gerencia de Finanzas"
                            fase="Fase 2 / Sprint 4"
                            description="Registro de ingresos y salidas con balance en tiempo real por cada proyecto activo."
                        />
                    }
                />
                <Route
                    path="finanzas/rendiciones"
                    element={
                        <UnderConstructionPage
                            title="Módulo de Rendición de Cuentas"
                            gerencia="Gerencia de Finanzas"
                            fase="Fase 2 / Sprint 4"
                            description="Carga de fotografías de boletas, facturas y comprobantes para justificar presupuestos asignados."
                        />
                    }
                />

                {/* 👥 Gerencia de Talento Humano */}
                <Route
                    path="talento-humano"
                    element={
                        <UnderConstructionPage
                            title="Panel de Talento Humano"
                            gerencia="Talento Humano"
                            fase="Fase 2 / Sprint 3"
                            description="Gestión integral, cultura, bienestar y acompañamiento a los voluntarios de PSM."
                        />
                    }
                />
                <Route
                    path="talento-humano/horas"
                    element={
                        <UnderConstructionPage
                            title="Control de Asistencia y Registro de Horas"
                            gerencia="Talento Humano"
                            fase="Fase 2 / Sprint 3"
                            description="Marcación semanal de horas dedicadas a proyectos, base para la constancia de voluntariado."
                        />
                    }
                />
                <Route
                    path="talento-humano/directorio"
                    element={
                        <UnderConstructionPage
                            title="Directorio de Miembros y Cumpleaños"
                            gerencia="Talento Humano"
                            fase="Fase 2 / Sprint 3"
                            description="Perfiles de voluntarios con enlace directo a WhatsApp, reconocimiento al voluntario del mes y cumpleaños."
                        />
                    }
                />
                <Route
                    path="talento-humano/campus-lms"
                    element={
                        <UnderConstructionPage
                            title="Campus Virtual (LMS PSM)"
                            gerencia="Talento Humano"
                            fase="Fase 3 / Sprint 5"
                            description="Talleres grabados de PMO, metodologías ágiles, liderazgo y material de formación descargable."
                        />
                    }
                />
                <Route
                    path="talento-humano/certificados"
                    element={
                        <UnderConstructionPage
                            title="Emisión y Descarga de Certificados"
                            gerencia="Talento Humano"
                            fase="Fase 3 / Sprint 5"
                            description="Generador automático de constancias de participación oficiales en PDF con validación por código QR."
                        />
                    }
                />
                <Route
                    path="talento-humano/ats"
                    element={
                        <UnderConstructionPage
                            title="Sistema de Reclutamiento (ATS)"
                            gerencia="Talento Humano"
                            fase="Fase 3 / Sprint 6"
                            description="Pipeline de postulantes a convocatorias, registro de entrevistas y asignación a gerencias."
                        />
                    }
                />
                <Route
                    path="talento-humano/evaluaciones"
                    element={
                        <UnderConstructionPage
                            title="Evaluaciones de Desempeño 360°"
                            gerencia="Talento Humano"
                            fase="Fase 3 / Sprint 6"
                            description="Encuestas semestrales de desempeño y clima para medir el impacto y crecimiento del voluntario."
                        />
                    }
                />

                {/* Sub-área 5: Tecnología y Optimización Digital (Administración de BD_TODOS) */}
                <Route path="talento-humano/tecnologia" element={<TecnologiaAdminPage />} />

                {/* Alias de compatibilidad */}
                <Route path="usuarios" element={<Navigate to="/talento-humano/tecnologia" replace />} />
            </Route>

            {/* Redirección de compatibilidad para rutas /app hacia / */}
            <Route path="/app" element={<Navigate to="/" replace />} />
            <Route path="/app/*" element={<Navigate to="/" replace />} />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

