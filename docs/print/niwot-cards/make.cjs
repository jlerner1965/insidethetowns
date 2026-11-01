const QR = require('qrcode');
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const R = '/home/user/insidethetowns';
const OUT = R + '/docs/print/niwot-cards';
const F = R + '/node_modules/@fontsource-variable';
const GREEN = '#007C47', RUST = '#A26449', INK = '#1F2A30', MUTED = '#4A5960';
const SHOPS = [
  ['general', 'Any location', 'card'],
  ['oldoak', 'The Old Oak Coffeehouse', 'card-oldoak'],
  ['winot', 'Winot Coffee Company', 'card-winot'],
  ['inkberry', 'Inkberry Books', 'card-inkberry'],
  ['market', 'Niwot Market', 'card-market'],
  ['loveicecream', 'Love Ice Cream', 'card-love'],
  ['wheelhouse', 'The Wheel House', 'card-wheel'],
  ['fritz', 'Fritz Family Brewers', 'card-fritz'],
  ['tavern', 'Niwot Tavern', 'card-tavern'],
  ['gardengate', 'Garden Gate Cafe', 'card-garden'],
  ['littlebird', 'Little Bird', 'card-bird'],
];
// Avery 8371 / 5874: US Letter, 2 x 5 cards of 3.5 x 2 in, no gutters, 0.75 in side and 0.5 in top margins.
const pos = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) pos.push([0.75 + c * 3.5, 0.5 + r * 2]);
const css = `
@font-face{font-family:Fraunces;src:url(file://${F}/fraunces/files/fraunces-latin-opsz-normal.woff2) format('woff2');font-weight:100 900;font-style:normal}
@font-face{font-family:Fraunces;src:url(file://${F}/fraunces/files/fraunces-latin-opsz-italic.woff2) format('woff2');font-weight:100 900;font-style:italic}
@font-face{font-family:Instrument;src:url(file://${F}/instrument-sans/files/instrument-sans-latin-wght-normal.woff2) format('woff2');font-weight:100 900}
@page{size:8.5in 11in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:8.5in;height:11in;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{position:relative;font-family:Instrument,sans-serif;color:${INK}}
.sheet{position:relative;width:8.5in;height:11in;page-break-after:always;overflow:hidden}.sheet:last-child{page-break-after:auto}
.label{position:absolute;left:.75in;top:.2in;font-size:7pt;color:#888}
.card{position:absolute;width:3.5in;height:2in;padding:.19in .2in .17in .2in;display:flex;gap:.12in}
.outline .card{outline:.5pt solid #bbb;outline-offset:-.25pt}
.bar{position:absolute;left:.2in;right:.2in;top:.13in;height:2.2pt;border-radius:2pt;background:linear-gradient(90deg,${GREEN},${RUST})}
.l{flex:1;display:flex;flex-direction:column;padding-top:.06in}
.brand{font-family:Fraunces;font-size:12.5pt;line-height:1;color:${INK}}
.brand i{font-weight:380}.brand b{font-weight:600;color:${GREEN}}
.h{font-family:Fraunces;font-weight:620;font-size:11pt;line-height:1.15;margin-top:.07in;letter-spacing:-.1pt}
.sub{font-size:7.4pt;line-height:1.3;color:${MUTED};margin-top:.05in}
.url{margin-top:auto;font-weight:650;font-size:9.6pt;color:${GREEN};letter-spacing:.1pt}
.r{width:.9in;display:flex;flex-direction:column;align-items:center;padding-top:.04in}
.r svg{width:.9in;height:.9in;display:block}
.cta{font-weight:650;font-size:6.8pt;line-height:1.2;text-align:center;margin-top:.03in}
.back .h{font-size:11.5pt}
.rule{height:.5pt;background:#ccd3d6;margin:.07in 0 .06in}
.ask{font-size:7.6pt;line-height:1.3}.ask b{font-weight:650}.ask span{color:${GREEN};font-weight:650}
.fine{font-size:6.2pt;color:${MUTED};margin-top:auto}
`;
const front = (svg) => `<div class="bar"></div><div class="l"><div class="brand"><i>Inside</i> <b>Niwot</b></div><div class="h">What’s happening in Niwot this weekend?</div><div class="sub">Events, places to eat and things to do, checked every week.</div><div class="url">insideniwot.com</div></div><div class="r">${svg}<div class="cta">Scan to see<br>what’s on</div></div>`;
const back = `<div class="bar"></div><div class="l back"><div class="brand"><i>Inside</i> <b>Niwot</b></div><div class="h">The week in Niwot, every Thursday.</div><div class="sub">The week’s events, the scores and what opened or closed, free by email. Sign up at <b style="color:${GREEN}">insideniwot.com</b></div><div class="rule"></div><div class="ask"><b>Know of an event?</b> Tell us at <span>insideniwot.com/submit-event</span></div><div class="fine">An independent community guide.</div></div>`;
const sheet = (cards, label) => `<div class="sheet"><div class="label">${label}</div>${pos.map(([x, y]) => `<div class="card" style="left:${x}in;top:${y}in">${cards}</div>`).join('')}</div>`;
const page = (cards, label = '', cls = '') => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body class="${cls}">${label ? `<div class="label">${label}</div>` : ''}${pos.map(([x, y]) => `<div class="card" style="left:${x}in;top:${y}in">${cards}</div>`).join('')}</body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const pdf = async (html, file) => { const f = '/tmp/cards/page.html'; fs.writeFileSync(f, html); fs.writeFileSync('/tmp/cards/html-' + file.replace('.pdf','.html'), html); await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.pdf({ path: path.join(OUT, file), width: '8.5in', height: '11in', printBackground: true, preferCSSPageSize: true }); };
  for (const [slug, name, ref] of SHOPS) {
    const url = `https://insideniwot.com/?ref=${ref}`;
    const q = QR.create(url, { errorCorrectionLevel: 'M' });
    const svg = await QR.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, color: { dark: '#000000', light: '#ffffff' } });
    await pdf(`<!doctype html><html><head><meta charset="utf-8"><style>${css} html,body{height:auto}</style></head><body>${sheet(front(svg), `Page 1, side 1 · ${name} · ${url} · Avery 8371/5874 · Actual size (100%)`)}${sheet(back, `Page 2, side 2 · ${name} · turn the sheet over and feed it again`)}</body></html>`, `${slug}.pdf`);
    console.log(slug, 'QR version', q.version, url);
    if (slug === 'oldoak') {
      fs.writeFileSync('/tmp/cards/one.html', `<!doctype html><html><head><meta charset="utf-8"><style>${css} body{width:7.4in;height:2.4in;background:#e9e6df} .card{background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25)}</style></head><body><div class="card" style="left:.15in;top:.2in">${front(svg)}</div><div class="card" style="left:3.75in;top:.2in">${back}</div></body></html>`);
    }
  }
  await pdf(page('', 'Alignment test · print on PLAIN paper at Actual size, hold over a card sheet against a window', 'outline'), 'alignment-test.pdf');
  await p.setViewportSize({ width: 711, height: 230 }); await p.goto('file:///tmp/cards/one.html'); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(OUT, 'preview.png'), scale: 'device' });
  const p2 = await b.newPage({ deviceScaleFactor: 3, viewport: { width: 711, height: 230 } }); await p2.goto('file:///tmp/cards/one.html'); await p2.evaluate(() => document.fonts.ready); await p2.screenshot({ path: path.join(OUT, 'preview.png') });
  await b.close();
})();
