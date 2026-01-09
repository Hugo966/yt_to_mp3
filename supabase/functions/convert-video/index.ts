import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls, quality = '320' } = await req.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide an array of video URLs' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${urls.length} video URL(s)`);

    // Process each URL using RapidAPI's YouTube MP3 converter
    const results = await Promise.all(
      urls.map(async (url: string, index: number) => {
        try {
          console.log(`Processing URL ${index + 1}: ${url}`);
          
          // Extract video ID from various YouTube URL formats
          const videoId = extractVideoId(url);
          if (!videoId) {
            return {
              url,
              success: false,
              error: 'Invalid video URL format'
            };
          }

          // Call RapidAPI YouTube MP3 converter
          const response = await fetch(
            `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
            {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY!,
                'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
              }
            }
          );

          const data = await response.json();
          console.log(`Response for ${videoId}:`, JSON.stringify(data));

          if (data.status === 'ok' && data.link) {
            return {
              url,
              success: true,
              title: data.title || 'Unknown Title',
              downloadUrl: data.link,
              duration: data.duration,
              filesize: data.filesize
            };
          } else {
            return {
              url,
              success: false,
              error: data.msg || 'Conversion failed'
            };
          }
        } catch (err) {
          console.error(`Error processing URL ${url}:`, err);
          return {
            url,
            success: false,
            error: err instanceof Error ? err.message : 'Processing failed'
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    console.log(`Completed: ${successCount}/${urls.length} successful`);

    return new Response(
      JSON.stringify({ 
        results,
        summary: {
          total: urls.length,
          successful: successCount,
          failed: urls.length - successCount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error in convert-video function:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}
