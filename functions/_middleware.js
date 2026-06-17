// Consolidated duplicate pages -> canonical (301). Keyed by clean path.
const CONSOLIDATION_REDIRECTS = {
  "/blog/berlin-marathon-training-complete-guide": "/blog/berlin-marathon-training-guide-2026",
  "/blog/best-recovery-tools-guide-2026": "/blog/best-recovery-tools-2026",
  "/blog/chicago-marathon-training-guide-2026": "/blog/chicago-marathon-training-complete-guide",
  "/blog/half-marathon-training-complete-guide-2026": "/blog/half-marathon-training-guide-2025",
  "/blog/hrv-training-complete-guide": "/blog/hrv-training-complete-guide-2026",
  "/blog/lactate-threshold-training-complete-guide-2026": "/blog/lactate-threshold-training-guide-2025",
  "/blog/london-marathon-training-complete-guide": "/blog/london-marathon-training-guide-2026",
  "/blog/running-form-technique-guide-2026": "/blog/running-form-technique-complete-guide-2026",
  "/blog/running-injury-prevention-guide-2026": "/blog/running-injury-prevention-complete-guide",
  "/blog/sleep-optimization-athletes-complete-guide": "/blog/sleep-optimization-athletes-complete-guide-2026",
  "/blog/sleep-optimization-athletes-guide-2026": "/blog/sleep-optimization-athletes-complete-guide-2026",
  "/blog/running-taper-complete-guide-2026": "/blog/taper-week-strategies-complete-guide-2026",
  "/blog/taper-week-complete-guide": "/blog/taper-week-strategies-complete-guide-2026",
  "/blog/vo2-max-training-methods": "/blog/vo2-max-training-guide-2025",
  "/blog/trail-running-training-complete-guide": "/blog/trail-running-complete-guide-2026",
  "/blog/strength-training-runners-complete-guide-2026": "/blog/strength-training-for-runners-complete-guide",
  "/blog/running-weight-loss-complete-guide-2026": "/blog/running-for-weight-loss-complete-guide-2026",
  "/blog/running-for-beginners-guide-2026": "/blog/running-for-beginners-ultimate-guide-2025",
  "/blog/hydration-athletes-complete-guide": "/blog/hydration-electrolytes-complete-guide-2026",
  "/blog/running-heart-rate-zones-complete-guide-2026": "/blog/heart-rate-zones-running",
  "/blog/cycling-climbing-training-complete-guide-2026": "/blog/cycling-climbing-complete-guide-2026",
  "/blog/bike-fit-positioning-complete-guide-2026": "/blog/bike-fit-complete-guide-2026",
  "/blog/best-running-shoes-for-plantar-fasciitis-2026": "/blog/best-running-shoes-plantar-fasciitis-2026"
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  let pathname = url.pathname;

  // RETROSPEC BIKE FINDER POC — unpublished, pending the Retrospec deal/AvantLink.
  // The static files were removed from the repo but Cloudflare kept redeploying
  // stale copies, so block these paths at the edge (Functions DO deploy reliably).
  // REMOVE this block when the deal signs and the Bike Finder is relaunched.
  const RETROSPEC_BLOCK = ['/bike-finder', '/bike-finder.html', '/data/bikes.json', '/images/retrospec-logo.png'];
  const retroKey = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (RETROSPEC_BLOCK.includes(retroKey)) {
    return new Response('Not Found', { status: 404 });
  }

  // 0. Consolidation 301s — match both clean and .html forms in a single hop.
  const consolidationKey = pathname.endsWith('.html') ? pathname.slice(0, -5) : pathname;
  if (CONSOLIDATION_REDIRECTS[consolidationKey]) {
    return Response.redirect(new URL(CONSOLIDATION_REDIRECTS[consolidationKey] + url.search, url.origin), 301);
  }

  // 1. Redirect .html URLs to clean URLs (301)
  if (pathname.endsWith('.html')) {
    const cleanPath = pathname.slice(0, -5);
    // /index.html should redirect to / not /index
    const redirectPath = cleanPath === '/index' ? '/' : cleanPath;
    return Response.redirect(new URL(redirectPath + url.search, url.origin), 301);
  }

  // 1b. Redirect /index to / (301)
  if (pathname === '/index') {
    return Response.redirect(new URL('/' + url.search, url.origin), 301);
  }

  // 2. Skip if root, has file extension, or ends with slash
  if (pathname === '/') {
    return context.next();
  }

  // Check for file extensions (but not paths like /blog/post-name)
  const lastSegment = pathname.split('/').pop();
  if (lastSegment.includes('.')) {
    return context.next();
  }

  if (pathname.endsWith('/')) {
    return context.next();
  }

  // 3. Try to serve pathname.html
  try {
    const htmlUrl = new URL(pathname + '.html', url.origin);
    const modifiedRequest = new Request(htmlUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
    });

    const response = await context.env.ASSETS.fetch(modifiedRequest);

    if (response.ok) {
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...Object.fromEntries(response.headers.entries())
        }
      });
    }
  } catch (e) {
    console.error('Asset fetch error:', e);
  }

  // 4. Fallback to original request
  return context.next();
}
