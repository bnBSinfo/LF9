#!/usr/bin/env python3
"""Zieht alle Projektdateien (\\paragraph*{\\nolinkurl{pfad}} + Verbatim) aus anleitung.tex
und schreibt sie als js/dateien.js (var DATEIEN = {pfad: inhalt}).

  python3 dateien_aus_tex.py <anleitung.tex> <src/js/dateien.js>
"""
import json, re, sys

tex = open(sys.argv[1], encoding='utf-8').read()
muster = re.compile(r'\\paragraph\*\{(?:\d\) )?\\nolinkurl\{([^}]+)\}\}\s*\\begin\{Verbatim\}\n(.*?)\\end\{Verbatim\}', re.S)
dateien = {pfad: inhalt for pfad, inhalt in muster.findall(tex)}
with open(sys.argv[2], 'w', encoding='utf-8') as f:
    f.write('/* Automatisch erzeugt aus anleitung.tex (werkzeug/dateien_aus_tex.py) – nicht von Hand ändern. */\n')
    f.write('var DATEIEN = ' + json.dumps(dateien, ensure_ascii=False, indent=1) + ';\n')
print(len(dateien), 'Dateien:', ', '.join(dateien))
