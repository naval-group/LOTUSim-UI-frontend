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
 * *******************************   SIDEBAR COMPONENT   ******************************
 * ************************************************************************************
 *
 * This module provides the `SideBar` component for the Lotusim dashboard.
 *
 * Features:
 * - Select and save the active instance (with IP and port).
 * - Choose and launch scenarios. (not implemented yet)
 * - Clear the simulation state. (not implemented yet)
 * - Placeholder for environment settings (not implemented yet).
 *
 */

import React, { useState } from "react";
import { Box, Paper, Button, FormControl, InputLabel, Select, MenuItem, TextField, SelectChangeEvent } from "@mui/material";
import {
    saveAddress,
    getAddress,
    saveInstance
} from '../common/apis';

interface SideBarProps {
    scenarios: string[];
    instances: string[];
    selectedInstance: string;
    setSelectedInstance: (instance: string) => void;
}

/**
 * SideBar Component
 *
 * Provides controls for selecting instances, managing IP/port, and launching scenarios.
 *
 * @param scenarios - Array of available scenario names.
 * @param instances - Array of available instance names.
 * @param selectedInstance - Currently selected instance.
 * @param setSelectedInstance - Callback to update the selected instance.
 *
 */
const SideBar: React.FC<SideBarProps> = ({ scenarios, instances, selectedInstance, setSelectedInstance }) => {
    const [selectedScenario, setSelectedScenario] = useState<string>('');
    const [ip, setIp] = useState<string>(getAddress().ip);
    const [port, setPort] = useState<number>(getAddress().port);

    /**
     * Handles changing the selected lotusim instance / world.
     */
    const handleInstanceChange = (event: SelectChangeEvent<string>) => {
        setSelectedInstance(event.target.value as string);
        saveInstance(event.target.value as string);
    };

    /**
     * Handles changing the selected scenario.
     */
    const handleScenarioChange = (event: SelectChangeEvent<string>) => {
        setSelectedScenario(event.target.value as string);
    };

    /**
     * Updates the IP address state when the input changes.
     */
    const handleIpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIp(event.target.value);
    };

    /**
     * Updates the Port state when the input changes.
     */
    const handlePortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPort(Number(event.target.value));
    };

    /**
     * Saves the IP and Port to local storage to pull from the backend APIs.
     */
    const handleSaveAddress = () => {
        saveAddress(ip, port);
    };

    /**
     * Placeholder function to select scenario.
     */
    const handleselectedScenario = () => {
        // TODO handle the change in scenario selected. 
        // Not implemented along with launching of scenario.
        console.log("Selecting scenario:", selectedScenario);
    };

    /**
     * Clears the simulation vessels.
     */
    const handleClearSimulation = () => {
        // TODO clear all the vessels in the world. 
        console.log("Simulation cleared");
    };

    return (
        <Box
            component={Paper}
            elevation={3}
            sx={{
                width: "clamp(100px, 20vw, 240px)",
                flexShrink: 0,
                backgroundColor: "#f4f4f4",
                overflow: "auto",
                padding: 2,
                height: "100%", // Constrain height to parent container
                display: "flex",
                flexDirection: "column",
                alignItems: "center", // Center items horizontally
                gap: 2, // Add spacing between items
            }}
        >

            <FormControl sx={{ width: "clamp(80px, 15vw, 200px)" }}>
                <InputLabel id="instance-select-label">Instance Selected</InputLabel>
                <Select
                    labelId="instance-select-label"
                    id="instance-select"
                    value={selectedInstance}
                    onChange={handleInstanceChange}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {instances.map((instance, index) => (
                        <MenuItem key={index} value={instance}>{instance}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                label="IP Address"
                variant="outlined"
                fullWidth
                value={ip}
                onChange={handleIpChange}
            />

            <TextField
                label="Port"
                variant="outlined"
                fullWidth
                value={port}
                onChange={handlePortChange}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={handleSaveAddress}
                sx={{ width: "100%" }}
            >
                Save Address
            </Button>

            <Box sx={{ height: 20 }} />

            <FormControl sx={{ width: "clamp(80px, 15vw, 200px)" }}>
                <InputLabel id="scenario-select-label">Launch Scenario</InputLabel>
                <Select
                    labelId="scenario-select-label"
                    id="scenario-select"
                    value={selectedScenario}
                    onChange={handleScenarioChange}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {scenarios.map((scenario, index) => (
                        <MenuItem key={index} value={scenario}>{scenario}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            < Button
                variant="contained"
                color="primary"
                onClick={handleselectedScenario}
                sx={{ width: "100%" }}
            >
                Launch Scenario
            </Button >

            < Button
                variant="outlined"
                color="secondary"
                onClick={handleClearSimulation}
                sx={{ width: "100%" }}
            >
                Clear Simulation
            </Button >
            <Box sx={{ height: 20 }} />

            <TextField
                label="Environment not implemented"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                    style: {
                        fontSize: '16px',
                        fontWeight: 'bold',
                    },
                }}
            />

        </Box >
    );
};

export default SideBar;
