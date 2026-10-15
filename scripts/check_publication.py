"""Reject private material and broken production resources before publishing."""

import argparse
from pathlib import Path
import re
import subprocess
from urllib.parse import unquote, urlsplit

PRIVATE_PARTS = {
    ".local", ".bundle", ".env", "private", "research-data", "manuscripts",
    "preview", "node_modules", "vendor",
}
PRIVATE_SUFFIXES = {".pdf", ".tex", ".zip", ".pem", ".key", ".ipynb"}
SECRET = re.compile(
    rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|"
    rb"\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{40,}\b|"
    rb"\bAKIA[A-Z0-9]{16}\b"
)


def private(path):
    return (
        bool(set(path.parts) & PRIVATE_PARTS)
        or any(part.startswith(".env.") for part in path.parts)
        or path.suffix.lower() in PRIVATE_SUFFIXES
        or path.as_posix().startswith(("docs/archive/", "docs/on-living-source/"))
    )


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--source", action="store_true")
parser.add_argument("--site", type=Path)
args = parser.parse_args()
errors = []
if args.source:
    tracked = subprocess.check_output(["git", "ls-files", "-z"]).decode("utf-8").split("\0")
    for name in filter(None, tracked):
        path = Path(name)
        if private(path):
            errors.append(f"Private file tracked in Git: {name}")
        elif path.is_file() and SECRET.search(path.read_bytes()):
            errors.append(f"Possible credential in tracked file: {name}")

if args.site:
    root = args.site.resolve()
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(root)
        if private(relative) or relative.parts[0] not in {
            "assets", "research", "reflections", "index.html", "404.html",
            "robots.txt", "sitemap.xml", "feed.xml", ".nojekyll",
        }:
            errors.append(f"Unexpected publication file: {relative}")
        if SECRET.search(path.read_bytes()):
            errors.append(f"Possible credential in publication output: {relative}")
        if path.suffix not in {".html", ".css", ".xml", ".txt"}:
            continue
        content = path.read_text(encoding="utf-8")
        if re.search(r"https?://(?:localhost|127\.0\.0\.1)(?::\d+)?", content):
            errors.append(f"Local development URL in production output: {relative}")
        if path.suffix == ".css":
            for match in re.finditer(r"url\(\s*['\"]?([^\s)'\"]+)", content):
                url = urlsplit(match.group(1))
                if url.scheme or url.netloc or not url.path:
                    continue
                target = root / unquote(url.path).lstrip("/") if url.path.startswith("/") else path.parent / unquote(url.path)
                if not target.is_file():
                    errors.append(f"Broken CSS resource in {relative}: {url.path}")
    for name in ("index.html", "research/index.html", "reflections/index.html", "reflections/on-living/index.html"):
        content = (root / name).read_text(encoding="utf-8")
        canonical = re.search(r'rel="canonical"\s+href="([^"]+)"', content)
        if not canonical or urlsplit(canonical.group(1)).netloc != "haoranxu-research.github.io":
            errors.append(f"Incorrect production canonical URL: {name}")

if errors:
    raise SystemExit("\n".join(errors))
print("PASS: publication boundary, credential patterns, and production asset paths.")
