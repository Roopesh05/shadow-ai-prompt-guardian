const fs = require('fs');
const path = require('path');

console.log('=== SENTINEL COMPREHENSIVE PROJECT AUDIT ===\n');

// 1. Check popup.html vs js/popup.js
const popupHtml = fs.readFileSync('popup.html', 'utf8');
const popupJs = fs.readFileSync('js/popup.js', 'utf8');
const popupIds = [...popupJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const missingPopupIds = popupIds.filter(id => !popupHtml.includes(`id="${id}"`) && !popupHtml.includes(`id='${id}'`));
console.log('Popup HTML Missing IDs:', missingPopupIds);

// 2. Check options.html vs js/options.js
const optionsHtml = fs.readFileSync('options.html', 'utf8');
const optionsJs = fs.readFileSync('js/options.js', 'utf8');
const optionsIds = [...optionsJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const missingOptionsIds = optionsIds.filter(id => !optionsHtml.includes(`id="${id}"`) && !optionsHtml.includes(`id='${id}'`));
console.log('Options HTML Missing IDs:', missingOptionsIds);

// 3. Check CSS rules in content.css
const contentJs = fs.readFileSync('js/content.js', 'utf8');
const contentCss = fs.readFileSync('css/content.css', 'utf8');

const idsInContentJs = [...contentJs.matchAll(/\bid\s*=\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const classesInContentJs = [...contentJs.matchAll(/\bclass\s*=\s*['"]([^'"]+)['"]/g)].flatMap(m => m[1].split(/\s+/));

// Check all IDs created in content.js
const uniqueIds = Array.from(new Set(idsInContentJs));
const missingIdsInCss = uniqueIds.filter(id => {
  return !contentCss.includes(id);
});
console.log('IDs in content.js missing from content.css:', missingIdsInCss);

const uniqueClasses = Array.from(new Set(classesInContentJs)).filter(c => c && !c.includes('{') && !c.includes('+') && !c.includes('$'));
const missingClassesInCss = uniqueClasses.filter(cls => !contentCss.includes(cls));
console.log('Classes in content.js missing from content.css:', missingClassesInCss);

const totalMissing = missingPopupIds.length + missingOptionsIds.length + missingIdsInCss.length + missingClassesInCss.length;
if (totalMissing > 0) {
  console.error(`\n❌ AUDIT FAILED: Found ${totalMissing} missing references.`);
  process.exit(1);
} else {
  console.log('\n✅ AUDIT PASSED: Zero missing IDs or classes detected across all components.');
  process.exit(0);
}
