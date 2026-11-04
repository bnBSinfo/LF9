/* =====================================================================
   „Serverraum 0“ – Docker-Einführung als Escape mit Terminal
   Spielprinzip: Die Lernenden sitzen im Serverraum des TSV Lechwiesen und
   tippen echte Docker-Befehle in ein simuliertes Terminal. Das Terminal
   antwortet wie in echt (Ausgaben, Fehlermeldungen), die Ansicht „Server“
   zeigt Images und Container. Jeder geschaffte Raum öffnet ein Schloss der
   Tür; danach folgt die passende Übung in der echten VM.
   Raum 1 steht hier, Räume 2–5 in js/raeume.js, der Nachweis in js/nachweis.js.
   Alle Personen, Firmen und Vereine sind erfunden.

   Für paket.py (liest die ersten Treffer in dieser Datei fürs Manifest):
   id: 'lf9-docker-einfuehrung', titel: 'Docker-Einführung' – bei Änderung
   auch unten in window.PAKET anpassen.
   ===================================================================== */

/* ---------- Personen ---------- */
var JANA = { name: 'Jana Petrov', rolle: 'Ausbilderin bei Hafenblick IT-Service', aussehen: { haut: 2, haare: 'dunkelbraun', frisur: 'zopf', kleidung: '#0e7490', brille: true } };
var TOMAS = { name: 'Tomás Reiter', rolle: 'Vorsitzender des TSV Lechwiesen', aussehen: { haut: 1, haare: 'grau', frisur: 'kurz', kleidung: '#15803d' } };

/* Texte in zwei Sprachstufen: [Standard, Einfach] – erst beim Zeichnen auswählen */
function T(paar) { return typeof paar === 'string' ? paar : L(paar[0], paar[1]); }

/* ---------- Der simulierte Docker-Host ---------- */
var REGISTRY = {
  'hello-world': { id: '74cc54e27dc4', groesse: '13.3kB', cmd: '"/hello"', laeuft: false },
  'nginx:alpine': { id: '4a0e5c3d1b2f', groesse: '52.5MB', cmd: '"/docker-entrypoint.…"', laeuft: true },
  'ubuntu:22.04': { id: '97271d29cb79', groesse: '77.9MB', cmd: '"/bin/bash"', laeuft: false }
};
var NAMEN = ['eager_kepler', 'quirky_turing', 'brave_lovelace', 'sleepy_hopper', 'jolly_curie', 'dreamy_noether', 'zen_hamilton', 'vibrant_euler'];
var HELLO = ['', 'Hello from Docker!', 'This message shows that your installation appears to be working correctly.', '', 'To generate this message, Docker took the following steps:', ' 1. The Docker client contacted the Docker daemon.', ' 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.', ' 3. The Docker daemon created a new container from that image which runs the', '    executable that produces the output you are currently reading.', ' 4. The Docker daemon streamed that output to the Docker client.', ''];

/* Erklärungen zu Fehlermeldungen („Was heißt das?“) */
var ERKL = {
  konflikt: ['Der Name gehört schon einem anderen Container. Ein Name passt nur zu genau einem Container. Lösche den alten Container oder nimm einen anderen Namen.', 'Den Namen gibt es schon. Ein Name gehört nur zu 1 Container. Nimm einen anderen Namen. Oder lösche den alten Container.'],
  rmiKonflikt: ['Docker löscht kein Image, solange noch ein Container daraus besteht – auch kein beendeter. Erst die Container mit <code>docker rm</code> löschen, dann das Image mit <code>docker rmi</code>.', 'Aus dem Image gibt es noch Container. Darum löscht Docker das Image nicht. Lösche zuerst die Container mit <code>docker rm</code>.'],
  keinContainer: ['Einen Container mit diesem Namen gibt es nicht. Schau mit <code>docker ps -a</code> nach, wie die Container heißen.', 'Diesen Container gibt es nicht. Schau mit <code>docker ps -a</code> nach.'],
  keinImage: ['Dieses Image gibt es weder auf dem Host noch in der Registry. Prüfe die Schreibweise.', 'Dieses Image gibt es nicht. Prüfe den Namen.'],
  keinBefehl: ['Diesen Docker-Befehl gibt es nicht. Prüfe die Schreibweise, z. B. <code>ps</code>, <code>images</code>, <code>run</code>, <code>rm</code>.', 'Diesen Befehl kennt Docker nicht. Prüfe die Schreibweise.'],
  keinProgramm: ['Die Shell kennt dieses Programm nicht. Docker-Befehle beginnen immer mit <code>docker</code>.', 'Das Programm gibt es nicht. Docker-Befehle beginnen mit <code>docker</code>.'],
  argument: ['Dem Befehl fehlt eine Angabe, z. B. der Name des Images oder Containers.', 'Es fehlt etwas. Zum Beispiel der Name vom Image.']
};

function neuerHost() {
  return { images: {}, container: [], zaehler: 0 };
}
function hostAusfuehren(h, zeile) {
  var w = zeile.trim().split(/\s+/).filter(Boolean), aus = [], fehler = null;
  function f(text, art) { aus.push({ t: text, art: art ? { fehler: 'sr-fe', kopf: 'sr-ko' }[art] || art : '' }); }
  function id12() { var basis = 'c3a1f9b27e40d58b6a1e2f3c4d5e6f708192a3b4'; h.zaehler++; return (basis.slice(h.zaehler % 20) + basis).slice(0, 12); }
  function findeC(n) { return h.container.filter(function (c) { return c.name === n || c.id.indexOf(n) === 0; })[0]; }
  if (!w.length) return { aus: aus };
  if (w[0] === 'clear') return { aus: [], leeren: true };
  if (w[0] === 'ls') { f(''); return { aus: aus }; }
  if (w[0] === 'pwd') { f('/home/azubi'); return { aus: aus }; }
  if (w[0] === 'cd') return { aus: aus };
  if (w[0] !== 'docker') { f('bash: ' + w[0] + ': command not found', 'fehler'); return { aus: aus, fehler: 'keinProgramm' }; }
  var sub = w[1];
  if (!sub) { f('Usage:  docker [OPTIONS] COMMAND'); f('A self-sufficient runtime for containers'); return { aus: aus }; }
  if (sub === 'version') {
    ['Client:', ' Version:           27.3.1', ' API version:       1.47', '', 'Server: Docker Engine - Community', ' Engine:', '  Version:          27.3.1', '  API version:      1.47 (minimum version 1.24)'].forEach(function (z) { f(z); });
    return { aus: aus };
  }
  if (sub === 'pull' || sub === 'run') {
    var name = null, ports = [], d = false, rest = w.slice(2), img = null;
    for (var i = 0; i < rest.length; i++) {
      if (rest[i] === '--name') { name = rest[++i]; continue; }
      if (rest[i] === '-p') { ports.push(rest[++i]); continue; }
      if (rest[i] === '-d') { d = true; continue; }
      if (rest[i] === '--rm' || rest[i] === '-it' || rest[i] === '-i' || rest[i] === '-t') continue;
      if (!img) img = rest[i];
    }
    if (!img) { f('"docker ' + sub + '" requires at least 1 argument.', 'fehler'); return { aus: aus, fehler: 'argument' }; }
    var schl = img.indexOf(':') < 0 ? (REGISTRY[img] ? img : img + ':latest') : img;
    if (!REGISTRY[schl] && REGISTRY[img]) schl = img;
    var reg = REGISTRY[schl] || REGISTRY[img];
    var anzeige = img.indexOf(':') < 0 ? img + ':latest' : img;
    if (sub === 'run' && name && findeC(name) && findeC(name).name === name) {
      f('docker: Error response from daemon: Conflict. The container name "/' + name + '" is already in use by container "' + findeC(name).id + '". You have to remove (or rename) that container to be able to reuse that name.', 'fehler');
      return { aus: aus, fehler: 'konflikt' };
    }
    if (!h.images[schl]) {
      if (!reg) {
        if (sub === 'run') f("Unable to find image '" + anzeige + "' locally");
        f('docker: Error response from daemon: pull access denied for ' + img.split(':')[0] + ', repository does not exist or may require \'docker login\'.', 'fehler');
        return { aus: aus, fehler: 'keinImage' };
      }
      if (sub === 'run') f("Unable to find image '" + anzeige + "' locally");
      f((anzeige.split(':')[1]) + ': Pulling from library/' + img.split(':')[0]);
      f('Digest: sha256:d211f485f2dd1dee407a80973c8f129f00d54604d2c90732e8e320e5038a0348');
      f('Status: Downloaded newer image for ' + anzeige);
      h.images[schl] = { name: img.split(':')[0], tag: anzeige.split(':')[1], id: reg.id, groesse: reg.groesse, neu: true };
    } else if (sub === 'pull') {
      f((anzeige.split(':')[1]) + ': Pulling from library/' + img.split(':')[0]); f('Status: Image is up to date for ' + anzeige);
    }
    if (sub === 'pull') return { aus: aus, gezogen: true };
    var c = { id: id12(), name: name || NAMEN[(h.container.length + h.zaehler) % NAMEN.length], image: img, status: reg.laeuft || d ? 'up' : 'exited', ports: ports, neu: true };
    h.container.push(c);
    if (img === 'hello-world') HELLO.forEach(function (z) { f(z); });
    else if (d) f(c.id + 'f0e1d2c3b4a5968778695a4b3c2d1e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4');
    return { aus: aus, gestartet: c };
  }
  if (sub === 'ps') {
    var alle = w.indexOf('-a') >= 0 || w.indexOf('--all') >= 0;
    var zeilen = h.container.filter(function (c) { return alle || c.status === 'up'; });
    f('CONTAINER ID   IMAGE         COMMAND      STATUS          PORTS     NAMES', 'kopf');
    zeilen.forEach(function (c) {
      var reg = REGISTRY[c.image] || REGISTRY[c.image + ':latest'] || { cmd: '""' };
      f(c.id + '   ' + (c.image + '            ').slice(0, 12) + '  ' + (reg.cmd + '           ').slice(0, 11) + '  ' + (c.status === 'up' ? 'Up 1 minute     ' : 'Exited (0)      ') + (c.ports.join(',') + '          ').slice(0, 10) + c.name);
    });
    return { aus: aus, ps: { alle: alle, anzahl: zeilen.length } };
  }
  if (sub === 'images') {
    f('REPOSITORY    TAG       IMAGE ID       SIZE', 'kopf');
    Object.keys(h.images).forEach(function (k) { var b = h.images[k]; f((b.name + '              ').slice(0, 14) + (b.tag + '          ').slice(0, 10) + b.id + '   ' + b.groesse); });
    return { aus: aus, images: true };
  }
  if (sub === 'rm') {
    var namen = w.slice(2).filter(function (x) { return x[0] !== '-'; }), force = w.indexOf('-f') >= 0, geloescht = [];
    if (!namen.length) { f('"docker rm" requires at least 1 argument.', 'fehler'); return { aus: aus, fehler: 'argument' }; }
    namen.forEach(function (n) {
      var c = findeC(n);
      if (!c) { f('Error response from daemon: No such container: ' + n, 'fehler'); fehler = 'keinContainer'; return; }
      if (c.status === 'up' && !force) { f('Error response from daemon: cannot remove container "/' + c.name + '": container is running: stop the container before removing or force remove', 'fehler'); fehler = 'laeuft'; return; }
      h.container.splice(h.container.indexOf(c), 1); geloescht.push(c.name); f(n);
    });
    return { aus: aus, fehler: fehler, geloescht: geloescht };
  }
  if (sub === 'container' && w[2] === 'prune') {
    var weg = h.container.filter(function (c) { return c.status !== 'up'; });
    if (w.indexOf('-f') < 0 && w.indexOf('--force') < 0) { f('WARNING! This will remove all stopped containers.'); f('Are you sure you want to continue? [y/N] (im Spiel: mit -f bestätigen)'); return { aus: aus }; }
    f('Deleted Containers:'); weg.forEach(function (c) { f(c.id); h.container.splice(h.container.indexOf(c), 1); });
    f(''); f('Total reclaimed space: 0B');
    return { aus: aus, geloescht: weg.map(function (c) { return c.name; }) };
  }
  if (sub === 'rmi') {
    var im = w[2];
    if (!im) { f('"docker rmi" requires at least 1 argument.', 'fehler'); return { aus: aus, fehler: 'argument' }; }
    var key = h.images[im] ? im : h.images[im + ':latest'] ? im + ':latest' : null;
    if (!key) { f('Error response from daemon: No such image: ' + im, 'fehler'); return { aus: aus, fehler: 'keinImage' }; }
    var nutzer = h.container.filter(function (c) { return c.image === im || c.image + ':latest' === key || c.image === key; })[0];
    if (nutzer) { f('Error response from daemon: conflict: unable to remove repository reference "' + im + '" (must force) - container ' + nutzer.id + ' is using its referenced image ' + h.images[key].id, 'fehler'); return { aus: aus, fehler: 'rmiKonflikt' }; }
    f('Untagged: ' + im); f('Deleted: sha256:' + h.images[key].id + '…'); delete h.images[key];
    return { aus: aus };
  }
  f("docker: '" + sub + "' is not a docker command.", 'fehler'); f("See 'docker --help'", 'fehler');
  return { aus: aus, fehler: 'keinBefehl' };
}

/* ---------- Räume (Level) ---------- */
function hatName(h, n) { return h.container.some(function (c) { return c.name === n; }); }
function anzahlAus(h, img) { return h.container.filter(function (c) { return c.image === img; }).length; }

var RAEUME = [
  { id: 'S1', nr: 1, titel: ['Raum 1 · Hallo, Container!', 'Raum 1 · Hallo, Container!'], vm: 'Übung 1 hello-world',
    auftrag: ['Bevor wir den Verein beglücken: Starte deinen ersten Container und finde heraus, wo er geblieben ist.', 'Starte deinen ersten Container. Finde dann heraus: Wo ist der Container jetzt?'],
    regeln: [
      ['Ein <b>Image</b> ist der Bauplan, ein <b>Container</b> ist das, was daraus läuft – wie Klasse und Objekt.', 'Ein <b>Image</b> ist ein Bauplan. Ein <b>Container</b> läuft aus dem Bauplan. Wie Klasse und Objekt.'],
      ['Jedes <code>docker run</code> baut aus dem Image einen <b>neuen</b> Container.', 'Jedes <code>docker run</code> macht einen <b>neuen</b> Container.'],
      ['<code>docker ps</code> zeigt nur <b>laufende</b> Container, <code>docker ps -a</code> zeigt <b>alle</b>.', '<code>docker ps</code> zeigt nur Container, die <b>laufen</b>. <code>docker ps -a</code> zeigt <b>alle</b>.'],
      ['Fehlt ein Image, lädt <code>docker run</code> es aus der <b>Registry</b>. Beim zweiten Mal liegt es schon da.', 'Fehlt das Image? Dann lädt Docker es aus dem Internet. Beim 2. Mal ist es schon da.'],
      ['<code>docker rm</code> löscht Container, <code>docker rmi</code> löscht Images.', '<code>docker rm</code> löscht Container. <code>docker rmi</code> löscht Images.']
    ],
    bausteine: ['docker', 'run', 'ps', '-a', 'images', 'rm', 'rmi', '--name', 'hello-world', 'hallo1', 'hallo2'],
    /* Vorführung: Jana tippt vor (geführter erster Fall) */
    demo: [
      { cmd: 'docker run hello-world', warum: ['Das Image war noch nicht auf dem Host. Docker holt es aus der Registry („Pulling“). Dann startet ein Container, schreibt seinen Gruß und beendet sich.', 'Das Image war noch nicht da. Docker lädt es aus dem Internet. Dann läuft der Container kurz und hört auf.'] },
      { cmd: 'docker ps', warum: ['Die Liste ist leer. Der Container ist aber nicht weg …', 'Die Liste ist leer. Aber der Container ist nicht weg …'], selbst: true },
      { cmd: 'docker ps -a', warum: ['hello-world hat sich nach dem Gruß beendet („Exited“). <code>docker ps</code> zeigt nur laufende Container, mit <code>-a</code> siehst du alle.', 'Der Container hat aufgehört („Exited“). <code>docker ps</code> zeigt nur Container, die laufen. Mit <code>-a</code> siehst du alle.'] }
    ],
    selbsterklaerung: ['Warum ist die Liste bei <code>docker ps</code> leer, obwohl Docker den Container gerade gestartet hat?', 'Warum ist die Liste bei <code>docker ps</code> leer? Docker hat den Container doch gerade gestartet.'],
    satzanfaenge: ['Die Liste ist leer, weil der Container …', '„docker ps“ zeigt nur …'],
    begruessung: ['Willkommen im Serverraum 0. Jana zeigt dir den ersten Befehl.', 'Willkommen. Jana zeigt dir den 1. Befehl.'],
    demoText: ['Schau zu, wie Jana den ersten Container startet. Danach bist du dran.', 'Schau zu. Jana startet den 1. Container. Dann bist du dran.'],
    geschafftText: ['Schloss 1 ist offen: Du unterscheidest Image und Container.', 'Schloss 1 ist offen.'],
    faelle: [
      { id: 'r1a', typ: 'befehl', auftrag: ['Starte <code>hello-world</code> ein zweites Mal.', 'Starte <code>hello-world</code> noch einmal.'],
        loesung: ['docker run hello-world'],
        ziel: function (h, r) { return !!(r.gestartet && r.gestartet.image === 'hello-world') && anzahlAus(h, 'hello-world') >= 2; },
        tipp: ['Das ist derselbe Befehl, den Jana getippt hat.', 'Tippe denselben Befehl wie Jana.'] },
      { id: 'r1b', typ: 'wahl', auftrag: ['Schau rechts auf den Server: Wie viele Images und wie viele Container gibt es jetzt?', 'Schau rechts auf den Server. Wie viele Images gibt es? Wie viele Container?'],
        optionen: [
          { t: ['1 Image, 2 Container', '1 Image, 2 Container'], richtig: true },
          { t: ['1 Image, 1 Container – er wurde neu gestartet', '1 Image, 1 Container. Er wurde neu gestartet.'], fb: ['Jedes <code>docker run</code> macht einen <b>neuen</b> Container aus demselben Image. Der alte bleibt beendet in der Liste.', 'Jedes <code>docker run</code> macht einen <b>neuen</b> Container. Der alte Container bleibt da.'] },
          { t: ['2 Images, 2 Container', '2 Images, 2 Container'], fb: ['Das Image wurde nur beim ersten Mal geladen. Beide Container stammen aus demselben Bauplan.', 'Docker lädt das Image nur 1-mal. Beide Container kommen aus demselben Image.'] }
        ] },
      { id: 'r1c', typ: 'wahl', auftrag: ['Warum ging der zweite Start schneller?', 'Warum ging der 2. Start schneller?'],
        optionen: [
          { t: ['Das Image lag schon auf dem Host – Docker musste nichts herunterladen.', 'Das Image war schon da. Docker musste nichts laden.'], richtig: true },
          { t: ['Der erste Container lief noch und wurde wiederverwendet.', 'Der 1. Container lief noch. Docker hat ihn noch einmal benutzt.'], fb: ['Der erste Container war schon beendet („Exited“). Schau im Terminal: Beim zweiten Mal fehlt die Zeile „Pulling from …“.', 'Der 1. Container war schon beendet. Schau ins Terminal: Beim 2. Mal steht dort kein „Pulling“.'] },
          { t: ['Docker merkt sich die Ausgabe und zeigt sie nur noch an.', 'Docker zeigt nur die alte Ausgabe noch einmal.'], fb: ['Der Container läuft wirklich neu und schreibt den Text neu. Gespart wird nur das Herunterladen des Images.', 'Der Container läuft wirklich neu. Docker spart nur das Laden vom Image.'] }
        ] },
      { id: 'r1d', typ: 'befehl', auftrag: ['Starte zwei Container aus <code>hello-world</code> mit den Namen <code>hallo1</code> und <code>hallo2</code>.', 'Starte 2 Container aus <code>hello-world</code>. Sie heißen <code>hallo1</code> und <code>hallo2</code>.'],
        loesung: ['docker run --name hallo1 hello-world', 'docker run --name hallo2 hello-world'],
        ziel: function (h) { return hatName(h, 'hallo1') && hatName(h, 'hallo2'); },
        teil: function (h, r, z) { return r.gestartet && /--name\s+hallo[12]/.test(z) ? ['Ein Container steht. Jetzt der zweite.', '1 Container ist da. Jetzt der 2.'] : null; },
        tipp: ['Den Namen gibst du mit <code>--name</code> vor dem Image an.', 'Schreibe <code>--name hallo1</code> vor das Image.'] },
      { id: 'r1e', typ: 'befehl', auftrag: ['Zeige alle <b>Images</b>, die auf dem Host liegen.', 'Zeige alle <b>Images</b> auf dem Rechner.'],
        loesung: ['docker images'],
        ziel: function (h, r) { return !!r.images; },
        falsch: function (r) { return r.ps ? ['<code>docker ps</code> zeigt <b>Container</b>. Für die Baupläne gibt es <code>docker images</code>.', '<code>docker ps</code> zeigt <b>Container</b>. Images zeigt <code>docker images</code>.'] : null; },
        tipp: ['Der Befehl heißt so wie das, was du sehen willst.', 'Der Befehl heißt wie das Wort „Images“.'] },
      { id: 'r1f', typ: 'befehl', auftrag: ['Zeige <b>alle</b> Container, auch die beendeten.', 'Zeige <b>alle</b> Container. Auch die beendeten.'],
        loesung: ['docker ps -a'],
        ziel: function (h, r) { return !!(r.ps && r.ps.alle); },
        falsch: function (r) { return r.ps && !r.ps.alle ? ['Die Liste ist leer, weil <code>docker ps</code> nur <b>laufende</b> Container zeigt. Beendete siehst du nur mit <code>-a</code>.', 'Die Liste ist leer. <code>docker ps</code> zeigt nur Container, die <b>laufen</b>. Hänge <code>-a</code> an.'] : null; },
        tipp: ['Hänge an <code>docker ps</code> eine Option für „all“ an.', 'Schreibe <code>docker ps -a</code>.'], notiz: true },
      { id: 'r1g', typ: 'befehl', auftrag: ['Räum auf: Lösche die Container <code>hallo1</code> und <code>hallo2</code>.', 'Räum auf. Lösche die Container <code>hallo1</code> und <code>hallo2</code>.'],
        loesung: ['docker rm hallo1 hallo2'],
        ziel: function (h) { return !hatName(h, 'hallo1') && !hatName(h, 'hallo2'); },
        teil: function (h, r) { return r.geloescht && r.geloescht.length && !r.fehler ? ['Einer ist weg. Lösche auch den anderen.', '1 ist weg. Lösche auch den anderen.'] : null; },
        falsch: function (r, zeile) { return /\brmi\b/.test(zeile) ? ['<code>rmi</code> löscht <b>Images</b> – und das klappt nicht, solange noch Container aus dem Image bestehen. Für Container nimmst du <code>docker rm</code>.', '<code>rmi</code> löscht <b>Images</b>. Für Container nimmst du <code>docker rm</code>.'] : null; },
        tipp: ['Container löscht <code>docker rm</code>, du kannst mehrere Namen hintereinander schreiben.', 'Schreibe <code>docker rm hallo1 hallo2</code>.'] },
      { id: 'r1h', typ: 'wahl', auftrag: ['Zum Schluss: Ein Image verhält sich zu einem Container wie …', 'Zum Schluss: Ein Image ist für einen Container wie …'],
        optionen: [
          { t: ['… eine Klasse zu einem Objekt.', '… eine Klasse für ein Objekt.'], richtig: true },
          { t: ['… ein Objekt zu einer Klasse.', '… ein Objekt für eine Klasse.'], fb: ['Umgekehrt: Aus einer Klasse entstehen viele Objekte – aus einem Image entstehen viele Container.', 'Umgekehrt. Aus 1 Klasse macht man viele Objekte. Aus 1 Image macht man viele Container.'] },
          { t: ['… ein Ordner zu einer Datei.', '… ein Ordner für eine Datei.'], fb: ['Ein Container liegt nicht „im“ Image. Das Image ist der feste Bauplan, der Container eine laufende Instanz davon.', 'Der Container liegt nicht im Image. Das Image ist ein Bauplan. Der Container läuft aus dem Bauplan.'] }
        ] }
    ],
    /* 🚀 Profi: Support-Ticket vom Verein */
    ticket: [
      { id: 'r1t1', typ: 'befehl', ticket: true, auftrag: ['Tomás schreibt: „Mein Neffe hat gesagt, ich soll <code>docker ps</code> eingeben. Da steht nichts. Ist der Server kaputt?“ Prüfe den Server selbst.', 'Tomás schreibt: „Bei <code>docker ps</code> steht nichts. Ist der Server kaputt?“ Prüfe den Server.'],
        vorher: ['docker run hello-world'], loesung: ['docker ps -a'],
        ziel: function (h, r) { return !!(r.ps && r.ps.alle && r.ps.anzahl > 0); },
        tipp: ['Welche Container zeigt <code>docker ps</code> nicht?', 'Zeige alle Container.'] },
      { id: 'r1t2', typ: 'wahl', ticket: true, auftrag: ['Was antwortest du Tomás?', 'Was schreibst du Tomás?'],
        optionen: [
          { t: ['„Der Server ist in Ordnung. Die Container sind beendet, nicht weg – <code>docker ps -a</code> zeigt sie.“', '„Alles in Ordnung. Die Container sind beendet. Sie sind nicht weg.“'], richtig: true },
          { t: ['„Bitte Docker neu installieren, dann ist die Liste wieder voll.“', '„Bitte Docker neu installieren.“'], fb: ['Tomás installiert neu – und schreibt zurück: „Jetzt ist ALLES weg?!“ Die Liste war nie kaputt: Beendete Container zeigt nur <code>docker ps -a</code>.', 'Tomás installiert neu. Dann schreibt er: „Jetzt ist alles weg!“ Die Liste war nicht kaputt. Beendete Container zeigt nur <code>docker ps -a</code>.'] },
          { t: ['„Die Container wurden gelöscht. Wir müssen alles neu starten.“', '„Die Container sind gelöscht.“'], fb: ['Gelöscht ist nichts: Die beendeten Container stehen in <code>docker ps -a</code>. Gelöscht wären sie erst nach <code>docker rm</code>.', 'Nichts ist gelöscht. <code>docker ps -a</code> zeigt die Container. Gelöscht sind sie erst nach <code>docker rm</code>.'] }
        ] }
    ],
    beruf: ['Im Betrieb laufen auf einem Server oft Dutzende Container. Wer <code>ps</code> und <code>ps -a</code> verwechselt, sucht Fehler an der falschen Stelle.', 'Im Betrieb laufen oft viele Container auf einem Server. Wer <code>ps</code> und <code>ps -a</code> verwechselt, sucht den Fehler falsch.'],
    vmBefehle: ['docker version', 'docker run hello-world', 'docker images', 'docker ps', 'docker ps -a', 'docker run --name hallo1 hello-world', 'docker run --name hallo2 hello-world', 'docker rm hallo1 hallo2']
  }
];
var GEPLANT = [
  ['Raum 2 · Die Vereinsseite', 'Übung 2 Steckbrief-Webserver'],
  ['Raum 3 · Daten, die bleiben', 'Übung 3 Daten'],
  ['Raum 4 · Drei Dienste, eine Datei', 'Übung 4 Compose'],
  ['Raum 5 · Generalprobe Foto-Cloud', 'Abschlussprojekt Immich']
];

/* ---------- Stil ---------- */
var SR_CSS = '.sr-spiel{display:flex;flex-direction:column;gap:10px;min-height:560px;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:12px;font-size:15px}' +
  '.sr-tuer{display:flex;flex-wrap:wrap;align-items:center;gap:8px;background:#1e293b;border-radius:10px;padding:8px 12px}' +
  '.sr-tuer b{font-family:var(--titel);margin-right:auto}.sr-schloss{display:flex;align-items:center;gap:4px;font-size:.8rem;padding:3px 8px;border-radius:999px;background:#334155}' +
  '.sr-schloss.offen{background:#166534;color:#dcfce7}.sr-schloss.jetzt{outline:2px solid #fbbf24}' +
  '.sr-kopf{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;background:#f8fafc;color:#0f172a;border-radius:10px;padding:10px 12px}' +
  '.sr-kopf .fig{width:72px;flex:0 0 auto}.sr-kopf .txt{flex:1}.sr-kopf .wer{font-weight:800;font-family:var(--titel);font-size:.9rem}' +
  '.sr-kopf .auftrag{font-size:1rem;margin:2px 0 0}.sr-kopf.ticket{background:#f3edff;border:3px solid var(--profi,#6d28d9)}' +
  '.sr-mitte{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(220px,1fr);gap:10px;align-items:stretch}' +
  '@media (max-width:820px){.sr-mitte{grid-template-columns:1fr}}' +
  '.sr-term{background:#020617;border:1px solid #334155;border-radius:10px;display:flex;flex-direction:column;min-height:320px;overflow:hidden}' +
  '.sr-term .leiste{background:#1e293b;padding:4px 10px;font-size:.78rem;color:#94a3b8}' +
  '.sr-ausgabe{flex:1;overflow:auto;max-height:340px;padding:8px 10px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.82rem;line-height:1.35;white-space:pre;color:#cbd5e1}' +
  '.sr-ausgabe .sr-ein{color:#86efac}.sr-ausgabe .sr-fe{color:#fca5a5;white-space:pre-wrap}.sr-ausgabe .sr-ko{color:#93c5fd}' +
  '.sr-erkl{white-space:normal;font-family:var(--text,inherit);background:#fef3c7;color:#422006;border-radius:8px;padding:6px 10px;margin:4px 0;font-size:.88rem}' +
  '.sr-erkl button{min-height:36px;margin-left:6px}' +
  '.sr-eingabe{display:flex;align-items:center;gap:6px;border-top:1px solid #334155;padding:6px 10px;font-family:ui-monospace,Menlo,Consolas,monospace}' +
  '.sr-eingabe span{color:#86efac;white-space:nowrap}.sr-eingabe input{flex:1;min-width:0;background:transparent;border:0;color:#f8fafc;font:inherit;font-size:.95rem;padding:6px 2px;outline:none}' +
  '.sr-eingabe input:focus{box-shadow:inset 0 -2px 0 #86efac}.sr-eingabe button{min-height:40px}' +
  '.sr-bausteine{display:flex;flex-wrap:wrap;gap:6px;padding:6px 10px 10px}.sr-bausteine button{min-height:40px;font-family:ui-monospace,Menlo,Consolas,monospace;background:#334155;color:#f8fafc;border:1px solid #475569;border-radius:8px;padding:4px 10px}' +
  '.sr-bausteine button.steuer{background:#0f172a}' +
  '.sr-server{background:#1e293b;border-radius:10px;padding:8px 10px;display:flex;flex-direction:column;gap:6px}' +
  '.sr-server h4{margin:0;font-family:var(--titel);font-size:.95rem;color:#f8fafc}.sr-server .leer{font-size:.82rem;color:#94a3b8}' +
  '.sr-karte{display:flex;align-items:center;gap:8px;border-radius:8px;padding:5px 8px;font-size:.82rem;background:#334155}' +
  '.sr-karte.image{background:#1d4ed8;color:#eff6ff}.sr-karte.up{background:#15803d;color:#f0fdf4}.sr-karte.exited{background:#475569;color:#e2e8f0}' +
  '.sr-karte.neu{animation:sr-auf .5s cubic-bezier(.2,1.6,.4,1)}@keyframes sr-auf{from{transform:scale(.4);opacity:0}}' +
  '.sr-karte .sym{font-size:1.1rem}.sr-karte small{opacity:.85;display:block}' +
  '.sr-fall{background:#f8fafc;color:#0f172a;border-radius:10px;padding:10px 12px}' +
  '.sr-fall .nr{font-size:.8rem;color:#475569}.sr-fall .opt{display:flex;flex-direction:column;gap:6px;margin-top:6px}.sr-fall .opt button{text-align:left;min-height:44px}' +
  '.sr-fall .rm{margin-top:6px}' +
  '.sr-regeln{background:#f8fafc;color:#0f172a;border-radius:10px;padding:6px 12px}.sr-regeln summary{cursor:pointer;font-weight:700;min-height:36px;display:flex;align-items:center}' +
  '.sr-regeln li{margin:3px 0;font-size:.9rem}' +
  '.sr-rueck{border-radius:8px;padding:8px 10px;margin-top:8px;font-size:.92rem}.sr-rueck.ok{background:#dcfce7;color:#14532d}.sr-rueck.bad{background:#fee2e2;color:#7f1d1d}.sr-rueck.tut{background:#dbeafe;color:#1e3a8a}' +
  '.sr-rueck button{margin-top:6px;min-height:40px}' +
  '.sr-pfad{flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:.85rem}.sr-pfad button{min-height:40px;font-weight:700}' +
  '.sr-pfad button[aria-pressed="true"]{background:#e8f5ec;border-color:#15803d}.sr-pfad button.profi[aria-pressed="true"]{background:var(--profi,#6d28d9);border-color:var(--profi,#6d28d9);color:#fff}' +
  '.sr-ende{background:#f8fafc;color:#0f172a;border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:10px}' +
  '.sr-ende h3{margin:0;font-family:var(--titel)}.sr-ende pre{background:#020617;color:#cbd5e1;border-radius:8px;padding:8px 10px;font-size:.82rem;overflow:auto}' +
  '.sr-ende .vm{border:2px dashed #0e7490;border-radius:10px;padding:10px 12px;background:#ecfeff}' +
  '.sr-ende .zeile{display:flex;flex-wrap:wrap;gap:8px}.sr-ende label{display:flex;gap:8px;align-items:center;min-height:40px}' +
  '.sr-selbst{background:#fff7ed;color:#431407;border-radius:8px;padding:8px 10px;margin-top:8px}.sr-selbst textarea{width:100%;min-height:60px;margin-top:6px;font:inherit}' +
  '.sr-puls{animation:sr-puls 1.1s infinite}@keyframes sr-puls{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.95)}50%{box-shadow:0 0 0 8px rgba(251,191,36,0)}}' +
  '.sr-start{background:#f8fafc;color:#0f172a;border-radius:10px;padding:14px 16px}.sr-start .st-feld{margin:8px 0}.sr-start input{min-height:40px;font-family:ui-monospace,Menlo,Consolas,monospace}';

/* ---------- Das Spiel ---------- */
function serverraum(box, api) {
  var E = KIT.el;
  if (!document.getElementById('sr-css')) { var s = document.createElement('style'); s.id = 'sr-css'; s.textContent = SR_CSS; document.head.appendChild(s); }
  var R = RAEUME[0], host, faelle, nr, fehlversuche, verlauf, phase, letzteFehler, selbstText = '';
  var wurzel = E('div', { class: 'sr-spiel' });
  box.innerHTML = ''; box.appendChild(wurzel);

  function fall() { return faelle[nr]; }
  function figurHtml(p, aus) { return KIT.figur(p.aussehen, { ausdruck: aus || 'freundlich' }); }

  function tuer() {
    var t = E('div', { class: 'sr-tuer', 'aria-label': L('Tür von Serverraum 0 mit fünf Schlössern', 'Tür mit 5 Schlössern') }, [E('b', { text: '🚪 ' + L('Serverraum 0 · Tür', 'Serverraum 0 · Tür') })]);
    RAEUME.concat(GEPLANT.map(function (g, i) { return { id: 'P' + (i + 2), nr: i + 2 }; })).forEach(function (r) {
      var offen = api.geschafft(r.id);
      t.appendChild(E('span', { class: 'sr-schloss' + (offen ? ' offen' : '') + (r.id === R.id && !offen ? ' jetzt' : ''), text: (offen ? '🔓' : '🔒') + ' ' + L('Raum ', 'Raum ') + r.nr }));
    });
    return t;
  }
  function pfadSchalter() {
    var w = E('div', { class: 'sr-pfad', role: 'group', 'aria-label': L('Weg wählen', 'Wähle: leicht oder schwer') });
    ['basis', 'profi'].forEach(function (st) {
      w.appendChild(E('button', { type: 'button', class: st, 'aria-pressed': String(PFAD.stufe === st), text: st === 'basis' ? L('⛰️ Basis', '⛰️ Basis (leichter)') : L('🚀 Profi', '🚀 Profi (schwerer)'),
        onclick: function () { if (PFAD.stufe !== st) { STUFEN.setzePfad(st, false); raumStart(true); } } }));
    });
    w.appendChild(E('span', { text: P(L('Basis: Befehls-Bausteine und Erklärungen zu jeder Fehlermeldung.', 'Basis: Bausteine für Befehle. Erklärungen zu jedem Fehler.'), L('Profi: freies Tippen und ein Ticket vom Verein. Erklärungen erst nach zwei Fehlversuchen.', 'Profi: Du tippst selbst. Dazu kommt ein Ticket vom Verein.')) }));
    return w;
  }

  /* --- Einstufung vor dem ersten Raum --- */
  function einstufen() {
    wurzel.innerHTML = ''; wurzel.appendChild(tuer());
    var k = E('div', { class: 'sr-start' }, [
      E('div', { class: 'sr-kopf', style: 'padding:0;margin-bottom:8px' }, [E('div', { class: 'fig', html: figurHtml(JANA) }), E('div', { class: 'txt' }, [E('div', { class: 'wer', text: JANA.name }), E('p', { class: 'auftrag', html: L('Bevor es losgeht: Zeig mir kurz, wie fit du im Terminal bist. Dann schlage ich dir einen Weg vor.', 'Bevor es losgeht: 2 kurze Aufgaben im Terminal. Dann bekommst du einen Vorschlag.') })])])]);
    wurzel.appendChild(k);
    STUFEN.einstufung(k, {
      aufgaben: [
        { frage: L('Welcher Befehl zeigt die Dateien im aktuellen Ordner?', 'Welcher Befehl zeigt die Dateien im Ordner?'), pruefe: function (a) { return /^ls(\s+-[a-z]+)?$/.test(a.trim()); } },
        { frage: L('Welcher Docker-Befehl zeigt die laufenden Container?', 'Welcher Docker-Befehl zeigt Container, die laufen?'), pruefe: function (a) { return /^docker\s+(ps|container\s+ls)$/.test(a.trim().replace(/\s+/g, ' ')); } }
      ],
      weiter: function (stufe) { api.speicher('es', stufe); raumStart(); }
    });
    k.querySelectorAll('button.primaer').forEach(function (b) { b.classList.remove('primaer'); });
  }

  /* --- Raum starten: Host vorbereiten, Vorführung anbieten --- */
  function raumStart(behalten) {
    host = neuerHost(); if (R.setup) R.setup(host);
    verlauf = []; nr = 0; fehlversuche = 0; letzteFehler = null; selbstText = '';
    faelle = R.faelle.concat(P([], R.ticket || []));
    phase = 'demo'; api.speicher('r', R.nr);
    zeichne();
    if (!behalten) terminal('# ' + T(R.begruessung || ['Jana zeigt dir zuerst, wie es geht.', 'Jana zeigt es dir zuerst.']), 'sr-ko');
  }
  function demoTun(d, still) {
    if (d.cmd) return ausfuehren(d.cmd, still);
    if (d.tun) d.tun(host);
    if (!still) serverZeichnen();
  }
  function nachDemo() { if (R.demoReset) { host = neuerHost(); if (R.setup) R.setup(host); terminal('# ' + L('Janas Beispiel ist abgebaut. Jetzt der Server des TSV.', 'Janas Beispiel ist weg. Jetzt der Server vom Verein.'), 'sr-ko'); } }
  function demoUeberspringen() {
    R.demo.forEach(function (d) { demoTun(d, true); });
    nachDemo();
    terminal('# ' + L('Vorführung übersprungen.', 'Vorführung übersprungen.'), 'sr-ko');
    phase = 'spiel'; zeichne();
  }

  /* --- Terminal --- */
  var ausgabeEl = null, eingabeEl = null, serverEl = null, fallEl = null, extraEl = null;
  function eingabeZeichen() { return host && host.shell ? 'root@' + host.shell.id + ':' + (host.shell.cwd || '/') + '# ' : 'azubi@tsv-server:~$ '; }
  function terminal(text, art) { verlauf.push({ t: text, art: art || '' }); if (ausgabeEl) zeileAnzeigen({ t: text, art: art || '' }); }
  function zeileAnzeigen(z) {
    var d = E('div', { class: z.art });
    if (z.art === 'erkl') { d.className = 'sr-erkl'; d.innerHTML = z.t; } else d.textContent = z.t;
    ausgabeEl.appendChild(d); ausgabeEl.scrollTop = ausgabeEl.scrollHeight;
  }
  function ausfuehren(zeile, still) {
    var pr = eingabeZeichen(), r = hostAusfuehren(host, zeile);
    if (r.leeren) { verlauf = []; if (ausgabeEl) ausgabeEl.innerHTML = ''; return r; }
    terminal(pr + zeile, 'sr-ein');
    r.aus.forEach(function (z) { terminal(z.t, z.art); });
    if (!still) { serverZeichnen(); var pe = wurzel.querySelector('.sr-eingabe span'); if (pe) pe.textContent = host.shell ? '#' : '$'; }
    return r;
  }

  /* --- Ansicht des Hosts („Server“) --- */
  function karte(kl, sym, titel, unter) { return E('div', { class: 'sr-karte ' + kl }, [E('span', { class: 'sym', text: sym }), E('div', {}, [E('b', { text: titel }), E('small', { text: unter })])]); }
  function serverZeichnen() {
    if (!serverEl) return;
    serverEl.innerHTML = '';
    serverEl.appendChild(E('h4', { text: '🖥️ ' + L('Server des TSV – was liegt drauf?', 'Server vom Verein') }));
    serverEl.appendChild(E('div', { class: 'leer', text: L('Images (Baupläne)', 'Images (Baupläne)') }));
    var ims = Object.keys(host.images);
    if (!ims.length) serverEl.appendChild(E('div', { class: 'leer', text: L('– noch keine –', '– keine –') }));
    ims.forEach(function (k) { var b = host.images[k]; serverEl.appendChild(karte('image' + (b.neu ? ' neu' : ''), '📄', b.name + ':' + b.tag, b.groesse)); b.neu = false; });
    serverEl.appendChild(E('div', { class: 'leer', text: L('Container (laufen oder beendet)', 'Container') }));
    if (!host.container.length) serverEl.appendChild(E('div', { class: 'leer', text: L('– noch keine –', '– keine –') }));
    host.container.forEach(function (c) {
      var u = c.image + ' · ' + (c.status === 'up' ? (c.gesund === false ? L('startet …', 'startet …') : L('läuft', 'läuft')) : L('beendet (Exited)', 'beendet')) + (c.ports && c.ports.length ? ' · 🔌 ' + c.ports.map(function (p) { return p.replace(':', ' → '); }).join(', ') : '');
      serverEl.appendChild(karte(c.status + (c.neu ? ' neu' : ''), '🐳', c.name, u)); c.neu = false;
    });
    var vols = Object.keys(host.volumes || {}), ord = Object.keys(host.ordner || {});
    if (vols.length || ord.length) serverEl.appendChild(E('div', { class: 'leer', text: L('Speicher außerhalb der Container', 'Speicher') }));
    vols.forEach(function (v) { serverEl.appendChild(karte('image', '🗄️', 'Volume ' + v, Object.keys(host.volumes[v]).join(', ') || L('leer', 'leer'))); });
    ord.forEach(function (o) { serverEl.appendChild(karte('exited', '📁', o.replace('/home/azubi/', './'), Object.keys(host.ordner[o]).join(', ') || L('leer', 'leer'))); });
  }

  /* --- Fall-Karte --- */
  function rueck(art, html, knopf, danach) {
    var alt = fallEl.querySelector('.sr-rueck'); if (alt) alt.remove();
    var d = E('div', { class: 'sr-rueck ' + art, role: art === 'bad' ? 'alert' : 'status', html: html });
    if (knopf) { var b = E('button', { type: 'button', text: knopf, onclick: function () { d.remove(); if (danach) danach(); } }); d.appendChild(E('div', {}, [b])); setTimeout(function () { b.focus(); }, 0); }
    fallEl.appendChild(d);
  }
  var ctx = {
    host: function () { return host; },
    ausfuehren: function (z) { return ausfuehren(z); },
    ok: function () { fehlversuche = 0; geschafft(); },
    fehl: function (html) { fehlversuche++; rueck('bad', html); if (fehlversuche === 3) { var b = E('button', { type: 'button', class: 'rm', text: '💡 ' + L('Jana, mach es mir vor', 'Jana, zeig mir die Lösung'), onclick: vormachen }); fallEl.appendChild(b); } },
    teil: function (html) { rueck('ok', html); },
    neu: function () { serverZeichnen(); }
  };
  function fallZeichnen() {
    fallEl.innerHTML = ''; if (extraEl) { extraEl.innerHTML = ''; extraEl.hidden = true; }
    if (phase === 'demo') {
      fallEl.appendChild(E('div', { class: 'nr', text: L('Vorführung · Jana macht es vor', 'Jana zeigt es dir') }));
      fallEl.appendChild(E('p', { html: T(R.demoText || ['Schau zu, wie Jana es an einem anderen Beispiel macht. Danach bist du dran.', 'Schau zu. Jana zeigt ein Beispiel. Dann bist du dran.']) }));
      fallEl.appendChild(E('div', { class: 'opt' }, [
        E('button', { type: 'button', class: 'sr-demo', text: '▶ ' + L('Zeig’s mir', 'Zeig es mir'), onclick: function () { demoSchritt(0); } }),
        E('button', { type: 'button', text: '⏭ ' + L('Überspringen – ich kann das schon', 'Überspringen'), onclick: demoUeberspringen })]));
      return;
    }
    var f = fall();
    fallEl.appendChild(E('div', { class: 'nr', text: (f.ticket ? '🚀 ' + L('Profi · Ticket', 'Profi · Ticket') + ' · ' : '') + L('Aufgabe ', 'Aufgabe ') + (nr + 1) + L(' von ', ' von ') + faelle.length }));
    if (f.ticket) fallEl.insertBefore(STUFEN.profiBand(L('Ticket vom Verein – freiwillig, Basis reicht für den Nachweis', 'Ticket vom Verein. Freiwillig.')), fallEl.firstChild);
    fallEl.appendChild(E('p', { html: '<b>' + T(f.auftrag) + '</b>' }));
    if (f.typ === 'wahl') {
      var o = E('div', { class: 'opt', role: 'group' });
      f.optionen.forEach(function (op, i) { o.appendChild(E('button', { type: 'button', 'data-opt': String(i), html: T(op.t), onclick: function () { waehle(i); } })); });
      fallEl.appendChild(o);
    } else if (f.typ === 'befehl') {
      fallEl.appendChild(E('p', { class: 'nr', html: P(L('Tippe den Befehl ins Terminal oder setze ihn aus den Bausteinen zusammen. Dann ⏎ Enter.', 'Tippe den Befehl. Oder nimm die Bausteine. Dann ⏎ Enter.'), L('Tippe den Befehl ins Terminal und drück Enter.', 'Tippe den Befehl. Dann Enter.')) }));
    }
    if (f.zeichne) {
      var ziel = f.breit && extraEl ? extraEl : fallEl;
      if (ziel === extraEl) extraEl.hidden = false;
      var w = E('div', { class: 'sr-widget' }); ziel.appendChild(w); f.zeichne(w, ctx);
    }
    if (fehlversuche >= 3) fallEl.appendChild(E('button', { type: 'button', class: 'rm', text: '💡 ' + L('Jana, mach es mir vor', 'Jana, zeig mir die Lösung'), onclick: vormachen }));
  }

  /* --- Vorführung (geführter erster Fall) --- */
  function demoSchritt(i) {
    var d = R.demo[i];
    if (!d) { nachDemo(); phase = 'spiel'; zeichne(); return; }
    demoTun(d);
    fallEl.innerHTML = '';
    fallEl.appendChild(E('div', { class: 'nr', text: L('Vorführung · Schritt ', 'Jana zeigt es · Schritt ') + (i + 1) + ' / ' + R.demo.length }));
    fallEl.appendChild(E('p', { html: d.cmd ? '<code>' + KIT.esc(d.cmd) + '</code>' : '<b>' + T(d.text) + '</b>' }));
    if (d.zeige) { var zw = E('div', { class: 'sr-widget' }); fallEl.appendChild(zw); d.zeige(zw, host); }
    var weiter = E('button', { type: 'button', class: 'sr-demo', text: i + 1 < R.demo.length ? L('Nächster Schritt →', 'Weiter →') : L('Jetzt bin ich dran →', 'Jetzt ich →'), onclick: function () { demoSchritt(i + 1); } });
    fallEl.appendChild(E('p', { html: T(d.warum) }));
    if (d.selbst) {
      var se = E('div', { class: 'sr-selbst' }, [E('b', { html: '🤔 ' + T(R.selbsterklaerung) }), STUFEN.satzanfaenge(R.satzanfaenge.map(T))]);
      var ta = E('textarea', { 'aria-label': L('Deine Erklärung', 'Deine Antwort'), oninput: function () { selbstText = ta.value; } });
      ta.value = selbstText;
      se.appendChild(ta);
      var zeig = E('button', { type: 'button', text: L('Begründung zeigen', 'Lösung zeigen'), onclick: function () { zeig.replaceWith(E('p', { html: '✔ ' + T(d.antwort || R.demo[i + 1].warum) })); } });
      se.appendChild(zeig);
      fallEl.appendChild(se);
    }
    fallEl.appendChild(E('div', { class: 'opt' }, [weiter]));
  }

  /* --- Eingaben bewerten --- */
  function senden(zeile) {
    zeile = zeile.trim(); if (!zeile) return;
    if (phase !== 'spiel') { ausfuehren(zeile); return; }
    var f = fall(), r = ausfuehren(zeile);
    if (r.leeren) return;
    letzteFehler = r.fehler || null;
    if (f.typ !== 'befehl') { if (r.fehler) erklaereFehler(r.fehler); if (f.nachBefehl) f.nachBefehl(r, zeile, ctx); return; }
    if (f.ziel(host, r, zeile)) { fehlversuche = 0; return geschafft(); }
    var teil = f.teil && f.teil(host, r, zeile);
    if (teil) { rueck('ok', '👍 ' + T(teil)); return; }
    var text = (f.falsch && f.falsch(r, zeile, host)) ? T(f.falsch(r, zeile, host)) : null;
    if (!text && !r.fehler && r.neutral) return;  // z. B. cat, ls, echo im Container: kein Fehlversuch
    fehlversuche++;
    if (r.fehler) erklaereFehler(r.fehler);
    if (!text) text = fehlversuche >= 2 || PFAD.stufe === 'basis' ? T(f.tipp) : L('Das war noch nicht der richtige Befehl. Lies die Ausgabe im Terminal genau.', 'Das war noch nicht richtig. Lies die Ausgabe im Terminal.');
    rueck('bad', text + (fehlversuche >= 3 ? ' ' + L('Unten kann dir Jana die Lösung vormachen.', 'Jana kann dir die Lösung zeigen.') : ''));
    if (fehlversuche === 3) fallZeichnen();
  }
  function erklaereFehler(art) {
    if (!ERKL[art]) return;
    if (PFAD.stufe === 'profi' && fehlversuche < 2) return;
    var d = E('div', { class: 'sr-erkl' }, [E('span', { text: '❓ ' + L('Fehlermeldung im Terminal.', 'Fehler im Terminal.') }), E('button', { type: 'button', text: L('Was heißt das?', 'Was heißt das?'), onclick: function () { d.innerHTML = '💡 ' + T(ERKL[art]); } })]);
    ausgabeEl.appendChild(d); ausgabeEl.scrollTop = ausgabeEl.scrollHeight;
  }
  function waehle(i) {
    var f = fall(), op = f.optionen[i];
    if (op.richtig) { fehlversuche = 0; return geschafft(); }
    fehlversuche++;
    var b = fallEl.querySelector('[data-opt="' + i + '"]'); if (b) { b.disabled = true; KIT.wackeln(b); }
    rueck('bad', T(op.fb));
  }
  function vormachen() {
    var f = fall();
    if (f.typ === 'wahl') { rueck('tut', '💡 ' + T(f.optionen.filter(function (o) { return o.richtig; })[0].t)); return; }
    if (f.typ === 'eigen') { f.loese(host, ctx); serverZeichnen(); rueck('tut', '💡 ' + L('Jana hat es eingetragen. Schau es dir genau an.', 'Jana hat es eingetragen. Schau genau hin.'), L('Nächste Aufgabe →', 'Nächste Aufgabe →'), naechster); return; }
    rueck('tut', L('Jana tippt: ', 'Jana tippt: ') + f.loesung.map(function (c) { return '<code>' + KIT.esc(c) + '</code>'; }).join(' · '));
    var r = null; f.loesung.forEach(function (c) { r = ausfuehren(c); });
    if (f.ziel(host, r, f.loesung[f.loesung.length - 1])) setTimeout(geschafft, 900);
  }
  function notizSchreiben(f) {
    if (f.notiz === true) api.notiere(R.id, L('Meine Ausgabe von docker ps -a', 'Meine Ausgabe von docker ps -a'), '<pre>' + KIT.esc(verlauf.slice(-1 - host.container.length).map(function (z) { return z.t; }).join('\n')) + '</pre>');
    else if (typeof f.notiz === 'function') { var n = f.notiz(host, verlauf); if (n) api.notiere(R.id, T(n[0]), n[1]); }
  }
  function geschafft(sofort) {
    var f = fall();
    notizSchreiben(f);
    if (sofort) return naechster();
    rueck('ok', '✔ ' + L('Richtig!', 'Richtig!') + (f.typ === 'wahl' ? ' ' + T(f.optionen.filter(function (o) { return o.richtig; })[0].t) : (f.lob ? ' ' + T(f.lob) : '')), L('Nächste Aufgabe →', 'Nächste Aufgabe →'), naechster);
  }
  function vorbereiten(f) { (f.vorher || []).forEach(function (c) { hostAusfuehren(host, c); }); if (f.vorherTun) f.vorherTun(host); }
  function naechster() {
    nr++; fehlversuche = 0;
    if (nr < faelle.length) { vorbereiten(fall()); zeichne(); }
    else ende();
  }

  /* --- Raum geschafft --- */
  function ende(still) {
    api.notiere(R.id, L('Meine Erklärung: ', 'Meine Antwort: ') + T(R.selbsterklaerung).replace(/<[^>]+>/g, ''), selbstText ? KIT.esc(selbstText) : '<i>' + L('(nicht ausgefüllt)', '(leer)') + '</i>');
    api.level(R.id, T(R.geschafftText));
    phase = 'fertig';
    if (still) return;
    zeichneEnde();
  }
  function zeichneEnde() {
    wurzel.innerHTML = ''; wurzel.appendChild(tuer());
    var k = 'vm' + R.nr, idx = RAEUME.indexOf(R), naechsterRaum = RAEUME[idx + 1] || null;
    var alleOffen = RAEUME.every(function (x) { return api.geschafft(x.id); });
    var haken = E('input', { type: 'checkbox', id: 'sr-' + k, onchange: function () { api.speicher(k, haken.checked ? 1 : 0); api.notiere(R.id, L('VM-Übung', 'VM-Übung'), (haken.checked ? L('Erledigt: ', 'Fertig: ') : L('Noch offen: ', 'Noch offen: ')) + R.vm); } });
    haken.checked = !!api.speicher(k);
    var knoepfe = [];
    if (naechsterRaum) knoepfe.push(E('button', { type: 'button', text: '🚪 ' + L('Weiter in ', 'Weiter in ') + T(naechsterRaum.titel) + ' →', onclick: function () { R = naechsterRaum; raumStart(); } }));
    knoepfe.push(E('button', { type: 'button', text: '↺ ' + L('Raum ', 'Raum ') + R.nr + L(' noch einmal spielen', ' noch einmal'), onclick: function () { raumStart(); } }));
    wurzel.appendChild(E('div', { class: 'sr-ende' }, [
      E('div', { class: 'sr-kopf', style: 'padding:0' }, [E('div', { class: 'fig', html: figurHtml(JANA, 'froh') }), E('div', { class: 'txt' }, [E('h3', { text: '🔓 ' + L('Schloss ', 'Schloss ') + R.nr + L(' ist offen!', ' ist offen!') }), E('p', { html: T(R.beruf) })])]),
      alleOffen ? E('p', { class: 'sr-rueck ok', html: '🎉 ' + L('<b>Alle fünf Schlösser sind offen!</b> Kai macht die Tür auf: „Die Vereinsfotos laufen – stark!“ Jetzt fehlt nur noch die echte Foto-Cloud in der VM.', '<b>Alle 5 Schlösser sind offen!</b> Kai macht die Tür auf. Jetzt baust du die echte Foto-Cloud in der VM.') }) : null,
      E('div', { class: 'vm' }, [E('b', { text: '🖥️ ' + L('Jetzt in echt: ', 'Jetzt in echt: ') + R.vm + L(' in der VM', ' in der VM') }), E('p', { html: L('Öffne das Terminal deiner Linux-VM und arbeite die Übung ab. Vergleiche mit dem Spiel. Dann komm zurück.', 'Öffne das Terminal in der VM. Mach die Übung. Vergleiche mit dem Spiel. Dann komm zurück.') }),
        E('pre', { text: R.vmBefehle.join('\n') }), E('label', { for: 'sr-' + k }, [haken, E('span', { text: R.vm + L(' in der VM erledigt', ' in der VM fertig') })])]),
      E('p', { html: L('Unten wartet die Zwischenbilanz zu diesem Raum.', 'Unten ist die Zwischenbilanz.') }),
      E('div', { class: 'zeile' }, knoepfe)
    ]));
  }

  /* --- Alles zeichnen --- */
  function zeichne() {
    wurzel.innerHTML = '';
    wurzel.appendChild(tuer());
    var f = phase === 'spiel' ? fall() : null, wer = f && f.ticket ? TOMAS : JANA;
    wurzel.appendChild(E('div', { class: 'sr-kopf' + (f && f.ticket ? ' ticket' : '') }, [E('div', { class: 'fig', html: figurHtml(wer, f && f.ticket ? 'nachdenklich' : 'freundlich') }),
      E('div', { class: 'txt' }, [E('div', { class: 'wer', text: wer.name + ' · ' + (f && f.ticket ? L('📨 Ticket', '📨 Ticket') : T(R.titel)) }), E('p', { class: 'auftrag', html: f && f.ticket ? T(f.auftrag) : T(R.auftrag) })]), pfadSchalter()]));
    var mitte = E('div', { class: 'sr-mitte' });
    var term = E('div', { class: 'sr-term' });
    term.appendChild(E('div', { class: 'leiste', text: 'azubi@tsv-server: ~ — bash' }));
    ausgabeEl = E('div', { class: 'sr-ausgabe', role: 'log', 'aria-live': 'polite', 'aria-label': L('Ausgabe des Terminals', 'Terminal') });
    verlauf.forEach(zeileAnzeigen);
    term.appendChild(ausgabeEl);
    eingabeEl = E('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': L('Befehl eingeben', 'Befehl eingeben'),
      onkeydown: function (e) { if (e.key === 'Enter') { var z = eingabeEl.value; eingabeEl.value = ''; senden(z); } } });
    term.appendChild(E('div', { class: 'sr-eingabe' }, [E('span', { text: host && host.shell ? '#' : '$' }), eingabeEl, E('button', { type: 'button', text: '⏎ Enter', 'aria-label': L('Befehl ausführen', 'Befehl ausführen'), onclick: function () { var z = eingabeEl.value; eingabeEl.value = ''; senden(z); eingabeEl.focus(); } })]));
    if (PFAD.stufe === 'basis') {
      var bs = E('div', { class: 'sr-bausteine', role: 'group', 'aria-label': L('Befehls-Bausteine', 'Bausteine') });
      R.bausteine.forEach(function (w) { bs.appendChild(E('button', { type: 'button', text: w, onclick: function () { eingabeEl.value = (eingabeEl.value.trim() ? eingabeEl.value.trim() + ' ' : '') + w; eingabeEl.focus(); } })); });
      bs.appendChild(E('button', { type: 'button', class: 'steuer', text: '⌫ ' + L('Wort', 'Wort'), 'aria-label': L('Letztes Wort löschen', 'Letztes Wort löschen'), onclick: function () { eingabeEl.value = eingabeEl.value.trim().split(/\s+/).slice(0, -1).join(' '); eingabeEl.focus(); } }));
      term.appendChild(bs);
    }
    mitte.appendChild(term);
    var rechts = E('div', { style: 'display:flex;flex-direction:column;gap:10px' });
    fallEl = E('div', { class: 'sr-fall', 'aria-live': 'polite' });
    rechts.appendChild(fallEl);
    serverEl = E('div', { class: 'sr-server', 'aria-label': L('Zustand des Servers', 'Server') });
    rechts.appendChild(serverEl);
    mitte.appendChild(rechts);
    wurzel.appendChild(mitte);
    extraEl = E('div', { class: 'sr-extra' }); extraEl.hidden = true;
    wurzel.appendChild(extraEl);
    wurzel.appendChild(E('details', { class: 'sr-regeln' }, [E('summary', { text: '📘 ' + L('Regelbuch – das gilt in Raum ', 'Regelbuch – das gilt in Raum ') + R.nr }), E('ul', {}, R.regeln.map(function (r) { return E('li', { html: T(r) }); }))]));
    serverZeichnen(); fallZeichnen();
    if (phase === 'demo') { var d = fallEl.querySelector('.sr-demo'); if (d) d.classList.add('sr-puls'); }
  }

  /* Sprachwechsel: Spiel mit den neuen Texten neu zeichnen */
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-stufe]')) setTimeout(function () { if (!wurzel.isConnected) return; if (phase === 'fertig') zeichneEnde(); else if (host) zeichne(); }, 0);
  });

  /* Start: erster offener Raum, sonst der zuletzt gespielte */
  var offen = RAEUME.filter(function (x) { return !api.geschafft(x.id); });
  if (!offen.length) { R = RAEUME.filter(function (x) { return x.nr === api.speicher('r'); })[0] || RAEUME[RAEUME.length - 1]; host = neuerHost(); verlauf = []; phase = 'fertig'; zeichneEnde(); }
  else { R = offen[0]; if (!api.speicher('es')) einstufen(); else raumStart(); }

  return {
    // Musterlösung für den automatischen Test: alle offenen Räume sofort richtig durchspielen
    loesen: function () {
      RAEUME.forEach(function (raum) {
        if (api.geschafft(raum.id)) return;
        R = raum; host = neuerHost(); if (R.setup) R.setup(host);
        verlauf = []; nr = 0; fehlversuche = 0; faelle = R.faelle.concat(P([], R.ticket || [])); phase = 'spiel';
        R.demo.forEach(function (d) { demoTun(d, true); });
        if (R.demoReset) { host = neuerHost(); if (R.setup) R.setup(host); }
        selbstText = L('(Musterlösung) ', '(Musterlösung) ') + T(R.demo.filter(function (d) { return d.selbst; }).map(function (d) { return d.antwort || ''; })[0] || '');
        while (nr < faelle.length) {
          var f = fall();
          vorbereiten(f);
          if (f.typ === 'befehl') f.loesung.forEach(function (c) { ausfuehren(c, true); });
          if (f.loese) f.loese(host, ctx);
          notizSchreiben(f);
          nr++;
        }
        ende(true);
      });
      zeichneEnde();
    }
  };
}

/* ---------- Übung 1: Die Hallenbelegung (fremder Server, neue Situation) ---------- */
function uebungHalle(box, api) {
  var E = KIT.el;
  if (!document.getElementById('sr-css')) { var s = document.createElement('style'); s.id = 'sr-css'; s.textContent = SR_CSS; document.head.appendChild(s); }
  var host, verlauf = [], antwortOk = false, aufgeraeumt = false;
  var wurzel = E('div', { class: 'sr-spiel', style: 'min-height:420px' });
  box.innerHTML = ''; box.appendChild(wurzel);
  function aufbauen() {
    host = neuerHost(); verlauf = []; antwortOk = false; aufgeraeumt = false;
    ['docker run -d --name kasse nginx:alpine', 'docker run -d --name bestellungen nginx:alpine', 'docker run --name test1 hello-world', 'docker run --name test2 hello-world', 'docker run --name alt_backup ubuntu:22.04'].forEach(function (c) { hostAusfuehren(host, c); });
    host.container.forEach(function (c) { c.neu = false; });
    Object.keys(host.images).forEach(function (k) { host.images[k].neu = false; });
  }
  function zeile(t, art) { verlauf.push({ t: t, art: art || '' }); }
  function ausfuehren(z) {
    var r = hostAusfuehren(host, z);
    if (r.leeren) { verlauf = []; return r; }
    zeile('azubi@baeckerei-srv:~$ ' + z, 'sr-ein'); r.aus.forEach(function (x) { zeile(x.t, x.art); });
    return r;
  }
  function pruefeAufraeumen() {
    var beendet = host.container.filter(function (c) { return c.status !== 'up'; }).length, laufend = host.container.filter(function (c) { return c.status === 'up'; }).length;
    if (beendet === 0 && laufend === 2) aufgeraeumt = true;
    return laufend;
  }
  function zeichne(meldung) {
    wurzel.innerHTML = '';
    var hinweisText = P(L('Hier liegt schon die Ausgabe von <code>docker ps -a</code>. Wie viele Container laufen? Danach räumst du die beendeten weg – die Kasse muss weiterlaufen!', 'Die Ausgabe von <code>docker ps -a</code> ist schon da. Wie viele Container laufen? Dann lösche die beendeten Container. Die Kasse muss weiterlaufen!'), L('Verschaff dir selbst einen Überblick. Wie viele Container laufen? Dann räum alle beendeten Container auf einmal weg – die Kasse muss weiterlaufen!', 'Schau selbst nach. Wie viele Container laufen? Dann lösche alle beendeten Container. Die Kasse muss weiterlaufen!'));
    var mitte = E('div', { class: 'sr-mitte' }), term = E('div', { class: 'sr-term' });
    term.appendChild(E('div', { class: 'leiste', text: 'azubi@baeckerei-srv: ~ — bash' }));
    var aus = E('div', { class: 'sr-ausgabe', role: 'log', 'aria-label': L('Ausgabe des Terminals', 'Terminal') });
    verlauf.forEach(function (z) { aus.appendChild(E('div', { class: z.art, text: z.t })); });
    term.appendChild(aus);
    var inp = E('input', { type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': L('Befehl eingeben', 'Befehl eingeben'), onkeydown: function (e) { if (e.key === 'Enter') los(); } });
    function los() {
      var z = inp.value.trim(); if (!z) return;
      var r = ausfuehren(z), vorher = aufgeraeumt, laufend = pruefeAufraeumen(), m = null;
      if (laufend < 2) m = ['bad', L('🔥 Die Kasse ist aus! Laufende Container nicht löschen. Ich setze den Server zurück.', '🔥 Die Kasse ist aus! Lösche keine laufenden Container. Der Server startet neu.')];
      else if (aufgeraeumt && !vorher) m = ['ok', L('✔ Aufgeräumt: nur noch die zwei laufenden Container.', '✔ Fertig: Nur die 2 laufenden Container sind noch da.')];
      else if (r.fehler && ERKL[r.fehler]) m = ['bad', T(ERKL[r.fehler])];
      if (laufend < 2) { aufbauen(); }
      zeichne(m); fertig();
    }
    term.appendChild(E('div', { class: 'sr-eingabe' }, [E('span', { text: '$' }), inp, E('button', { type: 'button', text: '⏎ Enter', onclick: los })]));
    if (PFAD.stufe === 'basis') {
      var bs = E('div', { class: 'sr-bausteine' });
      ['docker', 'ps', '-a', 'rm', 'test1', 'test2', 'alt_backup'].forEach(function (w) { bs.appendChild(E('button', { type: 'button', text: w, onclick: function () { inp.value = (inp.value.trim() ? inp.value.trim() + ' ' : '') + w; inp.focus(); } })); });
      term.appendChild(bs);
    } else term.appendChild(STUFEN.profiBand(L('Ohne Bausteine – tipp: alle beendeten Container mit einem Befehl', 'Ohne Bausteine')));
    mitte.appendChild(term);
    var rechts = E('div', { class: 'sr-fall' });
    STUFEN.pfadwahl(rechts);
    rechts.appendChild(E('p', { html: '🧁 ' + hinweisText }));
    var feld = E('input', { type: 'number', min: '0', id: 'sr-u1-zahl', style: 'width:6em;min-height:40px' });
    rechts.appendChild(E('label', { for: 'sr-u1-zahl', html: '<b>' + L('Wie viele Container laufen?', 'Wie viele Container laufen?') + '</b> ' }));
    rechts.appendChild(feld);
    rechts.appendChild(E('button', { type: 'button', text: L('Prüfen', 'Prüfen'), style: 'margin-left:6px', onclick: function () {
      antwortOk = +feld.value === 2;
      zeichne(antwortOk ? ['ok', L('✔ Richtig: kasse und bestellungen laufen („Up“).', '✔ Richtig: 2 Container laufen.')] : [+feld.value === 5 ? 'bad' : 'bad', +feld.value === 5 ? L('5 ist die Zahl <b>aller</b> Container. Laufend sind nur die mit „Up“ in der Spalte STATUS.', '5 sind <b>alle</b> Container. Es laufen nur die mit „Up“.') : L('Zähl die Zeilen mit „Up“ in der Spalte STATUS.', 'Zähle die Zeilen mit „Up“.')]);
      fertig();
    } }));
    if (antwortOk) feld.value = '2';
    rechts.appendChild(E('p', { class: 'nr', html: (antwortOk ? '✔ ' : '◻ ') + L('laufende Container gezählt', 'gezählt') + '<br>' + (aufgeraeumt ? '✔ ' : '◻ ') + L('beendete Container gelöscht', 'beendete Container gelöscht') }));
    if (meldung) rechts.appendChild(E('div', { class: 'sr-rueck ' + meldung[0], html: meldung[1] }));
    mitte.appendChild(rechts);
    wurzel.appendChild(mitte);
    aus.scrollTop = aus.scrollHeight;
  }
  var erledigt = false;
  function fertig() {
    if (erledigt || !antwortOk || !aufgeraeumt) return;
    erledigt = true;
    api.notiere(L('Hallenbelegung: mein Aufräumen', 'Übung 1: mein Aufräumen'), '<pre>' + KIT.esc(verlauf.filter(function (z) { return z.art === 'sr-ein'; }).map(function (z) { return z.t.replace(/^.*\$ /, ''); }).join('\n')) + '</pre>');
    api.erledigt(L('2 laufende Container gezählt und die beendeten gelöscht – die Kasse lief weiter.', '2 Container laufen. Die beendeten sind gelöscht.'));
  }
  aufbauen();
  if (PFAD.stufe === 'basis') ausfuehren('docker ps -a');
  zeichne();
  return {
    loesen: function () { aufbauen(); ausfuehren('docker ps -a'); ausfuehren('docker rm test1 test2 alt_backup'); pruefeAufraeumen(); antwortOk = true; zeichne(); fertig(); }
  };
}

/* ---------- Paket ---------- */
window.PAKET = {
  id: 'lf9-docker-einfuehrung',
  titel: 'Docker-Einführung',
  untertitel: 'Serverraum 0 – vom ersten Container zur eigenen Foto-Cloud',
  version: '0.4',
  bestehen: 80,
  dauer: 'etwa 160 Minuten im Paket, dazu die Übungen in der VM',
  welt: { thema: 'technik', kulisse: 'serverraum', symbol: '🐳' },
  figur: { name: JANA.name, rolle: JANA.rolle, aussehen: JANA.aussehen },
  figuren: { tomas: TOMAS },
  leitsituation: 'Willkommen im <b>Serverraum 0</b>! Der Sportverein <b>TSV Lechwiesen</b> will eine eigene Foto-Cloud. Bevor wir die echte Anlage in der VM aufbauen, übst du hier im Terminal. Jeder Raum ist ein Schritt. Am Ende läuft die Foto-Cloud – und die Tür geht auf.',
  spielwelt: { titel: 'Serverraum 0 – Escape mit Terminal', tab: 'Serverraum', start: serverraum },

  lernziele: [
    { id: 'LZ1', kurz: 'Image und Container', text: 'Ich kann an der Ausgabe von <code>docker images</code> und <code>docker ps -a</code> erklären, was ein Image und was ein Container ist, und die passenden Befehle zum Starten, Anzeigen und Löschen auswählen.' },
    { id: 'LZ2', kurz: 'Bauen', text: 'Ich kann aus einem Dockerfile mit <code>docker build</code> ein Image bauen und begründen, wann ich nach einer Änderung neu bauen muss.' },
    { id: 'LZ3', kurz: 'Ports', text: 'Ich kann ein Port-Mapping (<code>-p Host:Container</code>) setzen und an einer Adresse wie <code>localhost:8080</code> ablesen, welcher Container antwortet.' },
    { id: 'LZ4', kurz: 'Daten', text: 'Ich kann für Daten begründet ein Named Volume oder einen Bind Mount auswählen und vorhersagen, welche Daten nach <code>rm</code>, <code>down</code> und <code>down -v</code> noch da sind.' },
    { id: 'LZ5', kurz: 'Compose', text: 'Ich kann eine <code>docker-compose.yml</code> mit mehreren Diensten ergänzen und starten: mit Service-Name statt <code>localhost</code>, <code>service_healthy</code> und Variablen aus der <code>.env</code>.' },
    { id: 'LZ6', kurz: 'Fehlersuche', text: 'Ich kann eine Docker-Fehlermeldung einer Ursache zuordnen und die passende Behebung auswählen.' }
  ],

  glossar: [
    { begriff: 'das Image, die Images', erklaerung: 'Unveränderlicher Bauplan für Container: Programm, Bibliotheken und Einstellungen. Kommt aus einer Registry oder aus <code>docker build</code>.', vorab: true },
    { begriff: 'der Container, die Container', erklaerung: 'Laufende oder beendete Instanz eines Images. Aus einem Image entstehen beliebig viele Container.', vorab: true },
    { begriff: 'die Registry, die Registrys', erklaerung: 'Online-Lager für Images, z. B. Docker Hub. <code>docker pull</code> und <code>docker run</code> laden von dort.' },
    { begriff: 'der Host, die Hosts', erklaerung: 'Der Rechner, auf dem Docker läuft – hier die Linux-VM bzw. der Vereinsserver.' },
    { begriff: 'das Port-Mapping, die Port-Mappings', erklaerung: 'Weiterleitung von einem Port des Hosts zu einem Port im Container: <code>-p Host:Container</code>.', vorab: true },
    { begriff: 'das Volume, die Volumes', erklaerung: 'Von Docker verwalteter Speicher, der Container überlebt. Wird nur mit Namen angegeben, z. B. <code>pgdata:/var/lib/…</code>.', vorab: true },
    { begriff: 'Docker Compose', erklaerung: 'Werkzeug, das mehrere Container aus einer Datei (<code>docker-compose.yml</code>) gemeinsam startet und verbindet.', vorab: true },
    { begriff: 'ephemer', erklaerung: 'Flüchtig: Was nur im Container gespeichert ist, ist weg, wenn der Container gelöscht wird.' }
  ],

  stationen: [
    { id: 'S1', titel: 'Raum 1 · Hallo, Container!', lz: ['LZ1'], check: ['r1-k1', 'r1-k2', 'r1-k3'],
      auftrag: 'Bevor wir den Verein beglücken: Starte deinen ersten Container und finde heraus, wo er geblieben ist.',
      mitdenken: { auftrag: 'Erkläre einer Mitschülerin in zwei Sätzen den Unterschied zwischen Image und Container. Benutze ein Beispiel aus der Programmierung.', muster: 'Ein Image ist wie eine Klasse: ein fester Bauplan. Ein Container ist wie ein Objekt: Aus einem Image kann ich mit <code>docker run</code> beliebig viele Container erzeugen.' } }
  ],

  uebungen: [
    { id: 'U1', titel: 'Die Hallenbelegung', lz: ['LZ1'],
      auftrag: 'Die Bäckerei Krume hat ihren Kassenserver von uns. Zähle die laufenden Container und räume die beendeten weg.',
      interaktion: uebungHalle,
      tipps: ['Laufende und beendete Container stehen in derselben Liste von <code>docker ps -a</code>. Schau auf die Spalte STATUS.', '„Up …“ heißt: läuft. „Exited …“ heißt: beendet. Es laufen 2.', 'Lösung: 2 laufen (kasse, bestellungen). Lösche die drei beendeten mit <code>docker rm test1 test2 alt_backup</code> – oder im Profi-Weg alle auf einmal mit <code>docker container prune -f</code>.'],
      reflexion: { frage: 'Woran erkennst du in <code>docker ps -a</code>, aus welchem Image ein Container stammt?', muster: 'An der Spalte IMAGE. Mehrere Container können dasselbe Image haben.' } }
  ],

  fragen: [
    { id: 'r1-k1', lz: 'LZ1', einsatz: ['check', 'nachweis'], typ: 'zahl',
      frage: 'Die Ausgabe von <code>docker ps -a</code>:<pre style="font-size:.8rem;overflow:auto">CONTAINER ID   IMAGE         STATUS                    NAMES\n3f2a1c9e8d7b   nginx:alpine  Up 5 minutes              web\n9b8a7c6d5e4f   hello-world   Exited (0) 2 minutes ago  hallo2\n1a2b3c4d5e6f   hello-world   Exited (0) 3 minutes ago  hallo1</pre>Wie viele Container gibt es auf diesem Host?',
      zahl: { wert: 3, toleranz: 0 },
      typisch: [{ wert: 1, feedback: 'Du hast nur den laufenden Container gezählt. <code>docker ps -a</code> zeigt auch die beendeten – jede Zeile ist ein Container.' }, { wert: 2, feedback: 'Du hast die Images gezählt (nginx und hello-world). Gefragt sind Container: jede Zeile einer.' }],
      erklaerung: 'Jede Zeile von <code>docker ps -a</code> ist ein Container – laufend oder beendet. Das sind 3. Aus dem Image hello-world sind zwei Container entstanden.' },
    { id: 'r1-k2', lz: 'LZ1', einsatz: ['check', 'nachweis'], typ: 'zuordnen',
      frage: 'Ordne jedem Befehl zu, was er tut.',
      paare: [
        { links: '<code>docker ps</code>', rechts: 'zeigt laufende Container' },
        { links: '<code>docker ps -a</code>', rechts: 'zeigt alle Container, auch beendete' },
        { links: '<code>docker images</code>', rechts: 'zeigt die Images auf dem Host' },
        { links: '<code>docker rm</code>', rechts: 'löscht Container' },
        { links: '<code>docker rmi</code>', rechts: 'löscht Images' }
      ],
      feedbackFalsch: 'Achte auf die Endung: <code>rm</code> = Container, <code>rmi</code> = Image (i wie Image). <code>ps</code> ohne <code>-a</code> zeigt nur laufende Container.',
      erklaerung: '<code>ps</code> und <code>rm</code> arbeiten mit Containern, <code>images</code> und <code>rmi</code> mit Images. <code>-a</code> heißt „all“.' },
    { id: 'r1-k3', lz: 'LZ1', einsatz: ['check', 'nachweis'], typ: 'mc',
      frage: 'Du tippst dreimal hintereinander <code>docker run hello-world</code>. Was liegt danach auf dem Host?',
      optionen: [
        { text: '1 Image und 3 beendete Container', richtig: true },
        { text: '1 Image und 1 Container, der dreimal gestartet wurde', feedback: 'Jedes <code>docker run</code> erzeugt einen neuen Container. Ein vorhandener Container wird nicht wieder gestartet.' },
        { text: '3 Images und 3 Container', feedback: 'Das Image wird nur beim ersten Mal heruntergeladen. Danach nutzt Docker es wieder.' },
        { text: '1 Image und keinen Container – hello-world beendet sich ja', feedback: 'Beendete Container bleiben in der Liste stehen, bis du sie mit <code>docker rm</code> löschst.' }
      ],
      erklaerung: 'Ein Image, drei Container: Jedes <code>run</code> macht aus demselben Bauplan einen neuen Container. hello-world beendet sich, die Container bleiben als „Exited“ stehen.' }
  ]
};
