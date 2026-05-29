// src/components/scanner/strategy/PdfTemplate.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Registrar fuentes (opcional, para evitar caracteres raros)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ],
});

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#000000',
  },
  section: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  text: {
    fontSize: 10,
    color: '#000000',
    marginBottom: 5,
  },
  inputField: {
    borderBottom: '1px solid #000',
    paddingBottom: 5,
    marginBottom: 10,
  },
});

const PdfTemplate = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>{data.title || 'CV Optimizado'}</Text>
        {data.sections?.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={{ ...styles.text, fontWeight: 'bold' }}>{section.title}</Text>
            {section.content?.map((item, i) => (
              <Text key={i} style={styles.text}>
                {item.label}: {item.value}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default PdfTemplate;