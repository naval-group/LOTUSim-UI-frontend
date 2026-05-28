import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Map as EarthMap, MapHandle } from '../map/Map';
import Header from '../common/Header';
import { Agent, VesselPosition } from '../../types';
import { AddVesselMenu } from '../map/addVessel';
import { useScenarioEditor } from './useScenarioEditor';
import { ScenarioEditorSidebar } from './ScenarioEditorSidebar';

export const ScenarioEditor: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isWaypointPicking, setIsWaypointPicking] = useState(false);
  const mapRef = useRef<MapHandle>(null);

  const {
    filename,
    loading,
    saving,
    error,
    setError,
    timeOfDay,
    setTimeOfDay,
    date,
    setDate,
    referencePosition,
    setReferencePosition,
    agents,
    addAgent,
    deleteAgent,
    save,
  } = useScenarioEditor(name, state ?? {});

  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event('resize')), 260);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  const vesselPositions = new Map<string, VesselPosition>(
    Array.from(agents.entries()).map(([name, agent]) => [
      name,
      {
        vesselName: name,
        geoPoint: agent.position,
        heading: agent.heading,
      },
    ])
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <Header title="Lotusim" />

      <Box
        sx={{
          bgcolor: 'primary.main',
          py: 1,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton size="small" onClick={() => navigate('/scenarios')} sx={{ color: 'white' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="subtitle1"
          color="primary.contrastText"
          fontWeight={500}
          sx={{ flexGrow: 1 }}
        >
          {filename}
        </Typography>
        <Button variant="contained" color="success" size="small" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <ScenarioEditorSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          timeOfDay={timeOfDay}
          setTimeOfDay={setTimeOfDay}
          date={date}
          setDate={setDate}
          referencePosition={referencePosition}
          setReferencePosition={setReferencePosition}
          agents={agents}
          onDeleteAgent={deleteAgent}
          onEditAgent={(agent) => setEditingAgent(agent)}
          onFocusAgent={(agent) => setFlyTo([agent.position.latitude, agent.position.longitude])}
        />

        {editingAgent && (
          <AddVesselMenu
            open={!isWaypointPicking}
            onClose={() => setEditingAgent(null)}
            onAddVessel={(agent) => {
              deleteAgent(editingAgent.name);
              addAgent(agent);
              setEditingAgent(null);
            }}
            clickedLatLng={null}
            initialAgent={editingAgent}
            onEnterWaypointPickMode={(wps, loop, onDone) =>
              mapRef.current?.enterWaypointPickMode(wps, loop, onDone)
            }
          />
        )}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <EarthMap
            ref={mapRef}
            center={[referencePosition.latitude, referencePosition.longitude]}
            VesselPosition={vesselPositions}
            addVesselFn={addAgent}
            removeVesselFn={deleteAgent}
            flyTo={flyTo}
            onWaypointPickModeChange={setIsWaypointPicking}
          />
        </Box>
      </Box>
    </Box>
  );
};
