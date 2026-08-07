#!/usr/bin/env node
/* Compare les fonctions top-level de ce index.html avec celles de sms-mail-multi,
 * pour repérer les correctifs portés d'un côté et oubliés de l'autre.
 * Usage : node scripts/check-drift.js [chemin/vers/l-autre/index.html]
 * Par défaut, suppose que sms-mail-multi est cloné en sibling : ../sms-mail-multi
 */
const fs = require('fs');
const path = require('path');

const THIS_FILE = path.join(__dirname, '..', 'index.html');
const DEFAULT_OTHER = path.join(__dirname, '..', '..', 'sms-mail-multi', 'index.html');
const otherPath = process.argv[2] || DEFAULT_OTHER;

function extractFunctions(src) {
  const fns = {};
  const re = /^function\s+(\w+)\s*\(/gm;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    const braceStart = src.indexOf('{', m.index);
    if (braceStart === -1) continue;
    let depth = 0, i = braceStart, inStr = null;
    for (; i < src.length; i++) {
      const c = src[i];
      if (inStr) {
        if (c === '\\') { i++; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    fns[name] = src.slice(m.index, i);
  }
  return fns;
}

const normalize = (body) => body.replace(/\s+/g, ' ').trim();

if (!fs.existsSync(otherPath)) {
  console.error('Fichier introuvable : ' + otherPath + '\nPasse le chemin vers l\'autre index.html en argument.');
  process.exit(1);
}

const a = extractFunctions(fs.readFileSync(THIS_FILE, 'utf8'));
const b = extractFunctions(fs.readFileSync(otherPath, 'utf8'));

const names = Object.keys(a).sort();
const common = names.filter((n) => b[n]);
const onlyHere = names.filter((n) => !b[n]);
const onlyOther = Object.keys(b).filter((n) => !a[n]).sort();

const different = common.filter((n) => normalize(a[n]) !== normalize(b[n]));

console.log('Fonctions communes : ' + common.length + ' (' + (common.length - different.length) + ' identiques, ' + different.length + ' différentes)');
if (different.length) {
  console.log('\n⚠️  Fonctions partagées mais divergentes (divergence voulue, ou correctif non porté ?) :');
  different.forEach((n) => console.log('  - ' + n));
}
console.log('\nPrésentes ici seulement (' + onlyHere.length + ') : ' + (onlyHere.join(', ') || '—'));
console.log('Présentes en face seulement (' + onlyOther.length + ') : ' + (onlyOther.join(', ') || '—'));
console.log('\nCe script ne juge pas si une divergence est correcte — il sert juste à savoir où regarder avant de clore une session de portage.');
