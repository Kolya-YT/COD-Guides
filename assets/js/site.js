(() => {
  const input = document.querySelector('[data-guide-search]');
  const grid = document.querySelector('.guide-grid');
  const count = document.querySelector('.guide-count');
  if (!input || !grid) return;

  const cards = [...grid.querySelectorAll('.guide-card')];
  const originalCount = cards.length;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLocaleLowerCase('ru-RU');
    let visible = 0;

    cards.forEach(card => {
      const text = card.textContent.toLocaleLowerCase('ru-RU');
      const match = !query || text.includes(query);
      card.hidden = !match;
      if (match) visible++;
    });

    if (count) count.textContent = query
      ? `${visible} из ${originalCount}`
      : `${originalCount} гайдов`;

    grid.classList.toggle('is-searching', Boolean(query) && visible === 0);
  });
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
