/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * ************************************************************************************
 * *******************************   MARKER COMPONENT   *******************************
 * ************************************************************************************
 *
 * A reusable React Leaflet marker for visualizing a vessel in the Lotusim
 * simulation map. The marker dynamically scales with zoom level and rotates
 * based on the vessel's heading.
 *
 * Features:
 * - Renders a custom divIcon styled as a blue arrow.
 * - Scales icon size relative to current map zoom level.
 * - Rotates icon according to vessel heading (pose).
 * - Displays a popup with vessel name, coordinates, and optional info.
 *
 */

import React, { useMemo } from 'react';
import { VesselPosition } from '../../types';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';

/**
 * VesselMarkerComponent
 *
 * A memoized React component that renders a vessel marker on the map.
 *
 * @param vessel - Vessel data with position and heading.
 * @param zoomLevel - Current zoom level to dynamically size the marker.
 */
export const VesselMarkerComponent: React.FC<{
  vessel: VesselPosition;
  zoomLevel: number;
  onRemove?: (vesselName: string) => void;
}> = React.memo(({ vessel, zoomLevel, onRemove }) => {
  const getIconSize = (zoomLevel: number) => {
    const baseSize = 0.5;
    const scaledSize = baseSize + zoomLevel;
    return [scaledSize, scaledSize * 1.625];
  };

  const customIcon = useMemo(() => {
    const [w, h] = getIconSize(zoomLevel);
    // Scale sprite background proportionally with icon size so the same arrow cell
    // stays visible at every zoom level. SPRITE_CELL_W is the arrow's pixel width
    // in the sprite at the zoom level the original offsets were calibrated for (zoom 15).
    const SPRITE_CELL_W = 15.5;
    const scale = w / SPRITE_CELL_W;
    const bgW = 251 * scale;
    const bgH = 175 * scale;
    const bgX = -6 * scale;
    return divIcon({
      iconSize: [w, h],
      iconAnchor: [w / 2, h / 2],
      popupAnchor: [0, -h / 2],
      className: '',
      html: `<div
              class="blue-arrow-icon"
              style="
                width:${w}px;
                height:${h}px;
                background-image:url('/sprite_medium.png');
                background-position:${bgX}px 0px;
                background-size:${bgW}px ${bgH}px;
                transform: rotate(${(vessel.heading ?? 0)}deg);
                transform-origin: center center;
              ">
            </div>`,
    });
  }, [zoomLevel, vessel.heading]);

  if (vessel.geoPoint?.latitude == null || vessel.geoPoint?.longitude == null) return null;

  return (
    <Marker position={[vessel.geoPoint.latitude, vessel.geoPoint.longitude]} icon={customIcon}>
      <Popup>
        <strong>Vessel: {vessel.vesselName}</strong>
        <br />
        Latitude: {vessel.geoPoint.latitude}
        <br />
        Longitude: {vessel.geoPoint.longitude}
        <br />
        Altitude: {vessel.geoPoint.altitude}
        <br />
        Heading: {vessel.heading}
        <br />
        {onRemove && (
          <button
            onClick={() => onRemove(vessel.vesselName)}
            style={{
              marginTop: 6,
              color: 'red',
              background: 'none',
              border: '1px solid red',
              borderRadius: 4,
              cursor: 'pointer',
              padding: '2px 8px',
            }}
          >
            Remove
          </button>
        )}
      </Popup>
    </Marker>
  );
});
