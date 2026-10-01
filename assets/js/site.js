(() => {
  const input = document.querySelector('[data-guide-search]');
  const grids = [...document.querySelectorAll('.guide-grid')];
  const buttons = [...document.querySelectorAll('[data-category-filter]')];
  const empty = document.querySelector('[data-search-empty]');
  if (!input || !grids.length) return;

  const cards = grids.flatMap(grid => [...grid.querySelectorAll('.guide-card')]);
  let activeCategory = 'all';

  function update() {
    const query = input.value.trim().toLocaleLowerCase('ru-RU');
    let visible = 0;

    cards.forEach(card => {
      const category = card.dataset.category || 'giants';
      const text = card.textContent.toLocaleLowerCase('ru-RU');
      const match = (!query || text.includes(query)) &&
        (activeCategory === 'all' || category === activeCategory);
      card.hidden = !match;
      if (match) visible++;
    });

    grids.forEach(grid => {
      const category = grid.dataset.category || (grid.classList.contains('pets-grid') ? 'pets' : 'giants');
      const hasVisible = cards.some(card => !card.hidden && (card.dataset.category || 'giants') === category);
      grid.hidden = !hasVisible;
    });

    document.querySelectorAll('[data-section]').forEach(section => {
      section.hidden = activeCategory !== 'all' && section.dataset.section !== activeCategory;
    });

    if (empty) empty.hidden = visible !== 0;
  }

  input.addEventListener('input', update);

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.categoryFilter;
      buttons.forEach(item => item.classList.toggle('is-active', item === button));
      update();
    });
  });

  update();
})();

(() => {
  const button = document.querySelector('[data-share]');
  if (!button) return;

  button.addEventListener('click', async () => {
    const data = {
      title: document.title.replace(' — COD Guides', ''),
      text: document.querySelector('meta[name="description"]')?.content || document.title,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.url);
        button.textContent = '✓ Ссылка скопирована';
        setTimeout(() => { button.textContent = '📤 Поделиться'; }, 1800);
      } else {
        window.prompt('Скопируйте ссылку:', data.url);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        button.textContent = '⚠️ Не удалось поделиться';
        setTimeout(() => { button.textContent = '📤 Поделиться'; }, 1800);
      }
    }
  });
})();

/* PET BUILD CATEGORY TABS */
(() => {
  const tabs=[...document.querySelectorAll('[data-build-tab]')];
  const panels=[...document.querySelectorAll('[data-build-panel]')];
  if(!tabs.length||!panels.length)return;
  const open=(type,scroll)=>{
    tabs.forEach(x=>x.classList.toggle('is-active',x.dataset.buildTab===type));
    panels.forEach(x=>x.classList.toggle('is-visible',x.dataset.buildPanel===type));
    if(scroll){
      const p=document.querySelector('[data-build-panel="'+type+'"]');
      if(p)p.scrollIntoView({behavior:'smooth',block:'start'});
    }
  };
  tabs.forEach(x=>x.addEventListener('click',()=>open(x.dataset.buildTab,true)));
  open(tabs[0].dataset.buildTab,false);
})();


/* PET BUILD SKILL ART — real CoD Fan icons */
(() => {
  const normalizeSlug = (el) => {
    let slug = (el.querySelector('.pet-build-skill-art')?.dataset.skillIcon || '').trim();
    const title = (el.getAttribute('title') || '').trim();
    if (!slug) return '';
    if (/^Улучш\\./i.test(title) && !slug.startsWith('advanced_')) slug = 'advanced_' + slug;
    if (/^Интенсив\\./i.test(title) && !slug.startsWith('intense_')) slug = 'intense_' + slug;
    return slug;
  };

  document.querySelectorAll('.pet-build-skill').forEach((cell) => {
    const art = cell.querySelector('.pet-build-skill-art');
    if (!art) return;
    const slug = normalizeSlug(cell);
    if (!slug) return;
    art.dataset.skillIcon = slug;
    art.innerHTML = '';
    const img = document.createElement('img');
    img.src = 'https://codfan.com/img/warpets/skills/' + slug + '.png?v=1.1.0';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    art.appendChild(img);
    img.addEventListener('error', () => {
      cell.classList.add('is-broken');
      art.classList.add('is-broken-art');
    }, {once:true});
  });
})();

/* PET BUILD SKILL TOOLTIPS — 3★ UI */
(() => {
  const amberIcon = '<span class="pet-amber-icon">◆</span>';
  const costs = {
    barbarism:[0,0,0], advanced_barbarism:['a','a','a'], intense_barbarism:[960,5771,28000],
    concentration:[0,0,0], advanced_concentration:['a','a','a'], intense_concentration:[625,5031,17618],
    chain_strike:[187,1411,7195], advanced_chain_strike:['a','a','a'], intense_chain_strike:[96,1411,7195],
    painbloom:[0,0,0], advanced_painbloom:['a','a','a'], intense_painbloom:[960,5800,26618],
    follow_up:[177,1356,7200], advanced_follow_up:['a','a','a'], intense_follow_up:[62,1356,7200],
    magic_fortune:[391,2317,22738], magic_spirits:[699,2971,26601], resonance:[61,695,7200],
    soul_source:[0,0,0], advanced_soul_source:['a','a','a'], intense_soul_source:[960,5713,27982],
    shadow_hunter:[0,0,0], advanced_shadow_hunter:['a','a','a'], intense_shadow_hunter:[862,5741,27079],
    foxfire:[0,0,0], advanced_foxfire:['a','a','a'], intense_foxfire:[491,3666,18369],
    firecage:[0,0,0], advanced_firecage:['a','a','a'], intense_firecage:[758,4920,24102],
    exuberance:[0,0,0], advanced_exuberance:['a','a','a'], intense_exuberance:[697,4606,16665],
    good_fortune:[0,0,0], advanced_good_fortune:['a','a','a'], intense_good_fortune:[653,5172,24102],
    fierce_attack:[126,984,6466], advanced_fierce_attack:['a','a','a'], intense_fierce_attack:[67,984,6466],
    fatal_bite:[960,5357,27266], angry_roar:[485,3124,27300], blood_roar:[648,3844,27300],
    tooth_and_claw:[67,784,7200], infection:[0,0,0], intense_infection:[755,5800,28000],
    counterstrike:[88,1051,7200], advanced_counterstrike:['a','a','a'],
    arrogance:[0,0,0], advanced_arrogance:['a','a','a'], intense_arrogance:[557,3926,18412],
    outburst:[0,0,0], advanced_outburst:['a','a','a'], intense_outburst:[756,5742,28000]
  };

  const slug = (el) => el?.querySelector('.pet-build-skill-art')?.dataset.skillIcon || '';

  let tip = document.querySelector('.pet-build-skill-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'pet-build-skill-tooltip';
    document.body.appendChild(tip);
  }

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(3-n);

  const show = (el) => {
    const arr = costs[slug(el)];
    const name = el.dataset.skillName || 'Навык';
    let html = '<div class="pet-build-tooltip-title">' + name + '</div>';
    if (arr) {
      html += '<div class="pet-build-tooltip-levels">';
      arr.forEach((v,i) => {
        const lvl=i+1;
        const value = v === 'a'
          ? amberIcon + ' 4 янтаря'
          : (v.toLocaleString('ru-RU') + ' 🪙');
        html += '<span class="' + (lvl===3 ? 'is-current' : '') + '"><b>' + stars(lvl) + '</b><em>' + value + '</em></span>';
      });
      html += '</div>';
    }
    tip.innerHTML=html;
    tip.style.display='block';
    const r=el.getBoundingClientRect(), tw=tip.offsetWidth, th=tip.offsetHeight;
    let left=r.left+r.width/2-tw/2, top=r.top-th-8;
    left=Math.max(6,Math.min(left,window.innerWidth-tw-6));
    if(top<6) top=r.bottom+8;
    tip.style.left=left+'px';
    tip.style.top=top+'px';
  };

  const hide=()=>{ tip.style.display='none'; tip.dataset.owner=''; };

  document.querySelectorAll('.pet-build-skill').forEach(el=>{
    const title=el.getAttribute('title') || '';
    const img=el.querySelector('img');
    el.dataset.skillName=(title || img?.dataset?.name || '').replace(/\s*·\s*Ур\.\s*\d+$/,'').trim();
    el.removeAttribute('title');
    el.setAttribute('aria-label', el.dataset.skillName + ' — 3 звезды');
    el.addEventListener('mouseenter',()=>show(el));
    el.addEventListener('focus',()=>show(el));
    el.addEventListener('mouseleave',hide);
    el.addEventListener('blur',hide);
    el.addEventListener('click',(e)=>{
      e.preventDefault();
      e.stopPropagation();
      const opened=tip.style.display==='block' && tip.dataset.owner===String([...document.querySelectorAll('.pet-build-skill')].indexOf(el));
      if(opened){hide();tip.dataset.owner='';}else{tip.dataset.owner=String([...document.querySelectorAll('.pet-build-skill')].indexOf(el));show(el);}
    });
  });
})();
