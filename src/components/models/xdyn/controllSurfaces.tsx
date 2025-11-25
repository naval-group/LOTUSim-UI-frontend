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
 * *******************************   XDYN CONTROLL SURFACE PANEL   ********************
 * ************************************************************************************
 *
 * A reusable panel component that allows users to upload control surfaces for a model to be generated in xdyn yaml
 *
 */

import React from 'react';
import { Pose } from '../../common/interfaces';
import {
    Typography,
    TextField,
    Box,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';

export interface ControllSurface {
    name: string;
    pose: Pose;
    referenceArea: number;
    angleOfAttack: number[];
    liftCoefficient: number[];
    dragCoefficient: number[];
    takeWavesOrbitalVelocityIntoAccount: boolean;
};

export const defaultControllSurface: ControllSurface = {
    name: '',
    pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
    referenceArea: 1,
    angleOfAttack: [1, 5],
    liftCoefficient: [0.1, 0.2],
    dragCoefficient: [0.1, 0.2],
    takeWavesOrbitalVelocityIntoAccount: false,
};

interface ControllSurfacesPanelProps {
    controllSurfaces: ControllSurface[];
    setControllSurfaces: React.Dispatch<React.SetStateAction<ControllSurface[]>>;
}

export const ControllSurfacePanel: React.FC<ControllSurfacesPanelProps> = ({
    controllSurfaces,
    setControllSurfaces,
}) => {
    const handleChange = (
        index: number,
        field: keyof ControllSurface,
        value: string | number | boolean | number[],
    ) => {
        const updated = [...controllSurfaces];

        const numberFields: (keyof ControllSurface)[] = ['referenceArea'];

        if (numberFields.includes(field)) {
            updated[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : (value as number);
        } else if (
            field === 'angleOfAttack' ||
            field === 'liftCoefficient' ||
            field === 'dragCoefficient'
        ) {
            if (typeof value === 'string') {
                const arr = value
                    .split(',')
                    .map((v) => parseFloat(v.trim()))
                    .filter((v) => !isNaN(v));
                updated[index][field] = arr;
            } else {
                updated[index][field] = value as number[];
            }
        } else if (field === 'takeWavesOrbitalVelocityIntoAccount') {
            updated[index][field] = value as boolean;
        } else {
            updated[index][field] = value as any;
        }

        setControllSurfaces(updated);
    };

    const handleAdd = () => {
        setControllSurfaces([...controllSurfaces, {
            ...defaultControllSurface, name: `controlled_surface_${controllSurfaces.length}`,
            pose: structuredClone(defaultControllSurface.pose)
        }]);
    };

    const handleRemove = (index: number) => {
        const updated = [...controllSurfaces];
        updated.splice(index, 1);
        setControllSurfaces(updated);
    };

    return (
        <>
            <Typography variant="subtitle1" mt={2}>
                Controlled Surfaces
            </Typography>

            {controllSurfaces.map((surface, index) => (
                <Accordion key={index}
                    sx={{
                        mb: 2,
                        border: '1px solid #10009c',
                        boxShadow: 'none',
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography sx={{ flexGrow: 1 }}>{surface.name || `Fill in controlled surface name `}</Typography>
                            <IconButton
                                edge="end"
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(index);
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                        <TextField
                            label="Name"
                            fullWidth
                            margin="normal"
                            value={surface.name}
                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                        />

                        <Box
                            sx={{
                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                borderRadius: 1,
                                p: 2,
                                mt: 2,
                            }}
                        >
                            <Typography variant="body2" color="textPrimary" mb={1}>
                                Position of controlled surface
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {(['x', 'y', 'z'] as const).map((axis) => (
                                    <TextField
                                        key={`position-${axis}`}
                                        label={`Pos ${axis.toUpperCase()}`}
                                        type="number"
                                        value={surface.pose.position[axis]}
                                        onChange={(e) => {
                                            const updated = [...controllSurfaces];
                                            updated[index].pose.position[axis] = parseFloat(e.target.value) || 0;
                                            setControllSurfaces(updated);
                                        }}
                                        margin="dense"
                                        sx={{ width: 100 }}
                                    />
                                ))}
                            </Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                Quaternion
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {(['x', 'y', 'z', 'w'] as const).map((axis) => (
                                    <TextField
                                        key={`quaternion-${axis}`}
                                        label={`Quat ${axis.toUpperCase()}`}
                                        type="number"
                                        value={surface.pose.orientation[axis]}
                                        onChange={(e) => {
                                            const updated = [...controllSurfaces];
                                            updated[index].pose.orientation[axis] = parseFloat(e.target.value) || 0;
                                            setControllSurfaces(updated);
                                        }}
                                        margin="dense"
                                        sx={{ width: 100 }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <TextField
                            label="Reference Area"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={surface.referenceArea}
                            onChange={(e) => handleChange(index, 'referenceArea', e.target.value)}
                        />

                        <TextField
                            label="Angle of Attack (comma-separated degrees)"
                            fullWidth
                            margin="normal"
                            value={surface.angleOfAttack.join(', ')}
                            onChange={(e) => handleChange(index, 'angleOfAttack', e.target.value)}
                            helperText="Enter comma-separated list of numbers"
                        />

                        <TextField
                            label="Lift Coefficient (comma-separated)"
                            fullWidth
                            margin="normal"
                            value={surface.liftCoefficient.join(', ')}
                            onChange={(e) => handleChange(index, 'liftCoefficient', e.target.value)}
                            helperText="Enter comma-separated list of numbers"
                        />

                        <TextField
                            label="Drag Coefficient (comma-separated)"
                            fullWidth
                            margin="normal"
                            value={surface.dragCoefficient.join(', ')}
                            onChange={(e) => handleChange(index, 'dragCoefficient', e.target.value)}
                            helperText="Enter comma-separated list of numbers"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={surface.takeWavesOrbitalVelocityIntoAccount}
                                    onChange={(e) => handleChange(index, 'takeWavesOrbitalVelocityIntoAccount', e.target.checked)}
                                />
                            }
                            label="Take Waves Orbital Velocity Into Account"
                            sx={{ mt: 2 }}
                        />
                    </AccordionDetails>
                </Accordion>
            ))}

            <Button variant="contained" onClick={handleAdd}>
                Add Controlled Surface
            </Button>
        </>
    );
};