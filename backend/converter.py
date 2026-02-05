import subprocess
import os
import re
import uuid
import json
from pathlib import Path
from typing import Dict, Any, Optional


def es_youtube_url(texto: str) -> bool:
    """
    Detecta si el texto es una URL de YouTube.
    
    Args:
        texto: String que puede ser una URL o una búsqueda
        
    Returns:
        True si es una URL de YouTube, False en caso contrario
    """
    patron = r"(https?://)?(www\.)?(youtube\.com|youtu\.be)/"
    return re.match(patron, texto) is not None


def get_file_size(filepath: str) -> Optional[int]:
    """Get file size in bytes"""
    try:
        return os.path.getsize(filepath)
    except:
        return None


def format_size(size_bytes: Optional[int]) -> Optional[str]:
    """Format file size in human-readable format"""
    if size_bytes is None:
        return None
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"


def extract_metadata_from_ydtlp_output(output: str) -> Dict[str, Any]:
    """
    Extract metadata from yt-dlp output
    
    Args:
        output: yt-dlp output string
        
    Returns:
        Dictionary with extracted metadata
    """
    metadata = {
        'title': None,
        'duration': None,
    }
    
    # Try to extract title from yt-dlp output
    title_match = re.search(r'\[download\] Destination: (.+?)\.(?:mp3|webm|m4a)', output)
    if title_match:
        # Extract just the filename without path
        full_path = title_match.group(1)
        metadata['title'] = os.path.basename(full_path)
    
    # Try to extract duration
    duration_match = re.search(r'Duration: (\d{2}:\d{2}:\d{2})', output)
    if duration_match:
        metadata['duration'] = duration_match.group(1)
    
    return metadata


def convert_single(
    input_text: str,
    output_dir: str,
    ffmpeg_path: str,
    is_search: bool = False
) -> Dict[str, Any]:
    """
    Convert a single URL or search query to MP3.
    
    Args:
        input_text: YouTube URL or search query
        output_dir: Directory to save the converted file
        ffmpeg_path: Path to ffmpeg binary directory
        is_search: Whether this input is a search query
        
    Returns:
        Dictionary with conversion result
    """
    file_id = str(uuid.uuid4())
    
    # Determine if it's a URL or search query
    if not is_search and not es_youtube_url(input_text):
        is_search = True
    
    # Prepare target for yt-dlp
    if is_search:
        target = f"ytsearch1:{input_text}"
    else:
        target = input_text
    
    # Prepare output template
    output_template = os.path.join(output_dir, f"{file_id}_%(title)s.%(ext)s")
    
    try:
        # Run yt-dlp
        result = subprocess.run(
            [
                "yt-dlp",
                "--js-runtimes", r"node:C:\Users\nacho\anaconda3\node.exe",
                "--remote-components", "ejs:github",
                "-x",
                "--audio-format", "mp3",
                "--postprocessor-args", "ffmpeg:-acodec mp3_mf",
                "--ffmpeg-location", ffmpeg_path,
                "-o", output_template,
                "--print", "after_move:filepath",
                "--print", "title",
                "--print", "duration_string",
                target
            ],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        
        if result.returncode != 0:
            return {
                'id': file_id,
                'filename': '',
                'title': input_text,
                'size': None,
                'duration': None,
                'success': False,
                'error': f"yt-dlp error: {result.stderr[:200]}",
                'wasSearch': is_search,
                'originalInput': input_text
            }
        
        # Parse yt-dlp output to get file information
        output_lines = result.stdout.strip().split('\n')
        
        # Try to get info from output lines
        # Note: --print statements may output in different order
        filepath = None
        title = None
        duration = None
        
        # Find the filepath (it will be a full path ending in .mp3)
        for line in output_lines:
            if line.endswith('.mp3') and os.path.exists(line):
                filepath = line
                break
        
        # If we have a filepath, extract title from filename
        if filepath:
            filename = os.path.basename(filepath)
            # Remove file_id prefix and .mp3 extension to get title
            # Format: {file_id}_{title}.mp3
            title = filename[37:-4]  # Skip UUID (36 chars + underscore), remove .mp3
        
        # Try to get duration from output (should be a number or time format)
        for line in output_lines:
            if line and not line.endswith('.mp3') and line != title:
                # This might be duration
                duration = line
                break
        
        if not filepath or not os.path.exists(filepath):
            # Fallback: try to find the file
            files = [f for f in os.listdir(output_dir) if f.startswith(file_id)]
            if files:
                filepath = os.path.join(output_dir, files[0])
            else:
                return {
                    'id': file_id,
                    'filename': '',
                    'title': title,
                    'size': None,
                    'duration': duration,
                    'success': False,
                    'error': 'File not found after conversion',
                    'wasSearch': is_search,
                    'originalInput': input_text
                }
        
        filename = os.path.basename(filepath)
        file_size = get_file_size(filepath)
        
        return {
            'id': file_id,
            'filename': filename,
            'title': title,
            'size': file_size,
            'duration': duration,
            'success': True,
            'error': None,
            'wasSearch': is_search,
            'originalInput': input_text
        }
        
    except subprocess.TimeoutExpired:
        return {
            'id': file_id,
            'filename': '',
            'title': input_text,
            'size': None,
            'duration': None,
            'success': False,
            'error': 'Conversion timeout (exceeded 5 minutes)',
            'wasSearch': is_search,
            'originalInput': input_text
        }
    except Exception as e:
        return {
            'id': file_id,
            'filename': '',
            'title': input_text,
            'size': None,
            'duration': None,
            'success': False,
            'error': f"Unexpected error: {str(e)}",
            'wasSearch': is_search,
            'originalInput': input_text
        }


def convert_batch(
    urls: list,
    search_queries: list,
    output_dir: str,
    ffmpeg_path: str
) -> list:
    """
    Convert multiple URLs and search queries to MP3.
    
    Args:
        urls: List of YouTube URLs
        search_queries: List of search queries
        output_dir: Directory to save converted files
        ffmpeg_path: Path to ffmpeg binary directory
        
    Returns:
        List of conversion results
    """
    results = []
    
    # Process URLs
    for url in urls:
        result = convert_single(url, output_dir, ffmpeg_path, is_search=False)
        results.append(result)
    
    # Process search queries
    for query in search_queries:
        result = convert_single(query, output_dir, ffmpeg_path, is_search=True)
        results.append(result)
    
    return results


def check_ytdlp_available() -> tuple[bool, Optional[str]]:
    """Check if yt-dlp is available and get version"""
    try:
        result = subprocess.run(
            ["yt-dlp", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return True, result.stdout.strip()
        return False, None
    except:
        return False, None


def check_ffmpeg_available(ffmpeg_path: str) -> tuple[bool, Optional[str]]:
    """Check if ffmpeg is available and get version"""
    try:
        ffmpeg_exe = os.path.join(ffmpeg_path, "ffmpeg.exe")
        result = subprocess.run(
            [ffmpeg_exe, "-version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            # Extract version from first line
            first_line = result.stdout.split('\n')[0]
            version_match = re.search(r'ffmpeg version ([\S]+)', first_line)
            if version_match:
                return True, version_match.group(1)
            return True, "unknown"
        return False, None
    except:
        return False, None
