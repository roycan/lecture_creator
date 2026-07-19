# 04 - EJS with Data and Bulma CSS

This example demonstrates how to use **EJS templates** with real data and style them using **Bulma CSS framework**.

## What's New in This Example

1. **Bulma CSS Framework** - Professional styling without writing custom CSS
2. **Complex Data** - Arrays of objects instead of simple values
3. **Dynamic Styling** - CSS classes change based on data (grade colors)
4. **Responsive Layout** - Bulma's grid system for mobile-friendly design
5. **Reusable Components** - Navigation bar and footer across pages

## Files

- `app.js` - Express server with hardcoded student data
- `views/home.ejs` - Displays student list with cards and conditional styling
- `views/about.ejs` - About page with app information
- `public/css/style.css` - Custom CSS for additional styling

## Key Concepts

### Bulma CSS Classes

```html
<!-- Container and sections -->
<section class="section">
  <div class="container">
    <!-- content here -->
  </div>
</section>

<!-- Columns (responsive grid) -->
<div class="columns is-multiline">
  <div class="column is-half">
    <!-- Takes up half the row -->
  </div>
</div>

<!-- Cards -->
<div class="card">
  <div class="card-content">
    <!-- card content -->
  </div>
</div>

<!-- Buttons -->
<button class="button is-primary">Click Me</button>
<button class="button is-link">Learn More</button>

<!-- Tags (for labels) -->
<span class="tag is-success">90</span>
<span class="tag is-danger">70</span>

<!-- Navbar -->
<nav class="navbar is-primary">
  <!-- navbar content -->
</nav>
```

### Conditional Styling in EJS

```ejs
<!-- Change tag color based on grade -->
<span class="tag <%= grade >= 90 ? 'is-success' : grade >= 80 ? 'is-info' : 'is-warning' %>">
  <%= grade %>
</span>
```

### Looping Through Complex Data

```ejs
<% students.forEach(student => { %>
  <div class="card">
    <h3><%= student.name %></h3>
    <p>Course: <%= student.course %></p>
    <p>Grade: <%= student.grade %></p>
  </div>
<% }); %>
```

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open browser to `http://localhost:3000`

## Try It Yourself

1. **Add more students** to the array in `app.js`
2. **Change the grade thresholds** for different colors
3. **Add more Bulma components** from [Bulma Documentation](https://bulma.io/documentation/)
4. **Create a new page** with different data (e.g., courses list)
5. **Customize colors** in `public/css/style.css`

## Bulma Quick Reference

| Component | Class | Purpose |
|-----------|-------|---------|
| Button | `button is-primary` | Styled button |
| Card | `card` | Container with shadow |
| Columns | `columns`, `column` | Responsive grid |
| Tag | `tag is-success` | Label/badge |
| Navbar | `navbar is-primary` | Navigation bar |
| Section | `section` | Page section with padding |
| Container | `container` | Centered content area |
| Box | `box` | White container with shadow |

## Color Modifiers

- `is-primary` - Turquoise (default primary color)
- `is-link` - Blue
- `is-info` - Cyan
- `is-success` - Green
- `is-warning` - Yellow
- `is-danger` - Red

## Next Steps

See `05-json-read` to learn how to load data from JSON files instead of hardcoding it in your JavaScript!
