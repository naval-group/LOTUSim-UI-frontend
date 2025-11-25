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
 * A reusable panel component that allows users to upload propellers and rudder param for 
 * a model to be generated in xdyn yaml
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
    Box,
    Button,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';

type Rotation = 'clockwise' | 'counterclockwise';

export interface PropellerWithRudder {
    name: string;

    // Propeller properties
    propellerPose: Pose;
    wakeCoefficient: number;                    // w
    relativeRotativeEfficiency: number;         // etaR
    thrustDeductionFactor: number;              // t
    rotation: Rotation;
    numberOfBlades: number;
    bladeAreaRatio: number;                     // AE/A0
    diameter: number;

    // Rudder properties
    rudderArea: number;
    rudderHeight: number;
    effectiveAspectRatioFactor: number;
    liftTuningCoefficient: number;
    dragTuningCoefficient: number;
    rudderPose: Pose;                   // in body frame
}

export const defaultPropellerWithRudder: PropellerWithRudder = {
    name: '',

    // Propeller properties
    propellerPose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
    wakeCoefficient: 0.1,
    relativeRotativeEfficiency: 0.1,
    thrustDeductionFactor: 0.1,
    rotation: 'clockwise',
    numberOfBlades: 3,
    bladeAreaRatio: 0.1,
    diameter: 10.0,

    // Rudder properties
    rudderArea: 10.0,
    rudderHeight: 1.0,
    effectiveAspectRatioFactor: 0.1,
    liftTuningCoefficient: 0.1,
    dragTuningCoefficient: 0.1,
    rudderPose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
};

interface PropellerWithRuddersPanelProps {
    propellerWithRudders: PropellerWithRudder[];
    setPropellerWithRudders: React.Dispatch<React.SetStateAction<PropellerWithRudder[]>>;
}

const rotations: Rotation[] = ['clockwise', 'counterclockwise'];

export const PropellerWithRudderPanel: React.FC<PropellerWithRuddersPanelProps> = ({
    propellerWithRudders,
    setPropellerWithRudders,
}) => {
    const numberFields: (keyof PropellerWithRudder)[] = [
        'wakeCoefficient',
        'relativeRotativeEfficiency',
        'thrustDeductionFactor',
        'numberOfBlades',
        'bladeAreaRatio',
        'diameter',
        'rudderArea',
        'rudderHeight',
        'effectiveAspectRatioFactor',
        'liftTuningCoefficient',
        'dragTuningCoefficient',
    ];

    const handleChange = (
        index: number,
        field: keyof PropellerWithRudder,
        value: string | number
    ) => {
        const updated = [...propellerWithRudders];
        if (numberFields.includes(field)) {
            updated[index][field] = parseFloat(value as string) || 0;
        } else {
            updated[index][field] = value as any;
        }
        setPropellerWithRudders(updated);
    };

    const handleAdd = () => {
        setPropellerWithRudders([
            ...propellerWithRudders,
            {
                ...defaultPropellerWithRudder, name: `propeller_with_rudder_${propellerWithRudders.length}`,
                propellerPose: structuredClone(defaultPropellerWithRudder.propellerPose),
                rudderPose: structuredClone(defaultPropellerWithRudder.rudderPose)
            },
        ]);
    };

    const handleRemove = (index: number) => {
        const updated = [...propellerWithRudders];
        updated.splice(index, 1);
        setPropellerWithRudders(updated);
    };

    return (
        <>
            <Typography variant="subtitle1" mt={2}>
                Propeller with Rudder
            </Typography>

            {propellerWithRudders.map((item, index) => (
                <Accordion key={item.name || index}
                    sx={{
                        mb: 2,
                        border: '1px solid #10009c',
                        boxShadow: 'none',
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}
                        >
                            <Typography sx={{ flexGrow: 1 }}>
                                {item.name || `Fill in actuator name`}
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
                            label="Name"
                            fullWidth
                            margin="normal"
                            value={item.name}
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
                                Position of Propeller
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {(['x', 'y', 'z'] as const).map((axis) => (
                                    <TextField
                                        key={`position-${axis}`}
                                        label={`Pos ${axis.toUpperCase()}`}
                                        type="number"
                                        value={item.propellerPose.position[axis]}
                                        onChange={(e) => {
                                            const updated = propellerWithRudders.map((it, i) => {
                                                if (i !== index) return it;
                                                return {
                                                    ...it,
                                                    propellerPose: {
                                                        position: { ...it.propellerPose.position, [axis]: parseFloat(e.target.value) || 0 },
                                                        orientation: { ...it.propellerPose.orientation }
                                                    }
                                                };
                                            });
                                            setPropellerWithRudders(updated);
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
                                        value={item.propellerPose.orientation[axis]}
                                        onChange={(e) => {
                                            const updated = [...propellerWithRudders];
                                            updated[index].propellerPose.orientation[axis] = parseFloat(e.target.value) || 0;
                                            setPropellerWithRudders(updated);
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
                            value={item.wakeCoefficient}
                            onChange={(e) => handleChange(index, 'wakeCoefficient', e.target.value)}
                        />
                        <TextField
                            label="Relative Rotative Efficiency"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={item.relativeRotativeEfficiency}
                            onChange={(e) => handleChange(index, 'relativeRotativeEfficiency', e.target.value)}
                        />
                        <TextField
                            label="Thrust Deduction Factor"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={item.thrustDeductionFactor}
                            onChange={(e) => handleChange(index, 'thrustDeductionFactor', e.target.value)}
                        />
                        <TextField
                            label="Rotation"
                            select
                            fullWidth
                            margin="normal"
                            value={item.rotation}
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
                            value={item.numberOfBlades}
                            onChange={(e) => handleChange(index, 'numberOfBlades', e.target.value)}
                        />
                        <TextField
                            label="Blade Area Ratio"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={item.bladeAreaRatio}
                            onChange={(e) => handleChange(index, 'bladeAreaRatio', e.target.value)}
                        />
                        <TextField
                            label="Diameter"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={item.diameter}
                            onChange={(e) => handleChange(index, 'diameter', e.target.value)}
                        />

                        {/* Rudder Section */}
                        <Typography variant="subtitle2" mt={2} mb={1}>
                            Rudder
                        </Typography>
                        <Box
                            sx={{
                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                borderRadius: 1,
                                p: 2,
                                mt: 2,
                            }}
                        >
                            <Typography variant="body2" color="textPrimary" mb={1}>
                                Position of Rudder
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {(['x', 'y', 'z'] as const).map((axis) => (
                                    <TextField
                                        key={`position-${axis}`}
                                        label={`Pos ${axis.toUpperCase()}`}
                                        type="number"
                                        value={item.rudderPose.position[axis]}
                                        onChange={(e) => {
                                            const updated = [...propellerWithRudders];
                                            updated[index].rudderPose.position[axis] = parseFloat(e.target.value) || 0;
                                            setPropellerWithRudders(updated);
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
                                        value={item.rudderPose.orientation[axis]}
                                        onChange={(e) => {
                                            const updated = [...propellerWithRudders];
                                            updated[index].rudderPose.orientation[axis] = parseFloat(e.target.value) || 0;
                                            setPropellerWithRudders(updated);
                                        }}
                                        margin="dense"
                                        sx={{ width: 100 }}
                                    />
                                ))}
                            </Box>
                        </Box>
                        <TextField
                            label="Rudder Area"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={item.rudderArea}
                            onChange={(e) => handleChange(index, 'rudderArea', e.target.value)}
                        />
                        <TextField
                            label="Rudder Height"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={item.rudderHeight}
                            onChange={(e) => handleChange(index, 'rudderHeight', e.target.value)}
                        />
                        <TextField
                            label="Effective Aspect Ratio Factor"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={item.effectiveAspectRatioFactor}
                            onChange={(e) => handleChange(index, 'effectiveAspectRatioFactor', e.target.value)}
                        />
                        <TextField
                            label="Lift Tuning Coefficient"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={item.liftTuningCoefficient}
                            onChange={(e) => handleChange(index, 'liftTuningCoefficient', e.target.value)}
                        />
                        <TextField
                            label="Drag Tuning Coefficient"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={item.dragTuningCoefficient}
                            onChange={(e) => handleChange(index, 'dragTuningCoefficient', e.target.value)}
                        />

                        <Button variant="contained" color="error" onClick={() => handleRemove(index)} sx={{ mt: 2 }}>
                            Remove
                        </Button>
                    </AccordionDetails>
                </Accordion>
            ))}

            <Button variant="contained" onClick={handleAdd}>
                Add Propeller with Rudder
            </Button>
        </>
    );
};
