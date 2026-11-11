/* =====================================================================
   So funktioniert Docker – Erklär-Szenen (PAKET.tafel, angezeigt von js/tafel.js)
   Nach der Präsentation „Mini-Docker-Schulung“ (FIAE 11): Wohnen der Apps,
   Image/Container, docker run, Lebenszyklus, Build·Ship·Run, Port-Mapping,
   Daten, Compose. Jede Szene gehört zu einem Raum (station) und ist dort über
   den Knopf „💡 So funktioniert's“ erreichbar. Erklärungen in einfacher
   Sprache: EINFACH.tafel in js/sprache.js.
   ===================================================================== */
(function () {
  var E = KIT.el;
  var DK_CSS =
    '.dk{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-size:1.2rem;padding:8px}' +
    '.dk-reihe{display:flex;gap:14px;align-items:stretch;justify-content:center;flex-wrap:wrap;width:100%}' +
    '.dk-spalte{display:flex;flex-direction:column;gap:8px;align-items:stretch}' +
    '.dk-box{background:var(--card);border:3px solid var(--line);border-radius:14px;padding:10px 14px;text-align:center;min-width:120px;transition:opacity .25s,outline-color .25s}' +
    '.dk-box b{display:block;font-size:1.3rem}.dk-box small{display:block;color:var(--ink-soft);font-size:.95rem}' +
    '.dk-img{border-color:#2563eb;background:#eff6ff}.dk-con{border-color:#16a34a;background:#f0fdf4}.dk-reg{border-color:#9333ea;background:#faf5ff}' +
    '.dk-vol{border-color:#d97706;background:#fffbeb}.dk-os{border-color:#64748b;background:#f1f5f9}.dk-net{border:3px dashed #0891b2;background:#ecfeff;border-radius:16px;padding:12px}' +
    '.dk-pfeil{align-self:center;font-size:2rem;line-height:1;color:var(--ink-soft);font-weight:800;text-align:center;min-width:70px;transition:opacity .25s}' +
    '.dk-pfeil small{display:block;font-size:.9rem;font-family:ui-monospace,Consolas,monospace;font-weight:700;color:var(--ink)}' +
    '.dk-code{font-family:ui-monospace,Consolas,monospace;background:#0f172a;color:#e2e8f0;border-radius:10px;padding:10px 14px;font-size:1.05rem;white-space:pre;text-align:left}' +
    '.dk-an{outline:5px solid var(--accent);outline-offset:3px}.dk-aus{opacity:.18}.dk-weg{visibility:hidden}' +
    '.dk-ok{color:var(--ok);font-weight:800}.dk-bad{color:var(--bad);font-weight:800}' +
    '.dk-gross{font-size:1.5rem;font-weight:800;text-align:center}.dk-etikett{font-size:1.05rem;color:var(--ink-soft);text-align:center}' +
    '.dk-liste{font-family:ui-monospace,Consolas,monospace;font-size:1rem;text-align:left;margin-top:6px}' +
    '.dk-chip{display:inline-block;border-radius:999px;padding:2px 10px;margin:3px;font-family:ui-monospace,Consolas,monospace;font-size:1rem;background:#dcfce7;border:2px solid #16a34a}' +
    '.dk-nw{flex-wrap:nowrap}.dk-nw>.dk-box{min-width:0;padding:8px 10px}.dk-nw>.dk-pfeil{min-width:46px}' +
    /* Startkarte „Was ist eigentlich Docker?“ hervorheben – gleiche Farbe wie der 💡-Knopf in den Räumen */
    '.dk-start{background:linear-gradient(135deg,#fef3c7,#fde68a);border:3px solid #f59e0b;border-left-width:10px;box-shadow:0 6px 18px rgba(217,119,6,.25)}' +
    '.dk-start h2{color:#78350f;font-size:1.45rem;margin-top:0}.dk-start p{color:#422006}.dk-start .tafel-hinweis-icon svg{color:#b45309;width:52px;height:52px}' +
    '.dk-start button{background:#d97706;border-color:#b45309;color:#fff;font-weight:700;min-height:48px;padding:6px 18px}.dk-start button:hover{background:#b45309}' +
    '.dk-band{font-weight:800;letter-spacing:.08em;color:var(--accent);font-size:1rem}';
  function stil() { if (!document.getElementById('dk-css')) { var s = document.createElement('style'); s.id = 'dk-css'; s.textContent = DK_CSS; document.head.appendChild(s); } }
  function buehne(box) { stil(); var d = E('div', { class: 'dk' }); box.appendChild(d); return d; }
  function kasten(art, titel, unter, extra) { return E('div', { class: 'dk-box ' + (art || '') }, [E('b', { html: titel })].concat(unter ? [E('small', { html: unter })] : []).concat(extra || [])); }
  function pfeil(zeichen, text) { return E('div', { class: 'dk-pfeil' }, [E('span', { text: zeichen })].concat(text ? [E('small', { html: text })] : [])); }


  /* ---------- Bilder für die Vergleiche (SVG, keine externen Dateien) ---------- */
  var TXT = 'font-family="system-ui,sans-serif" text-anchor="middle"';
  function svg(vb, breite, inhalt, label) { return '<svg viewBox="' + vb + '" style="width:' + breite + ';max-width:100%;height:auto;display:block;margin:0 auto" role="img" aria-label="' + label + '">' + inhalt + '</svg>'; }
  function bild(html) { return E('div', { style: 'width:100%', html: html }); }
  function kachel(x, y, w, h, fuell, rand, text, dreh) {
    return '<g' + (dreh ? ' transform="rotate(' + dreh + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')"' : '') + '><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7" fill="' + fuell + '" stroke="' + rand + '" stroke-width="3"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 7) + '" font-size="19" font-weight="700" fill="#0f172a" ' + TXT + '>' + text + '</text></g>';
  }
  function balken(x, y, w, h, farbe, text, schrift) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + farbe + '"/><text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 7) + '" font-size="' + (schrift || 18) + '" font-weight="700" fill="#fff" ' + TXT + '>' + text + '</text>';
  }
  var GRUEN = ['#dcfce7', '#16a34a'], BLAU = ['#dbeafe', '#2563eb'], GELB = ['#fef3c7', '#d97706'];
  var BILD = {
    /* WG: ein Haus, alle Apps durcheinander in einem Raum */
    wg: function () {
      return svg('0 0 600 340', '620px',
        '<polygon points="130,125 300,30 470,125" fill="#cbd5e1" stroke="#475569" stroke-width="4"/>' +
        '<rect x="150" y="125" width="300" height="140" fill="#fff" stroke="#475569" stroke-width="4"/>' +
        '<text x="300" y="158" font-size="20" font-weight="800" fill="#dc2626" ' + TXT + '>⚡ Python 3.8 ↔ 3.12 ⚡</text>' +
        kachel(170, 180, 110, 40, GRUEN[0], GRUEN[1], 'App A', -9) + kachel(310, 190, 110, 40, BLAU[0], BLAU[1], 'App B', 7) + kachel(235, 214, 110, 40, GELB[0], GELB[1], 'App C', -3) +
        balken(135, 265, 330, 34, '#475569', L('ein Betriebssystem für alle', 'ein Betriebssystem für alle')) +
        balken(110, 299, 380, 34, '#1e293b', 'Hardware'),
        L('Ein Haus mit einem Raum, drei Apps darin', '1 Haus mit 1 Raum und 3 Apps'));
    },
    /* Reihenhäuser: jedes Haus mit Dach, Schornstein (eigene Heizung) und eigenem Fundament */
    reihenhaus: function () {
      var h = '', apps = [['App A', GRUEN], ['App B', BLAU], ['App C', GELB]];
      apps.forEach(function (a, i) {
        var x = 80 + i * 150;
        h += '<rect x="' + (x + 84) + '" y="62" width="16" height="40" fill="#7c2d12"/><text x="' + (x + 92) + '" y="54" font-size="22" ' + TXT + '>💨</text>' +
          '<polygon points="' + (x - 6) + ',128 ' + (x + 65) + ',62 ' + (x + 136) + ',128" fill="#b91c1c" stroke="#7f1d1d" stroke-width="3"/>' +
          '<rect x="' + x + '" y="128" width="130" height="100" fill="#fff7ed" stroke="#7f1d1d" stroke-width="3"/>' +
          kachel(x + 12, 142, 106, 36, a[1][0], a[1][1], a[0]) +
          '<rect x="' + (x + 52) + '" y="190" width="26" height="38" fill="#7f1d1d"/>' +
          balken(x - 6, 228, 142, 30, '#64748b', L('eigenes OS', 'eigenes OS'), 16) +
          '<text x="' + (x + 65) + '" y="276" font-size="15" fill="#475569" ' + TXT + '>🔥 ' + L('eigene Heizung', 'eigene Heizung') + '</text>';
      });
      return svg('0 0 600 350', '640px', h + balken(60, 284, 480, 30, '#94a3b8', 'Hypervisor') + balken(40, 314, 520, 34, '#1e293b', L('Host-Betriebssystem · Hardware', 'Host-Betriebssystem · Hardware')),
        L('Drei Reihenhäuser, jedes mit eigenem Fundament und eigener Heizung', '3 Reihenhäuser, jedes mit eigenem Fundament'));
    },
    /* Mehrfamilienhaus: drei Wohnungen, eigene Türen, ein gemeinsames Fundament */
    mehrfamilienhaus: function () {
      var h = '<rect x="182" y="18" width="236" height="16" fill="#334155"/><rect x="190" y="34" width="220" height="198" fill="#fff" stroke="#334155" stroke-width="4"/>';
      [['App A', GRUEN], ['App B', BLAU], ['App C', GELB]].forEach(function (a, i) {
        var y = 40 + i * 64;
        if (i) h += '<line x1="190" y1="' + (y - 4) + '" x2="410" y2="' + (y - 4) + '" stroke="#94a3b8" stroke-width="3"/>';
        h += kachel(204, y + 8, 120, 40, a[1][0], a[1][1], a[0]) + '<rect x="350" y="' + (y + 2) + '" width="34" height="54" rx="3" fill="#94a3b8"/><circle cx="377" cy="' + (y + 31) + '" r="3" fill="#334155"/>';
      });
      return svg('0 0 600 340', '620px', h + balken(170, 232, 260, 32, '#2563eb', 'Docker Engine') + balken(140, 264, 320, 36, '#e11d48', L('gemeinsamer Linux-Kernel', 'gemeinsamer Linux-Kernel')) + balken(110, 300, 380, 36, '#1e293b', 'Hardware'),
        L('Ein Mehrfamilienhaus mit drei Wohnungen auf einem Fundament', '1 Haus mit 3 Wohnungen auf 1 Fundament'));
    },
    /* Schiff mit lauter gleich großen Containern */
    schiff: function () {
      var h = '', farben = ['#16a34a', '#2563eb', '#d97706', '#9333ea', '#e11d48', '#0891b2'];
      for (var r = 0; r < 2; r++) for (var c = 0; c < 4; c++) {
        var x = 120 + c * 80, y = 118 - r * 44, f = farben[(r * 4 + c) % farben.length];
        h += '<rect x="' + x + '" y="' + y + '" width="76" height="40" fill="' + f + '" stroke="#0f172a" stroke-width="2"/>';
        for (var l = 1; l < 5; l++) h += '<line x1="' + (x + l * 15) + '" y1="' + (y + 4) + '" x2="' + (x + l * 15) + '" y2="' + (y + 36) + '" stroke="rgba(0,0,0,.25)" stroke-width="2"/>';
      }
      h += '<polygon points="70,160 530,160 490,225 110,225" fill="#1e3a8a"/><rect x="452" y="88" width="54" height="72" fill="#e2e8f0" stroke="#1e3a8a" stroke-width="3"/>' +
        '<path d="M0 240 Q 37 228 75 240 T 150 240 T 225 240 T 300 240 T 375 240 T 450 240 T 525 240 T 600 240" fill="none" stroke="#38bdf8" stroke-width="5"/>' +
        '<text x="300" y="282" font-size="22" font-weight="700" fill="#0f172a" ' + TXT + '>💻 Laptop  =  🏫 ' + L('Schulserver', 'Schulserver') + '  =  ☁️ Cloud</text>';
      return svg('0 0 600 300', '620px', h, L('Containerschiff mit gleich großen Containern', 'Schiff mit gleich großen Containern'));
    },
    /* kleine Bilder für die Kästen */
    bauplan: function () {
      var g = '';
      for (var i = 10; i < 80; i += 10) g += '<line x1="' + i + '" y1="4" x2="' + i + '" y2="56" stroke="rgba(255,255,255,.18)"/>';
      for (var j = 10; j < 60; j += 10) g += '<line x1="4" y1="' + j + '" x2="76" y2="' + j + '" stroke="rgba(255,255,255,.18)"/>';
      return svg('0 0 80 60', '96px', '<rect x="2" y="2" width="76" height="56" rx="4" fill="#1e40af"/>' + g +
        '<polyline points="20,32 40,14 60,32" fill="none" stroke="#fff" stroke-width="2.5"/><rect x="25" y="32" width="30" height="18" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 2"/>', L('Bauplan', 'Bauplan'));
    },
    haus: function (farbe, rand) {
      return svg('0 0 64 58', '64px', '<polygon points="4,27 32,5 60,27" fill="' + rand + '"/><rect x="10" y="27" width="44" height="28" fill="' + farbe + '" stroke="' + rand + '" stroke-width="3"/>' +
        '<rect x="27" y="37" width="10" height="18" fill="' + rand + '"/><rect x="15" y="33" width="8" height="8" fill="#fff" stroke="' + rand + '" stroke-width="2"/><rect x="41" y="33" width="8" height="8" fill="#fff" stroke="' + rand + '" stroke-width="2"/>', L('gebautes Haus', 'gebautes Haus'));
    },
    regal: function () {
      var h = '<rect x="4" y="4" width="92" height="66" fill="none" stroke="#6b21a8" stroke-width="3"/><line x1="4" y1="37" x2="96" y2="37" stroke="#6b21a8" stroke-width="3"/>';
      ['#16a34a', '#2563eb', '#d97706', '#e11d48', '#0891b2', '#9333ea'].forEach(function (f, i) { h += '<rect x="' + (10 + (i % 3) * 28) + '" y="' + (i < 3 ? 12 : 45) + '" width="24" height="22" fill="' + f + '"/>'; });
      return svg('0 0 100 74', '92px', h, L('Regal mit Images', 'Regal mit Images'));
    },
    bett: function () {
      return svg('0 0 90 56', '84px', '<rect x="6" y="8" width="10" height="44" rx="2" fill="#7c2d12"/><rect x="16" y="28" width="68" height="16" rx="3" fill="#fff" stroke="#475569" stroke-width="2"/>' +
        '<rect x="20" y="20" width="18" height="10" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="2"/><rect x="40" y="24" width="44" height="8" rx="3" fill="#86efac"/><rect x="78" y="44" width="5" height="8" fill="#7c2d12"/><text x="68" y="16" font-size="14" ' + TXT + '>🛎️</text>', L('Hotelbett', 'Hotelbett'));
    },
    schliessfach: function () {
      return svg('0 0 70 70', '64px', '<rect x="4" y="4" width="62" height="62" rx="4" fill="#94a3b8" stroke="#334155" stroke-width="3"/><line x1="35" y1="4" x2="35" y2="66" stroke="#334155" stroke-width="2"/><line x1="4" y1="35" x2="66" y2="35" stroke="#334155" stroke-width="2"/>' +
        '<rect x="40" y="40" width="22" height="22" fill="#fde68a" stroke="#334155" stroke-width="2"/><circle cx="51" cy="48" r="3.5" fill="#334155"/><rect x="50" y="48" width="2" height="8" fill="#334155"/>', L('Schließfach', 'Schließfach'));
    },
    ordner: function () {
      return svg('0 0 76 58', '68px', '<path d="M4 12 h24 l6 7 h38 v35 h-68 z" fill="#f59e0b" stroke="#92400e" stroke-width="3"/><rect x="4" y="22" width="68" height="32" fill="#fbbf24" stroke="#92400e" stroke-width="3"/>', L('Ordner', 'Ordner'));
    },
    telefonbuch: function () {
      return svg('0 0 120 76', '120px', '<path d="M60 10 Q 32 2 6 10 V 70 Q 32 62 60 70 Z" fill="#fff" stroke="#334155" stroke-width="3"/><path d="M60 10 Q 88 2 114 10 V 70 Q 88 62 60 70 Z" fill="#fff" stroke="#334155" stroke-width="3"/>' +
        '<text x="33" y="34" font-size="12" font-weight="700" fill="#0f172a" ' + TXT + '>db</text><text x="33" y="52" font-size="12" fill="#0f172a" ' + TXT + '>web</text>' +
        '<text x="87" y="34" font-size="10" fill="#0f172a" ' + TXT + '>172.18.0.2</text><text x="87" y="52" font-size="10" fill="#0f172a" ' + TXT + '>172.18.0.3</text>', L('Telefonbuch', 'Telefonbuch'));
    },
    hafen: function () {
      return svg('0 0 100 60', '92px', '<polygon points="10,34 90,34 80,52 20,52" fill="#1e3a8a"/><rect x="22" y="20" width="18" height="14" fill="#16a34a"/><rect x="41" y="20" width="18" height="14" fill="#2563eb"/><rect x="60" y="20" width="18" height="14" fill="#d97706"/>' +
        '<path d="M0 56 Q 12 50 25 56 T 50 56 T 75 56 T 100 56" fill="none" stroke="#38bdf8" stroke-width="3"/>', L('Schiff', 'Schiff'));
    }
  };

  /* ---------- 1 · Wie wohnen Apps? ---------- */
  function szWohnen(box, api) {
    var d = buehne(box);
    /* Erklärung rechts passt zur gewählten Ansicht: nur Bare Metal, nur VM … */
    var TEXT_WOHNEN = {
      metal: ['<p><b>Bare Metal:</b> Alle Programme laufen direkt auf einem einzigen Betriebssystem.</p><p><b>Problem:</b> App A braucht Python 3.8, App B braucht Python 3.12. Die beiden kommen sich in die Quere. Das ist wie in einer <b>WG mit nur einem Raum</b>.</p><p>👉 Klicke auf <b>VM</b>.</p>',
        '<p><b>Bare Metal:</b> Alle Programme laufen direkt auf 1 Betriebssystem.</p><p><b>Problem:</b> App A braucht Python 3.8. App B braucht Python 3.12. Die beiden stören sich. Das ist wie in einer <b>WG mit nur 1 Raum</b>.</p><p>👉 Klicke auf <b>VM</b>.</p>'],
      vm: ['<p><b>VM:</b> Jede App bekommt einen eigenen virtuellen Rechner mit <b>eigenem Betriebssystem</b>. So sind die Apps sauber getrennt.</p><p><b>Nachteil:</b> Jede VM braucht viel Speicher und startet langsam. Das ist wie bei <b>Reihenhäusern</b> mit eigener Heizung.</p><p>👉 Klicke auf <b>Container</b>.</p>',
        '<p><b>VM:</b> Jede App bekommt einen eigenen Rechner aus Software. Jeder hat ein <b>eigenes Betriebssystem</b>. So sind die Apps getrennt.</p><p><b>Nachteil:</b> Das braucht viel Speicher. Der Start dauert lange. Das ist wie bei <b>Reihenhäusern</b> mit eigener Heizung.</p><p>👉 Klicke auf <b>Container</b>.</p>'],
      container: ['<p><b>Container:</b> Ein Container enthält nur die App und ihre Bibliotheken, aber <b>kein eigenes Betriebssystem</b>. Alle Container teilen sich den Linux-Kernel des Hosts.</p><p><b>Vorteil:</b> Container sind klein und starten in Sekunden. Das ist wie bei <b>Wohnungen in einem Mehrfamilienhaus</b>.</p><p>👉 Klicke auf <b>Schiffscontainer</b>.</p>',
        '<p><b>Container:</b> Ein Container hat nur die App und ihre Bibliotheken. Der Container hat <b>kein eigenes Betriebssystem</b>. Alle Container teilen sich den Kern vom Host.</p><p><b>Vorteil:</b> Container sind klein. Sie starten in Sekunden. Das ist wie bei <b>Wohnungen in einem Haus</b>.</p><p>👉 Klicke auf <b>Schiffscontainer</b>.</p>'],
      schiff: ['<p>Schiffscontainer haben <b>immer dieselben Maße</b>, egal, was darin steckt. Darum passen sie auf jedes Schiff und jeden Lkw.</p><p>Docker-Container laufen genauso <b>überall gleich</b>: auf dem Laptop, auf dem Schulserver und in der Cloud.</p>',
        '<p>Schiffscontainer haben <b>immer dieselbe Größe</b>. Egal, was drin ist. Darum passen sie auf jedes Schiff und jeden Lkw.</p><p>Docker-Container laufen genauso <b>überall gleich</b>: auf dem Laptop, auf dem Schulserver und in der Cloud.</p>']
    };
    function erklaere(modus) {
      var t = L(TEXT_WOHNEN[modus][0], TEXT_WOHNEN[modus][1]), sz = PAKET.tafel.szenen.filter(function (x) { return x.id === 'wohnen'; })[0];
      sz.erklaerung = t;   // tafel.js liest den Text beim Anzeigen (auch nach E aus/an)
      var feld = document.querySelector('.tafel-erkl .tafel-text');
      if (feld && box.isConnected) feld.innerHTML = t;
    }
    function zeichne(modus) {
      d.innerHTML = '';
      erklaere(modus);
      if (modus === 'metal') {
        d.appendChild(E('div', { class: 'dk-gross', text: L('Bare Metal ≈ WG in einem einzigen Raum', 'Bare Metal ≈ WG in einem einzigen Raum') }));
        d.appendChild(bild(BILD.wg()));
        d.appendChild(E('div', { class: 'dk-etikett', text: L('alles teilt sich alles', 'alle teilen sich alles') }));
      } else if (modus === 'vm') {
        d.appendChild(E('div', { class: 'dk-gross', text: L('Virtuelle Maschinen ≈ Reihenhäuser', 'Virtuelle Maschinen ≈ Reihenhäuser') }));
        d.appendChild(bild(BILD.reihenhaus()));
        d.appendChild(E('div', { class: 'dk-etikett', text: L('jedes Haus: eigenes Fundament, eigene Heizung · ≈ 1–2 GB je VM', 'jedes Haus: eigenes Fundament, eigene Heizung') }));
      } else if (modus === 'container') {
        d.appendChild(E('div', { class: 'dk-gross', text: L('Container ≈ Wohnungen im Mehrfamilienhaus', 'Container ≈ Wohnungen im Mehrfamilienhaus') }));
        d.appendChild(bild(BILD.mehrfamilienhaus()));
        d.appendChild(E('div', { class: 'dk-etikett', text: L('eigene Tür, gemeinsames Fundament · App + Bibliotheken + Laufzeit', 'eigene Tür, gemeinsames Fundament') }));
      } else {
        d.appendChild(E('div', { class: 'dk-gross', text: L('Die Idee: der Schiffscontainer', 'Die Idee: der Schiffscontainer') }));
        d.appendChild(bild(BILD.schiff()));
        d.appendChild(E('div', { class: 'dk-etikett', text: L('gleiche Maße, egal was drin ist – passt auf jedes Schiff, jeden Lkw, jeden Zug', 'gleiche Form, egal was drin ist') }));
      }
    }
    var m = api.werkzeug({ icon: '🏚️', text: 'Bare Metal', taste: 'b', typ: 'modus', aktion: function () { zeichne('metal'); } });
    api.werkzeug({ icon: '🏘️', text: 'VM', taste: 'v', typ: 'modus', aktion: function () { zeichne('vm'); } });
    api.werkzeug({ icon: '🏢', text: 'Container', taste: 'c', typ: 'modus', aktion: function () { zeichne('container'); } });
    api.werkzeug({ icon: '🚢', text: L('Schiffscontainer', 'Schiffscontainer'), taste: 's', typ: 'modus', aktion: function () { zeichne('schiff'); } });
    m.setze(true); zeichne('metal');   // Start mit dem Problem: Bare Metal
    return {};
  }


  /* ---------- Erklärung rechts passend zum Zustand der Szene ----------
     tafel.js zeigt PAKET.tafel.szenen[i].erklaerung; die Szenen setzen den Text bei
     jedem Klick neu (Standard/Einfach über L), so steht rechts nur das Passende. */
  function erklaereSz(id, paar) {
    var t = L(paar[0], paar[1]), sz = PAKET.tafel.szenen.filter(function (x) { return x.id === id; })[0];
    sz.erklaerung = t;
    var feld = document.querySelector('.tafel-erkl .tafel-text');
    if (feld && document.querySelector('.tafel-szene[data-szene="' + id + '"]')) feld.innerHTML = t;
  }
  var TX = {
    klasse: {
      start: ['<p>Ein <b>Image</b> ist ein Bauplan: Programm, Bibliotheken und Einstellungen. Es ist schreibgeschützt.</p><p>👉 Klicke auf <b>docker run</b>.</p>',
        '<p>Ein <b>Image</b> ist ein Bauplan. Darin sind das Programm, die Bibliotheken und die Einstellungen. Man kann es nicht ändern.</p><p>👉 Klicke auf <b>docker run</b>.</p>'],
      run: ['<p>Jedes <code>docker run</code> baut aus dem Bauplan einen <b>neuen Container</b>. Aus einem Image können viele Container laufen.</p><p>👉 Klicke noch einmal auf <b>docker run</b> und dann auf <b>wie in Java</b>.</p>',
        '<p>Jedes <code>docker run</code> baut aus dem Bauplan einen <b>neuen Container</b>. Aus 1 Image können viele Container laufen.</p><p>👉 Klicke noch einmal auf <b>docker run</b>. Klicke dann auf <b>wie in Java</b>.</p>'],
      java: ['<p>Wie in Java: Das Image ist die <b>Klasse</b>, jeder Container ein <b>Objekt</b>. <code>docker run</code> entspricht <code>new Webserver()</code>.</p><p>👉 Klicke auf <b>docker rm</b>.</p>',
        '<p>Das ist wie in Java: Das Image ist die <b>Klasse</b>. Jeder Container ist ein <b>Objekt</b>. <code>docker run</code> ist wie <code>new</code>.</p><p>👉 Klicke auf <b>docker rm</b>.</p>'],
      rm: ['<p><code>docker rm</code> löscht einen Container. Das <b>Image bleibt</b> – du kannst jederzeit neue Container daraus bauen.</p>',
        '<p><code>docker rm</code> löscht einen Container. Das <b>Image bleibt</b>. Du kannst daraus immer neue Container bauen.</p>']
    },
    run: {
      s0: ['<p>Was passiert, wenn du <code>docker run hello-world</code> eintippst?</p><p>👉 Klicke auf <b>Schritt</b>.</p>',
        '<p>Was passiert bei <code>docker run hello-world</code>?</p><p>👉 Klicke auf <b>Schritt</b>.</p>'],
      s1: ['<p>① Du tippst den Befehl im <b>Client</b>. Der Client schickt ihn an den <b>Docker Daemon</b>, der im Hintergrund auf dem Host läuft.</p>',
        '<p>① Du tippst den Befehl im <b>Client</b>. Der Client schickt ihn an den <b>Docker Daemon</b>. Der Daemon läuft auf dem Host.</p>'],
      s2: ['<p>② Der Daemon sucht das Image <code>hello-world</code> auf dem Host. Es ist noch <b>nicht da</b>.</p>',
        '<p>② Der Daemon sucht das Image <code>hello-world</code>. Das Image ist noch <b>nicht da</b>.</p>'],
      s2da: ['<p>② Der Daemon sucht das Image. Diesmal ist es <b>schon da</b> – kein Download nötig.</p>',
        '<p>② Der Daemon sucht das Image. Diesmal ist das Image <b>schon da</b>. Der Daemon muss nichts laden.</p>'],
      s3: ['<p>③ Der Daemon lädt das Image aus der <b>Registry</b> herunter, hier von Docker Hub. Das heißt <b>pull</b>.</p>',
        '<p>③ Der Daemon lädt das Image aus der <b>Registry</b>. Das heißt <b>pull</b>.</p>'],
      s4: ['<p>④ Aus dem Image erstellt der Daemon einen <b>Container</b> und startet ihn.</p>',
        '<p>④ Der Daemon macht aus dem Image einen <b>Container</b> und startet ihn.</p>'],
      s5: ['<p>⑤ Die Ausgabe des Containers erscheint in deinem Terminal.</p><p>👉 Klicke auf <b>noch einmal</b>. Was ist beim zweiten Mal anders?</p>',
        '<p>⑤ Die Ausgabe kommt in dein Terminal.</p><p>👉 Klicke auf <b>noch einmal</b>. Was ist beim 2. Mal anders?</p>'],
      nochmal: ['<p>Jetzt startest du denselben Befehl ein zweites Mal.</p><p>👉 Klicke auf <b>Schritt</b>.</p>',
        '<p>Jetzt kommt derselbe Befehl ein 2. Mal.</p><p>👉 Klicke auf <b>Schritt</b>.</p>'],
      s5da: ['<p>⑤ Fertig – ohne pull, also schneller. Aus demselben Image gibt es jetzt <b>zwei</b> Container.</p>',
        '<p>⑤ Fertig. Ohne pull geht es schneller. Aus 1 Image gibt es jetzt <b>2</b> Container.</p>']
    },
    leben: {
      image: ['<p>Aus einem <b>Image</b> entsteht ein Container.</p><p>👉 Klicke auf <b>create</b> oder gleich auf <b>run</b>.</p>',
        '<p>Aus einem <b>Image</b> entsteht ein Container.</p><p>👉 Klicke auf <b>create</b> oder auf <b>run</b>.</p>'],
      created: ['<p><b>Created:</b> Der Container ist angelegt, läuft aber noch nicht. <code>docker ps -a</code> zeigt ihn schon, <code>docker ps</code> noch nicht.</p><p>👉 Klicke auf <b>start</b>.</p>',
        '<p><b>Created:</b> Der Container ist da. Der Container läuft aber noch nicht. <code>docker ps -a</code> zeigt ihn schon.</p><p>👉 Klicke auf <b>start</b>.</p>'],
      running: ['<p><b>Running:</b> Der Container läuft. Jetzt zeigt ihn auch <code>docker ps</code>. Übrigens: <code>docker run</code> = create + start.</p><p>👉 Klicke auf <b>stop</b>.</p>',
        '<p><b>Running:</b> Der Container läuft. Jetzt zeigt ihn auch <code>docker ps</code>. <code>docker run</code> macht create und start auf einmal.</p><p>👉 Klicke auf <b>stop</b>.</p>'],
      exited: ['<p><b>Exited:</b> Der Container ist gestoppt, aber <b>noch da</b>. Nur <code>docker ps -a</code> zeigt ihn. Mit <b>start</b> läuft er wieder.</p><p>👉 Klicke auf <b>rm</b>.</p>',
        '<p><b>Exited:</b> Der Container ist gestoppt. Der Container ist aber <b>noch da</b>. Nur <code>docker ps -a</code> zeigt ihn.</p><p>👉 Klicke auf <b>rm</b>.</p>'],
      removed: ['<p><b>Removed:</b> Erst <code>docker rm</code> löscht den Container. Jetzt zeigt ihn keine Liste mehr.</p><p>👉 Klicke auf <b>run</b> und dann auf <b>rm</b>.</p>',
        '<p><b>Removed:</b> Erst <code>docker rm</code> löscht den Container. Jetzt ist er in keiner Liste mehr.</p><p>👉 Klicke auf <b>run</b>. Klicke dann auf <b>rm</b>.</p>'],
      rmLaeuft: ['<p>Einen <b>laufenden</b> Container kannst du nicht einfach löschen. Stoppe ihn zuerst mit <b>stop</b> – oder erzwinge das Löschen mit <code>docker rm -f</code>.</p>',
        '<p>Ein Container, der <b>läuft</b>, lässt sich nicht einfach löschen. Stoppe ihn zuerst mit <b>stop</b>. Oder lösche mit <code>docker rm -f</code>.</p>']
    },
    build: {
      b0: ['<p>Im <b>Dockerfile</b> steht das Rezept: <code>FROM</code> nennt das Basis-Image, <code>COPY</code> kopiert eigene Dateien hinein.</p><p>👉 Klicke auf <b>Schritt</b>.</p>',
        '<p>Im <b>Dockerfile</b> steht das Rezept. <code>FROM</code> ist das Basis-Image. <code>COPY</code> bringt eigene Dateien hinein.</p><p>👉 Klicke auf <b>Schritt</b>.</p>'],
      b1: ['<p><b>Build:</b> <code>docker build</code> macht aus dem Dockerfile ein <b>Image</b>. Änderst du später eine Datei, musst du neu bauen.</p>',
        '<p><b>Build:</b> <code>docker build</code> baut aus dem Dockerfile ein <b>Image</b>. Hast du eine Datei geändert? Dann musst du neu bauen.</p>'],
      b2: ['<p><b>Ship:</b> <code>docker push</code> lädt das Image in eine <b>Registry</b> hoch, z. B. Docker Hub.</p>',
        '<p><b>Ship:</b> <code>docker push</code> lädt das Image in eine <b>Registry</b>.</p>'],
      b3: ['<p><code>docker pull</code> holt das Image aus der Registry auf einen anderen Rechner, z. B. auf den Server.</p>',
        '<p><code>docker pull</code> holt das Image auf einen anderen Rechner, zum Beispiel auf den Server.</p>'],
      b4: ['<p><b>Run:</b> <code>docker run</code> startet dort Container – genau so wie auf deinem Rechner.</p>',
        '<p><b>Run:</b> <code>docker run</code> startet dort Container. Sie laufen genauso wie bei dir.</p>']
    },
    ports: {
      start: ['<p>Ein Container ist von außen erst erreichbar, wenn du einen Port weiterleitest. <code>-p 8080:80</code> heißt: <b>Host-Port 8080</b> → <b>Container-Port 80</b>.</p><p>👉 Schalte <b>-p 8081:80</b> ein.</p>',
        '<p>Von außen kommst du nur mit einer Weiterleitung an den Container. <code>-p 8080:80</code>: Links ist der Port vom <b>Host</b>. Rechts ist der Port im <b>Container</b>.</p><p>👉 Schalte <b>-p 8081:80</b> an.</p>'],
      zwei: ['<p>Beide Container nutzen innen Port 80. Auf dem Host brauchen sie aber <b>verschiedene</b> Ports: 8080 und 8081.</p><p>👉 Klicke auf <b>2× 8080</b>.</p>',
        '<p>Innen haben beide Container Port 80. Auf dem Host brauchen sie <b>verschiedene</b> Ports: 8080 und 8081.</p><p>👉 Klicke auf <b>2× 8080</b>.</p>'],
      konflikt: ['<p>Jeden Host-Port gibt es nur <b>einmal</b>. Ist 8080 schon belegt, meldet Docker <code>port is already allocated</code>.</p>',
        '<p>Jeden Host-Port gibt es nur <b>1-mal</b>. Ist 8080 schon belegt, meldet Docker: <code>port is already allocated</code>.</p>'],
      ohne: ['<p>Ohne <code>-p</code> ist der Container von außen <b>nicht erreichbar</b>. Der Browser findet ihn nicht.</p>',
        '<p>Ohne <code>-p</code> kommst du von außen <b>nicht</b> an den Container. Der Browser findet ihn nicht.</p>']
    },
    daten: {
      start: ['<p>Der Container schreibt in seine eigene <b>Container-Schicht</b> (<code>notiz.txt</code>). Daten im <b>Volume</b> und im <b>Ordner</b> liegen außerhalb.</p><p>👉 Klicke auf <b>docker rm</b>.</p>',
        '<p>Der Container speichert in seiner eigenen <b>Schicht</b> (<code>notiz.txt</code>). Das <b>Volume</b> und der <b>Ordner</b> liegen außerhalb.</p><p>👉 Klicke auf <b>docker rm</b>.</p>'],
      schreiben: ['<p>Neue Dateien landen in der Container-Schicht. Sie gehören nur diesem Container.</p><p>👉 Klicke auf <b>docker rm</b>.</p>',
        '<p>Neue Dateien kommen in die Schicht vom Container. Sie gehören nur diesem Container.</p><p>👉 Klicke auf <b>docker rm</b>.</p>'],
      rm: ['<p>Nach <code>docker rm</code> ist die Container-Schicht weg – wie ein <b>Hotelzimmer</b> nach dem Auszug. <b>Volume</b> (Schließfach) und <b>Ordner</b> bleiben.</p><p>👉 Klicke auf <b>neuer Container -v</b>.</p>',
        '<p>Nach <code>docker rm</code> ist die Schicht weg. Das ist wie bei einem <b>Hotelzimmer</b> nach dem Auszug. Das <b>Volume</b> und der <b>Ordner</b> bleiben.</p><p>👉 Klicke auf <b>neuer Container -v</b>.</p>'],
      neu: ['<p>Der neue Container bindet das Volume mit <code>-v</code> wieder ein: <code>hello.txt</code> ist noch da.</p><p>👉 Klicke auf <b>down -v</b>.</p>',
        '<p>Der neue Container holt das Volume mit <code>-v</code> wieder dazu. <code>hello.txt</code> ist noch da.</p><p>👉 Klicke auf <b>down -v</b>.</p>'],
      neuOhne: ['<p>Der neue Container startet mit leerer Schicht. Das Volume wurde gelöscht – seine Daten sind weg.</p>',
        '<p>Der neue Container ist leer. Das Volume ist gelöscht. Seine Daten sind weg.</p>'],
      downv: ['<p><code>docker compose down -v</code> löscht auch das <b>Named Volume</b>. Den <b>Ordner</b> <code>./export</code> auf dem Host löscht Docker nie.</p>',
        '<p><code>down -v</code> löscht auch das <b>Volume</b>. Den <b>Ordner</b> <code>./export</code> auf dem Host löscht Docker nie.</p>']
    },
    netz: {
      start: ['<p>Zwei Container laufen einzeln: <code>web</code> und <code>db</code>. Ohne gemeinsames Netzwerk findet <code>web</code> die Datenbank <b>nicht über ihren Namen</b>.</p><p>👉 Klicke auf <b>network create</b>.</p>',
        '<p>Zwei Container laufen allein: <code>web</code> und <code>db</code>. Ohne gemeinsames Netzwerk findet <code>web</code> die Datenbank <b>nicht</b> über ihren Namen.</p><p>👉 Klicke auf <b>network create</b>.</p>'],
      netz: ['<p>Ein <b>Netzwerk</b> ist wie ein gemeinsamer Flur: Nur wer daran wohnt, kann sich besuchen. Das Netzwerk ist jetzt da, aber noch leer.</p><p>👉 Klicke auf <b>--network netz</b>.</p>',
        '<p>Ein <b>Netzwerk</b> ist wie ein gemeinsamer Flur. Nur wer am Flur wohnt, kann sich besuchen. Der Flur ist jetzt da, aber noch leer.</p><p>👉 Klicke auf <b>--network netz</b>.</p>'],
      drin: ['<p>Beide Container hängen jetzt im selben Netzwerk. <code>web</code> erreicht <code>db</code> über ihren <b>Namen</b>. Von außen kommt aber noch niemand an <code>web</code>.</p><p>👉 Schalte <b>-p 8080:80</b> ein.</p>',
        '<p>Beide Container sind jetzt im selben Netzwerk. <code>web</code> findet <code>db</code> über ihren <b>Namen</b>. Von außen kommt aber noch niemand an <code>web</code>.</p><p>👉 Schalte <b>-p 8080:80</b> an.</p>'],
      fertig: ['<p>Mit <code>-p 8080:80</code> ist <code>web</code> von außen erreichbar. <code>db</code> hat keinen Port nach außen: Sie ist <b>nur im Netzwerk</b> erreichbar – das ist sicherer.</p><p>👉 Klicke auf <b>compose up -d</b>.</p>',
        '<p>Mit <code>-p 8080:80</code> kommt der Browser an <code>web</code>. <code>db</code> hat keinen Port nach außen. Sie ist <b>nur im Netzwerk</b> erreichbar. Das ist sicherer.</p><p>👉 Klicke auf <b>compose up -d</b>.</p>'],
      portOhneNetz: ['<p>Der Browser erreicht <code>web</code> jetzt, aber <code>web</code> findet die Datenbank nicht: Die beiden hängen in <b>keinem gemeinsamen Netzwerk</b>.</p>',
        '<p>Der Browser kommt an <code>web</code>. Aber <code>web</code> findet die Datenbank nicht. Die beiden sind in <b>keinem gemeinsamen Netzwerk</b>.</p>'],
      compose: ['<p><b>Compose</b> macht das alles automatisch: Es legt das Netzwerk <code>projekt_default</code> an, hängt alle Dienste hinein und öffnet nur die Ports, die unter <code>ports:</code> stehen.</p>',
        '<p><b>Compose</b> macht das alles von selbst. Compose legt das Netzwerk <code>projekt_default</code> an. Compose bringt alle Dienste in das Netzwerk. Compose öffnet nur die Ports unter <code>ports:</code>.</p>']
    },
    compose: {
      start: ['<p>In der <code>docker-compose.yml</code> stehen alle Dienste: hier <code>web</code> und <code>db</code>.</p><p>👉 Klicke auf <b>docker compose up -d</b>.</p>',
        '<p>In der <code>docker-compose.yml</code> stehen alle Dienste: <code>web</code> und <code>db</code>.</p><p>👉 Klicke auf <b>docker compose up -d</b>.</p>'],
      up: ['<p>Compose startet alle Dienste und legt ein <b>Netzwerk</b> an. Darin ist jeder Dienst unter seinem <b>Service-Namen</b> erreichbar – <code>db</code> wie im <b>Telefonbuch</b>.</p><p>👉 Schalte die <b>localhost-Falle</b> ein.</p>',
        '<p>Compose startet alle Dienste und macht ein <b>Netzwerk</b>. Darin ist der <b>Service-Name</b> die Adresse, zum Beispiel <code>db</code>. Das ist wie ein <b>Telefonbuch</b>.</p><p>👉 Schalte die <b>localhost-Falle</b> an.</p>'],
      falle: ['<p><code>localhost</code> ist im Container der <b>Container selbst</b>. Mit <code>localhost:5432</code> sucht <code>web</code> die Datenbank bei sich – und findet nichts.</p>',
        '<p><code>localhost</code> im Container ist der <b>Container selbst</b>. Mit <code>localhost</code> sucht <code>web</code> die Datenbank bei sich. Dort ist sie nicht.</p>'],
      down: ['<p><code>docker compose down</code> stoppt alle Dienste und entfernt Container und Netzwerk. Das Volume <code>pgdata</code> bleibt erhalten.</p>',
        '<p><code>docker compose down</code> stoppt alle Dienste. Container und Netzwerk sind dann weg. Das Volume <code>pgdata</code> bleibt.</p>']
    }
  };

  /* ---------- 2 · Image und Container ---------- */
  function szKlasse(box, api) {
    var d = buehne(box), namen = ['a', 'b', 'c', 'd'], n = 0, java = false, letzte = 'start';
    var img = kasten('dk-img', 'Image <code>webserver</code>', L('Bauplan · read-only', 'Bauplan · nur lesen'));
    img.insertBefore(bild(BILD.bauplan()), img.firstChild);
    var cons = E('div', { class: 'dk-reihe', style: 'min-height:120px' });
    var befehl = E('div', { class: 'dk-code', style: 'min-width:22em' });
    d.appendChild(img); d.appendChild(pfeil('⬇', 'docker run')); d.appendChild(cons);
    d.appendChild(befehl);
    function zeichne() {
      img.querySelector('small').innerHTML = L('Bauplan · read-only', 'Bauplan · nur lesen') + (java ? ' <b style="display:inline;font-size:1rem">≈ class Webserver</b>' : '');
      cons.innerHTML = '';
      for (var i = 0; i < n; i++) { var ck = kasten('dk-con', L('Container', 'Container') + ' <code>' + namen[i] + '</code>', java ? '≈ new Webserver()' : L('läuft', 'läuft')); ck.insertBefore(bild(BILD.haus(GRUEN[0], GRUEN[1])), ck.firstChild); cons.appendChild(ck); }
      if (!n) cons.appendChild(E('div', { class: 'dk-etikett', style: 'align-self:center', text: L('noch kein Container', 'noch kein Container') }));
      var z = [];
      for (var k = 0; k < n; k++) z.push(java ? 'Webserver ' + namen[k] + ' = new Webserver();' : '$ docker run -d --name ' + namen[k] + ' webserver');
      befehl.textContent = z.join('\n') || (java ? '// ' : '$ ') + '…';
      erklaereSz('klasse', TX.klasse[letzte]);
    }
    api.werkzeug({ icon: '▶', text: 'docker run', taste: 'r', aktion: function () { if (n < namen.length) { n++; letzte = java ? 'java' : 'run'; zeichne(); } } });
    api.werkzeug({ icon: '🗑', text: 'docker rm', taste: 'x', aktion: function () { if (n) { n--; letzte = 'rm'; zeichne(); } } });
    api.werkzeug({ icon: '☕', text: L('wie in Java', 'wie in Java'), taste: 'j', typ: 'schalter', aktion: function (an) { java = an; letzte = an ? 'java' : (n ? 'run' : 'start'); zeichne(); } });
    zeichne();
    return {};
  }

  /* ---------- 3 · Was passiert bei docker run? ---------- */
  function szRun(box, api) {
    var d = buehne(box), schritt = 0, schonDa = false;
    var cli = kasten('dk-os', '⌨️ Client (CLI)', '', [E('div', { class: 'dk-code', style: 'margin-top:6px;font-size:.92rem', text: '$ docker run hello-world' })]);
    var ausgabe = E('div', { class: 'dk-code dk-weg', style: 'margin-top:6px;font-size:.92rem;color:#86efac', text: 'Hello from Docker!\nThis message shows …' });
    cli.appendChild(ausgabe);
    var imgListe = E('div', { class: 'dk-liste' }), conListe = E('div', { class: 'dk-liste' });
    var host = kasten('', '🖥️ Docker Host <small style="display:inline">(' + L('deine VM', 'deine VM') + ')</small>', 'Docker Daemon (dockerd)', [
      E('div', { class: 'dk-reihe', style: 'margin-top:8px' }, [kasten('dk-img', 'Images', '', [imgListe]), kasten('dk-con', 'Container', '', [conListe])])]);
    var reg = kasten('dk-reg', 'Registry', 'Docker Hub · ≈ App-Store', [E('div', { class: 'dk-liste', html: 'hello-world<br>nginx<br>postgres<br>python<br>…' })]);
    reg.insertBefore(bild(BILD.regal()), reg.firstChild);
    var p1 = pfeil('➜', '① run'), p3 = pfeil('⇠', '③ pull');
    var info = E('div', { class: 'dk-gross', 'aria-live': 'polite' });
    d.appendChild(E('div', { class: 'dk-reihe dk-nw' }, [cli, p1, host, p3, reg]));
    d.appendChild(info);
    var texte = [
      ['', ''],
      ['① ' + L('Der Client schickt den Befehl an den Daemon', 'Der Client schickt den Befehl an den Daemon'), [cli, p1]],
      ['② ' + L('Image lokal da?', 'Image lokal da?'), [host]],
      ['③ pull hello-world', [p3, reg]],
      ['④ ' + L('Container erstellt + gestartet', 'Container erstellt + gestartet'), [host]],
      ['⑤ ' + L('Ausgabe zurück an den Client', 'Ausgabe zurück an den Client'), [cli]]
    ];
    function zeichne() {
      [cli, p1, host, p3, reg].forEach(function (x) { x.classList.remove('dk-an'); });
      (texte[schritt][1] || []).forEach(function (x) { x.classList.add('dk-an'); });
      var hatImg = schonDa || schritt >= 3;
      imgListe.innerHTML = hatImg ? 'hello-world ✓' : (schritt >= 2 ? '<span class="dk-bad">hello-world ✗</span>' : '–');
      conListe.innerHTML = schonDa ? 'container 1 (Exited)' + (schritt >= 4 ? '<br><b>container 2</b>' : '') : (schritt >= 4 ? '<b>container 1</b>' : '–');
      ausgabe.classList.toggle('dk-weg', schritt < 5);
      p3.classList.toggle('dk-aus', schonDa);
      var t = texte[schritt][0];
      if (schritt === 2) t += hatImg ? ' <span class="dk-ok">✓ ' + L('ja – kein pull nötig', 'ja – kein pull') + '</span>' : ' <span class="dk-bad">✗ ' + L('nicht vorhanden', 'nicht da') + '</span>';
      info.innerHTML = t || '<span class="dk-etikett">' + L('▶ Schritt drücken', '▶ Schritt drücken') + '</span>';
      erklaereSz('run', TX.run[schritt === 0 ? (schonDa ? 'nochmal' : 's0') : (schonDa && (schritt === 2 || schritt === 5)) ? 's' + schritt + 'da' : 's' + schritt]);
    }
    api.werkzeug({ icon: '▶', text: L('Schritt', 'Schritt'), taste: 's', aktion: function () {
      if (schritt >= 5) return;
      schritt++;
      if (schonDa && schritt === 3) schritt = 4;   // Image ist schon da: kein pull
      zeichne();
    } });
    api.werkzeug({ icon: '🔁', text: L('noch einmal', 'noch einmal'), taste: 'n', aktion: function () { schonDa = true; schritt = 0; zeichne(); } });
    api.werkzeug({ icon: '↺', text: L('von vorn', 'von vorn'), taste: 'r', aktion: function () { schonDa = false; schritt = 0; zeichne(); } });
    zeichne();
    return {};
  }

  /* ---------- 4 · Lebenszyklus eines Containers ---------- */
  function szLeben(box, api) {
    var d = buehne(box), zustand = 'image';
    var Z = { image: kasten('dk-img', 'Image'), created: kasten('dk-os', 'Created', L('erstellt', 'erstellt')), running: kasten('dk-con', 'Running', L('läuft', 'läuft')), exited: kasten('dk-vol', 'Exited', L('gestoppt', 'gestoppt')), removed: kasten('dk-os', 'Removed', L('gelöscht', 'gelöscht')) };
    d.appendChild(E('div', { class: 'dk-reihe dk-nw' }, [Z.image, pfeil('➜', 'create'), Z.created, pfeil('➜', 'start'), Z.running, pfeil('⇄', 'stop<br>start'), Z.exited, pfeil('➜', 'rm'), Z.removed]));
    var ps = kasten('', '<code>docker ps</code>', '', [E('div', { class: 'dk-liste' })]), psa = kasten('', '<code>docker ps -a</code>', '', [E('div', { class: 'dk-liste' })]);
    var meld = E('div', { class: 'dk-gross', 'aria-live': 'polite' });
    d.appendChild(E('div', { class: 'dk-reihe' }, [ps, psa]));
    d.appendChild(meld);
    function zeichne(m, key) {
      erklaereSz('leben', TX.leben[key || zustand]);
      Object.keys(Z).forEach(function (k) { Z[k].classList.toggle('dk-an', k === zustand); });
      var zeile = 'web  ' + ({ created: 'Created', running: 'Up 3 seconds', exited: 'Exited (0)' }[zustand] || '');
      ps.querySelector('.dk-liste').textContent = zustand === 'running' ? zeile : L('(leer)', '(leer)');
      psa.querySelector('.dk-liste').textContent = ['created', 'running', 'exited'].indexOf(zustand) >= 0 ? zeile : L('(leer)', '(leer)');
      meld.innerHTML = m || '';
    }
    function geh(von, nach, fehler) { return function () { if (von.indexOf(zustand) >= 0) { zustand = nach; zeichne(); } else zeichne('<span class="dk-bad">✗ ' + fehler + '</span>'); }; }
    api.werkzeug({ icon: '🆕', text: 'create', taste: 'c', aktion: geh(['image', 'removed'], 'created', L('Es gibt den Container schon', 'Den Container gibt es schon')) });
    api.werkzeug({ icon: '▶', text: 'start', taste: 's', aktion: geh(['created', 'exited'], 'running', L('Erst create ausführen', 'Zuerst create')) });
    api.werkzeug({ icon: '⏹', text: 'stop', taste: 't', aktion: geh(['running'], 'exited', L('Läuft gerade nicht', 'Läuft nicht')) });
    api.werkzeug({ icon: '🗑', text: 'rm', taste: 'x', aktion: function () {
      if (zustand === 'running') return zeichne('<span class="dk-bad">✗ ' + L('läuft noch – erst stop oder rm -f', 'läuft noch – erst stop oder rm -f') + '</span>', 'rmLaeuft');
      geh(['created', 'exited'], 'removed', L('Es gibt keinen Container', 'Es gibt keinen Container'))();
    } });
    api.werkzeug({ icon: '🚀', text: 'run = create + start', taste: 'r', aktion: geh(['image', 'removed'], 'running', L('Es gibt den Container schon', 'Den Container gibt es schon')) });
    zeichne();
    return {};
  }

  /* ---------- 5 · Build · Ship · Run ---------- */
  function szBuild(box, api) {
    var d = buehne(box), schritt = 0;
    var df = kasten('dk-os', '📄 Dockerfile', '', [E('div', { class: 'dk-code', style: 'margin-top:6px;font-size:.85rem', text: 'FROM nginx:alpine\nCOPY index.html /usr/share/nginx/html/\nEXPOSE 80' })]);
    var img = kasten('dk-img', 'Image', 'steckbrief'), reg = kasten('dk-reg', 'Registry', 'Docker Hub · ghcr.io');
    img.insertBefore(bild(BILD.bauplan()), img.firstChild); reg.insertBefore(bild(BILD.hafen()), reg.firstChild);
    var img2 = kasten('dk-img', '🧱 Image', L('auf dem Server', 'auf dem Server')), cons = kasten('dk-con', '▶ Container', '', [E('div', { html: '📦 📦 📦' })]);
    var p = [pfeil('➜', 'build'), pfeil('➜', 'push'), pfeil('➜', 'pull'), pfeil('➜', 'run')];
    var teile = [img, reg, img2, cons];
    /* oben BUILD · SHIP, darunter rechtsbündig RUN: pull kommt aus der Registry darüber */
    p[2].querySelector('span').textContent = '⬋';
    d.appendChild(E('div', { class: 'dk-spalte', style: 'align-items:flex-end' }, [
      E('div', { class: 'dk-band', style: 'align-self:center', text: 'BUILD  ·  SHIP' }),
      E('div', { class: 'dk-reihe dk-nw' }, [df, p[0], img, p[1], reg]),
      E('div', { class: 'dk-reihe dk-nw', style: 'justify-content:flex-end' }, [E('div', { class: 'dk-band', style: 'align-self:center', text: 'RUN' }),
        kasten('dk-os', '🖥️ Server', L('Mitschüler · zu Hause', 'Mitschüler · zu Hause'), [E('div', { class: 'dk-reihe dk-nw', style: 'margin-top:6px' }, [img2, p[3], cons])]), p[2]])
    ]));
    var info = E('div', { class: 'dk-gross', 'aria-live': 'polite' });
    d.appendChild(info);
    var texte = ['', 'docker build -t steckbrief .', 'docker push …/steckbrief', 'docker pull …/steckbrief', 'docker run -d -p 8080:80 steckbrief'];
    function zeichne() {
      teile.forEach(function (t, i) { t.classList.toggle('dk-aus', i >= schritt); t.classList.toggle('dk-an', i === schritt - 1); });
      p.forEach(function (t, i) { t.classList.toggle('dk-aus', i >= schritt); });
      info.innerHTML = schritt ? '<code>' + texte[schritt] + '</code>' : '<span class="dk-etikett">' + L('▶ Schritt drücken', '▶ Schritt drücken') + '</span>';
      erklaereSz('build', TX.build['b' + schritt]);
    }
    api.werkzeug({ icon: '▶', text: L('Schritt', 'Schritt'), taste: 's', aktion: function () { if (schritt < 4) { schritt++; zeichne(); } } });
    api.werkzeug({ icon: '↺', text: L('von vorn', 'von vorn'), taste: 'r', aktion: function () { schritt = 0; zeichne(); } });
    zeichne();
    return {};
  }

  /* ---------- 6 · Port-Mapping ---------- */
  function szPorts(box, api) {
    var d = buehne(box), A = true, B = false, konflikt = false;
    var wrap = E('div', { class: 'dk-spalte', style: 'width:min(100%,980px)' });
    d.appendChild(E('div', { class: 'dk-gross', html: '<code>-p 8080:80</code> = Host-Port : Container-Port' }));
    d.appendChild(wrap);
    var meld = E('div', { class: 'dk-gross', 'aria-live': 'polite' });
    d.appendChild(meld);
    function zeile(url, an, port, name) {
      var browser = kasten('', '🌐 <code>' + url + '</code>', an ? '<span class="dk-ok">✓ ' + L('Seite lädt', 'Seite lädt') + '</span>' : '<span class="dk-bad">✗ ' + L('nicht erreichbar', 'nicht erreichbar') + '</span>');
      var hp = kasten('dk-os', 'Host' + (port ? ' :' + port : ''), an ? '-p ' + port + ':80' : L('kein -p', 'kein -p'));
      var con = kasten('dk-con', '📦 ' + name, 'nginx :80');
      return E('div', { class: 'dk-reihe', style: 'flex-wrap:nowrap' }, [browser, pfeil(an ? '➜' : '✗'), hp, pfeil(an ? '➜' : '·'), con]);
    }
    function zeichne() {
      erklaereSz('ports', TX.ports[konflikt ? 'konflikt' : !A ? 'ohne' : B ? 'zwei' : 'start']);
      wrap.innerHTML = '';
      wrap.appendChild(zeile('localhost:8080', A, A ? '8080' : '', 'steckbrief'));
      wrap.appendChild(zeile('localhost:8081', B, B ? '8081' : '', 'steckbrief2'));
      meld.innerHTML = konflikt ? '<span class="dk-bad">✗ <code>-p 8080:80</code> ' + L('für steckbrief2: port is already allocated', 'für steckbrief2: port is already allocated') + '</span>' : '<span class="dk-etikett">' + L('Intern dürfen beide Container :80 nutzen – jeden Host-Port gibt es aber nur einmal.', 'Innen dürfen beide :80 haben. Jeden Host-Port gibt es nur 1-mal.') + '</span>';
    }
    api.werkzeug({ icon: '🔌', text: '-p 8080:80', taste: 'a', typ: 'schalter', an: true, aktion: function (an) { A = an; konflikt = false; zeichne(); } });
    api.werkzeug({ icon: '🔌', text: '-p 8081:80', taste: 'b', typ: 'schalter', aktion: function (an) { B = an; konflikt = false; zeichne(); } });
    api.werkzeug({ icon: '💥', text: L('2× 8080', '2× 8080'), taste: 'k', aktion: function () { konflikt = A; if (!A) { meld.innerHTML = '<span class="dk-etikett">' + L('Erst -p 8080:80 einschalten', 'Schalte zuerst -p 8080:80 an') + '</span>'; return; } zeichne(); } });
    zeichne();
    return {};
  }

  /* ---------- 7 · Container vergessen alles ---------- */
  function szDaten(box, api) {
    var d = buehne(box), con = 1, schicht = ['notiz.txt'], vol = true;
    var conEl = E('div'), volEl = E('div'), bindEl = E('div');
    var meld = E('div', { class: 'dk-gross', 'aria-live': 'polite' });
    d.appendChild(E('div', { class: 'dk-reihe' }, [conEl, pfeil('⇄', '-v'), E('div', { class: 'dk-spalte' }, [volEl, bindEl])]));
    d.appendChild(meld);
    function zeichne(m, key) {
      erklaereSz('daten', TX.daten[key || 'start']);
      conEl.innerHTML = ''; volEl.innerHTML = ''; bindEl.innerHTML = '';
      if (con) conEl.appendChild(E('div', { class: 'dk-spalte' }, [
        bild(BILD.bett()), E('div', { class: 'dk-etikett', text: L('Container ', 'Container ') + con + ' ≈ ' + L('Hotelzimmer', 'Hotelzimmer') }),
        kasten('dk-con', L('Container-Schicht (R/W)', 'Container-Schicht (schreiben)'), schicht.length ? '📄 ' + schicht.join(' ') : L('(leer)', '(leer)')),
        kasten('dk-img', L('Image-Schichten (read-only)', 'Image-Schichten (nur lesen)'), 'ubuntu:22.04')]));
      else conEl.appendChild(kasten('dk-os dk-aus', L('kein Container', 'kein Container')));
      volEl.appendChild(vol ? kasten('dk-vol', 'Named Volume <code>meine-daten</code>', '📄 hello.txt · ≈ ' + L('Schließfach', 'Schließfach')) : kasten('dk-os dk-aus', '<code>meine-daten</code>', L('gelöscht', 'gelöscht')));
      bindEl.appendChild(kasten('dk-vol', 'Bind Mount <code>./export</code>', '📄 plan.pdf · ≈ ' + L('eigener Ordner', 'eigener Ordner')));
      if (vol) volEl.firstChild.insertBefore(bild(BILD.schliessfach()), volEl.firstChild.firstChild);
      bindEl.firstChild.insertBefore(bild(BILD.ordner()), bindEl.firstChild.firstChild);
      meld.innerHTML = m || '';
    }
    api.werkzeug({ icon: '✍️', text: L('Datei schreiben', 'Datei schreiben'), taste: 'w', aktion: function () { if (!con) return; if (schicht.indexOf('ping') < 0) schicht.push('ping'); zeichne('', 'schreiben'); } });
    api.werkzeug({ icon: '🗑', text: 'docker rm', taste: 'x', aktion: function () { if (!con) return; con = 0; zeichne('<span class="dk-bad">' + L('notiz.txt ist weg', 'notiz.txt ist weg') + '</span> · <span class="dk-ok">hello.txt ' + L('bleibt', 'bleibt') + '</span>', 'rm'); } });
    api.werkzeug({ icon: '▶', text: L('neuer Container -v', 'neuer Container -v'), taste: 'n', aktion: function () { if (con) return; con = 2; schicht = []; zeichne(vol ? '<span class="dk-ok">hello.txt ' + L('ist noch da!', 'ist noch da!') + '</span>' : '', vol ? 'neu' : 'neuOhne'); } });
    api.werkzeug({ icon: '💣', text: 'down -v', taste: 'v', aktion: function () { con = 0; vol = false; schicht = []; zeichne('<span class="dk-bad">Volume ' + L('gelöscht', 'gelöscht') + '</span> · <span class="dk-ok">./export ' + L('bleibt', 'bleibt') + '</span>', 'downv'); } });
    api.werkzeug({ icon: '↺', text: L('von vorn', 'von vorn'), taste: 'r', aktion: function () { con = 1; schicht = ['notiz.txt']; vol = true; zeichne(); } });
    zeichne();
    return {};
  }

  /* ---------- 8 · Compose: Namen statt IP-Adressen ---------- */
  function szCompose(box, api) {
    var d = buehne(box), oben = false, falle = false, runter = false;
    var datei = E('div', { class: 'dk-code', text: 'services:\n  web:\n    build: .\n    ports:\n      - "8080:80"\n    environment:\n      DB_HOST: db\n  db:\n    image: postgres:16-alpine\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:' });
    var netz = E('div', { class: 'dk-net dk-spalte', style: 'min-width:340px' });
    d.appendChild(E('div', { class: 'dk-reihe' }, [datei, pfeil('➜', 'up -d'), netz]));
    function zeichne() {
      erklaereSz('compose', TX.compose[oben ? (falle ? 'falle' : 'up') : (runter ? 'down' : 'start')]);
      netz.innerHTML = '';
      netz.appendChild(E('div', { class: 'dk-etikett', html: '🔗 ' + L('Netzwerk', 'Netzwerk') + ' <code>projekt_default</code>' }));
      if (!oben) { netz.appendChild(E('div', { class: 'dk-etikett', style: 'padding:30px 0', text: L('noch nichts gestartet', 'noch nichts gestartet') })); return; }
      var web = kasten('dk-con', '📦 web', '172.18.0.3');
      var db = kasten('dk-con', '🐘 db', '172.18.0.2 · :5432');
      var verb = falle
        ? E('div', { class: 'dk-gross dk-bad', html: '<code>localhost:5432</code> ↺ ✗' })
        : E('div', { class: 'dk-gross dk-ok', html: '<code>db:5432</code> ↓ ✓' });
      netz.appendChild(web); netz.appendChild(verb); netz.appendChild(db);
      netz.appendChild(E('div', { class: 'dk-reihe dk-nw', style: 'align-items:center' }, [bild(BILD.telefonbuch()), E('div', { class: 'dk-etikett', html: 'DNS ≈ ' + L('Telefonbuch', 'Telefonbuch') + '<br><code>db</code> → 172.18.0.2' })]));
      netz.lastChild.firstChild.style.width = 'auto';
      netz.appendChild(kasten('dk-vol', '🔒 pgdata'));
    }
    api.werkzeug({ icon: '▶', text: 'docker compose up -d', taste: 'u', aktion: function () { oben = true; runter = false; zeichne(); } });
    api.werkzeug({ icon: '🪤', text: L('localhost-Falle', 'localhost-Falle'), taste: 'l', typ: 'schalter', aktion: function (an) { falle = an; if (!oben) oben = true; zeichne(); } });
    api.werkzeug({ icon: '⏹', text: 'docker compose down', taste: 'd', aktion: function () { oben = false; runter = true; zeichne(); } });
    zeichne();
    return {};
  }

  /* ---------- 9 · Netzwerk: Wer erreicht wen? ---------- */
  function szNetz(box, api) {
    var d = buehne(box), netz = false, drin = false, ports = false, compose = false, meldung = '';
    var aussen = E('div', { class: 'dk-spalte' }), host = E('div', { class: 'dk-box dk-os', style: 'min-width:380px' });
    var befehle = E('div', { class: 'dk-code', style: 'font-size:.9rem;min-width:30em' });
    var meld = E('div', { class: 'dk-gross', 'aria-live': 'polite' });
    d.appendChild(E('div', { class: 'dk-reihe dk-nw', style: 'align-items:center' }, [aussen, pfeil('➜'), host]));
    d.appendChild(befehle); d.appendChild(meld);
    function zustand() { return compose ? 'compose' : (ports && !drin) ? 'portOhneNetz' : (drin && ports) ? 'fertig' : drin ? 'drin' : netz ? 'netz' : 'start'; }
    function zeichne() {
      erklaereSz('netz', TX.netz[zustand()]);
      var name = compose ? 'projekt_default' : 'netz';
      aussen.innerHTML = '';
      aussen.appendChild(E('div', { class: 'dk-etikett', text: L('außen: Browser', 'außen: Browser') }));
      aussen.appendChild(kasten('', '🌐 <code>localhost:8080</code>', ports ? '<span class="dk-ok">✓ web</span>' : '<span class="dk-bad">✗ ' + L('nicht erreichbar', 'nicht erreichbar') + '</span>'));
      aussen.appendChild(kasten('', '🌐 <code>localhost:5432</code>', '<span class="dk-bad">✗ db ' + L('nur intern', 'nur innen') + '</span>'));
      host.innerHTML = '';
      host.appendChild(E('b', { html: '🖥️ Host' + (ports ? ' · <span style="color:var(--ok)">Port 8080 → web:80</span>' : '') }));
      var web = kasten('dk-con', '📦 web', ':80'), db = kasten('dk-con', '🐘 db', ':5432');
      if (drin) {
        var n = E('div', { class: 'dk-net dk-spalte', style: 'margin-top:8px' }, [E('div', { class: 'dk-etikett', html: '🔗 ' + L('Netzwerk', 'Netzwerk') + ' <code>' + name + '</code>' }), web,
          E('div', { class: 'dk-gross dk-ok', html: '<code>db:5432</code> ↓ ✓' }), db]);
        host.appendChild(n);
      } else {
        host.appendChild(E('div', { class: 'dk-reihe dk-nw', style: 'margin-top:8px;align-items:center' }, [web, E('div', { class: 'dk-gross dk-bad', html: '<code>db</code> ?<br>✗' }), db]));
        if (netz) host.appendChild(E('div', { class: 'dk-net', style: 'margin-top:8px;min-height:60px' }, [E('div', { class: 'dk-etikett', html: '🔗 ' + L('Netzwerk', 'Netzwerk') + ' <code>' + name + '</code> · ' + L('leer', 'leer') }) ]));
      }
      var z = [];
      if (compose) z = ['services:', '  web:', '    ports:', '      - "8080:80"', '  db:', '    image: postgres:16-alpine', '    # ' + L('kein ports: – nur intern erreichbar', 'kein ports: – nur innen erreichbar'), '# ' + L('Netzwerk legt Compose selbst an', 'Netzwerk macht Compose selbst')];
      else {
        if (netz) z.push('$ docker network create netz');
        z.push('$ docker run -d --name db' + (drin ? ' --network netz' : '') + ' postgres:16-alpine');
        z.push('$ docker run -d --name web' + (drin ? ' --network netz' : '') + (ports ? ' -p 8080:80' : '') + ' web');
      }
      befehle.textContent = z.join('\n');
      meld.innerHTML = meldung; meldung = '';
    }
    api.werkzeug({ icon: '🔗', text: 'network create', taste: 'n', aktion: function () { if (!compose) { netz = true; zeichne(); } } });
    api.werkzeug({ icon: '🔌', text: '--network netz', taste: 'a', aktion: function () {
      if (compose) return;
      if (!netz) { meldung = '<span class="dk-bad">✗ ' + L('Erst muss es das Netzwerk geben: network create', 'Zuerst network create') + '</span>'; return zeichne(); }
      drin = true; zeichne();
    } });
    var pSchalter = api.werkzeug({ icon: '🌐', text: '-p 8080:80', taste: 'p', typ: 'schalter', aktion: function (an) { if (compose) return true; ports = an; zeichne(); } });
    api.werkzeug({ icon: '🐙', text: 'compose up -d', taste: 'k', aktion: function () { compose = netz = drin = ports = true; pSchalter.setze(true); zeichne(); } });
    api.werkzeug({ icon: '↺', text: L('von vorn', 'von vorn'), taste: 'r', aktion: function () { compose = netz = drin = ports = false; pSchalter.setze(false); zeichne(); } });
    zeichne();
    return {};
  }

  PAKET.tafel = {
    titel: 'So funktioniert Docker',
    dauer: '20 Minuten',
    szenen: [
      { id: 'wohnen', titel: 'Wie wohnen Apps?', station: 'S1', zeichne: szWohnen,
        erklaerung: '<p><b>Bare Metal:</b> Alle Programme laufen direkt auf einem einzigen Betriebssystem.</p><p><b>Problem:</b> App A braucht Python 3.8, App B braucht Python 3.12. Die beiden kommen sich in die Quere. Das ist wie in einer <b>WG mit nur einem Raum</b>.</p><p>👉 Klicke auf <b>VM</b>.</p>' },
      { id: 'klasse', titel: 'Image und Container', station: 'S1', zeichne: szKlasse,
        erklaerung: '<p>Ein <b>Image</b> ist ein Bauplan: Programm, Bibliotheken und Einstellungen. Es ist schreibgeschützt.</p><p>👉 Klicke auf <b>docker run</b>.</p>' },
      { id: 'run', titel: 'Was passiert bei docker run?', station: 'S1', zeichne: szRun,
        erklaerung: '<p>Was passiert, wenn du <code>docker run hello-world</code> eintippst?</p><p>👉 Klicke auf <b>Schritt</b>.</p>' },
      { id: 'leben', titel: 'Lebenszyklus eines Containers', station: 'S1', zeichne: szLeben,
        erklaerung: '<p>Aus einem <b>Image</b> entsteht ein Container.</p><p>👉 Klicke auf <b>create</b> oder gleich auf <b>run</b>.</p>' },
      { id: 'build', titel: 'Build · Ship · Run', station: 'S2', zeichne: szBuild,
        erklaerung: '<p>Im <b>Dockerfile</b> steht das Rezept: <code>FROM</code> nennt das Basis-Image, <code>COPY</code> kopiert eigene Dateien hinein.</p><p>👉 Klicke auf <b>Schritt</b>.</p>' },
      { id: 'ports', titel: 'Port-Mapping', station: 'S2', zeichne: szPorts,
        erklaerung: '<p>Ein Container ist von außen erst erreichbar, wenn du einen Port weiterleitest. <code>-p 8080:80</code> heißt: <b>Host-Port 8080</b> → <b>Container-Port 80</b>.</p><p>👉 Schalte <b>-p 8081:80</b> ein.</p>' },
      { id: 'daten', titel: 'Container vergessen alles', station: 'S3', zeichne: szDaten,
        erklaerung: '<p>Der Container schreibt in seine eigene <b>Container-Schicht</b> (<code>notiz.txt</code>). Daten im <b>Volume</b> und im <b>Ordner</b> liegen außerhalb.</p><p>👉 Klicke auf <b>docker rm</b>.</p>' },
      { id: 'compose', titel: 'Compose: Namen statt IP-Adressen', station: 'S4', zeichne: szCompose,
        erklaerung: '<p>In der <code>docker-compose.yml</code> stehen alle Dienste: hier <code>web</code> und <code>db</code>.</p><p>👉 Klicke auf <b>docker compose up -d</b>.</p>' },
      { id: 'netz', titel: 'Netzwerk: Wer erreicht wen?', station: 'S4', zeichne: szNetz,
        erklaerung: '<p>Zwei Container laufen einzeln: <code>web</code> und <code>db</code>. Ohne gemeinsames Netzwerk findet <code>web</code> die Datenbank <b>nicht über ihren Namen</b>.</p><p>👉 Klicke auf <b>network create</b>.</p>' }
    ]
  };

  /* Startkarte von js/tafel.js (die Datei bleibt unverändert) für Schüler beschriften:
     window.TAFEL wird erst in tafel.js gesetzt, deshalb hier beim Setzen abfangen. */
  var tafelObj;
  Object.defineProperty(window, 'TAFEL', { configurable: true, get: function () { return tafelObj; }, set: function (t) {
    tafelObj = t;
    if (!t || !t.startKarte) return;
    var original = t.startKarte;
    t.startKarte = function () {
      var k = original.apply(this, arguments), h = k.querySelector('h2'), p = k.querySelector('p'), b = k.querySelector('button');
      stil(); k.classList.add('dk-start');
      if (h) h.textContent = L('Was ist eigentlich Docker?', 'Was ist eigentlich Docker?');
      if (p) p.innerHTML = L('In ' + PAKET.tafel.szenen.length + ' kurzen Szenen zum Anklicken siehst du, wie Docker funktioniert: vom Image über den Container bis zu Compose und dem Netzwerk. Daneben steht jeweils eine Erklärung. Du findest die Szenen auch oben unter <b>Tafelbild</b> und in den Räumen 1–4 unter <b>💡</b>.', 'In ' + PAKET.tafel.szenen.length + ' kurzen Szenen siehst du, wie Docker funktioniert. Daneben steht eine Erklärung. Du findest sie auch oben unter <b>Tafelbild</b> und in den Räumen unter <b>💡</b>.');
      if (b) b.lastChild.textContent = ' ' + L('Erklärung ansehen', 'Erklärung ansehen');
      return k;
    };
  } });

  /* Startseite: Leiste mit „Los geht’s: Station 1 →“ ausblenden (Wunsch der Lehrkraft).
     engine.js bleibt unverändert; die Leiste erscheint auf den anderen Seiten wie gewohnt. */
  var leiste = document.getElementById('leiste');
  function leisteStart() {
    var b = leiste.querySelector('#weiter');
    leiste.style.display = b && /^Los geht/.test(b.textContent) ? 'none' : '';
  }
  if (leiste) { new MutationObserver(leisteStart).observe(leiste, { childList: true }); leisteStart(); }
})();
