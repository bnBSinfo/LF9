/* =====================================================================
   Docker auf einen Blick – nach dem Nachweis auf der Seite ④ Abschluss:
   1. die wichtigsten Docker-Befehle, 2. das Wichtigste in Kürze.
   Mit Knopf „📄 … als PDF erstellen“ (js/pdf.js). engine.js bleibt
   unverändert: Die Karte wird eingefügt, sobald die Abschluss-Seite mit
   dem Merkblatt steht (das gibt es nur, wenn der Nachweis gemacht ist).
   Texte in beiden Sprachstufen über L(Standard, Einfach).
   ===================================================================== */
(function () {
  var E = KIT.el;

  /* ---------- 1. Die wichtigsten Befehle ---------- */
  var BEFEHLE_BLICK = [
    { gruppe: ['Images', 'Images'], zeilen: [
      ['docker pull nginx:alpine', 'Image aus der Registry laden', 'Image aus der Registry laden'],
      ['docker build -t name .', 'Image aus dem Dockerfile im aktuellen Ordner (Punkt!) bauen', 'Image aus dem Dockerfile bauen. Der Punkt am Ende ist der Ordner.'],
      ['docker images', 'Images auf dem Host anzeigen', 'Images auf dem Host zeigen'],
      ['docker rmi name', 'Image löschen – erst, wenn kein Container mehr daraus besteht', 'Image löschen. Das geht erst, wenn es keinen Container mehr aus dem Image gibt.']
    ] },
    { gruppe: ['Container', 'Container'], zeilen: [
      ['docker run -d --name web -p 8080:80 name', 'Container im Hintergrund starten, mit Name und Port (Host:Container)', 'Container im Hintergrund starten. Mit Name und Port. Links Host, rechts Container.'],
      ['docker ps', 'nur laufende Container anzeigen', 'Container zeigen, die laufen'],
      ['docker ps -a', 'alle Container anzeigen, auch beendete', 'alle Container zeigen, auch die beendeten'],
      ['docker stop web · docker start web', 'Container stoppen bzw. wieder starten', 'Container stoppen. Container wieder starten.'],
      ['docker rm web · docker rm -f web', 'Container löschen; mit <code>-f</code> auch einen laufenden', 'Container löschen. Mit <code>-f</code> auch einen Container, der läuft.'],
      ['docker logs web', 'Ausgabe und Fehlermeldungen des Containers lesen', 'Meldungen vom Container lesen']
    ] },
    { gruppe: ['Daten', 'Daten'], zeilen: [
      ['-v daten:/var/lib/mysql', '<b>Named Volume</b>: Docker verwaltet den Speicher (Datenbanken)', '<b>Volume</b>: Docker verwaltet den Speicher. Gut für Datenbanken.'],
      ['-v ./fotos:/photos', '<b>Bind Mount</b>: Ordner des Hosts einbinden (Fotos, Exporte)', '<b>Bind Mount</b>: Ordner vom Host. Gut für Fotos.'],
      ['-v ./fotos:/photos:ro', 'nur lesen – der Container darf nichts ändern', 'nur lesen. Der Container darf nichts ändern.'],
      ['docker volume ls', 'Volumes anzeigen', 'Volumes zeigen']
    ] },
    { gruppe: ['Compose', 'Compose'], zeilen: [
      ['cp .env.example .env', 'Datei mit Passwörtern und Variablen anlegen', 'Datei mit Passwörtern anlegen'],
      ['docker compose up -d', 'alle Dienste aus der <code>docker-compose.yml</code> starten (Netzwerk inklusive)', 'alle Dienste aus der Compose-Datei starten. Das Netzwerk kommt dazu.'],
      ['docker compose ps', 'Dienste und Status anzeigen (z. B. <code>healthy</code>)', 'Dienste und Zustand zeigen'],
      ['docker compose logs dienst', 'Meldungen eines Dienstes lesen', 'Meldungen von einem Dienst lesen'],
      ['docker compose down', 'Container und Netzwerk entfernen – <b>Volumes bleiben</b>', 'Container und Netzwerk entfernen. <b>Volumes bleiben.</b>'],
      ['docker compose down -v', '<b>Achtung:</b> löscht auch die Named Volumes', '<b>Achtung:</b> löscht auch die Volumes']
    ] },
    { gruppe: ['Netzwerk', 'Netzwerk'], zeilen: [
      ['docker network create netz', 'eigenes Netzwerk anlegen (Compose macht das selbst)', 'Netzwerk anlegen. Compose macht das selbst.'],
      ['--network netz', 'Container ins Netzwerk hängen; dort ist der Name die Adresse', 'Container ins Netzwerk bringen. Dort ist der Name die Adresse.']
    ] }
  ];

  /* ---------- 2. Das Wichtigste in Kürze ---------- */
  var KURZ = [
    { titel: ['Image und Container', 'Image und Container'], punkte: [
      ['Ein <b>Image</b> ist der Bauplan (wie eine Klasse), ein <b>Container</b> läuft daraus (wie ein Objekt).', 'Ein <b>Image</b> ist der Bauplan. Ein <b>Container</b> läuft aus dem Bauplan. Wie Klasse und Objekt.'],
      ['Jedes <code>docker run</code> erzeugt einen <b>neuen</b> Container (= create + start).', 'Jedes <code>docker run</code> macht einen <b>neuen</b> Container.'],
      ['Beendete Container bleiben, bis du sie mit <code>docker rm</code> löschst.', 'Beendete Container bleiben da. Erst <code>docker rm</code> löscht einen Container.']
    ] },
    { titel: ['Bauen', 'Bauen'], punkte: [
      ['Im <b>Dockerfile</b> steht das Rezept: <code>FROM</code>, <code>COPY</code>, <code>EXPOSE</code>, <code>CMD</code>.', 'Im <b>Dockerfile</b> steht das Rezept: <code>FROM</code>, <code>COPY</code>, <code>EXPOSE</code>, <code>CMD</code>.'],
      ['Datei geändert? <b>Neu bauen</b>, alten Container löschen, neuen starten.', 'Hast du eine Datei geändert? Dann <b>neu bauen</b>. Lösche den alten Container. Starte einen neuen Container.']
    ] },
    { titel: ['Ports', 'Ports'], punkte: [
      ['<code>-p 8080:80</code> = Host-Port 8080 → Container-Port 80. Ohne <code>-p</code> ist der Container von außen nicht erreichbar.', '<code>-p 8080:80</code>: Links ist der Port vom Host. Rechts ist der Port im Container. Ohne <code>-p</code> kommt niemand von außen an den Container.'],
      ['Jeder Host-Port nur <b>einmal</b> – sonst <code>port is already allocated</code>.', 'Jeden Host-Port gibt es nur <b>1-mal</b>. Sonst kommt <code>port is already allocated</code>.']
    ] },
    { titel: ['Daten', 'Daten'], punkte: [
      ['Container sind <b>ephemer</b>: Was nur im Container liegt, ist nach <code>docker rm</code> weg.', 'Container sind <b>ephemer</b>. Was nur im Container liegt, ist nach <code>docker rm</code> weg.'],
      ['<b>Named Volume</b> für Datenbanken, <b>Bind Mount</b> für Dateien, die du auf dem Host sehen willst.', '<b>Volume</b> für Datenbanken. <b>Bind Mount</b> für Dateien, die du auf dem Host sehen willst.'],
      ['<code>down</code> lässt Volumes stehen, <code>down -v</code> löscht sie. Bind-Mount-Ordner löscht Docker nie.', '<code>down</code> lässt Volumes stehen. <code>down -v</code> löscht die Volumes. Ordner auf dem Host löscht Docker nie.']
    ] },
    { titel: ['Compose und Netzwerk', 'Compose und Netzwerk'], punkte: [
      ['Alle Dienste stehen in der <code>docker-compose.yml</code>; Compose legt ein gemeinsames Netzwerk an.', 'Alle Dienste stehen in der <code>docker-compose.yml</code>. Compose legt ein Netzwerk an.'],
      ['Im Netzwerk ist der <b>Service-Name</b> die Adresse (<code>DB_HOST: db</code>). <code>localhost</code> ist der Container selbst.', 'Im Netzwerk ist der <b>Service-Name</b> die Adresse, zum Beispiel <code>db</code>. <code>localhost</code> ist der Container selbst.'],
      ['Passwörter gehören in die <code>.env</code> und werden mit <code>${NAME}</code> eingesetzt.', 'Passwörter kommen in die <code>.env</code>. In der Compose-Datei steht <code>${NAME}</code>.'],
      ['Die Datenbank bekommt kein <code>ports:</code> – sie bleibt intern. <code>service_healthy</code> wartet, bis sie bereit ist.', 'Die Datenbank bekommt kein <code>ports:</code>. Die Datenbank bleibt innen. <code>service_healthy</code> wartet, bis die Datenbank bereit ist.']
    ] },
    { titel: ['Fehlersuche', 'Fehler finden'], punkte: [
      ['Reihenfolge: <code>docker ps -a</code> → <code>docker logs</code> → Meldung lesen → erst dann ändern.', 'So gehst du vor: 1. <code>docker ps -a</code> 2. <code>docker logs</code> 3. Meldung lesen. 4. Dann erst etwas ändern.'],
      ['<code>variable is not set</code> → <code>.env</code> anlegen · <code>no container to start</code> → <code>up -d</code> · <code>SSL_ERROR</code> → <code>http://</code> statt <code>https://</code>.', '<code>variable is not set</code>: Lege die <code>.env</code> an. <code>no container to start</code>: Nimm <code>up -d</code>. <code>SSL_ERROR</code>: Nimm <code>http://</code>.']
    ] }
  ];

  function T2(p) { return L(p[0], p[1]); }
  function befehleHtml() {
    var h = '<table class="tab dk-blick"><tr><th>' + L('Befehl', 'Befehl') + '</th><th>' + L('Was er tut', 'Was passiert') + '</th></tr>';
    BEFEHLE_BLICK.forEach(function (g) {
      h += '<tr class="dk-gruppe"><th colspan="2">' + T2(g.gruppe) + '</th></tr>';
      g.zeilen.forEach(function (z) { h += '<tr><td><code>' + KIT.esc(z[0]) + '</code></td><td>' + L(z[1], z[2]) + '</td></tr>'; });
    });
    return h + '</table>';
  }
  function kurzHtml() {
    var h = '';
    KURZ.forEach(function (k) { h += '<h3>' + T2(k.titel) + '</h3><ul>' + k.punkte.map(function (p) { return '<li>' + T2(p) + '</li>'; }).join('') + '</ul>'; });
    return h;
  }
  function pdfHtml() {
    var stil = '<style>.dk-blick td,.dk-blick th{vertical-align:top;padding:4px 6px}.dk-blick td:first-child{white-space:nowrap}.dk-blick tr.dk-gruppe th{background:#e0e7ff;text-align:left}h3{margin:12px 0 4px}</style>';
    return stil + '<h1>🐳 ' + L('Docker auf einen Blick', 'Docker auf einen Blick') + '</h1><p class="klein">' + KIT.esc(PAKET.titel) + ' · ' + new Date().toLocaleDateString('de-DE') + '</p>' +
      '<h2>1 · ' + L('Die wichtigsten Befehle', 'Die wichtigsten Befehle') + '</h2>' + befehleHtml() +
      '<div class="seitenumbruch"></div><h2>2 · ' + L('Das Wichtigste in Kürze', 'Das Wichtigste kurz') + '</h2>' + kurzHtml() +
      '<p class="klein druckfuss">Lernpaket „' + KIT.esc(PAKET.titel) + '“ · Version ' + PAKET.version + '</p>';
  }

  function karte() {
    if (!document.getElementById('dk-css-blick')) {
      var s = document.createElement('style'); s.id = 'dk-css-blick';
      s.textContent = '.dk-blick-karte{border:3px solid #4338ca;border-left-width:10px}.dk-blick-karte h2{margin-top:0}' +
        '.dk-blick{width:100%;border-collapse:collapse}.dk-blick td,.dk-blick th{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}' +
        '.dk-blick td:first-child{white-space:nowrap}.dk-blick tr.dk-gruppe th{background:var(--accent-soft);color:var(--accent);font-size:1rem}' +
        '@media (max-width:700px){.dk-blick td:first-child{white-space:normal;word-break:break-word}}';
      document.head.appendChild(s);
    }
    var c = E('div', { class: 'card dk-blick-karte', id: 'docker-blick' });
    c.appendChild(E('h2', { text: '🐳 ' + L('Docker auf einen Blick', 'Docker auf einen Blick') }));
    c.appendChild(E('p', { html: L('Zum Mitnehmen: die wichtigsten Docker-Befehle und eine Zusammenfassung der wichtigsten Inhalte. Der Knopf unten erstellt daraus eine PDF-Datei.', 'Zum Mitnehmen: die wichtigsten Befehle und das Wichtigste kurz. Der Knopf unten macht daraus eine PDF-Datei.') }));
    c.appendChild(E('h3', { text: '1 · ' + L('Die wichtigsten Befehle', 'Die wichtigsten Befehle') }));
    c.appendChild(E('div', { style: 'overflow-x:auto', html: befehleHtml() }));
    c.appendChild(E('h3', { text: '2 · ' + L('Das Wichtigste in Kürze', 'Das Wichtigste kurz') }));
    c.appendChild(E('div', { html: kurzHtml() }));
    var titel = 'Docker auf einen Blick';
    var knopf = window.PDF
      ? window.PDF.knopf(L('Docker auf einen Blick als PDF erstellen', 'Docker auf einen Blick als PDF erstellen'), function () { return { titel: titel, html: pdfHtml() }; }, function () { window.print(); })
      : E('button', { type: 'button', text: '🖨 ' + titel, onclick: function () { window.print(); } });
    c.appendChild(E('div', { class: 'knoepfe noprint', style: 'margin-top:10px' }, [knopf]));
    return c;
  }

  /* Einfügen, sobald die Abschluss-Seite das Merkblatt zeigt (nur nach dem Nachweis) */
  var haupt = document.getElementById('haupt');
  function einfuegen() {
    var mb = document.getElementById('merkblatt');
    if (!mb || document.getElementById('docker-blick')) return;
    mb.parentNode.insertBefore(karte(), mb);
  }
  if (haupt) new MutationObserver(einfuegen).observe(haupt, { childList: true });
  window.DOCKER_BLICK = { html: pdfHtml };
})();
