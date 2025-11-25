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
 * *******************************   XYN BASE PANEL   **********************************
 * ************************************************************************************
 *
 * A reusable panel component that allows users to upload a 3D model (.stl) file
 * to create a new model yaml in xdyn for Lotusim
 *
 */

import React, { useState } from 'react';
import {
    TextField,
    Typography,
    Box,
} from '@mui/material';
import { MatrixInput, identity6x6 } from '../../common/props';

export interface XdynBaseParams {
    waveAngle: number;
    bodyFrame: { x: number; y: number; z: number };
    hydroCalcPoint: { x: number; y: number; z: number };
    centerOfInertia: { x: number; y: number; z: number };

    inertiaMatrix: number[][];
    addedMass: number[][];
    linearDamping: number[][];
    quadraticDamping: number[][];

    resistanceSpeed: number[];
    resistanceResistance: number[];
}

export const defaultXdynBaseParams = {
    waveAngle: 0,
    bodyFrame: { x: 0, y: 0, z: 0 },
    hydroCalcPoint: { x: 0, y: 0, z: 0 },
    centerOfInertia: { x: 0, y: 0, z: 0 },
    inertiaMatrix: identity6x6,
    addedMass: identity6x6,
    linearDamping: identity6x6,
    quadraticDamping: identity6x6,
    resistanceSpeed: [],
    resistanceResistance: [],
};

interface XdynBasePanelProps {
    xdynBaseParams: XdynBaseParams;
    setXdynBaseParams: React.Dispatch<React.SetStateAction<XdynBaseParams>>;
}

export const XdynBasePanel: React.FC<XdynBasePanelProps> = ({ xdynBaseParams, setXdynBaseParams }) => {
    const updateField = <K extends keyof XdynBaseParams>(key: K, value: XdynBaseParams[K]) => {
        setXdynBaseParams(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Box>
            <TextField
                label="Wave Angle (degrees)"
                type="number"
                value={xdynBaseParams.waveAngle}
                onChange={e => updateField('waveAngle', Number(e.target.value))}
                fullWidth
                margin="normal"
            />

            <Typography variant="subtitle1" mt={2}>Body Frame Relative To Mesh Frame</Typography>
            <Box display="flex" gap={1}>
                {(['x', 'y', 'z'] as const).map(axis => (
                    <TextField
                        key={axis}
                        label={axis.toUpperCase()}
                        type="number"
                        value={xdynBaseParams.bodyFrame[axis]}
                        onChange={e =>
                            updateField('bodyFrame', {
                                ...xdynBaseParams.bodyFrame,
                                [axis]: Number(e.target.value),
                            })
                        }
                        margin="dense"
                        sx={{ width: 100 }}
                    />
                ))}
            </Box>

            <Typography variant="subtitle1" mt={2}>Hydro Forces Calculation Point</Typography>
            <Box display="flex" gap={1}>
                {(['x', 'y', 'z'] as const).map(axis => (
                    <TextField
                        key={axis}
                        label={axis.toUpperCase()}
                        type="number"
                        value={xdynBaseParams.hydroCalcPoint[axis]}
                        onChange={e =>
                            updateField('hydroCalcPoint', {
                                ...xdynBaseParams.hydroCalcPoint,
                                [axis]: Number(e.target.value),
                            })
                        }
                        margin="dense"
                        sx={{ width: 100 }}
                    />
                ))}
            </Box>

            <Typography variant="subtitle1" mt={2}>Center Of Inertia</Typography>
            <Box display="flex" gap={1}>
                {(['x', 'y', 'z'] as const).map(axis => (
                    <TextField
                        key={axis}
                        label={axis.toUpperCase()}
                        type="number"
                        value={xdynBaseParams.centerOfInertia[axis]}
                        onChange={e =>
                            updateField('centerOfInertia', {
                                ...xdynBaseParams.centerOfInertia,
                                [axis]: Number(e.target.value),
                            })
                        }
                        margin="dense"
                        sx={{ width: 100 }}
                    />
                ))}
            </Box>

            <MatrixInput
                label="Inertia Matrix At Buoyancy"
                matrix={xdynBaseParams.inertiaMatrix}
                onChange={(matrix) => updateField('inertiaMatrix', matrix)}
            />

            <MatrixInput
                label="Added Mass"
                matrix={xdynBaseParams.addedMass}
                onChange={(matrix) => updateField('addedMass', matrix)}
            />

            <MatrixInput
                label="Linear Damping"
                matrix={xdynBaseParams.linearDamping}
                onChange={(matrix) => updateField('linearDamping', matrix)}
            />

            <MatrixInput
                label="Quadratic Damping"
                matrix={xdynBaseParams.quadraticDamping}
                onChange={(matrix) => updateField('quadraticDamping', matrix)}
            />

            <Typography variant="subtitle1" mt={2}>Resistance Curve Speed (comma separated)</Typography>
            <TextField
                value={xdynBaseParams.resistanceSpeed.join(', ')}
                onChange={e =>
                    updateField('resistanceSpeed', e.target.value.split(',').map(v => Number(v.trim())))
                }
                fullWidth
                margin="normal"
            />

            <Typography variant="subtitle1" mt={2}>Resistance Curve Resistance (comma separated)</Typography>
            <TextField
                value={xdynBaseParams.resistanceResistance.join(', ')}
                onChange={e =>
                    updateField('resistanceResistance', e.target.value.split(',').map(v => Number(v.trim())))
                }
                fullWidth
                margin="normal"
            />
        </Box>
    );
};
