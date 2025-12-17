# ✅ GitHub Upload Checklist

Follow this checklist before uploading your Smart Factory project to GitHub to ensure no sensitive data is exposed.

## 📋 Pre-Upload Checklist

### 1. Credential Protection ✅

- [x] **Moved credentials to config files**
  - `python-middleware/config.py` (gitignored)
  - `factory-dashboard/.env.local` (gitignored)

- [x] **Created template files**
  - `python-middleware/config.example.py` (with placeholders)
  - `factory-dashboard/.env.example` (with placeholders)

- [x] **Verified gitignore files**
  - Root `.gitignore`
  - `python-middleware/.gitignore`
  - `factory-dashboard/.gitignore`

### 2. Verify Sensitive Files Are Gitignored 🔍

Run these commands to check:

```bash
# Navigate to project root
cd "F:/Semester 5/IOT/Project/SMART-FACTORY"

# Check git status (should NOT show sensitive files)
git status

# These files should NOT appear in git status:
# - python-middleware/config.py
# - factory-dashboard/.env.local
# - python-middleware/__pycache__/
# - factory-dashboard/.next/
# - factory-dashboard/node_modules/
```

**Expected output**: Only safe files like `.gitignore`, `config.example.py`, `.env.example`, source code, and documentation.

### 3. Test Template Files 🧪

Verify template files have NO real credentials:

```bash
# Check Python config template
cat python-middleware/config.example.py

# Should see placeholders like:
# SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"
# SUPABASE_KEY = "YOUR_ANON_KEY_HERE"
```

```bash
# Check Dashboard env template
cat factory-dashboard/.env.example

# Should see placeholders like:
# NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### 4. Search for Hardcoded Credentials 🔎

Search your codebase for potential credential leaks:

```bash
# Search for Supabase URLs (should only be in config files)
grep -r "supabase.co" --exclude-dir=node_modules --exclude-dir=.next

# Search for long keys (potential API keys)
grep -rE "[a-zA-Z0-9]{32,}" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=__pycache__

# Check if any .env files are tracked
git ls-files | grep "\.env"
# Should only show .env.example files
```

### 5. Review README Files 📚

- [ ] **Root README.md** - Complete setup guide
- [ ] **python-middleware/README.md** - Python server documentation
- [ ] **factory-dashboard/README.md** - Dashboard documentation
- [ ] **SECURITY.md** - Security guidelines
- [ ] **This file** - Upload checklist

### 6. Clean Build Artifacts 🧹

```bash
# Remove Python cache
rm -rf python-middleware/__pycache__

# Remove Next.js build
rm -rf factory-dashboard/.next

# Remove node_modules (will be reinstalled)
# rm -rf factory-dashboard/node_modules  # Optional - reduces repo size
```

### 7. Verify .gitignore Coverage 📄

Check that `.gitignore` files contain:

**Root `.gitignore`:**
```gitignore
# Credentials
python-middleware/config.py
factory-dashboard/.env.local

# Build artifacts
factory-dashboard/.next
factory-dashboard/node_modules
python-middleware/__pycache__

# OS files
.DS_Store
Thumbs.db
```

**python-middleware/.gitignore:**
```gitignore
config.py
__pycache__/
*.pyc
.env
```

**factory-dashboard/.gitignore:**
```gitignore
.env.local
.next/
node_modules/
.DS_Store
```

## 🚀 Upload Steps

### Step 1: Initialize Git Repository (if not already done)

```bash
# Navigate to project root
cd "F:/Semester 5/IOT/Project/SMART-FACTORY"

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Check status
git status
# Verify sensitive files are NOT listed
```

### Step 2: Create Initial Commit

```bash
# Create first commit
git commit -m "Initial commit: Smart Factory IoT monitoring system

- Python middleware for Packet Tracer bridge
- Next.js dashboard with real-time monitoring
- Supabase database integration
- 7 system monitoring (Fire, HVAC, Conveyor, Weight, Garage, Battery, Safe Room)
- Alert system with smart deduplication
- Security: credentials in gitignored config files"
```

### Step 3: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name**: `smart-factory-iot` (or your choice)
3. **Description**: "IoT monitoring system for Cisco Packet Tracer with real-time dashboard"
4. **Visibility**: 
   - ✅ **Public** (for portfolio/sharing)
   - ⚠️ **Private** (if concerned about code visibility)
5. **DON'T** initialize with README, .gitignore, or license (you already have these)
6. Click **Create repository**

### Step 4: Link and Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/smart-factory-iot.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 5: Verify Upload ✅

1. Go to your GitHub repository
2. **Check these files exist**:
   - ✅ README.md
   - ✅ python-middleware/config.example.py
   - ✅ factory-dashboard/.env.example
   - ✅ .gitignore files
   - ✅ Source code files

3. **Check these files DON'T exist**:
   - ❌ python-middleware/config.py
   - ❌ factory-dashboard/.env.local
   - ❌ __pycache__ folders
   - ❌ node_modules folder
   - ❌ .next folder

4. **Search repository for credentials**:
   - Use GitHub's search: Press `/` → type your project ID
   - Should only find placeholders in `.example` files

## 🎯 Post-Upload Configuration

### For Team Members / Reviewers

Share these setup instructions:

```markdown
1. Clone repository:
   git clone https://github.com/YOUR_USERNAME/smart-factory-iot.git
   cd smart-factory-iot

2. Setup Python middleware:
   cd python-middleware
   pip install -r requirements.txt
   cp config.example.py config.py
   # Edit config.py with your Supabase credentials
   python server.py

3. Setup Dashboard:
   cd ../factory-dashboard
   npm install
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   npm run dev

4. Open dashboard at http://localhost:3000
```

## ⚠️ Emergency: Credential Leak

If you accidentally committed credentials:

### Option 1: Remove from Latest Commit

```bash
# If you just committed but haven't pushed
git reset HEAD~1
# Fix the files, then commit again
```

### Option 2: Remove from Git History (Already Pushed)

```bash
# Remove file from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch python-middleware/config.py" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: rewrites history)
git push origin --force --all
```

### Option 3: Use BFG Repo-Cleaner (Recommended)

```bash
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files config.py
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### Option 4: Delete and Recreate Repository (Simplest)

1. Delete the GitHub repository
2. Rotate all credentials in Supabase
3. Fix local repository
4. Create new GitHub repository
5. Push again

**After leak:**
- ✅ Immediately rotate ALL exposed credentials
- ✅ Revoke old credentials in Supabase dashboard
- ✅ Review Supabase logs for unauthorized access

## 📝 Commit Message Best Practices

Use clear, descriptive commit messages:

```bash
# Good examples:
git commit -m "Add temperature chart component"
git commit -m "Fix: Fire alert detection for CRITICAL FIRE status"
git commit -m "Update: Alert system now updates existing alerts"
git commit -m "Docs: Add setup instructions to README"

# Bad examples:
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

## 🔄 Future Updates

When making changes:

```bash
# Check status
git status

# Add changed files
git add .

# Commit with descriptive message
git commit -m "Descriptive message here"

# Push to GitHub
git push origin main
```

## ✅ Final Verification Checklist

Before marking as complete:

- [ ] All sensitive files are gitignored
- [ ] Template files have placeholder values only
- [ ] README files are comprehensive
- [ ] Code runs successfully with template files
- [ ] No credentials in git history
- [ ] Repository visibility set correctly (public/private)
- [ ] GitHub repository is accessible
- [ ] Clone test: Can clone and setup from scratch
- [ ] Security: No credentials searchable on GitHub
- [ ] Documentation: Clear setup instructions

## 🎉 Success!

Your project is now safely on GitHub without exposing credentials!

Share your repository:
- **Portfolio**: Add to resume/LinkedIn
- **Team**: Share clone instructions
- **Community**: Others can learn from your work

---

**Happy Coding! 🚀**
