/* =====================================================================
   LERNPFAD-ENGINE – geführter Lernpfad ohne Nachweis.
   Kopf: Betriebssystem (Linux / Windows mit CMD oder PowerShell) und
   Sprachstufe (Standard / Einfach) zum Umschalten. Je Schritt: Warum,
   Szene, Dateien und Befehle mit Zeilen-Erklärungen und Kopierknopf,
   Kontrolle zum Abhaken, Mitdenken, Profi-Kasten, Begriffe.
   SCORM 1.2: completed, sobald alle Schritte abgehakt sind (kein Score).
   Läuft auch ohne Lernplattform (Speicher: localStorage).
   ===================================================================== */
(function () {
  'use strict';
  var P = PFAD, N = P.schritte.length;
  var S = { os: 'linux', shell: 'cmd', sprache: 'standard', seite: 'start', checks: {}, antworten: {} };
  var LS_KEY = 'lernpfad-' + P.id;

  /* ---------- SCORM 1.2 ---------- */
  var API = null;
  function findeApi(w) { var n = 0; while (w && n < 12) { try { if (w.API) return w.API; } catch (e) { return null; } if (w === w.parent) break; w = w.parent; n++; } return null; }
  try { API = findeApi(window) || (window.opener ? findeApi(window.opener) : null); } catch (e) { API = null; }
  function sGet(k) { try { return API ? String(API.LMSGetValue(k) || '') : ''; } catch (e) { return ''; } }
  function sSet(k, v) { try { if (API) API.LMSSetValue(k, String(v)); } catch (e) {} }
  if (API) { try { API.LMSInitialize(''); } catch (e) { API = null; } }

  function laden() {
    var roh = sGet('cmi.suspend_data');
    if (!roh) { try { roh = localStorage.getItem(LS_KEY) || ''; } catch (e) { roh = ''; } }
    if (roh) { try { var d = JSON.parse(roh); for (var k in d) if (k in S) S[k] = d[k]; } catch (e) {} }
    if (API) { var st = sGet('cmi.core.lesson_status'); if (!st || st === 'not attempted') sSet('cmi.core.lesson_status', 'incomplete'); }
  }
  function speichern() {
    var roh = JSON.stringify(S);
    if (API) {
      sSet('cmi.suspend_data', roh.slice(0, 4000));
      sSet('cmi.core.lesson_location', S.seite);
      sSet('cmi.core.exit', 'suspend');
      if (anzahlErledigt() === N) sSet('cmi.core.lesson_status', 'completed');
      try { API.LMSCommit(''); } catch (e) {}
    }
    try { localStorage.setItem(LS_KEY, roh); } catch (e) {}
  }
  window.addEventListener('beforeunload', function () { speichern(); try { if (API) API.LMSFinish(''); } catch (e) {} });

  /* ---------- Helfer ---------- */
  function E(tag, at, kinder) {
    var el = document.createElement(tag);
    if (at) for (var k in at) {
      if (k === 'text') el.textContent = at[k];
      else if (k === 'html') el.innerHTML = at[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), at[k]);
      else if (at[k] !== null && at[k] !== undefined && at[k] !== false) el.setAttribute(k, at[k]);
    }
    (kinder || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  var EINF = function () { return S.sprache === 'einfach'; };
  /* T: [Standard, Einfach] oder String */
  function T(x) { if (x == null) return ''; if (Array.isArray(x)) return EINF() && x[1] ? x[1] : x[0]; return O(x) !== x ? T(O(x)) : x; }
  /* O: betriebssystemabhängiger Wert */
  function O(v) {
    if (v == null || typeof v !== 'object' || Array.isArray(v)) return v;
    if (!('linux' in v || 'windows' in v || 'cmd' in v || 'ps' in v)) return v;
    if (S.os === 'linux') return v.linux;
    return v[S.shell] !== undefined ? v[S.shell] : v.windows;
  }
  function sichtbar(x) { return !x.nur || x.nur === S.os; }
  function shellName() { return S.os === 'linux' ? 'Bash' : (S.shell === 'ps' ? 'PowerShell' : 'CMD'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function kopieren(text, knopf) {
    function ok() { var alt = knopf.textContent; knopf.textContent = '✔ Kopiert'; knopf.classList.add('ok'); setTimeout(function () { knopf.textContent = alt; knopf.classList.remove('ok'); }, 1600); }
    function rueckfall() {
      var ta = E('textarea', { style: 'position:fixed;left:-9999px;top:0', 'aria-hidden': 'true' }); ta.value = text;
      document.body.appendChild(ta); ta.select();
      var g = false; try { g = document.execCommand('copy'); } catch (e) {}
      ta.remove(); if (g) ok(); else { knopf.textContent = 'Markieren + Strg+C'; }
    }
    try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(ok, rueckfall); return; } } catch (e) {}
    rueckfall();
  }
  function herunterladen(name, blob) {
    var a = E('a', { href: URL.createObjectURL(blob), download: name, style: 'display:none' });
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 3000);
  }

  /* ---------- Codeblock mit Zeilen-Erklärungen ---------- */
  var CODE = {};   // Schlüssel (Dateipfad oder Block-id) → { zeilen: [el], text: [str] }
  function codeBlock(o) {
    var code = o.code.replace(/\n$/, ''), zeilen = code.split('\n'), erkl = new Array(zeilen.length), anz = 0;
    (o.erkl || []).forEach(function (p) {
      for (var i = 0; i < zeilen.length; i++) {
        if (zeilen[i].indexOf(p[0]) === -1) continue;
        if (o.mehrfach) { if (!erkl[i]) anz++; erkl[i] = erkl[i] ? erkl[i] + '<br>' + p[1] : p[1]; continue; }   // Skripte: alle passenden Zeilen, Erklärungen anhängen
        if (!erkl[i]) { erkl[i] = p[1]; anz++; return; }
      }
    });
    var kopf = E('div', { class: 'code-kopf' }, [
      E('span', { class: 'code-titel', html: o.titelHtml }),
      o.hinweis ? E('span', { class: 'code-hinweis', text: o.hinweis }) : null
    ]);
    var knoepfe = E('div', { class: 'code-knoepfe' });
    var pre = E('div', { class: 'code', role: 'group', 'aria-label': o.titelText || 'Code' });
    var reg = { zeilen: [], text: zeilen };
    zeilen.forEach(function (z, i) {
      var zeile = E('div', { class: 'zl' + (erkl[i] ? ' hat' : '') }, [E('span', { class: 'nr', text: String(i + 1) }), E('span', { class: 'tx', text: z || ' ' })]);
      var box = null;
      if (erkl[i]) {
        zeile.setAttribute('tabindex', '0'); zeile.setAttribute('role', 'button'); zeile.setAttribute('aria-expanded', 'false');
        zeile.title = EINF() ? 'Erklärung zeigen' : 'Klicken: Erklärung zu dieser Zeile';
        box = E('div', { class: 'zl-erkl', html: erkl[i], hidden: 'hidden' });
        var umschalten = function (an) { var auf = an === undefined ? box.hidden : an; box.hidden = !auf; zeile.classList.toggle('offen', auf); zeile.setAttribute('aria-expanded', String(auf)); };
        zeile._umschalten = umschalten;
        zeile.addEventListener('click', function () { umschalten(); });
        zeile.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); umschalten(); } });
      }
      pre.appendChild(zeile); if (box) pre.appendChild(box);
      reg.zeilen.push(zeile);
    });
    if (anz) {
      var alle = E('button', { type: 'button', class: 'mini', text: '💡 ' + (EINF() ? 'Alle Erklärungen' : 'Alle Erklärungen zeigen') });
      alle.addEventListener('click', function () {
        var auf = !alle.classList.contains('an'); alle.classList.toggle('an', auf);
        reg.zeilen.forEach(function (z) { if (z._umschalten) z._umschalten(auf); });
      });
      knoepfe.appendChild(alle);
    }
    var kb = E('button', { type: 'button', class: 'mini kopier', text: '📋 Kopieren', 'aria-label': 'Code kopieren' });
    kb.addEventListener('click', function () { kopieren(code + '\n', kb); });
    knoepfe.appendChild(kb);
    if (o.datei) {
      var db = E('button', { type: 'button', class: 'mini', text: '⬇ Datei' });
      db.addEventListener('click', function () { herunterladen(o.datei.split('/').pop(), new Blob([code + '\n'], { type: 'text/plain' })); });
      knoepfe.appendChild(db);
    }
    kopf.appendChild(knoepfe);
    if (o.schluessel) CODE[o.schluessel] = reg;
    return E('div', { class: 'codeblock' + (o.datei ? ' datei' : '') }, [kopf, pre,
      anz ? E('div', { class: 'code-tipp', text: EINF() ? '● = Zeile antippen: Erklärung' : '● Zeilen mit Punkt antippen oder anklicken – dann erscheint die Erklärung.' }) : null]);
  }
  function markiereZeile(z) {
    document.querySelectorAll('.zl.hl').forEach(function (x) { x.classList.remove('hl'); });
    if (!z) return;
    var reg = CODE[z[0]]; if (!reg) return;
    for (var i = 0; i < reg.text.length; i++) if (reg.text[i].indexOf(z[1]) !== -1) { reg.zeilen[i].classList.add('hl'); return; }
  }

  /* ---------- Szene: Ablauf (Knoten + Schritte) ---------- */
  function szeneAblauf(sz) {
    var knoten = sz.knoten.filter(sichtbar), schritte = sz.schritte.filter(sichtbar), i = -1, el = {};
    var buehne = E('div', { class: 'ablauf' });
    var gruppeEl = null, gruppeName = null;
    knoten.forEach(function (k, n) {
      var box = E('div', { class: 'knoten', 'data-id': k.id }, [E('div', { class: 'k-icon', text: k.icon }), E('div', { class: 'k-name', text: k.name }), E('div', { class: 'k-sub', text: T(k.sub) })]);
      el[k.id] = box;
      if (k.gruppe) {
        if (gruppeName !== k.gruppe) {
          if (n) buehne.appendChild(E('div', { class: 'pfeil', 'aria-hidden': 'true', text: '→' }));
          gruppeEl = E('div', { class: 'gruppe' }, [E('div', { class: 'g-name', text: k.gruppe })]); buehne.appendChild(gruppeEl); gruppeName = k.gruppe;
        } else gruppeEl.appendChild(E('div', { class: 'pfeil', 'aria-hidden': 'true', text: '→' }));
        gruppeEl.appendChild(box);
      } else {
        gruppeName = null;
        if (n) buehne.appendChild(E('div', { class: 'pfeil', 'aria-hidden': 'true', text: '→' }));
        buehne.appendChild(box);
      }
    });
    var text = E('div', { class: 'ablauf-text', 'aria-live': 'polite', html: EINF() ? 'Drücke <b>Start</b>. Dann siehst du jeden Schritt.' : 'Drücke <b>Start</b> und gehe Schritt für Schritt durch.' });
    var zaehler = E('span', { class: 'zaehler' });
    var zur = E('button', { type: 'button', class: 'knopf zweit', text: '◀', 'aria-label': 'Zurück', disabled: 'disabled' });
    var vor = E('button', { type: 'button', class: 'knopf', text: 'Start ▶' });
    var punkte = E('div', { class: 'punkte', 'aria-hidden': 'true' });
    schritte.forEach(function () { punkte.appendChild(E('span')); });
    function zeige(j, fehler, inhalt, an) {
      Object.keys(el).forEach(function (id) { el[id].classList.remove('an', 'fehler'); });
      (an || []).forEach(function (id) { if (el[id]) el[id].classList.add(fehler ? 'fehler' : 'an'); });
      text.innerHTML = inhalt; text.classList.toggle('fehler', !!fehler);
    }
    function gehe(j) {
      i = Math.max(0, Math.min(schritte.length - 1, j)); var s = schritte[i];
      zeige(i, s.fehler, '<b>' + (i + 1) + '.</b> ' + T(s.t), s.an);
      markiereZeile(s.zeile);
      zaehler.textContent = (i + 1) + ' / ' + schritte.length;
      zur.disabled = i <= 0; vor.textContent = i >= schritte.length - 1 ? '↺ Von vorn' : 'Weiter ▶';
      [].forEach.call(punkte.children, function (p, n) { p.className = n <= i ? 'an' : ''; });
    }
    vor.addEventListener('click', function () { gehe(i >= schritte.length - 1 ? 0 : i + 1); });
    zur.addEventListener('click', function () { gehe(i - 1); });
    var steuer = E('div', { class: 'steuer' }, [zur, vor, zaehler, punkte]);
    if (sz.extra) {
      var xb = E('button', { type: 'button', class: 'knopf warn', text: T(sz.extra.knopf) });
      xb.addEventListener('click', function () { zeige(-1, true, T(sz.extra.t), sz.extra.an); markiereZeile(null); });
      steuer.appendChild(xb);
    }
    return E('div', {}, [buehne, text, steuer]);
  }

  /* ---------- Szene: Ordner (Git- und Docker-Sicht) ---------- */
  var BAUM = [
    { p: 'local-https-demo/', t: 0, git: 1, dock: 1, e: ['Hauptordner. Alle Befehle laufen hier.', 'Der Hauptordner. Hier startest du alle Befehle.'] },
    { p: '.git/', t: 1, git: 0, dock: 0, e: ['Git-Verlauf (entsteht mit git init). Nicht ins Image: .dockerignore.', 'Der Git-Verlauf. Er kommt nicht ins Image.'] },
    { p: '.gitignore', t: 1, git: 1, dock: 1, e: ['Was Git ignoriert: certs/ und target/.', 'Sagt Git: certs/ und target/ nicht speichern.'] },
    { p: '.dockerignore', t: 1, git: 1, dock: 1, e: ['Was nicht in den Build-Kontext kommt: certs/, target/, .git/, scripts/.', 'Sagt Docker: Diese Ordner nicht mitnehmen.'] },
    { p: 'certs/', t: 1, git: 0, dock: 0, geheim: 1, e: ['Zertifikat und privater Schlüssel (Schritt 4). Weder in Git noch im Build – Nginx bekommt sie per Bind Mount.', 'Hier liegt der geheime Schlüssel. Er kommt nicht in Git und nicht ins Image.'] },
    { p: 'localhost.pem', t: 2, git: 0, dock: 0, e: ['Öffentliches Serverzertifikat.', 'Das Zertifikat.'] },
    { p: 'localhost-key.pem', t: 2, git: 0, dock: 0, geheim: 1, e: ['🔑 Privater Schlüssel – das Geheimnis des Servers.', '🔑 Der geheime Schlüssel.'] },
    { p: 'nginx/default.conf', t: 1, git: 1, dock: 1, e: ['Nginx-Konfiguration (Schritt 5). Wird per Bind Mount eingebunden.', 'Einstellungen für Nginx.'] },
    { p: 'scripts/', t: 1, git: 1, dock: 0, e: ['Lebenszyklus-Skripte (Schritt 6). In Git ja, im Image nein.', 'Die Skripte. In Git ja. Im Image nein.'] },
    { p: 'windows/  ·  ubuntu/', t: 2, git: 1, dock: 0, e: ['.cmd/.ps1 für Windows, .sh für Ubuntu/WSL2.', 'Skripte für Windows und für Linux.'] },
    { p: 'src/main/java/demo/App.java', t: 1, git: 1, dock: 1, e: ['Java-Quellcode (Schritt 3). Das Dockerfile kopiert src/ in Stage 1.', 'Der Java-Code.'] },
    { p: 'pom.xml', t: 1, git: 1, dock: 1, e: ['Maven-Projektbeschreibung.', 'Beschreibt das Java-Projekt für Maven.'] },
    { p: 'Dockerfile', t: 1, git: 1, dock: 1, e: ['Bauplan für das Javalin-Image.', 'Der Bauplan für das Image.'] },
    { p: 'compose.yaml', t: 1, git: 1, dock: 1, e: ['Beide Services und ihr Zusammenspiel.', 'Beschreibt beide Container.'] },
    { p: 'target/', t: 1, git: 0, dock: 0, e: ['Build-Ergebnis von Maven, falls lokal gebaut wird. Lässt sich jederzeit neu erzeugen.', 'Ergebnis vom Bauen. Man kann es neu machen.'] }
  ];
  function szeneOrdner() {
    var sicht = 'alle', info = E('div', { class: 'ablauf-text', 'aria-live': 'polite', text: EINF() ? 'Tippe auf eine Datei.' : 'Tippe auf einen Eintrag. Wähle oben, aus wessen Sicht du schaust.' });
    var liste = E('div', { class: 'baum' });
    var leg = E('div', { class: 'baum-leg' });
    function zeichne() {
      liste.innerHTML = '';
      var weg = 0;
      BAUM.forEach(function (b) {
        var raus = (sicht === 'git' && !b.git) || (sicht === 'docker' && !b.dock); if (raus) weg++;
        var z = E('button', { type: 'button', class: 'baum-z' + (raus ? ' raus' : '') + (b.geheim ? ' geheim' : ''), style: 'padding-left:' + (10 + b.t * 22) + 'px' },
          [E('span', { text: (/\/$/.test(b.p) ? '📁 ' : '📄 ') + b.p }), raus ? E('span', { class: 'tag', text: sicht === 'git' ? 'ignoriert' : 'bleibt draußen' }) : null]);
        z.addEventListener('click', function () { info.innerHTML = '<b>' + esc(b.p) + '</b> – ' + T(b.e); });
        liste.appendChild(z);
      });
      leg.textContent = sicht === 'alle' ? (EINF() ? 'Alle Dateien im Projekt.' : 'So sieht der Ordner auf deinem Rechner aus.')
        : sicht === 'git' ? (EINF() ? 'Durchgestrichen = Git speichert es nicht.' : 'Durchgestrichen: Das landet dank .gitignore nicht im Repository.')
        : (EINF() ? 'Durchgestrichen = Docker bekommt es beim Bauen nicht.' : 'Durchgestrichen: Das schickt Docker dank .dockerignore nicht in den Build-Kontext.');
    }
    var tabs = E('div', { class: 'seg', role: 'group', 'aria-label': 'Sicht' });
    [['alle', '🗂️ Alles'], ['git', '🌿 Was Git sieht'], ['docker', '🐳 Was der Docker-Build sieht']].forEach(function (x) {
      var b = E('button', { type: 'button', text: x[1], 'aria-pressed': String(x[0] === sicht) });
      b.addEventListener('click', function () { sicht = x[0]; [].forEach.call(tabs.children, function (c) { c.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); zeichne(); });
      tabs.appendChild(b);
    });
    zeichne();
    return E('div', {}, [tabs, leg, liste, info]);
  }

  /* ---------- Szene: Lebenszyklus-Simulator ---------- */
  var PHASEN = [
    { id: 'build', name: 'Build', icon: '🔨' }, { id: 'create', name: 'Create', icon: '📋' }, { id: 'run', name: 'Run', icon: '▶️' },
    { id: 'stop', name: 'Stop', icon: '⏸️' }, { id: 'remove', name: 'Remove', icon: '🗑️' }
  ];
  function skriptPfad(ph) {
    if (S.os === 'linux') return 'scripts/ubuntu/' + ph + '_docker_nginx_javalin.sh';
    return 'scripts/windows/' + ph + '_docker_nginx_javalin.' + (S.shell === 'ps' ? 'ps1' : 'cmd');
  }
  function aufruf(ph) { var p = skriptPfad(ph); return S.os === 'linux' ? './' + p : '.\\' + p.replace(/\//g, '\\'); }
  var SIM = { img: { javalin: false, nginx: false }, c: 'keine', certs: true, ca: true };
  function szeneLebenszyklus(sz) {
    var term = E('div', { class: 'terminal', 'aria-live': 'polite' });
    var zustand = E('div', { class: 'zustand' });
    var browser = sz.browser ? E('div', { class: 'browser' }) : null;
    function aus(zeilen, art) { zeilen.forEach(function (z) { term.appendChild(E('div', { class: art || '', text: z })); }); while (term.children.length > 40) term.removeChild(term.firstChild); term.scrollTop = term.scrollHeight; }
    function prompt(cmd) { aus([(S.os === 'linux' ? '$ ' : (S.shell === 'ps' ? 'PS C:\\temp\\local-https-demo> ' : 'C:\\temp\\local-https-demo> ')) + cmd], 'p'); }
    function chip(txt, art) { return E('span', { class: 'chip ' + art, text: txt }); }
    function zeichne() {
      zustand.innerHTML = '';
      var c = SIM.c, cs = { keine: ['–', 'aus'], created: ['Created', 'mittel'], up: ['Up', 'gut'], exited: ['Exited', 'mittel'] }[c];
      zustand.appendChild(E('div', { class: 'z-spalte' }, [E('h4', { text: '🐳 Images' }),
        E('div', {}, ['local-https-javalin:1.0.0 ', SIM.img.javalin ? chip('vorhanden', 'gut') : chip('fehlt', 'aus')]),
        E('div', {}, ['nginx:stable ', SIM.img.nginx ? chip('vorhanden', 'gut') : chip('fehlt', 'aus')])]));
      zustand.appendChild(E('div', { class: 'z-spalte' }, [E('h4', { text: '📦 Container' }),
        E('div', {}, ['javalin-backend ', c === 'up' ? chip('Up (healthy)', 'gut') : chip(cs[0], cs[1])]),
        E('div', {}, ['nginx-https-proxy ', chip(cs[0], cs[1])])]));
      zustand.appendChild(E('div', { class: 'z-spalte' }, [E('h4', { text: '🔗 Netzwerk' }),
        E('div', {}, ['local-https-demo_default ', c === 'keine' ? chip('–', 'aus') : chip('vorhanden', 'gut')])]));
      if (browser) zeichneBrowser();
    }
    function zeichneBrowser() {
      browser.innerHTML = '';
      var ok = SIM.c === 'up', warn = ok && !SIM.ca;
      browser.appendChild(E('div', { class: 'b-leiste' }, [E('span', { class: 'b-schloss', text: ok ? (warn ? '⚠️' : '🔒') : 'ⓘ' }), E('span', { text: 'https://127.0.0.1:8443/' })]));
      var inhalt = ok && !warn ? E('div', { class: 'b-seite' }, [E('div', { class: 'b-ok', text: 'Hallo von Javalin!' })])
        : warn ? E('div', { class: 'b-seite b-warn' }, [E('b', { text: 'Dies ist keine sichere Verbindung' }), E('code', { text: 'NET::ERR_CERT_AUTHORITY_INVALID' }), E('p', { text: EINF() ? 'Der Browser kennt die CA nicht. → Schritt 4: CA in Windows importieren.' : 'Der Windows-Browser kennt die WSL-Root-CA nicht. → Schritt 4: Root-CA in Windows importieren, Browser neu starten.' })])
        : E('div', { class: 'b-seite b-fehl' }, [E('b', { text: 'Die Website ist nicht erreichbar' }), E('code', { text: 'ERR_CONNECTION_REFUSED' }), E('p', { text: EINF() ? 'Nginx läuft nicht.' : 'Auf 127.0.0.1:8443 hört niemand – der Nginx-Container läuft nicht.' })]);
      browser.appendChild(inhalt);
    }
    function lauf(ph) {
      prompt(aufruf(ph));
      var bash = S.os === 'linux', ps = S.os === 'windows' && S.shell === 'ps';
      var certFehlt = bash ? ['Fehler: Zertifikat fehlt (certs/localhost.pem). Bitte zuerst mkcert ausfuehren!'] : ps ? ['Zertifikat fehlt: certs/localhost.pem. Bitte zuerst mkcert ausfuehren!'] : ['Zertifikat fehlt! Bitte zuerst mkcert ausfuehren.'];
      if (ph === 'build') {
        aus(['[1/3] Pruefe Docker-Compose-Konfiguration...', '[2/3] Lade Basis-Images (nginx:stable)...', ' ✔ nginx Pulled', '[3/3] Kompiliere Java-Anwendung und baue Javalin-Image...', ' => [build 5/5] RUN mvn -B -DskipTests package dependency:copy-dependencies ...', ' ✔ javalin Built', 'Erfolg: Images wurden erstellt und Beispiel kompiliert.']);
        SIM.img.javalin = SIM.img.nginx = true;
      } else if (ph === 'create') {
        if (!SIM.certs) { aus(certFehlt, 'err'); return zeichne(); }
        aus(['Erstelle Netzwerk und Container (ohne Start)...']);
        if (!SIM.img.javalin || !SIM.img.nginx) { aus([' ! Images fehlen – Compose baut bzw. lädt sie zuerst (dauert länger).'], 'warn'); SIM.img.javalin = SIM.img.nginx = true; }
        if (SIM.c === 'keine') aus([' ✔ Network local-https-demo_default  Created', ' ✔ Container javalin-backend      Created', ' ✔ Container nginx-https-proxy    Created']);
        else aus([' ✔ Container javalin-backend      Exists', ' ✔ Container nginx-https-proxy    Exists']);
        aus([bash ? 'Container angelegt. Start mit ./scripts/ubuntu/run_docker_nginx_javalin.sh' : ps ? 'Container angelegt. Start mit run_docker_nginx_javalin.ps1' : 'Container angelegt.']);
        if (SIM.c === 'keine') SIM.c = 'created';
      } else if (ph === 'run') {
        if (!SIM.certs) { aus(certFehlt, 'err'); return zeichne(); }
        if (!SIM.img.javalin || !SIM.img.nginx) { aus([' ! Images fehlen – Compose baut bzw. lädt sie zuerst (dauert länger).'], 'warn'); SIM.img.javalin = SIM.img.nginx = true; }
        aus(['Starte Container-Stack (Nginx + Javalin)...', ' ✔ Container javalin-backend      Healthy', ' ✔ Container nginx-https-proxy    Started']);
        if (bash) aus(['Bereit! Oeffne im Browser: https://127.0.0.1:8443/']);
        else if (ps) aus(['Bereit! Oeffne im Browser: https://127.0.0.1:8443/']);
        else aus(['OK', '', 'Bereit! Oeffne im Browser: https://127.0.0.1:8443/']);
        SIM.c = 'up';
      } else if (ph === 'stop') {
        aus([bash || ps ? 'Stoppe laufende Container (Zustand bleibt erhalten)...' : 'Stoppe laufende Container...']);
        if (SIM.c === 'up') aus([' ✔ Container nginx-https-proxy    Stopped', ' ✔ Container javalin-backend      Stopped']);
        aus(['Container wurden gestoppt.']);
        if (SIM.c === 'up') SIM.c = 'exited';
      } else if (ph === 'remove') {
        aus(['Entferne Container, Netzwerk und Docker-Images...']);
        if (SIM.c !== 'keine') aus([' ✔ Container nginx-https-proxy    Removed', ' ✔ Container javalin-backend      Removed', ' ✔ Network local-https-demo_default  Removed']);
        if (SIM.img.javalin) aus([' ✔ Image local-https-javalin:1.0.0  Removed']);
        if (SIM.img.nginx) aus([' ✔ Image nginx:stable               Removed']);
        aus(['Alle Projekt-Container und Docker-Images wurden geloescht.']);
        SIM.c = 'keine'; SIM.img.javalin = SIM.img.nginx = false;
      }
      zeichne();
    }
    function ps() {
      prompt('docker compose ps');
      if (SIM.c === 'up') aus(['NAME                IMAGE                       SERVICE   STATUS                   PORTS', 'javalin-backend     local-https-javalin:1.0.0   javalin   Up 12 seconds (healthy)  8080/tcp', 'nginx-https-proxy   nginx:stable                nginx     Up 6 seconds             127.0.0.1:8443->443/tcp']);
      else aus(['NAME      IMAGE     SERVICE   STATUS    PORTS', EINF() ? '(leer – kein Container läuft. Angelegte und gestoppte zeigt docker compose ps -a)' : '(leer – es läuft kein Container. Angelegte oder gestoppte Container zeigt erst docker compose ps -a.)'], 'warn');
    }
    var knoepfe = E('div', { class: 'phasen' });
    PHASEN.forEach(function (ph, n) {
      var b = E('button', { type: 'button', class: 'knopf phase', html: '<span>' + ph.icon + ' ' + (n + 1) + '. ' + ph.name + '</span><small>' + esc(skriptPfad(ph.id).split('/').pop()) + '</small>' });
      b.addEventListener('click', function () { lauf(ph.id); });
      knoepfe.appendChild(b);
    });
    var psb = E('button', { type: 'button', class: 'knopf zweit', text: '🔍 docker compose ps' }); psb.addEventListener('click', ps);
    var clr = E('button', { type: 'button', class: 'knopf zweit', text: '🧹 ' + (EINF() ? 'Leeren' : 'Terminal leeren') }); clr.addEventListener('click', function () { term.innerHTML = ''; });
    var optCerts = E('label', { class: 'opt' }, [E('input', { type: 'checkbox', checked: SIM.certs ? 'checked' : null, onchange: function (ev) { SIM.certs = ev.target.checked; } }), ' ' + (EINF() ? 'certs/ ist gefüllt (Schritt 4)' : 'certs/ enthält Zertifikat und Schlüssel (Schritt 4 erledigt)')]);
    var optCa = S.os === 'linux' && sz.browser ? E('label', { class: 'opt' }, [E('input', { type: 'checkbox', checked: SIM.ca ? 'checked' : null, onchange: function (ev) { SIM.ca = ev.target.checked; zeichne(); } }), ' ' + (EINF() ? 'Browser kennt die CA (bei WSL2 + Windows: importiert)' : 'Der Browser vertraut der CA (bei WSL2 + Windows-Browser: Root-CA importiert)')]) : null;
    prompt(S.os === 'linux' ? 'cd ~/local-https-demo' : 'cd C:\\temp\\local-https-demo');
    zeichne();
    return E('div', {}, [E('p', { class: 'sz-hinweis', html: (EINF() ? 'Drücke die Knöpfe. Probiere auch die falsche Reihenfolge.' : 'Starte die Phasen per Knopf – auch in falscher Reihenfolge – und beobachte den Zustand.') + ' <span class="shell">' + shellName() + '</span>' }),
      knoepfe, E('div', { class: 'opts' }, [optCerts, optCa, psb, clr]), E('div', { class: 'sim' }, [term, E('div', {}, [zustand, browser])])]);
  }

  /* ---------- Szene: Fehler-Tickets ---------- */
  function szeneFehler(sz) {
    var w = E('div', { class: 'tickets' });
    sz.karten.filter(sichtbar).forEach(function (k) {
      var code = O(k.loesung);
      var inhalt = E('div', { class: 't-loesung', hidden: 'hidden' }, [
        E('p', { html: '<b>' + (EINF() ? 'Ursache' : 'Ursache:') + '</b> ' + T(O(k.ursache) || k.ursache) }),
        code ? codeBlock({ code: code, titelHtml: '💻 ' + shellName(), erkl: [] }) : null,
        k.nachher ? E('p', { class: 'klein', html: T(k.nachher) }) : null]);
      var feld = E('textarea', { rows: '2', placeholder: EINF() ? 'Meine Idee: …' : 'Was vermutest du? (nur für dich)', 'aria-label': 'Eigene Vermutung' });
      var knopf = E('button', { type: 'button', class: 'knopf', text: '🔎 ' + (EINF() ? 'Ursache zeigen' : 'Ursache aufdecken') });
      knopf.addEventListener('click', function () { inhalt.hidden = !inhalt.hidden; knopf.textContent = inhalt.hidden ? '🔎 Ursache aufdecken' : '▲ Zuklappen'; });
      w.appendChild(E('div', { class: 'ticket' }, [E('div', { class: 't-kopf' }, [E('span', { class: 't-bild', text: k.bild }), E('div', {}, [E('code', { class: 't-sym', text: k.symptom }), E('div', { html: T(k.t) })])]), feld, knopf, inhalt]));
    });
    return w;
  }

  /* ---------- Skripte (Schritt 6) ---------- */
  function skripteBlock() {
    var w = E('div', { class: 'skripte' }), tabs = E('div', { class: 'seg', role: 'tablist' }), ziel = E('div');
    var erkl = ERKL_DOCKER.concat(ERKL_SKRIPT[S.os === 'linux' ? 'linux' : S.shell] || []);
    function zeige(ph, btn) {
      [].forEach.call(tabs.children, function (c) { c.setAttribute('aria-selected', 'false'); }); btn.setAttribute('aria-selected', 'true');
      var pfad = skriptPfad(ph.id); ziel.innerHTML = '';
      ziel.appendChild(codeBlock({ code: DATEIEN[pfad], datei: pfad, titelHtml: '📄 ' + esc(pfad), titelText: pfad, erkl: erkl, mehrfach: true }));
    }
    PHASEN.forEach(function (ph, n) {
      var b = E('button', { type: 'button', role: 'tab', text: ph.icon + ' ' + ph.name });
      b.addEventListener('click', function () { zeige(ph, b); });
      tabs.appendChild(b); if (!n) setTimeout(function () { zeige(ph, b); }, 0);
    });
    w.appendChild(tabs); w.appendChild(ziel);
    return w;
  }

  /* ---------- Fortschritt ---------- */
  function kontrollListe(k) { return (k.kontrolle.alle || []).concat(O({ linux: k.kontrolle.linux || [], windows: k.kontrolle.windows || [] }) || []); }
  function ckey(n, item) { return n + '|' + item[0]; }
  function erledigt(n) { var l = kontrollListe(P.schritte[n]); return l.length > 0 && l.every(function (it) { return S.checks[ckey(n, it)]; }); }
  function anzahlErledigt() { var a = 0; for (var n = 0; n < N; n++) if (erledigt(n)) a++; return a; }

  /* ---------- Kopf ---------- */
  function seg(name, optionen, wert, setze) {
    var g = E('div', { class: 'seg klein', role: 'group', 'aria-label': name });
    optionen.forEach(function (o) {
      var b = E('button', { type: 'button', text: o[1], 'aria-pressed': String(o[0] === wert), title: o[2] || '' });
      b.addEventListener('click', function () { setze(o[0]); speichern(); zeichne(true); });
      g.appendChild(b);
    });
    return g;
  }
  function kopf() {
    var k = document.getElementById('kopf'); k.innerHTML = '';
    k.appendChild(E('img', { class: 'schullogo', src: 'css/bsinfo-logo.png', alt: 'Logo BS Info München' }));
    k.appendChild(E('div', { class: 'titel' }, [E('h1', { text: '🔒 ' + P.titel }), E('div', { class: 'unter', text: P.untertitel })]));
    var schalter = E('div', { class: 'schalter' });
    schalter.appendChild(seg('Betriebssystem', [['linux', '🐧 Linux', 'Ubuntu / WSL2 mit Bash'], ['windows', '🪟 Windows', 'Windows mit CMD oder PowerShell']], S.os, function (v) { S.os = v; }));
    if (S.os === 'windows') schalter.appendChild(seg('Shell', [['cmd', 'CMD'], ['ps', 'PowerShell']], S.shell, function (v) { S.shell = v; }));
    schalter.appendChild(seg('Sprache', [['standard', 'Standard'], ['einfach', 'Einfach']], S.sprache, function (v) { S.sprache = v; }));
    k.appendChild(schalter);
    k.appendChild(E('div', { class: 'fortschritt', 'aria-live': 'polite', text: '✔ ' + anzahlErledigt() + ' / ' + N + ' ' + (EINF() ? 'fertig' : 'Schritte erledigt') }));
  }
  function tabs() {
    var t = document.getElementById('tabs'); t.innerHTML = '';
    var seiten = ['start'].concat(P.schritte.map(function (_, n) { return String(n + 1); })).concat(['ende']);
    seiten.forEach(function (s) {
      var n = +s, txt = s === 'start' ? '🏠 Start' : s === 'ende' ? '🏁 Abschluss' : s;
      var b = E('button', { type: 'button', class: 'tab' + (S.seite === s ? ' aktiv' : '') + (n && erledigt(n - 1) ? ' fertig' : ''), text: txt + (n && erledigt(n - 1) ? ' ✔' : ''), 'aria-current': S.seite === s ? 'page' : null, title: n ? P.schritte[n - 1].titel : '' });
      b.addEventListener('click', function () { gehe(s); });
      t.appendChild(b);
    });
  }
  function gehe(s) { S.seite = s; speichern(); zeichne(); window.scrollTo(0, 0); var h = document.getElementById('haupt'); if (h) h.focus({ preventScroll: true }); }

  /* ---------- Seiten ---------- */
  function karte(kl, kinder) { return E('section', { class: 'card ' + (kl || '') }, kinder); }
  function sprechblase(html) {
    return E('div', { class: 'jana' }, [E('div', { class: 'avatar', 'aria-hidden': 'true', text: '👩🏽‍💻' }), E('div', { class: 'blase' }, [E('div', { class: 'wer', text: P.figur.name + ' · ' + P.figur.rolle }), E('p', { html: html })])]);
  }
  function begriffKarte(w) {
    var g = P.glossar[w]; if (!g) return null;
    return E('div', { class: 'begriff' }, [E('b', { text: w }), E('span', { class: 'art', text: ' (' + g.art + ')' }), E('div', { text: T(g.t) })]);
  }
  function seiteStart() {
    var h = E('div');
    h.appendChild(karte('', [sprechblase(T(P.leitsituation))]));
    var os = karte('wahl', [E('h2', { text: EINF() ? 'Mit welchem System arbeitest du?' : 'Mit welchem Betriebssystem arbeitest du?' }),
      E('p', { class: 'klein', text: EINF() ? 'Du kannst oben jederzeit umschalten.' : 'Du kannst oben im Kopf jederzeit umschalten – Befehle und Skripte passen sich an.' })]);
    var g = E('div', { class: 'os-wahl' });
    [['linux', '🐧', 'Linux', EINF() ? 'Ubuntu oder WSL2 mit Bash' : 'Ubuntu oder WSL2 · Bash-Skripte (.sh)'], ['windows', '🪟', 'Windows', EINF() ? 'CMD oder PowerShell' : 'Docker Desktop · CMD (.cmd) oder PowerShell (.ps1)']].forEach(function (o) {
      var b = E('button', { type: 'button', class: 'os-karte' + (S.os === o[0] ? ' an' : ''), 'aria-pressed': String(S.os === o[0]) }, [E('span', { class: 'os-icon', text: o[1] }), E('b', { text: o[2] }), E('small', { text: o[3] })]);
      b.addEventListener('click', function () { S.os = o[0]; speichern(); zeichne(true); });
      g.appendChild(b);
    });
    os.appendChild(g);
    h.appendChild(os);
    var ueb = karte('', [E('h2', { text: EINF() ? 'Dein Weg in 8 Schritten' : 'Dein Weg in 8 Schritten' })]);
    var ol = E('ol', { class: 'weg' });
    P.schritte.forEach(function (s, n) {
      var li = E('li', { class: erledigt(n) ? 'fertig' : '' }, [E('button', { type: 'button', class: 'linkknopf', text: s.titel, onclick: function () { gehe(String(n + 1)); } }), E('span', { class: 'klein', text: ' – ' + T(s.kurz) + (erledigt(n) ? ' ✔' : '') })]);
      ol.appendChild(li);
    });
    ueb.appendChild(ol);
    ueb.appendChild(E('p', { class: 'klein', html: EINF() ? 'In jedem Schritt: Erklärung, Ausprobieren, Code zum Kopieren. Am Ende hakst du ab, was du gemacht hast.' : 'Jeder Schritt erklärt <b>warum</b>, lässt dich etwas <b>ausprobieren</b> und zeigt den <b>Code zum Kopieren</b>. Unten hakst du ab, was du an deinem Rechner erledigt hast. Es gibt keinen Test – der Lernpfad ist abgeschlossen, wenn alle Schritte abgehakt sind.' }));
    h.appendChild(ueb);
    var vorab = karte('', [E('h2', { text: EINF() ? 'Wichtige Wörter vorab' : 'Wichtige Begriffe vorab' })]);
    P.vorab.forEach(function (w) { vorab.appendChild(begriffKarte(w)); });
    h.appendChild(vorab);
    return h;
  }
  function seiteSchritt(n) {
    var s = P.schritte[n], h = E('div');
    CODE = {};
    h.appendChild(karte('schritt-kopf', [E('div', { class: 'nr', text: 'Schritt ' + (n + 1) + ' von ' + N }), E('h2', { text: s.titel }), E('p', { class: 'kurz', text: T(s.kurz) })]));
    h.appendChild(karte('', [sprechblase(T(s.warum))]));
    // Bausteine zuerst erzeugen (Registrierung der Codeblöcke für die Szene), Szene davor einhängen
    var bl = E('div');
    s.bloecke.filter(sichtbar).forEach(function (b) {
      if (b.typ === 'text') bl.appendChild(karte('text', [E('p', { html: T(O(b.t) || b.t) })]));
      else if (b.typ === 'befehl') {
        var code = O(b.code); if (!code) return;
        bl.appendChild(codeBlock({ code: code, titelHtml: '💻 ' + esc(T(b.titel)) + ' <span class="shell">' + shellName() + '</span>', titelText: T(b.titel), erkl: b.erkl, hinweis: b.hinweis ? T(b.hinweis) : null, schluessel: b.id }));
      } else if (b.typ === 'datei') bl.appendChild(codeBlock({ code: DATEIEN[b.pfad], datei: b.pfad, titelHtml: '📄 ' + esc(b.pfad), titelText: b.pfad, erkl: b.erkl, schluessel: b.pfad }));
      else if (b.typ === 'skripte') bl.appendChild(skripteBlock());
    });
    if (s.szene) {
      var sz = s.szene, inhalt = sz.typ === 'ablauf' ? szeneAblauf(sz) : sz.typ === 'ordner' ? szeneOrdner() : sz.typ === 'lebenszyklus' ? szeneLebenszyklus(sz) : szeneFehler(sz);
      h.appendChild(karte('szene', [E('h3', { text: '🎬 ' + T(sz.titel) }), inhalt]));
    }
    if (bl.children.length) h.appendChild(karte('umsetzung', [E('h3', { text: EINF() ? '🛠️ So machst du es' : '🛠️ Durchführung' }), bl]));
    // Kontrolle
    var kl = kontrollListe(s), kon = karte('kontrolle', [E('h3', { text: EINF() ? '✅ Kontrolle: Hast du das?' : '✅ Kontrolle und Ergebnis' })]);
    kl.forEach(function (it) {
      var key = ckey(n, it);
      var cb = E('input', { type: 'checkbox', checked: S.checks[key] ? 'checked' : null });
      cb.addEventListener('change', function () { S.checks[key] = cb.checked; if (!cb.checked) delete S.checks[key]; speichern(); kopf(); tabs(); status(); });
      kon.appendChild(E('label', { class: 'check' }, [cb, E('span', { text: T(it) })]));
    });
    var st = E('div', { class: 'status', 'aria-live': 'polite' });
    function status() { var f = erledigt(n); st.textContent = f ? (EINF() ? '✔ Schritt fertig!' : '✔ Schritt erledigt!') : (EINF() ? 'Hake alles ab, wenn du fertig bist.' : 'Hake ab, sobald du es an deinem Rechner geschafft hast.'); st.classList.toggle('ok', f); }
    status(); kon.appendChild(st);
    h.appendChild(kon);
    // Mitdenken
    var m = s.mitdenken, akey = String(n);
    var ta = E('textarea', { rows: '3', placeholder: EINF() ? (m.satz || '') : 'Deine Antwort in eigenen Worten …', 'aria-label': 'Deine Antwort' });
    ta.value = S.antworten[akey] || '';
    ta.addEventListener('input', function () { S.antworten[akey] = ta.value; });
    ta.addEventListener('change', speichern);
    var muster = E('details', { class: 'muster' }, [E('summary', { text: EINF() ? 'Lösung zeigen' : 'Musterantwort zeigen' }), E('p', { text: T(m.muster) })]);
    h.appendChild(karte('mitdenken', [E('h3', { text: '🤔 ' + (EINF() ? 'Denk mit' : 'Mitdenken') }), E('p', { class: 'frage', text: T(m.frage) }),
      EINF() && m.satz ? E('p', { class: 'klein', text: 'Satzanfang: ' + m.satz }) : null, ta, muster]));
    // Profi
    if (s.profi) h.appendChild(E('details', { class: 'card profi' }, [E('summary', { html: '🚀 <b>Profi</b> – ' + (EINF() ? 'Mehr für Schnelle (freiwillig)' : 'mehr Hintergrund und eine Knobelaufgabe (freiwillig)') }), E('div', { html: O(s.profi) })]));
    // Begriffe
    if (s.begriffe && s.begriffe.length) {
      var gl = karte('glossar', [E('h3', { text: '📖 ' + (EINF() ? 'Wörter in diesem Schritt' : 'Begriffe in diesem Schritt') })]);
      s.begriffe.forEach(function (w) { gl.appendChild(begriffKarte(w)); });
      h.appendChild(gl);
    }
    return h;
  }
  function seiteEnde() {
    var h = E('div'), a = anzahlErledigt();
    h.appendChild(karte('', [sprechblase(a === N ? (EINF() ? 'Super! Deine App läuft mit HTTPS. Hol dir dein Lernheft.' : 'Stark – du hast alle Schritte geschafft. Die App läuft lokal über HTTPS, genau wie später im Betrieb. Nimm dir dein Lernheft mit.')
      : (EINF() ? 'Du hast ' + a + ' von ' + N + ' Schritten fertig. Die anderen fehlen noch.' : 'Du hast ' + a + ' von ' + N + ' Schritten abgehakt. Die offenen findest du oben in der Leiste.'))]));
    var tab = E('table', { class: 'blick' }, [E('thead', {}, [E('tr', {}, [E('th', { text: 'Phase' }), E('th', { text: 'Skript (' + shellName() + ')' }), E('th', { text: 'Docker-Befehl' })])])]);
    var tb = E('tbody'), dk = { build: 'docker compose build', create: 'docker compose create', run: 'docker compose up -d --wait', stop: 'docker compose stop', remove: 'docker compose down --rmi all' };
    PHASEN.forEach(function (ph) { tb.appendChild(E('tr', {}, [E('td', { text: ph.icon + ' ' + ph.name }), E('td', {}, [E('code', { text: aufruf(ph.id) })]), E('td', {}, [E('code', { text: dk[ph.id] })])])); });
    tab.appendChild(tb);
    h.appendChild(karte('', [E('h2', { text: EINF() ? 'Auf einen Blick' : 'Auf einen Blick: der Lebenszyklus' }), E('div', { class: 'tabelle' }, [tab]),
      E('ul', { class: 'merke' }, [
        E('li', { html: EINF() ? 'Nginx macht HTTPS. Javalin ist nur im Docker-Netz.' : '<b>Nginx</b> terminiert TLS, <b>Javalin</b> ist nur im Docker-Netz erreichbar (kein <code>ports:</code>).' }),
        E('li', { html: EINF() ? 'Der Browser braucht: passenden Namen + bekannte CA.' : 'Vertrauen braucht <b>passenden Namen</b> im Zertifikat und die <b>Root-CA im Vertrauensspeicher</b> des Browser-Systems.' }),
        E('li', { html: EINF() ? 'Schlüssel nie in Git oder ins Image.' : 'Private Schlüssel nie in Git oder ins Image – <code>.gitignore</code> und <code>.dockerignore</code>.' }),
        E('li', { html: EINF() ? 'Im Docker-Netz: Service-Name statt localhost.' : 'Im Docker-Netz heißt der Zielrechner wie der <b>Service</b> (<code>javalin</code>), nicht <code>localhost</code>.' }),
        E('li', { html: EINF() ? 'service_healthy: Nginx wartet auf Javalin.' : '<code>depends_on</code> + <code>condition: service_healthy</code>: Nginx wartet, bis Javalin wirklich bereit ist.' })
      ])]));
    var mit = karte('', [E('h2', { text: EINF() ? 'Zum Mitnehmen' : 'Zum Mitnehmen' })]);
    var zipb = E('button', { type: 'button', class: 'knopf', text: '📦 ' + (EINF() ? 'Projekt als ZIP' : 'Ganzes Projekt local-https-demo als ZIP') });
    zipb.addEventListener('click', function () { herunterladen('local-https-demo.zip', projektZip()); });
    var reihe = E('div', { class: 'reihe' }, [zipb]);
    if (window.PDF) reihe.appendChild(PDF.knopf(EINF() ? 'Lernheft als PDF erstellen' : 'Mein Lernheft als PDF erstellen', lernheft, function (x) { var w = window.open('', '_blank'); if (w) { w.document.write('<title>' + esc(x.titel) + '</title>' + x.html); w.document.close(); w.print(); } }));
    mit.appendChild(reihe);
    mit.appendChild(E('p', { class: 'klein', text: EINF() ? 'Im ZIP sind alle Dateien. Der Ordner certs/ ist leer. Die Zertifikate machst du selbst (Schritt 4).' : 'Das ZIP enthält alle Dateien aus den Schritten 2–6 mit Skripten für Linux und Windows. Der Ordner certs/ ist leer: Zertifikate erzeugst du selbst (Schritt 4). Das Lernheft enthält deine Haken, deine Antworten und die Befehle für ' + (S.os === 'linux' ? 'Linux' : 'Windows (' + shellName() + ')') + '.' }));
    h.appendChild(mit);
    var gl = karte('glossar', [E('h2', { text: '📖 ' + (EINF() ? 'Alle Wörter' : 'Glossar') })]);
    Object.keys(P.glossar).sort(function (a, b) { return a.localeCompare(b, 'de'); }).forEach(function (w) { gl.appendChild(begriffKarte(w)); });
    h.appendChild(gl);
    var li = karte('', [E('h2', { text: EINF() ? 'Mehr lesen' : 'Weiterführende Dokumentation' })]), ul = E('ul');
    P.links.forEach(function (l) { ul.appendChild(E('li', {}, [E('a', { href: l[1], target: '_blank', rel: 'noopener', text: l[0] })])); });
    li.appendChild(ul); li.appendChild(E('p', { class: 'klein', text: 'Grundlage: Praxisleitfaden „Lokales HTTPS mit Nginx und Javalin“ von Michael Niedermair (mit KI-Unterstützung).' }));
    h.appendChild(li);
    return h;
  }

  /* ---------- Lernheft ---------- */
  function lernheft() {
    var h = '<div style="display:flex;align-items:center;gap:14px;border-bottom:2px solid #4338ca;padding-bottom:8px;margin-bottom:12px"><img src="css/bsinfo-logo.png" style="height:48px" alt=""><div><div style="font-size:20px;font-weight:700">Lernheft: ' + esc(P.titel) + '</div><div style="color:#555">Mein Weg: ' + (S.os === 'linux' ? 'Linux (Bash)' : 'Windows (' + shellName() + ')') + ' · erledigt: ' + anzahlErledigt() + ' / ' + N + '</div></div></div>';
    P.schritte.forEach(function (s, n) {
      h += '<h3 style="margin:14px 0 4px;color:#3730a3">Schritt ' + (n + 1) + ': ' + esc(s.titel) + (erledigt(n) ? ' ✔' : '') + '</h3>';
      h += '<p style="margin:2px 0">' + T(s.kurz) + '</p><ul style="margin:4px 0">';
      kontrollListe(s).forEach(function (it) { h += '<li>' + (S.checks[ckey(n, it)] ? '☑' : '☐') + ' ' + esc(T(it)) + '</li>'; });
      h += '</ul><p style="margin:4px 0"><b>Mitdenken:</b> ' + esc(T(s.mitdenken.frage)) + '</p>';
      h += '<p style="margin:2px 0 2px 12px"><i>Meine Antwort:</i> ' + (S.antworten[String(n)] ? esc(S.antworten[String(n)]) : '–') + '</p>';
      h += '<p style="margin:2px 0 2px 12px;color:#555"><i>Muster:</i> ' + esc(T(s.mitdenken.muster)) + '</p>';
    });
    h += '<h3 style="margin:14px 0 4px;color:#3730a3">Meine Befehle (' + shellName() + ')</h3><table style="border-collapse:collapse;width:100%">';
    PHASEN.forEach(function (ph) { h += '<tr><td style="border:1px solid #ccc;padding:3px 6px">' + ph.name + '</td><td style="border:1px solid #ccc;padding:3px 6px;font-family:monospace">' + esc(aufruf(ph.id)) + '</td></tr>'; });
    h += '</table>';
    return { titel: 'Lernheft ' + P.titel, html: h, datei: 'lernheft-https-nginx-javalin.pdf' };
  }

  /* ---------- ZIP (ohne Kompression) ---------- */
  var CRC = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function projektZip() {
    var enc = new TextEncoder(), teile = [], zentral = [], off = 0, anzahl = 0;
    var d = new Date(), zeit = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), datum = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    function u16(v) { return [v & 255, (v >>> 8) & 255]; }
    function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
    function add(name, text, ausfuehrbar) {
      var nb = enc.encode(name), db = text === null ? new Uint8Array(0) : enc.encode(text), crc = crc32(db), ordner = text === null;
      var lokal = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(zeit), u16(datum), u32(crc), u32(db.length), u32(db.length), u16(nb.length), u16(0));
      teile.push(new Uint8Array(lokal), nb, db);
      var attr = ordner ? ((0x41ED << 16) | 0x10) : ((ausfuehrbar ? 0x81ED : 0x81A4) << 16);
      zentral.push(new Uint8Array([].concat(u32(0x02014b50), u16(0x0314), u16(20), u16(0x0800), u16(0), u16(zeit), u16(datum), u32(crc), u32(db.length), u32(db.length), u16(nb.length), u16(0), u16(0), u16(0), u16(0), u32(attr >>> 0), u32(off))), nb);
      off += lokal.length + nb.length + db.length; anzahl++;
    }
    var wurzel = 'local-https-demo/';
    add(wurzel, null); add(wurzel + 'certs/', null);
    Object.keys(DATEIEN).forEach(function (p) { add(wurzel + p, DATEIEN[p], /\.sh$/.test(p)); });
    add(wurzel + 'LIESMICH.txt', 'Lokales HTTPS mit Nginx und Javalin – Projekt aus dem Lernpfad\n\n' +
      '1. Zertifikate erzeugen (Schritt 4), im Ordner local-https-demo:\n   mkcert -install\n   mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1\n\n' +
      '2a. Ubuntu / WSL2:\n   chmod +x scripts/ubuntu/*.sh\n   ./scripts/ubuntu/build_docker_nginx_javalin.sh\n   ./scripts/ubuntu/create_docker_nginx_javalin.sh\n   ./scripts/ubuntu/run_docker_nginx_javalin.sh\n\n' +
      '2b. Windows (CMD):\n   .\\scripts\\windows\\build_docker_nginx_javalin.cmd\n   .\\scripts\\windows\\create_docker_nginx_javalin.cmd\n   .\\scripts\\windows\\run_docker_nginx_javalin.cmd\n   (PowerShell: dieselben Namen mit .ps1)\n\n' +
      '3. Browser: https://127.0.0.1:8443/\n');
    var zLen = zentral.reduce(function (s, x) { return s + x.length; }, 0);
    var ende = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(anzahl), u16(anzahl), u32(zLen), u32(off), u16(0)));
    return new Blob(teile.concat(zentral, [ende]), { type: 'application/zip' });
  }
  window.LERNPFAD_TEST = { zip: projektZip, zustand: function () { return S; }, erledigt: anzahlErledigt };

  /* ---------- Leiste + Zeichnen ---------- */
  function leiste() {
    var l = document.getElementById('leiste'); l.innerHTML = '';
    var seiten = ['start'].concat(P.schritte.map(function (_, n) { return String(n + 1); })).concat(['ende']);
    var i = seiten.indexOf(S.seite);
    var zur = i > 0 ? E('button', { type: 'button', class: 'knopf zweit', text: '← ' + (i === 1 ? 'Start' : i === seiten.length - 1 ? 'Schritt ' + N : 'Schritt ' + (i - 1)) }) : E('span');
    if (i > 0) zur.addEventListener('click', function () { gehe(seiten[i - 1]); });
    l.appendChild(zur);
    if (i < seiten.length - 1) {
      var nx = seiten[i + 1], vor = E('button', { type: 'button', class: 'knopf weiter', text: (nx === 'ende' ? (EINF() ? 'Zum Abschluss' : 'Zum Abschluss') : i === 0 ? (EINF() ? 'Los: Schritt 1' : 'Mit Schritt 1 beginnen') : 'Weiter: Schritt ' + nx) + ' →' });
      vor.addEventListener('click', function () { gehe(nx); });
      l.appendChild(vor);
    }
  }
  function zeichne(halten) {
    var y = window.scrollY;
    document.documentElement.lang = 'de';
    document.body.classList.toggle('einfach', EINF());
    kopf(); tabs();
    var m = document.getElementById('haupt'); m.innerHTML = '';
    var n = +S.seite;
    m.appendChild(S.seite === 'start' ? seiteStart() : S.seite === 'ende' ? seiteEnde() : (n >= 1 && n <= N ? seiteSchritt(n - 1) : seiteStart()));
    leiste();
    document.title = P.titel + (n ? ' – Schritt ' + n : '');
    if (halten) window.scrollTo(0, y);
  }

  laden();
  if (!/^(start|ende|[1-9])$/.test(S.seite)) S.seite = 'start';
  zeichne();
})();
