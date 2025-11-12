# 📱 Responsive Web Design with Bulma

**For:** Grade 9 Filipino Students  
**Prerequisites:** HTML Fundamentals  
**Time:** 4-5 hours  
**Goal:** Create mobile-friendly websites that work on any device

---

## 📖 Introduction: The Philippine Mobile Reality

Imagine you just created a beautiful barangay website on your computer. It looks perfect! The navigation is clear, the forms are neat, and everything is organized.

Then your Kagawad opens it on his phone... and everything is tiny. He has to pinch and zoom just to read the text. The buttons are too small to tap. The form fields are impossible to fill out. He gives up and calls you instead. 😓

**This is the mobile problem.**

### 🇵🇭 Why Mobile Matters in the Philippines

Did you know that in the Philippines:
- **75% of Filipinos access the internet primarily through mobile phones** 📱
- Many Filipinos don't own computers but have smartphones
- Mobile data is more accessible than home WiFi in many areas
- Students, tricycle drivers, sari-sari store owners - everyone uses mobile

**If your website doesn't work on mobile, you're excluding most Filipinos.**

### 🎯 What You'll Learn

In this lecture, you'll learn how to create **responsive websites** that automatically adapt to any screen size - from smartphones to tablets to desktop computers. We'll use **Bulma**, a modern CSS framework that makes responsive design easy.

By the end, you'll be able to create websites that look great on:
- 📱 **Mobile phones** (320px - 768px) - Most Filipinos
- 📲 **Tablets** (769px - 1023px) - Some users
- 💻 **Laptops/Desktops** (1024px+) - Fewer users

**Remember:** In the Philippines, **mobile comes first!** 🇵🇭

---

## 🔧 Section 1: The Viewport Meta Tag

Before we use Bulma, we need to understand one critical HTML tag that makes responsive design possible: the **viewport meta tag**.

### The Problem Without Viewport

When smartphones first came out, they pretended to have wide screens (like 980px) to display desktop websites. This meant everything appeared tiny and users had to zoom in. Not great!

### The Solution: Viewport Meta Tag

Add this to the `<head>` section of **every** HTML page:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### **Visual Guide: Viewport Meta Tag**

![Viewport Meta Tag](diagrams/bulma/viewport-meta-tag.png)
*Figure 1: How viewport meta tag transforms mobile display from zoomed-out desktop view to proper mobile rendering*

**What it means:**
- `width=device-width` - Use the actual width of the device (not fake 980px)
- `initial-scale=1` - Don't zoom in or out by default (1 = 100%)

### Complete HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My Responsive Page</title>
</head>
<body>
    <h1>This page will work on mobile!</h1>
</body>
</html>
```

**💡 Remember:** Without the viewport meta tag, your responsive design **won't work** on mobile phones. Always include it!

---

## 🎨 Section 2: What is Bulma?

**Bulma** is a modern CSS framework that provides pre-built styles for responsive design. Think of it as a toolbox of ready-made components:

- ✅ **Grid system** - Arrange content in columns that adapt to screen size
- ✅ **Navigation bars** - Mobile-friendly menus with burger icon
- ✅ **Forms** - Styled inputs that work on touchscreens
- ✅ **Buttons** - Touch-friendly buttons in different colors
- ✅ **Cards** - Beautiful content containers
- ✅ **And much more!**

### Why Use Bulma?

**Instead of writing:**
```css
/* Hundreds of lines of custom CSS for responsiveness */
@media screen and (max-width: 768px) {
    .column { width: 100%; }
}
@media screen and (min-width: 769px) and (max-width: 1023px) {
    .column { width: 50%; }
}
/* etc... */
```

**You just write:**
```html
<div class="columns is-mobile">
    <div class="column">Content</div>
</div>
```

Bulma handles all the responsive magic for you! 🪄

### **Visual Guide: Mobile-First Approach**

![Mobile-First Approach](diagrams/bulma/mobile-first-approach.png)
*Figure 2: Mobile-first design philosophy - start with mobile layout, then enhance for larger screens*

### Adding Bulma to Your Project

There are two ways to add Bulma:

#### Option 1: CDN (Recommended for Learning)

Add this `<link>` in your `<head>` section:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
```

**Pros:** 
- ✅ Simple - just one line
- ✅ No downloads needed
- ✅ Automatically cached by browsers

**Cons:**
- ❌ Requires internet connection

#### Option 2: Downloaded File (For Offline Use)

1. Download `bulma.min.css` from https://bulma.io
2. Put it in your project folder
3. Link to it: `<link rel="stylesheet" href="bulma.min.css">`

**Pros:**
- ✅ Works offline

**Cons:**
- ❌ Larger project file size
- ❌ You manage updates

### Complete Bulma Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My Bulma Page</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
    <section class="section">
        <div class="container">
            <h1 class="title">Welcome to Bulma!</h1>
            <p class="subtitle">This page is responsive! 📱💻</p>
        </div>
    </section>
</body>
</html>
```

**🎯 Try It:** Create this file and open it in your browser. Then resize the window - notice how Bulma styles everything beautifully!

---

## 📏 Section 3: Understanding Bulma's Grid System

The most important feature of Bulma is its **grid system** using **columns**. This lets you arrange content side-by-side on large screens, but stack vertically on mobile.

### **Visual Guide: Grid System**

![Grid System](diagrams/bulma/grid-system.png)
*Figure 3: Bulma's 12-column grid system showing how columns adapt from desktop to tablet to mobile*

### Basic Columns

```html
<div class="columns">
    <div class="column">
        First column
    </div>
    <div class="column">
        Second column
    </div>
    <div class="column">
        Third column
    </div>
</div>
```

**On Desktop (1024px+):** Three columns side-by-side  
**On Tablet (769px - 1023px):** Three columns side-by-side  
**On Mobile (< 768px):** Three columns **stacked vertically** (automatic!)

### Mobile Columns (Side-by-Side Even on Phone)

Sometimes you want columns on mobile too:

```html
<div class="columns is-mobile">
    <div class="column">First</div>
    <div class="column">Second</div>
</div>
```

The `is-mobile` modifier keeps columns side-by-side even on phones. Use this for things like:
- Icon grids
- Small product cards
- Stat counters

### Column Sizes

You can control how much space each column takes (12-column system):

```html
<div class="columns">
    <div class="column is-8">
        Main content (8/12 = 66%)
    </div>
    <div class="column is-4">
        Sidebar (4/12 = 33%)
    </div>
</div>
```

**Column size options:**
- `is-1` through `is-12` (1/12 to 12/12)
- `is-half` (6/12 = 50%)
- `is-one-third` (4/12 = 33%)
- `is-two-thirds` (8/12 = 66%)
- `is-one-quarter` (3/12 = 25%)
- `is-three-quarters` (9/12 = 75%)

### **Visual Guide: Column Sizing Reference**

![Column Sizing Reference](diagrams/bulma/column-sizing-reference.png)
*Figure 4: Complete reference of Bulma column sizes from is-1 to is-12 and fractional sizes*

### 🇵🇭 Philippine Example: Sari-Sari Store Layout

```html
<div class="columns">
    <div class="column is-8">
        <h2 class="title">Tindahan ni Aling Rosa</h2>
        <div class="columns is-mobile is-multiline">
            <!-- Product cards - 2 per row on mobile -->
            <div class="column is-half-mobile is-one-third-tablet">
                <div class="card">
                    <div class="card-content">
                        <p class="title is-4">Skyflakes</p>
                        <p class="subtitle is-6">₱8.00</p>
                    </div>
                </div>
            </div>
            <div class="column is-half-mobile is-one-third-tablet">
                <div class="card">
                    <div class="card-content">
                        <p class="title is-4">Lucky Me</p>
                        <p class="subtitle is-6">₱12.50</p>
                    </div>
                </div>
            </div>
            <!-- More products... -->
        </div>
    </div>
    <div class="column is-4">
        <aside class="box">
            <h3 class="title is-5">Store Hours</h3>
            <p>Mon-Sun: 6am - 10pm</p>
        </aside>
    </div>
</div>
```

**Result:**
- **Mobile:** Products in 2 columns, sidebar below
- **Tablet:** Products in 3 columns, sidebar on right
- **Desktop:** Same as tablet but wider

### Centered Columns

Center a column for focused content:

```html
<div class="columns is-centered">
    <div class="column is-half">
        <form>
            <!-- Login form centered on page -->
        </form>
    </div>
</div>
```

### Multiline Columns

Let columns wrap to multiple rows:

```html
<div class="columns is-multiline">
    <div class="column is-one-quarter">Product 1</div>
    <div class="column is-one-quarter">Product 2</div>
    <div class="column is-one-quarter">Product 3</div>
    <div class="column is-one-quarter">Product 4</div>
    <div class="column is-one-quarter">Product 5</div>
    <!-- Wraps to next row automatically! -->
</div>
```

**🎯 Try It:** Open `assets/bulma-grid-demo.html` to see all these column patterns in action!

---

## 👁️ Section 4: Responsive Helpers (Show/Hide on Different Screens)

Sometimes you want to show different content on mobile vs desktop. Bulma provides **responsive helper classes** for this.

### **Visual Guide: Responsive Helpers**

![Responsive Helpers](diagrams/bulma/responsive-helpers.png)
*Figure 5: Bulma responsive helper classes showing which elements display at different screen sizes*

### Hide on Specific Breakpoints

```html
<div class="is-hidden-mobile">
    This content only appears on tablets and desktops (not phones)
</div>

<div class="is-hidden-tablet">
    This content only appears on mobile and desktop (not tablets)
</div>

<div class="is-hidden-desktop">
    This content only appears on mobile and tablets (not desktops)
</div>
```

### Show ONLY on Specific Breakpoints

```html
<div class="is-block-mobile is-hidden-tablet-only is-hidden-desktop-only">
    Mobile-only content (hidden on tablet and desktop)
</div>

<div class="is-hidden-mobile is-block-tablet is-hidden-desktop-only">
    Tablet-only content
</div>

<div class="is-hidden-mobile is-hidden-tablet-only is-block-desktop">
    Desktop-only content
</div>
```

### 🇵🇭 Philippine Example: Barangay Navigation

```html
<nav class="navbar is-primary">
    <div class="navbar-brand">
        <a class="navbar-item">
            <strong>Barangay San Juan</strong>
        </a>
    </div>
    
    <!-- Full menu on desktop -->
    <div class="navbar-menu is-hidden-mobile">
        <div class="navbar-start">
            <a class="navbar-item">Home</a>
            <a class="navbar-item">Officials</a>
            <a class="navbar-item">Services</a>
            <a class="navbar-item">Announcements</a>
            <a class="navbar-item">Contact</a>
        </div>
    </div>
    
    <!-- Simple menu on mobile -->
    <div class="navbar-end is-hidden-tablet">
        <a class="navbar-item">Menu</a>
    </div>
</nav>
```

### Real-World Use Cases

**1. Long descriptions (Mobile: short, Desktop: full)**
```html
<p class="is-hidden-tablet">
    Barangay clearance available. Apply now!
</p>
<p class="is-hidden-mobile">
    Barangay clearance certificates are available for residents who need 
    proof of residency for job applications, school enrollment, or other 
    requirements. Please bring valid ID and ₱50 processing fee.
</p>
```

**2. Images (Mobile: smaller, Desktop: larger)**
```html
<img src="barangay-hall-small.jpg" class="is-hidden-tablet" alt="Barangay Hall">
<img src="barangay-hall-large.jpg" class="is-hidden-mobile" alt="Barangay Hall">
```

**3. Tables vs Cards (Mobile: cards, Desktop: tables)**
```html
<!-- Mobile: Card layout (easier to read) -->
<div class="is-hidden-tablet">
    <div class="card">
        <div class="card-content">
            <p><strong>Juan Dela Cruz</strong></p>
            <p>Kagawad</p>
            <p>0912-345-6789</p>
        </div>
    </div>
    <!-- More cards... -->
</div>

<!-- Desktop: Table layout -->
<table class="table is-hidden-mobile">
    <thead>
        <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Contact</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Juan Dela Cruz</td>
            <td>Kagawad</td>
            <td>0912-345-6789</td>
        </tr>
        <!-- More rows... -->
    </tbody>
</table>
```

**🎯 Try It:** Open `assets/bulma-responsive-helpers.html` and resize your browser to see content appear/disappear!

---

## 📝 Section 5: Mobile-Friendly Forms

Forms are tricky on mobile because:
- ❌ Small text is hard to read
- ❌ Tiny input boxes are hard to tap
- ❌ Wrong keyboards appear (number vs text vs email)

Bulma + HTML5 make forms mobile-friendly automatically!

### Basic Bulma Form Structure

```html
<div class="field">
    <label class="label">Name</label>
    <div class="control">
        <input class="input" type="text" placeholder="Juan Dela Cruz">
    </div>
</div>
```

**Bulma form classes:**
- `.field` - Container for each form element
- `.label` - Label for the input
- `.control` - Wrapper for the input itself
- `.input` - Styled text input
- `.textarea` - Styled multiline text
- `.select` - Styled dropdown
- `.button` - Styled button

### HTML5 Input Types for Mobile

Use the right `type` attribute to get the correct keyboard on mobile:

```html
<!-- Text keyboard (default) -->
<input class="input" type="text" placeholder="Your name">

<!-- Email keyboard (has @ and .com) -->
<input class="input" type="email" placeholder="juan@email.com">

<!-- Phone keyboard (numbers and symbols) -->
<input class="input" type="tel" placeholder="0912-345-6789">

<!-- Number keyboard (just numbers) -->
<input class="input" type="number" placeholder="Age">

<!-- Date picker (calendar widget) -->
<input class="input" type="date">

<!-- URL keyboard (has .com and /) -->
<input class="input" type="url" placeholder="https://website.com">
```

**On mobile phones, the keyboard automatically changes based on the input type!** 📱⌨️

### Touch-Friendly Buttons

Make buttons large enough to tap with a finger:

```html
<!-- Regular button -->
<button class="button is-primary">Submit</button>

<!-- Medium button (better for mobile) -->
<button class="button is-primary is-medium">Submit</button>

<!-- Large button (easiest to tap) -->
<button class="button is-primary is-large">Submit</button>
```

**Rule of thumb:** Buttons should be at least **44x44 pixels** for easy tapping.

### Form Validation

Use HTML5 validation attributes:

```html
<div class="field">
    <label class="label">Email <span class="has-text-danger">*</span></label>
    <div class="control">
        <input class="input" 
               type="email" 
               placeholder="juan@email.com"
               required>
    </div>
    <p class="help">We'll never share your email</p>
</div>

<div class="field">
    <label class="label">Age <span class="has-text-danger">*</span></label>
    <div class="control">
        <input class="input" 
               type="number" 
               min="13" 
               max="100"
               required>
    </div>
    <p class="help">Must be 13 or older</p>
</div>
```

**Validation attributes:**
- `required` - Field must be filled
- `min` / `max` - Number/date range
- `minlength` / `maxlength` - Text length
- `pattern` - Regular expression (advanced)

### 🇵🇭 Philippine Example: Barangay Clearance Form

```html
<section class="section">
    <div class="container">
        <div class="columns is-centered">
            <div class="column is-two-thirds-tablet is-half-desktop">
                <div class="box">
                    <h1 class="title">Barangay Clearance Application</h1>
                    <p class="subtitle">Barangay San Juan, Manila</p>
                    
                    <form>
                        <div class="field">
                            <label class="label">Complete Name *</label>
                            <div class="control">
                                <input class="input" 
                                       type="text" 
                                       placeholder="Juan Dela Cruz"
                                       required>
                            </div>
                        </div>
                        
                        <div class="field">
                            <label class="label">Contact Number *</label>
                            <div class="control">
                                <input class="input" 
                                       type="tel" 
                                       placeholder="0912-345-6789"
                                       required>
                            </div>
                        </div>
                        
                        <div class="field">
                            <label class="label">Email</label>
                            <div class="control">
                                <input class="input" 
                                       type="email" 
                                       placeholder="juan@email.com">
                            </div>
                        </div>
                        
                        <div class="field">
                            <label class="label">Address *</label>
                            <div class="control">
                                <textarea class="textarea" 
                                          placeholder="House No., Street, Purok"
                                          required></textarea>
                            </div>
                        </div>
                        
                        <div class="field">
                            <label class="label">Purpose *</label>
                            <div class="control">
                                <div class="select is-fullwidth">
                                    <select required>
                                        <option value="">Select purpose</option>
                                        <option>Employment</option>
                                        <option>School Requirements</option>
                                        <option>Business Permit</option>
                                        <option>Driver's License</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="field">
                            <label class="checkbox">
                                <input type="checkbox" required>
                                I certify that the information above is true and correct
                            </label>
                        </div>
                        
                        <div class="field is-grouped">
                            <div class="control">
                                <button class="button is-primary is-medium" type="submit">
                                    Submit Application
                                </button>
                            </div>
                            <div class="control">
                                <button class="button is-light is-medium" type="reset">
                                    Clear Form
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>
```

**Why this form is mobile-friendly:**
- ✅ Centered with `is-centered` columns
- ✅ Right input types (`tel`, `email`, `text`)
- ✅ Large touch-friendly buttons (`is-medium`)
- ✅ Full-width dropdowns (`is-fullwidth`)
- ✅ Clear labels and placeholders
- ✅ Validation with `required`

**🎯 Try It:** Open `assets/mobile-form.html` on your phone and see how the keyboard changes for each input!

---

## 🎨 Section 6: Bulma Components for Responsive Design

Bulma includes many components that are automatically responsive. Let's explore the most useful ones.

### 1. Container

The `.container` class creates a centered, responsive wrapper with automatic margins:

```html
<div class="container">
    <!-- Content is centered with nice margins -->
    <h1>Welcome to my site!</h1>
</div>
```

**Behavior:**
- Mobile: Full width with small padding
- Tablet: Max width ~960px, centered
- Desktop: Max width ~1152px, centered
- Widescreen: Max width ~1344px, centered

### 2. Section

The `.section` class adds vertical padding:

```html
<section class="section">
    <div class="container">
        <!-- Content with nice vertical spacing -->
    </div>
</section>
```

### 3. Box

The `.box` class creates a card-like container:

```html
<div class="box">
    <h2>Announcement</h2>
    <p>Barangay assembly on Saturday, 3pm at the covered court.</p>
</div>
```

### 4. Hero (Full-Width Banner)

The `.hero` class creates an impressive full-width banner:

```html
<section class="hero is-primary is-medium">
    <div class="hero-body">
        <div class="container">
            <h1 class="title">Barangay San Juan</h1>
            <h2 class="subtitle">Serving the community since 1975</h2>
        </div>
    </div>
</section>
```

**Hero sizes:**
- `is-small` - Compact hero
- `is-medium` - Medium hero
- `is-large` - Large hero
- `is-fullheight` - Full viewport height

**Hero colors:**
- `is-primary` - Blue
- `is-link` - Dark blue
- `is-info` - Cyan
- `is-success` - Green
- `is-warning` - Yellow
- `is-danger` - Red
- `is-dark` - Dark gray

### 5. Card

The `.card` class creates a flexible content container:

```html
<div class="card">
    <div class="card-image">
        <figure class="image is-4by3">
            <img src="product.jpg" alt="Product">
        </figure>
    </div>
    <div class="card-content">
        <p class="title is-4">Skyflakes</p>
        <p class="subtitle is-6">₱8.00</p>
        <div class="content">
            Crispy crackers perfect with coffee or as a snack.
        </div>
    </div>
    <footer class="card-footer">
        <a class="card-footer-item">Buy Now</a>
        <a class="card-footer-item">Add to Cart</a>
    </footer>
</div>
```

### 6. Notification

The `.notification` class creates colored alert boxes:

```html
<div class="notification is-success">
    <button class="delete"></button>
    Your application has been submitted successfully!
</div>

<div class="notification is-warning">
    <button class="delete"></button>
    Please bring valid ID when claiming your clearance.
</div>

<div class="notification is-danger">
    <button class="delete"></button>
    Error: Please fill in all required fields.
</div>
```

### 7. Responsive Typography

Bulma includes responsive text sizes:

```html
<h1 class="title is-1">Largest title</h1>
<h2 class="title is-2">Large title</h2>
<h3 class="title is-3">Medium title</h3>
<h4 class="title is-4">Regular title</h4>
<h5 class="title is-5">Small title</h5>
<h6 class="title is-6">Smallest title</h6>

<p class="subtitle is-3">Large subtitle</p>
<p class="subtitle is-5">Regular subtitle</p>
```

All titles and subtitles automatically scale down slightly on mobile!

### 8. Responsive Images

Make images responsive with Bulma's image classes:

```html
<!-- Fixed ratio images (prevents layout shift) -->
<figure class="image is-square">
    <img src="logo.png" alt="Logo">
</figure>

<figure class="image is-4by3">
    <img src="photo.jpg" alt="Photo">
</figure>

<figure class="image is-16by9">
    <img src="video-thumbnail.jpg" alt="Video">
</figure>
```

**Image ratio options:**
- `is-square` (1:1)
- `is-1by1` (same as square)
- `is-4by3` (standard photo)
- `is-16by9` (widescreen)
- `is-2by1` (banner)

### 🇵🇭 Complete Example: Sari-Sari Store Homepage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tindahan ni Aling Rosa</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
</head>
<body>
    <!-- Hero Banner -->
    <section class="hero is-primary">
        <div class="hero-body">
            <div class="container">
                <h1 class="title">🏪 Tindahan ni Aling Rosa</h1>
                <p class="subtitle">Your friendly neighborhood store in Barangay San Juan</p>
            </div>
        </div>
    </section>
    
    <!-- Announcement -->
    <section class="section">
        <div class="container">
            <div class="notification is-info">
                <button class="delete"></button>
                <strong>New!</strong> We now accept GCash payments! 💙
            </div>
        </div>
    </section>
    
    <!-- Products -->
    <section class="section">
        <div class="container">
            <h2 class="title is-3">Popular Products</h2>
            <div class="columns is-multiline">
                <div class="column is-half-mobile is-one-third-tablet is-one-quarter-desktop">
                    <div class="card">
                        <div class="card-image">
                            <figure class="image is-square">
                                <img src="skyflakes.jpg" alt="Skyflakes">
                            </figure>
                        </div>
                        <div class="card-content">
                            <p class="title is-5">Skyflakes</p>
                            <p class="subtitle is-6">₱8.00</p>
                        </div>
                    </div>
                </div>
                
                <div class="column is-half-mobile is-one-third-tablet is-one-quarter-desktop">
                    <div class="card">
                        <div class="card-image">
                            <figure class="image is-square">
                                <img src="lucky-me.jpg" alt="Lucky Me">
                            </figure>
                        </div>
                        <div class="card-content">
                            <p class="title is-5">Lucky Me Pancit Canton</p>
                            <p class="subtitle is-6">₱12.50</p>
                        </div>
                    </div>
                </div>
                
                <!-- More product cards... -->
            </div>
        </div>
    </section>
    
    <!-- Store Info -->
    <section class="section">
        <div class="container">
            <div class="columns">
                <div class="column">
                    <div class="box">
                        <h3 class="title is-5">📍 Location</h3>
                        <p>123 Main Street<br>Barangay San Juan<br>Manila, Philippines</p>
                    </div>
                </div>
                <div class="column">
                    <div class="box">
                        <h3 class="title is-5">⏰ Store Hours</h3>
                        <p>Monday - Sunday<br>6:00 AM - 10:00 PM</p>
                    </div>
                </div>
                <div class="column">
                    <div class="box">
                        <h3 class="title is-5">📞 Contact</h3>
                        <p>0912-345-6789<br>alingRosa@email.com</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>
```

**Responsive behavior:**
- **Mobile:** Products 2 per row, info boxes stack vertically
- **Tablet:** Products 3 per row, info boxes side-by-side
- **Desktop:** Products 4 per row, wider layout

---

## ✅ Practice Exercises

Ready to practice? Try these exercises:

### Exercise 1: Personal Portfolio
Create a responsive personal portfolio page with:
- Hero section with your name
- About section with your photo and bio
- Skills section with cards (3 columns on desktop, 2 on tablet, 1 on mobile)
- Contact form

### Exercise 2: Barangay Services Directory
Create a responsive directory showing:
- List of barangay services (clearance, ID, permits)
- Each service in a card with icon, title, and description
- 3 columns on desktop, 2 on tablet, 1 on mobile

### Exercise 3: Mobile Restaurant Menu
Create a mobile-friendly menu for a carinderia:
- Hero with restaurant name
- Menu categories (breakfast, lunch, merienda)
- Food items in cards with prices
- Order form at the bottom

---

## 🎯 What's Next?

You now know the foundations of responsive design with Bulma! You can:
- ✅ Create layouts that work on mobile, tablet, and desktop
- ✅ Use the Bulma grid system with columns
- ✅ Show/hide content based on screen size
- ✅ Create mobile-friendly forms
- ✅ Use Bulma's responsive components

**In the next sections, we'll learn:**
- 📱 Testing your responsive designs (next section)
- 🖨️ **Print styles** for government forms (KILLER FEATURE!)
- 📐 Custom breakpoints with @media queries
- 🎨 Real-world mini-projects

Keep going - you're doing great! 🚀

---

## 📱 Section 6: Testing Responsive Designs

You built a responsive site - great! But **how do you know it actually works** on different devices?

### The Philippine Reality Check

**Most Filipinos browse on:**
- 📱 **Smartphones** (70%+) - Budget Android phones, small screens (5-6 inches)
- 💻 **Desktop** (20%) - Internet cafes, offices, schools
- 📱 **Tablets** (10%) - iPads in schools, some homes

**You MUST test on mobile!** If it doesn't work on a ₱5,000 Android phone, it doesn't work.

---

### Chrome DevTools Device Toolbar

The **easiest way** to test responsive designs without owning multiple devices.

**Steps:**
1. Open your HTML file in Chrome
2. Press **F12** (or right-click → Inspect)
3. Click the **device toolbar icon** (looks like phone/tablet)
4. Choose a device from dropdown

**Popular devices to test:**
- **Mobile:** iPhone SE, Samsung Galaxy S8+ (small screens)
- **Tablet:** iPad, iPad Pro
- **Desktop:** Responsive (drag to resize)

**🎯 Try It Now:**
1. Open `assets/bulma-grid-demo.html`
2. Press F12, click device toolbar
3. Select "iPhone SE"
4. See how columns stack to 1 per row!

---

### Testing Checklist

Test these things on EACH breakpoint:

**✅ Layout**
- [ ] Columns arrange correctly (4 → 2 → 1)?
- [ ] No horizontal scrolling?
- [ ] Text readable (not too small)?
- [ ] Images don't overflow?

**✅ Navigation**
- [ ] Menu accessible on mobile?
- [ ] Links easy to tap (not too small)?
- [ ] Navbar doesn't overlap content?

**✅ Forms**
- [ ] Input boxes big enough to tap?
- [ ] Labels visible and readable?
- [ ] Buttons large enough (minimum 44x44px)?
- [ ] Correct keyboard appears (number/email/text)?

**✅ Content**
- [ ] Hidden content actually hidden?
- [ ] Important info visible on all screens?
- [ ] Tables scroll horizontally if needed?

---

### Testing on Real Devices

**The BEST way** is testing on actual phones and tablets.

**How to test on your phone:**

**Option 1: USB Cable (Android)**
1. Connect phone to computer via USB
2. Enable Developer Mode on phone
3. Open Chrome on phone
4. Visit `chrome://inspect` on computer
5. Your phone appears - click "inspect"!

**Option 2: Same WiFi Network**
1. Make sure computer and phone on same WiFi
2. Find your computer's IP address:
   - Windows: `ipconfig` in Command Prompt
   - Mac/Linux: `ifconfig` in Terminal
3. On your computer, run a local server:
   ```bash
   python -m http.server 8000
   ```
4. On your phone's browser, visit:
   ```
   http://YOUR_IP_ADDRESS:8000/your-file.html
   ```

**Example:**
- Your IP: `192.168.1.5`
- Visit: `http://192.168.1.5:8000/bulma-grid-demo.html`

---

### Common Responsive Issues

**Issue 1: Text too small on mobile**
```html
<!-- ❌ Bad - text unreadable on phone -->
<p style="font-size: 10px;">Important info</p>

<!-- ✅ Good - Bulma's default sizes are mobile-friendly -->
<p>Important info</p>
<p class="is-size-7">Small text (still readable)</p>
```

**Issue 2: Buttons too small to tap**
```html
<!-- ❌ Bad - 30px button hard to tap -->
<button style="padding: 5px 10px;">Submit</button>

<!-- ✅ Good - Bulma buttons are touch-friendly (44x44px minimum) -->
<button class="button is-primary">Submit</button>
```

**Issue 3: Horizontal scrolling**
```html
<!-- ❌ Bad - fixed width causes scrolling -->
<div style="width: 1200px;">Content</div>

<!-- ✅ Good - Bulma container adapts -->
<div class="container">Content</div>
```

**Issue 4: Images overflow on mobile**
```html
<!-- ❌ Bad - image wider than screen -->
<img src="banner.jpg" width="1200">

<!-- ✅ Good - responsive image -->
<img src="banner.jpg" style="max-width: 100%; height: auto;">
```

---

### Responsive Testing Tools

**Browser DevTools:**
- **Chrome DevTools** - Best for testing multiple devices
- **Firefox Responsive Mode** - Good device simulator
- **Safari Web Inspector** - Test iOS specifically

**Online Tools:**
- **BrowserStack** - Test on real devices (paid)
- **Responsinator** - Quick multi-device preview
- **Am I Responsive?** - Screenshot on 4 devices

**Mobile Testing in Internet Cafes:**
If you don't have a smartphone:
- Ask pisonet/computer shop if you can test
- Use Chrome DevTools device mode
- Borrow a friend's phone for 5 minutes
- Test at school computer lab

---

### Real-World Testing Tips

**🇵🇭 Philippine Context:**

1. **Test on cheap Android phones** - Most users have budget phones (₱3,000-₱8,000), not flagship models
2. **Test on slow connections** - Many areas have slow internet (3G/4G)
3. **Test at different times** - Internet speed varies (faster midnight, slower 6-9pm)
4. **Test in bright sunlight** - Filipinos use phones outdoors (market, commute, sidewalk)

**Pro Tip:** If your site works on a 2-year-old budget Android phone with slow internet, it works everywhere!

---

**🎯 Try It:** Test Your Sites
1. Open `assets/mobile-form.html` in Chrome
2. Open DevTools (F12) and click device toolbar
3. Test on these devices:
   - iPhone SE (small phone)
   - iPad (tablet)
   - Responsive mode (drag to resize)
4. Check: Can you fill out the form easily on mobile?

---

## 🖨️ Section 7: Print Styles (KILLER FEATURE!)

This is one of the **most useful features** for Philippine government and business applications!

### The Problem

You create a **Barangay Clearance** web form. Users fill it out online, but they need to:
- 📄 Print it for submission
- 🖊️ Get it signed physically
- 📋 Submit hard copy to office

**But when they print...**
- ❌ Navigation bar prints (wastes space)
- ❌ Buttons print (useless on paper)
- ❌ Background colors waste ink (expensive!)
- ❌ Multiple pages (should be 1 page)

**Solution: Print Styles!** 🎉

### **Visual Guide: Print Workflow**

![Print Workflow](diagrams/bulma/print-workflow.png)
*Figure 8: Print styles workflow showing how web forms transform from screen display to clean printable documents*

---

### Print Styles in Action

**What You See on Screen:**
```
[Navigation Bar]
[Form with colored backgrounds]
[Submit Button] [Clear Button]
[Footer with social media links]
```

**What Prints on Paper:**
```
Barangay San Juan - Clearance Form
Name: Juan Dela Cruz
Address: 123 Sampaguita St.
Purpose: Employment
Date: November 12, 2025

[Official Signature Lines]
```

Clean, professional, 1-page document! ✅

---

### The @media print Rule

CSS has a special rule for print styles:

```html
<style>
/* Normal styles for screen */
.navbar {
    background: blue;
    padding: 20px;
}

/* Styles ONLY when printing */
@media print {
    .navbar {
        display: none; /* Hide navbar when printing */
    }
}
</style>
```

**How it works:**
- Styles OUTSIDE `@media print` = **screen only**
- Styles INSIDE `@media print` = **print only**

---

### Common Print Style Patterns

**Pattern 1: Hide Interactive Elements**

```css
@media print {
    /* Hide things useless on paper */
    .navbar,
    .button,
    .footer,
    nav,
    .no-print {
        display: none !important;
    }
}
```

**Pattern 2: Remove Background Colors (Save Ink)**

```css
@media print {
    body {
        background: white !important;
        color: black !important;
    }
    
    .card, .box, .notification {
        background: white !important;
        border: 1px solid black;
        box-shadow: none;
    }
}
```

**Pattern 3: Expand Content to Full Width**

```css
@media print {
    .container {
        max-width: 100% !important;
        margin: 0;
        padding: 0;
    }
}
```

**Pattern 4: Page Breaks**

```css
@media print {
    /* Force page break before element */
    .section {
        page-break-before: always;
    }
    
    /* Avoid page break inside element */
    .keep-together {
        page-break-inside: avoid;
    }
}
```

---

### Real Example: Barangay Clearance

**HTML (On Screen):**

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
    <style>
        /* Print styles */
        @media print {
            /* Hide interactive elements */
            .no-print {
                display: none !important;
            }
            
            /* Remove background colors */
            body {
                background: white;
                color: black;
            }
            
            .box {
                background: white;
                border: 2px solid black;
                box-shadow: none;
            }
            
            /* Full width for printing */
            .container {
                max-width: 100%;
            }
            
            /* Keep sections together */
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation (will be hidden when printing) -->
    <nav class="navbar is-primary no-print">
        <div class="navbar-brand">
            <span class="navbar-item">Barangay San Juan</span>
        </div>
    </nav>
    
    <div class="container">
        <div class="box mt-5">
            <h1 class="title">Barangay Clearance</h1>
            <h2 class="subtitle">Certificate of Residency</h2>
            
            <div class="section">
                <p><strong>Name:</strong> Juan Dela Cruz</p>
                <p><strong>Address:</strong> 123 Sampaguita Street</p>
                <p><strong>Purpose:</strong> Employment Requirements</p>
                <p><strong>Date Issued:</strong> November 12, 2025</p>
            </div>
            
            <div class="section">
                <p><strong>Issued by:</strong></p>
                <p>_______________________</p>
                <p>Maria Santos</p>
                <p>Barangay Captain</p>
            </div>
        </div>
        
        <!-- Buttons (hidden when printing) -->
        <div class="buttons no-print">
            <button class="button is-primary" onclick="window.print()">
                🖨️ Print This Document
            </button>
            <button class="button is-light">Clear Form</button>
        </div>
    </div>
    
    <!-- Footer (hidden when printing) -->
    <footer class="footer no-print">
        <p>Contact: barangaysanjuan@example.com</p>
    </footer>
</body>
</html>
```

---

### The .no-print Helper Class

Create a reusable class for elements you NEVER want to print:

```css
@media print {
    .no-print {
        display: none !important;
    }
}
```

**Then use it anywhere:**

```html
<!-- These won't print -->
<nav class="navbar no-print">...</nav>
<button class="button no-print">Submit</button>
<footer class="footer no-print">...</footer>
<div class="advertisement no-print">...</div>
```

---

### Print-Friendly Colors

**Problem:** Colored backgrounds waste expensive ink!

**Solution:** Black and white for printing:

```css
@media print {
    /* Force black text on white background */
    body {
        background: white !important;
        color: black !important;
    }
    
    /* Keep borders, remove backgrounds */
    .card, .box {
        background: white !important;
        border: 1px solid black;
    }
    
    /* Make links look like text */
    a {
        color: black;
        text-decoration: underline;
    }
}
```

---

### Page Size and Margins

Control how the document prints:

```css
@media print {
    @page {
        size: A4;              /* Standard paper size */
        margin: 1cm 2cm;       /* Top/bottom, left/right */
    }
    
    body {
        font-size: 12pt;       /* Readable printed text */
    }
    
    h1 {
        font-size: 18pt;
    }
}
```

---

### Real-World Use Cases in Philippines

**1. Government Forms**
- Barangay clearance
- Barangay certificate
- Cedula
- Business permit application

**2. School Documents**
- Enrollment forms
- Grade reports (print-friendly)
- Permission slips
- School ID information

**3. Business Documents**
- Invoices
- Receipts
- Purchase orders
- Contract templates

**4. Personal Documents**
- Resume/CV
- Application letters
- Portfolio pages

**All these NEED to print nicely!**

---

### Testing Print Styles

**Method 1: Print Preview**
1. Open your HTML file
2. Press **Ctrl+P** (Windows) or **Cmd+P** (Mac)
3. Look at the preview
4. Does it look good? ✅ Great!
5. Does it look bad? ❌ Add more print styles!

**Method 2: DevTools Print Emulation**
1. Open Chrome DevTools (F12)
2. Press **Ctrl+Shift+P** (Windows) or **Cmd+Shift+P** (Mac)
3. Type "render"
4. Select "Show Rendering"
5. Find "Emulate CSS media type"
6. Select **"print"**
7. See how page looks when printing!

---

### Complete Print Styles Template

Use this as a starting point for all printable forms:

```css
@media print {
    /* Hide interactive/decorative elements */
    .no-print,
    nav,
    .navbar,
    button,
    .button,
    footer,
    .advertisement,
    .sidebar {
        display: none !important;
    }
    
    /* Black and white */
    * {
        background: white !important;
        color: black !important;
        box-shadow: none !important;
    }
    
    /* Keep borders */
    .box, .card, table {
        border: 1px solid black !important;
    }
    
    /* Full width */
    .container {
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 10mm !important;
    }
    
    /* Page settings */
    @page {
        size: A4;
        margin: 15mm;
    }
    
    /* Typography */
    body {
        font-size: 12pt;
        line-height: 1.5;
    }
    
    h1 { font-size: 20pt; }
    h2 { font-size: 16pt; }
    
    /* Avoid page breaks in wrong places */
    h1, h2, h3 {
        page-break-after: avoid;
    }
    
    .section, .box, .card {
        page-break-inside: avoid;
    }
    
    /* Show links' URLs (optional) */
    a[href]:after {
        content: " (" attr(href) ")";
        font-size: 10pt;
        color: #666;
    }
}
```

---

### Quick Print Button

Add this JavaScript to any form:

```html
<button class="button is-primary no-print" onclick="window.print()">
    🖨️ Print This Document
</button>
```

**Super simple!** `window.print()` opens the print dialog.

---

**🎯 Try It:** Create a Printable Form

**Challenge:** Create a Barangay Clearance form that:
- ✅ Looks nice on screen (Bulma styling)
- ✅ Prints cleanly (no navigation, buttons, or colors)
- ✅ Has a print button
- ✅ Fits on one A4 page

**Hint:** Use the print styles template above!

---

## 📐 Section 8: Understanding @media Queries

You've been using Bulma's responsive classes (`is-mobile`, `is-hidden-tablet`). But **where do these breakpoints come from?**

The answer: **@media queries!**

### What are @media Queries?

`@media` is CSS's way of saying: "**Apply these styles ONLY when this condition is true**"

**Examples:**
- "Apply these styles only on mobile"
- "Apply these styles only when printing"
- "Apply these styles only on wide screens"

---

### Bulma's Breakpoints

Bulma uses these screen size breakpoints:

```css
/* Mobile: 0px - 768px */
@media screen and (max-width: 768px) {
    /* Styles for mobile */
}

/* Tablet: 769px - 1023px */
@media screen and (min-width: 769px) and (max-width: 1023px) {
    /* Styles for tablet */
}

/* Desktop: 1024px - 1215px */
@media screen and (min-width: 1024px) and (max-width: 1215px) {
    /* Styles for desktop */
}

/* Widescreen: 1216px+ */
@media screen and (min-width: 1216px) {
    /* Styles for widescreen */
}
```

### **Visual Guide: Breakpoints**

![Breakpoints](diagrams/bulma/breakpoints.png)
*Figure 6: Bulma's responsive breakpoints showing screen size ranges for mobile, tablet, desktop, and widescreen*

**This is how Bulma makes `.is-hidden-mobile` work!**

---

### Reading @media Queries

**Example 1: Mobile Only**
```css
@media screen and (max-width: 768px) {
    .my-element {
        font-size: 14px;
    }
}
```

**Translation:** "On screens 768px or smaller, make `.my-element` have 14px font"

**Example 2: Desktop and Up**
```css
@media screen and (min-width: 1024px) {
    .my-element {
        font-size: 20px;
    }
}
```

**Translation:** "On screens 1024px or larger, make `.my-element` have 20px font"

**Example 3: Tablet Only**
```css
@media screen and (min-width: 769px) and (max-width: 1023px) {
    .my-element {
        font-size: 16px;
    }
}
```

**Translation:** "On screens between 769px and 1023px, make `.my-element` have 16px font"

### **Visual Guide: Media Query Syntax**

![Media Query Syntax](diagrams/bulma/media-query-syntax.png)
*Figure 7: Anatomy of CSS media queries showing screen keyword, min-width, max-width, and how to combine conditions*

---

### Creating Your Own Responsive Styles

**Example: Adjust Heading Size**

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
    <style>
        /* Default (mobile) */
        .my-title {
            font-size: 24px;
            text-align: center;
        }
        
        /* Tablet */
        @media screen and (min-width: 769px) {
            .my-title {
                font-size: 32px;
            }
        }
        
        /* Desktop */
        @media screen and (min-width: 1024px) {
            .my-title {
                font-size: 48px;
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <h1 class="my-title">Barangay San Juan</h1>
</body>
</html>
```

**Result:**
- **Mobile (0-768px):** 24px, centered
- **Tablet (769-1023px):** 32px, centered
- **Desktop (1024px+):** 48px, left-aligned

---

### When to Use @media vs Bulma Classes

**Use Bulma classes when possible:**
```html
<!-- ✅ Bulma does this for you -->
<div class="columns">
    <div class="column is-half-desktop is-full-mobile">Content</div>
</div>
```

**Use @media for custom adjustments:**
```html
<!-- ✅ For things Bulma doesn't provide -->
<style>
@media screen and (max-width: 768px) {
    .special-banner {
        height: 200px;  /* Custom height on mobile */
    }
}
</style>
```

**Rule of Thumb:** If Bulma has a class for it, use the class. Otherwise, write custom @media queries.

---

### Common @media Patterns

**Pattern 1: Hide on Mobile**
```css
@media screen and (max-width: 768px) {
    .desktop-only {
        display: none;
    }
}
```

**Pattern 2: Stack on Mobile**
```css
.flex-container {
    display: flex;
}

@media screen and (max-width: 768px) {
    .flex-container {
        flex-direction: column;  /* Stack vertically */
    }
}
```

**Pattern 3: Adjust Spacing**
```css
.section {
    padding: 60px 20px;
}

@media screen and (max-width: 768px) {
    .section {
        padding: 30px 10px;  /* Less padding on mobile */
    }
}
```

---

### Mobile-First vs Desktop-First

**Mobile-First Approach (Recommended):**
```css
/* Start with mobile styles (no media query) */
.element {
    font-size: 14px;
    padding: 10px;
}

/* Add tablet/desktop enhancements */
@media screen and (min-width: 769px) {
    .element {
        font-size: 16px;
        padding: 20px;
    }
}
```

**Desktop-First Approach:**
```css
/* Start with desktop styles */
.element {
    font-size: 16px;
    padding: 20px;
}

/* Override for mobile */
@media screen and (max-width: 768px) {
    .element {
        font-size: 14px;
        padding: 10px;
    }
}
```

**In the Philippines: Use Mobile-First!** Most users are on mobile.

---

### Combining Bulma + Custom @media

**Best of both worlds:**

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
    <style>
        /* Custom adjustments for your specific needs */
        @media screen and (max-width: 768px) {
            .store-banner {
                height: 150px;
                background-size: cover;
            }
        }
        
        @media screen and (min-width: 1024px) {
            .store-banner {
                height: 400px;
            }
        }
    </style>
</head>
<body>
    <!-- Use Bulma for layout -->
    <div class="columns">
        <div class="column is-half-tablet is-one-third-desktop">
            <!-- Custom class for specific styling -->
            <div class="store-banner">
                <img src="store.jpg" alt="Tindahan ni Aling Rosa">
            </div>
        </div>
    </div>
</body>
</html>
```

---

**🎯 Quick Check:**

What does this do?
```css
@media screen and (min-width: 1024px) {
    .sidebar {
        display: block;
    }
}
```

<details>
<summary>Click to see answer</summary>

Shows the sidebar ONLY on desktop screens (1024px or wider). On mobile and tablet, the sidebar will be hidden.

</details>

---

## ⚖️ Section 9: When to Use Bulma

Now you know Bulma! But **should you always use it?**

### ✅ Good Situations for Bulma

**1. Rapid Prototyping**
- Need to build something fast
- Don't want to write CSS from scratch
- Want consistent design without thinking

**Example:** Building a barangay website in 2 hours

**2. Small to Medium Projects**
- 5-20 pages
- Standard layouts (forms, cards, columns)
- Don't need highly custom design

**Example:** School enrollment system, store inventory

**3. Learning Web Development**
- You're new to responsive design
- Want to see how pros structure CSS
- Focus on functionality, not design

**Example:** Grade 9 students (you!) learning web dev

**4. Government/Business Forms**
- Need clean, professional look
- Forms, tables, documents
- Print-friendly (Bulma is great for this!)

**Example:** Barangay clearance, business permit forms

**5. Mobile-First Required**
- Target audience mostly on phones
- Need responsive out of the box
- Can't spend weeks on CSS

**Example:** Sari-sari store app, jeepney route planner

---

### ❌ Bad Situations for Bulma

**1. Highly Custom Design**
- Designer gave you specific mockups
- Need pixel-perfect unique look
- Design doesn't fit Bulma's style

**Example:** Jollibee's website (needs brand-specific design)

**2. Very Large Projects**
- 100+ pages
- Complex interactions
- Need full control over every detail

**Example:** Facebook, YouTube, Lazada

**3. Performance-Critical Apps**
- Every KB matters
- Loading speed crucial
- Users on very slow connections

**Example:** Emergency services app, medical systems

**4. Already Using Another Framework**
- Project uses Bootstrap, Tailwind, or Materialize
- Don't mix frameworks (conflicts!)

**Example:** Existing project with Bootstrap

**5. Learning Pure CSS**
- Goal is to master CSS fundamentals
- Want to understand how frameworks work
- Educational purposes

**Example:** CSS course assignment

---

### 🇵🇭 Philippine Context: When to Use What

**For School Projects:**
- ✅ **Use Bulma** - Fast, responsive, looks professional
- Focus on learning concepts, not fighting CSS

**For Barangay/Government:**
- ✅ **Use Bulma** - Clean, printable, accessible
- Government sites don't need fancy animations

**For Online Store (Small Business):**
- ⚖️ **Maybe Bulma** - Good start, but might customize later
- Depends on budget and design needs

**For Personal Portfolio:**
- ⚖️ **Your Choice** - Bulma for speed, custom CSS for uniqueness
- Depends on your design skills

**For Startup/Business:**
- ❌ **Probably not Bulma alone** - Hire designer for custom look
- Bulma for prototypes, custom CSS for production

---

### Bulma vs Other Frameworks

| Framework | File Size | Learning Curve | Customization | Best For |
|-----------|-----------|----------------|---------------|----------|
| **Bulma** | ~200KB | Easy | Moderate | Forms, docs, learning |
| **Bootstrap** | ~300KB | Easy | High | Everything, very popular |
| **Tailwind CSS** | Variable | Medium | Very High | Custom designs, modern apps |
| **Materialize** | ~250KB | Easy | Low | Google Material Design look |
| **Foundation** | ~300KB | Hard | Very High | Complex enterprise apps |
| **Pure CSS** | 0KB | Hard | Complete | Learning, full control, tiny sites |

**For Grade 9 students: Start with Bulma!**
- Smaller than Bootstrap
- Cleaner HTML than Tailwind
- Focuses on CSS (not JavaScript)

---

### The Hybrid Approach

**Best practice:** Combine Bulma with custom CSS

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 1. Load Bulma for structure -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
    
    <!-- 2. Add your custom styles -->
    <style>
        /* Use Bulma's grid, but customize colors */
        :root {
            --primary: #e74c3c;    /* Your brand red */
            --secondary: #3498db;  /* Your brand blue */
        }
        
        .button.is-primary {
            background-color: var(--primary);
        }
        
        .navbar.is-primary {
            background-color: var(--primary);
        }
        
        /* Custom component Bulma doesn't have */
        .special-banner {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            padding: 40px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <!-- Use Bulma classes -->
    <nav class="navbar is-primary">...</nav>
    
    <!-- Mix Bulma + custom -->
    <div class="container">
        <div class="columns">
            <div class="column">
                <div class="special-banner">
                    Custom design on Bulma structure!
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

---

### Decision Framework

**Ask yourself these questions:**

1. **Do I need it done fast?** → ✅ Use Bulma
2. **Is it a government/form site?** → ✅ Use Bulma
3. **Am I still learning CSS?** → ✅ Use Bulma
4. **Do I have a custom design mockup?** → ❌ Use custom CSS
5. **Is performance critical?** → ❌ Use lightweight or pure CSS
6. **Is it a huge project?** → ⚖️ Maybe Bootstrap or custom

**When in doubt: Start with Bulma, customize later!**

---

### Real-World Example: Sari-Sari Store App

**Phase 1: Prototype (1 week)**
- Use Bulma 100%
- Get it working fast
- Show to store owner

**Phase 2: Refinement (1 week)**
- Keep Bulma grid/forms
- Add custom colors (store's brand)
- Custom banner/logo

**Phase 3: Production (2 weeks)**
- Bulma for structure
- Custom CSS for unique features
- Optimize performance

**Total:** Bulma saves you 4-5 weeks of CSS work!

---

**🎯 Try It:** Choose the Right Tool

For each scenario, decide: Bulma or Custom CSS?

1. Barangay clearance form (due tomorrow)
2. Your personal portfolio (unique design)
3. School project (grades in 3 days)
4. Startup landing page (need to impress investors)
5. Practice forms (learning web dev)

<details>
<summary>Click to see answers</summary>

1. **Bulma** - Fast, perfect for forms
2. **Custom CSS** - Portfolio should be unique
3. **Bulma** - No time for custom CSS!
4. **Custom CSS** - Need professional, unique design
5. **Bulma** - Focus on learning, not styling

</details>

---

## 🎯 What's Next?

Congratulations! You now know responsive design with Bulma! 🎉

**You can:**
- ✅ Build mobile-first websites
- ✅ Use Bulma's grid system
- ✅ Show/hide content on different screens
- ✅ Create printable government forms
- ✅ Test responsive designs
- ✅ Write custom @media queries
- ✅ Choose when to use Bulma

**Next Steps:**
1. **Practice:** Build the mini-projects below
2. **Master:** Complete the final challenge
3. **Advance:** Learn JavaScript DOM manipulation
4. **Build:** Create your own responsive projects!

---

## 🏗️ Mini-Projects

Ready for real-world projects? Try these:

### Mini-Project 1: Mobile Sari-Sari Store Catalog
**Goal:** Create a product catalog that works great on phones

**Requirements:**
- Product cards with images, names, prices
- 1 column on mobile, 2 on tablet, 3 on desktop
- Search bar at top (mobile-friendly)
- No buttons/search when printing

**Files:**
- Start: `assets/store-catalog-starter.html`
- Solution: `assets/store-catalog-solution.html`

---

### Mini-Project 2: Barangay Clearance (Printable)
**Goal:** Create a clearance form that prints perfectly

**Requirements:**
- Form fields for name, address, purpose
- Bulma styling on screen
- Print button
- Hides navigation/buttons when printing
- Fits on 1 A4 page

**Files:**
- Start: `assets/barangay-clearance-starter.html`
- Solution: `assets/barangay-clearance-solution.html`

---

### Mini-Project 3: Responsive Dashboard
**Goal:** Create a barangay info dashboard

**Requirements:**
- 4 stat cards at top (population, area, etc.)
- Table of barangay officials
- On mobile: Cards stack (1 column), table scrolls horizontally
- On desktop: Cards in row (4 columns), table full width

**Files:**
- Start: `assets/dashboard-starter.html`
- Solution: `assets/dashboard-solution.html`

---

## 🚀 Final Challenge: Government Document System

Create a complete government document submission system!

### Requirements

**User Features:**
1. Responsive layout (mobile, tablet, desktop)
2. Navigation bar
3. Form to fill out (select document type)
4. Print button
5. Printable output (clean 1-page)

**Document Types (Choose 1):**
- Business Permit Application
- Barangay Certificate of Residency
- School Enrollment Form

**Technical Requirements:**
- Bulma CSS framework
- Responsive (test on mobile!)
- Print styles (.no-print, @media print)
- Semantic HTML (header, main, footer)
- Mobile-friendly form inputs

**Files:**
- Starter: `assets/gov-doc-starter.html`
- Solution 1: Business Permit
- Solution 2: Barangay Certificate
- Solution 3: School Enrollment

---

## 🔧 Troubleshooting

### "My columns don't stack on mobile!"

**Problem:** Columns stay side-by-side on phone

**Solution:** Make sure you're using the `columns` class:
```html
<!-- ✅ Correct - will stack on mobile -->
<div class="columns">
    <div class="column">A</div>
    <div class="column">B</div>
</div>

<!-- ❌ Wrong - won't stack -->
<div class="column">A</div>
<div class="column">B</div>
```

---

### "Bulma CSS not loading!"

**Problem:** Page looks plain, no Bulma styles

**Check:**
1. Is CDN link correct?
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
   ```
2. Is it in the `<head>` section?
3. Do you have internet connection? (CDN needs internet)

---

### "Print preview looks wrong!"

**Problem:** Navigation/buttons still show when printing

**Solution:** Add `.no-print` class and CSS:
```html
<nav class="navbar no-print">...</nav>

<style>
@media print {
    .no-print {
        display: none !important;
    }
}
</style>
```

---

### "Content too wide on mobile!"

**Problem:** Horizontal scrolling on phone

**Solutions:**
```html
<!-- 1. Use container -->
<div class="container">Your content</div>

<!-- 2. Use section -->
<section class="section">Your content</section>

<!-- 3. Add viewport meta tag (in <head>) -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

---

### "Text too small on mobile!"

**Problem:** Text unreadable on phone

**Solution:** Use Bulma size classes or increase base font:
```html
<!-- Use bigger text on mobile -->
<p class="is-size-5-mobile is-size-6-tablet">Readable text</p>

<!-- Or use CSS -->
<style>
@media screen and (max-width: 768px) {
    body {
        font-size: 16px;  /* Bigger on mobile */
    }
}
</style>
```

---

## 📚 Resources

**Bulma Documentation:**
- Official site: [bulma.io](https://bulma.io)
- Grid system: [bulma.io/documentation/columns](https://bulma.io/documentation/columns)
- Responsive helpers: [bulma.io/documentation/helpers](https://bulma.io/documentation/helpers)

**Testing Tools:**
- Chrome DevTools device mode (F12 → device icon)
- [Responsinator](http://www.responsinator.com/)
- [Am I Responsive?](https://ui.dev/amiresponsive)

**Print CSS:**
- [CSS Tricks: Print Styles](https://css-tricks.com/css-tricks-finally-gets-a-print-stylesheet/)
- [@media print basics](https://developer.mozilla.org/en-US/docs/Web/CSS/@media)

---

**🎉 Congratulations!** You've completed the Responsive Bulma Lecture!

You're now ready to build mobile-first, responsive, printable websites for the Philippine context! 🇵🇭📱🖨️

---

*Keep building, keep learning, and remember: **Mobile first, Philippine context always!*** 🚀