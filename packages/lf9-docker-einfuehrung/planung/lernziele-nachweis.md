# Lernziele und Nachweis: Docker-Einführung – vom ersten Container zur eigenen Foto-Cloud

Bestehensgrenze 80 %, beliebig oft wiederholbar, bestes Ergebnis zählt.

## Lernziele (Schülersprache)

| Nr. | Lernziel | Kurzname | Level / VM-Übung |
|---|---|---|---|
| LZ1 | Ich kann an der Ausgabe von `docker images` und `docker ps -a` erklären, was ein Image und was ein Container ist, und die passenden Befehle zum Starten, Anzeigen und Löschen auswählen. | Image und Container | Raum 1 → Ü1 |
| LZ2 | Ich kann aus einem Dockerfile mit `docker build` ein Image bauen und begründen, wann ich nach einer Änderung neu bauen muss. | Bauen | Raum 2 → Ü2 |
| LZ3 | Ich kann ein Port-Mapping (`-p Host:Container` bzw. `ports:`) setzen und an einer Adresse wie `localhost:8080` ablesen, welcher Container antwortet. | Ports | Raum 2 → Ü2 |
| LZ4 | Ich kann für Daten begründet ein Named Volume oder einen Bind Mount auswählen und vorhersagen, welche Daten nach `rm`, `down` und `down -v` noch da sind. | Daten | Raum 3 → Ü3 |
| LZ5 | Ich kann eine `docker-compose.yml` mit mehreren Diensten ergänzen und starten: mit Service-Name statt `localhost`, `depends_on` mit `service_healthy` und Variablen aus der `.env`. | Compose | Raum 4 → Ü4 |
| LZ6 | Ich kann eine Docker-Fehlermeldung (z. B. `port is already allocated`, `variable is not set`, `no container to start`) einer Ursache zuordnen und den passenden Befehl oder die passende Änderung zur Behebung auswählen. | Fehlersuche | alle Räume, Raum 5 → Immich |

## Nachweis

**Teil A – Handlungsaufgabe in neuer Situation (ohne Tipps)**

Situation: Ein neuer Kunde, die Schülerzeitung einer Partnerschule, möchte eine eigene Webseite mit Datenbank. Im Terminal von „Serverraum 0“ steht der Raum „Redaktion“. Dort gibt es eine unfertige `docker-compose.yml` mit WordPress und MariaDB und eine `.env`. Am Terminal-Schloss hängen außerdem zwei Support-Tickets. Es gibt keine Tipps, kein Regelbuch und keine Erklärung zu den Fehlermeldungen. Fehlermeldungen erscheinen nur so, wie das Terminal sie ausgibt.

Auftrag: Bring die Seite der Schülerzeitung unter `http://localhost:8088` zum Laufen. Danach bearbeitest du die beiden Tickets.

| Prüfpunkt | Lernziel | So prüft das Paket |
|---|---|---|
| A1 Prüft mit `docker ps -a` bzw. `docker compose ps`, welche Container es gibt und welche laufen, statt sich auf `docker ps` zu verlassen | LZ1 | Befehl in der Terminal-Historie, bevor der erste Start versucht wird; Frage „Wie viele Container gibt es?“ richtig beantwortet |
| A2 Setzt `ports: "8088:80"` beim Webdienst und kein Port-Mapping bei der Datenbank | LZ3 | Zustand der Datei: Mapping beim Webdienst richtig herum, bei `db` keins |
| A3 Wählt für die Datenbank ein Named Volume und für die hochgeladenen Medien einen Bind Mount, beide richtig deklariert | LZ4 | Zustand der Datei: `volumes:` beim Dienst und unten deklariert |
| A4 Trägt den Service-Namen als Datenbank-Host ein und `depends_on` mit `condition: service_healthy` | LZ5 | Zustand der Datei |
| A5 Startet mit `docker compose up -d` (nicht `start`) und mit vorhandener `.env` | LZ5, LZ6 | Simulation läuft: Seite im Spiel-Browser erreichbar |
| A6 Ticket 1: „Wir haben das Logo in `index.html` geändert, die Seite zeigt noch das alte“ → neu bauen und Container neu erstellen | LZ2 | Gewählte Lösung und markierte Ursache in Dockerfile/Ausgabe |
| A7 Ticket 2: Fehlermeldung `port is already allocated` oder `variable is not set` (pro Versuch zufällig) → Ursache markieren, Behebung wählen | LZ6 | Markierung und gewählte Behebung |

Teil A zählt sieben Prüfpunkte. Jeder Prüfpunkt gibt einen Punkt. **Teil A und Teil B müssen jeweils für sich mindestens 80 % erreichen** (Entscheidung der Lehrkraft, 2026-11-04): Teil A also mindestens 6 von 7 Punkten, Teil B mindestens 10 von 12 Fragen. Die Lernplattform bekommt als Ergebnis den kleineren der beiden Prozentwerte.

**Teil B – Fragen aus dem Pool** (2 je Lernziel pro Versuch, Pool mindestens 4 je Lernziel = 12 Fragen je Versuch aus mindestens 24)

| Lernziel | Fragethemen für den Pool | Fragetypen | Typische Fehler, die als Falschantworten dienen |
|---|---|---|---|
| LZ1 | Ausgabe von `docker ps -a` deuten (wie viele Images, wie viele Container?); warum der 2. `run hello-world` schneller ist; Befehl zum Anzeigen beendeter Container; Analogie Klasse/Objekt | MC, Zahl, Zuordnen | `docker run` startet denselben Container wieder; beendeter Container verschwindet; Image = laufendes Programm |
| LZ2 | Reihenfolge `build` → `rm -f` → `run`; was `FROM`, `COPY`, `CMD` bewirken; Layer-Cache: warum der zweite Build schneller ist | Reihenfolge, Zuordnen, MC | Änderung an Datei wirkt ohne Neubau; `docker restart` reicht |
| LZ3 | `-p 8081:80` deuten; welche Adresse im Browser; zwei Container auf demselben Host-Port; welcher Dienst braucht überhaupt `ports:` | Lücke, MC, Zahl | Container-Port vorne; beide Container dürfen 8080; jeder Dienst braucht `ports:` |
| LZ4 | Pfad links = Bind Mount, Name = Named Volume; Fotos vs. Datenbank begründen; was nach `down` / `down -v` bleibt; Bedeutung von `:ro` | Sortieren, MC, Wahr-Falsch-Tabelle | Daten im Container bleiben; `down` löscht Volumes; `:ro` = „root only“ |
| LZ5 | Hostname der DB in Adminer; Wirkung von `service_healthy`; `${DB_PASSWORD}` und `.env`; `up -d` vs. `start` | Lücke, MC | `localhost` als DB-Host; `depends_on` wartet bis bereit; `.env.example` wird automatisch gelesen |
| LZ6 | Fehlermeldung → Ursache zuordnen (`port is already allocated`, `variable is not set`, `no container to start`, `SSL_ERROR_RX_RECORD_TOO_LONG`, Status bleibt `starting`, externe Bibliothek leer) | Zuordnen, MC | `https` funktioniert immer; Host-Pfad statt Container-Pfad; Container einfach neu starten hilft immer |

**Kontrolle:** Jedes Lernziel hat mindestens zwei Prüfungen (Prüfpunkte + Fragen) ☑ (LZ1: A1 + B · LZ2: A6 + B · LZ3: A2 + B · LZ4: A3 + B · LZ5: A4, A5 + B · LZ6: A5, A7 + B) · Es wird nichts geprüft, was nicht geübt wird ☑ (WordPress/MariaDB sind neu, aber nur als anderer Dienst mit denselben Regeln; Port 8088 statt 8080)
