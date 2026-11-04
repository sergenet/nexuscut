#!/usr/bin/env python3
"""Replace hardcoded passwords in tracked files with an environment lookup.

Every one-off deploy/debug script in this repo carried the VPS root password
as a string literal, which is why GitGuardian caught it the moment the repo
went public. This rewrites those literals to read from the environment so the
scripts still work once VPS_PASSWORD is exported, and the repo holds no
credential at all.

Only `password`/`passwd`/`pwd` assignments and dict keys are touched: that is
the shape the flagged secret has. Nothing else in the file is altered.

Run: python sanitize-secrets.py [--dry-run]
"""
import re
import subprocess
import sys

DRY = '--dry-run' in sys.argv

# password='...' | password = "..." | 'password': '...' | pwd="..."
PATTERN = re.compile(
    r"""(?P<key>\b(?:password|passwd|pwd)\b["']?\s*[:=]\s*)(?P<q>["'])(?P<secret>[^"'\n]{6,})(?P=q)""",
    re.I)

REPLACEMENT = r"\g<key>__import__('os').environ.get('VPS_PASSWORD','')"

# Values that are already safe: environment lookups, obvious placeholders and
# empty strings must be left alone.
SKIP_VALUES = re.compile(
    r"""^(?:|.*environ.*|.*process\.env.*|[<{$%].*|\*+)$""", re.I)
PLACEHOLDER = re.compile(
    r"^(change.?me|your.?password|example|placeholder|test|dummy|xxx+)$", re.I)


def affected():
    out = subprocess.run(["git", "ls-files", "-z"], capture_output=True, check=True)
    for path in out.stdout.decode("utf-8", "replace").split("\0"):
        if not path or not path.lower().endswith((".py", ".cjs", ".js", ".ts", ".tsx")):
            continue
        try:
            with open(path, encoding="utf-8", errors="surrogateescape") as fh:
                text = fh.read()
        except OSError:
            continue
        if PATTERN.search(text):
            yield path, text


def main():
    changed_files = 0
    changed_sites = 0
    for path, text in affected():
        count = 0

        def sub(m):
            nonlocal count
            value = m.group("secret")
            if SKIP_VALUES.match(value) or PLACEHOLDER.match(value):
                return m.group(0)
            count += 1
            return m.expand(REPLACEMENT)

        new_text = PATTERN.sub(sub, text)
        if new_text == text:
            continue
        changed_files += 1
        changed_sites += count
        print(f"  {path}: {count} literal(s)", flush=True)
        if not DRY:
            with open(path, "w", encoding="utf-8", errors="surrogateescape", newline="") as fh:
                fh.write(new_text)

    verb = "[dry-run] would sanitise" if DRY else "sanitised"
    print(f"\n{verb} {changed_sites} hardcoded value(s) across {changed_files} file(s)")


if __name__ == "__main__":
    main()
