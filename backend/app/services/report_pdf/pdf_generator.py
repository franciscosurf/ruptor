# app/services/pdf_generator.py
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from datetime import datetime
from typing import Dict, Any
import io

def generar_informe_pdf(analisis: Dict[str, Any]) -> bytes:
    """
    Genera un PDF con el informe del análisis ATS.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    # Estilo personalizado para títulos
    titulo_style = ParagraphStyle(
        'Titulo',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=12
    )
    subtitulo_style = ParagraphStyle(
        'Subtitulo',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2563EB'),
        spaceAfter=8
    )
    normal_style = styles['Normal']
    bullet_style = ParagraphStyle('Bullet', parent=normal_style, leftIndent=20, bulletIndent=10)

    # Título principal
    story.append(Paragraph("Informe de Análisis ATS", titulo_style))
    story.append(Paragraph(f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}", normal_style))
    story.append(Spacer(1, 0.5*cm))

    # Puntuación global y nivel
    ats_score = analisis.get('ats_score', 0)
    level = analisis.get('level', 'Sin clasificar')
    summary = analisis.get('summary', '')

    score_text = f"<b>Puntuación ATS:</b> {ats_score:.1f} / 100"
    story.append(Paragraph(score_text, subtitulo_style))
    story.append(Paragraph(f"<b>Nivel:</b> {level}", normal_style))
    story.append(Paragraph(f"<b>Resumen:</b> {summary}", normal_style))
    story.append(Spacer(1, 0.3*cm))

    # Puntuaciones detalladas
    detailed = analisis.get('detailed_scores', {})
    if detailed:
        story.append(Paragraph("Puntuaciones Detalladas", subtitulo_style))
        data = [["Métrica", "Puntuación"]]
        for key, value in detailed.items():
            data.append([key.replace('_', ' ').title(), f"{value:.1f}"])
        table = Table(data, colWidths=[300, 100])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (1,0), (1,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.5*cm))

    # Recomendaciones
    recomendaciones = analisis.get('recommendations', [])
    if recomendaciones:
        story.append(Paragraph("Recomendaciones de Mejora", subtitulo_style))
        for rec in recomendaciones:
            action = rec.get('action', '')
            priority = rec.get('priority', 'Media')
            impact = rec.get('impact', '')
            examples = rec.get('examples', [])
            puntos = rec.get('potential_points', 0)
            text = f"<b>[{priority}]</b> {action} <i>(+{puntos} pts)</i><br/><font size='8'>{impact}</font>"
            story.append(Paragraph(text, normal_style))
            if examples:
                for ex in examples[:3]:
                    story.append(Paragraph(f"• {ex}", bullet_style))
            story.append(Spacer(1, 0.2*cm))
        story.append(Spacer(1, 0.3*cm))

    # Términos faltantes (palabras clave)
    missing_terms = analisis.get('missing_terms', [])
    if missing_terms:
        story.append(Paragraph("Términos Clave Faltantes", subtitulo_style))
        for term in missing_terms[:30]:
            story.append(Paragraph(f"• {term}", bullet_style))
        story.append(Spacer(1, 0.3*cm))

    # Habilidades técnicas faltantes
    missing_tech = analisis.get('missing_tech_skills_with_points', [])
    if missing_tech:
        story.append(Paragraph("Habilidades Técnicas Faltantes", subtitulo_style))
        for item in missing_tech[:30]:
            skill = item.get('skill', '')
            puntos = item.get('potential_points', 0)
            story.append(Paragraph(f"• {skill} (+{puntos} pts)", bullet_style))
        story.append(Spacer(1, 0.3*cm))

    # Métricas de verbos y logros
    verbs = analisis.get('action_verbs_metrics', {})
    if verbs:
        story.append(Paragraph("Verbos de Acción", subtitulo_style))
        story.append(Paragraph(f"Puntuación: {verbs.get('score', 0)}/100", normal_style))
        story.append(Paragraph(f"Verbos detectados: {', '.join(verbs.get('detected', [])[:5])}", normal_style))
        tips = verbs.get('tips', [])
        if tips:
            story.append(Paragraph("<b>Consejo:</b> " + tips[0], normal_style))
        story.append(Spacer(1, 0.3*cm))

    quantified = analisis.get('quantified_achievements_metrics', {})
    if quantified:
        story.append(Paragraph("Logros Cuantificados", subtitulo_style))
        story.append(Paragraph(f"Puntuación: {quantified.get('score', 0)}/100", normal_style))
        sentences = quantified.get('sentences', [])
        if sentences:
            story.append(Paragraph("<b>Frases destacadas:</b>", normal_style))
            for sent in sentences[:3]:
                story.append(Paragraph(f"• {sent[:100]}...", bullet_style))
        tips = quantified.get('tips', [])
        if tips:
            story.append(Paragraph("<b>Consejo:</b> " + tips[0], normal_style))
        story.append(Spacer(1, 0.3*cm))

    # Sugerencias de cultura
    cultura = analisis.get('culture_suggestions', [])
    if cultura:
        story.append(Paragraph("Valores de Empresa Detectados", subtitulo_style))
        for item in cultura[:5]:
            phrase = item.get('text', '') if isinstance(item, dict) else item[0]
            story.append(Paragraph(f"• {phrase}", bullet_style))
        story.append(Spacer(1, 0.3*cm))

    # Metadatos adicionales
    story.append(Paragraph("Metadatos del Análisis", subtitulo_style))
    story.append(Paragraph(f"Sector CV: {analisis.get('cv_sector', {}).get('sector', 'N/D')}", normal_style))
    story.append(Paragraph(f"Sector Oferta: {analisis.get('job_sector', {}).get('sector', 'N/D')}", normal_style))
    exp_match = analisis.get('experience_match', {})
    story.append(Paragraph(f"Experiencia: {exp_match.get('detected', 0)} años (requiere {exp_match.get('required', 0)})", normal_style))
    edu_match = analisis.get('education_match', {})
    story.append(Paragraph(f"Educación: {edu_match.get('detected_level', 'N/D')} (requiere {edu_match.get('required_level', 'N/D')})", normal_style))

    # Construir PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
