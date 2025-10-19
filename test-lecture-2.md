# Introduction to CSS

Welcome to today's lesson on **Cascading Style Sheets (CSS)**! 

CSS is what makes websites beautiful. Today we'll learn how to add colors, fonts, and layouts to web pages.

## What is CSS?

CSS stands for **Cascading Style Sheets**.

Think of HTML as the skeleton of a website, and CSS as the clothing and makeup that makes it look good!

**Key points:**
- HTML provides structure (headings, paragraphs, images)
- CSS provides style (colors, fonts, spacing)
- Together, they create beautiful websites

## Why "Cascading"?

The word "cascading" means styles flow down like a waterfall. 

If you style a parent element, the children inherit those styles automatically!

**Example:**
- If you make a `<div>` blue, everything inside it becomes blue too
- Unless you override it with a different style

## Basic CSS Syntax

CSS follows a simple pattern:

```css
selector {
    property: value;
}
```

**Let's break it down:**
- **Selector:** What element you want to style (e.g., `h1`, `p`, `.class`)
- **Property:** What you want to change (e.g., `color`, `font-size`)
- **Value:** How you want to change it (e.g., `red`, `20px`)

**Example:**
```css
h1 {
    color: blue;
    font-size: 32px;
}
```

This makes all `<h1>` headings blue and 32 pixels tall!

## Three Ways to Add CSS

### 1. Inline CSS (Inside HTML tags)

```html
<p style="color: red;">This text is red!</p>
```

✅ **Good for:** Quick single changes  
❌ **Bad for:** Styling multiple elements (too repetitive)

### 2. Internal CSS (In the `<style>` tag)

```html
<style>
    p {
        color: green;
        font-size: 16px;
    }
</style>
```

✅ **Good for:** Styling one page  
❌ **Bad for:** Multi-page websites (can't reuse)

### 3. External CSS (Separate .css file)

```html
<link rel="stylesheet" href="styles.css">
```

✅ **Good for:** Professional websites, reusable styles  
✅ **Best practice:** Use this for real projects!

## CSS Selectors - Part 1

### Element Selectors

Style all elements of a type:

```css
p {
    color: navy;
}

h1 {
    color: purple;
}
```

This styles **ALL** paragraphs and **ALL** h1 headings.

### Class Selectors

Style specific elements with a class:

```html
<p class="highlight">Important text</p>
<p>Normal text</p>
```

```css
.highlight {
    background-color: yellow;
    font-weight: bold;
}
```

Only the first paragraph gets highlighted! 🎨

### ID Selectors

Style a single unique element:

```html
<div id="header">Website Header</div>
```

```css
#header {
    background-color: black;
    color: white;
    padding: 20px;
}
```

**Remember:** IDs should be unique - use only once per page!

## CSS Colors

### Named Colors
```css
color: red;
color: blue;
color: coral;
```

There are 140+ named colors in CSS!

### Hex Colors
```css
color: #FF5733;  /* Orange-red */
color: #00FF00;  /* Green */
color: #000000;  /* Black */
```

Hex codes use 6 characters: RRGGBB (Red, Green, Blue)

### RGB Colors
```css
color: rgb(255, 87, 51);  /* Same orange-red */
color: rgb(0, 255, 0);     /* Green */
```

**Pro tip:** Use rgb() when you need transparency with rgba()!

```css
background-color: rgba(255, 0, 0, 0.5);  /* 50% transparent red */
```

## Text Styling Properties

### Font Properties

```css
p {
    font-family: Arial, sans-serif;
    font-size: 16px;
    font-weight: bold;
    font-style: italic;
}
```

**Common font families:**
- Arial, Helvetica (clean, modern)
- Times New Roman (formal, traditional)
- Courier New (looks like typewriter)
- Georgia (elegant for reading)

### Text Decoration

```css
a {
    text-decoration: none;  /* Remove underline */
}

.strikethrough {
    text-decoration: line-through;
}
```

### Text Alignment

```css
h1 {
    text-align: center;
}

p {
    text-align: justify;
}
```

Options: `left`, `right`, `center`, `justify`

## The Box Model

Every HTML element is a rectangular box with four parts:

```
┌─────────────────────────────────┐
│         Margin (space)          │
│  ┌───────────────────────────┐  │
│  │     Border (outline)      │  │
│  │  ┌─────────────────────┐  │  │
│  │  │  Padding (cushion)  │  │  │
│  │  │  ┌───────────────┐  │  │  │
│  │  │  │   Content     │  │  │  │
│  │  │  │  (text/image) │  │  │  │
│  │  │  └───────────────┘  │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Example:**
```css
div {
    width: 200px;
    padding: 20px;      /* Space inside */
    border: 2px solid black;
    margin: 10px;       /* Space outside */
}
```

## Borders and Backgrounds

### Borders

```css
.box {
    border: 3px solid red;
    border-radius: 10px;  /* Rounded corners */
}
```

Border parts:
- **Width:** How thick (1px, 5px, etc.)
- **Style:** solid, dashed, dotted, double
- **Color:** red, #333, rgb(0,0,0)

### Backgrounds

```css
body {
    background-color: lightblue;
}

.hero {
    background-image: url('sunset.jpg');
    background-size: cover;
}
```

**Cool background tricks:**
```css
.gradient {
    background: linear-gradient(to right, red, yellow);
}
```

## Width, Height, and Spacing

### Sizing Elements

```css
.container {
    width: 800px;      /* Fixed width */
    height: 400px;     /* Fixed height */
}

.responsive {
    width: 80%;        /* Relative to parent */
    max-width: 1200px; /* Won't exceed this */
}
```

### Margin and Padding

```css
/* All sides */
margin: 20px;

/* Top/Bottom, Left/Right */
margin: 10px 20px;

/* Top, Right, Bottom, Left (clockwise) */
margin: 10px 20px 30px 40px;

/* Individual sides */
margin-top: 10px;
margin-right: 20px;
margin-bottom: 30px;
margin-left: 40px;
```

**Same pattern works for padding!**

## Practice Challenge! 🎯

**Create a card design:**
1. Use a div with class "card"
2. Add padding: 20px
3. Add border: 2px solid gray
4. Add border-radius: 8px
5. Add background-color: lightgray
6. Make heading inside blue
7. Make paragraph text 14px

**Solution:**
```css
.card {
    padding: 20px;
    border: 2px solid gray;
    border-radius: 8px;
    background-color: lightgray;
}

.card h2 {
    color: blue;
}

.card p {
    font-size: 14px;
}
```

## Common Mistakes to Avoid ⚠️

### Mistake 1: Forgetting Semicolons
```css
/* ❌ Wrong */
p {
    color: red
    font-size: 16px
}

/* ✅ Correct */
p {
    color: red;
    font-size: 16px;
}
```

### Mistake 2: Mixing up Classes and IDs
```css
/* ❌ Wrong - using # for class */
#myClass {
    color: red;
}

/* ✅ Correct - using . for class */
.myClass {
    color: red;
}
```

### Mistake 3: Not Using Quotes for Fonts with Spaces
```css
/* ❌ Wrong */
font-family: Times New Roman;

/* ✅ Correct */
font-family: "Times New Roman", serif;
```

## Real-World Example: Simple Navigation Bar

**HTML:**
```html
<nav>
    <a href="#home">Home</a>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
</nav>
```

**CSS:**
```css
nav {
    background-color: #333;
    padding: 15px;
    text-align: center;
}

nav a {
    color: white;
    text-decoration: none;
    margin: 0 20px;
    font-size: 18px;
}

nav a:hover {
    color: orange;
}
```

**Result:** A professional dark navigation bar with links that turn orange when you hover! 🎨

## CSS Best Practices

### 1. Keep it Organized
```css
/* Group related styles together */

/* Typography */
h1, h2, h3 { font-family: Arial; }
p { line-height: 1.6; }

/* Layout */
.container { width: 1200px; }
.sidebar { width: 300px; }
```

### 2. Use Comments
```css
/* Main header styles */
header {
    background: blue;
}

/* Footer with copyright info */
footer {
    color: gray;
    font-size: 12px;
}
```

### 3. Use Meaningful Class Names
```css
/* ❌ Avoid */
.xyz123 { ... }
.box1 { ... }

/* ✅ Better */
.product-card { ... }
.main-navigation { ... }
```

## Summary: Key Takeaways

**Remember these CSS essentials:**

1. ✅ CSS adds style to HTML structure
2. ✅ Three ways: Inline, Internal, External (use External!)
3. ✅ Selectors: element, .class, #id
4. ✅ Box model: Content → Padding → Border → Margin
5. ✅ Colors: named, hex (#FF0000), rgb(255,0,0)
6. ✅ Always end declarations with semicolons ;
7. ✅ Classes can be reused, IDs are unique
8. ✅ Practice, practice, practice!

## Homework Assignment 📝

**Create your personal profile card:**
1. Create an HTML file with your name, favorite hobby, and a fun fact
2. Style it with CSS:
   - Center all text
   - Use a nice color scheme (background + text colors)
   - Add padding and border to make it card-like
   - Use at least 3 different fonts properties
   - Make it look professional!

**Bonus:** Add a hover effect that changes the background color!

## Resources for Learning More

**Great websites to practice CSS:**
- W3Schools CSS Tutorial
- MDN Web Docs (Mozilla)
- CSS-Tricks.com
- CodePen.io (see examples)

**CSS Games to Practice:**
- Flexbox Froggy (learn layout)
- CSS Diner (learn selectors)
- Grid Garden (learn CSS Grid)

## Questions to Think About 🤔

1. What's the difference between padding and margin?
2. When would you use a class vs. an ID?
3. Why is external CSS better than inline CSS?
4. How would you make a button that changes color when you hover over it?
5. What does "cascading" mean in CSS?

**Discuss these with your classmates!**

## Thank You! 🎉

Great job learning CSS today! Remember:
- Start simple and build up your skills
- Experiment with different properties
- View source code on websites you like
- Practice every day

**Next class:** We'll learn about **CSS Flexbox** for amazing layouts!

Keep coding! 💻✨
