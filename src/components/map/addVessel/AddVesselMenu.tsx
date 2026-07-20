/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Box,
  Typography,
  FormGroup,
  SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Agent,
  DomainType,
  GeoPoint,
  VesselPosition,
  PhysicsInterface,
  RenderInterface,
  WaypointFollowerInterface,
} from '../../../types';
import { listModels } from '../../../services/api';
import { PhysicsMode, PhysicsModeConfig, PhysicsConfig, PhysicsModes } from './generateLotusParamXML';
import { VesselRenderingSection } from './VesselRenderingSection';
import { VesselPhysicsSection } from './VesselPhysicsSection';
import { VesselWaypointSection } from './VesselWaypointSection';

type AgentDraft = {
  name: string;
  model: string;
  position: GeoPoint;
  heading: number;
  physicsInterface?: PhysicsInterface;
  renderInterface?: RenderInterface;
  waypointInterface?: WaypointFollowerInterface;
};

const InputField = ({
  label,
  value,
  onChange,
  error,
  helperText,
}: {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
}) => (
  <TextField
    label={label}
    variant="outlined"
    value={value}
    onChange={onChange}
    fullWidth
    sx={{ mb: 2 }}
    error={error}
    helperText={helperText}
  />
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (e: SelectChangeEvent<string>) => void;
  options: string[];
  error?: boolean;
  helperText?: string;
}) => (
  <FormControl fullWidth sx={{ mb: 2 }} error={error}>
    <InputLabel>{label}</InputLabel>
    <Select value={value} onChange={onChange}>
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
    {helperText && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);

const PositionFields = ({
  position,
  onChange,
}: {
  position: VesselPosition;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, field: keyof GeoPoint | 'heading') => void;
}) => (
  <Grid container spacing={2}>
    {(['latitude', 'longitude', 'altitude'] as Array<keyof GeoPoint>).map((field) => (
      <Grid key={field} size={{ xs: 12, md: 6 }}>
        <InputField
          label={field.charAt(0).toUpperCase() + field.slice(1)}
          value={position.geoPoint?.[field] ?? 0}
          onChange={(e) => onChange(e, field)}
        />
      </Grid>
    ))}
    <Grid size={{ xs: 12, md: 6 }}>
      <InputField
        label="Heading"
        value={position.heading ?? 0}
        onChange={(e) => onChange(e, 'heading')}
      />
    </Grid>
  </Grid>
);

interface AddVesselMenuProps {
  open: boolean;
  onClose: () => void;
  onAddVessel: (agent: Agent) => void;
  clickedLatLng: { lat: number; lng: number } | null;
  initialHeading?: number;
  initialAgent?: Agent;
  onEnterWaypointPickMode?: (
    initialWaypoints: { lat: number; lng: number }[],
    loop: boolean,
    onDone: (wps: { lat: number; lng: number }[]) => void
  ) => void;
}

export const AddVesselMenu: React.FC<AddVesselMenuProps> = ({
  open,
  onClose,
  onAddVessel,
  clickedLatLng,
  initialHeading = 0,
  initialAgent,
  onEnterWaypointPickMode,
}) => {
  const [formErrors, setFormErrors] = useState<{ model?: string; vesselName?: string }>({});
  const [modelList, setModelList] = useState<string[]>([]);
  const [draft, setDraft] = useState<AgentDraft>(() => ({
    name: initialAgent?.name ?? '',
    model: initialAgent?.model ?? '',
    position: initialAgent?.position ?? {
      latitude: clickedLatLng?.lat ?? 0,
      longitude: clickedLatLng?.lng ?? 0,
      altitude: 0,
    },
    heading: initialAgent?.heading ?? initialHeading,
    physicsInterface: initialAgent?.physicsInterface,
    renderInterface: initialAgent?.renderInterface,
    waypointInterface: initialAgent?.waypointInterface ,
  }));

  useEffect(() => {
    listModels()
      .then(setModelList)
      .catch((err) => console.error('Error fetching models:', err));
  }, []);

  // Derived values for child components — computed from draft, not stored as state
  const vesselPosition: VesselPosition = {
    vesselName: draft.name,
    geoPoint: draft.position,
    heading: draft.heading,
  };

  const physicsModes: PhysicsModes = {
    aerial: draft.physicsInterface?.domains.some((d) => d.domain === DomainType.Aerial) ?? false,
    surface: draft.physicsInterface?.domains.some((d) => d.domain === DomainType.Surface) ?? false,
    underwater: draft.physicsInterface?.domains.some((d) => d.domain === DomainType.Underwater) ?? false,
  };

  const physicsConfig: PhysicsConfig = {
    aerial: { interfaceType: '', uri: '', thrusters: [] },
    surface: { interfaceType: '', uri: '', thrusters: [] },
    underwater: { interfaceType: '', uri: '', thrusters: [] },
  };
  for (const dc of draft.physicsInterface?.domains ?? []) {
    const key = dc.domain.toLowerCase() as PhysicsMode;
    physicsConfig[key] = {
      interfaceType: dc.interfaceType,
      uri: dc.interfaceParams.uri,
      thrusters: dc.interfaceParams.thrusters,
    };
  }

  const initState = (() => {
    const d = draft.physicsInterface?.initDomain;
    return d ? d.charAt(0) + d.slice(1).toLowerCase() : '';
  })();

  const initStateOptions = (Object.entries(physicsModes) as [PhysicsMode, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([mode]) => mode.charAt(0).toUpperCase() + mode.slice(1));

  const toDomainType = (mode: PhysicsMode) =>
    DomainType[mode.charAt(0).toUpperCase() + mode.slice(1) as keyof typeof DomainType];

  const handlePositionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof GeoPoint | 'heading'
  ) => {
    const input = e.target.value;
    const partial = input === '' || input === '-' || input === '.' || input === '-.';
    const num = parseFloat(input);
    if (field === 'heading') {
      if (partial) setDraft((prev) => ({ ...prev, heading: input as unknown as number }));
      else if (!isNaN(num)) setDraft((prev) => ({ ...prev, heading: num }));
    } else {
      if (partial)
        setDraft((prev) => ({ ...prev, position: { ...prev.position, [field]: input } }));
      else if (!isNaN(num))
        setDraft((prev) => ({ ...prev, position: { ...prev.position, [field]: num } }));
    }
  };

  const handlePhysicsToggle = (checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      physicsInterface: checked
        ? prev.physicsInterface ?? { initDomain: DomainType.Surface, domains: [] }
        : undefined,
      ...(checked && { waypointInterface: undefined }),
    }));
  };

  const handleWaypointToggle = (enabled: boolean) => {
    setDraft((prev) => ({
      ...prev,
      waypointInterface: enabled
        ? prev.waypointInterface ?? {
            enabled: true,
            loop: true,
            linearAccelLimit: 0,
            angularAccelLimit: 0,
            angularVelLimit: 0,
            mode: '',
          }
        : undefined,
      ...(enabled && { physicsInterface: undefined }),
    }));
  };

  const handleModeChange = (mode: PhysicsMode, enabled: boolean) => {
    setDraft((prev) => {
      const domainType = toDomainType(mode);
      const existing = prev.physicsInterface?.domains ?? [];
      const domains = enabled
        ? existing.some((d) => d.domain === domainType)
          ? existing
          : [...existing, { domain: domainType, interfaceType: '', interfaceParams: { uri: '', thrusters: [] } }]
        : existing.filter((d) => d.domain !== domainType);
      const currentInit = prev.physicsInterface?.initDomain;
      const initDomain =
        !enabled && currentInit === domainType
          ? domains[0]?.domain ?? DomainType.Surface
          : currentInit ?? domainType;
      return { ...prev, physicsInterface: { initDomain, domains } };
    });
  };

  const handlePhysicsConfigChange = (
    mode: PhysicsMode,
    field: keyof PhysicsModeConfig,
    value: string | { name: string }[]
  ) => {
    setDraft((prev) => {
      const domainType = toDomainType(mode);
      const domains = [...(prev.physicsInterface?.domains ?? [])];
      const idx = domains.findIndex((d) => d.domain === domainType);
      if (idx < 0) return prev;
      const existing = domains[idx];
      domains[idx] =
        field === 'interfaceType'
          ? { ...existing, interfaceType: value as string }
          : { ...existing, interfaceParams: { ...existing.interfaceParams, [field]: value } };
      return { ...prev, physicsInterface: { ...prev.physicsInterface!, domains } };
    });
  };

  const handleInitStateChange = (value: string) => {
    setDraft((prev) => {
      if (!prev.physicsInterface) return prev;
      const initDomain = value
        ? DomainType[value as keyof typeof DomainType]
        : prev.physicsInterface.initDomain;
      return { ...prev, physicsInterface: { ...prev.physicsInterface, initDomain } };
    });
  };

  const handleAddVessel = () => {
    const errors: { model?: string; vesselName?: string } = {};
    if (!draft.model) errors.model = 'Model is required';
    if (!draft.name.trim()) errors.vesselName = 'Vessel name is required';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    onAddVessel(new Agent(draft));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth keepMounted>
      <DialogContent sx={{ overflowX: 'hidden', overflowY: 'auto' }}>
        <Typography variant="h6" fontWeight="bold" mb={1}>
          Vessel Info
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SelectField
              label="Model"
              value={draft.model}
              onChange={(e) => {
                setDraft((prev) => ({ ...prev, model: e.target.value }));
                if (e.target.value) setFormErrors((prev) => ({ ...prev, model: undefined }));
              }}
              options={modelList}
              error={!!formErrors.model}
              helperText={formErrors.model}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputField
              label="Vessel Name"
              value={draft.name}
              onChange={(e) => {
                setDraft((prev) => ({ ...prev, name: e.target.value }));
                if (e.target.value.trim())
                  setFormErrors((prev) => ({ ...prev, vesselName: undefined }));
              }}
              error={!!formErrors.vesselName}
              helperText={formErrors.vesselName}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" fontWeight="bold" mt={2} mb={1}>
          Position
        </Typography>
        <PositionFields position={vesselPosition} onChange={handlePositionChange} />

        <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>
          Lotusim Plugin Params
        </Typography>
        <FormGroup>
          <VesselRenderingSection
            enabled={!!draft.renderInterface?.enabled}
            onToggle={(checked) =>
              setDraft((prev) => ({
                ...prev,
                renderInterface: checked
                  ? { enabled: true, rendererType: prev.renderInterface?.rendererType ?? '', publishRender: prev.renderInterface?.publishRender ?? false }
                  : prev.renderInterface ? { ...prev.renderInterface, enabled: false } : undefined,
              }))
            }
            rendererType={draft.renderInterface?.rendererType ?? ''}
            onRendererTypeChange={(v) =>
              setDraft((prev) => ({ ...prev, renderInterface: { ...prev.renderInterface!, rendererType: v } }))
            }
            publishRender={draft.renderInterface?.publishRender ?? false}
            onPublishRenderChange={(v) =>
              setDraft((prev) => ({ ...prev, renderInterface: { ...prev.renderInterface!, publishRender: v } }))
            }
          />
          <VesselPhysicsSection
            enabled={!!draft.physicsInterface}
            onToggle={handlePhysicsToggle}
            modes={physicsModes}
            onModeChange={handleModeChange}
            config={physicsConfig}
            onConfigChange={handlePhysicsConfigChange}
            initState={initState}
            onInitStateChange={handleInitStateChange}
            initStateOptions={initStateOptions}
          />
          <VesselWaypointSection
            state={draft.waypointInterface}
            onChange={(patch) =>
              setDraft((prev) => ({ ...prev, waypointInterface: { ...prev.waypointInterface!, ...patch } }))
            }
            onToggle={handleWaypointToggle}
            onEnterPickMode={onEnterWaypointPickMode}
          />
        </FormGroup>

        <Box display="flex" gap={2} mt={4}>
          <Button variant="contained" color="primary" onClick={handleAddVessel} sx={{ flex: 1 }}>
            {initialAgent ? 'Save Changes' : 'Add Vessel'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose} sx={{ flex: 1 }}>
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
