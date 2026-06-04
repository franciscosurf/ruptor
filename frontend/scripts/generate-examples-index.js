const fs = require('fs');
const path = require('path');

// Desde src/, subimos a la raíz y luego a public/examples
const examplesDir = path.join(__dirname, '../public/examples');
const outputFile = path.join(examplesDir, 'index.json');

if (!fs.existsSync(examplesDir)) {
  console.error(`❌ La carpeta ${examplesDir} no existe.`);
  process.exit(1);
}

const files = fs.readdirSync(examplesDir)
  .filter(file => file.endsWith('.txt') && file !== 'index.json');

const index = files.map(file => ({
  label: file.replace(/\.txt$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  file
}));

index.sort((a, b) => a.label.localeCompare(b.label));
fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
console.log(`✅ Generado ${outputFile} con ${index.length} ejemplos.`);