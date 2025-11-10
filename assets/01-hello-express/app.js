// Import Express framework
const express = require('express');

// Create an Express application
const app = express();

// Define the port number
// When deployed, Railway will provide PORT in environment variables
const PORT = process.env.PORT || 3000;

// Define a route for the home page
// When someone visits http://localhost:3000/
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>My First Server</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        h1 { font-size: 3rem; margin-top: 100px; }
        p { font-size: 1.2rem; }
      </style>
    </head>
    <body>
      <h1>🚀 Hello from my first server!</h1>
      <p>Congratulations! You've built a web server with Node.js and Express.</p>
      <p>Try visiting <a href="/about" style="color: #FFD700;">/about</a></p>
    </body>
    </html>
  `);
});

// Define another route for the about page
app.get('/about', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>About</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          background-color: #2c3e50;
          color: white;
        }
      </style>
    </head>
    <body>
      <h1>📝 About This Server</h1>
      <p>This is a simple Express.js server.</p>
      <p>Created by: [Your Name]</p>
      <p><a href="/" style="color: #3498db;">← Back to Home</a></p>
    </body>
    </html>
  `);
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`🎉 Server is running!`);
  console.log(`📍 Visit: http://localhost:${PORT}`);
  console.log(`⏹️  Press Ctrl+C to stop`);
});
