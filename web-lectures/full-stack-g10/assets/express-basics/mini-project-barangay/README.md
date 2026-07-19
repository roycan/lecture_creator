# 🏘️ Barangay Officials Directory

A complete web application for managing barangay officials' records with Read and Add functionality.

## 📋 Project Description

This mini-project is a digital directory system for Barangay San Jose officials. It allows users to:
- View all registered barangay officials
- Add new officials through a form
- See statistics about official positions
- Browse detailed contact information

## 🎯 Learning Objectives

This project demonstrates:
1. **Full CRUD workflow** (Create and Read operations)
2. **Form handling** with validation
3. **JSON file operations** (read and write)
4. **EJS templating** with conditionals and loops
5. **Bulma CSS** for responsive design
6. **Philippine context** - real-world barangay system

## 📁 Project Structure

```
mini-project-barangay/
├── app.js                    # Express server with routes
├── package.json              # Dependencies
├── data/
│   └── officials.json        # Barangay officials data
├── views/
│   ├── index.ejs             # Officials list (home page)
│   ├── add.ejs               # Add official form
│   ├── about.ejs             # About/info page
│   └── partials/
│       ├── navbar.ejs        # Navigation bar
│       └── footer.ejs        # Footer
└── public/
    └── css/
        └── style.css         # Custom styles
```

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

4. **Development mode** (auto-restart on changes):
   ```bash
   npm run dev
   ```

## 📱 Pages

| Page | URL | Description |
|------|-----|-------------|
| Officials List | `/` | View all barangay officials |
| Add Official | `/add` | Form to add new official |
| About | `/about` | System information |

## 🏛️ Barangay Positions

- **Barangay Captain** - Head of the barangay (tagged as 👑)
- **Barangay Kagawad** - Council member (tagged as 📋)
- **SK Chairperson** - Youth council leader (tagged as 🎓)
- **Barangay Secretary** - Records keeper
- **Barangay Treasurer** - Financial officer

## ✨ Features

### 1. View Officials
- Card-based display with avatars
- Color-coded position tags
- Contact information (phone, address)
- Term of office display
- Statistics summary

### 2. Add Official
- Form validation (required fields)
- Phone format validation (0917-123-4567)
- Term format validation (2023-2026)
- Position dropdown selection
- Auto-incrementing ID

### 3. Responsive Design
- Mobile-friendly layout
- Bulma CSS framework
- Hover effects on cards
- Clean, modern UI

## 💾 Data Structure

### officials.json
```json
{
  "id": 1,
  "name": "Roberto Santos",
  "position": "Barangay Captain",
  "contact": "0917-123-4567",
  "address": "Purok 1, Barangay San Jose",
  "term": "2023-2026"
}
```

## 🎨 Customization Ideas

1. **Add search functionality** - Filter officials by name or position
2. **Add edit/delete** - Complete CRUD operations (save for Part 2)
3. **Add photos** - Upload and display official photos
4. **Add departments** - Organize officials by department
5. **Add export** - Download directory as PDF
6. **Add print view** - Printer-friendly layout

## ⚠️ Known Limitations

1. **No database** - Uses JSON files (not scalable)
2. **No authentication** - Anyone can add/modify records
3. **No edit/delete** - Only Read and Add operations
4. **No validation** - Limited server-side validation
5. **No concurrent writes** - File corruption risk with multiple users

**Solution:** Part 2 will address these with SQLite database and authentication!

## 🐛 Troubleshooting

**Problem:** Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill the process or change PORT in app.js
```

**Problem:** Officials not appearing
```bash
# Check if data/officials.json exists and is valid JSON
cat data/officials.json | jq .
```

**Problem:** Form submission doesn't work
```bash
# Make sure middleware is loaded:
app.use(express.urlencoded({ extended: true }));
```

## 🔧 Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **EJS** - Template engine
- **Bulma CSS** - UI framework
- **JSON** - Data storage

## 📚 Next Steps

After completing this project:
1. Try the other mini-projects (Students or Store)
2. Deploy to Railway (see deployment guide)
3. Add more features (search, filter, sort)
4. Prepare for Part 2 (SQLite, auth, file uploads)

## 🎓 For Students

This is a complete mini-project you can build and customize. Use it to practice:
- Building full-stack web applications
- Working with forms and data
- Understanding the request-response cycle
- Designing user interfaces with Bulma
- Managing data with JSON files

Good luck and enjoy coding! 🚀
