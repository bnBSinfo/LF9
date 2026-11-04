/* =====================================================================
   DIFFERENZIERUNG (Leitfaden P15, P16) – Leistungspfad und Sprachstufe.
   Geladen VOR js/inhalt.js, damit L() und P() in den Szenen bereitstehen.

   Sprachstufe (P16): 'standard' oder 'einfach'.
     L('Standardtext', 'Text in einfacher Sprache') – für Texte IN Szenen
     (Rückmeldungen, Beschriftungen). Die festen Texte des Pakets (Aufträge,
     Glossar, Fragen …) stehen in einfacher Sprache in js/sprache.js.

   Leistungspfad (P15): 'basis' (⛰️, mehr Geländer) oder 'profi' (🚀, Transfer).
     P(basisWert, profiWert)   – Wert für den aktuellen Pfad (z. B. den Fall)
     STUFEN.pfadwahl(box, {empfehlung, text})  – Umschalter Basis/Profi in der Szene
     STUFEN.profiBand(text)    – violettes Band über Profi-Aufgaben
     STUFEN.einstufung(box, {aufgaben: [{frage, pruefe(antwort) → bool}], weiter(stufe)})
                               – zwei kurze Aufgaben (Basis, Profi) schlagen den Pfad vor
     STUFEN.satzanfaenge(liste) – Formulierungshilfen für Selbsterklären/Mitdenken (P16)
   Die Wahl wird im Browser gemerkt. Der Nachweis ist für alle Pfade gleich.
   ===================================================================== */
var SPRACHE = { stufe: 'standard' };
function L(standard, einfach) { return SPRACHE.stufe === 'einfach' && einfach !== undefined ? einfach : standard; }

var PFAD = { stufe: 'basis' };
function P(basis, profi) { return PFAD.stufe === 'profi' && profi !== undefined ? profi : basis; }

var STUFEN = (function () {
  'use strict';
  function schluessel(art) { return ((window.PAKET && window.PAKET.id) || 'lernpaket') + '-' + art; }
  function lies(art, standard) { try { return localStorage.getItem(schluessel(art)) || standard; } catch (_) { return standard; } }
  function merke(art, wert) { try { localStorage.setItem(schluessel(art), wert); } catch (_) { /* ohne Speicher: gilt bis zum Neuladen */ } }
  function el(tag, attrs, kinder) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]);
    });
    (kinder || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  var NAME = { basis: '⛰️ Basis', profi: '🚀 Profi' };

  /* Profi-Inhalte überall gleich kennzeichnen: Violett + 🚀 + Wort „Profi“ */
  var stil = document.createElement('style');
  stil.textContent = ':root{--profi:#6d28d9;--profi-soft:#f3edff;--profi-line:#b79cf5}' +
    '.st-pfadwahl{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 10px}' +
    '.st-pfadwahl button{min-height:44px;font-weight:700}' +
    '.st-pfadwahl button[aria-pressed="true"]{background:var(--ok-soft,#e8f5ec);border-color:var(--ok,#15803d)}' +
    '.st-pfadwahl button.profi[aria-pressed="true"]{background:var(--profi);border-color:var(--profi);color:#fff}' +
    '.st-pfadwahl .hinweis{font-size:.85rem;color:var(--muted,#555);flex-basis:100%}' +
    '.st-profiband{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;background:var(--profi);color:#fff;border-radius:10px;padding:8px 14px;margin:0 0 10px;font-weight:700}' +
    '.st-profiband span{font-weight:400;opacity:.9;font-size:.92rem}' +
    '.buehne:has(.st-profiband),.buehne:has(.st-pfadwahl .profi[aria-pressed="true"]){box-shadow:inset 0 0 0 3px var(--profi)}' +
    '.st-satz{margin:6px 0 0;font-size:.9rem}.st-satz b{display:block;margin-bottom:2px}' +
    '.st-satz ul{margin:0;padding-left:1.2em}.st-satz li{margin:1px 0}';
  document.head.appendChild(stil);

  PFAD.stufe = lies('pfad', 'basis') === 'profi' ? 'profi' : 'basis';

  function neuZeichnen() {
    if (!window.LERNPAKET) return;
    var a = window.LERNPAKET.ansicht();
    if (a.teil !== 'nachweis') window.LERNPAKET.zeige(a.teil, a.i);
  }
  function setzePfad(stufe, zeichnen) {
    PFAD.stufe = stufe === 'profi' ? 'profi' : 'basis';
    merke('pfad', PFAD.stufe);
    if (zeichnen !== false) neuZeichnen();
  }
  function pfadwahl(box, o) {
    o = o || {};
    var w = el('div', { class: 'st-pfadwahl', role: 'group', 'aria-label': L('Schwierigkeit wählen', 'Wähle: leicht oder schwer') });
    ['basis', 'profi'].forEach(function (s) {
      w.appendChild(el('button', { type: 'button', class: s, 'aria-pressed': String(PFAD.stufe === s), text: s === 'basis' ? L(NAME.basis, '⛰️ Basis (leichter)') : L(NAME.profi, '🚀 Profi (schwerer)'),
        onclick: function () { if (PFAD.stufe !== s) setzePfad(s); } }));
    });
    var t = o.text || (o.empfehlung ? L('Empfehlung nach deiner Einstufung: ' + NAME[o.empfehlung] + '. Du kannst jederzeit wechseln.', 'Wir empfehlen: ' + NAME[o.empfehlung] + '. Du kannst wechseln.') : L('Du kannst jederzeit wechseln. Für den Nachweis reicht Basis.', 'Du kannst wechseln. Für den Test reicht Basis.'));
    w.appendChild(el('span', { class: 'hinweis', text: t }));
    if (box) box.appendChild(w);
    return w;
  }
  function profiBand(text) {
    return el('div', { class: 'st-profiband', html: '🚀 ' + L('PROFI-AUFGABE', 'SCHWERE AUFGABE') + ' <span>' + (text || L('freiwillig · Mindestziel ist der Basis-Pfad', 'freiwillig · Basis reicht für den Test')) + '</span>' });
  }
  function einstufung(box, o) {
    var w = el('div', { class: 'st-einstufung' });
    w.appendChild(el('p', { html: L('<b>Kurze Einstufung:</b> zwei Aufgaben. Danach schlagen wir dir einen Weg vor.', '<b>Kurzer Test:</b> 2 Aufgaben. Dann bekommst du einen Vorschlag.') }));
    var felder = o.aufgaben.map(function (a, i) {
      var id = 'st-e' + i + '-' + Math.random().toString(36).slice(2, 7), inp = el('input', { id: id, type: 'text', autocomplete: 'off' });
      w.appendChild(el('div', { class: 'st-feld' }, [el('label', { for: id, html: (i ? NAME.profi : NAME.basis) + ': ' + a.frage }), inp]));
      return inp;
    });
    w.appendChild(el('button', { type: 'button', class: 'primaer', text: L('Einstufen', 'Prüfen'), onclick: function () {
      var ok = felder.map(function (f, i) { return !!o.aufgaben[i].pruefe(f.value.trim()); });
      var stufe = ok[0] && ok[1] ? 'profi' : 'basis';
      setzePfad(stufe, false);
      o.weiter(stufe, ok);
    } }));
    box.appendChild(w);
    return w;
  }
  function satzanfaenge(liste) {
    return el('div', { class: 'st-satz' }, [el('b', { text: L('Satzanfänge, wenn du sie brauchst:', 'So kannst du anfangen:') }), el('ul', {}, liste.map(function (s) { return el('li', { text: s }); }))]);
  }
  return { pfad: function () { return PFAD.stufe; }, setzePfad: setzePfad, pfadwahl: pfadwahl, profiBand: profiBand, einstufung: einstufung, satzanfaenge: satzanfaenge, lies: lies, merke: merke };
})();
