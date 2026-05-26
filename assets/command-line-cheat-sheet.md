# Command Line Cheat Sheet for Web Development

**Quick reference for essential terminal commands**

---

## 📂 Navigation Commands

| Command | Description | Example |
|---------|-------------|---------|
| `pwd` | Print working directory (show where you are) | `pwd` |
| `ls` | List files and folders | `ls` |
| `ls -la` | List all files with details | `ls -la` |
| `cd foldername` | Change into a folder | `cd my-project` |
| `cd ..` | Go up one folder | `cd ..` |
| `cd ~` | Go to home directory | `cd ~` |
| `cd /` | Go to root directory | `cd /` |

---

## 📁 File & Folder Commands

| Command | Description | Example |
|---------|-------------|---------|
| `mkdir foldername` | Create a new folder | `mkdir my-app` |
| `touch filename` | Create a new file | `touch app.js` |
| `rm filename` | Delete a file | `rm test.txt` |
| `rm -r foldername` | Delete a folder | `rm -r old-project` |
| `cp source dest` | Copy file | `cp app.js backup.js` |
| `mv old new` | Rename/move file | `mv old.js new.js` |
| `cat filename` | View file contents | `cat README.md` |
| `code .` | Open folder in VS Code | `code .` |

---

## 📦 Node.js & npm Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `node --version` | Check Node.js version | Check if Node is installed |
| `npm --version` | Check npm version | Verify npm works |
| `npm init` | Create package.json | Start new Node project |
| `npm init -y` | Create package.json (skip questions) | Quick setup |
| `npm install` | Install all dependencies | After cloning project |
| `npm install express` | Install Express | Add Express to project |
| `npm install --save-dev nodemon` | Install dev dependency | Add nodemon for development |
| `npm start` | Run start script | Start your server |
| `node app.js` | Run Node file directly | Test your app |

---

## 🚀 Git Commands (Bonus)

| Command | Description | Example |
|---------|-------------|---------|
| `git init` | Initialize git repo | `git init` |
| `git status` | Check file changes | `git status` |
| `git add .` | Stage all changes | `git add .` |
| `git commit -m "message"` | Commit changes | `git commit -m "Initial commit"` |
| `git push` | Push to remote | `git push origin main` |
| `git clone url` | Clone repository | `git clone https://...` |

---

## 🔧 Express Project Setup

**Step-by-step commands to create a new Express project:**

```bash
# 1. Create project folder and enter it
mkdir my-express-app
cd my-express-app

# 2. Initialize npm (creates package.json)
npm init -y

# 3. Install Express
npm install express

# 4. Install EJS for templates
npm install ejs

# 5. Install nodemon for development (optional)
npm install --save-dev nodemon

# 6. Create main app file
touch app.js

# 7. Create folders
mkdir views public data
mkdir public/css public/js

# 8. Open in VS Code
code .
```

---

## ⚡ Quick Tips

### ✅ DO:
- Use `Tab` to autocomplete folder/file names
- Use `↑` arrow to repeat last command
- Use `clear` to clean up terminal
- Use `Ctrl+C` to stop running server
- Check you're in correct folder before commands

### ❌ DON'T:
- Don't delete system folders (`/`, `/System`, etc.)
- Don't run commands you don't understand
- Don't forget to `cd` into project folder
- Don't use spaces in folder names (use `-` or `_`)

---

## 🆘 Troubleshooting

**"command not found"**
→ Command doesn't exist or not installed

**"permission denied"**
→ Need admin rights (use `sudo` on Mac/Linux)

**"port already in use"**
→ Server already running, close it first (Ctrl+C)

**Can't find package.json**
→ Not in project folder, use `cd` to navigate

---

## 📱 Common Workflows

### Starting an existing project:
```bash
cd project-folder
npm install
npm start
```

### Creating a new Express app:
```bash
mkdir my-app && cd my-app
npm init -y
npm install express ejs
touch app.js
mkdir views public data
```

### Running your server:
```bash
node app.js
# or if you have nodemon:
npm run dev
```

---

**💡 Pro Tip:** Save this cheat sheet and keep it handy while coding!

**🎓 For Students:** Practice these commands daily until they become second nature!
