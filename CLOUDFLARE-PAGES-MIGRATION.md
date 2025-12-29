# Netlify → Cloudflare Pages Migration: Clean URLs Fix

## The Problem

Netlify automatically serves clean URLs: `/page` → `/page.html` (invisible rewrite).
Cloudflare Pages doesn't do this - requesting `/page` returns 404 because the file is `page.html`.

## The Fix

### Step 1: Create `functions/_middleware.js`

Create this file in your project root:

```javascript
// functions/_middleware.js
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
```

### Step 2: Create `_routes.json` (optional, improves performance)

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/images/*",
    "/assets/*",
    "/*.css",
    "/*.js",
    "/*.ico",
    "/*.png",
    "/*.jpg",
    "/*.webp",
    "/*.svg",
    "/*.woff",
    "/*.woff2"
  ]
}
```

### Step 3: Delete Netlify config files

Remove these files (they conflict with the middleware):
- `_redirects`
- `netlify.toml`

## How It Works

| Request | Action |
|---------|--------|
| `/` | Serves `index.html` (passthrough) |
| `/page` | Middleware fetches `page.html` and serves it |
| `/blog/article` | Middleware fetches `blog/article.html` and serves it |
| `/page.html` | 301 redirect to `/page` |
| `/style.css` | Passthrough (has extension) |

## Quick Commands

```bash
# Create the functions directory and middleware
mkdir -p functions

cat > functions/_middleware.js << 'EOF'
export async function onRequest(context) {
  const url = new URL(context.request.url);
  let pathname = url.pathname;

  if (pathname.endsWith('.html')) {
    const cleanPath = pathname.slice(0, -5);
    return Response.redirect(new URL(cleanPath + url.search, url.origin), 301);
  }

  if (pathname === '/') return context.next();

  const lastSegment = pathname.split('/').pop();
  if (lastSegment.includes('.')) return context.next();
  if (pathname.endsWith('/')) return context.next();

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

  return context.next();
}
EOF

# Create routes.json
cat > _routes.json << 'EOF'
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/images/*", "/assets/*", "/*.css", "/*.js", "/*.ico", "/*.png", "/*.jpg", "/*.webp", "/*.svg", "/*.woff", "/*.woff2"]
}
EOF

# Remove Netlify files
rm -f _redirects netlify.toml

# Commit and push
git add -A
git commit -m "Add Cloudflare Pages middleware for clean URLs"
git push
```

## Troubleshooting

**Links redirect to wrong page:** Delete `_redirects` file - it conflicts with middleware.

**404 errors:** Check that the `.html` file exists at the expected path.

**Static assets not loading:** Add the file extension to the `exclude` list in `_routes.json`.
