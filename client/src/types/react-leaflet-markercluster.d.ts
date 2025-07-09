declare module '@changey/react-leaflet-markercluster' {
  import { MarkerClusterGroupOptions } from 'leaflet';
  import { ComponentType } from 'react';
  import { LayerGroupProps } from 'react-leaflet';

  const MarkerClusterGroup: ComponentType<LayerGroupProps & MarkerClusterGroupOptions>;
  export default MarkerClusterGroup;
}
