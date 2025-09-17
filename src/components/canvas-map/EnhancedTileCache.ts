/**
 * Enhanced tile caching system with multiple tile providers for better map features
 */

interface TileData {
  image: HTMLImageElement;
  timestamp: number;
  loading: boolean;
  error: boolean;
}

interface TileProvider {
  name: string;
  url: (x: number, y: number, z: number) => string;
  attribution: string;
  hasLabels: boolean;
  maxZoom: number;
}

class EnhancedTileCache {
  private cache = new Map<string, TileData>();
  private readonly maxSize: number;
  private readonly maxAge: number;
  private loadingPromises = new Map<string, Promise<HTMLImageElement | null>>();
  private loggedProviders = new Set<string>();

  // Enhanced tile providers with better labeling
  private providers: Record<string, TileProvider> = {
    'osm-standard': {
      name: 'OpenStreetMap',
      url: (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
      attribution: '© OpenStreetMap contributors',
      hasLabels: true,
      maxZoom: 19
    },
    'osm-hot': {
      name: 'Humanitarian OSM',
      url: (x, y, z) => `https://tile-{s}.openstreetmap.fr/hot/${z}/${x}/${y}.png`.replace('{s}', ['a', 'b', 'c'][Math.floor(Math.random() * 3)]),
      attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
      hasLabels: true,
      maxZoom: 19
    },
    'cartodb-light': {
      name: 'CartoDB Light',
      url: (x, y, z) => `https://{s}.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`.replace('{s}', ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)]),
      attribution: '© OpenStreetMap contributors, © CARTO',
      hasLabels: true,
      maxZoom: 19
    },
    'cartodb-dark': {
      name: 'CartoDB Dark',
      url: (x, y, z) => `https://{s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`.replace('{s}', ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)]),
      attribution: '© OpenStreetMap contributors, © CARTO',
      hasLabels: true,
      maxZoom: 19
    },
    'esri-satellite': {
      name: 'Esri Satellite',
      url: (x, y, z) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
      attribution: '© Esri, Maxar, Earthstar Geographics',
      hasLabels: false,
      maxZoom: 18
    },
    'esri-labels': {
      name: 'Esri Labels',
      url: (x, y, z) => `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${z}/${y}/${x}`,
      attribution: '© Esri',
      hasLabels: true,
      maxZoom: 18
    }
  };

  constructor(maxSize = 800, maxAge = 30 * 60 * 1000) {
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  private getTileKey(x: number, y: number, z: number, provider: string): string {
    return `${provider}-${x}-${y}-${z}`;
  }

  async loadTile(x: number, y: number, z: number, mode: 'standard' | 'satellite' | 'dark' = 'standard'): Promise<HTMLImageElement | null> {
    const provider = this.getProviderForMode(mode);
    const key = this.getTileKey(x, y, z, provider);
    
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && !cached.error && (Date.now() - cached.timestamp) < this.maxAge) {
      return cached.image;
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    // Create loading promise
    const loadingPromise = this.createLoadingPromise(x, y, z, provider, key);
    this.loadingPromises.set(key, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadingPromises.delete(key);
      return result;
    } catch (error) {
      this.loadingPromises.delete(key);
      return null;
    }
  }

  private getProviderForMode(mode: 'standard' | 'satellite' | 'dark'): string {
    switch (mode) {
      case 'satellite':
        return 'esri-satellite';
      case 'dark':
        return 'cartodb-dark';
      default:
        return 'osm-standard'; // Default to resilient OSM standard provider
    }
  }

  private createLoadingPromise(x: number, y: number, z: number, provider: string, key: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Set loading state
      this.cache.set(key, {
        image: img,
        timestamp: Date.now(),
        loading: true,
        error: false
      });

      img.onload = () => {
        this.cache.set(key, {
          image: img,
          timestamp: Date.now(),
          loading: false,
          error: false
        });
        this.cleanupCache();
        resolve(img);
      };

      img.onerror = () => {
        // Try fallback provider for failed tiles
        if (provider !== 'osm-standard') {
          const fallbackUrl = this.providers['osm-standard'].url(x, y, z);
          img.src = fallbackUrl;
          return; // Let the existing handlers work
        }
        
        this.cache.set(key, {
          image: img,
          timestamp: Date.now(),
          loading: false,
          error: true
        });
        resolve(null);
      };

      const tileProvider = this.providers[provider];
      if (!tileProvider) {
        resolve(null);
        return;
      }
      const url = tileProvider.url(x, y, z);
      if (!this.loggedProviders.has(provider)) {
        try { console.info('[Map] Tiles provider:', provider, '-', tileProvider.name, '| sample:', url); } catch {}
        this.loggedProviders.add(provider);
      }

      img.src = url;
    });
  }

  // Load satellite + labels overlay
  async loadSatelliteWithLabels(x: number, y: number, z: number): Promise<{ satellite: HTMLImageElement | null; labels: HTMLImageElement | null }> {
    const [satellite, labels] = await Promise.all([
      this.loadTile(x, y, z, 'satellite'),
      this.loadTileFromProvider(x, y, z, 'esri-labels')
    ]);

    return { satellite, labels };
  }

  private async loadTileFromProvider(x: number, y: number, z: number, provider: string): Promise<HTMLImageElement | null> {
    const key = this.getTileKey(x, y, z, provider);
    
    const cached = this.cache.get(key);
    if (cached && !cached.error && (Date.now() - cached.timestamp) < this.maxAge) {
      return cached.image;
    }

    const existingPromise = this.loadingPromises.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    const loadingPromise = this.createLoadingPromise(x, y, z, provider, key);
    this.loadingPromises.set(key, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadingPromises.delete(key);
      return result;
    } catch (error) {
      this.loadingPromises.delete(key);
      return null;
    }
  }

  isLoaded(x: number, y: number, z: number, mode: 'standard' | 'satellite' | 'dark' = 'standard'): boolean {
    const provider = this.getProviderForMode(mode);
    const key = this.getTileKey(x, y, z, provider);
    const cached = this.cache.get(key);
    return !!(cached && !cached.loading && !cached.error && (Date.now() - cached.timestamp) < this.maxAge);
  }

  isLoading(x: number, y: number, z: number, mode: 'standard' | 'satellite' | 'dark' = 'standard'): boolean {
    const provider = this.getProviderForMode(mode);
    const key = this.getTileKey(x, y, z, provider);
    return this.loadingPromises.has(key) || this.cache.get(key)?.loading || false;
  }

  getTile(x: number, y: number, z: number, mode: 'standard' | 'satellite' | 'dark' = 'standard'): HTMLImageElement | null {
    const provider = this.getProviderForMode(mode);
    const key = this.getTileKey(x, y, z, provider);
    const cached = this.cache.get(key);
    if (cached && !cached.error && !cached.loading) {
      return cached.image;
    }
    return null;
  }

  private cleanupCache(): void {
    if (this.cache.size <= this.maxSize) return;

    const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, entries.length - this.maxSize + 100);
    
    for (const [key] of toRemove) {
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? Array.from(this.cache.values()).filter(t => !t.error).length / this.cache.size : 0
    };
  }

  getAttribution(mode: 'standard' | 'satellite' | 'dark' = 'standard'): string {
    const provider = this.getProviderForMode(mode);
    return this.providers[provider]?.attribution || '';
  }
}

export const enhancedTileCache = new EnhancedTileCache();