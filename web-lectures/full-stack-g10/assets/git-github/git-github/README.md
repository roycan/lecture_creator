# Git Practice Files - README

This folder contains templates and examples for Git & GitHub collaboration.

## 📁 Contents

### .gitignore Templates
Ready-to-use `.gitignore` files for different project types:

1. **gitignore-nodejs.txt** - For Node.js/Express projects
   - Ignores `node_modules/`, `.env`, logs
   - Philippine context: Saves ₱50-200 in upload data
   
2. **gitignore-python.txt** - For Python/Flask/Django projects
   - Ignores `venv/`, `__pycache__/`, `.env`
   - Philippine context: Saves ₱50-100 in upload data
   
3. **gitignore-web.txt** - For HTML/CSS/JavaScript projects
   - Ignores build files, OS files, node_modules
   - Philippine context: 10-40x data savings

**How to use:**
1. Copy the appropriate template
2. Rename to `.gitignore` (with the dot!)
3. Place in your project root
4. Customize for your specific needs

### README Templates
Example README files to document your projects:

1. **README-template-basic.md** - Simple template
   - Good for small projects or homework
   - Covers: About, Features, Setup, Usage
   
2. **README-template-detailed.md** - Comprehensive template
   - Good for group projects or portfolio pieces
   - Covers: Everything in basic + Screenshots, Contributing, Philippine Context
   - Example: Barangay Management System

**How to use:**
1. Copy the template
2. Rename to `README.md`
3. Fill in your project details
4. Customize sections as needed

### Pull Request Templates
Templates for creating pull requests on GitHub:

1. **pull-request-template.md** - Simple template
   - Quick checklist format
   - Good for small changes or homework submissions
   
2. **pull-request-template-detailed.md** - Comprehensive template
   - Detailed sections with examples
   - Good for group projects or open source contributions
   - Includes testing checklist, screenshots, deployment notes

**How to use:**

**Method 1: Copy-paste when creating PR**
1. Copy template content
2. Create new pull request on GitHub
3. Paste template into description
4. Fill in the blanks

**Method 2: Automatic template (organization/repo)**
1. Create `.github/` folder in repo root
2. Create `PULL_REQUEST_TEMPLATE.md` inside it
3. GitHub will auto-load this template for all PRs

## 🎓 Learning Path

### Beginner (First Week)
1. Start with `gitignore-web.txt` for simple HTML projects
2. Use `README-template-basic.md` to document your work
3. Practice basic Git commands (add, commit, push)

### Intermediate (Second-Third Week)
1. Try `gitignore-nodejs.txt` for Express projects
2. Upgrade to `README-template-detailed.md`
3. Learn branching and pull requests
4. Use `pull-request-template.md` for homework submissions

### Advanced (Fourth Week+)
1. Customize `.gitignore` files for your specific needs
2. Create professional READMEs with screenshots and detailed docs
3. Use `pull-request-template-detailed.md` for group projects
4. Contribute to open source projects

## 📝 Grade 9 Tips

### For .gitignore:
- **Always include** `.env` files (never upload passwords!)
- **Always ignore** `node_modules/` (too big, wastes data)
- **Save data costs** with proper .gitignore (₱50-200 savings per project!)
- **Smaller repos** = faster clones for classmates on slow internet

### For README:
- **Be clear**: Write like you're explaining to a classmate
- **Add examples**: Show how to run your project
- **Filipino context**: Use local examples (barangay, sari-sari store)
- **Screenshots help**: A picture is worth 1000 words

### For Pull Requests:
- **Describe changes**: What did you do and why?
- **Test first**: Make sure it works before submitting
- **Be respectful**: You're asking someone to review your work
- **Respond to feedback**: If reviewers ask questions, answer them

## 🇵🇭 Philippine Context Examples

### Data Savings with .gitignore:
```
Without .gitignore:
- node_modules/ = 50 MB
- Upload cost = ₱50
- Clone cost for classmate = ₱50
- For 10 classmates = ₱500 wasted!

With .gitignore:
- Repository = 5 MB
- Upload cost = ₱5
- Clone cost = ₱5 per classmate
- For 10 classmates = ₱50 total (90% savings!)
```

### README Examples:
- **Barangay system** (local government)
- **Sari-sari store inventory** (small business)
- **Jeepney route tracker** (transportation)
- **School enrollment form** (education)
- **Weather dashboard** (Philippine cities)

## ✅ Checklist: Good Git Practices

Before pushing to GitHub:
- [ ] Added `.gitignore` file
- [ ] Included `README.md` with setup instructions
- [ ] No passwords or API keys in code
- [ ] Tested that project works
- [ ] Committed with clear messages
- [ ] Pulled latest changes from main branch

For pull requests:
- [ ] Described what changed and why
- [ ] Tested all changes
- [ ] No console.log() statements left behind
- [ ] Screenshots if UI changed
- [ ] Linked related issues

## 🔗 Related Resources

**In this lecture:**
- Section 10: `.gitignore` - What to ignore and why
- Section 8: Pull Requests - How to contribute
- Section 11: Portfolio - Showcasing your projects

**External:**
- [GitHub's .gitignore templates](https://github.com/github/gitignore)
- [Markdown cheat sheet](https://www.markdownguide.org/cheat-sheet/)
- [How to write a good README](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)

## 🤝 Contributing

Found a better template or example? Improvements welcome!
1. Fork this repo
2. Add your template
3. Submit a pull request (use our template! 😊)

---

**For Grade 9 Filipino Students**  
**Part of Git & GitHub Collaboration Lecture**  
**Last Updated:** November 13, 2025
