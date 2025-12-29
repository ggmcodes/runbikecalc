export async function onRequest(context) {
  const url = new URL(context.request.url);
  let pathname = url.pathname;

  // 1. Redirect .html URLs to clean URLs (301)
  if (pathname.endsWith('.html')) {
    const cleanPath = pathname.slice(0, -5);
    return Response.redirect(new URL(cleanPath + url.search, url.origin), 301);
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
      // Clone the response with correct headers
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
