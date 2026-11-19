# Docker-Einführung – Serverraum 0 (SCORM-Lernspiel, LF 9)

**Stand: v0.33** – voller Ausbau, noch vor fachlicher Abnahme und Erprobung. v0.33: Logo BS Info München im Kopf (wie in LF3). Änderungen zu v0.31 (Regeln aus LF3): jede Runde hat höchstens 4 Aufgaben – die Räume 1–5 je 4 statt 7–8 Aufgaben, im Profi-Weg ersetzen die Tickets Aufgaben, statt dazuzukommen; die Fehler-Sprechstunde hat in beiden Wegen 4 Tickets (Profi 4 statt 6); der Kasten auf der Startseite heißt „Wichtige Infos zum Thema Docker“; Startseite ohne Leiste unten. **Paket:** `lf9-docker-einfuehrung_scorm12.zip` (SCORM 1.2, ohne Internetverbindung lauffähig)

Die lernende Person ist Auszubildende bei **Hafenblick IT-Service**. Der Sportverein **TSV Lechwiesen** will eine eigene Foto-Cloud. Mit Ausbilderin **Jana Petrov** übt sie im **Serverraum 0** am simulierten Terminal; jeder Raum ist ein Schritt und gehört zu einer Übung in der VM. Am Ende läuft die Foto-Cloud (Immich) – und die Tür geht auf.

| Raum | Inhalt | Basis (4 Aufgaben) | Profi (4, Tickets ersetzen) | Lernziel |
|---|---|---|---|---|
| 1 Hallo, Container! | Image und Container | 2 Container starten, `images`, `ps -a`, `rm` | 2 Container, `rm`, Ticket „ps ist leer“ | LZ1 |
| 2 Die Vereinsseite | Bauen und Ports | `build`, `run -p`, neu bauen, zweite Kopie auf 8081 | `build`, `run -p`, neu bauen, Ticket Portkonflikt | LZ2, LZ3 |
| 3 Daten, die bleiben | Volume und Bind Mount | Vorhersage, Volume, Bind Mount, DB oder Fotos | Volume, Bind Mount, `:ro`, Ticket „Listen weg“ | LZ4 |
| 4 Drei Dienste, eine Datei | Compose | Lücken, `.env` + `up -d`, down/up, Vorhersage `down -v` | Lücken, `.env` + `up -d`, `depends_on`, Ticket Fehlerdatei | LZ5, LZ4 |
| 5 Generalprobe Foto-Cloud | Immich | Lücken, Start, externe Bibliothek, Persistenz-Test | Lücken, Start, Update, Ticket `down -v` | LZ5, LZ6 |

**Im Paket:**
- **Wichtige Infos zum Thema Docker:** 9 Erklär-Szenen mit Bildern (Wohnen der Apps, Image/Container, `docker run`, Lebenszyklus, Build · Ship · Run, Ports, Daten, Compose, Netzwerk); der Text rechts wechselt mit jedem Schritt. Auch als Tafelbild (`index.html#tafel`) mit Ablaufplan in `lehrer/input-ablauf.md`.
- **Übungen** in neuen Situationen (Hallenbelegung, Kantine, Trainingstagebuch, Vereins-Forum, Fehler-Sprechstunde, 🚀 Umzug), je drei Tipps und Reflexion; Dateien mit Arbeitsanweisung daneben.
- **Nachweis:** Teil A Redaktion der Schülerzeitung (Handlungsaufgabe im Terminal), Teil B 24 Fragen. Teil A und Teil B müssen je 80 % erreichen; an die Lernplattform geht der kleinere Wert.
- **Abschluss:** „Docker auf einen Blick“ (wichtigste Befehle und Zusammenfassung als PDF), Merkblatt, Selbsttest, Lernheft als PDF.
- **Differenzierung:** ⛰️ Basis und 🚀 Profi in jedem Raum, Sprachstufe **Einfach** mit Erklärung schwerer Begriffe beim Darüberfahren (`js/begriffe.js`).

## Ordner

| Ordner/Datei | Inhalt |
|---|---|
| `lf9-docker-einfuehrung_scorm12.zip` | Upload ins LMS (Aktivität „Lernpaket“) |
| `src/` | Quelldateien (entpacktes Paket; `index.html` über einen lokalen Webserver starten) |
| `planung/` | Steckbrief, Spielidee, Lernziele/Nachweis, Drehbuch, Fragenpool mit Prüftabelle |
| `lehrer/` | Ablaufplan für den freiwilligen Input (nicht im ZIP) |
| `pruefung/` | Prüfbericht und Screenshots aus dem Prüfskript |

## Code-Aufbau

| Datei | Zuständigkeit | Anpassen? |
|---|---|---|
| `js/inhalt.js` | **Lerninhalte**: Raum 1, Spielwelt Serverraum, Übung 1, Paketdaten, Glossar | **ja, hier** |
| `js/raeume.js` | Simulierter Docker-Host, Räume 2–5 | **ja, hier** |
| `js/uebungen.js` | Übungen 2–6 | **ja, hier** |
| `js/nachweis.js` | Nachweis Teil A, Fragenpool, Merkblatt | **ja, hier** |
| `js/erklaerung.js` | Erklär-Szenen (Tafelbild), Startkasten | **ja, hier** |
| `js/abschluss.js` | „Docker auf einen Blick“ | **ja, hier** |
| `js/sprache.js` | Texte in **Einfachem Deutsch** (`EINFACH`) | bei Textänderungen |
| `js/engine.js`, `js/stufen.js`, `js/pdf.js`, `js/tafel.js`, `js/baukasten.js`, `js/begriffe.js`, `css/` | Kompass-Vorlage: Ablauf, SCORM 1.2, Differenzierung, PDF, Gestaltung | nein |

## Prüfung

`pruefe_paket.py`: 2 rot, 3 gelb, 68 grün (`pruefung/kompass-pruefbericht.txt`). Rot (und 1× gelb) ist gewollt: Die Startseite hat auf Wunsch der Lehrkraft keinen Weiter-Knopf; weiter geht es über die Reiter oben. Gelb: Das Tafelbild hat 9 statt höchstens 8 Szenen (Szene „Netzwerk“ auf Wunsch der Lehrkraft). Alle Räume sind in Basis und Profi mit der Musterlösung lösbar (je 4 Aufgaben), ebenso alle Übungen und der Nachweis (100 %). In der echten ByCS-Lernplattform und mit Schülern ist das Paket noch nicht getestet.

## Offen / bitte prüfen

Siehe `planung/drehbuch.md` und `planung/fragenpool.md`. Die Räume wurden mit v0.32 gekürzt; das Drehbuch beschreibt noch die längere Fassung.

## Lizenz

CC BY-SA 4.0
