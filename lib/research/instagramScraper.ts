// Apify Instagram Profile Scraper integratie. Pakt laatste posts van een
// publiek IG-profile zonder ToS-risico voor onze infrastructuur (Apify draagt
// het scrape-risico). Cost ~$0.001 per profile.
//
// Setup: APIFY_TOKEN env var. Aanvraag via apify.com → free tier $5 credit.

const APIFY_ENDPOINT =
  "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items";

export interface IGPost {
  imageUrl: string;
  caption: string;
  postUrl: string;
  type: "photo" | "video" | "carousel" | "reel";
  likes: number | null;
  takenAt: string | null;
}

export function isApifyEnabled(): boolean {
  return Boolean(process.env.APIFY_TOKEN);
}

/**
 * Normaliseer username uit handle, URL of @-prefix
 */
function normalizeHandle(input: string): string {
  let h = input.trim();
  // Strip URL prefix
  h = h.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  h = h.replace(/^instagram\.com\//i, "");
  // Strip @ prefix
  h = h.replace(/^@/, "");
  // Strip trailing slash + querystring
  h = h.split("/")[0].split("?")[0];
  return h.trim();
}

export async function scrapeInstagramProfile(input: {
  handle: string;
  maxPosts?: number;
}): Promise<IGPost[]> {
  const token = (process.env.APIFY_TOKEN ?? "").replace(/\s+/g, "");
  if (!token) return [];

  const username = normalizeHandle(input.handle);
  if (!username || username.length < 2) return [];

  const maxPosts = input.maxPosts ?? 12;

  const res = await fetch(`${APIFY_ENDPOINT}?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usernames: [username],
      resultsLimit: maxPosts,
      resultsType: "details",
      addParentData: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify IG scrape faalde (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = await res.json();

  // Apify response: array van profile-objects met latestPosts array
  const posts: IGPost[] = [];
  for (const item of items) {
    const latest = Array.isArray(item?.latestPosts) ? item.latestPosts : [];
    for (const post of latest) {
      const url = post?.displayUrl ?? post?.images?.[0] ?? null;
      if (!url || typeof url !== "string") continue;
      let type: IGPost["type"] = "photo";
      if (post?.type === "Video" || post?.productType === "clips") type = "reel";
      else if (post?.type === "Sidecar") type = "carousel";

      posts.push({
        imageUrl: url,
        caption: typeof post?.caption === "string" ? post.caption.slice(0, 500) : "",
        postUrl:
          typeof post?.url === "string"
            ? post.url
            : `https://instagram.com/p/${post?.shortCode ?? ""}/`,
        type,
        likes: typeof post?.likesCount === "number" ? post.likesCount : null,
        takenAt:
          typeof post?.timestamp === "string" ? post.timestamp : null,
      });
    }
  }

  return posts.slice(0, maxPosts);
}
