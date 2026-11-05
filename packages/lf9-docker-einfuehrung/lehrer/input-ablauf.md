# Input „So funktioniert Docker“ – Ablaufplan für die Lehrkraft

Dauer: **etwa 20 Minuten** · Material: Tafelbild aus dem Lernpaket (nach der Präsentation „Mini-Docker-Schulung“) · Rolle des Inputs: **freiwilliger Einstieg**, nicht Ersatz für die Räume

## Vorbereitung

- Paket ohne Lernplattform öffnen: `index.html#tafel` im Browser (entpackter Ordner oder GitHub Pages). Es startet direkt die Präsentation **ohne Erklärungen**. Taste **F** = Vollbild.
- In der Lernplattform: Paket öffnen → **Tafelbild** oben rechts → **E** schaltet die Erklärungen aus.
- Bedienung: **→ / ←** oder Presenter für die Szenen, Ziffern **1–8** springen direkt, **P** Stift, **W** Zeichnung löschen, **Esc** schließen. **⌨** zeigt alle Kürzel.
- Schüler finden dieselben Szenen mit Erklärungen selbst: Karte auf der Startseite und Knopf **💡 So funktioniert Docker** in den Räumen 1–4.

## Grundmuster jeder Szene: Vorhersagen → Klicken → Deuten

Leitfrage: **„Wie bekommt der TSV Lechwiesen seine Foto-Cloud auf den Server, ohne dass sich die Programme in die Quere kommen?“**

## Ablauf

| Zeit | Szene | Klicks (Taste) | Impuls an die Klasse | Erwartung / typische Fehlvorstellung | Merksatz (mündlich) |
|---|---|---|---|---|---|
| 0:00–2:00 | Einstieg | – | „Zwei Programme brauchen verschiedene Python-Versionen. Was tun?“ | „Zweiter Rechner“, „VM“ | – |
| 2:00–4:00 | 1 Wie wohnen Apps? | (startet mit Bare Metal) V, C, S | „Was ist bei der VM teuer?“ | Container = kleine VM (eigenes OS) | Container teilen sich den Kernel des Hosts. |
| 4:00–6:00 | 2 Image und Container | R, R, X, J | „Was passiert mit dem Image bei `docker rm`?“ | Image wird mitgelöscht | Image = Klasse, Container = Objekt. |
| 6:00–8:30 | 3 Was passiert bei docker run? | S ×5, dann N, S ×4 | „Woher kommt das Image?“ – vor Schritt ②; beim 2. Mal: „Wird wieder geladen?“ | Image liegt immer schon da / wird jedes Mal geladen | Fehlt das Image, holt `run` es aus der Registry. |
| 8:30–10:30 | 4 Lebenszyklus | R, T, X; dann R, X | „Warum ist `docker ps` leer?“ – nach T | gestoppt = gelöscht; `rm` auf laufendem Container | `ps` nur laufende, `ps -a` alle. |
| 10:30–12:30 | 5 Build · Ship · Run | S ×4 | „Ich ändere `index.html`. Reicht `run`?“ | Änderung wirkt sofort | Datei geändert → neu bauen. |
| 12:30–15:00 | 6 Port-Mapping | B, K | „Beide Container hören auf 80 – geht das?“ | „Port 80 doppelt geht nicht“ | Host-Port links, Container-Port rechts; Host-Port nur einmal. |
| 15:00–17:30 | 7 Container vergessen alles | W, X, N, V | „Was ist nach `rm` noch da? Nach `down -v`?“ | Volume weg nach `rm`; Bind Mount weg nach `down -v` | Volume = Schließfach, Bind Mount = eigener Ordner. |
| 17:30–19:00 | 8 Compose | U, L | „Wie findet `web` die Datenbank?“ | `localhost` | Service-Name statt `localhost`. |
| 19:00–20:00 | Übergang | Esc | „Im Serverraum startet ihr mit Raum 1. Die Erklärung findet ihr dort unter 💡.“ | – | – |

## Wenn die Zeit knapp ist

Szenen 2, 3, 6, 7 (etwa 12 Minuten). Szene 1 als Frage im Einstieg, Szene 8 vor Raum 4.

## Bezug zum Lernpaket

| Szene | Raum | Lernziele |
|---|---|---|
| 1–4 | Raum 1 · Hallo, Container! | LZ1 |
| 5–6 | Raum 2 · Die Vereinsseite | LZ2, LZ3 |
| 7 | Raum 3 · Daten, die bleiben | LZ4 |
| 8 | Raum 4 · Drei Dienste, eine Datei | LZ5 |
