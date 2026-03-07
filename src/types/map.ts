// Shared map types used across all MapLibre-powered views

// ─── Marker states ──────────────────────────────────────────────────────────

export type MarkerState = 'normal' | 'warning' | 'urgent' | 'offline' | 'operational';

export const MARKER_COLORS: Record<MarkerState, string> = {
  normal:      '#22c55e', // green
  warning:     '#f59e0b', // amber
  urgent:      '#ef4444', // red
  offline:     '#6b7280', // grey
  operational: '#3b82f6', // blue
};

// ─── Map entities ───────────────────────────────────────────────────────────

export interface MapMemberPoint {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  name?: string;
  avatarUrl?: string;
  lastSeen?: string;
  battery?: number | null;
  isPaused?: boolean;
  state: MarkerState;
}

export interface MapIncidentPoint {
  id: string;
  lat: number;
  lng: number;
  status: 'active' | 'resolved' | 'false_alarm';
  createdAt: string;
  memberName?: string;
}

export interface MapGeofence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusM: number;
  familyGroupId: string;
}

export interface MapRoutePoint {
  lat: number;
  lng: number;
  timestamp: string;
  accuracy?: number;
}

// ─── Map mode ───────────────────────────────────────────────────────────────

export type MapMode = 'overview' | 'emergency' | 'members' | 'devices';

// ─── GeoJSON helpers ────────────────────────────────────────────────────────

export function membersToGeoJSON(members: MapMemberPoint[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: members.map(m => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [m.lng, m.lat] },
      properties: {
        id: m.id,
        userId: m.userId,
        name: m.name ?? '',
        state: m.state,
        battery: m.battery ?? null,
        isPaused: m.isPaused ?? false,
        lastSeen: m.lastSeen ?? '',
      },
    })),
  };
}

export function incidentsToGeoJSON(incidents: MapIncidentPoint[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: incidents.map(i => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [i.lng, i.lat] },
      properties: {
        id: i.id,
        status: i.status,
        createdAt: i.createdAt,
        memberName: i.memberName ?? '',
      },
    })),
  };
}

export function routeToGeoJSON(points: MapRoutePoint[]): GeoJSON.FeatureCollection {
  if (points.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: points.map(p => [p.lng, p.lat]),
      },
      properties: {
        startTime: points[0].timestamp,
        endTime: points[points.length - 1].timestamp,
        pointCount: points.length,
      },
    }],
  };
}

export function geofencesToGeoJSON(geofences: MapGeofence[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: geofences.map(g => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [g.lng, g.lat] },
      properties: {
        id: g.id,
        name: g.name,
        radiusM: g.radiusM,
        familyGroupId: g.familyGroupId,
      },
    })),
  };
}

// ─── Tile styles ────────────────────────────────────────────────────────────

export const TILE_STYLES = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    style: {
      version: 8 as const,
      sources: {
        osm: {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      },
      layers: [{
        id: 'osm-tiles',
        type: 'raster' as const,
        source: 'osm',
        minzoom: 0,
        maxzoom: 19,
      }],
    },
  },
  cartoDark: {
    name: 'CartoDB Dark',
    url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
    style: {
      version: 8 as const,
      sources: {
        carto: {
          type: 'raster' as const,
          tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        },
      },
      layers: [{
        id: 'carto-tiles',
        type: 'raster' as const,
        source: 'carto',
        minzoom: 0,
        maxzoom: 19,
      }],
    },
  },
  cartoLight: {
    name: 'CartoDB Light',
    url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
    style: {
      version: 8 as const,
      sources: {
        carto: {
          type: 'raster' as const,
          tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        },
      },
      layers: [{
        id: 'carto-tiles',
        type: 'raster' as const,
        source: 'carto',
        minzoom: 0,
        maxzoom: 19,
      }],
    },
  },
};

export const DEFAULT_CENTER: [number, number] = [-73.9851, 40.7589]; // [lng, lat] — NYC
export const DEFAULT_ZOOM = 13;
