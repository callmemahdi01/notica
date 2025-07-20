// scripts/bundle-notes.js
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const notesDir = resolve(projectRoot, 'notes');
const outputFile = resolve(projectRoot, 'functions', 'notes-bundle.json');

const files = glob.sync('**/*.html', { cwd: notesDir });
const notesData = {};

files.forEach(file => {
    const fullPath = resolve(notesDir, file);
    const content = readFileSync(fullPath, 'utf-8');
    const key = file.replace(/\\/g, '/').replace('.html', '');
    notesData[key] = content;
});

writeFileSync(outputFile, JSON.stringify(notesData, null, 2));
console.log(`✅ Bundled ${files.length} notes into ${outputFile}`);