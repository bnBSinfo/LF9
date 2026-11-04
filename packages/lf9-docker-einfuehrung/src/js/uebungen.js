/* =====================================================================
   „Serverraum 0“ – Übungen 2 bis 5 (geladen nach nachweis.js, vor sprache.js)
   Jede Übung ist ein kleiner neuer Raum mit derselben Terminal-Mechanik,
   aber einem anderen Kunden und Dienst. Rechts steht eine Zielliste, die
   sich abhakt. Fehler bekommen eine Erklärung (anders als im Nachweis).
   ⛰️ Basis: Bausteine und Auswahl-Lücken · 🚀 Profi: freies Tippen, Lücken
   zum Eintippen, in Übung 5 zwei Tickets mehr.
   Alle Personen, Firmen und Vereine sind erfunden.
   ===================================================================== */

REGISTRY['httpd:alpine'] = { id: '6f2e9b1d4c8a', groesse: '62.1MB', cmd: '"httpd-foreground"', laeuft: true };
DIENSTPORT['httpd:alpine'] = 80;

/* ---------- Gemeinsamer Rahmen: Terminal, Zielliste, Browser, Datei ----------
   cfg: { prompt, setup(h), bausteine, ziele: [{text, ziel(h, st), vorher(h, st), wahl}],
          datei: {name, text, luecken, speichern(h, werte)}, browser: 'http://localhost:',
          hinweis(h, r, zeile, st) → [standard, einfach] | null, notiz: [titel], erledigt, loese(x) } */
function uebungsRaum(cfg) {
  return function (box, api) {
    var E = KIT.el;
    if (!document.getElementById('sr-css')) { var s = document.createElement('style'); s.id = 'sr-css'; s.textContent = SR_CSS; document.head.appendChild(s); }
    rwStil();
    var h = neuerHost(), st = { nr: 0, browse: null, wahl: {}, befehle: [] }, fertig = false;
    if (cfg.setup) cfg.setup(h);
    Object.keys(h.images).forEach(function (k) { h.images[k].neu = false; });
    var wurzel = E('div', { class: 'sr-spiel', style: 'min-height:420px' });
    box.innerHTML = ''; box.appendChild(wurzel);

    /* Terminal */
    var aus = E('div', { class: 'sr-ausgabe', role: 'log', 'aria-label': L('Ausgabe des Terminals', 'Terminal') });
    function zeile(t, art) { aus.appendChild(E('div', { class: art || '', text: t })); aus.scrollTop = aus.scrollHeight; }
    function ausfuehren(z, still) {
      z = String(z || '').trim(); if (!z) return;
      var r = hostAusfuehren(h, z);
      if (r.leeren) { aus.innerHTML = ''; return; }
      zeile((h.shell ? 'root@' + h.shell.id + ':/# ' : cfg.prompt + ' ') + z, 'sr-ein');
      r.aus.forEach(function (x) { zeile(x.t, x.art); });
      st.befehle.push(z); st.letzter = r;
      if (still) { weiter(); return r; }
      var m = cfg.hinweis ? cfg.hinweis(h, r, z, st) : null;
      if (!m && r.fehler && ERKL[r.fehler]) m = ERKL[r.fehler];
      melde(m ? ['bad', T(m)] : null);
      weiter();
      return r;
    }
    var inp = E('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': L('Befehl eingeben', 'Befehl eingeben'), onkeydown: function (e) { if (e.key === 'Enter') { ausfuehren(inp.value); inp.value = ''; } } });
    var term = E('div', { class: 'sr-term' }, [E('div', { class: 'leiste', text: cfg.prompt.replace(/\$$/, '') + ' — bash' }), aus,
      E('div', { class: 'sr-eingabe' }, [E('span', { text: '$' }), inp, E('button', { type: 'button', text: '⏎ Enter', 'aria-label': L('Befehl ausführen', 'Befehl ausführen'), onclick: function () { ausfuehren(inp.value); inp.value = ''; inp.focus(); } })])]);
    if (PFAD.stufe === 'basis' && cfg.bausteine) {
      var bs = E('div', { class: 'sr-bausteine', role: 'group', 'aria-label': L('Befehls-Bausteine', 'Bausteine') });
      cfg.bausteine.forEach(function (w) { bs.appendChild(E('button', { type: 'button', text: w, onclick: function () { inp.value = (inp.value.trim() ? inp.value.trim() + ' ' : '') + w; inp.focus(); } })); });
      bs.appendChild(E('button', { type: 'button', class: 'steuer', text: '⌫ ' + L('Wort', 'Wort'), 'aria-label': L('Letztes Wort löschen', 'Letztes Wort löschen'), onclick: function () { inp.value = inp.value.trim().split(/\s+/).slice(0, -1).join(' '); inp.focus(); } }));
      term.appendChild(bs);
    } else if (cfg.bausteine) term.appendChild(STUFEN.profiBand(L('Ohne Bausteine – du tippst selbst.', 'Ohne Bausteine')));

    /* Rechts: Pfadwahl, Zielliste, Rückmeldung, Auswahlfrage, Browser */
    var rechts = E('div', { class: 'sr-fall' });
    STUFEN.pfadwahl(rechts);
    var liste = E('ol', { style: 'margin:4px 0 0;padding-left:1.3em' }), meldEl = E('div', { 'aria-live': 'polite' }), wahlEl = E('div', { class: 'opt' });
    rechts.appendChild(E('b', { text: L('Deine Ziele', 'Deine Ziele') }));
    rechts.appendChild(liste); rechts.appendChild(wahlEl); rechts.appendChild(meldEl);
    function melde(m) { meldEl.innerHTML = ''; if (m) meldEl.appendChild(E('div', { class: 'sr-rueck ' + m[0], html: m[1] })); }
    function zieleZeichnen() {
      liste.innerHTML = '';
      cfg.ziele.forEach(function (z, i) {
        if (i > st.nr) return;
        liste.appendChild(E('li', { style: i === st.nr && !fertig ? 'font-weight:700' : 'color:#166534', html: (i < st.nr || fertig ? '✔ ' : '') + T(z.text) }));
      });
      wahlEl.innerHTML = '';
      var z = cfg.ziele[st.nr];
      if (fertig || !z || !z.wahl) return;
      z.wahl.optionen.forEach(function (o, k) {
        wahlEl.appendChild(E('button', { type: 'button', html: T(o.t), onclick: function () {
          if (o.richtig) { st.wahl[st.nr] = k; melde(['ok', '✔ ' + T(z.wahl.lob)]); weiter(); }
          else melde(['bad', T(o.fb)]);
        } }));
      });
    }
    var url = null, seite = null;
    function browse(u) {
      if (u) url.value = u;
      var r = hostBrowse(h, url.value);
      seite.className = 'seite' + (r.ok ? '' : ' fehl'); seite.innerHTML = r.ok ? r.seite : r.fehler;
      st.browse = { url: url.value, r: r };
      var m = cfg.hinweisBrowser ? cfg.hinweisBrowser(h, r, url.value, st) : null;
      melde(m ? ['bad', T(m)] : null);
      weiter();
    }
    if (cfg.browser) {
      seite = E('div', { class: 'seite', html: '<i>' + L('Gib oben eine Adresse ein.', 'Gib oben eine Adresse ein.') + '</i>' });
      url = E('input', { type: 'text', value: cfg.browser, 'aria-label': L('Adresse', 'Adresse'), onkeydown: function (e) { if (e.key === 'Enter') browse(); } });
      rechts.appendChild(E('div', { class: 'sr-browser', style: 'margin-top:10px' }, [E('div', { class: 'bar' }, [E('span', { text: '🌐' }), url, E('button', { type: 'button', text: L('Öffnen', 'Öffnen'), onclick: function () { browse(); } })]), seite]));
    }
    wurzel.appendChild(E('div', { class: 'sr-mitte' }, [term, rechts]));

    /* Datei mit Lücken (Lückentext aus raeume.js: Basis Auswahl, Profi Eintippen) */
    if (cfg.datei) {
      var dbox = E('div', { class: 'sr-fall' }, [E('b', { html: L('Datei ', 'Datei ') + '<code>' + cfg.datei.name + '</code>' })]);
      lueckenFall({ datei: cfg.datei.name, text: cfg.datei.text, luecken: cfg.datei.luecken, speichern: function (hh, w) { cfg.datei.speichern(hh, w); st.dateiOk = true; } })(dbox, {
        host: function () { return h; }, neu: function () {},
        ok: function () { melde(['ok', '✔ ' + L('Datei gespeichert – alle Lücken stimmen.', 'Gespeichert. Alles richtig.')]); weiter(); },
        fehl: function (t) { melde(['bad', t]); }
      });
      wurzel.appendChild(dbox);
    }

    /* Ziele prüfen und weiterschalten */
    function weiter() {
      var start = st.nr;
      while (!fertig && cfg.ziele[st.nr] && !cfg.ziele[st.nr].wahl && cfg.ziele[st.nr].ziel(h, st)) {
        st.nr++;
        if (st.nr >= cfg.ziele.length) { fertig = true; break; }
        if (cfg.ziele[st.nr].vorher) cfg.ziele[st.nr].vorher(h, st);
      }
      if (!fertig && cfg.ziele[st.nr] && cfg.ziele[st.nr].wahl && st.wahl[st.nr] !== undefined) {
        st.nr++; if (st.nr >= cfg.ziele.length) fertig = true; else { if (cfg.ziele[st.nr].vorher) cfg.ziele[st.nr].vorher(h, st); weiter(); return; }
      }
      if (st.nr !== start && !fertig && cfg.ziele[st.nr].sage) melde(['ok', T(cfg.ziele[st.nr].sage)]);
      zieleZeichnen();
      if (fertig) abschliessen();
    }
    var erledigt = false;
    function abschliessen() {
      if (erledigt) return; erledigt = true;
      melde(['ok', '🎉 ' + T(cfg.erledigt)]);
      api.notiere(T(cfg.notiz), (st.befehle.length ? '<pre>' + KIT.esc(st.befehle.join('\n')) + '</pre>' : '') + (cfg.notizExtra ? cfg.notizExtra(h, st) : ''));
      api.erledigt(T(cfg.erledigt));
    }
    if (cfg.start) cfg.start(ausfuehren);
    zieleZeichnen();
    return {
      loesen: function () {
        cfg.loese({ cmd: function (c) { ausfuehren(c, true); }, browse: browse, datei: function () { cfg.datei.speichern(h, cfg.datei.richtig); st.dateiOk = true; weiter(); },
          wahl: function () { var z = cfg.ziele[st.nr]; z.wahl.optionen.forEach(function (o, k) { if (o.richtig) st.wahl[st.nr] = k; }); weiter(); } });
        weiter();
      }
    };
  };
}

/* ---------- Übung 2: Die Kantinen-Speisekarte (LZ2, LZ3) ---------- */
var KANTINE = {
  v1: '<h2 style="margin:0">🍲 Kantine Lechwerk – Speiseplan</h2><p>Mo: Linsensuppe · Di: Gemüsecurry · <b>Mi: Spätzle</b> · Do: Fischstäbchen · Fr: Pizza</p>',
  v2: '<h2 style="margin:0">🍲 Kantine Lechwerk – Speiseplan</h2><p>Mo: Linsensuppe · Di: Gemüsecurry · <b>Mi: Kaiserschmarrn</b> · Do: Fischstäbchen · Fr: Pizza</p>'
};
var DOCKERFILE_U2 = 'FROM httpd:alpine\nCOPY speiseplan.html /usr/local/apache2/htdocs/index.html\nEXPOSE 80';
var uebungKantine = uebungsRaum({
  prompt: 'azubi@kantine-srv:~$',
  bausteine: ['docker', 'build', '-t', 'speiseplan', '.', 'run', '-d', '-p', '8500:80', '80:8500', '--name', 'kantine', 'rm', '-f', 'restart', 'ps', 'cat', 'Dockerfile'],
  browser: 'http://localhost:',
  setup: function (h) { h.projekt = { dateien: { Dockerfile: DOCKERFILE_U2, 'speiseplan.html': KANTINE.v1 }, seite: KANTINE.v1, basis: 'httpd:alpine', copy: 'COPY speiseplan.html /usr/local/apache2/htdocs/index.html' }; },
  start: function (aus) { aus('cat Dockerfile', true); },
  ziele: [
    { text: ['Baue aus dem Dockerfile das Image <code>speiseplan</code>.', 'Baue das Image <code>speiseplan</code>.'], ziel: function (h) { return !!h.images['speiseplan:latest']; } },
    { text: ['Starte den Container <code>kantine</code> im Hintergrund, erreichbar unter <code>localhost:8500</code>. Apache hört im Container auf Port 80.', 'Starte den Container <code>kantine</code>. Er soll unter <code>localhost:8500</code> gehen. Apache hört im Container auf 80.'],
      ziel: function (h) { return laeuftMit(h, 'kantine', '8500:80'); } },
    { text: ['Öffne den Speiseplan im Browser.', 'Öffne den Speiseplan im Browser.'], ziel: function (h, st) { return !!(st.browse && st.browse.r.ok && st.browse.r.port === '8500'); } },
    { text: ['Die Kantine hat <code>speiseplan.html</code> geändert: Mittwoch gibt es Kaiserschmarrn. Bring die neue Version auf <code>localhost:8500</code>.', 'Die Datei ist geändert: Mittwoch gibt es Kaiserschmarrn. Zeig die neue Seite unter <code>localhost:8500</code>.'],
      sage: ['📨 Kantine: „Wir haben den Mittwoch geändert – die Datei liegt schon im Ordner.“', '📨 Kantine: „Wir haben den Mittwoch geändert.“'],
      vorher: function (h) { h.projekt.dateien['speiseplan.html'] = KANTINE.v2; h.projekt.seite = KANTINE.v2; },
      ziel: function (h, st) { return !!(st.browse && st.browse.r.ok && st.browse.r.port === '8500' && st.browse.r.seite === KANTINE.v2); } }
  ],
  hinweis: function (h, r, z, st) {
    if (/-p\s+80:8500/.test(z) && r.gestartet) return ['Der Container läuft, aber das Mapping ist verdreht: links der Host (8500), rechts der Container (80). Lösche ihn mit <code>docker rm -f kantine</code> und starte neu.', 'Die Zahlen sind vertauscht. Links 8500, rechts 80. Lösche mit <code>docker rm -f kantine</code>.'];
    if (r.neustart && st.nr === 3) return ['Restart startet denselben Container mit dem <b>alten</b> Image. Die neue Datei kommt erst mit einem neuen Build ins Image.', 'Restart nimmt das alte Image. Erst neu bauen.'];
    if (r.gebaut && st.nr === 3) return null;
    if (r.fehler === 'konflikt') return ['Den Namen <code>kantine</code> gibt es schon. Lösche den alten Container mit <code>docker rm -f kantine</code>.', 'Den Namen gibt es schon. Erst <code>docker rm -f kantine</code>.'];
    return null;
  },
  hinweisBrowser: function (h, r, u, st) {
    if (r.port === '80') return ['Port 80 ist der Port <b>im Container</b>. Der Browser fragt den Host – die linke Zahl.', 'Port 80 ist im Container. Nimm die linke Zahl.'];
    if (st.nr === 3 && r.ok && r.seite === KANTINE.v1) return ['Noch der alte Speiseplan: Der Container nutzt das alte Image. Neu bauen, alten Container löschen, neu starten.', 'Noch die alte Seite. Neu bauen, Container löschen, neu starten.'];
    return null;
  },
  notiz: ['Übung 2 Kantine: meine Befehle', 'Übung 2: meine Befehle'],
  erledigt: ['Speiseplan gebaut, unter localhost:8500 veröffentlicht und nach der Änderung neu gebaut.', 'Speiseplan läuft unter localhost:8500. Neu gebaut nach der Änderung.'],
  loese: function (x) {
    x.cmd('docker build -t speiseplan .'); x.cmd('docker run -d -p 8500:80 --name kantine speiseplan'); x.browse('http://localhost:8500');
    x.cmd('docker build -t speiseplan .'); x.cmd('docker rm -f kantine'); x.cmd('docker run -d -p 8500:80 --name kantine speiseplan'); x.browse('http://localhost:8500');
  }
});

/* ---------- Übung 3: Das Trainingstagebuch (LZ4) ---------- */
var COMPOSE_U3 = '# Trainingstagebuch – Notiz-App mit SQLite\nservices:\n  app:\n    image: trainingstagebuch:1.4\n    ports:\n      - "8300:3000"\n    volumes:\n      - {{db}}:/app/data       # SQLite-Datenbank\n      - {{exp}}:/app/export    # PDF-Export für die Trainer\n\nvolumes:\n  {{decl}}:';
var uebungTagebuch = uebungsRaum({
  prompt: 'azubi@tagebuch-srv:~/tagebuch$',
  bausteine: ['docker', 'compose', 'up', '-d', 'down', '-v', 'ps', 'volume', 'ls', 'export'],
  datei: { name: 'docker-compose.yml', text: COMPOSE_U3,
    luecken: {
      db: { optionen: ['notizen-db', './data', '/app/data'], richtig: 'notizen-db', tipp: ['Die Datenbank soll Docker verwalten – dafür gibt es einen <b>Namen</b> statt eines Pfads.', 'Die Datenbank bekommt einen Namen.'],
        fb: { './data': ['<code>./data</code> ist ein Pfad – ein Bind Mount. Die Datenbank muss niemand anfassen: Ein Named Volume genügt.', '<code>./data</code> ist ein Ordner. Nimm einen Namen.'], '/app/data': ['Links steht, was vom Host kommt. <code>/app/data</code> ist der Pfad im Container (rechts).', 'Links steht nicht der Container-Pfad.'] } },
      exp: { optionen: ['./export', 'export', '/app/export'], richtig: './export', tipp: ['Die Trainer wollen die PDFs im Ordner sehen – dafür brauchst du einen <b>Pfad</b> auf dem Host.', 'Der Export braucht einen Ordner: <code>./export</code>.'],
        fb: { export: ['Ein Name links ist ein Named Volume. Die PDFs lägen dann versteckt bei Docker, nicht im Projektordner.', 'Ein Name ist ein Volume. Die Trainer sehen es nicht.'], '/app/export': ['Links steht der Host-Ordner. <code>/app/export</code> ist der Pfad im Container.', 'Links steht nicht der Container-Pfad.'] } },
      decl: { optionen: ['notizen-db', 'export', 'data'], richtig: 'notizen-db', tipp: ['Unten deklarierst du nur Named Volumes – also den Namen von oben.', 'Unten steht der Name vom Volume.'] }
    },
    richtig: { db: 'notizen-db', exp: './export', decl: 'notizen-db' },
    speichern: function (h, w) { h.compose.werte = w; h.compose.gespeichert = true; } },
  setup: function (h) {
    h.env = true;
    h.projekt = { dateien: { 'docker-compose.yml': '(Lückentext)' } };
    h.compose = { projekt: 'tagebuch', werte: {}, gespeichert: false, envVars: [],
      dienste: function () { return [{ dienst: 'app', image: 'trainingstagebuch:1.4', ports: ['8300:3000'], port: 3000, seite: '<p>Trainingstagebuch</p>', volume: 'notizen-db', bind: '/home/azubi/export' }]; } };
  },
  ziele: [
    { text: ['Ergänze die Datei: Die Datenbank soll Updates überleben, ohne dass jemand die Dateien anfasst. Die PDF-Exporte sollen im Ordner <code>./export</code> auf dem Host liegen.', 'Ergänze die Datei. Die Datenbank soll bleiben. Die PDFs sollen im Ordner <code>./export</code> liegen.'], ziel: function (h, st) { return !!st.dateiOk; } },
    { text: ['Starte die App mit Compose im Hintergrund.', 'Starte die App mit Compose.'], ziel: function (h) { return h.container.some(function (c) { return c.compose === 'tagebuch' && c.status === 'up'; }); } },
    { text: ['Schau nach, was Docker angelegt hat: <code>docker volume ls</code> und <code>ls</code>.', 'Schau nach: <code>docker volume ls</code> und <code>ls</code>.'], ziel: function (h, st) { return st.befehle.some(function (b) { return /docker\s+volume\s+ls/.test(b); }) && st.befehle.some(function (b) { return /^ls\b/.test(b); }); } },
    { text: ['Der Verein will testen, was ein „großes Aufräumen“ anrichtet: <code>docker compose down -v</code>.', 'Teste: <code>docker compose down -v</code>.'], ziel: function (h) { return h.compose.unten === 'v'; } },
    { text: ['Was ist jetzt noch da? Prüfe es im Terminal und wähle.', 'Was ist noch da? Prüfe im Terminal. Dann wähle.'],
      wahl: { lob: ['Genau: <code>down -v</code> hat das Volume <code>tagebuch_notizen-db</code> gelöscht. Der Ordner <code>./export</code> auf dem Host bleibt.', 'Richtig: Das Volume ist weg. Der Ordner bleibt.'],
        optionen: [
          { t: ['Nur der Ordner <code>./export</code> – die Datenbank ist weg', 'Nur der Ordner <code>./export</code>'], richtig: true },
          { t: ['Beides – <code>down</code> löscht nur Container', 'Beides ist noch da'], fb: ['Das gilt für <code>down</code> <b>ohne</b> <code>-v</code>. Schau mit <code>docker volume ls</code> nach.', 'Ohne <code>-v</code> ja. Mit <code>-v</code> nicht. Schau mit <code>docker volume ls</code>.'] },
          { t: ['Nichts – auch <code>./export</code> ist weg', 'Nichts ist mehr da'], fb: ['Bind Mounts sind normale Ordner auf dem Host. Docker löscht sie nicht. Prüfe mit <code>ls</code>.', 'Docker löscht keine Ordner auf dem Rechner. Prüfe mit <code>ls</code>.'] }
        ] } }
  ],
  notiz: ['Übung 3 Trainingstagebuch: Volume oder Bind Mount', 'Übung 3: Volume oder Bind Mount'],
  notizExtra: function () { return '<p>Datenbank → Named Volume <code>notizen-db</code> (Docker verwaltet sie). Export → Bind Mount <code>./export</code> (auf dem Host sichtbar). Nach <code>down -v</code> bleibt nur <code>./export</code>.</p>'; },
  erledigt: ['Datenbank im Named Volume, Export im Bind Mount – und gesehen, was down -v löscht.', 'Volume für die Datenbank, Ordner für den Export. down -v löscht das Volume.'],
  loese: function (x) { x.datei(); x.cmd('docker compose up -d'); x.cmd('docker volume ls'); x.cmd('ls'); x.cmd('docker compose down -v'); x.wahl(); }
});

/* ---------- Übung 4: Das Vereins-Forum (LZ5) ---------- */
var FORUM = '<h2 style="margin:0">💬 Forum SV Hochfeld</h2><p>Neu: Fahrgemeinschaften zum Auswärtsspiel</p>';
var COMPOSE_U4F = '# Vereins-Forum SV Hochfeld\nservices:\n  forum:\n    image: flarum:1.8\n    ports:\n      - "8400:80"\n    environment:\n      DB_HOST: {{host}}\n      DB_PASSWORD: {{pw}}\n    depends_on:\n      mariadb:\n        condition: {{cond}}\n\n  mariadb:\n    image: mariadb:11\n    environment:\n      MARIADB_ROOT_PASSWORD: ${DB_PASSWORD}\n    ports: {{dbports}}\n    volumes:\n      - forumdaten:/var/lib/mysql\n    healthcheck:\n      test: ["CMD", "healthcheck.sh", "--connect"]\n\nvolumes:\n  forumdaten:';
var uebungForum = uebungsRaum({
  prompt: 'azubi@hochfeld-srv:~/forum$',
  bausteine: ['docker', 'compose', 'up', '-d', 'start', 'ps', 'logs', 'cp', '.env.example', '.env', 'ls', '-a'],
  browser: 'http://localhost:',
  datei: { name: 'docker-compose.yml', text: COMPOSE_U4F,
    luecken: {
      host: { optionen: ['mariadb', 'localhost', 'db'], richtig: 'mariadb', tipp: ['Wie heißt der Datenbank-Service in <b>dieser</b> Datei? So heißt auch der Host.', 'Schau: Wie heißt die Datenbank in dieser Datei?'],
        fb: { localhost: ['Im Forum-Container ist <code>localhost</code> das Forum selbst. Die Datenbank erreichst du über ihren Service-Namen.', '<code>localhost</code> ist das Forum selbst.'], db: ['In Raum 4 hieß der Service <code>db</code>. Hier heißt er anders – schau in die Datei.', 'Hier heißt die Datenbank nicht <code>db</code>.'] } },
      pw: { optionen: ['${DB_PASSWORD}', 'DB_PASSWORD', '.env'], richtig: '${DB_PASSWORD}', tipp: ['Eine Variable aus der <code>.env</code> schreibst du mit Dollar und Klammern.', 'Schreibe: <code>${DB_PASSWORD}</code>'],
        fb: { DB_PASSWORD: ['Ohne <code>${…}</code> wäre das Passwort wörtlich „DB_PASSWORD“.', 'Ohne <code>${ }</code> ist es nur ein Wort.'], '.env': ['Hier steht die Variable, nicht der Dateiname.', 'Hier steht die Variable.'] } },
      cond: { optionen: ['service_healthy', 'service_started'], richtig: 'service_healthy', tipp: ['Das Forum soll erst starten, wenn die Datenbank Anfragen annimmt.', 'Das Forum wartet, bis die Datenbank bereit ist.'],
        fb: { service_started: ['<code>service_started</code> wartet nur auf den Start des Containers – die Datenbank ist dann oft noch nicht bereit.', 'Gestartet heißt noch nicht bereit.'] } },
      dbports: { optionen: ['[]', '["3306:3306"]'], richtig: '[]', immerAuswahl: true, tipp: ['Die Datenbank darf nicht von außen erreichbar sein.', 'Die Datenbank braucht keinen Port nach außen.'],
        fb: { '["3306:3306"]': ['Damit wäre die Datenbank von außen erreichbar. Das Forum erreicht sie auch ohne – über das interne Netz.', 'Dann ist die Datenbank von außen offen. Das soll nicht sein.'] } }
    },
    richtig: { host: 'mariadb', pw: '${DB_PASSWORD}', cond: 'service_healthy', dbports: '[]' },
    speichern: function (h, w) { h.compose.werte = w; h.compose.gespeichert = true; } },
  setup: function (h) {
    h.projekt = { dateien: { 'docker-compose.yml': '(Lückentext)', '.env.example': 'DB_PASSWORD=Hochfeld1922' } };
    h.compose = { projekt: 'forum', werte: {}, gespeichert: false, envVars: ['DB_PASSWORD'],
      dienste: function () { return [{ dienst: 'mariadb', image: 'mariadb:11', volume: 'forumdaten', brauchtEnv: true, health: true }, { dienst: 'forum', image: 'flarum:1.8', ports: ['8400:80'], port: 80, seite: FORUM }]; },
      logs: function (h, f) {
        if (!h.env) { f('forum-mariadb-1  | [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified', 'fehler'); return; }
        f('forum-mariadb-1  | [Note] mariadbd: ready for connections.'); f('forum-forum-1    | Flarum is ready');
      } };
  },
  ziele: [
    { text: ['Ergänze die Datei. Die Datenbank darf nicht von außen erreichbar sein.', 'Ergänze die Datei. Die Datenbank bleibt innen.'], ziel: function (h, st) { return !!st.dateiOk; } },
    { text: ['Lege die Datei mit dem Passwort an. Schau zuerst mit <code>ls -a</code>, was im Ordner liegt.', 'Lege die Datei mit dem Passwort an. Schau zuerst mit <code>ls -a</code>.'], ziel: function (h) { return !!h.env; } },
    { text: ['Starte das Forum zum ersten Mal.', 'Starte das Forum zum 1. Mal.'], ziel: function (h) { return h.container.some(function (c) { return c.compose === 'forum' && c.dienst === 'forum' && c.status === 'up'; }); } },
    { text: ['Prüfe im Browser, ob das Forum antwortet.', 'Prüfe im Browser: Geht das Forum?'], ziel: function (h, st) { return !!(st.browse && st.browse.r.ok && st.browse.r.seite === FORUM); } }
  ],
  hinweis: function (h, r, z) {
    if (/^ls/.test(z) && !h.env) return null;
    if (r.fehler === 'envFehlt') return ['<code>variable is not set</code>: Compose findet keine <code>.env</code>. Die Vorlage heißt <code>.env.example</code> – kopiere sie: <code>cp .env.example .env</code>. Danach noch einmal <code>up -d</code>.', 'Die Datei <code>.env</code> fehlt. Tippe: <code>cp .env.example .env</code>. Dann noch einmal <code>up -d</code>.'];
    return null;
  },
  hinweisBrowser: function (h, r) {
    if (r.ssl) return ['<code>SSL_ERROR_RX_RECORD_TOO_LONG</code>: Das Forum spricht kein https. Tippe <code>http://</code>.', 'Das Forum kann kein https. Tippe <code>http://</code>.'];
    if (!r.ok && r.port === '80') return ['Port 80 ist der Port im Container. Im Browser brauchst du den Host-Port aus <code>ports:</code>.', 'Nimm den Port links aus <code>ports:</code>.'];
    return null;
  },
  notiz: ['Übung 4 Vereins-Forum: meine Befehle', 'Übung 4: meine Befehle'],
  notizExtra: function () { return '<p>Host der Datenbank = Service-Name <code>mariadb</code>. Kein <code>ports:</code> bei der Datenbank. <code>service_healthy</code>, Passwort aus <code>.env</code>.</p>'; },
  erledigt: ['Forum mit MariaDB gestartet: Service-Name als Host, Passwort aus der .env, Datenbank nur intern.', 'Das Forum läuft. Host = Service-Name. Passwort aus .env.'],
  loese: function (x) { x.datei(); x.cmd('ls -a'); x.cmd('cp .env.example .env'); x.cmd('docker compose up -d'); x.browse('http://localhost:8400'); }
});

/* ---------- Übung 5: Die Fehler-Sprechstunde (LZ6) ---------- */
var SPRECHSTUNDE = [
  { kunde: 'Bäckerei Krume', meldung: 'WARN[0000] The "DB_PASSWORD" variable is not set. Defaulting to a blank string.', u: 0 },
  { kunde: 'SV Hochfeld', meldung: 'service "forum" has no container to start', u: 1 },
  { kunde: 'Kantine Lechwerk', meldung: 'Bind for 0.0.0.0:8500 failed: port is already allocated', u: 2 },
  { kunde: 'TSV Lechwiesen', meldung: 'Browser: Fehlercode SSL_ERROR_RX_RECORD_TOO_LONG', u: 3 },
  { kunde: 'Lechpost', meldung: 'lechpost-db-1   mariadb:11   Up 6 minutes (health: starting)', u: 4, profi: true },
  { kunde: 'Foto-AG', meldung: 'no such service: immich-machine-learning', u: 5, profi: true }
];
var SP_URSACHE = [['Die Datei <code>.env</code> fehlt oder heißt anders.', '<code>.env</code> fehlt.'], ['Die Container wurden noch nie erstellt.', 'Es gibt noch keine Container.'], ['Ein anderer Container belegt den Host-Port.', 'Der Port ist schon belegt.'], ['Im Browser steht <code>https://</code>, der Dienst spricht <code>http</code>.', '<code>https</code> statt <code>http</code>.'], ['Die Datenbank wird nicht gesund – etwas stimmt beim Start nicht.', 'Die Datenbank wird nicht bereit.'], ['Der Service gehört zu einem Profil und ist nicht zugeschaltet.', 'Der Service ist in einem Profil.']];
var SP_BEHEBUNG = [['<code>cp .env.example .env</code>, dann <code>up -d</code>', '<code>cp .env.example .env</code>'], ['<code>docker compose up -d</code> statt <code>start</code>', '<code>up -d</code> statt <code>start</code>'], ['links einen freien Host-Port eintragen', 'einen freien Port links eintragen'], ['<code>http://</code> tippen', '<code>http://</code> tippen'], ['<code>docker compose logs</code> der Datenbank lesen', 'die Logs der Datenbank lesen'], ['<code>docker compose --profile ml up -d</code>', '<code>--profile ml</code> dazuschreiben']];
function uebungSprechstunde(box, api) {
  var E = KIT.el;
  if (!document.getElementById('sr-css')) { var s = document.createElement('style'); s.id = 'sr-css'; s.textContent = SR_CSS; document.head.appendChild(s); }
  box.innerHTML = '';
  STUFEN.pfadwahl(box);
  if (PFAD.stufe === 'profi') box.appendChild(STUFEN.profiBand(L('Sechs Tickets statt vier – auch Healthcheck und Profile', '6 Tickets statt 4')));
  var tickets = SPRECHSTUNDE.filter(function (t) { return !t.profi || PFAD.stufe === 'profi'; });
  var nummern = tickets.map(function (t) { return t.u; });
  function mischen(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
  var wurzel = E('div', { class: 'sr-spiel', style: 'min-height:0' });
  box.appendChild(wurzel);
  wurzel.appendChild(E('p', { style: 'margin:0', html: L('📮 Sprechstunde bei Hafenblick: Ordne jedem Ticket die <b>Ursache</b> und die <b>Behebung</b> zu.', '📮 Sprechstunde: Wähle bei jedem Ticket die <b>Ursache</b> und die <b>Lösung</b>.') }));
  var felder = tickets.map(function (t, i) {
    function auswahl(liste, was) {
      return E('select', { 'aria-label': was + ' Ticket ' + (i + 1), style: 'width:100%;min-height:40px' }, [E('option', { value: '', text: '– ' + was + ' –' })].concat(mischen(nummern).map(function (k) { return E('option', { value: String(k), text: T(liste[k]).replace(/<[^>]+>/g, '') }); })));
    }
    var su = auswahl(SP_URSACHE, L('Ursache', 'Ursache')), sb = auswahl(SP_BEHEBUNG, L('Behebung', 'Lösung')), rk = E('div', { 'aria-live': 'polite' });
    wurzel.appendChild(E('div', { class: 'sr-fall' }, [E('div', { class: 'nr', text: '📨 Ticket ' + (i + 1) + ' · ' + t.kunde }), E('div', { class: 'sr-editor', style: 'white-space:pre-wrap', text: t.meldung }),
      E('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:6px;margin-top:6px' }, [su, sb]), rk]));
    return { t: t, su: su, sb: sb, rk: rk };
  });
  var gesamt = E('div', { 'aria-live': 'polite' }), erledigt = false;
  function pruefen() {
    var ok = 0;
    felder.forEach(function (f) {
      var u = f.su.value === String(f.t.u), b = f.sb.value === String(f.t.u);
      f.rk.innerHTML = '';
      if (u && b) { ok++; f.rk.appendChild(E('div', { class: 'sr-rueck ok', html: '✔ ' + L('Passt.', 'Richtig.') })); return; }
      if (!f.su.value && !f.sb.value) return;
      f.rk.appendChild(E('div', { class: 'sr-rueck bad', html: !u ? L('Die Ursache passt nicht. Lies die Meldung Wort für Wort: Welches Wort ist der Hinweis?', 'Die Ursache passt nicht. Lies die Meldung genau.') : L('Die Ursache stimmt – aber die Behebung passt nicht dazu.', 'Die Ursache stimmt. Die Lösung passt nicht.') }));
    });
    gesamt.innerHTML = '';
    gesamt.appendChild(E('div', { class: 'sr-rueck ' + (ok === felder.length ? 'ok' : 'bad'), html: ok + L(' von ', ' von ') + felder.length + L(' Tickets gelöst.', ' Tickets gelöst.') }));
    if (ok === felder.length && !erledigt) {
      erledigt = true;
      api.notiere(L('Übung 5 Fehler-Sprechstunde: meine Zuordnungen', 'Übung 5: meine Zuordnungen'), '<ul>' + felder.map(function (f) { return '<li><code>' + KIT.esc(f.t.meldung) + '</code> → ' + T(SP_URSACHE[f.t.u]) + ' → ' + T(SP_BEHEBUNG[f.t.u]) + '</li>'; }).join('') + '</ul>');
      api.erledigt(L('Alle ' + felder.length + ' Tickets richtig: Meldung gelesen, Ursache erkannt, Behebung gewählt.', 'Alle ' + felder.length + ' Tickets richtig.'));
    }
  }
  wurzel.appendChild(E('div', {}, [E('button', { type: 'button', text: L('Prüfen', 'Prüfen'), onclick: pruefen }), gesamt]));
  return { loesen: function () { felder.forEach(function (f) { f.su.value = String(f.t.u); f.sb.value = String(f.t.u); }); pruefen(); } };
}

/* ---------- Übungen ins Paket ---------- */
PAKET.uebungen.push(
  { id: 'U2', titel: 'Die Kantinen-Speisekarte', lz: ['LZ2', 'LZ3'],
    auftrag: 'Die Kantine Lechwerk will ihren Speiseplan im Netz. Bau das Image, veröffentliche es auf Port 8500 und zeig danach die geänderte Fassung.',
    interaktion: uebungKantine,
    tipps: ['Welche Zahl gehört dem Host, welche dem Container? Apache hört im Container auf Port 80.', 'Links 8500, rechts 80: <code>-p 8500:80</code>. Nach der Änderung: <code>COPY</code> legt die Datei ins Image – also neu bauen.', 'Lösung: <code>docker build -t speiseplan .</code> · <code>docker run -d -p 8500:80 --name kantine speiseplan</code> · nach der Änderung <code>docker build -t speiseplan .</code>, <code>docker rm -f kantine</code>, wieder <code>docker run …</code>.'],
    reflexion: { frage: 'Warum reicht <code>docker restart kantine</code> nach der Änderung nicht?', muster: 'Restart startet denselben Container mit demselben Image. Die neue Datei ist erst nach einem neuen Build im Image.' } },
  { id: 'U3', titel: 'Das Trainingstagebuch', lz: ['LZ4'],
    auftrag: 'Der TSV nutzt eine Notiz-App als Trainingstagebuch. Die Datenbank soll Updates überleben, die PDF-Exporte sollen die Trainer im Ordner sehen.',
    interaktion: uebungTagebuch,
    tipps: ['Welche Daten musst du selbst sehen, welche nicht?', 'Die Datenbank bekommt einen Namen (Named Volume), der Export einen Pfad (Bind Mount).', 'Lösung: <code>notizen-db:/app/data</code>, <code>./export:/app/export</code>, unten <code>notizen-db:</code>. Nach <code>down -v</code> ist das Volume weg, <code>./export</code> bleibt.'],
    reflexion: { frage: 'Wann würdest du für eine Datenbank doch einen Bind Mount nehmen?', muster: 'Wenn ich die Datenbank-Dateien selbst sichern oder auf einen anderen Rechner kopieren will, z. B. bei Immich der Ordner für das Backup.' } },
  { id: 'U4', titel: 'Das Vereins-Forum', lz: ['LZ5'],
    auftrag: 'Der SV Hochfeld will ein Forum mit MariaDB. Mach die Datei startklar und starte das Forum. Die Datenbank darf nicht von außen erreichbar sein.',
    interaktion: uebungForum,
    tipps: ['Wie heißt der Datenbank-Service in der Datei? So heißt auch der Host.', '<code>DB_HOST: mariadb</code>, kein <code>ports:</code> bei mariadb – und denk an die <code>.env</code>.', 'Lösung: <code>mariadb</code>, <code>${DB_PASSWORD}</code>, <code>service_healthy</code>, <code>[]</code>; dann <code>cp .env.example .env</code> und <code>docker compose up -d</code>; Browser <code>http://localhost:8400</code>.'],
    reflexion: { frage: 'Warum heißt der Host hier <code>mariadb</code> und in Raum 4 <code>db</code>?', muster: 'Der Hostname ist immer der Service-Name aus der Datei.' } },
  { id: 'U5', titel: 'Die Fehler-Sprechstunde', lz: ['LZ6'],
    auftrag: 'In der Sprechstunde von Hafenblick liegen Tickets anderer Kunden. Finde zu jeder Meldung Ursache und Behebung.',
    interaktion: uebungSprechstunde,
    tipps: ['Lies jede Meldung Wort für Wort. Welches Wort verrät die Ursache – Port, Variable, Container, https, health, Service?', 'Zwei Zuordnungen: <code>variable is not set</code> → <code>.env</code> fehlt → <code>cp .env.example .env</code>. <code>port is already allocated</code> → Port belegt → links freien Port eintragen.', 'Lösung: Variable → .env kopieren · no container to start → <code>up -d</code> · Port belegt → anderer Host-Port · SSL_ERROR → <code>http://</code> · health: starting → Logs lesen · no such service → <code>--profile ml</code>.'],
    reflexion: { frage: 'Welche Meldung hat dich am meisten überrascht – und warum?', muster: 'Zum Beispiel <code>SSL_ERROR_RX_RECORD_TOO_LONG</code>, weil der Fehler gar nicht von Docker kommt, sondern vom Browser.' } }
);
