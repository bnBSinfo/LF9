#!/usr/bin/env python3
"""Trägt alle Dateien aus src/ ins Manifest ein und packt das SCORM-ZIP.
  python3 werkzeug/zip.py   (aus dem Paketordner oder mit Pfad zum Paketordner)"""
import os, re, sys, zipfile
paket = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..'))
src = os.path.join(paket, 'src')
dateien = sorted(os.path.relpath(os.path.join(w, f), src).replace(os.sep, '/')
                 for w, _, fs in os.walk(src) for f in fs if not f.startswith('.'))
m = os.path.join(src, 'imsmanifest.xml')
t = open(m, encoding='utf-8').read()
liste = '\n'.join(f'      <file href="{d}"/>' for d in dateien if d != 'imsmanifest.xml')
t = re.sub(r'(<resource [^>]*>\n)(.*?)(\n    </resource>)', lambda x: x.group(1) + liste + x.group(3), t, flags=re.S)
open(m, 'w', encoding='utf-8').write(t)
ziel = os.path.join(paket, os.path.basename(paket) + '_scorm12.zip')
with zipfile.ZipFile(ziel, 'w', zipfile.ZIP_DEFLATED) as z:
    for d in dateien:
        z.write(os.path.join(src, d), d)
print(ziel, len(dateien), 'Dateien')
