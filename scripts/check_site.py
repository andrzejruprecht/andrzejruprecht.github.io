#!/usr/bin/env python3
"""Small dependency-free validator for this static site."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
IGNORED_DIRS = {".git"}
IGNORED_FILES = {"google0e4bb16a06be4bf3.html"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.links: list[tuple[str, str]] = []
        self.errors: list[str] = []
        self.lang = ""
        self.has_title = False
        self._in_title = False

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = dict(attrs_list)
        if tag == "html":
            self.lang = attrs.get("lang") or ""
        if tag == "title":
            self._in_title = True
        if attrs.get("id"):
            self.ids.append(attrs["id"] or "")
        if tag == "a" and attrs.get("href"):
            self.links.append(("href", attrs["href"] or ""))
            if attrs.get("target") == "_blank" and "noopener" not in (attrs.get("rel") or ""):
                self.errors.append(f"external link lacks rel=noopener: {attrs['href']}")
        if tag in {"img", "script"} and attrs.get("src"):
            self.links.append(("src", attrs["src"] or ""))
        if tag == "link" and attrs.get("href") and attrs.get("rel") in {"stylesheet", "icon"}:
            self.links.append(("href", attrs["href"] or ""))
        if tag == "img" and "alt" not in attrs:
            self.errors.append(f"image lacks alt text: {attrs.get('src', '(unknown)')}")
        if tag in {"font", "center"}:
            self.errors.append(f"obsolete <{tag}> element")

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title and data.strip():
            self.has_title = True


def html_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.html")
        if path.name not in IGNORED_FILES
        and not any(part in IGNORED_DIRS for part in path.parts)
    )


def resolve_local(page: Path, target: str) -> tuple[Path, str] | None:
    parsed = urlparse(target)
    if parsed.scheme or parsed.netloc or target.startswith(("mailto:", "tel:", "javascript:")):
        return None
    raw_path = unquote(parsed.path)
    if not raw_path:
        destination = page
    elif raw_path.startswith("/"):
        destination = ROOT / raw_path.lstrip("/")
    else:
        destination = page.parent / raw_path
    if destination.is_dir() or raw_path.endswith("/"):
        destination = destination / "index.html"
    return destination.resolve(), parsed.fragment


def main() -> int:
    failures: list[str] = []
    pages: dict[Path, PageParser] = {}

    for page in html_files():
        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8"))
        pages[page.resolve()] = parser
        label = page.relative_to(ROOT)
        if not parser.lang:
            failures.append(f"{label}: missing html[lang]")
        if not parser.has_title:
            failures.append(f"{label}: missing non-empty title")
        duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
        for duplicate in duplicates:
            failures.append(f"{label}: duplicate id #{duplicate}")
        failures.extend(f"{label}: {error}" for error in parser.errors)

    for page, parser in pages.items():
        label = page.relative_to(ROOT)
        for attribute, target in parser.links:
            resolved = resolve_local(page, target)
            if resolved is None:
                continue
            destination, fragment = resolved
            if not destination.exists():
                failures.append(f"{label}: broken {attribute} {target}")
                continue
            if fragment and destination.suffix == ".html":
                target_parser = pages.get(destination)
                if target_parser and fragment not in target_parser.ids:
                    failures.append(f"{label}: missing fragment #{fragment} in {destination.relative_to(ROOT)}")

    if failures:
        print("Site validation failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print(f"Validated {len(pages)} HTML pages with no internal-link or basic accessibility errors.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
