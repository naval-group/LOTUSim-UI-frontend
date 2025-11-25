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
 * *******************************   XDYN PROPELLER PANEL   ***************************
 * ************************************************************************************
 *
 * A reusable panel component that allows users to upload propellers param for a model to be generated in xdyn yaml
 *
 */

import React from 'react';
import { Pose } from '../../common/interfaces';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Typography,
    Box,
    MenuItem,
    Button,
    IconButton,
} from '@mui/material';

type Rotation = 'clockwise' | 'counterclockwise';

export interface Propeller {
    name: string;
    nameError: boolean;
    pose: Pose;
    wakeCoefficient: number;
    relativeRotativeEfficiency: number;
    thrustDeductionFactor: number;
    rotation: Rotation;
    numberOfBlades: number;
    bladeAreaRatio: number;
    diameter: number;
}

export const defaultPropeller: Propeller = {
    name: "",
    nameError: false,
    pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
    wakeCoefficient: 0.1,
    relativeRotativeEfficiency: 0.1,
    thrustDeductionFactor: 0.1,
    rotation: 'clockwise',
    numberOfBlades: 3,
    bladeAreaRatio: 0.1,
    diameter: 1.0,
};

interface PropellerPanelProps {
    propellers: Propeller[];
    setPropellers: React.Dispatch<React.SetStateAction<Propeller[]>>;
}

const rotations: Rotation[] = ['clockwise', 'counterclockwise'];

export const PropellerPanel: React.FC<PropellerPanelProps> = ({ propellers, setPropellers }) => {

    const handleChange = (index: number, field: keyof Propeller, value: string | number) => {
        const updated = [...propellers];

        const numberFields: (keyof Propeller)[] = [
            'wakeCoefficient',
            'relativeRotativeEfficiency',
            'thrustDeductionFactor',
            'numberOfBlades',
            'bladeAreaRatio',
            'diameter',
        ];

        if (numberFields.includes(field)) {
            updated[index][field] = parseFloat(value as string) || 0;
        } else {
            updated[index][field] = value as any;
        }

        if (field === 'name') {
            const name = value as string;
            const isDuplicate = updated.some(
                (prop, i) => i !== index && prop.name === name
            );
            updated[index].nameError = isDuplicate;
        }

        setPropellers(updated);
    };

    const handleAdd = () => {
        setPropellers([...propellers, { ...defaultPropeller, name: `propeller_${propellers.length}`, pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } } }]);
    };

    const handleRemove = (index: number) => {
        const updated = [...propellers];
        updated.splice(index, 1);
        setPropellers(updated);
    };

    return (
        <>
            <Typography variant="subtitle1" mt={2}>Propellers</Typography>

            {propellers.map((propeller, index) => (
                <Accordion key={index}
                    sx={{
                        mb: 2,
                        border: '1px solid #10009c',
                        boxShadow: 'none',
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography sx={{ flexGrow: 1 }}>
                                {propeller.name || `Fill in propeller name`}
                            </Typography>
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
                            label="Propeller Name"
                            fullWidth
                            margin="normal"
                            value={propeller.name}
                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                            error={!!propeller.nameError}
                            helperText={propeller.nameError ? 'Name must be unique' : ''}
                        />

                        <Box
                            sx={{
                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                borderRadius: 1,
                                p: 2,
                                mt: 2,
                            }}
                        >
                            <Typography variant="body2" color="textPrimary" mb={1} >
                                Position of propeller
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {(['x', 'y', 'z'] as const).map((axis) => (
                                    <TextField
                                        key={`position-${axis}`}
                                        label={`Pos ${axis.toUpperCase()}`}
                                        type="number"
                                        value={propeller.pose.position[axis]}
                                        onChange={(e) => {
                                            const updated = [...propellers];
                                            const value = parseFloat(e.target.value) || 0;
                                            updated[index] = {
                                                ...updated[index],
                                            };
                                            updated[index].pose.position[axis] = value;
                                            setPropellers(updated);
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
                                        value={propeller.pose.orientation[axis]}
                                        onChange={(e) => {
                                            const updated = [...propellers];
                                            const value = parseFloat(e.target.value) || 0;
                                            updated[index] = {
                                                ...updated[index],
                                            };
                                            updated[index].pose.orientation[axis] = value;
                                            setPropellers(updated);
                                        }}
                                        margin="dense"
                                        sx={{ width: 100 }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <TextField
                            label="Wake Coefficient"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={propeller.wakeCoefficient}
                            onChange={(e) => handleChange(index, 'wakeCoefficient', e.target.value)}
                        />

                        <TextField
                            label="Relative Rotative Efficiency"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={propeller.relativeRotativeEfficiency}
                            onChange={(e) => handleChange(index, 'relativeRotativeEfficiency', e.target.value)}
                        />

                        <TextField
                            label="Thrust Deduction Factor"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={propeller.thrustDeductionFactor}
                            onChange={(e) => handleChange(index, 'thrustDeductionFactor', e.target.value)}
                        />

                        <TextField
                            label="Rotation"
                            select
                            fullWidth
                            margin="normal"
                            value={propeller.rotation}
                            onChange={(e) => handleChange(index, 'rotation', e.target.value)}
                        >
                            {rotations.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Number of Blades"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={propeller.numberOfBlades}
                            onChange={(e) => handleChange(index, 'numberOfBlades', e.target.value)}
                        />

                        <TextField
                            label="Blade Area Ratio"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={propeller.bladeAreaRatio}
                            onChange={(e) => handleChange(index, 'bladeAreaRatio', e.target.value)}
                        />

                        <TextField
                            label="Diameter"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={propeller.diameter}
                            onChange={(e) => handleChange(index, 'diameter', e.target.value)}
                        />
                    </AccordionDetails>
                </Accordion>
            ))}


            <Button variant="contained" onClick={handleAdd}>
                Add Propeller
            </Button>
        </>
    );
};

