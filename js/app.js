/* Dupe Studio · lógica de la página
   Depende de js/productos.js (array global `perfumes`). */

const $ = q => document.querySelector(q);
const $$ = q => [...document.querySelectorAll(q)];

// Número de WhatsApp de Dupe Studio (código de país + 9 dígitos, sin +)
const WHATSAPP_PHONE = '51972010344';

const PAGE_SIZE = 24;
const labelMap = { Dulces: 'Dulce', Frescos: 'Fresco', Amaderados: 'Amaderado', Florales: 'Floral' };

let activeFilter = 'Todos';
let searchTerm = '';
let visibleLimit = PAGE_SIZE;
let chosen = null;
let chosenSize = '50 ml';

/* ---------- Catálogo ---------- */

function filtered() {
  return perfumes.filter(p =>
    (activeFilter === 'Todos' || p.group === activeFilter || p.tags.includes(labelMap[activeFilter])) &&
    `${p.name} ${p.group} ${p.tags.join(' ')}`.toLowerCase().includes(searchTerm)
  );
}

function productCard(p) {
  return `<article class="product">
    <div class="product-art" style="--tone:${p.tone}">
      <span class="tag">${p.group.toUpperCase()}</span>
      <div class="bottle"><div class="cap"></div><div class="neck"></div><div class="glass"></div><div class="sticker"><b>DUPE STUDIO</b><small>PARFUM</small></div></div>
    </div>
    <div class="product-info">
      <div class="eyebrow">${p.tags.length ? p.tags.join(' · ') : 'Fragancia inspirada'}</div>
      <h3>${p.name}</h3>
      <p>${p.description ? p.description.substring(0, 80) + '...' : 'Inspiración olfativa de nuestro catálogo. Consulta aroma y disponibilidad.'}</p>
      <div class="meta"><span>30 · 50 · 100 ML*</span><span>${p.group}</span></div>
      <div class="actions">
        <button class="btn outline" data-detail="${p.id}">VER DETALLES</button>
        <button class="btn" data-ask="${p.id}">CONSULTAR ↗</button>
      </div>
    </div>
  </article>`;
}

function render() {
  const all = filtered();
  const items = all.slice(0, visibleLimit);
  $('#count').textContent = `Mostrando ${items.length} de ${all.length} fragancias · ${perfumes.length} en el catálogo`;
  $('#moreBtn').hidden = items.length >= all.length;
  $('#empty').hidden = all.length > 0;
  $('#products').innerHTML = items.map(productCard).join('');
}

$('#moreBtn').addEventListener('click', () => { visibleLimit += PAGE_SIZE; render(); });

$('#filters').addEventListener('click', e => {
  const b = e.target.closest('[data-filter]');
  if (!b) return;
  activeFilter = b.dataset.filter;
  visibleLimit = PAGE_SIZE;
  $$('.filter').forEach(x => x.classList.toggle('active', x === b));
  render();
});

$('#search').addEventListener('input', e => {
  searchTerm = e.target.value.toLowerCase().trim();
  visibleLimit = PAGE_SIZE;
  render();
});

/* ---------- Modales ---------- */

function openModal(id) { $(id).hidden = false; document.body.style.overflow = 'hidden'; }
function closeModal() { $$('.modalback').forEach(x => x.hidden = true); document.body.style.overflow = ''; }

function openDetail(id) {
  chosen = perfumes.find(x => x.id === id);
  chosenSize = '50 ml';
  $('#modalKind').textContent = chosen.group + ' / ' + (chosen.family || 'Por confirmar');
  $('#modalTitle').textContent = chosen.name;
  $('#modalBrand').textContent = chosen.brand ? 'Referencia: ' + chosen.brand : '';
  $('#modalDescription').textContent = chosen.description || 'Fragancia inspirada en ' + chosen.name + '.';

  if (chosen.accords && chosen.accords.length) {
    $('#modalAccords').innerHTML = chosen.accords.map(a =>
      `<span style="background:#2b2d24;padding:5px 9px;font-size:10px;border-radius:4px;border:1px solid #4a4d3f;color:#d7c7a5;letter-spacing:0.05em;text-transform:uppercase;">${a}</span>`
    ).join('');
  } else {
    $('#modalAccords').innerHTML = '';
  }

  if (chosen.pending === false) {
    $('#modalNotes').innerHTML = `
        <div><b>SALIDA</b><p>${chosen.notes.top}</p></div>
        <div><b>CORAZÓN</b><p>${chosen.notes.heart}</p></div>
        <div><b>FONDO</b><p>${chosen.notes.base}</p></div>
        <div style="grid-column: 1 / -1; margin-top:10px; border:none; border-top:1px solid #363a31; padding:15px 0 5px; display:flex; gap:20px; flex-wrap:wrap; background:transparent;">
            <div style="flex:1; border:none; padding:0; min-width:140px;"><b>OCASIÓN IDEAL</b><p>${chosen.occasion}</p></div>
            <div style="flex:1; border:none; padding:0; min-width:140px;"><b>CLIMA RECOMENDADO</b><p>${chosen.climate || 'Versátil'}</p></div>
        </div>`;
  } else {
    $('#modalNotes').innerHTML = `<div style="grid-column: 1 / -1;"><b>ESTADO</b><p>Ficha olfativa pendiente de investigación exhaustiva. Conservando nombre para revisión posterior.</p></div>`;
  }

  $('#sizeButtons').innerHTML = ['30 ml', '50 ml', '100 ml'].map(size =>
    `<button class="sizebutton ${size === chosenSize ? 'selected' : ''}" data-size="${size}">${size}</button>`
  ).join('');
  openModal('#detailModal');
}

/* ---------- WhatsApp ---------- */

function contact(message) {
  window.open('https://wa.me/' + WHATSAPP_PHONE + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
}

document.addEventListener('click', e => {
  const d = e.target.closest('[data-detail]');
  if (d) openDetail(d.dataset.detail);

  const a = e.target.closest('[data-ask]');
  if (a) {
    const p = perfumes.find(x => x.id === a.dataset.ask);
    contact(`Hola, me interesa ${p.name} de Dupe Studio. ¿Podrías darme más información?`);
  }

  const w = e.target.closest('[data-wa]');
  if (w) contact(w.dataset.wa);

  const s = e.target.closest('[data-size]');
  if (s) {
    chosenSize = s.dataset.size;
    $$('.sizebutton').forEach(b => b.classList.toggle('selected', b.dataset.size === chosenSize));
  }

  if (e.target.matches('[data-close]') || e.target.classList.contains('modalback')) closeModal();
});

$('#modalWa').addEventListener('click', () =>
  contact(`Hola, me interesa ${chosen.name} en presentación de ${chosenSize}. ¿Me brindas información y precio?`)
);

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------- Recomendaciones (quiz) ---------- */

$$('[data-mood]').forEach(b => b.addEventListener('click', () => {
  const m = b.dataset.mood;
  const tag = m === 'dulce' ? 'Dulce' : m === 'fresco' ? 'Fresco' : m === 'elegante' ? 'Amaderado' : m === 'noche' ? 'Dulce' : 'Dulce';

  let matches = perfumes.filter(p =>
    p.tags.includes(tag) ||
    (m === 'elegante' && (p.tags.includes('Amaderado') || p.tags.includes('Aromático'))) ||
    (m === 'noche' && p.occasion && p.occasion.toLowerCase().includes('noche'))
  );

  // Orden aleatorio para dar variedad en cada clic
  matches = matches.sort(() => 0.5 - Math.random());
  const recs = matches.slice(0, 3);

  if (recs.length > 0) {
    const html = recs.map(p => `
            <div class="quiz-card">
                <h4 style="margin:0 0 5px; font-family:Georgia,serif; font-size:18px; color:var(--gold);">${p.name}</h4>
                <p style="font-size:11px; margin:0 0 10px; color:#aaa; flex:1;">${p.description ? p.description.substring(0, 80) + '...' : 'Consulta para más detalles sobre esta fragancia.'}</p>
                <div style="display:flex; gap:8px;">
                    <button class="btn outline" style="flex:1; padding:8px; font-size:9px; min-height:auto;" data-detail="${p.id}">VER DETALLES</button>
                    <button class="btn" style="flex:1; padding:8px; font-size:9px; min-height:auto;" data-ask="${p.id}">WHATSAPP</button>
                </div>
            </div>
        `).join('');
    $('#quizResult').innerHTML = '<div style="width:100%;"><h3 style="color:var(--gold);font-size:13px;margin:5px 0 15px;letter-spacing:0.1em;text-transform:uppercase;">Nuestras recomendaciones para ti:</h3><div style="display:flex; gap:12px; flex-wrap:wrap;">' + html + '</div></div>';
  } else {
    $('#quizResult').innerHTML = 'Consulta con nosotros tu estilo favorito por WhatsApp.';
  }
}));

render();
