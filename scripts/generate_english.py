#!/usr/bin/env python3
"""Build the English edition while preserving Markdown, YAML, HTML and Jekyll syntax."""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".translation-cache.json"
try:
    cache = json.loads(CACHE.read_text(encoding="utf-8"))
except (OSError, ValueError):
    cache = {}

def translate(text):
    if not text.strip() or not re.search(r"[А-Яа-яЁё]", text):
        return text
    if text in cache:
        return cache[text]
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=" + urllib.parse.quote(text)
    for attempt in range(6):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 COD-Guides/1.0"})
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
            result = "".join(part[0] for part in payload[0] if part and part[0])
            if not result:
                raise RuntimeError("Translation service returned an empty result")
            cache[text] = result
            time.sleep(0.18)
            return result
        except Exception:
            if attempt == 5:
                raise
            time.sleep(min(2 ** attempt, 12))

PROTECTED = re.compile(r'(\]\([^)]*\)|<[^>]+>|\x60[^\x60]*\x60|https?://\S+|\{%.*?%\}|\{\{.*?\}\})')
ATTRIBUTE = re.compile(
    r"""((?:alt|title|placeholder|aria-label|aria-description|data-updated)\s*=\s*)(["'])(.*?)\2""",
    re.IGNORECASE,
)
FRONTMATTER_SKIP = {
    "layout", "href", "url", "permalink", "date", "updated", "image", "src",
    "id", "class", "category_id", "source", "author",
}

def translate_markdown_line(line):
    line = ATTRIBUTE.sub(
        lambda match: match.group(1) + match.group(2) + translate(match.group(3)) + match.group(2),
        line,
    )
    pieces, cursor = [], 0
    for match in PROTECTED.finditer(line):
        before = line[cursor:match.start()]
        pieces.append(translate(before) if before.strip() else before)
        pieces.append(match.group(0))
        cursor = match.end()
    tail = line[cursor:]
    pieces.append(translate(tail) if tail.strip() else tail)
    return "".join(pieces)

def translate_frontmatter_line(line):
    match = re.match(r'^(\s*(?:-\s*)?)([A-Za-z_][A-Za-z0-9_-]*)(\s*:\s*)(.*?)(\r?\n?)$', line)
    if not match:
        return translate_markdown_line(line)
    prefix, key, separator, value, newline = match.groups()
    if key.lower() in FRONTMATTER_SKIP or not value.strip():
        return line
    raw = value.strip()
    if raw.startswith(("[", "{", "|", ">")):
        return line
    quote = raw[0] if raw[0] in "\"'" else ""
    text = raw[1:-1] if quote and raw.endswith(quote) else raw
    translated = translate(text)
    if quote == '"':
        translated = translated.replace('"', '\\"')
    return prefix + key + separator + (quote + translated + quote if quote else translated) + newline

def convert(source, destination):
    output = []
    in_fence = False
    in_frontmatter = False
    for line in source.read_text(encoding="utf-8").splitlines(keepends=True):
        stripped = line.strip()
        if stripped == "---" and not in_fence:
            in_frontmatter = not in_frontmatter
            output.append(line)
            continue
        if stripped.startswith((chr(96) * 3, "~~~")):
            in_fence = not in_fence
            output.append(line)
            continue
        if in_fence:
            output.append(line)
            continue
        output.append(translate_frontmatter_line(line) if in_frontmatter else translate_markdown_line(line))

    translated = "".join(output)
    if destination.is_relative_to(ROOT / "en"):
        translated = translated.replace("'/guides/", "'/en/guides/")
        translated = translated.replace('"/guides/', '"/en/guides/')
        translated = translated.replace("](/guides/", "](/en/guides/")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(translated, encoding="utf-8")

def main():
    convert(ROOT / "index.md", ROOT / "en" / "index.md")
    sources = sorted((ROOT / "guides").glob("*.md"))
    for source in sources:
        convert(source, ROOT / "en" / "guides" / source.name)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated English homepage and {len(sources)} guides using {len(cache)} cached translations.")

if __name__ == "__main__":
    main()
