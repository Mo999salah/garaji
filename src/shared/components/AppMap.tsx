import type { ComponentProps, ReactNode } from 'react';
import MapView, {
  Callout,
  Marker,
  type MapPressEvent,
  type Region,
} from 'react-native-maps';

export type AppMapCoordinate = {
  latitude: number;
  longitude: number;
};

export type AppMapPressEvent = MapPressEvent;
export type AppMapRegion = Region;

export function AppMapView({
  children,
  ...props
}: ComponentProps<typeof MapView> & { children?: ReactNode }) {
  return <MapView {...props}>{children}</MapView>;
}

export function AppMapMarker(props: ComponentProps<typeof Marker>) {
  return <Marker {...props} />;
}

export function AppMapCallout(props: ComponentProps<typeof Callout>) {
  return <Callout {...props} />;
}
