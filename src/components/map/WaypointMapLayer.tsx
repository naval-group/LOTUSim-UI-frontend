/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import { CircleMarker, Polyline, Marker, useMapEvent } from 'react-leaflet';
import L, { type LeafletMouseEvent } from 'leaflet';

interface WaypointMapLayerProps {
  waypoints: { lat: number; lng: number }[];
  loop?: boolean;
  color?: string;
  isPlacing?: boolean;
  onPlace?: (lat: number, lng: number) => void;
}

export const WaypointMapLayer: React.FC<WaypointMapLayerProps> = ({
  waypoints,
  loop = false,
  color = 'red',
  isPlacing = false,
  onPlace,
}) => {
  useMapEvent('click', (e: LeafletMouseEvent) => {
    if (isPlacing && onPlace) onPlace(e.latlng.lat, e.latlng.lng);
  });

  const makeArrow = (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    key: string
  ) => {
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;
    const angle = (Math.atan2(to.lng - from.lng, to.lat - from.lat) * 180) / Math.PI;
    const icon = L.divIcon({
      html: `<svg width="24" height="24" viewBox="-12 -12 24 24" style="transform:rotate(${angle}deg);overflow:visible">
        <polygon points="0,-10 7,7 0,2 -7,7" fill="${color}" stroke="white" stroke-width="1"/>
      </svg>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    return <Marker key={key} position={[midLat, midLng]} icon={icon} interactive={false} />;
  };

  const shouldClose = loop && waypoints.length > 1;
  const linePositions = shouldClose
    ? [...waypoints, waypoints[0]].map((w) => [w.lat, w.lng] as [number, number])
    : waypoints.map((w) => [w.lat, w.lng] as [number, number]);

  const arrowSegments = shouldClose
    ? waypoints.map((wp, idx) => ({ from: wp, to: waypoints[(idx + 1) % waypoints.length] }))
    : waypoints.slice(0, -1).map((wp, idx) => ({ from: wp, to: waypoints[idx + 1] }));

  return (
    <>
      {waypoints.length >= 2 && (
        <Polyline positions={linePositions} pathOptions={{ color, weight: 2 }} />
      )}
      {arrowSegments.map((seg, idx) => makeArrow(seg.from, seg.to, `arrow-${idx}`))}
      {waypoints.map((wp, idx) => (
        <CircleMarker
          key={idx}
          center={[wp.lat, wp.lng]}
          radius={7}
          pathOptions={{ color, fillColor: color, fillOpacity: 0.85 }}
        />
      ))}
    </>
  );
};
