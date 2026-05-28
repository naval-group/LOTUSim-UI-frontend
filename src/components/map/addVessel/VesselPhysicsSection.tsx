import React from 'react';
import {
  Box,
  FormControlLabel,
  Checkbox,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Thruster } from '../../../types';
import { PhysicsMode, PhysicsModeConfig, PhysicsConfig, PhysicsModes } from './generateLotusParamXML';

const interfaceTypes = ['XDynWebsocket', 'ROS2Interface'];
const physicsModeKeys: PhysicsMode[] = ['aerial', 'surface', 'underwater'];

interface VesselPhysicsSectionProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  modes: PhysicsModes;
  onModeChange: (mode: PhysicsMode, enabled: boolean) => void;
  config: PhysicsConfig;
  onConfigChange: (mode: PhysicsMode, field: keyof PhysicsModeConfig, value: string | Thruster[]) => void;
  initState: string;
  onInitStateChange: (v: string) => void;
  initStateOptions: string[];
}

export const VesselPhysicsSection: React.FC<VesselPhysicsSectionProps> = ({
  enabled,
  onToggle,
  modes,
  onModeChange,
  config,
  onConfigChange,
  initState,
  onInitStateChange,
  initStateOptions,
}) => (
  <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2 }}>
    <FormControlLabel
      control={
        <Checkbox checked={enabled} onChange={(e) => onToggle(e.target.checked)} name="physics engine" />
      }
      label="Physics Engine"
    />
    {enabled && (
      <>
        {physicsModeKeys.map((mode) => (
          <Box key={mode} sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={modes[mode]}
                  onChange={(e) => onModeChange(mode, e.target.checked)}
                />
              }
              label={`Enable ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
            />
            {modes[mode] && (
              <>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Interface Type</InputLabel>
                  <Select
                    value={config[mode].interfaceType}
                    onChange={(e: SelectChangeEvent<string>) =>
                      onConfigChange(mode, 'interfaceType', e.target.value)
                    }
                  >
                    {interfaceTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="URI"
                  placeholder="e.g. 127.0.0.1:12345"
                  value={config[mode].uri}
                  onChange={(e) => onConfigChange(mode, 'uri', e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                />
                <TextField
                  label="Thruster Names (comma-separated)"
                  value={config[mode].thrusters.map((t) => t.name).join(', ')}
                  onChange={(e) =>
                    onConfigChange(
                      mode,
                      'thrusters',
                      e.target.value.split(',').map((t) => ({ name: t.trim() }))
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
            onChange={(e: SelectChangeEvent<string>) => onInitStateChange(e.target.value)}
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
);
