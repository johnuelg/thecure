

# Fix Published Site Favicon (White Square)

## Root Cause

The published site at `thecure.lovable.app` shows a white square favicon because:

1. **`index.html` points to `/placeholder.svg`** — Lovable's default 1200x1200 gray placeholder image with a camera icon. This is what browsers initially render as the tab icon.
2. **`/favicon.ico` still exists on the published site** — it returns a PNG blob (the old Lovable default). Browsers automatically request `/favicon.ico` even before processing `<link>` tags, and this file takes priority.
3. **The dynamic hook runs too late** — by the time `useDynamicFavicon` fetches the real favicon URL from Supabase and injects it via JavaScript, Chrome has already cached the placeholder/default icon. Chrome stores favicons in a separate SQLite database and is extremely reluctant to re-check them.

## Plan

### Step 1: Remove the placeholder SVG and replace with a transparent 1x1 fallback

- Delete `public/placeholder.svg` (the 1200x1200 Lovable default image that shows as a gray/white square)
- Create a tiny inline SVG data URI in `index.html` as the initial favicon — a transparent 1x1 pixel so nothing ugly shows during the brief moment before the dynamic hook runs:
  ```html
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>" type="image/svg+xml" />
  ```
- Remove the duplicate `<link rel="shortcut icon">` tag

### Step 2: Update the fallback in `useDynamicFavicon.ts`

- Change `FALLBACK_FAVICON` from `'/placeholder.svg'` to the same transparent SVG data URI, so even if the Supabase fetch fails, users never see the Lovable placeholder
- Add a `crossOrigin` attribute when fetching the favicon to handle CORS properly with Supabase storage

### Step 3: Fix image references elsewhere

- Search for any other references to `/placeholder.svg` in the codebase (e.g., the `onError` handler in `ImageUpload.tsx`) and replace with an appropriate fallback

## Technical Details

- **Files modified**: `index.html`, `src/hooks/useDynamicFavicon.ts`, `src/components/admin/ImageUpload.tsx`
- **File deleted**: `public/placeholder.svg`
- No database changes needed
- The dynamic hook will continue to work as before — fetching the admin-configured favicon from Supabase and injecting it as a data URL. The only difference is the initial/fallback icon will be invisible instead of showing a white square.

