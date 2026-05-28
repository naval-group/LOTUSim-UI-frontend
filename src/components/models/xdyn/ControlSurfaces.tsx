/**
 * ************************************************************************************
 * *******************************   XDYN CONTROLL SURFACE PANEL   ********************
 * ************************************************************************************
 *
 * A reusable panel component that allows users to upload control surfaces for a model to be generated in xdyn yaml
 *
 */

import React from 'react';
import { Pose } from '../../../types';
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

export interface ControlSurface {
  name: string;
  pose: Pose;
  referenceArea: number;
  angleOfAttack: number[];
  liftCoefficient: number[];
  dragCoefficient: number[];
  takeWavesOrbitalVelocityIntoAccount: boolean;
}

export const defaultControlSurface: ControlSurface = {
  name: '',
  pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
  referenceArea: 1,
  angleOfAttack: [1, 5],
  liftCoefficient: [0.1, 0.2],
  dragCoefficient: [0.1, 0.2],
  takeWavesOrbitalVelocityIntoAccount: false,
};

interface ControlSurfacesPanelProps {
  controlSurfaces: ControlSurface[];
  setControlSurfaces: React.Dispatch<React.SetStateAction<ControlSurface[]>>;
}

export const ControlSurfacePanel: React.FC<ControlSurfacesPanelProps> = ({
  controlSurfaces,
  setControlSurfaces,
}) => {
  const handleChange = (
    index: number,
    field: keyof ControlSurface,
    value: string | number | boolean | number[]
  ) => {
    const updated = [...controlSurfaces];

    const numberFields: (keyof ControlSurface)[] = ['referenceArea'];

    const item = updated[index] as Record<keyof ControlSurface, unknown>;
    if (numberFields.includes(field)) {
      item[field] = typeof value === 'string' ? parseFloat(value) || 0 : (value as number);
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
        item[field] = arr;
      } else {
        item[field] = value as number[];
      }
    } else if (field === 'takeWavesOrbitalVelocityIntoAccount') {
      item[field] = value as boolean;
    } else {
      item[field] = value as string;
    }

    setControlSurfaces(updated);
  };

  const handleAdd = () => {
    setControlSurfaces([
      ...controlSurfaces,
      {
        ...defaultControlSurface,
        name: `controlled_surface_${controlSurfaces.length}`,
        pose: structuredClone(defaultControlSurface.pose),
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const updated = [...controlSurfaces];
    updated.splice(index, 1);
    setControlSurfaces(updated);
  };

  return (
    <>
      <Typography variant="subtitle1" mt={2}>
        Controlled Surfaces
      </Typography>

      {controlSurfaces.map((surface, index) => (
        <Accordion
          key={index}
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
                {surface.name || `Fill in controlled surface name `}
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
                      const updated = [...controlSurfaces];
                      updated[index].pose.position[axis] = parseFloat(e.target.value) || 0;
                      setControlSurfaces(updated);
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
                      const updated = [...controlSurfaces];
                      updated[index].pose.orientation[axis] = parseFloat(e.target.value) || 0;
                      setControlSurfaces(updated);
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
                  onChange={(e) =>
                    handleChange(index, 'takeWavesOrbitalVelocityIntoAccount', e.target.checked)
                  }
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
