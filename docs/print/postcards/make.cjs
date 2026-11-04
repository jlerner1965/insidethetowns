// Postcards for Avery 3380: US Letter, 2 x 2 cards of 4.25 x 5.5 in, no
// margins, micro-perforated on the centre lines. Each card is printed
// landscape (5.5 x 4.25), so every card is rotated inside its cell. Run from
// the repo root after `npm ci`: node docs/print/postcards/make.cjs
const QR = require('qrcode');
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const R = path.resolve(__dirname, '../../..');
const OUT = __dirname;
const TMP = process.env.POSTCARD_TMP || '/tmp/postcards';
const F = R + '/node_modules/@fontsource-variable';
const INK = '#1F2A30', MUTED = '#4A5960';
// name, domain, primary, accent, the home page's own line, from src/config/towns/<slug>.ts (4 Nov 2026)
const TOWNS = [
  ['niwot', 'Niwot', 'insideniwot.com', '#007C47', '#A26449', 'Old Town, the trails, and the people who run the place.'],
  ['lyons', 'Lyons', 'insidelyons.com', '#022C66', '#A3482D', 'Sandstone, the river, and a music festival.'],
  ['berthoud', 'Berthoud', 'insideberthoud.com', '#572932', '#C39B50', 'The Garden Spot: a real Main Street and the lakes.'],
];
// Cell origins, inches. The card inside each cell is 5.5 wide x 4.25 tall,
// turned so its top edge lies along the sheet's left edge (front) or right
// edge (back): after the sheet is turned over along its long edge, both tops
// are the same physical edge, so the card flips like a postcard does.
const cells = [[0, 0], [4.25, 0], [0, 5.5], [4.25, 5.5]];
const SAFE = 0.3; // inches kept clear inside every card edge: inkjets cannot print to the sheet's edge
const css = (primary, accent) => `
@font-face{font-family:Fraunces;src:url(file://${F}/fraunces/files/fraunces-latin-opsz-normal.woff2) format('woff2');font-weight:100 900;font-style:normal}
@font-face{font-family:Fraunces;src:url(file://${F}/fraunces/files/fraunces-latin-opsz-italic.woff2) format('woff2');font-weight:100 900;font-style:italic}
@font-face{font-family:Instrument;src:url(file://${F}/instrument-sans/files/instrument-sans-latin-wght-normal.woff2) format('woff2');font-weight:100 900}
@page{size:8.5in 11in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:8.5in;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Instrument,sans-serif;color:${INK}}
.sheet{position:relative;width:8.5in;height:11in;page-break-after:always;overflow:hidden}.sheet:last-child{page-break-after:auto}
.label{position:absolute;left:.35in;top:.12in;font-size:6.5pt;color:#999;z-index:2}
.cell{position:absolute;width:4.25in;height:5.5in;overflow:hidden}
.outline .cell{outline:.5pt solid #bbb;outline-offset:-.25pt}
.card{position:absolute;left:0;top:0;width:5.5in;height:4.25in;padding:${SAFE}in;transform-origin:0 0}
.front .card{transform:rotate(-90deg) translate(-5.5in,0)}
.back .card{transform:rotate(90deg) translate(0,-4.25in)}
.bar{flex:none;height:3pt;border-radius:2pt;background:linear-gradient(90deg,${primary},${accent})}
.brand{font-family:Fraunces;line-height:1;color:${INK}}
.brand i{font-weight:380}.brand b{font-weight:600;color:${primary}}
.f{display:flex;flex-direction:column;height:100%}
.f .brand{font-size:26pt;margin-top:.22in}
.f .h{font-family:Fraunces;font-weight:620;font-size:17pt;line-height:1.15;letter-spacing:-.15pt;margin-top:.16in;max-width:3.4in}
.f .sub{font-size:10pt;line-height:1.35;color:${MUTED};margin-top:.1in;max-width:3.3in}
.f .row{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between}
.f .url{font-weight:650;font-size:15pt;color:${primary};letter-spacing:.1pt}
.f .fine{font-size:7.5pt;color:${MUTED};margin-top:.05in}
.f .qr{display:flex;flex-direction:column;align-items:center;width:1.25in}
.f .qr svg{width:1.25in;height:1.25in;display:block}
.f .cta{font-weight:650;font-size:7.5pt;line-height:1.2;text-align:center;margin-top:.02in}
.b{position:relative;height:100%}
.b .brand{font-size:11.5pt}
.b .from{position:absolute;left:0;top:0}
.b .from .mail{font-size:7.5pt;color:${MUTED};margin-top:.05in}
.b .from .mail b{color:${primary};font-weight:650}
.b .divider{position:absolute;left:2.42in;top:.45in;bottom:.35in;width:.5pt;background:#c8cfd3}
.b .stamp{position:absolute;right:0;top:0;width:.85in;height:.95in;border:.5pt dashed #c8cfd3;border-radius:2pt}
.b .line{position:absolute;left:2.65in;right:.1in;height:.5pt;background:#dde2e5}
.b .note{position:absolute;left:0;bottom:0;font-size:6.5pt;color:#8a949a}
`;
const sheet = (inner, label, cls) => `<div class="sheet ${cls}">${label ? `<div class="label">${label}</div>` : ''}${cells.map(([x, y]) => `<div class="cell" style="left:${x}in;top:${y}in"><div class="card">${inner}</div></div>`).join('')}</div>`;
const front = (name, domain, svg, line) => `<div class="f"><div class="bar"></div><div class="brand"><i>Inside</i> <b>${name}</b></div><div class="h">What’s on in ${name} this weekend, and what changed this week.</div><div class="sub">${line} Events, places and things to do, checked every week, and a free email every Thursday.</div><div class="row"><div><div class="url">${domain}</div><div class="fine">An independent community guide.</div></div><div class="qr">${svg}<div class="cta">Scan to see<br>what’s on</div></div></div></div>`;
const back = (name, domain) => `<div class="b"><div class="from"><div class="brand"><i>Inside</i> <b>${name}</b></div><div class="mail"><b>hello@${domain}</b> · ${domain}</div></div><div class="stamp"></div><div class="divider"></div>${[1.55, 1.95, 2.35, 2.75].map((t) => `<div class="line" style="top:${t}in"></div>`).join('')}</div>`;
const html = (body, extra = '', primary = '#555', accent = '#999') => `<!doctype html><html><head><meta charset="utf-8"><style>${css(primary, accent)}${extra}</style></head><body>${body}</body></html>`;
(async () => {
  fs.mkdirSync(TMP, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage();
  const pdf = async (doc, file) => { const f = path.join(TMP, file.replace('.pdf', '.html')); fs.writeFileSync(f, doc); await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.pdf({ path: path.join(OUT, file), width: '8.5in', height: '11in', printBackground: true, preferCSSPageSize: true }); };
  for (const [slug, name, domain, primary, accent, line] of TOWNS) {
    const url = `https://${domain}/?ref=postcard`;
    const q = QR.create(url, { errorCorrectionLevel: 'M' });
    const svg = await QR.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, color: { dark: '#000000', light: '#ffffff' } });
    await pdf(html(sheet(front(name, domain, svg, line), '', 'front') + sheet(back(name, domain), '', 'back'), '', primary, accent), `${slug}.pdf`);
    console.log(slug, 'QR version', q.version, url);
    if (slug === 'niwot') {
      fs.writeFileSync(path.join(TMP, 'one.html'), html(`<div class="cell front" style="left:.2in;top:.2in;width:5.5in;height:4.25in"><div class="card" style="transform:none">${front(name, domain, svg, line)}</div></div><div class="cell back" style="left:5.9in;top:.2in;width:5.5in;height:4.25in"><div class="card" style="transform:none">${back(name, domain)}</div></div>`, `html,body{width:11.6in;height:4.65in;background:#e9e6df} .cell{background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25)}`, primary, accent));
    }
  }
  await pdf(html(sheet('', 'Alignment test · print on PLAIN paper at Actual size, hold over a postcard sheet against a window: the lines should sit on the perforations', 'outline'), ''), 'alignment-test.pdf');
  const p2 = await b.newPage({ deviceScaleFactor: 2, viewport: { width: Math.round(11.6 * 96), height: Math.round(4.65 * 96) } });
  await p2.goto('file://' + path.join(TMP, 'one.html')); await p2.evaluate(() => document.fonts.ready);
  await p2.screenshot({ path: path.join(OUT, 'preview.png') });
  await b.close();
})();
