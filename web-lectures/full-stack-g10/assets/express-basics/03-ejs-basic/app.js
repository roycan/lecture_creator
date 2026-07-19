const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine
// This tells Express to look for .ejs files in the views/ folder
app.set('view engine', 'ejs');

// Home route - passing data to the template
app.get('/', (req, res) => {
  // Instead of res.send(), we use res.render()
  // First argument: template name (views/home.ejs)
  // Second argument: data object to pass to template
  res.render('home', {
    title: 'Welcome to EJS!',
    message: 'This is your first EJS template',
    student: 'Juan Dela Cruz',
    grade: 95,
    date: new Date().toLocaleDateString('en-PH')
  });
});

// Another route with different data
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Page',
    appName: 'My First EJS App',
    version: '1.0.0',
    features: ['Dynamic templates', 'Data passing', 'Easy to learn']
  });
});

app.listen(PORT, () => {
  console.log(`🎉 Server running at http://localhost:${PORT}`);
  console.log(`📄 Using EJS templates from views/ folder`);
});
