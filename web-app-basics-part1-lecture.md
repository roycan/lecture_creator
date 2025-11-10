# Building Web Applications - Part 1
## Node.js, Express, EJS, and JSON

**Target Audience:** Grade 9 Students  
**Prerequisites:** HTML/CSS basics, JavaScript fundamentals, AJAX/Fetch API  
**Duration:** 1-2 weeks

---

## 🎯 What You'll Learn

By the end of this lecture, you'll be able to:
- Use the command line to set up and run projects
- Build a web server with Node.js and Express
- Create dynamic web pages with EJS templates
- Style pages quickly with Bulma CSS
- Store and manage data using JSON files
- Deploy your web app online with Railway

**Final Project:** A complete directory web app (your choice: Barangay Directory, Class List, or Store Inventory) that you can share with friends and family!

---

## 🍔 Introduction: From Browser to Server

Remember when we learned about `fetch()` in the AJAX lecture? We were sending requests from the browser to get data. But where was that data coming from? **A server!**

### The Jollibee Counter Analogy

Think of a web application like Jollibee:

**Browser (Customer):**
- You go to the counter
- You place an order (make a request)
- You wait for your food (loading state)
- You receive your meal (get the response)

**Server (Kitchen & Staff):**
- Takes your order
- Prepares the food (processes data)
- Serves it to you (sends response)
- Manages the menu (stores data)

Up until now, we've only been the **customer** (browser side). Today, we're learning to build the **kitchen and counter** (server side)!

### What We're Building

A complete web application that:
- Runs on your computer (or online)
- Serves web pages
- Shows data from files
- Lets users add new data
- Looks professional with Bulma CSS

---

## 📁 Section 1: Command Line Basics

Before we build web apps, we need to learn to "talk" to our computer using text commands.

### Why Use the Command Line?

**Real Talk:** The command line looks scary, but it's just a way to give instructions to your computer by typing instead of clicking.

Think of it like:
- **GUI (Graphical Interface):** Pointing at menu items in a restaurant
- **Command Line:** Telling the waiter exactly what you want

### Essential Commands

#### Navigation
```bash
# See where you are
pwd

# List files in current folder
ls

# Change directory (go into a folder)
cd my-folder

# Go back one level
cd ..

# Go to home directory
cd ~
```

#### File Management
```bash
# Create a new folder
mkdir my-project

# Create a new file
touch app.js

# Delete a file (careful!)
rm filename.txt

# Delete a folder (very careful!)
rm -rf folder-name
```

#### Running Node.js
```bash
# Run a JavaScript file
node app.js

# Install packages
npm install express

# Start your project
npm start
```

### 🎯 Try It: Your First Commands

1. Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux)
2. Try these commands:
   ```bash
   pwd
   ls
   mkdir test-folder
   cd test-folder
   pwd
   cd ..
   ```

**Download:** [Command Line Cheat Sheet](assets/command-line-cheat-sheet.pdf) - Print this and keep it handy!

---

## 📂 Section 2: Project Structure

A well-organized project is like a well-organized sari-sari store - everything has its place!

### Standard Folder Structure

```
my-web-app/
├── app.js                 # Main server file
├── package.json           # Project info and dependencies
├── .gitignore            # Files to ignore in Git
├── public/               # Static files (CSS, images, client JS)
│   ├── css/
│   ├── images/
│   └── js/
├── views/                # EJS templates (HTML with variables)
│   ├── pages/
│   └── partials/
├── data/                 # JSON data files
│   └── items.json
└── routes/              # Route handlers (optional, for organization)
    └── main.js
```

### Why This Structure?

- **`app.js`**: The "main switch" - starts the server, sets up routes
- **`public/`**: Files sent directly to browser (CSS, images, etc.)
- **`views/`**: HTML templates with placeholders for data
- **`data/`**: JSON files that store information
- **`routes/`**: Organize code by feature (users, products, etc.)

**Analogy:** Think of your project like a house:
- `app.js` = Front door (main entrance)
- `public/` = Living room (what guests see)
- `views/` = Kitchen (where you prepare things)
- `data/` = Storage room (where you keep supplies)

![Project Structure Diagram](diagrams/folder-structure.png)

---

## 🟢 Section 3: Node.js & Express Basics

### What is Node.js?

**Node.js** lets you run JavaScript **outside the browser** - on your computer or a server.

Before Node.js:
- JavaScript only worked in browsers
- Had to use PHP, Python, or Java for servers

After Node.js:
- JavaScript everywhere!
- One language for browser AND server

### What is Express?

**Express** is a tool (framework) that makes building web servers easy.

Without Express:
```javascript
// Lots of complicated code
// Hard to understand
// Many lines just to serve one page
```

With Express:
```javascript
app.get('/', (req, res) => {
  res.send('Hello World!');
});
```

**Much simpler!**

### Your First Express Server

**🎯 Try It: Hello World Server**

1. Create a new folder and navigate into it:
   ```bash
   mkdir my-first-server
   cd my-first-server
   ```

2. Initialize a Node.js project:
   ```bash
   npm init -y
   ```

3. Install Express:
   ```bash
   npm install express
   ```

4. Open the folder in your code editor and look at `assets/01-hello-express/`

**File: `app.js`**
```javascript
// Import Express
const express = require('express');

// Create an Express application
const app = express();

// Define the port
const PORT = 3000;

// Define a route for the home page
app.get('/', (req, res) => {
  res.send('<h1>Hello from my first server! 🚀</h1>');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

5. Run it:
   ```bash
   node app.js
   ```

6. Open your browser and go to: `http://localhost:3000`

**You just built a web server! 🎉**

### Understanding the Code

```javascript
app.get('/', (req, res) => {
  // app.get = Handle GET requests
  // '/' = The URL path (home page)
  // req = Request (what the browser sent)
  // res = Response (what we send back)
  res.send('Hello!');
});
```

Think of routes like counters at Jollibee:
- `/` = Main counter (home page)
- `/chicken` = Chicken counter
- `/burgers` = Burger counter
- `/drinks` = Drinks counter

Each route handles a different request!

![Request Response Flow](diagrams/request-response-flow.png)

---

## 📄 Section 4: Serving Static Files

Static files are files that don't change - like CSS, images, and client-side JavaScript.

### Setting Up Static Files

**🎯 Try It: Serving Static Files**

Look at `assets/02-static-files/`

**File: `app.js`**
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files from 'public' folder
app.use(express.static('public'));

// Route for home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <h1>Welcome to My App!</h1>
      <img src="/images/logo.png" alt="Logo">
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

**File: `public/css/style.css`**
```css
body {
  font-family: Arial, sans-serif;
  margin: 40px;
  background-color: #f5f5f5;
}

h1 {
  color: #3273dc;
}
```

**Key Point:** Files in `public/` are served directly. The URL `/css/style.css` maps to `public/css/style.css`.

---

## 🎨 Section 5: Introduction to EJS Templates

**EJS (Embedded JavaScript)** lets you create HTML pages with placeholders for data.

### Why Use Templates?

**Without Templates:**
```javascript
app.get('/student', (req, res) => {
  res.send('<h1>Student: Juan Dela Cruz</h1>');
  // Hardcoded! Can't change easily
});
```

**With Templates:**
```javascript
app.get('/student', (req, res) => {
  res.render('student', { name: 'Juan Dela Cruz' });
  // Dynamic! Can pass any name
});
```

### Setting Up EJS

**🎯 Try It: Your First EJS Template**

Look at `assets/03-ejs-basic/`

**File: `app.js`**
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Route using EJS template
app.get('/', (req, res) => {
  res.render('home', { 
    title: 'Welcome',
    message: 'Hello from EJS!' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

**File: `views/home.ejs`**
```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
</head>
<body>
  <h1><%= message %></h1>
  <p>Today is: <%= new Date().toLocaleDateString() %></p>
</body>
</html>
```

### EJS Syntax

```ejs
<%= variable %>         <!-- Output value (escaped) -->
<%- htmlVariable %>     <!-- Output HTML (unescaped) -->
<% if (condition) { %>  <!-- JavaScript logic -->
<% } %>

<!-- Example: Loop -->
<% students.forEach(student => { %>
  <li><%= student.name %></li>
<% }); %>
```

**Analogy:** EJS is like a fill-in-the-blanks worksheet. The template has blanks (`<%= %>`) and you provide the answers (data).

![EJS Rendering Process](diagrams/ejs-rendering.png)

---

## 💅 Section 6: Styling with Bulma CSS

**Bulma** is a CSS framework - a collection of pre-made styles you can use to make your site look professional quickly.

### Why Bulma?

- ✅ No JavaScript required (just CSS classes)
- ✅ Clean, modern design
- ✅ Easy to learn (logical class names)
- ✅ Responsive (works on mobile)
- ✅ Smaller than Bootstrap

### Adding Bulma

**Option 1: CDN (easiest)**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
```

**Option 2: Download and use locally**
```bash
npm install bulma
```

### Common Bulma Classes

**🎯 Try It: Bulma Basics**

Look at `assets/04-ejs-data/` - now with Bulma!

**File: `views/home.ejs`**
```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
  <section class="section">
    <div class="container">
      <h1 class="title"><%= message %></h1>
      <p class="subtitle">A simple web app with Bulma CSS</p>
      
      <div class="box">
        <p>This is a box! It looks nice, right?</p>
      </div>
      
      <button class="button is-primary">Click Me!</button>
      <button class="button is-success">Success</button>
      <button class="button is-danger">Danger</button>
    </div>
  </section>
</body>
</html>
```

### Useful Bulma Classes

**Layout:**
- `.container` - Centered, responsive container
- `.section` - Section with padding
- `.columns` / `.column` - Grid layout

**Components:**
- `.box` - Card-like container
- `.button` - Styled button
- `.table` - Styled table
- `.card` - Card component

**Typography:**
- `.title` - Large heading
- `.subtitle` - Smaller heading
- `.content` - Formatted content

**Colors (modifiers):**
- `.is-primary` - Blue
- `.is-success` - Green
- `.is-warning` - Yellow
- `.is-danger` - Red

**Try changing the example above! Add more buttons, boxes, or columns.**

---

## 📊 Section 7: Working with JSON Files

JSON files are perfect for storing small amounts of data during development.

### What is JSON? (Review)

**JSON (JavaScript Object Notation)** is a way to store data in text format.

```json
{
  "name": "Juan Dela Cruz",
  "age": 15,
  "section": "Einstein"
}
```

### Reading JSON Files in Node.js

**🎯 Try It: Display Data from JSON**

Look at `assets/05-json-read/`

**File: `data/students.json`**
```json
[
  { "id": 1, "name": "Maria Santos", "section": "Einstein", "grade": 92 },
  { "id": 2, "name": "Juan Reyes", "section": "Newton", "grade": 88 },
  { "id": 3, "name": "Ana Garcia", "section": "Einstein", "grade": 95 },
  { "id": 4, "name": "Pedro Cruz", "section": "Newton", "grade": 86 }
]
```

**File: `app.js`**
```javascript
const express = require('express');
const fs = require('fs'); // File system module
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Home page - show all students
app.get('/', (req, res) => {
  // Read the JSON file
  const data = fs.readFileSync('data/students.json', 'utf8');
  const students = JSON.parse(data);
  
  // Pass data to template
  res.render('students', { students: students });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

**File: `views/students.ejs`**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Student List</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
  <section class="section">
    <div class="container">
      <h1 class="title">📚 Student List</h1>
      
      <table class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>Name</th>
            <th>Section</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          <% students.forEach(student => { %>
            <tr>
              <td><%= student.name %></td>
              <td><%= student.section %></td>
              <td><%= student.grade %></td>
            </tr>
          <% }); %>
        </tbody>
      </table>
    </div>
  </section>
</body>
</html>
```

**Key Points:**
- `fs.readFileSync()` - Read file contents
- `JSON.parse()` - Convert JSON string to JavaScript object
- Loop through array in EJS with `forEach()`

---

## ✍️ Section 8: Adding Data with Forms

Now let's let users add new data!

**🎯 Try It: Add New Students**

Look at `assets/06-json-add/`

**File: `app.js`**
```javascript
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Helper function to read students
function getStudents() {
  const data = fs.readFileSync('data/students.json', 'utf8');
  return JSON.parse(data);
}

// Helper function to save students
function saveStudents(students) {
  fs.writeFileSync('data/students.json', JSON.stringify(students, null, 2));
}

// Show all students
app.get('/', (req, res) => {
  const students = getStudents();
  res.render('students', { students: students });
});

// Show add form
app.get('/add', (req, res) => {
  res.render('add-student');
});

// Handle form submission
app.post('/add', (req, res) => {
  const students = getStudents();
  
  // Create new student object
  const newStudent = {
    id: students.length + 1,
    name: req.body.name,
    section: req.body.section,
    grade: parseInt(req.body.grade)
  };
  
  // Add to array
  students.push(newStudent);
  
  // Save to file
  saveStudents(students);
  
  // Redirect back to list
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

**File: `views/add-student.ejs`**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Add Student</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
  <section class="section">
    <div class="container">
      <h1 class="title">➕ Add New Student</h1>
      
      <form method="POST" action="/add">
        <div class="field">
          <label class="label">Name</label>
          <div class="control">
            <input class="input" type="text" name="name" required>
          </div>
        </div>
        
        <div class="field">
          <label class="label">Section</label>
          <div class="control">
            <input class="input" type="text" name="section" required>
          </div>
        </div>
        
        <div class="field">
          <label class="label">Grade</label>
          <div class="control">
            <input class="input" type="number" name="grade" min="0" max="100" required>
          </div>
        </div>
        
        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary" type="submit">Add Student</button>
          </div>
          <div class="control">
            <a class="button is-light" href="/">Cancel</a>
          </div>
        </div>
      </form>
    </div>
  </section>
</body>
</html>
```

### Understanding the Flow

1. User visits `/add` → Shows form
2. User fills form and clicks "Add Student"
3. Form sends POST request to `/add` with data
4. Server reads current students from JSON
5. Server adds new student to array
6. Server saves array back to JSON file
7. Server redirects to `/` (home page)
8. User sees updated list with new student!

![Add Data Flow](diagrams/add-data-flow.png)

### Important Concepts

**GET vs POST:**
- `app.get()` - Retrieve/show data (read)
- `app.post()` - Submit/create data (write)

**Form Attributes:**
- `method="POST"` - How to send data
- `action="/add"` - Where to send data
- `name="..."` - Field name (becomes `req.body.name`)

**Middleware:**
```javascript
app.use(express.urlencoded({ extended: true }));
// This line lets Express understand form data
```

---

## 🚀 Section 9: Mini-Project - Choose Your App!

Time to build a complete application! Choose one:

### Option A: Barangay Directory 🏛️

**What it does:**
- Shows list of barangay officials
- Add new officials
- View official details

**Data Structure:** (`data/barangay.json`)
```json
[
  {
    "id": 1,
    "name": "Juan Dela Cruz",
    "position": "Barangay Captain",
    "contact": "0917-123-4567"
  }
]
```

**Features:**
- Home page with official list
- Add new official form
- Each official shown in a card with Bulma

---

### Option B: Class List 📚

**What it does:**
- Shows list of students
- Add new students
- Display class statistics (average grade, total students)

**Data Structure:** (`data/students.json`)
```json
[
  {
    "id": 1,
    "name": "Maria Santos",
    "section": "Einstein",
    "grade": 92,
    "attendance": 95
  }
]
```

**Features:**
- Home page with student table
- Add new student form
- Statistics dashboard (average, count)

---

### Option C: Sari-Sari Store Inventory 🏪

**What it does:**
- Shows product inventory
- Add new products
- Show total inventory value

**Data Structure:** (`data/products.json`)
```json
[
  {
    "id": 1,
    "name": "Pandesal",
    "price": 3,
    "quantity": 50
  }
]
```

**Features:**
- Home page with product list
- Add new product form
- Total value calculation

---

### 🎯 Try It: Build Your Mini-Project

Choose one and open the corresponding folder:
- `assets/mini-project-barangay/`
- `assets/mini-project-students/`
- `assets/mini-project-store/`

Each contains:
- Complete Express app
- EJS templates with Bulma
- JSON data file
- README with instructions

**Run it:**
```bash
cd assets/mini-project-barangay  # or students, or store
npm install
node app.js
```

**Explore the code, make changes, and make it yours!**

---

## 🌐 Section 10: Deploying to Railway

It's time to put your app online so others can see it!

### Why Deploy?

- Share with friends and family
- Add to your portfolio
- Learn real-world deployment
- Feel like a real developer! 🚀

### What is Railway?

**Railway** is a platform that:
- Hosts your Node.js app for free (small projects)
- Gives you a public URL
- Automatically restarts if your app crashes
- Easy to use with GitHub

### Step-by-Step Deployment Guide

**🎯 Try It: Deploy Your App**

See detailed guide: `assets/railway-deployment-guide.md`

**Quick Steps:**

1. **Prepare Your App**
   ```javascript
   // In app.js, use environment variable for port
   const PORT = process.env.PORT || 3000;
   ```

2. **Create `package.json` scripts**
   ```json
   {
     "scripts": {
       "start": "node app.js"
     }
   }
   ```

3. **Create `.gitignore`**
   ```
   node_modules/
   .env
   ```

4. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

5. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway automatically detects and deploys!

6. **Get Your URL**
   - Railway gives you a URL like: `your-app-name.railway.app`
   - Share it with anyone!

### Troubleshooting Common Issues

**Problem:** App crashes on Railway
- **Solution:** Check logs, make sure `PORT` uses `process.env.PORT`

**Problem:** Can't find files
- **Solution:** Make sure all files are committed to GitHub

**Problem:** npm install fails
- **Solution:** Check `package.json` has all dependencies

**See full guide:** `assets/railway-deployment-guide.md` with screenshots

![Deployment Flow](diagrams/deployment-flow.png)

---

## ⚠️ Section 11: Limitations of JSON Files

JSON files work great for learning, but they have problems for real apps:

### Problems with JSON Files

1. **Concurrent Access**
   - What if two people add data at the same time?
   - File might get corrupted or lose data

2. **No Relationships**
   - Can't easily link data (students to their grades, products to categories)

3. **No Querying**
   - Can't easily search, filter, or sort
   - Have to load entire file into memory

4. **No Data Validation**
   - Can't enforce rules (e.g., email must be unique)

5. **Not Scalable**
   - Imagine 10,000 students in one JSON file
   - Slow to read/write, uses lots of memory

### The Solution: Databases!

In **Part 2**, we'll learn about **SQLite** - a real database that solves all these problems:
- ✅ Handles multiple users
- ✅ Can relate data (foreign keys)
- ✅ Powerful queries (SQL)
- ✅ Built-in validation
- ✅ Fast and scalable

![JSON vs Database](diagrams/json-vs-database.png)

---

## 🐛 Section 12: Troubleshooting Guide

### Common Errors and Solutions

#### Error: "Cannot find module 'express'"
**Problem:** Express not installed  
**Solution:**
```bash
npm install express
```

---

#### Error: "Port 3000 is already in use"
**Problem:** Another app using that port  
**Solution:** Change port or stop other app
```javascript
const PORT = 3001; // Try a different port
```

---

#### Error: "Cannot GET /"
**Problem:** No route defined for home page  
**Solution:** Add route
```javascript
app.get('/', (req, res) => {
  res.send('Home page');
});
```

---

#### Error: "Failed to lookup view"
**Problem:** EJS can't find template  
**Solution:** Check view engine is set and file exists
```javascript
app.set('view engine', 'ejs');
// Make sure views/home.ejs exists
```

---

#### Error: "Unexpected token in JSON"
**Problem:** JSON file has syntax error  
**Solution:** Validate JSON at [jsonlint.com](https://jsonlint.com)

---

#### Error: "Cannot read property 'name' of undefined"
**Problem:** Data not passed to template  
**Solution:** Make sure to pass data
```javascript
res.render('page', { data: yourData }); // Don't forget data!
```

---

#### Railway Deployment Issues

**App crashes immediately:**
- Check logs in Railway dashboard
- Make sure `PORT` uses `process.env.PORT`
- Verify all dependencies in `package.json`

**Can't access app:**
- Make sure port is correct
- Check Railway domain is set up
- Wait a few minutes for deployment

**Files not found:**
- Ensure all files committed to GitHub
- Check file paths are relative, not absolute
- Verify `.gitignore` isn't excluding needed files

---

## 🎓 Section 13: What You've Learned

Congratulations! You can now:
- ✅ Use the command line confidently
- ✅ Set up a Node.js project with Express
- ✅ Create routes and serve pages
- ✅ Use EJS templates for dynamic HTML
- ✅ Style with Bulma CSS
- ✅ Read and write JSON files
- ✅ Build forms and handle user input
- ✅ Deploy apps to Railway

**You've built a complete web application from scratch!** 🎉

---

## 🚀 What's Next? (Part 2 Preview)

In **Part 2: Databases, Authentication, and Advanced Features**, you'll learn:

### SQLite Database
- Why databases are better than JSON
- Creating tables and schemas
- SQL queries (SELECT, INSERT, UPDATE, DELETE)
- Relationships between data

### User Authentication
- Session management
- Login and registration
- Password hashing (keeping passwords safe)
- Protecting routes (only logged-in users can access)

### File Uploads
- Let users upload profile pictures
- Handle documents and images
- Store files on server

### Advanced Deployment
- Environment variables (secrets)
- Database on Railway
- Production best practices

**Get ready to level up!** 🚀

---

## 📚 Additional Resources

### Documentation
- [Express.js Official Docs](https://expressjs.com/)
- [EJS Documentation](https://ejs.co/)
- [Bulma Documentation](https://bulma.io/documentation/)
- [Railway Documentation](https://docs.railway.app/)

### Practice Projects
- Build a blog (posts, comments)
- Create a recipe book app
- Make a todo list with categories
- Build a simple e-commerce catalog

### Command Line
- Download: [Command Line Cheat Sheet](assets/command-line-cheat-sheet.pdf)

### Deployment
- Read: [Railway Deployment Guide](assets/railway-deployment-guide.md)

---

## 🎯 Challenge Ideas

Ready for more? Try these extensions:

### Easy
- Add search functionality to your mini-project
- Create an "About" page with information
- Add more fields to your data (email, phone, etc.)

### Medium
- Add filtering (show only Einstein section)
- Create a details page for each item
- Add pagination (show 5 items per page)

### Hard
- Add edit functionality (update existing data)
- Add delete functionality (with confirmation)
- Create data validation (check for duplicates)

---

## 💭 Reflection Questions

1. What's the difference between a GET and POST request?
2. Why do we use templates (EJS) instead of plain HTML?
3. What are the advantages of using a CSS framework like Bulma?
4. What problems do JSON files have for real applications?
5. How does deploying to Railway differ from running locally?

**Discuss with your classmates or write in your journal!**

---

## 🙏 Closing Thoughts

You've taken a huge step in your web development journey. You started with HTML and CSS, learned JavaScript, mastered async operations, and now you can build and deploy complete web applications!

**Remember:**
- Every developer started where you are
- It's okay to feel confused sometimes
- Practice is the key to mastery
- Build things that interest you
- Share your work and get feedback

**You're not just learning to code - you're building the future!** 🌟

---

**Ready for Part 2? Let's add databases and authentication to make your apps production-ready!**
