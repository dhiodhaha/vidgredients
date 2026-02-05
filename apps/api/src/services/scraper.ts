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
 * Extract transcript from video using Scrapecreators API
 */
export async function extractTranscript(
  url: string,
  apiKey: string
): Promise<ScrapecreatorResponse> {
  const platform = detectPlatform(url);

  const response = await fetch('https://api.scrapecreators.com/v1/transcript', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Scrapecreators API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as {
    transcript?: string;
    title?: string;
    thumbnail?: string;
  };

  if (!data.transcript) {
    throw new Error('No transcript found in video');
  }

  return {
    transcript: data.transcript,
    title: data.title ?? null,
    thumbnail: data.thumbnail ?? '',
    platform,
  };
}
