#!/usr/bin/env python3
"""Second pass: remove known credential literals wherever they appear.

The first pass only rewrote `password=`/`passwd=`/`pwd=` assignments. These
scripts also used `PW = "..."`, and two non-Python files carried the same
values, so this pass works from the literal values themselves: it reads them
out of the previous commit (where they are still stored), then replaces every
quoted occurrence in the working tree with an environment lookup.

Nothing is printed in clear: only file names and counts.

Run: python strip-known-secrets.py [--dry-run]
"""
import re
import subprocess
import sys

DRY = "--dry-run" in sys.argv

# Files that carry the literals in HEAD; used only to recover the values.
SOURCES = ["build_vps_safe_6.py", "bundle_assets.py", "add_swap.py",
           "check_all_env.py", "deploy_soro_step1.py"]

TEXT_EXT = (".py", ".cjs", ".js", ".ts", ".tsx", ".sh", ".txt", ".json", ".md", ".yml", ".yaml")

EXPR = "__import__('os').environ.get('VPS_PASSWORD','')"


def known_secrets():
    seen = set()
    for src in SOURCES:
        try:
            blob = subprocess.run(["git", "show", f"HEAD:{src}"],
                                  capture_output=True, check=True).stdout.decode("utf-8", "replace")
        except subprocess.CalledProcessError:
            continue
        for m in re.finditer(r"""(?:password|passwd|pwd|PW)["']?\s*[:=]\s*(["'])([^"'\n]{6,})\1""", blob, re.I):
            seen.add(m.group(2))
    return {s for s in seen if s and not s.startswith("os.")}


def tracked():
    out = subprocess.run(["git", "ls-files", "-z"], capture_output=True, check=True)
    for path in out.stdout.decode("utf-8", "replace").split("\0"):
        if path and path.lower().endswith(TEXT_EXT):
            yield path


def main():
    secrets = known_secrets()
    print(f"recovered {len(secrets)} distinct literal(s) from HEAD\n")
    total_files = total_hits = 0
    for path in tracked():
        try:
            with open(path, encoding="utf-8", errors="surrogateescape") as fh:
                text = fh.read()
        except OSError:
            continue
        new_text, hits = text, 0
        for secret in secrets:
            pattern = re.compile(r"""(["'])""" + re.escape(secret) + r"""\1""")
            new_text, n = pattern.subn(EXPR, new_text)
            hits += n
        if hits:
            total_files += 1
            total_hits += hits
            print(f"  {path}: {hits}")
            if not DRY:
                with open(path, "w", encoding="utf-8", errors="surrogateescape", newline="") as fh:
                    fh.write(new_text)
    verb = "[dry-run] would strip" if DRY else "stripped"
    print(f"\n{verb} {total_hits} literal(s) across {total_files} file(s)")


if __name__ == "__main__":
    main()
