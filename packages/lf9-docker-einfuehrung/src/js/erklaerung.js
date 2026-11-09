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
        L('Ein Haus mit einem Raum, drei Apps darin', 'Ein Haus mit einem Raum, drei Apps darin'));
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
        L('Drei Reihenhäuser, jedes mit eigenem Fundament und eigener Heizung', 'Drei Reihenhäuser, jedes mit eigenem Fundament'));
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
        L('Ein Mehrfamilienhaus mit drei Wohnungen auf einem Fundament', 'Ein Haus mit drei Wohnungen auf einem Fundament'));
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
      metal: ['<p><b>Bare Metal</b> heißt: Alle Programme werden direkt auf dem Betriebssystem des Servers installiert – ohne jede Trennung.</p><p><b>Das Problem:</b> Programme brauchen oft verschiedene Versionen derselben Software. App A läuft nur mit Python 3.8, App B braucht Python 3.12. Installiert man beide auf demselben System, kommen sie sich in die Quere: Ein Update für App B kann App A lahmlegen.</p><p>Das ist wie in einer <b>WG, in der alle in einem einzigen Raum wohnen</b>: Alle teilen sich alles, und es gibt ständig Streit.</p><p><b>Probier es aus:</b> Klicke auf <b>VM</b>. Wie lässt sich der Streit lösen?</p>',
        '<p><b>Bare Metal</b> heißt: Alle Programme sind direkt auf dem Betriebssystem vom Server installiert. Es gibt keine Trennung.</p><p><b>Das Problem:</b> App A braucht Python 3.8. App B braucht Python 3.12. Beide sind auf demselben System. Dann stören sie sich. Ein Update für App B kann App A kaputt machen.</p><p>Das ist wie eine <b>WG, in der alle in 1 Raum wohnen</b>. Alle teilen sich alles. Es gibt oft Streit.</p><p><b>Probier es aus:</b> Klicke auf <b>VM</b>. Wie kann man den Streit lösen?</p>'],
      vm: ['<p>Eine <b>virtuelle Maschine (VM)</b> ist ein Rechner, der nur als Software existiert. Ein Programm namens <b>Hypervisor</b> verteilt die echte Hardware auf mehrere VMs.</p><p>Jede App bekommt ihre eigene VM mit einem <b>eigenen, vollständigen Betriebssystem</b>. So sind die Apps sauber getrennt: App A hat ihr Python 3.8, App B ihr Python 3.12.</p><p><b>Der Nachteil:</b> Jede VM bringt ein ganzes Betriebssystem mit. Sie braucht mehrere Gigabyte Speicher und startet so langsam wie ein echter Rechner.</p><p>Das ist wie bei <b>Reihenhäusern</b>: Jede Familie hat ihr eigenes Haus mit eigenem Fundament und eigener Heizung. Das ist ruhig, aber teuer.</p><p><b>Probier es aus:</b> Klicke auf <b>Container</b>. Geht es auch sparsamer?</p>',
        '<p>Eine <b>virtuelle Maschine (VM)</b> ist ein Rechner aus Software. Ein Programm, der <b>Hypervisor</b>, teilt die echte Hardware auf mehrere VMs auf.</p><p>Jede App bekommt eine eigene VM. Jede VM hat ein <b>eigenes Betriebssystem</b>. So sind die Apps gut getrennt. App A hat Python 3.8. App B hat Python 3.12.</p><p><b>Der Nachteil:</b> Jede VM hat ein ganzes Betriebssystem. Das braucht viel Speicher. Eine VM startet langsam.</p><p>Das ist wie bei <b>Reihenhäusern</b>. Jede Familie hat ein eigenes Haus. Jedes Haus hat eine eigene Heizung. Das ist ruhig, aber teuer.</p><p><b>Probier es aus:</b> Klicke auf <b>Container</b>. Geht es auch sparsamer?</p>'],
      container: ['<p>Ein <b>Container</b> enthält nur die App und alles, was sie zum Laufen braucht: Bibliotheken, Laufzeitumgebung (z. B. Python 3.8) und Einstellungen. Ein eigenes Betriebssystem hat er nicht.</p><p>Alle Container teilen sich den <b>Kern des Betriebssystems</b> (Linux-Kernel) mit dem Host. Die <b>Docker Engine</b> sorgt dafür, dass sie trotzdem voneinander getrennt bleiben.</p><p><b>Der Vorteil:</b> Container sind viel kleiner als VMs und starten in Sekunden. Auf einem Server haben deshalb viel mehr Container Platz.</p><p>Das ist wie bei <b>Wohnungen in einem Mehrfamilienhaus</b>: Jede Wohnung hat ihre eigene Tür, aber alle stehen auf demselben Fundament.</p><p><b>Probier es aus:</b> Klicke auf <b>Schiffscontainer</b>. Woher kommt der Name?</p>',
        '<p>Ein <b>Container</b> hat nur die App und alles, was sie braucht: Bibliotheken, zum Beispiel Python 3.8, und Einstellungen. Er hat kein eigenes Betriebssystem.</p><p>Alle Container teilen sich den <b>Kern vom Betriebssystem</b> mit dem Host. Die <b>Docker Engine</b> hält die Container trotzdem getrennt.</p><p><b>Der Vorteil:</b> Container sind viel kleiner als VMs. Sie starten in Sekunden. Auf einen Server passen viel mehr Container.</p><p>Das ist wie bei <b>Wohnungen in einem Haus</b>. Jede Wohnung hat eine eigene Tür. Aber alle stehen auf demselben Fundament.</p><p><b>Probier es aus:</b> Klicke auf <b>Schiffscontainer</b>. Woher kommt der Name?</p>'],
      schiff: ['<p>Der Name kommt vom <b>Schiffscontainer</b>. Früher wurde jede Ware anders verpackt: in Kisten, Fässern oder Säcken. Das Verladen war langsam und teuer, und oft ging etwas kaputt.</p><p>Heute haben alle Container <b>dieselben Maße</b> – egal, was darin steckt. Deshalb passt jeder Container auf jedes Schiff, jeden Lkw und jeden Zug.</p><p>Ein Docker-Container funktioniert genauso: Er läuft <b>überall gleich</b> – auf deinem Laptop, auf dem Schulserver und in der Cloud. Der Satz „Bei mir läuft es aber!“ gehört damit der Vergangenheit an.</p>',
        '<p>Der Name kommt vom <b>Schiffscontainer</b>. Früher war jede Ware anders verpackt: in Kisten, Fässern oder Säcken. Das Verladen war langsam und teuer.</p><p>Heute haben alle Container <b>dieselbe Größe</b>. Egal, was drin ist. Darum passt jeder Container auf jedes Schiff und jeden Lkw.</p><p>Ein Docker-Container ist genauso. Er läuft <b>überall gleich</b>: auf dem Laptop, auf dem Schulserver und in der Cloud.</p>']
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

  /* ---------- 2 · Image und Container ---------- */
  function szKlasse(box, api) {
    var d = buehne(box), namen = ['a', 'b', 'c', 'd'], n = 0, java = false;
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
    }
    api.werkzeug({ icon: '▶', text: 'docker run', taste: 'r', aktion: function () { if (n < namen.length) { n++; zeichne(); } } });
    api.werkzeug({ icon: '🗑', text: 'docker rm', taste: 'x', aktion: function () { if (n) { n--; zeichne(); } } });
    api.werkzeug({ icon: '☕', text: L('wie in Java', 'wie in Java'), taste: 'j', typ: 'schalter', aktion: function (an) { java = an; zeichne(); } });
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
    function zeichne(m) {
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
      if (zustand === 'running') return zeichne('<span class="dk-bad">✗ ' + L('läuft noch – erst stop oder rm -f', 'läuft noch – erst stop oder rm -f') + '</span>');
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
    function zeichne(m) {
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
    api.werkzeug({ icon: '✍️', text: L('Datei schreiben', 'Datei schreiben'), taste: 'w', aktion: function () { if (!con) return zeichne(); if (schicht.indexOf('ping') < 0) schicht.push('ping'); zeichne(); } });
    api.werkzeug({ icon: '🗑', text: 'docker rm', taste: 'x', aktion: function () { if (!con) return; con = 0; zeichne('<span class="dk-bad">' + L('notiz.txt ist weg', 'notiz.txt ist weg') + '</span> · <span class="dk-ok">hello.txt ' + L('bleibt', 'bleibt') + '</span>'); } });
    api.werkzeug({ icon: '▶', text: L('neuer Container -v', 'neuer Container -v'), taste: 'n', aktion: function () { if (con) return; con = 2; schicht = []; zeichne(vol ? '<span class="dk-ok">hello.txt ' + L('ist noch da!', 'ist noch da!') + '</span>' : ''); } });
    api.werkzeug({ icon: '💣', text: 'down -v', taste: 'v', aktion: function () { con = 0; vol = false; schicht = []; zeichne('<span class="dk-bad">Volume ' + L('gelöscht', 'gelöscht') + '</span> · <span class="dk-ok">./export ' + L('bleibt', 'bleibt') + '</span>'); } });
    api.werkzeug({ icon: '↺', text: L('von vorn', 'von vorn'), taste: 'r', aktion: function () { con = 1; schicht = ['notiz.txt']; vol = true; zeichne(); } });
    zeichne();
    return {};
  }

  /* ---------- 8 · Compose: Namen statt IP-Adressen ---------- */
  function szCompose(box, api) {
    var d = buehne(box), oben = false, falle = false;
    var datei = E('div', { class: 'dk-code', text: 'services:\n  web:\n    build: .\n    ports:\n      - "8080:80"\n    environment:\n      DB_HOST: db\n  db:\n    image: postgres:16-alpine\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:' });
    var netz = E('div', { class: 'dk-net dk-spalte', style: 'min-width:340px' });
    d.appendChild(E('div', { class: 'dk-reihe' }, [datei, pfeil('➜', 'up -d'), netz]));
    function zeichne() {
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
    api.werkzeug({ icon: '▶', text: 'docker compose up -d', taste: 'u', aktion: function () { oben = true; zeichne(); } });
    api.werkzeug({ icon: '🪤', text: L('localhost-Falle', 'localhost-Falle'), taste: 'l', typ: 'schalter', aktion: function (an) { falle = an; if (!oben) oben = true; zeichne(); } });
    api.werkzeug({ icon: '⏹', text: 'docker compose down', taste: 'd', aktion: function () { oben = false; zeichne(); } });
    zeichne();
    return {};
  }

  PAKET.tafel = {
    titel: 'So funktioniert Docker',
    dauer: '20 Minuten',
    szenen: [
      { id: 'wohnen', titel: 'Wie wohnen Apps?', station: 'S1', zeichne: szWohnen,
        erklaerung: '<p><b>Bare Metal</b> heißt: Alle Programme werden direkt auf dem Betriebssystem des Servers installiert – ohne jede Trennung.</p><p><b>Das Problem:</b> Programme brauchen oft verschiedene Versionen derselben Software. App A läuft nur mit Python 3.8, App B braucht Python 3.12. Installiert man beide auf demselben System, kommen sie sich in die Quere: Ein Update für App B kann App A lahmlegen.</p><p>Das ist wie in einer <b>WG, in der alle in einem einzigen Raum wohnen</b>: Alle teilen sich alles, und es gibt ständig Streit.</p><p><b>Probier es aus:</b> Klicke auf <b>VM</b>. Wie lässt sich der Streit lösen?</p>' },
      { id: 'klasse', titel: 'Image und Container', station: 'S1', zeichne: szKlasse,
        erklaerung: '<p>Ein <b>Image</b> ist ein Bauplan. Es enthält alles, was ein Programm zum Laufen braucht: das Programm selbst, seine Bibliotheken und Einstellungen. Ein Image ist <b>schreibgeschützt</b> und ändert sich nicht, während Container daraus laufen.</p><p>Ein <b>Container</b> ist ein laufendes Exemplar dieses Bauplans. Jedes <code>docker run</code> erzeugt einen <b>neuen</b> Container. Aus einem Image können so beliebig viele Container entstehen, die unabhängig voneinander laufen – zum Beispiel drei Webserver aus demselben Image.</p><p><b>Vergleich mit Java:</b> Das Image entspricht einer Klasse (<code>class Webserver</code>), der Container einem Objekt (<code>new Webserver()</code>). Eine Klasse kann viele Objekte haben, ein Image viele Container.</p><p>Mit <code>docker rm</code> löschst du einen Container; das Image bleibt erhalten. Ein Image löschst du mit <code>docker rmi</code> – aber erst, wenn kein Container mehr daraus besteht, auch kein gestoppter.</p><p><b>Probier es aus:</b> Klicke mehrmals auf <b>docker run</b> und schalte dann <b>wie in Java</b> ein.</p>' },
      { id: 'run', titel: 'Was passiert bei docker run?', station: 'S1', zeichne: szRun,
        erklaerung: '<p>Docker besteht aus zwei Teilen: dem <b>Client</b> – das ist das Programm <code>docker</code>, das du im Terminal aufrufst – und dem <b>Docker Daemon</b> (<code>dockerd</code>). Der Daemon läuft im Hintergrund auf dem Host und erledigt die eigentliche Arbeit.</p><p>Bei <code>docker run hello-world</code> passiert Folgendes:</p><ol><li>Der Client schickt den Befehl an den Daemon.</li><li>Der Daemon prüft, ob das Image <code>hello-world</code> schon auf dem Host liegt.</li><li>Wenn nicht, lädt er es aus einer <b>Registry</b> herunter (<b>pull</b>). Die bekannteste Registry ist Docker Hub; dort liegen Millionen fertiger Images.</li><li>Aus dem Image erstellt er einen Container und startet ihn.</li><li>Die Ausgabe des Containers erscheint in deinem Terminal.</li></ol><p>Beim zweiten Mal liegt das Image schon auf dem Host. Schritt 3 fällt weg, und der Container startet sofort. Deshalb dauert der erste Start eines Images oft länger als alle weiteren.</p><p><b>Probier es aus:</b> Klicke fünfmal auf <b>Schritt</b>, dann auf <b>noch einmal</b> und wieder auf <b>Schritt</b>.</p>' },
      { id: 'leben', titel: 'Lebenszyklus eines Containers', station: 'S1', zeichne: szLeben,
        erklaerung: '<p>Ein Container durchläuft mehrere Zustände:</p><ul><li><b>Created</b> (erstellt): Der Container ist angelegt, läuft aber noch nicht (<code>docker create</code>).</li><li><b>Running</b> (läuft): Das Programm im Container arbeitet (<code>docker start</code>).</li><li><b>Exited</b> (gestoppt): Das Programm ist beendet – entweder weil es fertig ist wie <code>hello-world</code> oder weil du <code>docker stop</code> eingegeben hast. Der Container ist aber noch vorhanden und lässt sich mit <code>docker start</code> wieder starten.</li><li><b>Removed</b> (gelöscht): Erst <code>docker rm</code> entfernt den Container endgültig.</li></ul><p><code>docker run</code> erledigt <i>create</i> und <i>start</i> in einem Schritt.</p><p><code>docker ps</code> zeigt nur laufende Container, <code>docker ps -a</code> zeigt alle, auch die gestoppten. Einen laufenden Container kannst du nicht einfach löschen: Du musst ihn zuerst stoppen oder das Löschen mit <code>docker rm -f</code> erzwingen.</p><p><b>Probier es aus:</b> Klicke auf <b>run</b>, <b>stop</b> und <b>rm</b> und beobachte die beiden Listen. Was passiert, wenn du einen laufenden Container löschen willst?</p>' },
      { id: 'build', titel: 'Build · Ship · Run', station: 'S2', zeichne: szBuild,
        erklaerung: '<p>Eigene Images baust du mit einem <b>Dockerfile</b>. Das ist eine Textdatei mit dem Rezept für das Image:</p><ul><li><code>FROM nginx:alpine</code> – das Basis-Image, auf dem du aufbaust, hier ein fertiger Webserver.</li><li><code>COPY index.html …</code> – kopiert eigene Dateien in das Image.</li><li><code>RUN …</code> – führt beim Bauen einen Befehl aus, zum Beispiel eine Installation.</li><li><code>EXPOSE 80</code> – dokumentiert, auf welchem Port die App lauscht.</li><li><code>CMD …</code> – legt fest, welches Programm beim Start des Containers läuft.</li></ul><p>Danach geht es in drei Schritten weiter:</p><ul><li><b>Build:</b> <code>docker build -t steckbrief .</code> baut aus dem Dockerfile ein Image mit dem Namen <code>steckbrief</code>.</li><li><b>Ship:</b> Mit <code>docker push</code> lädst du es in eine Registry hoch, mit <code>docker pull</code> holt es sich ein anderer Rechner.</li><li><b>Run:</b> Dort startet <code>docker run</code> daraus Container.</li></ul><p><b>Wichtig:</b> Ein Image ist eine Momentaufnahme. Änderst du später eine Datei, die mit <code>COPY</code> hineinkopiert wurde, musst du das Image neu bauen und einen neuen Container daraus starten. Sonst zeigt der Container weiter die alte Version.</p>' },
      { id: 'ports', titel: 'Port-Mapping', station: 'S2', zeichne: szPorts,
        erklaerung: '<p>Jeder Container ist vom Host abgeschottet. Ein Webserver im Container lauscht zum Beispiel auf Port 80 – aber nur <b>innerhalb</b> des Containers. Von außen, etwa aus deinem Browser, ist er zunächst nicht erreichbar.</p><p>Erst ein <b>Port-Mapping</b> öffnet den Weg: <code>docker run -p 8080:80 steckbrief</code> leitet alles, was auf dem <b>Host</b> an Port 8080 ankommt, an Port 80 im <b>Container</b> weiter. Die Reihenfolge ist immer <b>Host-Port : Container-Port</b>. Im Browser rufst du dann <code>http://localhost:8080</code> auf.</p><p>Mehrere Container dürfen intern denselben Port nutzen: Zwei Webserver können beide auf Port 80 lauschen. Auf dem Host darf aber jeder Port nur <b>einmal</b> vergeben werden. Der zweite Container braucht also einen anderen Host-Port, zum Beispiel <code>-p 8081:80</code>. Sonst meldet Docker <code>port is already allocated</code>.</p><p><b>Probier es aus:</b> Schalte <b>-p 8081:80</b> ein und klicke danach auf <b>2× 8080</b>.</p>' },
      { id: 'daten', titel: 'Container vergessen alles', station: 'S3', zeichne: szDaten,
        erklaerung: '<p>Ein Container besteht aus den schreibgeschützten Schichten seines Images und einer dünnen <b>Container-Schicht</b>, in die er schreiben darf. Alles, was das Programm im Container speichert, landet in dieser Schicht. Wird der Container mit <code>docker rm</code> gelöscht, ist auch diese Schicht weg: Container sind <b>ephemer</b> (flüchtig). Das ist wie bei einem Hotelzimmer, das nach dem Auszug aufgeräumt wird.</p><p>Damit Daten bleiben, legst du sie <b>außerhalb</b> des Containers ab und bindest sie mit <code>-v</code> ein. Dafür gibt es zwei Möglichkeiten:</p><ul><li><b>Named Volume</b>, z. B. <code>-v meine-daten:/daten</code>: Links steht ein <b>Name</b>. Docker verwaltet den Speicher selbst – wie ein Schließfach, zu dem Docker den Schlüssel hat. Das eignet sich für Datenbanken und App-Daten, die niemand direkt öffnen muss.</li><li><b>Bind Mount</b>, z. B. <code>-v ./export:/app/export</code>: Links steht ein <b>Pfad</b>. Ein normaler Ordner auf dem Host wird in den Container eingeblendet – du bringst deinen eigenen Ordner mit. Das eignet sich für Dateien, die du auf dem Host sehen oder bearbeiten willst, zum Beispiel Fotos, Konfigurationen oder Exporte.</li></ul><p>Beide überleben <code>docker rm</code> und <code>docker compose down</code>. <code>docker compose down -v</code> löscht zusätzlich die Named Volumes. Einen Bind-Mount-Ordner löscht Docker nie.</p><p><b>Probier es aus:</b> Klicke auf <b>docker rm</b>, dann auf <b>neuer Container -v</b> und zum Schluss auf <b>down -v</b>.</p>' },
      { id: 'compose', titel: 'Compose: Namen statt IP-Adressen', station: 'S4', zeichne: szCompose,
        erklaerung: '<p>Größere Anwendungen bestehen aus mehreren Containern, zum Beispiel aus einer Web-App und einer Datenbank. Mit einzelnen <code>docker run</code>-Befehlen müsstest du jeden Container von Hand starten, ein Netzwerk anlegen und alle Optionen jedes Mal neu eintippen.</p><p><b>Docker Compose</b> fasst alles in einer Datei zusammen, der <code>docker-compose.yml</code>. Unter <code>services:</code> steht jeder Dienst mit Image, Ports, Volumes und Umgebungsvariablen. <code>docker compose up -d</code> startet alle Dienste im Hintergrund, <code>docker compose down</code> stoppt und entfernt sie wieder.</p><p>Compose legt automatisch ein gemeinsames <b>Netzwerk</b> an. Darin ist jeder Dienst unter seinem <b>Service-Namen</b> erreichbar: Das eingebaute DNS übersetzt <code>db</code> in die IP-Adresse des Datenbank-Containers – wie ein Telefonbuch, in dem du den Namen statt der Nummer nachschlägst. Deshalb steht in der Datei <code>DB_HOST: db</code>.</p><p><b>Vorsicht, localhost-Falle:</b> <code>localhost</code> bedeutet im Container immer „dieser Container selbst“. Sucht die Web-App die Datenbank unter <code>localhost:5432</code>, sucht sie bei sich selbst und findet nichts.</p><p>Mit <code>depends_on</code> und <code>condition: service_healthy</code> wartet ein Dienst außerdem, bis die Datenbank wirklich bereit ist.</p><p><b>Probier es aus:</b> Klicke auf <b>docker compose up -d</b> und schalte dann die <b>localhost-Falle</b> ein.</p>' }
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
      if (p) p.innerHTML = L('In 8 kurzen Szenen zum Anklicken siehst du, wie Docker funktioniert: vom Image über den Container bis zu Compose. Daneben steht jeweils eine Erklärung. Du findest die Szenen auch oben unter <b>Tafelbild</b> und in den Räumen 1–4 unter <b>💡</b>.', 'In 8 kurzen Szenen siehst du, wie Docker funktioniert. Daneben steht eine Erklärung. Du findest sie auch oben unter <b>Tafelbild</b> und in den Räumen unter <b>💡</b>.');
      if (b) b.lastChild.textContent = ' ' + L('Erklärung ansehen', 'Erklärung ansehen');
      return k;
    };
  } });
})();
