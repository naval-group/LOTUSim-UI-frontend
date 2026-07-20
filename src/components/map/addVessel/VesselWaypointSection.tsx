/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
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
  Button,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { WaypointFollowerState } from './generateLotusParamXML';

interface VesselWaypointSectionProps {
  state: WaypointFollowerState | undefined;
  onChange: (patch: Partial<WaypointFollowerState>) => void;
  onToggle: (enabled: boolean) => void;
  onEnterPickMode?: (
    initialWaypoints: { lat: number; lng: number }[],
    loop: boolean,
    onDone: (wps: { lat: number; lng: number }[]) => void
  ) => void;
}

export const VesselWaypointSection: React.FC<VesselWaypointSectionProps> = ({
  state,
  onChange,
  onToggle,
  onEnterPickMode,
}) => (
  <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2 }}>
    <FormControlLabel
      control={
        <Checkbox checked={state?.enabled ?? false} onChange={(e) => onToggle(e.target.checked)} />
      }
      label="Waypoint Follower"
    />

    {state != null && state.enabled && (
      <Box sx={{ mt: -2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.loop}
              onChange={(e) => onChange({ loop: e.target.checked })}
            />
          }
          label="Loop"
          sx={{ mt: 2 }}
        />

        <TextField
          type="number"
          label="Linear Acceleration Limit (m/s²)"
          value={state.linearAccelLimit}
          onChange={(e) => onChange({ linearAccelLimit: parseFloat(e.target.value) || 0 })}
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          type="number"
          label="Angular Acceleration Limit (rad/s²)"
          value={state.angularAccelLimit}
          onChange={(e) => onChange({ angularAccelLimit: parseFloat(e.target.value) || 0 })}
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          type="number"
          label="Angular Velocity Limit (rad/s)"
          value={state.angularVelLimit}
          onChange={(e) => onChange({ angularVelLimit: parseFloat(e.target.value) || 0 })}
          fullWidth
          sx={{ mt: 2 }}
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Mode</InputLabel>
          <Select
            value={state.mode}
            onChange={(e: SelectChangeEvent<string>) => {
              const newMode = e.target.value;
              const patch: Partial<WaypointFollowerState> = { mode: newMode };
              if (newMode === 'waypoints' && !state.waypoints) patch.waypoints = [];
              else if (newMode === 'line' && !state.line) patch.line = { direction: 0, length: 0 };
              else if (newMode === 'circle' && !state.circle) patch.circle = { radius: 0 };
              onChange(patch);
            }}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="waypoints">Waypoints</MenuItem>
            <MenuItem value="line">Line</MenuItem>
            <MenuItem value="circle">Circle</MenuItem>
          </Select>
        </FormControl>

        {state.mode === 'waypoints' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Waypoints
            </Typography>
            {(state.waypoints ?? []).map((wp, idx) => (
              <Grid container spacing={2} key={idx} sx={{ mb: 1 }} alignItems="center">
                <Grid>
                  <TextField
                    type="number"
                    label="Latitude"
                    value={wp.lat}
                    onChange={(e) => {
                      const waypoints = [...(state.waypoints ?? [])];
                      waypoints[idx] = { ...waypoints[idx], lat: parseFloat(e.target.value) || 0 };
                      onChange({ waypoints });
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
                      const waypoints = [...(state.waypoints ?? [])];
                      waypoints[idx] = { ...waypoints[idx], lng: parseFloat(e.target.value) || 0 };
                      onChange({ waypoints });
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onChange({ waypoints: (state.waypoints ?? []).filter((_, i) => i !== idx) })}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => onChange({ waypoints: [...(state.waypoints ?? []), { lat: 0, lng: 0 }] })}
              >
                + Add Waypoint
              </Button>
              {onEnterPickMode && (
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() =>
                    onEnterPickMode(
                      state.waypoints ?? [],
                      state.loop,
                      (updatedWaypoints) => onChange({ waypoints: updatedWaypoints })
                    )
                  }
                >
                  Edit on Map
                </Button>
              )}
            </Box>
          </Box>
        )}

        {state.mode === 'line' && state.line && (
          <Box sx={{ mt: 2 }}>
            <TextField
              type="number"
              label="Direction (Radians relative to East)"
              value={state.line.direction}
              onChange={(e) =>
                onChange({ line: { ...state.line!, direction: parseFloat(e.target.value) || 0 } })
              }
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              type="number"
              label="Length (m)"
              value={state.line.length}
              onChange={(e) =>
                onChange({ line: { ...state.line!, length: parseFloat(e.target.value) || 0 } })
              }
              fullWidth
            />
          </Box>
        )}

        {state.mode === 'circle' && state.circle && (
          <Box sx={{ mt: 2 }}>
            <TextField
              type="number"
              label="Radius (m)"
              value={state.circle.radius}
              onChange={(e) =>
                onChange({ circle: { radius: parseFloat(e.target.value) || 0 } })
              }
              fullWidth
            />
          </Box>
        )}
      </Box>
    )}
  </Box>
);
