/* =====================================================================
   PDF ERSTELLEN – ohne Server, ohne Internet, ohne fremde Bibliothek.
   PDF.erstellen(titel, html, dateiname) setzt das HTML als A4-Seiten,
   zeichnet sie als Bild (SVG foreignObject → Canvas) und speichert eine
   echte PDF-Datei (Download). Seitenumbrüche nur zwischen Absätzen,
   Tabellenzeilen und Listenpunkten; Seitenzahlen unten rechts.
   Bilder und Schriften werden eingebettet (data:-URLs), damit das Bild
   nicht leer bleibt. Klappt das im Browser nicht (z. B. alte Browser,
   Datei über file:// ohne Zugriff auf Bilder), öffnet sich als Rückfall
   der Druckdialog („Als PDF speichern“).
   Geladen vor js/engine.js. Test: PDF.erstellen(...) liefert ein Promise
   mit { ok, seiten, groesse } bzw. { ok: false, grund }.
   ===================================================================== */
var PDF = (function () {
  'use strict';
  var BREITE = 794, HOEHE = 1123, RAND = 40, SKALA = 2;   // A4 in CSS-Pixeln (96 dpi), Druckauflösung ×2
  var INHALT_B = BREITE - 2 * RAND, INHALT_H = HOEHE - 2 * RAND - 24;

  function alsDataUrl(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url); return r.blob(); }).then(function (b) {
      return new Promise(function (ok, nein) { var f = new FileReader(); f.onload = function () { ok(f.result); }; f.onerror = nein; f.readAsDataURL(b); });
    });
  }
  /* Alle Stile der Seite einsammeln; Schriften als data:-URL einbetten */
  function stile() {
    var teile = [], warten = [];
    Array.prototype.forEach.call(document.styleSheets, function (sh) {
      var regeln; try { regeln = sh.cssRules; } catch (_) { return; }
      Array.prototype.forEach.call(regeln, function (r) {
        if (r.type === 5) {   // @font-face
          var t = r.cssText, m = /url\(["']?([^"')]+)["']?\)/.exec(t), basis = sh.href || location.href;
          if (!m || /^data:/.test(m[1])) { teile.push(t); return; }
          var i = teile.push('') - 1;
          warten.push(alsDataUrl(new URL(m[1], basis).href).then(function (d) { teile[i] = t.replace(m[0], 'url("' + d + '")'); }, function () { teile[i] = ''; }));
        } else if (r.type !== 4 || !/print/.test(r.media && r.media.mediaText)) teile.push(r.cssText);
      });
    });
    return Promise.all(warten).then(function () { return teile.join('\n'); });
  }
  function bilderEinbetten(wurzel) {
    return Promise.all(Array.prototype.map.call(wurzel.querySelectorAll('img'), function (img) {
      var src = img.getAttribute('src') || '';
      if (/^data:/.test(src)) return null;
      return alsDataUrl(new URL(src, location.href).href).then(function (d) { img.setAttribute('src', d); });
    }));
  }
  function geladen(wurzel) {
    return Promise.all(Array.prototype.map.call(wurzel.querySelectorAll('img'), function (img) {
      return img.complete ? null : new Promise(function (ok) { img.onload = img.onerror = ok; });
    }));
  }
  /* Mögliche Seitenumbrüche: Unterkante von Absätzen, Zeilen, Listenpunkten, Kästen */
  function umbrueche(wurzel) {
    var oben = wurzel.getBoundingClientRect().top, set = {};
    Array.prototype.forEach.call(wurzel.querySelectorAll('p,li,tr,h1,h2,h3,h4,table,ul,ol,div,figure,img,pre'), function (e) {
      var r = e.getBoundingClientRect(); if (r.height) set[Math.round(r.bottom - oben)] = 1;
    });
    return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
  }
  function seitenTeilen(gesamt, punkte) {
    var seiten = [], y = 0;
    while (y < gesamt - 1) {
      var ende = Math.min(gesamt, y + INHALT_H), gut = punkte.filter(function (p) { return p > y + INHALT_H * 0.4 && p <= ende; });
      if (ende < gesamt && gut.length) ende = gut[gut.length - 1];
      seiten.push([y, ende]); y = ende;
    }
    return seiten;
  }
  function svgBild(xhtml, b, h) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + b + '" height="' + h + '"><foreignObject width="100%" height="100%">' + xhtml + '</foreignObject></svg>';
    return new Promise(function (ok, nein) {
      var img = new Image(); img.onload = function () { ok(img); }; img.onerror = function () { nein(new Error('SVG-Bild')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  /* Minimale PDF-Datei: je Seite ein JPEG-Bild über die ganze A4-Seite */
  function pdfDatei(jpegs, titel) {
    var enc = new TextEncoder(), teile = [], laenge = 0, offs = [];
    function schreib(x) { var b = typeof x === 'string' ? enc.encode(x) : x; teile.push(b); laenge += b.length; }
    function obj(n, kopf, strom) { offs[n] = laenge; schreib(n + ' 0 obj\n' + kopf + '\n'); if (strom) { schreib('stream\n'); schreib(strom); schreib('\nendstream\n'); } schreib('endobj\n'); }
    var n = jpegs.length, kids = [];
    for (var i = 0; i < n; i++) kids.push((3 + i * 3) + ' 0 R');
    schreib('%PDF-1.4\n%âãÏÓ\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + n + ' >>');
    jpegs.forEach(function (j, k) {
      var p = 3 + k * 3, inhalt = enc.encode('q 595.28 0 0 841.89 0 0 cm /Bild Do Q');
      obj(p, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Bild ' + (p + 2) + ' 0 R >> >> /Contents ' + (p + 1) + ' 0 R >>');
      obj(p + 1, '<< /Length ' + inhalt.length + ' >>', inhalt);
      obj(p + 2, '<< /Type /XObject /Subtype /Image /Width ' + j.b + ' /Height ' + j.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + j.daten.length + ' >>', j.daten);
    });
    var info = 3 + n * 3;
    obj(info, '<< /Title (' + String(titel).replace(/[()\\]/g, '').replace(/[^\x20-\x7e]/g, '?') + ') /Producer (Lernpaket-Kompass) >>');
    var xref = laenge;
    schreib('xref\n0 ' + (info + 1) + '\n0000000000 65535 f \n');
    for (var o = 1; o <= info; o++) schreib(('0000000000' + offs[o]).slice(-10) + ' 00000 n \n');
    schreib('trailer\n<< /Size ' + (info + 1) + ' /Root 1 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(teile, { type: 'application/pdf' });
  }
  function jpegBytes(canvas) {
    var b64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1], bin = atob(b64), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  function speichern(blob, dateiname) {
    var a = document.createElement('a'), url = URL.createObjectURL(blob);
    a.href = url; a.download = dateiname; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
  }
  function dateiName(titel) {
    return (String(titel || 'Dokument').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'dokument') + '.pdf';
  }

  function erstellen(titel, html, dateiname, rueckfall) {
    var huelle = document.createElement('div');
    huelle.setAttribute('aria-hidden', 'true');
    huelle.style.cssText = 'position:fixed;left:-20000px;top:0;width:' + INHALT_B + 'px;background:#fff;color:#111;';
    var blatt = document.createElement('div');
    blatt.className = 'pdf-blatt';
    // Schrift wie auf der Seite festlegen: Im SVG-Bild gibt es kein <body>, sonst wechselt die Schrift und die Umbrüche passen nicht
    var bs = getComputedStyle(document.body);
    blatt.style.cssText = 'width:' + INHALT_B + 'px;background:#fff;color:#111;font-family:' + bs.fontFamily.replace(/"/g, "'") + ';font-size:14px;line-height:1.45;';
    blatt.innerHTML = html;
    huelle.appendChild(blatt);
    document.body.appendChild(huelle);
    var css;
    return stile().then(function (c) { css = c; return bilderEinbetten(blatt); }).then(function () { return geladen(blatt); }).then(function () {
      var gesamt = Math.ceil(blatt.getBoundingClientRect().height), punkte = umbrueche(blatt);
      var st = document.createElement('style'); st.textContent = css + '\n.pdf-blatt *{animation:none!important;transition:none!important}';
      blatt.insertBefore(st, blatt.firstChild);
      var xhtml = new XMLSerializer().serializeToString(blatt);
      return svgBild(xhtml, INHALT_B, gesamt).then(function (img) {
        var seiten = seitenTeilen(gesamt, punkte), jpegs = [];
        seiten.forEach(function (s, k) {
          var cv = document.createElement('canvas'); cv.width = BREITE * SKALA; cv.height = HOEHE * SKALA;
          var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
          ctx.scale(SKALA, SKALA);
          ctx.drawImage(img, 0, s[0], INHALT_B, s[1] - s[0], RAND, RAND, INHALT_B, s[1] - s[0]);
          ctx.fillStyle = '#64748b'; ctx.font = '10px Arial, sans-serif'; ctx.textAlign = 'right';
          ctx.fillText('Seite ' + (k + 1) + ' von ' + seiten.length, BREITE - RAND, HOEHE - RAND / 2);
          ctx.textAlign = 'left'; ctx.fillText(String(titel).slice(0, 90), RAND, HOEHE - RAND / 2);
          jpegs.push({ daten: jpegBytes(cv), b: cv.width, h: cv.height });
        });
        var blob = pdfDatei(jpegs, titel);
        speichern(blob, dateiname || dateiName(titel));
        return { ok: true, seiten: seiten.length, groesse: blob.size };
      });
    }).catch(function (e) {
      if (rueckfall) rueckfall();
      return { ok: false, grund: String(e && e.message || e) };
    }).then(function (r) { huelle.remove(); return r; });
  }

  /* Knopf „📄 … als PDF erstellen“: zeigt während der Arbeit „PDF wird erstellt …“ */
  function knopf(text, holeInhalt, rueckfall) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'pdf-knopf'; b.textContent = '📄 ' + text;
    b.addEventListener('click', function () {
      if (b.disabled) return;
      var x = holeInhalt(); var alt = b.textContent;
      b.disabled = true; b.textContent = '⏳ PDF wird erstellt …';
      erstellen(x.titel, x.html, x.datei, rueckfall ? function () { rueckfall(x); } : null).then(function (r) {
        b.disabled = false; b.textContent = r.ok ? '✔ PDF gespeichert – noch einmal?' : alt;
        b.setAttribute('data-ergebnis', r.ok ? 'ok' : 'rueckfall');
      });
    });
    return b;
  }
  return { erstellen: erstellen, knopf: knopf, dateiName: dateiName };
})();
