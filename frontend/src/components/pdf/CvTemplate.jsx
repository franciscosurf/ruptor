// components/pdf/CvTemplate.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos con precisión milimétrica (estilo CSS-in-JS)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', color: '#1e293b' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  title: { fontSize: 14, color: '#4f46e5', fontWeight: 'medium' },
  section: { marginTop: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', color: '#4f46e5', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 3, marginBottom: 8 },
  item: { marginBottom: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemRole: { fontSize: 11, fontWeight: 'bold', color: '#334155' },
  itemCompany: { fontSize: 10, color: '#64748b' },
  itemDate: { fontSize: 9, color: '#94a3b8' },
  itemDesc: { fontSize: 9.5, color: '#475569', leadingHeight: 1.4 }
});

export const CvTemplate = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.profile?.name || 'Tu Nombre'}</Text>
        <Text style={styles.title}>{data.profile?.title || 'Tu Profesión o Cargo'}</Text>
      </View>

      {/* Experiencia Laboral */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experiencia Profesional</Text>
        {data.experience?.map((exp, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemRole}>{exp.role} — <Text style={styles.itemCompany}>{exp.company}</Text></Text>
              <Text style={styles.itemDate}>{exp.date}</Text>
            </View>
            <Text style={styles.itemDesc}>{exp.description}</Text>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habilidades Clave</Text>
        <Text style={{ fontSize: 10, color: '#334155', leadingHeight: 1.4 }}>
          {data.skills?.join(', ') || 'No hay habilidades agregadas'}
        </Text>
      </View>
    </Page>
  </Document>
);