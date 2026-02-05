# YouTube to MP3 Converter

A modern web application for converting YouTube videos (and other platforms) to MP3 files. Features include URL conversion, intelligent search, and batch processing capabilities.

## 🚀 Features

- **Direct URL Conversion**: Paste YouTube URLs and convert to MP3
- **Intelligent Search**: Search by title/artist and automatically convert the best match
- **Batch Processing**: Convert multiple URLs or search queries at once
- **High Quality**: 320 kbps MP3 output with ffmpeg
- **Auto-Cleanup**: Automatic file deletion after 24 hours (configurable)
- **Modern UI**: Beautiful, responsive interface built with React and shadcn/ui

## 🏗️ Architecture

This project consists of two main components:

### Frontend (React + TypeScript)
- Built with Vite, React 18, and TypeScript
- UI components from shadcn/ui
- Tailwind CSS for styling
- Supports single, batch, and search modes

### Backend (FastAPI + Python)
- FastAPI REST API
- yt-dlp for video downloading and conversion
- ffmpeg for audio processing
- Automatic file cleanup service
- CORS-enabled for frontend integration

```
Frontend (React) → FastAPI Server → yt-dlp/ffmpeg → Local Storage → Direct Download
```

## 📋 Prerequisites

Before running this project, ensure you have:

### For Frontend:
- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun**

### For Backend:
- **Python 3.9+** (Python 3.12.3 tested and working)
- **Node.js** - Required by yt-dlp for JavaScript runtime (YouTube extraction)
- **yt-dlp** (2026.2.4+) - Install: `pip install yt-dlp`
- **ffmpeg** - [Download from ffmpeg.org](https://ffmpeg.org/download.html) or install via Anaconda

> **Note**: yt-dlp requires Node.js to extract YouTube videos. Make sure `node.exe` is in your PATH or configure the path in `converter.py`.

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd yt_to_mp3
```

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment (recommended)
# Windows PowerShell:
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Upgrade yt-dlp to latest version
pip install --upgrade yt-dlp

# Configure environment
# Create .env file with the following content:
# OUTPUT_DIR=archivos_mp3
# FFMPEG_PATH=C:\Users\YourUser\anaconda3\Library\bin
# CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8080
# FILE_TTL_HOURS=24

# Start the backend server
python -m uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

See [backend/README.md](backend/README.md) for detailed backend documentation.

### 3. Frontend Setup

```bash
# From project root
npm install

# Create environment file
copy .env.local.example .env.local  # Or create manually

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Environment Variables

**Backend** (`.env` in `backend/` directory):
```env
OUTPUT_DIR=archivos_mp3
FFMPEG_PATH=C:\Users\nacho\anaconda3\Library\bin
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8080
FILE_TTL_HOURS=24
```

> **Important**: 
> - `FFMPEG_PATH` should point to the directory containing `ffmpeg.exe`, not the exe itself
> - If using Anaconda, the path is typically `C:\Users\YourUser\anaconda3\Library\bin`
> - Include all frontend ports in `CORS_ORIGINS` (5173, 5174, 8080)
> - Node.js path is auto-detected but can be configured in `backend/converter.py` if needed

**Frontend** (`.env.local` in root directory):
```env
VITE_API_URL=http://localhost:8000
```

## 🎯 Usage

### Local Development

### 1. Start Backend (Terminal 1):
   ```powershell
   # Windows PowerShell
   cd backend
   .\\venv\\Scripts\\Activate.ps1  # If using venv
   python -m uvicorn main:app --reload --port 8000
   ```
   
   ```bash
   # Linux/Mac
   cd backend
   source venv/bin/activate  # If using venv
   uvicorn main:app --reload --port 8000
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   npm run dev
   ```
   
   **Or with bun:**
   ```bash
   bun run dev
   ```

3. **Open Browser**: Navigate to the URL shown (usually `http://localhost:5173` or `http://localhost:8080`)

### Using the Application

**Single URL Conversion**:
1. Select "Single" mode
2. Paste a YouTube URL
3. Click "Convert to MP3"
4. Download when ready

**Search & Convert**:
1. Select "Search" mode
2. Enter artist/title (e.g., "Aitana - En El Coche")
3. App finds and converts the best match
4. Download the result

**Batch Processing**:
1. Select "Batch" mode
2. Paste multiple URLs/searches (one per line)
3. Click "Convert X Items to MP3"
4. Download individually or all at once

## 🧪 Testing

### Backend API Testing

**Using PowerShell:**
```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content

# Convert a URL
Invoke-WebRequest -Uri "http://localhost:8000/api/convert" -Method POST -ContentType "application/json" -Body '{"urls": ["https://www.youtube.com/watch?v=jNQXAC9IVRw"], "searchQueries": []}' -UseBasicParsing | Select-Object -ExpandProperty Content

# Convert with search
Invoke-WebRequest -Uri "http://localhost:8000/api/convert" -Method POST -ContentType "application/json" -Body '{"urls": [], "searchQueries": ["Me at the zoo"]}' -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Using curl (Git Bash/Linux/Mac):**
```bash
# Health check
curl http://localhost:8000/api/health

# Convert a URL
curl -X POST http://localhost:8000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"], "searchQueries": []}'

# Convert with search
curl -X POST http://localhost:8000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"urls": [], "searchQueries": ["Rick Astley Never Gonna Give You Up"]}'
```

## 📦 Deployment

### Backend Deployment Options

**Option 1: VPS/Server**
1. Install Python, yt-dlp, and ffmpeg on server
2. Clone repository and setup backend
3. Use gunicorn or uvicorn with systemd service
4. Set up nginx reverse proxy

**Option 2: Docker**
```bash
cd backend
docker build -t yt-to-mp3-backend .
docker run -p 8000:8000 -v ./archivos_mp3:/app/archivos_mp3 yt-to-mp3-backend
```

**Option 3: Cloud Platforms**
- **Railway**: Auto-detects FastAPI, add environment variables
- **Heroku**: Add Procfile and buildpacks for Python and ffmpeg
- **Render**: Configure build and start commands in dashboard

### Frontend Deployment

**Option 1: Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

**Option 2: Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

**Option 3: Static Hosting**
```bash
npm run build
# Upload dist/ folder to any static host
```

**Important**: Update `VITE_API_URL` in production environment to point to your deployed backend.

## 🔧 Technologies Used

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **TanStack Query** - Server state management

### Backend
- **FastAPI** - Modern Python web framework
- **yt-dlp** (2026.2.4+) - Video downloading and metadata extraction
- **ffmpeg** - Audio conversion and processing (using mp3_mf encoder on Windows)
- **Node.js** - Required JavaScript runtime for yt-dlp YouTube extraction
- **Pydantic** - Data validation
- **APScheduler** - Automated file cleanup
- **uvicorn** - ASGI server
- **python-dotenv** - Environment variable management

## 🔍 Technical Details

### yt-dlp Configuration
This project uses specific yt-dlp flags to ensure compatibility:
- `--js-runtimes node:PATH` - Uses Node.js for JavaScript execution (required for YouTube)
- `--remote-components ejs:github` - Downloads remote components for JS challenge solving
- `--postprocessor-args "ffmpeg:-acodec mp3_mf"` - Uses Windows MediaFoundation MP3 encoder
- `--ffmpeg-location` - Points to ffmpeg binary directory

### File Management
- Files are stored with UUID prefixes to prevent naming conflicts
- Automatic cleanup runs hourly, deleting files older than configured TTL
- Files are served directly via FastAPI streaming response
- Original video metadata (title, duration, size) is preserved

### Frontend-Backend Communication
- REST API with JSON payloads
- CORS enabled for local development ports
- Direct file downloads using file IDs
- Real-time conversion status through synchronous API calls

## 🐛 Troubleshooting

### Backend Issues

**"No supported JavaScript runtime could be found"**
- **Cause**: yt-dlp needs Node.js to extract YouTube videos
- **Solution**: 
  1. Install Node.js if not already installed
  2. Find Node.js path: `Get-Command node | Select-Object -ExpandProperty Source`
  3. Update path in `backend/converter.py` line 113 if needed
  4. Restart backend server

**"Encoder not found" / "audio conversion failed"**
- **Cause**: ffmpeg missing MP3 encoder
- **Solution**: 
  1. Verify encoder: `ffmpeg.exe -encoders | Select-String "mp3"`
  2. Should show `mp3_mf` (Windows MediaFoundation) or `libmp3lame`
  3. If missing, reinstall ffmpeg (recommend using Anaconda on Windows)
  4. Backend already configured to use `mp3_mf` encoder

**"yt-dlp not found"**
- Verify installation: `yt-dlp --version`
- Ensure yt-dlp is in system PATH or venv
- Make sure virtual environment is activated (look for `(venv)` in prompt)
- Try reinstalling: `pip install --upgrade yt-dlp`

**"ffmpeg not found"**
- Verify `FFMPEG_PATH` in `.env` points to ffmpeg `bin` directory
- ✅ Correct: `C:\Users\nacho\anaconda3\Library\bin`
- ❌ Wrong: `C:\Users\nacho\anaconda3\Library\bin\ffmpeg.exe`
- Test: `C:\path\to\ffmpeg\bin\ffmpeg.exe -version`
- Download from https://ffmpeg.org if missing

**"CORS error" in browser**
- Update `CORS_ORIGINS` in backend `.env`
- Include frontend URL (e.g., `http://localhost:5173,http://localhost:8080`)
- **Important**: No spaces after commas!
- Restart backend after changing `.env`
- Verify in logs: `CORS origins: ['http://localhost:5173', ...]`

**"Connection refused"**
- Verify backend is running on port 8000
- Check `VITE_API_URL` in frontend `.env.local`
- Ensure no firewall blocking the connection
- Backend health: `http://localhost:8000/api/health`

**"Outdated yt-dlp" warning**
- Update yt-dlp: `pip install --upgrade yt-dlp`
- Current working version: 2026.2.4 or newer
- Restart backend after upgrading

**Backend won't auto-reload (Windows)**
- Normal: May see `KeyboardInterrupt` errors during reload
- Server will restart correctly after the error
- Manual restart: CTRL+C → `python -m uvicorn main:app --reload --port 8000`

### Frontend Issues

**"Failed to fetch"**
- Backend must be running before starting frontend
- Check backend health: `http://localhost:8000/api/health`
- Verify `VITE_API_URL` is correct in `.env.local`
- Should be: `VITE_API_URL=http://localhost:8000`

**Downloads not working**
- Check browser pop-up blocker settings
- Verify files exist in backend `OUTPUT_DIR` (archivos_mp3)
- Files auto-delete after `FILE_TTL_HOURS` (default: 24 hours)
- Try direct download: `http://localhost:8000/api/download/{file-id}`

**Dev server won't start on port 5173**
- Port may be in use, Vite will try alternative ports (5174, 8080, etc.)
- Update `CORS_ORIGINS` in backend `.env` to include the new port
- Restart backend to apply CORS changes

## 📁 Project Structure

```
yt_to_mp3/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # FastAPI app and endpoints
│   ├── models.py           # Pydantic models
│   ├── converter.py        # yt-dlp conversion logic
│   ├── cleanup.py          # File cleanup service
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Backend configuration
│   └── README.md           # Backend documentation
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── ConversionCard.tsx  # Main conversion interface
│   │   └── ui/            # shadcn/ui components
│   ├── config/            # Configuration
│   │   └── api.ts         # API endpoints config
│   ├── pages/             # Page components
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── .env.local             # Frontend configuration
├── package.json           # Node dependencies
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect copyright laws and terms of service of video platforms. Only download content you have the rights to or that is in the public domain.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Amazing YouTube downloader
- [FFmpeg](https://ffmpeg.org/) - Multimedia framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [React](https://react.dev/) - UI library

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check [backend/README.md](backend/README.md) for backend-specific docs
- Review troubleshooting section above

---

**Built with ❤️ for educational purposes**
