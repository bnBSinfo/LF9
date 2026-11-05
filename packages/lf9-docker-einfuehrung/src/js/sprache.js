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
      'Image': { erklaerung: 'Ein Bauplan. Aus dem Bauplan macht Docker Container. Den Bauplan kann man nicht ändern.' },
      'Container': { erklaerung: 'Ein Programm, das aus einem Image läuft. Aus 1 Image kann man viele Container machen.' },
      'Registry': { erklaerung: 'Ein Lager im Internet für Images. Zum Beispiel Docker Hub.' },
      'Host': { erklaerung: 'Der Rechner, auf dem Docker läuft. Hier: die VM oder der Server vom Verein.' },
      'Port-Mapping': { erklaerung: 'Eine Weiterleitung. Links steht der Port vom Rechner. Rechts steht der Port im Container.' },
      'Volume': { erklaerung: 'Ein Speicher von Docker. Die Daten bleiben, auch wenn der Container weg ist.' },
      'Docker Compose': { erklaerung: 'Ein Werkzeug. Es startet mehrere Container mit 1 Datei.' },
      'ephemer': { erklaerung: 'Nicht dauerhaft. Die Daten sind weg, wenn der Container weg ist.' }
    },
    uebungen: {
      U1: { auftrag: 'Die Bäckerei Krume hat einen Kassenserver von uns. Zähle die Container, die laufen. Dann lösche die beendeten Container.',
        tipps: ['Schau in die Liste von <code>docker ps -a</code>. Schau auf die Spalte STATUS.', '„Up“ heißt: läuft. „Exited“ heißt: beendet. Es laufen 2.', 'Lösung: 2 laufen. Lösche die 3 beendeten: <code>docker rm test1 test2 alt_backup</code>.'],
        reflexion: { frage: 'Wo siehst du in <code>docker ps -a</code> das Image von einem Container?', muster: 'In der Spalte IMAGE.' } },
      U2: { auftrag: 'Die Kantine will ihren Speiseplan im Netz. Baue das Image. Zeig die Seite auf Port 8500. Dann zeig die neue Fassung.',
        tipps: ['Welche Zahl ist für den Rechner? Welche für den Container? Apache hört im Container auf 80.', 'Links 8500, rechts 80: <code>-p 8500:80</code>. Nach der Änderung: neu bauen.', 'Lösung: <code>docker build -t speiseplan .</code> · <code>docker run -d -p 8500:80 --name kantine speiseplan</code> · nach der Änderung: neu bauen, <code>docker rm -f kantine</code>, wieder <code>docker run …</code>.'],
        reflexion: { frage: 'Warum reicht <code>docker restart kantine</code> nicht?', muster: 'Restart nimmt das alte Image. Die neue Datei ist erst nach dem Bauen im Image.' } },
      U3: { auftrag: 'Der TSV hat ein Trainingstagebuch. Die App speichert 2 Arten von Daten: eine <b>Datenbank</b> mit allen Einträgen und <b>PDFs</b> für die Trainer. Lege in der Datei fest, wo beides gespeichert wird. Nichts soll verloren gehen, wenn der Container gelöscht wird.',
        tipps: ['Welche Daten willst du selbst sehen? Welche nicht?', 'Die Datenbank bekommt einen Namen. Der Export bekommt einen Ordner.', 'Lösung: <code>notizen-db:/app/data</code>, <code>./export:/app/export</code>, unten <code>notizen-db:</code>. Nach <code>down -v</code> ist nur <code>./export</code> noch da.'],
        reflexion: { frage: 'Wann nimmst du für eine Datenbank doch einen Ordner (Bind Mount)?', muster: 'Wenn ich die Dateien selbst sichern oder kopieren will.' } },
      U4: { auftrag: 'Der SV Hochfeld will ein Forum mit Datenbank. Mach die Datei fertig. Starte das Forum. Die Datenbank bleibt innen.',
        tipps: ['Wie heißt die Datenbank in der Datei? So heißt auch der Host.', '<code>DB_HOST: mariadb</code>. Kein Port bei der Datenbank. Denk an die <code>.env</code>.', 'Lösung: <code>mariadb</code>, <code>${DB_PASSWORD}</code>, <code>service_healthy</code>, <code>[]</code>. Dann <code>cp .env.example .env</code> und <code>docker compose up -d</code>. Browser: <code>http://localhost:8400</code>.'],
        reflexion: { frage: 'Warum heißt der Host hier <code>mariadb</code> und in Raum 4 <code>db</code>?', muster: 'Der Host heißt immer wie der Service in der Datei.' } },
      U6: { auftrag: 'Die Musikschule startet ihre Cloud mit 2 langen <code>docker run</code>-Befehlen. Mach daraus eine Compose-Datei. Die Daten müssen bleiben.',
        tipps: ['Jede Option hat eine Zeile in Compose: <code>-p</code> wird <code>ports:</code>. <code>-v</code> wird <code>volumes:</code>. <code>-e</code> wird <code>environment:</code>.', 'Datei: <code>mariadb:11</code>, <code>${DB_PASSWORD}</code>, <code>clouddb</code>, <code>8443:80</code>, <code>/srv/cloud</code>, <code>db</code>, <code>service_healthy</code>. Dann die alten Container löschen: <code>docker rm -f</code>.', 'Lösung: Datei wie in Tipp 2 · <code>docker rm -f cloud cloud-db</code> · <code>cp .env.example .env</code> · <code>docker compose up -d</code> · Browser <code>http://localhost:8443</code>.'],
        reflexion: { frage: 'Warum steht beim Volume <code>external: true</code>?', muster: 'Sonst macht Compose ein neues, leeres Volume. So nimmt es das alte Volume mit den Daten.' } },
      U5: { auftrag: 'In der Sprechstunde liegen Tickets von Kunden. Finde bei jeder Meldung die Ursache und die Lösung.',
        tipps: ['Lies jede Meldung genau. Welches Wort ist der Hinweis?', '2 Beispiele: <code>variable is not set</code> → <code>.env</code> fehlt. <code>port is already allocated</code> → anderen Port links.', 'Lösung: Variable → .env kopieren · no container → <code>up -d</code> · Port belegt → anderer Port · SSL_ERROR → <code>http://</code> · health: starting → Logs lesen · no such service → <code>--profile ml</code>.'],
        reflexion: { frage: 'Welche Meldung hat dich überrascht? Warum?', muster: 'Zum Beispiel SSL_ERROR. Der Fehler kommt vom Browser, nicht von Docker.' } }
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
        erklaerung: '1 Image und 3 Container. Jedes <code>run</code> macht einen neuen Container. Die Container sind beendet. Sie bleiben aber da.' },
      'n1-1': { frage: 'Das zeigt <code>docker ps -a</code> auf dem Kassenserver der Bäckerei:<pre style="font-size:.78rem;overflow:auto">' + PS_N11 + '</pre>Wie viele Container <b>laufen</b> gerade?',
        typisch: [{ feedback: 'Du hast alle Zeilen gezählt. Es laufen nur die mit „Up“.' }, { feedback: 'Das sind die beendeten Container. Gefragt sind die mit „Up“.' }],
        erklaerung: 'Nur <code>kasse</code> und <code>kassen-db</code> haben „Up“. Die anderen 3 sind beendet.' },
      'n1-2': { frage: 'Gestern hast du den Container <code>notiz</code> gestartet. Heute zeigt <code>docker ps</code> ihn nicht. Was stimmt?',
        optionen: [{ text: 'Er ist beendet. Du siehst ihn mit <code>docker ps -a</code>.' }, { text: 'Docker hat ihn in der Nacht gelöscht.', feedback: 'Beendete Container bleiben da. Du löschst sie mit <code>docker rm</code>.' }, { text: 'Das Image <code>ubuntu:22.04</code> ist gelöscht.', feedback: 'Das Image ist nicht der Grund. <code>docker ps</code> zeigt nur laufende Container.' }],
        erklaerung: '<code>docker ps</code> zeigt nur laufende Container. <code>docker ps -a</code> zeigt alle.' },
      'n1-3': { frage: 'Was stimmt? Kreuze alle richtigen Sätze an.',
        optionen: [{ text: 'Aus 1 Image kann man viele Container machen.' }, { text: 'Ein beendeter Container steht weiter in <code>docker ps -a</code>.' }, { text: '<code>docker run</code> startet einen alten Container noch einmal.', feedback: 'Jedes <code>docker run</code> macht einen <b>neuen</b> Container.' }, { text: 'Ein Image ist ein Programm, das läuft.', feedback: 'Das Image ist der Bauplan. Nur ein Container läuft.' }],
        erklaerung: 'Image = Bauplan. Container = das Ding, das läuft. Beendete Container bleiben da.' },
      'n1-4': { frage: 'Was willst du tun? Ordne den Befehl zu.', feedbackFalsch: '<code>rm</code> ist für Container. <code>rmi</code> ist für Images. <code>prune</code> löscht alle beendeten. <code>pull</code> lädt nur.',
        paare: [{ links: 'Container <code>test1</code> löschen' }, { links: 'Image <code>hello-world</code> löschen' }, { links: 'alle beendeten Container löschen' }, { links: 'ein Image nur laden, ohne Container' }],
        erklaerung: '<code>rm</code>: Container. <code>rmi</code>: Image. <code>container prune</code>: alle beendeten. <code>pull</code>: nur laden.' },
      'n2-1': { frage: 'Die Bäckerei hat ein Dockerfile. Was macht jede Zeile? Ordne zu.', feedbackFalsch: 'Schau auf das 1. Wort: FROM, COPY, EXPOSE, CMD.',
        paare: [{ rechts: 'nimmt ein fertiges Image als Start' }, { rechts: 'legt die Datei fest ins Image' }, { rechts: 'schreibt den Port im Container auf' }, { rechts: 'Befehl beim Start vom Container' }],
        erklaerung: 'FROM: Start-Image. COPY: Datei ins Image. EXPOSE: Hinweis auf den Port. CMD: Startbefehl.' },
      'n2-2': { frage: 'Die Bäckerei hat <code>preise.html</code> geändert. Die Datei kommt mit <code>COPY</code> ins Image. Dann kam <code>docker restart preise</code>. Der Browser zeigt alte Preise. Was tust du?',
        optionen: [{ text: 'Neu bauen. Container <code>preise</code> löschen. Neu starten.' }, { feedback: 'Das ist derselbe Container mit dem alten Image.' }, { text: 'Den Speicher vom Browser leeren', feedback: 'Der Container hat noch die alte Datei. Das liegt am alten Image.' }],
        erklaerung: 'Die Datei ist im Image. Erst ein neuer Build ändert das Image. Dann brauchst du einen neuen Container.' },
      'n2-3': { frage: 'Du baust 2-mal ohne Änderung. Der 2. Build dauert 1 Sekunde. Im Terminal steht <code>CACHED</code>. Warum?',
        optionen: [{ text: 'Docker nimmt gespeicherte Schichten (Layer).' }, { text: 'Docker hat nur den alten Container gestartet.', feedback: 'Ein Build macht ein Image. Keinen Container.' }, { text: 'Das Bauen hat nicht geklappt.', feedback: 'Das Bauen hat geklappt. Docker spart nur Arbeit.' }],
        erklaerung: 'Jede Zeile im Dockerfile ist ein Layer. Ohne Änderung nimmt Docker den gespeicherten Layer.' },
      'n2-4': { frage: 'Jemand tippt <code>docker build -t speiseplan</code>. Es kommt: <code>ERROR: "docker buildx build" requires exactly 1 argument.</code> Was fehlt?',
        optionen: [{ text: 'Der Punkt am Ende. Er steht für den Ordner.' }, { feedback: 'Docker findet das Dockerfile allein. Es fehlt der Ordner: <code>.</code>' }, { text: 'Ein Tag wie <code>:latest</code>', feedback: 'Ohne Tag nimmt Docker <code>latest</code>. Das ist kein Fehler.' }],
        erklaerung: 'Richtig ist <code>docker build -t speiseplan .</code> Der Punkt heißt: hier im Ordner.' },
      'n3-1': { frage: 'Der Container <code>speiseplan</code> läuft mit <code>-p 8085:80</code>. Welche Adresse tippst du im Browser?',
        typisch: [{ feedback: '80 ist der Port im Container. Nimm die linke Zahl.' }, { feedback: '80 ist der Port im Container. Nimm die linke Zahl.' }, { feedback: 'Der Container kann kein https. Nimm <code>http://</code>.' }],
        erklaerung: 'Links steht der Port vom Rechner: 8085. Docker leitet weiter an 80.' },
      'n3-2': { frage: '<code>kasse</code> läuft mit <code>-p 8080:80</code>. Du startest <code>bestellung</code> auch mit <code>-p 8080:80</code>. Was passiert?',
        optionen: [{ text: '<code>bestellung</code> startet nicht: <code>port is already allocated</code>.' }, { text: 'Beide teilen sich Port 8080.', feedback: 'Ein Port vom Rechner gehört nur 1 Container.' }, { text: 'Docker stoppt <code>kasse</code>.', feedback: 'Docker stoppt keinen anderen Container. Der neue bekommt einen Fehler.' }],
        erklaerung: 'Ein Port links gehört nur 1 Container. Der 2. braucht einen anderen Port, z. B. <code>8081:80</code>.' },
      'n3-3': { frage: 'Es gibt 3 Dienste: <code>web</code> (Webseite), <code>adminer</code> und <code>db</code> (Datenbank). Nur Webseite und Adminer sollen im Browser gehen. Wer braucht <code>ports:</code>? Kreuze alle an.',
        optionen: [null, null, { feedback: 'Die Datenbank bleibt innen. web und adminer erreichen sie über das Netz von Compose.' }],
        erklaerung: 'Nur was der Browser braucht, bekommt <code>ports:</code>. Die Datenbank nicht.' },
      'n3-4': { frage: 'Beim Wiki steht: <code>ports: - "8090:3000"</code>. Welchen Port hat das Wiki <b>im Container</b>?',
        typisch: [{ feedback: '8090 ist der Port vom Rechner (links). Im Container gilt die rechte Zahl.' }],
        erklaerung: 'Rechts steht der Port im Container: 3000. Links steht der Port für den Browser: 8090.' },
      'n4-1': { frage: 'Ein Kunde will die Bilder selbst im Ordner sehen. Er will sie auf einen USB-Stick kopieren. Welche Zeile nimmst du?',
        optionen: [null, { feedback: 'Ein Name links ist ein Volume. Docker verwaltet es. Im Ordner sieht man es nicht.' }, { text: 'Keine. Die Bilder bleiben im Container.', feedback: 'Ist der Container weg, sind die Bilder weg.' }],
        erklaerung: 'Ein Pfad links (<code>./bilder</code>) ist ein Bind Mount. Die Dateien liegen im Ordner auf dem Rechner.' },
      'n4-2': { frage: 'Das Projekt hat das Volume <code>dbdaten</code> und den Bind Mount <code>./bilder</code>. Eine Notiz ist nur im Container: <code>/tmp/notiz.txt</code>. Was ist nach <code>docker compose down</code> noch da? Kreuze alle an.',
        optionen: [{ text: 'die Datenbank im Volume <code>dbdaten</code>' }, { text: 'die Bilder im Ordner <code>./bilder</code>' }, { text: 'die Datei <code>/tmp/notiz.txt</code>', feedback: 'Die Datei war nur im Container. Der Container ist weg.' }],
        erklaerung: '<code>down</code> löscht Container und Netz. Volumes und Bind Mounts bleiben.' },
      'n4-3': { frage: 'Gleiches Projekt. Jetzt tippt jemand <code>docker compose down -v</code>. Was ist danach noch da?',
        optionen: [{ text: 'Nur die Bilder in <code>./bilder</code>. Das Volume ist weg.' }, { text: 'Alles. <code>-v</code> zeigt nur mehr Text.', feedback: '<code>-v</code> heißt <code>--volumes</code>. Die Volumes werden gelöscht.' }, { text: 'Nichts. Auch <code>./bilder</code> ist weg.', feedback: 'Ein Bind Mount ist ein normaler Ordner. Docker löscht ihn nicht.' }],
        erklaerung: '<code>down -v</code> löscht auch die Volumes. Die Datenbank ist weg. Ordner auf dem Rechner bleiben.' },
      'n4-4': { frage: 'Die Schülerzeitung hat verschiedene Daten. Was passt am besten? Ordne zu.', feedbackFalsch: 'Willst du die Daten im Ordner sehen? Dann Bind Mount. Soll Docker sie verwalten? Dann Volume. Nur lesen? Dann <code>:ro</code>.',
        paare: [{ links: 'Dateien der Datenbank. Docker soll sich kümmern.' }, { links: 'Fotos. Die Redaktion bearbeitet sie im Ordner.' }, { links: 'Alte Fotos. Der Container darf sie nicht ändern.' }, { links: 'Zwischendateien. Sie dürfen weg sein.' }],
        erklaerung: 'Datenbank: Volume. Selbst bearbeiten: Bind Mount. Nur lesen: <code>:ro</code>. Wegwerf-Daten: nichts extra.' },
      'n5-1': { frage: 'Der Datenbank-Service heißt <code>datenbank</code>. Was schreibst du bei WordPress? <code>WORDPRESS_DB_HOST: ___</code>',
        typisch: [{ feedback: '<code>localhost</code> ist WordPress selbst. Nimm den Namen vom Service.' }, { feedback: 'Der Service heißt hier <code>datenbank</code>, nicht <code>db</code>.' }, { feedback: '127.0.0.1 ist der Container selbst.' }],
        erklaerung: 'Der Name vom Service ist die Adresse: <code>datenbank</code>.' },
      'n5-2': { frage: 'Was macht <code>depends_on: db: condition: service_healthy</code> bei <code>wordpress</code>?',
        optionen: [{ text: 'WordPress startet erst, wenn die Datenbank „healthy“ ist.' }, { text: 'WordPress startet, sobald der Datenbank-Container gestartet ist.', feedback: 'Das macht <code>service_started</code>. Die Datenbank ist dann oft noch nicht bereit.' }, { text: 'Compose prüft, ob WordPress gesund ist.', feedback: 'Geprüft wird die Datenbank, nicht WordPress.' }],
        erklaerung: '<code>service_healthy</code> wartet auf die Datenbank. Erst dann startet WordPress.' },
      'n5-3': { frage: 'Im Ordner sind <code>docker-compose.yml</code> und <code>.env.example</code>. Eine <code>.env</code> fehlt. In der Datei steht <code>${DB_PASSWORD}</code>. Was passiert bei <code>docker compose up -d</code>?',
        optionen: [{ text: 'Warnung <code>The "DB_PASSWORD" variable is not set</code>. Das Passwort ist leer. Die Datenbank startet nicht.' }, { text: 'Compose nimmt das Passwort aus <code>.env.example</code>.', feedback: 'Compose liest nur die Datei <code>.env</code>. Du musst die Vorlage kopieren.' }, { text: 'Compose fragt nach dem Passwort.', feedback: 'Compose fragt nicht. Es nimmt einen leeren Text.' }],
        erklaerung: 'Compose liest die Datei <code>.env</code>. Fehlt sie, ist die Variable leer. Lösung: <code>cp .env.example .env</code>.' },
      'n5-4': { frage: 'Die Dienste der Schülerzeitung liefen noch nie. Welcher Befehl macht und startet alle Container?',
        optionen: [null, { feedback: '<code>start</code> startet nur Container, die es schon gibt. Es gibt noch keine.' }, { feedback: '<code>restart</code> startet Container neu. Es gibt noch keine.' }, { feedback: '<code>docker run</code> braucht ein Image, keine Compose-Datei.' }],
        erklaerung: '<code>up</code> macht die Container und startet sie. <code>-d</code>: im Hintergrund.' },
      'n6-1': { frage: 'Welche Ursache hat die Meldung? Ordne zu.', feedbackFalsch: 'Lies jede Meldung genau: Port? Variable? Container? SSL?',
        paare: [{ rechts: 'Ein anderer Container hat den Port schon.' }, { rechts: 'Die Datei <code>.env</code> fehlt.' }, { rechts: 'Die Container wurden noch nie mit <code>up</code> gemacht.' }, { rechts: 'Im Browser steht <code>https://</code> statt <code>http://</code>.' }],
        erklaerung: 'Die Meldung nennt die Ursache: Port belegt, Variable leer, kein Container, falsches Protokoll.' },
      'n6-2': { frage: '<code>docker compose ps</code> zeigt die Datenbank seit 5 Minuten als <code>(health: starting)</code>. WordPress startet nicht. Was tust du jetzt?',
        optionen: [null, { feedback: '<code>-v</code> löscht alle Daten. Lies zuerst die Logs.' }, { text: 'Weiter warten. WordPress startet gleich.', feedback: 'WordPress wartet auf die Datenbank. Nach 5 Minuten stimmt etwas nicht.' }],
        erklaerung: 'Die Logs zeigen, warum die Datenbank nicht bereit ist. Erst lesen, dann ändern.' },
      'n6-3': { frage: 'Beim Start kommt: <code>Conflict. The container name "/kasse" is already in use by container "7c1e2a9f0b3d".</code> Was hilft?',
        optionen: [{ text: 'Den alten Container löschen (<code>docker rm -f kasse</code>) oder einen anderen Namen nehmen' }, { text: 'Das Image neu bauen', feedback: 'Das Image ist in Ordnung. Der <b>Name</b> ist schon belegt.' }, { text: 'Einen anderen Port nehmen', feedback: 'Die Meldung nennt keinen Port. Sie nennt den Namen.' }],
        erklaerung: 'Jeden Namen gibt es nur 1-mal. Auch beendete Container behalten ihren Namen.' },
      'n6-4': { frage: 'Der Browser zeigt bei <code>http://localhost:8088</code>: „Die Verbindung wurde zurückgesetzt“. In der Datei steht bei WordPress <code>- "8088:8088"</code>. WordPress hört im Container auf Port 80. Was änderst du?',
        optionen: [null, { feedback: 'Jetzt ist links der falsche Port. Rechts steht immer noch 8088.' }, { text: 'Im Browser <code>https://localhost:8088</code> tippen', feedback: 'Das Protokoll ist nicht das Problem. Im Container hört niemand auf 8088.' }],
        erklaerung: 'Rechts steht der Port im Container. Bei WordPress ist das 80.' }
    },
    nachweis: {
      einleitung: 'Heute bist du allein beim neuen Kunden: der Schülerzeitung <b>Lechpost</b>. Ich bin nicht da. Es gibt kein Regelbuch und keine Tipps. <b>Teil A und Teil B brauchen jeweils mindestens 80 %.</b> Es zählt der kleinere Wert.',
      teilA: { titel: 'Raum „Redaktion“ – die Lechpost geht online', auftrag: 'Die Webseite der Schülerzeitung soll unter <code>http://localhost:8088</code> laufen. Ergänze die <code>docker-compose.yml</code>. Starte sie im Terminal. Zähle vorher die Container auf dem Server. Dann bearbeite die 2 Tickets.' }
    },
    merkblatt: {
      LZ1: { zeilen: [{ text: 'Ein ___ ist der Bauplan. Ein ___ ist das, was läuft oder beendet ist.' }, { text: '<code>docker ps</code> zeigt nur ___ Container. <code>docker ps -a</code> zeigt ___.' }], fehler: '<code>docker run</code> macht immer einen neuen Container.' },
      LZ2: { zeilen: [null, { text: 'Eine Datei mit COPY ist geändert. Dann: ___, ___, ___.' }], fehler: '<code>docker restart</code> reicht nicht. Der Container hat das alte Image.' },
      LZ3: { zeilen: [{ text: '<code>-p 8088:80</code>: Links ist der Port vom ___. Rechts ist der Port vom ___.' }, { text: 'Ein Port vom Rechner gehört ___ Container.' }], beispiel: '<code>-p 8081:80</code>: im Browser <code>http://localhost:8081</code>.' },
      LZ4: { zeilen: [{ text: 'Name links (<code>pgdata:/…</code>) heißt ___. Pfad links (<code>./medien:/…</code>) heißt ___.' }, { text: '<code>down</code> löscht ___. <code>down -v</code> löscht auch ___.' }], fehler: 'Nie <code>docker compose down -v</code>, wenn die Datenbank bleiben soll.' },
      LZ5: { zeilen: [{ text: 'Die Datenbank erreiche ich über ihren ___.' }, null, { text: 'Beim 1. Start tippe ich <code>docker compose ___</code>.' }] },
      LZ6: { zeilen: [{ text: 'Bei einer Fehlermeldung lese ich zuerst ___.' }, { text: 'Läuft ein Dienst nicht, prüfe ich mit ___ und ___.' }], schema: 'Meldung lesen. Ursache finden. 1 Sache ändern. <code>up -d</code>. Im Browser prüfen.' }
    },
    tafel: {
      titel: 'So funktioniert Docker',
      szenen: {
        wohnen: { erklaerung: '<p><b>Das Problem:</b> Auf einem Server laufen oft viele Programme. App A braucht Python 3.8. App B braucht Python 3.12. Beide sind direkt auf dem Betriebssystem installiert (<b>Bare Metal</b>). Dann stören sie sich. Das ist wie eine WG, in der alle in 1 Raum wohnen.</p><p><b>Lösung 1 – virtuelle Maschine:</b> Jede App bekommt einen eigenen virtuellen Rechner. Jeder hat ein eigenes Betriebssystem. Das trennt gut. Aber es braucht viel Speicher und startet langsam. Das ist wie bei Reihenhäusern: Jedes Haus hat eine eigene Heizung.</p><p><b>Lösung 2 – Container:</b> Ein Container hat nur die App und ihre Bibliotheken. Den Kern vom Betriebssystem teilt er sich mit dem Host. Darum ist ein Container klein und startet schnell. Das ist wie bei Wohnungen in einem Haus: Jede Wohnung hat eine eigene Tür. Aber alle stehen auf demselben Fundament.</p><p><b>Die Idee</b> kommt vom Schiffscontainer. Er hat immer dieselbe Form. Er passt auf jedes Schiff und jeden Lkw. Ein Docker-Container läuft auch überall gleich: auf dem Laptop, auf dem Schulserver und in der Cloud.</p><p><b>Probier es aus:</b> Klicke unten auf <b>Bare Metal</b>, <b>VM</b> und <b>Container</b>.</p>' },
        klasse: { erklaerung: '<p>Ein <b>Image</b> ist ein Bauplan. Darin ist alles, was ein Programm braucht: das Programm, die Bibliotheken und die Einstellungen. Man kann das Image nicht ändern.</p><p>Ein <b>Container</b> läuft aus diesem Bauplan. Jedes <code>docker run</code> macht einen <b>neuen</b> Container. Aus 1 Image können viele Container laufen. Zum Beispiel 3 Webserver aus demselben Image.</p><p><b>Wie in Java:</b> Das Image ist wie eine Klasse. Der Container ist wie ein Objekt. Aus 1 Klasse macht <code>new</code> viele Objekte.</p><p><code>docker rm</code> löscht einen Container. Das Image bleibt. <code>docker rmi</code> löscht ein Image. Das geht aber erst, wenn es keinen Container mehr aus diesem Image gibt.</p><p><b>Probier es aus:</b> Klicke ein paarmal auf <b>docker run</b>. Schalte dann <b>wie in Java</b> an.</p>' },
        run: { erklaerung: '<p>Docker hat 2 Teile. Der <b>Client</b> ist das Programm <code>docker</code> im Terminal. Der <b>Docker Daemon</b> läuft im Hintergrund auf dem Host. Er macht die Arbeit.</p><p>So läuft <code>docker run hello-world</code> ab:</p><ol><li>Der Client schickt den Befehl an den Daemon.</li><li>Der Daemon schaut: Ist das Image <code>hello-world</code> schon da?</li><li>Nein? Dann lädt er es aus der <b>Registry</b> (<b>pull</b>). Eine Registry ist ein Lager für Images im Internet, zum Beispiel Docker Hub.</li><li>Er macht aus dem Image einen Container und startet ihn.</li><li>Die Ausgabe kommt in dein Terminal.</li></ol><p>Beim 2. Mal ist das Image schon da. Schritt 3 fällt weg. Darum geht der 2. Start schneller.</p><p><b>Probier es aus:</b> Klicke 5-mal auf <b>Schritt</b>. Klicke dann auf <b>noch einmal</b> und wieder auf <b>Schritt</b>.</p>' },
        leben: { erklaerung: '<p>Ein Container hat verschiedene Zustände:</p><ul><li><b>Created</b> (erstellt): Der Container ist da. Er läuft aber noch nicht.</li><li><b>Running</b> (läuft): Das Programm im Container arbeitet.</li><li><b>Exited</b> (gestoppt): Das Programm ist fertig oder wurde mit <code>docker stop</code> gestoppt. Der Container ist noch da. Man kann ihn wieder starten.</li><li><b>Removed</b> (gelöscht): Erst <code>docker rm</code> löscht den Container.</li></ul><p><code>docker run</code> macht 2 Dinge auf einmal: create und start.</p><p><code>docker ps</code> zeigt nur Container, die laufen. <code>docker ps -a</code> zeigt alle. Einen Container, der läuft, kannst du nicht einfach löschen. Stoppe ihn zuerst. Oder lösche mit <code>docker rm -f</code>.</p><p><b>Probier es aus:</b> Klicke auf <b>run</b>, <b>stop</b> und <b>rm</b>. Schau dabei auf die 2 Listen.</p>' },
        build: { erklaerung: '<p>Ein eigenes Image baust du mit einem <b>Dockerfile</b>. Das ist eine Textdatei. Darin steht das Rezept:</p><ul><li><code>FROM</code>: Das ist das Basis-Image. Darauf baust du auf.</li><li><code>COPY</code>: Damit kommen eigene Dateien in das Image.</li><li><code>RUN</code>: Dieser Befehl läuft beim Bauen, zum Beispiel eine Installation.</li><li><code>EXPOSE</code>: Hier steht der Port der App.</li><li><code>CMD</code>: Dieses Programm startet im Container.</li></ul><p>Dann geht es in 3 Schritten weiter:</p><ul><li><b>Build:</b> <code>docker build</code> baut das Image.</li><li><b>Ship:</b> <code>docker push</code> lädt es in die Registry. <code>docker pull</code> holt es auf einen anderen Rechner.</li><li><b>Run:</b> <code>docker run</code> startet dort Container.</li></ul><p><b>Wichtig:</b> Das Image ändert sich nicht von selbst. Hast du eine Datei geändert? Dann musst du das Image <b>neu bauen</b> und einen neuen Container starten. Sonst siehst du die alte Version.</p>' },
        ports: { erklaerung: '<p>Ein Container ist vom Host getrennt. Ein Webserver im Container hat zum Beispiel Port 80. Aber nur <b>innen</b> im Container. Dein Browser kommt so nicht an ihn heran.</p><p>Du brauchst eine Weiterleitung, das <b>Port-Mapping</b>: <code>-p 8080:80</code>. Links ist der Port vom <b>Host</b>. Rechts ist der Port im <b>Container</b>. Im Browser tippst du dann <code>http://localhost:8080</code>.</p><p>Zwei Container dürfen innen beide Port 80 haben. Jeden Port vom Host gibt es aber nur 1-mal. Der 2. Container braucht also einen anderen Port, zum Beispiel <code>-p 8081:80</code>. Sonst meldet Docker: <code>port is already allocated</code>.</p><p><b>Probier es aus:</b> Schalte <b>-p 8081:80</b> an. Klicke dann auf <b>2× 8080</b>.</p>' },
        daten: { erklaerung: '<p>Ein Container speichert Daten in seiner eigenen Schicht. Nach <code>docker rm</code> ist diese Schicht weg. Dann sind auch die Daten weg. Das heißt <b>ephemer</b> (flüchtig). Das ist wie bei einem Hotelzimmer: Nach dem Auszug wird es aufgeräumt.</p><p>Damit Daten bleiben, legst du sie <b>außerhalb</b> vom Container ab. Das machst du mit <code>-v</code>. Es gibt 2 Möglichkeiten:</p><ul><li><b>Volume</b>, zum Beispiel <code>-v meine-daten:/daten</code>: Links steht ein <b>Name</b>. Docker verwaltet den Speicher. Das ist wie ein Schließfach. Gut für Datenbanken.</li><li><b>Bind Mount</b>, zum Beispiel <code>-v ./export:/app/export</code>: Links steht ein <b>Pfad</b>. Das ist ein normaler Ordner auf dem Host. Du kannst die Dateien dort sehen. Gut für Fotos oder Exporte.</li></ul><p>Beide bleiben nach <code>docker rm</code> und nach <code>docker compose down</code>. <code>docker compose down -v</code> löscht auch die Volumes. Einen Ordner auf dem Host löscht Docker nie.</p><p><b>Probier es aus:</b> Klicke auf <b>docker rm</b>. Klicke dann auf <b>neuer Container -v</b> und zum Schluss auf <b>down -v</b>.</p>' },
        compose: { erklaerung: '<p>Viele Anwendungen haben mehrere Container, zum Beispiel eine Web-App und eine Datenbank. Mit <code>docker run</code> müsstest du jeden Container einzeln starten.</p><p>Bei <b>Docker Compose</b> steht alles in 1 Datei: der <code>docker-compose.yml</code>. Unter <code>services:</code> steht jeder Dienst. <code>docker compose up -d</code> startet alle. <code>docker compose down</code> stoppt alle und räumt sie weg.</p><p>Compose legt auch ein <b>Netzwerk</b> an. Im Netzwerk ist der <b>Service-Name</b> die Adresse von jedem Dienst. Docker sucht die IP-Adresse zum Namen <code>db</code>. Das ist wie ein Telefonbuch. Darum steht in der Datei <code>DB_HOST: db</code>.</p><p><b>Vorsicht:</b> <code>localhost</code> im Container ist der Container selbst. Er ist nicht die Datenbank. Mit <code>localhost</code> findet die Web-App die Datenbank nicht.</p><p>Mit <code>condition: service_healthy</code> wartet ein Dienst, bis die Datenbank bereit ist.</p><p><b>Probier es aus:</b> Klicke auf <b>docker compose up -d</b>. Schalte dann die <b>localhost-Falle</b> an.</p>' }
      }
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
