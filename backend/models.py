from pydantic import BaseModel, Field
from typing import List, Optional


class ConvertRequest(BaseModel):
    """Request model for conversion endpoint"""
    urls: List[str] = Field(default_factory=list, description="List of YouTube URLs to convert")
    searchQueries: List[str] = Field(default_factory=list, description="List of search queries to find and convert")


class ConversionResult(BaseModel):
    """Result for a single conversion"""
    id: str = Field(..., description="Unique identifier for the converted file")
    filename: str = Field(..., description="Name of the converted file")
    title: str = Field(..., description="Title of the video/audio")
    size: Optional[int] = Field(None, description="File size in bytes")
    duration: Optional[str] = Field(None, description="Duration in human-readable format")
    success: bool = Field(..., description="Whether conversion was successful")
    error: Optional[str] = Field(None, description="Error message if conversion failed")
    wasSearch: bool = Field(False, description="Whether this was from a search query")
    originalInput: str = Field(..., description="Original URL or search query")


class ConvertResponse(BaseModel):
    """Response model for conversion endpoint"""
    results: List[ConversionResult]
    summary: dict = Field(..., description="Summary of conversion results")


class HealthResponse(BaseModel):
    """Response model for health check endpoint"""
    status: str
    ytdlp_available: bool
    ytdlp_version: Optional[str] = None
    ffmpeg_available: bool
    ffmpeg_version: Optional[str] = None
