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

(() => {
  const select=document.querySelector('[data-pet-select]');
  if(!select) return;
  const pets=[
    ["Токсизавр","🦖","Стрелки","Коррозия","Коррозия и ослабления"],["Сумрачная мантикора","🌑","Стрелки","Варварство","Физический урон"],["Колючая мантикора","🦂","Стрелки","Прокол","Пробивание и ослабления"],["Ночной рух","🌙","Стрелки","Разгром","Атакующая механика"],["Снежный рух","🪽","Стрелки","Концентрация","DEF Break и физический урон"],["Ласка-вихрь","🌪️","Стрелки","—","Специализированная механика"],["Ядовитый ящер","🐍","Стрелки","Заражение","Яд и ловкость"],["Магилис","✨","Маги","—","Магическая механика нового поколения"],["Пламенная мантикора","🔥","Маги","—","Магическая механика G4"],["Сумрачный дракон-фея","🌑","Маги","Теневой охотник","Магический урон"],["Сапфировый дракон-фея","💎","Маги","Цветение боли","Магический урон"],["Ангельский дракон-фея","😇","Маги","Источник души","Магия и поддержка"],["Громовой ящер","⚡","Маги","Буря","Дальний магический урон"],["Ледяной ящер","❄️","Маги","Ледяное ядро","Урон и замедление"],["Серный зубр","🦬","Пехота","—","Пехота G5"],["Мшистый зубр","🌿","Пехота","—","Пехота G4"],["Бурый урсус","🐻","Пехота","Ускорение","Поддержка боевого цикла"],["Лунный медведь","🌙","Пехота","Лунная ярость","Ярость и урон"],["Морозный урсус","❄️","Пехота","Ледяная броня","Щиты и защита"],["Денежный зверь","💰","Кавалерия","—","Кавалерия G5"],["Золотой боевой пес","🐕","Кавалерия","—","Кавалерийская механика"],["Рассекающая Мантикора","⚔️","Кавалерия","Сверкающий клинок","Физический урон"],["Золотой рух","🪽","Кавалерия","Изобилие","Ярость и урон"],["Дракон-фея берсерк","🐉","Кавалерия","Высокомерие","Ослабления и урон"],["Песчаный ящер","🏜️","Поддержка","Каменная аура","Лечение"],["Полосатый урсус","🐻","Поддержка","Дружба","Лечение и защита"],["Громовой дракон","⚡","Универсальный","—","Гибкая поддержка"]
  ];
  const skills=["","Fierce Attack","Advanced Fierce Attack","Intense Fierce Attack","Blood Roar","Angry Roar","Fatal Bite","Tooth and Claw","Shieldbreaker","Stone Aura","Advanced Stone Aura","Outbursts of Rage","Divine Blessing","Great Care","Tranquility","Poison Gland"];
  const attrNames=["strength","agility","intelligence","endurance","luck","spirit"];
  const attrLabels=["💪 Сила","⚡ Ловкость","🧠 Интеллект","🛡️ Выносливость","🍀 Удача","✨ Дух"];
  pets.forEach((p,i)=>{const o=document.createElement('option');o.value=i;o.textContent=p[1]+" "+p[0]+" · "+p[2];select.appendChild(o)});
  document.querySelector('[data-pet-stats]').innerHTML=attrNames.map((a,i)=>'<label class="pet-stat"><div class="pet-stat-top"><span>'+attrLabels[i]+'</span><b class="pet-stat-value">0</b></div><input type="range" min="0" max="100" value="0" data-stat="'+a+'"></label>').join('');
  document.querySelector('[data-pet-skills]').innerHTML=Array.from({length:8},(_,i)=>'<div class="pet-skill-slot"><em>'+(i+1)+'</em><select data-skill>'+skills.map(s=>'<option value="'+s+'">'+(s||'— выбрать навык —')+'</option>').join('')+'</select></div>').join('');
  const key='cod-guides-pet-builder-v2';
  function update(){
    const p=pets[Number(select.value)||0], stats=[...document.querySelectorAll('[data-stat]')], chosen=[...document.querySelectorAll('[data-skill]')].filter(x=>x.value);
    document.querySelector('[data-pet-icon]').textContent=p[1];document.querySelector('[data-pet-name]').textContent=p[0];document.querySelector('[data-pet-talent]').textContent='⭐ '+(p[3]==='—'?'Талант':p[3]);document.querySelector('[data-pet-role]').textContent=p[2];
    document.querySelector('[data-talent-icon]').textContent=p[1];document.querySelector('[data-talent-name]').textContent=p[3]==='—'?'Талант':p[3];document.querySelector('[data-talent-desc]').textContent=p[4];
    stats.forEach(x=>x.closest('.pet-stat').querySelector('.pet-stat-value').textContent=x.value);
    document.querySelectorAll('.pet-skill-slot').forEach((slot,i)=>slot.classList.toggle('is-filled',!!document.querySelectorAll('[data-skill]')[i].value));
    const warning=chosen.length>8?1:0;
    document.querySelector('[data-summary-pet]').textContent=p[0];document.querySelector('[data-summary-score]').textContent=chosen.length+'/8';document.querySelector('[data-summary-skills]').textContent=chosen.length;document.querySelector('[data-summary-stats]').textContent=stats.filter(x=>+x.value>0).length;document.querySelector('[data-summary-warnings]').textContent=warning;document.querySelector('[data-summary-bar]').style.width=(chosen.length/8*100)+'%';
    document.querySelector('[data-build-note]').textContent=chosen.length?'Сборка сохраняется автоматически на этом устройстве.':'Добавь навыки, чтобы собрать питомца.';
    [['pet',true],['talent',p[3]!=='—'],['stats',stats.some(x=>+x.value>0)],['skills',chosen.length>0],['cap',warning===0]].forEach(([k,ok])=>document.querySelector('[data-check="'+k+'"]').classList.toggle('is-ok',ok));
    localStorage.setItem(key,JSON.stringify({pet:select.value,stats:stats.map(x=>x.value),skills:[...document.querySelectorAll('[data-skill]')].map(x=>x.value)}));
  }
  try{const old=JSON.parse(localStorage.getItem(key)||'null');if(old){select.value=old.pet||0;[...document.querySelectorAll('[data-stat]')].forEach((x,i)=>x.value=old.stats?.[i]||0);[...document.querySelectorAll('[data-skill]')].forEach((x,i)=>x.value=old.skills?.[i]||'')}}catch(e){}
  select.addEventListener('change',update);document.addEventListener('input',e=>{if(e.target.matches('[data-stat],[data-skill]'))update()});document.querySelector('[data-pet-reset]').addEventListener('click',()=>{select.value=0;document.querySelectorAll('[data-stat]').forEach(x=>x.value=0);document.querySelectorAll('[data-skill]').forEach(x=>x.value='');update()});update();
})();
