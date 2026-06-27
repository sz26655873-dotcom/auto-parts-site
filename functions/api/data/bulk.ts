/**
 * /api/data/bulk — POST endpoint for batch data import.
 *
 * Accepts a JSON body with optional products, contactInfo, and companyInfo
 * fields, writes them all to KV in a single operation, and updates
 * last_modified. Requires admin authentication.
 */

import { isAuthenticated, unauthorizedResponse } from '../_auth';
import { kvPutBulk } from '../../lib/kv';

/** Common JSON response headers — includes cache-control to prevent CDN caching. */
const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

export async function onRequestPost(context: any): Promise<Response> {
  // Auth check
  if (!isAuthenticated(context.request, context.env)) {
    return unauthorizedResponse();
  }

  const kv = context.env.PRODUCTS_DATA as KVNamespace;

  try {
    const body = await context.request.json() as Record<string, any>;

    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'Request body must be a JSON object' }),
        { status: 400, headers: JSON_HEADERS },
      );
    }

    // Build the data map for kvPutBulk — only include provided keys
    const dataMap: Record<string, any> = {};

    if (body.products && Array.isArray(body.products)) {
      dataMap.products = body.products;
    }
    if (body.contactInfo && typeof body.contactInfo === 'object') {
      dataMap.contact_info = body.contactInfo;
    }
    if (body.companyInfo && typeof body.companyInfo === 'object') {
      dataMap.company_info = body.companyInfo;
    }

    if (Object.keys(dataMap).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No valid data fields provided. Expected: products, contactInfo, or companyInfo' }),
        { status: 400, headers: JSON_HEADERS },
      );
    }

    // Also write data_version if provided
    if (typeof body.version === 'number') {
      dataMap.data_version = body.version;
    }

    const result = await kvPutBulk(kv, dataMap);
    return new Response(
      JSON.stringify({ success: true, lastModified: result.lastModified }),
      { status: 200, headers: JSON_HEADERS },
    );
  } catch (err: any) {
    console.error('[Data Bulk API] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || '批量写入失败' }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
}
