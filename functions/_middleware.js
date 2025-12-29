export async function onRequest(context) {
  const url = new URL(context.request.url);
  let pathname = url.pathname;

  // 1. Redirect .html URLs to clean URLs (301)
  if (pathname.endsWith('.html')) {
    const cleanPath = pathname.slice(0, -5);
    return Response.redirect(new URL(cleanPath + url.search, url.origin), 301);
  }

  // 2. Skip if root, has extension, or is a known directory
  if (pathname === '/' ||
      pathname.includes('.') ||
      pathname.endsWith('/')) {
    return context.next();
  }

  // 3. Try to fetch pathname.html
  try {
    const htmlUrl = new URL(pathname + '.html', url.origin);
    const response = await context.env.ASSETS.fetch(htmlUrl);

    if (response.ok) {
      return new Response(response.body, {
        headers: response.headers,
        status: 200
      });
    }
  } catch (e) {
    // Fall through to next()
  }

  // 4. Fallback to original request
  return context.next();
}
