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

/* ---------- Befehle nachschlagen (aufklappbar unter jeder Übung) ----------
   Allgemeine Form mit Platzhaltern in GROSSBUCHSTABEN – keine fertige Lösung. */
var BEFEHLE = {
  ps: ['docker ps', 'zeigt die laufenden Container', 'zeigt Container, die laufen'],
  psa: ['docker ps -a', 'zeigt alle Container, auch beendete', 'zeigt alle Container, auch beendete'],
  images: ['docker images', 'zeigt die Images auf dem Server', 'zeigt die Images'],
  rm: ['docker rm NAME NAME …', 'löscht beendete Container; mit <code>-f</code> auch laufende', 'löscht Container. Mit <code>-f</code> auch laufende.'],
  prune: ['docker container prune -f', 'löscht alle beendeten Container auf einmal', 'löscht alle beendeten Container'],
  cat: ['cat DATEI', 'zeigt den Inhalt einer Datei', 'zeigt, was in einer Datei steht'],
  ls: ['ls -a', 'zeigt die Dateien im Ordner, mit <code>-a</code> auch versteckte wie <code>.env</code>', 'zeigt die Dateien. <code>-a</code> zeigt auch <code>.env</code>.'],
  build: ['docker build -t NAME .', 'baut aus dem Dockerfile im Ordner (<code>.</code>) ein Image', 'baut ein Image. Der Punkt heißt: hier im Ordner.'],
  run: ['docker run -d -p HOST:CONTAINER --name NAME IMAGE', 'startet einen neuen Container im Hintergrund; links der Port des Servers, rechts der Port im Container', 'startet einen neuen Container. Links der Port vom Rechner, rechts der Port im Container.'],
  restart: ['docker restart NAME', 'startet <b>denselben</b> Container neu – mit dem alten Image', 'startet den Container neu. Er hat das alte Image.'],
  cp: ['cp .env.example .env', 'kopiert die Vorlage zur Datei <code>.env</code>, aus der Compose die Variablen liest', 'macht aus der Vorlage die Datei <code>.env</code>'],
  up: ['docker compose up -d', 'erstellt und startet alle Dienste aus der <code>docker-compose.yml</code>', 'macht und startet alle Container aus der Datei'],
  start: ['docker compose start', 'startet nur Container, die es schon gibt', 'startet nur Container, die es schon gibt'],
  cps: ['docker compose ps', 'zeigt die Container dieses Compose-Projekts', 'zeigt die Container aus der Datei'],
  logs: ['docker compose logs DIENST', 'zeigt die Meldungen eines Dienstes', 'zeigt die Meldungen von einem Dienst'],
  down: ['docker compose down', 'löscht Container und Netzwerk – Volumes bleiben', 'löscht die Container. Volumes bleiben.'],
  downv: ['docker compose down -v', 'löscht zusätzlich die Volumes', 'löscht auch die Volumes'],
  volls: ['docker volume ls', 'zeigt alle Volumes', 'zeigt alle Volumes'],
  profil: ['docker compose --profile NAME up -d', 'startet zusätzlich die Dienste eines Profils', 'startet auch die Dienste aus einem Profil'],
  browser: ['http://localhost:PORT', 'im Browser: PORT ist die <b>linke</b> Zahl beim Port-Mapping, immer <code>http://</code>', 'im Browser: die linke Zahl. Immer <code>http://</code>.'],
  fPorts: ['ports:\n  - "HOST:CONTAINER"', 'in der Datei: Port nach außen – nur für Dienste, die der Browser erreichen soll', 'in der Datei: Port nach außen. Nur wenn der Browser den Dienst braucht.'],
  fVol: ['volumes:\n  - NAME:/pfad\n  - ./ordner:/pfad', 'in der Datei: Name links = Named Volume, Pfad links = Bind Mount; Named Volumes unten unter <code>volumes:</code> deklarieren', 'in der Datei: Name links = Volume. Pfad links = Bind Mount. Volumes unten noch einmal aufschreiben.'],
  fEnv: ['environment:\n  VAR: ${VAR}', 'in der Datei: Wert kommt aus der <code>.env</code>', 'in der Datei: Der Wert kommt aus der <code>.env</code>.'],
  fHost: ['DB_HOST: SERVICE', 'in der Datei: Die Datenbank erreichst du über ihren Service-Namen, nicht über <code>localhost</code>', 'in der Datei: Die Adresse ist der Name vom Service. Nicht <code>localhost</code>.'],
  fDep: ['depends_on:\n  SERVICE:\n    condition: service_healthy', 'in der Datei: startet erst, wenn der andere Dienst gesund ist', 'in der Datei: wartet, bis der andere Dienst bereit ist']
};
function befehlsHilfe(keys) {
  var E = KIT.el, ul = E('ul', { style: 'margin:6px 0;padding-left:1.1em' });
  keys.forEach(function (k) {
    var b = BEFEHLE[k];
    ul.appendChild(E('li', {}, [E('code', { style: 'white-space:pre-wrap', text: b[0] }), E('span', { html: ' – ' + L(b[1], b[2]) })]));
  });
  return E('details', { class: 'sr-regeln' }, [E('summary', { text: '📘 ' + L('Befehle nachschlagen', 'Befehle nachschlagen') }), ul]);
}

/* „📋 Das brauchst du“: alle Angaben, die man für die Lösung kennen muss (Namen, Ports, Pfade, Regeln) */
function datenBox(zeilen) {
  var E = KIT.el;
  return E('div', { class: 'sr-daten', style: 'background:#fef9c3;color:#422006;border:2px solid #facc15;border-radius:10px;padding:8px 12px;margin:0 0 10px' }, [
    E('b', { text: '📋 ' + L('Das brauchst du', 'Das brauchst du') }),
    E('ul', { style: 'margin:4px 0 0;padding-left:1.1em;font-size:.92rem' }, zeilen.map(function (z) { return E('li', { style: 'margin:3px 0', html: T(z) }); }))
  ]);
}

/* Übung 1 (inhalt.js) bekommt Angaben und Befehlsübersicht über einen Wrapper */
var DATEN_U1 = [
  ['Server der Bäckerei Krume. Diese Container müssen <b>weiterlaufen</b>: <code>kasse</code> und <code>bestellungen</code>.', 'Server der Bäckerei Krume. Diese Container müssen <b>laufen bleiben</b>: <code>kasse</code> und <code>bestellungen</code>.'],
  ['Spalte STATUS: <code>Up …</code> = läuft, <code>Exited …</code> = beendet.', 'Spalte STATUS: <code>Up</code> = läuft. <code>Exited</code> = beendet.'],
  ['Die Namen der Container stehen in der letzten Spalte (NAMES).', 'Die Namen stehen in der letzten Spalte (NAMES).']
];
var uebungHalleBasis = uebungHalle;
uebungHalle = function (box, api) { var r = uebungHalleBasis(box, api); box.insertBefore(datenBox(DATEN_U1), box.firstChild); box.appendChild(befehlsHilfe(['ps', 'psa', 'rm', 'prune'])); return r; };
PAKET.uebungen.forEach(function (u) { if (u.interaktion === uebungHalleBasis) u.interaktion = uebungHalle; });

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
    if (cfg.daten) rechts.appendChild(datenBox(cfg.daten));
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
    if (cfg.befehle) wurzel.appendChild(befehlsHilfe(cfg.befehle));

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
  befehle: ['cat', 'build', 'run', 'ps', 'rm', 'restart', 'browser'],
  daten: [
    ['Im Ordner liegen <code>Dockerfile</code> und <code>speiseplan.html</code>. Das Dockerfile legt die Seite per <code>COPY</code> ins Image.', 'Im Ordner: <code>Dockerfile</code> und <code>speiseplan.html</code>. <code>COPY</code> legt die Seite ins Image.'],
    ['Name des Images: <code>speiseplan</code>', 'Name vom Image: <code>speiseplan</code>'],
    ['Name des Containers: <code>kantine</code>', 'Name vom Container: <code>kantine</code>'],
    ['Port im Browser (Host): <code>8500</code> · Port im Container: <code>80</code> (Apache)', 'Port im Browser: <code>8500</code>. Port im Container: <code>80</code>.'],
    ['Nach einer Änderung an <code>speiseplan.html</code>: neu bauen, alten Container löschen, neu starten.', 'Datei geändert? Neu bauen. Alten Container löschen. Neu starten.']
  ],
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
  befehle: ['fVol', 'up', 'cps', 'volls', 'ls', 'down', 'downv'],
  daten: [
    ['Datenbank im Container: <code>/app/data</code> · Name für ihr Volume: <code>notizen-db</code>', 'Datenbank im Container: <code>/app/data</code>. Name vom Volume: <code>notizen-db</code>'],
    ['PDF-Exporte im Container: <code>/app/export</code> · Ordner auf dem Server: <code>./export</code>', 'PDFs im Container: <code>/app/export</code>. Ordner auf dem Server: <code>./export</code>'],
    ['Zeile <code>QUELLE:/pfad/im/container</code> – links steht, <b>wo</b> die Daten außerhalb liegen:<br><b>Name</b> links (z. B. <code>daten</code>) = Named Volume: Docker verwaltet den Speicher, man öffnet ihn nicht selbst.<br><b>Pfad</b> links (z. B. <code>./ordner</code>) = Bind Mount: ein normaler Ordner auf dem Server.', 'Links steht, <b>wo</b> die Daten liegen:<br><b>Name</b> = Volume. Docker verwaltet es.<br><b>Pfad</b> wie <code>./ordner</code> = Bind Mount. Ein Ordner auf dem Server.'],
    ['Jedes Named Volume steht unten unter <code>volumes:</code> noch einmal.', 'Jedes Volume steht unten unter <code>volumes:</code> noch einmal.']
  ],
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
    { text: ['Ergänze die drei Lücken in der Datei:<br>① <b>Datenbank</b> (<code>/app/data</code>): Sie soll erhalten bleiben, wenn der Container gelöscht und durch eine neue Version ersetzt wird. Niemand muss die Dateien öffnen – Docker soll sie verwalten.<br>② <b>PDF-Exporte</b> (<code>/app/export</code>): Die Trainer wollen sie auf dem Server im Ordner <code>./export</code> öffnen.<br>③ Unten: das Volume aus ① anmelden.', 'Fülle die 3 Lücken aus:<br>① <b>Datenbank</b> (<code>/app/data</code>): Sie soll bleiben, auch wenn der Container gelöscht wird. Docker soll sie verwalten.<br>② <b>PDFs</b> (<code>/app/export</code>): Die Trainer wollen sie im Ordner <code>./export</code> öffnen.<br>③ Unten: das Volume aus ① aufschreiben.'], ziel: function (h, st) { return !!st.dateiOk; } },
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
  befehle: ['fHost', 'fEnv', 'fDep', 'fPorts', 'ls', 'cp', 'up', 'start', 'cps', 'logs', 'browser'],
  daten: [
    ['Der Datenbank-Service heißt in dieser Datei <code>mariadb</code>. Dieser Name ist auch seine Adresse für das Forum.', 'Die Datenbank heißt hier <code>mariadb</code>. Das ist auch ihre Adresse.'],
    ['Das Passwort steht als Variable <code>DB_PASSWORD</code> in <code>.env.example</code>. Compose liest aber nur die Datei <code>.env</code>. In der Compose-Datei schreibst du eine Variable so: <code>${NAME}</code>.', 'Das Passwort heißt <code>DB_PASSWORD</code>. Es steht in <code>.env.example</code>. Compose liest nur <code>.env</code>. Variable in der Datei: <code>${NAME}</code>.'],
    ['Datenbank nur intern: <code>ports: []</code> heißt „kein Port nach außen“.', 'Datenbank nur innen: <code>ports: []</code> heißt „kein Port“.'],
    ['Das Forum soll erst starten, wenn die Datenbank „healthy“ ist: <code>service_healthy</code>. <code>service_started</code> wartet nur auf den Start des Containers.', 'Das Forum wartet, bis die Datenbank bereit ist: <code>service_healthy</code>.'],
    ['Forum im Browser: Port <code>8400</code>', 'Forum im Browser: Port <code>8400</code>']
  ],
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
  box.appendChild(datenBox([
    ['Bei jedem Ticket wählst du <b>links die Ursache</b> und <b>rechts die Behebung</b>. Jede Ursache und jede Behebung passt zu genau einem Ticket.', 'Bei jedem Ticket: <b>links die Ursache</b>, <b>rechts die Lösung</b>. Jede passt nur zu 1 Ticket.'],
    ['Wörter in den Meldungen: <i>variable is not set</i> = Variable hat keinen Wert · <i>no container to start</i> = kein Container zum Starten da · <i>port is already allocated</i> = Port ist schon vergeben · <i>SSL</i> = verschlüsselte Verbindung (https) · <i>health: starting</i> = Gesundheitsprüfung läuft noch · <i>no such service</i> = diesen Dienst gibt es (gerade) nicht', 'Wörter: <i>variable is not set</i> = Variable ohne Wert · <i>no container to start</i> = kein Container da · <i>port is already allocated</i> = Port schon vergeben · <i>SSL</i> = https · <i>health: starting</i> = Prüfung läuft noch · <i>no such service</i> = Dienst gibt es nicht'],
    ['Zusatzdienste mit <code>profiles:</code> starten nur, wenn man ihr Profil beim Start nennt.', 'Dienste mit <code>profiles:</code> starten nur mit ihrem Profil.']
  ]));
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
  wurzel.appendChild(befehlsHilfe(['ls', 'cp', 'up', 'start', 'cps', 'logs', 'profil', 'browser', 'fPorts']));
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
    auftrag: 'Der TSV nutzt eine Notiz-App als Trainingstagebuch. Die App speichert zwei Arten von Daten: eine <b>Datenbank</b> mit allen Einträgen und <b>PDF-Exporte</b> für die Trainer. Lege in der <code>docker-compose.yml</code> fest, wo beide gespeichert werden, damit nichts verloren geht, wenn der Container gelöscht oder erneuert wird.',
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

/* ---------- 🚀 Übung 6: Der Umzug (LZ1–LZ6, freiwillig) ---------- */
var CLOUD = '<h2 style="margin:0">☁️ Cloud der Musikschule Tonleiter</h2><p>Ordner <b>noten/</b> · 1.243 Dateien – alles noch da.</p>';
var ALT_RUN = 'docker run -d --name cloud-db -e MARIADB_ROOT_PASSWORD=Geheim123 \\\n  -v clouddb:/var/lib/mysql mariadb:11\n\ndocker run -d --name cloud -p 8443:80 -v /srv/cloud:/var/www/html \\\n  -e MYSQL_HOST=cloud-db nextcloud:29';
var COMPOSE_U6 = '# Musikschule Tonleiter – aus zwei docker-run-Befehlen wird eine Datei\nservices:\n  db:\n    image: {{dbimg}}\n    environment:\n      MARIADB_ROOT_PASSWORD: {{pw}}\n    volumes:\n      - {{dbvol}}:/var/lib/mysql\n    healthcheck:\n      test: ["CMD", "healthcheck.sh", "--connect"]\n\n  cloud:\n    image: nextcloud:29\n    ports:\n      - "{{port}}"\n    volumes:\n      - {{daten}}:/var/www/html\n    environment:\n      MYSQL_HOST: {{host}}\n      MYSQL_PASSWORD: ${DB_PASSWORD}\n    depends_on:\n      db:\n        condition: {{cond}}\n\nvolumes:\n  clouddb:\n    external: true   # das vorhandene Volume weiternutzen, nicht neu anlegen';
var uebungUmzug = uebungsRaum({
  prompt: 'azubi@tonleiter-srv:~/cloud$',
  befehle: ['fPorts', 'fVol', 'fEnv', 'fHost', 'fDep', 'cat', 'psa', 'rm', 'volls', 'ls', 'cp', 'up', 'browser'],
  daten: [
    ['Die zwei alten Befehle stehen oben im Terminal (<code>cat alte-befehle.txt</code>). Alle Werte für die Lücken stehen darin.', 'Die 2 alten Befehle stehen im Terminal. Alle Werte stehen darin.'],
    ['Übersetzung: <code>-p</code> → <code>ports:</code> · <code>-v</code> → <code>volumes:</code> · <code>-e</code> → <code>environment:</code> · Image am Ende → <code>image:</code>', '<code>-p</code> wird <code>ports:</code>. <code>-v</code> wird <code>volumes:</code>. <code>-e</code> wird <code>environment:</code>. Das Image am Ende wird <code>image:</code>.'],
    ['Neue Service-Namen: <code>db</code> (früher Container <code>cloud-db</code>) und <code>cloud</code>. Die Adresse der Datenbank ist jetzt der Service-Name.', 'Neue Namen: <code>db</code> (früher <code>cloud-db</code>) und <code>cloud</code>. Die Adresse ist der neue Name.'],
    ['Das Passwort kommt nicht in die Datei, sondern in die <code>.env</code> (Variable <code>DB_PASSWORD</code>, Vorlage <code>.env.example</code>).', 'Das Passwort kommt in die <code>.env</code>. Variable: <code>DB_PASSWORD</code>.'],
    ['Die alten Container <code>cloud</code> und <code>cloud-db</code> laufen noch und belegen Port 8443. Das Volume <code>clouddb</code> und der Ordner <code>/srv/cloud</code> enthalten die Daten – nie löschen!', 'Die alten Container <code>cloud</code> und <code>cloud-db</code> laufen noch. Sie haben Port 8443. <code>clouddb</code> und <code>/srv/cloud</code> haben die Daten. Nie löschen!']
  ],
  bausteine: ['docker', 'ps', '-a', 'rm', '-f', 'cloud', 'cloud-db', 'volume', 'ls', 'cp', '.env.example', '.env', 'compose', 'up', '-d'],
  browser: 'http://localhost:',
  datei: { name: 'docker-compose.yml', text: COMPOSE_U6,
    luecken: {
      dbimg: { optionen: ['mariadb:11', 'nextcloud:29', 'cloud-db'], richtig: 'mariadb:11', tipp: ['Welches Image steht am Ende des ersten <code>docker run</code>?', 'Das Image steht ganz am Ende vom 1. Befehl.'],
        fb: { 'cloud-db': ['<code>cloud-db</code> war der Container-Name (<code>--name</code>). Bei <code>image:</code> steht das Image.', 'Das ist der Name, nicht das Image.'], 'nextcloud:29': ['Das ist das Image der Cloud, nicht der Datenbank.', 'Das ist das Image der Cloud.'] } },
      pw: { optionen: ['${DB_PASSWORD}', 'Geheim123', 'DB_PASSWORD'], richtig: '${DB_PASSWORD}', tipp: ['Passwörter gehören nicht in die Datei, sondern in die <code>.env</code>.', 'Das Passwort kommt aus der <code>.env</code>.'],
        fb: { Geheim123: ['Das funktioniert, aber das Passwort stünde dann in jeder Kopie der Datei (z. B. im Git-Repo). Nimm die Variable aus der <code>.env</code>.', 'Dann steht das Passwort offen in der Datei. Nimm die Variable.'], DB_PASSWORD: ['Ohne <code>${…}</code> wäre das Passwort wörtlich „DB_PASSWORD“.', 'Ohne <code>${ }</code> ist es nur ein Wort.'] } },
      dbvol: { optionen: ['clouddb', '/srv/cloud', './clouddb'], richtig: 'clouddb', tipp: ['Aus <code>-v clouddb:/var/lib/mysql</code> – links steht das Volume.', 'Nimm das Volume aus dem alten Befehl: <code>clouddb</code>.'],
        fb: { '/srv/cloud': ['<code>/srv/cloud</code> gehört zur Cloud, nicht zur Datenbank.', 'Das ist der Ordner der Cloud.'], './clouddb': ['Ein Pfad wäre ein neuer, leerer Ordner. Die Daten liegen im Volume <code>clouddb</code>.', 'Das wäre ein neuer leerer Ordner.'] } },
      port: { optionen: ['8443:80', '80:8443', '8443:8443'], richtig: '8443:80', tipp: ['Aus <code>-p 8443:80</code> wird <code>ports: - "8443:80"</code> – gleiche Reihenfolge.', 'Gleiche Zahlen wie bei <code>-p</code>: <code>8443:80</code>.'],
        fb: { '80:8443': ['Die Reihenfolge bleibt wie bei <code>-p</code>: Host links, Container rechts.', 'Links der Rechner, rechts der Container.'], '8443:8443': ['Im Container hört Nextcloud auf 80 – so stand es auch rechts bei <code>-p</code>.', 'Im Container ist es Port 80.'] } },
      daten: { optionen: ['/srv/cloud', 'cloud', '/var/www/html'], richtig: '/srv/cloud', tipp: ['Aus <code>-v /srv/cloud:/var/www/html</code> – links steht der Ordner auf dem Host.', 'Nimm den Ordner aus dem alten Befehl: <code>/srv/cloud</code>.'],
        fb: { cloud: ['Ein Name wäre ein neues, leeres Volume. Die Dateien liegen im Host-Ordner <code>/srv/cloud</code>.', 'Das wäre ein neues leeres Volume.'], '/var/www/html': ['Das ist der Pfad im Container (rechts). Links steht der Host-Ordner.', 'Das ist der Pfad im Container.'] } },
      host: { optionen: ['db', 'cloud-db', 'localhost'], richtig: 'db', tipp: ['Im Compose-Netz heißt der Host wie der <b>Service</b> in dieser Datei.', 'Der Host heißt wie der Service: <code>db</code>.'],
        fb: { 'cloud-db': ['So hieß der alte Container. In Compose ist der Service-Name die Adresse – hier <code>db</code>.', 'Das war der alte Name. Jetzt heißt der Service <code>db</code>.'], localhost: ['<code>localhost</code> ist im Cloud-Container die Cloud selbst.', '<code>localhost</code> ist die Cloud selbst.'] } },
      cond: { optionen: ['service_healthy', 'service_started'], richtig: 'service_healthy', tipp: ['Die Cloud soll erst starten, wenn die Datenbank bereit ist.', 'Die Cloud wartet, bis die Datenbank bereit ist.'],
        fb: { service_started: ['Gestartet heißt noch nicht bereit. <code>service_healthy</code> wartet auf den Healthcheck.', 'Gestartet heißt noch nicht bereit.'] } }
    },
    richtig: { dbimg: 'mariadb:11', pw: '${DB_PASSWORD}', dbvol: 'clouddb', port: '8443:80', daten: '/srv/cloud', host: 'db', cond: 'service_healthy' },
    speichern: function (h, w) { h.compose.werte = w; h.compose.gespeichert = true; } },
  setup: function (h) {
    h.images['mariadb:11'] = { name: 'mariadb', tag: '11', id: REGISTRY['mariadb:11'].id, groesse: REGISTRY['mariadb:11'].groesse };
    h.images['nextcloud:29'] = { name: 'nextcloud', tag: '29', id: 'c4d1e8a2f973', groesse: '1.21GB' };
    h.container.push({ id: '3b7a9e2c1d40', name: 'cloud-db', image: 'mariadb:11', status: 'up', ports: [] },
      { id: '8e1f4c7a2b95', name: 'cloud', image: 'nextcloud:29', status: 'up', ports: ['8443:80'], seite: CLOUD, port: 80 });
    h.volumes.clouddb = { 'ibdata1': '' }; h.ordner['/srv/cloud'] = { 'noten': '' };
    h.projekt = { dateien: { 'alte-befehle.txt': ALT_RUN, 'docker-compose.yml': '(Lückentext)', '.env.example': 'DB_PASSWORD=Geheim123' } };
    h.compose = { projekt: 'cloud', werte: {}, gespeichert: false, envVars: ['DB_PASSWORD'],
      dienste: function () { return [{ dienst: 'db', image: 'mariadb:11', brauchtEnv: true, health: true }, { dienst: 'cloud', image: 'nextcloud:29', ports: ['8443:80'], port: 80, seite: CLOUD, bind: '/srv/cloud' }]; },
      logs: function (h, f) { f(h.env ? 'cloud-db-1     | [Note] mariadbd: ready for connections.' : 'cloud-db-1     | [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified', h.env ? '' : 'fehler'); } };
  },
  start: function (aus) { aus('cat alte-befehle.txt', true); },
  ziele: [
    { text: ['Übersetze die zwei alten <code>docker run</code>-Befehle in die <code>docker-compose.yml</code>: <code>-p</code> → <code>ports:</code>, <code>-v</code> → <code>volumes:</code>, <code>-e</code> → <code>environment:</code>.', 'Schreibe die 2 alten Befehle in die Datei. <code>-p</code> wird <code>ports:</code>. <code>-v</code> wird <code>volumes:</code>. <code>-e</code> wird <code>environment:</code>.'], ziel: function (h, st) { return !!st.dateiOk; } },
    { text: ['Entferne die zwei alten Container. Die Daten in <code>clouddb</code> und <code>/srv/cloud</code> dürfen nicht verloren gehen.', 'Lösche die 2 alten Container. Die Daten müssen bleiben.'],
      ziel: function (h) { return !h.container.some(function (c) { return c.name === 'cloud' || c.name === 'cloud-db'; }); } },
    { text: ['Lege die <code>.env</code> mit dem Passwort an.', 'Lege die <code>.env</code> an.'], ziel: function (h) { return !!h.env; } },
    { text: ['Starte alles mit Compose.', 'Starte alles mit Compose.'], ziel: function (h) { return h.container.some(function (c) { return c.compose === 'cloud' && c.dienst === 'cloud' && c.status === 'up'; }); } },
    { text: ['Prüfe im Browser: Ist die Cloud mit allen Noten wieder da?', 'Prüfe im Browser: Sind die Noten noch da?'], ziel: function (h, st) { return !!(st.browse && st.browse.r.ok && st.browse.r.seite === CLOUD && st.browse.r.c.compose === 'cloud'); } },
    { text: ['Was ist an der Compose-Datei besser als an den zwei langen Befehlen?', 'Was ist an der Datei besser?'],
      wahl: { lob: ['Genau: Alles steht in einer Datei, kann versioniert und weitergegeben werden, und der Start ist ein Befehl.', 'Richtig: 1 Datei, 1 Befehl. Man kann sie weitergeben.'],
        optionen: [
          { t: ['Alles steht in einer Datei, sie lässt sich versionieren und weitergeben – der Start ist ein Befehl.', 'Alles ist in 1 Datei. Der Start ist 1 Befehl.'], richtig: true },
          { t: ['Compose-Container laufen schneller.', 'Die Container laufen schneller.'], fb: ['Die Container sind dieselben – Compose startet sie nur bequemer.', 'Die Container sind gleich schnell.'] },
          { t: ['Mit Compose braucht man keine Volumes mehr.', 'Man braucht keine Volumes mehr.'], fb: ['Volumes braucht man weiter – sie stehen nur in der Datei statt im Befehl.', 'Volumes braucht man weiter.'] }
        ] } }
  ],
  hinweis: function (h, r, z) {
    if (r.fehler === 'portBelegt') return ['Port 8443 gehört noch dem alten Container <code>cloud</code>. Erst die alten Container entfernen.', 'Der alte Container hat noch Port 8443. Lösche ihn zuerst.'];
    if (/docker\s+volume\s+rm/.test(z) || r.volumeWeg) return ['Achtung: Damit hättest du die Datenbank der Musikschule gelöscht! Volumes nie beim Umzug löschen.', 'Achtung: Das Volume hat die Daten. Nie löschen!'];
    if (r.fehler === 'laeuft') return ['Der Container läuft noch. Mit <code>-f</code> wird er gestoppt und gelöscht – die Daten im Volume und im Ordner bleiben.', 'Er läuft noch. Nimm <code>docker rm -f</code>.'];
    return null;
  },
  hinweisBrowser: function (h, r) {
    if (r.ssl) return ['Trotz Port 8443 spricht der Container kein https. Tippe <code>http://</code>.', 'Tippe <code>http://</code>.'];
    return null;
  },
  notiz: ['Übung 6 Umzug: von docker run zu Compose', 'Übung 6: von docker run zu Compose'],
  notizExtra: function () { return '<p><code>-p</code> → <code>ports:</code> · <code>-v</code> → <code>volumes:</code> · <code>-e</code> → <code>environment:</code> · <code>--name cloud-db</code> → Service <code>db</code> (neuer Hostname) · Passwort in die <code>.env</code> · vorhandenes Volume mit <code>external: true</code>.</p>'; },
  erledigt: ['Zwei docker-run-Befehle in eine Compose-Datei übersetzt und umgezogen – ohne Datenverlust.', 'Umzug geschafft. Die Daten sind noch da.'],
  loese: function (x) { x.datei(); x.cmd('docker rm -f cloud cloud-db'); x.cmd('cp .env.example .env'); x.cmd('docker compose up -d'); x.browse('http://localhost:8443'); x.wahl(); }
});
PAKET.uebungen.push(
  { id: 'U6', titel: '🚀 Der Umzug (freiwillig)', lz: ['LZ1', 'LZ3', 'LZ4', 'LZ5', 'LZ6'],
    auftrag: 'Die Musikschule Tonleiter betreibt ihre Cloud mit zwei langen <code>docker run</code>-Befehlen. Zieh sie auf Compose um – ohne dass Noten oder Datenbank verloren gehen.',
    interaktion: uebungUmzug,
    tipps: ['Jede Option von <code>docker run</code> hat eine Zeile in Compose: <code>-p</code> → <code>ports:</code>, <code>-v</code> → <code>volumes:</code>, <code>-e</code> → <code>environment:</code>. Aus <code>--name</code> wird der Service-Name.', 'Datei: <code>mariadb:11</code>, <code>${DB_PASSWORD}</code>, <code>clouddb</code>, <code>8443:80</code>, <code>/srv/cloud</code>, <code>db</code>, <code>service_healthy</code>. Dann die alten Container mit <code>docker rm -f</code> entfernen – Volume und Ordner bleiben.', 'Lösung: Datei wie in Tipp 2 · <code>docker rm -f cloud cloud-db</code> · <code>cp .env.example .env</code> · <code>docker compose up -d</code> · Browser <code>http://localhost:8443</code>.'],
    reflexion: { frage: 'Warum steht unten beim Volume <code>external: true</code>?', muster: 'Sonst würde Compose ein neues Volume <code>cloud_clouddb</code> anlegen – leer. Mit <code>external: true</code> nutzt es das vorhandene Volume <code>clouddb</code> mit den Daten.' } }
);
