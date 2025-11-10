const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
// This means files in 'public/' can be accessed directly from the browser
// Example: public/css/style.css becomes http://localhost:3000/css/style.css
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Static Files Demo</title>
      <!-- Link to our CSS file in public/css/ -->
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <div class="container">
        <h1>🎨 Static Files Demo</h1>
        <p>This page is styled with a CSS file from the <code>public/</code> folder!</p>
        
        <div class="info-box">
          <h2>How It Works</h2>
          <ul>
            <li>CSS file: <code>public/css/style.css</code></li>
            <li>Browser URL: <code>/css/style.css</code></li>
            <li>Express automatically serves it!</li>
          </ul>
        </div>
        
        <div class="info-box">
          <h3>Try These URLs:</h3>
          <ul>
            <li><a href="/css/style.css">/css/style.css</a> - View the CSS</li>
            <li><a href="/test.html">/test.html</a> - Another HTML page</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Another route
app.get('/about', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>About</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <div class="container">
        <h1>📝 About Page</h1>
        <p>This page also uses the same CSS file!</p>
        <p><a href="/">← Back to Home</a></p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🎉 Server running at http://localhost:${PORT}`);
});
