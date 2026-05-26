import re
from typing import List

# Siglas técnicas permitidas (mínimo 3 letras)
TECH_ACRONYMS = {
    "api", "ui", "ux", "git", "crm", "cli", "sdk", "pdf", "xml", "html", 
    "css", "js", "ts", "sql", "rpc", "soap", "http", "tcp", "ip", "dns", "ssl", 
    "ssh", "ftp", "smtp", "pop", "jwt", "oauth", "saml", "ldap", "gps", "gis",
    "cad", "cam", "bim", "plc", "scada", "rtos", "fpga", "soc", "dsp", "gpu",
    "cpu", "ram", "rom", "bios", "pci", "usb", "hdmi", "vga", "lte", "5g", "wifi",
    "ble", "mcu", "ide", "ttl", "vpn", "nat", "dhcp", "arp", "icmp", "rip", "ospf",
    "mpls", "vlan", "stp", "rstp", "lacp", "lldp", "cdp", "vpc", "hci", "nvme",
    "raid", "iscsi", "fc", "nfs", "smb", "cifs", "afs", "ncp", "spx", "ipx",
    "x25", "atm", "sonet", "sdh", "wdm", "otn", "ptp", "ntp", "glonass", "galileo",
    "beidou", "irnss", "qzss", "sbas", "egnos", "waas", "msas", "sdcm", "adc",
    "dac", "pwm", "gpio", "i2c", "spi", "can", "lin", "flexray", "most", "ethernet",
    "avb", "tsn", "profinet", "ethercat", "powerlink", "sercos", "cclink", "melsec"
}

EDUCATION_LEVELS = {
    "doctorado": 5, "phd": 5, "doctorate": 5, "maestría": 4, "master": 4, "mba": 4,
    "postgrado": 3, "grado": 3, "licenciatura": 3, "ingeniería": 3, "ingeniero": 3,
    "bachelor": 3, "diplomado": 2, "especialización": 2, "certificación": 1, "certified": 1,
}

# ============================================================================
# TÉRMINOS DE RUIDO (SIN IMPORTAR DE PROFESSION_DATA)
# ============================================================================

NOISE_TERMS: set = {
    # SOLO palabras realmente inútiles
    "the", "and", "for", "are", "was", "had", "has", "but", "not", "you",
    "all", "any", "can", "may", "our", "out", "its", "per", "etc", "will",
    "would", "could", "should", "might", "must", "from", "with", "have",
    
    # Ruido de entrevista (NO términos técnicos)
    "interview", "recruiter", "call", "process", "stage", "final", "initial",
    "application", "apply", "chat", "hear", "listen", "talk", "speak",
    
    # Verbos genéricos
    "working", "using", "making", "creating", "providing", "helping", "doing",
    "need", "want", "looking", "hesitate", "love", "read", "sure", "okay",
    
    # Sustantivos genéricos
    "level", "framework", "role", "squad", "tribe", "mission", "banking",
    
    # Nombres de empresas
    "monzo", "google", "amazon", "microsoft", "apple", "facebook", "meta",
    
    # Beneficios (NO términos técnicos)
    "benefits", "salary", "pension", "insurance", "perks", "culture", "values",
    "diversity", "inclusion", "mission", "vision",
}

NOISE_TERMS.update({
    # Términos de beneficios/cultura
    "colectivo", "lgtb", "fisio", "yoga", "gourmet", "retribución", "flexible", "familia",
    "mogollón", "aventura", "discriminación", "primando", "estabilidad", "futuro",
    "innovadores", "cercano", "transparente", "autonomía", "descuentos", "exclusivos",
    "competitiva", "continua", "selección", "entrevista", "revisión", "perfil",
    "dueño", "propietario", "dueña", "jornada", "turnos", "presencial", "remoto",
    # Verbos en primera persona del plural (ofrecemos, tenemos)
    "ofrecemos", "tenemos", "disfrutamos", "celebramos", "organizamos",
    # Frases cortas
    "full", "opcional", "nivel", "alto", "bajo", "medio", "gratis", "libre",
    # Palabras de relleno
    "cosquilleo", "tripa", "plataforma", "millones", "personas", "gente", "equipo",
    "compañero", "compañera", "jefe", "empresa", "cliente", "usuario", "cac", "ctr",
})