# 🚀 Quick Start Guide

Get the YouTube to MP3 Converter running locally in 5 minutes!

## ✅ Prerequisites Checklist

Before you start, make sure you have:

- [ ] **Node.js v18+** installed ([download](https://nodejs.org/)) - **REQUIRED** for yt-dlp
- [ ] **Python 3.9+** installed ([download](https://www.python.org/downloads/)) - Tested with Python 3.12.3
- [ ] **Git** installed ([download](https://git-scm.com/downloads))

> **⚠️ Important**: Node.js is **required** by yt-dlp to extract YouTube videos. Without it, conversions will fail.

**Quick verification:**
```powershell
node --version   # Should show v18.0.0 or higher
python --version # Should show 3.9.0 or higher
```

## 📥 Step 1: Clone & Install

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd yt_to_mp3

# Install frontend dependencies
npm install
```

## 🐍 Step 2: Setup Backend

### 2.1 Install Python Dependencies

**Windows PowerShell:**
```powershell
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
# You should see (venv) in your prompt

# Install packages
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> **Note**: If you get an execution policy error on Windows:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 2.2 Install/Upgrade yt-dlp

```bash
# Install and upgrade to latest version (important!)
pip install --upgrade yt-dlp

# Verify installation (should be 2026.2.4 or newer)
yt-dlp --version
```

> **Important**: Always use the latest yt-dlp version. Older versions may not work with current YouTube.

### 2.3 Install ffmpeg

**Windows Option A: Anaconda (Recommended)**
```powershell
conda install ffmpeg
# Path will be: C:\Users\YourUsername\anaconda3\Library\bin
```

**Windows Option B: Manual Installation**
1. Download ffmpeg from: https://ffmpeg.org/download.html
2. Extract to a folder (e.g., `C:\ffmpeg\`)
3. Note the path to the `bin` folder (e.g., `C:\ffmpeg\bin`)

**Verify ffmpeg has MP3 encoder (Windows):**
```powershell
C:\Users\YourUsername\anaconda3\Library\bin\ffmpeg.exe -encoders | Select-String "mp3"
# Should show: mp3_mf (MediaFoundation)
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

### 2.4 Configure Backend

Create a `.env` file in the `backend/` directory:

**Windows (Anaconda users):**
```env
OUTPUT_DIR=archivos_mp3
FFMPEG_PATH=C:\Users\YourUsername\anaconda3\Library\bin
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8080
FILE_TTL_HOURS=24
```

**Windows (Manual ffmpeg):**
```env
OUTPUT_DIR=archivos_mp3
FFMPEG_PATH=C:\ffmpeg\bin
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8080
FILE_TTL_HOURS=24
```

**Mac/Linux:**
```env
OUTPUT_DIR=archivos_mp3
FFMPEG_PATH=/usr/local/bin
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8080
FILE_TTL_HOURS=24
```

**Important Notes:**
- `FFMPEG_PATH` must point to the **directory** containing ffmpeg, not the executable itself
- ✅ Correct: `C:\Users\nacho\anaconda3\Library\bin`
- ❌ Wrong: `C:\Users\nacho\anaconda3\Library\bin\ffmpeg.exe`
- No spaces after commas in `CORS_ORIGINS`
- Replace `YourUsername` with your actual Windows username

### 2.5 Verify Node.js Path (Important!)

```powershell
# Find your Node.js location
Get-Command node | Select-Object -ExpandProperty Source
```

If the path is **NOT** `C:\Users\nacho\anaconda3\node.exe`, you need to update `backend/converter.py` line 113 with your actual path.

## ⚙️ Step 3: Configure Frontend

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:8000
```

That's it! The default value should work for local development.

## 🎬 Step 4: Start the Application

You need **two terminal windows**:

### Terminal 1: Start Backend

**Windows PowerShell:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1  # Activate venv if not already active
python -m uvicorn main:app --reload --port 8000
```

**Mac/Linux:**
```bash
cd backend
source venv/bin/activate  # Activate venv if not already active
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Starting YouTube to MP3 Converter API
INFO:     CORS origins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8080']
INFO:     Application startup complete.
```

> **Note**: On Windows, you may see `KeyboardInterrupt` errors when files change. This is normal - the server will restart automatically.

### Terminal 2: Start Frontend

```bash
# From project root
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## 🎉 Step 5: Test the Application

1. **Open your browser**: Go to `http://localhost:5173`

2. **Test Single URL Conversion**:
   - Select "Single" mode
   - Paste: `https://www.youtube.com/watch?v=jNQXAC9IVRw` (first YouTube video ever!)
   - Click "Convert to MP3"
   - Wait for conversion (usually 10-30 seconds, first conversion may take longer)
   - You should see "1 File Ready!" with the video title
   - Click the download button with the down arrow icon

3. **Test Search Feature**:
   - Select "Search" mode
   - Type: `Rick Astley Never Gonna Give You Up`
   - Click "Search & Convert to MP3"
   - Download the result

4. **Test Batch Processing**:
   - Select "Batch" mode
   - Paste multiple URLs/searches (one per line):
     ```
     https://www.youtube.com/watch?v=dQw4w9WgXcQ
     Rick Astley Together Forever
     ```
   - Click "Convert X Items to MP3"
   - Download individually or click "Download All"

## ✅ Verification Checklist

- [ ] Backend health check returns status "healthy": http://localhost:8000/api/health
- [ ] Frontend loads without errors
- [ ] Single URL conversion works
- [ ] Search feature works
- [ ] Batch conversion works
- [ ] Files download successfully
- [ ] Files appear in `backend/archivos_mp3/` directory

## 🐛 Common Issues

### "No supported JavaScript runtime could be found"
**This is the most common error!**

**Fix:**
1. Verify Node.js is installed: `node --version`
2. Find Node.js path: `Get-Command node | Select-Object -ExpandProperty Source`
3. Update `backend/converter.py` line 113 with your path:
   ```python
   "--js-runtimes", r"node:C:\YOUR_ACTUAL_PATH\node.exe",
   ```
4. Restart backend (Ctrl+C, then start command again)

### "Encoder not found" / "audio conversion failed"
**Fix:**
1. Verify ffmpeg has MP3 encoder:
   ```powershell
   C:\Users\nacho\anaconda3\Library\bin\ffmpeg.exe -encoders | Select-String "mp3"
   ```
2. Should show `mp3_mf` (Windows MediaFoundation)
3. If missing, reinstall ffmpeg via Anaconda: `conda install ffmpeg`

### "yt-dlp outdated" warning
```bash
# Always upgrade to latest version
pip install --upgrade yt-dlp
```
Restart backend after upgrading.

### "ffmpeg not found"
- Check your `backend/.env` file
- Verify `FFMPEG_PATH` points to the **directory**, not the exe:
  - ✅ `C:\Users\nacho\anaconda3\Library\bin`
  - ❌ `C:\Users\nacho\anaconda3\Library\bin\ffmpeg.exe`
- Test: `C:\path\to\bin\ffmpeg.exe -version`

### "Connection refused" or "Failed to fetch"
- Make sure backend is running on port 8000
- Check backend health: `http://localhost:8000/api/health`
- Verify `VITE_API_URL` in `.env.local` is `http://localhost:8000`
- Check if another app is using port 8000

### "CORS error" in browser console
**Fix:**
1. Check which port frontend is using (shown in Terminal 2)
2. Update `backend/.env` to include that port in `CORS_ORIGINS`
3. **No spaces after commas!**
4. Restart backend (Ctrl+C, then start again)

### "Module not found" (Python)
- Make sure virtual environment is activated (look for `(venv)` in prompt)
- Run `pip install -r requirements.txt` again

### Virtual environment won't activate (Windows)
```powershell
# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then try activating again:
.\venv\Scripts\Activate.ps1
```

### Backend won't auto-reload
- Normal on Windows: May see `KeyboardInterrupt` during reload
- Server restarts automatically after the error
- Manual restart: Ctrl+C → run start command again

### "Port already in use"
**Backend (port 8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

**Frontend (port 5173):**
- Vite will automatically use another port (5174, 5175, etc.)

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [backend/README.md](backend/README.md) for API details
- Explore the code in `src/components/ConversionCard.tsx`
- Customize the UI with Tailwind CSS
- Deploy to production (see README.md)

## 💡 Pro Tips

1. **Keep both terminals open** while developing
2. **Backend auto-reloads** when you change Python files
3. **Frontend hot-reloads** when you change React files
4. **Check backend logs** if something doesn't work
5. **Browser DevTools** can help debug frontend issues
6. **Files auto-delete** after 24 hours (configurable in `backend/.env`)

## 🆘 Still Having Issues?

1. Check the logs in both terminal windows
2. Visit http://localhost:8000/docs for API documentation
3. Test API directly: http://localhost:8000/api/health
4. Check if all prerequisites are installed correctly
5. Restart both backend and frontend
6. Review the troubleshooting section in README.md

---

**Happy converting! 🎵**
