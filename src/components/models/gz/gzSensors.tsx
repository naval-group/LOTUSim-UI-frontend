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
 * *******************************   GZ Sensor PANEL   ********************************
 * ************************************************************************************
 *
 * A reusable panel component that allows users to upload sensor types and param in the new model in Gazebo for Lotusim
 *
 * Sensors available:
 * - AIS
 * - IMU
 * 
 */

import React, { useState } from 'react';
import {
    TextField, Box, Button, MenuItem, Collapse, Typography, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Pose, Vector3 } from '../../common/interfaces';

// AHOY add here
export enum SensorType {
    IMU = 'imu',
    AIS = 'ais'
    // SONAR = 'sonar',
    // RADAR = 'radar'
}

export interface Noise {
    mean: number;
    stddev: number;
    bias_stddev: number;
    bias_mean: number;
}

export interface NoiseVector3 {
    mean: Vector3;
    stddev: Vector3;
    bias_mean: Vector3;
    bias_stddev: Vector3;
}

export interface BaseSensor {
    id: string;
    name: string;
    type: SensorType;
    pose: Pose;
    update_rate: number;
    open: boolean;
}

export interface IMUSensor extends BaseSensor {
    coord_system: string;
    linear_noise: NoiseVector3;
    angular_noise: NoiseVector3;
}

export interface SonarSensor extends BaseSensor {
    horizontal_resolution: number;
    horizontal_samples: number;
    horizontal_min_angle: number;
    horizontal_max_angle: number;

    vertical_resolution: number;
    vertical_samples: number;
    vertical_min_angle: number;
    vertical_max_angle: number;

    range_min: number;
    range_max: number;
    range_resolution: number;
    range_noise: Noise;
}

export interface RadarSensor extends BaseSensor {
    range: number;
    frequency: number;
}

export interface AISSensor extends BaseSensor {
    noise: Noise;
}

export interface SensorPanelInterface {
    sensors: BaseSensor[];
    setSensors: React.Dispatch<React.SetStateAction<BaseSensor[]>>;
}

export const SensorPanel = ({ sensors, setSensors }) => {
    const [newType, setNewType] = useState<SensorType>(SensorType.IMU);

    const addSensor = () => {
        const id = Date.now().toString();
        const defaultName = `${newType.toUpperCase()}_${sensors.length}`;
        const base: BaseSensor = {
            id,
            name: defaultName,
            type: newType,
            pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
            update_rate: 0,
            open: true,
        };

        let fullSensor: BaseSensor;

        switch (newType) {
            case SensorType.IMU:
                fullSensor = {
                    ...base,
                    coord_system: 'ENU',
                    linear_noise: {
                        mean: { x: 0, y: 0, z: 0 },
                        stddev: { x: 0, y: 0, z: 0 },
                        bias_mean: { x: 0, y: 0, z: 0 },
                        bias_stddev: { x: 0, y: 0, z: 0 },
                    },
                    angular_noise: {
                        mean: { x: 0, y: 0, z: 0 },
                        stddev: { x: 0, y: 0, z: 0 },
                        bias_mean: { x: 0, y: 0, z: 0 },
                        bias_stddev: { x: 0, y: 0, z: 0 },
                    },
                } as IMUSensor;
                break;

            // case SensorType.SONAR:
            //     fullSensor = {
            //         ...base,
            //         horizontal_resolution: 0,
            //         horizontal_samples: 0,
            //         horizontal_min_angle: 0,
            //         horizontal_max_angle: 0,
            //         vertical_resolution: 0,
            //         vertical_samples: 0,
            //         vertical_min_angle: 0,
            //         vertical_max_angle: 0,
            //         range_min: 0,
            //         range_max: 10,
            //         range_resolution: 0,
            //         range_noise: {
            //             mean: 0,
            //             stddev: 0,
            //             bias_mean: 0,
            //             bias_stddev: 0,
            //         },
            //     } as SonarSensor;
            //     break;

            // case SensorType.RADAR:
            //     fullSensor = {
            //         ...base,
            //         range: 10,
            //         frequency: 1,
            //     } as RadarSensor;
            //     break;

            case SensorType.AIS:
                fullSensor = {
                    ...base,
                    update_rate: 1,
                    noise: {
                        mean: 0.0,
                        stddev: 0.0,
                        bias_mean: 0,
                        bias_stddev: 0
                    }
                } as AISSensor;
                break;

            default:
                fullSensor = base;
        }

        setSensors(curr => [...curr, fullSensor]);
    };

    const updateSensor = (id: string, field: string, value: any) => {
        setSensors(curr => curr.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const toggleOpen = (id: string) => {
        setSensors(curr => curr.map(s => s.id === id ? { ...s, open: !s.open } : s));
    };

    const removeSensor = (id: string) => {
        setSensors(prev => prev.filter(sensor => sensor.id !== id));
    };

    return (
        <Box>
            <Box display="flex" gap={2} alignItems="center" mb={2}>
                <TextField
                    select
                    label="Sensor Type"
                    value={newType}
                    onChange={e => setNewType(e.target.value as SensorType)}
                >
                    {Object.values(SensorType).map(type => (
                        <MenuItem key={type} value={type}>{type.toUpperCase()}</MenuItem>
                    ))}
                </TextField>
                <Button variant="contained" onClick={addSensor}>
                    Add Sensor
                </Button>
            </Box>

            {sensors.map(sensor => (
                <Box key={sensor.id} mb={2} border="1px solid #ddd" borderRadius={1}>
                    <Box display="flex" alignItems="center" p={1} bgcolor="#f7f7f7">
                        <IconButton size="small" onClick={() => toggleOpen(sensor.id)}>
                            {sensor.open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <TextField
                            label="Name"
                            value={sensor.name}
                            onChange={e => updateSensor(sensor.id, 'name', e.target.value)}
                            size="small"
                            sx={{ ml: 1, flexGrow: 1 }}
                        />
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                            {sensor.type.toUpperCase()}
                        </Typography>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeSensor(sensor.id)}
                            sx={{ ml: 1 }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>

                    <Collapse in={sensor.open}>
                        <Box p={2} display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="Update Rate"
                                type="number"
                                value={sensor.update_rate}
                                onChange={e => updateSensor(sensor.id, 'update_rate', Number(e.target.value))}
                                fullWidth
                            />

                            {/* Position fields */}
                            <Box>
                                <Typography variant="subtitle2">Position</Typography>
                                <Box display="flex" gap={1}>
                                    {['x', 'y', 'z'].map(axis => (
                                        <TextField
                                            key={axis}
                                            label={axis.toUpperCase()}
                                            type="number"
                                            value={sensor.pose.position[axis]}
                                            onChange={e => {
                                                const value = parseFloat(e.target.value);
                                                const newPosition = {
                                                    ...sensor.pose,
                                                    position: {
                                                        ...sensor.pose.position,
                                                        [axis]: value,
                                                    }
                                                };
                                                updateSensor(sensor.id, 'pose', newPosition);
                                            }}
                                            size="small"
                                            sx={{ width: 100 }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* Orientation fields */}
                            <Box>
                                <Typography variant="subtitle2">Orientation (Quaternion)</Typography>
                                <Box display="flex" gap={1}>
                                    {['x', 'y', 'z', 'w'].map(axis => (
                                        <TextField
                                            key={axis}
                                            label={axis.toUpperCase()}
                                            type="number"
                                            value={sensor.pose.orientation[axis]}
                                            onChange={e => {
                                                const value = parseFloat(e.target.value);
                                                const newPosition = {
                                                    ...sensor.pose,
                                                    orientation: {
                                                        ...sensor.pose.orientation,
                                                        [axis]: value,
                                                    }
                                                };
                                                updateSensor(sensor.id, 'pose', newPosition);
                                            }}
                                            size="small"
                                            sx={{ width: 100 }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* IMU Fields */}
                            {sensor.type === SensorType.IMU && (
                                <>
                                    <TextField
                                        label="Coordinate system (ENU, NED, NWU)"
                                        value={(sensor as IMUSensor).coord_system || ''}
                                        onChange={e => updateSensor(sensor.id, 'coord_system', e.target.value)}
                                    />
                                    {['linear_noise', 'angular_noise'].map(noiseType => (
                                        <Box key={noiseType} mt={2}>
                                            <Typography variant="subtitle2">
                                                {noiseType.replace(/_/g, ' ').toUpperCase()}
                                            </Typography>
                                            {['mean', 'stddev', 'bias_mean', 'bias_stddev'].map(param => (
                                                <Box key={param} mt={1}>
                                                    <Typography variant="body2">
                                                        {param.replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Box display="flex" gap={1}>
                                                        {['x', 'y', 'z'].map(axis => (
                                                            <TextField
                                                                key={axis}
                                                                label={axis.toUpperCase()}
                                                                type="number"
                                                                value={(sensor as any)[noiseType]?.[param]?.[axis] ?? ''}
                                                                onChange={e => {
                                                                    const value = parseFloat(e.target.value);
                                                                    const currentNoise = (sensor as any)[noiseType] ?? {};
                                                                    const currentParam = currentNoise[param] ?? { x: 0, y: 0, z: 0 };

                                                                    const updatedParam = { ...currentParam, [axis]: value };
                                                                    const updatedNoise = { ...currentNoise, [param]: updatedParam };

                                                                    updateSensor(sensor.id, noiseType, updatedNoise);
                                                                }}
                                                                size="small"
                                                                sx={{ width: 100 }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    ))}
                                </>
                            )}

                            {/* Sonar Fields */}
                            {/* {sensor.type === SensorType.SONAR && (
                                <>
                                    {[
                                        'horizontal_resolution', 'horizontal_samples', 'horizontal_min_angle', 'horizontal_max_angle',
                                        'vertical_resolution', 'vertical_samples', 'vertical_min_angle', 'vertical_max_angle',
                                        'range_min', 'range_max', 'range_resolution'
                                    ].map(field => (
                                        <TextField
                                            key={field}
                                            label={field.replace(/_/g, ' ')}
                                            type="number"
                                            value={(sensor as any)[field] ?? ''}
                                            onChange={e => updateSensor(sensor.id, field, Number(e.target.value))}
                                            fullWidth
                                        />
                                    ))}
                                    <Box>
                                        <Typography variant="subtitle2">Range Noise</Typography>
                                        {['mean', 'stddev', 'bias_mean', 'bias_stddev'].map(key => (
                                            <TextField
                                                key={key}
                                                label={key.replace(/_/g, ' ')}
                                                type="number"
                                                value={(sensor as any).range_noise?.[key] ?? ''}
                                                onChange={e => {
                                                    const noise = { ...(sensor as any).range_noise ?? {} };
                                                    noise[key] = parseFloat(e.target.value);
                                                    updateSensor(sensor.id, 'range_noise', noise);
                                                }}
                                                fullWidth
                                                sx={{ mt: 1 }}
                                            />
                                        ))}
                                    </Box>
                                </>
                            )} */}

                            {/* Radar Fields */}
                            {/* {sensor.type === SensorType.RADAR && (
                                <>
                                    <TextField
                                        label="Range"
                                        type="number"
                                        value={(sensor as RadarSensor).range || ''}
                                        onChange={e => updateSensor(sensor.id, 'range', Number(e.target.value))}
                                    />
                                    <TextField
                                        label="Frequency"
                                        type="number"
                                        value={(sensor as RadarSensor).frequency || ''}
                                        onChange={e => updateSensor(sensor.id, 'frequency', Number(e.target.value))}
                                    />
                                </>
                            )} */}

                            {sensor.type === SensorType.AIS && (
                                <Box>
                                    <Typography variant="subtitle2">AIS Noise</Typography>
                                    <Box display="flex" gap={2}>
                                        <TextField
                                            label="Mean"
                                            type="number"
                                            value={(sensor as any).noise?.mean ?? 0.01}
                                            onChange={e => {
                                                updateSensor(sensor.id, 'noise', {
                                                    ...(sensor as any).noise,
                                                    mean: parseFloat(e.target.value)
                                                });
                                            }}
                                            size="small"
                                            sx={{ width: 120 }}
                                        />
                                        <TextField
                                            label="Stddev"
                                            type="number"
                                            value={(sensor as any).noise?.stddev ?? 0.0}
                                            onChange={e => {
                                                updateSensor(sensor.id, 'noise', {
                                                    ...(sensor as any).noise,
                                                    stddev: parseFloat(e.target.value)
                                                });
                                            }}
                                            size="small"
                                            sx={{ width: 120 }}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </Box>
            ))}
        </Box>
    );
};
