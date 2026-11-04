# Drehbuch: Serverraum 0 – Docker-Einführung vom ersten Container zur eigenen Foto-Cloud

Paket-ID `lf9-docker-einfuehrung` · Spielmodus `PAKET.spielwelt` · verzahnt mit der Mini-Docker-Schulung (VM)

> Alle Firmen, Personen und Daten sind erfunden. Befehle, Ausgaben und Fehlermeldungen sind echte Docker-Befehle und -Meldungen, im Spiel vereinfacht (z. B. gekürzte IDs). Bitte fachlich prüfen: Wortlaut der Fehlermeldungen in Raum 4/5 gegen die Docker-Version der VM.

## Leitsituation, Figuren und Welt

- **Betrieb / Situation:** Du bist Azubi bei **Hafenblick IT-Service**, einem kleinen IT-Dienstleister. Kunde ist der Sportverein **TSV Lechwiesen**. Der Verein will seine Fotos von Turnieren und Ausflügen nicht mehr bei einem großen Cloud-Anbieter speichern. Er möchte eine eigene Foto-Cloud auf dem Vereinsserver (Immich). Der Server steht im Keller des Vereinsheims, im „Serverraum 0“.
- **Figuren:**
  - **Jana Petrov**, Ausbilderin bei Hafenblick. Ton: freundlich, direkt, „du“. Aussehen: mittellange dunkle Haare, Zopf, Brille, Hoodie mit Wal-Logo, mittlerer Hautton.
  - **Tomás Reiter**, Vorsitzender des TSV. Schreibt die Support-Tickets (🚀 Profi). Ton: höflich, ungeduldig, kein Technikwissen. Aussehen: kurze graue Haare, Vereinstrainingsjacke, heller Hautton.
  - **Kai**, der Hausmeister des Vereinsheims. Er hat die Tür zum Serverraum zugemacht: „Die Tür geht erst auf, wenn die Fotos laufen.“ Aussehen: Glatze, Vollbart, Latzhose, dunkler Hautton.
- **Einstiegstext (Jana):** „Willkommen im Serverraum 0! Der TSV Lechwiesen will eine eigene Foto-Cloud. Bevor wir die echte Anlage in der VM aufbauen, übst du hier im Terminal. Jeder Raum ist ein Schritt. Am Ende läuft die Foto-Cloud, und Kai macht die Tür auf.“
  - *Einfach:* „Willkommen im Serverraum 0! Der Sportverein TSV Lechwiesen will eine eigene Foto-Cloud. Du übst hier zuerst im Terminal. Danach baust du alles in der VM. Jeder Raum ist ein Schritt. Am Ende läuft die Foto-Cloud. Dann geht die Tür auf.“
- **Welt:** Thema `technik` · Kulisse `serverraum` · Symbol 🐳
- **Arbeitsmittel aus dem Beruf** (als Szene nachgebaut): simuliertes Linux-Terminal mit Zustand (Images, Container, Ports, Volumes, Netzwerk), Datei-Editor für `Dockerfile`, `docker-compose.yml` und `.env`, Spiel-Browser mit Adresszeile (`localhost:<port>`), Adminer-Anmeldemaske, Ticket-Postfach (Baustein `mail`).
- **Spielidee:** Spielmodus „Serverraum 0“ (Stationen = Räume/Level), kombiniert mit Support-Tickets (Profi und Nachweis). Siehe `spielidee.md`.

### Die Spielbühne

Links (etwa 60 %) das **Terminal** mit Eingabezeile. Rechts oben ein umschaltbares Fenster: **Editor** oder **Browser**. Rechts unten der **Zustand des Servers**. Dort steht als kleine Karte jedes Image (Bauplan-Symbol 📄), jeder Container (🐳, grün = läuft, grau = beendet) mit Port-Schild (`8080 → 80`) und jedes Volume (🗄️). Diese Ansicht macht das Unsichtbare sichtbar: Die Lernenden sehen bei jedem Befehl, was er am Server verändert. Über der Bühne steht die Tür von Serverraum 0 mit fünf Schlössern (eines je Raum).

- ⛰️ **Basis:** Unter dem Terminal liegt eine **Befehlsleiste mit Bausteinen** (`docker` · `run` · `ps` · `-a` · `-p` · `8080:80` · `--name` …). Antippen setzt den Befehl zusammen, Tippen geht trotzdem. Jede Fehlermeldung hat einen Knopf „Was heißt das?“.
- 🚀 **Profi:** Freies Tippen, kein Baustein, „Was heißt das?“ erst nach zwei Fehlversuchen. Je Raum ein zusätzliches **Ticket** von Tomás im Postfach.
- **Regelbuch** (Symbol 📘 oben rechts): die Merksätze der bisher geschafften Räume, mit Beispielbefehl. Im Nachweis gesperrt.
- **Einstufung** vor Raum 1: zwei kurze Aufgaben im Terminal („Zeige den Inhalt des aktuellen Ordners“ → `ls`; „Wechsle in den Ordner `uebung`“ → `cd uebung`) und die Frage „Hast du schon mal mit Docker gearbeitet?“ Beide Aufgaben ohne Hilfe gelöst und „ja“ → Vorschlag 🚀 Profi, sonst ⛰️ Basis. Wechsel jederzeit über den Schalter im Kopf.

## Einstieg

- Ablauf und Dauer (automatisch). Hinweis: „Nach jedem Raum gehst du in die VM und machst die passende Übung. Danach kommst du zurück.“
- Lernziele LZ1–LZ6 mit Selbsteinschätzung (automatisch)
- **Vorwissens-Check** (je Lernziel eine Frage, zählt nicht):
  - LZ1: „`docker ps` zeigt nichts an. Gibt es trotzdem Container?“ (ja, beendete – `docker ps -a`)
  - LZ2: „Du änderst eine Datei, die per `COPY` im Image steckt. Was musst du tun?“ (neu bauen, Container neu erstellen)
  - LZ3: „Was bedeutet `-p 8081:80`?“ (Host-Port 8081 → Container-Port 80)
  - LZ4: „Du startest einen Container ohne Volume, legst eine Datei an und löschst den Container. Ist die Datei noch da?“ (nein)
  - LZ5: „Wie heißt in Compose der Server, wenn Adminer die Datenbank `db` erreichen soll?“ (`db`)
  - LZ6: „Was hilft bei `port is already allocated`?“ (anderer Host-Port oder alten Container stoppen)
  - Empfehlung: Wer eine Frage richtig hat, darf den Raum als „Schnelldurchlauf“ spielen (nur die Fälle ab Fall 4). Die VM-Übung bleibt für alle.

## Glossar

Englische Fachbegriffe bleiben englisch. Bei vielen Lernenden mit DaZ gibt es zu jedem Begriff ein kleines Symbol aus der Spielbühne.

| Begriff (mit Artikel und Plural) | Erklärung Standard | Erklärung Einfach | vorab vorstellen? |
|---|---|---|---|
| das Image, die Images 📄 | Unveränderlicher Bauplan für Container: enthält Programm, Bibliotheken und Einstellungen. Wird aus einer Registry geladen oder mit `docker build` gebaut. | Ein Bauplan. Aus dem Bauplan macht Docker Container. Den Bauplan kann man nicht ändern. | ☑ |
| der Container, die Container 🐳 | Laufende (oder beendete) Instanz eines Images mit eigenem Dateisystem, Prozess und Netzwerk. Aus einem Image entstehen beliebig viele Container. | Ein Programm, das aus einem Image läuft. Aus einem Image kann man viele Container machen. | ☑ |
| die Registry, die Registrys | Online-Lager für Images, z. B. Docker Hub oder ghcr.io. `docker pull` lädt von dort. | Ein Lager im Internet für Images. | ☐ |
| das Dockerfile, die Dockerfiles | Textdatei mit Bauanleitung für ein eigenes Image (`FROM`, `COPY`, `EXPOSE`, `CMD`). | Eine Datei mit der Anleitung für ein eigenes Image. | ☐ |
| der Port, die Ports | Nummer, unter der ein Dienst im Netzwerk erreichbar ist, z. B. 80 für einen Webserver. | Eine Nummer. Unter dieser Nummer erreicht man ein Programm. | ☐ |
| das Port-Mapping, die Port-Mappings | Weiterleitung von einem Port des Hosts zu einem Port im Container: `-p Host:Container`. | Eine Weiterleitung. Links steht der Port vom Rechner. Rechts steht der Port im Container. | ☑ |
| der Host, die Hosts | Der Rechner, auf dem Docker läuft (hier: die VM). | Der Rechner, auf dem Docker läuft. | ☐ |
| das Volume, die Volumes 🗄️ | Von Docker verwalteter Speicher, der Container überlebt. In Compose nur mit Namen angegeben (`pgdata:/var/lib/...`). | Ein Speicher von Docker. Die Daten bleiben, auch wenn der Container weg ist. | ☑ |
| der Bind Mount, die Bind Mounts 📁 | Ein Ordner des Hosts, der in den Container eingeblendet wird. Links steht ein Pfad (`./library:/data`). | Ein Ordner von deinem Rechner. Der Container kann ihn benutzen. Du siehst die Dateien auch auf dem Rechner. | ☐ |
| ephemer | Flüchtig: Was nur im Container gespeichert ist, ist weg, wenn der Container gelöscht wird. | Nicht dauerhaft. Die Daten sind weg, wenn der Container weg ist. | ☐ |
| Docker Compose | Werkzeug, das mehrere Container aus einer Datei (`docker-compose.yml`) gemeinsam startet und verbindet. | Ein Werkzeug. Es startet mehrere Container mit einer Datei. | ☑ |
| der Service, die Services | Ein Dienst in der Compose-Datei, z. B. `db` oder `web`. Sein Name ist im Compose-Netz zugleich der Hostname. | Ein Dienst in der Compose-Datei. Der Name ist auch die Adresse für die anderen Dienste. | ☐ |
| der Healthcheck, die Healthchecks | Regelmäßiger Test, ob ein Container wirklich bereit ist („healthy“). | Ein Test: Ist der Container bereit? | ☐ |
| die .env-Datei, die .env-Dateien | Datei mit Variablen (`DB_PASSWORD=…`), die Compose automatisch einliest. | Eine Datei mit Einstellungen, zum Beispiel einem Passwort. Compose liest sie selbst. | ☐ |
| der Layer, die Layer | Schicht eines Images; unveränderte Schichten kommen beim nächsten Build aus dem Cache. | Eine Schicht im Image. Docker merkt sich Schichten. Darum geht das zweite Bauen schneller. | ☐ |

## ① Entdecken – Level

Jedes Level gleich gerahmt: Jana sagt den Auftrag (1–2 Sätze) → Jana spielt den ersten Fall vor („Zeig’s mir“, überspringbar) → Fälle → Schloss geht auf → Zwischenbilanz → **„Jetzt in echt: Übung X in der VM“** mit Link auf die Übung und dem Hinweis, danach zurückzukommen.

**Geschafft, wenn** in allen Räumen gleich: alle Fälle gelöst. Ein Fall darf beliebig oft versucht werden. Ab drei Fehlversuchen im selben Fall bietet Jana an, ihn vorzumachen. Das Level startet nicht neu, damit Terminal-Neulinge nicht entmutigt werden. Mit „Server zurücksetzen“ lässt sich der Raum jederzeit neu beginnen.

### Raum 1: Hallo, Container! (LZ1) → VM: Übung 1 hello-world

- **Auftrag (Jana):** „Bevor wir den Verein beglücken: Starte deinen ersten Container und finde heraus, wo er geblieben ist.“
  - *Einfach:* „Starte deinen ersten Container. Finde dann heraus: Wo ist der Container jetzt?“
- **Neue Regeln (Regelbuch):**
  1. Ein **Image** ist der Bauplan, ein **Container** ist das, was daraus läuft. (Wie Klasse und Objekt.)
  2. Jedes `docker run` baut aus dem Image einen **neuen** Container.
  3. `docker ps` zeigt nur laufende Container, `docker ps -a` zeigt alle.
  4. Fehlt ein Image, lädt `docker run` es aus der Registry. Beim zweiten Mal liegt es schon da.
- **Geführter erster Fall (Jana tippt vor):** `docker run hello-world`.
  1. Terminal zeigt `Unable to find image 'hello-world:latest' locally` und `Pulling from library/hello-world`. Das Image-Kärtchen 📄 erscheint im Zustand. *Warum: Das Image war noch nicht auf dem Host. Docker holt es aus der Registry.*
  2. Begrüßungstext, dann erscheint ein grauer Container 🐳 („Exited“). *Warum: hello-world schreibt nur einen Text und beendet sich dann.*
  3. `docker ps` → leer. `docker ps -a` → ein Container. *Warum: `ps` zeigt nur laufende Container.*
  - **Frage zum Selbsterklären** (an Schritt 3): „Warum ist die Liste bei `docker ps` leer, obwohl Docker den Container gerade gestartet hat?“ Satzanfang (Einfach): „Die Liste ist leer, weil der Container …“
- **Fälle:**

| Fall | richtige Lösung | typischer Fehler | Folge im Spiel und erklärender Satz |
|---|---|---|---|
| 1 Starte `hello-world` ein zweites Mal. Wie viele Images, wie viele Container? | `docker run hello-world` → Antwort: 1 Image, 2 Container | „1 Container, er wurde neu gestartet“ | Im Zustand stehen zwei graue 🐳. „Jedes `run` macht einen neuen Container aus demselben Image.“ |
| 2 Warum ging der zweite Start schneller? (Auswahl) | Image lag schon lokal | „Der Container lief noch“ | Jana zeigt die fehlende `Pulling`-Zeile. „Beim zweiten Mal muss Docker nichts herunterladen.“ |
| 3 Starte zwei Container mit Namen `hallo1` und `hallo2`. | `docker run --name hallo1 hello-world`, dann `hallo2` | gleicher Name zweimal | Echte Meldung `Conflict. The container name "/hallo1" is already in use`. „Ein Name gehört genau einem Container.“ |
| 4 Zeige alle Images. | `docker images` | `docker ps` | Liste der Container statt Images. „`ps` zeigt Container. Images zeigt `docker images`.“ |
| 5 Finde alle Container, auch beendete. | `docker ps -a` | `docker ps` | Leere Liste. „Beendete Container siehst du nur mit `-a`.“ |
| 6 Räume auf: Lösche `hallo1` und `hallo2`. | `docker rm hallo1 hallo2` | `docker rmi hello-world` | `conflict: unable to remove repository reference … container … is using its referenced image`. „Erst die Container löschen, dann das Image. `rmi` löscht Images, `rm` Container.“ |
| 7 Ordne zu: Klasse ↔ Image, Objekt ↔ Container (im Zustand ziehen) | Image = Klasse, Container = Objekt | umgekehrt | Der Container-Stapel „wächst“ aus dem Bauplan. „Aus einer Klasse entstehen viele Objekte – aus einem Image viele Container.“ |

- **🚀 Ticket R1 (Tomás):** „Mein Neffe hat gesagt, ich soll `docker ps` eingeben. Da steht nichts. Ist der Server kaputt?“ → Lernende schauen mit `docker ps -a` nach und wählen die Antwort: „Nein, die Container sind beendet, nicht weg.“ Falsche Wahl („Docker neu installieren“) → Folgeticket: „Jetzt ist alles weg?!“ (Docker bleibt, aber Tomás ist verunsichert, Jana erklärt).
- **Zwischenbilanz:**
  - Kurz-Check (zählt nicht): `r1-k1` Ausgabe `docker ps -a` deuten (Anzahl Container), `r1-k2` Image vs. Container zuordnen, `r1-k3` welcher Befehl zeigt beendete Container.
  - Mitdenken: „Erkläre einer Mitschülerin in zwei Sätzen den Unterschied zwischen Image und Container. Benutze ein Beispiel aus der Programmierung.“ Muster: „Ein Image ist wie eine Klasse: ein fester Bauplan. Ein Container ist wie ein Objekt: Aus einem Image kann ich mit `docker run` beliebig viele Container erzeugen.“
- **Wozu brauchst du das?** „Im Betrieb laufen auf einem Server oft Dutzende Container. Wer `ps` und `ps -a` verwechselt, sucht Fehler an der falschen Stelle.“
- **Ins Lernheft:** die eigene Antwort auf die Selbsterklär-Frage, der eigene Mitdenken-Text, die Ausgabe von `docker ps -a` aus Fall 1.

### Raum 2: Die Vereinsseite (LZ2, LZ3) → VM: Übung 2 Steckbrief-Webserver

- **Auftrag (Jana):** „Der TSV braucht eine Startseite. Bau aus dem Dockerfile ein Image und mach die Seite im Browser erreichbar.“
  - *Einfach:* „Der Verein braucht eine Webseite. Baue aus dem Dockerfile ein Image. Mach die Seite im Browser sichtbar.“
- **Neue Regeln (Regelbuch):**
  1. `docker build -t name .` baut aus dem Dockerfile im aktuellen Ordner ein Image.
  2. Was per `COPY` ins Image kommt, steckt fest im Image. Nach einer Änderung: **neu bauen, alten Container löschen, neu starten.**
  3. `-p 8080:80` heißt: **Host-Port 8080 → Container-Port 80.** Links der Host, rechts der Container.
  4. Ein Host-Port kann nur zu **einem** Container gehören.
- **Szene:** Editor zeigt `Dockerfile` und `index.html` (Vereinsseite mit Wappen und „Willkommen beim TSV Lechwiesen“). Browser rechts mit Adresszeile.
- **Geführter erster Fall** (anderer Fall: Jana baut eine Seite „Hafenblick – Wir sind umgezogen“):
  1. Jana zeigt im Dockerfile `FROM nginx:alpine` und `COPY index.html …`. *Warum: Wir nehmen ein fertiges Webserver-Image und legen unsere Seite hinein.*
  2. `docker build -t umzug .` → Layer-Zeilen, 📄 `umzug` erscheint. *Warum: Aus Bauplan + Datei entsteht ein neues Image.*
  3. `docker run -d -p 9090:80 --name umzug umzug` → grüner 🐳 mit Schild `9090 → 80`. *Warum: `-d` lässt ihn im Hintergrund laufen, `-p` macht ihn von außen erreichbar.*
  4. Browser `http://localhost:9090` → Seite erscheint.
  - **Frage zum Selbsterklären** (an Schritt 3): „Warum steht 80 rechts und nicht links?“ Satzanfang: „80 steht rechts, weil …“
- **Fälle:**

| Fall | richtige Lösung | typischer Fehler | Folge im Spiel und erklärender Satz |
|---|---|---|---|
| 1 Baue das Image `vereinsseite`. | `docker build -t vereinsseite .` | Punkt vergessen | Echte Meldung `"docker buildx build" requires exactly 1 argument`. „Der Punkt sagt: Das Dockerfile liegt hier im Ordner.“ |
| 2 Starte es, erreichbar unter `localhost:8080`. | `docker run -d -p 8080:80 --name tsv vereinsseite` | `-p 80:8080` | Browser: „Verbindung fehlgeschlagen“. Schild zeigt `80 → 8080`, im Container hört nichts auf 8080. „Links Host, rechts Container. nginx hört im Container auf 80.“ |
| 3 Tomás will „Willkommen“ in „Herzlich willkommen“ ändern. Ändere `index.html` und zeige die neue Seite. | Ändern → `docker rm -f tsv` → `docker build …` → `docker run …` | nur Browser neu laden oder `docker restart tsv` | Browser zeigt weiter die alte Seite. „Die Datei steckt im Image. Ohne neuen Build bleibt die alte Version.“ |
| 4 Bringe die Schritte aus Fall 3 in die richtige Reihenfolge (Bausteine). | ändern → löschen → bauen → starten (bauen vor löschen auch richtig) | starten vor bauen | Der neue Container nutzt das alte Image. „`run` nimmt das Image, das gerade da ist.“ |
| 5 Starte eine zweite Kopie für die Jugendabteilung unter `localhost:8081`. | `docker run -d -p 8081:80 --name tsv2 vereinsseite` | `-p 8080:80` | Echte Meldung `Bind for 0.0.0.0:8080 failed: port is already allocated`. „Ein Host-Port gehört nur einem Container.“ |
| 6 Welcher Container antwortet unter `localhost:8081`? (im Zustand antippen) | `tsv2` | `tsv` | Schild-Vergleich wird hervorgehoben. „Die linke Zahl auf dem Schild entscheidet.“ |
| 7 Baue noch einmal ohne Änderung. Warum geht es schneller? | Layer kommen aus dem Cache (`CACHED`) | „Docker hat sich den Container gemerkt“ | Jana markiert `CACHED`. „Unveränderte Schichten baut Docker nicht neu.“ |

- **🚀 Ticket R2:** „Die Seite der Jugend und die der Senioren sollen gleichzeitig laufen. Mein Neffe hat das probiert, jetzt steht da ein Fehler.“ Anhang: Ausgabe `port is already allocated` und der Befehl `docker run -d -p 8080:80 --name senioren vereinsseite`. Lernende markieren die Ursache und korrigieren auf einen freien Host-Port.
- **Zwischenbilanz:** Kurz-Check `r2-k1` `-p 8081:80` deuten (Lücke), `r2-k2` Reihenfolge nach Änderung, `r2-k3` Wiederholung LZ1 (Wie viele Container nach drei `run`?). Mitdenken: „Skizziere mit zwei Kästen (Host, Container) und einem Pfeil, was `-p 8081:80` macht.“ Muster: Kasten Host mit 8081 → Pfeil → Kasten Container mit 80, Browser zeigt auf Host.
- **Wozu brauchst du das?** „So stellt ihr im Betrieb jede Webanwendung bereit. Port-Fehler sind die häufigste Ursache für ‚Die Seite geht nicht‘.“
- **Ins Lernheft:** der eigene `docker run`-Befehl aus Fall 2, die eigene Reihenfolge aus Fall 4, die Skizze bzw. Antwort zur Selbsterklär-Frage.

### Raum 3: Daten, die bleiben (LZ4) → VM: Übung 3 Daten

- **Auftrag (Jana):** „Der Verein will Fotos speichern. Finde heraus, wo Daten einen gelöschten Container überleben.“
  - *Einfach:* „Der Verein will Fotos speichern. Die Fotos dürfen nicht verloren gehen. Finde heraus: Wo bleiben Daten sicher?“
- **Neue Regeln (Regelbuch):**
  1. Container sind **ephemer**: Was nur im Container liegt, ist mit dem Container weg.
  2. **Named Volume:** links nur ein Name (`meine-daten:/daten`). Docker verwaltet den Speicherort. Gut für Datenbanken.
  3. **Bind Mount:** links ein Pfad (`./ordner:/daten`, `/home/…`). Du siehst die Dateien auf dem Host. Gut für Dateien, die du selbst sichern willst, z. B. Fotos.
  4. `:ro` am Ende = nur lesen (read only).
- **Szene:** Terminal + Zustand. Neu: Volume-Kärtchen 🗄️ und ein Host-Ordner 📁 neben dem Zustand. Eine Datei erscheint als Zettel 📝 im Container, im Volume oder im Ordner.
- **Geführter erster Fall** (anderer Fall: Janas Einkaufsliste):
  1. `docker run -it --rm ubuntu:22.04`, `echo "Kaffee" > /liste.txt`, `exit` → Container verschwindet samt Zettel. *Warum: `--rm` löscht den Container beim Beenden, und die Datei lag nur im Container.*
  2. Neuer Start, `cat /liste.txt` → `No such file or directory`.
  3. Mit `-v einkauf:/daten` wiederholen → Zettel landet im 🗄️ `einkauf` und ist beim nächsten Start noch da. *Warum: Das Volume gehört nicht zum Container.*
  - **Frage zum Selbsterklären** (an Schritt 3): „Warum ist der Zettel jetzt noch da, obwohl der Container wieder gelöscht wurde?“
- **Fälle:**

| Fall | richtige Lösung | typischer Fehler | Folge im Spiel und erklärender Satz |
|---|---|---|---|
| 1 Vorhersage: Container ohne Volume, Datei anlegen, Container löschen, neuer Container. Ist die Datei da? | nein | ja | Zettel verschwindet mit dem 🐳. „Daten im Container sind ephemer.“ |
| 2 Lege ein Volume `vereinsdaten` an und speichere `mitglieder.txt` darin, sodass sie bleibt. | `docker volume create vereinsdaten`, `docker run -it --rm -v vereinsdaten:/daten ubuntu:22.04`, Datei in `/daten` | Datei nach `/mitglieder.txt` statt `/daten/…` | Datei ist wieder weg. „Nur was im eingehängten Ordner `/daten` liegt, landet im Volume.“ |
| 3 Binde den Host-Ordner `./fotos` ein und lege `turnier.jpg` an. Prüfe auf dem Host mit `ls fotos`. | `-v "$(pwd)/fotos":/daten` | `-v fotos:/daten` | Docker legt ein **Volume** `fotos` an, `ls fotos` auf dem Host ist leer. „Ohne Pfad links ist es ein Named Volume, kein Ordner.“ |
| 4 Sortiere: `pgdata:/var/lib/postgresql/data`, `./library:/data`, `/home/azubi/bilder:/mnt/import:ro`, `model-cache:/cache` → Volume / Bind Mount | Volume: pgdata, model-cache · Bind: ./library, /home/… | `./library` als Volume | Jana zeigt den Anfang: `./` bzw. `/`. „Pfad = Bind Mount, Name = Volume.“ |
| 5 Was nimmst du für die Datenbank, was für die Vereinsfotos? Begründe (Auswahl + Satz). | DB → Named Volume (App-intern, auch unter Windows sicher); Fotos → Bind Mount (selbst sehen und sichern) | beides Bind Mount | Fall läuft, aber Jana fragt nach: „Musst du die Datenbankdateien selbst anfassen?“ |
| 6 Die alten Fotos des Vereins sollen eingebunden werden, aber Immich darf sie nicht verändern. Ergänze die Zeile. | `/home/tsv/archiv:/mnt/import:ro` | `:rw` oder ohne | Spiel zeigt: Container löscht testweise eine Datei – im Archiv fehlt sie. „Mit `:ro` darf der Container nur lesen.“ |
| 7 Räume auf: Lösche das Volume `vereinsdaten`. | `docker volume rm vereinsdaten` | `docker rm vereinsdaten` | `No such container: vereinsdaten`. „Volumes löscht `docker volume rm`.“ |

- **🚀 Ticket R3:** „Wir haben den Server neu gestartet, und alle Mitgliedslisten sind weg! Hier der Befehl, den wir benutzt haben: `docker run -d --name liste ubuntu …`“ Lernende markieren das fehlende `-v` und schreiben den korrigierten Befehl.
- **Zwischenbilanz:** Kurz-Check `r3-k1` Volume oder Bind Mount (Sortieren), `r3-k2` Bedeutung `:ro`, `r3-k3` Wiederholung LZ3 (`-p` deuten). Mitdenken: „Erkläre Tomás in einfachen Worten, warum seine Listen weg waren und was wir jetzt anders machen.“ Muster: „Die Listen lagen nur im Container. Als der Container gelöscht wurde, waren sie weg. Jetzt speichern wir sie in einem Volume, das bleibt.“
- **Wozu brauchst du das?** „Datenverlust ist der teuerste Fehler bei Servern. Die Wahl des Speichers entscheidet, was ein Update überlebt.“
- **Ins Lernheft:** die eigene Sortierung aus Fall 4, die eigene Begründung aus Fall 5, der Mitdenken-Text.

### Raum 4: Drei Dienste, eine Datei (LZ5, LZ4) → VM: Übung 4 Compose

- **Auftrag (Jana):** „Ab jetzt brauchen wir mehrere Container zusammen. Starte Vereinsseite, Datenbank und Adminer mit einer einzigen Datei.“
  - *Einfach:* „Jetzt brauchen wir mehrere Container. Starte drei Container mit einer Datei: die Webseite, die Datenbank und Adminer.“
- **Neue Regeln (Regelbuch):**
  1. In der `docker-compose.yml` steht jeder Container als **Service**. `docker compose up -d` startet alle, `docker compose ps` zeigt sie.
  2. Im Compose-Netz ist der **Service-Name** die Adresse: Adminer erreicht die Datenbank unter `db`, nicht `localhost`. (`localhost` ist im Container der Container selbst.)
  3. Nur was von außen erreichbar sein muss, bekommt `ports:`. Die Datenbank nicht.
  4. `depends_on` mit `condition: service_healthy` wartet, bis der Healthcheck „healthy“ meldet. Ohne Bedingung: nur „vorher starten“.
  5. `${DB_PASSWORD}` kommt aus der Datei `.env`. Sie muss genau `.env` heißen.
  6. `docker compose down` löscht Container, Volumes bleiben. `down -v` löscht **auch die Volumes**.
- **Szene:** Editor mit `docker-compose.yml` als Lückentext (`???`), daneben `.env.example`. Zustand zeigt die drei Services als verbundene Kärtchen im Netz `uebung_default`. Browser mit Adminer-Anmeldemaske.
- **Geführter erster Fall** (anderer Fall: Hafenblick-Wiki mit `wiki` + `db`): Jana füllt eine kurze Compose-Datei aus.
  1. `image:` und `ports: "8090:3000"` beim Wiki. *Warum: Nur das Wiki muss im Browser erreichbar sein.*
  2. Bei `db` **kein** `ports:`, dafür `volumes: - wikidaten:/var/lib/postgresql/data`. *Warum: Die DB spricht nur mit dem Wiki, über das interne Netz.*
  3. Beim Wiki `DB_HOST: db`. *Warum: Der Service-Name ist der Hostname im Compose-Netz.*
  4. `cp .env.example .env`, `docker compose up -d`, `docker compose ps` → `db` erst `starting`, dann `healthy`, dann startet das Wiki.
  - **Frage zum Selbsterklären** (an Schritt 3): „Warum würde `DB_HOST: localhost` hier nicht funktionieren?“ Satzanfang: „`localhost` meint im Container …“
- **Fälle:**

| Fall | richtige Lösung | typischer Fehler | Folge im Spiel und erklärender Satz |
|---|---|---|---|
| 1 Starte, ohne vorher etwas vorzubereiten. | – (Fehler ist gewollt) → `cp .env.example .env` | `.env.example` umbenennen in `env` | Echte Meldung `The "DB_PASSWORD" variable is not set. Defaulting to a blank string.` „Compose liest nur eine Datei mit dem Namen `.env`.“ |
| 2 Lücken füllen: `${DB_PASSWORD}`, `pgdata` (2×), `8081`, `service_healthy`, `../2_webserver` | wie Lösung Ü4 | `pgdata` nur oben, nicht unter `volumes:` deklariert | `service "db" refers to undefined volume pgdata`. „Ein Named Volume muss unten unter `volumes:` stehen.“ |
| 3 Starte den Stack. | `docker compose up -d` | `docker compose start` | `service "db" has no container to start`. „`start` startet nur vorhandene Container. Beim ersten Mal: `up -d`.“ |
| 4 Melde dich in Adminer an. | System PostgreSQL · Server `db` · Benutzer postgres · Passwort aus `.env` | Server `localhost` | Adminer: `Connection refused`. „Im Adminer-Container ist `localhost` Adminer selbst. Die DB heißt `db`.“ |
| 5 Lege die Tabelle `mitglieder` mit einem Eintrag an (SQL-Feld in Adminer), dann `docker compose down` und `up -d`. Ist sie noch da? | ja | nein | Tabelle ist da, 🗄️ `pgdata` blieb stehen. „`down` löscht Container, nicht Volumes.“ |
| 6 Vorhersage: Was passiert nach `docker compose down -v` und `up -d`? | Tabelle weg | „bleibt“ | 🗄️ verschwindet, Adminer zeigt leere DB. „`-v` löscht die Volumes mit. Nie auf dem echten Vereinsserver!“ |
| 7 Jemand hat `depends_on: - db` ohne Bedingung geschrieben. Was passiert beim Start? (Auswahl) | Web/Adminer startet, bevor die DB bereit ist → Fehler beim ersten Zugriff möglich | „Compose wartet, bis die DB bereit ist“ | Zeitleiste im Zustand: DB `starting`, Adminer schon grün, erster Login scheitert. „Nur `service_healthy` wartet auf ‚bereit‘.“ |
| 8 Warum hat `db` kein `ports:`? (Auswahl + Satz) | Nur intern gebraucht; weniger Angriffsfläche | „vergessen“ | Jana: „Wer soll von außen direkt auf die Datenbank?“ |

- **🚀 Ticket R4:** Tomás schickt eine fremde Compose-Datei („Hat ein Bekannter geschrieben, geht nicht“) mit drei eingebauten Fehlern: `ports: "5432:5432"` bei der DB (unnötig offen), `DB_HOST: localhost`, `depends_on` ohne Bedingung. Lernende markieren alle drei und korrigieren.
- **Zwischenbilanz:** Kurz-Check `r4-k1` Hostname in Adminer (Lücke), `r4-k2` `down` vs. `down -v` (Wahr-Falsch-Tabelle), `r4-k3` Wiederholung LZ2 (Was tun nach Änderung am Dockerfile?). Mitdenken: „Zeichne die drei Services als Kästen. Welche Pfeile gehen von außen hinein, welche bleiben innen?“ Muster: Browser → web:8080, Browser → adminer:8081, adminer → db, db → 🗄️ pgdata.
- **Wozu brauchst du das?** „Fast jede echte Anwendung besteht aus mehreren Diensten. Compose ist die Bauanleitung, die ihr im Betrieb weitergebt.“
- **Ins Lernheft:** die eigene ausgefüllte Compose-Datei, die eigene Skizze bzw. Beschreibung der Pfeile, die Antwort auf die Selbsterklär-Frage.

### Raum 5: Generalprobe Foto-Cloud (LZ5, LZ6, Wiederholung LZ1–LZ4) → VM: Abschlussprojekt Immich

- **Auftrag (Jana):** „Jetzt wird’s echt: die Foto-Cloud für den TSV. Ergänze die Immich-Datei, starte sie und bring die alten Vereinsfotos hinein. Dann macht Kai die Tür auf.“
  - *Einfach:* „Jetzt kommt die Foto-Cloud für den Verein. Ergänze die Datei für Immich. Starte Immich. Hole die alten Fotos in Immich. Dann geht die Tür auf.“
- **Neue Regeln (Regelbuch):**
  1. Fehlermeldung zuerst **lesen**: Sie nennt meist die Ursache (Variable, Port, Service).
  2. Status bleibt `starting`? → `docker compose logs <service>` lesen.
  3. Im Browser **`http://`** eintippen. `https://` auf einen Dienst ohne Zertifikat ergibt `SSL_ERROR_RX_RECORD_TOO_LONG`.
  4. In der App gibst du **Container-Pfade** an (`/mnt/import`), nicht Host-Pfade.
  5. Backup braucht beides: Bilder ohne Datenbank sind ein Haufen Dateien, eine Datenbank ohne Bilder ist ein leeres Album.
- **Szene:** Wie Raum 4, Compose-Datei von Immich (vereinfacht: `immich-server`, `database`, `redis`, optional `immich-machine-learning` mit `profiles: ["ml"]`). Browser zeigt nachgebaute Immich-Oberfläche als „Übungsversion“ (eigenes Design, kein Original). Kai steht vor der Tür.
- **Geführter erster Fall:** Jana liest mit dir eine Fehlermeldung vor (`port is already allocated` bei 2283, weil Janas Test-Immich noch läuft): 1. Meldung lesen → Port 2283. 2. `docker ps` → alter Container belegt 2283. 3. Lösung wählen: alten Stack mit `docker compose down` beenden oder Mapping auf `"2284:2283"` ändern. *Warum: Der Host-Port ist das Problem, nicht der Container.*
  - **Frage zum Selbsterklären:** „Warum ändern wir bei `"2284:2283"` nur die linke Zahl?“
- **Fälle** (gemischt, jeder Fall bringt einen Fehler aus der Praxis):

| Fall | richtige Lösung | typischer Fehler | Folge im Spiel und erklärender Satz |
|---|---|---|---|
| 1 Lücken füllen: `${UPLOAD_LOCATION}`, `ro`, `2283`, `service_healthy` (2×), `ml`, `${DB_PASSWORD}`, `pgdata` (2×) | wie Lösung Immich | `ports:` auch bei `database` | Jana fragt nach (wie Raum 4, Fall 8) – Wiederholung LZ3/LZ5. |
| 2 `.env` vorbereiten, DB-Passwort setzen | `cp .env.example .env`, Passwort nur Buchstaben und Ziffern | Passwort mit `#` oder `$` | DB startet nicht, `logs database` zeigt Anmeldefehler. „In der `.env` nur A–Z, a–z, 0–9 benutzen.“ |
| 3 Starten und warten | `docker compose up -d`, `docker compose ps` bis `healthy` | gleich Browser öffnen, während `starting` | Browser: „Verbindung fehlgeschlagen“. „Erst wenn alles `healthy` ist, antwortet der Server.“ |
| 4 Öffne Immich im Browser | `http://localhost:2283` | `https://localhost:2283` | `SSL_ERROR_RX_RECORD_TOO_LONG`. „Der Dienst spricht nur `http`.“ |
| 5 Externe Bibliothek: Ordner eintragen | `/mnt/import` | `/home/tsv/archiv` (Host-Pfad) | Bibliothek bleibt leer. „Immich sieht nur das Innere des Containers.“ |
| 6 Ein Fehler wird gemeldet: `.env` geändert (neue Version), aber Immich zeigt noch die alte. Was tun? | `docker compose up -d` (erstellt geänderte Container neu) | `docker compose restart` | Versionsanzeige bleibt alt. „`restart` übernimmt keine neuen Einstellungen. `up -d` erstellt den Container neu.“ |
| 7 Persistenz-Test: Was bleibt nach `down`? Nach `down -v`? (Wahr-Falsch-Tabelle: Konto, Fotos in `library/`, Alben) | `down`: alles bleibt · `down -v`: Konto und Alben weg, Dateien in `library/` bleiben | „bei `down -v` sind die Fotos weg“ | Zustand zeigt 🗄️ `pgdata` weg, 📁 `library` noch da. „Bind Mounts löscht Docker nicht – Volumes schon.“ |
| 8 KI-Funktion zuschalten | `docker compose --profile ml up -d` | `docker compose up -d ml` | `no such service: ml`. „`ml` ist ein Profil, kein Service-Name.“ |

- **🚀 Ticket R5:** „Ich hab zuhause auf meinem Rechner `docker compose down -v` gemacht, weil der Neffe gesagt hat, das räumt auf. Sind die Vereinsfotos jetzt weg?“ Lernende wählen: Dateien in `library/` sind noch da, aber Konten, Alben und Gesichtszuordnungen sind weg; Wiederherstellung nur mit DB-Backup. Antwort an Tomás in eigenen Worten (Satzanfänge in Einfach).
- **Raum geschafft:** Kai öffnet die Tür, die Vereinsfotos erscheinen in der Zeitleiste der Übungsversion.
- **Zwischenbilanz:** Kurz-Check `r5-k1` Fehlermeldung → Ursache zuordnen, `r5-k2` `http` vs. `https`, `r5-k3` Wiederholung LZ4 (Was bleibt nach `down -v`?). Mitdenken: „Schreibe für den Verein eine Notfallkarte mit drei Zeilen: Was darf man nie eingeben? Was hilft, wenn die Seite nicht lädt? Was muss ins Backup?“ Muster: „Nie `docker compose down -v`. Seite lädt nicht → `docker compose ps` und `logs`, `http://` statt `https://`. Backup: Ordner `library/` **und** die Datenbank.“
- **Wozu brauchst du das?** „Das ist jetzt ein echter Dienst, den ihr in der VM bereitstellt. Die Fehlermeldungen kommen dort genauso.“
- **Ins Lernheft:** die eigene Notfallkarte, die eigene Antwort an Tomás (Ticket R5, nur Profi), die ausgefüllte Immich-Compose-Datei.

## ② Üben

Jede Übung ist ein neuer kleiner Raum mit derselben Terminal-Mechanik, aber anderem Dienst. Drei gestufte Tipps über das 💡-Symbol. Basis-Übungen sind Pflicht-Empfehlung, die 🚀-Übung ist freiwillig.

### Übung 1: Die Hallenbelegung (LZ1), neue Situation: Container-Liste eines fremden Servers ⛰️

- Szene: Terminal mit fertiger Ausgabe von `docker images` und `docker ps -a` eines anderen Kunden (Bäckerei, 2 Images, 5 Container, 2 laufen).
- Auftrag: Wie viele Images, wie viele Container, wie viele laufen? Lösche die beendeten Container.
- Musterlösung: 2 / 5 / 2; `docker rm <name> <name> <name>` (oder `docker container prune`, 🚀).
- Tipp 1: „Laufende und beendete Container stehen in derselben Liste. Schau auf die Spalte STATUS.“ · Tipp 2: „`Up …` = läuft, `Exited …` = beendet. Es laufen 2.“ · Tipp 3: „Lösung: 2 Images, 5 Container, 2 laufen. Lösche die drei mit `Exited` mit `docker rm`.“
- Reflexion: „Woran erkennst du in `docker ps -a`, aus welchem Image ein Container stammt?“ Muster: „An der Spalte IMAGE.“

### Übung 2: Die Kantinen-Speisekarte (LZ2, LZ3), neue Situation: anderer Dienst und anderer Port ⛰️

- Szene: Dockerfile mit `FROM httpd:alpine`, Seite `speiseplan.html`. Ziel: `localhost:8500`. Das Apache-Image hört auf Port 80.
- Auftrag: Image bauen, unter Port 8500 starten. Dann ändert die Kantine den Mittwoch – neue Version zeigen.
- Musterlösung: `docker build -t speiseplan .` · `docker run -d -p 8500:80 --name kantine speiseplan` · nach Änderung `docker rm -f kantine`, `build`, `run`.
- Tipp 1: „Welche Zahl gehört dem Host, welche dem Container?“ · Tipp 2: „Links 8500, rechts der Port, auf dem Apache im Container hört.“ · Tipp 3: „`-p 8500:80`, nach Änderung neu bauen, weil `COPY` die Datei ins Image legt.“
- Reflexion: „Warum reicht `docker restart kantine` nach der Änderung nicht?“ Muster: „Restart startet denselben Container mit demselben Image. Die neue Datei ist erst nach einem neuen Build im Image.“

### Übung 3: Das Trainingstagebuch (LZ4), neue Situation: Notiz-App mit SQLite ⛰️

- Szene: Compose-Ausschnitt einer Notiz-App mit `volumes:`-Zeile als Lücke; Host-Ordner `./export`.
- Auftrag: Die Datenbank soll Updates überleben, ohne dass jemand die Dateien anfasst; der Export-Ordner soll auf dem Host sichtbar sein.
- Musterlösung: `notizen-db:/app/data` (Named Volume, unten deklariert) · `./export:/app/export` (Bind Mount).
- Tipp 1: „Welche Daten musst du selbst sehen, welche nicht?“ · Tipp 2: „Die Datenbank bekommt einen Namen, der Export einen Pfad.“ · Tipp 3: „Lösung wie oben, Begründung: DB ist App-intern → Volume; Export willst du öffnen → Bind Mount.“
- Reflexion: „Was passiert mit beiden nach `docker compose down -v`?“ Muster: „Das Volume `notizen-db` ist weg, der Ordner `./export` bleibt.“

### Übung 4: Das Vereins-Forum (LZ5), neue Situation: Forum + MariaDB ⛰️

- Szene: Compose-Datei eines Forums mit `forum` und `mariadb` als Lückentext; `.env` fehlt.
- Auftrag: Stack startklar machen und starten; Datenbank darf nicht von außen erreichbar sein.
- Musterlösung: `cp .env.example .env` · `DB_HOST: mariadb` · kein `ports:` bei mariadb · `depends_on: mariadb: condition: service_healthy` · `docker compose up -d`.
- Tipp 1: „Wie heißt der Datenbank-Service in der Datei? So heißt auch der Host.“ · Tipp 2: „`DB_HOST: mariadb`, und denk an die `.env`.“ · Tipp 3: „Vollständige Lösung oben. Ohne `service_healthy` kann das Forum vor der DB starten.“
- Reflexion: „Warum heißt der Host hier `mariadb` und in Raum 4 `db`?“ Muster: „Der Hostname ist immer der Service-Name aus der Datei.“

### Übung 5: Die Fehler-Sprechstunde (LZ6), neue Situation: sechs Tickets anderer Kunden ⛰️

- Szene: Ticket-Postfach mit sechs kurzen Fehlermeldungen (`variable is not set`, `no container to start`, `port is already allocated`, `SSL_ERROR_RX_RECORD_TOO_LONG`, Status bleibt `starting`, `no such service`).
- Auftrag: Jedem Ticket die Ursache und die Behebung zuordnen.
- Musterlösung: wie Regelbuch Raum 4/5.
- Tipp 1: „Lies jede Meldung Wort für Wort. Welches Wort ist ein Name aus deiner Datei?“ · Tipp 2: zwei Zuordnungen vorgegeben · Tipp 3: alle Zuordnungen mit je einem Satz Begründung.
- Reflexion: „Welche Meldung hat dich am meisten überrascht und warum?“ Muster: offen; Beispiel: „`SSL_ERROR…`, weil der Fehler gar nicht von Docker kommt, sondern vom Browser.“

### 🚀 Übung 6 (Profi, freiwillig): Der Umzug (LZ1–LZ6), neue Situation: alter `docker run`-Befehl soll Compose werden

- Szene: Ein langer `docker run`-Befehl eines Kunden (`-p 8443:80 -v /srv/cloud:/var/www/html -e DB_HOST=… --name cloud nextcloud`) plus ein `docker run` für die Datenbank.
- Auftrag: Schreibe daraus eine `docker-compose.yml` mit zwei Services, Volume für die DB, Healthcheck-Bedingung, Passwort aus `.env`.
- Musterlösung: vollständige Datei im Paket.
- Tipp 1: „Jede Option von `docker run` hat eine Zeile in Compose: `-p` → `ports:`, `-v` → `volumes:`, `-e` → `environment:`.“ · Tipp 2: Gerüst mit beiden Services · Tipp 3: Musterlösung mit Begründung je Zeile.
- Reflexion: „Was ist an der Compose-Datei besser als an zwei langen Befehlen?“ Muster: „Alles steht in einer Datei, kann versioniert und weitergegeben werden, und der Start ist ein Befehl.“

## ③ Nachweis

- **Teil A:** Raum „Redaktion“ (Schülerzeitung, WordPress + MariaDB, Port 8088) und zwei Tickets – siehe `lernziele-nachweis.md`. Ohne Regelbuch, ohne Bausteinleiste, ohne „Was heißt das?“, ohne Erklärungen von Jana; Fehlermeldungen erscheinen nur so, wie das Terminal sie ausgibt. Basis und Profi bekommen denselben Nachweis (Mindeststandard). Für ⛰️ Basis bleibt die Bausteinleiste sichtbar, enthält aber alle Bausteine aller Räume ungeordnet (Bedienhilfe, keine inhaltliche Hilfe) – bitte bestätigen.
- **Teil B:** 12 Fragen aus dem Pool (2 je Lernziel), Themen siehe `lernziele-nachweis.md` (Phase „Fragen“).
- **Bestehen:** Teil A ≥ 80 % (6 von 7) **und** Teil B ≥ 80 % (10 von 12). An die Lernplattform geht der kleinere Prozentwert.

## ④ Abschluss

- Auswertung je Lernziel mit Empfehlung, welchen Raum oder welche VM-Übung man wiederholen sollte (automatisch).
- **Merkblatt** (Lückensätze, Lösung in Klammern):

| LZ | Lückensatz 1 | Lückensatz 2 | typischer Fehler | Beispiel |
|---|---|---|---|---|
| LZ1 | Ein Image ist der (Bauplan), ein Container ist eine laufende (Instanz) davon. | `docker ps` zeigt nur (laufende) Container, `docker ps (-a)` alle. | „`run` startet denselben Container wieder.“ → Jedes `run` macht einen neuen. | `docker run --name hallo1 hello-world` |
| LZ2 | `docker build -t name (.)` baut ein Image aus dem Dockerfile im aktuellen Ordner. | Nach einer Änderung an einer kopierten Datei muss ich (neu bauen) und den Container (neu erstellen). | „Browser neu laden reicht.“ | Schritt-Schema: ändern → `rm -f` → `build` → `run` |
| LZ3 | Bei `-p 8080:80` ist 8080 der Port des (Hosts), 80 der Port des (Containers). | Ein Host-Port kann nur zu (einem) Container gehören. | Zahlen vertauscht. | `docker run -d -p 8081:80 --name tsv2 vereinsseite` |
| LZ4 | Steht links ein (Pfad), ist es ein Bind Mount, steht links nur ein (Name), ist es ein Named Volume. | `docker compose down (-v)` löscht auch die Volumes. | „Daten im Container bleiben.“ | `pgdata:/var/lib/postgresql/data` · `./library:/data` |
| LZ5 | Im Compose-Netz ist der (Service-Name) die Adresse eines Dienstes. | `depends_on` mit `condition: (service_healthy)` wartet, bis der Dienst bereit ist. | `localhost` als DB-Host. | Adminer: Server `db` |
| LZ6 | `variable is not set` heißt meist: Die Datei (.env) fehlt. | Beim ersten Start nehme ich `docker compose (up -d)`, nicht `start`. | `https://` statt `http://` | `port is already allocated` → anderer Host-Port |

- Schritt-Schema „Stack starten“: `.env` anlegen → `docker compose config` → `docker compose up -d` → `docker compose ps` bis `healthy` → `http://localhost:<port>`.
- **Selbsttest** (Rückseite, 5 Fragen ohne Lösung, „In 1–2 Wochen nochmal beantworten“): 1. Wie viele Container entstehen bei dreimal `docker run nginx`? 2. Was bedeutet `-p 3000:80`? 3. Volume oder Bind Mount für die Fotos – warum? 4. Warum heißt der DB-Server in Adminer `db`? 5. Was tust du bei `port is already allocated`?
- **Lernheft als PDF** (Knopf „📄 Lernheft als PDF erstellen“):

| Station/Übung | Ins Lernheft (`api.notiere`) |
|---|---|
| Einstufung | gewählter Weg (Basis/Profi) |
| Raum 1 | Selbsterklärung „Warum ist `docker ps` leer?“, Mitdenken Image/Container, eigene Ausgabe `docker ps -a` |
| Raum 2 | eigener `docker run`-Befehl, eigene Reihenfolge nach Änderung, Antwort „Warum steht 80 rechts?“ |
| Raum 3 | eigene Sortierung Volume/Bind Mount, eigene Begründung DB vs. Fotos, Erklärung an Tomás |
| Raum 4 | eigene ausgefüllte Compose-Datei, eigene Beschreibung der Pfeile, Antwort zu `localhost` |
| Raum 5 | eigene Notfallkarte, ausgefüllte Immich-Datei, 🚀 Antwort auf Ticket R5 |
| Übungen 1–6 | eigene Lösung je Übung, Reflexionsantworten |
| je Raum | Häkchen „VM-Übung erledigt“ (Selbstauskunft) |
| Abschluss | Lernziele mit Ergebnis, Merkblatt-Einträge, Glossar |

## Input und Tafelbild

Entfällt. Die Lehrkraft hat mit `mini-docker-schulung.html` schon eine eigene Präsentation. Sie kann die Folien vor einem Raum zeigen. Das Paket bleibt auch ohne diesen Input vollständig.

## Geschätzte Dauer

| Teil | im Paket | danach in der VM |
|---|---|---|
| Einstieg, Einstufung, Vorwissens-Check | 10 min | – |
| Raum 1 + Übung 1 | 15 min | Ü1 15 min |
| Raum 2 + Übung 2 | 25 min | Ü2 30 min |
| Raum 3 + Übung 3 | 20 min | Ü3 30 min |
| Raum 4 + Übung 4 | 25 min | Ü4 45 min |
| Raum 5 + Übung 5 | 25 min | Immich 2,5 h |
| Nachweis | 30 min | – |
| Abschluss, Merkblatt, Lernheft | 10 min | – |
| **Summe** | **etwa 160 min (≈ 3,5 UStd)** | **etwa 270 min (6 UStd)** |

Zusammen etwa 9–10 UStd, also im Rahmen von 8–10 UStd. Bei nur 8 UStd: Übungen 3 und 5 im Paket als freiwillig markieren, in der VM nach Ablaufplan Ü3 als Lehrer-Demo. Jeder Raum ist eine Einheit von 15–25 Minuten mit Orientierung zu Beginn und Zwischenbilanz am Ende.

## Prüftabelle (Prinzipien)

| Prinzip | Status | Wo im Drehbuch |
|---|---|---|
| P1 Handlungssituation | erfüllt | Hafenblick IT-Service / TSV Lechwiesen, jeder Raum mit Auftrag von Jana und „Wozu brauchst du das?“ |
| P2 Vom Leichten zum Schweren | erfüllt | Räume 1→5 bauen aufeinander auf; Hilfe nimmt ab (Vorführung → Fälle → Übungen mit Tipps → Nachweis ohne Hilfe); Situationen wechseln (Bäckerei, Kantine, Forum, Schülerzeitung) |
| P3 Lösungsbeispiele | erfüllt | „Zeig’s mir“ je Raum an einem anderen Fall, mit Begründung je Schritt und Selbsterklär-Frage, überspringbar |
| P4 Entdecken mit Auftrag | erfüllt | Auftrag je Raum; das Terminal gibt nach jedem Befehl eine Rückmeldung (Ausgabe/Fehlermeldung + Satz) |
| P5 Kurz-Checks | erfüllt | Zwischenbilanz je Raum, 3 Fragen „zählt nicht“ (im Spielmodus höchstens drei) |
| P6 Feedback, das erklärt | erfüllt | Jeder typische Fehler hat eine eigene Folge plus Satz (Fall-Tabellen); Fragen-Feedback folgt in Phase „Fragen“ |
| P7 Klare Bildschirme | erfüllt | Spielbühne: Terminal + Editor/Browser + Zustand; Regelbuch und Tickets nur über Symbol; Fünf-Sekunden-Test beim Prototyp prüfen |
| P8 Ziele und Nachweis passen | erfüllt | `lernziele-nachweis.md`: jedes LZ mit Prüfpunkt und 2 Fragen |
| P9 Hintergrund/Bedienhilfe getrennt (Soll) | erfüllt | Regelbuch 📘 und Glossar getrennt; „Was heißt das?“ direkt an der Fehlermeldung, Bausteinleiste unter dem Terminal |
| P10 Verteilt wiederholen (Soll) | erfüllt | ab Raum 2 je eine Wiederholungsfrage im Kurz-Check; Raum 5 wiederholt LZ1–LZ4; Fragen im Nachweis gemischt |
| P11 Selbststeuerung | erfüllt | Selbsteinschätzung vorher/nachher (automatisch), Fortschritt über die Schlösser der Tür, Reflexionsfragen mit Musterantwort, Empfehlung im Abschluss; Häkchen „VM-Übung erledigt“ |
| P12 Spielelemente | erfüllt | drei Ideen zur Wahl, Lernstoff = Spielregel (Befehle und Dateien entscheiden, ob der Server reagiert), Folgen statt Punkte, keine Rangliste |
| P13 Merkblatt und Lernheft (Muss) | erfüllt | Merkblatt mit 2 Lückensätzen je LZ, Selbsttest; Lernheft-Tabelle |
| P14 Handeln am Gegenstand | erfüllt | jeder Raum: simuliertes Terminal mit Zustand, Editor, Browser |
| P15 Leistungsdifferenzierung | erfüllt | Einstufung vor Raum 1; ⛰️ Bausteinleiste + „Was heißt das?“ · 🚀 freies Tippen + Ticket je Raum + Übung 6; Nachweis gleich für alle. Offen: Bausteinleiste im Nachweis für Basis (bitte bestätigen) |
| P16 Sprachliche Differenzierung | teilweise | Einfach-Fassungen für Einstieg und Aufträge, Glossar mit Artikel/Plural, Satzanfänge stehen im Drehbuch; Einfach-Texte für Regelbuch, Fall-Rückmeldungen, Tipps und Merkblatt werden beim Bauen in `inhalt.js` mitgeschrieben (Fachbegriffe und Befehle bleiben gleich) |
| Input mit Tafelbild (optional) | entfällt | eigene Präsentation der Lehrkraft |
