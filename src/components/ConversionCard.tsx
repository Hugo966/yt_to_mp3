import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioWave } from "./AudioWave";
import { Link2, Download, Loader2, Music, CheckCircle2, List, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ConversionState = "idle" | "validating" | "processing" | "ready" | "error";

interface ConversionResult {
  url: string;
  success: boolean;
  title?: string;
  downloadUrl?: string;
  duration?: string;
  filesize?: string;
  error?: string;
}
type InputMode = "single" | "batch";

export const ConversionCard = () => {
  const [urls, setUrls] = useState("");
  const [mode, setMode] = useState<InputMode>("single");
  const [state, setState] = useState<ConversionState>("idle");
  const [results, setResults] = useState<ConversionResult[]>([]);
  const { toast } = useToast();

  const urlList = urls.split("\n").filter((url) => url.trim());
  const urlCount = urlList.length;

  const handleConvert = async () => {
    if (!urls.trim()) {
      toast({
        title: "Please enter a URL",
        description: mode === "single" 
          ? "Paste a valid video URL to convert to MP3"
          : "Paste one or more video URLs (one per line)",
        variant: "destructive",
      });
      return;
    }

    setState("validating");
    setResults([]);
    
    // Short validation delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setState("processing");

    try {
      const { data, error } = await supabase.functions.invoke('convert-video', {
        body: { urls: urlList, quality: '320' }
      });

      if (error) throw error;

      if (data.results) {
        setResults(data.results);
        const successCount = data.results.filter((r: ConversionResult) => r.success).length;
        
        if (successCount > 0) {
          setState("ready");
          toast({
            title: "Conversion complete!",
            description: successCount === urlList.length 
              ? `${successCount} MP3 file${successCount > 1 ? 's are' : ' is'} ready to download`
              : `${successCount} of ${urlList.length} conversions succeeded`,
          });
        } else {
          setState("error");
          toast({
            title: "Conversion failed",
            description: "Could not convert the provided URL(s). Please check they are valid YouTube URLs.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setState("error");
      toast({
        title: "Conversion failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (downloadUrl: string, title: string) => {
    window.open(downloadUrl, '_blank');
    toast({
      title: "Download started",
      description: `Downloading ${title}.mp3`,
    });
  };

  const handleDownloadAll = () => {
    const successfulResults = results.filter(r => r.success && r.downloadUrl);
    successfulResults.forEach((result, index) => {
      setTimeout(() => {
        if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank');
        }
      }, index * 500);
    });
    toast({
      title: "Downloads started",
      description: `Downloading ${successfulResults.length} file(s)`,
    });
  };

  const handleReset = () => {
    setState("idle");
    setUrls("");
    setResults([]);
  };

  return (
    <div className="glass-card rounded-3xl p-8 md:p-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Convert Video to MP3</h2>
            <p className="text-muted-foreground text-sm">
              {mode === "single" ? "Paste your video URL below" : "Paste multiple URLs (one per line)"}
            </p>
          </div>
        </div>

        {state === "idle" && (
          <div className="flex bg-secondary/50 rounded-xl p-1">
            <button
              onClick={() => setMode("single")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                mode === "single" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Single
            </button>
            <button
              onClick={() => setMode("batch")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                mode === "batch" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Batch
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Link2 className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
          <Textarea
            placeholder={mode === "single" 
              ? "https://www.youtube.com/watch?v=..." 
              : "https://www.youtube.com/watch?v=abc123\nhttps://www.youtube.com/watch?v=def456\nhttps://vimeo.com/123456789"
            }
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            className={cn(
              "pl-12 text-base resize-none",
              mode === "single" ? "min-h-[56px] py-4" : "min-h-[120px]"
            )}
            disabled={state !== "idle"}
            rows={mode === "single" ? 1 : 4}
          />
          {mode === "batch" && urlCount > 0 && state === "idle" && (
            <div className="absolute right-4 top-4 bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded-full">
              {urlCount} URL{urlCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {state === "idle" && (
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handleConvert}
          >
            {mode === "batch" && urlCount > 1 
              ? `Convert ${urlCount} Videos to MP3` 
              : "Convert to MP3"
            }
          </Button>
        )}

        {(state === "validating" || state === "processing") && (
          <div className="bg-secondary/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm font-medium">
                  {state === "validating" 
                    ? `Validating ${urlCount > 1 ? `${urlCount} URLs` : "URL"}...` 
                    : `Converting ${urlCount > 1 ? `${urlCount} videos` : "video"} to MP3...`
                  }
                </span>
              </div>
              <AudioWave bars={5} isAnimating />
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000",
                  state === "validating" && "w-1/4",
                  state === "processing" && "w-3/4 animate-pulse"
                )}
              />
            </div>
          </div>
        )}

        {state === "ready" && results.length > 0 && (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <span className="font-semibold">
                  {results.filter(r => r.success).length} File{results.filter(r => r.success).length !== 1 ? 's' : ''} Ready!
                </span>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    result.success ? "bg-background/50" : "bg-destructive/10"
                  )}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.success ? result.title : "Failed"}
                      </p>
                      {result.success ? (
                        <p className="text-xs text-muted-foreground">
                          {result.duration} • 320 kbps
                        </p>
                      ) : (
                        <p className="text-xs text-destructive">{result.error}</p>
                      )}
                    </div>
                    {result.success && result.downloadUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(result.downloadUrl!, result.title || 'audio')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              {results.filter(r => r.success).length > 1 && (
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={handleDownloadAll}
                >
                  <Download className="w-5 h-5" />
                  Download All ({results.filter(r => r.success).length})
                </Button>
              )}
              {results.filter(r => r.success).length === 1 && (
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    const successResult = results.find(r => r.success);
                    if (successResult?.downloadUrl) {
                      handleDownload(successResult.downloadUrl, successResult.title || 'audio');
                    }
                  }}
                >
                  <Download className="w-5 h-5" />
                  Download MP3
                </Button>
              )}
              <Button
                variant="glass"
                size="lg"
                onClick={handleReset}
              >
                Convert Another
              </Button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Conversion Failed</p>
                  <p className="text-sm text-muted-foreground">Please check your URL and try again</p>
                </div>
              </div>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleReset}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Supports YouTube, Vimeo, SoundCloud, and more
      </p>
    </div>
  );
};
