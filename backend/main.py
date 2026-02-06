from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

from models import ConvertRequest, ConvertResponse, ConversionResult, HealthResponse
from converter import (
    convert_batch,
    check_ytdlp_available,
    check_ffmpeg_available,
    format_size
)
from cleanup import FileCleanupService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="YouTube to MP3 Converter API",
    description="API for converting YouTube videos to MP3 files",
    version="1.0.0"
)

# Configuration
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "archivos_mp3")
FFMPEG_PATH = os.getenv("FFMPEG_PATH", r"C:\ffmpeg-2026-01-07-git-af6a1dd0b2-essentials_build\bin")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
FILE_TTL_HOURS = int(os.getenv("FILE_TTL_HOURS", "24"))

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Initialize cleanup service
cleanup_service = FileCleanupService(OUTPUT_DIR, FILE_TTL_HOURS)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.on_event("startup")
async def startup_event():
    """Start background services on app startup"""
    logger.info("Starting YouTube to MP3 Converter API")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    logger.info(f"FFMPEG path: {FFMPEG_PATH}")
    logger.info(f"CORS origins: {CORS_ORIGINS}")
    logger.info(f"File TTL: {FILE_TTL_HOURS} hours")
    
    # Start cleanup service
    cleanup_service.start()


@app.on_event("shutdown")
async def shutdown_event():
    """Stop background services on app shutdown"""
    logger.info("Shutting down YouTube to MP3 Converter API")
    cleanup_service.stop()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "YouTube to MP3 Converter API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "convert": "/api/convert",
            "download": "/api/download/{file_id}"
        }
    }


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Check API health and availability of required tools (yt-dlp, ffmpeg)
    """
    ytdlp_available, ytdlp_version = check_ytdlp_available()
    ffmpeg_available, ffmpeg_version = check_ffmpeg_available(FFMPEG_PATH)
    
    status = "healthy" if (ytdlp_available and ffmpeg_available) else "degraded"
    
    return HealthResponse(
        status=status,
        ytdlp_available=ytdlp_available,
        ytdlp_version=ytdlp_version,
        ffmpeg_available=ffmpeg_available,
        ffmpeg_version=ffmpeg_version
    )


@app.post("/api/convert", response_model=ConvertResponse)
async def convert_videos(request: ConvertRequest):
    """
    Convert YouTube videos to MP3.
    Accepts both direct URLs and search queries.
    """
    # Validate request
    if not request.urls and not request.searchQueries:
        raise HTTPException(
            status_code=400,
            detail="At least one URL or search query must be provided"
        )
    
    total_inputs = len(request.urls) + len(request.searchQueries)
    logger.info(f"Processing conversion request: {len(request.urls)} URLs, {len(request.searchQueries)} searches")
    
    try:
        # Convert all inputs
        results_data = convert_batch(
            urls=request.urls,
            search_queries=request.searchQueries,
            output_dir=OUTPUT_DIR,
            ffmpeg_path=FFMPEG_PATH
        )
        
        # Convert to response models
        results = [ConversionResult(**result) for result in results_data]
        
        # Calculate summary
        successful = sum(1 for r in results if r.success)
        failed = sum(1 for r in results if not r.success)
        
        summary = {
            "total": total_inputs,
            "successful": successful,
            "failed": failed,
            "urls_processed": len(request.urls),
            "searches_processed": len(request.searchQueries)
        }
        
        logger.info(f"Conversion complete: {successful}/{total_inputs} successful")
        
        return ConvertResponse(
            results=results,
            summary=summary
        )
        
    except Exception as e:
        logger.error(f"Error during conversion: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Conversion error: {str(e)}"
        )


@app.get("/api/download/{file_id}")
async def download_file(file_id: str):
    """
    Download a converted MP3 file by its ID.
    The file_id is part of the filename returned by the convert endpoint.
    """
    # Find file with this ID
    try:
        files = [f for f in os.listdir(OUTPUT_DIR) if f.startswith(file_id)]
        
        if not files:
            raise HTTPException(
                status_code=404,
                detail=f"File not found or has been deleted. Files are automatically removed after {FILE_TTL_HOURS} hours."
            )
        
        # Get the first matching file
        filename = files[0]
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # Verify file exists
        if not os.path.isfile(filepath):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Prepare display filename (remove UUID prefix)
        display_filename = filename.replace(f"{file_id}_", "", 1)
        
        logger.info(f"Serving file: {filename}")
        
        # Return file
        return FileResponse(
            path=filepath,
            media_type="audio/mpeg",
            filename=display_filename,
            headers={
                "Content-Disposition": f'attachment; filename="{display_filename}"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving file {file_id}: {e}")
        raise HTTPException(status_code=500, detail="Error serving file")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
