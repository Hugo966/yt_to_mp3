/**
 * API Configuration for YouTube to MP3 Converter
 */

// Get API URL from environment variable or use default localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  health: `${API_URL}/api/health`,
  convert: `${API_URL}/api/convert`,
  download: (fileId: string) => `${API_URL}/api/download/${fileId}`,
} as const;

/**
 * Check if the API is available
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.health);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
