'use client';

import 'react-map-gl/dist/style.css';
import Map, {
  Marker,
  ViewState,
  ViewStateChangeEvent,
  MapRef,
} from 'react-map-gl';

import { useMemo, useRef, useState, useEffect } from 'react';
import type { Feature, Point } from 'geojson';
import Supercluster, { ClusterFeature } from 'supercluster';
import { Resource } from '@/types/disaster.types';

type Props = {
  resources: Resource[];
};

type ResourceClusterProperties = {
  cluster: boolean;
  resId: string;
  type: string;
  name: string;
  description: string;
  location: string;
};

export default function DisasterResourcesMap({ resources }: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [viewport, setViewport] = useState<ViewState>({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const points: Feature<Point, ResourceClusterProperties>[] = useMemo(() => {
    return resources
      .filter(
        (r) =>
          r.location &&
          typeof (r.location as { lat?: number; lng?: number }).lat === 'number' &&
          typeof (r.location as { lat?: number; lng?: number }).lng === 'number'
      )
      .map((res) => {
        let loc: { lat: number; lng: number };
        if ('lat' in res.location && 'lng' in res.location) {
          loc = res.location as { lat: number; lng: number };
        } else if (
          typeof res.location === 'object' &&
          'type' in res.location &&
          res.location.type === 'Point' &&
          Array.isArray((res.location as { type: string; coordinates: [number, number] }).coordinates)
        ) {
          const coords = (res.location as { type: string; coordinates: [number, number] }).coordinates;
          loc = { lng: coords[0], lat: coords[1] };
        } else {
          // fallback to 0,0 if location is invalid
          loc = { lat: 0, lng: 0 };
        }
        return {
          type: 'Feature',
          properties: {
            cluster: false,
            resId: res.id,
            type: res.type,
            name: res.name,
            description: res.description ?? '',
            location: res.location_name ?? '',
          },
          geometry: {
            type: 'Point',
            coordinates: [loc.lng, loc.lat],
          },
        };
      });
  }, [resources]);

  const cluster = useMemo(() => {
    const index = new Supercluster<ResourceClusterProperties>({
      radius: 60,
      maxZoom: 16,
    });
    index.load(points);
    return index;
  }, [points]);

  const clusters = useMemo(() => {
    if (!bounds) return [];
    return cluster.getClusters(bounds, Math.round(viewport.zoom));
  }, [cluster, bounds, viewport.zoom]);

  const getEmoji = (type: string) => {
    const map: Record<string, string> = {
      shelter: '🏠',
      medical: '🏥',
      water: '💧',
      food: '🍲',
      volunteer: '🙋‍♂️',
      other: '📦',
    };
    return map[type] || '📍';
  };

  if (!isMounted) return null;

  return (
    <Map
      {...viewport}
      ref={(ref) => {
        mapRef.current = ref;
        const internalMap = ref?.getMap();
        if (internalMap) {
          const b = internalMap.getBounds();
          if (b) {
            setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
          }
        }
      }}
      onMove={(evt: ViewStateChangeEvent) => {
        setViewport(evt.viewState);
        const internalMap = mapRef.current?.getMap();
        if (internalMap) {
          const b = internalMap.getBounds();
          if (b) {
            setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
          }
        }
      }}
      mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_TOKEN}`}
      style={{ width: '100%', height: 400 }}
    >
      {clusters.map((clusterItem) => {
        const [longitude, latitude] = clusterItem.geometry.coordinates;
        const props = clusterItem.properties as ResourceClusterProperties & {
          point_count?: number;
        };

        if (props.cluster) {
          return (
            <Marker
              key={`cluster-${(clusterItem as ClusterFeature<ResourceClusterProperties>).id}`}
              longitude={longitude}
              latitude={latitude}
              onClick={() => {
                const clusterId = (clusterItem as ClusterFeature<ResourceClusterProperties>).id;
                if (typeof clusterId === 'number') {
                  const expansionZoom = Math.min(
                    cluster.getClusterExpansionZoom(clusterId),
                    20
                  );
                  setViewport({
                    ...viewport,
                    longitude,
                    latitude,
                    zoom: expansionZoom,
                    bearing: 0,
                    pitch: 0,
                    padding: { top: 0, bottom: 0, left: 0, right: 0 },
                  });
                }
              }}
            >
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-md cursor-pointer">
                {props.point_count}
              </div>
            </Marker>
          );
        }

        return (
          <Marker key={`res-${props.resId}`} longitude={longitude} latitude={latitude}>
            <div title={props.name} style={{ fontSize: '1.4rem' }}>
              {getEmoji(props.type)}
            </div>
          </Marker>
        );
      })}
    </Map>
  );
}
