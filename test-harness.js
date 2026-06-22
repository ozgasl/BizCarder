// Headless functional test harness for BizCarder index.html
// Loads the page in jsdom, injects the qrcode lib as a global, drives the UI
// functions exposed on window, and asserts on the resulting DOM.

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const qrcode = require('qrcode-generator');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} ${extra ? '-> ' + extra : ''}`); }
}

const virtualConsole = new VirtualConsole();
const pageErrors = [];
virtualConsole.on('jsdomError', e => pageErrors.push(e.message));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: undefined,          // don't fetch CDN assets
  virtualConsole,
  pretendToBeVisual: true,
});

const { window } = dom;
// The page expects a global `qrcode` (Kazuhiko Arase). Provide it.
window.qrcode = qrcode;

// Fire load so window.onload -> render() runs.
window.document.addEventListener('DOMContentLoaded', () => {});
window.dispatchEvent(new window.Event('load'));

// Give microtasks a tick, then run assertions.
setTimeout(() => {
  const doc = window.document;

  console.log('\n[1] Page loads without script errors');
  check('no jsdomError during load/render', pageErrors.length === 0, pageErrors.join(' | '));

  console.log('\n[2] Front card renders default content (minimal/TR)');
  const front = doc.getElementById('front-content').innerHTML;
  check('front shows default name', front.includes('Ahmet Yılmaz'));
  check('front shows default title', front.includes('Kıdemli Grafik Tasarımcı'));

  console.log('\n[3] vCard text is well-formed');
  const vcard = window.getVCardText();
  check('starts with BEGIN:VCARD', vcard.startsWith('BEGIN:VCARD'));
  check('ends with END:VCARD', vcard.trim().endsWith('END:VCARD'));
  check('contains FN', /FN:Ahmet Yılmaz/.test(vcard));

  console.log('\n[4] PREVIEW QR code renders an <img>');
  const previewQrBox = doc.getElementById('back-qr-code-box');
  check('back-qr-code-box exists', !!previewQrBox);
  check('preview QR has <img>', !!(previewQrBox && previewQrBox.querySelector('img')));

  console.log('\n[5] PRINT/PDF QR code renders an <img>  (key README feature)');
  const printQrBox = doc.getElementById('print-qr-code-box');
  check('print-qr-code-box exists in DOM', !!printQrBox,
        'no element with id print-qr-code-box was produced');
  check('print QR has <img>', !!(printQrBox && printQrBox.querySelector('img')),
        'print card has no QR image -> printed PDF back side will be blank');

  // Diagnose duplicate-id issue
  const dupQr = doc.querySelectorAll('#back-qr-code-box').length;
  console.log(`    (diagnostic) elements with id "back-qr-code-box": ${dupQr} (HTML ids must be unique)`);

  console.log('\n[6] Template switching works');
  window.setTemplate('dark-elegant');
  const darkFront = doc.getElementById('front-content').innerHTML;
  check('dark-elegant renders', darkFront.length > 0 && darkFront.includes('Ahmet Yılmaz'));
  window.setTemplate('split');
  check('split renders', doc.getElementById('front-content').innerHTML.includes('Ahmet Yılmaz'));
  window.setTemplate('corporate');
  check('corporate renders', doc.getElementById('front-content').innerHTML.includes('Kreatif'));
  window.setTemplate('minimal');

  console.log('\n[7] Language switch updates UI strings');
  window.setLanguage('en');
  check('print button translated to EN', doc.querySelector('[data-i18n="printBtn"]').textContent.includes('Print'));
  window.setLanguage('tr');

  console.log('\n[8] HTML-injection / escaping in user fields');
  doc.getElementById('input-name').value = '<img src=x onerror=alert(1)>';
  doc.getElementById('input-name').dispatchEvent(new window.Event('input'));
  const fc = doc.getElementById('front-content');
  // Robust check: did the field create a live element node instead of staying text?
  const injectedImgs = Array.from(fc.querySelectorAll('img'))
    .filter(img => (img.getAttribute('onerror') || '').includes('alert'));
  check('name field does not inject live HTML elements', injectedImgs.length === 0,
        'unescaped user input is injected via innerHTML (XSS / layout break risk)');
  doc.getElementById('input-name').value = 'Ahmet Yılmaz';
  doc.getElementById('input-name').dispatchEvent(new window.Event('input'));

  console.log('\n[9] vCard special-character handling');
  doc.getElementById('input-company').value = 'Acme; Inc, "R&D"';
  doc.getElementById('input-company').dispatchEvent(new window.Event('input'));
  const vc2 = window.getVCardText();
  const orgLine = vc2.split('\n').find(l => l.startsWith('ORG:'));
  check('vCard ORG escapes ; and ,', /ORG:Acme\\;/.test(vc2) || /ORG:Acme\\,/.test(vc2),
        `unescaped per RFC6350: "${orgLine}"`);

  console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
  process.exit(0);
}, 300);
