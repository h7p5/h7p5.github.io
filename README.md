# h7p5.github.io

My portfolio: https://h7p5.github.io

A hand-drawn 3D site with a corridor and four rooms (projects, about, studio, contact).

## Credit

This site is a copy of [portfolio-itom](https://github.com/ITomPoland/portfolio-itom) by Tomasz "ITom" Szmajda (MIT license).
The code, the 3D scenes and most of the drawings are his. I swapped in my own content: name, projects, avatar, cards, balloons and links.

## Run it

```bash
npm install
npm run dev
```

`npm run build` writes the site to `dist/`. Pushing to `main` deploys it to GitHub Pages.

The contact form uses [Web3Forms](https://web3forms.com). It only sends when `VITE_WEB3FORMS_KEY` is set.
