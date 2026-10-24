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
  Collapse,
  LinearProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  selectedScenario: string;
  setSelectedScenario: (scenario: string) => void;
  vesselPositions: Map<string, VesselPosition>;
  onFlyTo: (coords: [number, number]) => void;
  onClear?: () => void;
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
 * @param selectedScenario - Currently selected scenario.
 * @param setSelectedScenario - Callback to update the selected scenario.
 */
const SideBar: React.FC<SideBarProps> = ({
  scenarios,
  instances,
  selectedInstance,
  setSelectedInstance,
  selectedScenario,
  setSelectedScenario,
  vesselPositions,
  onFlyTo,
  onClear,
}) => {
  // const [selectedScenario, setSelectedScenario] = useState<string>('');  // comes rom HomeDashboard now
  const [ip, setIp] = useState<string>(getAddress().ip);
  const [port, setPort] = useState<number>(getAddress().port);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedVessel, setExpandedVessel] = useState<string | null>(null);
  const { showError } = useToast();  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      if (!ok){
        showError('Failed to stop scenario');
      } else {
        onClear?.();
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to stop scenario');
    }
  };

  const toggleVesselExpanded = (name: string) => {
    setExpandedVessel((prev) => (prev === name ? null : name));
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

      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        <TextField
          label="IP Address"
          variant="outlined"
          value={ip}
          onChange={handleIpChange}
          sx={{ flex: 2 }}
        />
        <TextField
          label="Port"
          variant="outlined"
          value={port}
          onChange={handlePortChange}
          sx={{ flex: 1 }}
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveAddress}
        sx={{ width: '100%' }}
      >
        Save Address
      </Button>

      <Box sx={{ height: 2 }} />

      <FormControl fullWidth>
        <InputLabel id="scenario-select-label">Launch Scenario</InputLabel>
        <Select
          labelId="scenario-select-label"
          id="scenario-select"
          value={selectedScenario}
          onChange={handleScenarioChange}
          label="Launch Scenario"
        >
          {scenarios?.length ? (
            scenarios.map((scenario, index) => (
              <MenuItem key={index} value={scenario}>
                {scenario}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <em>No scenario available</em>
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLaunchSelectedScenario}
          sx={{ flex: 1 }}
        >
          Launch
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClearSimulation}
          sx={{ flex: 1 }}
        >
          Clear
        </Button>
      </Box>

      <Box sx={{ height: 2 }} />

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
          gap: 0.5,
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
            const isExpanded = expandedVessel === name;

            const sensors = vessel.sensors ?? [];
            const powerProviders = (vessel.power?.providers ?? []).map((p) => ({
              name: p.name,
              type: p.type,
              soc: p.soc * 100, // convert 0–1 fraction to a 0–100 percentage for display
            }));

            return (
              <Box key={name} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    py: 0.5,
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                  }}
                  onClick={() => toggleVesselExpanded(name)}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {name}
                  </Typography>
                  {isExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </Box>

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

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      mt: 1,
                      mb: 1,
                      pl: 1.5,
                      borderLeft: '2px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                        Sensors
                      </Typography>
                      {sensors.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          No sensors onboard
                        </Typography>
                      ) : (
                        sensors.map((s) => (
                          <Typography key={s.name} variant="caption" sx={{ display: 'block' }}>
                            {s.name} ({s.type})
                          </Typography>
                        ))
                      )}
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                        Power
                      </Typography>
                      {powerProviders.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          No power data available
                        </Typography>
                      ) : (
                        powerProviders.map((p) => (
                          <Box key={p.name} sx={{ mb: 0.5 }}>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {p.name} ({p.type}) — {p.soc.toFixed(0)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={p.soc}
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>
                </Collapse>
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
        width: { sm: '240px', md: '280px', lg: '320px' },
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
