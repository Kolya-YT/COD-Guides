#!/usr/bin/env python3
"""Generate a separately addressable English edition from Russian Markdown before Jekyll."""
import json, re, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".translation-cache.json"
try:
    cache = json.loads(CACHE.read_text(encoding="utf-8"))
except Exception:
    cache = {}

def translate(text):
    if not text.strip():
        return text
    if text in cache:
        return cache[text]
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=" + urllib.parse.quote(text)
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 COD-Guides/1.0"})
            with urllib.request.urlopen(req, timeout=25) as response:
                data = json.loads(response.read().decode("utf-8"))
            result = "".join(part[0] for part in data[0] if part and part[0])
            cache[text] = result
            time.sleep(0.12)
            return result
        except Exception:
            if attempt == 4:
                raise
            time.sleep(1.5 * (attempt + 1))

PROTECTED = re.compile(r'(!?\[[^\]]*\]\([^)]*\)|<[^>]+>|\x60[^\x60]*\x60|https?://\S+|\{%.*?%\}|\{\{.*?\}\})')
def translate_line(line):
    if not line.strip() or line.lstrip().startswith(("---", chr(96)*3, "~~~")):
        return line
    if re.match(r'^[A-Za-z_][A-Za-z0-9_-]*\s*:', line):
        key, value = line.split(":", 1)
        if key.strip() in {"layout", "href", "url", "permalink", "date", "updated", "image", "src", "id", "class", "category_id"}:
            return line
        value = value.strip()
        if not value or value.startswith(("[", "{", "|", ">")):
            return line
        quote = value[0] if value[0] in "\"'" else ""
        raw = value[1:-1] if quote and value.endswith(quote) else value
        return key + ": " + (quote + translate(raw) + quote if quote else translate(raw))
    output, cursor = [], 0
    for match in PROTECTED.finditer(line):
        before = line[cursor:match.start()]
        output.append(translate(before) if before.strip() else before)
        output.append(match.group(0))
        cursor = match.end()
    tail = line[cursor:]
    output.append(translate(tail) if tail.strip() else tail)
    return "".join(output)

def convert(source, destination):
    lines = source.read_text(encoding="utf-8").splitlines(keepends=True)
    out, in_fence, frontmatter = [], False, False
    for line in lines:
        stripped = line.strip()
        if stripped == "---" and not in_fence:
            frontmatter = not frontmatter
            out.append(line)
            continue
        if stripped.startswith((chr(96)*3, "~~~")):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
            continue
        out.append(translate_line(line))
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text("".join(out), encoding="utf-8")

def main():
    convert(ROOT / "index.md", ROOT / "en" / "index.md")
    sources = sorted((ROOT / "guides").glob("*.md"))
    for source in sources:
        convert(source, ROOT / "en" / "guides" / source.name)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated English home page and {len(sources)} translated guides.")

if __name__ == "__main__":
    main()
