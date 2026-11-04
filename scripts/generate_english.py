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

pending = {}
def queue_translation(text):
    if not text.strip() or not re.search(r"[А-Яа-яЁё]", text):
        return text
    if text in cache:
        return cache[text]
    token = "__CODGUIDE_TEXT_%06d__" % len(pending)
    pending[token] = text
    return token

def request_translation(text):
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=" + urllib.parse.quote(text)
    last_error = None
    for attempt in range(6):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 COD-Guides/1.0"})
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
            result = "".join(part[0] for part in payload[0] if part and part[0])
            if not result:
                raise RuntimeError("Translation service returned an empty result")
            return result
        except Exception as error:
            last_error = error
            if attempt == 5:
                break
            time.sleep(min(2 ** attempt, 12))
    raise RuntimeError("Google translation request failed: %s" % last_error)

def flush_translations(rendered):
    global pending
    if not pending:
        return rendered
    items = list(pending.items())
    pending = {}
    replacements = {}
    batch = []
    batch_size = 0

    def send_batch(entries):
        if not entries:
            return
        markers = ["__CODGUIDE_SPLIT_%06d__" % i for i in range(len(entries) - 1)]
        joined = ""
        for index, (_, source_text) in enumerate(entries):
            if index:
                joined += markers[index - 1]
            joined += source_text
        translated = request_translation(joined)
        if all(marker in translated for marker in markers):
            parts = re.split("|".join(re.escape(marker) for marker in markers), translated)
            if len(parts) == len(entries):
                for (token, source_text), result in zip(entries, parts):
                    replacements[token] = result
                    cache[source_text] = result
                return
        # A rare translator response may alter separators; fall back safely per segment.
        for token, source_text in entries:
            result = request_translation(source_text)
            replacements[token] = result
            cache[source_text] = result

    for item in items:
        token, source_text = item
        if batch and batch_size + len(source_text) > 1500:
            send_batch(batch)
            batch, batch_size = [], 0
        batch.append(item)
        batch_size += len(source_text)
    send_batch(batch)

    for token, result in replacements.items():
        rendered = rendered.replace(token, result)
    return rendered

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
        lambda match: match.group(1) + match.group(2) + queue_translation(match.group(3)) + match.group(2),
        line,
    )
    pieces, cursor = [], 0
    for match in PROTECTED.finditer(line):
        before = line[cursor:match.start()]
        pieces.append(queue_translation(before) if before.strip() else before)
        pieces.append(match.group(0))
        cursor = match.end()
    tail = line[cursor:]
    pieces.append(queue_translation(tail) if tail.strip() else tail)
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
    if not text:
        return line
    token = queue_translation(text)
    return prefix + key + separator + (quote + token + quote if quote else token) + newline

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
    translated = flush_translations(translated)
    if destination.is_relative_to(ROOT / "en"):
        translated = translated.replace("'/guides/", "'/en/guides/")
        translated = translated.replace('"/guides/', '"/en/guides/')
        translated = translated.replace("](/guides/", "](/en/guides/")
        translated = translated.replace("assets/guides/", "assets/en/guides/")
        translated = translated.replace("assets/img/", "assets/en/img/")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(translated, encoding="utf-8")

def convert_svg_assets():
    # Keep Russian diagrams untouched and generate translated SVG counterparts for EN pages.
    roots = [ROOT / "assets" / "guides", ROOT / "assets" / "img"]
    for asset_root in roots:
        if not asset_root.exists():
            continue
        for source in sorted(asset_root.rglob("*.svg")):
            lines = source.read_text(encoding="utf-8").splitlines(keepends=True)
            translated = "".join(translate_markdown_line(line) for line in lines)
            translated = flush_translations(translated)
            relative = source.relative_to(ROOT / "assets")
            destination = ROOT / "assets" / "en" / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(translated, encoding="utf-8")

def main():
    convert(ROOT / "index.md", ROOT / "en" / "index.md")
    sources = sorted((ROOT / "guides").glob("*.md"))
    for source in sources:
        convert(source, ROOT / "en" / "guides" / source.name)
    convert_svg_assets()
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Generated English homepage and %d guides using %d cached translations." % (len(sources), len(cache)))

if __name__ == "__main__":
    main()
