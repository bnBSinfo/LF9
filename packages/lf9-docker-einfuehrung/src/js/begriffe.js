/* =====================================================================
   BEGRIFFE (P16) – In der Sprachstufe „Einfach“ sind Fachbegriffe aus dem
   Glossar (PAKET.glossar) gepunktet unterstrichen. Die Erklärung erscheint
   beim Darüberfahren mit der Maus, beim Antippen (Tablet) und beim
   Ansteuern mit der Tastatur (Tab). In „Standard“ bleibt der Text unverändert.
   Nicht verändern; die Erklärungen kommen aus dem Glossar (bei „Einfach“
   aus EINFACH.glossar). Laden nach js/sprache.js.
   ===================================================================== */
(function () {
  'use strict';
  var NICHT = 'header,footer,.kopf,button,a,input,select,textarea,label,option,script,style,svg,code,pre,dt,dd,h1,h2,.begriff,#begriff-tipp,.glossar,.glossar-box,.sprachwahl,.st-pfadwahl,.st-profiband,.tafel,[contenteditable]';
  var BUCHST = 'A-Za-zÄÖÜäöüß0-9';
  var tipp = null, aktiv = null, laeuft = false, liste = null, quelle = null;

  var css = document.createElement('style');
  css.textContent = '.begriff{border-bottom:2px dotted currentColor;cursor:help;border-radius:2px}' +
    '.begriff:focus{outline:2px solid #f59e0b;outline-offset:1px}' +
    '#begriff-tipp{position:absolute;z-index:9999;max-width:min(300px,90vw);background:#1b2333;color:#fff;padding:8px 10px;border-radius:8px;font-size:.9rem;line-height:1.4;box-shadow:0 4px 14px #0004;pointer-events:none}' +
    '#begriff-tipp b{display:block;margin-bottom:2px}' +
    '@media print{.begriff{border:0}#begriff-tipp{display:none}}';
  document.head.appendChild(css);

  function einfach() { return !!(window.SPRACHE && window.SPRACHE.stufe === 'einfach'); }
  function ohneHtml(s) { var d = document.createElement('div'); d.innerHTML = String(s || ''); return (d.textContent || '').trim(); }
  /* „der Router, die Router“ oder „Subnetzmaske (die)“ → „Router“ bzw. „Subnetzmaske“ */
  function kern(b) { return ohneHtml(b).split(/[,(;:]/)[0].replace(/^(der|die|das)\s+/i, '').trim(); }

  function eintraege() {
    var G = (window.PAKET && window.PAKET.glossar) || [];
    if (G === quelle && liste) return liste;
    quelle = G;
    liste = G.map(function (g) { return { wort: kern(g.begriff), titel: ohneHtml(g.begriff), erkl: ohneHtml(g.erklaerung) }; })
      .filter(function (e) { return e.wort.length > 2 && e.erkl; })
      .sort(function (a, b) { return b.wort.length - a.wort.length; });
    liste.forEach(function (e) {
      var w = e.wort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      /* Wort mit üblichen Endungen (Router, Routern, Switches), nicht mitten in einem anderen Wort */
      e.re = new RegExp('(^|[^' + BUCHST + '-])(' + w + '(?:e|en|n|s|es)?)(?![' + BUCHST + '-])');
    });
    return liste;
  }

  function markiere(wurzel) {
    var L = eintraege(); if (!L.length) return;
    var walker = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || n.nodeValue.length < 3) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        return p && !p.closest(NICHT) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var knoten = []; while (walker.nextNode()) knoten.push(walker.currentNode);
    knoten.forEach(function (n) {
      var block = n.parentElement.closest('p,li,td,th,div,section') || n.parentElement;
      for (var i = 0; i < L.length; i++) {
        var e = L[i], m = e.re.exec(n.nodeValue);
        if (!m) continue;
        /* je Begriff nur einmal pro Absatz markieren */
        if (block.querySelector('.begriff[data-wort="' + e.wort.replace(/"/g, '') + '"]')) continue;
        var start = m.index + m[1].length, rest = n.splitText(start);
        rest.nodeValue = rest.nodeValue.slice(m[2].length);
        var s = document.createElement('span');
        s.className = 'begriff'; s.tabIndex = 0; s.textContent = m[2];
        s.setAttribute('data-wort', e.wort); s.setAttribute('data-erkl', e.erkl); s.setAttribute('data-titel', e.titel);
        s.setAttribute('aria-label', m[2] + ': ' + e.erkl);
        rest.parentNode.insertBefore(s, rest);
        n = rest; i = -1; /* im Rest weitersuchen */
        if (!n.nodeValue) break;
      }
    });
  }
  function entferne() {
    document.querySelectorAll('.begriff').forEach(function (s) { s.replaceWith(document.createTextNode(s.textContent)); });
    verstecke();
  }

  function zeige(s) {
    if (!tipp) { tipp = document.createElement('div'); tipp.id = 'begriff-tipp'; tipp.setAttribute('role', 'tooltip'); document.body.appendChild(tipp); }
    aktiv = s;
    tipp.innerHTML = '';
    var b = document.createElement('b'); b.textContent = s.getAttribute('data-titel'); tipp.appendChild(b);
    tipp.appendChild(document.createTextNode(s.getAttribute('data-erkl')));
    tipp.style.display = 'block';
    var r = s.getBoundingClientRect(), w = tipp.offsetWidth, x = Math.max(8, Math.min(r.left + window.scrollX, window.scrollX + document.documentElement.clientWidth - w - 8));
    var y = r.bottom + window.scrollY + 6;
    if (r.bottom + tipp.offsetHeight + 12 > window.innerHeight) y = r.top + window.scrollY - tipp.offsetHeight - 6;
    tipp.style.left = x + 'px'; tipp.style.top = y + 'px';
  }
  function verstecke() { if (tipp) tipp.style.display = 'none'; aktiv = null; }

  document.addEventListener('mouseover', function (e) { var s = e.target.closest && e.target.closest('.begriff'); if (s) zeige(s); });
  document.addEventListener('mouseout', function (e) { var s = e.target.closest && e.target.closest('.begriff'); if (s && s === aktiv && !s.contains(e.relatedTarget)) verstecke(); });
  document.addEventListener('focusin', function (e) { if (e.target.classList && e.target.classList.contains('begriff')) zeige(e.target); });
  document.addEventListener('focusout', function (e) { if (e.target === aktiv) verstecke(); });
  document.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('.begriff');
    if (s) { if (s === aktiv && e.pointerType !== 'mouse') verstecke(); else zeige(s); } else verstecke();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') verstecke(); });
  window.addEventListener('scroll', verstecke, { passive: true });

  var plan = null;
  function pruefe() {
    plan = null; laeuft = true;
    try { if (einfach()) markiere(document.querySelector('main') || document.body); else if (document.querySelector('.begriff')) entferne(); }
    finally { laeuft = false; }
  }
  new MutationObserver(function () { if (!laeuft && !plan) plan = setTimeout(pruefe, 120); })
    .observe(document.body, { childList: true, subtree: true, characterData: true });
  pruefe();
  window.BEGRIFFE = { pruefe: pruefe };
})();
