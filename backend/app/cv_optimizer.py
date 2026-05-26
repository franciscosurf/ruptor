"""
cv_optimizer.py - Módulo para generar CV optimizado basado en términos faltantes
"""

import re
from typing import List, Dict, Any
from datetime import datetime


class CVOptimizer:
    """Genera frases optimizadas para CV basadas en términos faltantes"""
    
    def __init__(self):
        # Plantillas de frases por categoría de término
        self.phrase_templates = {
            "tecnico": [
                "Experiencia en {term} aplicado a {context}",
                "Implementación de soluciones con {term} para optimizar {context}",
                "Desarrollo de proyectos utilizando {term} como herramienta principal",
                "Dominio de {term} en entornos {context}",
                "Certificación y experiencia práctica en {term}"
            ],
            "liderazgo": [
                "Liderazgo de equipos en proyectos relacionados con {term}",
                "Coordinación de {term} en {context} con resultados medibles",
                "Gestión de {term} supervisando un equipo de X personas",
                "Responsable de {term} en departamento de {context}"
            ],
            "soft_skill": [
                "Demostrada capacidad de {term} en entornos {context}",
                "Reconocimiento por {term} en proyectos anteriores",
                "Aplicación diaria de {term} para resolver desafíos en {context}"
            ],
            "administracion": [
                "Gestion de {term} para el control de {context}",
                "Experiencia en {term} aplicada a la gestión administrativa",
                "Manejo de {term} en procesos de {context}",
                "Optimización de {term} para mejorar eficiencia en {context}"
            ],
            "general": [
                "Experiencia demostrada en {term}",
                "Conocimientos sólidos de {term} aplicados en {context}",
                "Formación y experiencia práctica en {term}"
            ]
        }
        
        # Contextos comunes por tipo de término
        self.default_contexts = {
            "tecnico": "proyectos profesionales",
            "liderazgo": "entornos laborales",
            "soft_skill": "colaborativos",
            "administracion": "procesos administrativos",
            "general": "mi trayectoria profesional"
        }
    
    def _categorize_term(self, term: str) -> str:
        """Categoriza un término para elegir plantilla adecuada"""
        term_lower = term.lower()
        
        tech_keywords = ["python", "java", "sql", "oracle", "excel", "aws", "docker", "api", "git", "linux", "windows", "office", "sap", "erp", "crm"]
        leadership_keywords = ["lider", "jefe", "supervisor", "coordin", "gerent", "manager", "director", "responsable", "gestión", "management"]
        soft_keywords = ["comunic", "trabajo equipo", "colabor", "proact", "organiz", "adapt", "flexible", "resolución", "negociación"]
        admin_keywords = ["administr", "gestion", "pedidos", "facturación", "inventario", "almacén", "expedición", "logística", "proveedores", "trámite"]
        
        if any(kw in term_lower for kw in tech_keywords):
            return "tecnico"
        elif any(kw in term_lower for kw in leadership_keywords):
            return "liderazgo"
        elif any(kw in term_lower for kw in soft_keywords):
            return "soft_skill"
        elif any(kw in term_lower for kw in admin_keywords):
            return "administracion"
        
        return "general"
    
    def _get_context_for_term(self, term: str, job_text: str = "") -> str:
        """Intenta extraer contexto de la oferta o usa contexto por defecto"""
        if job_text:
            # Buscar frase cercana al término
            sentences = re.split(r'[.!?\n]+', job_text.lower())
            for sentence in sentences:
                if term.lower() in sentence:
                    # Extraer palabras clave de la frase (simplificado)
                    words = sentence.split()
                    if len(words) > 3:
                        context_words = [w for w in words if len(w) > 3 and w not in [term.lower()]]
                        if context_words:
                            return ' '.join(context_words[:5])
        
        category = self._categorize_term(term)
        return self.default_contexts.get(category, "mi trabajo diario")
    
    def generate_optimized_phrases(self, missing_terms: List[str], job_text: str = "", max_phrases: int = 10) -> List[Dict[str, Any]]:
        """Genera frases optimizadas para cada término faltante"""
        phrases = []
        
        for term in missing_terms[:max_phrases]:
            if len(term) < 3:
                continue
            
            category = self._categorize_term(term)
            templates = self.phrase_templates.get(category, self.phrase_templates["general"])
            
            # Usar plantilla más relevante
            import random
            template = random.choice(templates)
            
            # Obtener contexto
            context = self._get_context_for_term(term, job_text)
            
            # Generar 2-3 variaciones de la frase
            variations = []
            for t in templates[:2]:
                phrase = t.format(term=term.upper(), context=context)
                variations.append(phrase)
            
            # Frase simple adicional
            variations.append(f"Manejo avanzado de {term.upper()} con resultados comprobables")
            
            phrases.append({
                "term": term,
                "category": category,
                "suggestions": variations,
                "where_to_add": self._suggest_placement(category)
            })
        
        return phrases
    
    def _suggest_placement(self, category: str) -> str:
        """Sugiere dónde añadir el término en el CV"""
        placements = {
            "tecnico": "Sección de Habilidades Técnicas o Experiencia Laboral",
            "liderazgo": "Sección de Experiencia Laboral (describiendo logros)",
            "soft_skill": "Resumen Profesional o Sección de Habilidades",
            "administracion": "Sección de Experiencia o Funciones Realizadas",
            "general": "Sección de Habilidades o Resumen Profesional"
        }
        return placements.get(category, "Sección de Habilidades")
    
    def generate_full_cv_section(self, missing_terms: List[str], profession: str = "general") -> Dict[str, Any]:
        """Genera una sección completa de CV optimizada"""
        
        # Agrupar términos por categoría
        categorized = {
            "tecnico": [],
            "liderazgo": [],
            "soft_skill": [],
            "administracion": [],
            "general": []
        }
        
        for term in missing_terms[:15]:
            cat = self._categorize_term(term)
            categorized[cat].append(term)
        
        # Generar resumen profesional
        top_terms = missing_terms[:3]
        summary = f"Profesional con experiencia en {', '.join(top_terms)}. " if top_terms else ""
        summary += "Orientado a resultados y mejora continua. Capacidad demostrada para adaptarse a nuevos desafíos y entornos dinámicos."
        
        # Generar sección de habilidades
        skills_section = []
        for cat, terms in categorized.items():
            if terms:
                skills_section.extend([f"• {t.upper()}" for t in terms[:3]])
        
        # Generar ejemplo de logro
        achievement = ""
        if missing_terms:
            main_term = missing_terms[0]
            cat = self._categorize_term(main_term)
            if cat == "tecnico":
                achievement = f"Implementé soluciones con {main_term.upper()} que mejoraron la eficiencia operativa"
            elif cat == "liderazgo":
                achievement = f"Lideré equipos en proyectos relacionados con {main_term.upper()}, logrando objetivos clave"
            else:
                achievement = f"Optimicé procesos utilizando {main_term.upper()}, reduciendo tiempos de ejecución"
        
        return {
            "summary": summary,
            "skills": skills_section[:10],
            "achievement_example": achievement,
            "categorized_terms": categorized
        }


# Función principal para integrar con main.py
def generate_cv_optimizations(missing_terms: List[str], job_text: str = "", profession: str = "general") -> Dict[str, Any]:
    """Genera optimizaciones de CV a partir de términos faltantes"""
    optimizer = CVOptimizer()
    
    phrases = optimizer.generate_optimized_phrases(missing_terms, job_text, max_phrases=8)
    full_section = optimizer.generate_full_cv_section(missing_terms, profession)
    
    return {
        "has_optimizations": len(phrases) > 0,
        "total_terms_processed": len(missing_terms),
        "phrases": phrases,
        "cv_section": full_section,
        "instruction": "Copia y pega las frases sugeridas en tu CV, o úsalas como inspiración para mejorar tus descripciones."
    }