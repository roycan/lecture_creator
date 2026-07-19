# 01 - Hello Express

Your first Express server! This is the simplest possible web server.

## What This Does

- Creates a web server
- Responds to requests on two routes:
  - `/` (home page)
  - `/about` (about page)

## Setup

1. Open terminal in this folder
2. Install dependencies:
   ```bash
   npm install
   ```

## Run

```bash
npm start
```

Then open your browser and go to: `http://localhost:3000`

## Try It

1. Visit the home page
2. Click the link to go to `/about`
3. Change the HTML in `app.js` and refresh

## Key Concepts

- `require('express')` - Import Express
- `app.get()` - Define a route
- `res.send()` - Send response to browser
- `app.listen()` - Start the server

## Next Steps

Try adding another route! For example:
```javascript
app.get('/contact', (req, res) => {
  res.send('<h1>Contact Page</h1>');
});
```
