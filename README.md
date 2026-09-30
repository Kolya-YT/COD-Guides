# 📚 COD Guides

Красивые гайды по **Call of Dragons**.

Сайт построен на **Markdown + Jekyll**: содержание каждого гайда хранится отдельно, а общий дизайн применяется автоматически.

## 🌋 Гайды

- [🌋 Магма](guides/magma.md)

## ➕ Как добавлять новые гайды

Создай новый Markdown-файл в `guides/` с front matter:

```yaml
---
title: "Название"
description: "Краткое описание"
category: "CALL OF DRAGONS · PVE"
layout: "guide"
---
```

Изображения конкретного гайда размещаются в `assets/guides/<guide>/`.

GitHub Pages собирает сайт автоматически через Jekyll.
