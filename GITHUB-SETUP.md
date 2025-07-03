# GitHub Setup Instructions

## Manual Repository Creation

Since GitHub CLI is not available, please follow these steps to create the repository and push the code:

### Step 1: Create Repository on GitHub
1. Go to [GitHub.com](https://github.com)
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Set repository name: `srt-edit-api`
5. Set description: `Node.js API for shifting subtitle timestamps in .srt files`
6. Make it **Public**
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

### Step 2: Add Remote and Push
After creating the repository, GitHub will show you the commands. Run these in the terminal:

```bash
cd /Users/arjanpapot/Desktop/n8n-dashboard/subtitle-shift-api
git remote add origin https://github.com/YOUR_USERNAME/srt-edit-api.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Alternative: Using SSH (if you have SSH keys set up)
```bash
cd /Users/arjanpapot/Desktop/n8n-dashboard/subtitle-shift-api
git remote add origin git@github.com:YOUR_USERNAME/srt-edit-api.git
git branch -M main
git push -u origin main
```

## Repository Contents
The repository will include:
- `index.js` - Main API server
- `package.json` - Dependencies and scripts
- `README.md` - Documentation
- `test-subtitles.srt` - Sample test file
- `.gitignore` - Git ignore rules
- Test output files (shifted_test.srt, shifted_negative_test.srt)

## Next Steps
After pushing to GitHub, you can:
1. Deploy to Render.com by connecting the GitHub repository
2. Set up automatic deployments on push
3. Configure environment variables if needed

The API is ready for deployment with:
- Build Command: `npm install`
- Start Command: `npm start`