/**
 * useTrackView — sends a page/product view event to /api/track.
 *
 * Throttled per session: each slug is tracked at most once per
 * browser tab session (using sessionStorage).
 *
 * Usage:
 *   useTrackView('product', product.slug);  // inside ProductDetailPage
 *   useTrackView('page',    'home');      // inside HomePage
 */

import { useEffect, useRef } from 'react';

const PROXY = import.meta.env.BASE_URL || '/';

/**
 * Fire-and-forget: POST /api/track exactly once per session per slug.
 *
 * @param type - 'product' | 'page'
 * @param slug - identifier (product slug or page name)
 */
export function useTrackView(type: 'product' | 'page', slug: string): void {
  const fired = useRef(false);

  useEffect(() => {
    if (!slug || fired.current) return;

    const storageKey = `tracked:${type}:${slug}`;
    if (sessionStorage.getItem(storageKey)) return;

    fired.current = true;

    // Use sendBeacon if available (fires even if page unloads)
    const body = JSON.stringify({ type, slug });
    const url = `${PROXY}api/track`;

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      sessionStorage.setItem(storageKey, '1');
      return;
    }

    // Fallback: fetch with keepalive
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
      .then(() => sessionStorage.setItem(storageKey, '1'))
      .catch(() => {
        // silently fail — analytics should never block the UI
        fired.current = false;
      });
  }, [type, slug]);
}
