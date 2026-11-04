/* =====================================================================
   SPRACHSTUFE EINFACH (Leitfaden P16) – zweite Fassung aller Paket-Texte.
   Geladen NACH js/inhalt.js und VOR js/engine.js.

   EINFACH enthält dieselbe Struktur wie window.PAKET, aber nur die Texte in
   einfacher Sprache. Listen werden über id, begriff oder lz angesprochen
   (bei Optionen, Zeilen und Tipps über die Position 0, 1, 2 …; null = Text
   bleibt). Regeln: kurze Sätze (meist höchstens 10 Wörter), eine Information
   pro Satz, Hauptsätze, aktiv, Zahlen als Ziffern, Fachbegriffe bleiben gleich.
   Zahlen, Codes und Lösungen bleiben unverändert – die Bewertung ist gleich.

   Texte, die Szenen selbst erzeugen, stehen in js/inhalt.js als L('…', '…').
   Der Umschalter sitzt im Kopf, die Wahl merkt sich der Browser.
   ===================================================================== */
(function () {
  'use strict';
  var P = window.PAKET;

  /* ---- Texte in einfacher Sprache (pro Paket ausfüllen) ----
     Beispiel für den Vorlagen-Inhalt „Bits & Bytes“ – beim Bauen eines neuen
     Pakets vollständig durch die eigenen Texte ersetzen. */
  var EINFACH = window.EINFACH || {
    leitsituation: 'Willkommen im <b>Serverraum 0</b>! Der Sportverein <b>TSV Lechwiesen</b> will eine eigene Foto-Cloud. Du übst hier zuerst im Terminal. Danach baust du alles in der VM. Jeder Raum ist ein Schritt. Am Ende läuft die Foto-Cloud. Dann geht die Tür auf.',
    lernziele: {
      LZ1: { kurz: 'Image und Container', text: 'Ich kann sagen: Das ist ein Image. Das ist ein Container. Ich kann Container starten, anzeigen und löschen.' },
      LZ2: { kurz: 'Bauen', text: 'Ich kann mit <code>docker build</code> ein Image bauen. Ich weiß, wann ich neu bauen muss.' },
      LZ3: { kurz: 'Ports', text: 'Ich kann ein Port-Mapping setzen: <code>-p Host:Container</code>. Ich weiß, welcher Container unter <code>localhost:8080</code> antwortet.' },
      LZ4: { kurz: 'Daten', text: 'Ich kann wählen: Volume oder Bind Mount. Ich weiß, welche Daten nach <code>rm</code>, <code>down</code> und <code>down -v</code> noch da sind.' },
      LZ5: { kurz: 'Compose', text: 'Ich kann eine <code>docker-compose.yml</code> ergänzen und starten. Mit Service-Name, <code>service_healthy</code> und <code>.env</code>.' },
      LZ6: { kurz: 'Fehlersuche', text: 'Ich kann eine Fehlermeldung von Docker lesen. Ich finde die Ursache und die Lösung.' }
    },
    glossar: {
      'das Image, die Images': { erklaerung: 'Ein Bauplan. Aus dem Bauplan macht Docker Container. Den Bauplan kann man nicht ändern.' },
      'der Container, die Container': { erklaerung: 'Ein Programm, das aus einem Image läuft. Aus 1 Image kann man viele Container machen.' },
      'die Registry, die Registrys': { erklaerung: 'Ein Lager im Internet für Images. Zum Beispiel Docker Hub.' },
      'der Host, die Hosts': { erklaerung: 'Der Rechner, auf dem Docker läuft. Hier: die VM oder der Server vom Verein.' },
      'das Port-Mapping, die Port-Mappings': { erklaerung: 'Eine Weiterleitung. Links steht der Port vom Rechner. Rechts steht der Port im Container.' },
      'das Volume, die Volumes': { erklaerung: 'Ein Speicher von Docker. Die Daten bleiben, auch wenn der Container weg ist.' },
      'Docker Compose': { erklaerung: 'Ein Werkzeug. Es startet mehrere Container mit 1 Datei.' },
      'ephemer': { erklaerung: 'Nicht dauerhaft. Die Daten sind weg, wenn der Container weg ist.' }
    },
    uebungen: {
      U1: { auftrag: 'Die Bäckerei Krume hat einen Kassenserver von uns. Zähle die Container, die laufen. Dann lösche die beendeten Container.',
        tipps: ['Schau in die Liste von <code>docker ps -a</code>. Schau auf die Spalte STATUS.', '„Up“ heißt: läuft. „Exited“ heißt: beendet. Es laufen 2.', 'Lösung: 2 laufen. Lösche die 3 beendeten: <code>docker rm test1 test2 alt_backup</code>.'],
        reflexion: { frage: 'Wo siehst du in <code>docker ps -a</code> das Image von einem Container?', muster: 'In der Spalte IMAGE.' } }
    },
    stationen: {
      S2: { auftrag: 'Der Verein braucht eine Webseite. Baue ein Image. Mach die Seite im Browser sichtbar.', mitdenken: { auftrag: 'Zeichne 2 Kästen: Rechner und Container. Zeichne einen Pfeil für <code>-p 8081:80</code>.', muster: 'Kasten „Rechner“ mit 8081. Pfeil. Kasten „Container“ mit 80. Der Browser fragt 8081.' } },
      S3: { auftrag: 'Der Verein will Fotos speichern. Wo bleiben Daten sicher?', mitdenken: { auftrag: 'Erkläre Tomás: Warum waren die Listen weg? Was machen wir jetzt anders?', muster: 'Die Listen waren nur im Container. Der Container war weg. Also waren die Listen weg. Jetzt nehmen wir ein Volume. Das bleibt.' } },
      S4: { auftrag: 'Starte 3 Container mit 1 Datei.', mitdenken: { auftrag: 'Zeichne die 3 Dienste als Kästen. Welche Pfeile kommen von außen?', muster: 'Browser → web (8080). Browser → adminer (8081). adminer → db. db → Volume. Zur db kommt kein Pfeil von außen.' } },
      S5: { auftrag: 'Ergänze die Immich-Datei. Starte Immich. Hole die alten Fotos.', mitdenken: { auftrag: 'Schreibe eine Notfallkarte mit 3 Zeilen: Was nie eingeben? Was tun, wenn die Seite nicht lädt? Was ins Backup?', muster: 'Nie <code>docker compose down -v</code>. Seite lädt nicht: <code>docker compose ps</code>, <code>logs</code>, <code>http://</code>. Backup: Ordner <code>library/</code> und Datenbank.' } },
      S1: { auftrag: 'Starte deinen ersten Container. Finde dann heraus: Wo ist der Container jetzt?', mitdenken: { auftrag: 'Erkläre einer Mitschülerin den Unterschied: Image und Container. Schreibe 2 Sätze. Nimm ein Beispiel aus der Programmierung.', muster: 'Ein Image ist wie eine Klasse. Es ist ein fester Bauplan. Ein Container ist wie ein Objekt. Mit <code>docker run</code> mache ich aus 1 Image viele Container.' } }
    },
    fragen: {
      'r2-k1': { frage: 'Ein Container läuft mit <code>-p 8081:80</code>. Welche Adresse öffnest du?', erklaerung: 'Links steht der Port vom Rechner: 8081. Docker leitet weiter an 80.',
        optionen: [null, { feedback: '80 ist der Port im Container. Der Browser braucht die linke Zahl.' }, { feedback: 'Eine Adresse hat nur 1 Port.' }] },
      'r2-k2': { frage: 'Du hast <code>index.html</code> geändert. Sie kommt mit <code>COPY</code> ins Image. Was tust du?', erklaerung: 'Die Datei ist im Image. Erst ein neuer Build ändert das Image.',
        optionen: [{ text: 'Neu bauen, alten Container löschen, neu starten' }, { feedback: 'Restart nimmt das alte Image.' }, { feedback: 'Die Datei ist im Image. Neu laden reicht nicht.' }] },
      'r2-k3': { frage: 'Du tippst 3-mal <code>docker run -d nginx:alpine</code>. Wie viele Container laufen?', erklaerung: '3-mal run = 3 Container. Alle laufen.' },
      'r3-k1': { frage: 'Ordne zu: Volume oder Bind Mount?', feedbackFalsch: 'Schau links: Beginnt es mit <code>/</code> oder <code>./</code>? Dann ist es ein Bind Mount.', erklaerung: 'Pfad links: Bind Mount. Name links: Volume. <code>:ro</code>: nur lesen.' },
      'r3-k2': { frage: 'Was heißt <code>:ro</code>?', erklaerung: '<code>:ro</code> heißt: nur lesen.', optionen: [{ text: 'Der Container darf nur lesen.' }, { text: 'Der Ordner gehört root.', feedback: '<code>ro</code> heißt read only. Nicht root.' }, { text: 'Der Ordner wird geleert.', feedback: 'Nichts wird gelöscht.' }] },
      'r3-k3': { frage: '2 Container sollen je eine Webseite zeigen. Was geht?', erklaerung: 'Links verschiedene Ports. Rechts der Port im Container.',
        optionen: [null, { feedback: 'Beide wollen 8080. Das geht nicht.' }, { feedback: 'nginx hört im Container auf 80. Nicht auf 8080.' }] },
      'r4-k1': { frage: 'Du meldest dich in Adminer an. Die Datenbank heißt <code>db</code>. Was schreibst du bei <b>Server</b>?', erklaerung: 'Der Name vom Service ist die Adresse: <code>db</code>.' },
      'r4-k2': { frage: 'Was löscht <code>docker compose down</code>?', erklaerung: '<code>down</code>: Container weg. Volumes bleiben. <code>down -v</code>: auch Volumes weg.',
        optionen: [{ text: 'Container und Netzwerk. Volumes bleiben.' }, { text: 'Container, Netzwerk und Volumes.', feedback: 'Volumes löscht nur <code>down -v</code>.' }, { text: 'Nur das Netzwerk.', feedback: 'Auch die Container sind weg.' }] },
      'r4-k3': { frage: 'Was steht bei <code>build:</code> in der Compose-Datei?', erklaerung: 'Bei <code>build:</code> steht der Ordner mit dem Dockerfile.',
        optionen: [{ text: 'Der Ordner mit dem Dockerfile' }, { text: 'Der Name von einem fertigen Image', feedback: 'Fertige Images stehen bei <code>image:</code>.' }, { text: 'Der Pfad zu index.html', feedback: 'Compose braucht den Ordner.' }] },
      'r5-k1': { frage: 'Welche Lösung passt zu welchem Fehler?', feedbackFalsch: 'Lies jeden Fehler genau. Er nennt Port, Variable, Service oder SSL.', erklaerung: 'Der Fehler nennt fast immer die Ursache.' },
      'r5-k2': { frage: 'Immich zeigt keine Fotos. Eingetragen ist <code>/home/azubi/immich/beispielbilder</code>. Was ist falsch?', erklaerung: 'In Immich nimmst du den Pfad im Container: <code>/mnt/import</code>.',
        optionen: [{ text: 'Das ist der Pfad vom Rechner. Immich sieht <code>/mnt/import</code>.' }, { text: 'Die Fotos haben ein falsches Format.', feedback: 'Immich findet den Ordner nicht.' }, { text: 'Der Ordner hat <code>:ro</code>.', feedback: 'Lesen ist erlaubt.' }] },
      'r5-k3': { frage: 'Was muss bei Immich ins Backup?', erklaerung: 'Fotos ohne Datenbank: nur Dateien. Datenbank ohne Fotos: leeres Album. Also beides.',
        optionen: [{ text: 'Der Ordner <code>library/</code> und die Datenbank' }, { text: 'Nur der Ordner', feedback: 'Ohne Datenbank fehlen Konten und Alben.' }, { text: 'Nur die Datenbank', feedback: 'Ohne Fotos ist das Album leer.' }] },
      'r1-k1': { frage: 'Das zeigt <code>docker ps -a</code>:<pre style="font-size:.8rem;overflow:auto">CONTAINER ID   IMAGE         STATUS                    NAMES\n3f2a1c9e8d7b   nginx:alpine  Up 5 minutes              web\n9b8a7c6d5e4f   hello-world   Exited (0) 2 minutes ago  hallo2\n1a2b3c4d5e6f   hello-world   Exited (0) 3 minutes ago  hallo1</pre>Wie viele Container gibt es?',
        erklaerung: 'Jede Zeile ist 1 Container. Das sind 3. Es zählen auch die beendeten Container.' },
      'r1-k2': { frage: 'Was macht der Befehl? Ordne zu.', feedbackFalsch: 'Achte auf das Ende: <code>rm</code> ist für Container. <code>rmi</code> ist für Images (i wie Image). <code>ps</code> ohne <code>-a</code> zeigt nur Container, die laufen.',
        erklaerung: '<code>ps</code> und <code>rm</code> sind für Container. <code>images</code> und <code>rmi</code> sind für Images. <code>-a</code> heißt „alle“.' },
      'r1-k3': { frage: 'Du tippst 3-mal <code>docker run hello-world</code>. Was ist danach auf dem Rechner?',
        optionen: [{ text: '1 Image und 3 beendete Container' }, { text: '1 Image und 1 Container. Er ist 3-mal gestartet.', feedback: 'Jedes <code>docker run</code> macht einen neuen Container.' }, { text: '3 Images und 3 Container', feedback: 'Docker lädt das Image nur 1-mal.' }, { text: '1 Image und kein Container. hello-world hört ja auf.', feedback: 'Beendete Container bleiben da. Erst <code>docker rm</code> löscht sie.' }],
        erklaerung: '1 Image und 3 Container. Jedes <code>run</code> macht einen neuen Container. Die Container sind beendet. Sie bleiben aber da.' }
    }
  };

  /* ---- Texte austauschen und wiederherstellen ---- */
  var gemerkt = [];
  function finde(liste, schluessel) {
    if (/^\d+$/.test(schluessel)) return liste[+schluessel];
    return liste.filter(function (x) { return x && (x.id === schluessel || x.begriff === schluessel || x.lz === schluessel); })[0];
  }
  function anwenden(ziel, quelle) {
    Object.keys(quelle).forEach(function (k) {
      var q = quelle[k];
      if (q === null || q === undefined) return;
      var z = Array.isArray(ziel) ? finde(ziel, k) : ziel[k];
      if (typeof q === 'object' && z && typeof z === 'object') { anwenden(z, q); return; }
      if (typeof q === 'object' || Array.isArray(ziel)) return;
      gemerkt.push([ziel, k, ziel[k]]);
      ziel[k] = q;
    });
  }
  function zuruecksetzen() {
    for (var i = gemerkt.length - 1; i >= 0; i--) gemerkt[i][0][gemerkt[i][1]] = gemerkt[i][2];
    gemerkt = [];
  }

  /* ---- Umschalter im Kopf ---- */
  var kopf = document.querySelector('.kopf');
  var leiste = document.createElement('div');
  leiste.className = 'st-sprachwahl';
  leiste.setAttribute('role', 'group');
  leiste.setAttribute('aria-label', 'Sprache wählen');
  leiste.innerHTML = '<span aria-hidden="true">🌐</span>' +
    '<button type="button" data-stufe="standard" lang="de">Standard</button>' +
    '<button type="button" data-stufe="einfach" lang="de">Einfach</button>' +
    '<span class="st-sprachhinweis" aria-live="polite"></span>';
  if (kopf) kopf.appendChild(leiste);
  var hinweis = leiste.querySelector('.st-sprachhinweis');
  var stil = document.createElement('style');
  stil.textContent = '.st-sprachwahl{display:flex;align-items:center;gap:6px;flex-wrap:wrap}' +
    '.st-sprachwahl button{min-height:40px;padding:4px 12px;font-weight:700}' +
    '.st-sprachwahl button[aria-pressed="true"]{background:#fff!important;color:var(--kopf-b)!important;border-color:#fff!important}' +
    '.st-sprachhinweis{font-size:.85rem;color:#fff;flex-basis:100%}.st-sprachhinweis:empty{display:none}';
  document.head.appendChild(stil);

  function setze(stufe, neuZeichnen) {
    if (stufe !== 'einfach') stufe = 'standard';
    if (stufe !== SPRACHE.stufe) {
      if (stufe === 'einfach') anwenden(P, EINFACH); else zuruecksetzen();
      SPRACHE.stufe = stufe;
      STUFEN.merke('sprache', stufe);
    }
    leiste.querySelectorAll('[data-stufe]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-stufe') === SPRACHE.stufe)); });
    if (!neuZeichnen || !window.LERNPAKET) return;
    var a = window.LERNPAKET.ansicht();
    if (a.teil === 'nachweis') { hinweis.textContent = stufe === 'einfach' ? 'Die einfache Sprache gilt ab der nächsten Seite.' : 'Die Standardsprache gilt ab der nächsten Seite.'; return; }
    hinweis.textContent = '';
    window.LERNPAKET.zeige(a.teil, a.i);
  }
  leiste.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-stufe]');
    if (b) setze(b.getAttribute('data-stufe'), true);
  });

  /* ---- Start: gespeicherte Wahl übernehmen (vor dem ersten Zeichnen durch engine.js) ---- */
  setze(STUFEN.lies('sprache', 'standard'), false);
  window.SPRACHWAHL = { setze: setze, einfach: EINFACH };
})();
