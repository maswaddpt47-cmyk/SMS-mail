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

/* un « / » ouvre une regex (et non une division) s'il suit un opérateur, une ponctuation
   ouvrante ou un mot-clé comme return */
function regexAllowed(src, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j--;
  if (j < 0) return true;
  if ('(,=:[!&|?{};+-*%<>~^'.includes(src[j])) return true;
  const word = src.slice(Math.max(0, j - 9), j + 1).match(/([A-Za-z_$]+)$/);
  return !!(word && ['return', 'typeof', 'case', 'in', 'of', 'void', 'delete', 'throw'].includes(word[1]));
}
/* renvoie l'index du « / » fermant de la regex qui commence en i */
function skipRegex(src, i) {
  let inClass = false;
  for (let k = i + 1; k < src.length; k++) {
    const c = src[k];
    if (c === '\\') { k++; continue; }
    if (c === '\n') return k;
    if (inClass) { if (c === ']') inClass = false; continue; }
    if (c === '[') { inClass = true; continue; }
    if (c === '/') return k;
  }
  return src.length;
}

function extractFunctions(src) {
  const fns = {};
  const re = /^function\s+(\w+)\s*\(/gm;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    const braceStart = src.indexOf('{', m.index);
    if (braceStart === -1) continue;
    let depth = 0, i = braceStart, inStr = null, inLineComment = false, inBlockComment = false;
    for (; i < src.length; i++) {
      const c = src[i], c2 = src[i + 1];
      if (inLineComment) { if (c === '\n') inLineComment = false; continue; }
      if (inBlockComment) { if (c === '*' && c2 === '/') { inBlockComment = false; i++; } continue; }
      if (inStr) {
        if (c === '\\') { i++; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '/' && c2 === '/') { inLineComment = true; i++; continue; }
      if (c === '/' && c2 === '*') { inBlockComment = true; i++; continue; }
      /* littéral regex (ex. /[-\s']+/) : sans ce saut, l'apostrophe de la classe ouvrait une
         « chaîne » fantôme et faussait le comptage des accolades — 3 faux positifs
         (normCommune, exportHistoryCSV, exportOrientationsCSV) jusqu'au 10/10/2026 */
      if (c === '/' && regexAllowed(src, i)) { i = skipRegex(src, i); continue; }
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
