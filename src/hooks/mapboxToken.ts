import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';

let cachedToken: string | null = null;
let inflight: Promise<string | null> | null = null;

/**
 * Get and cache the Mapbox public token.
 * - Tries Supabase Edge Function `get-mapbox-token`
 * - Falls back to VITE_MAPBOX_PUBLIC_TOKEN if present
 * - Sets mapboxgl.accessToken once when available
 */
export async function getMapboxToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  if (typeof mapboxgl.accessToken === 'string' && mapboxgl.accessToken.length > 0) {
    cachedToken = mapboxgl.accessToken;
    return cachedToken;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) {
        console.warn('Mapbox token function error:', error);
      }
      let token = (data as any)?.token as string | undefined;

      if (!token) {
        const viteToken = (import.meta as any).env?.VITE_MAPBOX_PUBLIC_TOKEN;
        if (viteToken && viteToken !== 'undefined') token = viteToken as string;
      }

      if (token) {
        mapboxgl.accessToken = token;
        cachedToken = token;
        return token;
      }

      return null;
    } catch (e) {
      console.error('Error getting Mapbox token:', e);
      const viteToken = (import.meta as any).env?.VITE_MAPBOX_PUBLIC_TOKEN;
      if (viteToken && viteToken !== 'undefined') {
        mapboxgl.accessToken = viteToken as string;
        cachedToken = viteToken as string;
        return cachedToken;
      }
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function hasCachedMapboxToken() {
  return !!cachedToken || (typeof mapboxgl.accessToken === 'string' && mapboxgl.accessToken.length > 0);
}

export function clearMapboxTokenCache() {
  cachedToken = null;
}

/**
 * Validate that the current environment can access Mapbox styles with the token.
 * Returns false if the token is invalid or the current origin is not whitelisted.
 */
export async function validateMapboxAccess(token?: string, styleId: string = 'mapbox/streets-v12'): Promise<boolean> {
  try {
    const t = token || cachedToken || (typeof mapboxgl.accessToken === 'string' ? mapboxgl.accessToken : '');
    if (!t) return false;
    const resp = await fetch(`https://api.mapbox.com/styles/v1/${styleId}?access_token=${t}`);
    if (!resp.ok) {
      console.warn('Mapbox style check failed:', resp.status, resp.statusText);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Mapbox validation error:', e);
    return false;
  }
}

