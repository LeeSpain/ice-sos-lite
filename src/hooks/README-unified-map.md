# Unified Map System

## Overview
The unified map system consolidates all mapping functionality into a single, intelligent hook that automatically chooses between Mapbox and Canvas backends based on availability and preferences.

## Usage

```tsx
import { useUnifiedMap } from '@/hooks/useUnifiedMap';

function MyMapComponent() {
  const { MapView, isLoading, error, hasMapboxToken } = useUnifiedMap();

  return (
    <MapView
      className="w-full h-96"
      markers={[
        {
          id: "marker1",
          lat: 40.7589,
          lng: -73.9851,
          render: () => <div>Custom Marker</div>
        }
      ]}
      center={{ lat: 40.7589, lng: -73.9851 }}
      zoom={13}
      onMapReady={() => console.log('Map ready!')}
      showControls={true}
      interactive={true}
      preferCanvas={false} // Optional: force Canvas mode
    />
  );
}
```

## Features

### Automatic Backend Selection
- **Primary**: Mapbox with full feature set
- **Fallback**: Canvas-based map for offline/token issues
- **Smart switching**: Automatically falls back when Mapbox unavailable

### Unified Interface
- Single `MapView` component for all use cases
- Consistent marker system across backends
- Unified props interface regardless of backend

### Performance Optimized
- Automatic caching and deduplication
- Intelligent backend switching
- Memory-efficient rendering

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | CSS classes for the map container |
| `markers` | `MapMarker[]` | `[]` | Array of markers to display |
| `center` | `{lat: number, lng: number}` | - | Map center coordinates |
| `zoom` | `number` | `13` | Initial zoom level |
| `onMapReady` | `() => void` | - | Callback when map is initialized |
| `showControls` | `boolean` | `true` | Show zoom/navigation controls |
| `interactive` | `boolean` | `true` | Enable user interaction |
| `preferCanvas` | `boolean` | `false` | Force Canvas backend |

## Migration from Old Systems

### From useMapProvider
```tsx
// OLD
import { useMapProvider } from '@/hooks/useMapProvider';
const { MapView } = useMapProvider();

// NEW
import { useUnifiedMap } from '@/hooks/useUnifiedMap';
const { MapView } = useUnifiedMap();
```

### From useCanvasMap
```tsx
// OLD
import { useCanvasMap } from '@/hooks/useCanvasMap';
const { MapView } = useCanvasMap();

// NEW
import { useUnifiedMap } from '@/hooks/useUnifiedMap';
const { MapView } = useUnifiedMap();
// Add preferCanvas={true} if you want to force Canvas mode
```

## Backend Control

```tsx
const { 
  MapView, 
  switchToCanvas, 
  switchToMapbox, 
  hasMapboxToken 
} = useUnifiedMap();

// Force Canvas mode
const CanvasMap = switchToCanvas();

// Force Mapbox mode (if available)
const MapboxMap = switchToMapbox();

// Check if Mapbox is available
if (hasMapboxToken) {
  // Mapbox features available
}
```

## Updated Pages
- ✅ `MapScreen.tsx` - Emergency map with real-time tracking
- ✅ `MapDemo.tsx` - Demo family locations
- ✅ `FamilyLocationMap.tsx` - Family dashboard map

## Benefits
1. **Single Source of Truth**: One map system for entire platform
2. **Automatic Fallbacks**: Never breaks due to token issues
3. **Performance**: Intelligent caching and backend selection
4. **Consistency**: Same interface across all pages
5. **Maintainability**: One system to update and debug