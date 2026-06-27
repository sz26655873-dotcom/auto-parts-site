/**
 * Seo component — wraps react-helmet-async <Helmet> to manage all
 * document head meta tags (title, description, canonical, Open Graph,
 * Twitter Card, keywords) in a declarative way.
 *
 * Usage:
 *   <Seo title="About" description="..." canonical="/about" />
 *   <Seo title="Home Page" isHome />  // title used as-is, no suffix
 */

import { Helmet } from 'react-helmet-async';
import { type ReactNode } from 'react';
import { buildTitle, buildCanonical, SEO_CONFIG } from '../../utils/seo';

interface SeoProps {
  /** Page title. If isHome is false, "| Altai Auto Parts" suffix is added. */
  title: string;
  /** Meta description for the page. */
  description?: string;
  /** Canonical URL path (e.g. "/about"). Converted to absolute URL. */
  canonical?: string;
  /** Open Graph image URL. Defaults to site OG image. */
  ogImage?: string;
  /** Open Graph type (e.g. "website", "article", "product"). */
  ogType?: string;
  /** Comma-separated keywords for the meta keywords tag. */
  keywords?: string;
  /** When true, the title is used verbatim without the site name suffix. */
  isHome?: boolean;
  /** Additional Helmet children (e.g. extra script tags). */
  children?: ReactNode;
}

/**
 * Renders all SEO-related head tags via react-helmet-async.
 */
function Seo({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  keywords,
  isHome = false,
  children,
}: SeoProps): JSX.Element {
  const fullTitle = isHome ? title : buildTitle(title);
  const canonicalUrl = canonical ? buildCanonical(canonical) : undefined;
  const imageUrl = ogImage || SEO_CONFIG.defaultOgImage;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={imageUrl} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={imageUrl} />

      {children}
    </Helmet>
  );
}

export default Seo;
