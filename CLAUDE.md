# lf9-bsinfo

Lernmaterial für Lernfeld 9. Interaktive Lernpakete entstehen mit den Lernpaket-Kompass-Skills in `.claude/skills/` (Quelle: `.claude/skills/QUELLE.txt`).

## Python für die Skill-Skripte

Skripte der Skills (`paket.py`, `pruefe_paket.py`, `auswerten.py`) immer mit `.venv/bin/python3` ausführen, nicht mit `python3`:

```bash
.venv/bin/python3 .claude/skills/lernpaket-pruefen/scripts/pruefe_paket.py <paket> --bilder <ordner>
```

- Die Homebrew-Pythons (3.13, 3.15) sind auf diesem Mac (macOS 26.2) defekt: `pyexpat` findet die passende `libexpat` nicht, pip stürzt ab.
- `.venv` nutzt deshalb das Apple-Python 3.9 (`/usr/bin/python3`) und enthält Playwright mit Chromium.
- Neu anlegen: `/usr/bin/python3 -m venv .venv && .venv/bin/python3 -m pip install playwright && .venv/bin/python3 -m playwright install chromium`
- Der Browser-Test braucht Zugriff außerhalb der Sandbox (Chromium, lokaler Webserver).
