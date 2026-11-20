# Steckbrief: Lernpfad „Lokales HTTPS mit Nginx und Javalin“

> Grundlage: Praxisleitfaden „Lokales HTTPS mit Nginx und Javalin“ (M. Niedermair, ADA-Projekt, `docker/https_javalin_nginx/anleitung/anleitung.tex`). Entscheidungen der Lehrkraft vom 2026-11-20.

| | |
|---|---|
| **Art** | **Geführter Lernpfad, kein Spiel, ohne Nachweis** (Entscheidung der Lehrkraft). Die 8 Schritte der Anleitung werden erklärt; die Lernenden setzen sie am eigenen Rechner um und haken die Kontrolle ab. |
| **Lernproblem** | Die Lernenden tippen die Anleitung ab, ohne zu verstehen, *warum* Nginx vor Javalin steht, wozu Root-CA und Zertifikat da sind, was die Zeilen in `Dockerfile`, `default.conf` und `compose.yaml` tun und welches Skript welche Phase (Build, Create, Run, Stop, Remove) auslöst. Bei Fehlern (Zertifikatswarnung, 502) wissen sie nicht weiter. |
| **Fach / Beruf / Jahrgang** | FIAE, Jahrgangsstufe 11, LF9 „Netzwerke und Dienste bereitstellen“ |
| **Vorwissen** | Paket `lf9-docker-einfuehrung` (Image, Container, Port-Mapping, Compose, Healthcheck); Java-Grundlagen |
| **Betriebssystem-Pfade** | Zwei Pfade zum Umschalten im Kopf: 🐧 **Linux** (Ubuntu / WSL2, Bash) und 🪟 **Windows** (CMD oder PowerShell). Befehle, Skripte, Fehlerbilder wechseln mit. |
| **Quellcode** | Jede Datei und jeder Befehl lässt sich mit einem Knopf kopieren; das ganze Projekt `local-https-demo` gibt es als ZIP zum Herunterladen (Skripte passend zum Pfad). |
| **Differenzierung** | Leistung: Grundweg für alle, je Schritt ein freiwilliger 🚀 Profi-Kasten. Sprache: Standard und Einfach im Kopf umschaltbar, Glossar. |
| **Einsatz** | SeGeL, verzahnt: erst im Lernpfad verstehen, dann am Rechner umsetzen. Zeitrahmen etwa 2 × 45 min plus Umsetzung. |
| **Leitsituation** | Hafenblick IT-Service (wie im Docker-Paket). Ausbilderin Jana Petrov: Der TSV Lechwiesen bekommt eine Java-Web-App. Bevor sie online geht, soll sie lokal schon über HTTPS laufen, so wie später im Betrieb. |
| **Typische Fehler** | 1. `mkcert -install` auf dem falschen System (WSL vs. Windows) → `ERR_CERT_AUTHORITY_INVALID`. 2. Glaube, das Zertifikat enthalte den Port. 3. Javalin an `localhost` statt `0.0.0.0`, `proxy_pass` mit `localhost` statt Service-Name → 502. 4. Javalin bekommt unnötig `ports:`. 5. `stop`, `down`, `down --rmi all` verwechselt; `create` startet angeblich schon. 6. `depends_on` ohne `service_healthy`. 7. Schlüssel in Git/Image (fehlende Ignorier-Dateien). 8. CRLF-Zeilenenden in `.sh`. |
| **Lernheft (P13)** | PDF am Ende: Kontrollhaken je Schritt, eigene Antworten zu den Mitdenken-Fragen, Befehle des gewählten Pfads. |
| **Welt** | technik · Symbol 🔒 |
| **Paket-ID** | `lf9-https-nginx-javalin` |

## Ergänzungen gegenüber der Anleitung (bitte fachlich prüfen)

- Schritt 2: Befehle zum Anlegen der Ordner (Bash, CMD, PowerShell) – die Anleitung nennt nur die Struktur und ein Setup-Skript `setup_local_https_project.cmd`, das im Projektordner nicht liegt.
- Schritt 4: Die Windows-Befehle (`if not exist certs mkdir certs`) laufen nur in CMD. Für PowerShell steht im Lernpfad `New-Item -ItemType Directory -Force certs`.
