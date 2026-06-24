/**
 * Emotion cache instances for LTR and RTL rendering.
 * The RTL cache uses stylis-plugin-rtl to automatically flip
 * CSS directional properties (margin, padding, left/right, etc.)
 * when Arabic or other RTL languages are active.
 */
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

/** Cache for left-to-right languages (English, Chinese, Russian, Korean). */
export const ltrCache = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

/** Cache for right-to-left languages (Arabic). */
export const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});
