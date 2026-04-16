const fs = require('fs');
const path = require('path');

const pages = [
  'about.html','news.html','single-news.html','services.html',
  'single-service.html','investors.html','partners.html',
  'contact.html','dashboard.html','products.html','single-product.html','login.html'
];

let totalChanges = 0;

pages.forEach(file => {
  const fp = path.join(__dirname, file);
  if (!fs.existsSync(fp)) { console.log(`SKIP (not found): ${file}`); return; }

  let html = fs.readFileSync(fp, 'utf8');
  const original = html;
  let changes = [];

  // ── 1. Footer logo: 50px → 38px ──────────────────────────────────────────
  if (/footer__logo\s*\{[^}]*height:\s*50px/.test(html)) {
    html = html.replace(
      /(\.footer__logo\s*\{[^}]*?)height:\s*50px([^}]*?)width:\s*50px/g,
      '$1height: 38px$2width: 38px'
    );
    // single-line compact variant
    html = html.replace(
      /\.footer__logo\s*\{\s*height:\s*50px;\s*width:\s*50px;/g,
      '.footer__logo { height: 38px; width: 38px;'
    );
    changes.push('footer logo 50→38px');
  }

  // ── 2. Footer brand-text: 1.6rem → 1.3rem ────────────────────────────────
  if (/footer__brand-text[\s\S]*?font-size:\s*1\.6rem/.test(html)) {
    // multi-line block
    html = html.replace(
      /(\.footer__brand-text\s*\{[^}]*?)font-size:\s*1\.6rem/g,
      '$1font-size: 1.3rem'
    );
    // compact single-line variant
    html = html.replace(
      /(\.footer__brand-text\s*\{\s*font-size:\s*)1\.6rem/g,
      '$11.3rem'
    );
    changes.push('footer brand-text 1.6→1.3rem');
  }

  // ── 3. Contact item: flex-start→center, gap 12→10, margin 0.8→1rem ───────
  // compact single-line (most pages)
  html = html.replace(
    /\.footer__contact-item\s*\{\s*display:\s*flex;\s*align-items:\s*flex-start;\s*gap:\s*12px;\s*font-size:\s*0\.8rem;\s*color:\s*rgba\(255,255,255,0\.6\);\s*margin-bottom:\s*0\.8rem;\s*transition:\s*color 0\.3s;\s*\}/g,
    '.footer__contact-item { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 1rem; transition: color 0.3s; }'
  );
  // multi-line variant (index-style)
  html = html.replace(
    /(\.footer__contact-item\s*\{[\s\S]*?)align-items:\s*flex-start([\s\S]*?gap:\s*)12px([\s\S]*?margin-bottom:\s*)0\.8rem/g,
    '$1align-items: center$2 10px$3 1rem'
  );
  if (original !== html) changes.push('contact-item alignment+gap+margin');

  // ── 4. Contact item icon: normalize to 34px / 10px radius / 1rem font ────
  // 40px × 40px variant
  html = html.replace(
    /(\.footer__contact-item\s*i\s*\{[\s\S]*?)width:\s*40px;\s*height:\s*40px/g,
    '$1width: 34px; height: 34px'
  );
  // 36px × 36px variant (already close — keep consistent at 34px)
  html = html.replace(
    /(\.footer__contact-item\s*i\s*\{[\s\S]*?)width:\s*36px;\s*height:\s*36px/g,
    '$1width: 34px; height: 34px'
  );
  // inline single-line variants
  html = html.replace(/width:\s*40px;\s*height:\s*40px(;[^}]*border-radius:\s*12px)/g, 'width: 34px; height: 34px$1');
  html = html.replace(/width:\s*36px;\s*height:\s*36px/g, 'width: 34px; height: 34px');

  // border-radius 12px→10px in icon block
  html = html.replace(
    /(\.footer__contact-item\s*i\s*\{[\s\S]*?)border-radius:\s*12px/g,
    '$1border-radius: 10px'
  );
  // font-size 1.1rem in icon block only (use multiline with lookahead)
  html = html.replace(
    /(\.footer__contact-item\s*i\s*\{[^}]*?)font-size:\s*1\.1rem/g,
    '$1font-size: 1rem'
  );
  if (original !== html) changes.push('contact-item icon size');

  // ── 5. Mobile: add footer logo + brand-text overrides ────────────────────
  // Find the mobile footer block and inject logo/brand overrides after the brand text line
  // Pattern: inside @media (max-width: 991.98px) block, after .footer { text-align: center !important; }
  // and after .footer .d-flex { ... }, insert the logo and brand overrides if not already there

  if (!html.includes('footer__logo') || !html.match(/footer__logo\s*\{[^}]*?30px/)) {
    // Insert after .footer .d-flex block in mobile media query
    html = html.replace(
      /(\s*\.footer\s*\.d-flex\s*\{[^}]*\})/,
      '$1\n\n      .footer__logo {\n        height: 30px !important;\n        width: 30px !important;\n      }\n\n      .footer__brand-text {\n        font-size: 1.1rem !important;\n      }'
    );
    changes.push('added mobile footer logo+brand overrides');
  }

  // ── 6. Mobile contact-item: column → row ─────────────────────────────────
  // Replace various mobile footer__contact-item patterns
  html = html.replace(
    /\.footer__contact-item\s*\{\s*flex-direction:\s*column\s*!important;\s*align-items:\s*center\s*!important;\s*text-align:\s*center\s*!important;\s*gap:\s*8px\s*!important;\s*margin-bottom:\s*[\d.]+rem\s*!important;\s*\}/g,
    '.footer__contact-item { flex-direction: row !important; align-items: center !important; justify-content: center !important; text-align: left !important; gap: 10px !important; margin-bottom: 1rem !important; }'
  );
  // multi-line variant
  html = html.replace(
    /\.footer__contact-item\s*\{\s*\n\s*flex-direction:\s*column\s*!important;\s*\n\s*align-items:\s*center\s*!important;\s*\n\s*text-align:\s*center\s*!important;\s*\n\s*gap:\s*8px\s*!important;\s*\n\s*margin-bottom:\s*[\d.]+rem\s*!important;\s*\n\s*\}/g,
    '.footer__contact-item {\n        flex-direction: row !important;\n        align-items: center !important;\n        justify-content: center !important;\n        text-align: left !important;\n        gap: 10px !important;\n        margin-bottom: 1rem !important;\n      }'
  );
  if (original !== html) changes.push('mobile contact-item column→row');

  // ── 7. Mobile contact-item i: margin-bottom:4px → flex-shrink:0 ──────────
  html = html.replace(
    /\.footer__contact-item\s*i\s*\{\s*margin-bottom:\s*4px;\s*\}/g,
    '.footer__contact-item i { flex-shrink: 0; }'
  );
  if (original !== html) changes.push('mobile contact-item i fix');

  // ── Write if changed ──────────────────────────────────────────────────────
  if (html !== original) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log(`✓ ${file}  [${changes.join(' | ')}]`);
    totalChanges++;
  } else {
    console.log(`– ${file}  (no changes needed)`);
  }
});

console.log(`\nDone. ${totalChanges} file(s) updated.`);
