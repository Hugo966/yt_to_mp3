import os
import time
import logging
from pathlib import Path
from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)


class FileCleanupService:
    """Service to automatically clean up old converted files"""
    
    def __init__(self, output_dir: str, ttl_hours: int = 24):
        """
        Initialize cleanup service
        
        Args:
            output_dir: Directory containing converted files
            ttl_hours: Time-to-live in hours for files
        """
        self.output_dir = output_dir
        self.ttl_seconds = ttl_hours * 3600
        self.scheduler = BackgroundScheduler()
        
    def cleanup_old_files(self):
        """Remove files older than TTL"""
        if not os.path.exists(self.output_dir):
            return
        
        current_time = time.time()
        deleted_count = 0
        
        try:
            for filename in os.listdir(self.output_dir):
                filepath = os.path.join(self.output_dir, filename)
                
                # Skip directories
                if not os.path.isfile(filepath):
                    continue
                
                # Check file age
                file_age = current_time - os.path.getmtime(filepath)
                
                if file_age > self.ttl_seconds:
                    try:
                        os.remove(filepath)
                        deleted_count += 1
                        logger.info(f"Deleted old file: {filename} (age: {file_age/3600:.2f} hours)")
                    except Exception as e:
                        logger.error(f"Error deleting file {filename}: {e}")
            
            if deleted_count > 0:
                logger.info(f"Cleanup complete: {deleted_count} files deleted")
            else:
                logger.debug("Cleanup complete: no files to delete")
                
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    def start(self):
        """Start the cleanup scheduler"""
        # Run cleanup immediately on start
        self.cleanup_old_files()
        
        # Schedule cleanup to run every hour
        self.scheduler.add_job(
            self.cleanup_old_files,
            'interval',
            hours=1,
            id='cleanup_job'
        )
        
        self.scheduler.start()
        logger.info(f"Cleanup service started (TTL: {self.ttl_seconds/3600} hours, runs every hour)")
    
    def stop(self):
        """Stop the cleanup scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Cleanup service stopped")
