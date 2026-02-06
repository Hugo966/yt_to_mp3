import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioWave } from "./AudioWave";
import { Link2, Download, Loader2, Music, CheckCircle2, List, AlertCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";

type ConversionState = "idle" | "validating" | "processing" | "ready" | "error";

interface ConversionResult {
  id: string;
  filename: string;
  title: string;
  size: number | null;
  duration: string | null;
  success: boolean;
  error: string | null;
  wasSearch: boolean;
  originalInput: string;
}
type InputMode = "single" | "batch" | "search";

export const ConversionCard = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<InputMode>("single");
  const [state, setState] = useState<ConversionState>("idle");
  const [results, setResults] = useState<ConversionResult[]>([]);
  const { toast } = useToast();

  const inputList = input.split("\n").filter((item) => item.trim());
  const inputCount = inputList.length;
  
  // Helper function to detect if a string is a URL
  const isUrl = (text: string) => {
    return /^https?:\/\//i.test(text.trim());
  };

  const handleConvert = async () => {
    if (!input.trim()) {
      toast({
        title: mode === "search" ? "Please enter a search query" : "Please enter a URL",
        description: mode === "single" 
          ? "Paste a valid video URL to convert to MP3"
          : mode === "search"
          ? "Enter a search query (e.g., 'Aitana - En El Coche')"
          : "Paste one or more URLs or search queries (one per line)",
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
      // Separate inputs into URLs and search queries
      let urls: string[] = [];
      let searchQueries: string[] = [];
      
      if (mode === "search") {
        // In search mode, treat all inputs as search queries
        searchQueries = inputList;
      } else if (mode === "batch") {
        // In batch mode, detect URLs vs search queries
        inputList.forEach(item => {
          if (isUrl(item)) {
            urls.push(item);
          } else {
            searchQueries.push(item);
          }
        });
      } else {
        // In single mode, detect if it's a URL or search query
        if (isUrl(input)) {
          urls = [input];
        } else {
          searchQueries = [input];
        }
      }

      const response = await fetch(API_ENDPOINTS.convert, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls, searchQueries }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Conversion failed');
      }

      const data = await response.json();

      if (data.results) {
        setResults(data.results);
        const successCount = data.results.filter((r: ConversionResult) => r.success).length;
        
        if (successCount > 0) {
          setState("ready");
          toast({
            title: "Conversion complete!",
            description: successCount === inputList.length 
              ? `${successCount} MP3 file${successCount > 1 ? 's are' : ' is'} ready to download`
              : `${successCount} of ${inputList.length} conversions succeeded`,
          });
        } else {
          setState("error");
          toast({
            title: "Conversion failed",
            description: "Could not convert any of the provided inputs. Please check and try again.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setState("error");
      toast({
        title: "Conversion failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred. Make sure the backend server is running.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (fileId: string, title: string) => {
    const downloadUrl = API_ENDPOINTS.download(fileId);
    window.open(downloadUrl, '_blank');
    toast({
      title: "Download started",
      description: `Downloading ${title}.mp3`,
    });
  };

  const handleDownloadAll = () => {
    const successfulResults = results.filter(r => r.success);
    successfulResults.forEach((result, index) => {
      setTimeout(() => {
        const downloadUrl = API_ENDPOINTS.download(result.id);
        window.open(downloadUrl, '_blank');
      }, index * 500);
    });
    toast({
      title: "Downloads started",
      description: `Downloading ${successfulResults.length} file(s)`,
    });
  };

  const handleReset = () => {
    setState("idle");
    setInput("");
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
              {mode === "single" ? "Paste your video URL below" : mode === "search" ? "Search and convert" : "Paste multiple URLs (one per line)"}
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
              onClick={() => setMode("search")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                mode === "search" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="w-3.5 h-3.5" />
              Search
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
          {mode === "search" ? (
            <Search className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
          ) : (
            <Link2 className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
          )}
          <Textarea
            placeholder={mode === "single" 
              ? "https://www.youtube.com/watch?v=..." 
              : mode === "search"
              ? "e.g., Aitana - En El Coche"
              : "https://www.youtube.com/watch?v=abc123\nhttps://www.youtube.com/watch?v=def456\nAitana - En El Coche"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn(
              "pl-12 text-base resize-none",
              mode === "single" || mode === "search" ? "min-h-[56px] py-4" : "min-h-[120px]"
            )}
            disabled={state !== "idle"}
            rows={mode === "batch" ? 4 : 1}
          />
          {mode === "batch" && inputCount > 0 && state === "idle" && (
            <div className="absolute right-4 top-4 bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded-full">
              {inputCount} item{inputCount !== 1 ? "s" : ""}
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
            {mode === "search" && inputCount > 1
              ? `Search & Convert ${inputCount} Queries`
              : mode === "batch" && inputCount > 1 
              ? `Convert ${inputCount} Items to MP3` 
              : mode === "search"
              ? "Search & Convert to MP3"
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
                    ? `Validating ${inputCount > 1 ? `${inputCount} items` : "input"}...` 
                    : `Converting ${inputCount > 1 ? `${inputCount} items` : ""} to MP3...`
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
                      <div className="flex items-center gap-2">
                        {result.success && <Music className="w-4 h-4 text-primary shrink-0" />}
                        <p className="text-sm font-medium truncate">
                          {result.success ? result.title : "Failed"}
                        </p>
                        {result.success && result.wasSearch && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/20 text-accent text-xs font-medium shrink-0">
                            <Search className="w-3 h-3" />
                            Found
                          </span>
                        )}
                      </div>
                      {result.success ? (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {result.size ? `${(result.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                          {result.duration && ` • ${result.duration}`}
                        </p>
                      ) : (
                        <p className="text-xs text-destructive">{result.error}</p>
                      )}
                    </div>
                    {result.success && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(result.id, result.title)}
                        className="shrink-0"
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
                    if (successResult) {
                      handleDownload(successResult.id, successResult.title);
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
