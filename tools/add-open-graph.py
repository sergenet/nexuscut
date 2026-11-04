"""
Give every NexusCut route an explicit `openGraph` block.

Next.js replaces a parent's `openGraph` object wholesale when a child declares
one, but a route that never declares it inherits the root layout's - which used
to carry `url: https://nexuscut.io` while advertising no image at all. Every
share rendered a large blank card, and 52 URLs published the homepage as their
og:url.

A route's own `alternates.canonical` is the reliable source of truth for its
path, so each route's canonical is reused as its og:url. Next.js derives
og:title/og:description from the page's own title/description, so only the parts
that do not inherit need supplying.

Idempotent: files that already call socialFor() are skipped.
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMPORT_LINE = "import { socialFor } from '@/lib/social';"

CANON = re.compile(r"canonical:\s*['\"`]([^'\"`]+)['\"`]")
METADATA_DECL = re.compile(r"export const metadata[^=]*=\s*\{")


def normalise(raw: str) -> str:
    """'/pricing', 'https://nexuscut.io/pricing' and '/' all become a route path."""
    p = re.sub(r"^https?://[^/]+", "", raw.strip())
    if "${" in p:  # dynamic template, leave as written
        return raw.strip()
    if not p.startswith("/"):
        p = "/" + p
    return p.rstrip("/") or "/"


def add_import(text: str) -> str:
    if IMPORT_LINE in text:
        return text
    lines = text.split("\n")
    last = -1
    for i, line in enumerate(lines):
        s = line.strip()
        if s.startswith("import ") or re.match(r"^\}\s*from\s+['\"].*['\"];?$", s):
            last = i
    if last == -1:
        return text
    lines.insert(last + 1, IMPORT_LINE)
    return "\n".join(lines)


def patch(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    if "socialFor(" in text:
        return "skip (done)"

    m = METADATA_DECL.search(text)
    c = CANON.search(text)
    if not m:
        return "skip (no metadata decl)"
    if not c:
        return "skip (no canonical)"

    expr = normalise(c.group(1))
    lit = f"`{expr}`" if "${" in expr else f"'{expr}'"
    text = text[: m.end()] + f"\n  openGraph: socialFor({lit})," + text[m.end():]
    text = add_import(text)
    path.write_text(text, encoding="utf-8")
    return f"patched {expr}"


if __name__ == "__main__":
    changed = 0
    for path in sorted(list(ROOT.glob("src/app/**/layout.tsx")) + list(ROOT.glob("src/app/**/page.tsx"))):
        result = patch(path)
        if result.startswith("patched"):
            changed += 1
        print(f"{result:26s} {path.relative_to(ROOT)}")
    print(f"\n{changed} file(s) changed")
