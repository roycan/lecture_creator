# 🚂 Railway Deployment Guide

**Step-by-step guide to deploy your Express app to Railway**

---

## ✅ Prerequisites

Before deploying, make sure you have:

- ✅ A working Express app on your computer
- ✅ A GitHub account
- ✅ Git installed on your computer
- ✅ Your app pushed to a GitHub repository
- ✅ A `.gitignore` file (to exclude `node_modules`)

---

## 📋 Pre-Deployment Checklist

### 1. **Update package.json**

Make sure your `package.json` has a start script:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9"
  }
}
```

### 2. **Use Dynamic PORT**

Update your `app.js` to use Railway's port:

```javascript
// ❌ WRONG - hardcoded port
const PORT = 3000;

// ✅ CORRECT - use environment variable
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3. **Create .gitignore**

Create a `.gitignore` file in your project root:

```
node_modules/
.env
.DS_Store
*.log
```

### 4. **Test Locally**

Run your app locally to make sure it works:

```bash
npm install
npm start
```

Visit `http://localhost:3000` to verify.

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
# Initialize git (if not done yet)
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Railway deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

### Step 2: Sign Up for Railway

1. Go to [https://railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login with GitHub"**
3. Authorize Railway to access your GitHub account

### Step 3: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository from the list
4. Railway will automatically detect it's a Node.js app

### Step 4: Configure Settings (Optional)

Railway automatically detects your app, but you can verify:

1. Click on your deployment
2. Go to **Settings** tab
3. Check **Start Command**: Should show `npm start`
4. Check **Build Command**: Should show `npm install`

### Step 5: Deploy!

1. Railway automatically starts deploying
2. Wait for deployment to complete (usually 1-3 minutes)
3. Watch the logs for any errors

### Step 6: Get Your URL

1. Go to **Settings** tab
2. Scroll to **Domains** section
3. Click **"Generate Domain"**
4. Your app will be live at: `your-app-name.up.railway.app`

---

## 🎯 Common Issues & Solutions

### Issue 1: "Application failed to respond"

**Problem:** App not listening on correct port

**Solution:** Use environment variable for port:
```javascript
const PORT = process.env.PORT || 3000;
```

### Issue 2: "Module not found"

**Problem:** Dependencies not installed

**Solution:** Check `package.json` has all dependencies:
```bash
npm install express ejs --save
```

### Issue 3: "Cannot find views"

**Problem:** View paths not working on Railway

**Solution:** Use absolute paths:
```javascript
app.set('views', path.join(__dirname, 'views'));
```

### Issue 4: "node_modules pushed to GitHub"

**Problem:** `.gitignore` missing or not working

**Solution:**
```bash
# Create .gitignore
echo "node_modules/" > .gitignore

# Remove from git
git rm -r --cached node_modules
git commit -m "Remove node_modules"
git push
```

### Issue 5: App crashes after deploy

**Problem:** Check logs for errors

**Solution:**
1. Go to Railway dashboard
2. Click **Deployments** tab
3. View **Logs** for error messages
4. Fix errors and push updated code

---

## 📊 Monitoring Your App

### View Logs:
1. Railway Dashboard → Your Project
2. Click **Deployments**
3. Click on latest deployment
4. View real-time logs

### View Metrics:
- **CPU Usage** - Check if app is overloaded
- **Memory** - Monitor RAM usage
- **Network** - Track requests

---

## 🔄 Updating Your App

When you make changes to your code:

```bash
# 1. Make changes to your code
# 2. Test locally
npm start

# 3. Commit and push
git add .
git commit -m "Update feature X"
git push

# 4. Railway auto-deploys!
```

Railway automatically redeploys when you push to GitHub! 🎉

---

## 💰 Pricing & Limits

### Free Tier:
- **$5 free credits per month**
- **500 hours execution time**
- **1 GB RAM per service**
- **Perfect for learning projects**

### What counts toward credits:
- Running time of your app
- Build time
- Outbound data transfer

### Tips to save credits:
- Stop unused projects
- Use efficient code
- Don't leave multiple test deployments running

---

## 🔒 Environment Variables (Optional)

If your app uses secrets (API keys, database passwords):

### In Railway:
1. Go to project **Settings**
2. Click **Variables** tab
3. Add variable: `KEY=value`
4. Click **Add**

### In your code:
```javascript
const API_KEY = process.env.API_KEY;
```

---

## 📝 Deployment Checklist

Before deploying, verify:

- [ ] `package.json` has all dependencies
- [ ] Start script is defined (`"start": "node app.js"`)
- [ ] PORT uses `process.env.PORT`
- [ ] `.gitignore` excludes `node_modules/`
- [ ] App works locally (`npm start`)
- [ ] Code is pushed to GitHub
- [ ] No hardcoded secrets in code

---

## 🎓 For Students

### First Deployment:
1. Start with a simple "Hello World" Express app
2. Deploy to learn the process
3. Then deploy your mini-project

### Common Student Mistakes:
- ❌ Forgetting `.gitignore`
- ❌ Hardcoded port 3000
- ❌ Not testing locally first
- ❌ Pushing `node_modules` to GitHub
- ❌ Not checking Railway logs for errors

---

## 🆘 Getting Help

**Railway Status:**
- Check [status.railway.app](https://status.railway.app)

**Railway Docs:**
- [docs.railway.app](https://docs.railway.app)

**Community:**
- Railway Discord server
- GitHub issues for your project

---

## 🎉 Success!

Your app is now live and accessible worldwide! 🌍

Share your link:
```
https://your-app-name.up.railway.app
```

**Next Steps:**
- Add custom domain (optional)
- Set up monitoring
- Share with friends and family!

---

**💡 Remember:** Free tier resets monthly, so your credits replenish!

**🚀 Happy Deploying!**
