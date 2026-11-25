# H&N Senile Embroidery — company profile site

A static, responsive, single-page website. No backend, no database, no runtime dependencies.
Works with any free host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## Adding photos to the galleries

Photos live in two folders:

```
assets/images/Work Sample/    ← completed embroidery work
assets/images/Environment/    ← studio inside/outside photos
```

Name photos with a number prefix — `1.jpg`, `2.jpg`, `3.jpg` … — and they display in
that exact order (`10` comes after `9`, not after `1`).

**Just copy your photos into either folder.** The gallery reads a generated list from
`assets/gallery-data.js`, so no HTML/JS edits are needed.

### New photos: resize them first

Large phone photos make the site slow. Before committing new photos, run once:

```
python build/optimize_images.py
```

It needs Pillow (`pip install Pillow`), resizes each new photo to a max of 1600 px
and saves it as an optimized JPEG. Photos already optimized are skipped, so it is
safe to run repeatedly. The untouched originals are copied to `_originals/`,
which is git-ignored and never deployed.

- **On GitHub Pages (automatic):** the included workflow
  `.github/workflows/deploy.yml` runs `node build/generate-gallery.js` on every push,
  then deploys. Add photos → commit → push → done.
  In repo **Settings → Pages**, set *Build and deployment → Source* to **GitHub Actions**.

- **Locally / other hosts:** after adding photos, regenerate the list once:
  ```
  node build/generate-gallery.js
  ```
  On Netlify/Vercel set the build command to `node build/generate-gallery.js`
  and publish directory to `.`.

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`, `.avif`, `.bmp`.
Files are sorted naturally (`2` before `10`). A filename like
`03-sequin-embroidery.jpg` becomes the caption "Sequin embroidery".
Suggested naming: `01-description.jpg`, `02-description.jpg`, ...

## Files

```
index.html                   page content
css/styles.css               layout, responsive rules, light/dark themes
js/script.js                 theme toggle, mobile menu, galleries, reveal, form
build/generate-gallery.js    scans folders and writes gallery-data.js
build/optimize_images.py     resizes new photos, backs up originals
assets/gallery-data.js       auto-generated photo list (do not edit)
assets/favicon.svg           browser tab icon
assets/images/hero.svg
assets/images/home.jpg
assets/images/Work Sample/
assets/images/Environment/
_originals/                  full-size backups (git-ignored, not deployed)
.github/workflows/deploy.yml GitHub Pages build + deploy
```

## Contact form

The form has no backend. On submit it opens the visitor's email app with a prefilled
message to `hnemb1982@gmail.com`. No data is collected or stored.

## Developer

Tariqul — tariquli241@gmail.com
