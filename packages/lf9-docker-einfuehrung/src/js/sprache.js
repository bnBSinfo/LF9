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
      S1: { auftrag: 'Starte deinen ersten Container. Finde dann heraus: Wo ist der Container jetzt?', mitdenken: { auftrag: 'Erkläre einer Mitschülerin den Unterschied: Image und Container. Schreibe 2 Sätze. Nimm ein Beispiel aus der Programmierung.', muster: 'Ein Image ist wie eine Klasse. Es ist ein fester Bauplan. Ein Container ist wie ein Objekt. Mit <code>docker run</code> mache ich aus 1 Image viele Container.' } }
    },
    fragen: {
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
