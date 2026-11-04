# Spielidee: Docker-Einführung – vom ersten Container zur eigenen Foto-Cloud

Ergebnis der Phase „Erfinden“ (P12). Drei verschiedene Ideen, die Lehrkraft wählt oder kombiniert.

Vorläufige Lernziel-Bereiche (werden in „Zielen“ ausformuliert): **LZ1** Image und Container · **LZ2** Dockerfile und Build · **LZ3** Port-Mapping · **LZ4** Daten (ephemer, Volume, Bind Mount) · **LZ5** Compose (Service-Name, Healthcheck, `.env`, `up`/`down -v`).

## Idee 1: „Serverraum 0“ – Escape mit Terminal

- **Genre und Vorbild:** Abenteuer mit Befehlen wie „SQL Island“, verbunden mit einem Escape Room
- **Du bist …** Azubi bei einem IT-Dienstleister. Du sitzt im Serverraum des Sportvereins. Die Tür hat ein Schloss, das an der Foto-Cloud hängt: Sie öffnet sich erst, wenn die Foto-Cloud läuft.
- **Spielschleife:** Ich lese den Auftrag am Monitor, tippe Docker-Befehle in ein simuliertes Terminal (oder ergänze eine Datei), dann antwortet das Terminal wie in echt – mit Ausgabe oder echter Fehlermeldung –, bis das Schloss des Raums aufgeht.
- **Level (= Stationen, je danach die VM-Übung):** 1 Hallo Container (`run`, `ps -a`) → Ü1 · 2 Vereinsseite bauen (`build`, `-p`) → Ü2 · 3 Notizen, die bleiben (Volume, Bind Mount) → Ü3 · 4 Drei Dienste, eine Datei (Compose, Adminer) → Ü4 · 5 Generalprobe Foto-Cloud (Immich-Stack ergänzen und starten) → Immich

| Lernziel / typischer Fehler | Spielregel oder Folge im Spiel |
|---|---|
| LZ1 Image vs. Container | `docker ps` ist leer, obwohl „er doch lief“ – erst `ps -a` zeigt die beendeten Container. Jedes `run` legt sichtbar einen neuen Container in die Liste. |
| LZ2 Build | Du änderst `index.html`, der Browser im Spiel zeigt die alte Seite, bis du neu baust und neu startest. |
| LZ3 Ports | Der Browser im Spiel erreicht `localhost:8080` nur bei richtigem `Host:Container`; doppelter Host-Port → `port is already allocated`. |
| LZ4 Daten | Nach `exit` und neuem Start ist die Datei weg (ohne Volume). Mit Bind Mount erscheint sie im Host-Ordner daneben. |
| LZ5 Compose | Adminer-Login mit `localhost` scheitert, mit `db` klappt es; ohne `service_healthy` startet der Server zu früh und meldet einen Fehler; `down -v` → Tabelle weg. |
| Fehler: `.env` fehlt, `start` statt `up -d`, `https://` | Original-Fehlermeldung (`variable is not set`, `no container to start`, `SSL_ERROR_RX_RECORD_TOO_LONG`) plus ein Satz, was sie bedeutet. |

- **Lösungsbeispiel im Spiel:** Die Ausbilderin tippt im ersten Level vor („Zeig’s mir“) und erklärt jeden Befehl; danach bist du dran.
- **Differenzierung:** ⛰️ Basis setzt Befehle aus Bausteinen zusammen (`docker` · `run` · `-p` · `8080:80` …). 🚀 Profi tippt frei und bekommt Level mit kaputten Dateien.
- **Üben und Nachweis:** Neue Räume mit anderen Diensten (z. B. Wiki statt Webseite, MariaDB statt Postgres). Im Nachweis ein neuer Raum ohne Tipps und ohne Erklärungen zu den Fehlermeldungen.
- **Plattform-Probe:** Könnte die Lernplattform das auch? Nein, weil ein Test keine Fehlermeldung als Folge eines eigenen Befehls zeigt und keinen Zustand (laufende Container, Volumes, Ports) über mehrere Schritte hält.
- **Übergang zur VM:** Die Befehle sind 1 : 1 die echten. Am Ende jedes Levels steht: „Jetzt in echt: Übung X in der VM.“
- **Aufwand:** mittel bis hoch – eigene Terminal-Simulation mit Zustand (Images, Container, Ports, Volumes) im Baustein `computer`

## Idee 2: „Hafenmeister“ – Container-Hafen aufbauen

- **Genre und Vorbild:** Baukasten und Aufbau wie „Bridge Constructor“ oder ein Hafen-Tycoon
- **Du bist …** Hafenmeisterin oder Hafenmeister im „Hafen Localhost“. Das Registry-Schiff liefert Baupläne (Images), du stellst daraus Container auf den Kai.
- **Spielschleife:** Ich ziehe Container auf den Kai, verbinde Kai-Tore (Host-Ports) mit Container-Türen, hänge Lagerhallen (Volumes) oder Vereinsschuppen (Bind Mounts) an, drücke „Schicht starten“, dann sehe ich, ob die Besucher ankommen und die Ware den Sturm übersteht, bis der Verein zufrieden ist.
- **Level:** 1 Bauplan vs. Container · 2 Tore und Türen (Ports) · 3 Sturm (Container weg – was bleibt?) · 4 Ladeliste (Compose: Funkname statt „localhost“, Lotse wartet auf „gesund“) · 5 Foto-Cloud-Terminal

| Lernziel / typischer Fehler | Spielregel oder Folge im Spiel |
|---|---|
| LZ1 | Ein Bauplan ergibt beliebig viele Container; Bauplan ändern wirkt erst bei neuen Containern. |
| LZ3 | Zwei Container am selben Kai-Tor → Stau, Besucher stehen vor verschlossener Tür. |
| LZ4 | Nach dem Sturm ist Ware ohne Lagerhalle weg; „Hafen räumen mit Lagerhallen“ (`down -v`) zerstört auch die Hallen. |
| LZ5 | Funkspruch an „localhost“ landet beim eigenen Container; Server legt ab, bevor die Datenbank „gesund“ ist → Schiffbruch. |

- **Plattform-Probe:** Nein, weil die Lernenden ein System bauen und in einer Simulation die Folgen sehen.
- **Schwäche:** Die Bilder (Hafen) sind anschaulich, aber die echten Befehle und Dateien kommen nur nebenbei vor – der Übergang zur VM ist größer.
- **Aufwand:** hoch – eigenes SVG-Spielfeld mit Ziehen und Simulation

## Idee 3: „Ticket-Schalter Docker-Support“

- **Genre und Vorbild:** Schalter-Simulator wie „Papers, Please“, verbunden mit Detektivfall
- **Du bist …** Azubi im Support. Tickets vom Sportverein kommen herein: „Die Seite zeigt noch die alte Version“, „Nach dem Neustart sind die Fotos weg“, „Adminer lässt mich nicht rein“.
- **Spielschleife:** Ich öffne das Ticket, sehe mir `docker ps`, Logs und die `docker-compose.yml` an, markiere die Ursache und wähle die Lösung, dann antwortet der Verein (zufrieden oder mit Folgeticket), bis die Woche vorbei ist. Jede Woche kommt eine neue Dienstanweisung (Woche 1 Images, Woche 2 Ports, Woche 3 Daten, Woche 4 Compose).

| Lernziel / typischer Fehler | Spielregel oder Folge im Spiel |
|---|---|
| LZ2 | „Alte Version“: Wer nur neu startet statt neu baut, bekommt ein Folgeticket. |
| LZ3 | Falsch herum gemappter Port in der Datei markieren; falscher Fix → Kunde erreicht die Seite immer noch nicht. |
| LZ4/LZ5 | Wer `down -v` empfiehlt, löscht die Vereinsdatenbank – der Vorstand ruft an. |

- **Plattform-Probe:** Teilweise: Ursache wählen ginge auch als Test. Besteht nur, wenn die Lernenden in echten Dateien und Ausgaben die Stelle selbst finden und der Fehler Folgetickets erzeugt.
- **Schwäche:** Lernende reparieren, bauen aber selbst nichts auf – gut für Profi und Nachweis, als Einstieg für Terminal-Neulinge zu schwer.
- **Aufwand:** mittel – Bausteine `mail`, `dokument`, `dialog`

## Entscheidung

- Gewählt: **Idee 1 „Serverraum 0“, kombiniert mit Idee 3 „Ticket-Schalter“** (2026-11-04)
- Begründung: Das simulierte Terminal mit echten Befehlen und Fehlermeldungen führt am direktesten zur Umsetzung in der VM. Die Support-Tickets bringen Fehlersuche in neuen Situationen und passen zur großen Leistungsspanne.
- Umsetzung: Spielmodus `PAKET.spielwelt` – ein Spiel über alle Stationen, die fünf Räume von „Serverraum 0“ sind die Level, jedes Level endet mit dem Übergang zur passenden VM-Übung.
  - ⛰️ Basis: Befehle aus Bausteinen zusammensetzen, Fehlermeldungen mit Erklärung.
  - 🚀 Profi: freies Tippen; je Level zusätzlich ein Support-Ticket (Idee 3) mit kaputter Datei oder Ausgabe.
  - Üben: neue Räume und Tickets mit anderen Diensten.
  - Nachweis Teil A: ein neuer Raum plus zwei Tickets, ohne Tipps und ohne Erklärung der Fehlermeldungen.
