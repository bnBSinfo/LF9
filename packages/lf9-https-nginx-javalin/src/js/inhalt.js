/* =====================================================================
   INHALT des Lernpfads „Lokales HTTPS mit Nginx und Javalin“
   Grundlage: Praxisleitfaden von M. Niedermair (anleitung.tex).
   Texte als [Standard, Einfach]; betriebssystemabhängige Werte als
   { linux, windows } oder { linux, cmd, ps } (cmd/ps = Windows-Shell).
   Dateien (Quellcode, Skripte) stehen in js/dateien.js.
   ===================================================================== */
var R = String.raw;

/* gemeinsame Erklärungen für Docker-Zeilen in allen Skripten */
var ERKL_DOCKER = [
  ['docker compose config --quiet', 'Prüft compose.yaml. Keine Ausgabe = kein Fehler.'],
  ['docker compose pull nginx', 'Lädt das fertige Image nginx:stable aus der Registry.'],
  ['docker compose build javalin', 'Baut das Javalin-Image mit dem Multi-Stage-Dockerfile (Schritt 3).'],
  ['docker compose up --detach --wait', 'Startet alle Container im Hintergrund (--detach) und wartet, bis sie laufen bzw. healthy sind – höchstens 90 s.'],
  ['docker compose create', 'Legt Netzwerk und Container an, <b>startet sie aber nicht</b>.'],
  ['docker compose stop', 'Hält die Container an. Container, Netz und Images bleiben erhalten.'],
  ['docker compose down --rmi all', 'Löscht Container und Netz, mit <code>--rmi all</code> auch alle Images der Services (auch nginx:stable). <code>--remove-orphans</code> räumt Container alter Services mit weg.']
];

var ERKL_SKRIPT = {
  linux: [
    ['#!/usr/bin/env bash', 'Shebang: Dieses Skript läuft mit der Bash.'],
    ['set -euo pipefail', 'Strenger Modus: Bei einem Fehler sofort abbrechen (-e), unbekannte Variablen sind Fehler (-u), Fehler in einer Pipe zählen (pipefail).'],
    ['SCRIPT_DIR=', 'Ermittelt den Ordner, in dem das Skript selbst liegt.'],
    ['PROJECT_ROOT=', 'Zwei Ordner höher (../..) liegt das Projekt-Hauptverzeichnis.'],
    ['cd "$PROJECT_ROOT"', 'Dorthin wechseln – egal, von wo du das Skript aufrufst.'],
    ['for file in', 'Prüft nacheinander beide Zertifikatsdateien.'],
    ['if [[ ! -f "$file" ]]', 'Fehlt die Datei? Dann Fehlermeldung …'],
    ['exit 1', '… und mit Exit-Code 1 (= Fehler) beenden.'],
    ['RESPONSE="$(curl', 'Ruft /health über HTTPS ab – also den ganzen Weg Host → Nginx → Javalin.'],
    ['!= "OK"', 'Ist die Antwort nicht genau „OK“, ist etwas schiefgelaufen.']
  ],
  cmd: [
    ['@echo off', 'Die Befehle selbst nicht mit anzeigen, nur ihre Ausgaben.'],
    [R`cd /d "%~dp0..\.."`, R`<code>%~dp0</code> ist der Ordner des Skripts, <code>..\..</code> zwei Ebenen höher = Projektordner. <code>/d</code> wechselt auch das Laufwerk.`],
    ['|| exit /b 1', 'Scheitert der Befehl links, beendet sich das Skript mit Fehlercode 1.'],
    [R`if not exist "certs\localhost.pem"`, 'Fehlt das Zertifikat, bricht das Skript mit einer Meldung ab.'],
    [R`if not exist "certs\localhost-key.pem"`, 'Dasselbe für den privaten Schlüssel.'],
    ['curl.exe', '<code>curl.exe</code> (in Windows eingebaut) ruft /health über HTTPS ab. Die Endung .exe verhindert, dass PowerShell einen gleichnamigen Alias nimmt.'],
    ['echo.', 'Gibt eine Leerzeile aus.']
  ],
  ps: [
    ["$ErrorActionPreference = 'Stop'", 'Jeder PowerShell-Fehler bricht das Skript ab.'],
    ['$ProjectRoot =', R`Projektordner: zwei Ebenen über dem Skriptordner (<code>$PSScriptRoot\..\..</code>).`],
    ['Push-Location', 'In den Projektordner wechseln; <code>Pop-Location</code> im finally-Block wechselt am Ende zurück.'],
    ['foreach ($file', 'Prüft nacheinander beide Zertifikatsdateien.'],
    ['Test-Path', 'Gibt es die Datei (-PathType Leaf = Datei, kein Ordner)?'],
    ['throw', 'Bricht mit einer Fehlermeldung ab.'],
    ['if ($LASTEXITCODE -ne 0)', 'docker ist ein externes Programm. Ob es geklappt hat, zeigt nur der Exit-Code.'],
    ['Invoke-WebRequest', 'Ruft /health über HTTPS ab – den ganzen Weg Host → Nginx → Javalin.'],
    ['-cne', 'Vergleich „ungleich“ mit Groß-/Kleinschreibung: Die Antwort muss genau „OK“ sein.'],
    ['} finally {', 'Wird immer ausgeführt, auch nach einem Fehler.']
  ]
};

var PFAD = {
  id: 'lf9-https-nginx-javalin',
  titel: 'Lokales HTTPS mit Nginx und Javalin',
  untertitel: 'Lernpfad · Docker, TLS & Automatisierung',
  version: '0.2',
  figur: { name: 'Jana Petrov', rolle: 'Ausbilderin bei Hafenblick IT-Service' },
  leitsituation: [
    'Der TSV Lechwiesen bekommt von uns eine kleine Java-Web-App. Später läuft sie im Internet – natürlich nur über HTTPS. Damit wir genauso testen wie im Betrieb, bauen wir uns lokal denselben Aufbau: Nginx vorne mit Zertifikat, Javalin dahinter. Ich erkläre dir jeden Schritt, du setzt ihn an deinem Rechner um.',
    'Wir bauen eine Java-Web-App für den TSV Lechwiesen. Später läuft sie im Internet mit HTTPS. Wir testen das schon jetzt auf deinem Rechner. Vorne steht Nginx mit einem Zertifikat. Dahinter läuft Javalin. Ich erkläre jeden Schritt. Du machst ihn an deinem Rechner nach.'
  ],
  vorab: ['HTTPS', 'Zertifikat', 'Reverse-Proxy', 'Root-CA'],

  glossar: {
    'HTTPS': { art: 'das, –', t: ['HTTP über eine mit TLS verschlüsselte Verbindung. Erkennbar am Schloss-Symbol im Browser.', 'HTTP mit Verschlüsselung. Im Browser siehst du ein Schloss.'] },
    'TLS': { art: 'das, –', t: ['Transport Layer Security: Protokoll, das eine Verbindung verschlüsselt und den Server über ein Zertifikat ausweist.', 'TLS verschlüsselt die Verbindung. Der Server zeigt dabei seinen Ausweis: das Zertifikat.'] },
    'TLS-Terminierung': { art: 'die, –', t: ['Die Stelle, an der die TLS-Verbindung endet und entschlüsselt wird – hier im Nginx-Container.', 'Hier endet die Verschlüsselung. Bei uns: in Nginx.'] },
    'Reverse-Proxy': { art: 'der, die Reverse-Proxys', t: ['Server, der Anfragen von außen annimmt und an einen Server dahinter weiterreicht.', 'Ein Server vor der App. Er nimmt Anfragen an und gibt sie weiter.'] },
    'Zertifikat': { art: 'das, die Zertifikate', t: ['Digitaler Ausweis eines Servers: Namen (z. B. localhost), öffentlicher Schlüssel und die Unterschrift einer Zertifizierungsstelle.', 'Der Ausweis eines Servers. Darin steht der Name. Eine Zertifizierungsstelle hat ihn unterschrieben.'] },
    'Zertifizierungsstelle': { art: 'die, die Zertifizierungsstellen (kurz: CA)', t: ['Stelle, die Zertifikate unterschreibt. Der Browser vertraut nur Zertifikaten von CAs, die er kennt.', 'Sie unterschreibt Zertifikate. Der Browser glaubt nur CAs, die er kennt.'] },
    'Root-CA': { art: 'die, die Root-CAs', t: ['Oberste Zertifizierungsstelle. mkcert legt eine eigene Root-CA nur für deinen Rechner an.', 'Die oberste CA. mkcert macht eine eigene Root-CA nur für deinen Rechner.'] },
    'Vertrauensspeicher': { art: 'der, die Vertrauensspeicher', t: ['Liste der Root-CAs, denen ein Betriebssystem bzw. Browser vertraut. WSL2 und Windows haben getrennte Speicher.', 'Liste der CAs, denen dein System glaubt. WSL2 und Windows haben je eine eigene Liste.'] },
    'privater Schlüssel': { art: 'der, die privaten Schlüssel', t: ['Geheimer Teil eines Schlüsselpaars. Wer ihn hat, kann sich als der Server ausgeben. Gehört nie in Git oder in ein Image.', 'Der geheime Schlüssel. Niemand darf ihn bekommen. Er kommt nie in Git oder in ein Image.'] },
    'Port-Mapping': { art: 'das, die Port-Mappings', t: ['Weiterleitung von einem Port des Hosts auf einen Port im Container, z. B. 127.0.0.1:8443 → 443.', 'Ein Port am Rechner wird an einen Port im Container weitergeleitet.'] },
    'Multi-Stage-Build': { art: 'der, die Multi-Stage-Builds', t: ['Dockerfile mit mehreren FROM-Abschnitten. Gebaut wird in einer großen Stage, ins Endergebnis kommt nur das Nötige.', 'Ein Dockerfile mit mehreren Teilen. Im 1. Teil wird gebaut. Ins fertige Image kommt nur das Ergebnis.'] },
    'JRE': { art: 'das, –', t: ['Java Runtime Environment: Java-Laufzeit zum Ausführen, ohne Compiler (der steckt im JDK).', 'Damit läuft Java. Zum Übersetzen braucht man das größere JDK.'] },
    'Endpunkt': { art: 'der, die Endpunkte', t: ['Adresse (Pfad) einer Web-App, die eine bestimmte Antwort liefert, z. B. /health.', 'Eine Adresse in der App, z. B. /health.'] },
    'Healthcheck': { art: 'der, die Healthchecks', t: ['Regelmäßiger Test, ob ein Container wirklich bereit ist. Ergebnis: healthy oder unhealthy.', 'Docker prüft immer wieder: Ist die App bereit?'] },
    'Build-Kontext': { art: 'der, die Build-Kontexte', t: ['Alle Dateien, die docker build an Docker schickt (hier der Projektordner ohne die Einträge aus .dockerignore).', 'Die Dateien, die Docker beim Bauen bekommt.'] },
    'Service-Name': { art: 'der, die Service-Namen', t: ['Name eines Dienstes in compose.yaml. Im Docker-Netz ist er zugleich der Hostname (http://javalin:8080).', 'Der Name des Dienstes in compose.yaml. Andere Container erreichen ihn unter diesem Namen.'] },
    'Bind Mount': { art: 'der, die Bind Mounts', t: ['Eine Datei oder ein Ordner vom Host wird in den Container eingeblendet. Mit :ro nur lesbar (read-only).', 'Eine Datei vom Rechner erscheint im Container. Mit :ro kann der Container sie nur lesen.'] },
    'Skript': { art: 'das, die Skripte', t: ['Datei mit Befehlen, die nacheinander ausgeführt werden (.sh, .cmd, .ps1).', 'Eine Datei mit Befehlen. Sie laufen nacheinander.'] },
    'Exit-Code': { art: 'der, die Exit-Codes', t: ['Zahl, die ein Programm beim Beenden zurückgibt: 0 = alles gut, sonst Fehler.', '0 heißt: alles gut. Eine andere Zahl heißt: Fehler.'] },
    'Virtualisierung': { art: 'die, –', t: ['Fähigkeit des Prozessors, virtuelle Maschinen auszuführen. Muss im BIOS/UEFI eingeschaltet sein (Intel VT-x, AMD-V).', 'Damit kann der Rechner virtuelle Rechner starten. Man schaltet sie im BIOS ein.'] },
    'systemd': { art: 'das, –', t: ['Dienst-Verwaltung von Linux. Startet Hintergrunddienste wie Docker automatisch.', 'Startet in Linux Dienste wie Docker.'] },
    'WSL2': { art: 'das, –', t: ['Windows-Subsystem für Linux: ein echtes Linux (z. B. Ubuntu) unter Windows.', 'Ein Linux, das in Windows läuft.'] }
  },

  schritte: [
  /* ---------------------------------------------------------------- 1 */
  {
    titel: 'Architektur verstehen und System prüfen',
    kurz: ['Wer spricht mit wem – und welche Werkzeuge brauchst du?', 'Wer spricht mit wem? Was musst du installieren?'],
    warum: [
      'Im Betrieb kümmert sich selten die Java-Anwendung selbst um HTTPS. Davor steht ein Webserver – hier <b>Nginx</b> – als <b>Reverse-Proxy</b>. Er nimmt die verschlüsselte Anfrage an, entschlüsselt sie (<b>TLS-Terminierung</b>) und reicht sie im abgeschotteten Docker-Netz per HTTP an <b>Javalin</b> weiter. Javalin bekommt bewusst <b>keinen Port nach außen</b>.',
      'Die Java-App macht HTTPS nicht selbst. Davor steht <b>Nginx</b>. Nginx nimmt die verschlüsselte Anfrage an. Nginx entschlüsselt sie. Dann schickt Nginx sie im Docker-Netz an <b>Javalin</b>. Von außen kommt niemand direkt zu Javalin.'
    ],
    szene: { typ: 'ablauf', titel: ['Eine Anfrage auf ihrem Weg', 'Der Weg einer Anfrage'],
      knoten: [
        { id: 'browser', icon: '🌐', name: 'Browser', sub: 'https://127.0.0.1:8443' },
        { id: 'port', icon: '🚪', name: 'Port 8443', sub: 'nur 127.0.0.1' },
        { id: 'nginx', icon: '🛡️', name: 'Nginx', sub: ':443 · TLS', gruppe: 'Docker-Netz' },
        { id: 'javalin', icon: '☕', name: 'Javalin', sub: ':8080 · nur intern', gruppe: 'Docker-Netz' }
      ],
      schritte: [
        { an: ['browser'], t: ['Du gibst <code>https://127.0.0.1:8443/</code> ein. Der Browser baut eine verschlüsselte TLS-Verbindung auf.', 'Du gibst <code>https://127.0.0.1:8443/</code> ein. Der Browser startet eine verschlüsselte Verbindung.'] },
        { an: ['port', 'nginx'], t: ['Docker leitet Port 8443 des Hosts an Port 443 im Nginx-Container weiter (Port-Mapping).', 'Docker leitet Port 8443 an Port 443 im Nginx-Container weiter.'] },
        { an: ['nginx'], t: ['Nginx zeigt sein Zertifikat, der Browser prüft es. Dann entschlüsselt Nginx die Anfrage: <b>TLS-Terminierung</b>.', 'Nginx zeigt sein Zertifikat. Der Browser prüft es. Dann entschlüsselt Nginx die Anfrage.'] },
        { an: ['nginx', 'javalin'], t: ['Nginx schickt die Anfrage <b>unverschlüsselt per HTTP</b> an <code>http://javalin:8080</code> – nur innerhalb des Docker-Netzes.', 'Nginx schickt die Anfrage ohne Verschlüsselung an <code>http://javalin:8080</code>. Das passiert nur im Docker-Netz.'] },
        { an: ['javalin'], t: ['Javalin antwortet: <code>Hallo von Javalin!</code>', 'Javalin antwortet: <code>Hallo von Javalin!</code>'] },
        { an: ['nginx', 'port', 'browser'], t: ['Nginx verschlüsselt die Antwort und schickt sie zurück. Im Browser erscheint das Schloss 🔒.', 'Nginx verschlüsselt die Antwort. Der Browser zeigt ein Schloss 🔒.'] }
      ],
      extra: { knopf: ['✋ Versuch: direkt zu http://127.0.0.1:8080', '✋ Versuch: direkt zu Port 8080'], an: ['javalin'], fehler: true,
        t: ['<b>Keine Verbindung.</b> Für den Javalin-Container ist kein Port nach außen freigegeben. Nur Nginx erreicht ihn im Docker-Netz – so gibt es keinen Weg an HTTPS vorbei.', '<b>Keine Verbindung.</b> Javalin hat keinen Port nach außen. Nur Nginx kommt zu Javalin. So geht alles über HTTPS.'] }
    },
    bloecke: [
      { typ: 'text', t: { linux: ['<b>Das brauchst du unter Ubuntu / WSL2:</b> Docker Engine mit Compose-Plugin (<code>docker-compose-plugin</code>), <code>curl</code> und <code>mkcert</code>. Java und Maven musst du <b>nicht</b> installieren – kompiliert wird im Docker-Build-Container.', '<b>Das brauchst du unter Ubuntu / WSL2:</b> Docker mit Compose, <code>curl</code> und <code>mkcert</code>. Java und Maven brauchst du <b>nicht</b>. Docker übersetzt den Code selbst.'],
                                windows: ['<b>Das brauchst du unter Windows:</b> Docker Desktop (Linux-Container aktiviert) und <code>mkcert</code>. Java und Maven musst du <b>nicht</b> installieren – kompiliert wird im Docker-Build-Container.', '<b>Das brauchst du unter Windows:</b> Docker Desktop und <code>mkcert</code>. Java und Maven brauchst du <b>nicht</b>. Docker übersetzt den Code selbst.'] } },
      { typ: 'befehl', titel: ['mkcert installieren', 'mkcert installieren'],
        code: { linux: 'sudo apt install mkcert libnss3-tools', windows: 'winget install FiloSottile.mkcert' },
        erkl: [['sudo apt install', 'Installiert mkcert. <code>libnss3-tools</code> braucht mkcert, um die CA auch in Firefox/Chrome unter Linux einzutragen.'],
               ['winget install', 'Installiert mkcert über die Windows-Paketverwaltung. Alternative: <code>choco install mkcert</code>.']] },
      { typ: 'befehl', titel: ['Installation prüfen', 'Installation prüfen'],
        code: { linux: 'docker version\ndocker compose version\nmkcert -version', windows: 'docker version\ndocker compose version\nmkcert -version' },
        erkl: [['docker version', 'Zeigt Client <b>und</b> Server (Docker Engine). Fehlt der Server-Teil, läuft Docker nicht.'],
               ['docker compose version', 'Compose als Plugin – geschrieben mit Leerzeichen: <code>docker compose</code>.'],
               ['mkcert -version', 'mkcert ist installiert und im Pfad.']] }
    ],
    kontrolle: { alle: [['Alle drei Befehle zeigen eine Versionsnummer ohne Fehlermeldung.', 'Alle 3 Befehle zeigen eine Version. Es gibt keinen Fehler.']],
                 windows: [['Docker Desktop läuft im Hintergrund (Linux-Container).', 'Docker Desktop läuft.']] },
    mitdenken: { frage: ['Warum bekommt der Javalin-Container keinen Port nach außen?', 'Warum hat Javalin keinen Port nach außen?'],
      satz: 'Javalin hat keinen Port, weil …',
      muster: ['Sonst könnte man Javalin direkt und unverschlüsselt per HTTP erreichen und Nginx umgehen. So läuft jeder Zugriff über Nginx – und damit über HTTPS.', 'Sonst kann man Javalin ohne Verschlüsselung erreichen. So muss jeder über Nginx gehen. Dann ist alles verschlüsselt.'] },
    profi: 'TLS-Terminierung am Proxy ist im Betrieb Standard (Nginx, Traefik, Caddy, Load-Balancer in der Cloud). Vorteile: Zertifikate liegen an <b>einer</b> Stelle, der Java-Code bleibt einfach, mehrere Backends können hinter einem Proxy stehen. <br><b>Frage:</b> Warum nutzen wir 8443 statt 443 auf dem Host? (Tipp: Ports unter 1024 und belegte Ports.)',
    begriffe: ['Reverse-Proxy', 'TLS', 'TLS-Terminierung', 'Port-Mapping']
  },
  /* ---------------------------------------------------------------- 2 */
  {
    titel: 'Projektordner und Ignorier-Regeln anlegen',
    kurz: ['Ordnung im Projekt – und Geheimes bleibt draußen.', 'Ordner anlegen. Geheimes bleibt draußen.'],
    warum: [
      'Eine saubere Ordnerstruktur trennt Quellcode, Serverkonfiguration, Zertifikate und Skripte. <code>.gitignore</code> und <code>.dockerignore</code> verhindern, dass private Schlüssel (<code>certs/</code>) oder Build-Dateien (<code>target/</code>) versehentlich in Git oder im Docker-Image landen.',
      'Jede Art von Datei bekommt einen eigenen Ordner. Zwei Dateien sagen, was draußen bleibt: <code>.gitignore</code> für Git, <code>.dockerignore</code> für Docker. So kommt der geheime Schlüssel nicht in Git und nicht ins Image.'
    ],
    szene: { typ: 'ordner', titel: ['Wer sieht welche Datei?', 'Wer sieht welche Datei?'] },
    bloecke: [
      { typ: 'befehl', titel: ['Ordner anlegen', 'Ordner anlegen'], hinweis: ['Ergänzung zur Anleitung', 'Ergänzung'],
        code: {
          linux: 'mkdir -p local-https-demo/{certs,nginx,scripts/windows,scripts/ubuntu,src/main/java/demo}\ncd local-https-demo',
          cmd: R`mkdir local-https-demo
cd local-https-demo
mkdir certs nginx scripts\windows scripts\ubuntu src\main\java\demo`,
          ps: R`New-Item -ItemType Directory -Force local-https-demo | Out-Null
Set-Location local-https-demo
New-Item -ItemType Directory -Force certs, nginx, scripts\windows, scripts\ubuntu, src\main\java\demo | Out-Null`
        },
        erkl: [['mkdir -p', 'Legt alle Ordner auf einmal an; <code>{a,b}</code> erzeugt mehrere Namen, <code>-p</code> auch Zwischenordner.'],
               ['mkdir local-https-demo', 'Hauptordner anlegen.'],
               ['cd local-https-demo', 'In den Hauptordner wechseln – alle weiteren Befehle laufen hier.'],
               ['mkdir certs', 'Mehrere Ordner auf einmal; Zwischenordner (src\\main\\java) legt CMD automatisch an.'],
               ['New-Item -ItemType Directory -Force local', 'Hauptordner anlegen; <code>-Force</code> = kein Fehler, wenn es ihn schon gibt.'],
               ['Set-Location', 'In den Hauptordner wechseln – alle weiteren Befehle laufen hier.'],
               ['New-Item -ItemType Directory -Force certs', 'Alle Unterordner auf einmal; <code>| Out-Null</code> unterdrückt die Ausgabe.']] },
      { typ: 'text', t: ['Die Dateien legst du mit einem Editor an (z. B. VS Code). Bei jeder Datei kannst du den Inhalt mit <b>📋 Kopieren</b> übernehmen oder sie mit <b>⬇ Datei</b> direkt herunterladen. Am Ende gibt es das ganze Projekt als ZIP.', 'Lege die Dateien mit einem Editor an, z. B. VS Code. Mit <b>📋 Kopieren</b> kopierst du den Inhalt. Mit <b>⬇ Datei</b> lädst du die Datei herunter.'] },
      { typ: 'datei', pfad: '.gitignore', erkl: [['certs/', 'Zertifikate und privater Schlüssel kommen <b>nie</b> ins Git-Repository.'], ['target/', 'Build-Ergebnisse von Maven – lassen sich jederzeit neu erzeugen.']] },
      { typ: 'datei', pfad: '.dockerignore', erkl: [['certs/', 'Schlüssel nicht an den Docker-Build schicken. Nginx bekommt sie später per Bind Mount.'], ['target/', 'Alte Build-Ergebnisse stören den Build im Container nicht.'], ['.git/', 'Der Git-Verlauf gehört nicht ins Image.'], ['scripts/', 'Die Skripte laufen auf dem Host, nicht im Container.']] }
    ],
    kontrolle: { alle: [['Die Ordnerstruktur ist angelegt.', 'Die Ordner sind da.'], ['.gitignore und .dockerignore liegen im Hauptordner local-https-demo/.', '.gitignore und .dockerignore liegen im Hauptordner.']],
                 windows: [[R`Das Projekt liegt lokal (z. B. C:\temp\), nicht auf einem Netzlaufwerk.`, R`Das Projekt liegt auf C: (z. B. C:\temp\). Nicht auf einem Netzlaufwerk.`]] },
    mitdenken: { frage: ['Warum steht scripts/ in .dockerignore, aber nicht in .gitignore?', 'scripts/ steht in .dockerignore. Warum nicht in .gitignore?'],
      satz: 'In Git brauchen wir die Skripte, weil … Im Image nicht, weil …',
      muster: ['Die Skripte gehören ins Repository, damit alle im Team sie nutzen können. Im Image braucht sie niemand – sie laufen auf dem Host, nicht im Container. Weniger Dateien im Build-Kontext machen den Build schneller.', 'Alle im Team sollen die Skripte bekommen. Darum kommen sie in Git. Die Skripte laufen auf deinem Rechner, nicht im Container. Darum braucht das Image sie nicht.'] },
    profi: 'Der <b>Build-Kontext</b> (<code>context: .</code>) ist alles, was beim Bauen an Docker geschickt wird – <code>.dockerignore</code> filtert davor. Unser Dockerfile kopiert nur <code>pom.xml</code> und <code>src</code>. Ein bequemes <code>COPY . .</code> würde ohne .dockerignore aber auch <code>certs/localhost-key.pem</code> ins Image packen – und jeder mit dem Image hätte den Schlüssel.<br><b>Windows-Tipp:</b> Dateien wie <code>.gitignore</code> legst du am einfachsten im Editor an (im Explorer ist der Name ohne Text vor dem Punkt umständlich).',
    begriffe: ['Build-Kontext', 'privater Schlüssel']
  },
  /* ---------------------------------------------------------------- 3 */
  {
    titel: 'Javalin-App und Multi-Stage-Dockerfile',
    kurz: ['Eine kleine Web-App – gebaut in einem großen, ausgeliefert in einem kleinen Image.', 'Eine kleine App. Sie wird im großen Image gebaut und läuft im kleinen.'],
    warum: [
      'Die Java-App hat zwei <b>Endpunkte</b>: <code>/</code> begrüßt den Browser, <code>/health</code> ist der technische Prüf-Endpunkt (Healthcheck). Damit Nginx Javalin im Docker-Netz erreicht, bindet Javalin an <code>0.0.0.0</code>. Das <code>Dockerfile</code> ist ein <b>Multi-Stage-Build</b>: Stage 1 kompiliert mit Maven und JDK, Stage 2 enthält nur die fertigen Dateien auf einem schlanken JRE-Image und läuft als unprivilegierter Benutzer.',
      'Die App hat 2 Adressen: <code>/</code> für den Browser und <code>/health</code> für den Test. Javalin hört auf <code>0.0.0.0</code>. So kann Nginx Javalin erreichen. Das Dockerfile hat 2 Teile. Teil 1 übersetzt den Code. Teil 2 enthält nur das Ergebnis. Teil 2 ist klein und läuft ohne Admin-Rechte.'
    ],
    szene: { typ: 'ablauf', titel: ['Was beim Bauen passiert', 'So wird gebaut'],
      knoten: [
        { id: 'src', icon: '📄', name: 'Quellcode', sub: 'pom.xml, src/' },
        { id: 's1', icon: '🏗️', name: 'Stage 1 „build“', sub: 'Maven + JDK 21 (groß)' },
        { id: 'out', icon: '📦', name: 'Ergebnis', sub: 'classes/ + lib/*.jar' },
        { id: 's2', icon: '🚀', name: 'Stage 2', sub: 'JRE 21 Alpine (klein)' },
        { id: 'img', icon: '🐳', name: 'Image', sub: 'local-https-javalin:1.0.0' }
      ],
      schritte: [
        { an: ['s1'], zeile: ['Dockerfile', 'FROM maven'], t: ['Stage 1 startet mit einem vollständigen Maven-Image samt JDK. Nur hier wird kompiliert – deshalb brauchst du Java und Maven nicht auf deinem Rechner.', 'Teil 1 nimmt ein großes Image mit Maven und Java. Nur hier wird übersetzt. Du brauchst Java nicht auf deinem Rechner.'] },
        { an: ['src', 's1'], zeile: ['Dockerfile', 'COPY pom.xml'], t: ['<code>pom.xml</code> und der Ordner <code>src</code> kommen in den Build-Container.', '<code>pom.xml</code> und <code>src</code> kommen in den Container.'] },
        { an: ['s1', 'out'], zeile: ['Dockerfile', 'RUN mvn'], t: ['Maven kompiliert (<code>package</code>) und kopiert alle Laufzeit-Bibliotheken nach <code>target/dependency</code> (<code>copy-dependencies</code>).', 'Maven übersetzt den Code. Maven sammelt alle Bibliotheken ein.'] },
        { an: ['s2'], zeile: ['Dockerfile', 'FROM eclipse-temurin'], t: ['Stage 2 beginnt ganz neu: nur eine Java-Laufzeit (JRE) auf Alpine Linux – kein Maven, kein Compiler.', 'Teil 2 fängt neu an. Er hat nur Java zum Ausführen. Kein Maven.'] },
        { an: ['s2'], zeile: ['Dockerfile', 'apk add'], t: ['<code>curl</code> kommt dazu – der Healthcheck in <code>compose.yaml</code> braucht es (Schritt 5).', '<code>curl</code> wird installiert. Der Healthcheck braucht es.'] },
        { an: ['out', 's2'], zeile: ['Dockerfile', 'COPY --from=build /src/target/classes'], t: ['Nur die fertigen <code>.class</code>- und <code>.jar</code>-Dateien werden aus Stage 1 herüberkopiert.', 'Nur die fertigen Dateien kommen aus Teil 1 in Teil 2.'] },
        { an: ['s2'], zeile: ['Dockerfile', 'USER 10001'], t: ['Der Container läuft als unprivilegierter Benutzer, nicht als root. Wird die App angegriffen, hat der Angreifer weniger Rechte.', 'Die App läuft ohne Admin-Rechte. Das ist sicherer.'] },
        { an: ['img'], zeile: ['Dockerfile', 'ENTRYPOINT'], t: ['Startbefehl: <code>java</code> mit Klassenpfad <code>classes:lib/*</code> und Hauptklasse <code>demo.App</code>. Stage 1 wird verworfen – das Image bleibt klein.', 'So startet die App. Teil 1 wird weggeworfen. Das Image bleibt klein.'] }
      ]
    },
    bloecke: [
      { typ: 'datei', pfad: 'src/main/java/demo/App.java', erkl: [
        ['package demo;', 'Paket <code>demo</code> – muss zum Ordner <code>src/main/java/demo/</code> passen.'],
        ['import io.javalin', 'Javalin, ein schlankes Web-Framework für Java.'],
        ['Javalin.create()', 'Erzeugt den Webserver (noch nicht gestartet).'],
        ['app.get("/"', 'Route <code>/</code>: Antwort für den Browser.'],
        ['app.get("/health"', 'Prüf-Endpunkt für den Healthcheck: antwortet <code>OK</code> mit HTTP 200.'],
        ['app.start', 'Startet auf Port 8080 an <code>0.0.0.0</code> = alle Netzwerkschnittstellen des Containers. Mit <code>localhost</code> käme Nginx nicht heran.']] },
      { typ: 'datei', pfad: 'pom.xml', erkl: [
        ['<groupId>demo', 'Kennung des Projekts: groupId, artifactId, version.'],
        ['maven.compiler.release', 'Kompiliert für Java 21.'],
        ['sourceEncoding', 'Quelltext als UTF-8 lesen (Umlaute).'],
        ['<artifactId>javalin', 'Die einzige Abhängigkeit: Javalin. Maven lädt sie samt allen Unterbibliotheken.'],
        ['<version>6.7.0', 'Feste Version – jeder Build ist gleich.'],
        ['maven-compiler-plugin', 'Plugin-Version fest vorgeben – gleicher Build auf jedem Rechner.'],
        ['maven-dependency-plugin', 'Liefert das Ziel <code>dependency:copy-dependencies</code>: Bibliotheken nach <code>target/dependency</code> kopieren.']] },
      { typ: 'datei', pfad: 'Dockerfile', erkl: [
        ['FROM maven', 'Stage 1 mit dem Namen <code>build</code>: Maven + JDK 21.'],
        ['WORKDIR /src', 'Arbeitsordner im Build-Container.'],
        ['COPY pom.xml', 'Projektbeschreibung hineinkopieren.'],
        ['COPY src', 'Quellcode hineinkopieren.'],
        ['RUN mvn', 'Kompilieren ohne Tests (<code>-B</code> = ohne Rückfragen) und Laufzeit-Bibliotheken sammeln.'],
        ['FROM eclipse-temurin', 'Stage 2: nur JRE 21 auf Alpine Linux.'],
        ['apk add', 'curl für den Healthcheck; <code>--no-cache</code> hält das Image klein.'],
        ['WORKDIR /app', 'Arbeitsordner im fertigen Image.'],
        ['COPY --from=build /src/target/classes', 'Kompilierte Klassen aus Stage 1 holen.'],
        ['COPY --from=build /src/target/dependency', 'Bibliotheken (.jar) aus Stage 1 holen.'],
        ['USER 10001', 'Ab hier als unprivilegierter Benutzer (UID/GID 10001), nicht als root.'],
        ['ENTRYPOINT', 'Startbefehl des Containers.']] }
    ],
    kontrolle: { alle: [['App.java, pom.xml und Dockerfile liegen an der richtigen Stelle.', 'App.java, pom.xml und Dockerfile sind da.'], ['package demo; passt genau zum Pfad src/main/java/demo/App.java.', 'package demo; passt zum Ordner src/main/java/demo/.']] },
    mitdenken: { frage: ['Warum muss Javalin an 0.0.0.0 binden und nicht an localhost?', 'Warum 0.0.0.0 und nicht localhost?'],
      satz: 'localhost ist im Container …, darum …',
      muster: ['localhost ist im Container nur der Container selbst. Nginx läuft in einem anderen Container und kommt über das Docker-Netz. Mit 0.0.0.0 hört Javalin auf allen Schnittstellen, auch im Docker-Netz. Mit localhost gäbe es „502 Bad Gateway“.', 'localhost ist nur der Container selbst. Nginx ist ein anderer Container. Mit 0.0.0.0 hört Javalin auch im Docker-Netz. Sonst kommt Fehler 502.'] },
    profi: 'Vergleiche nach dem Build die Größen mit <code>docker images</code>: <code>maven:3.9-eclipse-temurin-21</code> gegen <code>local-https-javalin:1.0.0</code>. Woher kommt der Unterschied?<br><code>-DskipTests</code> baut ohne Tests – in echten Projekten laufen die Tests vorher in der CI-Pipeline.<br>Statt eines „Fat-JAR“ nutzt das Image einen Klassenpfad <code>classes:lib/*</code>. Überlege: Welcher Vorteil ergibt sich für die Image-Schichten, wenn sich nur dein Code ändert, die Bibliotheken aber nicht?',
    begriffe: ['Endpunkt', 'Healthcheck', 'Multi-Stage-Build', 'JRE']
  },
  /* ---------------------------------------------------------------- 4 */
  {
    titel: 'Lokale CA und Serverzertifikat erzeugen',
    kurz: ['Damit der Browser deinem Server glaubt.', 'So glaubt der Browser deinem Server.'],
    warum: [
      'Der Browser vertraut einer HTTPS-Verbindung nur, wenn (1) das Zertifikat auf den aufgerufenen Namen bzw. die IP (<code>localhost</code>, <code>127.0.0.1</code>) ausgestellt ist und (2) die ausstellende <b>Zertifizierungsstelle</b> im Vertrauensspeicher des Systems liegt, auf dem der Browser läuft. <code>mkcert</code> richtet dafür eine lokale <b>Root-CA</b> ein. Ihr privater Schlüssel <code>rootCA-key.pem</code> bleibt im Benutzerprofil und kommt <b>niemals</b> in den Projektordner.',
      'Der Browser prüft 2 Dinge: 1. Passt der Name im Zertifikat? 2. Kennt er die Stelle, die unterschrieben hat? <code>mkcert</code> macht eine eigene <b>Root-CA</b> auf deinem Rechner. Ihr Schlüssel <code>rootCA-key.pem</code> bleibt in deinem Benutzerordner. Er kommt nie ins Projekt.'
    ],
    szene: { typ: 'ablauf', titel: ['Die Vertrauenskette', 'Wer glaubt wem?'],
      knoten: [
        { id: 'ca', icon: '🏛️', name: 'Root-CA (mkcert)', sub: 'im Benutzerprofil' },
        { id: 'store', icon: '🗄️', name: 'Vertrauensspeicher', sub: { linux: 'Ubuntu / WSL2', windows: 'Windows' } },
        { id: 'cert', icon: '📜', name: 'localhost.pem', sub: 'localhost, 127.0.0.1' },
        { id: 'key', icon: '🔑', name: 'localhost-key.pem', sub: 'privater Schlüssel' },
        { id: 'nginx', icon: '🛡️', name: 'Nginx', sub: 'zeigt Zertifikat' },
        { id: 'browser', icon: '🌐', name: 'Browser', sub: 'prüft' },
        { id: 'win', icon: '🪟', name: 'Windows-Speicher', sub: 'getrennt von WSL!', nur: 'linux' }
      ],
      schritte: [
        { an: ['ca'], zeile: ['befehl', 'mkcert -install'], t: ['<code>mkcert -install</code> legt eine eigene kleine Zertifizierungsstelle an. Ihr privater Schlüssel bleibt im Benutzerprofil.', '<code>mkcert -install</code> macht eine eigene CA. Ihr Schlüssel bleibt in deinem Benutzerordner.'] },
        { an: ['ca', 'store'], t: ['Gleichzeitig trägt mkcert das öffentliche Root-Zertifikat in den Vertrauensspeicher <b>dieses</b> Systems ein. Ab jetzt glaubt es allem, was diese CA unterschreibt.', 'mkcert trägt die CA in die Liste deines Systems ein. Jetzt glaubt dein System dieser CA.'] },
        { an: ['ca', 'cert', 'key'], zeile: ['befehl', 'mkcert -cert-file'], t: ['<code>mkcert -cert-file …</code> erzeugt ein Serverzertifikat für genau <code>localhost</code> und <code>127.0.0.1</code>, unterschrieben von der CA, plus den passenden privaten Schlüssel.', 'Der 2. mkcert-Befehl macht ein Zertifikat für <code>localhost</code> und <code>127.0.0.1</code>. Dazu kommt ein geheimer Schlüssel.'] },
        { an: ['cert', 'key', 'nginx'], t: ['Nginx bekommt beide Dateien (Schritt 5) und zeigt das Zertifikat jedem Browser.', 'Nginx bekommt beide Dateien. Nginx zeigt das Zertifikat dem Browser.'] },
        { an: ['nginx', 'browser', 'store'], t: ['Der Browser prüft: Passt der Name? Stammt die Unterschrift von einer CA im Vertrauensspeicher? Zweimal ja → Schloss 🔒.', 'Der Browser prüft: Passt der Name? Kennt er die CA? 2-mal ja: Schloss 🔒.'] },
        { an: ['win', 'browser'], nur: 'linux', fehler: true, t: ['<b>Achtung WSL2:</b> Windows hat einen eigenen Speicher. Öffnest du die Seite im Windows-Browser, kennt er die WSL-CA nicht → <code>ERR_CERT_AUTHORITY_INVALID</code>. Lösung: das Root-Zertifikat einmal importieren (siehe unten).', '<b>Achtung WSL2:</b> Windows hat eine eigene Liste. Der Windows-Browser kennt die WSL-CA nicht. Dann kommt <code>ERR_CERT_AUTHORITY_INVALID</code>. Lösung: siehe unten.'] }
      ]
    },
    bloecke: [
      { typ: 'befehl', id: 'befehl', titel: ['Zertifikat erzeugen (im Ordner local-https-demo/)', 'Zertifikat erzeugen (im Ordner local-https-demo/)'],
        code: {
          linux: R`mkdir -p certs
mkcert -install
mkcert -cert-file certs/localhost.pem \
       -key-file certs/localhost-key.pem localhost 127.0.0.1
ls -la certs`,
          cmd: R`if not exist certs mkdir certs
mkcert -install
mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1
dir certs`,
          ps: R`New-Item -ItemType Directory -Force certs | Out-Null
mkcert -install
mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1
dir certs`
        },
        erkl: [['mkdir -p certs', 'Ordner certs anlegen, falls er fehlt.'], ['if not exist certs', 'Ordner certs anlegen, falls er fehlt (nur CMD).'], ['New-Item', 'Ordner certs anlegen, falls er fehlt (PowerShell).'],
               ['mkcert -install', 'Root-CA anlegen und in den Vertrauensspeicher <b>dieses</b> Systems eintragen. Einmal pro System genügt.'],
               ['mkcert -cert-file', 'Serverzertifikat <code>localhost.pem</code> und Schlüssel <code>localhost-key.pem</code> für die Namen <code>localhost</code> und <code>127.0.0.1</code>.'],
               ['-key-file', 'Fortsetzung der Zeile davor (der <code>\\</code> am Zeilenende verbindet beide Zeilen).'],
               ['ls -la certs', 'Kontrolle: Was liegt in certs/?'], ['dir certs', 'Kontrolle: Was liegt in certs/?']] },
      { typ: 'text', nur: 'linux', t: ['<b>Nur wenn Docker in WSL2 läuft und du im Windows-Browser testest:</b> Root-CA einmal nach Windows übernehmen. <code>curl</code> in WSL vertraut der CA schon – der Windows-Browser nicht.', '<b>Nur für WSL2 mit Browser unter Windows:</b> Die CA muss auch nach Windows. Das machst du einmal.'] },
      { typ: 'befehl', nur: 'linux', titel: ['1) Im WSL-Terminal: Root-CA nach Windows kopieren', '1) Im WSL-Terminal: CA nach Windows kopieren'],
        code: { linux: 'cp "$(mkcert -CAROOT)/rootCA.pem" /mnt/c/Users/Public/mkcert-wsl-rootCA.pem' },
        erkl: [['cp', '<code>mkcert -CAROOT</code> nennt den Ordner der CA. Kopiert wird nur das <b>öffentliche</b> <code>rootCA.pem</code> – nie <code>rootCA-key.pem</code>. <code>/mnt/c</code> ist Laufwerk C: von Windows.']] },
      { typ: 'befehl', nur: 'linux', titel: ['2) In Windows (CMD oder PowerShell): importieren', '2) In Windows (CMD oder PowerShell): importieren'],
        code: { linux: R`certutil -user -addstore Root C:\Users\Public\mkcert-wsl-rootCA.pem` },
        erkl: [['certutil', 'Trägt das Zertifikat in den Speicher „Root“ deines Windows-Benutzers ein. Dank <code>-user</code> ohne Admin-Rechte. Sicherheitsabfrage mit <b>Ja</b> bestätigen, danach die Datei löschen und den Browser <b>ganz</b> schließen und neu starten.']] }
    ],
    kontrolle: { alle: [['In certs/ liegen genau zwei Dateien: localhost.pem und localhost-key.pem.', 'In certs/ liegen 2 Dateien: localhost.pem und localhost-key.pem.'], ['mkcert -install lief auf dem System, auf dem mein Browser läuft.', 'mkcert -install lief dort, wo mein Browser läuft.']],
                 linux: [['Nur WSL2 + Windows-Browser: Root-CA in Windows importiert und Browser neu gestartet (sonst: abhaken, wenn nicht nötig).', 'Nur WSL2 mit Windows-Browser: CA importiert, Browser neu gestartet. (Sonst einfach abhaken.)']] },
    mitdenken: { frage: ['Du änderst später den Port von 8443 auf 9443. Brauchst du ein neues Zertifikat?', 'Du nimmst Port 9443 statt 8443. Brauchst du ein neues Zertifikat?'],
      satz: 'Nein/Ja, weil im Zertifikat …',
      muster: ['Nein. Ein Zertifikat gilt für Namen und IP-Adressen (localhost, 127.0.0.1), nicht für Ports.', 'Nein. Im Zertifikat stehen nur Namen und IP-Adressen. Ports stehen nicht darin.'] },
    profi: { linux: 'Schau ins Zertifikat: <code>openssl x509 -in certs/localhost.pem -noout -issuer -ext subjectAltName</code> – du siehst den Aussteller (mkcert …) und die Subject Alternative Names.<br>Gib <code>rootCA-key.pem</code> nie weiter: Wer ihn hat, kann Zertifikate für <b>jede</b> Domain ausstellen, denen dein Rechner dann vertraut – auch für deine Bank.',
             windows: 'Doppelklicke <code>certs\\localhost.pem</code> (ggf. vorher in <code>.crt</code> umbenennen): Unter „Details“ siehst du Aussteller (mkcert …) und „Alternativer Antragstellername“. Den Root-Eintrag findest du mit <code>certmgr.msc</code> unter „Vertrauenswürdige Stammzertifizierungsstellen“.<br>Gib <code>rootCA-key.pem</code> nie weiter: Wer ihn hat, kann Zertifikate für <b>jede</b> Domain ausstellen, denen dein Rechner dann vertraut – auch für deine Bank.' },
    begriffe: ['Zertifikat', 'Zertifizierungsstelle', 'Root-CA', 'Vertrauensspeicher', 'privater Schlüssel', 'WSL2']
  },
  /* ---------------------------------------------------------------- 5 */
  {
    titel: 'Nginx-Reverse-Proxy und Docker Compose',
    kurz: ['Nginx konfigurieren und beide Container zusammenspielen lassen.', 'Nginx einstellen. Beide Container zusammen starten.'],
    warum: [
      'Für Nginx bauen wir kein eigenes Image: Wir nehmen das offizielle <code>nginx:stable</code> und binden Konfiguration und Zertifikate schreibgeschützt (<code>:ro</code>) ein. In <code>compose.yaml</code> legen wir die Startreihenfolge fest: <code>depends_on</code> mit <code>condition: service_healthy</code> lässt Nginx warten, bis Javalin auf <code>/health</code> mit HTTP 200 antwortet.',
      'Für Nginx nehmen wir das fertige Image <code>nginx:stable</code>. Unsere Einstellungen und Zertifikate kommen von außen dazu. Der Container darf sie nur lesen (<code>:ro</code>). In <code>compose.yaml</code> steht: Nginx wartet, bis Javalin bereit ist.'
    ],
    szene: { typ: 'ablauf', titel: ['docker compose up – was passiert?', 'Was passiert beim Start?'],
      knoten: [
        { id: 'up', icon: '▶️', name: 'compose up', sub: 'Start' },
        { id: 'jv', icon: '☕', name: 'javalin', sub: 'Healthcheck /health', gruppe: 'Docker-Netz' },
        { id: 'ng', icon: '🛡️', name: 'nginx', sub: 'wartet auf healthy', gruppe: 'Docker-Netz' },
        { id: 'port', icon: '🚪', name: '127.0.0.1:8443', sub: '→ nginx:443' }
      ],
      schritte: [
        { an: ['up', 'jv'], zeile: ['compose.yaml', 'build:'], t: ['Compose baut das Javalin-Image aus dem Dockerfile – oder nimmt das schon gebaute <code>local-https-javalin:1.0.0</code>.', 'Compose baut das Javalin-Image. Oder es nimmt das fertige Image.'] },
        { an: ['jv'], zeile: ['compose.yaml', 'test:'], t: ['Javalin startet. Alle 5 Sekunden führt Docker im Container <code>curl -fsS http://127.0.0.1:8080/health</code> aus.', 'Javalin startet. Alle 5 Sekunden fragt Docker: Antwortet /health?'] },
        { an: ['jv'], zeile: ['compose.yaml', 'retries: 10'], t: ['Antwortet <code>/health</code> mit HTTP 200, ist der Container <b>healthy</b>. Nach 10 Fehlschlägen hintereinander wäre er <b>unhealthy</b>.', 'Kommt eine Antwort, ist Javalin <b>healthy</b>. Nach 10 Fehlern ist es <b>unhealthy</b>.'] },
        { an: ['ng'], zeile: ['compose.yaml', 'condition: service_healthy'], t: ['Erst jetzt startet Nginx. Ohne <code>condition</code> hieße <code>depends_on</code> nur „starte danach“ – nicht „warte, bis bereit“.', 'Erst jetzt startet Nginx. Ohne diese Zeile würde Nginx nicht warten.'] },
        { an: ['ng'], zeile: ['compose.yaml', './nginx/default.conf'], t: ['Nginx bekommt <code>default.conf</code> und den Ordner <code>certs</code> per Bind Mount – mit <code>:ro</code> nur lesbar.', 'Nginx bekommt seine Einstellungen und die Zertifikate. Nur zum Lesen.'] },
        { an: ['port', 'ng'], zeile: ['compose.yaml', '127.0.0.1:8443:443'], t: ['Nur Nginx hat <code>ports:</code> – und nur auf <code>127.0.0.1</code>. Andere Rechner im Netz erreichen die Seite nicht.', 'Nur Nginx hat einen Port nach außen. Nur dein eigener Rechner kommt hin.'] },
        { an: ['ng', 'jv'], zeile: ['nginx/default.conf', 'proxy_pass'], t: ['Bei einer Anfrage findet Nginx Javalin über den <b>Service-Namen</b> <code>javalin</code>. Docker löst ihn im Projektnetz in die IP des Containers auf.', 'Nginx sucht Javalin unter dem Namen <code>javalin</code>. Docker kennt die passende Adresse.'] }
      ]
    },
    bloecke: [
      { typ: 'datei', pfad: 'nginx/default.conf', erkl: [
        ['listen 443 ssl', 'Nginx lauscht im Container auf Port 443 – mit TLS.'],
        ['server_name', 'Für diese Namen ist der Block zuständig.'],
        ['ssl_certificate ', 'Zertifikat – Pfad <b>im Container</b>, eingebunden aus <code>./certs</code>.'],
        ['ssl_certificate_key', 'Der private Schlüssel dazu.'],
        ['ssl_protocols', 'Nur die modernen Versionen TLS 1.2 und 1.3.'],
        ['location /', 'Gilt für alle Pfade.'],
        ['proxy_pass', 'Weiter an den Service <code>javalin</code>, Port 8080 – per HTTP im Docker-Netz.'],
        ['proxy_set_header Host', 'Den ursprünglichen Host (mit Port 8443) an Javalin weitergeben.'],
        ['X-Forwarded-Proto', 'Teilt Javalin mit: Außen war es <code>https</code>.']] },
      { typ: 'datei', pfad: 'compose.yaml', erkl: [
        ['name: local-https-demo', 'Projektname. Er steckt z. B. im Netzwerknamen <code>local-https-demo_default</code>.'],
        ['javalin:', 'Service <code>javalin</code> – sein Name ist zugleich der Hostname im Docker-Netz.'],
        ['build:', 'Image aus dem Dockerfile bauen …'],
        ['context: .', '… mit dem Projektordner als Build-Kontext.'],
        ['image: local-https-javalin', 'Name und Tag für das gebaute Image.'],
        ['container_name: javalin-backend', 'Fester Containername statt eines automatisch erzeugten.'],
        ['healthcheck:', 'Docker prüft regelmäßig, ob die App bereit ist.'],
        ['test:', 'Befehl im Container: curl auf /health. <code>-f</code> = Fehler bei HTTP-Fehlercode.'],
        ['interval: 5s', 'Alle 5 Sekunden prüfen.'],
        ['timeout: 3s', 'Höchstens 3 Sekunden pro Versuch.'],
        ['retries: 10', 'Nach 10 Fehlschlägen hintereinander: unhealthy.'],
        ['start_period: 5s', 'Anlaufzeit: Fehlschläge in den ersten 5 s zählen noch nicht.'],
        ['image: nginx:stable', 'Offizielles Nginx-Image – kein eigenes Dockerfile nötig.'],
        ['container_name: nginx-https-proxy', 'Fester Containername.'],
        ['depends_on:', 'nginx hängt von javalin ab …'],
        ['condition: service_healthy', '… und startet erst, wenn javalin <b>healthy</b> ist.'],
        ['ports:', 'Nur nginx ist von außen erreichbar.'],
        ['127.0.0.1:8443:443', 'Host-Adresse 127.0.0.1, Port 8443 → Container-Port 443. Reihenfolge: <b>Host:Container</b>.'],
        ['volumes:', 'Bind Mounts: Dateien vom Host im Container.'],
        ['./nginx/default.conf', 'Unsere Konfiguration ersetzt die Standarddatei von Nginx, <code>:ro</code> = nur lesen.'],
        ['./certs', 'Zertifikat und Schlüssel, ebenfalls schreibgeschützt.']] },
      { typ: 'befehl', titel: ['Konfiguration prüfen', 'Konfiguration prüfen'], code: { linux: 'docker compose config --quiet', windows: 'docker compose config --quiet' }, erkl: [['docker compose config', 'Liest compose.yaml und prüft die Syntax. Keine Ausgabe = alles in Ordnung.']] }
    ],
    kontrolle: { alle: [['nginx/default.conf und compose.yaml liegen im Projekt.', 'nginx/default.conf und compose.yaml sind da.'], ['docker compose config --quiet gibt nichts aus.', 'docker compose config --quiet zeigt nichts an. Das ist gut.']] },
    mitdenken: { frage: ['Was passiert, wenn in default.conf proxy_pass http://localhost:8080; steht?', 'In default.conf steht proxy_pass http://localhost:8080;. Was passiert?'],
      satz: 'localhost ist im Nginx-Container …, darum …',
      muster: ['localhost ist im Nginx-Container der Nginx-Container selbst. Dort läuft auf 8080 nichts → 502 Bad Gateway. Richtig ist der Service-Name javalin.', 'localhost ist der Nginx-Container selbst. Dort läuft auf Port 8080 nichts. Darum kommt Fehler 502. Richtig ist: javalin.'] },
    profi: '<code>X-Forwarded-Proto $scheme</code> braucht eine App z. B. für Weiterleitungen und Cookies mit dem Attribut <code>Secure</code> – sonst glaubt sie, sie liefe über HTTP.<br><b>Bonus:</b> Ergänze einen zweiten <code>server</code>-Block mit <code>listen 80;</code> und <code>return 301 https://$host:8443$request_uri;</code>. Was musst du dann zusätzlich in <code>compose.yaml</code> eintragen?',
    begriffe: ['Service-Name', 'Healthcheck', 'Bind Mount', 'Reverse-Proxy']
  },
  /* ---------------------------------------------------------------- 6 */
  {
    titel: 'Lebenszyklus-Skripte anlegen',
    kurz: ['Build, Create, Run, Stop, Remove – je ein Skript.', 'Für jede Phase ein Skript.'],
    warum: [
      'Im Unterricht und bei der Fehlersuche hilft es, die Phasen eines Container-Stacks sauber zu trennen: <b>Build</b> (Images bauen), <b>Create</b> (Container und Netz anlegen, nicht starten), <b>Run</b> (starten, Healthcheck abwarten, HTTPS testen), <b>Stop</b> (anhalten, alles bleibt) und <b>Remove</b> (Container, Netz und Images löschen). Alle Skripte finden ihren Speicherort selbst und wechseln ins Projekt-Hauptverzeichnis.',
      'Es gibt 5 Phasen: <b>Build</b> baut die Images. <b>Create</b> legt die Container an. <b>Run</b> startet sie und testet HTTPS. <b>Stop</b> hält sie an. <b>Remove</b> löscht alles. Für jede Phase gibt es ein Skript.'
    ],
    szene: { typ: 'lebenszyklus', titel: ['Probier die Skripte aus (Simulation)', 'Probier die Skripte aus'] },
    bloecke: [
      { typ: 'text', t: { linux: ['Die Skripte liegen in <code>scripts/ubuntu/</code>. Wähle eine Phase, um das Skript zu sehen.', 'Die Skripte liegen in <code>scripts/ubuntu/</code>.'],
                          cmd: [R`Die Skripte liegen in <code>scripts\windows\</code>. Batch-Dateien (<code>.cmd</code>) laufen auch auf Schulrechnern, auf denen PowerShell-Skripte gesperrt sind.`, R`Die Skripte liegen in <code>scripts\windows\</code>. .cmd-Dateien laufen auf allen Schulrechnern.`],
                          ps: [R`Die Skripte liegen in <code>scripts\windows\</code>. Blockiert eine Gruppenrichtlinie <code>.ps1</code>-Dateien, nimm stattdessen die <code>.cmd</code>-Skripte (oben auf „CMD“ umschalten).`, R`Die Skripte liegen in <code>scripts\windows\</code>. Ist PowerShell gesperrt? Dann schalte oben auf CMD.`] } },
      { typ: 'skripte' },
      { typ: 'befehl', nur: 'linux', titel: ['Skripte einmal ausführbar machen', 'Skripte ausführbar machen'], code: { linux: 'chmod +x scripts/ubuntu/*.sh' }, erkl: [['chmod +x', 'Setzt das Recht „ausführbar“ für alle .sh-Dateien. Sonst: <code>Permission denied</code>.']] }
    ],
    kontrolle: { linux: [['Alle fünf .sh-Skripte liegen in scripts/ubuntu/.', 'Alle 5 .sh-Skripte sind in scripts/ubuntu/.'], ['chmod +x scripts/ubuntu/*.sh ausgeführt.', 'chmod +x ist gemacht.']],
                 windows: [[R`Alle fünf Skripte (.cmd oder .ps1) liegen in scripts\windows\.`, R`Alle 5 Skripte sind in scripts\windows\.`]],
                 alle: [['Im Simulator habe ich jede Phase einmal ausprobiert.', 'Ich habe jede Phase im Simulator probiert.']] },
    mitdenken: { frage: ['Was ist der Unterschied zwischen stop und remove?', 'Was ist anders bei stop und remove?'],
      satz: 'Bei stop bleiben …, bei remove …',
      muster: ['stop hält die Container nur an: Container, Netz und Images bleiben, ein neuer Start geht schnell. remove (down --rmi all) löscht Container, Netz und Images – danach muss neu gebaut bzw. geladen werden.', 'Bei stop bleibt alles da. Der nächste Start ist schnell. Bei remove ist alles weg. Du musst neu bauen.'] },
    profi: 'Warum prüfen alle Skripte den Exit-Code? Ein Skript, das nach einem Fehler einfach weiterläuft, meldet am Ende vielleicht „Erfolg“, obwohl nichts läuft. Vergleiche die drei Wege: <code>set -e</code> (Bash), <code>|| exit /b 1</code> (CMD), <code>$LASTEXITCODE</code> (PowerShell).<br>Achtung: <code>down --rmi all</code> löscht auch <code>nginx:stable</code>. Welche Option bräuchtest du, um nur das selbst gebaute Image zu löschen? (Tipp: <code>docker compose down --help</code>)',
    begriffe: ['Skript', 'Exit-Code']
  },
  /* ---------------------------------------------------------------- 7 */
  {
    titel: 'Gesamtablauf testen',
    kurz: ['Build → Create → Run – und dann das Schloss im Browser.', 'Build, Create, Run. Dann siehst du das Schloss.'],
    warum: [
      'Jetzt läuft alles zusammen. Führe die Skripte in der vorgesehenen Reihenfolge aus und prüfe danach im Terminal und im Browser. Probiere es zuerst hier im Simulator, dann an deinem Rechner.',
      'Jetzt kommt alles zusammen. Starte die Skripte der Reihe nach. Dann prüfst du im Terminal und im Browser. Probiere es zuerst hier. Dann an deinem Rechner.'
    ],
    szene: { typ: 'lebenszyklus', browser: true, titel: ['Generalprobe (Simulation)', 'Generalprobe'] },
    bloecke: [
      { typ: 'befehl', titel: ['Reihenfolge an deinem Rechner', 'Reihenfolge an deinem Rechner'],
        code: {
          linux: './scripts/ubuntu/build_docker_nginx_javalin.sh\n./scripts/ubuntu/create_docker_nginx_javalin.sh\n./scripts/ubuntu/run_docker_nginx_javalin.sh',
          cmd: R`.\scripts\windows\build_docker_nginx_javalin.cmd
.\scripts\windows\create_docker_nginx_javalin.cmd
.\scripts\windows\run_docker_nginx_javalin.cmd`,
          ps: R`.\scripts\windows\build_docker_nginx_javalin.ps1
.\scripts\windows\create_docker_nginx_javalin.ps1
.\scripts\windows\run_docker_nginx_javalin.ps1`
        },
        erkl: [['build_', 'Images bauen bzw. laden.'], ['create_', 'Container und Netz anlegen.'], ['run_', 'Starten, Healthcheck abwarten, HTTPS testen.']] },
      { typ: 'befehl', titel: ['Status prüfen', 'Status prüfen'], code: { linux: 'docker compose ps', windows: 'docker compose ps' },
        erkl: [['docker compose ps', '<code>javalin-backend</code> muss <code>Up (healthy)</code> zeigen, <code>nginx-https-proxy</code> <code>Up</code>. Gestoppte Container zeigt erst <code>docker compose ps -a</code>.']] },
      { typ: 'text', t: ['Öffne <a href="https://127.0.0.1:8443/" target="_blank" rel="noopener">https://127.0.0.1:8443/</a> im Browser. Teste danach <b>Stop</b> und zum Schluss <b>Remove</b>.', 'Öffne <a href="https://127.0.0.1:8443/" target="_blank" rel="noopener">https://127.0.0.1:8443/</a>. Teste danach <b>Stop</b> und dann <b>Remove</b>.'] }
    ],
    kontrolle: { alle: [
      ['docker compose ps: javalin-backend ist Up (healthy), nginx-https-proxy ist Up.', 'docker compose ps: javalin-backend ist Up (healthy). nginx-https-proxy ist Up.'],
      ['https://127.0.0.1:8443/ zeigt ohne Warnung „Hallo von Javalin!“ und ein geschlossenes Schloss.', 'Der Browser zeigt „Hallo von Javalin!“ mit Schloss. Es gibt keine Warnung.'],
      ['Stop getestet: Die Seite ist danach nicht mehr erreichbar.', 'Stop getestet. Die Seite geht dann nicht mehr.'],
      ['Remove getestet: Container und Images sind gelöscht.', 'Remove getestet. Container und Images sind weg.']] },
    mitdenken: { frage: ['Das Run-Skript meldet „Bereit!“. Welche zwei Dinge hat es vorher geprüft?', 'Das Run-Skript sagt „Bereit!“. Was hat es vorher geprüft?'],
      satz: '1. Es hat geprüft, ob … 2. Es hat …',
      muster: ['1. Beide Zertifikatsdateien liegen in certs/. 2. https://127.0.0.1:8443/health antwortet mit OK – also funktioniert der ganze Weg Host → Nginx (TLS) → Javalin.', '1. Die 2 Zertifikat-Dateien sind da. 2. /health antwortet mit OK über HTTPS. Also geht der ganze Weg.'] },
    profi: 'Teste ohne Browser: <code>curl -v https://127.0.0.1:8443/</code> (Windows: <code>curl.exe -v …</code>) zeigt TLS-Version, Zertifikat und Antwort. <code>docker compose logs -f nginx</code> zeigt jede Anfrage im Access-Log. Welche Zeile erscheint, wenn du <code>/health</code> aufrufst – und welche, wenn du <code>/gibtsnicht</code> aufrufst?',
    begriffe: ['Healthcheck', 'HTTPS']
  },
  /* ---------------------------------------------------------------- 8 */
  {
    titel: 'Typische Fehlerbilder beheben',
    kurz: ['Fehlermeldung lesen, Ursache finden, gezielt beheben.', 'Fehler lesen. Ursache finden. Beheben.'],
    warum: [
      'Fehler gehören dazu. Lies die Meldung genau und ordne sie einer Ebene zu: Zertifikat, Proxy, Port oder Dateisystem. Überlege bei jeder Karte erst selbst, dann deckst du die Ursache auf.',
      'Fehler sind normal. Lies die Meldung genau. Überlege zuerst selbst. Dann deckst du die Lösung auf.'
    ],
    szene: { typ: 'fehler', titel: ['Fehler-Tickets', 'Fehler-Tickets'], karten: [
      { symptom: 'ERR_CERT_AUTHORITY_INVALID', bild: '⚠️', t: ['Der Browser zeigt eine Zertifikatswarnung.', 'Der Browser warnt vor dem Zertifikat.'],
        ursache: { linux: ['Die Root-CA steckt nicht im Vertrauensspeicher des Systems, auf dem der <b>Browser</b> läuft. Typisch: Docker läuft in WSL2, getestet wird im Windows-Browser – Windows kennt die WSL-CA nicht.', 'Der Browser kennt die CA nicht. Oft: Docker läuft in WSL2, der Browser in Windows.'],
                   windows: ['<code>mkcert -install</code> lief nicht auf diesem Windows-Benutzer, oder der Browser wurde danach nicht neu gestartet.', 'mkcert -install fehlt. Oder der Browser wurde nicht neu gestartet.'] },
        loesung: { linux: 'cp "$(mkcert -CAROOT)/rootCA.pem" /mnt/c/Users/Public/mkcert-wsl-rootCA.pem\n# danach in Windows:\ncertutil -user -addstore Root C:\\Users\\Public\\mkcert-wsl-rootCA.pem', windows: 'mkcert -install' },
        nachher: ['Browser danach <b>komplett</b> schließen und neu starten.', 'Danach den Browser ganz schließen und neu öffnen.'] },
      { symptom: '502 Bad Gateway', bild: '🧱', t: ['Das Schloss ist da, aber Nginx meldet 502.', 'Das Schloss ist da. Aber Nginx zeigt 502.'],
        ursache: ['Nginx läuft, erreicht Javalin aber nicht: Javalin ist abgestürzt oder bindet an localhost, <code>proxy_pass</code> zeigt auf localhost – oder Javalin wurde neu gebaut, während Nginx weiterlief (Nginx kennt noch die alte IP).', 'Nginx erreicht Javalin nicht. Vielleicht ist Javalin abgestürzt. Oder Javalin ist neu, aber Nginx kennt noch die alte Adresse.'],
        loesung: { linux: 'docker compose logs --tail 50 javalin nginx\ndocker compose restart nginx', windows: 'docker compose logs --tail 50 javalin nginx\ndocker compose restart nginx' },
        nachher: ['Erst die Logs lesen, dann gezielt handeln.', 'Lies zuerst die Logs.'] },
      { symptom: 'port is already allocated', bild: '🚧', t: ['Beim Start: Bind for 127.0.0.1:8443 failed.', 'Beim Start: Port 8443 ist schon belegt.'],
        ursache: ['Ein anderer Dienst nutzt Port 8443 schon. Ändere 8443 in <code>compose.yaml</code> und in den Run-Skripten, z. B. auf 9443. Ein neues Zertifikat brauchst du nicht – Zertifikate enthalten keine Ports.', 'Ein anderes Programm hat Port 8443. Nimm einen anderen Port, z. B. 9443. Ändere ihn in compose.yaml und im Run-Skript. Das Zertifikat bleibt gleich.'],
        loesung: { linux: 'ss -ltnp | grep 8443', windows: 'netstat -ano | findstr :8443' },
        nachher: ['Der Befehl zeigt, wer den Port belegt (Ergänzung zur Anleitung).', 'Der Befehl zeigt, wer den Port hat.'] },
      { symptom: 'Zertifikat fehlt!', bild: '📭', t: ['Das Run- oder Create-Skript bricht sofort ab.', 'Das Skript bricht sofort ab.'],
        ursache: ['Schritt 4 wurde nicht im Projektordner ausgeführt – <code>certs/localhost.pem</code> oder <code>localhost-key.pem</code> fehlen bzw. liegen woanders.', 'Die Zertifikate sind nicht im Ordner certs/. Mach Schritt 4 im Projektordner.'],
        loesung: { linux: 'ls -la certs', windows: 'dir certs' },
        nachher: ['Fehlen die Dateien, Schritt 4 im Ordner local-https-demo/ wiederholen.', 'Fehlt etwas? Dann Schritt 4 noch einmal.'] },
      { symptom: 'Netzlaufwerk (U:)', bild: '🗂️', nur: 'windows', t: ['Docker Desktop kann die Volumes nicht einbinden.', 'Docker kann die Dateien nicht einbinden.'],
        ursache: [R`Docker Desktop kann Bind Mounts von Netzlaufwerken oft nicht einbinden. Kopiere das Projekt lokal nach <code>C:\temp\</code> und starte dort neu.`, R`Docker kann nicht auf das Netzlaufwerk. Kopiere das Projekt nach <code>C:\temp\</code>.`],
        loesung: { cmd: R`xcopy /E /I U:\local-https-demo C:\temp\local-https-demo`, ps: R`Copy-Item -Recurse U:\local-https-demo C:\temp\local-https-demo` },
        nachher: ['Pfad an deinen Ordner anpassen (Befehl ist eine Ergänzung zur Anleitung).', 'Pass den Pfad an deinen Ordner an.'] },
      { symptom: 'set: pipefail: Ungültiger Optionsname', bild: '↩️', nur: 'linux', t: ['Ein .sh-Skript bricht in Ubuntu sofort ab.', 'Ein .sh-Skript startet nicht.'],
        ursache: ['Die Skripte wurden unter Windows gespeichert und haben Windows-Zeilenenden (CRLF). Die Bash liest dann <code>pipefail\\r</code>.', 'Das Skript kommt aus Windows. Es hat falsche Zeilenenden.'],
        loesung: { linux: "sed -i 's/\\r$//' scripts/ubuntu/*.sh" },
        nachher: ['Entfernt das <code>\\r</code> am Zeilenende aller Skripte.', 'Der Befehl repariert die Zeilenenden.'] }
    ] },
    bloecke: [],
    kontrolle: { alle: [['Ich habe jede Karte erst selbst durchdacht und dann aufgedeckt.', 'Ich habe jede Karte zuerst selbst überlegt.'], ['Ich kann zu jedem Fehlerbild sagen, auf welcher Ebene der Fehler liegt.', 'Ich weiß bei jedem Fehler: Wo liegt das Problem?']] },
    mitdenken: { frage: ['Nach einem Neubau von Javalin zeigt der Browser 502. Warum hilft docker compose restart nginx?', 'Nach einem Neubau kommt 502. Warum hilft ein Neustart von Nginx?'],
      satz: 'Nginx merkt sich beim Start …',
      muster: ['Nginx löst den Namen javalin beim Start einmal auf und merkt sich die IP. Der neue Javalin-Container kann eine andere IP haben. Beim Neustart fragt Nginx den Namen neu ab.', 'Nginx merkt sich beim Start die Adresse von Javalin. Der neue Container hat vielleicht eine neue Adresse. Nach dem Neustart kennt Nginx die neue Adresse.'] },
    profi: 'Damit Nginx den Namen bei jeder Anfrage neu auflöst, nutzt man den Docker-DNS (<code>127.0.0.11</code>) und eine Variable: <code>resolver 127.0.0.11 valid=10s;</code> und <code>set $backend http://javalin:8080;</code> mit <code>proxy_pass $backend;</code>. Probiere es aus: Funktioniert der Neubau jetzt ohne Neustart von Nginx?',
    begriffe: ['Service-Name', 'Vertrauensspeicher', 'Port-Mapping']
  }
  ],

  /* Optionaler Schritt 0 – nur sichtbar, wenn „Noch kein WSL2“ zugeschaltet ist. Zählt nicht zum Abschluss. */
  wsl: {
    titel: 'WSL2 einrichten (optional)',
    kurz: { linux: ['Windows bekommt ein echtes Ubuntu – mit Docker darin.', 'Windows bekommt ein Ubuntu. Darin läuft Docker.'],
            windows: ['Docker Desktop braucht WSL2 als Unterbau.', 'Docker Desktop braucht WSL2.'] },
    warum: {
      linux: ['Du arbeitest an einem Windows-Rechner, willst aber den Linux-Pfad (Bash-Skripte) gehen. Dafür gibt es <b>WSL2</b>, das Windows-Subsystem für Linux: ein echtes Ubuntu in einer leichten virtuellen Maschine. Darin installierst du Docker, mkcert und curl – danach funktionieren alle Linux-Befehle aus dem Lernpfad. Einmal einrichten genügt.', 'Dein Rechner hat Windows. Du willst aber mit Linux arbeiten. Dafür gibt es <b>WSL2</b>. Damit läuft ein echtes Ubuntu in Windows. In Ubuntu installierst du Docker. Das machst du nur einmal.'],
      windows: ['Docker Desktop führt Linux-Container unter Windows in einer leichten virtuellen Maschine aus – dem <b>WSL2</b>-Unterbau. Fehlt WSL2, startet Docker Desktop nicht oder fordert dich zur Installation auf. Einmal einrichten genügt; danach arbeitest du normal in CMD oder PowerShell weiter.', 'Docker Desktop braucht <b>WSL2</b>. Ohne WSL2 startet Docker Desktop nicht. Du richtest WSL2 einmal ein. Danach arbeitest du normal in CMD oder PowerShell.']
    },
    szene: { typ: 'ablauf', titel: ['Was steckt hinter WSL2?', 'Was ist WSL2?'],
      knoten: [
        { id: 'win', icon: '🪟', name: 'Windows', sub: 'dein Rechner' },
        { id: 'vm', icon: '🧩', name: 'WSL2', sub: 'leichte VM mit Linux-Kernel' },
        { id: 'ubu', icon: '🐧', name: 'Ubuntu', sub: 'Bash, apt, deine Dateien', nur: 'linux' },
        { id: 'dd', icon: '🐳', name: 'Docker Desktop', sub: 'nutzt WSL2', nur: 'windows' },
        { id: 'dock', icon: '📦', name: 'Container', sub: 'Nginx + Javalin' }
      ],
      schritte: [
        { an: ['win', 'vm'], zeile: ['wsl-install', 'wsl --install'], t: ['<code>wsl --install</code> schaltet die nötigen Windows-Funktionen ein und lädt einen echten Linux-Kernel. WSL2 ist eine leichte virtuelle Maschine – deshalb muss die Virtualisierung im BIOS/UEFI aktiv sein.', '<code>wsl --install</code> richtet WSL2 ein. WSL2 ist ein kleiner virtueller Rechner. Dafür muss Virtualisierung an sein.'] },
        { an: ['vm', 'ubu'], nur: 'linux', t: ['Gleichzeitig wird <b>Ubuntu</b> installiert. Beim ersten Start legst du einen Linux-Benutzer mit Passwort an – unabhängig von deinem Windows-Konto.', 'Dazu kommt <b>Ubuntu</b>. Beim 1. Start legst du einen Benutzer und ein Passwort an.'] },
        { an: ['ubu', 'dock'], nur: 'linux', zeile: ['docker-install', 'get.docker.com'], t: ['In Ubuntu installierst du Docker Engine mit Compose-Plugin. Die Container laufen dann direkt in deinem Ubuntu.', 'In Ubuntu installierst du Docker. Die Container laufen dann in Ubuntu.'] },
        { an: ['vm', 'dd'], nur: 'windows', t: ['Docker Desktop richtet in WSL2 eine eigene kleine Linux-Umgebung ein (<code>docker-desktop</code>) – du musst dort nichts selbst tun.', 'Docker Desktop richtet sich in WSL2 selbst ein. Du musst nichts tun.'] },
        { an: ['dd', 'dock'], nur: 'windows', t: ['Deine <code>docker</code>-Befehle in CMD oder PowerShell gehen an Docker Desktop, die Container laufen in WSL2.', 'Du tippst <code>docker</code> in CMD oder PowerShell. Die Container laufen in WSL2.'] },
        { an: ['win', 'dock'], t: ['WSL2 leitet Ports an Windows weiter: <code>https://127.0.0.1:8443</code> funktioniert auch im Windows-Browser.', 'Der Windows-Browser erreicht <code>https://127.0.0.1:8443</code>.'] }
      ]
    },
    bloecke: [
      { typ: 'text', t: ['<b>Voraussetzungen:</b> Windows 11 oder Windows 10 ab Version 2004, Administratorrechte, Virtualisierung im BIOS/UEFI eingeschaltet (im Task-Manager unter Leistung → CPU: „Virtualisierung: Aktiviert“). Auf Schulrechnern fehlen oft die Adminrechte – dann hilft die Systembetreuung.', '<b>Du brauchst:</b> Windows 10 oder 11. Admin-Rechte. Virtualisierung muss an sein. Das siehst du im Task-Manager unter Leistung → CPU. Auf Schulrechnern fragst du die Systembetreuung.'] },
      { typ: 'befehl', id: 'wsl-install', shell: 'PowerShell als Administrator', titel: ['1) WSL2 installieren', '1) WSL2 installieren'],
        code: { linux: 'wsl --install', windows: 'wsl --install' },
        erkl: [['wsl --install', 'Startmenü → „PowerShell“ → Rechtsklick → <b>Als Administrator ausführen</b>. Der Befehl schaltet WSL und die Plattform für virtuelle Computer ein und installiert Ubuntu. Danach <b>Windows neu starten</b>.']] },
      { typ: 'text', nur: 'linux', t: ['Nach dem Neustart öffnet sich Ubuntu (sonst: Startmenü → „Ubuntu“). Lege einen <b>Linux-Benutzernamen</b> (klein, ohne Leerzeichen) und ein <b>Passwort</b> an. Beim Tippen des Passworts erscheinen keine Zeichen – das ist normal. Du brauchst es später für <code>sudo</code>.', 'Nach dem Neustart öffnet sich Ubuntu. Lege einen Benutzernamen und ein Passwort an. Beim Passwort siehst du keine Zeichen. Das ist normal. Merke dir das Passwort.'] },
      { typ: 'befehl', shell: 'PowerShell', titel: ['2) Prüfen: läuft WSL in Version 2?', '2) Prüfen: Version 2?'],
        code: { linux: 'wsl --update\nwsl -l -v', windows: 'wsl --update\nwsl -l -v' },
        erkl: [['wsl --update', 'Holt die aktuelle WSL-Version.'],
               ['wsl -l -v', 'Listet alle Linux-Umgebungen. In der Spalte VERSION muss <b>2</b> stehen. Steht dort 1: <code>wsl --set-version Ubuntu 2</code>.']] },
      { typ: 'befehl', nur: 'linux', id: 'docker-install', titel: ['3) Im Ubuntu-Terminal: Docker installieren', '3) In Ubuntu: Docker installieren'],
        code: { linux: R`grep -q "systemd=true" /etc/wsl.conf 2>/dev/null || printf '\n[boot]\nsystemd=true\n' | sudo tee -a /etc/wsl.conf
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER` },
        erkl: [['grep -q "systemd=true"', 'Docker braucht <b>systemd</b>. Ist es in <code>/etc/wsl.conf</code> noch nicht eingeschaltet, wird es ergänzt. Danach einmal in PowerShell <code>wsl --shutdown</code> und Ubuntu neu öffnen.'],
               ['sudo apt update', 'Paketlisten aktualisieren und installierte Pakete auf den neuesten Stand bringen.'],
               ['get.docker.com', 'Offizielles Installationsskript von Docker: Docker Engine und Compose-Plugin aus der Docker-Paketquelle.'],
               ['usermod -aG docker', 'Dein Benutzer kommt in die Gruppe <code>docker</code> – dann geht <code>docker</code> ohne <code>sudo</code>. Wirkt erst nach Ab- und Anmelden: Ubuntu-Fenster schließen und neu öffnen.']] },
      { typ: 'text', nur: 'linux', t: ['<b>Alternative:</b> Hast du schon Docker Desktop unter Windows, installiere Docker nicht zusätzlich in Ubuntu. Schalte stattdessen in Docker Desktop unter <i>Settings → Resources → WSL integration</i> „Ubuntu“ ein – dann gibt es den Befehl <code>docker</code> auch im Ubuntu-Terminal.', '<b>Oder:</b> Hast du Docker Desktop schon? Dann schalte dort unter <i>Settings → Resources → WSL integration</i> „Ubuntu“ ein. Installiere Docker nicht noch einmal.'] },
      { typ: 'befehl', nur: 'linux', titel: ['4) Projektordner im Linux-Dateisystem', '4) Projektordner in Ubuntu'],
        code: { linux: 'cd ~\nexplorer.exe .' },
        erkl: [['cd ~', 'Arbeite im Linux-Home (<code>~</code>), <b>nicht</b> unter <code>/mnt/c/…</code>: Dort ist Docker langsamer, <code>chmod +x</code> wirkt nicht zuverlässig und Windows-Editoren hinterlassen schnell CRLF-Zeilenenden.'],
               ['explorer.exe .', 'Öffnet den aktuellen Ubuntu-Ordner im Windows-Explorer (Pfad <code>\\\\wsl$\\Ubuntu\\home\\…</code>). In VS Code: <code>code .</code> mit der Erweiterung „WSL“.']] },
      { typ: 'befehl', nur: 'windows', titel: ['3) Docker Desktop installieren', '3) Docker Desktop installieren'],
        code: { windows: 'winget install Docker.DockerDesktop' },
        erkl: [['winget install', 'Installiert Docker Desktop (oder von docker.com herunterladen). Beim Einrichten „Use WSL 2 instead of Hyper-V“ bzw. „Use the WSL 2 based engine“ angehakt lassen. Danach ab- und wieder anmelden und Docker Desktop starten.']] }
    ],
    kontrolle: {
      alle: [['wsl -l -v zeigt mindestens eine Linux-Umgebung mit VERSION 2.', 'wsl -l -v zeigt VERSION 2.']],
      linux: [['Ich kann mich in Ubuntu anmelden und kenne mein Linux-Passwort.', 'Ubuntu startet. Ich kenne mein Passwort.'], ['docker version im Ubuntu-Terminal zeigt Client und Server.', 'docker version in Ubuntu zeigt Client und Server.'], ['Mein Projekt liegt im Linux-Home (~), nicht unter /mnt/c.', 'Mein Projekt liegt in ~, nicht in /mnt/c.']],
      windows: [['Docker Desktop startet und zeigt „Engine running“.', 'Docker Desktop läuft („Engine running“).']]
    },
    mitdenken: {
      frage: { linux: ['Warum legst du das Projekt in ~ und nicht unter /mnt/c?', 'Warum kommt das Projekt in ~ und nicht in /mnt/c?'], windows: ['Warum braucht Docker Desktop unter Windows überhaupt Linux?', 'Warum braucht Docker Desktop Linux?'] },
      satz: 'Das liegt daran, dass …',
      muster: { linux: ['/mnt/c ist das Windows-Laufwerk, über eine Brücke eingebunden: Zugriffe sind langsamer, Linux-Rechte (chmod +x) funktionieren nicht zuverlässig und Windows-Editoren erzeugen CRLF-Zeilenenden. Im Linux-Home gibt es diese Probleme nicht.', '/mnt/c ist Windows. Dort ist Docker langsam. chmod +x geht dort nicht richtig. In ~ gibt es diese Probleme nicht.'],
                windows: ['Linux-Container nutzen den Kernel des Gastsystems, und das muss ein Linux-Kernel sein. Windows hat keinen – WSL2 liefert ihn in einer leichten VM.', 'Container brauchen einen Linux-Kernel. Windows hat keinen. WSL2 bringt einen mit.'] }
    },
    profi: 'Typische Stolpersteine: <code>0x80370102</code> beim Start → Virtualisierung im BIOS/UEFI einschalten. <code>wsl --shutdown</code> beendet alle Linux-Umgebungen (hilft nach Änderungen an <code>/etc/wsl.conf</code>). Speicher und CPU für WSL2 begrenzt du in <code>%UserProfile%\\.wslconfig</code> (Abschnitt <code>[wsl2]</code>, z. B. <code>memory=4GB</code>).<br><b>Knobelfrage:</b> Warum erreicht der Windows-Browser einen Dienst in WSL2 über <code>127.0.0.1</code>, obwohl WSL2 eine eigene virtuelle Maschine mit eigener IP ist?',
    begriffe: ['WSL2', 'Virtualisierung', 'systemd']
  },

  links: [
    ['Javalin: Maven-Projekt einrichten', 'https://javalin.io/tutorials/maven-setup'],
    ['mkcert: Installation und lokaler Vertrauensspeicher', 'https://github.com/FiloSottile/mkcert'],
    ['Docker Compose: Startreihenfolge und Healthchecks', 'https://docs.docker.com/compose/how-tos/startup-order/'],
    ['Nginx: HTTPS-Server konfigurieren', 'https://nginx.org/en/docs/http/configuring_https_servers.html']
  ]
};
