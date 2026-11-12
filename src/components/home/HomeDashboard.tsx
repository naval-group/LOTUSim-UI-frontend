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
import React, { useState } from 'react';
import { Box } from '@mui/material';
import SideBar from './Sidebar';
import { listScenarios, listInstances, sendMASCommand, saveInstance, getRunningScenario } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { WebSocketClient } from '../../services/websocketClient';
import { Agent, DiagnosticLog, DiagnosticStatusLevel, LogWebSocketMessage, MASCmd, VesselPosition } from '../../types';
import { LogPanel } from './LogPanel';

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

const MAX_TRAIL_POINTS = 50;
const SHOWN_LEVELS: number[] = [DiagnosticStatusLevel.OK, DiagnosticStatusLevel.ERROR];

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

  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);
  const { showError } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<string>('');

  const [trails, setTrails] = useState<Map<string, [number, number][]>>(new Map());

  /**
   * Updates the vessel data state when new data is received from the WebSocket.
   *
   * @param newData - Array of `VesselPosition` objects received.
   */
  const updateVesselPosition = React.useCallback((newData: VesselPosition[]) => {
    setVesselPosition(new Map(newData.map((v) => [v.vesselName, v]))); 

    setTrails((prev) => {
      const next = new Map(prev);
      newData.forEach((v) => {
        if (v.geoPoint?.latitude == null || v.geoPoint?.longitude == null) return;
        const point: [number, number] = [v.geoPoint.latitude, v.geoPoint.longitude];
        const existing = next.get(v.vesselName) ?? [];
        next.set(v.vesselName, [...existing, point].slice(-MAX_TRAIL_POINTS));
      });
      return next;
    });
  },[]);

  /**
   * Clears vessels, trails and the selected scenario after "Clear Simulation".
   */
  const handleSimulationCleared = React.useCallback(() => {
    setVesselPosition(new Map());
    setTrails(new Map());
    setSelectedScenario('');
  }, []);

  /**
   * Fetches scenarios and instances from the backend API.
   */
  const fetchData = React.useCallback(async () => {
    try {
      const [scenarios, instances] = await Promise.all([listScenarios(), listInstances()]);
      setInstances(instances);
      setScenarios(scenarios);
    } catch (_err) {
      console.error('Error getting instance or scenario');
    }
  }, []);

  // load scenarios and instances once on mount
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (instances.length === 0) {
      if (selectedInstance) setSelectedInstance('');
    } else if (!instances.includes(selectedInstance)) {
      setSelectedInstance(instances[0]);
    }
  }, [instances, selectedInstance]);

  React.useEffect(() => {
    if (!selectedInstance) {
      setSelectedScenario('');
      return;
    }
    let cancelled = false;
    getRunningScenario(selectedInstance)
      .then((running: string | null) => { if (!cancelled) setSelectedScenario(running ?? ''); })
      .catch(() => { if (!cancelled) setSelectedScenario(''); });
    return () => { cancelled = true; };
  }, [selectedInstance]);

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
  React.useEffect(() => {
    if (!selectedInstance) return;
    saveInstance(selectedInstance); // before connection, so client uses the right instance
    setVesselPosition(new Map()); // clear vessel data when switching instances
    setTrails(new Map());
    const ws_client = new WebSocketClient(
      updateVesselPosition,
      (logMessage: LogWebSocketMessage) => {
        if (!SHOWN_LEVELS.includes(logMessage.log.status.level)) return;
        setLogs((prev) => [...prev, logMessage.log].slice(-200));
      },
    );
    ws_client.connect();
    return () => {
      ws_client.disconnect();
    };
  }, [selectedInstance, updateVesselPosition]);

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
    if (!selectedInstance) {
      showError('No instance selected.');
      return;
    }
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
    if (!selectedInstance) {
      showError('No instance selected.');
      return;
    }
    const cmd: MASCmd = {
      cmdType: 1,
      vesselName: vessel_name,
    };
    try {
      const ok = await sendMASCommand(selectedInstance, cmd);
      if (!ok) showError(`Failed to delete vessel: ${vessel_name}`);
      else {
        setTrails((prev) => { const next = new Map(prev); next.delete(vessel_name); return next; });
        setVesselPosition((prev) => { const next = new Map(prev); next.delete(vessel_name); return next; });
      }
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
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          vesselPositions={VesselPosition}
          onFlyTo={setFlyTo}
          onClear={() => {
            handleSimulationCleared();
            setSelectedScenario('');
          }}
        />

        <Box sx={{ flexGrow: 1 }}>
          <MapComponent
            {...mapSettings}
            VesselPosition={VesselPosition}
            trails={trails}
            addVesselFn={spawnVessel}
            removeVesselFn={deleteVessel}
            flyTo={flyTo}
          />
        </Box>
        <LogPanel logs={logs} onClear={() => setLogs([])} />
      </div>
    </div>
  );
};
