// types/maplibre-as-mapbox.ts
// Fake `mapbox-gl` shim using MapLibre
import * as maplibregl from 'maplibre-gl';

export const maplibreAsMapbox = maplibregl as unknown as typeof import('mapbox-gl');
