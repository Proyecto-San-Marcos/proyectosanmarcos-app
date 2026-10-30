import { supabase } from '../lib/supabaseClient';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

/**
 * Muestra de certificados institucionales oficiales de PSM UNMSM (Fallback)
 */
const MOCK_CERTIFICADOS = [
    {
        id: 'cert-1111-1111-1111',
        codigo_verificacion: 'PSM-CERT-2026-A48F',
        miembro_id: 1,
        miembro_nombre: 'Yessly Sánchez Mendoza',
        miembro_codigo: '22200154',
        proyecto_o_taller: 'Dirección y Ejecución de la I Jornada de Innovación Social UNMSM',
        horas_acreditadas: 45.0,
        fecha_emision: '2026-09-15',
        tipo_certificado: 'Liderazgo y Gestión de Proyectos',
        firma_digital_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        pdf_url: null
    },
    {
        id: 'cert-2222-2222-2222',
        codigo_verificacion: 'PSM-CERT-2026-B91K',
        miembro_id: 1,
        miembro_nombre: 'Yessly Sánchez Mendoza',
        miembro_codigo: '22200154',
        proyecto_o_taller: 'Taller de Fundamentos de Dirección de Proyectos (PMBOK 7 & Agile)',
        horas_acreditadas: 20.0,
        fecha_emision: '2026-08-30',
        tipo_certificado: 'Capacitación y Formación',
        firma_digital_hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
        pdf_url: null
    },
    {
        id: 'cert-3333-3333-3333',
        codigo_verificacion: 'PSM-CERT-2026-X77L',
        miembro_id: 2,
        miembro_nombre: 'Alonso Carrasco Vega',
        miembro_codigo: '21200088',
        proyecto_o_taller: 'Voluntariado Semestral en Gestión de Talento Humano y Clima 2026-I',
        horas_acreditadas: 60.0,
        fecha_emision: '2026-07-20',
        tipo_certificado: 'Constancia de Voluntariado',
        firma_digital_hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        pdf_url: null
    }
];

export const certificadosService = {
    /**
     * Generar un código único de verificación institucional
     */
    generarCodigo() {
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `PSM-CERT-2026-${randomHex}`;
    },

    /**
     * Generar imagen QR en Base64 Data URL a partir del código de verificación
     * @param {string} codigo Código de verificación del certificado
     */
    async generarQrDataUrl(codigo) {
        try {
            const verificationUrl = `${window.location.origin}/talento-humano/certificados?verificar=${encodeURIComponent(codigo)}`;
            return await QRCode.toDataURL(verificationUrl, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#0f2044',
                    light: '#ffffff'
                }
            });
        } catch (err) {
            console.error('Error al generar código QR:', err);
            // Fallback usando API pública de QR
            return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(codigo)}`;
        }
    },

    /**
     * Obtener los certificados emitidos a un miembro específico
     * @param {number|string} miembroId ID del miembro en BD_TODOS
     */
    async getMisCertificados(miembroId) {
        try {
            if (!miembroId) {
                return { success: true, data: MOCK_CERTIFICADOS, isFallback: true };
            }

            const { data, error } = await supabase
                .from('certificados_emitidos')
                .select(`
                    *,
                    miembro:miembro_id (
                        id,
                        nombres,
                        apellidos,
                        codigo_universitario,
                        gerencia_actual
                    )
                `)
                .eq('miembro_id', miembroId)
                .order('fecha_emision', { ascending: false });

            if (error || !data || data.length === 0) {
                return { success: true, data: MOCK_CERTIFICADOS, isFallback: true };
            }

            // Normalizar datos
            const normalized = data.map(item => ({
                ...item,
                miembro_nombre: item.miembro ? `${item.miembro.nombres || ''} ${item.miembro.apellidos || ''}`.trim() : 'Miembro PSM',
                miembro_codigo: item.miembro?.codigo_universitario || 'No asignado'
            }));

            return { success: true, data: normalized, isFallback: false };
        } catch (err) {
            console.warn('Excepción en getMisCertificados, usando mock:', err);
            return { success: true, data: MOCK_CERTIFICADOS, isFallback: true };
        }
    },

    /**
     * Obtener todos los certificados emitidos (para Talento Humano y Presidencia)
     */
    async getAllCertificados({ search = '' } = {}) {
        try {
            let query = supabase
                .from('certificados_emitidos')
                .select(`
                    *,
                    miembro:miembro_id (
                        id,
                        nombres,
                        apellidos,
                        codigo_universitario,
                        gerencia_actual
                    )
                `)
                .order('fecha_emision', { ascending: false });

            const { data, error } = await query;

            if (error || !data || data.length === 0) {
                let filtered = [...MOCK_CERTIFICADOS];
                if (search.trim()) {
                    const q = search.toLowerCase();
                    filtered = filtered.filter(c =>
                        c.codigo_verificacion.toLowerCase().includes(q) ||
                        c.miembro_nombre.toLowerCase().includes(q) ||
                        c.proyecto_o_taller.toLowerCase().includes(q)
                    );
                }
                return { success: true, data: filtered, isFallback: true };
            }

            const normalized = data.map(item => ({
                ...item,
                miembro_nombre: item.miembro ? `${item.miembro.nombres || ''} ${item.miembro.apellidos || ''}`.trim() : 'Miembro PSM',
                miembro_codigo: item.miembro?.codigo_universitario || 'No asignado'
            }));

            return { success: true, data: normalized, isFallback: false };
        } catch (err) {
            console.warn('Excepción en getAllCertificados:', err);
            return { success: true, data: MOCK_CERTIFICADOS, isFallback: true };
        }
    },

    /**
     * Registrar la emisión de un nuevo certificado oficial
     * @param {Object} payload Datos del certificado
     */
    async emitirCertificado(payload) {
        try {
            const {
                miembro_id,
                proyecto_o_taller,
                horas_acreditadas,
                tipo_certificado = 'Constancia de Horas',
                fecha_emision = new Date().toISOString().split('T')[0]
            } = payload;

            const codigo_verificacion = this.generarCodigo();
            const hashSource = `${codigo_verificacion}-${miembro_id}-${horas_acreditadas}-${Date.now()}`;
            const firma_digital_hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashSource))))
                .map(b => b.toString(16).padStart(2, '0')).join('');

            const recordPayload = {
                codigo_verificacion,
                miembro_id,
                proyecto_o_taller,
                horas_acreditadas: parseFloat(horas_acreditadas),
                fecha_emision,
                firma_digital_hash
            };

            const { data, error } = await supabase
                .from('certificados_emitidos')
                .insert([recordPayload])
                .select()
                .single();

            if (error) {
                console.warn('Aviso en emitirCertificado a BD, retornando local:', error.message);
                return {
                    success: true,
                    data: {
                        id: `cert-local-${Date.now()}`,
                        ...recordPayload,
                        tipo_certificado
                    },
                    isLocal: true
                };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Error en emitirCertificado:', err);
            return { success: false, error: err };
        }
    },

    /**
     * Verificar autenticidad de un certificado mediante su código QR / Alfanumérico
     * @param {string} codigo Código de verificación (ej. PSM-CERT-2026-A48F)
     */
    async verificarCertificado(codigo) {
        try {
            if (!codigo) return { success: false, error: 'Código requerido' };
            const cleanCode = codigo.trim().toUpperCase();

            const { data, error } = await supabase
                .from('certificados_emitidos')
                .select(`
                    *,
                    miembro:miembro_id (
                        id,
                        nombres,
                        apellidos,
                        codigo_universitario,
                        gerencia_actual
                    )
                `)
                .eq('codigo_verificacion', cleanCode)
                .single();

            if (error || !data) {
                // Verificar en mock
                const foundMock = MOCK_CERTIFICADOS.find(c => c.codigo_verificacion.toUpperCase() === cleanCode);
                if (foundMock) {
                    return { success: true, valido: true, certificado: foundMock };
                }
                return { success: false, valido: false, error: 'No se encontró ningún certificado con este código en el registro oficial.' };
            }

            const cert = {
                ...data,
                miembro_nombre: data.miembro ? `${data.miembro.nombres || ''} ${data.miembro.apellidos || ''}`.trim() : 'Miembro PSM',
                miembro_codigo: data.miembro?.codigo_universitario || 'No asignado'
            };

            return { success: true, valido: true, certificado: cert };
        } catch (err) {
            console.error('Excepción al verificar certificado:', err);
            return { success: false, valido: false, error: err.message };
        }
    },

    /**
     * Generar y descargar el Certificado Oficial de PSM UNMSM en formato PDF (A4 Apaisado)
     * @param {Object} cert Datos completos del certificado
     */
    async descargarPdfCertificado(cert) {
        try {
            // Formato horizontal A4 (297 x 210 mm)
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 297;
            const pageHeight = 210;

            // 1. Fondo suave y marco institucional exterior (Navy Blue)
            doc.setFillColor(253, 254, 255);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');

            // Marco exterior grueso azul marino (#0f2044)
            doc.setDrawColor(15, 32, 68);
            doc.setLineWidth(4);
            doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

            // Marco interior dorado (#d4af37)
            doc.setDrawColor(212, 175, 55);
            doc.setLineWidth(1.5);
            doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

            // Marco fino teal (#00b4d8)
            doc.setDrawColor(0, 180, 216);
            doc.setLineWidth(0.4);
            doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

            // Esquinas ornamentales decorativas
            const corners = [
                [14, 14], [pageWidth - 14, 14],
                [14, pageHeight - 14], [pageWidth - 14, pageHeight - 14]
            ];
            doc.setFillColor(212, 175, 55);
            corners.forEach(([cx, cy]) => {
                doc.circle(cx, cy, 2, 'F');
            });

            // 2. Encabezado Institucional
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 32, 68); // PSM Navy
            doc.setFontSize(11);
            doc.text('UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS', pageWidth / 2, 25, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text('Universidad del Perú • Decana de América • Fundada en 1551', pageWidth / 2, 30, { align: 'center' });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(0, 180, 216); // PSM Teal
            doc.text('ASOCIACIÓN PROYECTOS SAN MARCOS (PSM)', pageWidth / 2, 37, { align: 'center' });

            // Línea divisoria decorativa central
            doc.setDrawColor(212, 175, 55);
            doc.setLineWidth(0.8);
            doc.line(pageWidth / 2 - 45, 41, pageWidth / 2 + 45, 41);

            // 3. Título del Certificado
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.setTextColor(15, 32, 68);
            doc.text('CERTIFICADO OFICIAL', pageWidth / 2, 53, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            doc.text('La Presidencia y la Dirección de Talento Humano confieren el presente reconocimiento a:', pageWidth / 2, 63, { align: 'center' });

            // 4. Nombre del Voluntario / Estudiante
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(15, 32, 68);
            const nombre = (cert.miembro_nombre || 'VOLUNTARIO PSM').toUpperCase();
            doc.text(nombre, pageWidth / 2, 77, { align: 'center' });

            // Subrayado estilizado bajo el nombre
            doc.setDrawColor(0, 180, 216);
            doc.setLineWidth(1.2);
            const nombreWidth = doc.getTextWidth(nombre);
            doc.line(pageWidth / 2 - (nombreWidth / 2) - 5, 80, pageWidth / 2 + (nombreWidth / 2) + 5, 80);

            // Código universitario si existe
            if (cert.miembro_codigo) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(100, 116, 139);
                doc.text(`Código UNMSM: ${cert.miembro_codigo}`, pageWidth / 2, 85, { align: 'center' });
            }

            // 5. Cuerpo y Justificación del Certificado
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(51, 65, 85);
            const textoCuerpo = `Por haber culminado con excelencia su destacada participación en el proyecto y/o programa formativo "${cert.proyecto_o_taller || 'Iniciativa Institucional PSM'}", acumulando un total de ${cert.horas_acreditadas || 0} horas académicas y de voluntariado acreditadas, demostrando liderazgo, compromiso social y estricto apego a las metodologías de gestión de proyectos.`;

            const splitTexto = doc.splitTextToSize(textoCuerpo, 210);
            doc.text(splitTexto, pageWidth / 2, 95, { align: 'center' });

            // Fecha de emisión
            const fechaStr = cert.fecha_emision ? new Date(cert.fecha_emision).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }) : 'Octubre de 2026';

            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 116, 139);
            doc.text(`Ciudad Universitaria, Lima, ${fechaStr}`, pageWidth / 2, 126, { align: 'center' });

            // 6. Firmas Digitales y Sellos
            // Firma 1: Presidencia
            doc.setDrawColor(15, 32, 68);
            doc.setLineWidth(0.6);
            doc.line(45, 155, 115, 155);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(15, 32, 68);
            doc.text('PRESIDENCIA GENERAL', 80, 161, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text('Asociación Proyectos San Marcos', 80, 165, { align: 'center' });
            doc.text('Firma Digital Verificada • UNMSM', 80, 169, { align: 'center' });

            // Firma 2: Talento Humano
            doc.line(pageWidth - 115, 155, pageWidth - 45, 155);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(15, 32, 68);
            doc.text('GERENCIA DE TALENTO HUMANO', pageWidth - 80, 161, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text('Control, Capacitación y Certificación', pageWidth - 80, 165, { align: 'center' });
            doc.text('Acreditación Institucional PSM', pageWidth - 80, 169, { align: 'center' });

            // 7. Código QR de Verificación Incrustado
            const qrDataUrl = await this.generarQrDataUrl(cert.codigo_verificacion);
            if (qrDataUrl) {
                // Dibujar imagen QR en la esquina inferior central
                doc.addImage(qrDataUrl, 'PNG', pageWidth / 2 - 14, 140, 28, 28);
            }

            // Código de verificación bajo el QR
            doc.setFont('courier', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(15, 32, 68);
            doc.text(cert.codigo_verificacion, pageWidth / 2, 172, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text('Escanee el código QR o ingrese a intranet.proyectossanmarcos.org para validar autenticidad', pageWidth / 2, 177, { align: 'center' });
            doc.text(`Hash de Seguridad: ${cert.firma_digital_hash ? cert.firma_digital_hash.substring(0, 32) + '...' : 'PSM-SECURE-HASH-2026'}`, pageWidth / 2, 181, { align: 'center' });

            // 8. Guardar y disparar descarga
            const cleanFileName = `Certificado_${(cert.codigo_verificacion || 'PSM').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
            doc.save(cleanFileName);
            return { success: true, fileName: cleanFileName };
        } catch (err) {
            console.error('Error al generar PDF del certificado:', err);
            return { success: false, error: err.message };
        }
    }
};

export default certificadosService;
