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

import React, { useMemo } from "react";
import { VesselData } from "../common/websocket"
import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";

/**
 * MarkerComponent
 *
 * A memoized React component that renders a vessel marker on the map.
 *
 * @param vessel - Vessel data with position and heading.
 * @param zoomLevel - Current zoom level to dynamically size the marker.
 */
export const MarkerComponent: React.FC<{ vessel: VesselData; zoomLevel: number }> = React.memo(({ vessel, zoomLevel }) => {
    const getIconSize = (zoomLevel: number) => {
        const baseSize = 0.5;
        const scaledSize = baseSize + zoomLevel;
        return [scaledSize, scaledSize * 1.625];
    };

    const customIcon = useMemo(
        () =>
            new divIcon({
                iconSize: getIconSize(zoomLevel),
                iconAnchor: [16, 16],
                popupAnchor: [0, -32],
                className: "",
                html: `<div 
              class="blue-arrow-icon"
              style="
                width:${getIconSize(zoomLevel)[0]}px;
                height:${getIconSize(zoomLevel)[1]}px;
                background-image:url('sprite_medium.png');
                background-position:-6px 0px;
                background-size:251px 175px;
                transform: rotate(${vessel.pose.heading}deg);
                transform-origin: center center;
              ">
            </div>`
            }),
        [zoomLevel, vessel.pose.heading]
    );

    return (
        <Marker position={[vessel.pose.latitude, vessel.pose.longitude]} icon={customIcon}>
            <Popup>
                <strong>Vessel: {vessel.vessel_name}</strong>
                <br />
                Latitude: {vessel.pose.latitude}
                <br />
                Longitude: {vessel.pose.longitude}
                <br />
                <em>{vessel.additionalInfo || "No additional info"}</em>
            </Popup>
        </Marker>
    );
});
