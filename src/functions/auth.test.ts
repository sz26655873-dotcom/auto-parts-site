/**
 * Tests for the auth helper module (functions-src/api/_auth.ts).
 *
 * Verifies:
 * - isAuthenticated returns true for valid Bearer tokens
 * - isAuthenticated returns false for missing/invalid/expired tokens
 * - unauthorizedResponse returns proper 401 JSON response
 *
 * Token format: base64(`${password}:${expiryTimestamp}`)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { isAuthenticated, unauthorizedResponse } from '../../functions-src/api/_auth';

/** Helper to create a valid auth token. */
function makeToken(password: string, expiryMs: number): string {
  return btoa(`${password}:${expiryMs}`);
}

/** Helper to create a Request with Authorization header. */
function makeRequest(token?: string): Request {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return new Request('https://www.altai.parts/api/data/products', { headers });
}

/** Default env with ADMIN_PASSWORD. */
const defaultEnv = { ADMIN_PASSWORD: 'sz135136' };

describe('_auth.ts — Authentication helper', () => {
  describe('isAuthenticated', () => {
    it('should return true for valid token with correct password and future expiry', () => {
      const futureExpiry = Date.now() + 3600000; // 1 hour from now
      const token = makeToken('sz135136', futureExpiry);
      const request = makeRequest(token);
      expect(isAuthenticated(request, defaultEnv)).toBe(true);
    });

    it('should return false for request without Authorization header', () => {
      const request = makeRequest(); // no token
      expect(isAuthenticated(request, defaultEnv)).toBe(false);
    });

    it('should return false for wrong password', () => {
      const futureExpiry = Date.now() + 3600000;
      const token = makeToken('wrongpassword', futureExpiry);
      const request = makeRequest(token);
      expect(isAuthenticated(request, defaultEnv)).toBe(false);
    });

    it('should return false for expired token', () => {
      const pastExpiry = Date.now() - 3600000; // 1 hour ago
      const token = makeToken('sz135136', pastExpiry);
      const request = makeRequest(token);
      expect(isAuthenticated(request, defaultEnv)).toBe(false);
    });

    it('should return false for malformed token (not base64)', () => {
      const request = makeRequest('not-valid-base64!!!');
      expect(isAuthenticated(request, defaultEnv)).toBe(false);
    });

    it('should return false for empty Bearer value', () => {
      const request = makeRequest('');
      expect(isAuthenticated(request, defaultEnv)).toBe(false);
    });

    it('should fall back to default password when env.ADMIN_PASSWORD is not set', () => {
      const futureExpiry = Date.now() + 3600000;
      const token = makeToken('sz135136', futureExpiry); // default password
      const request = makeRequest(token);
      const envNoPassword = {}; // no ADMIN_PASSWORD set
      expect(isAuthenticated(request, envNoPassword)).toBe(true);
    });

    it('should return false for token with non-numeric expiry', () => {
      const token = makeToken('sz135136', NaN);
      // btoa will produce something, but parseInt will return NaN
      const request = makeRequest(token);
      expect(isAuthenticated(request, defaultEnv)).toBe(false);
    });

    it('should return false for token missing expiry part', () => {
      // Token without colon separator — just password
      const token = btoa('sz135136'); // no ":" separator
      const request = makeRequest(token);
      expect(isAuthenticated(request, defaultEnv)).toBe(false);
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return 401 status', async () => {
      const response = unauthorizedResponse();
      expect(response.status).toBe(401);
    });

    it('should return JSON content type', () => {
      const response = unauthorizedResponse();
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should return error message in Chinese', async () => {
      const response = unauthorizedResponse();
      const body = await response.json();
      expect(body.error).toBe('未授权访问');
    });
  });
});
