import { useRef, useCallback, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import type {
  MapMemberPoint,
  MapIncidentPoint,
  MapGeofence,
  MapRoutePoint,
} from '@/types/map';
import {
  membersToGeoJSON,
  incidentsToGeoJSON,
  geofencesToGeoJSON,
  routeToGeoJSON,
  MARKER_COLORS,
} from '@/types/map';

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMapLibre() {
  const mapRef = useRef<maplibregl.Map | null>(null);

  const setMap = useCallback((map: maplibregl.Map) => {
    mapRef.current = map;
  }, []);

  // ── Member markers layer ────────────────────────────────────────────────

  const setMemberMarkers = useCallback((members: MapMemberPoint[]) => {
    const map = mapRef.current;
    if (!map) return;

    const geojson = membersToGeoJSON(members);

    if (map.getSource('members')) {
      (map.getSource('members') as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource('members', { type: 'geojson', data: geojson });

      // Unclustered points
      map.addLayer({
        id: 'members-points',
        type: 'circle',
        source: 'members',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match', ['get', 'state'],
            'normal',      MARKER_COLORS.normal,
            'warning',     MARKER_COLORS.warning,
            'urgent',      MARKER_COLORS.urgent,
            'offline',     MARKER_COLORS.offline,
            'operational', MARKER_COLORS.operational,
            MARKER_COLORS.normal,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Name labels
      map.addLayer({
        id: 'members-labels',
        type: 'symbol',
        source: 'members',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.8],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'text-color': '#374151',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
        },
      });
    }
  }, []);

  // ── Clustered member layer (for admin views) ────────────────────────────

  const setClusteredMembers = useCallback((members: MapMemberPoint[]) => {
    const map = mapRef.current;
    if (!map) return;

    const geojson = membersToGeoJSON(members);

    if (map.getSource('members-clustered')) {
      (map.getSource('members-clustered') as maplibregl.GeoJSONSource).setData(geojson);
      return;
    }

    map.addSource('members-clustered', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    // Cluster circles
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'members-clustered',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step', ['get', 'point_count'],
          '#3b82f6', 10,
          '#8b5cf6', 50,
          '#ef4444',
        ],
        'circle-radius': [
          'step', ['get', 'point_count'],
          18, 10,
          24, 50,
          32,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Cluster count labels
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'members-clustered',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
      },
    });

    // Unclustered individual points
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'members-clustered',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 7,
        'circle-color': [
          'match', ['get', 'state'],
          'normal',      MARKER_COLORS.normal,
          'warning',     MARKER_COLORS.warning,
          'urgent',      MARKER_COLORS.urgent,
          'offline',     MARKER_COLORS.offline,
          'operational', MARKER_COLORS.operational,
          MARKER_COLORS.normal,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Click cluster to zoom in
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource('members-clustered') as maplibregl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, z) => {
        if (err || z === undefined || z === null) return;
        const geom = features[0].geometry;
        if (geom.type === 'Point') {
          map.easeTo({ center: geom.coordinates as [number, number], zoom: z });
        }
      });
    });

    // Change cursor on cluster hover
    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
  }, []);

  // ── Incident markers ───────────────────────────────────────────────────

  const setIncidentMarkers = useCallback((incidents: MapIncidentPoint[]) => {
    const map = mapRef.current;
    if (!map) return;

    const geojson = incidentsToGeoJSON(incidents);

    if (map.getSource('incidents')) {
      (map.getSource('incidents') as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource('incidents', { type: 'geojson', data: geojson });

      map.addLayer({
        id: 'incidents-points',
        type: 'circle',
        source: 'incidents',
        paint: {
          'circle-radius': 10,
          'circle-color': [
            'match', ['get', 'status'],
            'active',      MARKER_COLORS.urgent,
            'resolved',    MARKER_COLORS.normal,
            'false_alarm', MARKER_COLORS.offline,
            MARKER_COLORS.urgent,
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // Pulsing ring for active incidents
      map.addLayer({
        id: 'incidents-pulse',
        type: 'circle',
        source: 'incidents',
        filter: ['==', ['get', 'status'], 'active'],
        paint: {
          'circle-radius': 18,
          'circle-color': MARKER_COLORS.urgent,
          'circle-opacity': 0.2,
          'circle-stroke-width': 0,
        },
      });
    }
  }, []);

  // ── Route line ─────────────────────────────────────────────────────────

  const setRoute = useCallback((points: MapRoutePoint[]) => {
    const map = mapRef.current;
    if (!map) return;

    const geojson = routeToGeoJSON(points);

    if (map.getSource('route')) {
      (map.getSource('route') as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource('route', { type: 'geojson', data: geojson });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });
    }
  }, []);

  // ── Geofence circles ──────────────────────────────────────────────────

  const setGeofences = useCallback((geofences: MapGeofence[]) => {
    const map = mapRef.current;
    if (!map) return;

    const geojson = geofencesToGeoJSON(geofences);

    if (map.getSource('geofences')) {
      (map.getSource('geofences') as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource('geofences', { type: 'geojson', data: geojson });

      // Render circles using the radius in meters
      // MapLibre circle-radius is in pixels, so we use a paint expression
      // that converts meters to pixels based on zoom level
      map.addLayer({
        id: 'geofence-fill',
        type: 'circle',
        source: 'geofences',
        paint: {
          'circle-radius': [
            'interpolate', ['exponential', 2], ['zoom'],
            0, 0,
            20, ['/', ['get', 'radiusM'], 0.075], // approximate meters-to-pixels at z20
          ],
          'circle-color': '#3b82f6',
          'circle-opacity': 0.1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#3b82f6',
          'circle-stroke-opacity': 0.5,
        },
      });

      // Geofence labels
      map.addLayer({
        id: 'geofence-labels',
        type: 'symbol',
        source: 'geofences',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#3b82f6',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
        },
      });
    }
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────

  useEffect(() => {
    return () => { mapRef.current = null; };
  }, []);

  // ── Utility: fit bounds to all visible points ─────────────────────────

  const fitToPoints = useCallback((points: Array<{ lat: number; lng: number }>, padding = 60) => {
    const map = mapRef.current;
    if (!map || points.length === 0) return;

    if (points.length === 1) {
      map.flyTo({ center: [points[0].lng, points[0].lat], zoom: 15, duration: 1000 });
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    points.forEach(p => bounds.extend([p.lng, p.lat]));
    map.fitBounds(bounds, { padding, duration: 1000 });
  }, []);

  return {
    setMap,
    setMemberMarkers,
    setClusteredMembers,
    setIncidentMarkers,
    setRoute,
    setGeofences,
    fitToPoints,
    getMap: () => mapRef.current,
  };
}
