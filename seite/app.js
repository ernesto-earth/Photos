// Familienalbum – liest alben.json (erzeugt von bilder-aufbereiten.py) und zeigt Übersicht, Album und Leuchtkasten.
// Adressen: #/  ·  #/<album>  ·  #/<album>/<foto>
(() => {
  const $ = id => document.getElementById(id);
  const inhalt = $('inhalt'), lk = $('leuchtkasten'), lkBild = $('lk-bild');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pfad = (a, f, art) => `alben/${a.id}/${art}/${f.datei}.jpg`;
  const anzahl = n => n === 1 ? '1 Foto' : `${n} Fotos`;
  let alben = [], aktuell = null, index = 0, zuletzt = null;

  function uebersicht() {
    document.title = 'Familienalbum';
    $('unterzeile').textContent = `${alben.length} Alben · ${anzahl(alben.reduce((s, a) => s + a.fotos.length, 0))}`;
    let html = '', jahr;
    for (const a of alben) {
      const j = a.jahr ?? 'Sonstiges';
      if (j !== jahr) { html += `${jahr === undefined ? '' : '</div>'}<h2 class="jahr">${esc(j)}</h2><div class="alben">`; jahr = j; }
      html += `<a class="album" href="#/${a.id}"><img loading="lazy" src="${pfad(a, a.fotos[0], 'klein')}" alt="">
        <div><strong>${esc(a.titel)}</strong><span>${anzahl(a.fotos.length)}</span></div></a>`;
    }
    inhalt.innerHTML = html + '</div>';
  }

  function album(a) {
    document.title = `${a.titel} – Familienalbum`;
    $('unterzeile').textContent = '';
    const hoehe = innerWidth < 600 ? 140 : 220;
    inhalt.innerHTML = `<a class="zurueck" href="#/">← Alle Alben</a>
      <h1>${esc(a.titel)}</h1><p class="info">${[a.jahr, anzahl(a.fotos.length)].filter(Boolean).join(' · ')}</p>
      <div class="raster">${a.fotos.map(f => {
        const v = f.b / f.h;
        return `<a href="#/${a.id}/${f.datei}" style="flex:${v} 1 ${v * hoehe}px;aspect-ratio:${f.b}/${f.h}">
          <img loading="lazy" src="${pfad(a, f, 'klein')}" alt=""></a>`;
      }).join('')}</div>`;
  }

  function zeigen(i) {
    index = (i + aktuell.fotos.length) % aktuell.fotos.length;
    const f = aktuell.fotos[index];
    lkBild.src = pfad(aktuell, f, 'gross');
    $('lk-zaehler').textContent = `${index + 1} / ${aktuell.fotos.length}`;
    $('lk-laden').href = lkBild.src;
    $('lk-laden').download = `${aktuell.id}-${f.datei}.jpg`;
    for (const d of [1, -1]) new Image().src = pfad(aktuell, aktuell.fotos[(index + d + aktuell.fotos.length) % aktuell.fotos.length], 'gross');
  }
  const gehe = d => { zeigen(index + d); history.replaceState(null, '', `#/${aktuell.id}/${aktuell.fotos[index].datei}`); };
  const schliessen = () => { location.hash = `#/${aktuell.id}`; };

  function route() {
    const [aid, fid] = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/');
    const a = alben.find(x => x.id === aid);
    if (!a) { lk.hidden = true; aktuell = null; return uebersicht(); }
    if (aktuell !== a || !inhalt.querySelector('.raster')) { aktuell = a; album(a); if (!fid) scrollTo(0, 0); }
    const i = fid ? a.fotos.findIndex(f => f.datei === fid) : -1;
    if (i >= 0) { zuletzt = zuletzt || document.activeElement; lk.hidden = false; document.body.style.overflow = 'hidden'; zeigen(i); $('lk-zu').focus(); }
    else if (!lk.hidden) {
      lk.hidden = true; document.body.style.overflow = '';
      inhalt.querySelectorAll('.raster a')[index]?.focus({ preventScroll: false }); zuletzt = null;
    }
  }

  $('lk-zu').onclick = schliessen;
  $('lk-vor').onclick = () => gehe(1);
  $('lk-zurueck').onclick = () => gehe(-1);
  lk.addEventListener('click', e => { if (e.target === lk) schliessen(); });
  addEventListener('keydown', e => {
    if (lk.hidden) return;
    if (e.key === 'Escape') schliessen();
    else if (e.key === 'ArrowRight') gehe(1);
    else if (e.key === 'ArrowLeft') gehe(-1);
  });
  let startX = null;
  lk.addEventListener('touchstart', e => { startX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  lk.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX; startX = null;
    if (Math.abs(dx) > 50) gehe(dx < 0 ? 1 : -1);
  });
  addEventListener('hashchange', route);

  fetch('alben.json', { cache: 'no-cache' }).then(r => r.json()).then(d => { alben = d.alben; route(); })
    .catch(() => { inhalt.textContent = 'Die Alben konnten nicht geladen werden.'; });
})();
