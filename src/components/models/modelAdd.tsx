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
 * *******************************   ADD MODEL DIALOG   ********************************
 * ************************************************************************************
 *
 * A React dialog component for creating a new simulation model in Lotusim.
 *
 * Features:
 * - Allows users to enter a model name.
 * - Upload STL and image files for the model.
 * - Configure sensors via SensorPanel.
 * - Optionally enable Xdyn physics model with:
 *    - Base parameters (XdynBasePanel)
 *    - Propellers (PropellerPanel)
 *    - Propellers with rudders (PropellerWithRudderPanel)
 *    - Control surfaces (ControllSurfacePanel)
 * - Converts form inputs into a structured JSON object suitable for simulation.
 *
 */


import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { Propeller, PropellerPanel } from './xdyn/propellers';
import { GzBasePanel } from "./gz/gzBase";
import { SensorPanel, BaseSensor } from "./gz/gzSensors";
import { XdynBasePanel, XdynBaseParams, defaultXdynBaseParams } from './xdyn/xdynBase';
import { PropellerWithRudderPanel, PropellerWithRudder } from './xdyn/propellersRudders';
import { ControllSurface, ControllSurfacePanel } from './xdyn/controllSurfaces';
import { parseMatrix } from '../common/props';


interface AddModelDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any, stlFile: File, image: File) => void;
}

/**
 * AddModelDialog
 *
 * A dialog for creating a new simulation model.
 *
 * @param open - Boolean to control dialog visibility
 * @param onClose - Callback function for closing the dialog
 * @param onSave - Callback function for saving the model
 *
 * Contains internal state for:
 * - modelName
 * - STL file
 * - Image file
 * - Sensors
 * - Xdyn configuration (propellers, rudders, control surfaces)
 *
 * Converts state to structured JSON when saving and passes it to `onSave`.
 */
export const AddModelDialog: React.FC<AddModelDialogProps> = ({ open, onClose, onSave }) => {
    // Gazebo stuff
    const [modelName, setModelName] = useState('');
    const [stlFile, setStlFile] = useState<File | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [sensors, setSensors] = useState<BaseSensor[]>([]);
    const [xdynBaseParams, setXdynBaseParams] = useState<XdynBaseParams>(() => defaultXdynBaseParams);
    const [useXdyn, setUseXdyn] = useState(false);
    const [propellers, setPropellers] = useState<Propeller[]>([]);
    const [propellerWithRudders, setPropellerWithRudders] = useState<PropellerWithRudder[]>([]);
    const [controllSurfaces, setControllSurfaces] = useState<ControllSurface[]>([]);

    const convertToModelRequest = () => {
        return {
            modelName: modelName,
            sensors: sensors,
            xdyn: useXdyn
                ? {
                    name: modelName,
                    wave: { angle: xdynBaseParams.waveAngle },
                    meshDir: xdynBaseParams.meshDir,
                    bodyFrameRelativeToMeshFrame: {
                        x: xdynBaseParams.bodyFrame.x,
                        y: xdynBaseParams.bodyFrame.y,
                        z: xdynBaseParams.bodyFrame.z,
                    },
                    hydroForcesCalcPoint: {
                        x: xdynBaseParams.hydroCalcPoint.x,
                        y: xdynBaseParams.hydroCalcPoint.y,
                        z: xdynBaseParams.hydroCalcPoint.z,
                    },
                    centerOfInertia: {
                        x: xdynBaseParams.centerOfInertia.x,
                        y: xdynBaseParams.centerOfInertia.y,
                        z: xdynBaseParams.centerOfInertia.z,
                    },
                    inertiaMatrixAtBuoyancy: parseMatrix(xdynBaseParams.inertiaMatrix),
                    addedMass: parseMatrix(xdynBaseParams.addedMass),
                    linearDamping: parseMatrix(xdynBaseParams.linearDamping),
                    quadraticDamping: parseMatrix(xdynBaseParams.quadraticDamping),
                    resistanceCurveSpeed: xdynBaseParams.resistanceSpeed,
                    resistanceCurveResistance: xdynBaseParams.resistanceResistance,
                    propellers: propellers.map((p) => ({
                        name: p.name,
                        pose: p.pose,
                        wakeCoefficient: p.wakeCoefficient,
                        relativeRotativeEfficiency: p.relativeRotativeEfficiency,
                        thrustDeductionFactor: p.thrustDeductionFactor,
                        rotation: p.rotation,
                        numberOfBlades: p.numberOfBlades,
                        bladeAreaRatio: p.bladeAreaRatio,
                        diameter: p.diameter,
                    })),
                    rudders: controllSurfaces.map((r) => ({
                        name: r.name,
                        pose: r.pose,
                        referenceArea: r.referenceArea,
                        angleOfAttack: r.angleOfAttack,
                        liftCoefficient: r.liftCoefficient,
                        dragCoefficient: r.dragCoefficient,
                        takeWavesOrbitalVelocityIntoAccount:
                            r.takeWavesOrbitalVelocityIntoAccount,
                    })),
                    propellerWithRudders: propellerWithRudders.map((pr) => ({
                        name: pr.name,
                        propellerPose: pr.propellerPose,
                        wakeCoefficient: pr.wakeCoefficient,
                        relativeRotativeEfficiency: pr.relativeRotativeEfficiency,
                        thrustDeductionFactor: pr.thrustDeductionFactor,
                        rotation: pr.rotation,
                        numberOfBlades: pr.numberOfBlades,
                        bladeAreaRatio: pr.bladeAreaRatio,
                        diameter: pr.diameter,
                        rudderArea: pr.rudderArea,
                        rudderHeight: pr.rudderHeight,
                        effectiveAspectRatioFactor: pr.effectiveAspectRatioFactor,
                        liftTuningCoefficient: pr.liftTuningCoefficient,
                        dragTuningCoefficient: pr.dragTuningCoefficient,
                        rudderPose: pr.rudderPose,
                    })),
                }
                : undefined,
        };

    }


    const handleSave = async () => {
        if (!modelName) {
            alert('Please enter model name');
            return;
        }
        if (!stlFile) {
            alert('Please select an STL file');
            return;
        }
        if (!image) {
            alert('Please select an image file');
            return;
        }

        try {
        } catch (e) {
            alert('Invalid JSON in propellers/rudders fields');
            return;
        }
        try {
            const json = convertToModelRequest();
            onSave(json, stlFile, image);
            onClose();
        } catch (e) {
            alert('Error processing data: ' + (e as Error).message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth >
            <DialogTitle>Create New Model</DialogTitle>
            <DialogContent dividers
                sx={{
                    overflowX: 'hidden', // prevents X scrolling
                    boxSizing: 'border-box', // prevents content from overflowing
                    width: '100%',
                    maxWidth: '100%',
                }}>
                <TextField
                    label="Model Name"
                    value={modelName}
                    onChange={e => setModelName(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />

                <GzBasePanel stlFile={stlFile} image={image} setSTL={setStlFile} setImage={setImage} />
                <SensorPanel sensors={sensors} setSensors={setSensors} />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useXdyn}
                            onChange={(e) => setUseXdyn(e.target.checked)}
                        />
                    }
                    label="Use xdyn"
                />
                {open && useXdyn && (
                    <>
                        <XdynBasePanel
                            xdynBaseParams={xdynBaseParams}
                            setXdynBaseParams={setXdynBaseParams}
                        />
                        <PropellerPanel
                            propellers={propellers}
                            setPropellers={setPropellers}
                        />
                        <PropellerWithRudderPanel
                            propellerWithRudders={propellerWithRudders}
                            setPropellerWithRudders={setPropellerWithRudders}
                        />
                        <ControllSurfacePanel
                            controllSurfaces={controllSurfaces}
                            setControllSurfaces={setControllSurfaces}
                        />
                    </>
                )}

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
