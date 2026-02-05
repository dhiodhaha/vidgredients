/**
 * Detect which video platform a URL belongs to
 */
export function detectPlatform(url: string): 'youtube' | 'tiktok' | 'instagram' | null {
  const lowercaseUrl = url.toLowerCase();

  // YouTube patterns
  if (
    lowercaseUrl.includes('youtube.com') ||
    lowercaseUrl.includes('youtu.be') ||
    lowercaseUrl.includes('youtube-nocookie.com')
  ) {
    return 'youtube';
  }

  // TikTok patterns
  if (lowercaseUrl.includes('tiktok.com') || lowercaseUrl.includes('vm.tiktok.com')) {
    return 'tiktok';
  }

  // Instagram patterns
  if (lowercaseUrl.includes('instagram.com') || lowercaseUrl.includes('instagr.am')) {
    return 'instagram';
  }

  return null;
}

/**
 * Extract video ID from a platform URL
 */
export function extractVideoId(url: string): string | null {
  const platform = detectPlatform(url);

  if (!platform) return null;

  try {
    const urlObj = new URL(url);

    switch (platform) {
      case 'youtube': {
        // youtube.com/watch?v=VIDEO_ID
        const vParam = urlObj.searchParams.get('v');
        if (vParam) return vParam;

        // youtu.be/VIDEO_ID
        if (urlObj.hostname === 'youtu.be') {
          return urlObj.pathname.slice(1);
        }

        // youtube.com/embed/VIDEO_ID
        // youtube.com/shorts/VIDEO_ID
        const pathMatch = urlObj.pathname.match(/\/(embed|shorts|v)\/([^/?]+)/);
        if (pathMatch) return pathMatch[2];

        return null;
      }

      case 'tiktok': {
        // tiktok.com/@user/video/VIDEO_ID
        const match = urlObj.pathname.match(/\/video\/(\d+)/);
        return match ? match[1] : null;
      }

      case 'instagram': {
        // instagram.com/reel/VIDEO_ID/
        // instagram.com/p/VIDEO_ID/
        const match = urlObj.pathname.match(/\/(reel|p)\/([^/]+)/);
        return match ? match[2] : null;
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Validate if a URL is a supported video URL
 */
export function isValidVideoUrl(url: string): boolean {
  const platform = detectPlatform(url);
  if (!platform) return false;

  const videoId = extractVideoId(url);
  return videoId !== null;
}
