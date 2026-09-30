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


/* PET BUILD SKILL TOOLTIPS */
(() => {
  const money = (card) => {
    const row = card?.querySelector('.pet-build-cost');
    return row ? row.textContent.replace(/\s+/g,' ').trim() : '';
  };
  document.querySelectorAll('.pet-build-skill[title]').forEach((el) => {
    const card = el.closest('.pet-build-card');
    const cost = money(card);
    if (cost && !el.dataset.tooltipReady) {
      el.title = el.title + '\\A' + cost;
      el.dataset.tooltipReady = '1';
    }
  });
})();
