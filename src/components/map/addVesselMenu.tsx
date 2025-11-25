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
 * *******************************   ADD VESSEL MENU   *********************************
 * ************************************************************************************
 *
 * A React component providing a form dialog to add a new vessel into the Lotusim
 * simulation on the map. Users can configure model, vessel name, geographic position,
 * physics/rendering plugins, and waypoint follower behavior.
 *
 * Features:
 * - Position input (latitude, longitude, elevation, heading).
 * - Model selection from backend API (`listModels`).
 * - Plugin configuration (physics engine, rendering engine).
 * - Physics modes: aerial, surface, underwater (with connection and thruster config).
 * - Waypoint follower configuration (waypoints, line, circle).
 * - Generates a Lotusim XML parameter string (`generateLotusParamXML`) passed to
 *   the simulation backend.
 *
 */


import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    Button,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Checkbox,
    SelectChangeEvent
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LatLongPosition } from "../common/interfaces";
import { listModels } from "../common/apis";

const connectionTypes = ["TCPIP", "ROS2"];

const InputField = ({
    label,
    value,
    onChange
}: {
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <TextField
        label={label}
        variant="outlined"
        value={value}
        onChange={onChange}
        fullWidth
        sx={{ mb: 2 }}
    />
);

const SelectField = ({
    label,
    value,
    onChange,
    options
}: {
    label: string;
    value: string;
    onChange: (e: SelectChangeEvent<string>) => void;
    options: string[];
}) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{label}</InputLabel>
        <Select value={value} onChange={onChange}>
            <MenuItem value=""><em>None</em></MenuItem>
            {options.map((option, index) => (
                <MenuItem key={index} value={option}>
                    {option}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

const PositionFields = ({
    position,
    onChange
}: {
    position: LatLongPosition;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, field: keyof LatLongPosition) => void;
}) => (
    <Grid container spacing={2}>
        {["latitude", "longitude", "elevation", "heading"].map((field) => (
            <Grid size={{ xs: 12, md: 6 }}>
                <InputField
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={position[field as keyof LatLongPosition]}
                    onChange={(e) =>
                        onChange(e, field as keyof LatLongPosition)}
                />
            </Grid>
        ))}
    </Grid>
);

interface AddVesselMenuProps {
    open: boolean;
    onClose: () => void;
    onAddVessel: (model_name: string, vesselName: string, position: LatLongPosition, lotus_param: string) => void;
    clickedLatLng: { lat: number; lng: number } | null;
}


/**
 * Main dialog component for configuring and adding a new vessel.
 * Generates XML configuration via `generateLotusParamXML` before submitting.
 */
export const AddVesselMenu: React.FC<AddVesselMenuProps> = ({
    open,
    onClose,
    onAddVessel,
    clickedLatLng
}) => {
    const [model, setModel] = useState("");
    const [modelList, setModelList] = useState<string[]>([]);
    const [vesselName, setVesselName] = useState("");
    const [position, setPosition] = useState<LatLongPosition>({
        latitude: clickedLatLng?.lat ?? 0,
        longitude: clickedLatLng?.lng ?? 0,
        elevation: 0,
        heading: 0
    });

    const [plugins, setPlugins] = useState({
        "physics engine": false,
        "rendering engine": false
    });

    const [rendererType, setRendererType] = useState("");
    const [publishRender, setPublishRender] = useState(false);

    const [physicsModes, setPhysicsModes] = useState({
        aerial: false,
        surface: false,
        underwater: false
    });

    const physicsModeKeys = ["aerial", "surface", "underwater"] as const;
    const [physicsConfig, setPhysicsConfig] = useState({
        aerial: { connectionType: "", uri: "", thrusters: [] as string[] },
        surface: { connectionType: "", uri: "", thrusters: [] as string[] },
        underwater: { connectionType: "", uri: "", thrusters: [] as string[] }
    });

    const [initState, setInitState] = useState("");

    const initStateOptions = Object.entries(physicsModes)
        .filter(([_, enabled]) => enabled)
        .map(([mode]) => mode.charAt(0).toUpperCase() + mode.slice(1));

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const models = await listModels();
                setModelList(models);
            } catch (error) {
                console.error("Error fetching models:", error);
            }
        };
        fetchModels();
    }, []);

    const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof LatLongPosition) => {
        const input = e.target.value;

        if (input === '' || input === '-' || input === '.' || input === '-.') {
            setPosition(prev => ({ ...prev, [field]: input }));
            return;
        }

        const num = parseFloat(input);
        if (!isNaN(num)) {
            setPosition(prev => ({ ...prev, [field]: num }));
        }
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setPlugins((prev) => ({ ...prev, [name]: checked }));
    };

    type PhysicsMode = keyof typeof physicsConfig; // "aerial" | "surface" | "underwater"
    const handlePhysicsConfigChange = <
        M extends PhysicsMode,
        F extends keyof (typeof physicsConfig)[M]
    >(
        mode: M,
        field: F,
        value: (typeof physicsConfig)[M][F]
    ) => {
        setPhysicsConfig((prev) => ({
            ...prev,
            [mode]: {
                ...prev[mode],
                [field]: value
            }
        }));
    };

    const [waypointFollower, setWaypointFollower] = useState({
        enabled: false,
        loop: true,
        linearAccLimit: 0.5,
        angularAccLimit: 0.005,
        angularVelLimit: 0.01,
        mode: "", // "waypoints" | "line" | "circle"
        waypoints: [] as { lat: number; lng: number }[],
        line: { direction: 0, length: 0 },
        circle: { radius: 0 }
    });


    const generateLotusParamXML = (): string => {
        const escapeXml = (str: string) =>
            str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");

        // Assume plugins comes from state or props
        const { ["physics engine"]: physicsEnabled, ["rendering engine"]: renderEnabled } = plugins;

        let renderInterface = '';
        if (renderEnabled) {
            renderInterface = `
      <render_interface>
        <publish_render>${publishRender}</publish_render>
        <renderer_type_name>${escapeXml(rendererType)}</renderer_type_name>
      </render_interface>`;
        }

        let physicsEngineInterface = '';
        if (physicsEnabled) {
            const physicsParts = Object.entries(physicsModes)
                .filter(([_, enabled]) => enabled)
                .map(([mode]) => {
                    const config = physicsConfig[mode as PhysicsMode];
                    const thrusters = config.thrusters
                        .map((thruster, idx) => `        <thrusters${idx + 1}>${escapeXml(thruster)}</thrusters${idx + 1}>`)
                        .join("\n");

                    return `
        <${mode}>
          <ConnectionType>${escapeXml(config.connectionType)}</ConnectionType>                        
          <uri>${escapeXml(config.uri)}</uri>
          <thrusters>
    ${thrusters}
          </thrusters>
        </${mode}>`;
                }).join("");

            physicsEngineInterface = `
      <physics_engine_interface>${physicsParts}
        <init_state>${escapeXml(initState)}</init_state>
      </physics_engine_interface>`;
        }

        let waypointFollowerInterface = '';
        if (waypointFollower.enabled) {
            const followers: string[] = [];

            // Helper function for common limits
            const commonLimits = `
      <loop>${waypointFollower.loop}</loop>
      <linear_acceleration_limit>${waypointFollower.linearAccLimit}</linear_acceleration_limit>
      <angular_acceleration_limit>${waypointFollower.angularAccLimit}</angular_acceleration_limit>
      <angular_velocity_limit>${waypointFollower.angularVelLimit}</angular_velocity_limit>
    `;

            // Waypoints follower
            if (waypointFollower.mode === "waypoints" && waypointFollower.waypoints.length > 0) {
                const waypointsXml = waypointFollower.waypoints
                    .map(wp => `<waypoint>${wp.lat} ${wp.lng}</waypoint>`)
                    .join('');
                followers.push(`
        <follower>
          ${commonLimits}
          <waypoints>
            ${waypointsXml}
          </waypoints>
        </follower>`);
            }

            // Line follower
            if (waypointFollower.mode === "line") {
                followers.push(`
        <follower>
          ${commonLimits}
          <line>
            <direction>${waypointFollower.line.direction}</direction>
            <length>${waypointFollower.line.length}</length>
          </line>
        </follower>`);
            }

            // Circle follower
            if (waypointFollower.mode === "circle") {
                followers.push(`
        <follower>
          ${commonLimits}
          <circle>
            <radius>${waypointFollower.circle.radius}</radius>
          </circle>
        </follower>`);
            }

            waypointFollowerInterface = `
      <waypoint_follower>
        ${followers.join('')}
      </waypoint_follower>`;
        }

        return `<lotus_param>${renderInterface}${physicsEngineInterface}${waypointFollowerInterface}</lotus_param>`
            .replace(/[\n\r\t]/g, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
    };


    const handleAddVessel = () => {
        const lotus_param = generateLotusParamXML();
        onAddVessel(model, vesselName, position, lotus_param);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent sx={{ overflowX: "hidden", overflowY: "auto" }}>
                <Typography variant="h6" fontWeight="bold" mb={1}>Vessel Info</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <SelectField label="Model" value={model} onChange={(e: SelectChangeEvent<string>) =>
                            setModel(e.target.value as string)} options={modelList} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <InputField label="Vessel Name" value={vesselName} onChange={(e: SelectChangeEvent<string>) =>
                            setVesselName(e.target.value)} />
                    </Grid>
                </Grid>

                <Typography variant="h6" fontWeight="bold" mt={2} mb={1}>Position</Typography>
                <PositionFields position={position} onChange={handlePositionChange} />

                <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>Lotusim Plugin Params</Typography>
                <FormGroup>
                    {/* --- RENDERING ENGINE --- */}
                    <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 2 }}>
                        <FormControlLabel
                            control={<Checkbox checked={plugins["rendering engine"]} onChange={handleCheckboxChange} name="rendering engine" />}
                            label="Rendering Engine"
                        />
                        {plugins["rendering engine"] && (
                            <>
                                <TextField
                                    label="Renderer Type Name"
                                    value={rendererType}
                                    onChange={(e) =>
                                        setRendererType(e.target.value)}
                                    fullWidth
                                    sx={{ mt: 2 }}
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={publishRender} onChange={(e) => setPublishRender(e.target.checked)} />}
                                    label="Publish Render"
                                    sx={{ mt: 1 }}
                                />
                            </>
                        )}
                    </Box>

                    {/* --- PHYSICS ENGINE --- */}
                    <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 2 }}>
                        <FormControlLabel
                            control={<Checkbox checked={plugins["physics engine"]} onChange={handleCheckboxChange} name="physics engine" />}
                            label="Physics Engine"
                        />
                        {plugins["physics engine"] && (
                            <>
                                {physicsModeKeys.map((mode) => (
                                    <Box key={mode} sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={physicsModes[mode]}
                                                    onChange={(e) =>
                                                        setPhysicsModes((prev) => ({ ...prev, [mode]: e.target.checked }))
                                                    }
                                                />
                                            }
                                            label={`Enable ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
                                        />
                                        {physicsModes[mode] && (
                                            <>
                                                <FormControl fullWidth sx={{ mt: 2 }}>
                                                    <InputLabel>Connection Type</InputLabel>
                                                    <Select
                                                        value={physicsConfig[mode].connectionType}
                                                        onChange={(e: SelectChangeEvent<string>) =>
                                                            handlePhysicsConfigChange(mode, "connectionType", e.target.value)
                                                        }
                                                    >
                                                        {connectionTypes.map((type) => (
                                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                <TextField
                                                    label="URI"
                                                    value={physicsConfig[mode].uri}
                                                    onChange={(e) =>
                                                        handlePhysicsConfigChange(mode, "uri", e.target.value)
                                                    }
                                                    fullWidth
                                                    sx={{ mt: 2 }}
                                                />

                                                <TextField
                                                    label="Thruster Names (comma-separated)"
                                                    value={physicsConfig[mode].thrusters.join(", ")}
                                                    onChange={(e) =>
                                                        handlePhysicsConfigChange(
                                                            mode,
                                                            "thrusters",
                                                            e.target.value.split(",").map((t) => t.trim())
                                                        )
                                                    }
                                                    fullWidth
                                                    sx={{ mt: 2 }}
                                                />
                                            </>
                                        )}
                                    </Box>
                                ))}

                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Initial State</InputLabel>
                                    <Select
                                        value={initState}
                                        onChange={(e: SelectChangeEvent<string>) => setInitState(e.target.value)}
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {initStateOptions.map((state) => (
                                            <MenuItem key={state} value={state}>{state}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}
                    </Box>

                    {/* --- WAYPOINT FOLLOWER --- */}
                    <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={waypointFollower.enabled}
                                    onChange={(e) =>
                                        setWaypointFollower((prev) => ({ ...prev, enabled: e.target.checked }))
                                    }
                                />
                            }
                            label="Waypoint Follower"
                        />

                        {waypointFollower.enabled && (
                            <Box sx={{ mt: -2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={waypointFollower.loop}
                                            onChange={(e) =>
                                                setWaypointFollower((prev) => ({ ...prev, loop: e.target.checked }))
                                            }
                                        />
                                    }
                                    label="Loop"
                                    sx={{ mt: 2 }}
                                />

                                <TextField
                                    type="number"
                                    label="Linear Acceleration Limit"
                                    value={waypointFollower.linearAccLimit}
                                    onChange={(e) =>
                                        setWaypointFollower((prev) => ({
                                            ...prev,
                                            linearAccLimit: parseFloat(e.target.value) || 0
                                        }))
                                    }
                                    fullWidth
                                    sx={{ mt: 2 }}
                                />

                                <TextField
                                    type="number"
                                    label="Angular Acceleration Limit"
                                    value={waypointFollower.angularAccLimit}
                                    onChange={(e) =>
                                        setWaypointFollower((prev) => ({
                                            ...prev,
                                            angularAccLimit: parseFloat(e.target.value) || 0
                                        }))
                                    }
                                    fullWidth
                                    sx={{ mt: 2 }}
                                />

                                <TextField
                                    type="number"
                                    label="Angular Velocity Limit"
                                    value={waypointFollower.angularVelLimit}
                                    onChange={(e) =>
                                        setWaypointFollower((prev) => ({
                                            ...prev,
                                            angularVelLimit: parseFloat(e.target.value) || 0
                                        }))
                                    }
                                    fullWidth
                                    sx={{ mt: 2 }}
                                />

                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Mode</InputLabel>
                                    <Select
                                        value={waypointFollower.mode}
                                        onChange={(e: SelectChangeEvent<string>) =>
                                            setWaypointFollower((prev) => ({ ...prev, mode: e.target.value }))
                                        }
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        <MenuItem value="waypoints">Waypoints</MenuItem>
                                        <MenuItem value="line">Line</MenuItem>
                                        <MenuItem value="circle">Circle</MenuItem>
                                    </Select>
                                </FormControl>

                                {waypointFollower.mode === "waypoints" && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" mb={1}>Waypoints</Typography>
                                        {waypointFollower.waypoints.map((wp, idx) => (
                                            <Grid container spacing={2} key={idx} sx={{ mb: 1 }}>
                                                <Grid>
                                                    <TextField
                                                        type="number"
                                                        label="Latitude"
                                                        value={wp.lat}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            setWaypointFollower((prev) => {
                                                                const waypoints = [...prev.waypoints];
                                                                waypoints[idx].lat = val;
                                                                return { ...prev, waypoints };
                                                            });
                                                        }}
                                                        fullWidth
                                                    />
                                                </Grid>
                                                <Grid>
                                                    <TextField
                                                        type="number"
                                                        label="Longitude"
                                                        value={wp.lng}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            setWaypointFollower((prev) => {
                                                                const waypoints = [...prev.waypoints];
                                                                waypoints[idx].lng = val;
                                                                return { ...prev, waypoints };
                                                            });
                                                        }}
                                                        fullWidth
                                                    />
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <Button
                                            variant="outlined"
                                            onClick={() =>
                                                setWaypointFollower((prev) => ({
                                                    ...prev,
                                                    waypoints: [...prev.waypoints, { lat: 0, lng: 0 }]
                                                }))
                                            }
                                        >
                                            + Add Waypoint
                                        </Button>
                                    </Box>
                                )}

                                {waypointFollower.mode === "line" && (
                                    <Box sx={{ mt: 2 }}>
                                        <TextField
                                            type="number"
                                            label="Direction"
                                            value={waypointFollower.line.direction}
                                            onChange={(e) =>
                                                setWaypointFollower((prev) => ({
                                                    ...prev,
                                                    line: { ...prev.line, direction: parseFloat(e.target.value) || 0 }
                                                }))
                                            }
                                            fullWidth
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            type="number"
                                            label="Length"
                                            value={waypointFollower.line.length}
                                            onChange={(e) =>
                                                setWaypointFollower((prev) => ({
                                                    ...prev,
                                                    line: { ...prev.line, length: parseFloat(e.target.value) || 0 }
                                                }))
                                            }
                                            fullWidth
                                        />
                                    </Box>
                                )}

                                {waypointFollower.mode === "circle" && (
                                    <Box sx={{ mt: 2 }}>
                                        <TextField
                                            type="number"
                                            label="Radius"
                                            value={waypointFollower.circle.radius}
                                            onChange={(e) =>
                                                setWaypointFollower((prev) => ({
                                                    ...prev,
                                                    circle: { radius: parseFloat(e.target.value) || 0 }
                                                }))
                                            }
                                            fullWidth
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </FormGroup>

                <Box display="flex" gap={2} mt={4}>
                    <Button variant="contained" color="primary" onClick={handleAddVessel} sx={{ flex: 1 }}>
                        Add Vessel
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={onClose} sx={{ flex: 1 }}>
                        Cancel
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
