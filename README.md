# H&N Senile Embroidery — company profile site

A static, responsive, single-page website. No backend, no database, no runtime dependencies.
Works with any free host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## Adding photos to the galleries

Photos live in two folders:

```
assets/images/work/           ← completed embroidery work
assets/images/environment/    ← studio inside/outside photos
```

**Just copy your photos into either folder.** The gallery reads a generated list from
`assets/gallery-data.js`, so no HTML/JS edits are needed.

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
js/script.js                 theme toggle, mobile menu, galleries, contact form
build/generate-gallery.js    scans folders and writes gallery-data.js
assets/gallery-data.js       auto-generated photo list (do not edit)
assets/favicon.svg           browser tab icon
assets/images/hero.svg
assets/images/about.svg
assets/images/work/
assets/images/environment/
.github/workflows/deploy.yml GitHub Pages build + deploy
```

## Contact form

The form has no backend. On submit it opens the visitor's email app with a prefilled
message to `hnemb1982@gmail.com`. No data is collected or stored.

## Developer

Tariqul — tariquli241@gmail.com
