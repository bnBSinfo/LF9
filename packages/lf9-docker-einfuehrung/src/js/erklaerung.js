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
    '.dk-band{font-weight:800;letter-spacing:.08em;color:var(--accent);font-size:1rem}';
  function stil() { if (!document.getElementById('dk-css')) { var s = document.createElement('style'); s.id = 'dk-css'; s.textContent = DK_CSS; document.head.appendChild(s); } }
  function buehne(box) { stil(); var d = E('div', { class: 'dk' }); box.appendChild(d); return d; }
  function kasten(art, titel, unter, extra) { return E('div', { class: 'dk-box ' + (art || '') }, [E('b', { html: titel })].concat(unter ? [E('small', { html: unter })] : []).concat(extra || [])); }
  function pfeil(zeichen, text) { return E('div', { class: 'dk-pfeil' }, [E('span', { text: zeichen })].concat(text ? [E('small', { html: text })] : [])); }

  /* ---------- 1 · Wie wohnen Apps? ---------- */
  function szWohnen(box, api) {
    var d = buehne(box);
    function zeichne(modus) {
      d.innerHTML = '';
      var apps = ['App A', 'App B', 'App C'];
      if (modus === 'metal') {
        d.appendChild(E('div', { class: 'dk-gross', text: L('Bare Metal ≈ WG in einem Raum', 'Bare Metal ≈ WG in einem Raum') }));
        d.appendChild(E('div', { class: 'dk-reihe' }, apps.map(function (a) { return kasten('dk-con', a); })));
        d.appendChild(E('div', { class: 'dk-bad dk-gross', text: '⚡ Python 3.8 ↔ Python 3.12 ⚡' }));
        d.appendChild(kasten('dk-os', L('ein Betriebssystem für alle', 'ein Betriebssystem für alle')));
        d.appendChild(kasten('dk-os', 'Hardware'));
      } else if (modus === 'vm') {
        d.appendChild(E('div', { class: 'dk-gross', text: L('Virtuelle Maschinen ≈ Reihenhäuser', 'Virtuelle Maschinen ≈ Reihenhäuser') }));
        d.appendChild(E('div', { class: 'dk-reihe' }, apps.map(function (a) { return E('div', { class: 'dk-spalte' }, [kasten('dk-con', a), kasten('dk-os', L('eigenes OS', 'eigenes OS'), '≈ 1–2 GB')]); })));
        d.appendChild(kasten('dk-os', 'Hypervisor'));
        d.appendChild(kasten('dk-os', L('Host-Betriebssystem · Hardware', 'Host-Betriebssystem · Hardware')));
      } else {
        d.appendChild(E('div', { class: 'dk-gross', text: L('Container ≈ Wohnungen im Mehrfamilienhaus', 'Container ≈ Wohnungen im Mehrfamilienhaus') }));
        d.appendChild(E('div', { class: 'dk-reihe' }, apps.map(function (a) { return kasten('dk-con', '📦 ' + a, L('+ Bibliotheken + Laufzeit', '+ Bibliotheken + Laufzeit')); })));
        d.appendChild(kasten('dk-img', 'Docker Engine'));
        d.appendChild(kasten('dk-os', L('gemeinsamer Linux-Kernel', 'gemeinsamer Linux-Kernel')));
        d.appendChild(kasten('dk-os', 'Hardware'));
        d.appendChild(E('div', { class: 'dk-etikett', html: '💻 Laptop = 🏫 Schulserver = ☁️ Cloud' }));
      }
    }
    api.werkzeug({ icon: '🏚️', text: 'Bare Metal', taste: 'b', typ: 'modus', aktion: function () { zeichne('metal'); } });
    api.werkzeug({ icon: '🏘️', text: 'VM', taste: 'v', typ: 'modus', aktion: function () { zeichne('vm'); } });
    var c = api.werkzeug({ icon: '🏢', text: 'Container', taste: 'c', typ: 'modus', an: true, aktion: function () { zeichne('container'); } });
    c.setze(true); zeichne('container');
    return {};
  }

  /* ---------- 2 · Image und Container ---------- */
  function szKlasse(box, api) {
    var d = buehne(box), namen = ['a', 'b', 'c', 'd'], n = 0, java = false;
    var img = kasten('dk-img', '🧱 Image <code>webserver</code>', L('Bauplan · read-only', 'Bauplan · nur lesen'));
    var cons = E('div', { class: 'dk-reihe', style: 'min-height:120px' });
    var befehl = E('div', { class: 'dk-code', style: 'min-width:22em' });
    d.appendChild(E('div', { class: 'dk-reihe' }, [img, pfeil('➜', 'docker run'), cons]));
    d.appendChild(befehl);
    function zeichne() {
      img.querySelector('small').innerHTML = L('Bauplan · read-only', 'Bauplan · nur lesen') + (java ? ' <b style="display:inline;font-size:1rem">≈ class Webserver</b>' : '');
      cons.innerHTML = '';
      for (var i = 0; i < n; i++) cons.appendChild(kasten('dk-con', '▶ ' + L('Container', 'Container') + ' <code>' + namen[i] + '</code>', java ? '≈ new Webserver()' : L('läuft', 'läuft')));
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
    var reg = kasten('dk-reg', '☁️ Registry', 'Docker Hub', [E('div', { class: 'dk-liste', html: 'hello-world<br>nginx<br>postgres<br>python<br>…' })]);
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
    api.werkzeug({ icon: '▶', text: 'start', taste: 's', aktion: geh(['created', 'exited'], 'running', L('Erst create', 'Erst create')) });
    api.werkzeug({ icon: '⏹', text: 'stop', taste: 't', aktion: geh(['running'], 'exited', L('Läuft gerade nicht', 'Läuft nicht')) });
    api.werkzeug({ icon: '🗑', text: 'rm', taste: 'x', aktion: function () {
      if (zustand === 'running') return zeichne('<span class="dk-bad">✗ ' + L('läuft noch – erst stop oder rm -f', 'läuft noch – erst stop oder rm -f') + '</span>');
      geh(['created', 'exited'], 'removed', L('Kein Container da', 'Kein Container da'))();
    } });
    api.werkzeug({ icon: '🚀', text: 'run = create + start', taste: 'r', aktion: geh(['image', 'removed'], 'running', L('Es gibt den Container schon', 'Den Container gibt es schon')) });
    zeichne();
    return {};
  }

  /* ---------- 5 · Build · Ship · Run ---------- */
  function szBuild(box, api) {
    var d = buehne(box), schritt = 0;
    var df = kasten('dk-os', '📄 Dockerfile', '', [E('div', { class: 'dk-code', style: 'margin-top:6px;font-size:.85rem', text: 'FROM nginx:alpine\nCOPY index.html /usr/share/nginx/html/\nEXPOSE 80' })]);
    var img = kasten('dk-img', '🧱 Image', 'steckbrief'), reg = kasten('dk-reg', '☁️ Registry', 'Docker Hub · ghcr.io');
    var img2 = kasten('dk-img', '🧱 Image', L('auf dem Server', 'auf dem Server')), cons = kasten('dk-con', '▶ Container', '', [E('div', { html: '📦 📦 📦' })]);
    var p = [pfeil('➜', 'build'), pfeil('➜', 'push'), pfeil('➜', 'pull'), pfeil('➜', 'run')];
    var teile = [img, reg, img2, cons];
    /* oben BUILD · SHIP, darunter rechtsbündig RUN: pull kommt aus der Registry darüber */
    p[2].querySelector('span').textContent = '⬋';
    d.appendChild(E('div', { class: 'dk-spalte', style: 'align-items:flex-end' }, [
      E('div', { class: 'dk-band', style: 'align-self:center', text: 'BUILD  ·  SHIP' }),
      E('div', { class: 'dk-reihe dk-nw' }, [df, p[0], img, p[1], reg]),
      E('div', { class: 'dk-reihe dk-nw', style: 'justify-content:flex-end' }, [E('div', { class: 'dk-band', style: 'align-self:center', text: 'RUN' }),
        kasten('dk-os', '🖥️ Server', L('Mitschüler · zuhause', 'Mitschüler · zuhause'), [E('div', { class: 'dk-reihe dk-nw', style: 'margin-top:6px' }, [img2, p[3], cons])]), p[2]])
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
      meld.innerHTML = konflikt ? '<span class="dk-bad">✗ <code>-p 8080:80</code> ' + L('für steckbrief2: port is already allocated', 'für steckbrief2: port is already allocated') + '</span>' : '<span class="dk-etikett">' + L('Im Container dürfen beide :80 nutzen – jeder Host-Port nur einmal.', 'Im Container beide :80 – jeder Host-Port nur 1-mal.') + '</span>';
    }
    api.werkzeug({ icon: '🔌', text: '-p 8080:80', taste: 'a', typ: 'schalter', an: true, aktion: function (an) { A = an; konflikt = false; zeichne(); } });
    api.werkzeug({ icon: '🔌', text: '-p 8081:80', taste: 'b', typ: 'schalter', aktion: function (an) { B = an; konflikt = false; zeichne(); } });
    api.werkzeug({ icon: '💥', text: L('2× 8080', '2× 8080'), taste: 'k', aktion: function () { konflikt = A; if (!A) { meld.innerHTML = '<span class="dk-etikett">' + L('Erst -p 8080:80 einschalten', 'Erst -p 8080:80 an') + '</span>'; return; } zeichne(); } });
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
        E('div', { class: 'dk-etikett', text: L('Container ', 'Container ') + con + ' ≈ ' + L('Hotelzimmer', 'Hotelzimmer') }),
        kasten('dk-con', L('Container-Schicht (R/W)', 'Container-Schicht (schreiben)'), schicht.length ? '📄 ' + schicht.join(' ') : L('(leer)', '(leer)')),
        kasten('dk-img', L('Image-Schichten (read-only)', 'Image-Schichten (nur lesen)'), 'ubuntu:22.04')]));
      else conEl.appendChild(kasten('dk-os dk-aus', L('kein Container', 'kein Container')));
      volEl.appendChild(vol ? kasten('dk-vol', '🔒 Named Volume <code>meine-daten</code>', '📄 hello.txt · ≈ ' + L('Schließfach', 'Schließfach')) : kasten('dk-os dk-aus', '<code>meine-daten</code>', L('gelöscht', 'gelöscht')));
      bindEl.appendChild(kasten('dk-vol', '📁 Bind Mount <code>./export</code>', '📄 plan.pdf · ≈ ' + L('eigener Ordner', 'eigener Ordner')));
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
      netz.appendChild(E('div', { class: 'dk-etikett', html: '📒 DNS: <code>db</code> → 172.18.0.2' }));
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
        erklaerung: '<p>Ohne Docker teilen sich alle Programme <b>ein</b> Betriebssystem – wie eine WG in einem Raum. Braucht App A Python 3.8 und App B Python 3.12, gibt es Streit.</p><p>Eine <b>virtuelle Maschine</b> trennt sauber, bringt aber ein ganzes eigenes Betriebssystem mit: schwer und langsam.</p><p>Ein <b>Container</b> packt nur die App mit ihren Bibliotheken ein und teilt sich den Linux-Kernel des Hosts – wie Wohnungen im selben Haus. Wie ein Schiffscontainer läuft er überall gleich: auf dem Laptop, dem Schulserver und in der Cloud.</p>' },
      { id: 'klasse', titel: 'Image und Container', station: 'S1', zeichne: szKlasse,
        erklaerung: '<p>Ein <b>Image</b> ist der Bauplan: Programm, Bibliotheken, Einstellungen. Es ist schreibgeschützt.</p><p>Jedes <code>docker run</code> macht aus dem Image einen <b>neuen Container</b> – wie <code>new</code> aus einer Klasse ein neues Objekt macht. Aus einem Image können viele Container laufen. <code>docker rm</code> löscht einen Container, das Image bleibt.</p>' },
      { id: 'run', titel: 'Was passiert bei docker run?', station: 'S1', zeichne: szRun,
        erklaerung: '<p>Du tippst den Befehl im <b>Client</b>. Der schickt ihn an den <b>Docker Daemon</b> auf dem Host.</p><p>Der Daemon schaut, ob das Image schon lokal liegt. Wenn nicht, lädt er es mit <b>pull</b> aus der <b>Registry</b> (z. B. Docker Hub). Dann erstellt und startet er den Container. Die Ausgabe kommt zurück in dein Terminal.</p><p>Beim zweiten Mal ist das Image schon da: kein Download mehr.</p>' },
      { id: 'leben', titel: 'Lebenszyklus eines Containers', station: 'S1', zeichne: szLeben,
        erklaerung: '<p>Ein Container ist erst <b>Created</b>, dann <b>Running</b>. Gestoppt ist er <b>Exited</b> – er ist aber noch da und lässt sich wieder starten. Erst <code>docker rm</code> löscht ihn.</p><p><code>docker run</code> = create + start. <code>docker ps</code> zeigt nur laufende Container, <code>docker ps -a</code> auch gestoppte.</p>' },
      { id: 'build', titel: 'Build · Ship · Run', station: 'S2', zeichne: szBuild,
        erklaerung: '<p>Im <b>Dockerfile</b> steht das Rezept: <code>FROM</code> Basis-Image, <code>COPY</code> eigene Dateien hinein, <code>EXPOSE</code> den Port dokumentieren.</p><p><code>docker build</code> macht daraus ein Image. Mit <code>push</code> kommt es in eine Registry, mit <code>pull</code> holt es sich ein anderer Rechner, mit <code>run</code> laufen dort Container. Ändert sich eine kopierte Datei, musst du <b>neu bauen</b>.</p>' },
      { id: 'ports', titel: 'Port-Mapping', station: 'S2', zeichne: szPorts,
        erklaerung: '<p>Ein Container ist von außen erst erreichbar, wenn du einen Port weiterleitest: <code>-p 8080:80</code> heißt <b>Host-Port 8080</b> → <b>Container-Port 80</b>.</p><p>Zwei Container dürfen innen beide Port 80 nutzen. Jeder Port auf dem Host kann aber nur <b>einmal</b> vergeben werden – sonst meldet Docker <code>port is already allocated</code>.</p>' },
      { id: 'daten', titel: 'Container vergessen alles', station: 'S3', zeichne: szDaten,
        erklaerung: '<p>Was ein Container in seine eigene Schicht schreibt, ist mit <code>docker rm</code> weg – wie ein Hotelzimmer, das aufgeräumt wird.</p><p>Ein <b>Named Volume</b> (<code>meine-daten:/daten</code>) ist ein Schließfach, das Docker verwaltet: Es bleibt, auch wenn der Container gelöscht wird. Nur <code>docker compose down -v</code> löscht es.</p><p>Ein <b>Bind Mount</b> (<code>./export:/app/export</code>) ist ein normaler Ordner auf dem Host. Den löscht Docker nie.</p>' },
      { id: 'compose', titel: 'Compose: Namen statt IP-Adressen', station: 'S4', zeichne: szCompose,
        erklaerung: '<p>Mit <b>Docker Compose</b> stehen alle Dienste in einer Datei. <code>docker compose up -d</code> startet sie gemeinsam und legt ein Netzwerk für sie an.</p><p>Im Netzwerk heißt jeder Dienst so wie sein <b>Service-Name</b>: Das eingebaute DNS übersetzt <code>db</code> in die IP-Adresse – wie ein Telefonbuch.</p><p>Vorsicht, <b>localhost-Falle</b>: <code>localhost</code> im Container ist der Container selbst, nicht die Datenbank.</p>' }
    ]
  };
})();
