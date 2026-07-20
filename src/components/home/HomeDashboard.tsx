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
 * ******************************   HOME DASHBOARD   **********************************
 * ************************************************************************************
 *
 * This module contains the main dashboard component of the Lotusim application.
 *
 * Features:
 * - Displays the top `Header` and side navigation `SideBar`.
 * - Renders the interactive `Map` with vessel positions.
 * - Fetches available scenarios and instances from the backend.
 * - Manages WebSocket connection to receive real-time `VesselPosition`.
 * - Supports spawning vessels on selected instances.
 *
 */

import Header from '../common/Header';
import { Map as MapComponent } from '../map/Map';
import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';
import SideBar from './Sidebar';
import { listScenarios, listInstances, sendMASCommand, saveInstance } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { WebSocketClient } from '../../services/websocketClient';
import { Agent, MASCmd, VesselPosition } from '../../types';

/**
 * HomeDashboard Component
 *
 * The main dashboard view for Lotusim.
 *
 * Responsibilities:
 * - Show the world map
 * - Fetches scenarios and instances from the backend APIs, select scenario and instance.
 * - Launch scenario in selected instance.
 * - Fetch and display vessel data on the map based on selected instance.
 * - Establishes and manages a persistent WebSocket connection for live updates.
 * - Allows for spawning vessels on the map.
 */

export const HomeDashboard: React.FC = () => {
  // Default map center in singapore port. To change based on scenario
  const defaultCenter: [number, number] = [1.2421, 103.7198];
  const savedMapCenter = localStorage.getItem('mapCenter');
  const parsed = savedMapCenter ? JSON.parse(savedMapCenter) : null;
  const parsedCenter: [number, number] =
    Array.isArray(parsed) && parsed.length === 2 && parsed.every((v) => typeof v === 'number')
      ? (parsed as [number, number])
      : defaultCenter;

  const mapSettings = {
    center: parsedCenter,
    zoom: 14,
  };

  const [scenarios, setScenarios] = React.useState<string[]>([]);
  const [instances, setInstances] = React.useState<string[]>([]);
  const [VesselPosition, setVesselPosition] = useState<Map<string, VesselPosition>>(new Map());

  // TODO: remove the default lotusim instance selected
  const [selectedInstance, setSelectedInstance] = useState<string>('lotusim');
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const { showError } = useToast();

  /**
   * Updates the vessel data state when new data is received from the WebSocket.
   *
   * @param newData - Array of `VesselPosition` objects received.
   */
  const updateVesselPosition = (newData: VesselPosition[]) => {
    setVesselPosition(new Map(newData.map((v) => [v.vesselName, v])));
  };

  /**
   * Fetches scenarios and instances from the backend API.
   */
  const fetchData = React.useCallback(async () => {
    try {
      const scenarios = await listScenarios();
      const instances = await listInstances();
      setInstances(instances);
      setScenarios(scenarios);
      // Temp placeholder until instances feature is created
      setSelectedInstance('lotusim');
      saveInstance('lotusim');
    } catch (_err) {
      console.error('Error getting instance or scenario');
    }
  }, [showError]);

  React.useEffect(() => {
    const saved = localStorage.getItem('mapCenter');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 2 && parsed.every((v) => typeof v === 'number')) {
          setFlyTo(parsed as [number, number]);
        }
      } catch { /* ignore */ }
    }
  }, []);

  // Websocket is persistent
  const ws_client = useRef<WebSocketClient | null>(null);
  React.useEffect(() => {
    fetchData();
    if (!ws_client.current) {
      ws_client.current = new WebSocketClient(updateVesselPosition);
      ws_client.current.connect();
    }
    return () => {
      ws_client.current?.disconnect();
      ws_client.current = null;
    };
  }, [selectedInstance, fetchData]);

  /**
   * Sends a command to spawn a new vessel on the selected instance.
   *
   * @param model_name - Name of the vessel model to spawn.
   * @param vessel_name - Name of the vessel.
   * @param position - Latitude, longitude, altitude, and heading.
   * @param lotus_param - String containing SDF parameters for the vessel.
   */
  const spawnVessel = async (
    agent: Agent
  ): Promise<void> => {
    const cmd: MASCmd = {
      cmdType: 0,
      sdfString: agent.generateLotusParamXML(),
      modelName: agent.model,
      vesselName:agent.name,
      entity: 0, // Placeholder. Not used
      vesselPosition: { // Placeholder. Not used
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
      },
      geoPoint: {
        latitude: agent.position.latitude ?? 0,
        longitude: agent.position.longitude ?? 0,
        altitude: agent.position.altitude ?? 0,
      },
      heading: agent.heading ?? 0,
    };

    try {
      const ok = await sendMASCommand(selectedInstance, cmd);
      if (!ok) showError(`Failed to spawn vessel: ${agent.name}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : `Failed to spawn vessel: ${agent.name}`);
    }
  };

  const deleteVessel = async (vessel_name: string): Promise<void> => {
    const cmd: MASCmd = {
      cmdType: 1,
      vesselName: vessel_name,
    };
    try {
      const ok = await sendMASCommand(selectedInstance, cmd);
      if (!ok) showError(`Failed to delete vessel: ${vessel_name}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : `Failed to delete vessel: ${vessel_name}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <Header title="Lotusim" />

      <div style={{ display: 'flex', flexGrow: 1, height: 'calc(100vh - 64px)' }}>
        <SideBar
          scenarios={scenarios}
          instances={instances}
          selectedInstance={selectedInstance}
          setSelectedInstance={setSelectedInstance}
          vesselPositions={VesselPosition}
          onFlyTo={setFlyTo}
        />

        <Box sx={{ flexGrow: 1 }}>
          <MapComponent
            {...mapSettings}
            VesselPosition={VesselPosition}
            addVesselFn={spawnVessel}
            removeVesselFn={deleteVessel}
            flyTo={flyTo}
          />
        </Box>
      </div>
    </div>
  );
};
