# Andrzej Lech Ruprecht — official archive

This repository contains the static GitHub Pages site for [andrzejruprecht.github.io](https://andrzejruprecht.github.io). It preserves the biography, publications, photographs, and multilingual media archive of zoologist and osteologist Andrzej Lech Ruprecht (1935–2010).

## Site structure

- `index.html` — English biography, gallery, and searchable bibliography
- `pl/index.html` — Polish biography, gallery, and searchable bibliography
- `media/index.html` — archive catalog
- `media/*/index.html` — individual documents with PDF downloads, transcriptions, and translations
- `assets/media/pdfs/` — archival PDF documents
- `assets/media/thumbnails/` — document previews
- `assets/images/gallery/` — optimized photographs
- `assets/js/publications.js` — structured publication catalog
- `scripts/check_site.py` — local accessibility and internal-link checks

## Preview locally

From the repository root:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Validate before publishing

```sh
python3 scripts/check_site.py
```

The same checks run automatically for pushes and pull requests through GitHub Actions.

## Editing guidance

- Keep English and Polish versions synchronized.
- Every media item must retain its downloadable PDF and provide English and Polish reading panels. Add the source language as a third panel when it is neither English nor Polish.
- Preserve publication titles and scientific names exactly. Add DOI links when a reliable identifier is available.
- Use descriptive alternative text for every meaningful image.
- Place new photographs in `assets/images/gallery/` and optimize them for the web before committing.

## Rights and attribution

The site code is covered by the repository license. Source documents, photographs, journal articles, and third-party text retain their respective rights and attributions.
