#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Obtener API_BASE_URL de las variables de entorno
const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8000';

// Contenido del archivo env-config.js
const configContent = `// Configuración generada automáticamente desde variables de entorno
window.API_BASE_URL = "${API_BASE_URL}";
`;

// Ruta del archivo de salida
const outputPath = path.join(__dirname, '..', 'js', 'env-config.js');

// Crear el directorio js si no existe
const jsDir = path.dirname(outputPath);
if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
}

// Escribir el archivo
fs.writeFileSync(outputPath, configContent, 'utf8');

console.log(`✓ env-config.js generado correctamente`);
console.log(`✓ API_BASE_URL configurado como: ${API_BASE_URL}`);

