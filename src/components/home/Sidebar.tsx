/**
 * ************************************************************************************
 * *******************************   SIDEBAR COMPONENT   ******************************
 * ************************************************************************************
 *
 * This module provides the `SideBar` component for the Lotusim dashboard.
 *
 * Features:
 * - Select and save the active instance (with IP and port).
 * - Choose and launch scenarios. (not implemented yet)
 * - Clear the simulation state. (not implemented yet)
 * - Placeholder for environment settings (not implemented yet).
 *
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  saveAddress,
  getAddress,
  saveInstance,
  startScenario,
  stopScenario,
} from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { VesselPosition } from '../../types';

interface SideBarProps {
  scenarios: string[];
  instances: string[];
  selectedInstance: string;
  setSelectedInstance: (instance: string) => void;
  vesselPositions: Map<string, VesselPosition>;
  onFlyTo: (coords: [number, number]) => void;
}

/**
 * SideBar Component
 *
 * Provides controls for selecting instances, managing IP/port, and launching scenarios.
 * On mobile (<600px) it renders as a slide-in Drawer toggled by a menu button.
 * On tablet/laptop it renders as a fixed left panel with breakpoint-responsive width.
 *
 * @param scenarios - Array of available scenario names.
 * @param instances - Array of available instance names.
 * @param selectedInstance - Currently selected instance.
 * @param setSelectedInstance - Callback to update the selected instance.
 *
 */
const SideBar: React.FC<SideBarProps> = ({
  scenarios,
  instances,
  selectedInstance,
  setSelectedInstance,
  vesselPositions,
  onFlyTo,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [ip, setIp] = useState<string>(getAddress().ip);
  const [port, setPort] = useState<number>(getAddress().port);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showError } = useToast();  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px

  /**
   * Handles changing the selected lotusim instance.
   */
  const handleInstanceChange = (event: SelectChangeEvent<string>) => {
    setSelectedInstance(event.target.value as string);
    saveInstance(event.target.value as string);
  };

  /**
   * Handles changing the selected scenario.
   */
  const handleScenarioChange = (event: SelectChangeEvent<string>) => {
    setSelectedScenario(event.target.value as string);
  };

  /**
   * Updates the IP address state when the input changes.
   */
  const handleIpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIp(event.target.value);
  };

  /**
   * Updates the Port state when the input changes.
   */
  const handlePortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPort(Number(event.target.value));
  };

  /**
   * Saves the IP and Port to local storage to pull from the backend APIs.
   */
  const handleSaveAddress = () => {
    saveAddress(ip, port);
  };

  /**
   * Placeholder function to select scenario.
   */
  const handleLaunchSelectedScenario = async () => {
    if (!selectedInstance || !selectedScenario) return;
    try {
      const ok = await startScenario(selectedInstance, selectedScenario);
      if (!ok) showError('Failed to launch scenario');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to launch scenario');
    }
  };

  const handleClearSimulation = async () => {
    if (!selectedInstance) return;
    try {
      const ok = await stopScenario(selectedInstance);
      if (!ok) showError('Failed to stop scenario');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to stop scenario');
    }
  };

  const panelContent = (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <FormControl fullWidth>
        <InputLabel id="instance-select-label">Instance Selected</InputLabel>
        <Select
          labelId="instance-select-label"
          id="instance-select"
          value={selectedInstance}
          onChange={handleInstanceChange}
          label="Instance Selected"
        >
          {instances?.length ? (
            instances.map((instance, index) => (
              <MenuItem key={index} value={instance}>
                {instance}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <em>No instances available</em>
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <TextField
        label="IP Address"
        variant="outlined"
        fullWidth
        value={ip}
        onChange={handleIpChange}
      />

      <TextField
        label="Port"
        variant="outlined"
        fullWidth
        value={port}
        onChange={handlePortChange}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveAddress}
        sx={{ width: '100%' }}
      >
        Save Address
      </Button>

      <Box sx={{ height: 20 }} />

      <FormControl fullWidth>
        <InputLabel id="scenario-select-label">Launch Scenario</InputLabel>
        <Select
          labelId="scenario-select-label"
          id="scenario-select"
          value={selectedScenario}
          onChange={handleScenarioChange}
          label="Launch Scenario"
        >
          {scenarios?.length ?(scenarios.map((scenario, index) => (
            <MenuItem key={index} value={scenario}>
              {scenario}
            </MenuItem>
          ))) : (
            <MenuItem disabled>
              <em>No scenario available</em>
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        onClick={handleLaunchSelectedScenario}
        sx={{ width: '100%' }}
      >
        Launch Scenario
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleClearSimulation}
        sx={{ width: '100%' }}
      >
        Clear Simulation
      </Button>

      <Box sx={{ height: 20 }} />

      <Divider sx={{ width: '100%' }} />

      <Typography variant="subtitle2" sx={{ alignSelf: 'flex-start', fontWeight: 'bold', mt: 1 }}>
        Vessels
      </Typography>

      <Box
        sx={{
          width: '100%',
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {vesselPositions.size === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No vessels active
          </Typography>
        ) : (
          Array.from(vesselPositions.entries()).map(([name, vessel]) => {
            const lat = vessel.geoPoint?.latitude;
            const lng = vessel.geoPoint?.longitude;
            const hasCoords = lat !== undefined && lng !== undefined;
            return (
              <Box key={name} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {name}
                </Typography>
                {hasCoords ? (
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => onFlyTo([lat!, lng!])}
                  >
                    {lat!.toFixed(5)}, {lng!.toFixed(5)}
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Position unavailable
                  </Typography>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: 'fixed',
            top: 70,
            left: 10,
            zIndex: 1200,
            backgroundColor: 'rgba(255,255,255,0.85)',
            boxShadow: 2,
            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          slotProps={{
            paper: {
              sx: {
                width: 260,
                backgroundColor: '#f4f4f4',
                marginTop: '64px',
                height: 'calc(100% - 64px)',
              },
            },
          }}
        >
          {panelContent}
        </Drawer>
      </>
    );
  }

  return (
    <Box
      component={Paper}
      elevation={3}
      sx={{
        width: { sm: '180px', md: '210px', lg: '240px' },
        flexShrink: 0,
        backgroundColor: '#f4f4f4',
        overflow: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {panelContent}
    </Box>
  );
};

export default SideBar;
