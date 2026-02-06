export type Platform = 'youtube' | 'tiktok' | 'instagram';

export interface ScrapecreatorResponse {
  transcript: string;
  title: string | null;
  thumbnail: string;
  platform: Platform;
}

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): Platform {
  const lowercaseUrl = url.toLowerCase();

  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowercaseUrl.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (lowercaseUrl.includes('instagram.com')) {
    return 'instagram';
  }

  throw new Error('Unsupported platform');
}

/**
 * Get YouTube video ID from URL
 */
function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Extract transcript from video using Scrapecreators API
 */
export async function extractTranscript(
  url: string,
  apiKey: string,
  language = 'en'
): Promise<ScrapecreatorResponse> {
  const platform = detectPlatform(url);
  const baseUrl = 'https://api.scrapecreators.com';
  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  };

  let transcriptText = '';
  // Note: These endpoints might not return title/thumbnail in the transcript response.
  const title: string | null = null;
  let thumbnail = '';

  try {
    if (platform === 'tiktok') {
      const params = new URLSearchParams({
        url,
        language,
        use_ai_as_fallback: 'false', // Explicitly disable to save credits
      });

      const response = await fetch(`${baseUrl}/v1/tiktok/video/transcript?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) throw new Error(`TikTok API error: ${response.status}`);

      const data = (await response.json()) as { transcript: string };
      transcriptText = data.transcript;
    } else if (platform === 'instagram') {
      const params = new URLSearchParams({ url });

      const response = await fetch(`${baseUrl}/v2/instagram/media/transcript?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) throw new Error(`Instagram API error: ${response.status}`);

      const data = (await response.json()) as {
        success: boolean;
        transcripts: Array<{ text: string }>;
      };

      if (data.transcripts && data.transcripts.length > 0) {
        // Concatenate all transcripts (e.g. for carousels)
        transcriptText = data.transcripts.map((t) => t.text).join('\n\n');
      }
    } else if (platform === 'youtube') {
      const params = new URLSearchParams({
        url,
        language,
      });

      const response = await fetch(`${baseUrl}/v1/youtube/video/transcript?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);

      const data = (await response.json()) as {
        transcript_only_text: string;
      };

      transcriptText = data.transcript_only_text;

      // Attempt to get thumbnail for YouTube
      const videoId = getYoutubeVideoId(url);
      if (videoId) {
        thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
  } catch (error) {
    console.error(`Scrapecreators ${platform} error:`, error);
    throw new Error(
      `Failed to fetch ${platform} transcript: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  if (!transcriptText) {
    throw new Error('No transcript found');
  }

  return {
    transcript: transcriptText,
    title,
    thumbnail,
    platform,
  };
}
