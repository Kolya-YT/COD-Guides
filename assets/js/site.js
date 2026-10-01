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


/* PET BUILD SKILL ART — real CoD Fan icons with filename fallback */
(() => {
  const normalizeSlug = (el) => {
    let slug = (el.querySelector('.pet-build-skill-art')?.dataset.skillIcon || '').trim();
    const title = (el.getAttribute('title') || '').trim();

    // Some build entries reuse the base icon slug for Advanced/Intense skills.
    // Prefer the real variant file, then fall back to the base skill icon.
    if (/^Улучш\./i.test(title) && !slug.startsWith('advanced_')) {
      slug = 'advanced_' + slug;
    } else if (/^Интенсив\./i.test(title) && !slug.startsWith('intense_')) {
      slug = 'intense_' + slug;
    }
    return slug;
  };

  const candidates = (slug) => {
    const out = [];
    const add = (x) => { if (x && !out.includes(x)) out.push(x); };
    add(slug);
    add(slug.replaceAll('_', '-'));

    // If a variant image does not exist (e.g. Follow-Up), use the base icon.
    if (slug.startsWith('advanced_') || slug.startsWith('intense_')) {
      const base = slug.replace(/^(advanced|intense)_/, '');
      add(base);
      add(base.replaceAll('_', '-'));
    }
    return out;
  };

  document.querySelectorAll('.pet-build-skill').forEach((cell) => {
    const art = cell.querySelector('.pet-build-skill-art');
    if (!art) return;
    const slug = normalizeSlug(cell);
    if (!slug) return;
    art.dataset.skillIcon = slug;
    art.innerHTML = '';

    const list = candidates(slug);
    let index = 0;
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    const loadNext = () => {
      if (index >= list.length) {
        cell.classList.add('is-broken');
        art.classList.add('is-broken-art');
        return;
      }
      img.src = 'https://codfan.com/img/warpets/skills/' + list[index++] + '.png?v=1.1.0';
    };
    img.addEventListener('error', loadNext);
    art.appendChild(img);
    loadNext();
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


/* SITE POLISH — reveal elements as they enter the viewport */
(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const selectors = '.guide-card,.content h2,.content h3,.content blockquote,.content table,.content .note,.content .danger,.flow,.game-gif,.guide-image,.home-empty';
  const items = [...document.querySelectorAll(selectors)];
  if (!items.length || !('IntersectionObserver' in window)) return;

  items.forEach((el, index) => {
    el.classList.add('scroll-reveal');
    el.style.setProperty('--reveal-delay', Math.min((index % 4) * 55, 165) + 'ms');
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      obs.unobserve(entry.target);
    });
  }, {threshold:0.08, rootMargin:'0px 0px -35px 0px'});

  items.forEach(el => observer.observe(el));
})();

/* Subtle header state while scrolling */
(() => {
  const header = document.querySelector('.top');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, {passive:true});
})();


/* SEARCH UX — shortcut, result counter and quick clear */
(() => {
  const input = document.querySelector('[data-guide-search]');
  if (!input) return;
  let counter = document.querySelector('[data-search-count]');
  if (!counter) {
    const hint = document.querySelector('.search-hint');
    if (hint) {
      counter = document.createElement('span');
      counter.className = 'search-count';
      counter.dataset.searchCount = '';
      hint.appendChild(counter);
    }
  }
  const updateCount = () => {
    const cards = [...document.querySelectorAll('.guide-card')];
    const query = input.value.trim();
    const visible = cards.filter(card => !card.hidden).length;
    if (counter) counter.textContent = query ? ' · Найдено: ' + visible : '';
  };
  input.addEventListener('input', updateCount);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      input.dispatchEvent(new Event('input', {bubbles:true}));
      input.blur();
    }
  });
  updateCount();
})();

/* LATEST UPDATES — generated from the guide cards */
(() => {
  const list = document.querySelector('[data-latest-list]');
  if (!list) return;
  const cards = [...document.querySelectorAll('.guide-card[data-updated]')];
  const months = {января:0,февраля:1,марта:2,апреля:3,мая:4,июня:5,июля:6,августа:7,сентября:8,октября:9,ноября:10,декабря:11};
  const parseDate = value => {
    const [day,month,year] = value.split(' ');
    return new Date(Number(year), months[month] ?? 0, Number(day));
  };
  cards.sort((a,b) => parseDate(b.dataset.updated)-parseDate(a.dataset.updated)).slice(0,3).forEach(card => {
    const link = card.getAttribute('href');
    const title = card.querySelector('h3')?.textContent?.trim() || 'Гайд';
    const tag = card.querySelector('.guide-card-tag')?.textContent?.trim() || '';
    const item = document.createElement('a');
    item.className = 'latest-item';
    item.href = link;
    item.innerHTML = '<span class="latest-dot"></span><span class="latest-copy"><strong>'+title+'</strong><small>'+tag+'</small></span><time>'+card.dataset.updated+'</time><b>→</b>';
    list.appendChild(item);
  });
})();

/* READING PROGRESS */
(() => {
  const bar = document.querySelector('[data-reading-progress]');
  if (!bar) return;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
    bar.style.width = value + '%';
  };
  update();
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
})();

/* ACTIVE TOC — highlight the section currently on screen */
(() => {
  const toc = document.querySelector('.toc');
  if (!toc) return;
  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const entries = links.map(link => ({link, heading: document.getElementById(link.getAttribute('href').slice(1))})).filter(x => x.heading);
  if (!entries.length || !('IntersectionObserver' in window)) return;
  const visible = new Set();
  const paint = () => {
    let current = entries.find(x => visible.has(x.heading)) || entries.find(x => x.heading.getBoundingClientRect().top >= 68);
    if (!current && window.scrollY > 120) current = entries[entries.length - 1];
    links.forEach(link => link.classList.toggle('is-current', current?.link === link));
  };
  const observer = new IntersectionObserver(items => {
    items.forEach(item => item.isIntersecting ? visible.add(item.target) : visible.delete(item.target));
    paint();
  }, {rootMargin:'-18% 0px -68% 0px', threshold:0});
  entries.forEach(x => observer.observe(x.heading));
  window.addEventListener('scroll', paint, {passive:true});
  paint();
})();

/* MOBILE BACK TO TOP */
(() => {
  const button = document.querySelector('[data-back-top]');
  if (!button) return;
  const update = () => button.classList.toggle('is-visible', window.scrollY > 420);
  button.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  window.addEventListener('scroll', update, {passive:true});
  update();
})();

/* MICRO-INTERACTIONS — tiny click ripple, no layout changes */
(() => {
  document.addEventListener('click', e => {
    const target = e.target.closest('button,.guide-card,.latest-item,.back');
    if (!target || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--click-x', (e.clientX - rect.left) + 'px');
    target.style.setProperty('--click-y', (e.clientY - rect.top) + 'px');
    target.classList.remove('is-clicked');
    requestAnimationFrame(() => target.classList.add('is-clicked'));
    setTimeout(() => target.classList.remove('is-clicked'), 360);
  });
})();


/* SMART NAVIGATION + MOBILE BAR + REAL VIEW COUNTER */
(() => {
  const body = document.body;
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (mobileNav) {
    mobileNav.querySelectorAll('[data-mobile-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.mobileAction;
        if (action === 'top') window.scrollTo({top:0,behavior:'smooth'});
        if (action === 'toc') document.querySelector('.toc')?.scrollIntoView({behavior:'smooth',block:'start'});
        if (action === 'search') document.querySelector('[data-guide-search]')?.focus();
      });
    });
  }

  const stats = document.querySelector('[data-guide-stats]');
  const views = document.querySelector('[data-guide-views]');
  const code = stats?.dataset.goatcounterCode || '';
  if (stats && views && code) {
    const path = location.pathname;
    fetch('https://' + code + '.goatcounter.com/counter/' + encodeURIComponent(path) + '.json', {credentials:'omit'})
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        if (data?.count != null) {
          views.textContent = data.count;
          stats.hidden = false;
        }
      })
      .catch(() => {});
  }
})();
