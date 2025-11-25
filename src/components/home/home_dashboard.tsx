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
 * - Manages WebSocket connection to receive real-time `VesselData`.
 * - Supports spawning vessels on selected instances.
 *
 */

import Header from "../common/header";
import { Map } from "../map/map";
import React, { useState, useRef } from "react";
import { Box } from "@mui/material";
import SideBar from "./sidebar";
import { listScenarios, listInstances, spawnVesselOnInstance } from '../common/apis';
import { WebSocketClient } from "../common/websocket";
import { VesselData } from "../common/interfaces";
import { LatLongPosition } from "../common/interfaces";

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
    const mapSettings = {
        center: [1.2421, 103.7198] as [number, number],
        zoom: 14,
    };

    const [scenarios, setScenarios] = React.useState<string[]>([]);
    const [instances, setInstances] = React.useState<string[]>([]);
    const [vesselData, setVesselData] = useState<VesselData[]>([]);

    // TODO: remove the default lotusim instance selected
    const [selectedInstance, setSelectedInstance] = useState<string>('lotusim');

    /**
     * Updates the vessel data state when new data is received from the WebSocket.
     *
     * @param newData - Array of `VesselData` objects received.
     */
    const updateVesselData = (newData: VesselData[]) => {
        setVesselData(newData);
    };

    /**
     * Fetches scenarios and instances from the backend API.
     */
    const fetchData = async () => {
        try {
            const scenarios = await listScenarios();
            const instances = await listInstances();
            setInstances(instances);
            setScenarios(scenarios);
        } catch (err) {
            console.error("Error getting instance or scenario");
        }
    };

    // Websocket is persistent
    const ws_client = useRef<WebSocketClient | null>(null);
    React.useEffect(() => {
        fetchData();
        if (!ws_client.current) {
            ws_client.current = new WebSocketClient(updateVesselData);
            ws_client.current.connect();
        }
        return () => {
            ws_client.current?.disconnect();
            ws_client.current = null;
        };
    }, [selectedInstance]);

    /**
     * Sends a command to spawn a new vessel on the selected instance.
     *
     * @param model_name - Name of the vessel model to spawn.
     * @param vessel_name - Name of the vessel.
     * @param position - Latitude, longitude, elevation, and heading.
     * @param lotus_param - String containing SDF parameters for the vessel.
     */
    const spawnVessel = async (model_name: string, vessel_name: string, position: LatLongPosition, lotus_param: string) => {
        try {
            const mascmd = {
                cmd_type: 0,
                sdf_string: lotus_param,
                model_name: model_name,
                vessel_name: vessel_name,
                geo_point: {
                    latitude: position.latitude,
                    longitude: position.longitude,
                    altitude: position.elevation
                },
                heading: position.heading
            }
            spawnVesselOnInstance(selectedInstance, JSON.stringify(mascmd));
        } catch (err) {
            console.error("Error sending vessel create cmd");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
            <Header title="Lotusim" />

            <div style={{ display: "flex", flexGrow: 1, height: "calc(100vh - 64px)" }}>
                <SideBar
                    scenarios={scenarios}
                    instances={instances}
                    selectedInstance={selectedInstance}
                    setSelectedInstance={setSelectedInstance}
                />

                <Box sx={{ flexGrow: 1 }}>
                    <Map {...mapSettings} vesselData={vesselData} addVesselFn={spawnVessel} />
                </Box>
            </div>
        </div>
    );
};
