"""Check generated site links, assets, and accidental template content."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.ids = set()
        self.images = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        for name in ("href", "src"):
            if attrs.get(name):
                self.urls.append(attrs[name])
        if tag == "img":
            self.images.append(attrs)


root = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
errors = []
documents = {}
for page in root.rglob("*.html"):
    parser = Links()
    text = page.read_text(encoding="utf-8")
    parser.feed(text)
    documents[page] = parser
    for sample in ("Albert Einstein", "you@example.com", "example_pdf.pdf", "Write your biography here"):
        if sample in text:
            errors.append(f"{page.relative_to(root)} contains template content: {sample}")
    for image in parser.images:
        if not image.get("alt"):
            errors.append(f"{page.relative_to(root)} has an image without alt text")

for required in ("index.html", "research/index.html", "reflections/index.html", "404.html"):
    if not (root / required).exists():
        errors.append(f"Missing page: {required}")

home = (root / "index.html").read_text(encoding="utf-8")
canonical = re.search(r'<link[^>]*rel="canonical"[^>]*href="([^"]+)"', home)
prefix = urlsplit(canonical.group(1)).path.rstrip("/") if canonical else ""
for page, parser in documents.items():
    for url in parser.urls:
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc:
            continue
        path = unquote(parsed.path)
        if path.startswith("/"):
            if prefix and (path == prefix or path.startswith(prefix + "/")):
                path = path[len(prefix):]
            target = root / path.lstrip("/")
        else:
            target = page.parent / path if path else page
        if target.is_dir():
            target = target / "index.html"
        if not target.exists():
            errors.append(f"{page.relative_to(root)}: broken local URL {url}")
        elif parsed.fragment and target.suffix == ".html" and target in documents:
            if unquote(parsed.fragment) not in documents[target].ids:
                errors.append(f"{page.relative_to(root)}: missing anchor {url}")

if errors:
    print("\n".join(errors))
    sys.exit(1)
print(f"PASS: {len(documents)} HTML pages; local links, image alt text, and template content checked.")
