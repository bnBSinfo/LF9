# Fragenpool: Docker-Einführung (Prüftabelle für die Lehrkraft)

Quelle im Paket: `src/js/nachweis.js` (Nachweis, Teil B) und `src/js/inhalt.js` / `src/js/raeume.js` (Kurz-Checks). Einfache Sprache: `src/js/sprache.js` unter `EINFACH.fragen`.

- **Nachweis Teil B:** 24 Fragen, 4 je Lernziel. Pro Versuch werden 2 je Lernziel gezogen, das sind 12 Fragen. Alle Fragen sind neu und stehen in neuen Situationen (Bäckerei Krume, Schülerzeitung, Wiki). Sie kommen nicht im Kurz-Check vor.
- **Kurz-Checks:** 15 Fragen (r1-k1 bis r5-k3). Sie gehören jetzt nur noch zum Kurz-Check, nicht mehr zum Nachweis.
- **Vorwissens-Check:** r1-k3, r2-k2, r2-k1, r3-k2, r4-k1, r5-k1 (eine Frage je Lernziel).
- **Selbsttest auf dem Merkblatt:** n1-3, n2-2, n3-1, n4-3, n5-1.

Spalte „geprüft“: Bitte abhaken oder Korrekturen notieren.

| ID | LZ | Typ | Frage (kurz) | Richtig | Falschantworten → Fehlvorstellung | geprüft |
|---|---|---|---|---|---|---|
| n1-1 | LZ1 | Zahl | `docker ps -a` mit 5 Zeilen: Wie viele laufen? | 2 | 5 → alle Zeilen gezählt · 3 → beendete gezählt | ☐ |
| n1-2 | LZ1 | MC | Container `notiz` fehlt bei `docker ps` | beendet, sichtbar mit `ps -a` | automatisch gelöscht · Image gelöscht | ☐ |
| n1-3 | LZ1 | MC (mehrere) | Aussagen zu Image und Container | viele Container aus einem Image; beendete bleiben in `ps -a` | `run` startet alten Container neu · Image = laufendes Programm | ☐ |
| n1-4 | LZ1 | Zuordnen | Aufgabe → Befehl | `rm`, `rmi`, `container prune`, `pull` | Verwechslung `rm`/`rmi` | ☐ |
| n2-1 | LZ2 | Zuordnen | Dockerfile-Zeile → Wirkung | FROM, COPY, EXPOSE, CMD | EXPOSE = veröffentlicht den Port | ☐ |
| n2-2 | LZ2 | MC | `preise.html` geändert, `restart` zeigt Altes | neu bauen, löschen, neu starten | stop/start reicht · Browser-Cache | ☐ |
| n2-3 | LZ2 | MC | Zweiter Build mit `CACHED` | Layer aus dem Cache | nur Container neu gestartet · Build gescheitert | ☐ |
| n2-4 | LZ2 | MC | `build -t speiseplan` ohne Punkt | Punkt (Build-Kontext) fehlt | Wort `Dockerfile` fehlt · Tag fehlt | ☐ |
| n3-1 | LZ3 | Text | `-p 8085:80`: Adresse im Browser | `localhost:8085` (mehrere Schreibweisen) | `localhost:80` → Container-Port · `https://` | ☐ |
| n3-2 | LZ3 | MC | Zweimal `-p 8080:80` | zweiter Container: `port is already allocated` | beide teilen sich den Port · Docker stoppt den ersten | ☐ |
| n3-3 | LZ3 | MC (mehrere) | Wer braucht `ports:`? | web, adminer | db braucht auch einen Port | ☐ |
| n3-4 | LZ3 | Zahl | `"8090:3000"`: Port im Container | 3000 | 8090 → Seiten vertauscht | ☐ |
| n4-1 | LZ4 | MC | Bilder im Projektordner sehen | `./bilder:/…` (Bind Mount) | Named Volume · nur im Container | ☐ |
| n4-2 | LZ4 | MC (mehrere) | Was bleibt nach `down`? | Volume und Bind Mount | Datei nur im Container bleibt | ☐ |
| n4-3 | LZ4 | MC | Was bleibt nach `down -v`? | nur `./bilder` | `-v` = mehr Ausgaben · Bind Mount auch weg | ☐ |
| n4-4 | LZ4 | Zuordnen | Datenart → Speicher | Volume, Bind Mount, `:ro`, nichts | Verwechslung Volume/Bind Mount | ☐ |
| n5-1 | LZ5 | Text | `WORDPRESS_DB_HOST`, Service heißt `datenbank` | `datenbank` | `localhost` · `db` (auswendig gelernt) · `127.0.0.1` | ☐ |
| n5-2 | LZ5 | MC | Wirkung von `service_healthy` | wartet auf den Healthcheck der DB | = `service_started` · prüft WordPress | ☐ |
| n5-3 | LZ5 | MC | `.env` fehlt, nur `.env.example` | Warnung, Passwort leer, DB startet nicht | `.env.example` wird gelesen · Compose fragt nach | ☐ |
| n5-4 | LZ5 | MC | Erster Start | `up -d` | `start` · `restart` · `docker run` mit Datei | ☐ |
| n6-1 | LZ6 | Zuordnen | Meldung → Ursache | Port, `.env`, kein Container, https | – | ☐ |
| n6-2 | LZ6 | MC | DB bleibt `health: starting` | `docker compose logs db` | `down -v` · weiter warten | ☐ |
| n6-3 | LZ6 | MC | `container name "/kasse" is already in use` | `docker rm -f kasse` oder anderer Name | neu bauen · anderer Port | ☐ |
| n6-4 | LZ6 | MC | „Verbindung zurückgesetzt“ bei `"8088:8088"` | `"8088:80"` | `"80:8088"` · https | ☐ |

**Bitte fachlich prüfen:**
- n2-1: Ist EXPOSE als „dokumentiert den Port“ für eure Klasse verständlich genug?
- n6-2: Passt der Status `health: starting` zur Docker-Version in der VM?

## Nachweis Teil A – Umsetzung

- **Raum „Redaktion“:**
  - Terminal mit Bausteinen, für alle gleich. Die Bausteine enthalten auch falsche Wörter wie `start` und `restart`.
  - Browser, Zählfrage und `docker-compose.yml` mit 7 Auswahl-Lücken. Die Reihenfolge der Auswahl ist gemischt.
  - Dazu kommen zwei Tickets: Ursache markieren und Behebung wählen. Auch hier ist die Reihenfolge gemischt.
- **Verhalten:**
  - Keine Tipps, kein Regelbuch, keine Erklärungen.
  - Das Terminal zeigt nur echte Meldungen: Lücken offen, `no container to start`, `variable is not set`, `port is already allocated` (bei `8080:80`), `undefined volume`, „Error establishing a database connection“ (bei `localhost`), `SSL_ERROR_RX_RECORD_TOO_LONG`.
- **Ticket 2:** Pro Versuch wird zufällig gewählt: `port is already allocated` oder `variable is not set`.
- **A1:** Zählt, wenn irgendwann `docker ps -a` (oder `docker compose ps`) getippt wurde und die Antwort 3 stimmt. Gefragt ist der Stand vor dem eigenen Start.
- **Bewertung „beide Teile ≥ 80 %“:**
  - Die Engine kann nur gewichten. `nachweis.js` setzt deshalb das Gewicht beim Abgeben so, dass der kleinere der beiden Werte zählt. Die Engine selbst bleibt unverändert.
  - Getestet: Teil A 100 % und Teil B 75 % ergeben 75 %, also nicht bestanden.
  - Wunsch für die Pflege der Vorlage: eine eingebaute Option „jeder Teil einzeln“.
