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

// Outline color per domain
const DOMAIN_OUTLINE_COLORS: Record<string, string> = {
  air: '#ffffff',          // air
  surface: '#000080',      // surface
  underwater: '#800080',   // underwater
} as const;

const DEFAULT_OUTLINE_COLOR = '#888888'; // fallback if domain is missing/unrecognized

type VesselDomain = keyof typeof DOMAIN_OUTLINE_COLORS;

const UNDERWATER_THRESHOLD = -10;
const AERIAL_THRESHOLD = 10;

const getDomainFromAltitude = (altitude?: number | null): VesselDomain => {
  if (altitude == null) return 'surface';
  if (altitude < UNDERWATER_THRESHOLD) return 'underwater';
  if (altitude > AERIAL_THRESHOLD) return 'air';
  return 'surface';
};

const getDomainOutlineColor = (altitude?: number | null): string => {
  return DOMAIN_OUTLINE_COLORS[getDomainFromAltitude(altitude)];
};

const formatCoordinate = (value?: number | null): string => {
  if (value == null) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(3)}°`;
};

const formatAltitude = (value?: number | null): string => {
  if (value == null) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(3)}m`;
};

const hashToHue = (key: string): number => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
};

export const getVesselFillColor = (key: string): string => `hsl(${hashToHue(key)}, 70%, 45%)`;
export const getVesselTrailColor = (key: string): string => `hsl(${hashToHue(key)}, 70%, 25%)`;

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
    const baseSize = 2;
    const scaledSize = baseSize + zoomLevel *1.5;
    return [scaledSize, scaledSize * 1.625];
  };

  const customIcon = useMemo(() => {
    const [w, h] = getIconSize(zoomLevel);
    const fillColor = getVesselFillColor(vessel.vesselName ?? '');
    const strokeColor = getDomainOutlineColor(vessel.geoPoint?.altitude);
    const strokeWidth = Math.max(2.5, w * 0.3);

    const arrowSvg = `
    <svg
        width="${w}"
        height="${h}"
        viewBox="0 0 100 150"
        xmlns="http://www.w3.org/2000/svg"
        style="overflow: visible; transform: rotate(${(vessel.heading ?? 0)}deg); transform-origin: center center;"
    >
      <path
        d="M50 0 L90 150 L50 120 L10 150 Z"
        fill="${fillColor}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="round"
      />
    </svg>`;

    return divIcon({
      iconSize: [w, h],
      iconAnchor: [w / 2, h / 2],
      popupAnchor: [0, -h / 2],
      className: '',
      html: `<div class="vessel-icon" style="width:${w}px;height:${h}px;overflow:visible;">${arrowSvg}</div>`,
    });
  }, [zoomLevel, vessel.heading, vessel.vesselName, vessel.geoPoint?.altitude]);

  if (vessel.geoPoint?.latitude == null || vessel.geoPoint?.longitude == null) return null;

  return (
    <Marker position={[vessel.geoPoint.latitude, vessel.geoPoint.longitude]} icon={customIcon}>
      <Popup minWidth={200} maxWidth={200}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            rowGap: '4px',
            alignItems: 'baseline',
          }}
        >
          <strong style={{ gridColumn: '1 / -1', marginBottom: '4px' }}>
            Vessel: {vessel.vesselName}
          </strong>

          <span>Latitude:</span>
          <span>{formatCoordinate(vessel.geoPoint.latitude)}</span>

          <span>Longitude:</span>
          <span>{formatCoordinate(vessel.geoPoint.longitude)}</span>

          <span>Altitude:</span>
          <span>{formatAltitude(vessel.geoPoint.altitude)}</span>

          <span>Heading:</span>
          <span>{formatCoordinate(vessel.heading)}</span>

          {onRemove && (
            <button
              onClick={() => onRemove(vessel.vesselName)}
              style={{
                gridColumn: '1 / -1',
                marginTop: 6,
                width: 'fit-content',
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
        </div>
      </Popup>
    </Marker>
  );
});
