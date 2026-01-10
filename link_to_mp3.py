import subprocess
import os
import re

# Lista de entradas: pueden ser URLs o búsquedas
inputs = [
    "https://www.youtube.com/watch?v=vz_vU53JvvI",
    "Aitana - En El Coche"
]

OUTPUT_DIR = "archivos_mp3"
os.makedirs(OUTPUT_DIR, exist_ok=True)

FFMPEG_PATH = r"C:\ffmpeg-2026-01-07-git-af6a1dd0b2-essentials_build\bin"

# Función para detectar si es link de YouTube
def es_youtube_url(texto):
    # Regex simple para detectar URLs de YouTube
    patron = r"(https?://)?(www\.)?(youtube\.com|youtu\.be)/"
    return re.match(patron, texto) is not None

for entrada in inputs:
    if es_youtube_url(entrada):
        # Si es URL, la usamos tal cual
        target = entrada
    else:
        # Si no es URL, usamos búsqueda y descargamos el primer resultado
        target = f"ytsearch1:{entrada}"

    print(f"Procesando: {entrada}")

    subprocess.run([
        "yt-dlp",
        "-x",
        "--audio-format", "mp3",
        "--ffmpeg-location", FFMPEG_PATH,
        "-o", f"{OUTPUT_DIR}/%(title)s.%(ext)s",
        target
    ])
