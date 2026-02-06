# YouTube to MP3 Converter - Backend API

FastAPI backend service for converting YouTube videos to MP3 files using yt-dlp and ffmpeg.

## Features

- 🎵 Convert YouTube videos to MP3 format (high quality)
- 🔍 Support for search queries (finds and downloads first result)
- 📦 Batch processing for multiple URLs/searches
- 🗑️ Automatic cleanup of old files (configurable TTL)
- 🚀 Fast and reliable with yt-dlp 2026.2.4+
- 📊 Health check endpoint for monitoring
- 🎯 Node.js integration for YouTube JavaScript extraction
- 🔧 Windows MediaFoundation MP3 encoder support (mp3_mf)
- 🌐 CORS-enabled for frontend integration
- 📝 Detailed error reporting for failed conversions

## Architecture

```
┌─────────────┐     HTTP POST      ┌──────────────┐
│   Frontend  │ ─────────────────> │   FastAPI    │
│   (React)   │ <───────────────── │   Backend    │
└─────────────┘     JSON/Binary    └──────┬───────┘
                                           │
                                           ├─> converter.py
                                           │   └─> subprocess
                                           │       ├─> yt-dlp
                                           │       │   ├─> Node.js (JS runtime)
                                           │       │   └─> Remote Components
                                           │       └─> ffmpeg (mp3_mf)
                                           │
                                           ├─> cleanup.py
                                           │   └─> APScheduler
                                           │
                                           └─> archivos_mp3/
                                               └─> {uuid}_{title}.mp3
```

### Key Components

**main.py** - FastAPI application with endpoints:
- `/api/convert` - POST endpoint for video conversion
- `/api/download/{file_id}` - GET endpoint for file downloads
- `/api/health` - GET endpoint for service health check

**converter.py** - Core conversion logic:
- `convert_single()` - Converts one URL/search to MP3
- `convert_batch()` - Processes multiple conversions
- `es_youtube_url()` - Detects URLs vs search queries
- Subprocess management for yt-dlp execution
- Metadata extraction from conversion output

**models.py** - Pydantic data models:
- `ConversionRequest` - Input validation
- `ConversionResult` - Output format
- `ConversionResponse` - Response with summary

**cleanup.py** - File management:
- `FileCleanupService` - Scheduled cleanup task
- Runs hourly and on startup
- Deletes files older than configured TTL

## Prerequisites

Before running the backend, you need to install:

### 1. Python 3.9+
Make sure Python is installed and added to PATH.
- **Tested with**: Python 3.12.3
- **Recommended**: Use Anaconda distribution for easier dependency management

### 2. Node.js (Required!)
**Critical**: yt-dlp requires Node.js for JavaScript runtime to extract YouTube videos.

```powershell
# Verify Node.js installation
node --version
# Should output: v18.0.0 or higher

# Find Node.js path (Windows)
Get-Command node | Select-Object -ExpandProperty Source
# Example output: C:\Users\nacho\anaconda3\node.exe
```

> **Important**: The Node.js path is hardcoded in `converter.py`. If your Node.js is in a different location, update:
> ```python
> "--js-runtimes", r"node:C:\Users\YourUser\anaconda3\node.exe",
> ```

### 3. yt-dlp
Install yt-dlp and keep it updated:

```bash
# Install/upgrade to latest version
pip install --upgrade yt-dlp

# Verify installation (should be 2026.2.4 or newer)
yt-dlp --version
```

**Why upgrade?** Older versions may not work with current YouTube. Always use the latest version.

### 4. ffmpeg with MP3 support
Download and install ffmpeg:

**Option A: Anaconda (Recommended for Windows)**
```bash
conda install ffmpeg
# Path will be: C:\Users\YourUser\anaconda3\Library\bin
```

**Option B: Manual Installation**
1. Download from: https://ffmpeg.org/download.html
2. Extract to a directory (e.g., `C:\ffmpeg\`)
3. Note the path to the `bin` directory (e.g., `C:\ffmpeg\bin`)

**Verify ffmpeg has MP3 encoder:**
```powershell
C:\Users\nacho\anaconda3\Library\bin\ffmpeg.exe -encoders | Select-String "mp3"
```
Should show `mp3_mf` (MediaFoundation) encoder.

> **Note**: This project uses the `mp3_mf` encoder (Windows MediaFoundation). On Linux/Mac, `libmp3lame` is used.

You'll need this path for configuration.

## Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```powershell
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Verify activation (should show (venv) in prompt)
   ```
   
   ```bash
   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   
   # Upgrade yt-dlp to latest (important!)
   pip install --upgrade yt-dlp
   ```

4. **Configure environment:**
   Create a `.env` file in the `backend/` directory with:
   
   ```env
   OUTPUT_DIR=archivos_mp3
   FFMPEG_PATH=C:\Users\nacho\anaconda3\Library\bin
   CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8080
   FILE_TTL_HOURS=24
   ```
   
   **Configuration Notes:**
   - `FFMPEG_PATH`: Must point to the directory containing `ffmpeg.exe`, NOT the exe itself
   - For Anaconda users: `C:\Users\YourUser\anaconda3\Library\bin`
   - For manual ffmpeg: `C:\ffmpeg\bin` or wherever you extracted it
   - `CORS_ORIGINS`: Include all ports your frontend might use (no spaces after commas)
   - `OUTPUT_DIR`: Relative or absolute path for MP3 files (will be created automatically)

5. **Verify Node.js path (if needed):**
   ```powershell
   # Check current Node.js location
   Get-Command node | Select-Object -ExpandProperty Source
   ```
   
   If the path is different from `C:\Users\nacho\anaconda3\node.exe`, update line 113 in `converter.py`:
   ```python
   "--js-runtimes", r"node:YOUR_ACTUAL_PATH\node.exe",
   ```

## Running the Server

### Development Mode
```powershell
# Make sure you're in the backend directory and venv is activated
# You should see (venv) in your prompt

# Windows PowerShell (recommended):
python -m uvicorn main:app --reload --port 8000

# Or with explicit host:
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

```bash
# Linux/Mac:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000 or http://127.0.0.1:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc
- Health Check: http://localhost:8000/api/health

**Expected startup output:**
```
INFO: Will watch for changes in these directories: ['D:\\Dev\\Proyectos\\yt_to_mp3\\backend']
INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO: Started reloader process [xxxxx] using WatchFiles
INFO: Started server process [xxxxx]
INFO: Waiting for application startup.
INFO: Application startup complete.
```

> **Note**: The `--reload` flag automatically restarts the server when code changes are detected.

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### GET `/`
Root endpoint with API information.

### GET `/api/health`
Health check endpoint. Returns status of yt-dlp and ffmpeg availability.

**Response:**
```json
{
  "status": "healthy",
  "ytdlp_available": true,
  "ytdlp_version": "2024.12.23",
  "ffmpeg_available": true,
  "ffmpeg_version": "6.1.1"
}
```

### POST `/api/convert`
Convert YouTube videos to MP3.

**Request Body:**
```json
{
  "urls": [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ"
  ],
  "searchQueries": [
    "Aitana - En El Coche",
    "Rick Astley Never Gonna Give You Up"
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "550e8400-e29b-41d4-a716-446655440000_Rick Astley - Never Gonna Give You Up.mp3",
      "title": "Rick Astley - Never Gonna Give You Up",
      "size": 3524123,
      "duration": "3:32",
      "success": true,
      "error": null,
      "wasSearch": false,
      "originalInput": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  ],
  "summary": {
    "total": 4,
    "successful": 4,
    "failed": 0,
    "urls_processed": 2,
    "searches_processed": 2
  }
}
```

### GET `/api/download/{file_id}`
Download a converted MP3 file.

**Parameters:**
- `file_id`: The UUID from the conversion result

**Response:**
- Content-Type: audio/mpeg
- Content-Disposition: attachment
- Binary MP3 file

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OUTPUT_DIR` | `archivos_mp3` | Directory for converted MP3 files |
| `FFMPEG_PATH` | `C:\ffmpeg...\bin` | Path to ffmpeg bin directory |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:5174` | Allowed CORS origins (comma-separated) |
| `FILE_TTL_HOURS` | `24` | Hours before files are auto-deleted |

### File Cleanup

The backend automatically deletes files older than `FILE_TTL_HOURS` (default: 24 hours).
Cleanup runs:
- On server startup
- Every hour thereafter

This prevents disk space from filling up with old conversions.

## Testing

### Test with PowerShell (Windows)

**Health Check:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Convert a URL:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/convert" -Method POST -ContentType "application/json" -Body '{"urls": ["https://www.youtube.com/watch?v=jNQXAC9IVRw"], "searchQueries": []}' -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected successful response:**
```json
{
  "results": [{
    "id": "c897cd3e-512a-44e0-aa7c-bfacda8486c9",
    "filename": "c897cd3e-512a-44e0-aa7c-bfacda8486c9_Me at the zoo.mp3",
    "title": "Me at the zoo",
    "size": 305324,
    "duration": "0:19",
    "success": true,
    "error": null,
    "wasSearch": false,
    "originalInput": "https://www.youtube.com/watch?v=jNQXAC9IVRw"
  }],
  "summary": {
    "total": 1,
    "successful": 1,
    "failed": 0,
    "urls_processed": 1,
    "searches_processed": 0
  }
}
```

**Convert with search:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/convert" -Method POST -ContentType "application/json" -Body '{"urls": [], "searchQueries": ["Me at the zoo"]}' -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Test with curl (Git Bash/Linux/Mac)

**Health Check:**
```bash
curl http://localhost:8000/api/health
```

**Convert a URL:**
```bash
curl -X POST http://localhost:8000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"], "searchQueries": []}'
```

**Convert with search:**
```bash
curl -X POST http://localhost:8000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"urls": [], "searchQueries": ["Rick Astley Never Gonna Give You Up"]}'
```

**Download file:**
```bash
curl -O http://localhost:8000/api/download/{file-id-from-convert-response}
```

### Test with Python

```python
import requests

# Convert
response = requests.post(
    "http://localhost:8000/api/convert",
    json={
        "urls": ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
        "searchQueries": ["Aitana - En El Coche"]
    }
)
data = response.json()
print(data)

# Download
if data["results"][0]["success"]:
    file_id = data["results"][0]["id"]
    download_url = f"http://localhost:8000/api/download/{file_id}"
    file_response = requests.get(download_url)
    with open("output.mp3", "wb") as f:
        f.write(file_response.content)
```

## Deployment

### Local/VPS Deployment

1. Install Python, yt-dlp, and ffmpeg on the server
2. Clone repository and set up backend
3. Configure `.env` with production values
4. Run with gunicorn or uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```
5. Set up reverse proxy (nginx) if needed
6. Configure firewall to allow port 8000

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t yt-to-mp3-backend .
docker run -p 8000:8000 -v $(pwd)/archivos_mp3:/app/archivos_mp3 yt-to-mp3-backend
```

### Cloud Platforms

#### Railway
1. Create new project from GitHub
2. Add environment variables in Railway dashboard
3. Railway will auto-detect FastAPI and deploy

#### Heroku
1. Add `Procfile`:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
2. Add buildpacks for Python and ffmpeg
3. Deploy with Heroku CLI or GitHub integration

#### Render
1. Create new Web Service
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

## Troubleshooting

### "No supported JavaScript runtime could be found"
**Error**: `WARNING: [youtube] No supported JavaScript runtime could be found`

**Solution**:
1. Verify Node.js is installed: `node --version`
2. Find Node.js path: `Get-Command node | Select-Object -ExpandProperty Source`
3. Update `converter.py` line 113 with the correct path:
   ```python
   "--js-runtimes", r"node:C:\Users\YourUser\anaconda3\node.exe",
   ```
4. Restart the backend server

### "Encoder not found" / "audio conversion failed"
**Error**: `ERROR: Postprocessing: audio conversion failed: Error opening output files: Encoder not found`

**Solution**:
1. Check if ffmpeg has MP3 encoder:
   ```powershell
   C:\Users\nacho\anaconda3\Library\bin\ffmpeg.exe -encoders | Select-String "mp3"
   ```
2. Should show `mp3_mf` encoder (Windows) or `libmp3lame` (Linux/Mac)
3. If missing, reinstall ffmpeg with MP3 support
4. The code already uses `--postprocessor-args "ffmpeg:-acodec mp3_mf"` for Windows

### yt-dlp outdated warning
**Error**: `WARNING: You are using an outdated version of yt-dlp`

**Solution**:
```bash
pip install --upgrade yt-dlp
```
Restart the backend server after upgrading.

### "Remote component challenge solver script was skipped"
**Error**: `WARNING: [youtube] [jsc] Remote component challenge solver script (node) was skipped`

**Solution**: Already fixed in code with `--remote-components ejs:github` flag.
If you still see this, make sure you're using yt-dlp 2026.2.4 or newer.

### CORS errors in browser
**Error**: `Access to fetch at 'http://localhost:8000/api/convert' from origin 'http://localhost:8080' has been blocked by CORS policy`

**Solution**:
1. Update `CORS_ORIGINS` in `.env` to include the frontend port:
   ```env
   CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8080
   ```
2. **Important**: No spaces after commas!
3. Restart backend server (CTRL+C, then run start command again)
4. Verify in startup logs: `CORS origins: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8080']`

### Backend won't reload automatically
**Issue**: Changes to code don't trigger server reload

**Solution**:
- If using `--reload` flag, check for errors in terminal
- On Windows, you may see `KeyboardInterrupt` errors during reload - this is normal
- The server will restart automatically after showing the error
- Manual restart: CTRL+C and run `python -m uvicorn main:app --reload --port 8000` again

### yt-dlp not found
- Verify yt-dlp is installed: `yt-dlp --version`
- Check if yt-dlp is in PATH (should be in venv\Scripts)
- Make sure virtual environment is activated: `(venv)` should show in prompt

### ffmpeg not found
**Error**: `ffmpeg_available: false` in health check

**Solution**:
1. Verify `FFMPEG_PATH` in `.env` is correct
2. Test: `C:\Users\nacho\anaconda3\Library\bin\ffmpeg.exe -version`
3. Make sure path points to `bin` directory, NOT to ffmpeg.exe itself
   - ✅ Correct: `C:\Users\nacho\anaconda3\Library\bin`
   - ❌ Wrong: `C:\Users\nacho\anaconda3\Library\bin\ffmpeg.exe`

### Files not downloading
- Check `OUTPUT_DIR` exists and has write permissions
- Verify file wasn't deleted by cleanup service (check FILE_TTL_HOURS)
- Check server logs for errors
- Try downloading directly: `http://localhost:8000/api/download/{file-id}`

### Slow conversions
- yt-dlp downloads from YouTube, speed depends on your internet connection
- First conversion may be slower (downloads remote components)
- Consider increasing timeout in converter.py (default: 300 seconds) for long videos
- Use batch processing for multiple conversions

### Virtual environment not activating
**Windows PowerShell**:
```powershell
# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate:
.\venv\Scripts\Activate.ps1
```

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
