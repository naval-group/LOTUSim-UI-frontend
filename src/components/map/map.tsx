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
 * ***********************************   MAP   ****************************************
 * ************************************************************************************
 *
 * A React Leaflet-based map component for the Lotusim simulation dashboard.
 * Provides visualization of vessel positions, contextual interactions, and
 * integration with the Add Vessel workflow.
 *
 * Features:
 * - Renders an interactive map with OpenStreetMap and satellite tile layers.
 * - Displays vessels as markers (`MarkerComponent`).
 * - Supports right-click context menu to add new vessels.
 * - Integrates `AddVesselMenu` dialog for vessel configuration.
 *
 */

import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, LayersControl, useMapEvent } from "react-leaflet";
import { VesselData, LatLongPosition } from "../common/interfaces";
import { MarkerComponent } from "./mapMarker";
import { AddVesselMenu } from "./addVesselMenu";
import { MapContextMenu } from "./MapContextMenu";
import "leaflet/dist/leaflet.css";
import "../../App.css";

const { BaseLayer } = LayersControl;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  vesselData: VesselData[];
  addVesselFn: (vesselSDF: string, vesselName: string, position: LatLongPosition, lotusim_param: string) => void;
}

export const Map: React.FC<MapProps> = ({ center = [1.2421, 103.7198], zoom = 15, vesselData, addVesselFn }) => {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [vessels] = useState(vesselData);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddVesselMenuOpen, setIsAddVesselMenuOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const handleZoom = (e: any) => setCurrentZoom(e.target.getZoom());

  const handleCloseContextMenu = () => setContextMenuPosition(null);

  const openAddVesselMenu = () => {
    setIsAddVesselMenuOpen(true);
    setContextMenuPosition(null);
  }

  const closeAddVesselMenu = () => {
    setIsAddVesselMenuOpen(false);
    setContextMenuPosition(null);
  };

  const addVessel = (model_name: string, vesselName: string, position: LatLongPosition, lotusim_param: string) => {
    addVesselFn(model_name, vesselName, position, lotusim_param);
    closeAddVesselMenu();
  };

  const MapRightClickHandler = () => {
    useMapEvent('contextmenu', (e: any) => {
      const mapBounds = mapRef.current?.getBoundingClientRect();
      if (mapBounds) {
        setClickedLatLng(e.latlng);
        setContextMenuPosition({
          x: e.originalEvent.clientX - mapBounds.left,
          y: e.originalEvent.clientY - mapBounds.top
        });
      }
    });
    return null;
  };

  return (
    <div ref={mapRef} style={{ position: "relative", height: "100%" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        maxZoom={22}
        style={{ height: "100%", width: "100%" }}
        onZoom={handleZoom}
      >
        <LayersControl position="bottomright">
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/en-us/arcgis/about-arcgis/overview">Esri</a>'
            />
          </BaseLayer>
        </LayersControl>

        <MapRightClickHandler />

        {/* <MarkerComponent
          key={0}
          vessel={{
            vessel_name: "test",
            pose: {
              latitude: 1.2421,
              longitude: 103.719,
              heading: 90
            }
          }}
          zoomLevel={currentZoom}
        /> */}

        {vesselData.map((vessel, index) => {
          return (
            <MarkerComponent key={index} vessel={vessel} zoomLevel={currentZoom} />
          );
        })}


        {contextMenuPosition && (
          <MapContextMenu
            position={contextMenuPosition}
            onAdd={openAddVesselMenu}
            onClose={handleCloseContextMenu}
          />
        )}

        {isAddVesselMenuOpen && (
          <AddVesselMenu
            open={isAddVesselMenuOpen}
            onClose={closeAddVesselMenu}
            onAddVessel={addVessel}
            clickedLatLng={clickedLatLng}
          />
        )}
      </MapContainer>
    </div>
  );
};
