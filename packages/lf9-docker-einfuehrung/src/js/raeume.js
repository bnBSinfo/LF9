/* =====================================================================
   „Serverraum 0“ – Räume 2 bis 5 (geladen nach inhalt.js, vor sprache.js)
   Erweitert den simulierten Docker-Host um build, Ports, Volumes,
   Bind Mounts, eine Shell im Container und Docker Compose. Dazu kommen
   Bausteine für Browser, Lückentext-Editor, Adminer und Sortieren.
   Alle Personen, Firmen und Vereine sind erfunden.
   ===================================================================== */

/* ---------- Seiten im Browser ---------- */
var SEITE = {
  umzug: '<h2 style="margin:0">⚓ Hafenblick IT-Service</h2><p>Wir sind umgezogen – neue Adresse: Hafenstraße 12.</p>',
  tsv1: '<h2 style="margin:0">⚽ TSV Lechwiesen</h2><p>Willkommen beim TSV Lechwiesen!</p><p>Training: Di + Do 18 Uhr</p>',
  tsv2: '<h2 style="margin:0">⚽ TSV Lechwiesen</h2><p><b>Herzlich willkommen</b> beim TSV Lechwiesen!</p><p>Training: Di + Do 18 Uhr</p>'
};
var DIENSTPORT = { 'nginx:alpine': 80, adminer: 8080, immich: 2283, eigen: 80 };

/* ---------- Simulator: Erweiterung ---------- */
function absPfad(p, cwd) {
  p = String(p || '').replace(/^"|"$/g, '').replace('$(pwd)', '/home/azubi');
  if (p.indexOf('./') === 0) p = '/home/azubi/' + p.slice(2);
  if (p.charAt(0) !== '/') p = (cwd && cwd !== '/' ? cwd : '') + '/' + p;
  return p.replace(/\/+$/, '') || '/';
}
var neuerHostBasis = neuerHost;
neuerHost = function () { var h = neuerHostBasis(); h.volumes = {}; h.ordner = {}; h.projekt = {}; return h; };
var hostBasis = hostAusfuehren;
hostAusfuehren = function (h, zeile) {
  h.volumes = h.volumes || {}; h.ordner = h.ordner || {}; h.projekt = h.projekt || {};
  var aus = [], w = zeile.trim().split(/\s+/).filter(Boolean);
  function f(t, art) { aus.push({ t: t, art: art ? { fehler: 'sr-fe', kopf: 'sr-ko' }[art] || art : '' }); }
  function erg(o) { o = o || {}; o.aus = aus; return o; }
  if (!w.length) return erg();
  if (h.shell) return shellBefehl(h, zeile, f, erg);
  if (w[0] === 'mkdir') { h.ordner[absPfad(w[w.length - 1], '/home/azubi')] = h.ordner[absPfad(w[w.length - 1], '/home/azubi')] || {}; return erg({ neutral: true }); }
  if (w[0] === 'ls') {
    if (w[1] && w[1][0] !== '-') { var o = h.ordner[absPfad(w[1], '/home/azubi')]; if (!o) { f("ls: cannot access '" + w[1] + "': No such file or directory", 'fehler'); return erg({ neutral: true }); } f(Object.keys(o).join('  ')); return erg({ neutral: true, ls: w[1] }); }
    f(Object.keys(h.projekt.dateien || {}).concat(Object.keys(h.ordner).map(function (x) { return x.replace('/home/azubi/', '') + '/'; })).join('  ')); return erg({ neutral: true });
  }
  if (w[0] === 'cat') {
    var d = (h.projekt.dateien || {})[w[1]], pf = absPfad(w[1] || '', '/home/azubi'), ord = pf.slice(0, pf.lastIndexOf('/')), datei = pf.slice(pf.lastIndexOf('/') + 1);
    if (d !== undefined) String(d).split('\n').forEach(function (z) { f(z); });
    else if (h.ordner[ord] && h.ordner[ord][datei] !== undefined) f(String(h.ordner[ord][datei]));
    else f('cat: ' + w[1] + ': No such file or directory', 'fehler');
    return erg({ neutral: true });
  }
  if (w[0] === 'cp') {
    if (w[1] === '.env.example' && (h.projekt.dateien || {})['.env.example'] !== undefined) {
      h.projekt.dateien[w[2]] = h.projekt.dateien['.env.example'];
      if (w[2] === '.env') h.env = true;
      return erg({ neutral: true, kopiert: w[2] });
    }
    f("cp: cannot stat '" + (w[1] || '') + "': No such file or directory", 'fehler'); return erg({ neutral: true });
  }
  if (w[0] !== 'docker') return hostBasis(h, zeile);
  var sub = w[1];
  if (sub === 'build') return dockerBuild(h, w, f, erg);
  if (sub === 'compose') return dockerCompose(h, w.slice(2), f, erg);
  if (sub === 'volume') {
    if (w[2] === 'create' && w[3]) { h.volumes[w[3]] = h.volumes[w[3]] || {}; f(w[3]); return erg({ volume: w[3] }); }
    if (w[2] === 'ls') { f('DRIVER    VOLUME NAME', 'kopf'); Object.keys(h.volumes).forEach(function (v) { f('local     ' + v); }); return erg({ neutral: true }); }
    if (w[2] === 'rm' && w[3]) {
      if (!h.volumes[w[3]]) { f('Error response from daemon: get ' + w[3] + ': no such volume', 'fehler'); return erg({ fehler: 'keinVolume' }); }
      delete h.volumes[w[3]]; f(w[3]); return erg({ volumeWeg: w[3] });
    }
    f('Usage:  docker volume COMMAND'); return erg({ fehler: 'argument' });
  }
  if (sub === 'restart' || sub === 'stop' || sub === 'start') {
    var c = h.container.filter(function (x) { return x.name === w[2]; })[0];
    if (!c) { f('Error response from daemon: No such container: ' + (w[2] || ''), 'fehler'); return erg({ fehler: 'keinContainer' }); }
    c.status = sub === 'stop' ? 'exited' : 'up'; f(c.name); return erg({ neustart: sub === 'restart' ? c : null });
  }
  if (sub === 'run') {
    var rest = w.slice(2), ports = [], mounts = [], it = false, rm = false, img = null, name = null;
    for (var i = 0; i < rest.length; i++) {
      var a = rest[i];
      if (a === '-p') { ports.push(rest[++i]); continue; }
      if (a === '-v') { var m = rest[++i] || ''; var teile = m.replace(/^"([^"]*)"/, function (x, y) { return y.replace(/:/g, '\u0001'); }).split(':').map(function (x) { return x.replace(/\u0001/g, ':'); }); mounts.push({ quelle: teile[0], ziel: teile[1], ro: teile[2] === 'ro' }); continue; }
      if (a === '-it' || a === '-ti') { it = true; continue; }
      if (a === '--rm') { rm = true; continue; }
      if (a === '--name') { name = rest[++i]; continue; }
      if (a === '-d' || a === '-i' || a === '-t' || a === '-e') { if (a === '-e') i++; continue; }
      if (!img) img = a;
    }
    // Port schon belegt?
    for (var k = 0; k < ports.length; k++) {
      var hp = String(ports[k]).split(':')[0];
      var belegt = h.container.filter(function (x) { return x.status === 'up' && (x.ports || []).some(function (p) { return String(p).split(':')[0] === hp; }); })[0];
      if (belegt) { f('docker: Error response from daemon: driver failed programming external connectivity on endpoint ' + (name || 'neu') + ': Bind for 0.0.0.0:' + hp + ' failed: port is already allocated.', 'fehler'); return erg({ fehler: 'portBelegt' }); }
    }
    var r = hostBasis(h, w.filter(function (x, j) { return !(j >= 2 && (x === '-it' || x === '-ti' || x === '--rm')) && !(j >= 2 && (x === '-v' || w[j - 1] === '-v')); }).join(' '));
    if (r.gestartet) {
      var c2 = r.gestartet, bild = h.images[img] || h.images[img + ':latest'];
      if (bild && bild.seite) c2.seite = bild.seite;
      c2.mounts = mounts.map(function (mt) {
        var bind = mt.quelle.charAt(0) === '/' || mt.quelle.indexOf('./') === 0 || mt.quelle.indexOf('$(pwd)') >= 0;
        if (bind) { var ap = absPfad(mt.quelle, '/home/azubi'); h.ordner[ap] = h.ordner[ap] || {}; return { art: 'bind', pfad: ap, ziel: mt.ziel, ro: mt.ro }; }
        h.volumes[mt.quelle] = h.volumes[mt.quelle] || {}; return { art: 'volume', name: mt.quelle, ziel: mt.ziel, ro: mt.ro };
      });
      c2.fs = {}; c2.rm = rm;
      if (it) { c2.status = 'up'; h.shell = { id: c2.id, c: c2, cwd: '/' }; r.aus = r.aus.filter(function (z) { return !/^[0-9a-f]{40,}/.test(z.t); }); }
    }
    return r;
  }
  return hostBasis(h, zeile);
};

/* Shell im Container (docker run -it …) */
function mountFuer(c, pfad) {
  for (var i = 0; i < (c.mounts || []).length; i++) { var m = c.mounts[i]; if (pfad === m.ziel || pfad.indexOf(m.ziel + '/') === 0) return m; }
  return null;
}
function speicherFuer(h, m) { return m.art === 'volume' ? h.volumes[m.name] : h.ordner[m.pfad]; }
function shellBefehl(h, zeile, f, erg) {
  var s = h.shell, c = s.c, w = zeile.trim().split(/\s+/);
  function pfad(p) { return absPfad(p, s.cwd); }
  if (w[0] === 'exit') {
    h.shell = null;
    if (c.rm) h.container.splice(h.container.indexOf(c), 1); else c.status = 'exited';
    f('exit'); return erg({ neutral: true, exit: true, c: c });
  }
  var schreib = zeile.match(/^echo\s+(.*?)\s*>\s*(\S+)\s*$/), touch = w[0] === 'touch' && w[1];
  if (schreib || touch) {
    var p = pfad(schreib ? schreib[2] : w[1]), inhalt = schreib ? schreib[1].replace(/^["']|["']$/g, '') : '', m = mountFuer(c, p), datei = p.slice(p.lastIndexOf('/') + 1);
    if (m && m.ro) { f('bash: ' + p + ': Read-only file system', 'fehler'); return erg({ fehler: 'ro' }); }
    if (m) speicherFuer(h, m)[datei] = inhalt; else c.fs[p] = inhalt;
    return erg({ neutral: true, geschrieben: p, mount: m });
  }
  if (w[0] === 'cat') {
    var p2 = pfad(w[1] || ''), m2 = mountFuer(c, p2), d2 = p2.slice(p2.lastIndexOf('/') + 1), v = m2 ? speicherFuer(h, m2)[d2] : c.fs[p2];
    if (v === undefined) f('cat: ' + w[1] + ': No such file or directory', 'fehler'); else f(String(v));
    return erg({ neutral: true });
  }
  if (w[0] === 'rm') {
    var p3 = pfad(w[w.length - 1]), m3 = mountFuer(c, p3);
    if (m3 && m3.ro) { f("rm: cannot remove '" + p3 + "': Read-only file system", 'fehler'); return erg({ fehler: 'ro' }); }
    if (m3) delete speicherFuer(h, m3)[p3.slice(p3.lastIndexOf('/') + 1)]; else delete c.fs[p3];
    return erg({ neutral: true });
  }
  if (w[0] === 'ls') {
    var p4 = pfad(w[1] || s.cwd), m4 = mountFuer(c, p4);
    if (m4) f(Object.keys(speicherFuer(h, m4)).join('  '));
    else f(Object.keys(c.fs).filter(function (x) { return x.indexOf(p4 === '/' ? '/' : p4 + '/') === 0; }).map(function (x) { return x.slice(x.lastIndexOf('/') + 1); }).concat(p4 === '/' ? ['bin', 'etc', 'home', 'tmp', 'usr', 'var'].concat((c.mounts || []).map(function (m) { return m.ziel.slice(1); })) : []).join('  '));
    return erg({ neutral: true });
  }
  if (w[0] === 'cd') { s.cwd = pfad(w[1] || '/'); return erg({ neutral: true }); }
  if (w[0] === 'pwd') { f(s.cwd); return erg({ neutral: true }); }
  if (w[0] === 'docker') { f('bash: docker: command not found', 'fehler'); f('(Du bist noch im Container – erst mit exit hinaus.)', 'kopf'); return erg({ fehler: 'imContainer' }); }
  f('bash: ' + w[0] + ': command not found', 'fehler'); return erg({ fehler: 'keinProgramm' });
}

/* docker build */
function dockerBuild(h, w, f, erg) {
  var t = w.indexOf('-t'), name = t > 0 ? w[t + 1] : null, kontext = w.filter(function (x, i) { return i > 1 && x !== '-t' && w[i - 1] !== '-t'; })[0];
  if (!kontext) { f('ERROR: "docker buildx build" requires exactly 1 argument.', 'fehler'); f("See 'docker buildx build --help'.", 'fehler'); return erg({ fehler: 'buildPunkt' }); }
  if (!(h.projekt.dateien || {}).Dockerfile) { f('ERROR: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory', 'fehler'); return erg({ fehler: 'keinDockerfile' }); }
  var key = (name || 'none') + ':latest', alt = h.images[key], seite = h.projekt.seite, cached = alt && alt.seite === seite;
  var basis = h.projekt.basis || 'nginx:alpine', copy = h.projekt.copy || 'COPY index.html /usr/share/nginx/html/';
  if (!h.images[basis]) h.images[basis] = { name: basis.split(':')[0], tag: basis.split(':')[1] || 'latest', id: (REGISTRY[basis] || REGISTRY['nginx:alpine']).id, groesse: (REGISTRY[basis] || REGISTRY['nginx:alpine']).groesse, neu: true };
  ['[+] Building 1.3s (7/7) FINISHED', ' => [internal] load build definition from Dockerfile', ' => [1/2] FROM docker.io/library/' + basis, ' => ' + (cached ? 'CACHED ' : '') + '[2/2] ' + copy, ' => exporting to image', ' => => naming to docker.io/library/' + key].forEach(function (z) { f(z); });
  REGISTRY[key] = { id: 'b' + (seite || 'x').length.toString(16) + '7e2c41f0a9', groesse: '52.6MB', cmd: '"/docker-entrypoint.…"', laeuft: true };
  if (name) h.images[key] = { name: name, tag: 'latest', id: REGISTRY[key].id, groesse: '52.6MB', neu: !cached, seite: seite };
  return erg({ gebaut: name, cached: cached });
}

/* docker compose – Zustand in h.compose (Projekt, Lücken-Werte, Dienste) */
function composePruefen(h) {
  var c = h.compose; if (!c) return 'Keine docker-compose.yml in diesem Ordner.';
  if (!c.gespeichert) return 'docker-compose.yml enthält noch Lücken (???).';
  return c.pruefe ? c.pruefe(c.werte) : null;
}
function dockerCompose(h, a, f, erg) {
  var c = h.compose, profil = null;
  if (a[0] === '--profile') { profil = a[1]; a = a.slice(2); }
  var cmd = a[0], P0 = c ? c.projekt : 'x';
  if (!c) { f('no configuration file provided: not found', 'fehler'); return erg({ fehler: 'keinCompose' }); }
  function cname(s) { return P0 + '-' + s + '-1'; }
  function laufend() { return h.container.filter(function (x) { return x.compose === P0; }); }
  if (cmd === 'config') { var p = composePruefen(h); if (p) { f(p, 'fehler'); return erg({ fehler: 'composeLuecke' }); } f('name: ' + P0); f('services:'); c.dienste(c.werte, h).forEach(function (d) { f('  ' + d.dienst + ':'); f('    image: ' + d.image); }); return erg({ neutral: true, config: true }); }
  if (cmd === 'up') {
    if (a.slice(1).filter(function (x) { return x !== '-d'; }).length) { f('no such service: ' + a.slice(1).filter(function (x) { return x !== '-d'; })[0], 'fehler'); return erg({ fehler: 'keinService' }); }
    var pr = composePruefen(h); if (pr) { f(pr, 'fehler'); return erg({ fehler: 'composeLuecke' }); }
    if (!h.env) { (c.envVars || ['DB_PASSWORD']).forEach(function (v) { f('WARN[0000] The "' + v + '" variable is not set. Defaulting to a blank string.', 'fehler'); }); }
    var neu = [];
    c.dienste(c.werte, h, profil || c.profil).forEach(function (d) {
      var x = laufend().filter(function (y) { return y.dienst === d.dienst; })[0];
      if (x && x.config === h.envVersion && x.status === 'up') return;
      if (x) h.container.splice(h.container.indexOf(x), 1);
      if (d.volume) { h.volumes[P0 + '_' + d.volume] = h.volumes[P0 + '_' + d.volume] || {}; }
      if (d.bind) { h.ordner[d.bind] = h.ordner[d.bind] || {}; }
      var ok = h.env || !d.brauchtEnv;
      h.container.push({ id: (d.dienst + 'a1b2c3d4e5f6').slice(0, 12), name: cname(d.dienst), image: d.image, status: ok ? 'up' : 'exited', gesund: true, ports: d.ports || [], compose: P0, dienst: d.dienst, port: d.port, seite: d.seite, config: h.envVersion, neu: true });
      neu.push(d);
    });
    if (profil) c.profil = profil;
    f('[+] Running ' + neu.length + '/' + neu.length);
    if (neu.length) f(' ✔ Network ' + P0 + '_default  Created');
    neu.forEach(function (d) { f(' ✔ Container ' + cname(d.dienst) + '  ' + (!h.env && d.brauchtEnv ? 'Error' : d.health ? 'Healthy' : 'Started'), !h.env && d.brauchtEnv ? 'fehler' : ''); });
    if (!h.env) { f('dependency failed to start: container ' + cname('db') + ' exited (1)', 'fehler'); return erg({ fehler: 'envFehlt', up: false }); }
    return erg({ up: true, profil: profil });
  }
  if (cmd === 'start') {
    if (!laufend().length) { f('service "' + c.dienste(c.werte, h)[0].dienst + '" has no container to start', 'fehler'); return erg({ fehler: 'keinStart' }); }
    laufend().forEach(function (x) { x.status = 'up'; }); return erg({ neutral: true });
  }
  if (cmd === 'restart') { laufend().forEach(function (x) { f(' ✔ Container ' + x.name + '  Started'); }); return erg({ restart: true }); }
  if (cmd === 'ps') {
    f('NAME                 IMAGE                STATUS                   PORTS', 'kopf');
    laufend().forEach(function (x) { f((x.name + '                    ').slice(0, 21) + (x.image + '                    ').slice(0, 21) + (x.status === 'up' ? 'Up 1 minute (healthy)  ' : 'Exited (1)             ') + (x.ports || []).map(function (p) { return '0.0.0.0:' + p.replace(':', '->'); }).join(', ')); });
    return erg({ neutral: true, ps: { alle: true, anzahl: laufend().length } });
  }
  if (cmd === 'logs') {
    if (!h.env) { f(cname('db') + '  | Error: Database is uninitialized and superuser password is not specified.', 'fehler'); f(cname('db') + '  |        You must specify POSTGRES_PASSWORD to a non-empty value.', 'fehler'); }
    else f(cname('db') + '  | database system is ready to accept connections');
    return erg({ neutral: true, logs: true });
  }
  if (cmd === 'down') {
    var mitV = a.indexOf('-v') >= 0 || a.indexOf('--volumes') >= 0;
    c.unten = mitV ? 'v' : 'ja';
    laufend().forEach(function (x) { f(' ✔ Container ' + x.name + '  Removed'); h.container.splice(h.container.indexOf(x), 1); });
    if (mitV) Object.keys(h.volumes).filter(function (v) { return v.indexOf(P0 + '_') === 0; }).forEach(function (v) { f(' ✔ Volume ' + v + '  Removed'); delete h.volumes[v]; });
    f(' ✔ Network ' + P0 + '_default  Removed');
    return erg({ down: true, mitV: mitV });
  }
  f("unknown docker command: \"compose " + (cmd || '') + "\"", 'fehler'); return erg({ fehler: 'keinBefehl' });
}

/* Browser: Adresse → Antwort des Hosts */
function hostBrowse(h, url) {
  var u = String(url || '').trim(), https = /^https:/i.test(u), m = u.replace(/^https?:\/\//i, '').match(/^(localhost|127\.0\.0\.1)(?::(\d+))?/i);
  if (!m) return { fehler: L('Diese Adresse gibt es im Übungsnetz nicht. Probier <code>http://localhost:PORT</code>.', 'Diese Adresse gibt es nicht. Probier <code>http://localhost:PORT</code>.') };
  var port = m[2] || (https ? '443' : '80');
  var c = h.container.filter(function (x) { return x.status === 'up' && (x.ports || []).some(function (p) { return String(p).split(':')[0] === port; }); })[0];
  if (!c) return { fehler: L('<b>Verbindung fehlgeschlagen.</b> Unter localhost:' + port + ' antwortet niemand.', '<b>Keine Verbindung.</b> Unter localhost:' + port + ' antwortet niemand.'), port: port };
  var cport = +String(c.ports.filter(function (p) { return String(p).split(':')[0] === port; })[0]).split(':')[1];
  var dienst = c.port || (c.seite ? 80 : DIENSTPORT[c.image] || 80);
  if (cport !== dienst) return { fehler: L('<b>Die Verbindung wurde zurückgesetzt.</b> Der Container ' + c.name + ' bekommt die Anfragen auf Port ' + cport + ' – dort hört aber niemand.', '<b>Keine Antwort.</b> Im Container hört niemand auf Port ' + cport + '.'), port: port, c: c };
  if (https) return { fehler: '<b>Fehler: Gesicherte Verbindung fehlgeschlagen</b><br>Fehlercode: SSL_ERROR_RX_RECORD_TOO_LONG', port: port, c: c, ssl: true };
  return { ok: true, c: c, port: port, seite: c.seite || '<p>OK</p>' };
}

/* ---------- Bausteine für Aufgaben (Widgets) ---------- */
var RW_CSS = '.sr-browser{background:#fff;color:#0f172a;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;margin-top:6px}' +
  '.sr-browser .bar{display:flex;gap:6px;background:#e2e8f0;padding:6px}.sr-browser .bar input{flex:1;min-width:0;min-height:38px;font-family:ui-monospace,Menlo,monospace}' +
  '.sr-browser .seite{padding:10px 12px;min-height:90px}.sr-browser .seite.fehl{background:#fff7ed}' +
  '.sr-editor{background:#020617;color:#e2e8f0;border-radius:10px;padding:8px 10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.82rem;line-height:1.5;overflow:auto;white-space:pre}' +
  '.sr-editor select,.sr-editor input{font:inherit;min-height:30px;background:#fef3c7;color:#422006;border:2px solid #f59e0b;border-radius:6px;padding:0 4px}' +
  '.sr-editor .falsch{border-color:#dc2626;background:#fee2e2}.sr-editor .richtig{border-color:#16a34a;background:#dcfce7}.sr-editor .kom{color:#64748b}' +
  '.sr-editor .nr{color:#fbbf24;font-weight:700}' +
  '.sr-editor .zeile{display:block;width:100%;text-align:left;background:none;border:0;color:inherit;font:inherit;padding:0 4px;min-height:0;border-radius:4px;white-space:pre}.sr-editor .zeile.mark{background:#7f1d1d}' +
  '.sr-sort .karte{display:flex;flex-wrap:wrap;align-items:center;gap:6px;border-bottom:1px dashed #cbd5e1;padding:6px 0}.sr-sort code{flex:1 1 100%}.sr-sort button[aria-pressed="true"]{background:#1d4ed8;color:#fff}' +
  '.sr-form label{display:block;margin:6px 0 2px;font-weight:700}.sr-form input,.sr-form select{min-height:38px;width:100%}';
function rwStil() { if (!document.getElementById('rw-css')) { var s = document.createElement('style'); s.id = 'rw-css'; s.textContent = RW_CSS; document.head.appendChild(s); } }

/* Browser-Aufgabe: ziel(ergebnis, url, host) → true/false; falsch(ergebnis, url) → Text */
function browserFall(opt) {
  return function (box, ctx) {
    rwStil();
    var E = KIT.el, seite = E('div', { class: 'seite', html: '<i>' + L('Gib oben eine Adresse ein.', 'Gib oben eine Adresse ein.') + '</i>' });
    var inp = E('input', { type: 'text', value: opt.start || 'http://', 'aria-label': L('Adresse', 'Adresse'), onkeydown: function (e) { if (e.key === 'Enter') los(); } });
    function los() {
      var r = hostBrowse(ctx.host(), inp.value);
      seite.className = 'seite' + (r.ok ? '' : ' fehl');
      seite.innerHTML = r.ok ? r.seite : r.fehler;
      if (opt.zeigeSeite && r.ok) opt.zeigeSeite(seite, r, ctx);
      if (opt.ziel(r, inp.value, ctx.host())) ctx.ok();
      else if (!opt.still || !r.ok) ctx.fehl(T(opt.falsch ? opt.falsch(r, inp.value, ctx.host()) || opt.tipp : opt.tipp));
    }
    box.appendChild(E('div', { class: 'sr-browser' }, [E('div', { class: 'bar' }, [E('span', { text: '🌐' }), inp, E('button', { type: 'button', text: L('Öffnen', 'Öffnen'), onclick: los })]), seite]));
  };
}

/* Lückentext im Editor: luecken {id: {optionen, richtig, fb: {wert: [s, e]}}}; Text mit {{id}} */
function lueckenFall(opt) {
  return function (box, ctx) {
    rwStil();
    var E = KIT.el, h = ctx.host(), felder = {};
    var ed = E('div', { class: 'sr-editor', role: 'group', 'aria-label': opt.datei });
    ed.appendChild(E('div', { class: 'kom', text: '# ' + opt.datei }));
    opt.text.split('\n').forEach(function (zeile) {
      var div = E('div'), nrn = [];
      zeile.split(/(\{\{\w+\}\})/).forEach(function (teil) {
        var m = teil.match(/^\{\{(\w+)\}\}$/);
        if (!m) { div.appendChild(E('span', { class: /^\s*#/.test(teil) ? 'kom' : '', text: teil })); return; }
        var L0 = opt.luecken[m[1]], el;

        if (PFAD.stufe === 'profi' && !L0.immerAuswahl) el = E('input', { type: 'text', size: '16', 'aria-label': L('Lücke ', 'Lücke ') + m[1], spellcheck: 'false' });
        else { el = E('select', { 'aria-label': L('Lücke ', 'Lücke ') + m[1] }, [E('option', { value: '', text: '???' })].concat(L0.optionen.map(function (o) { return E('option', { value: o, text: o }); }))); }
        if (h.compose && h.compose.werte && h.compose.werte[m[1]]) el.value = h.compose.werte[m[1]];
        (felder[m[1]] = felder[m[1]] || []).push(el);
        div.appendChild(el);
        if (L0.nr) nrn.push(L0.nr);
      });
      /* optionale Nummer der Lücke am Zeilenende, passend zur Arbeitsanweisung daneben */
      if (nrn.length) div.appendChild(E('span', { class: 'nr', text: '   ◀ ' + nrn.join(' ') }));
      ed.appendChild(div);
    });
    box.appendChild(ed);
    box.appendChild(E('button', { type: 'button', style: 'margin-top:8px', text: '💾 ' + L('Speichern und prüfen', 'Speichern und prüfen'), onclick: function () {
      var falsch = [], werte = {};
      Object.keys(felder).forEach(function (id) {
        felder[id].forEach(function (el) {
          var v = el.value.trim(), L0 = opt.luecken[id], ok = (L0.akzeptiert || [L0.richtig]).indexOf(v) >= 0;
          el.classList.toggle('falsch', !ok); el.classList.toggle('richtig', ok);
          if (!ok) falsch.push(L0.fb && L0.fb[v] ? T(L0.fb[v]) : T(L0.tipp));
          werte[id] = v;
        });
      });
      if (falsch.length) { ctx.fehl('<b>' + falsch.length + L(' Lücke(n) stimmen noch nicht.', ' Lücke(n) sind noch falsch.') + '</b><br>' + falsch.filter(function (x, i, a) { return a.indexOf(x) === i; }).join('<br>')); return; }
      opt.speichern(ctx.host(), werte); ctx.neu(); ctx.ok();
    } }));
  };
}

/* Sortieren: karten [{html, ziel}] in faecher [{id, titel}] */
function sortierFall(opt) {
  return function (box, ctx) {
    rwStil();
    var E = KIT.el, wahl = {}, w = E('div', { class: 'sr-sort' });
    opt.karten.forEach(function (k, i) {
      var reihe = E('div', { class: 'karte' }, [E('code', { html: k.html })]);
      opt.faecher.forEach(function (fa) {
        var b = E('button', { type: 'button', 'aria-pressed': 'false', text: T(fa.titel), onclick: function () { wahl[i] = fa.id; reihe.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); } });
        reihe.appendChild(b);
      });
      w.appendChild(reihe);
    });
    w.appendChild(E('button', { type: 'button', style: 'margin-top:8px', text: L('Prüfen', 'Prüfen'), onclick: function () {
      var f = opt.karten.filter(function (k, i) { return wahl[i] !== k.ziel; });
      if (!f.length) return ctx.ok();
      ctx.fehl(f.length + L(' Zuordnung(en) stimmen nicht. ', ' sind falsch. ') + T(opt.tipp));
    } }));
    box.appendChild(w);
  };
}

/* Zeilen markieren (Fehlersuche in einer Datei): zeilen [{text, fehler: [s,e]|null}] */
function markierFall(opt) {
  return function (box, ctx) {
    rwStil();
    var E = KIT.el, an = {}, ed = E('div', { class: 'sr-editor' });
    opt.zeilen.forEach(function (z, i) {
      var b = E('button', { type: 'button', class: 'zeile', 'aria-pressed': 'false', text: z.text, onclick: function () { an[i] = !an[i]; b.classList.toggle('mark', an[i]); b.setAttribute('aria-pressed', String(!!an[i])); } });
      ed.appendChild(b);
    });
    box.appendChild(E('p', { class: 'nr', text: L('Tippe die fehlerhaften Zeilen an (mehrere möglich).', 'Tippe die falschen Zeilen an. Es sind mehrere.') }));
    box.appendChild(ed);
    box.appendChild(E('button', { type: 'button', style: 'margin-top:8px', text: L('Prüfen', 'Prüfen'), onclick: function () {
      var fehlt = opt.zeilen.filter(function (z, i) { return z.fehler && !an[i]; }), zuviel = opt.zeilen.filter(function (z, i) { return !z.fehler && an[i]; });
      if (!fehlt.length && !zuviel.length) return ctx.ok();
      ctx.fehl((fehlt.length ? fehlt.length + L(' Fehler fehlen noch. ', ' Fehler fehlen. ') : '') + (zuviel.length ? zuviel.length + L(' markierte Zeile(n) sind in Ordnung.', ' Zeile(n) sind richtig.') : ''));
    } }));
  };
}

/* ---------- Raum 2: Die Vereinsseite ---------- */
var DOCKERFILE = 'FROM nginx:alpine\nCOPY index.html /usr/share/nginx/html/\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]';
function laeuftMit(h, name, port) { return h.container.some(function (c) { return c.name === name && c.status === 'up' && (!port || (c.ports || []).indexOf(port) >= 0); }); }
function seiteZeigen(box, h, titel) { rwStil(); box.appendChild(KIT.el('div', { class: 'sr-editor', text: titel + '\n' + String(h.projekt.dateien[titel] || '') })); }

RAEUME.push({ id: 'S2', nr: 2, titel: ['Raum 2 · Die Vereinsseite', 'Raum 2 · Die Vereinsseite'], vm: 'Übung 2 Steckbrief-Webserver',
  auftrag: ['Der TSV braucht eine Startseite. Bau aus dem Dockerfile ein Image und mach die Seite im Browser erreichbar.', 'Der Verein braucht eine Webseite. Baue aus dem Dockerfile ein Image. Mach die Seite im Browser sichtbar.'],
  regeln: [
    ['<code>docker build -t name .</code> baut aus dem Dockerfile im aktuellen Ordner ein Image. Der Punkt ist der Ordner.', '<code>docker build -t name .</code> baut ein Image. Der Punkt heißt: hier im Ordner.'],
    ['Was per <code>COPY</code> ins Image kommt, steckt fest im Image. Nach einer Änderung: <b>neu bauen, alten Container löschen, neu starten.</b>', 'Was mit <code>COPY</code> ins Image kommt, ist fest drin. Nach einer Änderung: <b>neu bauen, alten Container löschen, neu starten.</b>'],
    ['<code>-p 8080:80</code> heißt: <b>Host-Port 8080 → Container-Port 80</b>. Links der Host, rechts der Container.', '<code>-p 8080:80</code>: <b>links der Rechner (8080), rechts der Container (80)</b>.'],
    ['Ein Host-Port gehört immer nur <b>einem</b> laufenden Container.', 'Ein Port vom Rechner gehört nur <b>1</b> Container.'],
    ['<code>-d</code> lässt den Container im Hintergrund laufen.', '<code>-d</code>: Der Container läuft im Hintergrund.']
  ],
  bausteine: ['docker', 'build', '-t', 'vereinsseite', '.', 'run', '-d', '-p', '8080:80', '8081:80', '--name', 'tsv', 'tsv2', 'rm', '-f', 'restart', 'ps'],
  setup: function (h) { h.projekt = { dateien: { Dockerfile: DOCKERFILE, 'index.html': SEITE.tsv1 }, seite: SEITE.tsv1 }; },
  demoReset: true,
  demoText: ['Jana baut zuerst eine andere Seite: „Hafenblick – wir sind umgezogen“. Schau zu, dann bist du dran.', 'Jana baut zuerst eine andere Seite. Schau zu. Dann bist du dran.'],
  begruessung: ['Raum 2: Im Ordner liegen ein Dockerfile und die Vereinsseite index.html.', 'Raum 2: Im Ordner sind ein Dockerfile und die Datei index.html.'],
  demo: [
    { tun: function (h) { h.projekt = { dateien: { Dockerfile: DOCKERFILE, 'index.html': SEITE.umzug }, seite: SEITE.umzug }; }, text: ['Das Dockerfile', 'Das Dockerfile'], zeige: function (b, h) { seiteZeigen(b, h, 'Dockerfile'); },
      warum: ['<code>FROM nginx:alpine</code> nimmt ein fertiges Webserver-Image, <code>COPY</code> legt unsere Seite hinein.', '<code>FROM</code> nimmt einen fertigen Webserver. <code>COPY</code> legt unsere Seite hinein.'] },
    { cmd: 'docker build -t umzug .', warum: ['Aus Bauplan und Datei entsteht ein neues Image <code>umzug</code> – rechts im Server zu sehen.', 'Aus Bauplan und Datei wird ein neues Image <code>umzug</code>.'] },
    { cmd: 'docker run -d -p 9090:80 --name umzug umzug', selbst: true,
      warum: ['Der Container läuft im Hintergrund (<code>-d</code>). Sein Schild zeigt <code>9090 → 80</code>.', 'Der Container läuft. Das Schild zeigt <code>9090 → 80</code>.'],
      antwort: ['Im Container hört nginx auf Port 80 – das ist fest. Der Host-Port links ist frei wählbar, hier 9090. Darum: <code>Host:Container</code> = <code>9090:80</code>.', 'nginx im Container hört auf Port 80. Das bleibt so. Links steht der Port vom Rechner. Den darfst du wählen.'] },
    { tun: function () {}, text: ['Browser: http://localhost:9090', 'Browser: http://localhost:9090'], zeige: function (b, h) { var r = hostBrowse(h, 'http://localhost:9090'); b.appendChild(KIT.el('div', { class: 'sr-browser', html: '<div class="seite">' + (r.ok ? r.seite : r.fehler) + '</div>' })); rwStil(); },
      warum: ['Der Browser fragt den Host auf Port 9090, Docker leitet an Port 80 im Container weiter.', 'Der Browser fragt Port 9090. Docker leitet weiter an Port 80 im Container.'] }
  ],
  selbsterklaerung: ['Warum steht bei <code>-p 9090:80</code> die 80 rechts und nicht links?', 'Warum steht die 80 rechts?'],
  satzanfaenge: [['80 steht rechts, weil …', '80 steht rechts, weil …'], ['Links steht immer …', 'Links steht …']],
  geschafftText: ['Schloss 2 ist offen: Du baust Images und setzt Ports.', 'Schloss 2 ist offen.'],
  faelle: [
    { id: 'r2a', typ: 'befehl', auftrag: ['Baue aus dem Dockerfile das Image <code>vereinsseite</code>.', 'Baue das Image <code>vereinsseite</code>.'], loesung: ['docker build -t vereinsseite .'],
      ziel: function (h, r) { return r.gebaut === 'vereinsseite'; },
      falsch: function (r) { return r.fehler === 'buildPunkt' ? ['Der Punkt fehlt: Er sagt Docker, dass Dockerfile und index.html hier im Ordner liegen.', 'Der Punkt fehlt. Der Punkt heißt: Die Dateien sind hier im Ordner.'] : null; },
      tipp: ['Wie bei Jana: <code>docker build -t NAME .</code>', 'Schreibe: <code>docker build -t vereinsseite .</code>'] },
    { id: 'r2b', typ: 'befehl', auftrag: ['Starte einen Container <code>tsv</code> aus <code>vereinsseite</code> im Hintergrund, erreichbar unter <code>localhost:8080</code>.', 'Starte den Container <code>tsv</code>. Er soll unter <code>localhost:8080</code> erreichbar sein.'],
      loesung: ['docker run -d -p 8080:80 --name tsv vereinsseite'],
      ziel: function (h) { return laeuftMit(h, 'tsv', '8080:80'); },
      falsch: function (r, z) { return /-p\s+80:8080/.test(z) ? ['Der Container läuft – aber das Schild zeigt <code>80 → 8080</code>. Im Container hört nginx auf 80, nicht auf 8080. Lösche ihn mit <code>docker rm -f tsv</code> und starte richtig herum.', 'Die Zahlen sind vertauscht. Links der Rechner (8080), rechts der Container (80). Lösche mit <code>docker rm -f tsv</code>. Dann neu starten.'] : r.fehler === 'konflikt' ? ['Den Namen <code>tsv</code> gibt es schon. Lösche den alten Container zuerst mit <code>docker rm -f tsv</code>.', 'Den Namen gibt es schon. Lösche zuerst: <code>docker rm -f tsv</code>.'] : null; },
      teil: function (h, r) { return r.geloescht && r.geloescht.length ? ['Der alte Container ist weg. Jetzt neu starten.', 'Der alte Container ist weg. Jetzt neu starten.'] : null; },
      tipp: ['<code>docker run -d -p HOST:CONTAINER --name tsv vereinsseite</code> – nginx hört im Container auf 80.', 'Schreibe: <code>docker run -d -p 8080:80 --name tsv vereinsseite</code>'] },
    { id: 'r2c', typ: 'eigen', auftrag: ['Öffne die Vereinsseite im Browser.', 'Öffne die Seite im Browser.'],
      zeichne: browserFall({ start: 'http://localhost:', ziel: function (r) { return r.ok && r.port === '8080'; }, tipp: ['Welchen Host-Port hast du beim Start angegeben?', 'Nimm den Port links: 8080.'],
        falsch: function (r) { return r.port === '80' ? ['Port 80 ist der Port <b>im Container</b>. Der Browser fragt den <b>Host</b> – also 8080.', 'Port 80 ist im Container. Der Browser braucht den Port vom Rechner: 8080.'] : null; } }),
      loese: function () {} },
    { id: 'r2d', typ: 'befehl', auftrag: ['Tomás möchte „<b>Herzlich</b> willkommen“. Jana hat <code>index.html</code> schon geändert. Sorge dafür, dass die neue Seite unter <code>localhost:8080</code> erscheint.', 'Tomás will „<b>Herzlich</b> willkommen“. Die Datei ist schon geändert. Die neue Seite soll unter <code>localhost:8080</code> erscheinen.'],
      vorherTun: function (h) { h.projekt.dateien['index.html'] = SEITE.tsv2; h.projekt.seite = SEITE.tsv2; },
      loesung: ['docker rm -f tsv', 'docker build -t vereinsseite .', 'docker run -d -p 8080:80 --name tsv vereinsseite'],
      ziel: function (h) { var r = hostBrowse(h, 'http://localhost:8080'); return r.ok && r.seite === SEITE.tsv2; },
      teil: function (h, r) { return r.gebaut ? ['Neues Image gebaut. Läuft schon ein Container damit?', 'Das Image ist neu. Läuft der neue Container schon?'] : r.geloescht && r.geloescht.length ? ['Alter Container gelöscht.', 'Der alte Container ist weg.'] : null; },
      falsch: function (r) { return r.neustart || r.gestartet ? ['Der Browser zeigt noch die alte Seite: Der Container nutzt das <b>alte Image</b>. Erst neu bauen, dann den Container neu erstellen.', 'Noch die alte Seite. Der Container hat das alte Image. Erst neu bauen. Dann neu starten.'] : null; },
      tipp: ['Reihenfolge: <code>docker build …</code> → <code>docker rm -f tsv</code> → <code>docker run …</code>', 'Neu bauen, alten Container löschen, neu starten.'],
      zeichne: browserFall({ start: 'http://localhost:8080', still: true, ziel: function (r) { return r.ok && r.seite === SEITE.tsv2; }, tipp: ['Noch die alte Version.', 'Noch die alte Seite.'] }) },
    { id: 'r2e', typ: 'befehl', auftrag: ['Die Jugendabteilung will eine zweite Kopie: Container <code>tsv2</code>, erreichbar unter <code>localhost:8081</code>.', 'Die Jugend will eine 2. Seite: Container <code>tsv2</code> unter <code>localhost:8081</code>.'],
      loesung: ['docker run -d -p 8081:80 --name tsv2 vereinsseite'],
      ziel: function (h) { return laeuftMit(h, 'tsv2', '8081:80'); },
      falsch: function (r) { return r.fehler === 'portBelegt' ? ['<code>port is already allocated</code>: Port 8080 gehört schon dem Container <code>tsv</code>. Nimm einen freien Host-Port.', 'Port 8080 ist schon belegt. Nimm 8081.'] : null; },
      tipp: ['Gleiches Image, anderer Name, anderer Host-Port.', 'Schreibe: <code>docker run -d -p 8081:80 --name tsv2 vereinsseite</code>'] },
    { id: 'r2f', typ: 'wahl', auftrag: ['Welcher Container antwortet unter <code>localhost:8081</code>?', 'Welcher Container antwortet unter <code>localhost:8081</code>?'],
      optionen: [{ t: ['<code>tsv2</code> – sein Schild zeigt <code>8081 → 80</code>', '<code>tsv2</code>'], richtig: true },
        { t: ['<code>tsv</code> – er ist der erste Container', '<code>tsv</code>'], fb: ['Die Reihenfolge zählt nicht. Entscheidend ist die linke Zahl auf dem Schild: Bei <code>tsv</code> steht 8080.', 'Die Reihenfolge zählt nicht. Schau auf die linke Zahl. Bei <code>tsv</code> steht 8080.'] },
        { t: ['beide abwechselnd', 'beide abwechselnd'], fb: ['Ein Host-Port gehört genau einem Container. Ohne Load-Balancer wird nichts verteilt.', 'Ein Port gehört nur 1 Container.'] }] },
    { id: 'r2g', typ: 'wahl', auftrag: ['Du baust ohne Änderung noch einmal. Im Terminal steht <code>CACHED</code>. Was heißt das?', 'Du baust noch einmal ohne Änderung. Im Terminal steht <code>CACHED</code>. Was heißt das?'],
      optionen: [{ t: ['Unveränderte Schichten (Layer) kommen aus dem Zwischenspeicher – darum geht es schneller.', 'Docker nimmt gespeicherte Schichten. Darum geht es schneller.'], richtig: true },
        { t: ['Docker hat den alten Container gespeichert.', 'Docker hat den alten Container gespeichert.'], fb: ['Der Cache gehört zum <b>Image-Bau</b>, nicht zum Container. Unveränderte Layer werden wiederverwendet.', 'Der Cache gehört zum Bauen vom Image. Nicht zum Container.'] },
        { t: ['Der Build ist fehlgeschlagen.', 'Das Bauen hat nicht geklappt.'], fb: ['Der Build ist erfolgreich – er spart nur Arbeit, weil sich nichts geändert hat.', 'Das Bauen hat geklappt. Docker spart nur Arbeit.'] }] }
  ],
  ticket: [
    { id: 'r2t1', typ: 'befehl', ticket: true, auftrag: ['Tomás: „Die Senioren wollen auch eine Seite. Mein Neffe hat <code>docker run -d -p 8080:80 --name senioren vereinsseite</code> getippt – jetzt kommt ein Fehler!“ Starte <code>senioren</code> richtig.', 'Tomás: „Die Senioren wollen auch eine Seite. Es kommt ein Fehler!“ Starte <code>senioren</code> richtig.'],
      loesung: ['docker run -d -p 8082:80 --name senioren vereinsseite'],
      ziel: function (h) { return h.container.some(function (c) { return c.name === 'senioren' && c.status === 'up' && /^\d+:80$/.test(c.ports[0] || ''); }); },
      falsch: function (r) { return r.fehler === 'portBelegt' ? ['Genau der Fehler des Neffen: Der Host-Port ist schon belegt.', 'Der Port ist schon belegt.'] : null; },
      tipp: ['8080 und 8081 sind belegt. Nimm z. B. 8082 – rechts bleibt 80.', 'Nimm Port 8082. Rechts bleibt 80.'] }
  ],
  beruf: ['So stellt ihr im Betrieb jede Webanwendung bereit. Port-Fehler sind die häufigste Ursache für „Die Seite geht nicht“.', 'So stellt man im Betrieb Webseiten bereit. Oft geht eine Seite nicht wegen der Ports.'],
  vmBefehle: ['cd exercises/2_webserver', 'docker build -t steckbrief .', 'docker run -d -p 8080:80 --name steckbrief steckbrief', '# Browser: http://localhost:8080', '# index.html ändern → neu bauen und neu starten', 'docker rm -f steckbrief', 'docker run -d -p 8081:80 --name steckbrief2 steckbrief']
});

/* ---------- Raum 3: Daten, die bleiben ---------- */
RAEUME.push({ id: 'S3', nr: 3, titel: ['Raum 3 · Daten, die bleiben', 'Raum 3 · Daten, die bleiben'], vm: 'Übung 3 Daten',
  auftrag: ['Der Verein will Fotos und Listen speichern. Finde heraus, wo Daten einen gelöschten Container überleben.', 'Der Verein will Fotos speichern. Sie dürfen nicht verloren gehen. Wo bleiben Daten sicher?'],
  regeln: [
    ['Container sind <b>ephemer</b>: Was nur im Container liegt, ist mit dem Container weg.', 'Daten <b>nur im Container</b> sind weg, wenn der Container weg ist.'],
    ['<b>Named Volume:</b> links nur ein Name (<code>vereinsdaten:/daten</code>). Docker verwaltet den Speicher. Gut für Datenbanken.', '<b>Volume:</b> links steht nur ein Name. Docker verwaltet den Speicher. Gut für Datenbanken.'],
    ['<b>Bind Mount:</b> links ein Pfad (<code>./fotos:/daten</code>, <code>"$(pwd)/fotos":/daten</code>). Die Dateien liegen sichtbar auf dem Host. Gut für Fotos.', '<b>Bind Mount:</b> links steht ein Pfad. Die Dateien liegen auf dem Rechner. Gut für Fotos.'],
    ['<code>:ro</code> am Ende = nur lesen (read only).', '<code>:ro</code> heißt: nur lesen.'],
    ['Im Container (<code>root@…#</code>) gibt es kein <code>docker</code>. Mit <code>exit</code> kommst du hinaus.', 'Im Container gibt es kein <code>docker</code>. Mit <code>exit</code> gehst du hinaus.']
  ],
  bausteine: ['docker', 'run', '-it', '--rm', '-v', 'ubuntu:22.04', 'vereinsdaten:/daten', '"$(pwd)/fotos":/daten', 'volume', 'create', 'vereinsdaten', 'rm', 'echo "Hallo" >', '/daten/mitglieder.txt', 'touch', '/daten/turnier.jpg', 'exit', 'ls', 'fotos'],
  setup: function (h) { h.images['ubuntu:22.04'] = { name: 'ubuntu', tag: '22.04', id: REGISTRY['ubuntu:22.04'].id, groesse: '77.9MB' }; h.ordner = { '/home/azubi/fotos': {} }; },
  demoText: ['Jana zeigt dir mit ihrer Einkaufsliste, was mit Dateien im Container passiert.', 'Jana zeigt es mit einer Einkaufsliste.'],
  begruessung: ['Raum 3: Im Ordner liegt ein leerer Ordner fotos/.', 'Raum 3: Es gibt einen leeren Ordner fotos/.'],
  demo: [
    { cmd: 'docker run -it --rm ubuntu:22.04', warum: ['Jetzt ist Jana <b>im</b> Container – der Prompt beginnt mit <code>root@…#</code>.', 'Jana ist jetzt <b>im</b> Container. Der Prompt beginnt mit <code>root@…#</code>.'] },
    { cmd: 'echo "Kaffee" > /liste.txt', warum: ['Die Datei liegt im Dateisystem des Containers.', 'Die Datei ist im Container.'] },
    { cmd: 'exit', warum: ['<code>--rm</code> löscht den Container beim Beenden – mit allem, was darin lag.', '<code>--rm</code> löscht den Container. Alles darin ist weg.'] },
    { cmd: 'docker run -it --rm -v einkauf:/daten ubuntu:22.04', warum: ['Diesmal mit Volume <code>einkauf</code> unter <code>/daten</code>.', 'Diesmal mit dem Volume <code>einkauf</code>.'] },
    { cmd: 'echo "Kaffee" > /daten/liste.txt', warum: ['Die Datei landet im Volume – rechts im Server zu sehen.', 'Die Datei ist jetzt im Volume. Schau rechts.'], selbst: true,
      antwort: ['Das Volume gehört nicht zum Container. Wird der Container gelöscht, bleibt das Volume mit der Datei stehen.', 'Das Volume gehört nicht zum Container. Es bleibt. Die Datei auch.'] },
    { cmd: 'exit', warum: ['Container weg – das Volume <code>einkauf</code> mit <code>liste.txt</code> bleibt.', 'Der Container ist weg. Das Volume bleibt.'] }
  ],
  selbsterklaerung: ['Warum ist die Liste im Volume noch da, obwohl der Container gelöscht wurde?', 'Warum ist die Liste im Volume noch da?'],
  satzanfaenge: [['Die Datei bleibt, weil das Volume …', 'Die Datei bleibt, weil …'], ['Der Container …, das Volume …', 'Der Container …, das Volume …']],
  geschafftText: ['Schloss 3 ist offen: Du weißt, wo Daten bleiben.', 'Schloss 3 ist offen.'],
  faelle: [
    { id: 'r3a', typ: 'wahl', auftrag: ['Vorhersage: Container <b>ohne</b> Volume, Datei anlegen, Container löschen, neuen Container starten. Ist die Datei da?', 'Container <b>ohne</b> Volume. Datei anlegen. Container löschen. Neuer Container. Ist die Datei da?'],
      optionen: [{ t: ['Nein – sie lag nur im gelöschten Container.', 'Nein. Sie war nur im alten Container.'], richtig: true },
        { t: ['Ja – es ist ja dasselbe Image.', 'Ja. Es ist dasselbe Image.'], fb: ['Das Image ändert sich nie. Die Datei lag nur im Container – und der ist weg.', 'Das Image ändert sich nicht. Die Datei war nur im Container.'] }] },
    { id: 'r3b', typ: 'befehl', auftrag: ['Lege das Volume <code>vereinsdaten</code> an und speichere darin <code>mitglieder.txt</code> – über einen Container mit <code>-v vereinsdaten:/daten</code>. Am Ende mit <code>exit</code> hinaus.', 'Lege das Volume <code>vereinsdaten</code> an. Speichere darin <code>mitglieder.txt</code>. Nimm <code>-v vereinsdaten:/daten</code>. Dann <code>exit</code>.'],
      loesung: ['docker volume create vereinsdaten', 'docker run -it --rm -v vereinsdaten:/daten ubuntu:22.04', 'echo "Mitglieder" > /daten/mitglieder.txt', 'exit'],
      ziel: function (h) { return !h.shell && !!h.volumes.vereinsdaten && h.volumes.vereinsdaten['mitglieder.txt'] !== undefined; },
      teil: function (h, r) { return r.volume ? ['Volume angelegt. Jetzt einen Container damit starten.', 'Das Volume ist da. Starte jetzt einen Container.'] : h.shell && r.gestartet ? ['Du bist im Container. Speichere die Datei unter /daten.', 'Du bist im Container. Speichere die Datei in /daten.'] : r.geschrieben && r.mount ? ['Gespeichert im Volume. Jetzt exit.', 'Gespeichert. Jetzt exit.'] : null; },
      falsch: function (r, z, h) { return r.exit && !(h.volumes.vereinsdaten || {})['mitglieder.txt'] ? ['Die Datei ist mit dem Container verschwunden: Sie lag nicht in <code>/daten</code>. Nur was im eingehängten Ordner liegt, landet im Volume.', 'Die Datei ist weg. Sie war nicht in <code>/daten</code>.'] : r.geschrieben && !r.mount ? ['Achtung: <code>' + r.geschrieben + '</code> liegt im Container, nicht im Volume. Schreib nach <code>/daten/…</code>.', 'Achtung: Die Datei ist nicht im Volume. Schreibe nach <code>/daten/…</code>.'] : null; },
      tipp: ['<code>docker volume create vereinsdaten</code> → <code>docker run -it --rm -v vereinsdaten:/daten ubuntu:22.04</code> → <code>echo "…" > /daten/mitglieder.txt</code> → <code>exit</code>', 'Erst das Volume anlegen. Dann Container mit <code>-v vereinsdaten:/daten</code>. Datei nach <code>/daten/</code>. Dann exit.'] },
    { id: 'r3c', typ: 'befehl', auftrag: ['Binde den Host-Ordner <code>fotos</code> ein und lege darin <code>turnier.jpg</code> an. Prüfe danach auf dem Host mit <code>ls fotos</code>.', 'Binde den Ordner <code>fotos</code> ein. Lege <code>turnier.jpg</code> an. Prüfe dann mit <code>ls fotos</code>.'],
      loesung: ['docker run -it --rm -v "$(pwd)/fotos":/daten ubuntu:22.04', 'touch /daten/turnier.jpg', 'exit', 'ls fotos'],
      ziel: function (h, r) { return !h.shell && r.ls === 'fotos' && (h.ordner['/home/azubi/fotos'] || {})['turnier.jpg'] !== undefined; },
      teil: function (h, r) { return (h.ordner['/home/azubi/fotos'] || {})['turnier.jpg'] !== undefined ? (h.shell ? ['Datei liegt im Ordner. Jetzt exit und auf dem Host nachsehen.', 'Die Datei ist da. Jetzt exit. Dann <code>ls fotos</code>.'] : ['Fast: Prüfe jetzt mit <code>ls fotos</code>.', 'Prüfe jetzt mit <code>ls fotos</code>.']) : h.shell && r.gestartet && h.shell.c.mounts.some(function (m) { return m.art === 'bind'; }) ? ['Der Ordner ist eingebunden. Lege die Datei in /daten an.', 'Der Ordner ist da. Lege die Datei in /daten an.'] : null; },
      falsch: function (r) { return r.gestartet && r.gestartet.mounts.some(function (m) { return m.art === 'volume' && m.name === 'fotos'; }) ? ['Ohne Pfad links ist <code>fotos</code> ein <b>Named Volume</b>, nicht dein Ordner – schau rechts im Server. Geh mit <code>exit</code> hinaus und nimm <code>"$(pwd)/fotos"</code> oder <code>./fotos</code>.', 'Ohne Pfad ist <code>fotos</code> ein Volume. Nicht dein Ordner. Mach exit. Nimm <code>./fotos</code>.'] : null; },
      tipp: ['Links muss ein <b>Pfad</b> stehen: <code>-v "$(pwd)/fotos":/daten</code>', 'Links steht ein Pfad: <code>-v ./fotos:/daten</code>'] },
    { id: 'r3d', typ: 'eigen', auftrag: ['Sortiere: Named Volume oder Bind Mount?', 'Sortiere: Volume oder Bind Mount?'],
      zeichne: sortierFall({ faecher: [{ id: 'v', titel: ['🗄️ Volume', '🗄️ Volume'] }, { id: 'b', titel: ['📁 Bind Mount', '📁 Bind Mount'] }],
        karten: [{ html: 'pgdata:/var/lib/postgresql/data', ziel: 'v' }, { html: './library:/data', ziel: 'b' }, { html: '/home/tsv/archiv:/mnt/import:ro', ziel: 'b' }, { html: 'model-cache:/cache', ziel: 'v' }],
        tipp: ['Schau nur auf den Anfang links: <code>/</code> oder <code>./</code> = Pfad = Bind Mount.', 'Beginnt es mit <code>/</code> oder <code>./</code>? Dann ist es ein Bind Mount.'] }),
      loese: function () {} },
    { id: 'r3e', typ: 'wahl', auftrag: ['Für die Foto-Cloud: Was nimmst du für die <b>Datenbank</b>, was für die <b>Fotos</b>?', 'Was nimmst du für die <b>Datenbank</b>? Was für die <b>Fotos</b>?'],
      optionen: [{ t: ['Datenbank → Named Volume, Fotos → Bind Mount', 'Datenbank: Volume. Fotos: Bind Mount.'], richtig: true },
        { t: ['Beides Bind Mount', 'Beides Bind Mount'], fb: ['Die Datenbankdateien fasst niemand direkt an – Docker soll sie verwalten (unter Windows/WSL ist das sogar Pflicht). Fotos willst du sehen und sichern: Bind Mount.', 'Die Datenbank fasst niemand an. Docker soll sie verwalten. Fotos willst du sehen: Bind Mount.'] },
        { t: ['Datenbank → Bind Mount, Fotos → Named Volume', 'Datenbank: Bind Mount. Fotos: Volume.'], fb: ['Genau umgekehrt: Fotos willst du auf dem Host sehen und sichern, die Datenbank ist App-intern.', 'Genau umgekehrt.'] }] },
    { id: 'r3f', typ: 'wahl', auftrag: ['Die alten Vereinsfotos sollen eingebunden werden – Immich darf sie aber <b>nicht verändern</b>. Welche Zeile?', 'Die alten Fotos sollen in Immich. Immich darf sie <b>nicht ändern</b>. Welche Zeile?'],
      optionen: [{ t: ['<code>/home/tsv/archiv:/mnt/import:ro</code>', '<code>/home/tsv/archiv:/mnt/import:ro</code>'], richtig: true },
        { t: ['<code>/home/tsv/archiv:/mnt/import</code>', '<code>/home/tsv/archiv:/mnt/import</code>'], fb: ['Ohne Zusatz darf der Container schreiben und löschen.', 'So darf der Container auch löschen.'] },
        { t: ['<code>archiv:/mnt/import:ro</code>', '<code>archiv:/mnt/import:ro</code>'], fb: ['<code>archiv</code> ohne Pfad ist ein neues, leeres Named Volume – nicht der Ordner mit den Fotos.', 'Ohne Pfad ist es ein neues Volume. Nicht der Ordner.'] }] },
    { id: 'r3g', typ: 'befehl', auftrag: ['Räum auf: Lösche das Volume <code>vereinsdaten</code>.', 'Räum auf. Lösche das Volume <code>vereinsdaten</code>.'],
      vorherTun: function (h) { h.volumes.vereinsdaten = h.volumes.vereinsdaten || { 'mitglieder.txt': 'Mitglieder' }; },
      loesung: ['docker volume rm vereinsdaten'], ziel: function (h) { return !h.volumes.vereinsdaten; },
      falsch: function (r, z) { return /^docker\s+rm\b/.test(z) ? ['<code>docker rm</code> löscht Container. Volumes löscht <code>docker volume rm</code>.', '<code>docker rm</code> ist für Container. Für Volumes: <code>docker volume rm</code>.'] : null; },
      tipp: ['Volumes haben eigene Befehle: <code>docker volume …</code>', 'Schreibe: <code>docker volume rm vereinsdaten</code>'] }
  ],
  ticket: [
    { id: 'r3t1', typ: 'wahl', ticket: true, auftrag: ['Tomás: „Wir haben den Container neu gestartet – alle Mitgliedslisten sind weg! Befehl war: <code>docker run -d --name liste listenapp</code>.“ Wie hätte der Befehl lauten müssen?', 'Tomás: „Alle Listen sind weg!“ Befehl war: <code>docker run -d --name liste listenapp</code>. Was ist richtig?'],
      optionen: [{ t: ['<code>docker run -d -v listen:/app/data --name liste listenapp</code>', '<code>docker run -d -v listen:/app/data --name liste listenapp</code>'], richtig: true },
        { t: ['<code>docker run -d --rm --name liste listenapp</code>', '<code>docker run -d --rm --name liste listenapp</code>'], fb: ['<code>--rm</code> löscht den Container beim Beenden – dann sind die Listen noch schneller weg.', '<code>--rm</code> löscht den Container. Dann sind die Listen auch weg.'] },
        { t: ['<code>docker run -d -p 8080:80 --name liste listenapp</code>', '<code>docker run -d -p 8080:80 --name liste listenapp</code>'], fb: ['Ein Port macht den Dienst erreichbar – speichert aber keine Daten.', 'Ein Port speichert keine Daten.'] }] }
  ],
  beruf: ['Datenverlust ist der teuerste Fehler bei Servern. Die Wahl des Speichers entscheidet, was ein Update überlebt.', 'Datenverlust ist sehr teuer. Der richtige Speicher schützt die Daten.'],
  vmBefehle: ['docker run -it --rm ubuntu:22.04', 'docker volume create meine-daten', 'docker run -it --rm -v meine-daten:/daten ubuntu:22.04', 'mkdir ordner', 'docker run -it --rm -v "$(pwd)/ordner":/daten ubuntu:22.04', 'cat ordner/gruss.txt', 'docker volume rm meine-daten']
});

/* ---------- Raum 4: Drei Dienste, eine Datei ---------- */
var COMPOSE_U4 = '# Übung 4 – Vereinsseite, Datenbank, Adminer\nservices:\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: {{pw}}\n    volumes:\n      - {{vol}}:/var/lib/postgresql/data\n    healthcheck:\n      test: ["CMD", "pg_isready", "-U", "postgres"]\n\n  adminer:\n    image: adminer\n    ports:\n      - "{{port}}:8080"\n    depends_on:\n      db:\n        condition: {{cond}}\n\n  web:\n    build: {{build}}\n    ports:\n      - "8080:80"\n\nvolumes:\n  {{vol2}}:';
function composeU4(h, projekt) {
  h.projekt = { dateien: { 'docker-compose.yml': '(Lückentext)', '.env.example': 'DB_PASSWORD=Azubi2026' } };
  h.compose = { projekt: projekt || 'uebung', werte: {}, gespeichert: false, envVars: ['DB_PASSWORD'],
    dienste: function (wt) { return [{ dienst: 'db', image: 'postgres:16-alpine', volume: wt.vol || 'pgdata', brauchtEnv: true, health: true },
      { dienst: 'adminer', image: 'adminer', ports: [(wt.port || '8081') + ':8080'], port: 8080, seite: 'adminer' },
      { dienst: 'web', image: 'uebung-web', ports: ['8080:80'], seite: SEITE.tsv2 }]; } };
}
function composeFertig(h) { h.compose.werte = { pw: '${DB_PASSWORD}', vol: 'pgdata', port: '8081', cond: 'service_healthy', build: '../2_webserver', vol2: 'pgdata' }; h.compose.gespeichert = true; }
function adminerFall() {
  return function (box, ctx) {
    rwStil();
    var E = KIT.el, h = ctx.host(), r = hostBrowse(h, 'http://localhost:8081');
    if (!r.ok) { box.appendChild(E('div', { class: 'sr-browser', html: '<div class="seite fehl">' + r.fehler + '</div>' })); return; }
    var srv = E('input', { type: 'text', id: 'sr-adm-srv', value: '', spellcheck: 'false' }), usr = E('input', { type: 'text', id: 'sr-adm-usr', value: 'postgres' }), pw = E('input', { type: 'password', id: 'sr-adm-pw', value: 'Azubi2026' });
    var meld = E('div');
    var form = E('div', { class: 'sr-form' }, [E('label', { text: 'System' }), E('select', {}, [E('option', { text: 'PostgreSQL' })]), E('label', { for: 'sr-adm-srv', text: 'Server' }), srv, E('label', { for: 'sr-adm-usr', text: 'Benutzer' }), usr, E('label', { for: 'sr-adm-pw', text: L('Passwort (aus der .env)', 'Passwort (aus .env)') }), pw,
      E('button', { type: 'button', style: 'margin-top:8px', text: L('Anmelden', 'Anmelden'), onclick: function () {
        var s = srv.value.trim();
        if (s === 'db') { meld.innerHTML = '<div class="sr-rueck ok">✔ PostgreSQL 16 » Server db » Datenbank postgres</div>'; ctx.ok(); return; }
        meld.innerHTML = '<div class="sr-rueck bad">SQLSTATE[08006] [7] connection to server at "' + KIT.esc(s || 'localhost') + '", port 5432 failed: Connection refused</div>';
        ctx.fehl(/^(localhost|127\.0\.0\.1)?$/.test(s) ? T(['Im Adminer-Container ist <code>localhost</code> Adminer selbst. Die Datenbank erreichst du über ihren <b>Service-Namen</b> aus der Compose-Datei.', '<code>localhost</code> ist Adminer selbst. Die Datenbank heißt so wie ihr Service in der Datei.']) : T(['Wie heißt der Datenbank-Service in der docker-compose.yml?', 'Wie heißt die Datenbank in der Datei?']));
      } }), meld]);
    box.appendChild(E('div', { class: 'sr-browser' }, [E('div', { class: 'bar' }, [E('span', { text: '🌐' }), E('input', { type: 'text', value: 'http://localhost:8081', readonly: 'readonly', 'aria-label': 'Adresse' })]), E('div', { class: 'seite' }, [E('b', { text: 'Adminer 4.8 – Login' }), form])]));
  };
}
RAEUME.push({ id: 'S4', nr: 4, titel: ['Raum 4 · Drei Dienste, eine Datei', 'Raum 4 · Drei Dienste, eine Datei'], vm: 'Übung 4 Compose',
  auftrag: ['Ab jetzt brauchen wir mehrere Container zusammen. Starte Vereinsseite, Datenbank und Adminer mit einer einzigen Datei.', 'Jetzt brauchen wir mehrere Container. Starte 3 Container mit 1 Datei.'],
  regeln: [
    ['Jeder Container ist ein <b>Service</b> in der <code>docker-compose.yml</code>. <code>docker compose up -d</code> startet alle.', 'Jeder Container ist ein <b>Service</b> in der Datei. <code>docker compose up -d</code> startet alle.'],
    ['Im Compose-Netz ist der <b>Service-Name</b> die Adresse: Adminer erreicht die Datenbank unter <code>db</code>. <code>localhost</code> ist im Container der Container selbst.', 'Der <b>Service-Name</b> ist die Adresse. Die Datenbank heißt <code>db</code>. <code>localhost</code> ist der Container selbst.'],
    ['Nur was von außen erreichbar sein muss, bekommt <code>ports:</code>. Die Datenbank nicht.', 'Nur was von außen erreichbar sein muss, bekommt <code>ports:</code>.'],
    ['<code>depends_on</code> mit <code>condition: service_healthy</code> wartet, bis die Datenbank „healthy“ ist.', '<code>service_healthy</code> wartet, bis die Datenbank bereit ist.'],
    ['<code>${DB_PASSWORD}</code> kommt aus der Datei <code>.env</code> – sie muss genau so heißen: <code>cp .env.example .env</code>.', '<code>${DB_PASSWORD}</code> kommt aus der Datei <code>.env</code>.'],
    ['<code>docker compose start</code> startet nur vorhandene Container. Beim ersten Mal: <code>up -d</code>.', 'Beim 1. Mal: <code>up -d</code>. Nicht <code>start</code>.'],
    ['<code>down</code> löscht Container, Volumes bleiben. <code>down -v</code> löscht <b>auch die Volumes</b>.', '<code>down</code>: Container weg, Volumes bleiben. <code>down -v</code>: auch Volumes weg.']
  ],
  bausteine: ['docker', 'compose', 'up', '-d', 'ps', 'down', '-v', 'start', 'logs', 'db', 'config', 'cp', '.env.example', '.env', 'ls'],
  setup: function (h) { composeU4(h); },
  demoReset: true,
  demoText: ['Jana zeigt dir den Ablauf mit einer fertigen Compose-Datei für das Hafenblick-Wiki.', 'Jana zeigt den Ablauf mit einer fertigen Datei.'],
  begruessung: ['Raum 4: Im Ordner liegen docker-compose.yml (mit Lücken) und .env.example.', 'Raum 4: Hier sind docker-compose.yml (mit Lücken) und .env.example.'],
  demo: [
    { tun: function (h) { composeU4(h, 'wiki'); composeFertig(h); }, text: ['Die fertige Datei', 'Die fertige Datei'], zeige: function (b) { b.appendChild(KIT.el('div', { class: 'sr-editor', text: 'services:\n  db:\n    image: postgres:16-alpine\n    volumes:\n      - wikidaten:/var/lib/postgresql/data\n  wiki:\n    ports:\n      - "8090:3000"\n    environment:\n      DB_HOST: db' })); rwStil(); },
      warum: ['Nur das Wiki bekommt <code>ports:</code>. Die DB spricht nur mit dem Wiki über das interne Netz.', 'Nur das Wiki bekommt <code>ports:</code>. Die Datenbank bleibt innen.'], selbst: true,
      antwort: ['<code>localhost</code> meint im Wiki-Container das Wiki selbst. Die Datenbank läuft in einem anderen Container – erreichbar über ihren Service-Namen <code>db</code>.', '<code>localhost</code> ist der Wiki-Container selbst. Die Datenbank ist ein anderer Container. Sie heißt <code>db</code>.'] },
    { cmd: 'cp .env.example .env', warum: ['Compose liest Variablen nur aus einer Datei, die genau <code>.env</code> heißt.', 'Compose liest nur die Datei <code>.env</code>.'] },
    { cmd: 'docker compose up -d', warum: ['Ein Befehl startet alle Services. Die DB meldet zuerst „Healthy“.', '1 Befehl startet alles.'] },
    { cmd: 'docker compose ps', warum: ['Alle Dienste laufen, die DB ist „healthy“.', 'Alles läuft. Die Datenbank ist bereit.'] }
  ],
  selbsterklaerung: ['Warum würde <code>DB_HOST: localhost</code> im Wiki nicht funktionieren?', 'Warum geht <code>DB_HOST: localhost</code> nicht?'],
  satzanfaenge: [['localhost meint im Container …', 'localhost ist …'], ['Die Datenbank erreicht man über …', 'Die Datenbank heißt …']],
  geschafftText: ['Schloss 4 ist offen: Du startest mehrere Dienste mit Compose.', 'Schloss 4 ist offen.'],
  faelle: [
    { id: 'r4a', typ: 'eigen', breit: true, auftrag: ['Fülle die Lücken in der <code>docker-compose.yml</code> und speichere.', 'Fülle die Lücken in der Datei. Dann speichern.'],
      zeichne: lueckenFall({ datei: 'docker-compose.yml', text: COMPOSE_U4,
        luecken: {
          pw: { optionen: ['${DB_PASSWORD}', 'DB_PASSWORD', 'Azubi2026'], richtig: '${DB_PASSWORD}', fb: { DB_PASSWORD: ['Ohne <code>${…}</code> steht der Text „DB_PASSWORD“ als Passwort drin.', 'Ohne <code>${…}</code> ist es nur Text.'], Azubi2026: ['Das Passwort gehört in die <code>.env</code>, nicht in die Compose-Datei (die landet oft im Git).', 'Das Passwort gehört in die <code>.env</code>.'] }, tipp: ['Variable aus der .env: <code>${NAME}</code>', 'Variable: <code>${NAME}</code>'] },
          vol: { optionen: ['pgdata', './pgdata', '/var/lib/postgresql/data'], richtig: 'pgdata', akzeptiert: ['pgdata'], fb: { './pgdata': ['Mit <code>./</code> wird es ein Bind Mount. Für die Datenbank wollen wir ein Named Volume.', 'Mit <code>./</code> ist es ein Bind Mount. Wir wollen ein Volume.'] }, tipp: ['Named Volume: nur ein Name, z. B. <code>pgdata</code>.', 'Nur ein Name: <code>pgdata</code>.'] },
          port: { optionen: ['8081', '8080', '5432'], richtig: '8081', fb: { '8080': ['8080 gehört schon dem Service <code>web</code>.', '8080 hat schon <code>web</code>.'], '5432': ['5432 ist der Datenbank-Port. Adminer soll unter 8081 erreichbar sein.', 'Adminer soll unter 8081 laufen.'] }, tipp: ['Host-Port laut Kommentar: 8081.', 'Nimm 8081.'] },
          cond: { optionen: ['service_healthy', 'service_started'], richtig: 'service_healthy', immerAuswahl: true, fb: { service_started: ['<code>service_started</code> wartet nur auf den Start, nicht bis die DB bereit ist.', '<code>service_started</code> wartet nicht, bis die Datenbank bereit ist.'] }, tipp: ['Warten bis „gesund“.', 'Warten bis bereit.'] },
          build: { optionen: ['../2_webserver', '../2_webserver/Dockerfile', 'steckbrief'], richtig: '../2_webserver', fb: { '../2_webserver/Dockerfile': ['<code>build:</code> nimmt den <b>Ordner</b> mit dem Dockerfile, nicht die Datei.', '<code>build:</code> braucht den Ordner.'], steckbrief: ['<code>build:</code> braucht einen Ordner. Ein fertiges Image stünde bei <code>image:</code>.', '<code>build:</code> braucht einen Ordner.'] }, tipp: ['Der Ordner aus Übung 2.', 'Der Ordner aus Übung 2.'] },
          vol2: { optionen: ['pgdata', 'volumes', 'db'], richtig: 'pgdata', fb: { db: ['Hier unten wird das Volume deklariert – also derselbe Name wie oben bei <code>db</code>.', 'Hier steht derselbe Name wie oben.'] }, tipp: ['Ein Named Volume muss unten unter <code>volumes:</code> noch einmal stehen.', 'Unten steht derselbe Name wie oben.'] }
        },
        speichern: function (h, werte) { h.compose.werte = werte; h.compose.gespeichert = true; } }),
      loese: function (h) { composeFertig(h); } },
    { id: 'r4b', typ: 'befehl', auftrag: ['Bereite die <code>.env</code> vor und starte den ganzen Stack.', 'Mach die <code>.env</code> fertig. Starte dann alles.'],
      loesung: ['cp .env.example .env', 'docker compose up -d'],
      ziel: function (h, r) { return !!r.up; },
      teil: function (h, r) { return r.kopiert === '.env' ? ['.env ist da. Jetzt starten.', '.env ist da. Jetzt starten.'] : null; },
      falsch: function (r) { return r.fehler === 'envFehlt' ? ['<code>variable is not set</code>: Die Datei <code>.env</code> fehlt – die Datenbank hat kein Passwort und stürzt ab. Erst <code>cp .env.example .env</code>, dann <code>up -d</code>.', 'Die Datei <code>.env</code> fehlt. Erst <code>cp .env.example .env</code>. Dann <code>up -d</code>.'] : r.fehler === 'keinStart' ? ['<code>start</code> startet nur Container, die es schon gibt. Beim ersten Mal: <code>docker compose up -d</code>.', 'Beim 1. Mal: <code>docker compose up -d</code>.'] : r.kopiert && r.kopiert !== '.env' ? ['Die Datei muss genau <code>.env</code> heißen.', 'Die Datei muss <code>.env</code> heißen.'] : null; },
      tipp: ['<code>cp .env.example .env</code>, dann <code>docker compose up -d</code>.', 'Erst <code>cp .env.example .env</code>. Dann <code>docker compose up -d</code>.'] },
    { id: 'r4c', typ: 'eigen', auftrag: ['Melde dich in Adminer an (<code>localhost:8081</code>).', 'Melde dich in Adminer an.'], zeichne: adminerFall(), loese: function () {} },
    { id: 'r4d', typ: 'befehl', auftrag: ['Jana hat in Adminer die Tabelle <code>mitglieder</code> angelegt. Führe <code>docker compose down</code> und dann wieder <code>up -d</code> aus. Ist sie noch da? Schau rechts auf das Volume.', 'Jana hat die Tabelle <code>mitglieder</code> angelegt. Mach <code>docker compose down</code>. Dann <code>up -d</code>. Schau rechts.'],
      vorherTun: function (h) { var v = 'uebung_' + (h.compose.werte.vol || 'pgdata'); h.volumes[v] = h.volumes[v] || {}; h.volumes[v]['mitglieder (Tabelle)'] = 1; },
      loesung: ['docker compose down', 'docker compose up -d'],
      ziel: function (h, r) { return !!r.up && h.compose.unten === 'ja' && !!h.volumes['uebung_pgdata']; },
      teil: function (h, r) { if (r.down && !r.mitV) { return ['Container sind weg – das Volume steht noch. Jetzt wieder <code>up -d</code>.', 'Die Container sind weg. Das Volume ist noch da. Jetzt <code>up -d</code>.']; } return null; },
      falsch: function (r, z, h) { if (r.mitV) { composeTabelle(h); return ['Mit <code>-v</code> ist das Volume samt Tabelle gelöscht! Hier nur <code>down</code> ohne <code>-v</code>. (Jana hat die Tabelle wiederhergestellt.)', 'Mit <code>-v</code> ist alles weg! Nimm nur <code>down</code>.']; } return null; },
      lob: ['Die Tabelle ist noch da: <code>down</code> löscht Container, nicht Volumes.', 'Die Tabelle ist noch da.'],
      tipp: ['Erst <code>docker compose down</code>, dann <code>docker compose up -d</code>.', 'Erst <code>docker compose down</code>. Dann <code>docker compose up -d</code>.'] },
    { id: 'r4e', typ: 'wahl', auftrag: ['Vorhersage: Was passiert nach <code>docker compose down -v</code> und <code>up -d</code>?', 'Was passiert nach <code>docker compose down -v</code> und <code>up -d</code>?'],
      optionen: [{ t: ['Die Tabelle ist weg – das Volume wurde mitgelöscht.', 'Die Tabelle ist weg.'], richtig: true },
        { t: ['Die Tabelle bleibt – Compose sichert sie.', 'Die Tabelle bleibt.'], fb: ['<code>-v</code> heißt „volumes“: Auch <code>uebung_pgdata</code> wird gelöscht. Nie auf dem echten Vereinsserver!', '<code>-v</code> löscht auch die Volumes.'] }] },
    { id: 'r4f', typ: 'wahl', auftrag: ['Jemand schreibt <code>depends_on: - db</code> ohne Bedingung. Was passiert beim Start?', '<code>depends_on: - db</code> ohne Bedingung. Was passiert?'],
      optionen: [{ t: ['Adminer startet, sobald die DB <b>gestartet</b> ist – auch wenn sie noch nicht bereit ist.', 'Adminer startet, wenn die Datenbank startet. Sie ist vielleicht noch nicht bereit.'], richtig: true },
        { t: ['Compose wartet, bis die DB bereit ist.', 'Compose wartet, bis die Datenbank bereit ist.'], fb: ['Das macht nur <code>condition: service_healthy</code>. Ohne Bedingung heißt es nur: vorher starten.', 'Das macht nur <code>service_healthy</code>.'] }] },
    { id: 'r4g', typ: 'wahl', auftrag: ['Warum hat <code>db</code> kein <code>ports:</code>?', 'Warum hat <code>db</code> kein <code>ports:</code>?'],
      optionen: [{ t: ['Nur Adminer und web sprechen mit der DB – über das interne Netz. Weniger offene Ports = weniger Angriffsfläche.', 'Nur die anderen Dienste reden mit der Datenbank. Innen. Das ist sicherer.'], richtig: true },
        { t: ['Das wurde vergessen – ohne Port startet die DB nicht.', 'Das wurde vergessen.'], fb: ['Die DB läuft ohne Port-Mapping. <code>ports:</code> braucht nur, wer von außen erreichbar sein soll.', 'Die Datenbank läuft auch ohne Port.'] }] }
  ],
  ticket: [
    { id: 'r4t1', typ: 'eigen', ticket: true, breit: true, auftrag: ['Tomás: „Ein Bekannter hat diese Datei geschrieben. Geht nicht.“ Finde die <b>drei</b> fehlerhaften Zeilen.', 'Tomás: „Die Datei geht nicht.“ Finde die <b>3</b> falschen Zeilen.'],
      zeichne: markierFall({ zeilen: [{ text: 'services:' }, { text: '  db:' }, { text: '    image: postgres:16-alpine' }, { text: '    ports:', fehler: 1 }, { text: '      - "5432:5432"', fehler: 1 }, { text: '  adminer:' }, { text: '    environment:' }, { text: '      ADMINER_DEFAULT_SERVER: localhost', fehler: 1 }, { text: '    depends_on:' }, { text: '      - db', fehler: 1 }] }),
      loese: function () {} }
  ],
  beruf: ['Fast jede echte Anwendung besteht aus mehreren Diensten. Compose ist die Bauanleitung, die ihr im Betrieb weitergebt.', 'Viele Anwendungen haben mehrere Dienste. Compose ist die Bauanleitung dafür.'],
  vmBefehle: ['cd exercises/4_compose', 'cp .env.example .env', 'nano docker-compose.yml   # ??? ersetzen', 'docker compose config', 'docker compose up -d', 'docker compose ps', '# http://localhost:8080 und http://localhost:8081 (Server: db)', 'docker compose down', 'docker compose up -d', 'docker compose down -v']
});
function composeTabelle(h) { h.volumes.uebung_pgdata = h.volumes.uebung_pgdata || {}; h.volumes.uebung_pgdata['mitglieder (Tabelle)'] = 1; }

/* ---------- Raum 5: Generalprobe Foto-Cloud ---------- */
var COMPOSE_IMMICH = 'name: immich\nservices:\n  immich-server:\n    image: ghcr.io/immich-app/immich-server:v3\n    volumes:\n      - {{upload}}:/data\n      - ${IMPORT_LOCATION}:/mnt/import:{{ro}}\n    ports:\n      - "{{port}}:2283"\n    depends_on:\n      database:\n        condition: {{h1}}\n      redis:\n        condition: {{h2}}\n\n  immich-machine-learning:\n    image: ghcr.io/immich-app/immich-machine-learning:v3\n    profiles: ["{{ml}}"]\n\n  redis:\n    image: valkey/valkey:9\n\n  database:\n    image: ghcr.io/immich-app/postgres:14-vectorchord\n    environment:\n      POSTGRES_PASSWORD: {{pw}}\n    volumes:\n      - {{vol}}:/var/lib/postgresql/data\n\nvolumes:\n  {{vol2}}:';
var IMMICH_SEITE = '<div style="display:flex;align-items:center;gap:8px"><b style="font-size:1.2rem">📸 Immich</b><small style="background:#fef3c7;padding:2px 6px;border-radius:6px">Übungsversion</small></div><p>Zeitleiste · Karte · Alben · Verwaltung</p>';
function composeImmich(h) {
  h.projekt = { dateien: { 'docker-compose.yml': '(Lückentext)', '.env.example': 'UPLOAD_LOCATION=./library\nIMPORT_LOCATION=./beispielbilder\nDB_PASSWORD=postgres' } };
  h.ordner['/home/azubi/immich/beispielbilder'] = { 'IMG_0412.jpg': 1, 'DSC01021.jpg': 1, 'PXL_20240415.jpg': 1 };
  h.compose = { projekt: 'immich', werte: {}, gespeichert: false, envVars: ['UPLOAD_LOCATION', 'IMPORT_LOCATION', 'DB_PASSWORD'],
    dienste: function (wt, hh, profil) {
      var d = [{ dienst: 'database', image: 'immich-postgres', volume: wt.vol || 'pgdata', brauchtEnv: true, health: true }, { dienst: 'redis', image: 'valkey:9', health: true },
        { dienst: 'immich-server', image: 'immich-server:v3', ports: [(wt.port || '2283') + ':2283'], port: 2283, seite: IMMICH_SEITE, bind: '/home/azubi/immich/library' }];
      if (profil === 'ml') d.push({ dienst: 'immich-machine-learning', image: 'immich-ml:v3' });
      return d;
    } };
}
function immichFertig(h) { h.compose.werte = { upload: '${UPLOAD_LOCATION}', ro: 'ro', port: '2283', h1: 'service_healthy', h2: 'service_healthy', ml: 'ml', pw: '${DB_PASSWORD}', vol: 'pgdata', vol2: 'pgdata' }; h.compose.gespeichert = true; }
RAEUME.push({ id: 'S5', nr: 5, titel: ['Raum 5 · Generalprobe Foto-Cloud', 'Raum 5 · Generalprobe Foto-Cloud'], vm: 'Abschlussprojekt Immich',
  auftrag: ['Jetzt wird’s echt: die Foto-Cloud für den TSV. Ergänze die Immich-Datei, starte sie und bring die alten Vereinsfotos hinein. Dann macht Kai die Tür auf.', 'Jetzt kommt die Foto-Cloud. Ergänze die Datei. Starte Immich. Hole die alten Fotos. Dann geht die Tür auf.'],
  regeln: [
    ['Fehlermeldung zuerst <b>lesen</b>: Sie nennt meist Variable, Port oder Service.', 'Lies zuerst die Fehlermeldung.'],
    ['Status bleibt <code>starting</code> oder <code>Exited</code>? → <code>docker compose logs &lt;service&gt;</code>.', 'Ein Dienst startet nicht? → <code>docker compose logs</code>.'],
    ['Im Browser <b><code>http://</code></b> tippen. <code>https://</code> ohne Zertifikat → <code>SSL_ERROR_RX_RECORD_TOO_LONG</code>.', 'Im Browser <b><code>http://</code></b> nehmen. Nicht <code>https://</code>.'],
    ['In der App gibst du <b>Container-Pfade</b> an (<code>/mnt/import</code>), nicht Host-Pfade.', 'In Immich nimmst du den Pfad <b>im Container</b>: <code>/mnt/import</code>.'],
    ['<code>.env</code> geändert? <code>docker compose up -d</code> erstellt die Container neu – <code>restart</code> nicht.', '<code>.env</code> geändert? Dann <code>up -d</code>. Nicht <code>restart</code>.'],
    ['Backup braucht beides: Ordner <code>library/</code> <b>und</b> die Datenbank.', 'Backup: Fotos <b>und</b> Datenbank.']
  ],
  bausteine: ['docker', 'compose', 'up', '-d', 'ps', 'logs', 'down', '-v', '--profile', 'ml', 'restart', 'cp', '.env.example', '.env', 'database'],
  setup: function (h) { composeImmich(h); },
  demoReset: true,
  demoText: ['Janas Test-Immich läuft noch und blockiert Port 2283. Schau, wie sie die Fehlermeldung liest.', 'Janas Test-Immich blockiert Port 2283. Schau, wie Jana den Fehler liest.'],
  begruessung: ['Raum 5: Ordner immich/ mit docker-compose.yml (Lücken), .env.example und beispielbilder/.', 'Raum 5: Hier sind die Immich-Datei (mit Lücken), .env.example und alte Fotos.'],
  demo: [
    { cmd: 'docker run -d -p 2283:2283 --name test-immich nginx:alpine', warum: ['(Janas alter Test-Container belegt Port 2283.)', '(Ein alter Test-Container hat Port 2283.)'] },
    { cmd: 'docker run -d -p 2283:2283 --name immich2 nginx:alpine', warum: ['Die Meldung nennt den Port: <code>Bind for 0.0.0.0:2283 failed: port is already allocated</code>.', 'Die Meldung nennt den Port 2283.'] },
    { cmd: 'docker ps', warum: ['<code>test-immich</code> hält Port 2283. Lösung: alten Container stoppen – oder links einen anderen Host-Port nehmen (<code>"2284:2283"</code>).', '<code>test-immich</code> hat Port 2283. Lösung: alten Container stoppen. Oder links einen anderen Port nehmen.'], selbst: true,
      antwort: ['Belegt ist der <b>Host</b>-Port links. Im Container hört Immich weiter auf 2283 – das bleibt rechts stehen.', 'Belegt ist der Port links (Rechner). Im Container bleibt 2283.'] }
  ],
  selbsterklaerung: ['Warum ändern wir bei <code>"2284:2283"</code> nur die linke Zahl?', 'Warum ändern wir nur die linke Zahl?'],
  satzanfaenge: [['Die linke Zahl ist …, darum …', 'Links ist …'], ['Im Container hört Immich …', 'Im Container …']],
  geschafftText: ['Schloss 5 ist offen: Die Foto-Cloud läuft!', 'Schloss 5 ist offen!'],
  faelle: [
    { id: 'r5a', typ: 'eigen', breit: true, auftrag: ['Fülle die Lücken in der Immich-<code>docker-compose.yml</code> und speichere.', 'Fülle die Lücken in der Immich-Datei. Dann speichern.'],
      zeichne: lueckenFall({ datei: 'immich/docker-compose.yml', text: COMPOSE_IMMICH,
        luecken: {
          upload: { optionen: ['${UPLOAD_LOCATION}', 'UPLOAD_LOCATION', 'library'], richtig: '${UPLOAD_LOCATION}', fb: { library: ['Ohne Pfad wäre <code>library</code> ein Named Volume. Die Fotos sollen in den Ordner aus der .env.', 'Ohne Pfad ist es ein Volume. Nimm die Variable aus .env.'] }, tipp: ['Variable aus der .env für den Foto-Ordner.', 'Variable: <code>${UPLOAD_LOCATION}</code>'] },
          ro: { optionen: ['ro', 'rw', 'root'], richtig: 'ro', fb: { rw: ['<code>rw</code> erlaubt Schreiben – Immich dürfte Originale ändern.', '<code>rw</code> erlaubt Schreiben.'], root: ['<code>ro</code> heißt read only – nicht „root“.', '<code>ro</code> heißt nur lesen.'] }, tipp: ['Schreibgeschützt = read only.', 'Nur lesen: <code>ro</code>'] },
          port: { optionen: ['2283', '443', '80'], richtig: '2283', tipp: ['Host-Port, unter dem Immich erreichbar sein soll: 2283.', 'Nimm 2283.'] },
          h1: { optionen: ['service_healthy', 'service_started'], richtig: 'service_healthy', immerAuswahl: true, fb: { service_started: ['Nur „gestartet“ reicht nicht – der Server soll warten, bis die DB bereit ist.', 'Warte, bis die Datenbank bereit ist.'] }, tipp: ['gesund = healthy', 'bereit = healthy'] },
          h2: { optionen: ['service_healthy', 'service_started'], richtig: 'service_healthy', immerAuswahl: true, fb: { service_started: ['Auch bei redis: warten, bis gesund.', 'Auch hier: healthy.'] }, tipp: ['gesund = healthy', 'bereit = healthy'] },
          ml: { optionen: ['ml', 'ki', 'machine-learning'], richtig: 'ml', tipp: ['Laut Anleitung startet die KI mit <code>--profile ml</code>.', 'Das Profil heißt <code>ml</code>.'] },
          pw: { optionen: ['${DB_PASSWORD}', 'postgres', 'DB_PASSWORD'], richtig: '${DB_PASSWORD}', fb: { postgres: ['Passwörter gehören in die .env, nicht in die Compose-Datei.', 'Das Passwort gehört in die .env.'] }, tipp: ['Passwort aus der .env.', 'Variable: <code>${DB_PASSWORD}</code>'] },
          vol: { optionen: ['pgdata', './pgdata'], richtig: 'pgdata', immerAuswahl: true, fb: { './pgdata': ['Die Datenbank bekommt ein Named Volume – unter Windows/WSL darf sie nicht auf einem Bind Mount liegen.', 'Die Datenbank bekommt ein Volume.'] }, tipp: ['Named Volume für die DB.', 'Volume: <code>pgdata</code>'] },
          vol2: { optionen: ['pgdata', 'database'], richtig: 'pgdata', immerAuswahl: true, tipp: ['Unten derselbe Volume-Name wie oben.', 'Unten derselbe Name.'] }
        },
        speichern: function (h, werte) { h.compose.werte = werte; h.compose.gespeichert = true; } }),
      loese: function (h) { immichFertig(h); } },
    { id: 'r5b', typ: 'wahl', auftrag: ['In der <code>.env</code> stellst du das DB-Passwort ein. Welches ist erlaubt?', 'Welches DB-Passwort ist in der <code>.env</code> erlaubt?'],
      optionen: [{ t: ['<code>TsvFotos2026</code>', '<code>TsvFotos2026</code>'], richtig: true },
        { t: ['<code>Tsv#Fotos!</code>', '<code>Tsv#Fotos!</code>'], fb: ['<code>#</code> leitet in der .env einen Kommentar ein, Sonderzeichen machen Ärger. Nur A–Z, a–z, 0–9!', '<code>#</code> und <code>!</code> machen Ärger. Nur Buchstaben und Ziffern.'] },
        { t: ['<code>fotos$2026</code>', '<code>fotos$2026</code>'], fb: ['<code>$</code> wird als Variable gelesen – das Passwort kommt verstümmelt an. Nur Buchstaben und Ziffern.', '<code>$</code> macht Ärger. Nur Buchstaben und Ziffern.'] }] },
    { id: 'r5c', typ: 'befehl', auftrag: ['Bereite die <code>.env</code> vor und starte Immich (ohne KI).', 'Mach die <code>.env</code> fertig. Starte Immich.'],
      loesung: ['cp .env.example .env', 'docker compose up -d'],
      ziel: function (h, r) { return !!r.up; },
      teil: function (h, r) { return r.kopiert === '.env' ? ['.env ist da. Jetzt starten.', '.env ist da. Jetzt starten.'] : null; },
      falsch: function (r) { return r.fehler === 'envFehlt' ? ['<code>variable is not set</code> – die <code>.env</code> fehlt.', 'Die <code>.env</code> fehlt.'] : r.fehler === 'keinStart' ? ['Beim ersten Mal: <code>up -d</code>, nicht <code>start</code>.', 'Beim 1. Mal: <code>up -d</code>.'] : null; },
      tipp: ['<code>cp .env.example .env</code> → <code>docker compose up -d</code>', 'Erst <code>cp .env.example .env</code>. Dann <code>docker compose up -d</code>.'] },
    { id: 'r5d', typ: 'eigen', auftrag: ['Öffne Immich im Browser.', 'Öffne Immich im Browser.'],
      zeichne: browserFall({ start: 'https://localhost:2283', ziel: function (r) { return r.ok && r.port === '2283'; }, tipp: ['Port 2283 – und welches Protokoll?', 'Port 2283. Mit http.'],
        falsch: function (r) { return r.ssl ? ['<code>SSL_ERROR_RX_RECORD_TOO_LONG</code>: Immich spricht hier nur <b>http</b>. Tippe <code>http://localhost:2283</code>.', 'Immich spricht nur <b>http</b>. Tippe <code>http://localhost:2283</code>.'] : null; } }),
      loese: function () {} },
    { id: 'r5e', typ: 'wahl', auftrag: ['In Immich: <b>Verwaltung → Externe Bibliotheken → Ordner hinzufügen</b>. Welcher Pfad?', 'In Immich: Externe Bibliothek. Welcher Pfad?'],
      optionen: [{ t: ['<code>/mnt/import</code>', '<code>/mnt/import</code>'], richtig: true },
        { t: ['<code>/home/azubi/immich/beispielbilder</code>', '<code>/home/azubi/immich/beispielbilder</code>'], fb: ['Das ist der Pfad auf dem <b>Host</b>. Immich läuft im Container und sieht den Ordner unter <code>/mnt/import</code>. Die Bibliothek bliebe leer.', 'Das ist der Pfad auf dem Rechner. Immich sieht nur <code>/mnt/import</code>.'] },
        { t: ['<code>./beispielbilder</code>', '<code>./beispielbilder</code>'], fb: ['Relative Host-Pfade kennt Immich im Container nicht.', 'Diesen Pfad kennt Immich nicht.'] }] },
    { id: 'r5f', typ: 'befehl', auftrag: ['Neue Immich-Version: Jana hat <code>IMMICH_VERSION</code> in der <code>.env</code> geändert. Übernimm die Änderung.', 'Jana hat die <code>.env</code> geändert. Übernimm die Änderung.'],
      vorherTun: function (h) { h.envVersion = 2; },
      loesung: ['docker compose up -d'], ziel: function (h, r) { return !!r.up; },
      falsch: function (r) { return r.restart ? ['<code>restart</code> startet die alten Container mit der alten Einstellung. Nur <code>up -d</code> erstellt geänderte Container neu.', '<code>restart</code> nimmt die alte Einstellung. Nimm <code>up -d</code>.'] : null; },
      lob: ['<code>up -d</code> hat die geänderten Container neu erstellt.', 'Die Container sind neu.'],
      tipp: ['Derselbe Befehl wie beim ersten Start.', 'Schreibe: <code>docker compose up -d</code>'] },
    { id: 'r5g', typ: 'wahl', auftrag: ['Persistenz-Test: Was ist nach <code>docker compose down -v</code> und <code>up -d</code> noch da?', 'Was ist nach <code>down -v</code> noch da?'],
      optionen: [{ t: ['Die Fotos in <code>library/</code> – aber Konto und Alben (Datenbank) sind weg.', 'Die Fotos im Ordner. Konto und Alben sind weg.'], richtig: true },
        { t: ['Gar nichts mehr – auch die Fotos sind gelöscht.', 'Nichts mehr.'], fb: ['Bind Mounts löscht Docker nie – die Dateien in <code>library/</code> bleiben. Weg ist das Volume mit der Datenbank.', 'Der Ordner bleibt. Nur das Volume ist weg.'] },
        { t: ['Alles bleibt – <code>-v</code> heißt nur „verbose“.', 'Alles bleibt.'], fb: ['<code>-v</code> heißt hier <code>--volumes</code>: Das Datenbank-Volume wird gelöscht.', '<code>-v</code> löscht die Volumes.'] }] },
    { id: 'r5h', typ: 'befehl', auftrag: ['Bonus für den Vereinsserver mit 8 GB RAM: Schalte die KI-Funktion (Gesichtserkennung) zu.', 'Schalte die KI dazu.'],
      loesung: ['docker compose --profile ml up -d'],
      ziel: function (h, r) { return r.up && r.profil === 'ml'; },
      falsch: function (r) { return r.fehler === 'keinService' ? ['<code>no such service: ml</code> – <code>ml</code> ist ein <b>Profil</b>, kein Service-Name. Schreib <code>--profile ml</code> vor <code>up</code>.', '<code>ml</code> ist ein Profil. Schreibe <code>--profile ml</code> vor <code>up</code>.'] : null; },
      tipp: ['<code>docker compose --profile ml up -d</code>', 'Schreibe: <code>docker compose --profile ml up -d</code>'] }
  ],
  ticket: [
    { id: 'r5t1', typ: 'wahl', ticket: true, auftrag: ['Tomás: „Ich hab zuhause <code>docker compose down -v</code> gemacht, weil der Neffe sagt, das räumt auf. Sind die Vereinsfotos jetzt weg?“', 'Tomás: „Ich habe <code>down -v</code> gemacht. Sind die Fotos weg?“'],
      optionen: [{ t: ['„Die Fotodateien in <code>library/</code> sind noch da. Konten, Alben und Gesichter sind weg – die holen wir nur aus einem Datenbank-Backup zurück.“', '„Die Fotos sind noch da. Konten und Alben sind weg. Nur ein Backup hilft.“'], richtig: true },
        { t: ['„Alles weg, tut mir leid.“', '„Alles ist weg.“'], fb: ['Zu schwarz gemalt: Bind Mounts löscht Docker nie.', 'Nicht alles: Der Ordner bleibt.'] },
        { t: ['„Kein Problem, <code>up -d</code> und alles ist wieder da.“', '„Kein Problem. Alles kommt zurück.“'], fb: ['Das Datenbank-Volume ist gelöscht – Konten und Alben kommen nicht von allein zurück.', 'Die Datenbank ist weg. Sie kommt nicht zurück.'] }] }
  ],
  beruf: ['Das ist jetzt ein echter Dienst, den ihr in der VM bereitstellt. Die Fehlermeldungen kommen dort genauso.', 'Jetzt baust du die echte Foto-Cloud in der VM. Die Fehler sehen dort genauso aus.'],
  vmBefehle: ['cd exercises/5_abschlussprojekt_immich', 'cp .env.example .env && nano .env', 'nano docker-compose.yml   # ??? ersetzen', 'docker compose config', 'docker compose up -d', 'docker compose ps', '# http://localhost:2283 → Admin-Konto anlegen', '# Externe Bibliothek: /mnt/import', 'docker compose down && docker compose up -d', '# Bonus: docker compose --profile ml up -d']
});
GEPLANT.length = 0;

/* Zusätzliche Erklärungen für neue Fehlermeldungen */
ERKL.portBelegt = ['Der Host-Port (links) gehört schon einem laufenden Container. Nimm links einen anderen Port oder stoppe den alten Container.', 'Der Port links ist schon belegt. Nimm einen anderen Port.'];
ERKL.buildPunkt = ['Dem Build fehlt der Ordner. Der Punkt am Ende heißt: „hier im aktuellen Ordner“.', 'Der Punkt am Ende fehlt.'];
ERKL.keinVolume = ['Ein Volume mit diesem Namen gibt es nicht. <code>docker volume ls</code> zeigt alle.', 'Dieses Volume gibt es nicht.'];
ERKL.imContainer = ['Du bist noch im Container (<code>root@…#</code>). Dort gibt es kein docker. Erst mit <code>exit</code> hinaus.', 'Du bist im Container. Erst <code>exit</code>.'];
ERKL.ro = ['Der Ordner ist mit <code>:ro</code> eingebunden – der Container darf nur lesen.', 'Nur lesen erlaubt (<code>:ro</code>).'];
ERKL.envFehlt = ['<code>variable is not set</code>: Die Datei <code>.env</code> fehlt oder heißt anders. <code>cp .env.example .env</code>.', 'Die Datei <code>.env</code> fehlt.'];
ERKL.keinStart = ['<code>start</code> startet nur vorhandene Container. Beim ersten Mal <code>docker compose up -d</code>.', 'Beim 1. Mal: <code>up -d</code>.'];
ERKL.composeLuecke = ['In der Compose-Datei stimmt noch etwas nicht (Lücken oder Volume nicht deklariert).', 'In der Datei fehlt noch etwas.'];
ERKL.keinService = ['Diesen Service gibt es in der Datei nicht. Ein Profil schaltest du mit <code>--profile NAME</code> zu.', 'Diesen Service gibt es nicht.'];
ERKL.keinCompose = ['Hier liegt keine docker-compose.yml.', 'Hier ist keine Compose-Datei.'];
ERKL.keinDockerfile = ['Im Ordner liegt kein Dockerfile.', 'Hier ist kein Dockerfile.'];

/* ---------- Stationen (Level) und Kurz-Checks ---------- */
PAKET.stationen.push(
  { id: 'S2', titel: 'Raum 2 · Die Vereinsseite', lz: ['LZ2', 'LZ3'], check: ['r2-k1', 'r2-k2', 'r2-k3'],
    auftrag: 'Der TSV braucht eine Startseite. Bau aus dem Dockerfile ein Image und mach die Seite im Browser erreichbar.',
    mitdenken: { auftrag: 'Skizziere mit zwei Kästen (Host, Container) und einem Pfeil, was <code>-p 8081:80</code> macht.', muster: 'Kasten „Host“ mit Port 8081 → Pfeil → Kasten „Container“ mit Port 80. Der Browser fragt den Host auf 8081.' } },
  { id: 'S3', titel: 'Raum 3 · Daten, die bleiben', lz: ['LZ4'], check: ['r3-k1', 'r3-k2', 'r3-k3'],
    auftrag: 'Der Verein will Fotos und Listen speichern. Finde heraus, wo Daten einen gelöschten Container überleben.',
    mitdenken: { auftrag: 'Erkläre Tomás in einfachen Worten, warum seine Listen weg waren und was wir jetzt anders machen.', muster: 'Die Listen lagen nur im Container. Als der Container gelöscht wurde, waren sie weg. Jetzt speichern wir sie in einem Volume, das bleibt.' } },
  { id: 'S4', titel: 'Raum 4 · Drei Dienste, eine Datei', lz: ['LZ5', 'LZ4'], check: ['r4-k1', 'r4-k2', 'r4-k3'],
    auftrag: 'Starte Vereinsseite, Datenbank und Adminer mit einer einzigen Datei.',
    mitdenken: { auftrag: 'Zeichne die drei Services als Kästen. Welche Pfeile gehen von außen hinein, welche bleiben innen?', muster: 'Browser → web (8080), Browser → adminer (8081), adminer → db, db → Volume pgdata. Die db hat keinen Pfeil von außen.' } },
  { id: 'S5', titel: 'Raum 5 · Generalprobe Foto-Cloud', lz: ['LZ5', 'LZ6'], check: ['r5-k1', 'r5-k2', 'r5-k3'],
    auftrag: 'Ergänze die Immich-Datei, starte sie und bring die alten Vereinsfotos hinein.',
    mitdenken: { auftrag: 'Schreibe für den Verein eine Notfallkarte mit drei Zeilen: Was darf man nie eingeben? Was hilft, wenn die Seite nicht lädt? Was muss ins Backup?', muster: 'Nie <code>docker compose down -v</code>. Seite lädt nicht → <code>docker compose ps</code> und <code>logs</code>, <code>http://</code> statt <code>https://</code>. Backup: Ordner <code>library/</code> und die Datenbank.' } }
);
PAKET.fragen.push(
  { id: 'r2-k1', lz: 'LZ3', einsatz: ['check', 'nachweis'], typ: 'mc', frage: 'Ein Container wurde mit <code>-p 8081:80</code> gestartet. Welche Adresse öffnest du im Browser?',
    optionen: [{ text: '<code>http://localhost:8081</code>', richtig: true }, { text: '<code>http://localhost:80</code>', feedback: '80 ist der Port im Container. Der Browser fragt den Host – die linke Zahl.' }, { text: '<code>http://localhost:8081:80</code>', feedback: 'Eine Adresse hat nur einen Port. Das Mapping erledigt Docker.' }],
    erklaerung: '<code>-p Host:Container</code>: Der Browser spricht den Host-Port 8081 an, Docker leitet an Port 80 im Container weiter.' },
  { id: 'r2-k2', lz: 'LZ2', einsatz: ['check', 'nachweis'], typ: 'mc', frage: 'Du hast <code>index.html</code> geändert. Die Datei wird im Dockerfile per <code>COPY</code> ins Image gelegt. Was musst du tun?',
    optionen: [{ text: 'Neu bauen, alten Container löschen, neuen Container starten', richtig: true }, { text: '<code>docker restart tsv</code>', feedback: 'Restart startet denselben Container mit demselben, alten Image.' }, { text: 'Nur den Browser neu laden', feedback: 'Die Datei steckt im Image – der Container zeigt die alte Fassung, bis du neu baust.' }],
    erklaerung: 'Was per COPY im Image steckt, ändert sich erst mit einem neuen Build – und ein Container nutzt immer das Image, aus dem er erstellt wurde.' },
  { id: 'r2-k3', lz: 'LZ1', einsatz: ['check', 'nachweis'], typ: 'zahl', frage: 'Wiederholung: Du tippst dreimal <code>docker run -d nginx:alpine</code> (ohne Namen, ohne Port). Wie viele Container laufen danach?',
    zahl: { wert: 3, toleranz: 0 }, typisch: [{ wert: 1, feedback: 'Jedes <code>run</code> erzeugt einen neuen Container – ohne Port-Mapping gibt es auch keinen Konflikt.' }], erklaerung: 'Drei <code>run</code> = drei Container. Sie laufen alle, weil keiner einen Host-Port belegt.' },
  { id: 'r3-k1', lz: 'LZ4', einsatz: ['check', 'nachweis'], typ: 'zuordnen', frage: 'Ordne zu: Named Volume oder Bind Mount?',
    paare: [{ links: '<code>pgdata:/var/lib/postgresql/data</code>', rechts: 'Named Volume – Docker verwaltet den Speicher' }, { links: '<code>./library:/data</code>', rechts: 'Bind Mount – Ordner im Projekt' }, { links: '<code>/home/tsv/archiv:/mnt/import:ro</code>', rechts: 'Bind Mount – nur lesen' }],
    feedbackFalsch: 'Achte auf die linke Seite: Beginnt sie mit <code>/</code> oder <code>./</code>, ist es ein Pfad – also ein Bind Mount. Und <code>:ro</code> heißt nur lesen.', erklaerung: 'Pfad links = Bind Mount, Name links = Named Volume, <code>:ro</code> = nur lesen.' },
  { id: 'r3-k2', lz: 'LZ4', einsatz: ['check', 'nachweis'], typ: 'mc', frage: 'Was bedeutet <code>:ro</code> am Ende einer Volume-Zeile?',
    optionen: [{ text: 'Der Container darf den Ordner nur lesen (read only).', richtig: true }, { text: 'Der Ordner gehört dem Benutzer root.', feedback: '<code>ro</code> steht für read only, nicht für root.' }, { text: 'Der Ordner wird beim Start geleert (remove old).', feedback: 'Es wird nichts gelöscht – im Gegenteil: Der Container darf nichts verändern.' }],
    erklaerung: '<code>:ro</code> = read only. Damit kann z. B. Immich die Originalfotos nicht verändern.' },
  { id: 'r3-k3', lz: 'LZ3', einsatz: ['check'], typ: 'mc', frage: 'Wiederholung: Zwei Container sollen beide eine Webseite zeigen. Welche Kombination funktioniert?',
    optionen: [{ text: '<code>-p 8080:80</code> und <code>-p 8081:80</code>', richtig: true }, { text: '<code>-p 8080:80</code> und <code>-p 8080:81</code>', feedback: 'Beide wollen Host-Port 8080 – der zweite bekommt <code>port is already allocated</code>.' }, { text: '<code>-p 80:8080</code> und <code>-p 81:8080</code>', feedback: 'Im Container hört nginx auf 80, nicht auf 8080 – die Seiten bleiben stumm.' }],
    erklaerung: 'Die Host-Ports links müssen verschieden sein, rechts steht der Port, auf dem der Dienst im Container hört.' },
  { id: 'r4-k1', lz: 'LZ5', einsatz: ['check', 'nachweis'], typ: 'text', frage: 'In Adminer sollst du dich bei der Compose-Datenbank anmelden. Der Service heißt <code>db</code>. Was trägst du bei <b>Server</b> ein?',
    akzeptiert: ['db'], typisch: [{ antwort: 'localhost', feedback: 'Im Adminer-Container ist localhost Adminer selbst. Die DB erreichst du über ihren Service-Namen.' }, { antwort: '127.0.0.1', feedback: 'Auch 127.0.0.1 ist der Container selbst.' }],
    erklaerung: 'Im Compose-Netz ist der Service-Name zugleich der Hostname: <code>db</code>.' },
  { id: 'r4-k2', lz: 'LZ4', einsatz: ['check', 'nachweis'], typ: 'mc', frage: 'Was löscht <code>docker compose down</code> (ohne <code>-v</code>)?',
    optionen: [{ text: 'Die Container und das Netzwerk – Volumes bleiben.', richtig: true }, { text: 'Container, Netzwerk und Volumes.', feedback: 'Volumes löscht erst <code>down -v</code>.' }, { text: 'Nur das Netzwerk.', feedback: 'Auch die Container werden entfernt – sie werden beim nächsten <code>up</code> neu erstellt.' }],
    erklaerung: '<code>down</code> = Container und Netzwerk weg, Daten in Volumes bleiben. <code>down -v</code> löscht auch die Volumes.' },
  { id: 'r4-k3', lz: 'LZ2', einsatz: ['check'], typ: 'mc', frage: 'Wiederholung: Was steht bei <code>build:</code> in einer docker-compose.yml?',
    optionen: [{ text: 'Der Ordner, in dem das Dockerfile liegt', richtig: true }, { text: 'Der Name eines fertigen Images aus der Registry', feedback: 'Fertige Images stehen bei <code>image:</code>.' }, { text: 'Der Pfad zur Datei index.html', feedback: 'Compose braucht den Build-Kontext – den Ordner mit dem Dockerfile.' }],
    erklaerung: '<code>build: ../2_webserver</code> – Compose baut dann wie <code>docker build</code> aus diesem Ordner.' },
  { id: 'r5-k1', lz: 'LZ6', einsatz: ['check', 'nachweis'], typ: 'zuordnen', frage: 'Ordne jeder Meldung die passende Lösung zu.',
    paare: [{ links: '<code>port is already allocated</code>', rechts: 'anderen Host-Port nehmen oder alten Container stoppen' }, { links: '<code>The "DB_PASSWORD" variable is not set</code>', rechts: '<code>cp .env.example .env</code>' }, { links: '<code>service "db" has no container to start</code>', rechts: '<code>docker compose up -d</code> statt <code>start</code>' }, { links: '<code>SSL_ERROR_RX_RECORD_TOO_LONG</code>', rechts: '<code>http://</code> statt <code>https://</code> tippen' }],
    feedbackFalsch: 'Lies jede Meldung Wort für Wort: Sie nennt Port, Variable, Service oder SSL.', erklaerung: 'Die Meldung nennt fast immer die Ursache – Port, Variable, Service oder Protokoll.' },
  { id: 'r5-k2', lz: 'LZ6', einsatz: ['check', 'nachweis'], typ: 'mc', frage: 'Immich zeigt in der Externen Bibliothek nichts an. Eingetragen ist <code>/home/azubi/immich/beispielbilder</code>. Was ist falsch?',
    optionen: [{ text: 'Das ist der Host-Pfad – Immich im Container sieht den Ordner unter <code>/mnt/import</code>.', richtig: true }, { text: 'Die Fotos haben das falsche Format.', feedback: 'Die Fotos sind in Ordnung – Immich findet den Ordner gar nicht.' }, { text: 'Der Ordner ist mit <code>:ro</code> eingebunden.', feedback: 'Lesen darf Immich – <code>:ro</code> verhindert nur Schreiben.' }],
    erklaerung: 'In der App gibst du immer den Pfad im Container an – hier <code>/mnt/import</code>.' },
  { id: 'r5-k3', lz: 'LZ4', einsatz: ['check'], typ: 'mc', frage: 'Wiederholung: Was gehört bei Immich ins Backup?',
    optionen: [{ text: 'Der Ordner <code>library/</code> und die Datenbank', richtig: true }, { text: 'Nur der Ordner <code>library/</code>', feedback: 'Ohne Datenbank fehlen Konten, Alben und Gesichter – nur ein Haufen Dateien.' }, { text: 'Nur die Datenbank', feedback: 'Ohne Fotodateien ist die Datenbank ein leeres Album.' }],
    erklaerung: 'Bilder ohne Datenbank = Haufen Dateien. Datenbank ohne Bilder = leeres Album. Backup braucht beides.' }
);
