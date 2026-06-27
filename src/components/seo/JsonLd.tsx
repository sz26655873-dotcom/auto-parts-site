/**
 * JsonLd component — injects a <script type="application/ld+json"> tag
 * into the document head via react-helmet-async.
 *
 * Usage:
 *   <JsonLd schema={buildProductSchema(product)} />
 *   <JsonLd schema={buildBreadcrumbSchema(items)} />
 */

import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  /** The Schema.org JSON-LD object to serialize and inject. */
  schema: object;
}

/**
 * Renders a JSON-LD script tag in the document head.
 */
function JsonLd({ schema }: JsonLdProps): JSX.Element {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export default JsonLd;
