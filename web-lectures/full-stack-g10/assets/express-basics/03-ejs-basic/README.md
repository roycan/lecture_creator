# 03 - EJS Basic

Learn the fundamentals of EJS templating.

## What This Does

- Uses EJS instead of plain HTML
- Passes data from Express to templates
- Shows variables, conditionals, and loops in EJS

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

## EJS Syntax

### Output Values
```ejs
<%= variable %>
```

### JavaScript Logic
```ejs
<% if (condition) { %>
  <p>Show this</p>
<% } %>
```

### Loops
```ejs
<% array.forEach(item => { %>
  <li><%= item %></li>
<% }); %>
```

## File Structure

```
03-ejs-basic/
├── app.js
├── package.json
└── views/
    ├── home.ejs
    └── about.ejs
```

## Key Concepts

1. **Set view engine**: `app.set('view engine', 'ejs')`
2. **Render template**: `res.render('home', { data })`
3. **Access data**: `<%= variableName %>`

## Try It

1. Change the `student` name in `app.js`
2. Modify the grade to see different messages
3. Add more features to the array
4. Create a new template file and route
