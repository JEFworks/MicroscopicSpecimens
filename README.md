# Microscopic Specimens

Source for [microspeci.men](https://microspeci.men), a Jekyll site for browsing a
collection of Victorian microscope slides, antique microscopes, and vintage cameras.

## Adding an item

Every slide, microscope, and camera is one Markdown file. Adding a file adds the
item to its collection page, the filters, and the previous/next links.

1. Put the photos in the matching folder:
   - slides: `assets/images/`
   - microscopes: `assets/microscopes/`
   - cameras: `assets/cameras/`
2. Copy `_templates/item.md` into `_slides/`, `_microscopes/`, or `_cameras/`.
3. Rename it; the file name becomes the page address
   (`_cameras/rolleiflex.md` is published at `/cameras/rolleiflex/`).
4. Fill in the fields at the top and write the longer description below them.

| Field         | Required | What it does |
|---------------|----------|--------------|
| `title`       | yes      | Item name. |
| `cover`       | yes      | Main photograph, shown on the collection page and at the top of the item page. |
| `description` | no       | One or two sentences, shown on the collection page and under the title. |
| `category`    | no       | Groups items under a filter button on the collection page. |
| `alt`         | no       | Text description of the cover photo for screen readers. |
| `details`     | no       | Any `Label: "value"` pairs, shown as a label card (preparer, maker, date, ...). |
| `images`      | no       | Extra pictures (`src` and optional `caption`), shown in a clickable gallery. |

Items are listed in file-name order. To move an item to the front, start its
file name with `0` (like `_slides/0exhibitionchristmastree.md`).

Slide covers should be photographed upright, label at the top; the site rotates
them to lie flat. Micrographs are shown in a round eyepiece frame, so square
images work best.

## Adding a new collection

Add an entry under `collections:` in `_config.yml` (copy one of the existing
ones), add its name to `navigation:`, create the `_name/` folder, and create an
index page like `cameras.md`.

## Running locally

```sh
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>. Restart the server after editing `_config.yml`.
