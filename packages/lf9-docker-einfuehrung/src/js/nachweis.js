/* =====================================================================
   „Serverraum 0“ – Nachweis (geladen nach raeume.js, vor sprache.js)
   Teil A: Raum „Redaktion“ – WordPress und MariaDB für die Schülerzeitung
   „Lechpost“ plus zwei Tickets. Keine Tipps, kein Regelbuch, keine
   Erklärung der Fehlermeldungen: Das Terminal antwortet nur wie in echt.
   Teil B: 4 Fragen je Lernziel im Pool, 2 je Lernziel pro Versuch.
   Dazu Vorwissens-Check, Merkblatt und Selbsttest.
   Alle Personen, Schulen und Vereine sind erfunden.
   ===================================================================== */

/* ---------- Seiten und Images des Kunden ---------- */
var ZEITUNG = '<h2 style="margin:0">📰 Die Lechpost</h2><p>Schülerzeitung der Realschule am Lech</p><p><i>Neu: Unsere Ausgabe zu den Projekttagen</i></p>';
var WP_DBFEHLER = '<h1 style="margin:0;font-size:1.3rem">Error establishing a database connection</h1>';
var WARTUNG_ALT = '<h2 style="margin:0">🛠️ Lechpost – Wartungsseite</h2><p>Logo: 📰 (altes Logo)</p>';
REGISTRY['mariadb:11'] = { id: 'e2d5a6f1c3b4', groesse: '407MB', cmd: '"docker-entrypoint.s…"', laeuft: true };
REGISTRY['wordpress:6'] = { id: '9f1c7b3e5a20', groesse: '702MB', cmd: '"docker-entrypoint.s…"', laeuft: true };
REGISTRY['lechpost-wartung'] = { id: 'b81e4d2c6f93', groesse: '52.6MB', cmd: '"/docker-entrypoint.…"', laeuft: true };

var COMPOSE_NW = '# Schülerzeitung „Lechpost“ – WordPress mit MariaDB\nservices:\n  db:\n    image: mariadb:11\n    environment:\n      MARIADB_ROOT_PASSWORD: ${DB_PASSWORD}\n      MARIADB_DATABASE: lechpost\n    volumes:\n      - {{dbvol}}:/var/lib/mysql\n    ports: {{dbports}}\n    healthcheck:\n      test: ["CMD", "healthcheck.sh", "--connect"]\n\n  wordpress:\n    image: wordpress:6\n    ports:\n      - "{{webport}}"\n    environment:\n      WORDPRESS_DB_HOST: {{dbhost}}\n      WORDPRESS_DB_USER: root\n      WORDPRESS_DB_PASSWORD: ${DB_PASSWORD}\n      WORDPRESS_DB_NAME: lechpost\n    volumes:\n      - {{medien}}:/var/www/html/wp-content/uploads\n    depends_on:\n      db:\n        condition: {{cond}}\n\nvolumes:\n  {{vol2}}:';
var NW_LUECKEN = {
  dbvol: ['lechpost_db', './db', '/var/lib/mysql'],
  dbports: ['[]', '["3306:3306"]', '["8088:3306"]'],
  webport: ['8088:80', '80:8088', '8088:8088', '8080:80'],
  dbhost: ['db', 'localhost', '127.0.0.1', 'wordpress'],
  medien: ['./medien', 'medien', '/var/www/html'],
  cond: ['service_healthy', 'service_started'],
  vol2: ['lechpost_db', 'medien', 'mysql']
};
var NW_RICHTIG = { dbvol: 'lechpost_db', dbports: '[]', webport: '8088:80', dbhost: 'db', medien: './medien', cond: 'service_healthy', vol2: 'lechpost_db' };
function nwBenannt(x) { return !!x && x.charAt(0) !== '.' && x.charAt(0) !== '/'; }
function nwSpeicher(quelle) { return nwBenannt(quelle) ? { volume: quelle } : { bind: absPfad(quelle, '/home/azubi') }; }
function nwDienst(basis, quelle) { var s = nwSpeicher(quelle); Object.keys(s).forEach(function (k) { basis[k] = s[k]; }); return basis; }

/* Ticket 1 (immer gleich) und Ticket 2 (pro Versuch zufällig) */
var NW_TICKET1 = {
  text: ['„Wir haben in <code>index.html</code> das neue Logo eingesetzt und dann <code>docker restart wartung</code> getippt. Die Wartungsseite unter <code>localhost:8089</code> zeigt immer noch das alte Logo!“', '„Wir haben in <code>index.html</code> das neue Logo eingesetzt. Dann haben wir <code>docker restart wartung</code> getippt. Die Seite unter <code>localhost:8089</code> zeigt noch das alte Logo!“'],
  frage: ['Markiere im Dockerfile die Zeile, die erklärt, warum der Neustart nicht reicht.', 'Markiere im Dockerfile die Zeile mit der Ursache.'],
  zeilen: ['FROM nginx:alpine', 'COPY index.html /usr/share/nginx/html/', 'EXPOSE 80', 'CMD ["nginx", "-g", "daemon off;"]'],
  ursache: 1,
  optionen: [
    ['Image neu bauen, Container <code>wartung</code> löschen und neu starten', 'Image neu bauen, Container löschen, neu starten'],
    ['Noch einmal <code>docker restart wartung</code>, diesmal mit gestopptem Container', 'Noch einmal <code>docker restart wartung</code>'],
    ['<code>docker compose down -v</code> und danach <code>docker compose up -d</code>', '<code>docker compose down -v</code>, dann <code>docker compose up -d</code>'],
    ['Im Browser die Seite neu laden', 'Die Seite im Browser neu laden']
  ],
  richtig: 0
};
var NW_TICKET2 = {
  port: {
    text: ['„Die Anmeldung zum Schulfest soll neben der Lechpost laufen. Beim Start kommt das hier:“', '„Die Anmeldung zum Schulfest soll auch laufen. Beim Start kommt das:“'],
    zeilen: ['azubi@lechpost-srv:~/schulfest$ docker compose up -d', '[+] Running 1/2', ' ✔ Network schulfest_default  Created', ' ✘ Container schulfest-web-1  Error', 'Error response from daemon: driver failed programming external connectivity on endpoint schulfest-web-1: Bind for 0.0.0.0:8088 failed: port is already allocated'],
    ursache: 4,
    datei: 'services:\n  web:\n    image: nginx:alpine\n    ports:\n      - "8088:80"',
    optionen: [
      ['In der Schulfest-Datei links einen freien Host-Port eintragen, z. B. <code>"8090:80"</code>, dann <code>docker compose up -d</code>', 'Links einen freien Port eintragen, z. B. <code>"8090:80"</code>. Dann <code>docker compose up -d</code>'],
      ['Rechts den Container-Port ändern: <code>"8088:8090"</code>', 'Rechts den Port ändern: <code>"8088:8090"</code>'],
      ['<code>docker compose start</code> statt <code>up -d</code>', '<code>docker compose start</code> nehmen'],
      ['Mit <code>docker compose down -v</code> alles löschen und neu starten', 'Alles mit <code>docker compose down -v</code> löschen und neu starten']
    ],
    richtig: 0
  },
  env: {
    text: ['„Die Anmeldung zum Schulfest soll neben der Lechpost laufen. Beim Start kommt das hier:“', '„Die Anmeldung zum Schulfest soll auch laufen. Beim Start kommt das:“'],
    zeilen: ['azubi@lechpost-srv:~/schulfest$ ls -a', '.  ..  .env.example  docker-compose.yml', 'azubi@lechpost-srv:~/schulfest$ docker compose up -d', 'WARN[0000] The "DB_PASSWORD" variable is not set. Defaulting to a blank string.', ' ✘ Container schulfest-db-1  Error', 'dependency failed to start: container schulfest-db-1 exited (1)'],
    ursache: 3,
    datei: 'services:\n  db:\n    image: mariadb:11\n    environment:\n      MARIADB_ROOT_PASSWORD: ${DB_PASSWORD}',
    optionen: [
      ['<code>cp .env.example .env</code>, dann <code>docker compose up -d</code>', '<code>cp .env.example .env</code>, dann <code>docker compose up -d</code>'],
      ['Das Passwort in <code>.env.example</code> eintragen – Compose liest die Datei automatisch', 'Das Passwort in <code>.env.example</code> schreiben. Compose liest sie automatisch.'],
      ['<code>docker compose start</code> statt <code>up -d</code>', '<code>docker compose start</code> nehmen'],
      ['<code>${DB_PASSWORD}</code> aus der Datei löschen', '<code>${DB_PASSWORD}</code> aus der Datei löschen']
    ],
    richtig: 0
  }
};

/* Kleine Erweiterung des Compose-Simulators: Port-Konflikte beim Start und eigene Logs */
var dockerComposeBasis = dockerCompose;
dockerCompose = function (h, a, f, erg) {
  var c = h.compose, cmd = a[0] === '--profile' ? a[2] : a[0];
  if (c && cmd === 'logs' && c.logs) { c.logs(h, f); return erg({ neutral: true, logs: true }); }
  if (c && cmd === 'up' && !composePruefen(h) && h.env) {
    // Host-Port schon von einem anderen laufenden Container belegt?
    var fremd = h.container.filter(function (x) { return x.status === 'up' && x.compose !== c.projekt; }), eigen = [];
    var konflikt = null;
    c.dienste(c.werte, h).forEach(function (d) {
      (d.ports || []).forEach(function (p) {
        var hp = String(p).split(':')[0];
        if (!konflikt && (fremd.concat(eigen)).some(function (x) { return (x.ports || []).some(function (q) { return String(q).split(':')[0] === hp; }); })) konflikt = { d: d, hp: hp };
      });
      eigen.push({ ports: d.ports || [] });
    });
    if (konflikt) {
      var r = dockerComposeBasis(h, a, f, erg);
      var name = c.projekt + '-' + konflikt.d.dienst + '-1';
      h.container.forEach(function (x) { if (x.name === name) x.status = 'exited'; });
      f('Error response from daemon: driver failed programming external connectivity on endpoint ' + name + ': Bind for 0.0.0.0:' + konflikt.hp + ' failed: port is already allocated', 'fehler');
      r.fehler = 'portBelegt'; r.up = false;
      return r;
    }
  }
  return dockerComposeBasis(h, a, f, erg);
};

/* ---------- Teil A: Raum „Redaktion“ ---------- */
var NW_STAND = { a: null };   // Anteil Teil A im laufenden Versuch (für die Bewertung „beide Teile ≥ 80 %“)
function redaktion(box, api) {
  var E = KIT.el;
  if (!document.getElementById('sr-css')) { var st = document.createElement('style'); st.id = 'sr-css'; st.textContent = SR_CSS; document.head.appendChild(st); }
  rwStil();
  if (!document.getElementById('nw-css')) {
    var st2 = document.createElement('style'); st2.id = 'nw-css';
    st2.textContent = '.nw-teil{background:#f8fafc;color:#0f172a;border-radius:10px;padding:10px 12px}.nw-teil h3{margin:0 0 6px;font-size:1rem}' +
      '.nw-teil .sr-editor{max-height:none}.nw-wahl label{display:flex;gap:8px;align-items:flex-start;margin:6px 0;cursor:pointer}.nw-wahl input{margin-top:4px;min-width:20px;min-height:20px}' +
      '.nw-ticket{border:3px solid #6d28d9;background:#f3edff}.nw-status{font-size:.85rem;color:#334155;margin-left:8px}';
    document.head.appendChild(st2);
  }
  var host = neuerHost(), psA = false, variante = Math.random() < 0.5 ? 'port' : 'env', T2 = NW_TICKET2[variante];
  var tk = { 1: { mark: {}, wahl: null }, 2: { mark: {}, wahl: null } }, felder = {}, ticketEl = {};
  NW_STAND.a = null;

  /* Server des Kunden: zwei laufende Container, ein beendeter */
  host.images['nginx:alpine'] = { name: 'nginx', tag: 'alpine', id: REGISTRY['nginx:alpine'].id, groesse: '52.5MB' };
  host.images['hello-world:latest'] = { name: 'hello-world', tag: 'latest', id: REGISTRY['hello-world'].id, groesse: '13.3kB' };
  host.images['lechpost-wartung:latest'] = { name: 'lechpost-wartung', tag: 'latest', id: REGISTRY['lechpost-wartung'].id, groesse: '52.6MB' };
  host.container.push(
    { id: '5d2e8f1a9c3b', name: 'tsv', image: 'nginx:alpine', status: 'up', ports: ['8080:80'], seite: SEITE.tsv2 },
    { id: 'a7c4e1f0b2d9', name: 'wartung', image: 'lechpost-wartung', status: 'up', ports: ['8089:80'], seite: WARTUNG_ALT },
    { id: '0e9b3c6a1f47', name: 'hallo-test', image: 'hello-world', status: 'exited', ports: [] });
  host.projekt = { dateien: { 'docker-compose.yml': COMPOSE_NW.replace(/\{\{\w+\}\}/g, '???'), '.env.example': 'DB_PASSWORD=Lechpost2026' } };
  host.compose = { projekt: 'lechpost', werte: {}, gespeichert: false, envVars: ['DB_PASSWORD'],
    pruefe: function (w) {
      if (nwBenannt(w.dbvol) && w.vol2 !== w.dbvol) return 'service "db" refers to undefined volume ' + w.dbvol + ': invalid compose project';
      if (nwBenannt(w.medien) && w.vol2 !== w.medien) return 'service "wordpress" refers to undefined volume ' + w.medien + ': invalid compose project';
      return null;
    },
    dienste: function (w) {
      return [nwDienst({ dienst: 'db', image: 'mariadb:11', ports: w.dbports === '[]' ? [] : [String(w.dbports).replace(/[\[\]"]/g, '')], port: 3306, brauchtEnv: true, health: true }, w.dbvol),
        nwDienst({ dienst: 'wordpress', image: 'wordpress:6', ports: [w.webport], port: 80, seite: w.dbhost === 'db' ? ZEITUNG : WP_DBFEHLER }, w.medien)];
    },
    logs: function (h, f) {
      if (!h.env) { f('lechpost-db-1  | [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified', 'fehler'); f('lechpost-db-1  |        You need to specify one of MARIADB_ROOT_PASSWORD, MARIADB_ALLOW_EMPTY_ROOT_PASSWORD or MARIADB_RANDOM_ROOT_PASSWORD', 'fehler'); return; }
      f('lechpost-db-1         | [Note] mariadbd: ready for connections.');
      var w = h.compose.werte;
      if (w.dbhost !== 'db') f('lechpost-wordpress-1  | PHP Warning:  mysqli::__construct(): (HY000/2002): No such file or directory in /var/www/html/wp-includes/class-wpdb.php', 'fehler');
      else f('lechpost-wordpress-1  | AH00094: Command line: \'apache2 -D FOREGROUND\'');
    } };

  var wurzel = E('div', { class: 'sr-spiel', style: 'min-height:0' });
  box.innerHTML = ''; box.appendChild(wurzel);

  /* ① Terminal, Überblick und Browser */
  var aus = E('div', { class: 'sr-ausgabe', role: 'log', 'aria-label': L('Ausgabe des Terminals', 'Terminal') });
  function zeile(t, art) { var d = E('div', { class: art || '', text: t }); aus.appendChild(d); aus.scrollTop = aus.scrollHeight; }
  function ausfuehren(z) {
    z = String(z || '').trim(); if (!z) return null;
    var r = hostAusfuehren(host, z);
    if (r.leeren) { aus.innerHTML = ''; return r; }
    zeile('azubi@lechpost-srv:~$ ' + z, 'sr-ein');
    r.aus.forEach(function (x) { zeile(x.t, x.art); });
    if (/^docker\s+(ps|container\s+ls)\b.*\s(-a|--all)\b/.test(z) || /^docker\s+compose\s+ps\b/.test(z)) psA = true;
    return r;
  }
  var inp = E('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': L('Befehl eingeben', 'Befehl eingeben'), onkeydown: function (e) { if (e.key === 'Enter') { ausfuehren(inp.value); inp.value = ''; } } });
  var term = E('div', { class: 'sr-term' }, [E('div', { class: 'leiste', text: 'azubi@lechpost-srv: ~/lechpost — bash' }), aus,
    E('div', { class: 'sr-eingabe' }, [E('span', { text: '$' }), inp, E('button', { type: 'button', text: '⏎ Enter', 'aria-label': L('Befehl ausführen', 'Befehl ausführen'), onclick: function () { ausfuehren(inp.value); inp.value = ''; inp.focus(); } })])]);
  var bs = E('div', { class: 'sr-bausteine', role: 'group', 'aria-label': L('Befehls-Bausteine', 'Bausteine') });
  ['docker', 'compose', 'ps', '-a', 'up', '-d', 'start', 'restart', 'down', 'logs', 'ls', 'cat', 'cp', '.env.example', '.env', 'docker-compose.yml'].forEach(function (w) {
    bs.appendChild(E('button', { type: 'button', text: w, onclick: function () { inp.value = (inp.value.trim() ? inp.value.trim() + ' ' : '') + w; inp.focus(); } }));
  });
  bs.appendChild(E('button', { type: 'button', class: 'steuer', text: '⌫ ' + L('Wort', 'Wort'), 'aria-label': L('Letztes Wort löschen', 'Letztes Wort löschen'), onclick: function () { inp.value = inp.value.trim().split(/\s+/).slice(0, -1).join(' '); inp.focus(); } }));
  term.appendChild(bs);

  var anzahl = E('input', { type: 'number', min: '0', id: 'nw-anzahl', style: 'width:6em;min-height:40px' });
  var seite = E('div', { class: 'seite', html: '<i>' + L('Gib oben eine Adresse ein.', 'Gib oben eine Adresse ein.') + '</i>' });
  var url = E('input', { type: 'text', value: 'http://localhost:', 'aria-label': L('Adresse', 'Adresse'), onkeydown: function (e) { if (e.key === 'Enter') browse(); } });
  function browse() { var r = hostBrowse(host, url.value); seite.className = 'seite' + (r.ok ? '' : ' fehl'); seite.innerHTML = r.ok ? r.seite : r.fehler; }
  var rechts = E('div', { class: 'nw-teil' }, [
    E('h3', { text: L('Überblick', 'Überblick') }),
    E('label', { for: 'nw-anzahl', html: L('Wie viele Container gab es auf diesem Server, bevor du die Lechpost gestartet hast – laufende und beendete zusammen?', 'Wie viele Container waren schon auf dem Server, vor deinem Start? Zähle laufende und beendete.') + ' ' }), anzahl,
    E('h3', { style: 'margin-top:12px', text: L('Browser', 'Browser') }),
    E('div', { class: 'sr-browser' }, [E('div', { class: 'bar' }, [E('span', { text: '🌐' }), url, E('button', { type: 'button', text: L('Öffnen', 'Öffnen'), onclick: browse })]), seite])
  ]);
  wurzel.appendChild(E('div', { class: 'sr-mitte' }, [term, rechts]));

  /* ② docker-compose.yml mit Lücken (Auswahl, Reihenfolge gemischt) */
  var ed = E('div', { class: 'sr-editor', role: 'group', 'aria-label': 'docker-compose.yml' });
  COMPOSE_NW.split('\n').forEach(function (z) {
    var div = E('div');
    z.split(/(\{\{\w+\}\})/).forEach(function (teil) {
      var m = teil.match(/^\{\{(\w+)\}\}$/);
      if (!m) { div.appendChild(E('span', { class: /^\s*#/.test(teil) ? 'kom' : '', text: teil })); return; }
      var opts = NW_LUECKEN[m[1]].slice().sort(function () { return Math.random() - 0.5; });
      var s = E('select', { 'aria-label': L('Lücke ', 'Lücke ') + m[1] }, [E('option', { value: '', text: '???' })].concat(opts.map(function (o) { return E('option', { value: o, text: o }); })));
      felder[m[1]] = s; div.appendChild(s);
    });
    ed.appendChild(div);
  });
  var gespeichert = E('span', { class: 'nw-status', 'aria-live': 'polite' });
  function speichern() {
    var w = {}, leer = 0;
    Object.keys(felder).forEach(function (k) { w[k] = felder[k].value; if (!w[k]) leer++; });
    host.compose.werte = w; host.compose.gespeichert = !leer;
    host.envVersion = (host.envVersion || 1) + 1;
    host.projekt.dateien['docker-compose.yml'] = COMPOSE_NW.replace(/\{\{(\w+)\}\}/g, function (x, k) { return w[k] || '???'; });
    gespeichert.textContent = L('Gespeichert.', 'Gespeichert.');
  }
  wurzel.appendChild(E('div', { class: 'nw-teil' }, [E('h3', { html: L('Datei <code>docker-compose.yml</code> im Ordner <code>~/lechpost</code>', 'Datei <code>docker-compose.yml</code>') }), ed,
    E('div', { style: 'margin-top:8px' }, [E('button', { type: 'button', text: '💾 ' + L('Speichern', 'Speichern'), onclick: speichern }), gespeichert])]));

  /* ③ Tickets: Ursache markieren, Behebung wählen */
  function ticket(nr, t, zeilenTitel) {
    var zst = tk[nr], kopf = E('div', { class: 'sr-kopf ticket', style: 'padding:6px 0;background:none;border:0' }, [E('div', { class: 'fig', html: KIT.figur('redaktion', { ausdruck: 'nachdenklich' }) }), E('div', { class: 'txt' }, [E('div', { class: 'wer', text: P_NW_FIGUR.name + ' · 📨 Ticket ' + nr }), E('p', { class: 'auftrag', html: T(t.text) })])]);
    var ed2 = E('div', { class: 'sr-editor', role: 'group', 'aria-label': zeilenTitel });
    var knoepfe = t.zeilen.map(function (z, i) {
      var b = E('button', { type: 'button', class: 'zeile', 'aria-pressed': 'false', text: z, onclick: function () { zst.mark[i] = !zst.mark[i]; b.classList.toggle('mark', zst.mark[i]); b.setAttribute('aria-pressed', String(!!zst.mark[i])); } });
      ed2.appendChild(b); return b;
    });
    var wahl = E('div', { class: 'nw-wahl', role: 'radiogroup', 'aria-label': L('Behebung', 'Lösung') });
    var radios = t.optionen.map(function (o, i) {
      var r = E('input', { type: 'radio', name: 'nw-t' + nr, value: String(i), onchange: function () { zst.wahl = i; } });
      return { r: r, label: E('label', {}, [r, E('span', { html: T(o) })]) };
    });
    radios.slice().sort(function () { return Math.random() - 0.5; }).forEach(function (x) { wahl.appendChild(x.label); });
    radios = radios.map(function (x) { return x.r; });
    var teile = [kopf, E('p', { class: 'nr', html: '<b>1.</b> ' + T(t.frage || ['Markiere die Zeile, die die Ursache nennt.', 'Markiere die Zeile mit der Ursache.']) }), ed2];
    if (t.datei) teile.push(E('details', {}, [E('summary', { text: L('Ihre docker-compose.yml', 'Ihre Datei') }), E('div', { class: 'sr-editor', text: t.datei })]));
    teile.push(E('p', { class: 'nr', html: '<b>2.</b> ' + L('Was hilft? Wähle die Behebung.', 'Was hilft? Wähle die Lösung.') }), wahl);
    wurzel.appendChild(E('div', { class: 'nw-teil nw-ticket' }, teile));
    ticketEl[nr] = { knoepfe: knoepfe, radios: radios };
  }
  ticket(1, NW_TICKET1, 'Dockerfile');
  ticket(2, T2, L('Ausgabe im Terminal', 'Terminal'));

  function ticketOk(nr, t) {
    var z = tk[nr], marken = t.zeilen.filter(function (x, i) { return z.mark[i]; }).length;
    return marken === 1 && !!z.mark[t.ursache] && z.wahl === t.richtig;
  }
  return {
    auswerten: function () {
      var w = host.compose.werte || {}, g = host.compose.gespeichert, r = hostBrowse(host, 'http://localhost:8088');
      var pp = [
        { lz: 'LZ1', text: L('A1 Überblick mit <code>docker ps -a</code> geholt und alle 3 Container gezählt', 'A1 Mit <code>docker ps -a</code> alle 3 Container gezählt'), ok: psA && +anzahl.value === 3 },
        { lz: 'LZ3', text: L('A2 <code>"8088:80"</code> bei wordpress, kein Port-Mapping bei db', 'A2 <code>"8088:80"</code> bei wordpress, kein Port bei db'), ok: g && w.webport === '8088:80' && w.dbports === '[]' },
        { lz: 'LZ4', text: L('A3 Named Volume <code>lechpost_db</code> für die Datenbank (unten deklariert), Bind Mount <code>./medien</code> für die Medien', 'A3 Volume <code>lechpost_db</code> für die Datenbank, Bind Mount <code>./medien</code> für die Bilder'), ok: g && w.dbvol === 'lechpost_db' && w.vol2 === 'lechpost_db' && w.medien === './medien' },
        { lz: 'LZ5', text: L('A4 <code>WORDPRESS_DB_HOST: db</code> und <code>condition: service_healthy</code>', 'A4 <code>WORDPRESS_DB_HOST: db</code> und <code>service_healthy</code>'), ok: g && w.dbhost === 'db' && w.cond === 'service_healthy' },
        { lz: 'LZ5', text: L('A5 Mit <code>.env</code> und <code>docker compose up -d</code> gestartet: Lechpost unter <code>localhost:8088</code> erreichbar', 'A5 Lechpost läuft unter <code>localhost:8088</code>'), ok: !!(r.ok && r.seite === ZEITUNG) },
        { lz: 'LZ2', text: L('A6 Ticket 1: <code>COPY</code>-Zeile als Ursache markiert und „neu bauen, Container neu erstellen“ gewählt', 'A6 Ticket 1: <code>COPY</code>-Zeile markiert, neu bauen gewählt'), ok: ticketOk(1, NW_TICKET1) },
        { lz: 'LZ6', text: L('A7 Ticket 2: Fehlermeldung als Ursache markiert und passende Behebung gewählt', 'A7 Ticket 2: Ursache markiert, passende Lösung gewählt'), ok: ticketOk(2, T2) }
      ];
      NW_STAND.a = pp.filter(function (p) { return p.ok; }).length / pp.length;
      return pp;
    },
    // Musterlösung für den automatischen Test
    loesen: function () {
      ausfuehren('docker ps -a'); anzahl.value = '3';
      Object.keys(felder).forEach(function (k) { felder[k].value = NW_RICHTIG[k]; });
      speichern();
      ausfuehren('cp .env.example .env'); ausfuehren('docker compose up -d');
      url.value = 'http://localhost:8088'; browse();
      [[1, NW_TICKET1], [2, T2]].forEach(function (x) {
        var nr = x[0], t = x[1];
        if (!tk[nr].mark[t.ursache]) ticketEl[nr].knoepfe[t.ursache].click();
        ticketEl[nr].radios[t.richtig].checked = true; tk[nr].wahl = t.richtig;
      });
    }
  };
}
var P_NW_FIGUR = { name: 'Selin Aydın', rolle: 'Lehrerin, betreut die Schülerzeitung Lechpost', aussehen: { haut: 3, haare: 'schwarz', frisur: 'lang', kleidung: '#be123c', brille: false } };
PAKET.figuren.redaktion = P_NW_FIGUR;

/* ---------- Nachweis ---------- */
PAKET.nachweis = {
  dauer: '45 Minuten',
  einleitung: 'Heute bist du allein beim neuen Kunden: der Schülerzeitung <b>Lechpost</b>. Ich bin nicht da – kein Regelbuch, keine Tipps, keine Erklärungen zu Fehlermeldungen. <b>Teil A und Teil B müssen jeweils mindestens 80 % erreichen.</b> Als Ergebnis zählt der kleinere der beiden Werte.',
  teilA: { titel: 'Raum „Redaktion“ – die Lechpost geht online', figur: 'redaktion',
    auftrag: 'Bring die Webseite der Schülerzeitung unter <code>http://localhost:8088</code> zum Laufen: Ergänze die <code>docker-compose.yml</code> und starte sie im Terminal. Notiere vorher, wie viele Container es auf dem Server schon gibt. Danach bearbeitest du die zwei Tickets.',
    interaktion: redaktion },
  teilB: { proLZ: 2 }
};
/* Bewertung „Teil A und Teil B je ≥ 80 %“ (Entscheidung der Lehrkraft):
   Die Engine rechnet a·gewichtA + b·(100 − gewichtA). Beim Abgeben wählt
   dieser Getter das Gewicht so, dass genau der kleinere Wert zählt.
   Wunsch für die Vorlage: eine Option „jeder Teil einzeln“ in der Engine. */
Object.defineProperty(PAKET.nachweis, 'gewichtA', { enumerable: true, get: function () {
  try {
    var qs = window.LERNPAKET.aktuelleTeile().filter(function (x) { return x.art === 'frage'; });
    if (NW_STAND.a === null || !qs.length) return 50;
    var b = qs.reduce(function (s, x) { return s + x.obj.bewerten().score; }, 0) / qs.length;
    return NW_STAND.a <= b ? 100 : 0;
  } catch (e) { return 50; }
} });

/* Kurz-Check-Fragen bleiben im Kurz-Check, der Nachweis bekommt eigene Fragen in neuen Situationen */
PAKET.fragen.forEach(function (f) { f.einsatz = (f.einsatz || []).filter(function (e) { return e !== 'nachweis'; }); });

/* ---------- Vorwissens-Check (eine Frage je Lernziel, freiwillig) ---------- */
PAKET.vorwissen = ['r1-k3', 'r2-k2', 'r2-k1', 'r3-k2', 'r4-k1', 'r5-k1'];
PAKET.fragen.forEach(function (f) { if (PAKET.vorwissen.indexOf(f.id) >= 0) f.einsatz.push('vorwissen'); });

/* ---------- Fragenpool Nachweis Teil B (4 je Lernziel) ---------- */
var PS_N11 = 'CONTAINER ID   IMAGE           STATUS                    NAMES\n7c1e2a9f0b3d   nginx:alpine    Up 2 hours                kasse\n4b8d6e1c2a5f   postgres:16     Up 2 hours                kassen-db\n9e3f1a7b5c2d   hello-world     Exited (0) 3 days ago     test1\n2a6c8e0f4b1d   ubuntu:22.04    Exited (0) 2 days ago     notiz\n5f0b3d7a9c1e   nginx:alpine    Exited (0) 1 hour ago     kasse-alt';
PAKET.fragen.push(
  /* LZ1 Image und Container */
  { id: 'n1-1', lz: 'LZ1', einsatz: ['nachweis'], typ: 'zahl',
    frage: 'Der Kassenserver der Bäckerei Krume zeigt bei <code>docker ps -a</code>:<pre style="font-size:.78rem;overflow:auto">' + PS_N11 + '</pre>Wie viele Container <b>laufen</b> gerade?',
    zahl: { wert: 2, toleranz: 0 },
    typisch: [{ wert: 5, feedback: 'Du hast alle Zeilen gezählt. Laufend sind nur die mit „Up“ in der Spalte STATUS.' }, { wert: 3, feedback: 'Das sind die beendeten Container („Exited“). Gefragt sind die laufenden mit „Up“.' }],
    erklaerung: 'Nur <code>kasse</code> und <code>kassen-db</code> stehen auf „Up“. Die anderen drei sind beendet, stehen aber weiter in der Liste.' },
  { id: 'n1-2', lz: 'LZ1', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Gestern hast du den Container <code>notiz</code> aus <code>ubuntu:22.04</code> gestartet. Heute zeigt <code>docker ps</code> ihn nicht mehr an. Was stimmt?',
    optionen: [
      { text: 'Er ist beendet und erscheint bei <code>docker ps -a</code>.', richtig: true },
      { text: 'Docker hat ihn über Nacht automatisch gelöscht.', feedback: 'Beendete Container bleiben stehen, bis du sie mit <code>docker rm</code> löschst. Prüfe mit <code>docker ps -a</code>.' },
      { text: 'Das Image <code>ubuntu:22.04</code> wurde gelöscht.', feedback: 'Das Image hat damit nichts zu tun. <code>docker ps</code> zeigt nur laufende Container.' }
    ],
    erklaerung: '<code>docker ps</code> zeigt nur laufende Container. Beendete Container siehst du mit <code>docker ps -a</code>.' },
  { id: 'n1-3', lz: 'LZ1', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Welche Aussagen über Images und Container stimmen? Kreuze alle richtigen an.',
    optionen: [
      { text: 'Aus einem Image können beliebig viele Container entstehen.', richtig: true },
      { text: 'Ein beendeter Container steht weiter in <code>docker ps -a</code>.', richtig: true },
      { text: '<code>docker run</code> startet einen vorhandenen Container mit demselben Image erneut.', feedback: 'Jedes <code>docker run</code> erzeugt einen <b>neuen</b> Container. Einen vorhandenen startest du mit <code>docker start</code>.' },
      { text: 'Ein Image ist ein laufendes Programm.', feedback: 'Das Image ist der Bauplan. Laufen kann nur ein Container.' }
    ],
    erklaerung: 'Image = Bauplan (wie eine Klasse), Container = Instanz (wie ein Objekt). Beendete Container bleiben, bis du sie löschst.' },
  { id: 'n1-4', lz: 'LZ1', einsatz: ['nachweis'], typ: 'zuordnen',
    frage: 'Ordne jeder Aufgabe auf dem Kassenserver den passenden Befehl zu.',
    paare: [
      { links: 'Container <code>test1</code> löschen', rechts: '<code>docker rm test1</code>' },
      { links: 'Image <code>hello-world</code> löschen', rechts: '<code>docker rmi hello-world</code>' },
      { links: 'alle beendeten Container auf einmal löschen', rechts: '<code>docker container prune</code>' },
      { links: 'ein Image nur herunterladen, ohne Container', rechts: '<code>docker pull nginx:alpine</code>' }
    ],
    feedbackFalsch: '<code>rm</code> löscht Container, <code>rmi</code> Images (i wie Image). <code>prune</code> räumt alle beendeten auf, <code>pull</code> lädt nur.',
    erklaerung: '<code>rm</code> = Container, <code>rmi</code> = Image, <code>container prune</code> = alle beendeten Container, <code>pull</code> = nur herunterladen.' },

  /* LZ2 Bauen */
  { id: 'n2-1', lz: 'LZ2', einsatz: ['nachweis'], typ: 'zuordnen',
    frage: 'Die Bäckerei hat ein Dockerfile für ihre Preisliste. Ordne jeder Zeile zu, was sie bewirkt.',
    paare: [
      { links: '<code>FROM nginx:alpine</code>', rechts: 'nimmt ein fertiges Image als Grundlage' },
      { links: '<code>COPY preise.html /usr/share/nginx/html/</code>', rechts: 'legt die Datei fest ins Image' },
      { links: '<code>EXPOSE 80</code>', rechts: 'dokumentiert den Port im Container' },
      { links: '<code>CMD ["nginx", "-g", "daemon off;"]</code>', rechts: 'Befehl, der beim Start des Containers läuft' }
    ],
    feedbackFalsch: 'Lies das erste Wort jeder Zeile: FROM = Grundlage, COPY = Datei hinein, EXPOSE = Port-Hinweis, CMD = Startbefehl.',
    erklaerung: 'FROM wählt die Grundlage, COPY legt Dateien ins Image, EXPOSE dokumentiert den Port (veröffentlicht ihn aber nicht), CMD startet das Programm.' },
  { id: 'n2-2', lz: 'LZ2', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Die Bäckerei hat <code>preise.html</code> geändert. Die Datei kommt per <code>COPY</code> ins Image. Danach hat sie <code>docker restart preise</code> getippt – der Browser zeigt die alten Preise. Was ist zu tun?',
    optionen: [
      { text: 'Neu bauen, den Container <code>preise</code> löschen und aus dem neuen Image neu starten', richtig: true },
      { text: '<code>docker stop preise</code> und <code>docker start preise</code>', feedback: 'Stoppen und Starten nutzt denselben Container mit dem alten Image. Die Datei steckt im Image.' },
      { text: 'Den Browser-Cache leeren', feedback: 'Der Browser zeigt richtig, was der Container liefert. Der Container hat noch die alte Datei aus dem alten Image.' }
    ],
    erklaerung: 'Was per COPY im Image steckt, ändert sich erst mit einem neuen Build. Ein Container nutzt immer das Image, aus dem er erstellt wurde – also neu bauen und neu erstellen.' },
  { id: 'n2-3', lz: 'LZ2', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Du tippst zweimal hintereinander <code>docker build -t preise .</code>, ohne etwas zu ändern. Der zweite Build ist in einer Sekunde fertig und zeigt <code>CACHED</code>. Warum?',
    optionen: [
      { text: 'Docker nutzt die unveränderten Schichten (Layer) aus dem Zwischenspeicher.', richtig: true },
      { text: 'Docker hat nicht gebaut, sondern nur den alten Container neu gestartet.', feedback: 'Ein Build erzeugt ein Image, keinen Container. <code>CACHED</code> heißt: Layer wiederverwendet.' },
      { text: 'Der Build ist fehlgeschlagen, deshalb ging es so schnell.', feedback: 'Der Build war erfolgreich. Docker hat nur Arbeit gespart, weil sich nichts geändert hat.' }
    ],
    erklaerung: 'Jede Zeile im Dockerfile ergibt einen Layer. Ändert sich nichts, nimmt Docker die Layer aus dem Cache.' },
  { id: 'n2-4', lz: 'LZ2', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Ein Mitschüler tippt <code>docker build -t speiseplan</code> und bekommt: <code>ERROR: "docker buildx build" requires exactly 1 argument.</code> Was fehlt?',
    optionen: [
      { text: 'Der Punkt am Ende – der Ordner mit Dockerfile und Dateien', richtig: true },
      { text: 'Das Wort <code>Dockerfile</code> am Ende', feedback: 'Docker sucht das Dockerfile selbst. Es fehlt der Ordner (Build-Kontext): <code>.</code>' },
      { text: 'Ein Tag wie <code>:latest</code> hinter dem Namen', feedback: 'Ohne Tag nimmt Docker automatisch <code>latest</code>. Das ist nicht der Fehler.' }
    ],
    erklaerung: '<code>docker build -t speiseplan .</code> – der Punkt sagt: Dockerfile und Dateien liegen hier im aktuellen Ordner.' },

  /* LZ3 Ports */
  { id: 'n3-1', lz: 'LZ3', einsatz: ['nachweis'], typ: 'text',
    frage: 'Der Container <code>speiseplan</code> wurde mit <code>-p 8085:80</code> gestartet. Welche Adresse tippst du im Browser auf dem Server?',
    akzeptiert: ['http://localhost:8085', 'localhost:8085', 'http://127.0.0.1:8085', '127.0.0.1:8085', 'http://localhost:8085/', 'localhost:8085/'],
    typisch: [{ antwort: 'http://localhost:80', feedback: '80 ist der Port im Container. Der Browser fragt den Host – die linke Zahl.' }, { antwort: 'localhost:80', feedback: '80 ist der Port im Container. Der Browser fragt den Host – die linke Zahl.' }, { antwort: 'https://localhost:8085', feedback: 'Der Container spricht kein https. Nimm <code>http://</code>.' }],
    erklaerung: '<code>-p Host:Container</code>: Im Browser steht der Host-Port 8085, Docker leitet an Port 80 im Container weiter.' },
  { id: 'n3-2', lz: 'LZ3', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Container <code>kasse</code> läuft mit <code>-p 8080:80</code>. Jetzt startest du <code>bestellung</code> ebenfalls mit <code>-p 8080:80</code>. Was passiert?',
    optionen: [
      { text: '<code>bestellung</code> startet nicht: <code>port is already allocated</code>.', richtig: true },
      { text: 'Beide teilen sich Port 8080 und antworten abwechselnd.', feedback: 'Ein Host-Port gehört genau einem laufenden Container. Ohne Load-Balancer wird nichts verteilt.' },
      { text: 'Docker stoppt <code>kasse</code> und startet <code>bestellung</code>.', feedback: 'Docker stoppt keinen fremden Container. Der neue Container bekommt einen Fehler.' }
    ],
    erklaerung: 'Ein Host-Port (links) gehört immer nur einem laufenden Container. Der zweite braucht links einen anderen Port, z. B. <code>8081:80</code>.' },
  { id: 'n3-3', lz: 'LZ3', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Eine Compose-Datei hat die Dienste <code>web</code> (Webseite), <code>adminer</code> (Datenbank-Oberfläche) und <code>db</code> (Datenbank). Nur Webseite und Adminer sollen im Browser erreichbar sein. Welche Dienste brauchen <code>ports:</code>? Kreuze alle an.',
    optionen: [
      { text: '<code>web</code>', richtig: true },
      { text: '<code>adminer</code>', richtig: true },
      { text: '<code>db</code>', feedback: 'Die Datenbank erreichen web und adminer über das interne Compose-Netz. Ein offener Port wäre nur ein Risiko.' }
    ],
    erklaerung: 'Nur was von außen (Browser) erreichbar sein muss, bekommt <code>ports:</code>. Die Datenbank bleibt im internen Netz.' },
  { id: 'n3-4', lz: 'LZ3', einsatz: ['nachweis'], typ: 'zahl',
    frage: 'In einer Compose-Datei steht beim Wiki: <code>ports: - "8090:3000"</code>. Auf welchem Port hört das Wiki <b>im Container</b>?',
    zahl: { wert: 3000, toleranz: 0 },
    typisch: [{ wert: 8090, feedback: '8090 ist der Host-Port (links). Im Container hört das Wiki auf der rechten Zahl.' }],
    erklaerung: 'Rechts steht der Container-Port: 3000. Links steht der Port, den du im Browser tippst: 8090.' },

  /* LZ4 Daten */
  { id: 'n4-1', lz: 'LZ4', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Ein Kunde will hochgeladene Bilder seiner Webseite selbst im Projektordner sehen und auf einen USB-Stick kopieren. Welche Zeile wählst du?',
    optionen: [
      { text: '<code>- ./bilder:/var/www/html/uploads</code>', richtig: true },
      { text: '<code>- bilder:/var/www/html/uploads</code>', feedback: 'Ein Name links ist ein Named Volume. Docker verwaltet es, im Projektordner sieht der Kunde es nicht.' },
      { text: 'Keine – die Bilder bleiben im Container.', feedback: 'Daten nur im Container sind weg, sobald der Container gelöscht wird.' }
    ],
    erklaerung: 'Ein Pfad links (<code>./bilder</code>) ist ein Bind Mount: Die Dateien liegen direkt im Projektordner auf dem Host.' },
  { id: 'n4-2', lz: 'LZ4', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Ein Projekt nutzt das Named Volume <code>dbdaten</code> für die Datenbank und den Bind Mount <code>./bilder</code>. Eine Notiz liegt nur im Container unter <code>/tmp/notiz.txt</code>. Was ist nach <code>docker compose down</code> noch da? Kreuze alle an.',
    optionen: [
      { text: 'die Datenbank im Volume <code>dbdaten</code>', richtig: true },
      { text: 'die Bilder im Ordner <code>./bilder</code>', richtig: true },
      { text: 'die Datei <code>/tmp/notiz.txt</code>', feedback: 'Sie lag nur im Container. <code>down</code> löscht die Container – und damit die Datei.' }
    ],
    erklaerung: '<code>down</code> löscht Container und Netzwerk. Volumes und Bind Mounts bleiben – Dateien nur im Container nicht.' },
  { id: 'n4-3', lz: 'LZ4', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Gleiches Projekt (Volume <code>dbdaten</code>, Bind Mount <code>./bilder</code>). Jetzt tippt jemand <code>docker compose down -v</code>. Was ist danach noch da?',
    optionen: [
      { text: 'Nur die Bilder in <code>./bilder</code> – das Volume <code>dbdaten</code> ist gelöscht.', richtig: true },
      { text: 'Alles – <code>-v</code> zeigt nur mehr Ausgaben an.', feedback: '<code>-v</code> steht für <code>--volumes</code>: Die Named Volumes werden gelöscht.' },
      { text: 'Nichts – auch der Ordner <code>./bilder</code> ist weg.', feedback: 'Bind Mounts sind normale Ordner auf dem Host. Docker löscht sie nicht.' }
    ],
    erklaerung: '<code>down -v</code> löscht zusätzlich die Named Volumes – die Datenbank ist weg. Ordner auf dem Host (Bind Mounts) bleiben.' },
  { id: 'n4-4', lz: 'LZ4', einsatz: ['nachweis'], typ: 'zuordnen',
    frage: 'Die Schülerzeitung hat verschiedene Daten. Ordne jeder Art die beste Lösung zu.',
    paare: [
      { links: 'Dateien der Datenbank, um die sich Docker kümmern soll', rechts: 'Named Volume' },
      { links: 'Fotos, die die Redaktion im Projektordner bearbeitet', rechts: 'Bind Mount' },
      { links: 'alte Fotos, die der Container nicht verändern darf', rechts: 'Bind Mount mit <code>:ro</code>' },
      { links: 'Zwischendateien, die beim Löschen weg sein dürfen', rechts: 'nichts – nur im Container' }
    ],
    feedbackFalsch: 'Frage dich: Soll ich die Daten selbst im Ordner sehen (Bind Mount)? Soll Docker sie verwalten (Volume)? Darf der Container schreiben (<code>:ro</code>)?',
    erklaerung: 'Datenbank → Named Volume. Selbst bearbeitete Dateien → Bind Mount. Nur lesen → <code>:ro</code>. Wegwerfdaten brauchen keinen Speicher außerhalb.' },

  /* LZ5 Compose */
  { id: 'n5-1', lz: 'LZ5', einsatz: ['nachweis'], typ: 'text',
    frage: 'In einer Compose-Datei heißt der Datenbank-Service <code>datenbank</code>. Was trägst du bei WordPress ein? <code>WORDPRESS_DB_HOST: ___</code>',
    akzeptiert: ['datenbank', 'datenbank:3306'],
    typisch: [{ antwort: 'localhost', feedback: 'Im WordPress-Container ist localhost WordPress selbst. Die Datenbank erreichst du über ihren Service-Namen.' }, { antwort: 'db', feedback: 'Der Service heißt hier nicht <code>db</code>. Schau auf den Namen in der Datei: <code>datenbank</code>.' }, { antwort: '127.0.0.1', feedback: 'Auch 127.0.0.1 ist der Container selbst.' }],
    erklaerung: 'Im Compose-Netz ist der Service-Name zugleich der Hostname – hier <code>datenbank</code>.' },
  { id: 'n5-2', lz: 'LZ5', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Was bewirkt <code>depends_on: db: condition: service_healthy</code> beim Dienst <code>wordpress</code>?',
    optionen: [
      { text: 'WordPress startet erst, wenn der Healthcheck der Datenbank „healthy“ meldet.', richtig: true },
      { text: 'WordPress startet, sobald der Container der Datenbank gestartet ist.', feedback: 'Das macht <code>service_started</code>. Die Datenbank ist dann oft noch nicht bereit.' },
      { text: 'Compose prüft, ob WordPress selbst gesund ist.', feedback: 'Die Bedingung steht bei <code>db</code>: Geprüft wird die Datenbank, von der WordPress abhängt.' }
    ],
    erklaerung: '<code>service_healthy</code> wartet auf den Healthcheck der Datenbank. So verbindet sich WordPress erst, wenn die Datenbank Anfragen annimmt.' },
  { id: 'n5-3', lz: 'LZ5', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Im Projektordner liegen <code>docker-compose.yml</code> und <code>.env.example</code>, aber keine <code>.env</code>. In der Compose-Datei steht <code>${DB_PASSWORD}</code>. Was passiert bei <code>docker compose up -d</code>?',
    optionen: [
      { text: 'Warnung <code>The "DB_PASSWORD" variable is not set</code>, das Passwort ist leer, die Datenbank startet nicht.', richtig: true },
      { text: 'Compose liest das Passwort aus <code>.env.example</code>.', feedback: 'Compose liest nur die Datei, die genau <code>.env</code> heißt. Die Vorlage musst du kopieren.' },
      { text: 'Compose fragt im Terminal nach dem Passwort.', feedback: 'Compose fragt nicht nach. Es setzt einen leeren Text ein und warnt.' }
    ],
    erklaerung: 'Compose liest Variablen aus der Datei <code>.env</code>. Fehlt sie, wird die Variable leer. Lösung: <code>cp .env.example .env</code>.' },
  { id: 'n5-4', lz: 'LZ5', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Die Dienste der Schülerzeitung wurden noch nie gestartet. Mit welchem Befehl erstellst und startest du alle Container?',
    optionen: [
      { text: '<code>docker compose up -d</code>', richtig: true },
      { text: '<code>docker compose start</code>', feedback: '<code>start</code> startet nur vorhandene Container. Beim ersten Mal gibt es noch keine: <code>no container to start</code>.' },
      { text: '<code>docker compose restart</code>', feedback: '<code>restart</code> startet vorhandene Container neu. Es gibt noch keine.' },
      { text: '<code>docker run docker-compose.yml</code>', feedback: '<code>docker run</code> erwartet ein Image, keine Compose-Datei.' }
    ],
    erklaerung: '<code>up</code> erstellt die Container aus der Datei und startet sie, <code>-d</code> im Hintergrund.' },

  /* LZ6 Fehlersuche */
  { id: 'n6-1', lz: 'LZ6', einsatz: ['nachweis'], typ: 'zuordnen',
    frage: 'Ordne jeder Meldung ihre Ursache zu.',
    paare: [
      { links: '<code>Bind for 0.0.0.0:8088 failed: port is already allocated</code>', rechts: 'Ein anderer Container nutzt den Host-Port schon.' },
      { links: '<code>The "DB_PASSWORD" variable is not set</code>', rechts: 'Die Datei <code>.env</code> fehlt oder heißt anders.' },
      { links: '<code>service "web" has no container to start</code>', rechts: 'Die Container wurden noch nie mit <code>up</code> erstellt.' },
      { links: '<code>SSL_ERROR_RX_RECORD_TOO_LONG</code>', rechts: 'Im Browser steht <code>https://</code> statt <code>http://</code>.' }
    ],
    feedbackFalsch: 'Lies jede Meldung Wort für Wort: Sie nennt Port, Variable, Container oder SSL.',
    erklaerung: 'Die Meldung nennt fast immer die Ursache: Port belegt, Variable leer, kein Container, falsches Protokoll.' },
  { id: 'n6-2', lz: 'LZ6', einsatz: ['nachweis'], typ: 'mc',
    frage: '<code>docker compose ps</code> zeigt die Datenbank seit 5 Minuten als <code>(health: starting)</code>. WordPress startet nicht. Was tust du als Nächstes?',
    optionen: [
      { text: '<code>docker compose logs db</code> lesen', richtig: true },
      { text: '<code>docker compose down -v</code> und neu starten', feedback: '<code>-v</code> löscht das Volume mit allen Daten. Erst die Ursache in den Logs suchen.' },
      { text: 'Weiter warten – WordPress startet gleich trotzdem.', feedback: 'Bei <code>service_healthy</code> wartet WordPress, bis die Datenbank gesund ist. Nach 5 Minuten stimmt etwas nicht.' }
    ],
    erklaerung: 'Bleibt ein Dienst „starting“, zeigen die Logs warum (z. B. fehlendes Passwort). Erst lesen, dann ändern.' },
  { id: 'n6-3', lz: 'LZ6', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Beim Start kommt: <code>Conflict. The container name "/kasse" is already in use by container "7c1e2a9f0b3d".</code> Was hilft?',
    optionen: [
      { text: 'Den alten Container mit <code>docker rm -f kasse</code> löschen oder einen anderen Namen wählen', richtig: true },
      { text: 'Das Image neu bauen', feedback: 'Das Image ist in Ordnung. Der <b>Name</b> ist schon von einem Container belegt.' },
      { text: 'Einen anderen Host-Port nehmen', feedback: 'Die Meldung nennt keinen Port, sondern den Namen <code>/kasse</code>.' }
    ],
    erklaerung: 'Ein Container-Name gibt es nur einmal – auch beendete Container behalten ihn, bis du sie löschst.' },
  { id: 'n6-4', lz: 'LZ6', einsatz: ['nachweis'], typ: 'mc',
    frage: 'Der Browser zeigt bei <code>http://localhost:8088</code>: „Die Verbindung wurde zurückgesetzt“. In der Datei steht bei WordPress <code>- "8088:8088"</code>. WordPress hört im Container auf Port 80. Was änderst du?',
    optionen: [
      { text: '<code>- "8088:80"</code>', richtig: true },
      { text: '<code>- "80:8088"</code>', feedback: 'Jetzt stimmt links der Host-Port nicht mehr, und rechts steht immer noch 8088.' },
      { text: '<code>https://localhost:8088</code> im Browser', feedback: 'Das Protokoll ist nicht das Problem. Die Anfrage landet im Container auf einem Port, auf dem niemand hört.' }
    ],
    erklaerung: 'Rechts muss der Port stehen, auf dem der Dienst im Container hört – bei WordPress 80.' }
);

/* ---------- Merkblatt und Selbsttest ---------- */
PAKET.merkblatt = [
  { lz: 'LZ1', titel: 'Image und Container', zeilen: [
    { text: 'Ein ___ ist der Bauplan, ein ___ ist die laufende oder beendete Instanz.', loesung: 'Image; Container' },
    { text: '<code>docker ps</code> zeigt nur ___ Container, <code>docker ps -a</code> zeigt ___.', loesung: 'laufende; alle, auch beendete' }],
    fehler: '<code>docker run</code> startet keinen alten Container neu – es entsteht immer ein neuer.' },
  { lz: 'LZ2', titel: 'Bauen', zeilen: [
    { text: 'Ein Image baue ich mit <code>docker build -t name ___</code>.', loesung: '<code>.</code> (der Ordner mit dem Dockerfile)' },
    { text: 'Nach einer Änderung an einer Datei, die per COPY ins Image kommt: ___, ___, ___.', loesung: 'neu bauen, alten Container löschen, neu starten' }],
    fehler: '<code>docker restart</code> reicht nicht – der Container nutzt das alte Image.' },
  { lz: 'LZ3', titel: 'Ports', zeilen: [
    { text: '<code>-p 8088:80</code>: links der ___-Port, rechts der ___-Port.', loesung: 'Host; Container' },
    { text: 'Ein Host-Port gehört ___ laufenden Container.', loesung: 'genau einem' }],
    beispiel: '<code>-p 8081:80</code> → im Browser <code>http://localhost:8081</code>.' },
  { lz: 'LZ4', titel: 'Daten', zeilen: [
    { text: 'Name links (<code>pgdata:/…</code>) = ___; Pfad links (<code>./medien:/…</code>) = ___.', loesung: 'Named Volume; Bind Mount' },
    { text: '<code>down</code> löscht ___. <code>down -v</code> löscht zusätzlich ___.', loesung: 'Container und Netzwerk; die Named Volumes' }],
    fehler: 'Nie <code>docker compose down -v</code>, wenn die Datenbank bleiben soll.' },
  { lz: 'LZ5', titel: 'Compose', zeilen: [
    { text: 'Im Compose-Netz erreiche ich die Datenbank über ihren ___.', loesung: 'Service-Namen (z. B. <code>db</code>)' },
    { text: '<code>${DB_PASSWORD}</code> kommt aus der Datei ___.', loesung: '<code>.env</code>' },
    { text: 'Beim ersten Start tippe ich <code>docker compose ___</code>.', loesung: '<code>up -d</code>' }] },
  { lz: 'LZ6', titel: 'Fehlersuche', zeilen: [
    { text: 'Bei einer Fehlermeldung lese ich zuerst ___.', loesung: 'die Meldung Wort für Wort (Port? Variable? Name? Protokoll?)' },
    { text: 'Läuft ein Dienst nicht, prüfe ich mit ___ und ___.', loesung: '<code>docker compose ps</code>; <code>docker compose logs</code>' }],
    schema: 'Meldung lesen → Ursache benennen → eine Sache ändern → <code>up -d</code> → im Browser prüfen.' }
];
PAKET.selbsttest = ['n1-3', 'n2-2', 'n3-1', 'n4-3', 'n5-1'];
