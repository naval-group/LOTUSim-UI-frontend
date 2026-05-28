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
 * - Displays vessels as markers (`VesselMarkerComponent`).
 * - Supports right-click context menu to add new vessels.
 * - Integrates `AddVesselMenu` dialog for vessel configuration.
 *
 */

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, LayersControl, useMapEvent, useMap } from 'react-leaflet';
import type L from 'leaflet';
import { Fab, Box, Typography } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const FlyToController: React.FC<{ target: [number, number] | null }> = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 17);
  }, [target, map]);
  return null;
};

import { VesselPosition, Agent } from '../../types';
import { VesselMarkerComponent } from './MapMarker';
import { AddVesselMenu } from './addVessel';
import { MapContextMenu } from './MapContextMenu';
import { WaypointMapLayer } from './WaypointMapLayer';
import 'leaflet/dist/leaflet.css';
import '../../App.css';

const { BaseLayer } = LayersControl;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  VesselPosition: Map<string, VesselPosition>;
  addVesselFn: (agent: Agent) => void;
  removeVesselFn?: (vesselName: string) => void;
  flyTo?: [number, number] | null;
  onWaypointPickModeChange?: (active: boolean) => void;
}

type WaypointPickData = {
  waypoints: { lat: number; lng: number }[];
  loop: boolean;
  onDone: (wps: { lat: number; lng: number }[]) => void;
};

export interface MapHandle {
  enterWaypointPickMode: (
    wps: { lat: number; lng: number }[],
    loop: boolean,
    onDone: (wps: { lat: number; lng: number }[]) => void
  ) => void;
}

export const Map = forwardRef<MapHandle, MapProps>(({
  center = [1.2421, 103.7198],
  zoom = 15,
  VesselPosition,
  addVesselFn,
  removeVesselFn,
  flyTo,
  onWaypointPickModeChange,
}, ref) => {
  const [currentZoom, setCurrentZoom] = useState(zoom);

  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddVesselMenuOpen, setIsAddVesselMenuOpen] = useState(false);
  const [isHeadingDragMode, setIsHeadingDragMode] = useState(false);
  const [initialHeading, setInitialHeading] = useState(0);
  const dragStartRef = useRef<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [waypointPickData, setWaypointPickData] = useState<WaypointPickData | null>(null);
  const [isPlacingWaypoint, setIsPlacingWaypoint] = useState(false);

  const handleEnterWaypointPickMode = (
    initialWaypoints: { lat: number; lng: number }[],
    loop: boolean,
    onDone: (wps: { lat: number; lng: number }[]) => void
  ) => {
    setWaypointPickData({ waypoints: initialWaypoints, loop, onDone });
    setIsPlacingWaypoint(false);
  };

  useImperativeHandle(ref, () => ({ enterWaypointPickMode: handleEnterWaypointPickMode }));

  useEffect(() => {
    onWaypointPickModeChange?.(waypointPickData !== null);
  }, [waypointPickData]); // eslint-disable-line react-hooks/exhaustive-deps

  const ZoomTracker = () => {
    useMapEvent('zoom', (e) => setCurrentZoom((e.target as L.Map).getZoom()));
    return null;
  };

  const handleCloseContextMenu = () => setContextMenuPosition(null);

  const openAddVesselMenu = () => {
    setIsHeadingDragMode(true);
    setContextMenuPosition(null);
  };

  const closeAddVesselMenu = () => {
    setIsAddVesselMenuOpen(false);
    setContextMenuPosition(null);
  };

  const addVessel = (agent: Agent) => {
    addVesselFn(agent);
    closeAddVesselMenu();
  };

  const CursorController = () => {
    const map = useMap();
    useEffect(() => {
      const container = map.getContainer();
      container.style.cursor = isPlacingWaypoint ? 'crosshair' : '';
      return () => { container.style.cursor = ''; };
    }, [isPlacingWaypoint, map]); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
  };

  const MouseCoordinates = () => {
    useMapEvent('mousemove', (e: { latlng: { lat: number; lng: number } }) =>
      setMouseCoords(e.latlng)
    );
    useMapEvent('mouseout', () => setMouseCoords(null));
    return null;
  };

  const HeadingDragHandler = () => {
    const map = useMap();

    useEffect(() => {
      if (isHeadingDragMode) map.dragging.disable();
      else map.dragging.enable();
      return () => {
        map.dragging.enable();
      };
    }, [isHeadingDragMode, map]); // eslint-disable-line react-hooks/exhaustive-deps

    useMapEvent('mousedown', (e: { latlng: { lat: number; lng: number } }) => {
      setClickedLatLng(e.latlng);
      if (!isHeadingDragMode) return;
      dragStartRef.current = e.latlng;
    });

    useMapEvent('mouseup', (e: { latlng: { lat: number; lng: number } }) => {
      if (!isHeadingDragMode || !dragStartRef.current) return;
      const dx = e.latlng.lng - dragStartRef.current.lng;
      const dy = e.latlng.lat - dragStartRef.current.lat;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const heading = dist > 0.00001 ? (90 - (Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360 : 0;
      setInitialHeading(heading);
      setIsHeadingDragMode(false);
      setIsAddVesselMenuOpen(true);
      dragStartRef.current = null;
    });

    return null;
  };

  const MapRightClickHandler = () => {
    useMapEvent('contextmenu', (e: L.LeafletMouseEvent) => {
      if (waypointPickData) return;
      const mapBounds = mapRef.current?.getBoundingClientRect();
      if (mapBounds) {
        setClickedLatLng(e.latlng);
        setContextMenuPosition({
          x: e.originalEvent.clientX - mapBounds.left,
          y: e.originalEvent.clientY - mapBounds.top,
        });
      }
    });
    return null;
  };


  return (
    <div
      ref={mapRef}
      style={{
        position: 'relative',
        height: '100%',
        cursor: isHeadingDragMode || isPlacingWaypoint ? 'crosshair' : undefined,
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        maxZoom={21} // ← raised from 18
        worldCopyJump={true}
        style={{ height: '100%', width: '100%' }}
      >
        <LayersControl position="bottomright">
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              maxNativeZoom={19}
              maxZoom={21}
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/en-us/arcgis/about-arcgis/overview">Esri</a>'
              maxNativeZoom={18}
              maxZoom={21}
            />
          </BaseLayer>
        </LayersControl>

        <ZoomTracker />
        <FlyToController target={flyTo ?? null} />
        <CursorController />
        <HeadingDragHandler />
        <MapRightClickHandler />
        <MouseCoordinates />
        {waypointPickData && (
          <WaypointMapLayer
            waypoints={waypointPickData.waypoints}
            loop={waypointPickData.loop}
            color="red"
            isPlacing={isPlacingWaypoint}
            onPlace={(lat, lng) => {
              setWaypointPickData((prev) =>
                prev ? { ...prev, waypoints: [...prev.waypoints, { lat, lng }] } : null
              );
              setIsPlacingWaypoint(false);
            }}
          />
        )}

        {Array.from(VesselPosition.entries()).map(([name, vessel]) => (
          <VesselMarkerComponent
            key={name}
            vessel={vessel}
            zoomLevel={currentZoom}
            onRemove={removeVesselFn}
          />
        ))}

        {contextMenuPosition && (
          <MapContextMenu
            position={contextMenuPosition}
            onAdd={openAddVesselMenu}
            onClose={handleCloseContextMenu}
          />
        )}

        {isAddVesselMenuOpen && (
          <AddVesselMenu
            open={isAddVesselMenuOpen && !waypointPickData}
            onClose={closeAddVesselMenu}
            onAddVessel={addVessel}
            clickedLatLng={clickedLatLng}
            initialHeading={initialHeading}
            onEnterWaypointPickMode={handleEnterWaypointPickMode}
          />
        )}
      </MapContainer>

      {isHeadingDragMode && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#e2e8f0',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 13,
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap',
          }}
        >
          Click and drag to set vessel heading
        </div>
      )}

      {isPlacingWaypoint && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#e2e8f0',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 13,
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap',
          }}
        >
          Click on the map to place waypoint
        </div>
      )}

      {waypointPickData && (
        <Box
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            zIndex: 1000,
          }}
        >
          <Fab
            variant="extended"
            color={isPlacingWaypoint ? 'secondary' : 'primary'}
            onClick={() => setIsPlacingWaypoint(true)}
            disabled={isPlacingWaypoint}
            sx={{ whiteSpace: 'nowrap' }}
          >
            <AddLocationAltIcon sx={{ mr: 1 }} />
            {isPlacingWaypoint ? 'Click map…' : 'Add Waypoint'}
          </Fab>

          {waypointPickData.waypoints.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#e2e8f0',
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                pointerEvents: 'none',
              }}
            >
              {waypointPickData.waypoints.length}{' '}
              {waypointPickData.waypoints.length === 1 ? 'waypoint' : 'waypoints'}
            </Typography>
          )}

          <Fab
            variant="extended"
            color="success"
            size="small"
            onClick={() => {
              waypointPickData.onDone(waypointPickData.waypoints);
              setWaypointPickData(null);
              setIsPlacingWaypoint(false);
            }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            <CheckIcon sx={{ mr: 0.5 }} />
            Done
          </Fab>

          <Fab
            variant="extended"
            size="small"
            onClick={() => {
              setWaypointPickData(null);
              setIsPlacingWaypoint(false);
            }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            <CloseIcon sx={{ mr: 0.5 }} />
            Cancel
          </Fab>
        </Box>
      )}

      {mouseCoords && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.75)',
            color: '#e2e8f0',
            padding: '5px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontFamily: 'monospace',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap',
          }}
        >
          {mouseCoords.lat.toFixed(6)}, {(((mouseCoords.lng % 360) + 540) % 360 - 180).toFixed(6)}
        </div>
      )}
    </div>
  );
});
