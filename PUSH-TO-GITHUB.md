# Push to GitHub Instructions

## Step 1: Create Repository on GitHub
1. Go to [GitHub.com](https://github.com) and log in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Set repository name: **`srt-edit-api`**
5. Set description: **`Node.js API for shifting subtitle timestamps in .srt files`**
6. Make it **Public**
7. **DO NOT** check "Initialize this repository with a README" (we already have files)
8. Click **"Create repository"**

## Step 2: Push Your Code
After creating the repository, run these commands in your terminal:

```bash
cd /Users/arjanpapot/Desktop/n8n-dashboard/subtitle-shift-api

# Add the GitHub repository as remote origin
git remote add origin https://github.com/arjanpapot/srt-edit-api.git

# Rename the default branch to main (if needed)
git branch -M main

# Push the code to GitHub
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)
```bash
cd /Users/arjanpapot/Desktop/n8n-dashboard/subtitle-shift-api
git remote add origin git@github.com:arjanpapot/srt-edit-api.git
git branch -M main
git push -u origin main
```

## What Will Be Pushed
- ✅ `index.js` - Complete API server (189 lines)
- ✅ `package.json` - Dependencies and scripts  
- ✅ `README.md` - Full documentation
- ✅ `test-subtitles.srt` - Sample test file
- ✅ `.gitignore` - Git ignore rules
- ✅ `GITHUB-SETUP.md` - Setup instructions
- ✅ Test output files

## After Pushing
1. Your repository will be available at: `https://github.com/arjanpapot/srt-edit-api`
2. You can deploy it to Render.com by connecting the GitHub repository
3. Use these deployment settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

## Verification
After pushing, you should see all files in your GitHub repository and can immediately deploy to any Node.js hosting platform.