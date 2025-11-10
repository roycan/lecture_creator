# 02 - Static Files

Learn how to serve CSS, JavaScript, images, and HTML files.

## What This Does

- Serves static files from `public/` folder
- CSS file automatically loads
- Demonstrates the `express.static()` middleware

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Visit: `http://localhost:3000`

## Folder Structure

```
02-static-files/
├── app.js
├── package.json
└── public/
    ├── css/
    │   └── style.css
    ├── images/
    └── test.html
```

## Key Concept

```javascript
app.use(express.static('public'));
```

This one line makes everything in `public/` accessible via URL!

- `public/css/style.css` → `/css/style.css`
- `public/test.html` → `/test.html`
- `public/images/logo.png` → `/images/logo.png`

## Try It

1. Create a new CSS file in `public/css/`
2. Link it in your HTML
3. Add an image to `public/images/`
4. Reference it with `<img src="/images/yourimage.png">`
