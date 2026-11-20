# Lernpfad: Lokales HTTPS mit Nginx und Javalin

Geführter Lernpfad (SCORM 1.2) zum Praxisleitfaden „Lokales HTTPS mit Nginx und Javalin“ (M. Niedermair). **Kein Nachweis.** Die 8 Schritte der Anleitung werden erklärt, die Lernenden setzen sie am eigenen Rechner um und haken die Kontrolle ab. Sind alle Schritte abgehakt, meldet das Paket `completed` an die Lernplattform, ohne Punktzahl.

- **Zwei Pfade zum Umschalten:** 🐧 Linux (Ubuntu/WSL2, Bash) und 🪟 Windows (CMD oder PowerShell). Befehle, Skripte, Simulator und Fehlerbilder wechseln mit.
- **Quellcode kopierbar:** In jedem Codeblock gibt es „📋 Kopieren“ und „⬇ Datei“. Zeilen mit ● zeigen beim Antippen eine Erklärung. Am Ende gibt es das ganze Projekt `local-https-demo` als ZIP (Skripte für beide Systeme, `.sh` ausführbar).
- **Szenen:** Weg einer Anfrage, Git-/Docker-Sicht auf den Ordner, Multi-Stage-Build, Vertrauenskette (mit WSL-Falle), Compose-Start mit Healthcheck, Lebenszyklus-Simulator mit Terminal und Browser, Fehler-Tickets.
- Je Schritt: Mitdenken-Frage mit Musterantwort, 🚀 Profi-Kasten, Begriffe. Sprachstufen Standard und Einfach. Lernheft als PDF.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `planung/steckbrief.md` | Entscheidungen und Ergänzungen gegenüber der Anleitung (bitte fachlich prüfen) |
| `src/js/dateien.js` | Projektdateien, **automatisch** aus `anleitung.tex` erzeugt |
| `src/js/inhalt.js` | Texte, Schritte, Erklärungen, Glossar |
| `src/js/pfad.js` | Engine (Umschalter, Szenen, SCORM, ZIP) |
| `werkzeug/` | `dateien_aus_tex.py`, `zip.py` |

## Nach Änderungen an der Anleitung

```bash
python3 werkzeug/dateien_aus_tex.py <pfad>/anleitung.tex src/js/dateien.js
python3 werkzeug/zip.py
```
