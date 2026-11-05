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
        erklaerung: '<p><b>Das Problem:</b> Auf einem Server laufen oft mehrere Programme, die verschiedene Versionen derselben Software brauchen. App A läuft nur mit Python 3.8, App B braucht Python 3.12. Installiert man beide direkt auf dem Betriebssystem (<b>Bare Metal</b>), kommen sie sich in die Quere – wie in einer WG, in der alle in einem einzigen Raum wohnen.</p><p><b>Lösung 1 – virtuelle Maschinen:</b> Jede App bekommt einen eigenen virtuellen Rechner mit eigenem Betriebssystem. Das trennt sauber, kostet aber viel: Jede VM braucht mehrere Gigabyte Speicher und startet so langsam wie ein echter Rechner. Das ist wie bei Reihenhäusern, die jedes ein eigenes Fundament und eine eigene Heizung haben.</p><p><b>Lösung 2 – Container:</b> Ein Container enthält nur die App mit ihren Bibliotheken und ihrer Laufzeitumgebung. Den Kern des Betriebssystems (Linux-Kernel) teilt er sich mit dem Host. Container sind deshalb klein und starten in Sekunden – wie Wohnungen in einem Mehrfamilienhaus: eigene Tür, gemeinsames Fundament.</p><p><b>Die Idee dahinter</b> stammt vom Schiffscontainer: Egal, was darin steckt – er hat immer dieselbe Form und passt auf jedes Schiff, jeden Lkw und jeden Zug. Ein Docker-Container läuft genauso überall gleich: auf deinem Laptop, auf dem Schulserver und in der Cloud.</p><p><b>Probier es aus:</b> Wechsle unten zwischen <b>Bare Metal</b>, <b>VM</b> und <b>Container</b>.</p>' },
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
      if (h) h.textContent = L('Was ist eigentlich Docker?', 'Was ist eigentlich Docker?');
      if (p) p.innerHTML = L('In 8 kurzen Szenen zum Anklicken siehst du, wie Docker funktioniert: vom Image über den Container bis zu Compose. Daneben steht jeweils eine Erklärung. Du findest die Szenen auch oben unter <b>Tafelbild</b> und in den Räumen 1–4 unter <b>💡</b>.', 'In 8 kurzen Szenen siehst du, wie Docker funktioniert. Daneben steht eine Erklärung. Du findest sie auch oben unter <b>Tafelbild</b> und in den Räumen unter <b>💡</b>.');
      if (b) b.lastChild.textContent = ' ' + L('Erklärung ansehen', 'Erklärung ansehen');
      return k;
    };
  } });
})();
